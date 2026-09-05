/**
 * 全局 middleware：未登录访问受保护页面 → 跳 /login
 *
 * 注意：
 * - middleware 跑在 Edge runtime，不能直接用 Prisma / bcryptjs
 * - 这里只校验 JWT 签名，不查 DB（DB 调用由页面层兜底）
 * - 公开路径：/login /register /api/auth/* /api/pdf/*（PDF 文件本地预览，不需要登录？或者要？默认要）
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "cpp-study-hub-dev-secret-change-me-in-production";
const secretKey = new TextEncoder().encode(JWT_SECRET);

const PUBLIC_PATHS = [
  "/login",
  "/register",
];

const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/me",       // 用于 Header 显示当前用户（未登录也允许，返回 null）
  "/api/pdf-list",      // 列出 PDF 文件名，供前端下拉选择
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  // 静态资源 / _next 已被 Next 默认跳过
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;
  if (!token) {
    // API 请求 → 返回 401 JSON；页面请求 → 跳 /login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // 校验 JWT 签名（不再查 DB）
  try {
    await jwtVerify(token, secretKey);
    return NextResponse.next();
  } catch {
    // token 过期或伪造 → 清 cookie 并跳登录
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    const res = NextResponse.redirect(url);
    res.cookies.set("session", "", { path: "/", maxAge: 0 });
    return res;
  }
}

export const config = {
  // 跳过静态资源、_next、图片等
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
