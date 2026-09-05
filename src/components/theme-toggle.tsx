"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeMode } from "./theme-provider";

export function ThemeToggle() {
  const { mode, setMode } = useThemeMode();
  const isDark = mode === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMode(isDark ? "light" : "dark")}
      aria-label="切换明暗"
      title={isDark ? "切换到亮色" : "切换到暗色"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
