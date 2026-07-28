import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../site/js/game/state.js';
import {EVENTS} from '../site/js/events/content.js';
import {startEventPipeline,investigateEvent,respondToEvent,resolveEventFollowup,selectEventPreview} from '../site/js/events/engine.js';

test('event follows preview investigation response followup resolved',()=>{
  let state=startEventPipeline(createInitialState(),'flood-warning');
  assert.equal(state.eventPipelines[0].stage,'preview');
  state=investigateEvent(state,'flood-warning','survey').state;
  assert.equal(state.eventPipelines[0].stage,'response');
  state=respondToEvent(state,'flood-warning','partial-evacuation').state;
  assert.equal(state.eventPipelines[0].stage,'followup');
  state=resolveEventFollowup(state,'flood-warning',()=>0.1).state;
  assert.equal(state.eventPipelines[0].stage,'resolved');
});

test('event cost cannot be charged twice',()=>{
  const started=startEventPipeline(createInitialState(),'flood-warning');
  const first=investigateEvent(started,'flood-warning','survey').state;
  const second=investigateEvent(first,'flood-warning','survey').state;
  assert.equal(second.treasury,first.treasury);
});

test('event content has six complete pipelines',()=>{
  assert.equal(EVENTS.length>=6,true);
  for(const event of EVENTS){
    assert.ok(event.preview);
    assert.ok(event.investigations.length>=2);
    assert.ok(event.responses.length>=2);
    assert.ok(event.followups.length>=2);
  }
});

test('preview selection avoids resolved and active events',()=>{
  const state={...createInitialState(),eventPipelines:[{eventId:'flood-warning',stage:'resolved'}]};
  const event=selectEventPreview(state,()=>0);
  assert.notEqual(event?.id,'flood-warning');
});
test('policy uncertainty changes which future events are eligible',()=>{const factory=EVENTS.find(event=>event.id==='factory-audit');const tourism=EVENTS.find(event=>event.id==='tourism-boom');assert.equal(factory.condition(createInitialState()),false);assert.equal(factory.condition({...createInitialState(),flags:['policy-factory-priority']}),true);assert.equal(tourism.condition({...createInitialState(),weeklyFocus:'tourism'}),true)});
test('separate event followups each charge their own emergency cost',()=>{let state=createInitialState();for(const id of ['flood-warning','power-risk']){state=startEventPipeline(state,id);state=investigateEvent(state,id,id==='flood-warning'?'watch':'request').state;state=respondToEvent(state,id,id==='flood-warning'?'observe':'appeal').state}const before=state.treasury;state=resolveEventFollowup(state,'flood-warning',()=>.99).state;state=resolveEventFollowup(state,'power-risk',()=>.99).state;assert.equal(state.treasury,before-32)});
