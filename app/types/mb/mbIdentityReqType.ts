/** 포트원 V2 본인인증 SDK(window.PortOne) 에서 이 앱이 쓰는 부분 — pages/checkout */
export interface MbPortOneType {
  requestIdentityVerification: (o: {
    storeId: string;
    identityVerificationId: string;
    channelKey: string;
    customer?: { fullName?: string; phoneNumber?: string };
    redirectUrl?: string;
  }) => Promise<{ code?: string; message?: string; identityVerificationId?: string } | undefined>;
}
