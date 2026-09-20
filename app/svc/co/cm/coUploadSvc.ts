/**
 * coUploadSvc — 공통 파일 업로드 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo CmUploadMultiController(/api/co/cm/upload/multi, /api/co/** permitAll).
 * 업로드는 항상 "미연계" 상태로 이뤄지고, 실제 연계(sy_attach ref)는 부모 저장 요청의 attachFiles({attachId,rowStatus:'I'}) 로 반영된다.
 */
import { axiosCsr } from "~/utils/axiosCsr";

export interface UploadedFile {
  attachId: string;
  originalName: string;
  fileSize: number;
  fileExt: string;
  filePath?: string;
  cdnImgUrl?: string;
  thumbCdnUrl?: string;
}
export interface UploadMultiResult {
  attachIds?: string[];
  files?: UploadedFile[];
  uploadedCount?: number;
  failedCount?: number;
  failedFiles?: string[];
}

export const coUploadSvc = {
  /** POST /co/cm/upload/multi — 다중 업로드 (businessCode: 업로드 분류) */
  uploadMulti: async (files: File[], businessCode: string): Promise<UploadMultiResult> => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    fd.append("businessCode", businessCode);
    return (await axiosCsr.post<UploadMultiResult>("/co/cm/upload/multi", fd, { timeout: 60000 })).data ?? {};
  },
  /** DELETE /co/cm/upload/attach/{attachId} — 미연계 업로드 파일 즉시 삭제 */
  deleteAttach: async (attachId: string): Promise<void> => {
    await axiosCsr.delete(`/co/cm/upload/attach/${encodeURIComponent(attachId)}`);
  },
};
