import {postLedgerEntry} from './finance.js';

export const PROJECTS=[
  {id:'disaster-center',name:'防災センター',icon:'🛟',district:'river',initialCost:120,weeklyCost:6,durationWeeks:4,unlockWeek:1,visualEffect:'disaster-center',effects:{safety:10,support:2},description:'避難指令と物資配布を一元管理する防災拠点。'},
  {id:'station-redevelopment',name:'駅前再開発',icon:'🚉',district:'central',initialCost:150,weeklyCost:8,durationWeeks:5,unlockWeek:2,visualEffect:'station-redevelopment',effects:{economy:10,life:4},description:'空き店舗と交通結節点を一体整備する。'},
  {id:'child-support-hub',name:'子育て支援拠点',icon:'🧸',district:'residential',initialCost:95,weeklyCost:5,durationWeeks:3,unlockWeek:1,visualEffect:'child-support-hub',effects:{life:9,support:4},description:'相談、保育、医療案内をまとめた支援拠点。'},
  {id:'river-park',name:'防災河川公園',icon:'🌳',district:'river',initialCost:85,weeklyCost:4,durationWeeks:4,unlockWeek:1,visualEffect:'river-park',effects:{environment:8,safety:5,life:3},description:'遊水機能を備えた河川公園。'},
  {id:'digital-city-hall',name:'デジタル市役所',icon:'💻',district:'central',initialCost:110,weeklyCost:4,durationWeeks:4,unlockWeek:2,visualEffect:'digital-city-hall',effects:{life:7,economy:4},description:'主要手続きをスマートフォンで完結させる。'},
  {id:'port-market',name:'港の観光朝市',icon:'🐟',district:'port',initialCost:90,weeklyCost:4,durationWeeks:3,unlockWeek:1,visualEffect:'port-market',effects:{economy:8,life:2},description:'市場と観光案内を一体化した港の新名所。'}
];

export const getProject=id=>PROJECTS.find(project=>project.id===id)||null;
const clamp=value=>Math.max(0,Math.min(100,Math.round(value)));

export function startProject(state,projectId){
  const project=getProject(projectId);
  if(!project)return {state,error:'事業が見つかりません'};
  if(state.week<project.unlockWeek)return {state,error:`第${project.unlockWeek}週に解禁されます`};
  if(state.completedProjects.includes(projectId)||state.activeProjects.some(item=>item.id===projectId))return {state,error:'この事業は開始済みです'};
  if(state.treasury<project.initialCost)return {state,error:'市予算が不足しています'};
  let next=postLedgerEntry(state,{week:state.week,phase:'project',category:'project',label:`${project.name} 初期費用`,amount:-project.initialCost,sourceId:`project:${projectId}`,settlementKey:'initial'});
  const active={id:project.id,name:project.name,district:project.district,stage:'survey',status:'active',weeksRemaining:project.durationWeeks,progress:0,weeklyCost:project.weeklyCost,initialCost:project.initialCost,visualEffect:project.visualEffect,effects:project.effects};
  next={...next,activeProjects:[...next.activeProjects,active],history:[{id:`project:${project.id}:${state.week}`,week:state.week,type:'project',title:`${project.name}を開始`,choice:'事業開始'},...next.history]};
  return {state:next,project};
}

const stageFor=(progress,duration)=>{
  const ratio=duration?progress/duration:1;
  if(ratio<.25)return 'survey';
  if(ratio<.5)return 'approval';
  if(ratio<1)return 'construction';
  return 'completed';
};

export function advanceProjects(state){
  const updates=[];
  const completed=[];
  let metrics={};
  const activeProjects=[];
  for(const item of state.activeProjects){
    if(item.status==='paused'||item.status==='awaiting-decision'){activeProjects.push(item);continue;}
    const project=getProject(item.id)||item;
    const weeksRemaining=Math.max(0,item.weeksRemaining-1);
    const progress=(project.durationWeeks||item.progress+item.weeksRemaining)-(weeksRemaining);
    const stage=stageFor(progress,project.durationWeeks||1);
    const updated={...item,weeksRemaining,progress,stage,status:weeksRemaining===0?'completed':'active'};
    updates.push(updated);
    if(weeksRemaining===0){
      completed.push(item.id);
      for(const [key,value] of Object.entries(project.effects||{}))metrics[key]=(metrics[key]||0)+value;
    }else activeProjects.push(updated);
  }
  let next={...state,activeProjects,completedProjects:[...new Set([...state.completedProjects,...completed])],newsQueue:[...completed.map(id=>{const project=getProject(id);return {id:`project-complete:${id}:${state.week}`,week:state.week,type:'project',title:`${project?.name||id}が完成`,body:'街の景色と行政サービスが変化しました。',createdAt:new Date().toISOString()}}),...state.newsQueue]};
  for(const [key,value] of Object.entries(metrics))next[key]=clamp((next[key]??50)+value);
  return {state:next,updates,completed};
}

export function pauseProject(state,projectId){
  if(!state.activeProjects.some(item=>item.id===projectId))return {state,error:'進行中の事業が見つかりません'};
  return {state:{...state,activeProjects:state.activeProjects.map(item=>item.id===projectId?{...item,status:item.status==='paused'?'active':'paused'}:item)}};
}

export function cancelRecurringPolicy(state,policyId){
  if(!state.recurringPolicies.some(item=>item.id===policyId))return {state,error:'継続政策が見つかりません'};
  return {state:{...state,recurringPolicies:state.recurringPolicies.map(item=>item.id===policyId?{...item,status:'stopped'}:item),history:[{id:`policy-stop:${policyId}:${state.week}`,week:state.week,type:'policy',title:'継続政策を停止',choice:policyId},...state.history]}};
}

const DISTRICT_METRICS={central:'economy',residential:'life',school:'life',industry:'economy',port:'economy',river:'safety'};
export function investDistrict(state,districtId,amount=20){
  const value=Math.max(1,Math.round(Number(amount)||0));
  if(!state.districts[districtId])return {state,error:'地区が見つかりません'};
  if(state.treasury<value)return {state,error:'市予算が不足しています'};
  const duplicate=state.ledgerEntries.some(item=>item.sourceId===`district:${districtId}`&&item.settlementKey===`week:${state.week}`);
  if(duplicate)return {state,error:'この地区には今週すでに投資しています'};
  let next=postLedgerEntry(state,{week:state.week,phase:'project',category:'district',label:`${districtId}地区への重点投資`,amount:-value,sourceId:`district:${districtId}`,settlementKey:`week:${state.week}`});
  const current={...next.districts[districtId],exp:(next.districts[districtId]?.exp||0)+value};
  while(current.level<5&&current.exp>=current.level*35){current.exp-=current.level*35;current.level+=1}
  const metric=DISTRICT_METRICS[districtId]||'support';
  next={...next,districts:{...next.districts,[districtId]:current},[metric]:clamp((next[metric]??50)+Math.max(1,Math.round(value/10))),history:[{id:`district:${districtId}:${state.week}`,week:state.week,type:'district',title:'地区への重点投資',choice:`${value}億円`,districtId},...next.history],newsQueue:[{id:`district-news:${districtId}:${state.week}`,week:state.week,type:'district',title:'地区投資を実施',body:`${districtId}地区へ${value}億円を配分しました。`,createdAt:new Date().toISOString()},...next.newsQueue]};
  return {state:next,district:current};
}
