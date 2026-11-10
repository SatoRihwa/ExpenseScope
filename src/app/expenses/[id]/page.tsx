import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { requireUser } from "@/lib/auth/current-user";
import { formatJapaneseDate, formatYen } from "@/lib/dates";
import { getDb } from "@/lib/db/connection";
import { getExpenseForUser } from "@/lib/services/expenses";

export const dynamic = "force-dynamic";

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const expense = getExpenseForUser(getDb(), user, Number(id));
  if (!expense) notFound();

  return (
    <>
      <AppHeader user={user} />
      <main className="container narrow">
        <div className="page-head">
          <div>
            <h1>支出の詳細</h1>
            <p className="muted">明細 ID: {expense.id}</p>
          </div>
          <Link href="/expenses" className="button">
            一覧に戻る
          </Link>
        </div>
        <section className="card">
          <dl className="detail">
            <dt>日付</dt>
            <dd>
              {expense.spentOn}（{formatJapaneseDate(expense.spentOn)}）
            </dd>
            <dt>金額</dt>
            <dd>
              <strong>{formatYen(expense.amount)}</strong>
            </dd>
            <dt>タグ</dt>
            <dd>
              <span className="tag">{expense.tag}</span>
            </dd>
            <dt>メモ</dt>
            <dd>{expense.memo || "（なし）"}</dd>
          </dl>
        </section>
      </main>
    </>
  );
}
