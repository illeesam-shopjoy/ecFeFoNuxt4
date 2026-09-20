/** 클레임(취소/반품/교환). 필드명은 ecBeBo(JPA) OdClaimDto.Item(od_claim) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface OdClaimType {
  claimId: string; // 클레임ID (YYMMDDhhmmss+rand4)
  orderId?: string; // 주문ID
  memberId?: string; // 회원ID
  memberNm?: string; // 회원명
  claimTypeCd?: string; // 클레임유형 — CLAIM_TYPE_CD {CANCEL:취소, RETURN:반품, EXCHANGE:교환}
  claimStatusCd?: string; // 클레임상태 — CLAIM_STATUS_CD {REQUESTED:요청, ACCEPTED:승인, APPROVED:승인, IN_PI…
  claimStatusCdBefore?: string; // 변경 전 클레임상태 — CLAIM_STATUS_CD
  reasonCd?: string; // 사유코드 — REASON_CD {MIND_CHANGE:단순변심, WRONG_OPTION:옵션선택오류, CHEAPER_ELSEW…
  reasonDetail?: string; // 사유 상세
  prodNm?: string; // 대표 상품명
  customerFaultYn?: string; // 고객귀책여부 (Y=고객귀책, N=판매자귀책)
  claimCancelYn?: string; // 클레임 철회여부 Y/N (신청 자체를 취소한 경우)
  claimCancelDate?: string; // 클레임 철회일시
  claimCancelReasonCd?: string; // 클레임 철회사유코드
  claimCancelReasonDetail?: string; // 클레임 철회사유상세
  refundMethodCd?: string; // 환불수단 — PAY_METHOD {BANK_TRANSFER:무통장입금, VBANK:가상계좌, TOSS:토스, KAKAO:카카오…
  refundAmt?: number; // 환불 합계금액 (상품금액+배송비-추가배송비-적립금복원)
  refundProdAmt?: number; // 환불 상품금액
  refundShippingAmt?: number; // 환불 배송비
  refundSaveAmt?: number; // 환불 적립금 합계 (사용 적립금 복원액)
  refundBankCd?: string; // 환불 은행코드 — BANK_CODE (계좌이체 환불 시)
  refundAccountNo?: string; // 환불 계좌번호
  refundAccountNm?: string; // 환불 예금주명
  requestDate?: string; // 클레임 요청일시
  procDate?: string; // 처리일시
  procUserId?: string; // 처리자 (sy_user.user_id)
  memo?: string; // 관리메모
  addShippingFee?: number; // 추가배송비 (교환=출고배송비, 반품/취소=무료배송 조건 파괴 시 추가)
  addShippingFeeChargeCd?: string; // 추가배송비 청구방법코드
  addShippingFeeReason?: string; // 추가배송비 면제사유
  collectNm?: string; // 수거지 성명 (반품·교환 수거 주소)
  collectPhone?: string; // 수거지 연락처
  collectZip?: string; // 수거지 우편번호
  collectAddr?: string; // 수거지 기본주소
  collectAddrDetail?: string; // 수거지 상세주소
  collectReqMemo?: string; // 수거 요청사항
  collectSchdDate?: string; // 수거 예정일시
  returnShippingFee?: number; // 수거배송료
  returnCourierCd?: string; // 수거 택배사 — COURIER {CJ:CJ대한통운, LOTTE:롯데택배, HANJIN:한진택배 외}
  returnTrackingNo?: string; // 수거 송장번호
  returnStatusCd?: string; // 수거 상태 — DLIV_STATUS {READY:준비중, SHIPPED:출고완료, IN_TRANSIT:배송중, DELIVERE…
  returnStatusCdBefore?: string; // 변경 전 수거상태 — DLIV_STATUS
  inboundShippingFee?: number; // 반입배송료
  inboundCourierCd?: string; // 반입 택배사 — COURIER
  inboundTrackingNo?: string; // 반입 송장번호
  inboundDlivId?: string; // 반입 배송ID (od_dliv.)
  exchRecvNm?: string; // 교환 수령자명 (원 주문 배송지와 다를 경우)
  exchRecvPhone?: string; // 교환 수령자 연락처
  exchRecvZip?: string; // 교환 수령지 우편번호
  exchRecvAddr?: string; // 교환 수령지 기본주소
  exchRecvAddrDetail?: string; // 교환 수령지 상세주소
  exchRecvReqMemo?: string; // 교환 배송 요청사항
  exchangeShippingFee?: number; // 교환상품 발송배송료
  exchangeCourierCd?: string; // 교환상품 발송 택배사 — COURIER
  exchangeTrackingNo?: string; // 교환상품 발송 송장번호
  outboundDlivId?: string; // 교환상품 발송 배송ID (od_dliv.)
  totalShippingFee?: number; // 총 배송료 (수거+반입+발송)
  shippingFeePaidYn?: string; // 배송료 정산 완료 여부 Y/N
  shippingFeePaidDate?: string; // 배송료 정산일시
  shippingFeeMemo?: string; // 배송료 비고
  apprStatusCd?: string; // 결재상태 — APPR_STATUS_CD {REQ:결재요청, APPROVED:승인, REJECTED:반려, DONE:완료}
  apprStatusCdBefore?: string; // 변경 전 결재상태 — APPR_STATUS_CD
  apprAmt?: number; // 결재 요청금액
  apprTargetCd?: string; // 결재대상 구분 — APPR_TARGET_CD {ORDER:주문, PROD:상품, DLIV:배송, EXTRA:추가결제}
  apprTargetNm?: string; // 결재 대상명
  apprReason?: string; // 사유/메모
  apprReqUserId?: string; // 결재 요청자 (sy_user.user_id)
  apprReqDate?: string; // 결재 요청일시
  apprAprvUserId?: string; // 결재자 (sy_user.user_id)
  apprAprvDate?: string; // 결재일시
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  orderDate?: string; // 주문일시 (od_order 조인)
  orderStatusCd?: string; // 주문상태 (od_order 조인) — ORDER_STATUS_CD {PENDING:입금대기, PAID:결제완료, PREPARI…
  payMethodCd?: string; // 결제수단 (od_order 조인) — PAY_METHOD {BANK_TRANSFER:무통장입금, VBANK:가상계좌, TOSS…
  recvNm?: string; // 수령자명 (od_order 조인)
  recvPhone?: string; // 수령자연락처 (od_order 조인)
  recvAddr?: string; // 수령자주소 (od_order 조인)
  memberEmail?: string; // 회원 이메일 (mb_member 조인)
  memberPhoneOrigin?: string; // 회원 연락처 (mb_member 조인)
  claimTypeCdNm?: string; // 클레임유형 코드 라벨
  claimStatusCdNm?: string; // 클레임상태 코드 라벨
  refundMethodCdNm?: string; // 환불수단 코드 라벨
  refundBankCdNm?: string; // 환불은행 코드 라벨
  returnCourierCdNm?: string; // 수거택배사 코드 라벨
  returnStatusCdNm?: string; // 수거상태 코드 라벨
  inboundCourierCdNm?: string; // 반입택배사 코드 라벨
  exchangeCourierCdNm?: string; // 교환발송택배사 코드 라벨
  apprStatusCdNm?: string; // 결재상태 코드 라벨
  apprTargetCdNm?: string; // 결재대상 코드 라벨
  claimItemCnt?: number; // 클레임항목 수 (상관 서브쿼리 집계)
}
