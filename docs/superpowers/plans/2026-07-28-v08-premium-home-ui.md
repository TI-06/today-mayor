# 今日の市長 v0.8 プレミアムホームUI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 承認済みの完成イメージを基準に、ホーム画面を高品質なスマホ向けゲームUIへ刷新し、ユーザー提供のポン吉画像へ軽量アニメーションを付ける。

**Architecture:** 週次進行や財政ロジックは変更せず、共通シェル、ホーム描画、ホーム専用指標、キャラクター素材、追加CSS、キャッシュ設定だけを置き換える。既存の街SVGは状態連動を維持したまま、新しいカードレイアウトへ組み込む。

**Tech Stack:** Vanilla JavaScript ES Modules、HTML、CSS、SVG埋め込みPNG、Cloudflare Pages、Node.js test runner

## Global Constraints

- 360×800、390×844、412×915で横スクロールを発生させない。
- 主要タップ領域は44px以上。
- CTAは初期表示内に置く。
- 既存の週次進行、財政、D1保存、ランキング処理は変更しない。
- `prefers-reduced-motion`ではキャラクターアニメーションを停止する。
- 既存の街状態ロジックを維持する。

---

### Task 1: ホーム構造の回帰テスト

**Files:**
- Modify: `tests/v07-ui.test.mjs`
- Modify: `tests/v07-deployment.test.mjs`

**Interfaces:**
- Consumes: `renderHomeView(state, uiState)`, `renderHomeMetrics(state)`
- Produces: 新レイアウトと新資産を固定する回帰テスト

- [ ] **Step 1: 失敗するホーム構造テストを追加**

`renderHomeView(createInitialState())`に対して、`premium-action-card`、`home-city-card`、`today-agenda`、`data-tab="city"`が含まれることを検証する。

- [ ] **Step 2: 失敗する主要指標テストを追加**

`renderHomeMetrics()`が`市民満足度`、`経済発展度`、`まちの魅力度`を出力し、魅力度が`life`、`environment`、`safety`の平均になることを検証する。

- [ ] **Step 3: 失敗する配信資産テストを追加**

`site/index.html`が`home-v080.css?v=0.8.0`と`app.js?v=0.8.0`を参照し、Service Workerが`today-mayor-v080`を使用することを検証する。

- [ ] **Step 4: テストを実行して失敗を確認**

Run: `npm test`
Expected: 新しいクラス、関数、資産参照がないためFAIL

### Task 2: 主要指標とホーム画面

**Files:**
- Modify: `site/js/ui/components.js`
- Modify: `site/js/ui/home-view.js`

**Interfaces:**
- Produces: `renderHomeMetrics(state): string`
- Consumes: `renderPonkichi`, `renderCityScene`, `PHASE_ACTIONS`

- [ ] **Step 1: `renderHomeMetrics`を実装**

`support`、`economy`、`Math.round((life + environment + safety) / 3)`を3枚のカードとして返す。

- [ ] **Step 2: ホームを承認済み順序へ変更**

`premium-action-card`、`home-city-card`、`renderHomeMetrics`、`today-agenda`、補助カードの順で描画する。旧`week-heading`と5列`metric-strip`はホームから外す。

- [ ] **Step 3: 対象テストを実行**

Run: `node --test tests/v07-ui.test.mjs`
Expected: PASS

### Task 3: 共通ヘッダーと下部ナビ

**Files:**
- Modify: `src/v07text/app/000.part`
- Modify: `src/v07text/app/003.part`

**Interfaces:**
- Produces: コンパクトな`premium-topbar`と5項目の`premium-bottom-nav`

- [ ] **Step 1: ホームモジュール参照をv0.8へ更新**

`home-view.js?v=0.8.0`を参照する。

- [ ] **Step 2: 共通ヘッダーを再構成**

アカウントチップを常時表示から外し、ブランド、通知ボタン、メニューボタンだけにする。通知ボタンは`data-tab="records"`で記録画面へ遷移する。

- [ ] **Step 3: ナビ順と文言を変更**

`ホーム`、`お仕事`、`市民の声`、`まちづくり`、`記録`の順にする。

### Task 4: ポン吉正式素材とアニメーションDOM

**Files:**
- Create: `site/assets/ponkichi-home-v080.svg`
- Modify: `site/js/characters/ponkichi.js`

**Interfaces:**
- Produces: `.ponkichi-home-asset`、`.ponkichi-eyelid-left`、`.ponkichi-eyelid-right`

- [ ] **Step 1: ユーザー提供PNGを最適化してSVGへ埋め込む**

透明PNGを幅480pxへ縮小し、SVGの`<image>`へBase64埋め込みする。

- [ ] **Step 2: `renderPonkichi`を新素材へ変更**

画像、左右まぶた、影、名前ラベルを出力する。状態クラス`mood-*`と`action-*`は維持する。

- [ ] **Step 3: キャラクターテストを更新**

旧SVG内部パーツ検査を、新画像参照とまばたきDOMの検査へ置き換える。

### Task 5: プレミアムCSS

**Files:**
- Create: `site/home-v080.css`
- Modify: `site/index.html`

**Interfaces:**
- Consumes: Task 2〜4のクラス名
- Produces: スマホ向け完成レイアウト

- [ ] **Step 1: 上部余白と共通シェルを整える**

`body`、`.app-shell`、`.premium-topbar`、`.money-bar`を参考画面の階層へ合わせる。

- [ ] **Step 2: 次の行動カードを実装**

クリーム色カード、左側コピー、右側ポン吉、緑CTA、装飾を実装する。

- [ ] **Step 3: 街カード・主要指標・予定カードを実装**

街カードは16:7前後、主要指標は3列、予定は1行カードとする。360px以下では文字と余白を縮小する。

- [ ] **Step 4: ポン吉アニメーションを実装**

`ponkichiFloat`、`ponkichiWave`、`ponkichiBlink`、`ponkichiShadow`を実装し、成功・警告状態の動きも維持する。

- [ ] **Step 5: 下部ナビを実装**

Safe Areaを考慮し、アクティブ項目だけ明るい緑のカードにする。

### Task 6: バージョン・キャッシュ・検証

**Files:**
- Modify: `package.json`
- Modify: `functions/api/health.js`
- Modify: `site/sw.js`
- Modify: `tests/v07-deployment.test.mjs`

**Interfaces:**
- Produces: v0.8.0配信

- [ ] **Step 1: バージョンを0.8.0へ更新**

`package.json`とhealth APIを更新する。

- [ ] **Step 2: Service Workerをv0.8へ更新**

新CSS、新ポン吉素材、v0.8参照のJSをキャッシュ対象へ追加し、CSS・JS・SVGはnetwork-firstを維持する。

- [ ] **Step 3: 全テストを実行**

Run: `npm run verify`
Expected: 全件PASS、JavaScript構文確認成功、Cloudflare資産確認成功

- [ ] **Step 4: 静的スマホ検査を実行**

360、390、412px相当で、横スクロール、CTA位置、下部ナビ、カード重なりを確認する。

- [ ] **Step 5: PRを作成してmainへマージ**

PRタイトル: `feat: 今日の市長 v0.8 プレミアムホームUI`
