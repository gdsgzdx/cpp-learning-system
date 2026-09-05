import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import { parseTheme } from "@/lib/themes";

export const metadata: Metadata = {
  title: "C++ 大厂求职学习管理系统",
  description: "通过主动回忆、间隔重复、错题复盘提高长期记忆 - 专为 C++ 大厂求职设计",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const { mode, color } = parseTheme(user?.theme);

  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${mode} theme-${color}`}
    >
      <body className="min-h-screen font-sans">
        <ThemeProvider initialMode={mode} initialColor={color}>
          <AppShell colorTheme={color}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
