import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('app uses the v0.7 save key and five mobile tabs',async()=>{
  const source=await read('site/js/app.js');
  assert.match(source,/today-mayor-v07/);
  for(const tab of ['home','city','policy','residents','records'])assert.match(source,new RegExp(`'${tab}'`));
  assert.doesNotMatch(source,/decisionsLeft|today-mayor-v02/);
});

test('app routes each weekly phase to a player action',async()=>{
  const source=await read('site/js/app.js');
  for(const action of ['openFocusSheet','openPolicySheet','openPreviewSheet','openProjectSheet','openResponseSheet','finishCityPhase','finishSummaryPhase'])assert.match(source,new RegExp(action));
  assert.doesNotMatch(source,/alert\s*\(/);
});

test('app handles district investment through a confirmed action sheet',async()=>{const source=await read('site/js/app.js');assert.match(source,/investDistrict/);assert.match(source,/data-confirm-district/);assert.match(source,/openDistrictInvestment/)});
test('direct policy-tab focus selection still requires a manifesto',async()=>{const source=await read('site/js/app.js');assert.match(source,/if\(!state\.manifesto\)\{openFocusSheet\(\);return\}/)});
test('spending decisions use a second confirmation action',async()=>{const source=await read('site/js/app.js');for(const token of ['openPolicyConfirmation','data-execute-policy','data-execute-investigation','data-execute-response'])assert.match(source,new RegExp(token))});
test('projects district investment and resident choices cannot skip weekly phases',async()=>{const source=await read('site/js/app.js');assert.match(source,/projectPhaseAvailable/);assert.match(source,/木曜・事業と住民/);assert.match(source,/data-confirm-project/);assert.match(source,/data-execute-story/)});
