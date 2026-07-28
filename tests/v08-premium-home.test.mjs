import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createInitialState} from '../site/js/game/state.js';
import {renderHomeView} from '../site/js/ui/home-view.js';
import {derivePonkichiReaction,renderPonkichi} from '../site/js/characters/ponkichi.js';

const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('premium home puts the next action first and keeps one clear action',()=>{
  const html=renderHomeView(createInitialState());
  assert.match(html,/premium-home/);
  assert.match(html,/premium-action-card/);
  assert.match(html,/今週の重点方針を決める/);
  assert.match(html,/home-city-card/);
  assert.match(html,/today-agenda/);
  assert.doesNotMatch(html,/week-heading/);
  assert.doesNotMatch(html,/ponkichi-panel/);
});

test('premium home shows exactly three summary metrics',()=>{
  const html=renderHomeView(createInitialState());
  assert.equal((html.match(/home-metric-card/g)||[]).length,3);
  assert.match(html,/市民満足度/);
  assert.match(html,/経済発展度/);
  assert.match(html,/まちの魅力度/);
});

test('ponkichi home asset exposes anime movement groups',async()=>{
  const source=await read('site/assets/ponkichi-home-v080.svg');
  for(const id of ['ponkichi-float','ponkichi-wave-arm','ponkichi-tail','ponkichi-eyes','ponkichi-ears','ponkichi-mouth','ponkichi-leaf'])assert.match(source,new RegExp(`id="${id}"`));
  for(const keyframe of ['@keyframes float','@keyframes wave','@keyframes tail','@keyframes blink'])assert.match(source,new RegExp(keyframe.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  const html=renderPonkichi(derivePonkichiReaction(createInitialState()),'classic');
  assert.match(html,/ponkichi-home-v080\.svg\?v=0\.8\.0/);
});

test('generated application shell uses compact premium header and nav',async()=>{
  const parts=await Promise.all(['000','001','002','003'].map(name=>read(`src/v07text/app/${name}.part`)));
  const source=parts.join('');
  assert.match(source,/premium-topbar/);
  assert.match(source,/premium-bottom-nav/);
  assert.match(source,/notification-action/);
  assert.doesNotMatch(source,/account-chip/);
});

test('v0.8 assets are cache-busted and included in deployment',async()=>{
  const [html,sw,build,pkg]=await Promise.all([read('site/index.html'),read('site/sw.js'),read('cloudflare-build.sh'),read('package.json')]);
  assert.match(html,/home-v080\.css\?v=0\.8\.0/);
  assert.match(html,/app\.js\?v=0\.8\.0/);
  assert.match(sw,/today-mayor-v080/);
  assert.match(sw,/ponkichi-home-v080\.svg/);
  assert.match(build,/site\/assets\/ponkichi-home-v080\.svg/);
  assert.equal(JSON.parse(pkg).version,'0.8.0');
});
