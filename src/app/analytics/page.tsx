import { BarChart3, AlertTriangle, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { MasteryBar } from "@/components/mastery-bar";
import { DailyReviewForm } from "@/components/analytics/daily-review-form";
import { StudyChart } from "@/components/analytics/study-chart";
import { getAnalytics } from "@/lib/analytics";
import { minutesToHours } from "@/lib/utils";
import { requireUser } from "@/lib/auth";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const data = await getAnalytics(user.id);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          学习分析
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          本周数据 · 找到你的学习模式
        </p>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="本周学习"
          value={minutesToHours(data.weekTotal)}
          sublabel={`${data.sessionCount} 次 Session`}
          icon={TrendingUp}
        />
        <StatCard
          label="Recall 正确率"
          value={`${data.recallAccuracy}%`}
          sublabel={`${data.reviewCount} 次复习`}
          icon={Target}
        />
        <StatCard
          label="LeetCode 掌握"
          value={`${data.lcMastered}/${data.lcTotal}`}
          sublabel="独立完成"
          icon={Target}
        />
        <StatCard
          label="已逾期"
          value={data.overdueCount}
          sublabel={`共 ${data.totalCards} 张卡片`}
          icon={AlertTriangle}
        />
      </div>

      {/* 学习时长柱状图 */}
      <Card>
        <CardHeader>
          <CardTitle>本周学习时长（分钟）</CardTitle>
          <CardDescription>柱状越高，学习越多</CardDescription>
        </CardHeader>
        <CardContent>
          <StudyChart data={data.dailyStudy} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Topic 掌握度 */}
        <Card>
          <CardHeader>
            <CardTitle>Topic 掌握度</CardTitle>
            <CardDescription>按掌握度升序（最弱的在前面）</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topicStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无数据</p>
            ) : (
              data.topicStats.slice(0, 10).map((t) => (
                <div key={t.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.count} 张</span>
                  </div>
                  <MasteryBar score={t.avgMastery} showLabel={false} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pattern 掌握度 */}
        <Card>
          <CardHeader>
            <CardTitle>Pattern 掌握度</CardTitle>
            <CardDescription>算法 Pattern 学习情况</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.patternStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无 LeetCode 数据</p>
            ) : (
              data.patternStats.slice(0, 10).map((p) => (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.count} 道</span>
                  </div>
                  <MasteryBar score={p.avgMastery} showLabel={false} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 建议 */}
      <Card>
        <CardHeader>
          <CardTitle>💡 系统建议</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {data.overdueCount > 5 && (
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>你有 <strong>{data.overdueCount}</strong> 个知识点已逾期，建议暂停新内容先做复习。</span>
              </li>
            )}
            {data.recallAccuracy < 70 && data.reviewCount > 10 && (
              <li className="flex items-start gap-2">
                <span className="text-yellow-500">•</span>
                <span>本周主动回忆正确率只有 {data.recallAccuracy}%，可能需要降低每日新内容数量。</span>
              </li>
            )}
            {data.topicStats[0] && data.topicStats[0].avgMastery < 40 && (
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>
                  <strong>{data.topicStats[0].name}</strong> 掌握度仅 {data.topicStats[0].avgMastery}，建议优先攻克。
                </span>
              </li>
            )}
            {data.patternStats[0] && data.patternStats[0].avgMastery < 50 && (
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>
                  算法 <strong>{data.patternStats[0].name}</strong> 是最弱 Pattern（{data.patternStats[0].avgMastery}），暂停新增此类型题目，先巩固。
                </span>
              </li>
            )}
            {data.weekTotal < 600 && data.weekTotal > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>本周学习 {minutesToHours(data.weekTotal)}，低于日均 1.5h 目标。可适当提升专注度。</span>
              </li>
            )}
            {data.overdueCount === 0 && data.recallAccuracy >= 70 && data.weekTotal >= 600 && (
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>🎉 状态不错！继续保持节奏，可以适当增加新内容的比例。</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* 每日复盘 */}
      <DailyReviewForm />
    </div>
  );
}
