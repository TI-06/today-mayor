import {postLedgerEntry} from './finance.js';

const CASES=[
  {id:'road-sign',label:'道路標識の修繕',cost:2,metric:'safety',effect:1,tags:['safety']},
  {id:'park-check',label:'公園遊具の点検',cost:1,metric:'life',effect:1,tags:['life','safety']},
  {id:'local-event',label:'地域イベント申請',cost:2,metric:'support',effect:1,tags:['tourism','life']},
  {id:'school-repair',label:'学校備品の補修',cost:3,metric:'life',effect:1,tags:['childcare','life']},
  {id:'drain-clean',label:'排水溝の清掃',cost:2,metric:'safety',effect:1,tags:['disaster','environment']},
  {id:'business-help',label:'小規模事業者相談',cost:2,metric:'economy',effect:1,tags:['industry','finance']}
];

const pick=(items,rng)=>items[Math.min(items.length-1,Math.floor(rng()*items.length))];
const clamp=value=>Math.max(0,Math.min(100,Math.round(value)));

export function resolveAutoCases(state,rng=Math.random){
  const preferred=CASES.filter(item=>item.tags.includes(state.weeklyFocus));
  const count=state.delegationPolicy==='save'?1:state.delegationPolicy==='resident_first'?3:2;
  const items=[];
  let next=state;
  const pool=[...(preferred.length?preferred:CASES),...CASES];
  for(let index=0;index<count;index++){
    let selected=pick(pool,rng);
    if(items.some(item=>item.id===selected.id))selected=CASES[(CASES.indexOf(selected)+index+1)%CASES.length];
    const cost=state.delegationPolicy==='save'?Math.max(1,selected.cost-1):selected.cost;
    next=postLedgerEntry(next,{week:state.week,phase:'policy',category:'delegation',label:selected.label,amount:-cost,sourceId:`auto:${selected.id}`,settlementKey:`week:${state.week}`});
    const effect=state.delegationPolicy==='resident_first'&&selected.metric==='support'?2:selected.effect;
    next={...next,[selected.metric]:clamp((next[selected.metric]??50)+effect)};
    items.push({...selected,cost,effect});
  }
  const report={week:state.week,focus:state.weeklyFocus,policy:state.delegationPolicy,items,totalCost:items.reduce((sum,item)=>sum+item.cost,0)};
  return {state:{...next,autoHandledCases:[report,...next.autoHandledCases].slice(0,24),newsQueue:[{id:`auto-${state.week}`,week:state.week,type:'delegation',title:'ポン吉の自動処理報告',body:`軽微案件${items.length}件を処理しました。`,createdAt:new Date().toISOString()},...next.newsQueue]},report};
}
