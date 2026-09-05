// C++ 大厂求职学习管理系统 - 种子数据
// 对应 Prompt 第三节的 10 个一级模块 + 第四节 C++ 子模块 + 第十三节 20 个 Pattern
// 以及：8 本学习书籍（Resource） + 剑指Offer 50 题（LeetcodeProblem）

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==================== 剑指Offer 50 题映射（来自 PDF 目录） ====================
// 题目 → LeetCode 题号（直接对应或同类型题目）
const JIANZHI_50: Array<{
  num: number;          // 剑指Offer题号
  title: string;        // 题目名称
  chapter: string;      // 章节
  difficulty: string;   // 难度
  lc?: number;         // 对应 LeetCode 题号
  pattern: string;
  pdfPage: number;      // 大致 PDF 页码（来自 PDF 目录）
}> = [
  // 第3章 高质量的代码
  { num: 3,  title: "二维数组中的查找",           chapter: "3.2.3 数组",     difficulty: "Medium", lc: 74,     pattern: "Binary Search",         pdfPage: 43 },
  { num: 4,  title: "替换空格",                   chapter: "3.2.4 字符串",   difficulty: "Medium",            pattern: "String",               pdfPage: 46 },
  { num: 5,  title: "从尾到头打印链表",           chapter: "3.2.3 链表",     difficulty: "Easy",   lc: 206,    pattern: "Linked List",           pdfPage: 51 },
  { num: 6,  title: "重建二叉树",                 chapter: "3.2.4 树",       difficulty: "Hard",   lc: 105,    pattern: "Tree",                 pdfPage: 57 },
  { num: 7,  title: "用两个栈实现队列",           chapter: "3.2.5 栈和队列", difficulty: "Easy",   lc: 232,    pattern: "Stack",                pdfPage: 60 },
  { num: 8,  title: "旋转数组的最小数字",         chapter: "3.3.1 查找",     difficulty: "Medium", lc: 153,    pattern: "Binary Search",         pdfPage: 63 },
  { num: 9,  title: "斐波那契数列",               chapter: "3.3.2 递归和循环", difficulty: "Easy", lc: 509,    pattern: "Dynamic Programming",   pdfPage: 68 },
  { num: 10, title: "二进制中1的个数",            chapter: "3.3.3 位运算",   difficulty: "Easy",   lc: 191,    pattern: "Bit Manipulation",     pdfPage: 72 },
  { num: 11, title: "数值的整数次方",             chapter: "3.3.2 递归",     difficulty: "Medium", lc: 50,     pattern: "Math",                 pdfPage: 77 },
  { num: 12, title: "打印1到最大的n位数",         chapter: "3.3.2 递归",     difficulty: "Medium",            pattern: "DFS",                  pdfPage: 82 },
  { num: 13, title: "O(1)时间删除链表结点",      chapter: "3.4 鲁棒性",    difficulty: "Medium", lc: 237,    pattern: "Linked List",          pdfPage: 87 },
  { num: 14, title: "调整数组顺序使奇数在前",     chapter: "3.4 鲁棒性",    difficulty: "Medium", lc: 905,    pattern: "Two Pointers",          pdfPage: 89 },
  { num: 15, title: "链表中倒数第k个结点",        chapter: "3.4 鲁棒性",    difficulty: "Medium", lc: 19,     pattern: "Two Pointers",          pdfPage: 93 },
  { num: 16, title: "反转链表",                   chapter: "3.4 鲁棒性",    difficulty: "Medium", lc: 206,    pattern: "Linked List",           pdfPage: 97 },
  { num: 17, title: "合并两个排序的链表",         chapter: "3.4 鲁棒性",    difficulty: "Medium", lc: 21,     pattern: "Linked List",          pdfPage: 101 },
  { num: 18, title: "树的子结构",                 chapter: "3.4 鲁棒性",    difficulty: "Medium", lc: 572,    pattern: "Tree",                 pdfPage: 106 },

  // 第4章 解题思路
  { num: 19, title: "二叉树的镜像",               chapter: "4.2 画图",      difficulty: "Easy",   lc: 226,    pattern: "Tree",                 pdfPage: 116 },
  { num: 20, title: "顺时针打印矩阵",             chapter: "4.2 画图",      difficulty: "Medium", lc: 54,     pattern: "Array",                pdfPage: 120 },
  { num: 21, title: "包含min函数的栈",            chapter: "4.3 举例",      difficulty: "Medium", lc: 155,    pattern: "Stack",                pdfPage: 127 },
  { num: 22, title: "栈的压入、弹出序列",         chapter: "4.3 举例",      difficulty: "Medium", lc: 946,    pattern: "Stack",                pdfPage: 131 },
  { num: 23, title: "从上往下打印二叉树",         chapter: "4.3 举例",      difficulty: "Medium", lc: 102,    pattern: "BFS",                 pdfPage: 136 },
  { num: 24, title: "二叉搜索树的后序遍历序列",   chapter: "4.4 分解",      difficulty: "Medium",            pattern: "DFS",                  pdfPage: 141 },
  { num: 25, title: "二叉树中和为某一值的路径",   chapter: "4.4 分解",      difficulty: "Medium", lc: 113,    pattern: "DFS",                  pdfPage: 146 },
  { num: 26, title: "复杂链表的复制",             chapter: "4.4 分解",      difficulty: "Hard",   lc: 138,    pattern: "Linked List",          pdfPage: 152 },
  { num: 27, title: "二叉搜索树与双向链表",       chapter: "4.4 分解",      difficulty: "Medium", lc: 426,    pattern: "Tree",                 pdfPage: 159 },
  { num: 28, title: "字符串的排列",               chapter: "4.4 分解",      difficulty: "Medium", lc: 46,     pattern: "Backtracking",         pdfPage: 165 },
  { num: 29, title: "数组中出现次数超过一半的数",  chapter: "5.2 时间效率", difficulty: "Medium", lc: 169,    pattern: "Array",                pdfPage: 173 },
  { num: 30, title: "最小的k个数",               chapter: "5.2 时间效率", difficulty: "Medium", lc: 215,    pattern: "Heap",                 pdfPage: 178 },
  { num: 31, title: "连续子数组的最大和",         chapter: "5.2 时间效率", difficulty: "Medium", lc: 53,     pattern: "Dynamic Programming",   pdfPage: 185 },
  { num: 32, title: "从1到n整数中1出现的次数",    chapter: "5.2 时间效率", difficulty: "Hard",            pattern: "Math",                 pdfPage: 190 },
  { num: 33, title: "把数组排成最小的数",         chapter: "5.2 时间效率", difficulty: "Medium", lc: 179,    pattern: "Greedy",                pdfPage: 196 },
  { num: 34, title: "丑数",                       chapter: "5.3 空间换时间", difficulty: "Medium", lc: 264,    pattern: "Dynamic Programming",   pdfPage: 201 },
  { num: 35, title: "第一个只出现一次的字符",     chapter: "5.3 空间换时间", difficulty: "Easy",   lc: 387,    pattern: "Hash Table",           pdfPage: 207 },
  { num: 36, title: "数组中的逆序对",             chapter: "5.3 空间换时间", difficulty: "Hard",   lc: 493,    pattern: "Merge Sort",            pdfPage: 209 },
  { num: 37, title: "两个链表的第一个公共结点",   chapter: "5.3 空间换时间", difficulty: "Medium", lc: 160,    pattern: "Two Pointers",          pdfPage: 214 },

  // 第6章 综合能力
  { num: 38, title: "数字在排序数组中出现的次数", chapter: "6.3 知识迁移", difficulty: "Medium", lc: 34,     pattern: "Binary Search",         pdfPage: 225 },
  { num: 39, title: "二叉树的深度",               chapter: "6.3 知识迁移", difficulty: "Easy",   lc: 104,    pattern: "Tree",                 pdfPage: 230 },
  { num: 40, title: "数组中只出现一次的数字",     chapter: "6.3 知识迁移", difficulty: "Easy",   lc: 136,    pattern: "Bit Manipulation",     pdfPage: 234 },
  { num: 41, title: "和为s的两个数字 VS 连续正数序列", chapter: "6.3 知识迁移", difficulty: "Easy", lc: 1,  pattern: "Two Pointers",        pdfPage: 237 },
  { num: 42, title: "翻转单词顺序 VS 左旋转字符串", chapter: "6.3 知识迁移", difficulty: "Easy", lc: 151,  pattern: "String",               pdfPage: 242 },
  { num: 43, title: "n个骰子的点数",              chapter: "6.4 抽象建模", difficulty: "Medium",            pattern: "Dynamic Programming",   pdfPage: 248 },
  { num: 44, title: "扑克牌的顺子",               chapter: "6.4 抽象建模", difficulty: "Easy",   lc: 61,     pattern: "Array",                pdfPage: 254 },
  { num: 45, title: "圆圈中最后剩下的数字",       chapter: "6.4 抽象建模", difficulty: "Medium", lc: 62,     pattern: "Math",                 pdfPage: 256 },
  { num: 46, title: "求1＋2＋…＋n",              chapter: "6.5 发散思维", difficulty: "Medium",            pattern: "Math",                 pdfPage: 262 },
  { num: 47, title: "不用加减乘除做加法",         chapter: "6.5 发散思维", difficulty: "Medium", lc: 371,    pattern: "Bit Manipulation",     pdfPage: 265 },
  { num: 48, title: "不能被继承的类",             chapter: "6.5 发散思维", difficulty: "Hard",            pattern: "OOP",                  pdfPage: 268 },
  { num: 49, title: "把字符串转换成整数",          chapter: "7.1 案例一",   difficulty: "Medium", lc: 8,      pattern: "String",               pdfPage: 273 },
  { num: 50, title: "树中两个结点的最低公共祖先", chapter: "7.2 案例二",   difficulty: "Medium", lc: 236,    pattern: "Tree",                 pdfPage: 281 },
];

