import { beApi, authHeaderFrom } from "~~/server/utils/beApi";
import { resolveProdCdnUrl } from "~~/server/utils/cdn";
import { logger } from "~~/server/utils/logger";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "mp4", "webm", "avi", "mov", "mkv", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "hwp", "txt", "csv", "zip", "rar", "7z"]);

function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

interface CfUploadResponse {
  fileId: string;
  origFileNm: string;
  mediaTypeCd: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string | null;
}

/**
 * 공지 첨부파일 업로드. 2단계로 처리한다 (2026-09 BFF 전환, ecBeCdn CfUploadController 확인):
 *   1) 파일 바이트를 ecBeCdn `POST /api/cdn/upload`로 전달 — 이 엔드포인트는 permitAll이라
 *      인증 없이도 된다("EcBeBo가 파일을 받아 EcBeCdn에 업로드 요청"하는 프록시 구조를
 *      그대로 이 BFF가 대신 수행).
 *   2) 업로드로 받은 fileUrl 등을 ecBeBo `POST /api/base/sy/attach`에 메타데이터로 등록
 *      (refTableNm=sy_notice, refId=공지ID) — 이 단계는 로그인 필요(401 확인함, 2026-09).
 *      관리자 로그인을 ecBeBo로 브릿지하기 전까지는 1)은 성공해도 2)에서 막힌다.
 */
export default defineEventHandler(async (event) => {
  const method = event.method;
  const url = getRequestURL(event)?.pathname ?? "";
  logger.info("[api] ▶", method, url);

  const noticeId = getRouterParam(event, "id");
  if (!noticeId) throw createError({ statusCode: 400, statusMessage: "잘못된 공지 ID입니다." });

  const parts = await readMultipartFormData(event);
  if (!parts?.length) throw createError({ statusCode: 400, statusMessage: "첨부 파일이 없습니다." });

  const uploaded: { attachId: string; url: string; fileNm: string }[] = [];

  for (const part of parts) {
    if (!part.data || !part.filename) continue;
    const ext = getExt(part.filename);
    if (!ALLOWED_EXT.has(ext)) continue;
    if (part.data.length > MAX_FILE_SIZE) continue;

    // 1) ecBeCdn에 실제 파일 업로드
    const cdnForm = new FormData();
    cdnForm.append("file", new Blob([new Uint8Array(part.data)], { type: part.type ?? "application/octet-stream" }), part.filename);
    const cdnRes = await beApi.post<CfUploadResponse>("/cdn/upload", cdnForm).catch((e: unknown) => {
      logger.error("[api]", url, "ecBeCdn 업로드 실패:", (e as Error)?.message);
      throw createError({ statusCode: 502, statusMessage: "파일 업로드 서버(ecBeCdn)에 연결할 수 없습니다." });
    });
    const fileUrl = resolveProdCdnUrl(cdnRes.fileUrl) ?? "";

    // 2) ecBeBo sy_attach에 메타데이터 등록 (관리자 로그인 필요 — 위 주석 참조)
    const attach = await beApi.post<{ attachId: string }>(
      "/base/sy/attach",
      {
        refTableNm: "sy_notice",
        refId: noticeId,
        fileNm: part.filename,
        fileSize: part.data.length,
        fileExt: ext,
        mimeTypeCd: part.type ?? "",
        attachUrl: fileUrl,
        cdnImgUrl: fileUrl,
      },
      authHeaderFrom(event),
    );
    uploaded.push({ attachId: attach.attachId, url: fileUrl, fileNm: part.filename });
  }

  logger.info("[api] ◀", method, url, "uploaded=" + uploaded.length);
  return { uploaded };
});
