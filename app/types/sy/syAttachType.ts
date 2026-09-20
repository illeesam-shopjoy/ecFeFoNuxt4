/**
 * 첨부파일 sy_attach. 필드명은 테이블 컬럼(camelCase)·ecBeBo AttachFile/SyAttachDto 기준.
 * 조회 응답(AttachFile)이 채워주는 값은 attachId~sortOrd 까지이고, 그 아래 컬럼은 업로드 응답/관리용이라 옵셔널이다.
 * ⚠ cdnImgUrl/thumbCdnUrl 은 utils/mapProduct.mapAttachFiles 가 서버 내부 호스트(host.docker.internal 등)를 실제 CDN origin 으로 보정한 "브라우저에서 열 수 있는" 절대 URL 이다.
 */
export interface SyAttachType {
  attachId: string; // 첨부파일 ID (YYMMDDhhmmss+random(4)+seq)
  refTableNm?: string; // 관련 테이블명 (예: pd_review, pd_prod_qna) — ref_id 와 조합해 대상 레코드를 식별
  refId?: string; // 관련 ID
  fileNm: string; // 원본 파일명
  fileExt: string; // 확장자(소문자, 동영상은 mp4 로 변환되어 저장됨)
  fileSize: number; // 바이트
  mimeTypeCd?: string; // MIME 타입
  mimeTypeCdNm?: string; // MIME 타입 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  storedNm?: string; // 저장된 파일명
  storageTypeCd?: string; // 스토리지 타입 (LOCAL/AWS_S3/NCP_OBS)
  storageTypeCdNm?: string; // 스토리지 타입 코드 라벨 (서버가 내려주면 그 값, 아니면 공통코드 sy_code 로 채운다)
  storagePath?: string; // 파일 저장 경로 (/cdn/{업무명}/YYYY/YYYYMM/YYYYMMDD/{파일명})
  attachUrl?: string; // 첨부 URL
  cdnHost?: string; // CDN 호스트
  cdnImgUrl?: string; // CDN 원본 URL(이미지·동영상·문서) — 열기/재생용
  thumbFileNm?: string; // 썸네일 파일명
  thumbStoredNm?: string; // 썸네일 저장 파일명
  thumbUrl?: string; // 썸네일 URL
  thumbCdnUrl?: string; // 썸네일 CDN URL
  thumbGeneratedYn?: string; // 썸네일 생성 여부 (Y/N)
  sortOrd?: number; // 정렬순서
  attachMemo?: string; // 첨부 메모
  regDate?: string; // 등록일시
  // ── 공통(감사) 컬럼 ──
  regBy?: string; // 등록자 (reg_by)
  regByNm?: string; // 등록자명 (reg_by_nm)
  updBy?: string; // 수정자 (upd_by)
  updByNm?: string; // 수정자명 (upd_by_nm)
  updDate?: string; // 수정일시 (upd_date)
  regSiteId?: string; // 등록 사이트ID (reg_site_id)
}

/** 서버(AttachFile) 원본 응답 — URL 보정 전 값이라 null 이 올 수 있다. utils/mapProduct.mapAttachFiles 가 SyAttachType 으로 바꾼다. */
export interface SyAttachFileType {
  attachId: string;
  fileNm?: string | null;
  fileExt?: string | null;
  fileSize?: number | null;
  attachUrl?: string | null;
  cdnImgUrl?: string | null;
  thumbCdnUrl?: string | null;
  thumbUrl?: string | null;
  refTableNm?: string | null;
  refId?: string | null;
  storagePath?: string | null;
  sortOrd?: number | null;
}
