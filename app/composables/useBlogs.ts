/**
 * 블로그 목록 공유 컴포저블
 * 여러 컴포넌트에서 /api/fo/ec/cm/bltn/page 를 중복 호출하지 않도록 캐시 key를 공유합니다.
 */
import { type CoBlogType } from "~/types/coBlogType";
import { coBlogSvc } from "~/svc/fo/ec/cm/coBlogSvc";

export function useBlogs() {
  const { data: blogs, pending } = useAsyncData<CoBlogType[]>(
    "blogs",
    () => coBlogSvc.getPage(),
    { default: () => [] as CoBlogType[] }
  );

  return { blogs, pending };
}
