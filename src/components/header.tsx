"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { ThemeMenu } from "./theme-picker";
import { useThemeMode } from "./theme-provider";
import { MobileNav } from "./mobile-nav";
import { StudySessionButton } from "./study-session-button";
import { QuickNoteButton } from "./quick-note-button";
import Link from "next/link";
import { GraduationCap, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { COLOR_THEMES, serializeTheme, type ColorTheme } from "@/lib/themes";

interface Me {
  id: string;
  username: string;
  name: string;
  theme?: string;
}

/** 主题色对应的头像背景渐变 */
const AVATAR_GRADIENTS: Record<ColorTheme, string> = {
  blue: "from-sky-400 to-blue-600",
  purple: "from-violet-400 to-purple-600",
  pink: "from-pink-400 to-rose-600",
  green: "from-emerald-400 to-green-600",
};

export function Header() {
  const router = useRouter();
  const { color: currentColor, mode, setMode, setColor } = useThemeMode();
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  /** 切换色彩：先 optimistic 写到 html，再 PATCH 保存到 DB */
  const handleColorChange = async (c: ColorTheme) => {
    setColor(c);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: serializeTheme(mode, c) }),
      });
    } catch {
      // ignore
    }
  };

  // 头像不再按主题色着——保持单色 primary，跟 Telegram 聊天头像一致
  // （主题色用于背景与按钮等）

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/80 backdrop-blur px-4 md:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span className="font-semibold">Study Hub</span>
        </Link>
      </div>
      <div className="flex items-center gap-1.5">
        <QuickNoteButton />
        <StudySessionButton />
        <ThemeMenu current={currentColor} onChange={handleColorChange} />
        <ThemeToggle />

        {/* 用户菜单 */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 h-9 px-2.5 rounded-md hover:bg-accent transition-colors text-sm"
            aria-label="账号菜单"
          >
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
              {(me?.name ?? me?.username ?? "?").slice(0, 1).toUpperCase()}
            </div>
            <span className="hidden sm:inline max-w-[100px] truncate">
              {me?.name ?? me?.username ?? "加载中"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
          {open && (
            <div className="absolute right-0 mt-1 w-52 rounded-md border bg-popover shadow-lg py-1 text-sm z-20">
              <div className="px-3 py-2 border-b">
                <p className="font-medium truncate">{me?.name ?? me?.username ?? ""}</p>
                {me?.name && me?.username !== me?.name && (
                  <p className="text-xs text-muted-foreground truncate">@{me.username}</p>
                )}
              </div>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent"
              >
                <User className="h-4 w-4" />
                个人资料
              </Link>
              <Link
                href="/settings#account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-accent"
              >
                <Settings className="h-4 w-4" />
                账号密码
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent text-red-500 border-t"
              >
                <LogOut className="h-4 w-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
