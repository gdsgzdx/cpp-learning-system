/**
 * 主题色定义。前端颜色切换 + 后端校验白名单共用。
 *
 * 主题策略：双 class 系统
 *   - next-themes 管 .dark / .light
 *   - 我们管 .theme-{color}
 */
export const COLOR_THEMES = ["blue", "purple", "pink", "green"] as const;
export type ColorTheme = (typeof COLOR_THEMES)[number];

/** 解析 user.theme 字段 -> { mode, color } */
export function parseTheme(theme: string | null | undefined): { mode: "dark" | "light"; color: ColorTheme } {
  if (!theme) return { mode: "dark", color: "purple" };
  const [mode, color] = theme.split(":");
  return {
    mode: mode === "light" ? "light" : "dark",
    color: (COLOR_THEMES as readonly string[]).includes(color ?? "") ? (color as ColorTheme) : "purple",
  };
}

/** 序列化 { mode, color } -> "dark:purple" */
export function serializeTheme(mode: "dark" | "light", color: ColorTheme): string {
  return `${mode}:${color}`;
}

/** 主题色对应的展示配置（emoji + label + 中文） */
export const COLOR_THEME_META: Record<ColorTheme, { emoji: string; label: string; cn: string }> = {
  blue:   { emoji: "💙", label: "Ocean",  cn: "海洋蓝" },
  purple: { emoji: "💜", label: "Neon",   cn: "霓虹紫" },
  pink:   { emoji: "💖", label: "Bubblegum", cn: "泡泡粉" },
  green:  { emoji: "💚", label: "Forest", cn: "森林绿" },
};
