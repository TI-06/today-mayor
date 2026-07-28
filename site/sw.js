const CACHE='today-mayor-v07';
const ASSETS=[
  './','./index.html','./styles.css','./manifest.webmanifest','./assets/tanuki-secretary.svg',
  './js/app.js','./js/content.js','./js/cloud.js','./js/monetization.js',
  './js/game/state.js','./js/game/finance.js','./js/game/focus.js','./js/game/auto-cases.js','./js/game/week-engine.js','./js/game/goals.js','./js/game/projects.js','./js/game/policies.js',
  './js/events/content.js','./js/events/engine.js',
  './js/characters/content.js','./js/characters/stories.js','./js/characters/ponkichi.js',
  './js/city/visual-state.js','./js/city/renderer.js',
  './js/ui/components.js','./js/ui/home-view.js','./js/ui/city-view.js','./js/ui/policy-view.js','./js/ui/resident-view.js','./js/ui/records-view.js'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.pathname.startsWith('/api/'))return;
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('./index.html')));return}
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}return response})));
});
