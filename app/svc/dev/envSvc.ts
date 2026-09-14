/**
 * envSvc.ts — /dev/env-settings(로컬 전용 env 값 확인/수정 화면) 전용 API 호출.
 * 2026-09-14(요청사항: "env 값 보는페이지 하나 만들어주고 페이지에서 env 값 수정도
 * 가능하게 해줘"). 서버 쪽 가드(import.meta.dev)는 server/api/dev/env.*.ts 참조.
 */
export interface DevEnvFieldRow {
  key: string;
  label: string;
  secret: boolean;
  placeholder?: string;
  value: string;
}

export interface DevEnvResponse {
  envPath: string;
  groups: Record<string, DevEnvFieldRow[]>;
}

export const envSvc = {
  getAll: () => $fetch<DevEnvResponse>("/api/dev/env"),
  setValue: (key: string, value: string) => $fetch<{ ok: boolean }>("/api/dev/env", { method: "POST", body: { key, value } }),
};
