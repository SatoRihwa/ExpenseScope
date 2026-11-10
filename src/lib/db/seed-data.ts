import type { DateString } from "../types";

export interface SeedUser {
  id: number;
  loginId: string;
  displayName: string;
  passwordEnv: "DEMO_USER_A_PASSWORD" | "DEMO_USER_B_PASSWORD";
}

export interface SeedExpense {
  id: number;
  userId: number;
  spentOn: DateString;
  amount: number;
  tag: string;
  memo: string;
}

export const SEED_USERS: SeedUser[] = [
  { id: 1, loginId: "user-a", displayName: "ユーザーA", passwordEnv: "DEMO_USER_A_PASSWORD" },
  { id: 2, loginId: "user-b", displayName: "ユーザーB", passwordEnv: "DEMO_USER_B_PASSWORD" },
];

/** 固定データ。id も固定なので、初期化のたびに同じ状態になる。 */
export const SEED_EXPENSES: SeedExpense[] = [
  // ユーザーA
  { id: 1, userId: 1, spentOn: "2026-09-15", amount: 12800, tag: "光熱費", memo: "9月分の電気代" },
  { id: 2, userId: 1, spentOn: "2026-10-01", amount: 2000, tag: "食費", memo: "月初のまとめ買い" },
  { id: 3, userId: 1, spentOn: "2026-10-30", amount: 3000, tag: "交通費", memo: "出張の電車代" },
  { id: 4, userId: 1, spentOn: "2026-10-31", amount: 4500, tag: "交際費", memo: "チームの懇親会" },
  { id: 5, userId: 1, spentOn: "2026-11-01", amount: 9000, tag: "日用品", memo: "ワークチェア用クッション" },
  { id: 6, userId: 1, spentOn: "2026-11-05", amount: 1200, tag: "食費", memo: "ランチ" },
  { id: 7, userId: 1, spentOn: "2026-11-08", amount: 2800, tag: "娯楽", memo: "映画チケット" },
  { id: 8, userId: 1, spentOn: "2026-11-10", amount: 1500, tag: "交通費", memo: "タクシー" },
  // ユーザーB
  { id: 9, userId: 2, spentOn: "2026-10-03", amount: 5400, tag: "食費", memo: "食材の宅配" },
  { id: 10, userId: 2, spentOn: "2026-10-20", amount: 15000, tag: "娯楽", memo: "ライブのチケット" },
  { id: 11, userId: 2, spentOn: "2026-11-02", amount: 7600, tag: "日用品", memo: "洗剤・消耗品" },
  { id: 12, userId: 2, spentOn: "2026-11-07", amount: 3300, tag: "交際費", memo: "友人への誕生日プレゼント" },
  { id: 13, userId: 2, spentOn: "2026-11-09", amount: 980, tag: "交通費", memo: "バス定期の差額" },
];
