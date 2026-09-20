import type { SyAttachType } from "~/types/sy/syAttachType";

/** 업로드 응답의 파일 1건 — sy_attach 컬럼(SyAttachType) 일부 + 응답 전용 originalName/filePath. */
export type SyUploadedFileType = Pick<SyAttachType, "attachId" | "fileExt" | "fileSize" | "cdnImgUrl" | "thumbCdnUrl" | "storagePath" | "thumbGeneratedYn"> & { originalName: string; filePath?: string };

/** 다중 업로드 응답(POST /co/cm/upload/multi). */
export interface SyUploadMultiResultType {
  attachIds?: string[];
  files?: SyUploadedFileType[];
  uploadedCount?: number;
  failedCount?: number;
  failedFiles?: string[];
}
