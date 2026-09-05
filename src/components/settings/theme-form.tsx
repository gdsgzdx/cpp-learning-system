"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemePicker } from "@/components/theme-picker";
import { useThemeMode } from "@/components/theme-provider";
import { serializeTheme, type ColorTheme } from "@/lib/themes";

export function ThemeForm({ current }: { current: string }) {
  const router = useRouter();
  const { mode, color, setMode, setColor } = useThemeMode();
  const [active, setActive] = useState<ColorTheme>(color);
  const [loading, setLoading] = useState(false);

  const handleColor = async (c: ColorTheme) => {
    setActive(c);
    setColor(c); // 立即应用
    setLoading(true);
    try {
      await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: serializeTheme(mode, c) }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleMode = async (m: "dark" | "light") => {
    setMode(m);
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: serializeTheme(m, active) }),
    });
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          主题外观
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>选择你喜欢的色彩风格</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="text-sm font-medium">主题色</div>
          <ThemePicker current={active} onChange={handleColor} />
          <p className="text-xs text-muted-foreground">
            影响按钮、链接、强调色等。已应用后会保存到你的账号。
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">明暗模式</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleMode("light")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-all ${mode === "light" ? "border-primary bg-primary/10 font-medium" : "hover:border-primary/40"}`}
            >
              ☀️ 亮色
            </button>
            <button
              type="button"
              onClick={() => handleMode("dark")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-all ${mode === "dark" ? "border-primary bg-primary/10 font-medium" : "hover:border-primary/40"}`}
            >
              🌙 暗色
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
