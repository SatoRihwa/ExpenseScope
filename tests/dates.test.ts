import { describe, expect, it } from "vitest";
import { addDays, getToday, isDateString, resolveRange } from "@/lib/dates";

describe("日付ユーティリティ (YYYY-MM-DD)", () => {
  it("月またぎ・年またぎの加減算ができる", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("日付形式を検証する", () => {
    expect(isDateString("2026-11-10")).toBe(true);
    expect(isDateString("2026-02-30")).toBe(false);
    expect(isDateString("2026/11/10")).toBe(false);
  });

  it("7日間・30日間は今日を含み両端を含む", () => {
    expect(resolveRange("7d", "2026-11-10")).toEqual({ from: "2026-11-04", to: "2026-11-10" });
    expect(resolveRange("30d", "2026-11-10")).toEqual({ from: "2026-10-12", to: "2026-11-10" });
    expect(resolveRange("all", "2026-11-10")).toEqual({ from: null, to: "2026-11-10" });
  });

  it("APP_TODAY があればそれを使う", () => {
    expect(getToday({ APP_TODAY: "2026-11-10" })).toBe("2026-11-10");
  });

  it("APP_TODAY が無ければ指定タイムゾーンの日付を返す (UTC 16:00 は東京では翌日)", () => {
    const now = new Date("2026-10-31T16:00:00Z");
    expect(getToday({ APP_TIMEZONE: "Asia/Tokyo" }, now)).toBe("2026-11-01");
    expect(getToday({ APP_TIMEZONE: "UTC" }, now)).toBe("2026-10-31");
  });
});
