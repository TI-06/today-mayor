export const FOCUS_OPTIONS=[
  {id:'finance',label:'財政再建',icon:'💰',description:'支出を抑え、市税収を安定させる',effects:{income:6,support:-1}},
  {id:'childcare',label:'子育て支援',icon:'🧸',description:'暮らしと子育て施策を優先する',effects:{life:3,cost:3}},
  {id:'tourism',label:'観光振興',icon:'🧳',description:'観光客と地域消費を増やす',effects:{economy:2,income:3}},
  {id:'disaster',label:'防災強化',icon:'🛟',description:'災害への備えと安全を優先する',effects:{safety:3,cost:3}},
  {id:'industry',label:'工業誘致',icon:'🏭',description:'企業誘致と雇用を増やす',effects:{economy:3,income:4,environment:-1}},
  {id:'environment',label:'環境都市',icon:'🌿',description:'緑化と環境負荷の低減を進める',effects:{environment:3,cost:3}},
  {id:'digital',label:'デジタル化',icon:'💻',description:'行政効率と利便性を高める',effects:{life:2,economy:1}},
  {id:'life',label:'暮らし優先',icon:'🏠',description:'生活課題と住民満足を優先する',effects:{life:3,support:2}}
];

export const DELEGATION_OPTIONS=[
  {id:'balanced',label:'バランス重視'},
  {id:'save',label:'節約優先'},
  {id:'resident_first',label:'住民満足優先'},
  {id:'safety_first',label:'安全優先'}
];

export function selectWeeklyFocus(state,focusId){
  if(!FOCUS_OPTIONS.some(item=>item.id===focusId))throw new Error('不明な重点方針です');
  if(state.phase!=='focus')return state;
  return {...state,weeklyFocus:focusId,phase:'policy'};
}

export function setDelegationPolicy(state,policyId){
  if(!DELEGATION_OPTIONS.some(item=>item.id===policyId))throw new Error('不明な委任方針です');
  return {...state,delegationPolicy:policyId};
}
