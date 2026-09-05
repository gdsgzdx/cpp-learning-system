# C++ 大厂求职学习管理系统 - 产品设计文档

> 本文档回答 Prompt 第 50 节提出的 12 个设计问题，确认架构后再开始实现代码。

---

## 1. 产品目标理解

**一句话总结**：一个"强迫主动学习 + 量化掌握程度"的个人 C++ 求职训练系统。

**解决的核心痛点**（直接对应 Prompt 第一节列出的 10 个问题）：

| 用户痛点 | 系统解决方案 |
|---------|-------------|
| 看视频感觉懂了，过几天就忘 | 主动回忆问题 + 间隔复习 |
| 看书被动阅读 | 必须填写结构化笔记 + Recall 问题 |
| 笔记记很多，回忆不出 | 答案先隐藏，必须先自评 |
| LeetCode 做完几天又不会 | LeetCode 状态机 + 独立完成追踪 |
| 看题解后产生"已会"错觉 | 看题解后强制"关闭题解重新编码" |
| 不知道哪些真掌握 | Mastery Score 综合算法（0–100） |
| 不知道何时复习 | FSRS 简化版间隔重复算法 |
| 每天学新还是复习 | 自动推荐比例（默认 60% 复习 / 40% 新知） |
| 投入多但效率低 | 每周 Dashboard + 学习效率分析 |
| 内容多了失去规划 | Roadmap 5 阶段 + Topic 知识体系 |

**核心设计哲学**：系统必须**强迫主动输出**（Recall / Code / Solve / Reflect），而不是被动输入（Read / Watch / Copy Notes）。

---

## 2. 核心用户流程

### 流程 A：每日学习主流程
```
打开 Dashboard
  → 看到"今天该做什么"（自动生成 Today's Plan）
  → 进入 Review 流程（主动回忆）
       → 显示问题（隐藏答案）
       → 用户思考/回答
       → 提交后显示标准答案
       → 自评（Again/Hard/Good/Easy）
       → 系统计算下次复习日期
  → 进入 Learn 流程（新知识点）
       → 阅读结构化笔记
       → 完成 Recall Question 自测
       → 进入复习队列
  → 进入 Practice 流程（LeetCode）
       → 开始做题（计时）
       → 不会可看提示/题解（标记 used_hint / used_solution）
       → 看完题解必须"关闭题解重新编码"
       → 填写复盘（算法/复杂度/错误原因/Pattern/识别信号）
  → 进入 Reflect 流程（每日复盘）
       → 填写今天学了什么、卡哪里、明天重点
```

### 流程 B：LeetCode 状态进阶
```
Not Started
  → Attempted（首次尝试）
  → Solved With Hint（看提示）
  → Solved After Solution（看题解）
  → Reproduced（关闭题解后能复现）
  → Solved Independently（独立完成）
  → Mastered（满足：≥3 次独立完成 + 至少 1 次间隔 ≥14 天仍独立完成）
```

### 流程 C：薄弱知识点识别
```
系统自动统计每个 Topic 的 Recall 正确率
  → 排序找出 Bottom 10%
  → Dashboard 高亮"Weak Topics"
  → 自动提升其在 Today's Plan 中的权重
```

---

## 3. 信息架构（IA）

### 一级模块（10 个知识域，对应 Prompt 第三节）
```
1. C++
2. 数据结构与算法
3. LeetCode
4. 操作系统
5. 计算机网络
6. 数据库
7. Linux
8. 项目
9. 面试八股
10. 求职准备
```

### 二级模块（以 C++ 为例，对应 Prompt 第四节）
```
C++
├── 基础语法（变量/类型/条件/循环/函数/作用域）
├── 指针和引用
├── 内存管理（stack/heap/new/delete/RAII/...)
├── 面向对象（class/继承/多态/virtual/...）
├── STL（vector/map/unordered_map/...）
├── 模板
├── Modern C++（C++11/14/17/20）
└── C++ 底层原理（vtable/对象布局/...）
```

