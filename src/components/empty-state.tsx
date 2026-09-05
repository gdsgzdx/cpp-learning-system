"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** 主 emoji（大图） */
  emoji?: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 可选操作按钮 */
  action?: React.ReactNode;
  /** 额外贴纸数组 */
  stickers?: string[];
  className?: string;
}

/**
 * 空状态卡：大 emoji + 标题 + 描述 + 可选 CTA
 * 默认使用一张"卡通"插画感的大 emoji。
 */
export function EmptyState({
  emoji = "📭",
  title,
  description,
  action,
  stickers,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4 rounded-lg border border-dashed bg-muted/30 hero-gradient",
        className,
      )}
    >
      <div className="sticker sticker-lg mb-3">{emoji}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-4">{description}</p>
      )}
      {action}
      {stickers && stickers.length > 0 && (
        <div className="flex gap-2 mt-4 opacity-60">
          {stickers.map((s, i) => (
            <span key={i} className="sticker text-xl">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/** 小贴纸（inline 文本） */
export function StickerBubble({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <span className="sticker-bubble">
      <span className="text-base">{emoji}</span>
      <span>{children}</span>
    </span>
  );
}

/** 大 hero 卡片（左 emoji + 右 标题 + 描述） */
export function HeroBanner({
  emoji,
  title,
  description,
  stickers,
  children,
}: {
  emoji: string;
  title: string;
  description?: string;
  stickers?: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="relative hero-gradient rounded-xl p-6 border overflow-hidden">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="relative flex items-center gap-5 flex-wrap">
        <div className="sticker sticker-xl">{emoji}</div>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
          )}
          {stickers && stickers.length > 0 && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {stickers.map((s, i) => (
                <span key={i} className="sticker-bubble">
                  <span>{s}</span>
                </span>
              ))}
            </div>
          )}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
