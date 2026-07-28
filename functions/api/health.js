import {json} from '../_lib/response.js';
export async function onRequestGet({env}){let database=false;if(env?.DB){try{await env.DB.prepare('SELECT 1').first();database=true}catch{database=false}}return json({ok:true,service:'today-mayor',database,version:'0.8.1'})}
