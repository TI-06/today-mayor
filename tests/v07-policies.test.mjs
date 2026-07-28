import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../site/js/game/state.js';
import {POLICY_CASES,choosePolicyCase,applyPolicyChoice} from '../site/js/game/policies.js';

test('policy cases expose known costs and hidden risk descriptions',()=>{
  assert.equal(POLICY_CASES.length>=8,true);
  for(const policy of POLICY_CASES){
    assert.equal(policy.choices.length>=3,true);
    for(const choice of policy.choices){
      assert.equal(Number.isInteger(choice.initialCost),true);
      assert.equal(Number.isInteger(choice.weeklyCost),true);
      assert.ok(choice.knownEffect);
      assert.ok(choice.uncertainty);
    }
  }
});

test('policy choice charges exact initial cost and registers recurring cost',()=>{
  const policy=POLICY_CASES.find(item=>item.id==='school-lunch');
  const result=applyPolicyChoice(createInitialState(),policy.id,'universal');
  assert.equal(result.state.treasury,510);
  assert.equal(result.state.recurringPolicies.some(item=>item.id==='school-lunch:universal'&&item.weeklyCost===8),true);
  assert.equal(result.state.life>50,true);
});

test('policy selection avoids recent history when alternatives exist',()=>{
  const state={...createInitialState(),history:POLICY_CASES.slice(0,4).map(item=>({type:'policy',sourceId:item.id}))};
  const chosen=choosePolicyCase(state,()=>0);
  assert.equal(state.history.some(item=>item.sourceId===chosen.id),false);
});
