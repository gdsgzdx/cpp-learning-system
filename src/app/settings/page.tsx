import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";
import { ThemeForm } from "@/components/settings/theme-form";
import { AccountForm } from "@/components/settings/account-form";
import { StudySessionClient } from "@/components/study-session";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <span className="sticker text-3xl">⚙️</span>
          设置
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          个性化你的学习偏好
        </p>
      </div>

      <SettingsForm
        initial={{
          name: user.name,
          reviewRatio: user.reviewRatio,
          dailyGoalMinutes: user.dailyGoalMinutes,
          theme: user.theme,
        }}
      />

      <ThemeForm current={user.theme} />

      <AccountForm
        initial={{
          username: user.username,
        }}
      />

      <StudySessionClient />

      <Card>
        <CardHeader>
          <CardTitle>关于</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>C++ 大厂求职学习管理系统</strong> v0.3.0 (V3 - 多主题)</p>
          <p>基于"主动回忆 + 间隔重复 + 错题复盘"的学习科学理念设计。</p>
          <p>核心原则：<strong>主动学习，而不是被动输入</strong>。</p>
          <p className="text-xs">设计与开发 2026 · Next.js + Prisma + SQLite</p>
        </CardContent>
      </Card>
    </div>
  );
}
