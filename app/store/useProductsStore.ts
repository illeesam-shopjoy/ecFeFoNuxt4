/**
 * 상품 목록·필터 Pinia 스토어.
 * 전체 상품은 /api/fo/ec/pd/prod/page 에서 axiosCsr 로 로드.
 * SSR 필요 페이지(shop, prod-dtl/[id])는 useAsyncData + axiosSsr 를 직접 사용.
 */
import { defineStore } from "pinia";
import { type PdProductType } from "~/types/pdProductType";
import { pdProductSvc } from "~/svc/fo/ec/pd/pdProductSvc";

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [] as PdProductType[], // 전체 상품 목록 (원본)
    filterProducts: [] as PdProductType[], // 필터/정렬 적용된 목록
    priceRange: [0, 500000] as [number, number],
    activeCls: "" as string,
    loaded: false, // 최초 로드 여부
  }),

  actions: {
    /** /api/fo/ec/pd/prod/page 에서 상품 목록 로드 (CSR 초기 진입 시) */
    async loadStProducts() {
      if (this.loaded) return;
      try {
        const data = await pdProductSvc.getPage();
        // 2026-09-13 방어코드: API 응답이 배열이 아닌 형태(예: 래핑된 객체)로 오면
        // 이후 store.products.forEach/.map 등에서 즉시 크래시하므로 방어.
        this.products = Array.isArray(data) ? data : [];
        this.filterProducts = this.products;
        this.loaded = true;
      } catch (err) {
        console.error("[useProducts] 상품 로드 실패:", err);
      }
    },

    /** SSR에서 미리 불러온 데이터를 스토어에 주입 */
    setStHydrate(data: PdProductType[]) {
      // 2026-09-13 방어코드: 위 loadStProducts와 동일한 이유.
      this.products = Array.isArray(data) ? data : [];
      this.filterProducts = this.products;
      this.loaded = true;
    },

    handleStParentCategory(value: string) {
      this.filterProducts = this.products.filter((p) => (p.parentCategory?.categoryId ?? String(p.parentCategory?.categoryId)) === value);
      this.activeCls = value;
    },

    handleStCategory(value: string) {
      this.filterProducts = this.products.filter((p) => (p.category?.categoryId ?? String(p.category?.categoryId))?.toLowerCase() === value.toLowerCase());
      this.activeCls = value;
    },

    onChangeRange(value: [number, number]) {
      this.priceRange = value;
    },

    getStFilterPrice() {
      if (this.priceRange.length) {
        this.filterProducts = this.products.filter((p) => p.salePrice >= this.priceRange[0] && p.salePrice <= this.priceRange[1]);
      }
    },

    handleStSize(size: string) {
      this.filterProducts = this.products.filter((p) => p.optionSizes?.some((opt) => (opt.optionCode ?? String(opt.optionId)) === size));
      this.activeCls = size;
    },

    handleStColor(color: string) {
      this.filterProducts = this.products.filter((p) => p.optionColors?.some((opt) => (opt.optionCode ?? String(opt.optionId)) === color));
      this.activeCls = color;
    },

    /** 2026-09-13 추가: 헤더 검색창(SearchModal)에서 Enter/검색 클릭 시 상품명으로 필터링 */
    handleStSearch(keyword: string) {
      const kw = keyword.trim().toLowerCase();
      this.filterProducts = kw ? this.products.filter((p) => p.prodNm?.toLowerCase().includes(kw)) : this.products;
      this.activeCls = "";
    },

    handleStBrand(brand: string) {
      this.filterProducts = this.products.filter((p) => (p.brand?.brandCode ?? String(p.brand?.brandId))?.toLowerCase() === brand.toLowerCase());
      this.activeCls = brand;
    },

    handleStSelectFiltering(value: string) {
      switch (value) {
        case "Default Sorting":
          return (this.filterProducts = this.products);
        case "Sort By Trending":
          return (this.filterProducts = this.products.filter((p) => p.trending));
        case "Short By BestSeller":
          return (this.filterProducts = this.products.filter((p) => p.isBest));
        case "Price High To Low":
          return (this.filterProducts = this.products.slice().sort((a, b) => b.salePrice - a.salePrice));
        case "Price Low To High":
          return (this.filterProducts = this.products.slice().sort((a, b) => a.salePrice - b.salePrice));
        default:
          return (this.filterProducts = this.products);
      }
    },

    handleStResetFilter() {
      this.filterProducts = this.products;
      this.activeCls = "";
      this.priceRange = [0, 500000];
    },
  },

  getters: {
    getStRelatedProducts(state) {
      return (categoryId: string, prodId: string) => state.products.filter((p) => p.category?.categoryId === categoryId && p.prodId !== prodId).slice(0, 4);
    },
  },
});
