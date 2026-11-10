import type { DateString, RangeKey } from "./types";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isDateString(value: string): boolean {
  const m = DATE_PATTERN.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/** YYYY-MM-DD に日数を加算する。UTC で計算するのでローカルタイムゾーンの影響を受けない。 */
export function addDays(date: DateString, days: number): DateString {
  const m = DATE_PATTERN.exec(date);
  if (!m) throw new Error(`Invalid date string: ${date}`);
  const shifted = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days));
  return formatUtc(shifted);
}

function formatUtc(d: Date): DateString {
  const y = String(d.getUTCFullYear()).padStart(4, "0");
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

/** "YYYY-MM" を返す。 */
export function monthOf(date: DateString): string {
  return date.slice(0, 7);
}

/** 指定タイムゾーンでの今日の日付。APP_TODAY が設定されていればそれを優先する (デモの再現性のため)。 */
export function getToday(env: Record<string, string | undefined> = process.env, now: Date = new Date()): DateString {
  const fixed = env.APP_TODAY?.trim();
  if (fixed) {
    if (!isDateString(fixed)) throw new Error(`APP_TODAY must be YYYY-MM-DD: ${fixed}`);
    return fixed;
  }
  const timeZone = env.APP_TIMEZONE?.trim() || "Asia/Tokyo";
  // en-CA は YYYY-MM-DD 形式で出力される
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export interface DateRange {
  /** 含む。null は下限なし */
  from: DateString | null;
  /** 含む */
  to: DateString;
}

/** 7日間 = 今日を含む直近7日、30日間 = 今日を含む直近30日。両端を含む。 */
export function resolveRange(range: RangeKey, today: DateString): DateRange {
  switch (range) {
    case "7d":
      return { from: addDays(today, -6), to: today };
    case "30d":
      return { from: addDays(today, -29), to: today };
    case "all":
      return { from: null, to: today };
  }
}

export function formatJapaneseDate(date: DateString): string {
  const [y, m, d] = date.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}
