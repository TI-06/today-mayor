# 今日の市長

タヌキ秘書と一緒に、1日3件の政策を判断するスマホ向け2D都市運営Webゲームです。

## Cloudflare Pages公開設定

GitHub Actionsは使用しません。Cloudflare Pagesが公開用資産を展開します。

| 設定項目 | 入力値 |
|---|---|
| Framework preset | `None` |
| Production branch | `main` |
| Build command | `bash cloudflare-build.sh` |
| Build output directory | `dist` |
| Root directory | 空欄 |

Cloudflare Dashboardで **Workers & Pages → Create → Pages → Import an existing Git repository** を選択し、`TI-06/today-mayor`を接続してください。

## 仕組み

- `bootstrap/part-*.b64`：公開資産を圧縮・分割したデータ
- `cloudflare-build.sh`：Cloudflare上で資産を復元
- `dist/`：Cloudflare Pagesが公開する最終成果物

外部パッケージのインストールや`npm install`は不要です。

## 主な機能

- 登録なしで即プレイ、端末内オートセーブ
- 8分野・6地区・15住民・50件超の政策／続報イベント
- 直近の分野・人物・地区を避ける重複抑制抽選
- 即時効果、数日後の影響、条件付き連鎖、季節イベント
- 2D街並み、地区レベル、実績、市民図鑑、政策履歴
- タヌキ秘書の表情・短評・緊急案内
- PWA、オフラインキャッシュ、スマホ共有

## 公開後

Cloudflare Pagesが発行する`*.pages.dev`のURLをスマホで開いて確認してください。`_headers`と`_redirects`も公開資産に含まれています。
