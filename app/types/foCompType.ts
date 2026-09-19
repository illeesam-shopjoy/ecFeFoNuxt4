/**
 * foCompType.ts — FoGrid / FoForm 공통 컴포넌트가 쓰는 컬럼 정의 타입 (2026-09-19).
 * ecFeBo(components/comp/FoAreaComp.js)의 <fo-grid> / <fo-form-area> 컬럼 정의 규칙을 그대로 옮겼다.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FoRow = Record<string, any>;

/** FoGrid 컬럼 */
export interface FoGridColumn {
  /** 행 객체의 필드명 (슬롯 이름 `cell-{key}` 에도 쓰인다) */
  key: string;
  label: string;
  width?: string;
  /** 미지정이면 자동 정렬: 금액/수량=우측, 코드/상태/일자=가운데, 그 외 좌측 */
  align?: "left" | "center" | "right";
  /** 표시값 가공 (v=셀값, row=행) */
  fmt?: (v: unknown, row: FoRow) => string | number;
  /** true 이면 작은 뱃지로 표시. 함수면 색상을 돌려준다: 'green'|'blue'|'red'|'gray'|'orange'|'#hex' */
  badge?: boolean | ((row: FoRow) => string);
  /** 링크처럼 보이게(클릭 시 cell-click 이벤트) */
  link?: boolean;
  mono?: boolean;
  /** th 에 추가할 클래스 */
  cls?: string;
  /** 기본 한 줄 말줄임(…)을 끈다 */
  noEllipsis?: boolean;
  cellClass?: string | ((v: unknown, row: FoRow) => string);
  cellStyle?: string | ((v: unknown, row: FoRow) => string);
  /** 값이 있으면 헤더 클릭 시 sort 이벤트 발생 */
  sortKey?: string;
  /** true 이면 컬럼을 숨긴다 */
  hidden?: boolean;
}

/** FoGrid 행 액션 버튼 (rowActionsCols) */
export interface FoGridRowAction {
  label: string | ((row: FoRow, idx: number) => string);
  cls?: string | ((row: FoRow, idx: number) => string);
  title?: string | ((row: FoRow, idx: number) => string);
  onClick?: (row: FoRow, idx: number) => void;
  href?: (row: FoRow, idx: number) => string;
  target?: string;
  visible?: (row: FoRow, idx: number) => boolean;
  disabled?: (row: FoRow, idx: number) => boolean;
}

export interface FoOption {
  value?: string | number;
  label?: string;
  codeValue?: string | number;
  codeLabel?: string;
}

/** FoForm 필드 정의 */
export interface FoFormColumn {
  key: string;
  label?: string;
  /** text | email | tel | password | number | date | textarea | select | readonly | slot | rowBreak | group */
  type?: "text" | "email" | "tel" | "password" | "number" | "date" | "textarea" | "select" | "readonly" | "slot" | "rowBreak" | "group";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  colSpan?: number;
  readonly?: boolean;
  mono?: boolean;
  hideLabel?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  maxlength?: number;
  autocomplete?: string;
  /** select 옵션 — 배열 또는 함수, {value,label} / {codeValue,codeLabel} 모두 허용 */
  options?: FoOption[] | (() => FoOption[]);
  nullable?: boolean;
  nullLabel?: string;
  /** slot 타입에서 슬롯 이름(기본 key) */
  name?: string;
  visible?: (form: FoRow) => boolean;
  onChange?: (v: unknown, form: FoRow, e?: Event) => void;
  /** 입력 중 실시간 검증 — 오류 문자열을 돌려주면 errors[key] 에 넣는다 */
  validate?: (v: unknown, form: FoRow) => string | undefined | void;
  /** readonly 타입의 표시값 가공 */
  fmt?: (v: unknown, form: FoRow) => string;
  clearErrOnInput?: boolean;
}
