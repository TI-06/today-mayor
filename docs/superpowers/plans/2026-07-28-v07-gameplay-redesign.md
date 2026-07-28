# 今日の市長 v0.7 ゲーム性刷新 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1日3件処理型のゲームを、7〜10分で1週間を遊ぶ都市経営ゲームへ置き換え、市予算、重点方針、目標、4段階イベント、住民ストーリー、街の視覚変化、アニメ調ポン吉を実装する。

**Architecture:** D1、認証、クラウド保存、ランキング、PWAは維持し、ゲームロジックを`game`、`events`、`characters`、`city`、`ui`へ分割する。v0.7以前の保存状態は読み込まず、Local Storageキーと状態バージョンを更新して新規ゲームを生成する。

**Tech Stack:** Vanilla JavaScript ES Modules、HTML、CSS、SVG、Node.js built-in test runner、Cloudflare Pages Functions、Cloudflare D1。

## Global Constraints

- 対象バージョンは`0.7.0`。
- 旧セーブデータの移行、バックアップ、互換性維持は実装しない。
- 1週間の想定プレイ時間は7〜10分。
- 通常週の能動操作は3〜5回。
- 市予算、収入、支出、借金、予備費は億円単位の整数。
- 費用、維持費、支出後残高、翌週予測は実行前に表示する。
- 将来の副作用、住民反発、工期遅延などは一部非表示にできる。
- 市予算と衣装用葉っぱコインは完全に分離する。
- UIは幅360px以上のスマートフォンを最優先する。
- ポン吉は3頭身のアニメ調SVGとし、Live2D、3D、WebGLは使わない。
- D1未設定時も端末保存で遊べること。
- 実広告、実決済プロバイダーは接続しない。

---

## File Structure

### New game modules

- `site/js/game/state.js`: v0.7初期状態、状態検証、永続化対象の正規化。
- `site/js/game/finance.js`: 財政台帳、週次収支、予測、市債、予備費、財政危機。
- `site/js/game/week-engine.js`: 曜日フェーズ、週進行、週次決算、選挙までの進行制御。
- `site/js/game/focus.js`: 重点方針と委任方針。
- `site/js/game/goals.js`: 週次目標、任期目標、公約ミッション。
- `site/js/game/projects.js`: 大型プロジェクトの調査、承認、工事、完成、維持。
- `site/js/game/auto-cases.js`: ポン吉の軽微案件自動処理。

### New event and story modules

- `site/js/events/content.js`: 4段階イベント定義。
- `site/js/events/engine.js`: 予告、調査、対処、続報、完了の遷移。
- `site/js/characters/content.js`: 固定住民とストーリー定義。
- `site/js/characters/stories.js`: ストーリー解禁、選択、分岐、完了判定。
- `site/js/characters/ponkichi.js`: 表情、台詞、リアクション状態。

### New city and UI modules

- `site/js/city/visual-state.js`: 政策と状態から街表示パラメータを算出。
- `site/js/city/renderer.js`: SVG/CSS用の街マークアップを生成。
- `site/js/ui/components.js`: 資金バー、カード、選択肢、確認シートなどの共通部品。
- `site/js/ui/home-view.js`: 週進行、目標、ポン吉、ニュース。
- `site/js/ui/city-view.js`: 地区、街、建設、進行中プロジェクト。
- `site/js/ui/policy-view.js`: 重点方針、継続政策、大型事業。
- `site/js/ui/resident-view.js`: 住民関係とストーリー。
- `site/js/ui/records-view.js`: 台帳、週次決算、ニュース、ランキング。

### Existing files to modify

- `site/js/app.js`: 画面制御、イベントディスパッチ、保存、クラウド同期のみへ縮小。
- `site/js/content.js`: v0.6ゲームデータを廃止し、互換参照が残らないよう整理。
- `site/js/engine.js`: v0.7から参照しない。実装完了後に削除。
- `site/index.html`: 新UIのルート、ダイアログ、シート構造。
- `site/styles.css`: スマホ最優先レイアウト、財政バー、街、ポン吉アニメーション。
- `site/assets/tanuki-secretary.svg`: 3頭身アニメ調SVGへ置換。
- `site/sw.js`: キャッシュ名とv0.7モジュール一覧を更新。
- `site/manifest.webmanifest`: バージョン表記と説明を更新。
- `package.json`: 新モジュールの構文チェックを追加。
- `README.md`: v0.7のゲームループと保存仕様を記載。

