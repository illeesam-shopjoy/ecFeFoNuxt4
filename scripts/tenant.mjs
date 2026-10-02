#!/usr/bin/env node
/**
 * tenant.mjs — 멀티테넌트 실행기 (2026-10-02)
 *
 * 사이트·모듈은 "배포(빌드)별로 고정"이다. 환경파일 이름이 곧 테넌트 선택이다:
 *     .env.[사이트].[모듈].[프로파일]      예) .env.site1.ec1.development
 *   · 사이트  = site1, site2 …   (배포 이름표 — 파일명에만 있다. 실제 사이트 값은 환경파일 안의 NUXT_PUBLIC_SITE_ID(= sy_site.site_id) 하나)
 *   · 모듈    = ec1, ec2 …       (app/{pages,components,layout}/<모듈>/ + app/conts/tenant/<모듈>.ts — 그 사이트가 쓰는 화면 묶음)
 *   · 프로파일 = local | development | production
 *
 * 사용법
 *   node scripts/tenant.mjs <nuxt 명령> [--site site1] [--module ec1] [--profile development] [-- nuxt 추가인자…]
 *     예) node scripts/tenant.mjs dev     --site site2 --module ec2 --profile local
 *         node scripts/tenant.mjs build   --profile production            (사이트/모듈 생략 시 site1 / ec1)
 *   기본 사이트·모듈은 환경변수 TENANT_SITE / TENANT_MODULE 로도 바꿀 수 있다(CI 용).
 *
 * 하는 일: ① 환경파일 존재 확인 ② 파일 안의 NUXT_PUBLIC_TENANT_MODULE 이 파일명의 모듈과 같은지, NUXT_PUBLIC_SITE_ID 가 sy_site 에 있는 ACTIVE 사이트인지 확인(복붙 실수 방지)
 *          ③ app/{pages,components,layout}/<모듈>/ · app/conts/tenant/<모듈>.ts 존재 확인 ④ `nuxt <명령> --dotenv <환경파일>` 실행
 * nuxt.config.ts 는 로드된 NUXT_PUBLIC_TENANT_MODULE 로 그 모듈의 화면·컴포넌트·레이아웃과 설정만 빌드에 넣는다.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROFILES = ["local", "development", "production"];

function die(msg) {
  console.error(`\n[tenant] ❌ ${msg}\n`);
  process.exit(1);
}

// ── 인자 파싱: 첫 인자=nuxt 명령, --key value, "--" 뒤는 nuxt 로 그대로 전달 ──
const argv = process.argv.slice(2);
const cmd = argv.shift();
if (!cmd || cmd.startsWith("--")) die("nuxt 명령이 필요합니다. 예) node scripts/tenant.mjs dev --site site1 --module ec1 --profile local");
const opt = { site: process.env.TENANT_SITE || "site1", module: process.env.TENANT_MODULE || "ec1", profile: process.env.TENANT_PROFILE || "" };
const rest = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--") {
    rest.push(...argv.slice(i + 1));
    break;
  }
  const m = /^--(site|module|profile)(?:=(.*))?$/.exec(a);
  if (m) opt[m[1]] = m[2] ?? argv[++i];
  else rest.push(a);
}
if (!PROFILES.includes(opt.profile)) die(`--profile 은 ${PROFILES.join(" | ")} 중 하나여야 합니다. (받은 값: "${opt.profile}")`);
if (!/^[a-z0-9]+$/i.test(opt.site) || !/^[a-z0-9]+$/i.test(opt.module)) die("--site / --module 은 영문·숫자만 쓸 수 있습니다.");

const envFile = `.env.${opt.site}.${opt.module}.${opt.profile}`;
const envPath = path.join(ROOT, envFile);
if (!existsSync(envPath)) die(`환경파일이 없습니다: ${envFile}\n   (.env.[사이트].[모듈].[프로파일] 형식 — 예: .env.site1.ec1.development)`);
for (const d of ["pages", "components", "layout"]) if (!existsSync(path.join(ROOT, "app", d, opt.module))) die(`모듈 폴더가 없습니다: app/${d}/${opt.module}/`);
if (!existsSync(path.join(ROOT, "app", "conts", "tenant", `${opt.module}.ts`))) die(`모듈 설정이 없습니다: app/conts/tenant/${opt.module}.ts`);

// 파일 안의 식별값이 파일명과 같은지 확인 (다른 테넌트 파일을 복사해서 이름만 바꾼 실수 방지)
const kv = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
if (!/^\d{10,21}$/.test(kv.NUXT_PUBLIC_SITE_ID ?? "")) die(`${envFile} 의 NUXT_PUBLIC_SITE_ID 는 백엔드 sy_site.site_id(숫자)여야 합니다. (받은 값: ${kv.NUXT_PUBLIC_SITE_ID ?? "없음"})`);
if (kv.NUXT_PUBLIC_TENANT_MODULE !== opt.module) die(`${envFile} 의 NUXT_PUBLIC_TENANT_MODULE(${kv.NUXT_PUBLIC_TENANT_MODULE ?? "없음"}) 가 파일명의 모듈(${opt.module})과 다릅니다.`);

// ── sy_site 대조: NUXT_PUBLIC_SITE_ID 가 실제 DB(sy_site.site_id)에 있고 ACTIVE 인지 백엔드 공개 API 로 확인하고, 사이트 코드·이름을 출력한다(맞는 사이트에 연결됐는지 눈으로 확인) ──
//   · 백엔드에 닿으면: 없거나 ACTIVE 가 아니면 중단(잘못된 코드로 빌드·배포되는 것을 막는다)
//   · 닿지 않으면(오프라인·로컬 백엔드 미기동): 경고만 하고 진행
//   · 건너뛰기: --skip-site-check 또는 TENANT_SKIP_SITE_CHECK=1
if (!rest.includes("--skip-site-check") && process.env.TENANT_SKIP_SITE_CHECK !== "1") {
  const api = (kv.NUXT_API_BASE_URL || "https://22300.illeesam.synology.me").replace(/\/+$/, "");
  try {
    const res = await fetch(`${api}/api/co/sy/site?pageNo=1&pageSize=500`, { signal: AbortSignal.timeout(8000) });
    const body = await res.json();
    const rows = Array.isArray(body?.data) ? body.data : body?.data?.pageList ?? [];
    const hit = rows.find((r) => r.siteId === kv.NUXT_PUBLIC_SITE_ID);
    if (!hit) die(`sy_site 에 site_id "${kv.NUXT_PUBLIC_SITE_ID}" 가 없습니다. (${api})\n   ${envFile} 의 NUXT_PUBLIC_SITE_ID 를 sy_site.site_id 실값으로 맞추거나, 사이트를 먼저 등록하세요.`);
    if (hit.siteStatusCd !== "ACTIVE") die(`sy_site ${hit.siteId}(${hit.siteCode} · ${hit.siteNm}) 의 상태가 ${hit.siteStatusCd} 입니다. ACTIVE 인 사이트만 배포할 수 있습니다.`);
    console.log(`[tenant] ✔ sy_site 확인: ${hit.siteId} = ${hit.siteCode} · ${hit.siteNm} (${hit.siteStatusCd})`);
  } catch (e) {
    console.warn(`[tenant] ⚠ sy_site 확인을 건너뜁니다 — 백엔드(${api})에 닿지 않음: ${e?.message ?? e}`);
  }
}

console.log(`[tenant] ▶ nuxt ${cmd}  사이트=${opt.site}  모듈=${opt.module}  프로파일=${opt.profile}  (${envFile})`);
// pnpm/npx 설치 여부와 무관하게 동작하도록 nuxt CLI 를 node 로 직접 실행한다(Windows 에서 shell 도 필요 없다)
const nuxtBin = path.join(ROOT, "node_modules", "nuxt", "bin", "nuxt.mjs");
if (!existsSync(nuxtBin)) die("node_modules 에 nuxt 가 없습니다. 먼저 의존성을 설치해 주세요 (pnpm install).");
const child = spawn(process.execPath, [nuxtBin, cmd, "--dotenv", envFile, ...rest.filter((a) => a !== "--skip-site-check")], { cwd: ROOT, stdio: "inherit", env: process.env });
child.on("exit", (code) => process.exit(code ?? 1));
