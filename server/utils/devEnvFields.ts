/**
 * devEnvFields.ts — /dev/env-settings(로컬 전용 env 값 확인/수정 화면)에서 다룰 수 있는
 * 환경변수 허용목록(allowlist). 2026-09-14(요청사항: "env 값 보는페이지 하나 만들어주고
 * 페이지에서 env 값 수정도 가능하게 해줘 ... 토스, 카카오, 구글로그인, 맵연결 등 확인
 * 하려는거야").
 *
 * 임의의 키를 아무거나 읽고 쓰게 하면 위험해서(서버 인프라 값 등), 실제로 nuxt.config.ts가
 * 참조하는 결제/소셜로그인/분석 키 + 앞으로 쓸 지도 연동용 키로만 좁혀둔다. 이 파일 + 관련
 * server/api/dev/env.*.ts는 import.meta.dev(=Nuxt 개발 모드일 때만 true)로 막혀 있어
 * `nuxt build`로 만든 실제 배포본(Netlify)에서는 아예 동작하지 않는다.
 */
export interface DevEnvField {
  key: string;
  label: string;
  group: string;
  /** 값 표시를 감출지(비밀번호 인풋) 여부 — 시크릿/프라이빗 키. */
  secret: boolean;
  placeholder?: string;
}

export const DEV_ENV_FIELDS: DevEnvField[] = [
  { key: "NUXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY", label: "클라이언트 키", group: "토스페이먼츠", secret: false, placeholder: "test_ck_..." },
  { key: "TOSSPAYMENTS_SECRET_KEY", label: "시크릿 키", group: "토스페이먼츠", secret: true, placeholder: "test_sk_..." },

  { key: "GOOGLE_CLIENT_ID", label: "클라이언트 ID", group: "구글 로그인", secret: false },
  { key: "GOOGLE_CLIENT_SECRET", label: "클라이언트 시크릿", group: "구글 로그인", secret: true },

  { key: "KAKAO_CLIENT_ID", label: "REST API 키", group: "카카오 로그인", secret: false },
  { key: "KAKAO_CLIENT_SECRET", label: "클라이언트 시크릿", group: "카카오 로그인", secret: true },

  { key: "NAVER_CLIENT_ID", label: "클라이언트 ID", group: "네이버 로그인", secret: false },
  { key: "NAVER_CLIENT_SECRET", label: "클라이언트 시크릿", group: "네이버 로그인", secret: true },

  { key: "APPLE_CLIENT_ID", label: "Service ID", group: "애플 로그인", secret: false },
  { key: "APPLE_TEAM_ID", label: "Team ID", group: "애플 로그인", secret: false },
  { key: "APPLE_KEY_ID", label: "Key ID", group: "애플 로그인", secret: false },
  { key: "APPLE_PRIVATE_KEY", label: "Private Key", group: "애플 로그인", secret: true },

  // 2026-09-14 시점엔 아직 지도 위젯이 실제로 연동돼 있지 않음(코드에서 안 씀) — 값만 미리
  // 저장해둘 수 있게 자리만 마련. nuxt.config.ts public.kakaoMapKey/googleMapsKey로 노출.
  { key: "NUXT_PUBLIC_KAKAO_MAP_KEY", label: "카카오맵 JS 키", group: "지도 연결", secret: false },
  { key: "NUXT_PUBLIC_NAVER_MAP_CLIENT_ID", label: "네이버맵 Client ID", group: "지도 연결", secret: false },
  { key: "NUXT_PUBLIC_GOOGLE_MAPS_KEY", label: "구글맵 API 키", group: "지도 연결", secret: false },

  { key: "NUXT_PUBLIC_GA_MEASUREMENT_ID", label: "측정 ID (G-XXXXXXXXXX)", group: "Google Analytics 4", secret: false },
];
