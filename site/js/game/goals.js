const clamp=value=>Math.max(0,Math.min(100,Math.round(value)));

export const MANIFESTOS=[
  {id:'childcare',label:'子育て都市',metric:'life',target:65,description:'暮らし指標65以上を目指す'},
  {id:'tourism',label:'観光都市',metric:'economy',target:65,description:'経済指標65以上を目指す'},
  {id:'disaster',label:'災害に強い街',metric:'safety',target:68,description:'安心指標68以上を目指す'}
];

const GOAL_FACTORIES=[
  state=>({id:`balance-${state.week}`,label:'今週の収支を黒字にする',type:'weekly_balance',target:0,status:'active',reward:{support:2}}),
  state=>({id:`treasury-${state.week}`,label:'市予算を500億円以上に保つ',type:'treasury_min',target:500,status:'active',reward:{support:1}}),
  state=>({id:`support-${state.week}`,label:'支持率を60以上にする',type:'metric_min',metric:'support',target:60,status:'active',reward:{councilApproval:2}}),
  state=>({id:`safety-${state.week}`,label:'安心を55以上にする',type:'metric_min',metric:'safety',target:55,status:'active',reward:{support:1}}),
  state=>({id:`life-${state.week}`,label:'暮らしを55以上にする',type:'metric_min',metric:'life',target:55,status:'active',reward:{support:1}}),
  state=>({id:`project-${state.week}`,label:'大型事業を1段階進める',type:'project_progress',target:1,status:'active',baseline:(state.activeProjects||[]).reduce((sum,item)=>sum+(item.progress||0),0),reward:{support:2}})
];

export function createWeeklyGoals(state,rng=Math.random){
  const desired=2+(rng()>.65?1:0);
  const pool=[...GOAL_FACTORIES];
  const goals=[];
  while(goals.length<desired&&pool.length){
    const index=Math.min(pool.length-1,Math.floor(rng()*pool.length));
    goals.push(pool.splice(index,1)[0](state));
  }
  return goals;
}

export function selectManifesto(state,manifestoId){
  const manifesto=MANIFESTOS.find(item=>item.id===manifestoId);
  if(!manifesto)throw new Error('不明な公約です');
  const termGoals=[
    {id:`manifesto:${manifesto.id}:term:${state.term}`,type:'manifesto',label:manifesto.description,metric:manifesto.metric,target:manifesto.target,status:'active'},
    {id:`treasury:term:${state.term}`,type:'treasury_min',label:'任期終了時に市予算450億円以上',target:450,status:'active'},
    {id:`support:term:${state.term}`,type:'metric_min',metric:'support',label:'任期終了時に支持率60以上',target:60,status:'active'}
  ];
  return {...state,manifesto:manifestoId,termGoals};
}

const goalReached=(goal,state)=>{
  if(goal.type==='weekly_balance')return state.weeklyIncome-state.weeklyExpense>=goal.target;
  if(goal.type==='treasury_min')return state.treasury>=goal.target;
  if(goal.type==='metric_min')return (state[goal.metric]??0)>=goal.target;
  if(goal.type==='project_progress')return (state.activeProjects||[]).reduce((sum,item)=>sum+(item.progress||0),0)-(goal.baseline||0)>=goal.target;
  return false;
};

export function evaluateGoals(state){
  const completed=[];
  const failed=[];
  let next={...state};
  const weeklyGoals=(state.weeklyGoals||[]).map(goal=>{
    if(goal.status!=='active')return goal;
    if(goalReached(goal,state)){
      const done={...goal,status:'completed',completedWeek:state.week};
      completed.push(done);
      for(const [key,value] of Object.entries(goal.reward||{}))next[key]=clamp((next[key]??0)+value);
      return done;
    }
    const miss={...goal,status:'failed',failedWeek:state.week};
    failed.push(miss);
    return miss;
  });
  next={...next,weeklyGoals,newsQueue:[...completed.map(goal=>({id:`goal-${goal.id}`,week:state.week,type:'goal',title:'週次目標を達成',body:goal.label,createdAt:new Date().toISOString()})),...next.newsQueue]};
  return {state:next,completed,failed};
}

export function electionScore(state){
  const metrics=(state.support+state.economy+state.life+state.environment+state.safety+state.councilApproval)/6;
  const finance=Math.max(0,Math.min(100,50+(state.treasury-300)/8-state.debt/20));
  let score=metrics*.72+finance*.28;
  const manifesto=MANIFESTOS.find(item=>item.id===state.manifesto);
  if(manifesto&&state[manifesto.metric]<manifesto.target)score-=12;
  else if(manifesto)score+=5;
  return clamp(score);
}

export function evaluateTerm(state){
  if(state.termWeek<12)return {state,election:null};
  const termGoals=(state.termGoals||[]).map(goal=>({...goal,status:goalReached(goal,state)?'completed':'failed'}));
  const completed=termGoals.filter(goal=>goal.status==='completed').length;
  const failed=termGoals.length-completed;
  const score=clamp(electionScore(state)+completed*2-failed*2);
  const won=score>=50;
  const election={term:state.term,week:state.week,score,won,manifesto:state.manifesto,completedGoals:completed,failedGoals:failed};
  if(!won)return {state:{...state,termGoals,gameStatus:'lost',gameOverReason:'選挙で落選しました',lastElection:election},election};
  return {state:{...state,termGoals:[],manifesto:null,term:state.term+1,termWeek:0,support:clamp(state.support+4),councilApproval:clamp(state.councilApproval+3),lastElection:election},election};
}
