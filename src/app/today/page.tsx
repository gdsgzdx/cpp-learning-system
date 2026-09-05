import Link from "next/link";
import { Clock, Brain, Code2, BookOpen, AlertTriangle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardData } from "@/lib/dashboard";
import { minutesToHours } from "@/lib/utils";
import { requireUser } from "@/lib/auth";

export default async function TodayPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  const { todayPlan, stats } = data;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">今日计划</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {today} · {todayPlan.summary}
        </p>
      </div>

      {/* 进度概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">复习任务</p>
            <p className="text-2xl font-bold mt-1">{todayPlan.reviewTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">刷题任务</p>
            <p className="text-2xl font-bold mt-1">{todayPlan.practiceTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">新学任务</p>
            <p className="text-2xl font-bold mt-1">{todayPlan.learnTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">预计时长</p>
            <p className="text-2xl font-bold mt-1">{minutesToHours(todayPlan.totalEstimatedMinutes)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue 提示 */}
      {stats.overdueCount > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">你有 {stats.overdueCount} 个逾期知识点</p>
              <p className="text-xs text-muted-foreground">
                逾期会让间隔重复失效，建议优先处理。
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/review">立即复习</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Review */}
      <TaskSection
        title="复习 Review"
        description="主动回忆，让长期记忆更牢固"
        icon={Brain}
        tasks={todayPlan.reviewTasks.map((t) => ({
          id: t.itemId,
          title: t.title,
          reason: t.reason,
          href: `/review?cardId=${t.itemId}`,
          estimatedMinutes: t.estimatedMinutes,
        }))}
        emptyText="没有待复习内容，去学点新东西吧。"
      />

      {/* Practice */}
      <TaskSection
        title="刷题 Practice"
        description="巩固算法 Pattern，积累实战"
        icon={Code2}
        tasks={todayPlan.practiceTasks.map((t) => ({
          id: t.itemId,
          title: t.title,
          reason: t.reason,
          href: `/leetcode/${t.itemId}`,
          estimatedMinutes: t.estimatedMinutes,
        }))}
        emptyText="今天没有安排 LeetCode。"
      />

      {/* Learn */}
      <TaskSection
        title="学习 Learn"
        description="学习新知识点，建立知识网络"
        icon={BookOpen}
        tasks={todayPlan.learnTasks.map((t) => ({
          id: t.itemId,
          title: t.title,
          reason: t.reason,
          href: `/knowledge/${t.itemId}`,
          estimatedMinutes: t.estimatedMinutes,
        }))}
        emptyText="今日没有新内容安排。"
      />

      {/* 复盘 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            今日复盘
          </CardTitle>
          <CardDescription>每天学习结束后填写</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href={`/analytics?focus=daily`}>填写复盘</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface Task {
  id: string;
  title: string;
  reason: string;
  href: string;
  estimatedMinutes: number;
}

function TaskSection({
  title,
  description,
  icon: Icon,
  tasks,
  emptyText,
}: {
  title: string;
  description: string;
  icon: any;
  tasks: Task[];
  emptyText: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">{emptyText}</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li key={t.id}>
                <Link
                  href={t.href}
                  className="flex items-center justify-between rounded-md border bg-card/50 p-3 hover:bg-accent transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.reason}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {t.estimatedMinutes}m
                    </Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