### LeetCode Pattern 分类（对应 Prompt 第十三节，20 个 Pattern）
```
Array / String / Hash Table / Two Pointers / Sliding Window /
Stack / Queue / Linked List / Binary Search / Tree /
DFS / BFS / Backtracking / Heap / Greedy /
Dynamic Programming / Graph / Union Find / Monotonic Stack / Prefix Sum
```

### 实体关系（高层）
```
User
├── Topic (10 个一级模块)
│   └── KnowledgeCard (知识点)
│       └── RecallQuestion (主动回忆问题)
│           └── ReviewRecord (复习记录)
├── LeetcodeProblem
│   ├── LeetcodeAttempt (做题记录)
│   └── LeetcodeReview (复习记录)
├── AlgorithmPattern (20 个 Pattern)
│   └── 关联 LeetcodeProblem
├── LearningSession (学习会话)
│   └── DailyReview (每日复盘)
│   └── WeeklyReview (每周复盘)
├── Resource (书籍/视频/课程)
├── Project (C++ 项目)
│   └── ProjectNote (项目笔记)
└── Tag (全局标签)
```

---

## 4. 页面结构

12 个核心页面（对应 Prompt 第四十六节）：

| # | 路径 | 名称 | MVP | 主要功能 |
|---|------|------|-----|---------|
| 1 | `/` | Dashboard | V1 | 今日任务、Weak Topics、LeetCode 进度、学习统计概览 |
| 2 | `/today` | Today | V1 | 今日详细计划（Review/Learn/Practice/Reflect） |
| 3 | `/knowledge` | Knowledge 列表 | V1 | 所有知识卡片，支持按 Topic/Tag/掌握度筛选 |
| 4 | `/knowledge/[id]` | Knowledge 详情 | V1 | 结构化笔记 + Recall 问题 + 复习历史 |
| 5 | `/review` | Review 队列 | V1 | 主动回忆流程 + 自评 + 自动调整复习间隔 |
| 6 | `/leetcode` | LeetCode 列表 | V1 | 所有题目，支持 Pattern/Difficulty/Status 筛选 |
| 7 | `/leetcode/[id]` | LeetCode 详情 | V1 | 题目信息 + 做题历史 + 复盘记录 |
| 8 | `/mistakes` | 错题本 | V1 | 自动汇总错题，按 Pattern 分组 |
| 9 | `/patterns` | Pattern 学习 | V2 | 20 个算法 Pattern，每个含模板/典型题/我的错误 |
| 10 | `/analytics` | 数据分析 | V2 | 周/月统计、Mastery Growth、效率分析 |
| 11 | `/resources` | 资源管理 | V2 | 书籍/视频/课程管理 |
| 12 | `/settings` | 设置 | V1 | Dark Mode / 学习比例 / 数据导入导出 |

### Dashboard 布局（对应 Prompt 第四十七节）
```
┌─────────────────────────────────────────────┐
│ Dashboard                                   │
│ Good morning                                │
├─────────────────────────────────────────────┤
│ Today's Progress                            │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ │2h35│ │ 12 │ │  3 │ │2/3 │ │78% │         │
│ │Stud│ │Due │ │Over│ │LC  │ │Rec │         │
│ └────┘ └────┘ └────┘ └────┘ └────┘         │
├─────────────────────────────────────────────┤
│ Today                                       │
│ ▶ Review (60%)                              │
│   • Smart Pointer                           │
│   • Move Semantics                          │
│ ▶ Practice                                  │
│   • LC 3                                    │
│   • LC 76                                   │
│ ▶ Learn                                     │
│   • C++ Lambda                              │
├─────────────────────────────────────────────┤
│ Weak Topics                                 │
│ • Dynamic Programming 32%                   │
│ • Move Semantics 44%                        │
│ • Binary Search 51%                         │
├─────────────────────────────────────────────┤
│ LeetCode Progress                           │
│ Mastered: 12 | Learning: 8 | Total: 150     │
├─────────────────────────────────────────────┤
│ Learning Statistics                         │
│ Study Streak: 7 days                        │
│ This Week: 16.5h                            │
└─────────────────────────────────────────────┘
```

