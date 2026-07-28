import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../site/js/game/state.js';
import {postLedgerEntry,settleWeek,forecastNextTreasury,issueBond,transferReserve,financeStatus} from '../site/js/game/finance.js';

test('ledger entries change treasury once',()=>{
  const state=createInitialState();
  const entry={id:'expense:road:1',week:1,phase:'policy',type:'expense',category:'policy',label:'道路補修',amount:-20,sourceId:'road',settlementKey:'initial'};
  const first=postLedgerEntry(state,entry);
  const second=postLedgerEntry(first,entry);
  assert.equal(first.treasury,530);
  assert.equal(second.treasury,530);
  assert.equal(second.ledgerEntries.length,1);
});

test('weekly settlement includes recurring costs and income',()=>{
  const state={...createInitialState(),economy:60,activeProjects:[{id:'station',weeklyCost:6,status:'active'}],recurringPolicies:[{id:'lunch',weeklyCost:4,status:'active'}]};
  const {state:next,summary}=settleWeek(state);
  assert.equal(summary.income>0,true);
  assert.equal(summary.expense>=30,true);
  assert.equal(next.weeklyIncome,summary.income);
  assert.equal(next.weeklyExpense,summary.expense);
  assert.equal(next.projectedTreasury,forecastNextTreasury(next));
});

test('bonds add cash and debt while reserve transfer is bounded',()=>{
  const bond=issueBond(createInitialState(),100);
  assert.equal(bond.state.treasury,650);
  assert.equal(bond.state.debt,100);
  const reserve=transferReserve(bond.state,30);
  assert.equal(reserve.state.treasury,620);
  assert.equal(reserve.state.reserveFund,80);
  assert.ok(transferReserve(reserve.state,-1000).error);
});

test('finance status uses explicit warning and bankruptcy thresholds',()=>{
  assert.equal(financeStatus(createInitialState()),'healthy');
  assert.equal(financeStatus({...createInitialState(),treasury:100}),'warning');
  assert.equal(financeStatus({...createInitialState(),treasury:-1}),'crisis');
  assert.equal(financeStatus({...createInitialState(),treasury:-150}),'bankrupt');
});
test('weekly settlement is idempotent for the same week',()=>{const first=settleWeek(createInitialState()).state;const second=settleWeek(first).state;assert.equal(second.treasury,first.treasury);assert.equal(second.weekSummaries.length,1);assert.equal(second.ledgerEntries.length,first.ledgerEntries.length)});
