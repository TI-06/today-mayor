import {FOCUS_OPTIONS,DELEGATION_OPTIONS} from '../game/focus.js';
import {PROJECTS} from '../game/projects.js';
import {escapeHtml,formatMoney} from './components.js';

export function renderPolicyView(state){
  return `<main class="view policy-view">
    <div class="section-heading"><h2>今週の重点方針</h2><span>第${state.week}週</span></div>
    <section class="focus-grid">${FOCUS_OPTIONS.map(item=>`<button class="focus-card ${state.weeklyFocus===item.id?'selected':''}" data-focus="${item.id}"><span>${item.icon}</span><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.description)}</small></button>`).join('')}</section>
    <div class="section-heading"><h2>ポン吉への委任方針</h2><span>軽微案件</span></div>
    <section class="segmented">${DELEGATION_OPTIONS.map(item=>`<button class="${state.delegationPolicy===item.id?'selected':''}" data-delegation="${item.id}">${escapeHtml(item.label)}</button>`).join('')}</section>
    <div class="section-heading"><h2>任期目標</h2><span>${state.manifesto?'公約設定済み':'公約未設定'}</span></div>
    <section class="term-goal-list">${state.termGoals.length?state.termGoals.map(goal=>`<article class="panel term-goal status-${goal.status}"><span>${goal.status==='completed'?'✓':goal.status==='failed'?'×':'◇'}</span><div><b>${escapeHtml(goal.label)}</b><small>${goal.status==='completed'?'達成':goal.status==='failed'?'未達成':'任期末に判定'}</small></div></article>`).join(''):'<div class="empty-state">週の開始時に選挙公約を決めると表示されます。</div>'}</section>
    <div class="section-heading"><h2>大型プロジェクト</h2><span>現在予算 ${formatMoney(state.treasury)}</span></div>
    <section class="project-catalog">${PROJECTS.map(project=>{const active=state.activeProjects.some(item=>item.id===project.id);const done=state.completedProjects.includes(project.id);return `<article class="panel project-card"><header><span>${project.icon}</span><div><b>${escapeHtml(project.name)}</b><small>${escapeHtml(project.description)}</small></div></header><dl><div><dt>初期費用</dt><dd>${formatMoney(project.initialCost)}</dd></div><div><dt>毎週</dt><dd>${formatMoney(project.weeklyCost)}</dd></div><div><dt>工期</dt><dd>${project.durationWeeks}週</dd></div></dl><button class="small-action" data-preview-project="${project.id}" ${active||done||state.week<project.unlockWeek?'disabled':''}>${done?'完成済み':active?'進行中':state.week<project.unlockWeek?`第${project.unlockWeek}週に解禁`:'詳細を確認'}</button></article>`}).join('')}</section>
    <div class="section-heading"><h2>継続政策</h2><span>${state.recurringPolicies.filter(item=>item.status==='active').length}件</span></div>
    <section class="policy-list">${state.recurringPolicies.length?state.recurringPolicies.map(policy=>`<article class="panel recurring-row"><div><b>${escapeHtml(policy.label)}</b><small>毎週 −${formatMoney(policy.weeklyCost)}</small></div><button class="text-action" data-stop-policy="${policy.id}" ${policy.status!=='active'?'disabled':''}>${policy.status==='active'?'停止':'停止済み'}</button></article>`).join(''):'<div class="empty-state">継続費のある政策はまだありません。</div>'}</section>
  </main>`;
}
