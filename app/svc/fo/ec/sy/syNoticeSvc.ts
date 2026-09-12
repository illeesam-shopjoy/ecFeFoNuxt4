/**
 * syNoticeSvc.ts — 공지사항/첨부 API 호출 객체.
 * 2026-09-12(요청사항: "api url 을 직접호출하지말고 api url 호출 객체를 만들고 연결시켜줘" +
 * "svc/fo/~~~~ 이런식으로 경로에 맞게 구조폴더로 정리해줘") —
 * adminSy/notices/index.vue·[id].vue가 각자 "/api/fo/ec/sy/notice...", "/api/fo/ec/sy/attach..."
 * 문자열을 $fetch에 박아 호출하던 걸 한 곳으로 모음(쿼리스트링 조립도 포함). 전부 로그인
 * 필요(FoSyNoticeController/FoSyAttachController, FO_ONLY)라 useAuthHeaders()를 여기서
 * 붙인다. 폴더 위치(svc/fo/ec/sy/)는 실제 라우트 경로(server/api/fo/ec/sy/*)를 그대로 따른다.
 * ⚠ ecBeBo 실제 백엔드 URL은 여전히 /api/fo/sy/notice, /api/fo/sy/attach("ec" 없음,
 * FoSyNoticeController/FoSyAttachController)라 로컬 경로와 더 이상 1:1이 아니다(사용자가
 * 이 불일치를 인지하고 명시적으로 선택함, 2026-09-12) — beApi 호출 대상 문자열은 안 바뀜.
 */
import { useAuthHeaders } from "~/composables/useAuthHeaders";

export type SyNoticeRow = {
  noticeId: string;
  noticeTitle: string;
  noticeType: string;
  noticeContent?: string;
  status: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
};

export type SyAttachRow = {
  attachId: string;
  fileNm: string;
  physicalNm: string;
  ext: string;
  fileSize?: number;
  mimeType?: string;
  url: string;
  sortOrder: number;
};

export interface SyNoticePageParams {
  pageNo: number;
  pageSize: number;
  noticeTitle?: string;
  noticeType?: string;
  status?: string;
}

export interface SyNoticeWriteBody {
  noticeTitle: string;
  noticeType: string;
  noticeContent?: string;
  status: string;
  remark?: string;
}

export const syNoticeSvc = {
  /** GET /api/fo/ec/sy/notice/page — 공지 목록(페이지) */
  getPage: (params: SyNoticePageParams) => {
    const q = new URLSearchParams();
    q.set("pageNo", String(params.pageNo));
    q.set("pageSize", String(params.pageSize));
    if (params.noticeTitle) q.set("noticeTitle", params.noticeTitle);
    if (params.noticeType) q.set("noticeType", params.noticeType);
    if (params.status) q.set("status", params.status);
    return $fetch<{ list: SyNoticeRow[]; totalCount: number }>(`/api/fo/ec/sy/notice/page?${q}`, { headers: useAuthHeaders() });
  },

  /** GET /api/fo/ec/sy/notice/{id} — 공지 단건 */
  getById: (noticeId: string) => $fetch<SyNoticeRow>(`/api/fo/ec/sy/notice/${noticeId}`, { headers: useAuthHeaders() }),

  /** POST /api/fo/ec/sy/notice — 공지 등록 */
  create: (body: SyNoticeWriteBody) =>
    $fetch<{ noticeId: string }>("/api/fo/ec/sy/notice", { method: "POST", body, headers: useAuthHeaders() }),

  /** PUT /api/fo/ec/sy/notice/{id} — 공지 수정 */
  update: (noticeId: string, body: SyNoticeWriteBody) =>
    // 2026-09-12: $fetch에 제네릭(<void>)을 안 주면 동적 세그먼트(${noticeId}) 템플릿 리터럴이
    // Nitro의 라우트별 타입 추론에 걸려 method를 "GET"만 허용하는 오버로드로 좁혀져 타입에러가
    // 난다(PUT/DELETE 전부 동일 증상) — 명시적 제네릭을 주면 일반 오버로드로 빠져 정상 동작.
    $fetch<void>(`/api/fo/ec/sy/notice/${noticeId}`, { method: "PUT", body, headers: useAuthHeaders() }),

  /** DELETE /api/fo/ec/sy/notice/{id} — 공지 삭제 */
  remove: (noticeId: string) =>
    $fetch<void>(`/api/fo/ec/sy/notice/${noticeId}`, { method: "DELETE", headers: useAuthHeaders() }),

  /** GET /api/fo/ec/sy/notice/{id}/attachments — 공지 첨부 목록 */
  getAttachments: (noticeId: string) =>
    $fetch<{ list: SyAttachRow[] }>(`/api/fo/ec/sy/notice/${noticeId}/attachments`, { headers: useAuthHeaders() }),

  /** POST /api/fo/ec/sy/notice/{id}/attachments — 공지 첨부 업로드(멀티파트) */
  uploadAttachments: (noticeId: string, formData: FormData) =>
    $fetch<void>(`/api/fo/ec/sy/notice/${noticeId}/attachments`, { method: "POST", body: formData, headers: useAuthHeaders() }),

  /** DELETE /api/fo/ec/sy/attach/{id} — 첨부 삭제 */
  removeAttachment: (attachId: string) =>
    $fetch<void>(`/api/fo/ec/sy/attach/${attachId}`, { method: "DELETE", headers: useAuthHeaders() }),
};
