import {settleWeek,financeStatus} from './finance.js';
import {resolveAutoCases} from './auto-cases.js';

export const PHASES=['focus','policy','preview','project','response','city','summary'];
const nextPhase=phase=>PHASES[Math.min(PHASES.length-1,PHASES.indexOf(phase)+1)]||'focus';

const hasBlockingEvent=state=>state.eventPipelines.some(item=>item.stage==='response'&&state.phase==='response');
const hasBlockingProject=state=>state.activeProjects.some(item=>item.status==='awaiting-decision'&&state.phase==='project');

export function advancePhase(state,action={type:'continue'},rng=Math.random){
  if(state.gameStatus!=='active')return {state,output:{blocked:true,reason:'game-over'}};
  if(action.type!=='continue')return {state,output:{blocked:true,reason:'invalid-action'}};
  if(hasBlockingEvent(state)||hasBlockingProject(state))return {state,output:{blocked:true,reason:'required-decision'}};
  if(state.phase==='summary'){
    const status=financeStatus(state);
    if(status==='bankrupt')return {state:{...state,gameStatus:'lost',gameOverReason:'市の財政が破綻しました'},output:{gameOver:true}};
    return {state:{...state,week:state.week+1,termWeek:state.termWeek+1,phase:'focus',weeklyFocus:null,weeklyIncome:0,weeklyExpense:0,autoHandledCases:state.autoHandledCases},output:{weekStarted:state.week+1}};
  }
  if(state.phase==='policy'){
    const automated=resolveAutoCases(state,rng);
    return {state:{...automated.state,phase:'preview'},output:{autoReport:automated.report}};
  }
  if(state.phase==='city'){
    const settled=settleWeek({...state,phase:'summary'});
    return {state:{...settled.state,phase:'summary'},output:{summary:settled.summary}};
  }
  return {state:{...state,phase:nextPhase(state.phase)},output:{phase:nextPhase(state.phase)}};
}
