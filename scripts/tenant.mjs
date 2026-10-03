#!/usr/bin/env node
/**
 * tenant.mjs — 멀티테넌트 실행기 (2026-10-02, 2026-10-03 인자 방식으로 재정리)
 *
 * 사이트·모듈은 "배포(빌드)별로 고정"이다. 어떤 사이트·모듈로 빌드할지는 **실행 명령의 인자**가 정하고,
 * 환경파일은 프로파일(local | development | production)별로 하나만 둔다:
 *     .env.[프로파일]            예) .env.development
 *   · --site    = 백엔드 sy_site.site_id (예: SI260001) — 모든 API 요청에 X-Site-Id 헤더로 나간다
 *   · --module  = ec1 | ec2 | danmoo1 … (app/{pages,components,layout}/<모듈>/ + app/conts/tenant/<모듈>.ts)
 *   · --profile = local | development | production (환경파일 선택)
 *   --site 와 --module 은 **항상 함께** 준다(하나만 주면 중단). 둘 다 생략하면 ec1 · SI260001 (기본).
 *
 * 사용법 — package.json scripts 는 프로파일만 정하고, 사이트·모듈은 뒤에 붙인다:
 *   npm run dev                                                   → ec1 · SI260001 · development (기본)
 *   npm run dev -- --site SI260002 --module ec2           → ec2
 *   npm run build -- --site SI260003 --module danmoo1     → danmoo1 production
 *   npm run typecheck -- --site SI260002 --module ec2
 *   (pnpm 은 `--` 없이 `pnpm run build --site … --module …` 도 된다 — `--` 가 와도 그 뒤의 --site/--module/--profile 을 읽는다)
 *   직접: node scripts/tenant.mjs <nuxt 명령> --site <siteId> --module <모듈> --profile <프로파일> [nuxt 추가인자…]
 *   환경변수 TENANT_SITE / TENANT_MODULE / TENANT_PROFILE 로도 줄 수 있다(CI 용).
 *
 * 하는 일: ① 환경파일·모듈 폴더·모듈 설정 존재 확인 ② sy_site 대조 — 사이트가 ACTIVE 로 있고 FO 모듈(tenant_module)이 빌드 모듈과 맞는지
 *          ③ NUXT_PUBLIC_SITE_ID / NUXT_PUBLIC_TENANT_MODULE / NUXT_PUBLIC_ENV_NM 을 환경변수로 넣고 `nuxt <명령> --dotenv .env.<프로파일>` 실행
 *             (nuxt 는 이미 있는 환경변수를 dotenv 값으로 덮어쓰지 않는다 — 인자가 파일보다 우선)
 * nuxt.config.ts 는 NUXT_PUBLIC_TENANT_MODULE 로 그 모듈의 화면·컴포넌트·레이아웃·설정(제목·테마색)만 빌드에 넣는다.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROFILES = ["local", "development", "production"];
const DEFAULT_SITE = "SI260001";
const DEFAULT_MODULE = "ec1";

function die(msg) {
  console.error(`\n[tenant] ❌ ${msg}\n`);
  process.exit(1);
}

// ── 인자 파싱: 첫 인자=nuxt 명령, --site/--module/--profile 은 어디에 있어도 읽고(pnpm 이 넘기는 "--" 는 건너뜀), 나머지는 nuxt 로 그대로 전달 ──
const argv = process.argv.slice(2);
const cmd = argv.shift();
if (!cmd || cmd.startsWith("--")) die("nuxt 명령이 필요합니다. 예) node scripts/tenant.mjs dev --module ec1 --profile local");
const opt = { site: process.env.TENANT_SITE || "", module: process.env.TENANT_MODULE || "", profile: process.env.TENANT_PROFILE || "" };
const rest = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--") continue;
  const m = /^--(site|module|profile)(?:=(.*))?$/.exec(a);
  if (m) opt[m[1]] = m[2] ?? argv[++i];
  else rest.push(a);
}
if (!opt.site && !opt.module) {
  opt.site = DEFAULT_SITE;
  opt.module = DEFAULT_MODULE;
} else if (!opt.site || !opt.module) {
  die(`--site 와 --module 은 함께 줘야 합니다. (받은 값: --site "${opt.site || "없음"}" --module "${opt.module || "없음"}")
   예) --site SI260003 --module danmoo1`);
}
if (!PROFILES.includes(opt.profile)) die(`--profile 은 ${PROFILES.join(" | ")} 중 하나여야 합니다. (받은 값: "${opt.profile}")`);
if (opt.site && !/^[A-Z0-9]{6,21}$/.test(opt.site)) die(`--site 는 백엔드 sy_site.site_id(영대문자·숫자, 예: SI260001)여야 합니다. (받은 값: "${opt.site}")  예) --site SI260001`);
if (opt.module && !/^[a-z0-9]+$/i.test(opt.module)) die("--module 은 영문·숫자만 쓸 수 있습니다. 예) --module ec1");

const envFile = `.env.${opt.profile}`;
const envPath = path.join(ROOT, envFile);
if (!existsSync(envPath)) die(`환경파일이 없습니다: ${envFile}\n   (.env.[프로파일] 형식 — .env.local / .env.development / .env.production)`);

// 환경파일에 사이트·모듈 값이 남아 있으면 안내(인자가 우선이라 동작엔 영향 없지만 혼동 방지)
const kv = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()])
);
for (const k of ["NUXT_PUBLIC_SITE_ID", "NUXT_PUBLIC_TENANT_MODULE", "NUXT_PUBLIC_APP_TITLE", "NUXT_PUBLIC_THEME_COLOR"]) {
  if (kv[k] !== undefined) console.warn(`[tenant] ⚠ ${envFile} 의 ${k}=${kv[k]} 는 무시됩니다 — 사이트·모듈은 실행 인자, 제목·테마색은 app/conts/tenant/<모듈>.ts 로 정합니다.`);
}

// ── sy_site 대조: --site 가 실제 DB(sy_site.site_id)에 있고 ACTIVE 인지, 사이트의 FO 모듈(tenant_module)이 --module 과 같은지 백엔드 공개 API 로 확인하고 사이트 코드·이름을 출력한다 ──
//   · 백엔드에 닿으면: 없거나 ACTIVE 가 아니거나 모듈이 다르면 중단(잘못된 사이트·모듈로 빌드·배포되는 것을 막는다). 사이트의 FO 모듈이 미지정이면 안내만
//   · 닿지 않으면(오프라인·로컬 백엔드 미기동): 경고만 하고 진행
//   · 건너뛰기: --skip-site-check 또는 TENANT_SKIP_SITE_CHECK=1
const skipCheck = rest.includes("--skip-site-check") || process.env.TENANT_SKIP_SITE_CHECK === "1";
if (!skipCheck) {
  const api = (kv.NUXT_API_BASE_URL || "https://22300.illeesam.synology.me").replace(/\/+$/, "");
  try {
    const res = await fetch(`${api}/api/co/sy/site?pageNo=1&pageSize=500`, { signal: AbortSignal.timeout(8000) });
    const body = await res.json();
    const rows = Array.isArray(body?.data) ? body.data : body?.data?.pageList ?? [];
    const hit = rows.find((r) => r.siteId === opt.site);
    if (!hit) die(`sy_site 에 site_id "${opt.site}" 가 없습니다. (${api})
   --site 를 sy_site.site_id 실값으로 맞추거나, BO 사이트관리에서 사이트를 먼저 등록하세요.`);
    const label = `${hit.siteId}(${hit.siteCode} · ${hit.siteNm})`;
    if (hit.siteStatusCd !== "ACTIVE") die(`sy_site ${label} 의 상태가 ${hit.siteStatusCd} 입니다. ACTIVE 인 사이트만 배포할 수 있습니다.`);
    if (hit.tenantModule && hit.tenantModule !== opt.module) {
      die(`sy_site ${label} 의 FO 모듈은 "${hit.tenantModule}" 인데 "${opt.module}" 로 빌드하려고 합니다.
   BO 사이트관리에서 FO 모듈을 바꾸거나, --module ${hit.tenantModule} 로 빌드하세요.`);
    }
    console.log(`[tenant] ✔ sy_site 확인: ${label} (${hit.siteStatusCd}, FO 모듈 ${hit.tenantModule || "미지정"})`);
  } catch (e) {
    if (e?.message?.startsWith("[tenant]")) throw e;
    console.warn(`[tenant] ⚠ sy_site 확인을 건너뜁니다 — 백엔드(${api})에 닿지 않음: ${e?.message ?? e}`);
  }
}
for (const d of ["pages", "components", "layout"]) if (!existsSync(path.join(ROOT, "app", d, opt.module))) die(`모듈 폴더가 없습니다: app/${d}/${opt.module}/`);
if (!existsSync(path.join(ROOT, "app", "conts", "tenant", `${opt.module}.ts`))) die(`모듈 설정이 없습니다: app/conts/tenant/${opt.module}.ts`);

console.log(`[tenant] ▶ nuxt ${cmd}  사이트=${opt.site}  모듈=${opt.module}  프로파일=${opt.profile}  (${envFile})`);
// pnpm/npx 설치 여부와 무관하게 동작하도록 nuxt CLI 를 node 로 직접 실행한다(Windows 에서 shell 도 필요 없다)
const nuxtBin = path.join(ROOT, "node_modules", "nuxt", "bin", "nuxt.mjs");
if (!existsSync(nuxtBin)) die("node_modules 에 nuxt 가 없습니다. 먼저 의존성을 설치해 주세요 (pnpm install).");
// 사이트·모듈은 인자 → 환경변수. nuxt 의 dotenv 로딩은 이미 있는 환경변수를 덮어쓰지 않으므로 환경파일에 같은 키가 있어도 인자가 이긴다.
const env = { ...process.env, NUXT_PUBLIC_SITE_ID: opt.site, NUXT_PUBLIC_TENANT_MODULE: opt.module, NUXT_PUBLIC_ENV_NM: envFile };
const child = spawn(process.execPath, [nuxtBin, cmd, "--dotenv", envFile, ...rest.filter((a) => a !== "--skip-site-check")], { cwd: ROOT, stdio: "inherit", env });
child.on("exit", (code) => process.exit(code ?? 1));
