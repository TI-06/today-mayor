import test from 'node:test';
import assert from 'node:assert/strict';
import {createInitialState} from '../site/js/game/state.js';
import {RESIDENTS,STORIES} from '../site/js/characters/content.js';
import {availableStoryNodes,resolveStoryChoice} from '../site/js/characters/stories.js';

test('resident story branches from prior choices',()=>{
  let state=createInitialState();
  state=resolveStoryChoice(state,'shopping-street','opening','support-youth').state;
  const nodes=availableStoryNodes({...state,week:3});
  assert.equal(nodes.some(node=>node.id==='mall-conflict'),true);
});

test('story changes relationship and history',()=>{
  const result=resolveStoryChoice(createInitialState(),'shopping-street','opening','support-youth').state;
  assert.equal(result.residents.shopkeeper>50,true);
  assert.equal(result.history.length,1);
});

test('four stories each have three nodes and two endings',()=>{
  assert.equal(RESIDENTS.length>=4,true);
  assert.equal(STORIES.length>=4,true);
  for(const story of STORIES){
    assert.equal(story.nodes.length>=3,true);
    assert.equal(story.endings.length>=2,true);
  }
});
