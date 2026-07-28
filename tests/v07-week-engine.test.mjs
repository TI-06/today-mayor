import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../site/js/game/state.js';
import {selectWeeklyFocus} from '../site/js/game/focus.js';
import {resolveAutoCases} from '../site/js/game/auto-cases.js';
import {advancePhase,PHASES} from '../site/js/game/week-engine.js';

test('a week starts by selecting one focus',()=>{
  const state=createInitialState();
  const next=selectWeeklyFocus(state,'disaster');
  assert.equal(next.weeklyFocus,'disaster');
  assert.equal(next.phase,'policy');
});

test('phase order is weekly and summary advances to next week',()=>{
  assert.deepEqual(PHASES,['focus','policy','preview','project','response','city','summary']);
  const state={...createInitialState(),phase:'summary',week:1,termWeek:1};
  const result=advancePhase(state,{type:'continue'});
  assert.equal(result.state.week,2);
  assert.equal(result.state.termWeek,2);
  assert.equal(result.state.phase,'focus');
});

test('auto cases create a visible report and ledger entries',()=>{
  const state={...createInitialState(),weeklyFocus:'life',delegationPolicy:'balanced'};
  const {state:next,report}=resolveAutoCases(state,()=>0.2);
  assert.equal(report.items.length>0,true);
  assert.equal(next.autoHandledCases.length>0,true);
  assert.equal(next.ledgerEntries.length>0,true);
});

test('unresolved required event blocks phase skipping',()=>{
  const state={...createInitialState(),phase:'response',eventPipelines:[{eventId:'flood-warning',stage:'response'}]};
  const result=advancePhase(state,{type:'continue'});
  assert.equal(result.state.phase,'response');
  assert.equal(result.output.blocked,true);
});
