import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createInitialState} from '../site/js/game/state.js';
import {deriveCityVisualState} from '../site/js/city/visual-state.js';
import {renderCityScene} from '../site/js/city/renderer.js';
import {derivePonkichiReaction,renderPonkichi} from '../site/js/characters/ponkichi.js';

test('economic growth increases pedestrians and lit shops',()=>{
  const visual=deriveCityVisualState({...createInitialState(),economy:75,completedProjects:['station-redevelopment']});
  assert.equal(visual.pedestrians>=4,true);
  assert.equal(visual.litShops>=5,true);
  assert.match(renderCityScene(visual),/city-scene/);
});

test('city vehicles are anchored to the road lane',()=>{
  const visual=deriveCityVisualState(createInitialState());
  const scene=renderCityScene(visual);
  assert.match(scene,/class="illustration-vehicles" transform="translate\(-60 267\)"/);
});

test('finance crisis selects worried ponkichi reaction',()=>{
  const reaction=derivePonkichiReaction({...createInitialState(),treasury:-20,projectedTreasury:-35},{type:'home'});
  assert.equal(reaction.mood,'panic');
  assert.match(reaction.line,/予算|財政/);
  assert.match(renderPonkichi(reaction,'classic'),/mood-panic/);
});

test('tanuki svg exposes animated body parts',async()=>{
  const source=await readFile(new URL('../site/assets/tanuki-v071.svg',import.meta.url),'utf8');
  for(const id of ['ponkichi-body','ponkichi-head','ponkichi-eyes','ponkichi-mouth','ponkichi-ears','ponkichi-tail','ponkichi-arms','ponkichi-binder','ponkichi-leaf-hat'])assert.match(source,new RegExp(`id="${id}"`));
});
test('tanuki svg includes lightweight anime part animations',async()=>{const source=await readFile(new URL('../site/assets/tanuki-v071.svg',import.meta.url),'utf8');for(const name of ['ponkichiBlink','ponkichiTail','ponkichiEar','ponkichiMouth','ponkichiBinder'])assert.match(source,new RegExp(name))});
