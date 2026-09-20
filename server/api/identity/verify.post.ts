/**
 * 본인인증(PASS) 결과 검증 — 포트원(PortOne) V2
 * 브라우저가 인증창(PASS)을 마치면 identityVerificationId 를 보낸다. 서버는 시크릿으로 포트원에서 그 건을 직접 조회해
 * status === "VERIFIED" 일 때만 인증 성공으로 인정한다(브라우저가 준 "성공" 표시는 믿지 않는다).
 * 응답에는 이름·휴대폰·생년월일만 담고 CI/DI 는 내려주지 않는다. proof 는 결과를 서버가 서명한 값(위변조 방지).
 * @see https://developers.portone.io/api/rest-v2/identityVerification
 */
import { createHmac } from "node:crypto";

interface PortOneIdv {
  status?: string;
  id?: string;
  verifiedCustomer?: { name?: string; phoneNumber?: string; birthDate?: string; gender?: string; isForeigner?: boolean };
  verifiedAt?: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const secret = String(config.portoneApiSecret ?? "");
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: "본인인증 API 시크릿(PORTONE_API_SECRET)이 설정되지 않았습니다." });
  }
  const body = (await readBody(event).catch(() => ({}))) as { identityVerificationId?: string };
  const id = String(body?.identityVerificationId ?? "").trim();
  if (!/^[A-Za-z0-9_\-]{6,100}$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: "identityVerificationId 가 올바르지 않습니다." });
  }

  const base = String(config.portoneApiBase).replace(/\/+$/, "");
  const res = await $fetch<PortOneIdv>(`${base}/identity-verifications/${encodeURIComponent(id)}`, {
    headers: { Authorization: `PortOne ${secret}` },
  }).catch((err: { statusCode?: number; data?: { message?: string } }) => {
    throw createError({ statusCode: err?.statusCode === 404 ? 404 : 502, statusMessage: err?.data?.message ?? "본인인증 결과를 조회하지 못했습니다." });
  });

  if (res.status !== "VERIFIED" || !res.verifiedCustomer?.name) {
    throw createError({ statusCode: 401, statusMessage: "본인인증이 완료되지 않았습니다." });
  }
  const c = res.verifiedCustomer;
  const out = {
    verified: true,
    identityVerificationId: id,
    name: String(c.name),
    phoneNumber: String(c.phoneNumber ?? "").replace(/\D/g, ""),
    birthDate: c.birthDate,
    gender: c.gender,
    isForeigner: c.isForeigner,
    verifiedAt: res.verifiedAt,
  };
  const proof = createHmac("sha256", secret).update(JSON.stringify([out.identityVerificationId, out.name, out.phoneNumber, out.birthDate ?? "", out.verifiedAt ?? ""])).digest("hex");
  return { ...out, proof };
});
