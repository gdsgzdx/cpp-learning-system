"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  initial: {
    name: string;
    reviewRatio: number;
    dailyGoalMinutes: number;
    theme: string;
  };
}

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initial);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("设置已保存");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>学习偏好</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>用户名</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <Label>每日推荐学习时长（分钟）</Label>
          <Input
            type="number"
            value={form.dailyGoalMinutes}
            onChange={(e) => setForm({ ...form, dailyGoalMinutes: parseInt(e.target.value) || 120 })}
          />
        </div>

        <div>
          <Label>复习占比（{Math.round(form.reviewRatio * 100)}%）</Label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={form.reviewRatio}
            onChange={(e) => setForm({ ...form, reviewRatio: parseFloat(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            默认 60%。如果逾期内容多，可提高到 80%。系统会根据 backlog 动态调整。
          </p>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-1" />
          {loading ? "保存中..." : "保存"}
        </Button>
      </CardContent>
    </Card>
  );
}
