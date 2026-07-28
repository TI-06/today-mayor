const ID_RE=/^[a-zA-Z0-9_-]{1,80}$/;
export function validateId(value,name='id'){if(!ID_RE.test(String(value||'')))throw new Error(`INVALID_${name.toUpperCase()}`);return String(value)}
export function playerIdFrom(request){return validateId(request.headers.get('x-player-id'),'player_id')}
export function sanitizeCityName(value){const name=String(value||'見習い市').trim().slice(0,24);return name||'見習い市'}
export function scoreFromState(state){
  if(!state||typeof state!=='object')return 0;
  const values=['support','economy','life','environment','safety'].map(key=>Number(state[key])||0);
  const avg=values.reduce((sum,value)=>sum+value,0)/values.length;
  const progress=Math.max(1,Number(state.week)||Number(state.day)||1);
  const term=Math.max(1,Number(state.term)||1);
  const projects=Array.isArray(state.completedProjects)?state.completedProjects.length:Array.isArray(state.buildings)?state.buildings.length:0;
  const treasury=Math.max(-500,Math.min(1500,Number(state.treasury)||0));
  return Math.max(0,Math.round(avg*100+progress*14+term*250+projects*110+Math.max(0,treasury)*.3));
}
export function sanitizeState(state){if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('INVALID_STATE');const jsonText=JSON.stringify(state);if(jsonText.length>150000)throw new Error('STATE_TOO_LARGE');return JSON.parse(jsonText)}