---

## 5. 数据库设计（Prisma Schema 概览）

### 核心表（对应 Prompt 第三十四~三十九节）

```prisma
// 用户与全局
model User { id, name, dailyReviewRatio (默认 0.6), ... }

// 知识点体系
model Topic { id, name, parentId, order }
model KnowledgeCard {
  id, title, category, subCategory,
  problemSolved, corePrinciple, commonMistakes,
  codeExample, interviewQuestions,
  source, difficulty,
  masteryScore, reviewCount, successCount, failureCount,
  interval, ease, lastReviewedAt, nextReviewAt,
  topicId, tags[]
}
model RecallQuestion {
  id, knowledgeCardId, question, answer,
  difficulty, lastResult, reviewCount, nextReviewAt
}
model ReviewRecord {
  id, knowledgeCardId, recallQuestionId,
  result (AGAIN/HARD/GOOD/EASY),
  selfScore, reviewedAt, intervalAfter
}

// LeetCode
model LeetcodeProblem {
  id, leetcodeNumber, title, difficulty, url,
  pattern, status, masteryScore,
  attemptCount, independentSolveCount,
  usedHintCount, usedSolutionCount,
  averageSolveTime, lastSolveTime,
  lastReviewedAt, nextReviewAt
}
model LeetcodeAttempt {
  id, problemId, date, duration,
  solved, usedHint, usedSolution,
  algorithm, timeComplexity, spaceComplexity,
  mistakeType, whyFailed,
  patternRecognition, nextTimeSignal, notes
}
model LeetcodeReview {
  id, problemId, reviewedAt, result, nextReviewAt
}

// Pattern & 学习会话
model AlgorithmPattern {
  id, name, scenario, signals, template, description
}
model LearningSession {
  id, startTime, endTime, duration,
  sessionType (REVIEW/LEARN/PRACTICE/REFLECT),
  topics, reviewCount, newTopicCount, leetcodeCount, reflection
}
model DailyReview {
  id, date, totalStudyTime,
  topThreeKnowledge, stuckAt, biggestMistake, tomorrowFocus
}
model WeeklyReview {
  id, weekStart, weekEnd, closedBookTest, summary
}

// 资源 & 项目
model Resource { id, type, title, url, progress, chapter, relatedCardIds[] }
model Project { id, name, github, techStack, goal, modules, status }
model ProjectNote { id, projectId, type, content, bugs, lessons }

// 标签
model Tag { id, name, color, knowledgeCards[], leetcodeProblems[] }
```

### 关键关系
- `KnowledgeCard 1:N RecallQuestion 1:N ReviewRecord`
- `LeetcodeProblem 1:N LeetcodeAttempt 1:N LeetcodeReview`
- `KnowledgeCard N:M Tag`（通过中间表）
- `LearningSession 1:N DailyReview`（按日期汇总）

---

## 6. Spaced Repetition 设计

### 算法选择：MVP 使用简化版 SM-2

**为什么不直接上 FSRS**：FSRS 准确但实现复杂，MVP 阶段先用 SM-2 简化版即可满足需求，后续可平滑升级到 FSRS（数据模型已预留 `ease`、`memoryStrength` 字段）。

### 算法规则

每个 `KnowledgeCard` 维护：
- `interval`：当前间隔（天）
- `ease`：难度系数（默认 2.5，范围 1.3–2.8）
- `reviewCount`：复习次数
- `successCount` / `failureCount`：成功/失败次数
- `nextReviewAt`：下次复习日期
- `lastReviewedAt`：上次复习日期

每次用户自评 `Again/Hard/Good/Easy` 后：

