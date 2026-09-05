"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog, Loader2, CheckCircle2 } from "lucide-react";

export function AccountForm({
  initial,
}: {
  initial: { username: string };
}) {
  const router = useRouter();
  const [username, setUsername] = useState(initial.username);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (newPassword && newPassword !== confirmPwd) {
      setMsg({ type: "error", text: "两次输入的新密码不一致" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          oldPassword,
          newPassword: newPassword || oldPassword, // 没改密码就传旧密码
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "更新失败" });
        return;
      }
      setMsg({ type: "ok", text: "账号信息已更新" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPwd("");
      router.refresh();
    } catch (e) {
      setMsg({ type: "error", text: "网络错误" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-4 w-4" />
          账号
        </CardTitle>
        <CardDescription>修改用户名或密码</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="acct-username">用户名</Label>
            <Input
              id="acct-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acct-old">当前密码</Label>
            <Input
              id="acct-old"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              placeholder="修改任何信息都需要先验证当前密码"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="acct-new">新密码</Label>
              <Input
                id="acct-new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="留空表示不修改"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acct-confirm">确认新密码</Label>
              <Input
                id="acct-confirm"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="再次输入"
              />
            </div>
          </div>

          {msg && (
            <div
              className={
                msg.type === "ok"
                  ? "text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded px-3 py-2 flex items-center gap-1"
                  : "text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded px-3 py-2"
              }
            >
              {msg.type === "ok" && <CheckCircle2 className="h-4 w-4" />}
              {msg.text}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            保存
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
