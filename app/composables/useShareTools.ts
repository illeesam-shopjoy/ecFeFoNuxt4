/**
 * useShareTools.ts — 링크복사 / 카카오톡 공유 / PDF 다운로드.
 * 2026-09-15(요청사항: "링크복사, 카카오공유하기, PDF다운로드 기능 추가하고 싶어 2번째
 * 이미지 최상단처럼") — ecFeBo(components/layout/foAppHeader.js의 handleCopyLink/
 * handleShareKakao/handleExportPdf, lib/utils/coUtil.js의 cofExportPdf)에 있던 헤더
 * 최상단 고정 아이콘 3종을 Outstock에 포팅.
 *
 * PDF: 한글을 jsPDF 자체 폰트로 그리면 CJK 미지원이라 깨지므로, ecFeBo와 동일하게
 * html2canvas로 화면을 이미지화한 뒤 그 이미지를 jsPDF에 얹는 방식을 쓴다. 각주에
 * "URL 정보 로그인사용자정보가 마킹되[게]"(요청사항) — 페이지 URL, 생성일시, 로그인
 * 사용자(마스킹), 파일명을 찍고, 유출 추적용으로 아주 옅은 대각선 워터마크를 반복 배치한다.
 */
import { ref } from "vue";
import { useAuthStore } from "~/store/useAuthStore";
import { CDN_URL } from "~/conts/baseConst";

const KAKAO_SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

declare global {
  interface Window {
    Kakao?: {
      init: (jsKey: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (opts: {
          objectType: string;
          content: { title: string; description?: string; imageUrl?: string; link: { mobileWebUrl: string; webUrl: string } };
          buttons?: { title: string; link: { mobileWebUrl: string; webUrl: string } }[];
        }) => void;
      };
    };
  }
}

function loadKakaoSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Kakao) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${KAKAO_SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("카카오 SDK를 불러오지 못했습니다.")));
      return;
    }
    const s = document.createElement("script");
    s.src = KAKAO_SDK_SRC;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("카카오 SDK를 불러오지 못했습니다."));
    document.head.appendChild(s);
  });
}

