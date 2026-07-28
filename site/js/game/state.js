export const GAME_VERSION='0.7.0';
export const PHASES=['focus','policy','preview','project','response','city','summary'];

const number=(value,fallback,min=-Infinity,max=Infinity)=>{
  const parsed=Number(value);
  if(!Number.isFinite(parsed))return fallback;
  return Math.max(min,Math.min(max,Math.round(parsed)));
};

const array=value=>Array.isArray(value)?value:[];
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};

export function createInitialState(){
  return {
    version:GAME_VERSION,
    week:1,
    phase:'focus',
    term:1,
    termWeek:1,
    cityName:'見習い市',
    rank:'見習い市長',
    treasury:550,
    weeklyIncome:0,
    weeklyExpense:0,
    projectedTreasury:550,
    debt:0,
    reserveFund:50,
    support:55,
    economy:50,
    life:50,
    environment:50,
    safety:50,
    councilApproval:55,
    weeklyFocus:null,
    delegationPolicy:'balanced',
    activeProjects:[],
    completedProjects:[],
    recurringPolicies:[],
    ledgerEntries:[],
    weeklyGoals:[],
    termGoals:[],
    manifesto:null,
    eventPipelines:[],
    residentStories:{},
    residents:{shopkeeper:50,parent:50,worker:50,student:50},
    districts:{central:{level:1,exp:0},residential:{level:1,exp:0},river:{level:1,exp:0},industry:{level:1,exp:0},school:{level:1,exp:0},port:{level:1,exp:0}},
    cityVisualState:{},
    newsQueue:[],
    autoHandledCases:[],
    leaves:15,
    ownedCosmetics:['classic'],
    equippedSkin:'classic',
    history:[],
    weekSummaries:[],
    flags:[],
    gameStatus:'active',
    gameOverReason:null
  };
}

export const isV07State=raw=>Boolean(raw&&typeof raw==='object'&&!Array.isArray(raw)&&raw.version===GAME_VERSION);

export function normalizeState(raw){
  const base=createInitialState();
  if(!isV07State(raw))return base;
  const next={...base,...raw};
  for(const key of ['week','term','termWeek'])next[key]=number(next[key],base[key],1,9999);
  for(const key of ['treasury','weeklyIncome','weeklyExpense','projectedTreasury','debt','reserveFund'])next[key]=number(next[key],base[key],-1000000,1000000);
  for(const key of ['support','economy','life','environment','safety','councilApproval'])next[key]=number(next[key],base[key],0,100);
  next.leaves=number(next.leaves,base.leaves,0,1000000);
  next.phase=PHASES.includes(next.phase)?next.phase:'focus';
  for(const key of ['activeProjects','completedProjects','recurringPolicies','ledgerEntries','weeklyGoals','termGoals','eventPipelines','newsQueue','autoHandledCases','ownedCosmetics','history','weekSummaries','flags'])next[key]=array(next[key]);
  for(const key of ['residentStories','residents','districts','cityVisualState'])next[key]=object(next[key]);
  if(!next.ownedCosmetics.includes('classic'))next.ownedCosmetics.unshift('classic');
  next.gameStatus=['active','lost','won'].includes(next.gameStatus)?next.gameStatus:'active';
  return next;
}
