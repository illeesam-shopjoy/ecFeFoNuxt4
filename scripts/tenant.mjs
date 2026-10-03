#!/usr/bin/env node
/**
 * tenant.mjs — 멀티테넌트 실행기 (2026-10-02, 2026-10-03 인자 방식으로 재정리)
 *
 * 사이트·모듈은 "배포(빌드)별로 고정"이다. 어떤 사이트·모듈로 빌드할지는 **실행 명령의 인자**가 정하고,
 * 환경파일은 프로파일(local | development | production)별로 하나만 둔다:
 *     .env.[프로파일]            예) .env.development
 *   · --module  = ec1 | ec2 | danmoo1 … (app/{pages,components,layout}/<모듈>/ + app/conts/tenant/<모듈>.ts)
 *   · --site    = 백엔드 sy_site.site_id (예: 2604010000000001) — 모든 API 요청에 X-Site-Id 헤더로 나간다
 *                 생략하면 sy_site 에서 그 모듈(tenant_module)을 쓰는 사이트를 찾아 쓴다(정확히 1개여야 한다)
 *   · --profile = local | development | production (환경파일 선택)
 *   둘 다 생략하면 모듈 ec1 · 사이트 2604010000000001 (기본).
 *
 * 사용법 — package.json scripts 는 프로파일만 정하고, 사이트·모듈은 `--` 뒤에 붙인다:
 *   npm run dev                                   → ec1 · 2604010000000001 · development
 *   npm run dev -- --module ec2                   → ec2 (사이트는 sy_site 에서 찾음)
 *   npm run build -- --module danmoo1             → danmoo1 production
 *   npm run build -- --site 2604010000000003 --module danmoo1   (사이트를 명시하면 그대로, sy_site 와 대조만)
 *   npm run typecheck -- --module ec2
 *   직접: node scripts/tenant.mjs <nuxt 명령> [--site <siteId>] [--module <모듈>] --profile <프로파일> [-- nuxt 추가인자…]
 *   환경변수 TENANT_SITE / TENANT_MODULE / TENANT_PROFILE 로도 줄 수 있다(CI 용).
 *
 * 하는 일: ① 환경파일·모듈 폴더·모듈 설정 존재 확인 ② sy_site 대조 — 사이트가 ACTIVE 로 있고 FO 모듈(tenant_module)이 맞는지(사이트 생략 시 모듈로 사이트 결정)
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
const DEFAULT_SITE = "2604010000000001";
const DEFAULT_MODULE = "ec1";

function die(msg) {
  console.error(`\n[tenant] ❌ ${msg}\n`);
  process.exit(1);
}

// ── 인자 파싱: 첫 인자=nuxt 명령, --key value, "--" 뒤는 nuxt 로 그대로 전달 ──
const argv = process.argv.slice(2);
const cmd = argv.shift();
if (!cmd || cmd.startsWith("--")) die("nuxt 명령이 필요합니다. 예) node scripts/tenant.mjs dev --module ec1 --profile local");
const opt = { site: process.env.TENANT_SITE || "", module: process.env.TENANT_MODULE || "", profile: process.env.TENANT_PROFILE || "" };
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
if (!opt.site && !opt.module) {
  opt.site = DEFAULT_SITE;
  opt.module = DEFAULT_MODULE;
}
if (!PROFILES.includes(opt.profile)) die(`--profile 은 ${PROFILES.join(" | ")} 중 하나여야 합니다. (받은 값: "${opt.profile}")`);
if (opt.site && !/^\d{10,21}$/.test(opt.site)) die(`--site 는 백엔드 sy_site.site_id(숫자 10~21자)여야 합니다. (받은 값: "${opt.site}")  예) --site 2604010000000001`);
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

// ── sy_site 대조: 백엔드 공개 API 로 사이트 목록을 받아
//   · --site 만 있으면: ACTIVE 인지 확인하고 모듈은 그 사이트의 tenant_module 로(없으면 ec1)
//   · --module 만 있으면: tenant_module 이 그 모듈인 ACTIVE 사이트를 찾는다(정확히 1개여야 함)
//   · 둘 다 있으면: 사이트가 ACTIVE 이고 tenant_module 이 모듈과 같은지(미지정이면 안내만)
//   · 백엔드에 닿지 않으면: 경고만 하고 진행(사이트가 없으면 기본 사이트). 건너뛰기: --skip-site-check 또는 TENANT_SKIP_SITE_CHECK=1
const skipCheck = rest.includes("--skip-site-check") || process.env.TENANT_SKIP_SITE_CHECK === "1";
if (!skipCheck) {
  const api = (kv.NUXT_API_BASE_URL || "https://22300.illeesam.synology.me").replace(/\/+$/, "");
  let rows = null;
  try {
    const res = await fetch(`${api}/api/co/sy/site?pageNo=1&pageSize=500`, { signal: AbortSignal.timeout(8000) });
    const body = await res.json();
    rows = Array.isArray(body?.data) ? body.data : body?.data?.pageList ?? [];
  } catch (e) {
    console.warn(`[tenant] ⚠ sy_site 확인을 건너뜁니다 — 백엔드(${api})에 닿지 않음: ${e?.message ?? e}`);
  }
  if (rows) {
    const label = (r) => `${r.siteId}(${r.siteCode} · ${r.siteNm})`;
    let hit;
    if (opt.site) {
      hit = rows.find((r) => r.siteId === opt.site);
      if (!hit) die(`sy_site 에 site_id "${opt.site}" 가 없습니다. (${api})\n   --site 를 sy_site.site_id 실값으로 맞추거나, BO 사이트관리에서 사이트를 먼저 등록하세요.`);
      if (!opt.module) opt.module = hit.tenantModule || DEFAULT_MODULE;
    } else {
      const cands = rows.filter((r) => r.tenantModule === opt.module && r.siteStatusCd === "ACTIVE");
      if (cands.length === 0) die(`sy_site 에 FO 모듈(tenant_module)이 "${opt.module}" 인 ACTIVE 사이트가 없습니다. (${api})\n   --site <site_id> 를 함께 주거나, BO 사이트관리에서 사이트의 FO 모듈을 "${opt.module}" 로 정하세요.`);
      if (cands.length > 1) die(`FO 모듈 "${opt.module}" 을 쓰는 사이트가 ${cands.length}개입니다: ${cands.map(label).join(", ")}\n   --site <site_id> 로 하나를 고르세요.`);
      hit = cands[0];
      opt.site = hit.siteId;
    }
    if (hit.siteStatusCd !== "ACTIVE") die(`sy_site ${label(hit)} 의 상태가 ${hit.siteStatusCd} 입니다. ACTIVE 인 사이트만 배포할 수 있습니다.`);
    // 사이트에 FO 모듈(sy_site.tenant_module)이 정해져 있으면 빌드 모듈과 같아야 한다 — 다른 모듈로 잘못 배포하는 것을 막는다(미지정이면 안내만)
    if (hit.tenantModule && hit.tenantModule !== opt.module) {
      die(`sy_site ${label(hit)} 의 FO 모듈은 "${hit.tenantModule}" 인데 "${opt.module}" 로 빌드하려고 합니다.\n   BO 사이트관리에서 FO 모듈을 바꾸거나, --module ${hit.tenantModule} 로 빌드하세요.`);
    }
    console.log(`[tenant] ✔ sy_site 확인: ${label(hit)} (${hit.siteStatusCd}, FO 모듈 ${hit.tenantModule || "미지정"})`);
  }
}
if (!opt.site) {
  console.warn(`[tenant] ⚠ 사이트를 정하지 못해 기본 사이트 ${DEFAULT_SITE} 를 씁니다(모듈 ${opt.module}).`);
  opt.site = DEFAULT_SITE;
}
if (!opt.module) opt.module = DEFAULT_MODULE;
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
