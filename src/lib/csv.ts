import type { Expense } from "./types";

export const CSV_HEADER = ["タグ", "日付", "金額", "メモ"] as const;

/** 表計算ソフトで式として解釈されうる先頭文字 */
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

function escapeCell(value: string): string {
  const safe = FORMULA_PREFIX.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Excel で文字化けしないよう UTF-8 BOM 付き、改行は CRLF。 */
export function buildExpensesCsv(expenses: Expense[]): string {
  const rows = expenses.map((e) => [escapeCell(e.tag), e.spentOn, String(e.amount), escapeCell(e.memo)].join(","));
  return `﻿${[CSV_HEADER.join(","), ...rows].join("\r\n")}\r\n`;
}
