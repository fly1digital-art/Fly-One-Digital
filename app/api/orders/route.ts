import { body, config, database, digest, json, summary, guard, limit, failure } from '@/lib/server';
import { cleanCampaign, normalizePhone, validateOrder } from '@/lib/product';
import {readSiteContent} from '@/lib/site-settings';
import {validIdempotency,validToken} from '@/lib/security';
export async function POST(request:Request){try{
 const data=await body(request);await guard(request,'order');
 const input={name:typeof data.name==='string'?data.name.trim():'',phone:typeof data.phone==='string'?normalizePhone(data.phone):'',address:typeof data.address==='string'?data.address.trim():'',area:typeof data.area==='string'?data.area:''};
 const errors=validateOrder(input);if(Object.keys(errors).length)return json({error:'আপনার তথ্যগুলো ঠিক করে আবার চেষ্টা করুন।',errors},422);
 if(!validIdempotency(data.idempotencyKey)||!validToken(data.token))return json({error:'অর্ডারের নিরাপদ সংযোগ তৈরি হয়নি। পেজ রিফ্রেশ করে চেষ্টা করুন।'},422);
 const tokenHash=await digest(data.token),inputHash=await digest(JSON.stringify(input)),db=database();
 const previous=await db.prepare('SELECT * FROM orders WHERE idempotency_key = ?').bind(data.idempotencyKey).first<any>();
 if(previous){if(previous.token_hash!==tokenHash||previous.input_hash!==inputHash)return json({error:'অর্ডারের তথ্য বদলেছে। নতুন করে অর্ডার দিন।'},409);return json({order:summary(previous),replayed:true});}
 await limit('phone-order',input.phone,5,3600);
 const reference='F06-'+crypto.randomUUID().replaceAll('-','').slice(0,16).toUpperCase(),now=new Date().toISOString(),product=(await readSiteContent()).document.product,fee=product.deliveryFee,price={subtotal:product.price,delivery:fee,total:product.price+fee};
 await db.prepare('INSERT INTO orders (reference,idempotency_key,token_hash,input_hash,name,phone,address,area,subtotal,delivery,total,status,payment_status,created_at,updated_at,campaign,is_demo,purchase_claimed) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0) ON CONFLICT(idempotency_key) DO NOTHING').bind(reference,data.idempotencyKey,tokenHash,inputHash,input.name,input.phone,input.address,input.area,price.subtotal,price.delivery,price.total,'received','unpaid',now,now,JSON.stringify(cleanCampaign(data.campaign)),config().mode==='demo'?1:0).run();
 const saved=await db.prepare('SELECT * FROM orders WHERE idempotency_key = ?').bind(data.idempotencyKey).first<any>();
 if(!saved)throw new Error('SAVE_FAILED');
 if(saved.token_hash!==tokenHash||saved.input_hash!==inputHash)return json({error:'অর্ডারের তথ্য বদলেছে। নতুন করে চেষ্টা করুন।'},409);
 return json({order:summary(saved),replayed:saved.reference!==reference},saved.reference===reference?201:200);
 }catch(error){return failure(error,'অর্ডার সংরক্ষণ করা যায়নি। আপনার তথ্য আছে—আবার চেষ্টা করুন।')}}
