/**
 * [DEV ONLY] 파일을 에디터에서 열기
 * GET /api/__xdev/open-editor?file=app/components/...&editor=vscode|cursor
 *
 * editor 기본값: vscode
 * Cursor가 PATH에서 `code` 명령을 덮어쓰는 문제를 우회하기 위해
 * VS Code/Cursor 실제 설치 경로를 직접 찾아서 실행합니다.
 */
import { exec } from "node:child_process";
import { logger } from "~~/server/utils/logger";
import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";

function getVSCodeCli(): string {
  const localAppData = process.env.LOCALAPPDATA ?? "";
  const programFiles = process.env.ProgramFiles ?? "C:\\Program Files";
  const programFilesX86 = process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)";

  const candidates = [
    `${localAppData}\\Programs\\Microsoft VS Code\\bin\\code.cmd`,
    `${programFiles}\\Microsoft VS Code\\bin\\code.cmd`,
    `${programFilesX86}\\Microsoft VS Code\\bin\\code.cmd`,
  ];

  for (const p of candidates) {
    if (existsSync(p)) return `"${p}"`;
  }
  return "code";
}

function getCursorCli(): string {
  const localAppData = process.env.LOCALAPPDATA ?? "";
  const candidates = [
    `${localAppData}\\Programs\\Cursor\\resources\\app\\bin\\cursor.cmd`,
    `${localAppData}\\Programs\\cursor\\resources\\app\\bin\\cursor.cmd`,
  ];
  for (const p of candidates) {
    if (existsSync(p)) return `"${p}"`;
  }
  return "cursor";
}

export default defineEventHandler((event) => {
  // 2026-09-20 보안 수정: 예전엔 개발 모드 가드가 없어 운영(Netlify)에서도 인증 없이 호출되고, file 값이 셸 명령에 그대로 들어가
  // (`file=$(...)` 등) 명령 주입이 가능했다. `nuxt dev` 로컬 개발 서버에서만 동작하게 막고(운영 빌드에서는 404),
  // 프로젝트 폴더 밖 경로·셸 메타문자를 거부한다.
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
  const query = getQuery(event);
  const file = query.file;
  const editor = (query.editor as string)?.toLowerCase() === "cursor" ? "cursor" : "vscode";

  if (!file || typeof file !== "string") {
    throw createError({ statusCode: 400, statusMessage: "file 파라미터 필요" });
  }
  if (/["'`$&|;<>\r\n]/.test(file)) {
    throw createError({ statusCode: 400, statusMessage: "허용되지 않는 문자가 포함된 경로입니다." });
  }
  const root = process.cwd();
  const absPath = resolve(root, file);
  if (absPath !== root && !absPath.startsWith(root + sep)) {
    throw createError({ statusCode: 400, statusMessage: "프로젝트 폴더 밖의 경로는 열 수 없습니다." });
  }
  const cli = editor === "cursor" ? getCursorCli() : getVSCodeCli();
  exec(`${cli} --goto "${absPath}"`, (err) => {
    if (err) logger.error("[__xdev/open-editor] 오류:", err.message);
  });
  return { ok: true, path: absPath, editor };
});
