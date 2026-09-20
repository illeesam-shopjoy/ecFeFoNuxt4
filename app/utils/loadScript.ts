/** 외부 스크립트를 한 번만 불러온다(이미 추가돼 있으면 바로 완료). 브라우저 전용 */
export function loadScriptOnce(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("인증 SDK 스크립트를 불러오지 못했습니다. 네트워크를 확인해 주세요."));
    document.head.appendChild(script);
  });
}
