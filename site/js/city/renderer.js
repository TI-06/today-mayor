const repeat=(count,fn)=>Array.from({length:Math.max(0,count)},(_,index)=>fn(index)).join('');

export function renderCityScene(visual){
  const sky=visual.weather==='storm'?'storm':visual.weather==='clear'?'clear':'cloudy';
  const people=repeat(visual.pedestrians,index=>`<i class="city-person person-${index%4}" style="--x:${8+(index*13)%82}%"></i>`);
  const tourists=repeat(visual.tourists,index=>`<i class="city-tourist" style="--x:${14+(index*17)%76}%">📷</i>`);
  const trucks=repeat(visual.trucks,index=>`<i class="city-truck" style="--delay:${index*1.3}s"></i>`);
  const trees=repeat(visual.trees,index=>`<i class="city-tree" style="--x:${5+(index*19)%90}%"></i>`);
  const shops=repeat(visual.litShops,index=>`<i class="shop-window ${index<visual.closedFacilities?'closed':'lit'}"></i>`);
  const cranes=repeat(visual.constructionSites,index=>`<i class="city-crane" style="--x:${22+index*30}%"></i>`);
  const flood=visual.floodLevel?`<i class="city-flood level-${visual.floodLevel}"></i>`:'';
  const decoration=visual.decorations?`<i class="city-decoration ${visual.decorations}"></i>`:'';
  return `<section class="city-scene city-${sky} mood-${visual.mood}" aria-label="政策結果が反映された街の様子">
    <div class="city-sky"><i class="city-sun"></i><i class="city-cloud cloud-a"></i><i class="city-cloud cloud-b"></i></div>
    <div class="city-backdrop"><i class="tower tower-a"></i><i class="tower tower-b"></i><i class="tower tower-c"></i></div>
    <div class="city-block"><div class="shop-row">${shops}</div></div>
    <div class="city-road"><i class="city-car"></i>${trucks}</div>
    ${trees}${people}${tourists}${cranes}${flood}${decoration}
  </section>`;
}
