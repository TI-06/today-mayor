const ID_RE=/^[a-zA-Z0-9_-]{1,80}$/;
export function validateId(value,name='id'){if(!ID_RE.test(String(value||'')))throw new Error(`INVALID_${name.toUpperCase()}`);return String(value)}
export function playerIdFrom(request){return validateId(request.headers.get('x-player-id'),'player_id')}
export function sanitizeCityName(value){const name=String(value||'見習い市').trim().slice(0,24);return name||'見習い市'}
export function scoreFromState(state){if(!state||typeof state!=='object')return 0;const values=['support','economy','life','environment','safety'].map(k=>Number(state[k])||0);const avg=values.reduce((a,b)=>a+b,0)/values.length;const day=Math.max(1,Number(state.day)||1);const term=Math.max(1,Number(state.term)||1);const buildings=Array.isArray(state.buildings)?state.buildings.length:0;return Math.max(0,Math.round(avg*100+day*12+term*250+buildings*90))}
export function sanitizeState(state){if(!state||typeof state!=='object'||Array.isArray(state))throw new Error('INVALID_STATE');const jsonText=JSON.stringify(state);if(jsonText.length>150000)throw new Error('STATE_TOO_LARGE');return JSON.parse(jsonText)}
