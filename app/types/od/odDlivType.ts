/** 배송. 필드명은 ecBeBo(JPA) OdDlivDto.Item(od_dliv) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface OdDlivType {
  dlivId: string; // 배송ID (YYMMDDhhmmss+rand4)
  orderId?: string; // 주문ID (od_order.)
  vendorId?: string; // 출고 업체ID (벤더별 분리출고 시)
  dlivTypeCd?: string; // 배송유형 — DLIV_TYPE_CD {NORMAL:정상출고, RETURN:반품수거, EXCHANGE:교환수거, EXCHANGE…
  dlivTypeCdNm?: string; // 배송유형 코드 라벨
  dlivDivCd?: string; // 입출고구분 — DLIV_DIV_CD {OUTBOUND:출고, INBOUND:입고}
  dlivDivCdNm?: string; // 입출고구분 코드 라벨
  dlivStatusCd?: string; // 배송상태 — DLIV_STATUS {READY:준비중, SHIPPED:출고완료, IN_TRANSIT:배송중, DELIVERED…
  dlivStatusCdNm?: string; // 배송상태 코드 라벨
  dlivStatusCdBefore?: string; // 변경 전 배송상태 — DLIV_STATUS
  outboundCourierCd?: string; // 출고(발송) 택배사 — COURIER {CJ:CJ대한통운, LOTTE:롯데택배, HANJIN:한진택배 외}
  outboundCourierCdNm?: string; // 출고택배사 코드 라벨
  outboundTrackingNo?: string; // 출고(발송) 송장번호
  dlivShipDate?: string; // 출고일시
  dlivDate?: string; // 배송완료일시
  shippingFee?: number; // 배송료 (현재값)
  inboundCourierCd?: string; // 반입 택배사 (반품일 때만) — COURIER
  inboundCourierCdNm?: string; // 반입택배사 코드 라벨
  inboundTrackingNo?: string; // 반입 송장번호
  inboundDate?: string; // 반입 완료일시
  recvNm?: string; // 수령자명
  recvPhone?: string; // 수령자연락처
  recvZip?: string; // 우편번호
  recvAddr?: string; // 주소
  recvAddrDetail?: string; // 상세주소
  recvMemo?: string; // 배송메모
  dlivMemo?: string; // 메모 (HTML 에디터)
  regDate?: string; // 등록일
  siteId?: string; // 사이트ID
  updDate?: string; // 수정일
  memberNm?: string; // 주문자명 (od_order 조인)
  orderDate?: string; // 주문일시 (od_order 조인)
  orderStatusCd?: string; // 주문상태 (od_order 조인) — ORDER_STATUS_CD
  orderStatusCdNm?: string; // 주문상태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  vendorNm?: string; // 업체명 (sy_vendor 조인)
  vendorTel?: string; // 업체 연락처 (sy_vendor 조인)
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
