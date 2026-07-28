const repeat=(count,fn)=>Array.from({length:Math.max(0,count)},(_,index)=>fn(index)).join('');

const windowRows=(count,offsetX,offsetY,columns=3)=>repeat(count,index=>{
  const x=offsetX+(index%columns)*22;
  const y=offsetY+Math.floor(index/columns)*18;
  return `<rect class="illustration-window ${index<count?'is-lit':''}" x="${x}" y="${y}" width="12" height="8" rx="2"/>`;
});

export function renderCityScene(visual){
  const sky=visual.weather==='storm'?'storm':visual.weather==='clear'?'clear':'cloudy';
  const people=repeat(Math.min(visual.pedestrians,7),index=>{
    const positions=[[118,242],[196,250],[272,236],[385,248],[462,239],[555,247],[626,236]];
    const [x,y]=positions[index%positions.length];
    return `<g class="illustration-person illustration-person-${index%4}" transform="translate(${x} ${y})"><circle cy="-10" r="5"/><path d="M-5-4h10l3 17H-8z"/><path d="M-4 13v11M4 13v11"/></g>`;
  });
  const tourists=repeat(Math.min(visual.tourists,4),index=>`<g class="illustration-tourist" transform="translate(${160+index*112} ${225+(index%2)*10})"><circle cy="-8" r="5"/><path d="M-6-2h12l2 16H-8z"/><rect x="3" y="1" width="9" height="7" rx="2"/><circle cx="7.5" cy="4.5" r="2"/></g>`);
  const trees=repeat(Math.min(visual.trees,9),index=>{
    const positions=[[72,218],[100,235],[230,220],[335,233],[418,217],[515,228],[650,220],[595,244],[300,250]];
    const [x,y]=positions[index%positions.length];
    return `<g class="illustration-tree" transform="translate(${x} ${y})"><rect x="-3" y="8" width="6" height="18" rx="3"/><circle cy="2" r="15"/><circle cx="-9" cy="8" r="10"/><circle cx="9" cy="8" r="10"/></g>`;
  });
  const vehicles=repeat(Math.min(1+visual.trucks,4),index=>`<g class="illustration-vehicle vehicle-${index%3}" style="--vehicle-delay:${index*1.8}s"><rect width="46" height="17" rx="7"/><path d="M9 0l8-10h18l7 10z"/><circle cx="11" cy="18" r="5"/><circle cx="36" cy="18" r="5"/></g>`);
  const cranes=repeat(Math.min(visual.constructionSites,2),index=>`<g class="illustration-construction" transform="translate(${235+index*245} 76)"><rect x="0" y="0" width="7" height="128" rx="3"/><rect x="-5" y="0" width="112" height="7" rx="3"/><path d="M3 7l38 32M3 7l-35 31"/><line x1="91" y1="7" x2="91" y2="49"/><rect x="82" y="48" width="18" height="10" rx="2"/></g>`);
  const flood=visual.floodLevel?`<path class="illustration-flood level-${visual.floodLevel}" d="M0 245 Q75 225 150 245 T300 245 T450 245 T600 245 T720 245 V300 H0Z"/>`:'';
  const decoration=visual.decorations==='festival'?`<g class="festival-flags"><path d="M92 78 Q360 22 628 78"/><g>${repeat(10,index=>`<path d="M${112+index*53} ${65-Math.abs(4.5-index)*5}l11 19 11-19z"/>`)}</g></g>`:visual.decorations==='green'?`<g class="eco-sparkles"><circle cx="120" cy="92" r="5"/><circle cx="586" cy="102" r="7"/><circle cx="645" cy="160" r="4"/></g>`:'';
  return `<section class="city-scene city-${sky} mood-${visual.mood}" aria-label="政策結果が反映された街の様子">
    <svg class="city-illustration" viewBox="0 0 720 300" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="citySky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dc8d8"/><stop offset="1" stop-color="#dff1e8"/></linearGradient>
        <linearGradient id="cityRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#536b69"/><stop offset="1" stop-color="#314845"/></linearGradient>
        <linearGradient id="cityHall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2cc"/><stop offset="1" stop-color="#e8c88b"/></linearGradient>
        <filter id="cityShadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#173e36" flood-opacity=".18"/></filter>
      </defs>
      <rect class="illustration-sky-fill" width="720" height="300" rx="30" fill="url(#citySky)"/>
      <circle class="illustration-sun" cx="612" cy="58" r="31"/>
      <g class="illustration-cloud illustration-cloud-a"><ellipse cx="98" cy="55" rx="40" ry="15"/><circle cx="79" cy="45" r="19"/><circle cx="111" cy="40" r="24"/></g>
      <g class="illustration-cloud illustration-cloud-b"><ellipse cx="395" cy="42" rx="34" ry="12"/><circle cx="379" cy="35" r="16"/><circle cx="405" cy="30" r="19"/></g>
      <path class="illustration-hills" d="M0 156 Q80 94 160 151 Q245 85 333 151 Q415 101 493 152 Q605 83 720 148 V300 H0Z"/>
      <path class="city-river" d="M0 215 Q115 195 225 222 T448 214 T720 215 V252 Q610 267 490 246 T248 251 T0 249Z"/>
      <g class="illustration-district" filter="url(#cityShadow)">
        <g class="illustration-building illustration-building-left"><path d="M55 136h142v93H55z"/><path d="M43 136l83-55 83 55z"/><rect x="76" y="161" width="31" height="27" rx="5"/><rect x="125" y="161" width="31" height="27" rx="5"/><rect x="91" y="198" width="37" height="31" rx="5"/></g>
        <g id="city-hall-building" class="city-hall-building"><path d="M263 102h194v128H263z" fill="url(#cityHall)"/><path d="M247 102l113-64 113 64z"/><rect x="277" y="111" width="166" height="14" rx="4"/><rect x="335" y="150" width="50" height="80" rx="7"/>${windowRows(Math.min(visual.litShops,8),286,143,2)}</g>
        <g class="illustration-building illustration-building-right"><rect x="516" y="90" width="142" height="141" rx="9"/>${windowRows(12,537,111,4)}<rect x="566" y="194" width="38" height="37" rx="5"/></g>
        <g class="illustration-shop-strip"><rect x="176" y="174" width="93" height="57" rx="8"/><path d="M176 190h93"/>${windowRows(Math.max(2,Math.min(visual.litShops,4)),190,200,3)}</g>
      </g>
      ${trees}${people}${tourists}${cranes}
      <path class="illustration-road" d="M0 252 Q170 236 360 258 T720 250 V300 H0Z" fill="url(#cityRoad)"/>
      <path class="illustration-road-line" d="M0 279 Q170 263 360 283 T720 275"/>
      <g class="illustration-vehicles">${vehicles}</g>
      ${flood}${decoration}
    </svg>
    <div class="city-scene-caption"><span>LIVE CITY</span><b>${visual.mood==='bright'?'街に活気が出ています':visual.mood==='tense'?'街に緊張が広がっています':'現在の街の様子'}</b></div>
  </section>`;
}
