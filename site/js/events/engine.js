import {EVENTS,getEvent} from './content.js';
import {postLedgerEntry} from '../game/finance.js';

const clamp=value=>Math.max(0,Math.min(100,Math.round(value)));
const findPipeline=(state,eventId)=>state.eventPipelines.find(item=>item.eventId===eventId);
const updatePipeline=(state,eventId,update)=>({...state,eventPipelines:state.eventPipelines.map(item=>item.eventId===eventId?{...item,...update}:item)});

function applyEffects(state,effects={},sourceKey='event'){
  let next={...state};
  for(const [key,value] of Object.entries(effects)){
    if(key==='treasury'){
      next=postLedgerEntry(next,{week:state.week,phase:'followup',category:'event',label:'イベント追加費用',amount:value,sourceId:`event-effect:${sourceKey}`,settlementKey:`effect:${key}`});
      continue;
    }
    if(['support','economy','life','environment','safety','councilApproval'].includes(key))next[key]=clamp((next[key]??50)+value);
  }
  return next;
}

export function selectEventPreview(state,rng=Math.random){
  const unavailable=new Set(state.eventPipelines.filter(item=>item.stage!=='resolved'||(item.resolvedWeek??state.week)>=state.week-4).map(item=>item.eventId));
  const pool=EVENTS.filter(event=>!unavailable.has(event.id)&&(!event.condition||event.condition(state)));
  if(!pool.length)return null;
  const weighted=pool.flatMap(event=>Array.from({length:event.weight||1},()=>event));
  return weighted[Math.min(weighted.length-1,Math.floor(rng()*weighted.length))]||null;
}

export function startEventPipeline(state,eventId){
  const event=getEvent(eventId);
  if(!event||findPipeline(state,eventId))return state;
  const pipeline={eventId,stage:'preview',startedWeek:state.week,investigationId:null,responseId:null,flags:[],revealed:[],resultId:null};
  return {...state,eventPipelines:[...state.eventPipelines,pipeline],newsQueue:[{id:`event-preview:${eventId}:${state.week}`,week:state.week,type:'breaking',title:event.title,body:event.preview,createdAt:new Date().toISOString()},...state.newsQueue]};
}

export function investigateEvent(state,eventId,optionId){
  const event=getEvent(eventId);const pipeline=findPipeline(state,eventId);
  if(!event||!pipeline)return {state,error:'イベントが見つかりません'};
  if(pipeline.stage!=='preview')return {state,error:'このイベントは調査段階ではありません'};
  const option=event.investigations.find(item=>item.id===optionId);
  if(!option)return {state,error:'調査方法が見つかりません'};
  let next=postLedgerEntry(state,{week:state.week,phase:'preview',category:'investigation',label:`${event.title}：${option.label}`,amount:-option.cost,sourceId:`event:${eventId}`,settlementKey:'investigation'});
  next=updatePipeline(next,eventId,{stage:'response',investigationId:optionId,revealed:[...pipeline.revealed,option.reveal]});
  return {state:next,reveal:option.reveal};
}

export function respondToEvent(state,eventId,optionId){
  const event=getEvent(eventId);const pipeline=findPipeline(state,eventId);
  if(!event||!pipeline)return {state,error:'イベントが見つかりません'};
  if(pipeline.stage!=='response')return {state,error:'このイベントは対処段階ではありません'};
  const option=event.responses.find(item=>item.id===optionId);
  if(!option)return {state,error:'対処方法が見つかりません'};
  let next=postLedgerEntry(state,{week:state.week,phase:'response',category:'event',label:`${event.title}：${option.label}`,amount:-option.cost,sourceId:`event:${eventId}`,settlementKey:'response'});
  next=applyEffects(next,option.effects,`${eventId}:response:${optionId}`);
  next=updatePipeline(next,eventId,{stage:'followup',responseId:optionId,flags:[...pipeline.flags,...(option.flags||[])],followupWeek:state.week+1});
  next={...next,history:[{id:`event-response:${eventId}:${state.week}`,week:state.week,type:'event',title:event.title,choice:option.label},...next.history]};
  return {state:next,result:option.summary};
}

export function resolveEventFollowup(state,eventId,rng=Math.random){
  const event=getEvent(eventId);const pipeline=findPipeline(state,eventId);
  if(!event||!pipeline)return {state,error:'イベントが見つかりません'};
  if(pipeline.stage!=='followup')return {state,error:'このイベントは続報段階ではありません'};
  const eligible=event.followups.filter(item=>item.condition(pipeline,state));
  const result=eligible.length?eligible[Math.min(eligible.length-1,Math.floor(rng()*eligible.length))]:event.followups.at(-1);
  let next=applyEffects(state,result.effects,`${eventId}:followup:${result.id}`);
  next=updatePipeline(next,eventId,{stage:'resolved',resultId:result.id,resolvedWeek:state.week});
  next={...next,newsQueue:[{id:`event-result:${eventId}:${state.week}`,week:state.week,type:'followup',title:result.title,body:result.body,createdAt:new Date().toISOString()},...next.newsQueue]};
  return {state:next,result};
}
