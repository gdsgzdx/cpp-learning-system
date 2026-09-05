// 工具函数
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd HH:mm");
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function minutesToHours(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h${m}m`;
}

export function difficultyColor(d: number): string {
  if (d <= 2) return "text-green-500";
  if (d <= 3) return "text-yellow-500";
  if (d <= 4) return "text-orange-500";
  return "text-red-500";
}

export function difficultyLabel(d: number): string {
  return ["", "入门", "基础", "中等", "困难", "专家"][d] || "中等";
}

export function masteryColor(score: number): string {
  if (score >= 81) return "text-purple-500";
  if (score >= 61) return "text-green-500";
  if (score >= 41) return "text-cyan-500";
  if (score >= 21) return "text-blue-500";
  return "text-slate-500";
}

export function masteryBg(score: number): string {
  if (score >= 81) return "bg-purple-500";
  if (score >= 61) return "bg-green-500";
  if (score >= 41) return "bg-cyan-500";
  if (score >= 21) return "bg-blue-500";
  return "bg-slate-500";
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return d < new Date();
}

export function isDueToday(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function isDue(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return d <= new Date();
}

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}
