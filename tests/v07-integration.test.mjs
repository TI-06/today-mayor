import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../site/js/game/state.js';
import {selectWeeklyFocus} from '../site/js/game/focus.js';
import {selectManifesto,createWeeklyGoals,evaluateGoals,evaluateTerm} from '../site/js/game/goals.js';
import {choosePolicyCase,applyPolicyChoice} from '../site/js/game/policies.js';
import {advancePhase} from '../site/js/game/week-engine.js';
import {settleWeek} from '../site/js/game/finance.js';
import {startEventPipeline,investigateEvent,respondToEvent,resolveEventFollowup,selectEventPreview} from '../site/js/events/engine.js';
import {getEvent} from '../site/js/events/content.js';
import {startProject,advanceProjects} from '../site/js/game/projects.js';
import {deriveCityVisualState} from '../site/js/city/visual-state.js';

const finiteState=state=>{
  for(const key of ['week','termWeek','treasury','weeklyIncome','weeklyExpense','projectedTreasury','debt','reserveFund','support','economy','life','environment','safety','councilApproval','leaves'])assert.equal(Number.isFinite(state[key]),true,key);
};

test('twelve-week balanced simulation remains finite',()=>{
  let state=createInitialState();
  for(let week=0;week<12&&state.gameStatus==='active';week++){
    state=selectWeeklyFocus({...state,phase:'focus'},week%2?'finance':'life');
    state={...state,phase:'summary'};
    state=settleWeek(state).state;
    state=advancePhase(state,{type:'continue'}).state;
    finiteState(state);
  }
  assert.equal(state.week>=13||state.gameStatus!=='active',true);
});

test('flood pipeline and project completion affect city state',()=>{
  let state=startEventPipeline(createInitialState(),'flood-warning');
  state=investigateEvent(state,'flood-warning','survey').state;
  state=respondToEvent(state,'flood-warning','full-evacuation').state;
  state=resolveEventFollowup(state,'flood-warning',()=>0.1).state;
  state=startProject(state,'river-park').state;
  for(let i=0;i<5;i++)state=advanceProjects(state).state;
  const visual=deriveCityVisualState(state);
  assert.equal(state.eventPipelines[0].stage,'resolved');
  assert.equal(state.completedProjects.includes('river-park'),true);
  assert.equal(visual.trees>0,true);
});


test('twelve-week player loop completes policies events projects and elections',()=>{
  let state=selectManifesto(createInitialState(),'disaster');
  const rng=()=>0.18;
  for(let turn=0;turn<12&&state.gameStatus==='active';turn++){
    for(const pipeline of [...state.eventPipelines])if(pipeline.stage==='followup'&&(pipeline.followupWeek??0)<=state.week)state=resolveEventFollowup(state,pipeline.eventId,rng).state;
    state=selectWeeklyFocus({...state,phase:'focus'},turn%3===0?'finance':turn%3===1?'life':'disaster');
    state={...state,weeklyGoals:createWeeklyGoals(state,rng)};
    const policy=choosePolicyCase(state,rng);const choice=[...policy.choices].sort((a,b)=>a.initialCost-b.initialCost)[0];
    state=applyPolicyChoice(state,policy.id,choice.id).state;
    state=advancePhase({...state,phase:'policy'},{type:'continue'},rng).state;
    const event=selectEventPreview(state,rng);
    if(event){state=startEventPipeline(state,event.id);const definition=getEvent(event.id);const investigation=[...definition.investigations].sort((a,b)=>a.cost-b.cost)[0];state=investigateEvent(state,event.id,investigation.id).state}
    state={...state,phase:'project'};
    if(turn===0&&state.treasury>=85)state=startProject(state,'river-park').state;
    state={...state,phase:'response'};
    const responsePipeline=state.eventPipelines.find(item=>item.stage==='response');
    if(responsePipeline){const definition=getEvent(responsePipeline.eventId);const response=[...definition.responses].sort((a,b)=>a.cost-b.cost)[0];state=respondToEvent(state,responsePipeline.eventId,response.id).state}
    state={...advanceProjects({...state,phase:'city'}).state,phase:'city'};
    state=advancePhase(state,{type:'continue'},rng).state;
    state=evaluateGoals(state).state;
    const term=evaluateTerm(state);state=term.state;
    if(state.gameStatus==='active')state=advancePhase({...state,phase:'summary'},{type:'continue'},rng).state;
    finiteState(state);
  }
  assert.equal(state.week>=13||state.gameStatus!=='active',true);
  assert.equal(state.history.some(item=>item.type==='policy'),true);
  assert.equal(state.eventPipelines.length>0,true);
  assert.equal(state.completedProjects.includes('river-park'),true);
  assert.equal(state.weekSummaries.length>=10,true);
});
