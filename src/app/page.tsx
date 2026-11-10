import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { ExpenseTable } from "@/components/ExpenseTable";
import { RangeFilter } from "@/components/RangeFilter";
import { TrendChart } from "@/components/TrendChart";
import { requireUser } from "@/lib/auth/current-user";
import { buildDashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db/connection";
import { formatYen, getToday, resolveRange } from "@/lib/dates";
import { listExpensesForUser } from "@/lib/services/expenses";
import { RANGE_OPTIONS, parseRangeKey } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const user = await requireUser();
  const range = parseRangeKey((await searchParams).range);
  const today = getToday();
  const summary = buildDashboard(listExpensesForUser(getDb(), user), range, today);
  const { from, to } = resolveRange(range, today);
  const rangeLabel = RANGE_OPTIONS.find((o) => o.key === range)!.label;
  const maxTag = Math.max(1, ...summary.tagTotals.map((t) => t.total));

  return (
    <>
      <AppHeader user={user} />
      <main className="container">
        <div className="page-head">
          <div>
            <h1>ダッシュボード</h1>
            <p className="muted">
              基準日 {today} ／ 集計期間: {rangeLabel}（{from ?? "最初"} 〜 {to}）
            </p>
          </div>
          <RangeFilter current={range} />
        </div>

        <section className="cards">
          <div className="card stat">
            <span className="stat-label">今月の支出合計</span>
            <strong data-testid="month-total">{formatYen(summary.monthTotal)}</strong>
            <span className="muted small">{today.slice(0, 7).replace("-", "年")}月</span>
          </div>
          <div className="card stat">
            <span className="stat-label">期間内の支出合計</span>
            <strong data-testid="range-total">{formatYen(summary.rangeTotal)}</strong>
            <span className="muted small">{rangeLabel}</span>
          </div>
          <div className="card stat">
            <span className="stat-label">支出件数</span>
            <strong data-testid="range-count">{summary.rangeCount}件</strong>
            <span className="muted small">{rangeLabel}</span>
          </div>
        </section>

        <section className="grid-2">
          <div className="card">
            <h2>支出推移（{summary.trendUnit === "day" ? "日別" : "月別"}）</h2>
            <TrendChart points={summary.trend} unit={summary.trendUnit} />
          </div>
          <div className="card">
            <h2>タグ別の集計</h2>
            {summary.tagTotals.length === 0 ? (
              <p className="muted">この期間の支出はありません。</p>
            ) : (
              <ul className="tag-list">
                {summary.tagTotals.map((t) => (
                  <li key={t.tag}>
                    <div className="tag-row">
                      <span className="tag">{t.tag}</span>
                      <span className="muted small">{t.count}件</span>
                      <strong>{formatYen(t.total)}</strong>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${(t.total / maxTag) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <h2>最近の支出</h2>
            <Link href="/expenses">すべての明細を見る</Link>
          </div>
          <ExpenseTable expenses={summary.recent} />
        </section>
      </main>
    </>
  );
}
