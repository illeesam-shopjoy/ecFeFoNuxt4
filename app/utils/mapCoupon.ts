/**
 * mapCoupon.ts — 주문/결제 화면의 할인쿠폰·캐시 계산 (순수 함수).
 * 쿠폰은 주문할인·배송비할인은 주문당 1개, 상품할인은 상품(주문 줄)별 1개(한 쿠폰은 한 줄에만). 기본은 "혜택이 가장 큰 쿠폰"을 자동 적용하고, 혜택이 같으면 종료가 빠른 쿠폰을 우선한다.
 * 적용 순서: 상품할인 → (그 결과에) 주문할인 → 배송비할인, 마지막에 보유 캐시 사용.
 */
import type { AppliedCoupons, CouponCategory, CouponLine, PmCouponApplyType } from "~/types/pm/pmCouponApplyType";
import type { PmCouponType } from "~/types/pm/pmCouponType";
import type { PmCheckoutCalcType } from "~/types/pm/pmCheckoutCalcType";

export const COUPON_CATEGORIES: CouponCategory[] = ["product", "order", "shipping"];
export const COUPON_CATEGORY_LABEL: Record<CouponCategory, string> = { order: "주문할인쿠폰", product: "상품할인쿠폰", shipping: "배송비할인쿠폰" };

/** 오늘 날짜 yyyy-mm-dd (브라우저 로컬 기준) */
export const todayYmd = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** 쿠폰 종류 — 적용범위(applyScopeCd)가 있으면 그것, 없으면 쿠폰유형 코드로 판단, 그래도 모르면 주문할인 */
export function couponCategoryOf(c: PmCouponType): CouponCategory {
  const scope = (c.applyScopeCd ?? "").toUpperCase();
  const type = (c.couponTypeCd ?? "").toUpperCase();
  if (scope === "PRODUCT" || type.includes("PROD")) return "product";
  if (scope === "DELIVERY" || type.includes("SHIP") || type.includes("DELIV")) return "shipping";
  return "order";
}

/** 내 쿠폰(서버) → 결제 화면 쿠폰 */
export function toApplyCoupon(c: PmCouponType): PmCouponApplyType {
  const category = couponCategoryOf(c);
  const rate = Number(c.discountRate ?? 0);
  const percent = rate > 0;
  return {
    couponId: c.couponId,
    category,
    name: c.couponNm || c.couponCd || "쿠폰",
    desc: c.couponDesc || undefined,
    discountType: category === "shipping" && percent && rate >= 100 ? "free-shipping" : percent ? "percent" : "amount",
    discountValue: percent ? rate : Number(c.discountAmt ?? 0),
    minOrderAmt: Number(c.minOrderAmt ?? 0) || undefined,
    maxDiscountAmt: Number(c.maxDiscountAmt ?? 0) || undefined,
    validFrom: c.validFrom ? String(c.validFrom).slice(0, 10) : undefined,
    validTo: c.validTo ? String(c.validTo).slice(0, 10) : undefined,
  };
}

/** base(할인 대상 금액)에 이 쿠폰을 적용했을 때 할인액 */
export function couponDiscount(c: PmCouponApplyType, base: number): number {
  if (base <= 0) return 0;
  if (c.discountType === "free-shipping") return base;
  let d = c.discountType === "percent" ? Math.floor((base * c.discountValue) / 100) : c.discountValue;
  if (c.maxDiscountAmt && c.maxDiscountAmt > 0) d = Math.min(d, c.maxDiscountAmt);
  return Math.max(0, Math.min(d, base));
}

/** 지금 쓸 수 있는 쿠폰인가 — 유효기간 안이고 상품합계가 최소 주문금액 이상. 아니면 이유를 돌려준다 */
export function couponBlockReason(c: PmCouponApplyType, subtotal: number, today: string): string {
  if (c.validFrom && c.validFrom > today) return `${c.validFrom} 부터 사용 가능`;
  if (c.validTo && c.validTo < today) return "유효기간이 지났습니다";
  if (c.minOrderAmt && subtotal < c.minOrderAmt) return `${c.minOrderAmt.toLocaleString()}원 이상 구매 시 사용 가능`;
  return "";
}

