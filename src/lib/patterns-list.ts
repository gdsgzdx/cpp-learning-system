// LeetCode 20 个 Pattern 列表（对应 Prompt 第十三节）
export const PATTERNS = [
  "Array",
  "String",
  "Hash Table",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Queue",
  "Linked List",
  "Binary Search",
  "Tree",
  "DFS",
  "BFS",
  "Backtracking",
  "Heap",
  "Greedy",
  "Dynamic Programming",
  "Graph",
  "Union Find",
  "Monotonic Stack",
  "Prefix Sum",
] as const;

export type PatternName = (typeof PATTERNS)[number];
