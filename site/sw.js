const CACHE='today-mayor-v071';
const VERSION='0.7.1';
const ASSETS=[
  './','./index.html','./manifest.webmanifest','./styles.css',
  `./hotfix-v071.css?v=${VERSION}`,`./assets/tanuki-v071.svg?v=${VERSION}`,
  `./js/app.js?v=${VERSION}`,'./js/content.js','./js/cloud.js','./js/monetization.js',
  './js/game/state.js','./js/game/finance.js','./js/game/focus.js','./js/game/auto-cases.js','./js/game/week-engine.js','./js/game/goals.js','./js/game/projects.js','./js/game/policies.js',
  './js/events/content.js','./js/events/engine.js',
  './js/characters/content.js','./js/characters/stories.js',`./js/characters/ponkichi.js?v=${VERSION}`,
  './js/city/visual-state.js',`./js/city/renderer.js?v=${VERSION}`,
  './js/ui/components.js',`./js/ui/home-view.js?v=${VERSION}`,'./js/ui/city-view.js','./js/ui/policy-view.js','./js/ui/resident-view.js','./js/ui/records-view.js'
];

const putCache=async(request,response)=>{
  if(response?.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone())}
  return response;
};
const networkFirst=async request=>{
  try{return await putCache(request,await fetch(request))}
  catch{return await caches.match(request)}
};
const cacheFirst=async request=>{
  const cached=await caches.match(request);
  return cached||putCache(request,await fetch(request));
};

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.pathname.startsWith('/api/'))return;
  if(url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(networkFirst(event.request).then(response=>response||caches.match('./index.html')));
    return;
  }
  const updateSensitive=/\.(?:css|js|svg)$/.test(url.pathname);
  event.respondWith(updateSensitive?networkFirst(event.request):cacheFirst(event.request));
});
