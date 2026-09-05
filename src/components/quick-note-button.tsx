"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, BookOpen, Lightbulb, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichNoteEditor } from "@/components/rich-note-editor";
import { cn } from "@/lib/utils";

/**
 * 全局"快速记录"按钮
 *
 * 设计目标：用户随时想到一个知识点，5 秒内记下来。
 * - 只要求填：标题 + Topic
 * - 其他字段（核心原理、示例代码等）允许先空着，后续进详情页补全
 * - 不可降级：提交失败要明确提示
 *
 * 用法：<QuickNoteButton />
 */
export function QuickNoteButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [topics, setTopics] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"minimal" | "detailed">("minimal");
  const [form, setForm] = useState({
    title: "",
    topicId: "",
    difficulty: 3,
    source: "",
    tags: "",
    note: "", // 快速笔记（HTML 富文本）
  });

  // 打开时加载 topics 列表
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (topics.length === 0) {
      fetch("/api/topic")
        .then((r) => r.json())
        .then((data) => {
          const list = Array.isArray(data) ? data : data.topics ?? [];
          setTopics(list.map((t: any) => ({ id: t.id, name: t.name })));
          if (list[0]) setForm((f) => ({ ...f, topicId: f.topicId || list[0].id }));
        })
        .catch(() => setError("加载 Topic 失败"));
    }
  }, [open, topics.length]);

  const reset = () => {
    setForm({ title: "", topicId: topics[0]?.id ?? "", difficulty: 3, source: "", tags: "", note: "" });
    setError(null);
    setMode("minimal");
  };

  const handleSubmit = async () => {
    const t = form.title.trim();
    if (!t) {
      setError("标题不能为空");
      return;
    }
    if (!form.topicId) {
      setError("请选择 Topic");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 如果有快速笔记，把 HTML 笔记内容放到 corePrinciple 字段
      const noteText = form.note.replace(/<[^>]*>/g, "").trim();
      const body: any = {
        title: t,
        topicId: form.topicId,
        difficulty: form.difficulty,
        source: form.source || undefined,
        tags: form.tags || undefined,
      };
      if (noteText) {
        body.corePrinciple = form.note;
      }

      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "保存失败");
      }
      reset();
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="h-9"
        title="快速记录一个知识点"
      >
        <Plus className="h-4 w-4 mr-1" />
        记录
      </Button>

      {open && (
        <>
          {/* 点击外部关闭 */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 z-40 w-[420px] rounded-lg border bg-card shadow-xl p-4 space-y-3">
            {/* 头部 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">快速记录知识点</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 模式切换 */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setMode("minimal")}
                className={cn(
                  "px-2 py-1 rounded",
                  mode === "minimal" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                )}
              >
                极简（5 秒）
              </button>
              <button
                onClick={() => setMode("detailed")}
                className={cn(
                  "px-2 py-1 rounded",
                  mode === "detailed" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
                )}
              >
                带笔记
              </button>
            </div>

            {/* 表单 */}
            <div className="space-y-2">
              <div>
                <Label htmlFor="qn-title" className="text-xs">
                  知识点 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="qn-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例如：std::move、虚拟内存、LRU"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && mode === "minimal" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="qn-topic" className="text-xs">
                    Topic <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="qn-topic"
                    value={form.topicId}
                    onChange={(e) => setForm({ ...form, topicId: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {topics.length === 0 && <option value="">加载中…</option>}
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="qn-difficulty" className="text-xs">难度</Label>
                  <select
                    id="qn-difficulty"
                    value={String(form.difficulty)}
                    onChange={(e) => setForm({ ...form, difficulty: parseInt(e.target.value) })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="1">1 - 入门</option>
                    <option value="2">2 - 简单</option>
                    <option value="3">3 - 中等</option>
                    <option value="4">4 - 较难</option>
                    <option value="5">5 - 困难</option>
                  </select>
                </div>
              </div>

              {mode === "detailed" && (
                <>
                  <div>
                    <Label htmlFor="qn-note" className="text-xs flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      笔记（可选，先记下来再说）
                    </Label>
                    <RichNoteEditor
                      value={form.note}
                      onChange={(html) => setForm({ ...form, note: html })}
                      placeholder="例如：std::move 把左值转成右值引用，不复制；触发移动构造"
                      minHeight={80}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="qn-source" className="text-xs">来源</Label>
                      <Input
                        id="qn-source"
                        value={form.source}
                        onChange={(e) => setForm({ ...form, source: e.target.value })}
                        placeholder="书籍 / 视频 / 博客"
                      />
                    </div>
                    <div>
                      <Label htmlFor="qn-tags" className="text-xs">Tags</Label>
                      <Input
                        id="qn-tags"
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        placeholder="C++, Modern, Memory"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-muted-foreground">
                {mode === "minimal" ? "Enter 保存，其他字段稍后再补" : "可保存到核心原理字段"}
              </p>
              <Button onClick={handleSubmit} size="sm" disabled={loading}>
                <Save className="h-3.5 w-3.5 mr-1" />
                {loading ? "保存中…" : "保存"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
