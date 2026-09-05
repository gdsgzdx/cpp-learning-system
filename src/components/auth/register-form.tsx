"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [name, setName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPwd) {
      setError("两次输入的密码不一致");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "注册失败");
        return;
      }
      router.replace("/");
      router.refresh();
    } catch (e) {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border rounded-lg p-6 bg-card">
      <div className="space-y-2">
        <Label htmlFor="reg-username">用户名</Label>
        <Input
          id="reg-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-name">昵称（可选）</Label>
        <Input
          id="reg-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="留空则用用户名"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">密码</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            tabIndex={-1}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-confirm">确认密码</Label>
        <Input
          id="reg-confirm"
          type={showPwd ? "text" : "password"}
          value={confirmPwd}
          onChange={(e) => setConfirmPwd(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <UserPlus className="h-4 w-4 mr-1" />
        )}
        创建账号
      </Button>
    </form>
  );
}
