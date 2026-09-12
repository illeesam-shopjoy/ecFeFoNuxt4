// notify-deploy-result.mjs — .github/workflows/netlify-deploy.yml 전용 배포결과 이메일 통지.
// z0scripts/scripts_deploy_illeesam_synol/notify-deploy-result.js(Synology 배포용)와 같은 패턴
// (Gmail SMTP + 앱 비밀번호, nodemailer) — 이 저장소 전용으로 가볍게 옮겨왔다.
// 자격정보가 없으면 조용히 스킵하고, 발송 자체가 실패해도 워크플로를 실패시키지 않는다
// (알림 실패가 배포 결과에 영향을 주면 안 되므로 항상 exit 0).
// 2026-09-12(요청사항: '제목앞단에 🌈✅ 아이콘' + '로그파일도 첨부') — 제목 맨 앞 아이콘 +
// DEPLOY_LOG_FILE(=deploy.log, 워크플로의 Install/Build/Deploy 단계 출력 누적본) 첨부.
import fs from "node:fs";
import nodemailer from "nodemailer";

const to = process.env.NOTIFY_EMAIL_TO;
const from = process.env.NOTIFY_EMAIL_FROM;
const appPassword = process.env.NOTIFY_EMAIL_APP_PASSWORD;

if (!to || !from || !appPassword) {
  console.log("[알림] 이메일 설정 없음(NOTIFY_EMAIL_*) — 스킵");
  process.exit(0);
}

const status = process.env.DEPLOY_STATUS ?? "unknown"; // success | failure | cancelled
const repo = process.env.GITHUB_REPOSITORY ?? "";
const runId = process.env.GITHUB_RUN_ID ?? "";
const sha = (process.env.GITHUB_SHA ?? "").slice(0, 7);
const ref = process.env.GITHUB_REF_NAME ?? "";
const runUrl = repo && runId ? `https://github.com/${repo}/actions/runs/${runId}` : "";
const siteUrl = process.env.NETLIFY_SITE_URL ?? "https://shopjoy-ecfefonuxt4.netlify.app";

const ok = status === "success";
const icon = ok ? "🌈✅" : "❌";
const subject = `${icon} [ecFeFoNuxt4] Netlify 배포 ${ok ? "성공" : "실패"} — ${ref}@${sha}`;
const text = [
  `상태: ${ok ? "✅ 성공" : "❌ 실패"} (${status})`,
  `브랜치: ${ref}`,
  `커밋: ${sha}`,
  `사이트: ${siteUrl}`,
  `워크플로 로그: ${runUrl}`,
].join("\n");

const logFile = process.env.DEPLOY_LOG_FILE; // deploy.log — Install/Build/Deploy 단계가 tee로 누적한 출력
const attachments = [];
if (logFile && fs.existsSync(logFile)) {
  attachments.push({ filename: "deploy.log", path: logFile });
} else if (logFile) {
  console.log(`[알림] 로그파일 없음(${logFile}) — 첨부 없이 발송(checkout 실패 등 초기 단계 오류로 추정)`);
}

console.log(`[알림] 이메일 발송 → 수신: ${to} | 제목: ${subject}`);

try {
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: from, pass: appPassword } });
  await transporter.sendMail({ from, to, subject, text, attachments });
  console.log(`[알림] 이메일 발송 완료${attachments.length ? ' (로그파일 첨부)' : ''}`);
} catch (e) {
  console.warn(`[알림] ⚠ 이메일 발송 실패(무시하고 계속): ${e?.message ?? e}`);
}
