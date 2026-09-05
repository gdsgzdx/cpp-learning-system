// 清空所有学习进度数据，但保留基础结构（主题、标签、书籍、剑指 Offer 题目等）
// 清空内容：
//   - ReviewRecord / RecallQuestion / LeetcodeAttempt / LeetcodeReview
//   - DailyReviewItem / DailyReview / WeeklyReview / LearningSession
//   - ProjectNote
// 重置状态：
//   - KnowledgeCard: 清空 review 统计，删除 RecallQuestion（连带）
//   - LeetcodeProblem: 状态重置 NotStarted，进度统计清零
//   - Resource: progress 重置 0, currentPage 清空
//   - Project: 保留（只是清空项目笔记）
//   - User: 保留（设置不动）

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 开始清除学习进度...\n");

  // 1. 删除所有复习/会话/笔记相关数据
  const a = await prisma.dailyReviewItem.deleteMany();
  console.log(`  ✓ 删除 DailyReviewItem: ${a.count}`);
  const b = await prisma.dailyReview.deleteMany();
  console.log(`  ✓ 删除 DailyReview: ${b.count}`);
  const c = await prisma.weeklyReview.deleteMany();
  console.log(`  ✓ 删除 WeeklyReview: ${c.count}`);
  const d = await prisma.learningSession.deleteMany();
  console.log(`  ✓ 删除 LearningSession: ${d.count}`);
  const e = await prisma.leetcodeReview.deleteMany();
  console.log(`  ✓ 删除 LeetcodeReview: ${e.count}`);
  const f = await prisma.leetcodeAttempt.deleteMany();
  console.log(`  ✓ 删除 LeetcodeAttempt: ${f.count}`);
  const g = await prisma.reviewRecord.deleteMany();
  console.log(`  ✓ 删除 ReviewRecord: ${g.count}`);
  const h = await prisma.recallQuestion.deleteMany();
  console.log(`  ✓ 删除 RecallQuestion: ${h.count}`);
  const i = await prisma.projectNote.deleteMany();
  console.log(`  ✓ 删除 ProjectNote: ${i.count}`);

  // 2. 重置 KnowledgeCard 复习统计（保留卡片本身）
  const j = await prisma.knowledgeCard.updateMany({
    data: {
      masteryScore: 0,
      reviewCount: 0,
      successCount: 0,
      failureCount: 0,
      interval: 0,
      ease: 2.5,
      memoryStrength: 0,
      lastReviewedAt: null,
      nextReviewAt: new Date(),
    },
  });
  console.log(`  ✓ 重置 KnowledgeCard 复习统计: ${j.count} 张`);

  // 3. 重置 LeetcodeProblem 进度（保留题目本身）
  const k = await prisma.leetcodeProblem.updateMany({
    data: {
      status: "NotStarted",
      masteryScore: 0,
      attemptCount: 0,
      independentSolveCount: 0,
      usedHintCount: 0,
      usedSolutionCount: 0,
      totalTime: 0,
      interval: 0,
      ease: 2.5,
      lastReviewedAt: null,
      nextReviewAt: new Date(),
    },
  });
  console.log(`  ✓ 重置 LeetcodeProblem 进度: ${k.count} 题`);

  // 4. 重置 Resource 进度
  const l = await prisma.resource.updateMany({
    data: {
      progress: 0,
      currentPage: null,
    },
  });
  console.log(`  ✓ 重置 Resource 进度: ${l.count} 个`);

  console.log("\n✨ 进度已清空！保留：主题、标签、书籍、剑指 Offer 题目、知识卡片内容");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
