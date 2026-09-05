"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface Props {
  data: Array<{ date: string; minutes: number }>;
}

export function StudyChart({ data }: Props) {
  const formatted = data.map((d) => ({ date: d.date.slice(5), minutes: d.minutes }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 6,
          }}
          formatter={(v: any) => [`${v}m`, "学习"]}
        />
        <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.minutes > 60 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
