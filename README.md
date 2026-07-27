# 今日の市長 v0.6.0

タヌキ秘書「ポン吉」と一緒に、1日3件の政策を判断するスマホ向け都市運営ゲームです。

## Cloudflare Pages設定

| 項目 | 値 |
|---|---|
| Framework preset | `None` |
| Production branch | `main` |
| Build command | `bash cloudflare-build.sh` |
| Build output directory | `site` |
| Root directory | 空欄 |

静的ゲーム部分はD1なしでも動作します。`site/_routes.json`により、Pages Functionsを呼び出すのは`/api/*`だけです。Service Workerも`/api/*`をキャッシュせず、認証・保存・ランキングは常にネットワークへ問い合わせます。

## D1を使う機能

D1を設定すると、ユーザー登録、ログイン、クラウド保存、全国選択率、ランキングが有効になります。

1. CloudflareでD1データベース `today-mayor-db` を作成します。
2. D1コンソールで `schema.sql` を実行します。
3. Pagesプロジェクトの **Settings → Bindings → Add → D1 database** を開きます。
4. Variable nameを `DB` にして、作成したデータベースを選択します。
5. 最新コミットを再デプロイします。

## ローカル検証

```bash
npm run verify
npm run serve
```

## バージョン内容

- v0.2: タヌキ秘書刷新、街アニメーション、突発イベント
- v0.3: 住民関係値、議会、続報イベント
- v0.4: 地区建設、選挙、ゲームオーバー
- v0.5: D1クラウド保存、全国選択率、ランキング
- v0.6: アカウント、シーズン、衣装ショップ、広告・決済プロバイダー接続口

広告と決済は特定サービスをハードコードしていません。`window.TodayMayorMonetization`に`showRewardedAd`と`purchase`を実装すると有効になります。

本番運用前には、Turnstileまたはレート制限、利用規約、プライバシーポリシー、決済事業者のWebhook検証を追加してください。
