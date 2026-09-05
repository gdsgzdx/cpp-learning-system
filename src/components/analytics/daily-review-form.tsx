"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function DailyReviewForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    totalStudyTime: 0,
    topThree: "",
    stuckAt: "",
    biggestMistake: "",
    tomorrowFocus: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/daily-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("每日复盘已保存");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          每日复盘
        </CardTitle>
        <CardDescription>每天学习结束后填写（对应 Prompt 第十七节）</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>日期</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <Label>今日学习时长（分钟）</Label>
            <Input
              type="number"
              value={form.totalStudyTime}
              onChange={(e) => setForm({ ...form, totalStudyTime: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label>今天最重要的三个知识点</Label>
          <Textarea
            value={form.topThree}
            onChange={(e) => setForm({ ...form, topThree: e.target.value })}
            placeholder="1. unique_ptr 独占所有权&#10;2. RAII 资源管理&#10;3. vtable 多态实现"
            rows={3}
          />
        </div>

        <div>
          <Label>今天哪里卡住了？</Label>
          <Textarea
            value={form.stuckAt}
            onChange={(e) => setForm({ ...form, stuckAt: e.target.value })}
            placeholder="LC76 最小覆盖子串，窗口内计数判断逻辑..."
            rows={2}
          />
        </div>

        <div>
          <Label>今天最大的错误是什么？</Label>
          <Textarea
            value={form.biggestMistake}
            onChange={(e) => setForm({ ...form, biggestMistake: e.target.value })}
            placeholder="看到题目没立刻想到 Sliding Window..."
            rows={2}
          />
        </div>

        <div>
          <Label>明天最需要复习什么？</Label>
          <Textarea
            value={form.tomorrowFocus}
            onChange={(e) => setForm({ ...form, tomorrowFocus: e.target.value })}
            placeholder="move semantics 和完美转发"
            rows={2}
          />
        </div>

        <Button onClick={handleSubmit} disabled={loading}>
          <Save className="h-4 w-4 mr-1" />
          {loading ? "保存中..." : "保存复盘"}
        </Button>
      </CardContent>
    </Card>
  );
}
