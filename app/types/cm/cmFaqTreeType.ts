/** FAQ 분류 트리 노드(sy_path 기반, 하위 포함 건수). */
export interface CmFaqTreeNodeType {
  id: string;
  label: string;
  count: number;
  children: { id: string; label: string; count: number }[];
}

export interface CmFaqTreeType {
  total: number;
  tree: CmFaqTreeNodeType[];
}
