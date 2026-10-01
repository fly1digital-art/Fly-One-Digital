import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { type PublicConfig } from './product';
import {readRequestBody,RequestError,responseHeaders,validReference,validToken} from './security';
export const runtime = () => env as unknown as { DB?:D1Database; MEDIA?:R2Bucket; CHECKOUT_MODE?:string; META_PIXEL_ID?:string; ADMIN_EMAILS?:string };
export function config():PublicConfig {const e=runtime();return {mode:e.DB && e.CHECKOUT_MODE==='live'?'live':'demo',pixelId:/^\d{5,25}$/.test(e.META_PIXEL_ID||'')?e.META_PIXEL_ID!:''};}
export function database(){const db=runtime().DB;if(!db)throw new Error('STORAGE_UNAVAILABLE');return db;}
export function json(value:unknown,status=200,extra:Record<string,string>={}){return Response.json(value,{status,headers:{...responseHeaders,...extra}});}
export const body=readRequestBody;
export function failure(error:unknown,message:string){return error instanceof RequestError?json({error:error.status===429?'অনেক অনুরোধ এসেছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।':'এই অনুরোধ গ্রহণ করা যায়নি।'},error.status,error.retryAfter?{'Retry-After':String(error.retryAfter)}:{}):json({error:message},503)}
export const digest=async(value:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(n=>n.toString(16).padStart(2,'0')).join('');
export async function allowedAdmin(){const user=await getChatGPTUser();const allowed=(runtime().ADMIN_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);return user && allowed.includes(user.email.toLowerCase())?user:null;}
export function summary(row:any){return {reference:row.reference,createdAt:row.created_at,updatedAt:row.updated_at,status:row.status,paymentStatus:row.payment_status,area:row.area,subtotal:row.subtotal,delivery:row.delivery,total:row.total,quantity:1,demo:!!row.is_demo};}
export async function findAuthorized(request:Request,reference:unknown){const header=request.headers.get('authorization')||'';if(!header.startsWith('Bearer '))return null;const token=header.slice(7);if(!validReference(reference)||!validToken(token))return null;return database().prepare('SELECT * FROM orders WHERE reference = ? AND token_hash = ?').bind(reference,await digest(token)).first<any>();}

/** An atomic shared counter works across Worker instances and concurrent calls. */
export async function limit(scope:string,identity:string,max:number,seconds:number){
 const now=Math.floor(Date.now()/1000),expires=Math.floor(now/seconds)*seconds+seconds;
 const key=scope+':'+await digest(identity+':'+expires),db=database();
 await db.prepare('DELETE FROM rate_limits WHERE key IN (SELECT key FROM rate_limits WHERE expires_at <= ? LIMIT 100)').bind(now).run();
 const result=await db.prepare('INSERT INTO rate_limits (key,hits,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET hits=rate_limits.hits+1 WHERE rate_limits.hits < ? RETURNING hits').bind(key,expires,max).first<{hits:number}>();
 if(!result)throw new RequestError(429,Math.max(1,expires-now));
}
export async function guard(request:Request,scope:string){
 // The platform's Cloudflare header is used when present; no forwarded-for is trusted.
 const address=request.headers.get('cf-connecting-ip');
 if(address&&address.length<=64&&/^[0-9a-fA-F:.]+$/.test(address))await limit('client:'+scope,address,60,60);
 // Site-wide ceilings still apply if client IP is unavailable or rotates.
 await limit('site:'+scope,'all',scope==='order'?120:600,60);
}
