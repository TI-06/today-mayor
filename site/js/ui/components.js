import {financeStatus,forecastNextTreasury} from '../game/finance.js';

export const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
export const formatMoney=value=>`${Math.round(Number(value)||0).toLocaleString('ja-JP')}億円`;
export const signedMoney=value=>`${Number(value)>=0?'+':'−'}${Math.abs(Math.round(Number(value)||0)).toLocaleString('ja-JP')}億円`;

export function renderMoneyBar(state){
  const balance=(state.weeklyIncome||0)-(state.weeklyExpense||0);
  const status=financeStatus(state);
  return `<section class="money-bar status-${status}" data-action="finance-detail" aria-label="市の財政状況">
    <div class="money-main"><span>🏛 市予算</span><strong>${formatMoney(state.treasury)}</strong></div>
    <div class="money-sub"><span>今週 <b>${signedMoney(balance)}</b></span><span>翌週 <b>${formatMoney(state.projectedTreasury??forecastNextTreasury(state))}</b></span></div>
    <div class="leaf-wallet"><span>衣装</span><b>🍃${Math.round(state.leaves||0)}</b></div>
  </section>`;
}

export function renderExpensePreview(item,state){
  const initialCost=Math.max(0,Math.round(item.initialCost||0));
  const weeklyCost=Math.max(0,Math.round(item.weeklyCost||0));
  const after=state.treasury-initialCost;
  const projected=(state.projectedTreasury??forecastNextTreasury(state))-initialCost-weeklyCost;
  return `<section class="expense-preview">
    <h3>${escapeHtml(item.label||item.name||'支出確認')}</h3>
    <dl>
      <div><dt>初期費用</dt><dd>−${formatMoney(initialCost)}</dd></div>
      <div><dt>毎週維持費</dt><dd>−${formatMoney(weeklyCost)}</dd></div>
      <div><dt>現在予算</dt><dd>${formatMoney(state.treasury)}</dd></div>
      <div class="expense-after"><dt>実施後残高</dt><dd>${formatMoney(after)}</dd></div>
      <div><dt>翌週予測</dt><dd>${formatMoney(projected)}</dd></div>
      <div><dt>予備費</dt><dd>${formatMoney(state.reserveFund)}</dd></div>
    </dl>
    ${after<0?'<p class="warning-copy">⚠ 実施後に市予算がマイナスになります。</p>':''}
  </section>`;
}

export function renderMetrics(state){
  const items=[['support','支持率','📣'],['economy','経済','📈'],['life','暮らし','🏠'],['environment','環境','🌿'],['safety','安心','🛟']];
  return `<section class="metric-strip">${items.map(([key,label,icon])=>`<article><span>${icon} ${label}</span><strong>${Math.round(state[key])}</strong><i><b style="width:${Math.max(0,Math.min(100,state[key]))}%"></b></i></article>`).join('')}</section>`;
}

export function renderHomeMetrics(state){
  const appeal=Math.round(((Number(state.life)||0)+(Number(state.environment)||0)+(Number(state.safety)||0))/3);
  const items=[
    {label:'市民満足度',value:Math.round(state.support||0),icon:'👥',tone:'green',note:(state.support||0)>=65?'良好':(state.support||0)>=45?'安定':'要注意'},
    {label:'経済発展度',value:Math.round(state.economy||0),icon:'📊',tone:'blue',note:(state.economy||0)>=65?'上昇中':(state.economy||0)>=45?'横ばい':'低迷中'},
    {label:'まちの魅力度',value:appeal,icon:'♥',tone:'rose',note:appeal>=65?'上昇中':appeal>=45?'安定':'改善余地'}
  ];
  return `<section class="home-metric-grid" aria-label="まちの主要指標">${items.map(item=>`<article class="home-metric-card tone-${item.tone}"><div class="home-metric-title"><span>${item.icon}</span><b>${item.label}</b></div><strong>${item.value}<small>%</small></strong><p>${item.note}</p><i><b style="width:${Math.max(0,Math.min(100,item.value))}%"></b></i></article>`).join('')}</section>`;
}

export const PHASE_LABELS={focus:'月曜・重点方針',policy:'火曜・重要政策',preview:'水曜・予告と調査',project:'木曜・事業と住民',response:'金曜・緊急対応',city:'土曜・街の変化',summary:'日曜・週次決算'};
export const PHASE_ACTIONS={focus:'今週の方針を決める',policy:'重要政策を判断する',preview:'予告を確認・調査する',project:'大型事業・住民相談へ',response:'調査結果から対処する',city:'街の変化を確認する',summary:'決算を確認して次週へ'};

export function renderGoalList(goals=[]){
  if(!goals.length)return '<div class="empty-state">重点方針を選ぶと今週の目標が決まります。</div>';
  return `<div class="goal-list">${goals.map(goal=>`<article class="goal-item status-${goal.status}"><span>${goal.status==='completed'?'✓':goal.status==='failed'?'×':'○'}</span><div><b>${escapeHtml(goal.label)}</b><small>${goal.status==='completed'?'達成':goal.status==='failed'?'未達成':'進行中'}</small></div></article>`).join('')}</div>`;
}

export function renderLedger(lines=[]){
  if(!lines.length)return '<div class="empty-state">資金の動きはまだありません。</div>';
  return `<div class="ledger-list">${lines.map(line=>`<article><div><b>${escapeHtml(line.label)}</b><small>第${line.week}週・${escapeHtml(line.category)}</small></div><strong class="${line.amount>=0?'income':'expense'}">${signedMoney(line.amount)}</strong></article>`).join('')}</div>`;
}
