import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../site/js/game/state.js';
import {renderMoneyBar,renderExpensePreview} from '../site/js/ui/components.js';
import {renderHomeView} from '../site/js/ui/home-view.js';
import {renderPolicyView} from '../site/js/ui/policy-view.js';
import {renderCityView} from '../site/js/ui/city-view.js';

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

test('home view includes week phase goals and ponkichi',()=>{
  const html=renderHomeView({...createInitialState(),weeklyGoals:[{id:'g',label:'黒字を維持',status:'active'}]},{cloud:{available:false}});
  assert.match(html,/第1週/);
  assert.match(html,/黒字を維持/);
  assert.match(html,/ポン吉/);
});
import {readFile} from 'node:fs/promises';
test('mobile phase action is fixed above the bottom navigation',async()=>{const css=await readFile(new URL('../site/styles.css',import.meta.url),'utf8');assert.match(css,/\.phase-action\{[^}]*position:fixed[^}]*bottom:calc\(82px/s);assert.match(css,/\.home-view\{[^}]*padding-bottom:/s)});

test('policy view shows term and manifesto goals',()=>{const state={...createInitialState(),manifesto:'disaster',termGoals:[{id:'t',label:'安心を68以上にする',status:'active'}]};const html=renderPolicyView(state);assert.match(html,/任期目標/);assert.match(html,/安心を68以上にする/)});
test('home view shows ponkichi auto-case report and event title',()=>{const state={...createInitialState(),phase:'project',autoHandledCases:[{week:1,totalCost:3,items:[{label:'道路標識の修繕',cost:2},{label:'公園遊具の点検',cost:1}]}],eventPipelines:[{eventId:'flood-warning',stage:'response'}]};const html=renderHomeView(state,{});assert.match(html,/ポン吉の自動処理/);assert.match(html,/道路標識の修繕/);assert.match(html,/河川水位が急上昇/);assert.doesNotMatch(html,/>flood-warning</)});

test('city view exposes explicit district investment controls',()=>{const html=renderCityView(createInitialState());assert.match(html,/data-invest-district="central"/);assert.match(html,/20億円/)});
test('mobile icon controls provide at least 44px tap targets',async()=>{const css=await readFile(new URL('../site/styles.css',import.meta.url),'utf8');for(const selector of ['menu-action','close-action','icon-action'])assert.match(css,new RegExp(`\\.${selector}\\{[^}]*width:44px[^}]*height:44px`,'s'))});
test('mobile segmented and small action controls reach 44px',async()=>{const css=await readFile(new URL('../site/styles.css',import.meta.url),'utf8');assert.match(css,/\.segmented button\{[^}]*min-height:44px/s);assert.match(css,/\.small-action\{[^}]*min-height:44px/s)});
