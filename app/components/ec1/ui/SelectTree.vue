<template>
  <!-- 2026-09-14(요청사항: "tailwind 로 전환할수 있으면 전환시켜줘") — select-tree-* 커스텀 클래스를
       전부 Tailwind 유틸리티로 대체. direction/unicode-bidi처럼 유틸리티가 없는 속성은
       [property:value] 임의값 문법 사용. -->
  <div class="w-full text-[0.78rem]">
    <!-- Flat list: path + title (search result style) -->
    <div v-if="viewMode === 'flat'" class="max-h-[240px] overflow-y-auto py-0.5">
      <div
        v-for="item in flatFilteredItems"
        :key="item.id"
        class="flex items-center gap-1.5 px-2 py-1 cursor-pointer min-h-[24px] leading-[1.3] hover:bg-gray-200 flex-nowrap border-b border-gray-100"
        @click="onSelect(item)"
      >
        <span class="flex-[0_1_55%] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 text-[0.72rem] [direction:rtl] [unicode-bidi:plaintext]">{{ item.pathLabel || item.path }}</span>
        <span class="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-gray-900 font-medium">{{ item.title }}</span>
      </div>
      <div v-if="flatFilteredItems.length === 0" class="p-3 text-center text-gray-400 text-xs">검색 결과 없음</div>
    </div>

    <!-- Tree: Windows Explorer style (folder 영문, file = title) -->
    <div v-else class="max-h-[240px] overflow-y-auto py-0.5 overflow-x-hidden">
      <template v-for="node in treeFiltered" :key="node.id">
        <div
          v-if="node.isFolder"
          class="flex items-center gap-1.5 px-2 py-1 cursor-pointer min-h-[24px] leading-[1.3] hover:bg-gray-200"
          :style="{ paddingLeft: `${12 + node.depth * 14}px` }"
          @click="toggleExpand(node.id)"
        >
          <span class="shrink-0 w-3.5 text-[0.6rem] text-gray-500 text-center">{{ expandedList.includes(node.id) ? "▼" : "▶" }}</span>
          <span class="text-gray-700 font-semibold lowercase">{{ node.folderName }}</span>
        </div>
        <div
          v-else
          class="flex items-center gap-1.5 px-2 py-1 cursor-pointer min-h-[24px] leading-[1.3] hover:bg-gray-200"
          :style="{ paddingLeft: `${12 + node.depth * 14}px` }"
          @click="onSelectTreeFile(node)"
        >
          <span class="shrink-0 w-3.5 text-[0.6rem] text-gray-500 text-center invisible">▶</span>
          <span class="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium text-[#1d4ed8]">{{ node.title }}</span>
        </div>
      </template>
      <div v-if="treeFiltered.length === 0" class="p-3 text-center text-gray-400 text-xs">항목 없음</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FoSelectTreeItemType } from "~/types/fo/foCompType";

const props = withDefaults(
  defineProps<{
    items: FoSelectTreeItemType[];
    searchQuery?: string;
    viewMode?: "flat" | "tree";
    initialExpandedIds?: string[];
  }>(),
  { searchQuery: "", viewMode: "flat", initialExpandedIds: () => [] },
);

const emit = defineEmits<{ (e: "select", item: FoSelectTreeItemType): void }>();

const expandedIds = ref<Set<string>>(new Set());

// 초기 펼침: initialExpandedIds 또는 root 폴더들 (한 번만)
const expandedInited = ref(false);
watch(
  () => props.items,
  (items) => {
    if (expandedInited.value || !items?.length) return;
    expandedInited.value = true;
    if (props.initialExpandedIds?.length) {
      expandedIds.value = new Set(props.initialExpandedIds);
      return;
    }
    const rootFolders = new Set<string>();
    for (const n of items) {
      if (n.children?.length) rootFolders.add(`folder:${n.id}`);
    }
    if (rootFolders.size) expandedIds.value = rootFolders;
  },
  { immediate: true },
);

const expandedList = computed(() => Array.from(expandedIds.value));

// Flat list: all leaves with pathLabel; filter by search
const flatItems = computed(() => {
  const out: FoSelectTreeItemType[] = [];
  function walk(nodes: FoSelectTreeItemType[]) {
    for (const n of nodes) {
      if (n.children?.length) walk(n.children);
      else out.push(n);
    }
  }
  walk(props.items);
  return out;
});

const flatFilteredItems = computed(() => {
  const q = props.searchQuery.trim().toLowerCase();
  if (!q) return flatItems.value;
  return flatItems.value.filter(
    (item) =>
      (item.pathLabel || item.path).toLowerCase().includes(q) || item.title.toLowerCase().includes(q),
  );
});

// Tree view: build folder + file rows with depth; folders from path segments (English)
interface TreeRow {
  id: string;
  depth: number;
  isFolder: boolean;
  folderName?: string;
  path?: string;
  title?: string;
  pathLabel?: string;
}

function pathToFolderName(segment: string): string {
  if (segment === "index" || segment === "") return "home";
  return segment.replace(/-/g, " ");
}

const treeFiltered = computed((): TreeRow[] => {
  const rows: TreeRow[] = [];
  const q = props.searchQuery.trim().toLowerCase();

  function addFolder(id: string, name: string, depth: number) {
    rows.push({ id, depth, isFolder: true, folderName: name });
  }

  function walk(nodes: FoSelectTreeItemType[], depth: number, parentPath: string) {
    for (const n of nodes) {
      if (n.children?.length) {
        const folderId = `folder:${parentPath}/${n.id}`;
        const name = pathToFolderName(n.id);
        addFolder(folderId, name, depth);
        if (expandedIds.value.has(folderId)) walk(n.children!, depth + 1, `${parentPath}/${n.id}`);
      } else {
        const match = !q || (n.pathLabel || n.path).toLowerCase().includes(q) || n.title.toLowerCase().includes(q);
        if (match) rows.push({ id: n.id, depth, isFolder: false, path: n.path, title: n.title, pathLabel: n.pathLabel });
      }
    }
  }

  // Top-level: treat items as roots; if item has children, show as folder
  for (const n of props.items) {
    if (n.children?.length) {
      const folderId = `folder:${n.id}`;
      addFolder(folderId, n.title, 0);
      if (expandedIds.value.has(folderId)) walk(n.children!, 1, n.id);
    } else {
      const match = !q || (n.pathLabel || n.path).toLowerCase().includes(q) || n.title.toLowerCase().includes(q);
      if (match) rows.push({ id: n.id, depth: 0, isFolder: false, path: n.path, title: n.title, pathLabel: n.pathLabel });
    }
  }
  return rows;
});

function toggleExpand(id: string) {
  const next = new Set(expandedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedIds.value = next;
}

function onSelect(item: FoSelectTreeItemType) {
  if (item.path) emit("select", item);
}

function onSelectTreeFile(node: TreeRow) {
  if (node.path != null) emit("select", { id: node.id, path: node.path, title: node.title ?? node.id, pathLabel: node.pathLabel });
}
</script>

