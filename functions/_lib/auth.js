import {validateId} from './validation.js';
const encoder=new TextEncoder();
const ITERATIONS=210000;
const bytesToHex=bytes=>[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
const hexToBytes=hex=>new Uint8Array((hex.match(/.{1,2}/g)||[]).map(x=>parseInt(x,16)));
export function normalizeUsername(value){const username=String(value||'').trim().normalize('NFKC');if(!/^[\p{L}\p{N}_-]{3,20}$/u.test(username))throw new Error('INVALID_USERNAME');return username}
export function validatePassword(value){const password=String(value||'');if(password.length<8||password.length>72)throw new Error('INVALID_PASSWORD');return password}
export async function hashPassword(password,saltHex=null){password=validatePassword(password);const salt=saltHex?hexToBytes(saltHex):crypto.getRandomValues(new Uint8Array(16));const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:ITERATIONS},key,256);return {hash:bytesToHex(new Uint8Array(bits)),salt:bytesToHex(salt)}}
export async function verifyPassword(password,salt,expected){const actual=await hashPassword(password,salt);const a=hexToBytes(actual.hash),b=hexToBytes(expected);if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0}
export function parseCookies(header=''){return Object.fromEntries(String(header).split(';').map(v=>v.trim()).filter(Boolean).map(v=>{const i=v.indexOf('=');return i<0?[v,'']:[v.slice(0,i),decodeURIComponent(v.slice(i+1))]}))}
export async function sha256Hex(value){const digest=await crypto.subtle.digest('SHA-256',encoder.encode(value));return bytesToHex(new Uint8Array(digest))}
export function createToken(){return bytesToHex(crypto.getRandomValues(new Uint8Array(32)))}
export const sessionCookie=token=>`tm_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
export const clearSessionCookie=()=>`tm_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export async function sessionUser(request,env){if(!env?.DB)return null;const token=parseCookies(request.headers.get('cookie')).tm_session;if(!token)return null;const hash=await sha256Hex(token);const row=await env.DB.prepare("SELECT users.id,users.username FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>?").bind(hash,new Date().toISOString()).first();return row||null}
export async function principalId(request,env){const user=await sessionUser(request,env);if(user)return `user:${user.id}`;return `guest:${validateId(request.headers.get('x-player-id'),'player_id')}`}
export async function issueSession(db,userId){const token=createToken();const hash=await sha256Hex(token);const expires=new Date(Date.now()+30*86400000).toISOString();await db.prepare('INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)').bind(hash,userId,expires,new Date().toISOString()).run();return token}
