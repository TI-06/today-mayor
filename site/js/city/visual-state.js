const clamp=(value,min=0,max=10)=>Math.max(min,Math.min(max,Math.round(value)));
const has=(state,id)=>(state.completedProjects||[]).includes(id)||(state.activeProjects||[]).some(item=>item.id===id&&item.status!=='completed');

export function deriveCityVisualState(state){
  const economy=Number(state.economy)||50;
  const life=Number(state.life)||50;
  const environment=Number(state.environment)||50;
  const safety=Number(state.safety)||50;
  const financeCrisis=state.treasury<0||state.projectedTreasury<0;
  const activeFlood=(state.eventPipelines||[]).some(item=>item.eventId==='flood-warning'&&['preview','response','followup'].includes(item.stage));
  const floodResult=(state.eventPipelines||[]).find(item=>item.eventId==='flood-warning'&&item.resultId==='flooded');
  const constructionSites=(state.activeProjects||[]).filter(item=>item.status==='active').length;
  const completed=state.completedProjects||[];
  return {
    weather:activeFlood?'storm':environment>=65?'clear':'cloudy',
    pedestrians:clamp(2+(economy-50)/8+(life-50)/12+(has(state,'station-redevelopment')?2:0),0,9),
    tourists:clamp((state.weeklyFocus==='tourism'?2:0)+(has(state,'port-market')?3:0)+(has(state,'station-redevelopment')?1:0),0,8),
    trucks:clamp((state.weeklyFocus==='industry'?2:0)+(economy>65?1:0),0,6),
    litShops:clamp(3+(economy-50)/7+(completed.includes('station-redevelopment')?3:0)+(completed.includes('port-market')?2:0),1,10),
    trees:clamp(3+(environment-50)/7+(completed.includes('river-park')?4:0),0,10),
    constructionSites,
    closedFacilities:financeCrisis?clamp(Math.abs(state.treasury)/40,1,5):0,
    floodLevel:floodResult?2:activeFlood?1:0,
    mood:financeCrisis?'worried':economy>=70&&life>=65?'lively':life<35?'tense':'calm',
    decorations:state.weeklyFocus==='tourism'?'festival':state.weeklyFocus==='environment'?'green':null,
    projects:completed
  };
}
