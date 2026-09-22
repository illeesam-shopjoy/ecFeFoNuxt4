/**
 * 장바구니 Pinia 스토어.
 * 담은 상품 목록, 수량, 합계를 관리하고 localStorage와 동기화합니다.
 */
import { defineStore } from "pinia";
import { type PdProdType } from "~/types/pd/pdProdType";
import { type OdCartItemType } from "~/types/od/odCartItemType";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cartProducts: [] as OdCartItemType[], // 장바구니에 담긴 상품 목록
    orderQuantity: 1 as number, // 주문 수량 (추가 시 적용)
    quantityCount: 0 as number, // 전체 수량 합계
    total: 0 as number, // 총 금액
  }),
  actions: {
    // 2026-09 추가 — 옵션상품(SKU) 지원: prodSkuId 가 다르면 같은 상품이라도 별도 줄로 담는다
    // (예: 같은 티셔츠의 빨강/파랑을 각각 다른 재고로 관리해야 하므로 수량을 합치면 안 됨).
    addStCartProduct(payload: PdProdType, prodSkuId?: string) {
      const isExist = this.cartProducts.some((i) => i.prodId === payload.prodId && i.selectedProdSkuId === prodSkuId);
      if (!isExist) {
        // 옵션 조합(SKU)에 추가금액이 있으면 단가에 더해 담는다
        const addPrice = Number(payload.prodSkus?.find((s) => s.prodSkuId === prodSkuId)?.addPrice ?? 0);
        const newItem: OdCartItemType = {
          ...payload,
          salePrice: payload.salePrice + addPrice,
          orderQuantity: 1,
          selectedProdSkuId: prodSkuId,
        };
        this.cartProducts.push(newItem);
        useNuxtApp().$toast.success(`${payload.prodNm} 장바구니에 추가됨`);
      } else {
        this.cartProducts.map((item) => {
          if (item.prodId === payload.prodId && item.selectedProdSkuId === prodSkuId) {
            if (typeof item.orderQuantity !== "undefined") {
              if (item.prodStock >= item.orderQuantity + this.orderQuantity) {
                item.orderQuantity = this.orderQuantity !== 1 ? this.orderQuantity + item.orderQuantity : item.orderQuantity + 1;
                useNuxtApp().$toast.success(`${this.orderQuantity}개 ${item.prodNm} 장바구니에 추가됨`);
              } else {
                useNuxtApp().$toast.error(`해당 상품의 재고가 없습니다.`);
                this.orderQuantity = 1;
              }
            }
          }
          return { ...item };
        });
      }
      localStorage.setItem("cart_products", JSON.stringify(this.cartProducts));
    },
    setStQuantityDecrement(payload: OdCartItemType) {
      // 해당 상품 수량 1 감소 (1 미만으로 내려가지 않음). selectedProdSkuId까지 일치해야
      // 같은 상품의 다른 옵션(SKU) 줄을 잘못 건드리지 않는다.
      this.cartProducts.map((item) => {
        if (item.prodId === payload.prodId && item.selectedProdSkuId === payload.selectedProdSkuId) {
          if (typeof item.orderQuantity !== "undefined") {
            if (item.orderQuantity > 1) {
              item.orderQuantity = item.orderQuantity - 1;
            }
          }
        }
        return { ...item };
      });
      localStorage.setItem("cart_products", JSON.stringify(this.cartProducts));
    },
    // remover_cart_products
    removerStCartProducts(payload: OdCartItemType) {
      this.cartProducts = this.cartProducts.filter((p) => !(p.prodId === payload.prodId && p.selectedProdSkuId === payload.selectedProdSkuId));
      // 2026-09-22(요청사항: "제거될때 toast 아이콘 빨강 대신 오렌지/분홍") — 제거는 오류가 아니라서 error() 대신 warning() 사용(색은 main.scss에서 핑크로 재정의)
      useNuxtApp().$toast.warning(`${payload.prodNm} 장바구니에서 제거됨`);
      localStorage.setItem("cart_products", JSON.stringify(this.cartProducts));
    },
    async clearStCart() {
      // 장바구니 전체 비우기 (확인 후)
      const nuxtApp = useNuxtApp();
      const ok = await nuxtApp.$confirm({
        title: "삭제 확인",
        message: "장바구니의 모든 상품을 삭제하시겠습니까?",
        confirmText: "삭제",
        cancelText: "취소",
        variant: "danger",
      });
      if (ok) {
        this.cartProducts = [];
      }
      localStorage.setItem("cart_products", JSON.stringify(this.cartProducts));
    },
    // 2026-09-20: 바로구매 — 선택한 수량으로 해당 줄(상품+SKU)의 수량을 지정한다(재고가 있으면 재고까지만).
    setStQuantity(prodId: string, prodSkuId: string | undefined, qty: number) {
      const line = this.cartProducts.find((i) => i.prodId === prodId && i.selectedProdSkuId === prodSkuId);
      if (!line) return;
      const max = line.prodStock > 0 ? line.prodStock : Number.MAX_SAFE_INTEGER;
      line.orderQuantity = Math.max(1, Math.min(Math.floor(Number(qty)) || 1, max));
      localStorage.setItem("cart_products", JSON.stringify(this.cartProducts));
    },
    initialStOrderQuantity() {
      this.orderQuantity = 1; // 추가 시 적용할 수량을 1로 초기화
    },
  },
  getters: {
    getStTotalPriceQuantity: (state) => {
      // 장바구니 총 수량·총 금액 계산
      return state.cartProducts.reduce(
        (cartTotal, cartItem) => {
          const { salePrice, orderQuantity } = cartItem;
          if (typeof orderQuantity !== "undefined") {
            const itemTotal = salePrice * orderQuantity;
            cartTotal.quantity += orderQuantity;
            cartTotal.total += itemTotal;
          }
          return cartTotal;
        },
        {
          total: 0,
          quantity: 0,
        },
      );
    },
    loadStCartProducts: (state) => {
      // localStorage에서 장바구니 불러와 state 동기화
      if (process.client) {
        const data = localStorage.getItem("cart_products");
        if (data) {
          return (state.cartProducts = JSON.parse(data));
        } else {
          localStorage.setItem("cart_products", JSON.stringify([]));
          return (state.cartProducts = []);
        }
      } else {
        return state.cartProducts;
      }
    },
  },
});
