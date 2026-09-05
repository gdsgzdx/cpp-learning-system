// Stat 卡片
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "flat";
  highlight?: boolean;
}

export function StatCard({ label, value, sublabel, icon: Icon, trend, highlight }: StatCardProps) {
  return (
    <Card className={cn(highlight && "border-primary/50 bg-primary/5")}>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {label}
            </p>
            <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
            {sublabel && (
              <p className="text-xs text-muted-foreground">{sublabel}</p>
            )}
          </div>
          {Icon && (
            <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
            {trend === "flat" && <Minus className="h-3 w-3 text-muted-foreground" />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
