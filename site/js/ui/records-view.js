import {escapeHtml,renderLedger,formatMoney,signedMoney} from './components.js';

export function renderRecordsView(state,uiState={}){
  const latest=state.weekSummaries?.[0];
  const ranking=uiState.ranking||[];
  return `<main class="view records-view">
    <div class="section-heading"><h2>週次決算</h2><span>${state.weekSummaries.length}週分</span></div>
    ${latest?`<section class="panel finance-summary"><div><span>収入</span><b>${formatMoney(latest.income)}</b></div><div><span>支出</span><b>${formatMoney(latest.expense)}</b></div><div class="balance"><span>収支</span><strong>${signedMoney(latest.balance)}</strong></div></section>`:'<div class="empty-state">最初の週次決算後に表示されます。</div>'}
    <div class="section-heading"><h2>財政台帳</h2><span>${state.ledgerEntries.length}件</span></div>${renderLedger([...state.ledgerEntries].reverse().slice(0,30))}
    <div class="section-heading"><h2>市政ニュース</h2><span>${state.newsQueue.length}件</span></div>
    <section class="news-list">${state.newsQueue.length?state.newsQueue.slice(0,20).map(news=>`<article class="panel news-card"><span>${news.type==='breaking'?'速報':news.type==='followup'?'続報':'市政'}</span><div><b>${escapeHtml(news.title)}</b><p>${escapeHtml(news.body)}</p><small>第${news.week}週</small></div></article>`).join(''):'<div class="empty-state">ニュースはまだありません。</div>'}</section>
    <div class="section-heading"><h2>全国ランキング</h2><span>${uiState.cloud?.available?'オンライン':'端末モード'}</span></div>
    <section class="ranking-list">${ranking.length?ranking.slice(0,10).map((item,index)=>`<article class="panel ranking-row"><b>${index+1}</b><div><strong>${escapeHtml(item.city_name)}</strong><small>${escapeHtml(item.rank_name)}</small></div><em>${Number(item.score).toLocaleString()} pt</em></article>`).join(''):'<div class="empty-state">D1接続後にランキングが表示されます。</div>'}</section>
  </main>`;
}
