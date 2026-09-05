import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient relative overflow-hidden">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <div className="w-full max-w-sm space-y-6 relative">
        <div className="text-center space-y-3">
          <div className="sticker sticker-xl">🚀</div>
          <h1 className="text-2xl font-bold tracking-tight">欢迎回来</h1>
          <p className="text-sm text-muted-foreground">
            C++ 大厂求职学习管理系统
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          还没有账号？{" "}
          <Link href="/register" className="text-primary hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  );
}