### Tests

- `tests/v07-state.test.mjs`
- `tests/v07-finance.test.mjs`
- `tests/v07-week-engine.test.mjs`
- `tests/v07-goals.test.mjs`
- `tests/v07-events.test.mjs`
- `tests/v07-stories.test.mjs`
- `tests/v07-city.test.mjs`
- `tests/v07-integration.test.mjs`
- `tests/v07-deployment.test.mjs`

---

### Task 1: v0.7 State Foundation

**Files:**
- Create: `site/js/game/state.js`
- Create: `tests/v07-state.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `createInitialState(): GameState`
- Produces: `normalizeState(raw: unknown): GameState`
- Produces: `isV07State(raw: unknown): boolean`
- Produces: `GAME_VERSION = '0.7.0'`

- [ ] **Step 1: Write the failing state tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState,isV07State,normalizeState} from '../site/js/game/state.js';

test('v0.7 starts a new weekly game',()=>{
  const state=createInitialState();
  assert.equal(state.version,'0.7.0');
  assert.equal(state.week,1);
  assert.equal(state.phase,'focus');
  assert.equal(state.treasury,550);
  assert.equal(state.leaves,15);
  assert.deepEqual(state.ledgerEntries,[]);
});

test('old saves are rejected instead of migrated',()=>{
  assert.equal(isV07State({version:'0.6.0',budget:55}),false);
  assert.equal(normalizeState({version:'0.6.0',budget:55}).version,'0.7.0');
  assert.equal(normalizeState({version:'0.6.0',budget:55}).treasury,550);
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/v07-state.test.mjs`
Expected: FAIL because `site/js/game/state.js` does not exist.

- [ ] **Step 3: Implement the v0.7 state**

The initial state must include these exact top-level properties:

```js
{
  version:'0.7.0',
  week:1,
  phase:'focus',
  term:1,
  termWeek:1,
  treasury:550,
  weeklyIncome:0,
  weeklyExpense:0,
  projectedTreasury:550,
  debt:0,
  reserveFund:50,
  support:55,
  economy:50,
  life:50,
  environment:50,
  safety:50,
  councilApproval:55,
  weeklyFocus:null,
  delegationPolicy:'balanced',
  activeProjects:[],
  completedProjects:[],
  recurringPolicies:[],
  ledgerEntries:[],
  weeklyGoals:[],
  termGoals:[],
  manifesto:null,
  eventPipelines:[],
  residentStories:{},
  residents:{},
  districts:{},
  cityVisualState:{},
  newsQueue:[],
  autoHandledCases:[],
  leaves:15,
  ownedCosmetics:['classic'],
  equippedSkin:'classic',
  history:[],
  weekSummaries:[],
  gameStatus:'active',
  gameOverReason:null
}
```

`normalizeState` must return a new initial state whenever `raw.version !== '0.7.0'`.

- [ ] **Step 4: Run state tests**

Run: `node --test tests/v07-state.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/js/game/state.js tests/v07-state.test.mjs package.json
git commit -m "feat: add v0.7 game state"
```

---

### Task 2: Finance Ledger and Forecast

**Files:**
- Create: `site/js/game/finance.js`
- Create: `tests/v07-finance.test.mjs`

**Interfaces:**
- Consumes: `GameState` from `state.js`
- Produces: `postLedgerEntry(state, entry): GameState`
- Produces: `calculateWeeklyIncome(state): FinanceLine[]`
- Produces: `calculateWeeklyExpense(state): FinanceLine[]`
- Produces: `forecastNextTreasury(state): number`
- Produces: `settleWeek(state): {state, summary}`
- Produces: `issueBond(state, amount): {state, error?}`
- Produces: `transferReserve(state, amount): {state, error?}`
- Produces: `financeStatus(state): 'healthy'|'warning'|'crisis'|'bankrupt'`

- [ ] **Step 1: Write failing finance tests**

