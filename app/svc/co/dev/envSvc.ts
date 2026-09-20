/**
 * envSvc.ts — /dev/env-settings(로컬 전용 env 값 확인/수정 화면) 전용 API 호출.
 * 2026-09-14(요청사항: "env 값 보는페이지 하나 만들어주고 페이지에서 env 값 수정도 가능하게 해줘"). 서버 쪽 가드(import.meta.dev)는 server/api/dev/env.*.ts 참조.
 * 서버 파일시스템(.env)을 읽고 쓰는 개발 도구라 server/api 가 필수 — axiosCsr(ecBeBo 직접 호출) 대신 $fetch(/api/...)를 쓰는 예외다.
 */
import type { CoOkResType } from "~/types/co/coOkResType";
import type { SyDevEnvResType } from "~/types/sy/syDevEnvType";

export const envSvc = {
  getAll: (): Promise<SyDevEnvResType> => $fetch<SyDevEnvResType>("/api/dev/env"),
  setValue: (key: string, value: string): Promise<CoOkResType> => $fetch<CoOkResType>("/api/dev/env", { method: "POST", body: { key, value } }),
};
