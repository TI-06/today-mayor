import {renderCityScene} from '../city/renderer.js';
import {deriveCityVisualState} from '../city/visual-state.js';
import {derivePonkichiReaction,renderPonkichi} from '../characters/ponkichi.js';
import {escapeHtml,renderGoalList,renderMetrics,PHASE_LABELS,PHASE_ACTIONS,formatMoney,signedMoney} from './components.js';
import {getEvent} from '../events/content.js';

export function renderHomeView(state,uiState={}){
  if(state.gameStatus!=='active')return `<main class="view home-view"><section class="game-over-panel"><span>🗳️</span><p>MAYOR'S TERM ENDED</p><h2>${escapeHtml(state.gameOverReason||'任期終了')}</h2><p>第${state.week}週・${escapeHtml(state.rank)}</p><button class="primary-action" data-action="restart">新しい街で再挑戦</button></section></main>`;
  const visual=deriveCityVisualState(state);
  const reaction=derivePonkichiReaction(state,uiState.reaction||{type:'home'});
  const latestSummary=state.weekSummaries?.[0];
  const activeEvent=state.eventPipelines.find(item=>item.stage!=='resolved');
  const activeEventDef=activeEvent?getEvent(activeEvent.eventId):null;
  const latestAuto=state.autoHandledCases?.find(report=>report.week===state.week);
  return `<main class="view home-view">
    <section class="week-heading"><div><span>第${state.week}週・第${state.term}期</span><h2>${PHASE_LABELS[state.phase]}</h2></div><b>${state.weeklyFocus?'方針設定済み':'方針未設定'}</b></section>
    ${renderCityScene(visual)}
    <section class="ponkichi-panel">${renderPonkichi(reaction,state.equippedSkin)}<div class="speech-bubble"><b>ポン吉</b><p>${escapeHtml(reaction.line)}</p></div></section>
    ${renderMetrics(state)}
    <section class="panel goal-panel"><div class="section-heading"><h3>今週の目標</h3><span>${state.weeklyGoals.filter(goal=>goal.status==='completed').length}/${state.weeklyGoals.length}</span></div>${renderGoalList(state.weeklyGoals)}</section>
    ${latestAuto?`<section class="panel auto-report"><div class="section-heading"><h3>ポン吉の自動処理</h3><span>−${formatMoney(latestAuto.totalCost||0)}</span></div><div>${(latestAuto.items||[]).map(item=>`<p><span>${escapeHtml(item.label)}</span><b>−${formatMoney(item.cost||0)}</b></p>`).join('')}</div></section>`:''}
    ${activeEvent?`<section class="breaking-card"><span>速報</span><div><b>${escapeHtml(activeEventDef?.title||'市政イベント')}</b><p>${activeEvent.stage==='preview'?'兆候を確認しています':activeEvent.stage==='response'?'対処判断が必要です':'続報を待っています'}</p></div></section>`:''}
    ${latestSummary&&state.phase==='summary'?`<section class="panel summary-mini"><h3>第${latestSummary.week}週の決算</h3><div><span>収入 ${formatMoney(latestSummary.income)}</span><span>支出 ${formatMoney(latestSummary.expense)}</span><b>${signedMoney(latestSummary.balance)}</b></div></section>`:''}
    <button class="primary-action phase-action" data-action="phase-action">${PHASE_ACTIONS[state.phase]}</button>
  </main>`;
}