/** 이름은 단어별 앞 2자만 노출 + 나머지 *, ID는 앞4자:::뒤6자 (ecFeBo coUtil.cofExportPdf와 동일 규칙) */
function maskName(nm: string | undefined | null): string {
  if (!nm) return "-";
  return nm
    .split(/\s+/)
    .map((w) => (w.length <= 2 ? w : w.slice(0, 2) + "*".repeat(w.length - 2)))
    .join(" ");
}
function maskId(id: string | undefined | null): string {
  const s = String(id ?? "");
  return s.length > 10 ? `${s.slice(0, 4)}:::${s.slice(-6)}` : s;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function useShareTools() {
  const authStore = useAuthStore();
  const pdfExporting = ref(false);

  function currentUrl(): string {
    return window.location.href;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      await useAlert().openAlert("링크가 복사되었습니다.");
    } catch {
      await useAlert().openAlert("링크 복사에 실패했습니다.");
    }
  }

  async function shareKakao() {
    const config = useRuntimeConfig();
    // 카카오 로그인/지도와 동일한 공개 JavaScript 키를 그대로 재사용(ecFeBo와 동일 방식).
    const jsKey = config.public.kakaoMapKey as string;
    if (!jsKey) {
      await useAlert().openAlert("카카오 공유 설정(JavaScript 키)이 없습니다.");
      return;
    }
    try {
      await loadKakaoSdk();
      const Kakao = window.Kakao!;
      if (!Kakao.isInitialized()) Kakao.init(jsKey);
      const url = currentUrl();
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: document.title || "Outstock",
          description: "",
          imageUrl: `${CDN_URL}/cdn/prod/img/logo/logo.png`,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [{ title: "자세히 보기", link: { mobileWebUrl: url, webUrl: url } }],
      });
    } catch (e) {
      await useAlert().openAlert(e instanceof Error ? e.message : "카카오톡 공유를 열 수 없습니다.");
    }
  }

  /** 임의의 주소를 카카오톡으로 공유한다(선물 링크 등) */
  async function shareKakaoUrl(o: { title: string; description?: string; url: string; imageUrl?: string; buttonTitle?: string }) {
    const jsKey = useRuntimeConfig().public.kakaoMapKey as string;
    if (!jsKey) {
      await useAlert().openAlert("카카오 공유 설정(JavaScript 키)이 없습니다.");
      return;
    }
    try {
      await loadKakaoSdk();
      const Kakao = window.Kakao!;
      if (!Kakao.isInitialized()) Kakao.init(jsKey);
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: { title: o.title, description: o.description ?? "", imageUrl: o.imageUrl ?? `${CDN_URL}/cdn/prod/img/logo/logo.png`, link: { mobileWebUrl: o.url, webUrl: o.url } },
        buttons: [{ title: o.buttonTitle ?? "자세히 보기", link: { mobileWebUrl: o.url, webUrl: o.url } }],
      });
    } catch (e) {
      await useAlert().openAlert(e instanceof Error ? e.message : "카카오톡 공유를 열 수 없습니다.");
    }
  }

  async function exportPdf() {
    if (pdfExporting.value) return;
    pdfExporting.value = true;
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

      const el = document.body;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 8;
      const pageW = 210 - margin * 2;
      const pageH = 297 - margin * 2;
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;

      const now = new Date();
      const generatedAt = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
      const outFilename = `${(document.title || "화면").replace(/[\\/:*?"<>|]/g, "_")}_${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}.pdf`;
      const pageUrl = currentUrl();

      let heightLeft = imgH;
      let y = margin;
      pdf.addImage(imgData, "PNG", margin, y, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        y = margin - (imgH - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, y, imgW, imgH);
        heightLeft -= pageH;
      }

      // 각주(파일명·URL·생성일시·로그인 사용자) — 한글이 섞여 jsPDF 기본폰트로 못 그리므로
      // 숨김 DOM을 html2canvas로 캡처한 이미지를 찍는다(본문과 동일한 이유).
      const user = authStore.user;
      const userLine = user ? `이름: ${maskName(user.userNm)} #${maskId(user.memberId)}` : "";
      const footerDiv = document.createElement("div");
      footerDiv.style.cssText =
        "position:fixed;left:-9999px;top:0;width:700px;background:#ffffff;color:#c2c2c2;font-size:9px;line-height:1.5;font-family:sans-serif;word-break:break-all;padding:2px;";
      footerDiv.innerHTML = `URL: ${pageUrl}<br>Generated: ${generatedAt}` + (userLine ? ` · ${userLine}` : "") + ` · File: ${outFilename}`;
      document.body.appendChild(footerDiv);
      let footerImgData: string | null = null;
      let footerImgW = 0;
      let footerImgH = 0;
      try {
        const footerCanvas = await html2canvas(footerDiv, { scale: 2, backgroundColor: "#ffffff" });
        footerImgData = footerCanvas.toDataURL("image/png");
        footerImgW = pageW;
        footerImgH = (footerCanvas.height * footerImgW) / footerCanvas.width;
      } finally {
        footerDiv.remove();
      }

      const totalPages = pdf.getNumberOfPages();
      const footerBottomInset = 3;
      const footerY = 297 - footerBottomInset - footerImgH;
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        // 유출 추적용 워터마크 — 아주 옅게(opacity 0.018) 대각선 4곳에 타일링.
        // GState 미지원 환경이면 조용히 생략(본문/각주는 정상 출력).
        try {
          pdf.saveGraphicsState();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pdf.setGState(new (pdf as any).GState({ opacity: 0.018 }));
          pdf.setFontSize(64);
          pdf.setTextColor(120, 120, 120);
          const wmPositions: [number, number][] = [
            [60, 90],
            [150, 90],
            [60, 210],
            [150, 210],
          ];
          wmPositions.forEach(([wx, wy]) => {
            pdf.text("Outstock", wx, wy, { angle: 45, align: "center" });
          });
          pdf.restoreGraphicsState();
        } catch {
          /** GState 미지원 시 워터마크만 생략 */
        }
        if (footerImgData) pdf.addImage(footerImgData, "PNG", margin, footerY, footerImgW, footerImgH);
        pdf.setFontSize(6);
        pdf.setTextColor(190, 190, 190);
        pdf.text(`Page ${p} / ${totalPages}`, margin + pageW, footerY + footerImgH, { align: "right" });
      }
      pdf.save(outFilename);
    } catch (e) {
      console.error("[useShareTools.exportPdf]", e);
      await useAlert().openAlert("PDF 생성에 실패했습니다.");
    } finally {
      pdfExporting.value = false;
    }
  }

  return { copyLink, shareKakao, shareKakaoUrl, exportPdf, pdfExporting };
}
