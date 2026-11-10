import Link from "next/link";
import { logoutAction } from "@/app/actions";
import type { User } from "@/lib/types";

export function AppHeader({ user }: { user: User }) {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand">
          ExpenseScope <span className="badge">Demo</span>
        </Link>
        <nav className="nav">
          <Link href="/">ダッシュボード</Link>
          <Link href="/expenses">支出明細</Link>
        </nav>
        <div className="header-user">
          <span data-testid="current-user">{user.displayName}</span>
          <form action={logoutAction}>
            <button type="submit" className="button">
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
