import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../site/js/game/state.js';
import {PROJECTS,startProject,advanceProjects,pauseProject,cancelRecurringPolicy} from '../site/js/game/projects.js';

test('project charges initial cost and progresses by week',()=>{
  const started=startProject(createInitialState(),'disaster-center').state;
  assert.equal(started.treasury,430);
  assert.equal(started.activeProjects[0].stage,'survey');
  const progressed=advanceProjects(started).state;
  assert.equal(progressed.activeProjects[0].weeksRemaining<started.activeProjects[0].weeksRemaining,true);
});

test('project cost is not charged twice',()=>{
  const first=startProject(createInitialState(),'disaster-center').state;
  const second=startProject(first,'disaster-center');
  assert.equal(second.state.treasury,first.treasury);
  assert.ok(second.error);
});

test('projects define costs, durations, districts and effects',()=>{
  assert.equal(PROJECTS.length>=6,true);
  for(const project of PROJECTS){
    assert.equal(Number.isInteger(project.initialCost),true);
    assert.equal(project.durationWeeks>=1,true);
    assert.ok(project.district);
    assert.ok(project.visualEffect);
  }
});

test('project can be paused and recurring policy can be stopped',()=>{
  const started=startProject(createInitialState(),'disaster-center').state;
  assert.equal(pauseProject(started,'disaster-center').state.activeProjects[0].status,'paused');
  const recurring={...createInitialState(),recurringPolicies:[{id:'free-lunch',weeklyCost:5,status:'active'}]};
  assert.equal(cancelRecurringPolicy(recurring,'free-lunch').state.recurringPolicies[0].status,'stopped');
});
test('district investment spends visible funds and grows the district once per week',async()=>{const {investDistrict}=await import('../site/js/game/projects.js');const first=investDistrict(createInitialState(),'central',20);assert.equal(first.state.treasury,530);assert.equal(first.state.districts.central.exp,20);const second=investDistrict(first.state,'central',20);assert.equal(second.state.treasury,530);assert.ok(second.error)});
