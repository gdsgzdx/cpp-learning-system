"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { COLOR_THEMES, type ColorTheme } from "@/lib/themes";

type Mode = "light" | "dark";

interface ThemeCtx {
  mode: Mode;
  color: ColorTheme;
  setMode: (m: Mode) => void;
  setColor: (c: ColorTheme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

/**
 * 纯自管主题系统（不依赖 next-themes）。
 * - dark/light -> <html class="dark"|"light">
 * - color      -> <html class="theme-{color}">
 * 服务端 layout 已经写入初始 class，客户端只在用户操作时改变。
 */
export function ThemeProvider({
  initialMode,
  initialColor,
  children,
}: {
  initialMode: Mode;
  initialColor: ColorTheme;
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<Mode>(initialMode);
  const [color, setColorState] = useState<ColorTheme>(initialColor);

  // 应用 class 到 html
  const apply = useCallback((m: Mode, c: ColorTheme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    // mode class
    root.classList.remove("dark", "light");
    root.classList.add(m);
    // color class
    for (const t of COLOR_THEMES) root.classList.remove(`theme-${t}`);
    root.classList.add(`theme-${c}`);
  }, []);

  // 首次 mount：保证客户端 hydrate 后 class 与服务端一致
  useEffect(() => {
    apply(initialMode, initialColor);
    // 只跑一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = useCallback(
    (m: Mode) => {
      setModeState(m);
      apply(m, color);
    },
    [apply, color],
  );

  const setColor = useCallback(
    (c: ColorTheme) => {
      setColorState(c);
      apply(mode, c);
    },
    [apply, mode],
  );

  return (
    <Ctx.Provider value={{ mode, color, setMode, setColor }}>{children}</Ctx.Provider>
  );
}

export function useThemeMode() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useThemeMode must be used inside ThemeProvider");
  return v;
}
