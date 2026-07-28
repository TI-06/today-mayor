import {renderCityScene} from '../city/renderer.js?v=0.8.1';
import {deriveCityVisualState} from '../city/visual-state.js';
import {derivePonkichiReaction,renderPonkichi} from '../characters/ponkichi.js?v=0.8.1';
import {escapeHtml,renderGoalList,renderHomeMetrics,PHASE_LABELS,PHASE_ACTIONS,formatMoney,signedMoney} from './components.js';
import {getEvent} from '../events/content.js';

const PHASE_GUIDES={
  focus:{eyebrow:'次の行動',title:'今週の重点方針を決める',description:'市政の優先順位とポン吉の委任方針を選びます。ここから第1週が始まります。'},
  policy:{eyebrow:'重要判断',title:'今週の重要政策を決める',description:'費用、継続支出、期待効果を確認して政策を選びます。'},
  preview:{eyebrow:'兆候を確認',title:'届いた予告を調査する',description:'調査費を使うと、次の判断で隠れたリスクを確認できます。'},
  project:{eyebrow:'街を動かす',title:'事業・地区投資・住民相談',description:'大型事業を始めるか、地区や住民へ予算を使うか判断します。'},
  response:{eyebrow:'最終判断',title:'調査結果をもとに対処する',description:'事件への対応を決めます。選択は街と財政へ直接反映されます。'},
  city:{eyebrow:'結果確認',title:'今週の街の変化を見る',description:'政策と事業によって街がどう変わったか確認します。'},
  summary:{eyebrow:'週次決算',title:'収支と目標を確認する',description:'今週の成果を確認して、次の週へ進みます。'}
};

const PHASE_TIMES={focus:'09:00',policy:'10:30',preview:'11:00',project:'13:00',response:'15:00',city:'16:30',summary:'18:00'};

export function renderHomeView(state,uiState={}){
  if(state.gameStatus!=='active')return `<main class="view home-view"><section class="game-over-panel"><span>🗳️</span><p>MAYOR'S TERM ENDED</p><h2>${escapeHtml(state.gameOverReason||'任期終了')}</h2><p>第${state.week}週・${escapeHtml(state.rank)}</p><button class="primary-action" data-action="restart">新しい街で再挑戦</button></section></main>`;
  const visual=deriveCityVisualState(state);
  const reaction=derivePonkichiReaction(state,uiState.reaction||{type:'home'});
  const latestSummary=state.weekSummaries?.[0];
  const activeEvent=state.eventPipelines.find(item=>item.stage!=='resolved');
  const activeEventDef=activeEvent?getEvent(activeEvent.eventId):null;
  const latestAuto=state.autoHandledCases?.find(report=>report.week===state.week);
  const guide=PHASE_GUIDES[state.phase]||PHASE_GUIDES.focus;
  const goalSection=state.weeklyGoals.length
    ?`<section class="panel goal-panel"><div class="section-heading"><h3>今週の目標</h3><span>${state.weeklyGoals.filter(goal=>goal.status==='completed').length}/${state.weeklyGoals.length}</span></div>${renderGoalList(state.weeklyGoals)}</section>`
    :`<section class="goal-onboarding"><span>🎯</span><div><b>今週の目標はまだありません</b><p>方針を決めると今週の目標が自動で設定されます。</p></div></section>`;
  return `<main class="view home-view premium-home">
    <section class="premium-action-card">
      <div class="premium-action-copy">
        <div class="premium-action-meta"><span class="action-ribbon">🍃 ${guide.eyebrow}</span><button class="phase-status-button ${state.weeklyFocus?'is-set':''}" data-action="phase-action">${state.weeklyFocus?'方針設定済み':'方針未設定'}</button></div>
        <small class="premium-week-label">第${state.week}週・第${state.term}期</small>
        <h2>${guide.title}</h2>
        <p>${escapeHtml(reaction.line)}</p>
        <small class="premium-action-description">${guide.description}</small>
        <button class="primary-action next-action-button" data-action="phase-action">${PHASE_ACTIONS[state.phase]}</button>
      </div>
      <div class="premium-action-character">${renderPonkichi(reaction,state.equippedSkin)}<span class="character-sparkle sparkle-a">✦</span><span class="character-sparkle sparkle-b">✦</span></div>
    </section>
    <section class="home-city-card">
      <div class="home-city-label">あなたのまち</div>
      ${renderCityScene(visual)}
      <button class="home-city-button" data-tab="city"><span>▥</span> まちの様子 <b>›</b></button>
    </section>
    ${renderHomeMetrics(state)}
    <section class="today-agenda"><span class="agenda-icon">▣</span><div><b>今日の予定</b><p><time>${PHASE_TIMES[state.phase]||'09:00'}</time>${PHASE_LABELS[state.phase]}</p></div><button data-action="phase-action">予定を進める <b>›</b></button></section>
    ${goalSection}
    ${latestAuto?`<section class="panel auto-report"><div class="section-heading"><h3>ポン吉の自動処理</h3><span>−${formatMoney(latestAuto.totalCost||0)}</span></div><div>${(latestAuto.items||[]).map(item=>`<p><span>${escapeHtml(item.label)}</span><b>−${formatMoney(item.cost||0)}</b></p>`).join('')}</div></section>`:''}
    ${activeEvent?`<section class="breaking-card"><span>速報</span><div><b>${escapeHtml(activeEventDef?.title||'市政イベント')}</b><p>${activeEvent.stage==='preview'?'兆候を確認しています':activeEvent.stage==='response'?'対処判断が必要です':'続報を待っています'}</p></div></section>`:''}
    ${latestSummary&&state.phase==='summary'?`<section class="panel summary-mini"><h3>第${latestSummary.week}週の決算</h3><div><span>収入 ${formatMoney(latestSummary.income)}</span><span>支出 ${formatMoney(latestSummary.expense)}</span><b>${signedMoney(latestSummary.balance)}</b></div></section>`:''}
  </main>`;
}