// ==================== 8 本学习书籍 ====================
const BOOKS: Array<{
  title: string;
  author: string;
  pdfPath: string;
  totalPages: number;
  notes: string;
}> = [
  {
    title: "剑指Offer",
    author: "何海涛",
    pdfPath: "剑指Offer_名企面试官精讲典型编程题.pdf",
    totalPages: 318,
    notes: "大厂面试必备，50 道经典编程面试题，按章节分为代码质量/解题思路/时间空间效率/综合能力。",
  },
  {
    title: "C++ Primer（第 5 版）",
    author: "Stanley Lippman 等",
    pdfPath: "C++ Primer 中文版（第 5 版） ( etc.) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    totalPages: 0, // 待手动填入
    notes: "C++ 基础必读，覆盖 C++98 到 C++11 的全部核心内容。",
  },
  {
    title: "C++ 标准库（第 2 版）",
    author: "Nicolai M. Josuttis",
    pdfPath: "C++标准库（第2版） (Nicolai M. Josuttis)[译者姓名] (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    totalPages: 0,
    notes: "STL 标准库权威参考，深入讲解容器/迭代器/算法/并发。",
  },
  {
    title: "Effective C++",
    author: "Scott Meyers",
    pdfPath: "Effective C++（侯捷） ( etc.) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    totalPages: 0,
    notes: "55 条改善 C++ 程序设计的经验规则。",
  },
  {
    title: "深度探索 C++ 对象模型",
    author: "Stanley Lippman",
    pdfPath: "深度探索C++对象模型 (Stanley Lippman , 侯捷) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    totalPages: 0,
    notes: "深入理解 C++ 对象的底层实现：虚函数表、内存布局、构造函数语义。",
  },
  {
    title: "数据结构与算法应用：C++描述（第 2 版）",
    author: "Sartaj Sahni",
    pdfPath: "数据结构与算法应用：C++描述（第 2 版） C++描述 (Sartaj Sahni) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    totalPages: 0,
    notes: "系统学习数据结构与算法，覆盖链表、树、图、排序、搜索。",
  },
  {
    title: "计算机网络：自顶向下方法（第 8 版）",
    author: "James F. Kurose, Keith W. Ross",
    pdfPath: "计算机网络：自顶向下方法（原书第8版） ([美]詹姆斯.F. Kurose, [美]基思.W. Ross, 译者) (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    totalPages: 0,
    notes: "自顶向下讲解 5 层网络模型：应用层→传输层→网络层→链路层→物理层。",
  },
  {
    title: "数据库系统概论",
    author: "王珊, 萨师煊",
    pdfPath: "数据库系统概论（王珊, 萨师煊） (z-library.sk, 1lib.sk, z-lib.sk).pdf",
    totalPages: 0,
    notes: "数据库基础：关系模型、SQL、索引、事务、并发控制。",
  },
];

