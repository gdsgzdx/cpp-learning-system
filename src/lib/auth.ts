/**
 * 鉴权层：用户名 + 密码，JWT 存 cookie。
 *
 * 关键概念：
 * - SessionToken: JWT，放在 httpOnly cookie "session" 里
 * - payload: { sub: userId, username }
 * - 有效期：7 天
 * - 工具函数 getCurrentUser() 从 cookie 读 + 解析 + 查 DB
 *
 * 用法：
 *   // Server Component / Route Handler
 *   const user = await getCurrentUser();         // 可能 null
 *   const user = await requireUser();            // null 时抛 401
 *
 *   // 登录 / 注册
 *   const token = await loginUser("alice", "123456");
 *   await setSessionCookie(token);
 */
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE_NAME = "session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 天（秒）
const JWT_SECRET = process.env.JWT_SECRET || "cpp-study-hub-dev-secret-change-me-in-production";

const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface SessionPayload {
  sub: string;     // userId
  username: string;
  iat?: number;
  exp?: number;
}

/** 给指定 userId 签发 JWT */
export async function signSessionToken(userId: string, username: string): Promise<string> {
  return await new SignJWT({ sub: userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/** 验证 JWT，返回 payload 或 null */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (typeof payload.sub === "string" && typeof payload.username === "string") {
      return payload as unknown as SessionPayload;
    }
    return null;
  } catch {
    return null;
  }
}

/** 写入 cookie */
export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

/** 清除 cookie */
export async function clearSessionCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** 读当前用户（不强制登录；可能为 null） */
export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  return user;
}

/** 强制要求登录；没登录则抛 401 */
export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = "未登录") {
    super(message);
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/** 工具：用户名校验（3-32 位，字母数字下划线连字符） */
export function isValidUsername(s: string): boolean {
  return /^[a-zA-Z0-9_-]{3,32}$/.test(s);
}

/** 工具：密码强度（至少 6 位） */
export function isValidPassword(s: string): boolean {
  return typeof s === "string" && s.length >= 6 && s.length <= 128;
}

/**
 * 登录：验证密码，返回 token + user 对象
 * 错误信息统一返回字符串，便于 API 层直接返回给前端
 */
export async function loginUser(username: string, password: string): Promise<{ token: string; user: { id: string; username: string; name: string } } | { error: string }> {
  if (!username || !password) return { error: "用户名和密码不能为空" };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "用户名或密码错误" };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "用户名或密码错误" };

  const token = await signSessionToken(user.id, user.username);
  return {
    token,
    user: { id: user.id, username: user.username, name: user.name },
  };
}

/**
 * 注册：创建新用户
 */
export async function registerUser(
  username: string,
  password: string,
  name?: string,
): Promise<{ token: string; user: { id: string; username: string; name: string } } | { error: string }> {
  if (!isValidUsername(username)) return { error: "用户名需 3-32 位字母数字下划线连字符" };
  if (!isValidPassword(password)) return { error: "密码至少 6 位" };

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return { error: "用户名已被占用" };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      passwordHash,
      name: name || username,
    },
  });
  const token = await signSessionToken(user.id, user.username);
  return {
    token,
    user: { id: user.id, username: user.username, name: user.name },
  };
}

/**
 * 修改密码
 */
export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ ok: true } | { error: string }> {
  if (!isValidPassword(newPassword)) return { error: "新密码至少 6 位" };
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "用户不存在" };
  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) return { error: "当前密码错误" };
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return { ok: true };
}
