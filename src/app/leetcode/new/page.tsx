"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Flame, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PATTERNS, type PatternName } from "@/lib/patterns-list";

// 预定义来源列表
const SOURCES = [
  "剑指Offer",
  "LeetCode",
  "C++ Primer",
  "C++标准库",
  "操作系统",
  "计算机网络",
  "数据库",
  "其他",
];

export default function NewLeetcodePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pdfs, setPdfs] = useState<string[]>([]);
  const [form, setForm] = useState<{
    leetcodeNumber: string;
    title: string;
    difficulty: string;
    url: string;
    pattern: PatternName;
    source: string;
    chapter: string;
    isHot: boolean;
    pdfPath: string;
    pdfPage: string;
  }>({
    leetcodeNumber: "",
    title: "",
    difficulty: "Medium",
    url: "",
    pattern: "Sliding Window",
    source: "",
    chapter: "",
    isHot: false,
    pdfPath: "",
    pdfPage: "",
  });

  useEffect(() => {
    fetch("/api/pdf-list")
      .then((r) => r.json())
      .then((d) => setPdfs(d.pdfs ?? []))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.leetcodeNumber || !form.title || !form.pattern) return;
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        leetcodeNumber: parseInt(form.leetcodeNumber),
        title: form.title,
        difficulty: form.difficulty,
        url: form.url || undefined,
        pattern: form.pattern,
        source: form.source || undefined,
        chapter: form.chapter || undefined,
        isHot: form.isHot,
        pdfPath: form.pdfPath || undefined,
        pdfPage: form.pdfPage ? parseInt(form.pdfPage) : undefined,
      };
      const res = await fetch("/api/leetcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/leetcode/${data.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "保存失败");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">添加 LeetCode 题目</h1>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <X className="h-4 w-4 mr-1" />
          取消
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>题号 *</Label>
            <Input
              type="number"
              value={form.leetcodeNumber}
              onChange={(e) => setForm({ ...form, leetcodeNumber: e.target.value })}
              placeholder="3"
            />
          </div>
          <div>
            <Label>难度</Label>
            <Select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </Select>
          </div>
        </div>

        <div>
          <Label>题目名称 *</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="无重复字符的最长子串"
          />
        </div>

        <div>
          <Label>Pattern</Label>
          <Select
            value={form.pattern}
            onChange={(e) => setForm({ ...form, pattern: e.target.value as PatternName })}
          >
            {PATTERNS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label>LeetCode 链接</Label>
          <Input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://leetcode.cn/problems/..."
          />
        </div>

        {/* 扩展字段 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>来源书籍</Label>
            <Select
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            >
              <option value="">不选择</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>所属章节</Label>
            <Input
              value={form.chapter}
              onChange={(e) => setForm({ ...form, chapter: e.target.value })}
              placeholder="如: 2.3 链表"
            />
          </div>
        </div>

        {/* Hot 标记 */}
        <div className="flex items-center gap-3 rounded-md border p-3 bg-orange-500/5 border-orange-500/20">
          <input
            type="checkbox"
            id="isHot"
            checked={form.isHot}
            onChange={(e) => setForm({ ...form, isHot: e.target.checked })}
            className="accent-orange-500"
          />
          <label htmlFor="isHot" className="flex items-center gap-2 text-sm cursor-pointer">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium">大厂常考题</span>
            <span className="text-xs text-muted-foreground">标记后置顶显示</span>
          </label>
        </div>

        {/* PDF 关联 */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            关联 PDF（可选）
          </Label>
          <Select
            value={form.pdfPath}
            onChange={(e) => setForm({ ...form, pdfPath: e.target.value })}
          >
            <option value="">不关联</option>
            {pdfs.map((p) => (
              <option key={p} value={p}>
                {p.length > 55 ? "…" + p.slice(-52) : p}
              </option>
            ))}
          </Select>
          {form.pdfPath && (
            <Input
              type="number"
              min={1}
              value={form.pdfPage}
              onChange={(e) => setForm({ ...form, pdfPage: e.target.value })}
              placeholder="页码（可选，点击跳转）"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-1" />
            {loading ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
