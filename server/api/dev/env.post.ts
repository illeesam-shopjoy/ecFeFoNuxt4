import { DEV_ENV_FIELDS } from "~~/server/utils/devEnvFields";
import { upsertEnvValue } from "~~/server/utils/devEnvFile";

/**
 * /dev/env-settings 전용 — 허용목록(DEV_ENV_FIELDS)에 든 키만 .env(bare)에 저장.
 * 2026-09-14(요청사항: "페이지에서 env 값 수정도 가능하게 해줘").
 *
 * import.meta.dev 가드는 env.get.ts와 동일 — 배포본(`nuxt build`)에서는 항상 403.
 * 저장은 디스크의 .env 파일만 바꾸는 것이라, 이미 떠 있는 dev 서버의 런타임 설정에는
 * 재시작 전까지 반영되지 않는다(Nuxt/Nitro가 dotenv를 프로세스 시작 시 한 번만 읽음) —
 * 화면에서 저장 후 "dev 서버 재시작 필요" 안내를 반드시 같이 보여준다.
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 403, statusMessage: "로컬 개발 모드에서만 사용할 수 있습니다." });
  }
  const body = await readBody<{ key?: string; value?: string }>(event);
  const key = body?.key ?? "";
  const value = body?.value ?? "";

  if (!DEV_ENV_FIELDS.some((f) => f.key === key)) {
    throw createError({ statusCode: 400, statusMessage: `허용되지 않은 키입니다: ${key}` });
  }
  try {
    await upsertEnvValue(key, value);
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: e instanceof Error ? e.message : "저장 실패" });
  }
  return { ok: true };
});
