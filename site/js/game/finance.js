const integer=(value,fallback=0)=>Number.isFinite(Number(value))?Math.round(Number(value)):fallback;
const active=item=>item?.status!=='paused'&&item?.status!=='stopped'&&item?.status!=='completed';

export function postLedgerEntry(state,entry){
  const week=integer(entry.week,state.week);
  const phase=entry.phase||state.phase;
  const settlementKey=entry.settlementKey||'once';
  const duplicate=state.ledgerEntries.some(item=>item.week===week&&item.sourceId===entry.sourceId&&item.settlementKey===settlementKey);
  if(duplicate)return state;
  const amount=integer(entry.amount);
  const normalized={
    id:entry.id||`${entry.sourceId}:${settlementKey}:${week}`,
    week,
    phase,
    type:amount>=0?'income':'expense',
    category:entry.category||'other',
    label:entry.label||'資金変動',
    amount,
    sourceId:entry.sourceId||entry.id||'unknown',
    settlementKey,
    createdAt:entry.createdAt||new Date().toISOString()
  };
  return {...state,treasury:integer(state.treasury)+amount,ledgerEntries:[...state.ledgerEntries,normalized]};
}

export function calculateWeeklyIncome(state){
  const baseTax=34;
  const economyTax=Math.round((integer(state.economy,50)-50)*0.5);
  const projectIncome=(state.completedProjects||[]).reduce((sum,id)=>sum+(id==='station-redevelopment'?8:id==='port-market'?7:id==='digital-city-hall'?3:0),0);
  const focusIncome=state.weeklyFocus==='finance'?6:state.weeklyFocus==='tourism'?3:state.weeklyFocus==='industry'?4:0;
  return [
    {category:'tax',label:'基礎市税',amount:baseTax},
    {category:'economy',label:'経済活動税収',amount:economyTax},
    {category:'facility',label:'施設・観光収入',amount:projectIncome},
    {category:'focus',label:'重点方針効果',amount:focusIncome}
  ].filter(line=>line.amount!==0);
}

export function calculateWeeklyExpense(state){
  const administrationCost=20;
  const projectCost=(state.activeProjects||[]).filter(active).reduce((sum,item)=>sum+Math.max(0,integer(item.weeklyCost)),0);
  const policyCost=(state.recurringPolicies||[]).filter(active).reduce((sum,item)=>sum+Math.max(0,integer(item.weeklyCost)),0);
  const debtInterest=Math.ceil(Math.max(0,integer(state.debt))*0.02);
  const focusCost=state.weeklyFocus==='childcare'||state.weeklyFocus==='disaster'||state.weeklyFocus==='environment'?3:0;
  return [
    {category:'administration',label:'行政基本費',amount:administrationCost},
    {category:'project',label:'事業維持・工事費',amount:projectCost},
    {category:'policy',label:'継続政策費',amount:policyCost},
    {category:'debt',label:'市債利息',amount:debtInterest},
    {category:'focus',label:'重点施策準備費',amount:focusCost}
  ].filter(line=>line.amount!==0);
}

export function forecastNextTreasury(state){
  const income=calculateWeeklyIncome(state).reduce((sum,line)=>sum+line.amount,0);
  const expense=calculateWeeklyExpense(state).reduce((sum,line)=>sum+line.amount,0);
  return integer(state.treasury)+income-expense;
}

export function settleWeek(state){
  const existing=(state.weekSummaries||[]).find(summary=>summary.week===state.week);
  if(existing)return {state,summary:existing};
  let next=state;
  const incomeLines=calculateWeeklyIncome(state);
  const expenseLines=calculateWeeklyExpense(state);
  for(const [index,line] of incomeLines.entries())next=postLedgerEntry(next,{week:state.week,phase:'summary',category:line.category,label:line.label,amount:line.amount,sourceId:`weekly-income:${line.category}:${index}`,settlementKey:`week:${state.week}`});
  for(const [index,line] of expenseLines.entries())next=postLedgerEntry(next,{week:state.week,phase:'summary',category:line.category,label:line.label,amount:-line.amount,sourceId:`weekly-expense:${line.category}:${index}`,settlementKey:`week:${state.week}`});
  const income=incomeLines.reduce((sum,line)=>sum+line.amount,0);
  const expense=expenseLines.reduce((sum,line)=>sum+line.amount,0);
  const summary={week:state.week,income,expense,balance:income-expense,treasury:next.treasury,lines:[...incomeLines.map(line=>({...line,type:'income'})),...expenseLines.map(line=>({...line,type:'expense',amount:-line.amount}))]};
  next={...next,weeklyIncome:income,weeklyExpense:expense,weekSummaries:[summary,...(next.weekSummaries||[])].slice(0,52)};
  next={...next,projectedTreasury:forecastNextTreasury(next)};
  return {state:next,summary};
}

export function issueBond(state,amount){
  const value=integer(amount);
  if(value<=0||value>300)return {state,error:'市債発行額は1〜300億円で指定してください'};
  const next=postLedgerEntry({...state,debt:integer(state.debt)+value},{week:state.week,phase:state.phase,category:'bond',label:'市債発行',amount:value,sourceId:`bond:${state.week}:${integer(state.debt)}`,settlementKey:'issue'});
  return {state:{...next,projectedTreasury:forecastNextTreasury(next)}};
}

export function transferReserve(state,amount){
  const value=integer(amount);
  if(value===0)return {state,error:'金額を指定してください'};
  if(value>0&&value>state.treasury)return {state,error:'市予算が不足しています'};
  if(value<0&&Math.abs(value)>state.reserveFund)return {state,error:'予備費が不足しています'};
  const treasuryDelta=-value;
  const next={...state,treasury:integer(state.treasury)+treasuryDelta,reserveFund:integer(state.reserveFund)+value};
  const entry={id:`reserve:${state.week}:${state.ledgerEntries.length}`,week:state.week,phase:state.phase,type:treasuryDelta>=0?'income':'expense',category:'reserve',label:value>0?'予備費へ積立':'予備費を取り崩し',amount:treasuryDelta,sourceId:`reserve:${state.week}:${state.ledgerEntries.length}`,settlementKey:'transfer',createdAt:new Date().toISOString()};
  const withEntry={...next,ledgerEntries:[...state.ledgerEntries,entry]};
  return {state:{...withEntry,projectedTreasury:forecastNextTreasury(withEntry)}};
}

export function financeStatus(state){
  if(integer(state.treasury)<=-150||integer(state.debt)>=1000)return 'bankrupt';
  if(integer(state.treasury)<0||integer(state.projectedTreasury)<0||integer(state.debt)>=700)return 'crisis';
  if(integer(state.treasury)<120||integer(state.projectedTreasury)<80||integer(state.debt)>=400)return 'warning';
  return 'healthy';
}
