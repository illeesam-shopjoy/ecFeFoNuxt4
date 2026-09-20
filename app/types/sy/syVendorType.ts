/** 판매/배송 업체. 필드명은 ecBeBo(JPA) SyVendorDto.Item(sy_vendor) 기준 — 서버가 내려주는 값을 그대로 담는다(대부분 optional). */
export interface SyVendorType {
  vendorId: string; // 판매/배송업체ID (YYMMDDhhmmss+rand4)
  vendorNo?: string; // 판매/배송업체등록번호
  corpNo?: string; // 법인등록번호 (선택)
  vendorNm?: string; // 상호 / 회사명
  vendorNmEn?: string; // 영문 상호
  ceoNm?: string; // 대표자명
  vendorTypeCd?: string; // 업태
  vendorTypeCdNm?: string; // 업태 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  vendorItem?: string; // 종목
  vendorClassCd?: string; // 판매/배송업체구분 — VENDOR_CLASS_CD {INDIVIDUAL:개인사업자, CORPORATION:법인사업자, TAX_…
  vendorClassCdNm?: string; // 코드 라벨
  vendorZipCode?: string; // 우편번호
  vendorAddr?: string; // 주소
  vendorAddrDetail?: string; // 상세주소
  vendorPhone?: string; // 대표 전화
  vendorFax?: string; // 팩스
  vendorEmail?: string; // 대표 이메일
  vendorHomepage?: string; // 홈페이지
  vendorBankNm?: string; // 은행명
  vendorBankAccount?: string; // 계좌번호
  vendorBankHolder?: string; // 예금주
  vendorRegUrl?: string; // 판매/배송업체등록증 첨부 URL
  openDate?: string; // 개업일자
  contractDate?: string; // 계약일자
  vendorStatusCd?: string; // 상태 — VENDOR_STATUS_CD {ACTIVE:활성, INACTIVE:비활성}
  vendorStatusCdNm?: string; // 코드 라벨
  pathId?: string; // 점(.) 구분 표시경로
  vendorRemark?: string; // 비고 (HTML 에디터)
  regDate?: string; // 등록일
  updDate?: string; // 수정일
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}