/** 혜택이 가장 큰 쿠폰(같으면 종료가 빠른 것 우선). 쓸 수 있는 쿠폰이 없으면 null */
export function pickBestCoupon(pool: PmCouponApplyType[], base: number, subtotal: number, today: string): PmCouponApplyType | null {
  const usable = pool.filter((c) => !couponBlockReason(c, subtotal, today) && couponDiscount(c, base) > 0);
  usable.sort((a, b) => couponDiscount(b, base) - couponDiscount(a, base) || (a.validTo ?? "9999-12-31").localeCompare(b.validTo ?? "9999-12-31"));
  return usable[0] ?? null;
}

/** 종류별 할인 대상 금액 — 상품할인은 상품합계(줄별로는 각 줄 금액), 주문할인은 상품할인 적용 후 금액, 배송비할인은 배송비 */
export function couponBases(subtotal: number, shipFee: number, applied: AppliedCoupons, lines: CouponLine[]): Record<CouponCategory, number> {
  return { product: subtotal, order: subtotal - productDiscountTotal(lines, applied.product), shipping: shipFee };
}

/** 주문 줄 키 — 같은 상품이라도 옵션(SKU)이 다르면 다른 줄 */
export const couponLineKey = (item: { prodId: string; selectedProdSkuId?: string | null }): string => `${item.prodId}|${item.selectedProdSkuId ?? ""}`;

/** 상품할인쿠폰 할인액 합계 — 각 줄에 적용한 쿠폰을 그 줄 금액 기준으로 계산 */
export function productDiscountTotal(lines: CouponLine[], byLine: Record<string, PmCouponApplyType | null>): number {
  return lines.reduce((sum, l) => sum + (byLine[l.key] ? couponDiscount(byLine[l.key]!, l.amount) : 0), 0);
}

/** 이 줄에 이 쿠폰을 쓸 수 없는 이유("" = 사용 가능) — 최소 주문금액은 상품할인쿠폰이면 그 줄 금액 기준 */
export const lineCouponBlockReason = (c: PmCouponApplyType, line: CouponLine, today: string): string => couponBlockReason(c, line.amount, today);

/**
 * 상품할인쿠폰 자동 적용 — 큰 줄부터 차례로, 아직 안 쓴 쿠폰 중 그 줄에서 혜택이 가장 큰 쿠폰(같으면 종료가 빠른 것)을 붙인다.
 * 한 쿠폰은 한 줄에만 쓴다.
 */
export function autoPickProductCoupons(pool: PmCouponApplyType[], lines: CouponLine[], today: string): Record<string, PmCouponApplyType | null> {
  const used = new Set<string>();
  const out: Record<string, PmCouponApplyType | null> = {};
  [...lines].sort((a, b) => b.amount - a.amount).forEach((l) => {
    const pick = pickBestCoupon(pool.filter((c) => !used.has(c.couponId)), l.amount, l.amount, today);
    if (pick) used.add(pick.couponId);
    out[l.key] = pick;
  });
  return out;
}

/** 최종 금액 계산 — 쿠폰 3종 + 캐시(보유 캐시를 최대로 쓰는 옵션) */
export function calcCheckout(subtotal: number, shipFee: number, applied: AppliedCoupons, lines: CouponLine[], cashBalance: number, useMaxCash: boolean): PmCheckoutCalcType {
  const bases = couponBases(subtotal, shipFee, applied, lines);
  const productDiscount = productDiscountTotal(lines, applied.product);
  const orderDiscount = applied.order ? couponDiscount(applied.order, bases.order) : 0;
  const shipDiscount = applied.shipping ? couponDiscount(applied.shipping, bases.shipping) : 0;
  const beforeCash = Math.max(0, subtotal - productDiscount - orderDiscount + shipFee - shipDiscount);
  const cashUse = useMaxCash ? Math.max(0, Math.min(Math.floor(cashBalance), beforeCash)) : 0;
  return { productDiscount, orderDiscount, shipDiscount, couponTotal: productDiscount + orderDiscount + shipDiscount, cashUse, total: beforeCash - cashUse };
}
