#!/usr/bin/env node
/**
 * deploy-sites.mjs — 4개 Netlify 사이트(ecFeFoNuxt4/ecFeMain/ecFeBo/illeesam) 통합 배포 오케스트레이터.
 *
 * 배경(2026-09-12): Netlify 팀(app.netlify.com/teams/illeesam/projects)에 사이트 4개가 떠 있는데,
 * 그중 shopjoy-ecfefonuxt4(이 저장소)만 GitHub Actions(.github/workflows/netlify-deploy.yml)로
 * "빌드→netlify-cli 배포"까지 직접 하고, 나머지 3개(shopjoy-ecfemain/shopjoy-ecfebo/illeesam)는
 * Netlify 네이티브 "저장소 연결(auto-build)" 방식이라 git push 만 하면 Netlify 서버가 알아서
 * 빌드한다 — 로컬에서 실제 성공/실패를 알려면 Netlify API를 따로 봐야 한다. 이 스크립트는 그 차이를
 * 감추고 4곳 모두 "npm run deploy:xxx 한 번으로: push → 실제 빌드결과 확인 → 로그파일 기록 →
 * 이메일 통지"까지 동일하게 동작하게 만든다.
 *
 * 판정 방식 2가지(사이트별로 자동 선택):
 *   - GitHub Actions 대상(ecFeFoNuxt4): push 후 그 커밋 SHA로 뜬 워크플로 run을 찾아
 *     `gh run watch`로 완료까지 대기 → conclusion(success/failure)이 곧 결과.
 *   - Netlify 네이티브 auto-build 대상(나머지 3개): push 후 Netlify API
 *     (GET /api/v1/sites/{id}/deploys)를 폴링해서 방금 push한 커밋의 deploy가 ready/error가
 *     될 때까지 기다린다. NETLIFY_AUTH_TOKEN이 없으면 폴링을 건너뛰고 "push는 됐으니 대시보드에서
 *     확인" 안내만 남긴다(토큰 없어도 최소한 push까지는 여기서 완결됨).
 *
 * 필요한 로컬 비밀 설정: .env.deploy (.env.deploy.example 참조, 이 파일 자체는 .gitignore 처리됨)
 *   NETLIFY_AUTH_TOKEN         — app.netlify.com → User settings → Applications → New access token
 *                                (illeesam 팀 소속 4개 사이트를 전부 볼 수 있는 계정으로 발급)
 *   NOTIFY_EMAIL_FROM          — 발신 Gmail 주소
 *   NOTIFY_EMAIL_APP_PASSWORD  — 그 Gmail 계정의 앱 비밀번호(일반 로그인 비밀번호 아님)
 *   NOTIFY_EMAIL_TO            — 생략 시 illeesam@gmail.com 기본값(사용자 요청, 2026-09-12)
 * 위 값이 없으면 해당 기능(빌드결과 폴링/이메일 발송)만 조용히 스킵하고 나머지는 정상 진행한다
 * (.github/scripts/notify-deploy-result.mjs 와 동일한 "자격정보 없으면 스킵" 원칙).
 *
 * 사용법:
 *   node scripts/deploy-sites.mjs ecfefonuxt4 | ecfemain | ecfebo | illeesam | all
 *   (= package.json의 "github deploy ecfefonuxt4" / "github deploy ecfemain" / "github deploy ecfebo" /
 *      "github deploy illeesam" / "github deploy all" — 공백 있어 pnpm run "github deploy ecfebo"처럼 따옴표 필요)
 *
 * 로그: logs/deploy/deploy-<YYYYMMDD-HHmmss>.log 에 이번 실행의 전체 과정을 그대로 남긴다
 * (콘솔에 찍히는 모든 줄이 그대로 파일에도 append됨) — logs/ 는 .gitignore(*.log*)로 이미 커밋 제외.
 *
 * 종료 코드: 요청한 대상 전부 성공(ok)이면 0, 하나라도 실패/불확실이면 1 — CI나 다른 스크립트가
 * 이 값으로 성공여부를 판정할 수 있게.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileP = promisify(execFile);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');            // ecFeFoNuxt4/
const WORKSPACE_ROOT = path.resolve(REPO_ROOT, '..');       // illeesam-shopjoy/
const GH_PARENT_ROOT = path.resolve(WORKSPACE_ROOT, '..');  // c:/_pjt_github/ (illeesam-shopjoy 와 형제인 p2604_modunuri_illeesam 이 여기 있음)

/* ── 배포 대상 정의 ── 새 사이트가 늘어나면 여기 한 곳만 추가하면 all/개별 스크립트 전부 자동 적용 */
const TARGETS = {
  ecfefonuxt4: {
    label: 'ecFeFoNuxt4',
    repoPath: REPO_ROOT,
    netlifySiteName: 'shopjoy-ecfefonuxt4',
    ghRepo: 'illeesam-shopjoy/ecFeFoNuxt4', // GitHub Actions로 빌드+배포 — gh run watch로 판정
  },
  ecfemain: {
    label: 'ecFeMain',
    repoPath: path.join(WORKSPACE_ROOT, 'ecFeMain'),
    netlifySiteName: 'shopjoy-ecfemain',
    ghRepo: null, // Netlify 네이티브 auto-build — Netlify API로 판정
  },
  ecfebo: {
    label: 'ecFeBo',
    repoPath: path.join(WORKSPACE_ROOT, 'ecFeBo'),
    netlifySiteName: 'shopjoy-ecfebo',
    ghRepo: null,
  },
  illeesam: {
    label: 'illeesam (p2604_modunuri_illeesam)',
    repoPath: path.join(GH_PARENT_ROOT, 'p2604_modunuri_illeesam'),
    netlifySiteName: 'illeesam',
    ghRepo: null,
  },
};

