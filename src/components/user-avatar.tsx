"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Me {
  id: string;
  username: string;
  name: string;
  theme?: string;
}

export function UserAvatar() {
  const [me, setMe] = useState<Me | null>(null);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, []);
  if (!me) return null;
  const initial = (me.name ?? me.username ?? "?").slice(0, 1).toUpperCase();
  return (
    <Link
      href="/settings"
      className="flex items-center gap-3 px-5 py-3 border-b hover:bg-accent transition-colors"
    >
      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{me.name ?? me.username}</p>
        <p className="text-xs text-muted-foreground truncate">@{me.username}</p>
      </div>
    </Link>
  );
}
