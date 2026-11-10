# ExpenseScope Demo

個人向けの支出管理 Web アプリ。Devin Review / Devin Security の技術ウェビナーで使うデモ用ベースアプリです。
このブランチ (`main`) は**意図的なバグ・脆弱性を含まない正常版**です。

## 技術構成

| 項目 | 内容 |
| --- | --- |
| フレームワーク | Next.js 15 (App Router) / React 19 / TypeScript (strict) |
| DB | SQLite (`better-sqlite3`) |
| テスト | Vitest |
| Lint | ESLint 9 (`eslint-config-next`) |
| Node.js | 22 LTS (`>=22.12 <23`) |

依存ライブラリはすべてバージョンを固定しています (`package.json` / `package-lock.json`)。グラフは依存なしの SVG で描画しています。

## セットアップ

```bash
npm ci
cp .env.example .env.local   # パスワードなどを必要に応じて編集
npm run db:seed              # DB 初期化 + 固定テストデータ投入
npm run dev                  # http://localhost:3000
```

ログイン情報 (パスワードは `.env.local` の値):

| ユーザー | ユーザーID | パスワード |
| --- | --- | --- |
| ユーザーA | `user-a` | `DEMO_USER_A_PASSWORD` |
| ユーザーB | `user-b` | `DEMO_USER_B_PASSWORD` |

`.env.local` は Git 管理対象外です。`.env.example` のパスワードはダミー値です。

## npm スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` / `npm start` | 本番ビルド / 起動 |
| `npm test` | Vitest (インメモリ SQLite を使用) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:init` | スキーマのみ作成 (データは変更しない) |
| `npm run db:seed` | テーブルを作り直し、固定データを投入 (何度実行しても同じ状態) |

## 環境変数

| 変数 | 内容 |
| --- | --- |
| `DEMO_USER_A_PASSWORD` / `DEMO_USER_B_PASSWORD` | 検証用ユーザーのパスワード (`db:seed` 時にハッシュ化して保存) |
| `DATABASE_PATH` | SQLite ファイルのパス (既定 `data/expensescope.db`) |
| `APP_TODAY` | 「今日」を固定する日付。デモの再現性のため `2026-11-10` を設定。空なら実際の日付 |
| `APP_TIMEZONE` | `APP_TODAY` 未設定時に「今日」を決めるタイムゾーン (既定 `Asia/Tokyo`) |
| `COOKIE_SECURE` | HTTPS 配信時のみ `true` |

## 画面

- `/login` ログイン
- `/` ダッシュボード (今月の支出合計・期間内合計・件数・推移グラフ・タグ別集計・最近の支出。`?range=7d|30d|all` で期間フィルター)
- `/expenses` 支出明細一覧 / `/expenses/:id` 明細詳細

## API

すべて Cookie のセッションで認証します (未認証は 401)。

| メソッド | パス | 内容 |
| --- | --- | --- |
| GET | `/api/me` | ログインユーザー情報 |
| GET | `/api/expenses?range=7d\|30d\|all` | 自分の支出一覧 (省略時 `all`) |
| GET | `/api/expenses/:id` | 支出詳細。他ユーザーの明細は 404 |

## 構成

```
src/
  app/                 画面 (Server Components) / API ルート / Server Actions
  components/          UI コンポーネント
  lib/
    auth/              パスワード・セッション・現在ユーザー (認証)
    repositories/      SQL によるデータアクセス (認可を知らない)
    services/          所有者確認を行うユースケース層 (認可)
    dashboard.ts       集計ロジック (純粋関数)
    dates.ts           YYYY-MM-DD の日付計算 (タイムゾーン非依存)
    db/                接続・スキーマ・シード
scripts/               db:init / db:seed
tests/                 Vitest
```

設計メモ:

- 認証 (`lib/auth`, `lib/api.ts`) とデータアクセス (`lib/repositories`) を分離し、所有者確認は `lib/services/expenses.ts` に集約。一覧・詳細の両方がここを通ります。
- セッショントークンは乱数で、DB にはハッシュのみ保存。毎リクエストでサーバー側検証します。
- 日付は `YYYY-MM-DD` 文字列のまま扱い、日数計算は UTC で行うためタイムゾーンによるずれがありません。
- 期間フィルターは両端を含みます: 7日間 = 今日を含む直近7日、30日間 = 今日を含む直近30日。

## テストデータ

固定 (`src/lib/db/seed-data.ts`)。基準日 `2026-11-10` の場合の期待値 (ユーザーA):

- 明細: 2026-10-01 ¥2,000 / 10-30 ¥3,000 / 10-31 ¥4,500 / 11-01 ¥9,000 ほか計 8 件
- 今月の支出合計: ¥14,500 (11/01 ¥9,000 + 11/05 ¥1,200 + 11/08 ¥2,800 + 11/10 ¥1,500)
- 30日間: 6件 ¥22,000 / 7日間: 3件 ¥5,500 / 全期間: 8件 ¥36,800

## 未実装 (後続 PR で追加予定)

- 任意の開始日・終了日を指定する期間フィルター
- CSV エクスポート

## 正常版コミット

後続の検証 (Devin Review / Security) の基準点として、正常版のコミットに Git タグ `baseline-v0.1.0` を付けています。

```bash
git rev-parse baseline-v0.1.0   # 正常版のコミット ID
```
