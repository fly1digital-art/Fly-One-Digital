import {allowedAdmin,runtime,json,limit,failure} from '@/lib/server';
import {RequestError} from '@/lib/security';
export async function POST(request:Request){try{
 const user=await allowedAdmin();if(!user)return json({error:'প্রবেশাধিকার নেই।'},403);
 if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw new RequestError(403);
 await limit('media-upload',user.userId,10,60);
 const mime=request.headers.get('content-type')||'',video=['video/mp4','video/webm'].includes(mime);
 if(!video&&!['image/jpeg','image/png','image/webp'].includes(mime))throw new RequestError(415);
 const max=(video?20:5)*1024*1024;if(Number(request.headers.get('content-length')||0)>max)throw new RequestError(413);
 if(!request.body)throw new RequestError(400);
 const reader=request.body.getReader();let size=0;const first:Uint8Array[]=[];
 // Read just enough for file signature validation before accepting the remainder.
 while(size<32){const part=await reader.read();if(part.done)break;size+=part.value.length;first.push(part.value);if(size>max){await reader.cancel();throw new RequestError(413)}}
 const header=new Uint8Array(Math.min(size,32));let offset=0;for(const part of first){const n=Math.min(part.length,32-offset);if(n>0)header.set(part.subarray(0,n),offset);offset+=n}
 const text=(a:number,b:number)=>new TextDecoder().decode(header.slice(a,b));
 const valid=mime==='image/png'&&[137,80,78,71,13,10,26,10].every((v,i)=>header[i]===v)||mime==='image/jpeg'&&header[0]===255&&header[1]===216&&header[2]===255||mime==='image/webp'&&text(0,4)==='RIFF'&&text(8,12)==='WEBP'||mime==='video/mp4'&&text(4,8)==='ftyp'||mime==='video/webm'&&[26,69,223,163].every((v,i)=>header[i]===v);
 if(!valid){await reader.cancel();throw new RequestError(415)}
 const bucket=runtime().MEDIA;if(!bucket){await reader.cancel();throw new Error('UNAVAILABLE')}
 const extension:Record<string,string>={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'};
 const key=crypto.randomUUID()+'.'+extension[mime];
 // Keep the bounded payload in memory: R2 needs a known-length body.
 while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>max){await reader.cancel();throw new RequestError(413)}first.push(part.value)}
 reader.releaseLock();
 const bytes=new Uint8Array(size);let written=0;for(const part of first){bytes.set(part,written);written+=part.length}
 await bucket.put(key,bytes,{httpMetadata:{contentType:mime}});
 return json({url:'/api/media/'+key},201);
 }catch(e){return failure(e,'আপলোড হয়নি। ছবি সর্বোচ্চ ৫ MB; MP4/WebM ভিডিও সর্বোচ্চ ২০ MB।')}
}
