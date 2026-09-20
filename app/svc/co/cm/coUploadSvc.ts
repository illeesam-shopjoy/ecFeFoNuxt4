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
  uploadMulti: async (files: File[], businessCode: string, onProgress?: (percent: number) => void): Promise<UploadMultiResult> => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    fd.append("businessCode", businessCode);
    // 동영상(최대 100MB)까지 올릴 수 있어 타임아웃을 넉넉히 둔다(서버 mp4 변환 시간 포함) — 진행률은 onProgress(0~100)
    return (
      (
        await axiosCsr.post<UploadMultiResult>("/co/cm/upload/multi", fd, {
          timeout: 600000,
          onUploadProgress: (e) => {
            if (onProgress && e.total) onProgress(Math.min(100, Math.round((e.loaded * 100) / e.total)));
          },
        })
      ).data ?? {}
    );
  },
  /** DELETE /co/cm/upload/attach/{attachId} — 미연계 업로드 파일 즉시 삭제 */
  deleteAttach: async (attachId: string): Promise<void> => {
    await axiosCsr.delete(`/co/cm/upload/attach/${encodeURIComponent(attachId)}`);
  },
};
