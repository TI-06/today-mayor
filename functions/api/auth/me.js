import {json} from '../../_lib/response.js';import {sessionUser} from '../../_lib/auth.js';
export async function onRequestGet({request,env}){const user=await sessionUser(request,env);return json({ok:true,user:user?{id:user.id,username:user.username}:null})}
