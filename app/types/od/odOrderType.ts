import type { OdOrderItemType } from "~/types/od/odOrderItemType";
import type { OdDlivType } from "~/types/od/odDlivType";
import type { OdPayType } from "~/types/od/odPayType";

/** 주문. 필드명은 ecBeBo(JPA) OdOrderDto.Item(od_order) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface OdOrderType {
  orderId: string; // 주문ID (YYMMDDhhmmss+rand4)
  memberId?: string; // 회원ID
  memberNm?: string; // 주문자명
  ordererEmail?: string; // 주문자 이메일 (주문 시점 스냅샷)
  totalAmt?: number; // 상품합계금액 (현재값)
  payAmt?: number; // 실결제금액 (현재값)
  discntAmt?: number; // 총 할인금액 (쿠폰+프로모션 합계, 표시용)
  couponDiscntAmt?: number; // 쿠폰할인금액
  saveUseAmt?: number; // 적립금사용금액
  shippingFee?: number; // 출고배송료 (현재값)
  orderStatusCd?: string; // 주문상태 — ORDER_STATUS_CD {PENDING:입금대기, PAID:결제완료, PREPARING:상품준비, SHIPP…
  orderStatusCdNm?: string; // 주문상태 코드 라벨
  orderStatusCdBefore?: string; // 변경 전 주문상태 — ORDER_STATUS_CD
  payMethodCd?: string; // 결제수단 — PAY_METHOD {BANK_TRANSFER:무통장입금, VBANK:가상계좌, TOSS:토스, KAKAO:카카오…
  payMethodCdNm?: string; // 결제수단 코드 라벨
  dlivStatusCd?: string; // 배송상태 최신 — DLIV_STATUS {READY:준비중, SHIPPED:출고완료, IN_TRANSIT:배송중, DELIVE…
  dlivStatusCdNm?: string; // 배송상태 코드 라벨
  couponId?: string; // 사용쿠폰ID
  recvNm?: string; // 수령자명
  recvPhone?: string; // 수령자연락처
  recvZip?: string; // 수령자우편번호
  recvAddr?: string; // 수령자주소
  recvAddrDetail?: string; // 수령자상세주소
  recvMemo?: string; // 배송메모
  refundBankCd?: string; // 환불 은행코드 — BANK_CODE (무통장/가상계좌 환불 시)
  refundBankCdNm?: string; // 환불은행 코드 라벨
  refundAccountNo?: string; // 환불 계좌번호
  refundAccountNm?: string; // 환불 예금주명
  accessChannelCd?: string; // 주문유입경로 — ACCESS_CHANNEL_CD {WEB_PC:PC웹, WEB_MOBILE:모바일웹, APP_IOS:iOS앱,…
  accessChannelCdNm?: string; // 유입경로 코드 라벨
  apprStatusCd?: string; // 결재상태 — APPR_STATUS_CD {REQ:결재요청, APPROVED:승인, REJECTED:반려, DONE:완료}
  apprStatusCdNm?: string; // 결재상태 코드 라벨
  apprStatusCdBefore?: string; // 변경 전 결재상태 — APPR_STATUS_CD
  apprAmt?: number; // 결재 요청금액
  apprTargetCd?: string; // 결재대상 구분 — APPR_TARGET_CD {ORDER:주문, PROD:상품, DLIV:배송, EXTRA:추가결제}
  apprTargetCdNm?: string; // 결재대상 코드 라벨
  apprTargetNm?: string; // 결재 대상명
  apprReason?: string; // 사유/메모
  apprReqUserId?: string; // 결재 요청자 (sy_user.user_id)
  apprReqDate?: string; // 결재 요청일시
  apprAprvUserId?: string; // 결재자 (sy_user.user_id)
  apprAprvDate?: string; // 결재일시
  memo?: string; // 관리메모
  orderDate?: string; // 주문일시
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  memberEmail?: string; // 회원 이메일 (mb_member 조인)
  memberPhoneOrigin?: string; // 회원 연락처 (mb_member 조인)
  gradeCd?: string; // 회원등급 (표시용) — MEMBER_GRADE {BASIC:일반, GOLD:우수, NORMAL:일반, VIP:VIP, BRON…
  gradeCdNm?: string; // 회원등급 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  totalPurchaseAmt?: number; // 회원 누적 구매금액 (조인/집계 표시용)
  couponNm?: string; // 사용쿠폰명 (pm_coupon 조인)
  couponTypeCd?: string; // 사용쿠폰 유형 (pm_coupon 조인) — COUPON_TYPE_CD {RATE:정률 할인, FIXED:정액 할인, PROD…
  couponTypeCdNm?: string; // 사용쿠폰 유형 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  orderItemCnt?: number;
  orderItems?: OdOrderItemType[]; // 주문상품 목록 (FO 마이페이지 주문 조회 응답에 포함)
  orderDlivs?: OdDlivType[]; // 배송 목록 (FO 마이페이지 주문 조회 응답에 포함)
  orderPays?: OdPayType[]; // 결제 목록 (od_pay — FO 마이페이지 주문 조회 응답에 포함)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