```js
test('ledger entries change treasury once',()=>{
  const state=createInitialState();
  const entry={id:'expense:road:1',week:1,phase:'policy',type:'expense',category:'policy',label:'道路補修',amount:-20,sourceId:'road',settlementKey:'initial'};
  const first=postLedgerEntry(state,entry);
  const second=postLedgerEntry(first,entry);
  assert.equal(first.treasury,530);
  assert.equal(second.treasury,530);
});

test('weekly settlement includes recurring costs and income',()=>{
  const state={...createInitialState(),economy:60,activeProjects:[{id:'station',weeklyCost:6}],recurringPolicies:[{id:'lunch',weeklyCost:4}]};
  const {state:next,summary}=settleWeek(state);
  assert.equal(summary.income>0,true);
  assert.equal(summary.expense>=10,true);
  assert.equal(next.weeklyIncome,summary.income);
  assert.equal(next.weeklyExpense,summary.expense);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/v07-finance.test.mjs`
Expected: FAIL because finance functions do not exist.

- [ ] **Step 3: Implement finance rules**

Use these baseline formulas:

```js
baseTax = 34;
economyTax = Math.round((state.economy - 50) * 0.5);
tourismIncome = completed project and focus modifiers;
administrationCost = 20;
debtInterest = Math.ceil(state.debt * 0.02);
```

`postLedgerEntry` must deduplicate by `sourceId + settlementKey + week`.

Finance status thresholds:

```js
bankrupt: treasury <= -150 || debt >= 1000
crisis: treasury < 0 || projectedTreasury < 0 || debt >= 700
warning: treasury < 120 || projectedTreasury < 80 || debt >= 400
healthy: otherwise
```

- [ ] **Step 4: Run finance tests**

Run: `node --test tests/v07-finance.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/js/game/finance.js tests/v07-finance.test.mjs
git commit -m "feat: add weekly finance ledger"
```

---

### Task 3: Weekly Focus, Delegation, and Phase Engine

**Files:**
- Create: `site/js/game/focus.js`
- Create: `site/js/game/auto-cases.js`
- Create: `site/js/game/week-engine.js`
- Create: `tests/v07-week-engine.test.mjs`

**Interfaces:**
- Produces: `FOCUS_OPTIONS`
- Produces: `selectWeeklyFocus(state, focusId): GameState`
- Produces: `DELEGATION_OPTIONS`
- Produces: `resolveAutoCases(state, rng): {state, report}`
- Produces: `PHASES = ['focus','policy','preview','project','response','city','summary']`
- Produces: `advancePhase(state, action): {state, output}`

- [ ] **Step 1: Write failing weekly progression tests**

```js
test('a week starts by selecting one focus',()=>{
  const state=createInitialState();
  const next=selectWeeklyFocus(state,'disaster');
  assert.equal(next.weeklyFocus,'disaster');
  assert.equal(next.phase,'policy');
});

test('summary advances to the next week',()=>{
  const state={...createInitialState(),phase:'summary',week:1,termWeek:1};
  const result=advancePhase(state,{type:'continue'});
  assert.equal(result.state.week,2);
  assert.equal(result.state.termWeek,2);
  assert.equal(result.state.phase,'focus');
});

test('auto cases create a visible report and ledger entries',()=>{
  const state={...createInitialState(),weeklyFocus:'life',delegationPolicy:'balanced'};
  const {state:next,report}=resolveAutoCases(state,()=>0.2);
  assert.equal(report.items.length>0,true);
  assert.equal(next.autoHandledCases.length>0,true);
  assert.equal(next.ledgerEntries.length>0,true);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/v07-week-engine.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement focus and weekly progression**

Focus IDs:

```js
finance, childcare, tourism, disaster, industry, environment, digital, life
```

Delegation IDs:

```js
balanced, save, resident_first, safety_first
```

`advancePhase` must never skip a required unresolved event or project decision.

- [ ] **Step 4: Run weekly engine tests**

Run: `node --test tests/v07-week-engine.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/js/game/focus.js site/js/game/auto-cases.js site/js/game/week-engine.js tests/v07-week-engine.test.mjs
git commit -m "feat: replace daily loop with weekly phases"
```

---

### Task 4: Goals, Manifesto, and Election Evaluation

**Files:**
- Create: `site/js/game/goals.js`
- Modify: `site/js/game/week-engine.js`
- Create: `tests/v07-goals.test.mjs`

**Interfaces:**
- Produces: `MANIFESTOS`
- Produces: `createWeeklyGoals(state, rng): Goal[]`
- Produces: `evaluateGoals(state): {state, completed, failed}`
- Produces: `selectManifesto(state, manifestoId): GameState`
- Produces: `evaluateTerm(state): {state, election}`

- [ ] **Step 1: Write failing goal tests**

```js
test('weekly goals evaluate against finance and metrics',()=>{
  const state={...createInitialState(),weeklyGoals:[{id:'black',type:'weekly_balance',target:0,status:'active'}],weeklyIncome:50,weeklyExpense:38};
  const result=evaluateGoals(state);
  assert.equal(result.completed[0].id,'black');
});