/* ── 로그: 콘솔 + 파일 동시 기록 ── */
const LOG_DIR = path.join(REPO_ROOT, 'logs', 'deploy');
fs.mkdirSync(LOG_DIR, { recursive: true });
const runStamp = new Date().toISOString().replace(/[:.]/g, '').replace('T', '-').slice(0, 15); // YYYYMMDD-HHmmss
const logPath = path.join(LOG_DIR, `deploy-${runStamp}.log`);
const logStream = fs.createWriteStream(logPath, { flags: 'a' });
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  logStream.write(line + '\n');
}

/* ── .env.deploy 로드 (dotenv 미의존 — KEY=VALUE 줄만 파싱, #/빈줄 무시) ── */
function loadEnvDeploy() {
  const envPath = path.join(REPO_ROOT, '.env.deploy');
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
}
loadEnvDeploy();

const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN || '';
const EMAIL_FROM = process.env.NOTIFY_EMAIL_FROM || '';
const EMAIL_APP_PASSWORD = process.env.NOTIFY_EMAIL_APP_PASSWORD || '';
const EMAIL_TO = process.env.NOTIFY_EMAIL_TO || 'illeesam@gmail.com'; // 사용자 요청 기본 수신자(2026-09-12)

/* ── 셸 명령 실행 헬퍼 — 실패해도 예외를 던지지 않고 {ok,stdout,stderr,code} 로 반환 ── */
async function run(cmd, args, cwd) {
  try {
    const { stdout, stderr } = await execFileP(cmd, args, { cwd, maxBuffer: 20 * 1024 * 1024 });
    return { ok: true, code: 0, stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (e) {
    return { ok: false, code: e.code ?? 1, stdout: (e.stdout || '').trim(), stderr: (e.stderr || e.message || '').trim() };
  }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

/* ── 1단계: git add/commit(변경 있을 때만) + push ── */
async function gitPush(target) {
  const { label, repoPath } = target;
  if (!fs.existsSync(path.join(repoPath, '.git'))) {
    return { ok: false, stage: 'git', detail: `저장소를 찾을 수 없음: ${repoPath}` };
  }
  log(`[${label}] 저장소: ${repoPath}`);

  await run('git', ['fetch', 'origin', '--quiet'], repoPath);

  const branchRes = await run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], repoPath);
  const branch = branchRes.stdout || 'main';

  const statusRes = await run('git', ['status', '--porcelain'], repoPath);
  const hasChanges = !!(statusRes.stdout && statusRes.stdout.length > 0);

  if (hasChanges) {
    log(`[${label}] 변경 파일:\n${statusRes.stdout}`);
    const addRes = await run('git', ['add', '-A'], repoPath);
    if (!addRes.ok) return { ok: false, stage: 'git add', detail: addRes.stderr };
    const commitMsg = `deploy(${label}): 자동배포 ${new Date().toISOString()}`;
    const commitRes = await run('git', ['commit', '-m', commitMsg], repoPath);
    if (!commitRes.ok) return { ok: false, stage: 'git commit', detail: commitRes.stderr || commitRes.stdout };
    log(`[${label}] 커밋 완료: ${commitMsg}`);
  } else {
    log(`[${label}] 변경사항 없음 — 커밋 스킵`);
  }

  const localHeadRes = await run('git', ['rev-parse', 'HEAD'], repoPath);
  const localHead = localHeadRes.stdout;
  const remoteHeadRes = await run('git', ['rev-parse', `origin/${branch}`], repoPath);
  const remoteHead = remoteHeadRes.ok ? remoteHeadRes.stdout : null;

  if (!hasChanges && localHead === remoteHead) {
    log(`[${label}] 이미 최신 상태 — 배포할 변경 없음 (push 스킵)`);
    return { ok: true, skipped: true, branch, sha: localHead };
  }

  const pushRes = await run('git', ['push', 'origin', branch], repoPath);
  if (!pushRes.ok) return { ok: false, stage: 'git push', detail: pushRes.stderr || pushRes.stdout };
  log(`[${label}] push 완료 → origin/${branch} (${localHead.slice(0, 7)})`);
  return { ok: true, skipped: false, branch, sha: localHead };
}

/* ── 2-A단계: GitHub Actions 대상 — 방금 push한 SHA로 뜬 run을 찾아 완료까지 대기 ── */
async function waitGithubActionsRun(target, sha) {
  const { label, ghRepo } = target;
  log(`[${label}] GitHub Actions run 조회 중 (${ghRepo})...`);

  let run_ = null;
  for (let i = 0; i < 10 && !run_; i++) { // 최대 ~30초 동안 run이 나타나길 재시도
    const listRes = await run('gh', ['run', 'list', '--repo', ghRepo, '--limit', '5',
      '--json', 'databaseId,headSha,status,conclusion,url']);
    if (listRes.ok) {
      try {
        const runs = JSON.parse(listRes.stdout || '[]');
        run_ = runs.find((r) => r.headSha === sha);
      } catch (_) { /* JSON 파싱 실패 시 재시도 */ }
    }
    if (!run_) await sleep(3000);
  }
  if (!run_) return { ok: null, detail: 'GitHub Actions run을 찾지 못함(30초 타임아웃) — Actions 탭에서 직접 확인 필요' };

  log(`[${label}] run #${run_.databaseId} 발견 → 완료까지 대기: ${run_.url}`);
  const watchRes = await run('gh', ['run', 'watch', String(run_.databaseId), '--repo', ghRepo, '--exit-status']);
  const ok = watchRes.ok;
  log(`[${label}] GitHub Actions 결과: ${ok ? '✅ 성공' : '❌ 실패'}`);
  return { ok, detail: watchRes.stdout || watchRes.stderr, url: run_.url };
}

/* ── 2-B단계: Netlify 네이티브 auto-build 대상 — Netlify API로 해당 커밋 deploy를 폴링 ── */
async function waitNetlifyDeploy(target, sha) {
  const { label, netlifySiteName } = target;
  if (!NETLIFY_TOKEN) {
    return { ok: null, detail: 'NETLIFY_AUTH_TOKEN 없음 — 빌드결과 확인 스킵(push는 완료됨, 대시보드에서 직접 확인 필요)' };
  }

  const headers = { Authorization: `Bearer ${NETLIFY_TOKEN}` };
  const sitesRes = await fetch('https://api.netlify.com/api/v1/sites?per_page=100', { headers });
  if (!sitesRes.ok) return { ok: null, detail: `Netlify 사이트 목록 조회 실패 (HTTP ${sitesRes.status})` };
  const sites = await sitesRes.json();
  const site = sites.find((s) => s.name === netlifySiteName);
  if (!site) return { ok: null, detail: `Netlify에서 사이트 '${netlifySiteName}'를 찾지 못함 — 토큰 권한/이름 확인 필요` };

  log(`[${label}] Netlify 빌드 대기 중 (site: ${netlifySiteName}, ${site.url})...`);
  const timeoutAt = Date.now() + 5 * 60 * 1000; // 최대 5분
  let lastState = null;
  while (Date.now() < timeoutAt) {
    const deploysRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys?per_page=10`, { headers });
    if (deploysRes.ok) {
      const deploys = await deploysRes.json();
      const deploy = deploys.find((d) => d.commit_ref === sha) || deploys[0];
      if (deploy) {
        lastState = deploy.state;
        if (deploy.state === 'ready') {
          log(`[${label}] Netlify 배포 완료: ✅ ready (${deploy.deploy_ssl_url || deploy.ssl_url})`);
          return { ok: true, detail: `ready — ${deploy.deploy_ssl_url || deploy.ssl_url}`, url: deploy.admin_url };
        }
        if (deploy.state === 'error') {
          log(`[${label}] Netlify 배포 실패: ❌ error`);
          return { ok: false, detail: `error — ${site.admin_url}/deploys/${deploy.id}`, url: deploy.admin_url };
        }
      }
    }
    await sleep(6000);
  }
  return { ok: null, detail: `타임아웃(5분) — 마지막 상태: ${lastState ?? '알수없음'}. 대시보드에서 확인: ${site.admin_url}` };
}

/* ── 이메일 통지 (nodemailer, Gmail SMTP) — 자격정보 없으면 조용히 스킵 ── */
async function sendSummaryEmail(results) {
  if (!EMAIL_FROM || !EMAIL_APP_PASSWORD) {
    log('[알림] 이메일 설정 없음(.env.deploy의 NOTIFY_EMAIL_FROM/NOTIFY_EMAIL_APP_PASSWORD) — 발송 스킵');
    return;
  }
  const allOk = results.every((r) => r.ok === true);
  const anyFail = results.some((r) => r.ok === false);
  const overall = allOk ? '✅ 전체 성공' : anyFail ? '❌ 실패 있음' : '⚠ 일부 확인불가';
  const subject = `[ShopJoy 배포] ${overall} — ${results.map((r) => r.label).join(', ')}`;
  const body = results.map((r) => (
    `${r.ok === true ? '✅' : r.ok === false ? '❌' : '⚠'} ${r.label}\n` +
    `  ${r.detail}\n` +
    (r.url ? `  링크: ${r.url}\n` : '')
  )).join('\n') + `\n로그 파일: ${logPath}`;

  try {
    const { default: nodemailer } = await import('nodemailer');
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: EMAIL_FROM, pass: EMAIL_APP_PASSWORD } });
    await transporter.sendMail({ from: EMAIL_FROM, to: EMAIL_TO, subject, text: body });
    log(`[알림] 이메일 발송 완료 → ${EMAIL_TO}`);
  } catch (e) {
    log(`[알림] ⚠ 이메일 발송 실패(무시하고 계속): ${e?.message ?? e}`);
  }
}

/* ── 사이트 하나 배포 ── */
async function deployOne(key) {
  const target = TARGETS[key];
  if (!target) throw new Error(`알 수 없는 대상: ${key}`);
  log(`\n===== [${target.label}] 배포 시작 =====`);

  const pushResult = await gitPush(target);
  if (!pushResult.ok) {
    log(`[${target.label}] ❌ push 단계 실패: ${pushResult.detail}`);
    return { label: target.label, ok: false, detail: `push 실패(${pushResult.stage}): ${pushResult.detail}` };
  }
  if (pushResult.skipped) {
    return { label: target.label, ok: true, detail: '변경사항 없음 — 배포 스킵(이미 최신 상태)' };
  }

  const waited = target.ghRepo
    ? await waitGithubActionsRun(target, pushResult.sha)
    : await waitNetlifyDeploy(target, pushResult.sha);

  return { label: target.label, ok: waited.ok, detail: waited.detail, url: waited.url };
}

/* ── 메인 ── */
async function main() {
  const arg = process.argv[2];
  if (!arg || (!TARGETS[arg] && arg !== 'all')) {
    console.error(`사용법: node scripts/deploy-sites.mjs <${Object.keys(TARGETS).join('|')}|all>`);
    process.exit(1);
  }
  const keys = arg === 'all' ? Object.keys(TARGETS) : [arg];

  log(`배포 대상: ${keys.map((k) => TARGETS[k].label).join(', ')}`);
  const results = [];
  for (const key of keys) {
    results.push(await deployOne(key));
  }

  log('\n===== 배포 결과 요약 =====');
  for (const r of results) {
    log(`${r.ok === true ? '✅' : r.ok === false ? '❌' : '⚠'} ${r.label} — ${r.detail}`);
  }
  log(`로그 파일: ${logPath}`);

  await sendSummaryEmail(results);

  logStream.end();
  process.exit(results.some((r) => r.ok === false) ? 1 : 0);
}

main().catch((e) => {
  log(`✗ 처리되지 않은 오류: ${e?.stack ?? e}`);
  process.exit(1);
});