async function main() {
  console.log("🌱 开始种子数据...");

  // 清理（按依赖顺序）
  await prisma.dailyReviewItem.deleteMany();
  await prisma.dailyReview.deleteMany();
  await prisma.weeklyReview.deleteMany();
  await prisma.learningSession.deleteMany();
  await prisma.leetcodeReview.deleteMany();
  await prisma.leetcodeAttempt.deleteMany();
  await prisma.leetcodeProblem.deleteMany();
  await prisma.reviewRecord.deleteMany();
  await prisma.recallQuestion.deleteMany();
  await prisma.knowledgeCard.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.algorithmPattern.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.projectNote.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // ============== User ==============
  const user = await prisma.user.create({
    data: {
      name: "C++ Learner",
      reviewRatio: 0.6,
      dailyGoalMinutes: 150,
    },
  });
  console.log("✅ User created");

  // ============== Topics（10 个一级模块 + C++ 子模块） ==============
  const cpp = await prisma.topic.create({
    data: { name: "C++", icon: "Code2", order: 1, description: "C++ 语言核心知识" },
  });
  const basicSyntax = await prisma.topic.create({
    data: { name: "基础语法", parentId: cpp.id, icon: "FileCode", order: 1 },
  });
  const pointerRef = await prisma.topic.create({
    data: { name: "指针和引用", parentId: cpp.id, icon: "MousePointer", order: 2 },
  });
  const memory = await prisma.topic.create({
    data: { name: "内存管理", parentId: cpp.id, icon: "HardDrive", order: 3 },
  });
  const oop = await prisma.topic.create({
    data: { name: "面向对象", parentId: cpp.id, icon: "Box", order: 4 },
  });
  const stl = await prisma.topic.create({
    data: { name: "STL", parentId: cpp.id, icon: "Library", order: 5 },
  });
  const template = await prisma.topic.create({
    data: { name: "模板", parentId: cpp.id, icon: "Layers", order: 6 },
  });
  const modernCpp = await prisma.topic.create({
    data: { name: "Modern C++", parentId: cpp.id, icon: "Sparkles", order: 7 },
  });
  const underlying = await prisma.topic.create({
    data: { name: "C++ 底层原理", parentId: cpp.id, icon: "Cpu", order: 8 },
  });

  const dsa = await prisma.topic.create({
    data: { name: "数据结构与算法", icon: "Binary", order: 2 },
  });
  const leetcodeTopic = await prisma.topic.create({
    data: { name: "LeetCode", icon: "Trophy", order: 3 },
  });
  const os = await prisma.topic.create({
    data: { name: "操作系统", icon: "Server", order: 4 },
  });
  const network = await prisma.topic.create({
    data: { name: "计算机网络", icon: "Network", order: 5 },
  });
  const db = await prisma.topic.create({
    data: { name: "数据库", icon: "Database", order: 6 },
  });
  const linux = await prisma.topic.create({
    data: { name: "Linux", icon: "Terminal", order: 7 },
  });
  const project = await prisma.topic.create({
    data: { name: "项目", icon: "FolderGit2", order: 8 },
  });
  const interview = await prisma.topic.create({
    data: { name: "面试八股", icon: "MessageSquare", order: 9 },
  });
  const job = await prisma.topic.create({
    data: { name: "求职准备", icon: "Briefcase", order: 10 },
  });
  console.log("✅ Topics created (10 一级 + 8 C++ 子模块)");

  // ============== Tags ==============
  const tags = ["C++", "STL", "Memory", "DP", "Tree", "Interview", "Important", "Weak", "Hot"];
  for (const name of tags) {
    await prisma.tag.create({ data: { name } });
  }
  console.log("✅ Tags created");

  // ============== Algorithm Patterns（20 个） ==============
  const patterns = [
    { name: "Array", scenario: "线性查找、固定窗口", signals: "数组、下标访问", order: 1 },
    { name: "String", scenario: "字符串处理", signals: "字符序列、子串匹配", order: 2 },
    { name: "Hash Table", scenario: "O(1) 查找、计数", signals: "频次、去重、存在性", order: 3 },
    { name: "Two Pointers", scenario: "有序数组对撞", signals: "有序数组、两数之和", order: 4 },
    { name: "Sliding Window", scenario: "连续子数组/子串", signals: "最长/最短/满足条件", order: 5 },
    { name: "Stack", scenario: "括号匹配、单调栈", signals: "后进先出、嵌套", order: 6 },
    { name: "Queue", scenario: "BFS、层级遍历", signals: "先进先出、顺序处理", order: 7 },
    { name: "Linked List", scenario: "链式结构操作", signals: "节点指针、虚拟头节点", order: 8 },
    { name: "Binary Search", scenario: "有序数组查找", signals: "有序、O(log n)、边界", order: 9 },
    { name: "Tree", scenario: "树形结构递归", signals: "递归、分治", order: 10 },
    { name: "DFS", scenario: "深度优先搜索", signals: "回溯、路径", order: 11 },
    { name: "BFS", scenario: "广度优先搜索", signals: "层序、最短路径", order: 12 },
    { name: "Backtracking", scenario: "枚举所有解", signals: "排列、组合、子集", order: 13 },
    { name: "Heap", scenario: "TopK、动态中位数", signals: "优先级、流式数据", order: 14 },
    { name: "Greedy", scenario: "局部最优", signals: "区间、排序后选", order: 15 },
    { name: "Dynamic Programming", scenario: "重叠子问题", signals: "最值、计数、状态转移", order: 16 },
    { name: "Graph", scenario: "图遍历", signals: "邻接表、邻接矩阵", order: 17 },
    { name: "Union Find", scenario: "连通性", signals: "分组、合并", order: 18 },
    { name: "Monotonic Stack", scenario: "下一个更大元素", signals: "维护单调序列", order: 19 },
    { name: "Prefix Sum", scenario: "区间和查询", signals: "前缀和、差分", order: 20 },
  ];

  for (const p of patterns) {
    await prisma.algorithmPattern.create({
      data: {
        ...p,
        template: getTemplateFor(p.name),
        description: `${p.name} Pattern 通用模板与典型题目。`,
        commonErrors: getCommonErrorsFor(p.name),
      },
    });
  }
  console.log("✅ 20 Algorithm Patterns created");

  // ============== Knowledge Cards（示例 C++ 卡片） ==============
  await prisma.knowledgeCard.create({
    data: {
      title: "unique_ptr",
      topicId: modernCpp.id,
      problemSolved: "实现独占所有权的资源管理，自动释放内存，避免泄漏。",
      corePrinciple: "RAII + 移动语义。包装原始指针，独占所有权，离开作用域自动 delete。",
      differences: "unique_ptr: 独占，不可复制可移动。\nshared_ptr: 共享，引用计数。\nweak_ptr: 不增加引用计数，解决循环引用。",
      commonMistakes: "1. 试图拷贝 unique_ptr（编译错误）\n2. 与 shared_ptr 混用导致混乱\n3. 从 this 获取 shared_ptr 时未继承 enable_shared_from_this",
      codeExample: `auto p = std::make_unique<int>(10);
// auto p2 = p; // ❌ 不可拷贝
auto p2 = std::move(p); // ✅ 移动
*p2 = 20;`,
      interviewQs: "Q1: unique_ptr 能否复制？\nQ2: 为什么用 make_unique 而不是 new？\nQ3: unique_ptr 占用多大空间？",
      source: "书籍",
      difficulty: 3,
      tags: "C++,Memory,Modern,Important",
      masteryScore: 35,
      nextReviewAt: new Date(),
      pdfPath: BOOKS[1].pdfPath,
      pdfPage: 1,
    },
  });

  const moveCard = await prisma.knowledgeCard.create({
    data: {
      title: "Move Semantics",
      topicId: modernCpp.id,
      problemSolved: "避免不必要的深拷贝，提升性能，特别在返回大对象、容器操作时。",
      corePrinciple: "右值引用 (T&&) + 移动构造/赋值。直接转移资源所有权，不复制数据。",
      differences: "左值: 有名字、可取地址。\n右值: 临时对象、字面量、std::move 的结果。",
      commonMistakes: "1. 移动后使用原对象（其状态有效但未指定）\n2. const 对象无法移动\n3. 忘记 noexcept 导致 STL 容器退化",
      codeExample: `std::string a = "hello";
std::string b = std::move(a); // 移动，a 变为空
// 避免拷贝，提升性能`,
      interviewQs: "Q1: 什么是右值引用？\nQ2: std::move 做了什么？\nQ3: 为什么移动构造需要 noexcept？",
      source: "视频",
      difficulty: 4,
      tags: "C++,Memory,Modern,Weak",
      masteryScore: 22,
      nextReviewAt: new Date(),
    },
  });

  await prisma.recallQuestion.createMany({
    data: [
      {
        knowledgeCardId: moveCard.id,
        question: "std::move 做了什么？",
        answer: "std::move 是一个强制类型转换 (static_cast<T&&>)，将左值转换为右值引用，从而可以使用移动构造或移动赋值。它本身不移动任何东西。",
        difficulty: 3,
      },
      {
        knowledgeCardId: moveCard.id,
        question: "为什么移动构造函数通常要声明为 noexcept？",
        answer: "STL 容器（如 vector）在扩容时需要保证强异常安全性。如果移动构造可能抛异常，vector 会退化为拷贝，性能急剧下降。noexcept 是给编译器和 STL 的承诺。",
        difficulty: 4,
      },
      {
        knowledgeCardId: moveCard.id,
        question: "什么是完美转发 (perfect forwarding)？",
        answer: "通过万能引用 (T&&) 和 std::forward，保持参数的左值/右值属性原封不动地传递给另一个函数，避免不必要的拷贝或移动。",
        difficulty: 5,
      },
    ],
  });

  await prisma.knowledgeCard.create({
    data: {
      title: "vector 扩容机制",
      topicId: stl.id,
      problemSolved: "理解动态数组的容量增长策略，避免反复 reallocate 导致性能问题。",
      corePrinciple: "容量不足时，按 2 倍（GCC）或 1.5 倍（MSVC）重新分配内存，拷贝元素，释放旧内存。",
      differences: "size: 实际元素数。\ncapacity: 已分配空间。\nreserve(n): 预分配至少 n 容量。\nresize(n): 改变 size。",
      commonMistakes: "1. 循环中 push_back 不知道会触发扩容\n2. 误用 reserve 后仍 push_back\n3. 移动迭代器时未注意 reallocate 会失效",
      codeExample: `std::vector<int> v;
v.reserve(1000); // 预分配，避免 10+ 次扩容
for (int i = 0; i < 1000; ++i) v.push_back(i);`,
      interviewQs: "Q1: size 和 capacity 的区别？\nQ2: reserve 能否缩小容量？\nQ3: 哪些操作会导致迭代器失效？",
      source: "书籍",
      difficulty: 3,
      tags: "C++,STL,Important",
      masteryScore: 55,
      nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      pdfPath: BOOKS[2].pdfPath,
      pdfPage: 1,
    },
  });

  await prisma.knowledgeCard.create({
    data: {
      title: "RAII",
      topicId: memory.id,
      problemSolved: "通过对象生命周期管理资源（内存、文件、锁），确保异常安全。",
      corePrinciple: "Resource Acquisition Is Initialization。构造函数获取资源，析构函数释放资源。利用 C++ 栈展开保证析构一定执行。",
      differences: "与 finally 不同：RAII 是编译器保证，更通用。与 GC 不同：RAII 是确定性释放，无暂停。",
      commonMistakes: "1. 在构造函数中抛异常（导致析构不执行）\n2. 资源获取失败未回滚已获取的资源\n3. 析构函数抛出异常",
      codeExample: `class FileGuard {
  FILE* f;
public:
  FileGuard(const char* name) : f(fopen(name, "r")) {}
  ~FileGuard() { if (f) fclose(f); }
};`,
      interviewQs: "Q1: RAII 的全称？\nQ2: 为什么 RAII 能保证异常安全？\nQ3: 智能指针是如何运用 RAII 的？",
      source: "书籍",
      difficulty: 3,
      tags: "C++,Memory,Important",
      masteryScore: 60,
      nextReviewAt: new Date(),
      pdfPath: BOOKS[1].pdfPath,
      pdfPage: 1,
    },
  });

  await prisma.knowledgeCard.create({
    data: {
      title: "virtual function 实现原理",
      topicId: underlying.id,
      problemSolved: "理解 C++ 多态的实现机制，掌握 vtable 与 vptr 概念。",
      corePrinciple: "每个含虚函数的类有一个 vtable（虚函数表），对象头部有 vptr 指向 vtable。调用虚函数时通过 vptr 间接调用。",
      differences: "静态绑定: 编译期决定，非虚函数。\n动态绑定: 运行期通过 vtable 决议，虚函数。",
      commonMistakes: "1. 构造函数中调用虚函数（不发生多态）\n2. 析构函数忘记设为 virtual（基类指针删除派生对象泄漏）\n3. 性能开销：每次间接寻址",
      codeExample: `class Base { public: virtual void foo(); };
class Derived : public Base { public: void foo() override; };
Base* p = new Derived();
p->foo(); // 通过 vtable 调用 Derived::foo`,
      interviewQs: "Q1: vptr 在对象哪里？\nQ2: 构造函数为什么不能是 virtual？\nQ3: 析构函数什么时候应该设为 virtual？",
      source: "书籍",
      difficulty: 4,
      tags: "C++,Underlying,Weak",
      masteryScore: 28,
      nextReviewAt: new Date(),
      pdfPath: BOOKS[4].pdfPath,
      pdfPage: 1,
    },
  });

  console.log("✅ 5 KnowledgeCards created");

  // ============== LeetCode Problems（示例） ==============
  const lc3 = await prisma.leetcodeProblem.create({
    data: {
      leetcodeNumber: 3,
      title: "无重复字符的最长子串",
      difficulty: "Medium",
      url: "https://leetcode.cn/problems/longest-substring-without-repeating-characters/",
      pattern: "Sliding Window",
      status: "SolvedWithHint",
      masteryScore: 35,
      attemptCount: 2,
      independentSolveCount: 0,
      usedHintCount: 1,
      usedSolutionCount: 0,
      totalTime: 50,
    },
  });

  await prisma.leetcodeAttempt.create({
    data: {
      problemId: lc3.id,
      duration: 30,
      solved: true,
      usedHint: true,
      usedSolution: false,
      independent: false,
      algorithm: "Sliding Window + Hash Set",
      timeComplexity: "O(n)",
      spaceComplexity: "O(min(m, n))",
      whyFailed: "不知道什么时候移动 left。看到连续子串 + 求最长，应该立刻想到滑动窗口，但没想到。",
      mistakeType: "不会识别题型",
      patternRecognition: "Sliding Window",
      nextTimeSignal: "看到「连续子串」+「求最长/最短」+「满足条件」→ 优先考虑 Sliding Window",
      notes: "用 unordered_set 记录窗口内字符，重复时收缩左边界。",
    },
  });

  await prisma.leetcodeAttempt.create({
    data: {
      problemId: lc3.id,
      duration: 20,
      solved: true,
      usedHint: false,
      usedSolution: false,
      independent: true,
      algorithm: "Sliding Window + Hash Map",
      timeComplexity: "O(n)",
      spaceComplexity: "O(min(m, n))",
      whyFailed: "首次思考清晰，30 分钟内想到滑动窗口。",
      mistakeType: "其他",
      patternRecognition: "Sliding Window",
      nextTimeSignal: "已掌握，下次看到类似题目应该能在 15 分钟内完成。",
      notes: "用 map 记录字符最后出现位置，可以跳过 left 直接跳到重复位置之后，更快。",
    },
  });

  await prisma.leetcodeProblem.create({
    data: {
      leetcodeNumber: 76,
      title: "最小覆盖子串",
      difficulty: "Hard",
      url: "https://leetcode.cn/problems/minimum-window-substring/",
      pattern: "Sliding Window",
      status: "SolvedAfterSolution",
      masteryScore: 15,
      attemptCount: 1,
      independentSolveCount: 0,
      usedHintCount: 0,
      usedSolutionCount: 1,
      totalTime: 60,
    },
  });

  await prisma.leetcodeProblem.create({
    data: {
      leetcodeNumber: 1,
      title: "两数之和",
      difficulty: "Easy",
      url: "https://leetcode.cn/problems/two-sum/",
      pattern: "Hash Table",
      status: "SolvedIndependently",
      masteryScore: 85,
      attemptCount: 3,
      independentSolveCount: 3,
      usedHintCount: 0,
      usedSolutionCount: 0,
      totalTime: 30,
    },
  });

  await prisma.leetcodeProblem.create({
    data: {
      leetcodeNumber: 70,
      title: "爬楼梯",
      difficulty: "Easy",
      url: "https://leetcode.cn/problems/climbing-stairs/",
      pattern: "Dynamic Programming",
      status: "SolvedIndependently",
      masteryScore: 70,
      attemptCount: 2,
      independentSolveCount: 2,
      totalTime: 20,
    },
  });

  await prisma.leetcodeProblem.create({
    data: {
      leetcodeNumber: 704,
      title: "二分查找",
      difficulty: "Easy",
      url: "https://leetcode.cn/problems/binary-search/",
      pattern: "Binary Search",
      status: "SolvedWithHint",
      masteryScore: 40,
      attemptCount: 2,
      independentSolveCount: 1,
      usedHintCount: 1,
      totalTime: 25,
    },
  });

  console.log("✅ 6 LeetCode Problems + Attempts created");

  // ============== 剑指Offer 50 题 ==============
  for (const p of JIANZHI_50) {
    // 如果有对应 LeetCode 题号，检查是否已存在（复用现有数据）
    const existing = p.lc ? await prisma.leetcodeProblem.findUnique({
      where: { leetcodeNumber: p.lc },
    }) : null;

    // 复用已有题目，更新 source/isHot 等字段
    if (existing) {
      await prisma.leetcodeProblem.update({
        where: { id: existing.id },
        data: {
          source: "剑指Offer",
          chapter: p.chapter,
          isHot: true,
          pdfPath: BOOKS[0].pdfPath,
          pdfPage: p.pdfPage,
        },
      });
      continue;
    }

    await prisma.leetcodeProblem.create({
      data: {
        leetcodeNumber: p.lc ?? (1000 + p.num),
        title: `【剑指Offer ${p.num}】${p.title}`,
        difficulty: p.difficulty,
        url: p.lc ? `https://leetcode.cn/problems/${getLcSlug(p.lc)}/` : undefined,
        pattern: p.pattern,
        status: "NotStarted",
        source: "剑指Offer",
        chapter: p.chapter,
        isHot: true,
        pdfPath: BOOKS[0].pdfPath,
        pdfPage: p.pdfPage,
      },
    });
  }
  console.log(`✅ 剑指Offer ${JIANZHI_50.length} 题创建完成`);

  // ============== 8 本学习书籍 ==============
  for (const book of BOOKS) {
    await prisma.resource.create({
      data: {
        type: "book",
        title: book.title,
        author: book.author,
        progress: 0,
        notes: book.notes,
        pdfPath: book.pdfPath,
        totalPages: book.totalPages,
        currentPage: null,
      },
    });
  }
  console.log(`✅ ${BOOKS.length} 本书籍资源录入完成`);

  // ============== Resources（示例） ==============
  await prisma.resource.create({
    data: {
      type: "course",
      title: "C++ 系统工程师课程",
      url: "https://example.com/cpp",
      progress: 40,
      chapter: "Chapter 5: STL",
      notes: "覆盖 C++ 核心知识点。",
    },
  });
  console.log("✅ 1 Resources created");

  // ============== Project ==============
  const webServer = await prisma.project.create({
    data: {
      name: "Tiny WebServer",
      github: "https://github.com/yourname/tiny-webserver",
      techStack: "C++,Linux,Socket,Epoll,Thread Pool",
      goal: "从零实现一个支持 HTTP/1.1 的高并发 Web 服务器。",
      modules: "Socket,Epoll,Thread Pool,HTTP Parser,Database Pool,Logging",
      status: "InProgress",
    },
  });

  await prisma.projectNote.create({
    data: {
      projectId: webServer.id,
      type: "tech-difficulty",
      title: "epoll LT vs ET 模式",
      content: "LT (Level Triggered): 只要 fd 可读就通知，编程简单。ET (Edge Triggered): 仅状态变化时通知一次，需要非阻塞 + 一次性读完，性能更高但容易出错。",
    },
  });

  await prisma.projectNote.create({
    data: {
      projectId: webServer.id,
      type: "lesson",
      title: "RAII 封装 socket",
      content: "用 RAII 管理 socket fd，析构时自动 close，避免 fd 泄漏。",
    },
  });
  console.log("✅ 1 Project + 2 Notes created");

  console.log("🎉 种子数据完成！");
  console.log(`📚 书籍: ${BOOKS.length} 本`);
  console.log(`🔥 剑指Offer: ${JIANZHI_50.length} 题`);
}

