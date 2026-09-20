/** mapUpload.ts — 업로드 요청 본문(FormData) 조립 (svc 는 전송만). */
export function buildUploadForm(files: File[], businessCode: string): FormData {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  fd.append("businessCode", businessCode);
  return fd;
}
