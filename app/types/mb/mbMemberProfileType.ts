import type { MbMemberType } from "~/types/mb/mbMemberType";

/** 내 정보 수정 화면이 쓰는 회원 필드(mb_member 중 일부) */
export type MbMemberProfileType = Pick<MbMemberType, "passVerifiedYn" | "passVerifiedDate" | "profileImgUrl" | "recvPhoneYn" | "recvKakaoYn" | "recvSmsYn" | "recvEmailYn" | "recvAdYn" | "recvMktEventYn" | "recvMktPlanYn"> & Required<Pick<MbMemberType, "memberId" | "loginId" | "memberNm" | "memberEmail" | "memberPhone" | "memberGender" | "birthDate" | "memberZipCode" | "memberAddr" | "memberAddrDetail">>;
