export function requireDB(env){if(!env?.DB)throw new Error('DB_NOT_BOUND');return env.DB}
export function mapDbError(error){const code=error?.message||'UNKNOWN';if(code==='DB_NOT_BOUND')return {status:503,error:'CLOUD_NOT_CONFIGURED'};if(code.startsWith('INVALID_')||code==='STATE_TOO_LARGE'||code==='PAYLOAD_TOO_LARGE')return {status:400,error:code};return {status:500,error:'INTERNAL_ERROR'}}
