import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { username, oldPassword, newPassword } = body;

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    // 1. 验证旧密码 + 修改用户名
    const verifyRes = await fetch(new URL("/api/auth/login", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, password: oldPassword }),
    });
    if (!verifyRes.ok) {
      return NextResponse.json({ error: "当前密码错误" }, { status: 401 });
    }

    // 2. 如果用户名变了，检查是否被占用
    if (username !== user.username) {
      const exist = await prisma.user.findUnique({ where: { username } });
      if (exist) {
        return NextResponse.json({ error: "用户名已被占用" }, { status: 400 });
      }
    }

    // 3. 改密码
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.default.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.status === 401) return NextResponse.json({ error: "未登录" }, { status: 401 });
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
