import {RESIDENTS,STORIES} from '../characters/content.js';
import {availableStoryNodes} from '../characters/stories.js';
import {escapeHtml} from './components.js';

export function renderResidentView(state){
  const available=availableStoryNodes(state);
  return `<main class="view resident-view">
    <div class="section-heading"><h2>市民との関係</h2><span>判断を記憶します</span></div>
    <section class="resident-grid">${RESIDENTS.map(resident=>{const value=state.residents[resident.id]??50;const story=STORIES.find(item=>item.residentId===resident.id);const progress=state.residentStories[story?.id];return `<article class="panel resident-card"><span>${resident.icon}</span><div><b>${escapeHtml(resident.name)}</b><small>${escapeHtml(resident.role)}</small><div class="relationship"><i style="width:${value}%"></i></div><em>${Math.round(value)}</em>${progress?.endingId?'<strong>物語完了</strong>':''}</div></article>`}).join('')}</section>
    <div class="section-heading"><h2>相談・ストーリー</h2><span>${available.length}件</span></div>
    <section class="story-list">${available.length?available.map(node=>`<button class="panel story-card" data-story="${node.storyId}" data-node="${node.id}"><span>💬</span><div><b>${escapeHtml(node.title)}</b><small>${escapeHtml(node.storyTitle)}</small><p>${escapeHtml(node.body)}</p></div></button>`).join(''):'<div class="empty-state">今週、新しい相談はありません。</div>'}</section>
  </main>`;
}