```
Again (selfScore = 0):
  interval = 1
  ease = max(1.3, ease - 0.2)
  failureCount++

Hard (selfScore = 1):
  interval = max(1, interval * 1.2)
  ease = max(1.3, ease - 0.15)

Good (selfScore = 2):
  interval = interval * ease（首次复习 interval = 1）
  ease 不变

Easy (selfScore = 3):
  interval = interval * ease * 1.3
  ease = min(2.8, ease + 0.15)

successCount++（除 Again 外）
nextReviewAt = today + interval days
```

### 新卡片引入序列
- 第 1 次复习：1 天后
- 第 2 次：3 天后
- 第 3 次：7 天后
- 第 4 次：14 天后
- 第 5 次：30 天后
- 第 6 次：60 天后
- 第 7 次：90 天后
- 之后按 SM-2 公式动态调整

### Forgetting Risk 计算（Prompt 第二十一节）
```
riskScore = 
  daysSinceLastReview / interval * 40   // 逾期程度
  + failureRate * 30                    // 历史错误率
  + (difficulty - 3) * 5                // 难度系数（1-5）
  + isOverdue ? 20 : 0                  // 是否逾期

< 30 → Low
30-60 → Medium
60-80 → High
≥ 80 → Critical
```

---

## 7. Mastery Score 计算思路（0–100）

不依赖"用户点击已学会"，而是综合 7 个维度：

```
masteryScore = 
  recallAccuracy * 30                    // 主动回忆正确率（最近 10 次）
  + reviewCountFactor * 15               // 复习次数因子（log 曲线封顶）
  + consecutiveSuccessBonus * 10         // 连续正确次数
  + lastReviewRecency * 10               // 距离上次复习时间（越近分越高）
  + longTermRetentionBonus * 15          // 经过 ≥14 天间隔复习仍正确的次数
  + hasPracticalCoding * 10              // 是否有 codeExample 且最近编辑
  + leetcodeIndependentRate * 10         // LeetCode 独立完成率（仅 LeetCode 类型）

各项加权求和后截断到 [0, 100]
```

### 分级（对应 Prompt 第二十节）
```
0–20   刚接触
21–40  理解
41–60  可以复现
61–80  基本掌握
81–90  熟练
91–100 长期掌握
```

### 实时更新
- 每次 `ReviewRecord` / `LeetcodeAttempt` 写入时触发重算
- 在服务端 `lib/mastery.ts` 中实现，前端只读

---

## 8. LeetCode 掌握度计算逻辑

### 状态机（对应 Prompt 第九节）
```
NotStarted → Attempted → SolvedWithHint → SolvedAfterSolution
   → Reproduced → SolvedIndependently → Mastered
```

### Mastered 严格判定
```
if independentSolveCount >= 3
   AND 存在一次 LeetcodeAttempt：
        date - max(otherAttempts.date) ≥ 14 天
        AND solved = true
        AND usedHint = false
        AND usedSolution = false
then status = Mastered
```

### 状态自动推断（写入 Attempt 时）
```
if attemptCount == 0:
    status = NotStarted
elif independentSolveCount == 0 AND usedSolutionCount > 0:
    status = SolvedAfterSolution
elif independentSolveCount == 0 AND usedHintCount > 0:
    status = SolvedWithHint
elif usedSolutionCount > 0 AND 最近一次 attempt 是"关闭题解后重新编码":
    status = Reproduced
elif independentSolveCount >= 1:
    status = SolvedIndependently
```

### LeetCode 复习间隔
- 类似 Spaced Repetition，但用 LeetCode 专用简化规则：
  - 看提示/题解：1 天后复习
  - 独立完成：3 → 7 → 14 → 30 天
  - Mastered：60 天后再次验证

### 错题本（对应 Prompt 第十二节）
筛选条件：
```
status ∈ {SolvedWithHint, SolvedAfterSolution}
  OR 最近 3 次 attempt 中 usedHint/usedSolution = true
  OR masteryScore < 60
```
按 `pattern` 分组展示，重点字段：题目、Pattern、错误原因、思维断点、下次识别信号。

---

