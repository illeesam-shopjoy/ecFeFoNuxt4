/** 찜(좋아요). 필드명은 ecBeBo(JPA) MbLikeDto.Item(mb_like) 기준 — 서버가 내려주는 값을 그대로 담는다. */
import type { PdProdRawType } from "~/types/pd/pdProdRawType";

export type MbLikeTargetTypeCd = "PRODUCT" | "BLOG" | "EVENT";

export interface MbLikeType {
  likeId: string; // 좋아요ID
  memberId?: string; // 회원ID (mb_member.member_id)
  targetTypeCd?: MbLikeTargetTypeCd; // 대상유형 — LIKE_TARGET_TYPE (PRODUCT/BLOG/EVENT)
  targetId: string; // 대상ID
  regDate?: string; // 등록일시
  siteId?: string; // 사이트ID
  prod?: PdProdRawType | null; // 찜 대상 상품 단건 (PRODUCT 일 때 서버가 채움)
}

/** POST /fo/ec/mb/like/{targetTypeCd}/{targetId} 응답 */
export interface MbLikeToggleResType {
  liked: boolean;
}
