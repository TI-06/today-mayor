# 今日の市長

タヌキ秘書と一緒に、1日3件の政策を判断するスマホ向け2D都市運営Webゲームです。

## 主な機能

- 登録なしで即プレイ、端末内オートセーブ
- 8分野・6地区・15住民・50件超の政策／続報イベント
- 直近の分野・人物・地区を避ける重複抑制抽選
- 即時効果、数日後の影響、条件付き連鎖、季節イベント
- 2D街並み、地区レベル、実績、市民図鑑、政策履歴
- タヌキ秘書の表情・短評・緊急案内
- PWA、オフラインキャッシュ、スマホ共有
- Cloudflare Worker health API

## ローカル実行

Node.js 22.16以上を使用します。外部パッケージは不要です。

```bash
npm run dev
```

ブラウザで `http://localhost:4173` を開きます。

## 検証

```bash
npm run verify
```

`node:test`、JavaScript型チェック、静的ビルドを順に実行します。

## GitHub

`.github/workflows/verify.yml` により、mainへのpushとPull Requestで自動検証します。

## Cloudflare公開（推奨: Pages）

1. このプロジェクトをGitHubリポジトリへpushします。
2. Cloudflare Dashboardで **Workers & Pages → Create → Pages → Import an existing Git repository** を選びます。
3. GitHubの `today-mayor` を接続します。
4. Build commandを `npm run build`、Output directoryを `dist` に設定します。
5. mainを本番ブランチにします。

`_headers` と `_redirects` はビルド時にdistへコピーされ、SPAの未一致URLは `index.html` へ戻ります。

## Workersへ拡張する場合

`wrangler.jsonc` と `worker/index.js` を用意済みです。D1やランキングAPIを追加する段階で、Workers Buildsへ切り替えられます。

## 次期追加を想定した境界

- Cloudflare D1: ユーザー、クラウド保存、全国選択率、ランキング
- Durable Objects: 都市対抗イベントや共同街
- R2: SNS共有画像、シーズン素材
- Turnstile: 不正投票・BOT対策

現在のMVPはAPI障害があっても端末内だけで完全に遊べます。
