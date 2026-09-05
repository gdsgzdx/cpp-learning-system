"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Brain,
  Code2,
  AlertTriangle,
  Layers,
  BarChart3,
  Library,
  Settings,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";

const NAV_ITEMS = [
  { href: "/", label: "仪表盘", icon: LayoutDashboard, emoji: "🏠" },
  { href: "/today", label: "今日任务", icon: Calendar, emoji: "📅" },
  { href: "/knowledge", label: "知识卡片", icon: BookOpen, emoji: "📚" },
  { href: "/review", label: "复习", icon: Brain, emoji: "🧠" },
  { href: "/leetcode", label: "题库", icon: Code2, emoji: "💻" },
  { href: "/mistakes", label: "错题本", icon: AlertTriangle, emoji: "⚠️" },
  { href: "/patterns", label: "算法套路", icon: Layers, emoji: "🧩" },
  { href: "/analytics", label: "学习分析", icon: BarChart3, emoji: "📊" },
  { href: "/resources", label: "学习资源", icon: Library, emoji: "📖" },
  { href: "/settings", label: "设置", icon: Settings, emoji: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-card/30">
      <div className="flex h-14 items-center gap-2 px-5 border-b">
        <span className="text-xl">🎓</span>
        <span className="font-semibold">C++ 求职学习</span>
      </div>
      <UserAvatar />
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <span className="text-base">{item.emoji}</span>
              {item.label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">💡 记住：</p>
        <p>主动回忆 &gt; 重复阅读</p>
      </div>
    </aside>
  );
}
