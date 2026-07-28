import {deriveCityVisualState} from '../city/visual-state.js';
import {renderCityScene} from '../city/renderer.js';
import {PROJECTS} from '../game/projects.js';
import {escapeHtml,formatMoney} from './components.js';

const DISTRICTS=[['central','中央','🏙️'],['residential','住宅','🏘️'],['school','学園','🎓'],['industry','工業','🏭'],['port','港','⚓'],['river','河川','🌊']];
export function renderCityView(state){
  const visual=deriveCityVisualState(state);
  return `<main class="view city-view">
    <div class="section-heading"><h2>街の現在</h2><span>判断が景色に反映されます</span></div>
    ${renderCityScene(visual)}
    <section class="district-grid">${DISTRICTS.map(([id,name,icon])=>{const data=state.districts[id]||{level:1,exp:0};const project=PROJECTS.find(item=>item.district===id&&!state.completedProjects.includes(item.id)&&!state.activeProjects.some(active=>active.id===item.id));const invested=state.ledgerEntries.some(item=>item.sourceId===`district:${id}`&&item.settlementKey===`week:${state.week}`);return `<article class="panel district-card"><header><span>${icon}</span><div><b>${name}地区</b><small>Lv.${data.level}</small></div></header><div class="progress"><i style="width:${Math.min(100,(data.exp||0)/(data.level*35)*100)}%"></i></div><div class="district-actions"><button class="small-action invest-action" data-invest-district="${id}" ${invested?'disabled':''}>${invested?'今週投資済み':'重点投資'}<small>20億円</small></button>${project?`<button class="small-action" data-preview-project="${project.id}">${escapeHtml(project.name)}<small>${formatMoney(project.initialCost)}</small></button>`:'<small>新しい事業候補なし</small>'}</div></article>`}).join('')}</section>
    <div class="section-heading"><h2>進行中の大型事業</h2><span>${state.activeProjects.length}件</span></div>
    <section class="project-list">${state.activeProjects.length?state.activeProjects.map(project=>`<article class="panel project-row"><span>${project.stage==='survey'?'🔎':project.stage==='approval'?'🏛️':'🏗️'}</span><div><b>${escapeHtml(project.name)}</b><small>${escapeHtml(project.stage)}・残り${project.weeksRemaining}週</small><div class="progress"><i style="width:${Math.min(100,(project.progress/(project.progress+project.weeksRemaining))*100)}%"></i></div></div><button class="icon-action" data-pause-project="${project.id}">${project.status==='paused'?'▶':'Ⅱ'}</button></article>`).join(''):'<div class="empty-state">進行中の大型事業はありません。</div>'}</section>
  </main>`;
}
