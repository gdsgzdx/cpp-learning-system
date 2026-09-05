"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: Array<{ id: string; name: string }>;
}

export function CreateCardDialog({ open, onOpenChange, topics }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    topicId: topics[0]?.id ?? "",
    difficulty: 3,
    problemSolved: "",
    corePrinciple: "",
    differences: "",
    commonMistakes: "",
    codeExample: "",
    interviewQs: "",
    source: "",
    tags: "",
  });

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.topicId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onOpenChange(false);
        setForm({ ...form, title: "", problemSolved: "", corePrinciple: "", differences: "", commonMistakes: "", codeExample: "", interviewQs: "", tags: "" });
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-card p-4 z-10">
          <h2 className="text-lg font-semibold">新建知识卡片</h2>
          <button onClick={() => onOpenChange(false)} className="rounded-md p-1 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="title">知识点名称 *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="例如：unique_ptr"
              />
            </div>

            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Select
                id="topic"
                value={form.topicId}
                onChange={(e) => setForm({ ...form, topicId: e.target.value })}
              >
                <option value="">选择 Topic</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="difficulty">难度</Label>
              <Select
                id="difficulty"
                value={String(form.difficulty)}
                onChange={(e) => setForm({ ...form, difficulty: parseInt(e.target.value) })}
              >
                <option value="1">1 - 入门</option>
                <option value="2">2 - 基础</option>
                <option value="3">3 - 中等</option>
                <option value="4">4 - 困难</option>
                <option value="5">5 - 专家</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="source">来源</Label>
              <Select
                id="source"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              >
                <option value="">选择来源</option>
                <option value="书籍">书籍</option>
                <option value="视频">视频</option>
                <option value="博客">博客</option>
                <option value="LeetCode">LeetCode</option>
                <option value="项目">项目</option>
                <option value="其他">其他</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags（逗号分隔）</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="C++, Memory, Modern"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="problemSolved">它解决什么问题？</Label>
            <Textarea
              id="problemSolved"
              value={form.problemSolved}
              onChange={(e) => setForm({ ...form, problemSolved: e.target.value })}
              placeholder="例如：unique_ptr 用于实现独占所有权的资源管理..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="corePrinciple">核心原理</Label>
            <Textarea
              id="corePrinciple"
              value={form.corePrinciple}
              onChange={(e) => setForm({ ...form, corePrinciple: e.target.value })}
              placeholder="几句话讲清原理"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="differences">与类似概念的区别</Label>
            <Textarea
              id="differences"
              value={form.differences}
              onChange={(e) => setForm({ ...form, differences: e.target.value })}
              placeholder="例如：unique_ptr vs shared_ptr vs weak_ptr"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="commonMistakes">我容易犯的错误</Label>
            <Textarea
              id="commonMistakes"
              value={form.commonMistakes}
              onChange={(e) => setForm({ ...form, commonMistakes: e.target.value })}
              placeholder="例如：循环引用"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="codeExample">最小代码示例</Label>
            <Textarea
              id="codeExample"
              value={form.codeExample}
              onChange={(e) => setForm({ ...form, codeExample: e.target.value })}
              placeholder="auto p = std::make_unique<int>(10);"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="interviewQs">面试问题</Label>
            <Textarea
              id="interviewQs"
              value={form.interviewQs}
              onChange={(e) => setForm({ ...form, interviewQs: e.target.value })}
              placeholder="Q1: 为什么会有循环引用？"
              rows={2}
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-card p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !form.title.trim() || !form.topicId}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
