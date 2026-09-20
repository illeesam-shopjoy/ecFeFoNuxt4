/** 첨부파일(sy_attach) — 화면용. 필드명은 ecBeBo AttachFile 기준이고 url 은 브라우저에서 열 수 있게 보정한 CDN 주소다. */
export interface SyAttachType {
  attachId: string; // 첨부ID
  fileNm: string; // 원본 파일명
  fileExt: string; // 확장자(소문자, 동영상은 mp4 로 변환되어 저장됨)
  fileSize: number; // 바이트
  url: string; // 열기/재생용 CDN URL
  thumbUrl?: string; // 썸네일 URL(이미지·동영상)
}
