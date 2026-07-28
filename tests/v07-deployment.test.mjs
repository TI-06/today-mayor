import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');

test('service worker caches weekly game modules and excludes api routes',async()=>{
  const sw=await read('site/sw.js');
  assert.match(sw,/today-mayor-v080/);
  assert.match(sw,/pathname\.startsWith\(['"]\/api\/['"]\)/);
  assert.match(sw,/game\/finance\.js/);
  assert.match(sw,/ui\/home-view\.js/);
});

test('health endpoint reports 0.8.0',async()=>{
  const source=await read('functions/api/health.js');
  assert.match(source,/version:'0\.8\.0'/);
});

test('index describes weekly city management',async()=>{
  const html=await read('site/index.html');
  assert.match(html,/週単位/);
  assert.match(html,/action-sheet/);
});

test('cloud helper rejects non-v0.7 save states',async()=>{
  const source=await read('site/js/cloud.js');
  assert.match(source,/loadV07CloudState/);
  assert.match(source,/version===['"]0\.7\.0['"]/);
});

test('versioned assets prevent stale premium home layout',async()=>{
  const html=await read('site/index.html');
  const sw=await read('site/sw.js');
  assert.match(html,/home-v080\.css\?v=0\.8\.0/);
  assert.match(html,/app\.js\?v=0\.8\.0/);
  assert.match(sw,/networkFirst/);
});