test('manifesto affects election score',()=>{
  const base={...createInitialState(),termWeek:12,support:58,manifesto:'childcare'};
  const failed=evaluateTerm({...base,life:45});
  const passed=evaluateTerm({...base,life:70});
  assert.equal(passed.election.score>failed.election.score,true);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/v07-goals.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement goal generation and 12-week election**

- A term is 12 weeks.
- Score 50 or higher wins reelection.
- Unmet manifesto applies a 12-point penalty.
- Bankruptcy ends the game before election evaluation.

- [ ] **Step 4: Run goal tests**

Run: `node --test tests/v07-goals.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/js/game/goals.js site/js/game/week-engine.js tests/v07-goals.test.mjs
git commit -m "feat: add weekly goals and manifesto elections"
```

---

### Task 5: Four-Stage Events

**Files:**
- Create: `site/js/events/content.js`
- Create: `site/js/events/engine.js`
- Create: `tests/v07-events.test.mjs`

**Interfaces:**
- Produces: `EVENTS`
- Produces: `selectEventPreview(state, rng): EventDefinition|null`
- Produces: `startEventPipeline(state, eventId): GameState`
- Produces: `investigateEvent(state, eventId, optionId): {state, reveal, error?}`
- Produces: `respondToEvent(state, eventId, optionId): {state, result, error?}`
- Produces: `resolveEventFollowup(state, eventId, rng): {state, result}`

- [ ] **Step 1: Write failing event transition tests**

```js
test('event follows preview investigation response followup resolved',()=>{
  let state=startEventPipeline(createInitialState(),'flood-warning');
  assert.equal(state.eventPipelines[0].stage,'preview');
  state=investigateEvent(state,'flood-warning','survey').state;
  assert.equal(state.eventPipelines[0].stage,'response');
  state=respondToEvent(state,'flood-warning','partial-evacuation').state;
  assert.equal(state.eventPipelines[0].stage,'followup');
  state=resolveEventFollowup(state,'flood-warning',()=>0.1).state;
  assert.equal(state.eventPipelines[0].stage,'resolved');
});

test('event cost cannot be charged twice',()=>{
  const started=startEventPipeline(createInitialState(),'flood-warning');
  const first=investigateEvent(started,'flood-warning','survey').state;
  const second=investigateEvent(first,'flood-warning','survey').state;
  assert.equal(second.treasury,first.treasury);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/v07-events.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement at least six event pipelines**

Required event IDs:

```js
flood-warning, factory-audit, tourism-boom, school-shortage, power-risk, mascot-scandal
```

Each event must define preview text, investigation choices, response choices, follow-up branches, costs, visible effects, hidden conditions, and news copy.

- [ ] **Step 4: Run event tests**

Run: `node --test tests/v07-events.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/js/events/content.js site/js/events/engine.js tests/v07-events.test.mjs
git commit -m "feat: add staged city events"
```

---

### Task 6: Projects and Recurring Policies

**Files:**
- Create: `site/js/game/projects.js`
- Create: `tests/v07-projects.test.mjs`

**Interfaces:**
- Produces: `PROJECTS`
- Produces: `startProject(state, projectId): {state, error?}`
- Produces: `advanceProjects(state): {state, updates}`
- Produces: `pauseProject(state, projectId): {state, error?}`
- Produces: `cancelRecurringPolicy(state, policyId): {state, error?}`

- [ ] **Step 1: Write failing project tests**

```js
test('project charges initial cost and progresses by week',()=>{
  const started=startProject(createInitialState(),'disaster-center').state;
  assert.equal(started.treasury,430);
  assert.equal(started.activeProjects[0].stage,'survey');
  const progressed=advanceProjects(started).state;
  assert.equal(progressed.activeProjects[0].weeksRemaining<started.activeProjects[0].weeksRemaining,true);
});

test('project cost is not charged twice',()=>{
  const first=startProject(createInitialState(),'disaster-center').state;
  const second=startProject(first,'disaster-center');
  assert.equal(second.state.treasury,first.treasury);
  assert.ok(second.error);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/v07-projects.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement six projects**

Required projects:

```js
disaster-center, station-redevelopment, child-support-hub, river-park, digital-city-hall, port-market
```

Each project defines initial cost, weekly cost, duration, district, visible effect, metric effect, and unlock requirements.

- [ ] **Step 4: Run project tests**

Run: `node --test tests/v07-projects.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/js/game/projects.js tests/v07-projects.test.mjs
git commit -m "feat: add multi-week city projects"
```

---

### Task 7: Resident Stories

**Files:**
- Create: `site/js/characters/content.js`
- Create: `site/js/characters/stories.js`
- Create: `tests/v07-stories.test.mjs`

**Interfaces:**
- Produces: `RESIDENTS`
- Produces: `STORIES`
- Produces: `availableStoryNodes(state): StoryNode[]`
- Produces: `resolveStoryChoice(state, storyId, nodeId, choiceId): {state, result}`

- [ ] **Step 1: Write failing story tests**

```js
test('resident story branches from prior choices',()=>{
  let state=createInitialState();
  state=resolveStoryChoice(state,'shopping-street','opening','support-youth').state;
  const nodes=availableStoryNodes({...state,week:3});
  assert.equal(nodes.some(node=>node.id==='mall-conflict'),true);
});

test('story changes relationship and city flags',()=>{
  const result=resolveStoryChoice(createInitialState(),'shopping-street','opening','support-youth').state;
  assert.equal(result.residents.shopkeeper>50,true);
  assert.equal(result.history.length,1);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/v07-stories.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement four multi-node stories**

Required story IDs:

```js
shopping-street, young-parent, factory-worker, student-council
```

Each story needs at least three nodes and two endings.

- [ ] **Step 4: Run story tests**

Run: `node --test tests/v07-stories.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add site/js/characters/content.js site/js/characters/stories.js tests/v07-stories.test.mjs
git commit -m "feat: add branching resident stories"
```

---

### Task 8: City Visual State and Animated Ponkichi

**Files:**
- Create: `site/js/city/visual-state.js`
- Create: `site/js/city/renderer.js`
- Create: `site/js/characters/ponkichi.js`
- Replace: `site/assets/tanuki-secretary.svg`
- Create: `tests/v07-city.test.mjs`

**Interfaces:**
- Produces: `deriveCityVisualState(state): CityVisualState`
- Produces: `renderCityScene(visualState): string`
- Produces: `derivePonkichiReaction(state, context): PonkichiReaction`
- Produces: `renderPonkichi(reaction, skinId): string`

- [ ] **Step 1: Write failing visual-state tests**

```js
test('economic growth increases pedestrians and lit shops',()=>{
  const visual=deriveCityVisualState({...createInitialState(),economy:75,completedProjects:['station-redevelopment']});
  assert.equal(visual.pedestrians>=4,true);
  assert.equal(visual.litShops>=5,true);
});

test('finance crisis selects worried ponkichi reaction',()=>{
  const reaction=derivePonkichiReaction({...createInitialState(),treasury:-20,projectedTreasury:-35},{type:'home'});
  assert.equal(reaction.mood,'panic');
  assert.match(reaction.line,/予算|財政/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/v07-city.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement the visual derivation**

`CityVisualState` must include:

```js
weather, pedestrians, tourists, trucks, litShops, trees, constructionSites, closedFacilities, floodLevel, mood, decorations
```

- [ ] **Step 4: Replace Ponkichi SVG**

The SVG must contain separately addressable groups with these IDs:

```text
ponkichi-body
ponkichi-head
ponkichi-eyes
ponkichi-mouth
ponkichi-ears
ponkichi-tail
ponkichi-arms
ponkichi-binder
ponkichi-leaf-hat
```

The visual direction is a 3-head-tall anime mascot with large eyes, dark tanuki mask markings, striped tail, navy municipal uniform, leaf hat, and readable facial expressions at 112px width.

- [ ] **Step 5: Add CSS animations**

Required animation classes:

```text
mood-normal, mood-happy, mood-worried, mood-panic, mood-proud, mood-tired, mood-angry
```

Required motions:

```text
blink, breathe, earTwitch, tailWag, mouthTalk, happyHop, panicShake, binderPresent, calculatorTap
```

- [ ] **Step 6: Run visual tests**

Run: `node --test tests/v07-city.test.mjs`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add site/js/city site/js/characters/ponkichi.js site/assets/tanuki-secretary.svg site/styles.css tests/v07-city.test.mjs
git commit -m "feat: animate the city and ponkichi"
```

---

### Task 9: Mobile-First UI Rewrite

**Files:**
- Create: `site/js/ui/components.js`
- Create: `site/js/ui/home-view.js`
- Create: `site/js/ui/city-view.js`
- Create: `site/js/ui/policy-view.js`
- Create: `site/js/ui/resident-view.js`
- Create: `site/js/ui/records-view.js`
- Rewrite: `site/js/app.js`
- Modify: `site/index.html`
- Modify: `site/styles.css`
- Create: `tests/v07-ui.test.mjs`

**Interfaces:**
- Produces: `renderMoneyBar(state): string`
- Produces: `renderHomeView(state, uiState): string`
- Produces: `renderCityView(state, uiState): string`
- Produces: `renderPolicyView(state, uiState): string`
- Produces: `renderResidentView(state, uiState): string`
- Produces: `renderRecordsView(state, uiState): string`

- [ ] **Step 1: Write failing markup tests**

```js
test('money bar always shows treasury and separates leaves',()=>{
  const html=renderMoneyBar({...createInitialState(),treasury:550,weeklyIncome:58,weeklyExpense:40,leaves:27});
  assert.match(html,/550億円/);
  assert.match(html,/\+18億円/);
  assert.match(html,/衣装/);
  assert.match(html,/27/);
});

test('expense confirmation shows post-spend balance',()=>{
  const html=renderExpensePreview({label:'防災センター',initialCost:120,weeklyCost:6},createInitialState());
  assert.match(html,/430億円/);
  assert.match(html,/毎週.*6億円/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/v07-ui.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement five-tab UI**

Tabs:

```text
home, city, policy, residents, records
```

The sticky money bar must stay visible above view content. The bottom navigation must respect `env(safe-area-inset-bottom)`.

- [ ] **Step 4: Implement action sheets instead of nested alerts**

Use one bottom sheet for focus, policy, project, investigation, event response, and finance detail. Confirmed expenses require a second explicit button inside the same sheet.

- [ ] **Step 5: Add responsive checks**

CSS must not produce horizontal scrolling at widths 360, 390, or 412 pixels. Primary buttons must be at least 48px high. Bottom-nav items must be at least 44px wide and high.

- [ ] **Step 6: Run UI tests**

Run: `node --test tests/v07-ui.test.mjs`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add site/js/ui site/js/app.js site/index.html site/styles.css tests/v07-ui.test.mjs
git commit -m "feat: rebuild the mobile game interface"
```

---

### Task 10: Cloud Save Version Gate and PWA Update

**Files:**
- Modify: `site/js/cloud.js`
- Modify: `site/sw.js`
- Modify: `site/manifest.webmanifest`
- Modify: `functions/api/health.js`
- Create: `tests/v07-deployment.test.mjs`

**Interfaces:**
- Consumes: `isV07State`
- Produces: cloud load returns `null` for non-v0.7 state.

- [ ] **Step 1: Write failing deployment tests**

```js
test('service worker caches v0.7 modules and excludes api routes',async()=>{
  const sw=await readFile('site/sw.js','utf8');
  assert.match(sw,/today-mayor-v07/);
  assert.match(sw,/request\.url.*\/api\//s);
  assert.match(sw,/game\/finance\.js/);
  assert.match(sw,/ui\/home-view\.js/);
});

test('health endpoint reports 0.7.0',async()=>{
  const source=await readFile('functions/api/health.js','utf8');
  assert.match(source,/version:'0\.7\.0'/);
});
```

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/v07-deployment.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Add cloud version gate**

- Local Storage key becomes `today-mayor-v07`.
- Cloud state with a version other than `0.7.0` is ignored.
- First v0.7 save overwrites the existing `saves.state_json` for the player.

- [ ] **Step 4: Update PWA and health version**

- Cache name: `today-mayor-v07`.
- Add all new modules to the static cache list.
- Keep `/api/*` network-only.
- Health version becomes `0.7.0`.

- [ ] **Step 5: Run deployment tests**

Run: `node --test tests/v07-deployment.test.mjs`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add site/js/cloud.js site/sw.js site/manifest.webmanifest functions/api/health.js tests/v07-deployment.test.mjs
git commit -m "chore: publish v0.7 cloud and pwa assets"
```

---

### Task 11: Integration, Long-Run Simulation, and Documentation

**Files:**
- Create: `tests/v07-integration.test.mjs`
- Modify: `tests/deployment.test.mjs`
- Modify: `package.json`
- Modify: `cloudflare-build.sh`
- Modify: `README.md`

**Interfaces:**
- Exercises all prior public interfaces.

- [ ] **Step 1: Write integration tests**

Cover these scenarios:

```text
12-week balanced playthrough reaches election without invalid numbers
12-week investment playthrough can enter finance warning without duplicate charges
flood event can be investigated and resolved
resident story can reach an ending
project completes and changes city visual state
cloud-disabled local game remains playable
all serialized numeric values are finite integers where required
```

- [ ] **Step 2: Run the full suite and observe failures**

Run: `npm run test`
Expected: any uncovered integration defects fail with specific assertions.

- [ ] **Step 3: Fix integration defects with minimal changes**

Do not weaken assertions. Fix the owning module for each defect.

- [ ] **Step 4: Update build verification**

`package.json` must run syntax checks for every new module. `cloudflare-build.sh` must verify these files exist:

```text
site/js/game/state.js
site/js/game/finance.js
site/js/game/week-engine.js
site/js/events/engine.js
site/js/characters/ponkichi.js
site/js/city/renderer.js
site/js/ui/home-view.js
site/assets/tanuki-secretary.svg
```

- [ ] **Step 5: Update README**

Document:

```text
v0.7 weekly gameplay
money display and weekly settlement
old saves are not migrated
D1 remains optional
Cloudflare build settings remain unchanged
```

- [ ] **Step 6: Run complete verification**

Run: `npm run verify`
Expected: all tests pass, all JavaScript syntax checks pass, and Cloudflare assets validate.

- [ ] **Step 7: Perform static review checks**

Run:

```bash
git diff --check
grep -R "decisionsLeft\|today-mayor-v02\|budget:" site/js site/index.html tests || true
grep -R "alert(" site/js || true
```

Expected:

- No trailing whitespace errors.
- No active v0.6 daily-loop references.
- No browser `alert()` usage.

- [ ] **Step 8: Commit**

```bash
git add tests package.json cloudflare-build.sh README.md
git commit -m "test: verify v0.7 weekly gameplay"
```

---

### Task 12: Code Review, Mobile Runtime Check, and Pull Request

**Files:**
- Review all files changed since `main`.

- [ ] **Step 1: Review architecture boundaries**

Verify:

```text
app.js does not contain finance or event calculations
finance.js does not render HTML
event engine does not mutate UI state
UI files do not write directly to Local Storage or D1
city renderer does not alter GameState
```

- [ ] **Step 2: Review correctness and security**

Verify:

```text
all currency operations are integer and finite
all user-facing text is escaped before insertion
cloud saves reject non-v0.7 state
API routes remain network-only
no payment or ad provider is activated
```

- [ ] **Step 3: Run mobile runtime checks**

Serve with:

```bash
npm run serve
```

Check widths:

```text
360x800
390x844
412x915
```

Verify:

```text
no horizontal scrolling
money bar remains visible
bottom nav does not cover actions
action sheets fit inside the viewport
primary controls can be reached with one thumb
Ponkichi remains readable at mobile size
```

- [ ] **Step 4: Re-run verification after review fixes**

Run: `npm run verify`
Expected: PASS with no skipped tests.

- [ ] **Step 5: Compare branch with main**

Run: `git diff --stat main...HEAD` and `git log --oneline main..HEAD`.
Expected: only v0.7 design, plan, implementation, tests, and documentation changes.

- [ ] **Step 6: Push and create PR**

PR title:

```text
release: 今日の市長 v0.7.0 ゲーム性刷新
```

PR body must include:

```text
weekly loop summary
finance system summary
event and story summary
mobile UI summary
Ponkichi redesign summary
old save incompatibility notice
full verification output
manual mobile check results
Cloudflare/D1 deployment notes
```