function getLcSlug(num: number): string {
  // 常用题目的 slug
  const slugs: Record<number, string> = {
    1: "two-sum", 2: "add-two-numbers", 3: "longest-substring-without-repeating-characters",
    8: "string-to-integer-atoi", 19: "remove-nth-node-from-end-of-list", 21: "merge-two-sorted-lists",
    34: "find-first-and-last-position-of-element-in-sorted-array", 46: "permutations",
    50: "powx-n", 53: "maximum-subarray", 54: "spiral-matrix", 61: "rotate-list",
    62: "last-stone-weight", 64: "minimum-path-sum", 74: "search-a-2d-matrix",
    76: "minimum-window-substring", 102: "binary-tree-level-order-traversal",
    104: "maximum-depth-of-binary-tree", 105: "construct-binary-tree-from-preorder-and-inorder-traversal",
    113: "path-sum-ii", 136: "single-number", 138: "copy-list-with-random-pointer",
    155: "min-stack", 160: "intersection-of-two-linked-lists",
    169: "majority-element", 179: "largest-number", 191: "number-of-1-bits",
    206: "reverse-linked-list", 215: "kth-largest-element-in-an-array",
    226: "invert-binary-tree", 232: "implement-queue-using-stacks",
    236: "lowest-common-ancestor-of-a-binary-tree", 237: "delete-node-in-a-linked-list",
    264: "ugly-number-ii", 387: "first-unique-character-in-a-string",
    426: "convert-binary-search-tree-to-sorted-doubly-linked-list",
    493: "reverse-pairs", 509: "fibonacci-number", 572: "subtree-of-another-tree",
    905: "sort-array-by-parity",
  };
  return slugs[num] ?? `problems/${num}`;
}

