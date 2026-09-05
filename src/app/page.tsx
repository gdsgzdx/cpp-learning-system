import Link from "next/link";
import {
  Clock,
  Calendar,
  Brain,
  AlertTriangle,
  Trophy,
  Target,
  Flame,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { MasteryBar } from "@/components/mastery-bar";
import { HeroBanner, EmptyState } from "@/components/empty-state";
import { getDashboardData } from "@/lib/dashboard";
import { minutesToHours, cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  const { stats, weakTopics, todayPlan, lcByPattern } = data;

  const greeting = getGreeting();
  const heroEmoji = getHeroEmoji(stats);
  const stickers = [
    stats.streak > 0 ? `🔥 ${stats.streak}天连续` : null,
    stats.reviewDue > 0 ? `📚 ${stats.reviewDue}待复习` : null,
    stats.lcMastered > 0 ? `🏆 ${stats.lcMastered}题已掌握` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6 fade-in">
      {/* Hero Banner */}
      <HeroBanner
        emoji={heroEmoji}
        title={`${greeting}，${user.name} 👋`}
        description={
          stats.streak > 0
            ? `已连续学习 ${stats.streak} 天，继续保持这股劲头！`
            : "从今天开始你的学习之旅 🚀"
        }
        stickers={stickers}
      />

      {/* 关键指标 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="今日学习"
          value={minutesToHours(stats.todayStudyMinutes)}
          icon={Clock}
          highlight
        />
        <StatCard
          label="待复习"
          value={stats.reviewDue}
          sublabel={`共 ${stats.totalCards} 张卡片`}
          icon={Calendar}
        />
        <StatCard
          label="已逾期"
          value={stats.overdueCount}
          sublabel={stats.overdueCount > 0 ? "需优先处理" : "全部按时"}
          icon={AlertTriangle}
        />
        <StatCard
          label="LeetCode"
          value={`${stats.lcMastered}/${stats.lcMastered + stats.lcLearning}`}
          sublabel={`${stats.lcDue} 道待复习`}
          icon={Trophy}
        />
        <StatCard
          label="Recall 正确率"
          value={`${stats.recallAccuracy}%`}
          sublabel="最近 50 次"
          icon={Brain}
        />
        <StatCard
          label="平均掌握度"
          value={stats.avgMastery}
          sublabel="0-100"
          icon={Target}
        />
      </div>

      {/* Today's Plan */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Today
                </CardTitle>
                <CardDescription>{todayPlan.summary}</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/today">查看详情</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {todayPlan.reviewTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-3.5 w-3.5" />
                    复习 Review
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {todayPlan.reviewTasks.length} 项
                  </span>
                </div>
                <ul className="space-y-2">
                  {todayPlan.reviewTasks.slice(0, 4).map((task) => (
                    <li key={task.itemId}>
                      <Link
                        href={`/review?cardId=${task.itemId}`}
                        className="flex items-center justify-between rounded-md border bg-card/50 px-3 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <span>{task.title}</span>
                        <span className="text-xs text-muted-foreground">{task.reason}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {todayPlan.practiceTasks.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5" />
                    刷题 Practice
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {todayPlan.practiceTasks.length} 道
                  </span>
                </div>
                <ul className="space-y-2">
                  {todayPlan.practiceTasks.slice(0, 3).map((task) => (
                    <li key={task.itemId}>
                      <Link
                        href={`/leetcode/${task.itemId}`}
                        className="flex items-center justify-between rounded-md border bg-card/50 px-3 py-2 text-sm hover:bg-accent transition-colors"
                      >
                        <span>{task.title}</span>
                        <span className="text-xs text-muted-foreground">{task.reason}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {todayPlan.reviewTasks.length === 0 && todayPlan.practiceTasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>🎉 今日任务已完成！</p>
                <p className="text-sm mt-1">可以考虑学一些新内容，或者休息一下。</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weak Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-red-500" />
              Weak Topics
            </CardTitle>
            <CardDescription>掌握度最低的 Topic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weakTopics.length === 0 ? (
              <div className="text-center py-6">
                <div className="sticker sticker-lg mb-2">🌱</div>
                <p className="text-sm text-muted-foreground">还没有数据</p>
                <p className="text-xs text-muted-foreground mt-1">先添加一些知识卡就会出现在这里</p>
              </div>
            ) : (
              weakTopics.map((t) => (
                <div key={t.topicId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/knowledge?topic=${t.topicId}`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {t.name}
                    </Link>
                    <span className="text-xs text-muted-foreground font-mono">
                      {t.cardCount} 张
                    </span>
                  </div>
                  <MasteryBar score={t.avgMastery} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* LeetCode Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                LeetCode 进度
              </CardTitle>
              <CardDescription>各 Pattern 的掌握情况</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/leetcode">查看全部</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lcByPattern.length === 0 ? (
            <div className="text-center py-8">
              <div className="sticker sticker-lg mb-2">💻</div>
              <p className="text-sm text-muted-foreground">还没有 LeetCode 记录</p>
              <p className="text-xs text-muted-foreground mt-1">去题库添加第一道题 →</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {lcByPattern.slice(0, 8).map((p) => (
                <Link
                  key={p.pattern}
                  href={`/leetcode?pattern=${encodeURIComponent(p.pattern)}`}
                  className="rounded-md border bg-card/50 p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{p.pattern}</span>
                    <span className="text-xs text-muted-foreground font-mono">{p.count}</span>
                  </div>
                  <MasteryBar score={p.avgMastery} showLabel={false} />
                  <p className={cn("text-xs mt-1 font-mono", getMasteryTextColor(p.avgMastery))}>
                    {p.avgMastery.toFixed(0)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 提示卡 */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="p-5">
          <h4 className="text-sm font-medium mb-2">💡 今日提示</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {stats.overdueCount > 0
              ? `你有 ${stats.overdueCount} 个知识点已逾期。建议先去 /review 处理掉。`
              : stats.recallAccuracy < 70
              ? "最近主动回忆正确率偏低。学习新内容前先做一轮复习会更有效。"
              : stats.streak === 0
              ? "今天还没开始学习。打开 Today 页面开始你的第一次会话吧。"
              : "状态不错！记得隔几天做一次错题复习，长期记忆会显著提升。"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "深夜了 🌙";
  if (h < 12) return "Good morning ☀️";
  if (h < 18) return "Good afternoon 🌤️";
  return "Good evening 🌆";
}

function getHeroEmoji(stats: { overdueCount: number; streak: number; lcMastered: number }): string {
  if (stats.overdueCount > 5) return "😱";
  if (stats.overdueCount > 0) return "⚠️";
  if (stats.streak >= 7) return "🔥";
  if (stats.streak > 0) return "💪";
  if (stats.lcMastered > 10) return "🏆";
  return "🌱";
}

function getMasteryTextColor(score: number): string {
  if (score >= 81) return "text-purple-500";
  if (score >= 61) return "text-green-500";
  if (score >= 41) return "text-cyan-500";
  if (score >= 21) return "text-blue-500";
  return "text-slate-500";
}
