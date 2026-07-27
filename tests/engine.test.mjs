import test from 'node:test';import assert from 'node:assert/strict';
import {createInitialState,choosePolicy,resolveDecision,selectIncident,resolveIncident,clamp} from '../site/js/engine.js';
import {POLICIES,INCIDENTS} from '../site/js/content.js';
test('initial state starts with three decisions',()=>{const s=createInitialState();assert.equal(s.day,1);assert.equal(s.decisionsLeft,3);assert.equal(s.support,55)});
test('policy choice changes metrics and history',()=>{const s=createInitialState();const p=POLICIES[0];const out=resolveDecision(s,p,p.choices[0],()=>.99,{incident:false,council:false});assert.equal(out.state.budget,43);assert.equal(out.state.economy,59);assert.equal(out.state.history[0].policyId,p.id)});
test('three decisions advance the day',()=>{let s=createInitialState();const p=POLICIES[1];for(let i=0;i<3;i++)s=resolveDecision(s,p,p.choices[1],()=>.99,{incident:false,council:false}).state;assert.equal(s.day,2);assert.equal(s.decisionsLeft,3)});
test('recent policies are avoided when alternatives exist',()=>{const s={...createInitialState(),seenPolicies:POLICIES.slice(0,6).map(p=>p.id)};const p=choosePolicy(s,()=>0);assert.ok(!s.seenPolicies.includes(p.id))});
test('incident selection obeys conditions and cooldown',()=>{const s={...createInitialState(),day:5,lastIncidentDay:0,safety:20,flags:['flood-risk']};const e=selectIncident(s,()=>0);assert.ok(e);assert.ok(INCIDENTS.some(x=>x.id===e.id));assert.equal(selectIncident({...s,lastIncidentDay:4},()=>0),null)});
test('incident choice applies its effects',()=>{const s=createInitialState();const e=INCIDENTS[0];const out=resolveIncident(s,e,e.choices[0]);assert.equal(out.state.budget,47);assert.equal(out.state.safety,58)});
test('clamp protects metric range',()=>{assert.equal(clamp(110),100);assert.equal(clamp(-5),0)});
import {relationshipDeltas,councilForecast} from '../site/js/engine.js';
import {RESIDENTS,CHAIN_EVENTS} from '../site/js/content.js';
test('policy choices change resident relationships',()=>{const s=createInitialState();const p=POLICIES.find(x=>x.id==='school-lunch');const out=resolveDecision(s,p,p.choices[0],()=>0,{incident:false});assert.ok(out.state.residents.aki>50);assert.equal(Object.keys(out.state.residents).length,RESIDENTS.length)});
test('council can reject an unpopular expensive proposal',()=>{const s={...createInitialState(),councilApproval:8};const p=POLICIES.find(x=>x.id==='ev-bus');const forecast=councilForecast(s,p.choices[0]);assert.ok(forecast<20);const out=resolveDecision(s,p,p.choices[0],()=>.99,{incident:false});assert.equal(out.council.passed,false);assert.equal(out.state.budget,55)});
test('chain event is scheduled and returns after two days',()=>{let s=createInitialState();const p=POLICIES.find(x=>x.id==='factory');let out=resolveDecision(s,p,p.choices[0],()=>0,{incident:false});s=out.state;assert.equal(s.scheduledEvents[0].eventId,'factory-protest');let follow=null;for(let i=0;i<6&&!follow;i++){out=resolveDecision(s,POLICIES[i%2],POLICIES[i%2].choices[1],()=>0,{incident:false});s=out.state;follow=out.incident}assert.ok(follow);assert.ok(CHAIN_EVENTS.some(e=>e.id===follow.id))});
test('relationship deltas are bounded',()=>{const p=POLICIES[0];const d=relationshipDeltas(p,p.choices[0]);assert.ok(Object.values(d).every(v=>v>=-7&&v<=7))});
import {purchaseBuilding,electionScore,availableBuildings} from '../site/js/engine.js';
import {BUILDINGS,DISTRICTS} from '../site/js/content.js';
test('building purchase deducts budget and grows a district',()=>{const s={...createInitialState(),day:10,budget:80};const out=purchaseBuilding(s,'harbor-market');assert.equal(out.error,undefined);assert.equal(out.state.budget,56);assert.ok(out.state.buildings.includes('harbor-market'));assert.ok(out.state.districts.port.exp>0)});
test('building cannot be bought twice or without budget',()=>{let s={...createInitialState(),day:10,budget:80};s=purchaseBuilding(s,'harbor-market').state;assert.ok(purchaseBuilding(s,'harbor-market').error);assert.ok(purchaseBuilding({...s,budget:0},'flood-park').error)});
test('election score rewards healthy city metrics',()=>{const good={...createInitialState(),support:80,life:80,safety:80,economy:80,environment:80,councilApproval:75};const bad={...createInitialState(),support:10,life:20,safety:20,economy:20,environment:20,councilApproval:15,budget:-100};assert.ok(electionScore(good)>electionScore(bad));assert.ok(electionScore(good)>=70)});
test('day 31 triggers election and can end the game',()=>{let s={...createInitialState(),day:30,decisionsLeft:1,support:5,life:10,safety:10,economy:10,environment:10,councilApproval:8,budget:-40};const p=POLICIES[0];const out=resolveDecision(s,p,p.choices[2],()=>0,{incident:false,council:false});assert.equal(out.state.day,31);assert.ok(out.election);assert.equal(out.election.won,false);assert.equal(out.state.gameStatus,'lost')});
test('district and building content has complete coverage',()=>{assert.equal(DISTRICTS.length,6);assert.ok(BUILDINGS.length>=8);assert.ok(availableBuildings({...createInitialState(),day:20}).length>=6)});
import {applyDailyLogin,seasonLevelForXp,buyCosmetic,equipCosmetic} from '../site/js/engine.js';
test('daily login rewards once and increments consecutive streak',()=>{let s=createInitialState();s=applyDailyLogin(s,'2026-07-27');const leaves=s.leaves;const same=applyDailyLogin(s,'2026-07-27');assert.equal(same.leaves,leaves);const next=applyDailyLogin(s,'2026-07-28');assert.equal(next.loginStreak,2);assert.ok(next.leaves>leaves)});
test('season levels increase with xp',()=>{assert.equal(seasonLevelForXp(0),1);assert.ok(seasonLevelForXp(500)>=8)});
test('cosmetics can be purchased and equipped with leaves',()=>{const s={...createInitialState(),leaves:100};const bought=buyCosmetic(s,'spring');assert.ok(bought.state.ownedCosmetics.includes('spring'));assert.equal(bought.state.equippedSkin,'spring');assert.equal(equipCosmetic(bought.state,'classic').state.equippedSkin,'classic')});