function getTemplateFor(name: string): string {
  const templates: Record<string, string> = {
    "Sliding Window": `int left = 0;
for (int right = 0; right < n; ++right) {
    // 扩大窗口：加入 s[right]
    while (/* 窗口需要收缩 */) {
        // 缩小窗口：移除 s[left]
        left++;
    }
    // 更新答案
}`,
    "Two Pointers": `int i = 0, j = n - 1;
while (i < j) {
    if (/* 满足条件 */) i++;
    else j--;
}`,
    "Binary Search": `int lo = 0, hi = n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (/* 找到 */) return mid;
    else if (/* mid 太大 */) hi = mid - 1;
    else lo = mid + 1;
}`,
    "Dynamic Programming": `// 1. 定义 dp[i] 含义
// 2. 初始化 base case
// 3. 状态转移
for (int i = 1; i < n; ++i) {
    dp[i] = /* ... */;
}`,
    "DFS": `void dfs(state) {
    if (/* 终止条件 */) { 记录答案; return; }
    for (/* 选项 */) {
        修改状态;
        dfs(新状态);
        恢复状态;
    }
}`,
  };
  return templates[name] || `// ${name} Pattern 模板待补充`;
}

function getCommonErrorsFor(name: string): string {
  const errors: Record<string, string> = {
    "Sliding Window": "1. 不知道何时收缩左边界\n2. 忘记更新最终答案\n3. 字符计数错误",
    "Two Pointers": "1. 边界条件 off-by-one\n2. 死循环（指针不动）\n3. 排序后忘记原下标",
    "Binary Search": "1. 边界条件 while(lo <= hi) vs while(lo < hi)\n2. mid 计算溢出\n3. 返回值混淆",
    "Dynamic Programming": "1. 状态定义不清\n2. 转移方程写错\n3. base case 遗漏",
    "DFS": "1. 忘记回溯\n2. 终止条件写错\n3. 重复访问节点",
  };
  return errors[name] || "";
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
