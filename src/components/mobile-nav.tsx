"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "仪表盘" },
  { href: "/today", label: "今日任务" },
  { href: "/knowledge", label: "知识卡片" },
  { href: "/review", label: "复习" },
  { href: "/leetcode", label: "题库" },
  { href: "/mistakes", label: "错题本" },
  { href: "/patterns", label: "算法套路" },
  { href: "/analytics", label: "学习分析" },
  { href: "/resources", label: "学习资源" },
  { href: "/settings", label: "设置" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        className="md:hidden p-2 rounded-md hover:bg-accent"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex h-14 items-center justify-between px-4 border-b">
            <span className="font-semibold">菜单</span>
            <button onClick={() => setOpen(false)} className="p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-3 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
