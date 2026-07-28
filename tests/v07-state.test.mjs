import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState,isV07State,normalizeState,GAME_VERSION} from '../site/js/game/state.js';

test('v0.7 starts a new weekly game',()=>{
  const state=createInitialState();
  assert.equal(GAME_VERSION,'0.7.0');
  assert.equal(state.version,'0.7.0');
  assert.equal(state.week,1);
  assert.equal(state.phase,'focus');
  assert.equal(state.treasury,550);
  assert.equal(state.leaves,15);
  assert.deepEqual(state.ledgerEntries,[]);
});

test('old saves are rejected instead of migrated',()=>{
  assert.equal(isV07State({version:'0.6.0',budget:55}),false);
  const next=normalizeState({version:'0.6.0',budget:55});
  assert.equal(next.version,'0.7.0');
  assert.equal(next.treasury,550);
  assert.equal(next.week,1);
});

test('v0.7 state normalization protects arrays and numbers',()=>{
  const next=normalizeState({version:'0.7.0',treasury:'oops',ledgerEntries:null,leaves:-3});
  assert.equal(next.treasury,550);
  assert.deepEqual(next.ledgerEntries,[]);
  assert.equal(next.leaves,0);
});