import {SEASON,COSMETICS} from '../site/js/content.js';
test('content identifiers and references are internally consistent',()=>{
  const unique=(items,label)=>assert.equal(new Set(items.map(x=>x.id)).size,items.length,`${label} ids must be unique`);
  unique(POLICIES,'policy');unique(INCIDENTS,'incident');unique(CHAIN_EVENTS,'chain');unique(RESIDENTS,'resident');unique(DISTRICTS,'district');unique(BUILDINGS,'building');unique(COSMETICS,'cosmetic');
  const chainIds=new Set(CHAIN_EVENTS.map(x=>x.id));
  for(const policy of POLICIES){
    assert.equal(policy.choices.length,3,`${policy.id} must have three choices`);
    unique(policy.choices,`${policy.id} choice`);
    for(const option of policy.choices){
      assert.ok(Object.keys(option.effects).length>0,`${policy.id}/${option.id} needs effects`);
      for(const tag of option.tags||[])if(tag.startsWith('chain:'))assert.ok(chainIds.has(tag.slice(6)),`missing chain ${tag}`);
    }
  }
  const districtIds=new Set(DISTRICTS.map(x=>x.id));
  for(const building of BUILDINGS)assert.ok(districtIds.has(building.district),`unknown district ${building.district}`);
  const cosmeticIds=new Set(COSMETICS.map(x=>x.id));
  for(const reward of SEASON.rewards)if(reward.cosmetic)assert.ok(cosmeticIds.has(reward.cosmetic),`unknown cosmetic ${reward.cosmetic}`);
});

test('deterministic long play never creates non-finite state values',()=>{
  let state={...createInitialState(),support:90,councilApproval:90,budget:100,economy:90,life:90,environment:90,safety:90};
  let cursor=0;
  const rng=()=>.42;
  const score=option=>(option.effects.budget||0)*3+(option.effects.support||0)*2+(option.effects.economy||0)+(option.effects.life||0)+(option.effects.environment||0)+(option.effects.safety||0);
  for(let turn=0;turn<120&&state.gameStatus==='active';turn++){
    const policy=POLICIES[cursor++%POLICIES.length];
    const option=[...policy.choices].sort((a,b)=>score(b)-score(a))[0];
    const out=resolveDecision(state,policy,option,rng,{incident:false,council:false});
    state=out.state;
    if(out.incident)state=resolveIncident(state,out.incident,out.incident.choices[1]).state;
    for(const key of ['budget','support','economy','life','environment','safety','councilApproval','day','decisionsLeft','leaves'])assert.ok(Number.isFinite(state[key]),`${key} must remain finite`);
    for(const district of Object.values(state.districts)){assert.ok(Number.isFinite(district.exp));assert.ok(district.level>=1&&district.level<=5)}
  }
  assert.ok(state.day>=31);
});
