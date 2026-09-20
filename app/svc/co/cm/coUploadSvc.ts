/**
 * coUploadSvc — 공통 파일 업로드 API 호출 객체 (CSR: 브라우저 → ecBeBo 직접 호출, axiosCsr).
 * ecBeBo CmUploadMultiController(/api/co/cm/upload/multi, /api/co/** permitAll).
 * 업로드는 항상 "미연계" 상태로 이뤄지고, 실제 연계(sy_attach ref)는 부모 저장 요청의 attachFiles({attachId,rowStatus:'I'}) 로 반영된다.
 */
import { axiosCsr } from "~/utils/axiosCsr";
import type { SyUploadMultiResultType } from "~/types/sy/syUploadResultType";

export const coUploadSvc = {
  /** POST /co/cm/upload/multi — 다중 업로드 (businessCode: 업로드 분류, onProgress: 0~100). 동영상(100MB)까지 올리므로 타임아웃을 넉넉히 둔다 */
  uploadMulti: async (files: File[], businessCode: string, onProgress?: (percent: number) => void): Promise<SyUploadMultiResultType> => {
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    fd.append("businessCode", businessCode);
    const res = await axiosCsr.post<SyUploadMultiResultType>("/co/cm/upload/multi", fd, {
      timeout: 600000,
      onUploadProgress: (e) => e.total && onProgress?.(Math.min(100, Math.round((e.loaded * 100) / e.total))),
    });
    return res.data ?? {};
  },

  /** DELETE /co/cm/upload/attach/{attachId} — 미연계 업로드 파일 즉시 삭제 */
  deleteAttach: async (attachId: string): Promise<void> => {
    await axiosCsr.delete(`/co/cm/upload/attach/${encodeURIComponent(attachId)}`);
  },
};
