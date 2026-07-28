import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL(`../${path}`,import.meta.url),'utf8');
test('service worker never caches API responses',async()=>{const source=await read('site/sw.js');assert.match(source,/pathname\.startsWith\(['"]\/api\/['"]\)/);assert.match(source,/return\s*;?/)});
test('Cloudflare Pages routes invoke Functions only for API paths',async()=>{const routes=JSON.parse(await read('site/_routes.json'));assert.equal(routes.version,1);assert.deepEqual(routes.include,['/api/*']);assert.deepEqual(routes.exclude,[])});
test('health endpoint reports current application version',async()=>{const source=await read('functions/api/health.js');assert.match(source,/version:'0\.7\.1'/)});
