/**
 * dpAreaSvc.ts — 전시 영역(dp_area) 활성 위젯 조회 API 호출 객체.
 *
 * 2026-09-13(요청사항: "이런것들 전시위젯 활용하여 적용할수 있을까?" → "전면 확대: 사이트 전체
 * 하드코딩 배너/슬라이더를 한번에 조사해서 전환") — home-4/home-5/home-7의 인라인 히어로
 * 슬라이더·후기, HomeHeroSlider.vue/HomeTwoHeroSlider.vue의 공유 슬라이더, ClientBrandSlider.vue의
 * 브랜드 로고처럼 하드코딩돼 있던 배열들을 dp_area/dp_panel/dp_panel_item(전시 위젯 시스템)에서
 * 읽어오도록 전환하며 신설. 로그인 불필요(공개 홈 화면용, FoDpAreaController).
 *
 * 각 위젯 인스턴스가 어떤 area_cd를 쓰는지는 각 소비 페이지의 주석 및
 * [[ecfefonuxt4-dp-widget-migration]] 메모리 참조.
 */
import { axiosSsr } from "~/utils/axiosSsr";

export interface DpAreaWidgetItem {
  panelItemId: string;
  panelId: string;
  widgetTypeCd?: string | null;
  widgetTitle?: string | null;
  widgetContent?: string | null;
  widgetConfigJson?: string | null;
  sortOrd?: number | null;
}

export const dpAreaSvc = {
  /** GET /api/fo/ec/dp/area/{areaCd} — 영역의 활성 위젯(패널항목) 목록, sort_ord 오름차순 */
  getActiveItems: (areaCd: string) =>
    axiosSsr.get<DpAreaWidgetItem[]>(`/api/fo/ec/dp/area/${encodeURIComponent(areaCd)}`).then((r) => r.data),

  /**
   * 영역의 첫 번째 활성 위젯의 widgetConfigJson 을 파싱해 반환 — 실패/빈값이면 null.
   * 각 페이지는 이 결과가 null 이면 기존 하드코딩 기본값(DEFAULT_*)으로 폴백한다.
   */
  async getFirstWidgetConfig<T>(areaCd: string): Promise<T | null> {
    try {
      const items = await dpAreaSvc.getActiveItems(areaCd);
      const raw = items?.[0]?.widgetConfigJson;
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
};
