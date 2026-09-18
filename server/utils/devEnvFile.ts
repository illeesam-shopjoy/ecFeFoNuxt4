/**
 * devEnvFile.ts — /dev/env-settings가 실제로 읽고 쓰는 .env 파일 I/O.
 * 2026-09-14(요청사항: "env 값 보는페이지 하나 만들어주고 페이지에서 env 값 수정도
 * 가능하게 해줘").
 *
 * package.json의 "dev" 스크립트("nuxt dev")는 --dotenv 옵션이 없어 .env.local/
 * .env.development가 아니라 프로젝트 루트의 이름 없는 .env(bare)를 읽는다(dev:local/
 * dev:prod만 --dotenv로 각각 다른 파일을 명시함) — 그래서 이 화면도 그 bare .env
 * 하나만 다룬다. 이 파일은 .gitignore에 포함돼 있어 여기서 수정해도 배포/커밋에는
 * 영향 없다.
 */
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

const ENV_PATH = fileURLToPath(new URL("../../.env", import.meta.url));

/** .env 파일을 읽어 "KEY=value" 형태의 활성화된(주석 아닌) 줄만 맵으로 반환. 파일이 없으면 빈 맵. */
export async function readEnvMap(): Promise<Record<string, string>> {
  let content = "";
  try {
    content = await fs.readFile(ENV_PATH, "utf-8");
  } catch {
    return {};
  }
  const map: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m?.[1] !== undefined) map[m[1]] = (m[2] ?? "").trim();
  }
  return map;
}

/**
 * .env 파일에서 key의 값을 value로 설정(덮어쓰기/추가). 파일이 없으면 새로 만든다.
 * - 이미 활성화된 "KEY=..." 줄이 있으면 그 줄만 교체.
 * - "# KEY=..." 형태의 주석 처리된 줄이 있으면 주석을 풀고 값을 채운다.
 * - 둘 다 없으면 파일 맨 끝에 새 줄로 추가.
 * - value가 빈 문자열이면(사용자가 지웠으면) 해당 줄 자체를 삭제(설정 안 함 상태로 되돌림).
 */
export async function upsertEnvValue(key: string, value: string): Promise<void> {
  if (!/^[A-Z0-9_]+$/.test(key)) throw new Error(`허용되지 않은 키 형식: ${key}`);
  if (value.includes("\n") || value.includes("\r")) throw new Error("값에 줄바꿈은 넣을 수 없습니다.");

  let content = "";
  try {
    content = await fs.readFile(ENV_PATH, "utf-8");
  } catch {
    content = "";
  }
  const lines = content.length ? content.split("\n") : [];

  const activeIdx = lines.findIndex((l) => new RegExp(`^${key}\\s*=`).test(l));
  const commentedIdx = lines.findIndex((l) => new RegExp(`^#\\s*${key}\\s*=`).test(l));

  if (value === "") {
    // 값 삭제 — 활성화된 줄이 있으면 제거. 주석 줄은 예시로 남겨둔다.
    if (activeIdx !== -1) lines.splice(activeIdx, 1);
  } else if (activeIdx !== -1) {
    lines[activeIdx] = `${key}=${value}`;
  } else if (commentedIdx !== -1) {
    lines[commentedIdx] = `${key}=${value}`;
  } else {
    if (lines.length && (lines[lines.length - 1] ?? "").trim() !== "") lines.push("");
    lines.push(`${key}=${value}`);
  }

  await fs.writeFile(ENV_PATH, lines.join("\n"), "utf-8");
}
