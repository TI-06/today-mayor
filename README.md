# 今日の市長

タヌキ秘書「ポン吉」と一緒に街を育てる、スマホ向け2D都市運営Webゲームです。

## Cloudflare Pages公開設定

公開資産は`site/`へ直接配置済みです。圧縮ファイルの復元や`npm install`は行いません。

| 設定項目 | 入力値 |
|---|---|
| Framework preset | `None` |
| Production branch | `main` |
| Build command | `bash cloudflare-build.sh` |
| Build output directory | `site` |
| Root directory | 空欄 |

`cloudflare-build.sh`は公開ファイルの存在確認とJavaScript構文チェックだけを行います。

## 公開ファイル

- `site/index.html`：ゲーム画面
- `site/styles.css`：スマホ向けUI
- `site/app.js`：政策・連鎖イベント・保存・実績・地区成長
- `site/sw.js`：オフラインキャッシュ
- `site/manifest.webmanifest`：ホーム画面追加設定
- `site/_headers`：セキュリティヘッダー
- `site/_redirects`：SPAフォールバック

## 主な機能

- 登録なしですぐ遊べる端末内オートセーブ
- 経済・福祉・教育・環境・防災・観光・交通・デジタルの8分野
- 6地区の成長と街並みの変化
- 住民・分野・直近案件を考慮した重複抑制抽選
- 即時効果、数日後の影響、失敗リスク、続報イベント
- タヌキ秘書の通常・笑顔・心配リアクション
- 政策履歴、実績、共有、PWA対応

## 公開後

Cloudflare Pagesが発行する`*.pages.dev`のURLをスマホで開いて確認してください。
