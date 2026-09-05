# C++ 大厂求职学习管理系统

> 一个真正能长期使用的个人学习系统 - 通过**主动回忆 + 间隔重复 + 错题复盘 + 学习数据分析**提高长期记忆，服务于 C++ 大厂技术岗位求职。

![MVP V1](https://img.shields.io/badge/version-MVP%20V1-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Prisma](https://img.shields.io/badge/Prisma-SQLite-blue)

---

## 🆕 V1.1 增量：学习资料 PDF 集成

将 `book_pdf/` 目录下的 8 本学习书与系统打通，支持：

- **资源页（/resources）**：每本书显示"打开 PDF"按钮，点击直接在浏览器中打开对应 PDF（支持 Range 流式加载，几百 MB 文件秒开）
- **题库页（/leetcode）**：按书目来源分组显示（剑指Offer 独立分组 + 标记 🔥 Hot），支持按"来源"筛选
- **题详情页（/leetcode/[id]）**：显示所属章节、来源书，附带"查看 PDF 第 N 页"跳转按钮
- **知识卡片详情页（/knowledge/[id]）**：可关联 PDF + 页码，点击跳转到 PDF 对应页
- **添加题目表单**：新增"来源书籍 / 所属章节 / 是否大厂常考 / 关联 PDF + 页码"四个字段
- **添加资源表单**：新增"关联 PDF（book_pdf 目录）"选择 + 总页数 + 当前页

### 已录入的 8 本书 + 50 道剑指 Offer 题

| 类别 | 数量 | 来源 |
|---|---|---|
| 学习书籍 | 8 本 | 全部 `book_pdf/` 目录 |
| 剑指 Offer 题目 | 50 题（含 2 题复用 LeetCode 编号） | PDF 目录自动映射 |
| 🔥 大厂常考题标记 | 47 道 | 剑指Offer 全部标记 Hot |

**PDF 跳转实现原理**：浏览器内置 PDF 阅读器支持 URL `#page=N` 参数跳转。本系统通过 `/api/pdf/[...path]` 路由安全地从 `book_pdf/` 目录提供 PDF 文件，并支持 HTTP Range 请求以流式加载大文件。

---

如果你有以下困扰，这个系统适合你：

- ✅ 看视频感觉懂了，过几天就忘
- ✅ 看书时容易变成被动阅读
- ✅ 笔记记很多，真正能回忆出来的不多
- ✅ LeetCode 做过的题几天后又不会了
- ✅ 看了题解之后会产生"我已经会了"的错觉
- ✅ 不知道哪些知识掌握了、哪些只是看过
- ✅ 不知道什么时候应该复习
- ✅ 不知道每天应该学新内容还是复习旧内容
- ✅ 学习时间投入很多，但很难判断效率
- ✅ 学习内容越来越多后，容易失去整体规划

**核心设计哲学**：系统必须**强迫主动输出**（Recall / Code / Solve / Reflect），而不是被动输入（Read / Watch / Copy Notes）。

---

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 pnpm

### 安装

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库 + 灌入种子数据
npm run db:reset

# 3. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

### 其他命令

```bash
npm run typecheck    # TypeScript 类型检查
npm run lint         # ESLint
npm run build        # 生产构建
npm run db:push      # 仅同步 schema 到数据库（不灌数据）
npm run db:seed      # 仅灌种子数据
npm run db:reset     # 重置数据库 + 灌数据
```

---

## 📚 核心功能

### 1. Dashboard `/`
- 6 个关键指标：今日学习时长、待复习、已逾期、LeetCode 进度、Recall 正确率、平均掌握度
- Today's Plan：自动生成今日任务清单
- Weak Topics：自动识别最弱 Topic
- LeetCode 各 Pattern 掌握度

### 2. Today `/today`
- 详细今日计划（复习 / 刷题 / 学习）
- 逾期高亮提醒
- 每项任务附带预计时长和推荐理由

### 3. Knowledge `/knowledge`
- 结构化知识卡片：它解决什么问题 / 核心原理 / 与类似概念区别 / 易错点 / 代码示例 / 面试问题
- 按 Topic / Tag / 掌握度筛选
- 支持搜索

### 4. Knowledge Detail `/knowledge/[id]`
- 完整结构化笔记
- 主动回忆问题列表（先思考再查看答案）
- 复习历史记录

### 5. Review `/review`
- **主动回忆核心流程**：
  1. 先显示问题（隐藏答案）
  2. 用户思考（可在脑中或写下来）
  3. 查看答案
  4. 自评 Again / Hard / Good / Easy
  5. 系统自动调整下次复习日期
- **间隔重复算法**：SM-2 简化版（前 7 次固定 1/3/7/14/30/60/90 天，之后动态调整）

### 6. LeetCode `/leetcode`
- 6 状态机：NotStarted → Attempted → SolvedWithHint → SolvedAfterSolution → Reproduced → SolvedIndependently → Mastered
- **Mastered 严格判定**：≥3 次独立完成 + 至少一次 ≥14 天间隔仍独立完成
- 按 Pattern / Difficulty / Status 筛选

### 7. LeetCode Detail `/leetcode/[id]`
- 完整做题记录（含每次复盘）
- 6 字段复盘（对应 Prompt 第十一节）：
  - 算法 / 时间复杂度 / 空间复杂度
  - 为什么没想出来（最重要）
  - 错误类型（10 种分类）
  - Pattern 识别
  - 下次识别信号

### 8. Mistakes `/mistakes`
- 自动汇总所有未掌握题目
- 按 Pattern 分组
- 重点展示：错误原因、识别信号、最近是否独立完成

### 9. Patterns `/patterns`
- 20 个核心算法 Pattern（推荐学习顺序）
- 每个 Pattern 含：适用场景 / 识别信号 / 代码模板 / 常见错误 / 你的掌握度

### 10. Analytics `/analytics`
- 本周学习时长柱状图
- Recall 正确率
- Topic / Pattern 掌握度排行
- **系统建议**：自动识别弱点并给出可执行建议
- 每日复盘表单

### 11. Resources `/resources`
- 书籍 / 视频 / 课程 / 博客 / 文档管理
- 进度追踪 + 章节标记

### 12. Settings `/settings`
- 主题（Dark/Light）
- 复习占比调整（默认 60%）
- 每日目标时长
- 学习 Session 计时器

---

## 🧠 核心算法

### Mastery Score (0-100)
综合 7 个维度计算掌握度（不依赖"我已学会"按钮）：

| 维度 | 权重 |
|------|------|
| 主动回忆正确率 | 30% |
| 复习次数（log 曲线） | 15% |
| 连续正确次数 | 10% |
| 距离上次复习时间 | 10% |
| 长期保持（≥14 天间隔仍正确） | 15% |
| 是否有实际代码 | 10% |
| LeetCode 独立完成率 | 10% |

分级：
- 0-20 刚接触
- 21-40 理解
- 41-60 可以复现
- 61-80 基本掌握
- 81-90 熟练
- 91-100 长期掌握

### Spaced Repetition (SM-2 简化版)

| 自评 | 新间隔 | ease 调整 |
|------|--------|----------|
| Again | 1 天 | -0.2 (最低 1.3) |
| Hard | interval × 1.2 | -0.15 |
| Good | interval × ease | 不变 |
| Easy | interval × ease × 1.3 | +0.15 (最高 2.8) |

前 7 次复习固定序列：1 → 3 → 7 → 14 → 30 → 60 → 90 天
之后进入 SM-2 公式动态调整。

### Today's Plan 算法
优先级排序：
1. Overdue Review（已逾期）
2. Today Review（今天到期）
3. Weak Topics（薄弱 Topic 优先）
4. New Learning（按 backlog 动态调整）

---

## 🗂 项目结构

```
cpp-study-hub/
├── prisma/
│   ├── schema.prisma          # 数据库 schema
│   ├── seed.ts                # 种子数据
│   └── dev.db                 # SQLite 数据库
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # 全局布局
│   │   ├── page.tsx           # Dashboard
│   │   ├── today/             # 今日计划
│   │   ├── knowledge/         # 知识卡片
│   │   ├── review/            # 主动回忆
│   │   ├── leetcode/          # LeetCode 追踪
│   │   ├── mistakes/          # 错题本
│   │   ├── patterns/          # Pattern 学习
│   │   ├── analytics/         # 数据分析
│   │   ├── resources/         # 资源管理
│   │   ├── settings/          # 设置
│   │   └── api/               # API Routes
│   ├── components/
│   │   ├── ui/                # shadcn 风格基础组件
│   │   ├── dashboard/         # Dashboard 组件
│   │   ├── knowledge/         # 知识卡片组件
│   │   ├── review/            # 复习组件
│   │   ├── leetcode/          # LeetCode 组件
│   │   ├── analytics/         # 分析组件
│   │   ├── resources/         # 资源组件
│   │   ├── settings/          # 设置组件
│   │   ├── sidebar.tsx        # 侧边栏
│   │   ├── header.tsx         # 顶部
│   │   ├── theme-provider.tsx # 主题
│   │   ├── theme-toggle.tsx   # 主题切换
│   │   ├── mastery-bar.tsx    # 掌握度进度条
│   │   └── study-session.tsx  # 学习计时器
│   ├── lib/
│   │   ├── db.ts                          # Prisma 客户端
│   │   ├── spaced-repetition.ts           # SM-2 算法
│   │   ├── mastery.ts                     # Mastery Score
│   │   ├── leetcode-status.ts             # LeetCode 状态机
│   │   ├── today-plan.ts                  # 今日计划算法
│   │   ├── analytics.ts                   # 数据统计
│   │   ├── dashboard.ts                   # Dashboard 数据
│   │   ├── knowledge.ts                   # 知识数据
│   │   ├── leetcode.ts                    # LeetCode 数据
│   │   ├── review.ts                      # 复习数据
│   │   ├── patterns-list.ts               # 20 个 Pattern
│   │   └── utils.ts                       # 工具函数
│   ├── types/                             # TypeScript 类型
│   └── styles/                            # 全局样式
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```

---

## 🛠 技术栈

| 层 | 选型 |
|---|------|
| 前端框架 | Next.js 14 (App Router) |
| UI | React 18 + TypeScript + Tailwind CSS |
| 组件风格 | shadcn/ui 风格（手写，无依赖锁定） |
| 数据库 | SQLite + Prisma |
| 图表 | Recharts |
| 主题 | next-themes（Dark / Light） |
| 图标 | lucide-react |
| 日期 | date-fns |

---

## 📋 推荐使用流程

### 每天（30-90 分钟）

1. **打开 Dashboard** 看今天该做什么
2. **先去 Review** 处理待复习的卡片（主动回忆）
3. **刷 LeetCode**（先独立思考 20-30 分钟，必要时看提示）
4. **学新内容**（1-2 个新知识点）
5. **填写每日复盘**（最关键 3 个知识点、卡哪里、明天重点）

### 每周（30 分钟）

1. 查看 Analytics，看本周数据
2. 检查 Weak Topics，针对性突破
3. 处理错题本，关闭题解后重新编码

---

## 🗺 Roadmap

### ✅ MVP V1（已完成）
- Dashboard / Today / Knowledge / Review / LeetCode / Mistakes
- Spaced Repetition / Mastery Score / LeetCode 状态机
- Study Session / Basic Statistics

### 🚧 V2（计划）
- Algorithm Pattern 详细模板
- Weekly Review 闭卷测试
- Weakness Detection 自动推荐
- Resource Manager 完整功能
- Weekly Dashboard

### 🔮 V3（远期）
- Knowledge Graph 可视化
- Project Tracker
- Interview Module
- AI Assistant（架构预留）
- Advanced Analytics

---

## 💡 使用建议

1. **每天至少做 5 次主动回忆** - 这是长期记忆的关键
2. **不要跳过自评** - Again/Hard/Good/Easy 影响下次复习日期
3. **LeetCode 看完题解必须关闭后重做** - 否则会"虚假掌握"
4. **每日复盘必填** - 哪怕只写 3 句话
5. **Trust the algorithm** - 间隔重复的间隔是科学验证过的
6. **看到错题先想 Pattern** - 比"做对"更重要的是"知道为什么没想出来"

---

## 📝 License

MIT - 个人学习工具，欢迎 Fork 和魔改。

---

## 🙏 设计理念

> 学习不是看了多少，而是记住了多少。
>
> 记住不是重复多少，而是主动回忆多少。
>
> 掌握不是做完多少题，而是能不看书做对多少题。
>
> **主动学习，而不是被动输入。**

详细设计文档参见 [DESIGN.md](./DESIGN.md)。

---

## 📤 部署到 GitHub

### 已被 `.gitignore` 排除的文件（不会上传）

| 路径 | 原因 |
|---|---|
| `.env` | 含 JWT 密钥，**机密** |
| `node_modules/` | 几百 MB 依赖，`npm install` 即可还原 |
| `.next/` | Next.js 编译产物 |
| `prisma/dev.db` | SQLite 数据库，含你的所有学习数据 |
| `book_pdf/*` | 体积大 + 可能有版权问题（保留 `.gitkeep` 占位） |
| `.dev.log` 等 | 本地开发日志 |
| `*.tsbuildinfo` | TypeScript 编译缓存 |

### 上传步骤

```powershell
# 1. 初始化
cd "I:\C++ 大厂求职学习管理系统"
git init
git add .
git status  # 检查是否有意外文件（如 .env）混入

# 2. 首次提交
git commit -m "feat: 初始化 C++ 学习管理系统 MVP V1"

# 3. 关联远程仓库（在 GitHub 上创建空仓库后）
git remote add origin https://github.com/<你的用户名>/cpp-learning-system.git
git branch -M main
git push -u origin main
```

### 给协作者的使用说明

```powershell
git clone https://github.com/<你的用户名>/cpp-learning-system.git
cd cpp-learning-system
cp .env.example .env       # 然后填入自己的 JWT_SECRET
npm install
npx prisma migrate dev
npm run db:seed             # 初始化示例数据
npm run dev
```

> ⚠️ **永远不要** 强制 `git add -f .env` 或 `git add -f prisma/dev.db`——这些文件包含机密 / 私人数据。
