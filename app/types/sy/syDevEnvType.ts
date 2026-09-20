/** 개발용 env 편집 화면(/dev/env-settings) 입력 행. */
export interface SyDevEnvFieldType {
  key: string;
  label: string;
  secret: boolean;
  placeholder?: string;
  value: string;
}

export interface SyDevEnvResType {
  envPath: string;
  groups: Record<string, SyDevEnvFieldType[]>;
}
