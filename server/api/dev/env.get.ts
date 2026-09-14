import { DEV_ENV_FIELDS } from "~~/server/utils/devEnvFields";
import { readEnvMap } from "~~/server/utils/devEnvFile";

/**
 * /dev/env-settings 전용 — 허용목록(DEV_ENV_FIELDS)에 든 값만 .env(bare)에서 읽어 반환.
 * 2026-09-14(요청사항: "env 값 보는페이지 하나 만들어주고").
 *
 * import.meta.dev는 `nuxt dev`(로컬 개발 서버)에서만 true — `nuxt build`로 만든 실제
 * 배포본(Netlify)에서는 항상 false라 이 라우트가 아예 동작하지 않는다(민감정보 읽기
 * 라우트를 배포본에 남겨두지 않기 위한 안전장치).
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 403, statusMessage: "로컬 개발 모드에서만 사용할 수 있습니다." });
  }
  const map = await readEnvMap();
  return {
    envPath: ".env",
    groups: DEV_ENV_FIELDS.reduce<Record<string, { key: string; label: string; secret: boolean; placeholder?: string; value: string }[]>>((acc, f) => {
      (acc[f.group] ??= []).push({ key: f.key, label: f.label, secret: f.secret, placeholder: f.placeholder, value: map[f.key] ?? "" });
      return acc;
    }, {}),
  };
});
