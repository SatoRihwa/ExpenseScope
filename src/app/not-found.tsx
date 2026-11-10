import Link from "next/link";

export default function NotFound() {
  return (
    <main className="login-wrap">
      <div className="card login-card">
        <h1>ページが見つかりません</h1>
        <p className="muted">指定された明細は存在しないか、閲覧できません。</p>
        <Link href="/" className="button primary">
          ダッシュボードへ
        </Link>
      </div>
    </main>
  );
}
