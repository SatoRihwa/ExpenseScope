import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { DateRangeForm } from "@/components/DateRangeForm";
import { ExpenseTable } from "@/components/ExpenseTable";
import { RangeFilter } from "@/components/RangeFilter";
import { TrendChart } from "@/components/TrendChart";
import { requireUser } from "@/lib/auth/current-user";
import { buildDashboard, sumAmounts } from "@/lib/dashboard";
import { getDb } from "@/lib/db/connection";
import { formatYen, getToday, resolveRange } from "@/lib/dates";
import { parsePeriod, selectExpenses } from "@/lib/period";
import { listExpensesForUser } from "@/lib/services/expenses";
import { RANGE_OPTIONS } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = { range?: string; from?: string; to?: string };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await requireUser();
  const { selection, error } = parsePeriod(await searchParams);
  const today = getToday();
  const allExpenses = listExpensesForUser(getDb(), user);
  const custom = selection.kind === "custom";

  // 任意期間のときはタグ別集計を従来どおり全期間で出す (期間指定の影響を受けない)
  const summary = buildDashboard(allExpenses, selection.kind === "preset" ? selection.range : "all", today);
  const selected = selectExpenses(allExpenses, selection, today);
  const periodTotal = custom ? sumAmounts(selected) : summary.rangeTotal;
  const periodCount = custom ? selected.length : summary.rangeCount;

  const presetLabel = selection.kind === "preset" ? RANGE_OPTIONS.find((o) => o.key === selection.range)!.label : "";
  const periodLabel = custom ? `${selection.from} 〜 ${selection.to}` : presetLabel;
  const resolved = selection.kind === "preset" ? resolveRange(selection.range, today) : undefined;
  const csvQuery = custom ? `from=${selection.from}&to=${selection.to}` : `range=${selection.kind === "preset" ? selection.range : "all"}`;
  const maxTag = Math.max(1, ...summary.tagTotals.map((t) => t.total));

  const tagSummary = (
    <div className="card">
      <h2>タグ別の集計{custom ? "（全期間）" : ""}</h2>
      {custom ? <p className="note">この集計は期間指定の影響を受けません。</p> : null}
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
  );

  return (
    <>
      <AppHeader user={user} />
      <main className="container">
        <div className="page-head">
          <div>
            <h1>ダッシュボード</h1>
            <p className="muted">
              基準日 {today} ／ 集計期間: {custom ? `任意期間（${periodLabel}）` : `${presetLabel}（${resolved?.from ?? "最初"} 〜 ${resolved?.to}）`}
            </p>
          </div>
          <RangeFilter current={selection.kind === "preset" ? selection.range : null} />
        </div>

        <section className="card">
          <DateRangeForm
            from={custom ? selection.from : undefined}
            to={custom ? selection.to : undefined}
            error={error}
          />
        </section>

        <section className="cards">
          <div className="card stat">
            <span className="stat-label">今月の支出合計</span>
            <strong data-testid="month-total">{formatYen(summary.monthTotal)}</strong>
            <span className="muted small">{today.slice(0, 7).replace("-", "年")}月</span>
          </div>
          <div className="card stat">
            <span className="stat-label">{custom ? "指定期間の支出合計" : "期間内の支出合計"}</span>
            <strong data-testid="range-total">{formatYen(periodTotal)}</strong>
            <span className="muted small">{periodLabel}</span>
          </div>
          <div className="card stat">
            <span className="stat-label">支出件数</span>
            <strong data-testid="range-count">{periodCount}件</strong>
            <span className="muted small">{periodLabel}</span>
          </div>
        </section>

        {custom ? (
          <section className="grid-2">
            <div className="card">
              <div className="section-head">
                <h2>指定期間の支出明細</h2>
                <a href={`/api/expenses/export?${csvQuery}`} className="button" download>
                  CSVをダウンロード
                </a>
              </div>
              <ExpenseTable expenses={selected} />
            </div>
            {tagSummary}
          </section>
        ) : (
          <>
            <section className="grid-2">
              <div className="card">
                <h2>支出推移（{summary.trendUnit === "day" ? "日別" : "月別"}）</h2>
                <TrendChart points={summary.trend} unit={summary.trendUnit} />
              </div>
              {tagSummary}
            </section>

            <section className="card">
              <div className="section-head">
                <h2>最近の支出</h2>
                <div className="actions">
                  <a href={`/api/expenses/export?${csvQuery}`} className="button" download>
                    CSVをダウンロード
                  </a>
                  <Link href="/expenses">すべての明細を見る</Link>
                </div>
              </div>
              <ExpenseTable expenses={summary.recent} />
            </section>
          </>
        )}
      </main>
    </>
  );
}
