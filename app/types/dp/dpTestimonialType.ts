/** 후기 슬라이더 항목 (home-7, 전시 위젯 TESTIMONIAL) */
export interface DpTestimonialType {
  id: number;
  img: string;
  desc: string;
}

/** 후기 슬라이더 항목 (home-3) — 작성자 정보 포함 */
export interface DpTestimonialHome3Type extends DpTestimonialType {
  name: string;
  title: string;
}
