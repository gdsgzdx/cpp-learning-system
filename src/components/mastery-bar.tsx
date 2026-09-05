// 掌握度进度条
import { Progress } from "@/components/ui/progress";
import { cn, masteryColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { getMasteryLevel } from "@/lib/mastery";

interface MasteryBarProps {
  score: number;
  showLabel?: boolean;
}

export function MasteryBar({ score, showLabel = true }: MasteryBarProps) {
  const level = getMasteryLevel(score);
  return (
    <div className="space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">掌握度</span>
          <span className={cn("font-mono font-medium", masteryColor(score))}>
            {Math.round(score)} · {level.level}
          </span>
        </div>
      )}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full transition-all", masteryBg(score))}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

function masteryBg(score: number): string {
  if (score >= 81) return "bg-purple-500";
  if (score >= 61) return "bg-green-500";
  if (score >= 41) return "bg-cyan-500";
  if (score >= 21) return "bg-blue-500";
  return "bg-slate-500";
}

export function MasteryBadge({ score }: { score: number }) {
  const level = getMasteryLevel(score);
  return (
    <Badge variant="outline" className={cn("font-mono", level.color)}>
      {Math.round(score)} · {level.level}
    </Badge>
  );
}