## 9. MVP V1 功能列表（对应 Prompt 第四十一节）

### 必须完成
1. ✅ **Dashboard** - 今日任务卡片 + 关键指标 + Weak Topics
2. ✅ **Knowledge Cards** - CRUD + Topic 分类 + Tag + 结构化字段
3. ✅ **Recall Questions** - 每个 KnowledgeCard 关联多个问题
4. ✅ **Review Queue** - 主动回忆流程 + 隐藏答案 + 自评
5. ✅ **Spaced Repetition** - SM-2 简化版算法
6. ✅ **LeetCode Tracker** - CRUD + Pattern/Difficulty/Status 筛选
7. ✅ **LeetCode Attempt** - 做题流程 + 计时 + 复盘字段
8. ✅ **Mistake Book** - 错题自动汇总
9. ✅ **Study Session** - 计时 + 今日计划自动生成
10. ✅ **Basic Statistics** - 学习时长、复习次数、Recall 正确率
11. ✅ **Today Page** - 详细今日任务清单
12. ✅ **Settings** - Dark Mode + 学习比例调整

### V1 不做（V2/V3 再做）
- ❌ Algorithm Pattern 详细模板（先简单列表）
- ❌ Weekly Review 闭卷测试（先简单回顾）
- ❌ Weakness Detection 自动推荐（先在 Dashboard 展示）
- ❌ Mastery Score 综合算法（先用简化版 5 个维度）
- ❌ Resource Manager / Project Tracker
- ❌ Knowledge Graph
- ❌ AI Assistant

---

## 10. 推荐技术栈

| 层 | 选型 | 理由 |
|---|------|------|
| **前端框架** | Next.js 14 (App Router) | 全栈一体，API Route 简化部署 |
| **UI 库** | React 18 + TypeScript | 类型安全，主流生态 |
| **样式** | Tailwind CSS + shadcn/ui | 快速构建极简风格 UI |
| **数据库** | SQLite + Prisma | 本地零配置，未来可迁移 PostgreSQL |
| **图表** | Recharts | 与 React 集成好 |
| **状态管理** | React Server Components + Zustand（仅复杂客户端状态） | 默认 RSC，减少客户端 JS |
| **图标** | lucide-react | 与 shadcn/ui 配套 |
| **主题** | next-themes | 支持 Dark/Light 模式 |
| **日期处理** | date-fns | 轻量 |
| **代码高亮** | shiki 或 highlight.js | LeetCode 代码示例展示 |
| **测试** | TypeScript 检查 + ESLint + Prisma 类型 | 不写单元测试，但保证类型安全 |

**部署**：本地 `next dev` 即可，未来可部署 Vercel + 切换 PostgreSQL。

---

## 11. 项目目录结构

```
cpp-study-hub/
├── prisma/
│   ├── schema.prisma          # 数据库 schema
│   ├── seed.ts                # 种子数据（C++ 基础、常见 LeetCode）
│   └── dev.db                 # SQLite 数据库文件（gitignore）
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # 全局布局 + 主题
│   │   ├── page.tsx           # Dashboard (/)
│   │   ├── today/page.tsx     # 今日计划
│   │   ├── knowledge/
│   │   │   ├── page.tsx       # 知识卡片列表
│   │   │   └── [id]/page.tsx  # 知识卡片详情
│   │   ├── review/page.tsx    # 复习队列
│   │   ├── leetcode/
│   │   │   ├── page.tsx       # LeetCode 列表
│   │   │   └── [id]/page.tsx  # LeetCode 详情
│   │   ├── mistakes/page.tsx  # 错题本
│   │   ├── patterns/page.tsx  # Pattern 学习
│   │   ├── analytics/page.tsx # 数据分析
│   │   ├── resources/page.tsx # 资源管理
│   │   ├── settings/page.tsx  # 设置
│   │   └── api/               # API Routes
│   │       ├── knowledge/
│   │       ├── review/
│   │       ├── leetcode/
│   │       ├── session/
│   │       └── stats/
│   ├── components/
│   │   ├── ui/                # shadcn/ui 基础组件
│   │   ├── layout/            # Sidebar / Header
│   │   ├── knowledge/         # KnowledgeCard 相关组件
│   │   ├── review/            # Recall 问题相关组件
│   │   ├── leetcode/          # LeetCode 相关组件
│   │   └── dashboard/         # Dashboard 卡片组件
│   ├── lib/
│   │   ├── db.ts              # Prisma 客户端
│   │   ├── spaced-repetition.ts  # SM-2 算法
│   │   ├── mastery.ts         # Mastery Score 计算
│   │   ├── leetcode-status.ts # LeetCode 状态机
│   │   ├── today-plan.ts      # 今日计划生成算法
│   │   ├── forgetting-risk.ts # 遗忘风险计算
│   │   └── utils.ts           # 通用工具
│   ├── types/                 # TypeScript 类型定义
│   └── styles/                # 全局样式
├── public/                    # 静态资源
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .eslintrc.json
├── .gitignore
└── README.md
```

