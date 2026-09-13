/**
 * 블로그 목록 공유 컴포저블
 * 여러 컴포넌트에서 /api/fo/ec/cm/bltn/page 를 중복 호출하지 않도록 캐시 key를 공유합니다.
 */
import { type CoBlogType } from "~/types/coBlogType";
import { coBlogSvc } from "~/svc/fo/ec/cm/coBlogSvc";

export function useBlogs() {
  // 2026-09-13(성능 개선): lazy:true — 블로그 목록은 홈 화면 등에서 보조 콘텐츠로 쓰이는
  // 경우가 많아 이 호출 하나 때문에 화면 전체 마운트가 지연되지 않게 한다.
  const { data: blogs, pending } = useAsyncData<CoBlogType[]>(
    "blogs",
    () => coBlogSvc.getPage(),
    { default: () => [] as CoBlogType[], lazy: true }
  );

  return { blogs, pending };
}
