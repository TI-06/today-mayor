import {STORIES,getStory} from './content.js';
import {postLedgerEntry} from '../game/finance.js';

const clamp=value=>Math.max(0,Math.min(100,Math.round(value)));
const flagsFor=state=>new Set(state.flags||[]);
const progressFor=(state,storyId)=>state.residentStories?.[storyId]||{completedNodes:[],choices:[],endingId:null};

const requirementsMet=(requirements,flags)=>requirements.length===0||requirements.some(flag=>flags.has(flag));

export function availableStoryNodes(state){
  const flags=flagsFor(state);
  const nodes=[];
  for(const story of STORIES){
    const progress=progressFor(state,story.id);
    if(progress.endingId)continue;
    for(const item of story.nodes){
      if(item.week>state.week||progress.completedNodes.includes(item.id))continue;
      if(!requirementsMet(item.requires||[],flags))continue;
      const previousIndex=story.nodes.findIndex(node=>node.id===item.id)-1;
      if(previousIndex>=0&&progress.completedNodes.length===0&&item.id!==story.nodes[0].id)continue;
      nodes.push({...item,storyId:story.id,storyTitle:story.title,residentId:story.residentId});
      break;
    }
  }
  return nodes;
}

function determineEnding(story,flags){
  return story.endings.find(ending=>ending.requires.some(flag=>flags.has(flag)))||null;
}

export function resolveStoryChoice(state,storyId,nodeId,choiceId){
  const story=getStory(storyId);
  if(!story)return {state,error:'住民ストーリーが見つかりません'};
  const node=story.nodes.find(item=>item.id===nodeId);
  const choice=node?.choices.find(item=>item.id===choiceId);
  if(!node||!choice)return {state,error:'選択肢が見つかりません'};
  const progress=progressFor(state,storyId);
  if(progress.completedNodes.includes(nodeId))return {state,error:'この場面は判断済みです'};
  let next=state;
  if(choice.effects.treasury){
    next=postLedgerEntry(next,{week:state.week,phase:'project',category:'story',label:`${story.title}：${choice.label}`,amount:choice.effects.treasury,sourceId:`story:${storyId}:${nodeId}`,settlementKey:'choice'});
  }
  for(const [key,value] of Object.entries(choice.effects))if(key!=='treasury'&&['support','economy','life','environment','safety','councilApproval'].includes(key))next={...next,[key]:clamp((next[key]??50)+value)};
  const residents={...next.residents,[story.residentId]:clamp((next.residents[story.residentId]??50)+choice.relationship)};
  const flags=[...new Set([...(next.flags||[]),...(choice.flags||[])])];
  const updatedProgress={completedNodes:[...progress.completedNodes,nodeId],choices:[...progress.choices,{nodeId,choiceId,week:state.week}],endingId:null};
  const ending=determineEnding(story,new Set(flags));
  if(node===story.nodes.at(-1)&&ending)updatedProgress.endingId=ending.id;
  next={...next,residents,flags,residentStories:{...next.residentStories,[storyId]:updatedProgress},history:[{id:`story:${storyId}:${nodeId}:${state.week}`,week:state.week,type:'story',title:node.title,choice:choice.label,residentId:story.residentId},...next.history],newsQueue:[{id:`story-news:${storyId}:${nodeId}:${state.week}`,week:state.week,type:'resident',title:story.title,body:ending?`物語の結末：${ending.label}`:`${choice.label}を選びました。`,createdAt:new Date().toISOString()},...next.newsQueue]};
  return {state:next,result:{story,node,choice,ending}};
}