---

## 12. 分阶段开发计划

### Phase 0：基础搭建（已完成设计）
- ✅ 输出本设计文档
- ⏳ 初始化 Next.js + TypeScript + Tailwind + Prisma 项目
- ⏳ 配置 shadcn/ui + next-themes
- ⏳ 定义 Prisma Schema（全部表）
- ⏳ 编写种子数据（10 个 Topic + 5 个示例 KnowledgeCard + 5 个示例 LeetCode）

### Phase 1：MVP V1（核心功能）
1. **Knowledge Card 系统**
   - 列表页（按 Topic/掌握度筛选）
   - 详情页（结构化字段编辑）
   - 新建/编辑/删除
2. **Recall Question 系统**
   - 在 KnowledgeCard 下创建问题
   - 复习时显示问题（隐藏答案）
   - 自评提交
3. **Spaced Repetition 引擎**
   - SM-2 算法实现
   - Review Queue 页面
   - 自动计算 nextReviewAt
4. **LeetCode 系统**
   - 列表页（Pattern/Difficulty/Status 筛选）
   - 详情页
   - Attempt 录入（含复盘字段）
5. **错题本**
   - 自动汇总（Status != Mastered + usedHint/usedSolution）
   - 按 Pattern 分组
6. **Study Session**
   - 计时器
   - Today's Plan 自动生成（基于 nextReviewAt + Weak Topics）
7. **Dashboard**
   - 关键指标卡片
   - Today 任务列表
   - Weak Topics
   - LeetCode 进度
8. **Today Page**
   - 详细今日任务清单
9. **Settings**
   - Dark/Light Mode
   - 学习比例调整

### Phase 2：V2（增强分析）
- Algorithm Pattern 详细页面（模板 + 典型题）
- Weekly Review 闭卷测试
- Mastery Score 综合算法（7 维度）
- 完整 Statistics（Daily/Weekly/Monthly）
- Resource Manager

### Phase 3：V3（高级功能）
- Knowledge Graph 可视化
- Project Tracker
- Interview Module（八股 + 模拟面试）
- AI Assistant（架构预留，暂不连接 API）

---

## 设计验证

针对用户提出的核心问题，本设计是否能解决？

| 问题 | 设计对应 |
|------|---------|
| 看过容易忘 | ✅ Spaced Repetition + Forgetting Risk |
| LeetCode 做过又忘 | ✅ LeetCode 状态机 + 独立完成追踪 + 错题本 |
| 复习无计划 | ✅ Today's Plan 自动生成 + 60/40 比例动态调整 |
| 无法判断掌握程度 | ✅ Mastery Score 0–100（多维度） |
| 学习效率低 | ✅ 学习时长 vs Recall 正确率对比 + Weak Topics 自动识别 |

**结论**：架构设计完整，可以开始实现代码。

---

**下一步**：初始化项目脚手架 → 配置 Prisma → 实现 MVP V1 功能。
