import { filterByRange } from "./dashboard";
import { isDateString } from "./dates";
import { parseRangeKey } from "./types";
import type { DateString, Expense, PeriodSelection } from "./types";

export type PeriodParseResult = { selection: PeriodSelection; error?: string };

/** クエリ (range / from / to) から期間指定を決める。from・to が揃っていれば任意期間として扱う。 */
export function parsePeriod(params: { range?: string | null; from?: string | null; to?: string | null }): PeriodParseResult {
  const fallback: PeriodSelection = { kind: "preset", range: parseRangeKey(params.range) };
  const from = params.from?.trim() || undefined;
  const to = params.to?.trim() || undefined;
  if (!from && !to) return { selection: fallback };
  if (!from || !to) return { selection: fallback, error: "開始日と終了日の両方を指定してください" };
  if (!isDateString(from) || !isDateString(to)) {
    return { selection: fallback, error: "日付は YYYY-MM-DD 形式で指定してください" };
  }
  if (from > to) return { selection: fallback, error: "開始日は終了日以前の日付を指定してください" };
  return { selection: { kind: "custom", from, to } };
}

export function filterByCustomRange(expenses: Expense[], from: DateString, to: DateString): Expense[] {
  return expenses.filter((e) => e.spentOn >= from && e.spentOn < to);
}

/** 画面表示と CSV 出力の両方が使う共通のフィルター。 */
export function selectExpenses(expenses: Expense[], selection: PeriodSelection, today: DateString): Expense[] {
  return selection.kind === "custom"
    ? filterByCustomRange(expenses, selection.from, selection.to)
    : filterByRange(expenses, selection.range, today);
}
