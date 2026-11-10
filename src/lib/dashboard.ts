import { addDays, monthOf, resolveRange } from "./dates";
import type { DateString, Expense, RangeKey } from "./types";

export interface TagTotal {
  tag: string;
  total: number;
  count: number;
}

export interface TrendPoint {
  /** 日別は YYYY-MM-DD、月別は YYYY-MM */
  key: string;
  label: string;
  total: number;
}

export interface DashboardSummary {
  range: RangeKey;
  today: DateString;
  /** 今月 (today と同じ月) の支出合計。フィルターの影響を受けない */
  monthTotal: number;
  /** フィルター期間内の支出合計 */
  rangeTotal: number;
  /** フィルター期間内の支出件数 */
  rangeCount: number;
  tagTotals: TagTotal[];
  trend: TrendPoint[];
  trendUnit: "day" | "month";
  recent: Expense[];
}

export function filterByRange(expenses: Expense[], range: RangeKey, today: DateString): Expense[] {
  const { from, to } = resolveRange(range, today);
  return expenses.filter((e) => (from === null || e.spentOn >= from) && e.spentOn <= to);
}

export function sortNewestFirst(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => (a.spentOn === b.spentOn ? b.id - a.id : a.spentOn < b.spentOn ? 1 : -1));
}

export function sumAmounts(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + e.amount, 0);
}

export function aggregateByTag(expenses: Expense[]): TagTotal[] {
  const map = new Map<string, TagTotal>();
  for (const e of expenses) {
    const cur = map.get(e.tag) ?? { tag: e.tag, total: 0, count: 0 };
    cur.total += e.amount;
    cur.count += 1;
    map.set(e.tag, cur);
  }
  return [...map.values()].sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag, "ja"));
}

function dailyTrend(expenses: Expense[], from: DateString, to: DateString): TrendPoint[] {
  const totals = new Map<string, number>();
  for (const e of expenses) totals.set(e.spentOn, (totals.get(e.spentOn) ?? 0) + e.amount);
  const points: TrendPoint[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    points.push({ key: d, label: `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`, total: totals.get(d) ?? 0 });
  }
  return points;
}

function monthlyTrend(expenses: Expense[], today: DateString): TrendPoint[] {
  if (expenses.length === 0) return [];
  const totals = new Map<string, number>();
  for (const e of expenses) totals.set(monthOf(e.spentOn), (totals.get(monthOf(e.spentOn)) ?? 0) + e.amount);
  const first = [...totals.keys()].sort()[0]!;
  const last = monthOf(today);
  const points: TrendPoint[] = [];
  let [y, m] = first.split("-").map(Number) as [number, number];
  for (;;) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (key > last) break;
    points.push({ key, label: `${y}/${m}`, total: totals.get(key) ?? 0 });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return points;
}

export function buildDashboard(expenses: Expense[], range: RangeKey, today: DateString): DashboardSummary {
  const inRange = filterByRange(expenses, range, today);
  const month = monthOf(today);
  const monthTotal = sumAmounts(expenses.filter((e) => monthOf(e.spentOn) === month && e.spentOn <= today));
  const { from, to } = resolveRange(range, today);
  const trendUnit = range === "all" ? "month" : "day";
  return {
    range,
    today,
    monthTotal,
    rangeTotal: sumAmounts(inRange),
    rangeCount: inRange.length,
    tagTotals: aggregateByTag(inRange),
    trend: trendUnit === "day" ? dailyTrend(inRange, from!, to) : monthlyTrend(inRange, today),
    trendUnit,
    recent: sortNewestFirst(inRange).slice(0, 5),
  };
}
