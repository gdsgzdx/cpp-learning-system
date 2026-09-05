"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Palette, Check } from "lucide-react";
import { COLOR_THEME_META, COLOR_THEMES, type ColorTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";

interface Props {
  current: ColorTheme;
  onChange: (color: ColorTheme) => Promise<void> | void;
  className?: string;
}

/** 顶部色板：横向 4 个圆形按钮，点选立刻保存 */
export function ThemePicker({ current, onChange, className }: Props) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {COLOR_THEMES.map((c) => {
        const meta = COLOR_THEME_META[c];
        const active = c === current;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={cn(
              "group relative flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all",
              active
                ? "border-primary bg-primary/10 shadow-md scale-105"
                : "border-border hover:border-primary/40 hover:scale-105",
            )}
          >
            <span className="text-lg">{meta.emoji}</span>
            <span className="text-sm font-medium">{meta.cn}</span>
            {active && (
              <Check className="h-3.5 w-3.5 text-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Header 用的下拉式主题选择（小巧） */
export function ThemeMenu({ current, onChange }: { current: ColorTheme; onChange: (c: ColorTheme) => void }) {
  const [open, setOpen] = useState(false);
  const meta = COLOR_THEME_META[current];
  const ref = (el: HTMLDivElement | null) => {
    // click outside
    if (typeof window === "undefined") return;
    document.addEventListener("mousedown", (e) => {
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }, { once: true });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 h-9 px-2.5 rounded-md hover:bg-accent transition-colors text-sm"
        title="主题色"
      >
        <Palette className="h-4 w-4" />
        <span>{meta.emoji}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-md border bg-popover shadow-lg p-2 z-20 space-y-1">
          {COLOR_THEMES.map((c) => {
            const m = COLOR_THEME_META[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => { onChange(c); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-sm hover:bg-accent transition-colors",
                  c === current && "bg-accent font-medium",
                )}
              >
                <span>{m.emoji}</span>
                <span className="flex-1 text-left">{m.cn}</span>
                {c === current && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
