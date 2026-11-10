/** 日付は常に "YYYY-MM-DD" 文字列で扱う。Date オブジェクトは UTC 計算の内部でのみ使う。 */
export type DateString = string;

export interface User {
  id: number;
  loginId: string;
  displayName: string;
}

export interface Expense {
  id: number;
  userId: number;
  spentOn: DateString;
  amount: number;
  tag: string;
  memo: string;
}

export type RangeKey = "7d" | "30d" | "all";

export const RANGE_OPTIONS: ReadonlyArray<{ key: RangeKey; label: string }> = [
  { key: "7d", label: "7日間" },
  { key: "30d", label: "30日間" },
  { key: "all", label: "全期間" },
];

export function parseRangeKey(value: string | null | undefined): RangeKey {
  return value === "7d" || value === "30d" || value === "all" ? value : "30d";
}
