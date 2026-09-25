<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="gift-modal-title" @click.self="close">
      <div class="relative w-full max-w-[460px] overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
        <div class="flex items-start justify-between border-b border-[#f0e2cf] bg-gradient-to-b from-[#fcf5e9] to-[#f8ecd9] px-6 py-4">
          <div>
            <h3 id="gift-modal-title" class="m-0 text-[1.1rem] font-extrabold text-gray-900">🎁 선물하기</h3>
            <div class="mt-0.5 text-[0.78rem] text-gray-500">결제하면 받는 분께 <b>상품 교환권(상품쿠폰)</b>이 만들어집니다. 받는 분이 배송지를 직접 입력해 받아요.</div>
          </div>
          <button type="button" class="cursor-pointer border-0 bg-transparent p-1 text-gray-400 hover:text-gray-700" aria-label="닫기" @click="close"><i class="fal fa-times"></i></button>
        </div>
        <form class="px-6 py-5" @submit.prevent="submit">
          <div class="mb-4 rounded-lg bg-[#f9fafb] px-4 py-3 text-[0.85rem]">
            <div class="font-bold text-gray-900">{{ prodNm }}</div>
            <div class="mt-0.5 text-gray-500">수량 {{ qty }}개 · {{ priceText }}</div>
          </div>
          <label class="gm-l">받는 분 이름 <b class="text-[#dc2626]">*</b></label>
          <input v-model="form.recvNm" class="gm-in" maxlength="50" placeholder="예) 홍길동" />
          <label class="gm-l mt-3">받는 분 휴대폰 <span class="text-gray-400">(선택)</span></label>
          <input v-model="form.recvPhone" class="gm-in" maxlength="20" inputmode="tel" placeholder="010-0000-0000" />
          <label class="gm-l mt-3">받는 분 이메일 <span class="text-gray-400">(선택)</span></label>
          <input v-model="form.recvEmail" class="gm-in" maxlength="100" inputmode="email" placeholder="example@email.com" />
          <label class="gm-l mt-3">선물 메시지 <span class="text-gray-400">(선택)</span></label>
          <textarea v-model="form.giftMsg" class="gm-in !h-[84px] !py-2" maxlength="300" placeholder="마음을 전해 보세요 (300자 이내)"></textarea>
          <p class="m-0 mt-3 text-[0.75rem] text-gray-400">결제 후 발급되는 쿠폰 코드/링크를 카카오톡·문자로 전달할 수 있습니다. 쿠폰 유효기간은 결제일로부터 180일입니다.</p>
          <p v-if="err" class="m-0 mt-2 text-[0.8rem] text-red-500">{{ err }}</p>
          <div class="mt-4 flex gap-2.5">
            <button type="button" class="flex-1 cursor-pointer rounded-lg border border-[#c9ced6] bg-white py-2.5 text-[0.88rem] font-semibold text-gray-700" @click="close">취소</button>
            <button type="submit" class="flex-[2] cursor-pointer rounded-lg border-0 bg-[#1a1410] py-2.5 text-[0.88rem] font-bold text-white">선물 결제하러 가기</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 선물하기 모달 — 상품 상세에서 받는 분 정보·메시지를 받는다. 제출하면 부모가 gift_ctx 를 저장하고 /gift/order 로 이동한다.
 * 금액은 서버(ecBeBo)가 상품가로 계산하므로 여기서는 표시용 안내만 한다.
 */
import { reactive, ref } from "vue";

defineProps<{ prodNm: string; qty: number; priceText: string }>();
const emit = defineEmits<{ (e: "submit", v: { recvNm: string; recvPhone: string; recvEmail: string; giftMsg: string }): void }>();

const visible = ref(false);
const err = ref("");
const form = reactive({ recvNm: "", recvPhone: "", recvEmail: "", giftMsg: "" });

function show() {
  err.value = "";
  visible.value = true;
}
function close() {
  visible.value = false;
}
function submit() {
  err.value = "";
  if (!form.recvNm.trim()) return void (err.value = "받는 분 이름을 입력해 주세요.");
  if (form.recvEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recvEmail.trim())) return void (err.value = "이메일 형식이 올바르지 않습니다.");
  emit("submit", { recvNm: form.recvNm.trim(), recvPhone: form.recvPhone.trim(), recvEmail: form.recvEmail.trim(), giftMsg: form.giftMsg.trim() });
  visible.value = false;
}
defineExpose({ show, close });
</script>

<style scoped>
.gm-l { display: block; margin-bottom: 4px; font-size: 0.8rem; color: #6b7280; }
.gm-in { width: 100%; height: 40px; padding: 0 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 0.88rem; outline: none; }
.gm-in:focus { border-color: #bc8246; }
</style>
