import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../site/js/game/state.js';
import {evaluateGoals,evaluateTerm,selectManifesto,createWeeklyGoals} from '../site/js/game/goals.js';

test('weekly goals evaluate against finance and metrics',()=>{
  const state={...createInitialState(),weeklyGoals:[{id:'black',type:'weekly_balance',target:0,status:'active'}],weeklyIncome:50,weeklyExpense:38};
  const result=evaluateGoals(state);
  assert.equal(result.completed[0].id,'black');
});

test('manifesto affects election score',()=>{
  const base={...createInitialState(),termWeek:12,support:58,manifesto:'childcare'};
  const failed=evaluateTerm({...base,life:45});
  const passed=evaluateTerm({...base,life:70});
  assert.equal(passed.election.score>failed.election.score,true);
});

test('manifesto can only be selected from known choices',()=>{
  assert.equal(selectManifesto(createInitialState(),'disaster').manifesto,'disaster');
  assert.throws(()=>selectManifesto(createInitialState(),'unknown'));
});

test('weekly goal generator creates a small actionable set',()=>{
  const goals=createWeeklyGoals(createInitialState(),()=>0.2);
  assert.equal(goals.length>=2&&goals.length<=3,true);
  assert.equal(goals.every(goal=>goal.status==='active'),true);
});
test('selecting a manifesto creates visible term goals',()=>{const next=selectManifesto(createInitialState(),'disaster');assert.equal(next.termGoals.length>=2,true);assert.equal(next.termGoals.some(goal=>goal.type==='manifesto'),true)});
test('term evaluation records completed and failed term goals',()=>{const result=evaluateTerm({...selectManifesto(createInitialState(),'disaster'),termWeek:12,safety:75,treasury:600,support:60});assert.equal(Array.isArray(result.state.termGoals),true);assert.equal(result.state.termGoals.every(goal=>['completed','failed'].includes(goal.status)),true)});
test('reelection starts the next term with a fresh manifesto choice',()=>{const state={...selectManifesto(createInitialState(),'disaster'),termWeek:12,safety:80,treasury:600,support:70,economy:65,life:65,environment:65,councilApproval:65};const result=evaluateTerm(state);assert.equal(result.election.won,true);assert.equal(result.state.manifesto,null);assert.deepEqual(result.state.termGoals,[])});
