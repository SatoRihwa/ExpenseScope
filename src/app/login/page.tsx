import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <main className="login-wrap">
      <div className="card login-card">
        <h1>ExpenseScope Demo</h1>
        <p className="muted">個人向け支出管理アプリ。検証用ユーザーでログインしてください。</p>
        <LoginForm />
        <p className="muted small">検証用ユーザーID: user-a (ユーザーA) / user-b (ユーザーB)</p>
      </div>
    </main>
  );
}
