/**
 * payMethods.ts — 결제수단 정의(화면 표시용) + 결제수단 → PG 매핑.
 *
 * 주문 화면은 "어떤 결제수단을 고르는가"만 안다. 그 수단을 실제로 처리하는 PG 는 PAY_METHOD_PG 가 정하고,
 * PG 별 결제창 호출은 utils/payProvider.ts 의 어댑터가 맡는다 — 카드 PG 를 토스가 아닌 곳으로 바꾸거나 수단별로 PG 를 나눠도 이 매핑과 어댑터만 바뀐다.
 */

/** 결제수단 코드 */
export type PayMethodCd = "TRANSFER" | "VIRTUAL_ACCOUNT" | "KAKAOPAY" | "NAVERPAY" | "TOSSPAY" | "CARD";
/** 결제대행사(PG) 코드 — 새 PG 를 붙이면 여기에 추가하고 payProvider.ts 에 어댑터를 등록한다 */
export type PayPgCd = "TOSS";

export interface PayMethodDef {
  cd: PayMethodCd;
  nm: string; // 화면에 보이는 이름
  mark: string; // 아이콘 원 안의 글자
  markCls: string; // 아이콘 색(Tailwind)
  desc: string; // 한 줄 설명
  notes: string[]; // 선택했을 때 보이는 안내
}

/** 화면 표시 순서 */
export const PAY_METHODS: PayMethodDef[] = [
  { cd: "TRANSFER", nm: "실시간 계좌이체", mark: "₩", markCls: "bg-[#0067ff] text-white", desc: "내 은행 계좌에서 바로 이체", notes: ["은행 앱/계좌 비밀번호로 간편하게 인증하고, 결제 즉시 완료됩니다.", "은행 점검 시간(보통 23:30~00:30)에는 이용이 제한될 수 있습니다.", "현금영수증(소득공제)을 결제창에서 신청할 수 있습니다."] },
  { cd: "VIRTUAL_ACCOUNT", nm: "무통장입금 (가상계좌)", mark: "입", markCls: "bg-[#6b7280] text-white", desc: "주문 후 발급되는 계좌로 입금", notes: ["주문하면 가상계좌가 발급됩니다. 입금기한(3일) 안에 입금해 주세요.", "입금이 확인되면 주문이 처리됩니다. 기한 안에 입금하지 않으면 주문이 자동 취소됩니다.", "입금자명과 관계없이 발급된 계좌·금액 그대로 입금하면 됩니다."] },
  { cd: "KAKAOPAY", nm: "카카오페이", mark: "K", markCls: "bg-[#FEE500] text-[#3c1e1e]", desc: "카카오페이 앱·QR로 간편 결제", notes: ["PC에서는 QR코드가 표시됩니다. 카카오톡/카카오페이 앱으로 스캔해 결제하세요.", "모바일에서는 카카오페이 앱이 실행됩니다.", "카카오페이에 등록한 카드·계좌·머니로 결제할 수 있습니다."] },
  { cd: "NAVERPAY", nm: "네이버페이", mark: "N", markCls: "bg-[#03C75A] text-white", desc: "네이버페이로 간편 결제", notes: ["네이버 로그인 후 등록한 카드·계좌로 결제합니다.", "네이버페이 포인트를 사용할 수 있습니다(보유·조건에 따라 다름)."] },
  { cd: "TOSSPAY", nm: "토스페이", mark: "T", markCls: "bg-[#0064ff] text-white", desc: "토스 앱으로 간편 결제", notes: ["토스 앱에서 비밀번호/생체 인증으로 결제합니다.", "토스에 등록한 카드·계좌·토스머니로 결제할 수 있습니다."] },
  { cd: "CARD", nm: "카드 (신용·체크)", mark: "카", markCls: "bg-[#1a1410] text-white", desc: "국내 신용·체크카드", notes: ["카드사별 무이자 할부·즉시할인 혜택은 결제창에서 확인할 수 있습니다.", "할부는 결제 금액 5만원 이상부터 선택할 수 있습니다.", "본인 명의 카드로 결제해 주세요."] },
];

/** 기본 선택 결제수단(이전에 쓴 수단이 없을 때) */
export const DEFAULT_PAY_METHOD: PayMethodCd = "CARD";

/** 결제수단 → PG. 수수료가 낮은 PG 로 바꾸려면 해당 수단만 바꾸면 된다(어댑터가 등록돼 있어야 함) */
export const PAY_METHOD_PG: Record<PayMethodCd, PayPgCd> = {
  TRANSFER: "TOSS",
  VIRTUAL_ACCOUNT: "TOSS",
  KAKAOPAY: "TOSS",
  NAVERPAY: "TOSS",
  TOSSPAY: "TOSS",
  CARD: "TOSS",
};

const STORAGE_KEY = "pay_method_last";
const isMethod = (v: unknown): v is PayMethodCd => PAY_METHODS.some((m) => m.cd === v);

/** 이전에 결제한 수단(이 브라우저에 기억) — 없거나 지금 목록에 없으면 기본(카드) */
export function loadLastPayMethod(): PayMethodCd {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isMethod(v) ? v : DEFAULT_PAY_METHOD;
  } catch {
    return DEFAULT_PAY_METHOD;
  }
}
export function saveLastPayMethod(cd: PayMethodCd) {
  try {
    localStorage.setItem(STORAGE_KEY, cd);
  } catch {
    /* 저장소를 못 써도 결제는 진행 */
  }
}
export const payMethodOf = (cd: string): PayMethodDef | undefined => PAY_METHODS.find((m) => m.cd === cd);
