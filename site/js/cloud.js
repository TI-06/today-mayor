const PLAYER_KEY='today-mayor-player-id';
const headers=()=>({'content-type':'application/json','x-player-id':getPlayerId()});
export function getPlayerId(){let id=localStorage.getItem(PLAYER_KEY);if(!id){id=`guest_${crypto.randomUUID().replaceAll('-','')}`;localStorage.setItem(PLAYER_KEY,id)}return id}
async function request(path,options={},timeout=7000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(path,{credentials:'same-origin',...options,headers:{...headers(),...(options.headers||{})},signal:controller.signal});const data=await response.json().catch(()=>({ok:false,error:'INVALID_RESPONSE'}));if(!response.ok)throw new Error(data.error||`HTTP_${response.status}`);return data}finally{clearTimeout(timer)}}
export async function getCloudStatus(){try{return await request('/api/health')}catch{return {ok:false,database:false,offline:true}}}
export const getCurrentUser=()=>request('/api/auth/me');
export const registerUser=(username,password)=>request('/api/auth/register',{method:'POST',body:JSON.stringify({username,password})});
export const loginUser=(username,password)=>request('/api/auth/login',{method:'POST',body:JSON.stringify({username,password})});
export const logoutUser=()=>request('/api/auth/logout',{method:'POST',body:'{}'});
export const loadCloudState=()=>request('/api/save');
export const saveCloudState=state=>request('/api/save',{method:'PUT',body:JSON.stringify({state})});
export const submitChoice=(policyId,choiceId)=>request('/api/choice',{method:'POST',body:JSON.stringify({policyId,choiceId})});
export const fetchRanking=()=>request('/api/ranking');
export const submitRanking=state=>request('/api/ranking',{method:'POST',body:JSON.stringify({state,cityName:state.cityName,rankName:state.rank})});
