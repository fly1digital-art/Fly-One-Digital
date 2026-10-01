import {runtime} from '@/lib/server';
export async function GET(request:Request,{params}:{params:Promise<{key:string}>}){
 const {key}=await params;if(!/^[a-f0-9-]{36}\.(png|jpg|webp|mp4|webm)$/.test(key))return new Response(null,{status:404});
 try{
 const bucket=runtime().MEDIA;if(!bucket)return new Response(null,{status:503});
 const meta=await bucket.head(key);if(!meta)return new Response(null,{status:404});
 const headers=new Headers({'Content-Type':meta.httpMetadata?.contentType||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=31536000, immutable','Content-Security-Policy':"default-src 'none'",'Accept-Ranges':'bytes','ETag':meta.httpEtag});
 const range=request.headers.get('range');let offset=0,end=meta.size-1;
 if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+meta.size}});if(match[1]){offset=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end}else{offset=Math.max(0,meta.size-Number(match[2]))}if(!Number.isSafeInteger(offset)||!Number.isSafeInteger(end)||offset>end||offset>=meta.size)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+meta.size}})}
 const file=await bucket.get(key,range?{range:{offset,length:end-offset+1}}:undefined);if(!file)return new Response(null,{status:404});
 headers.set('Content-Length',String(end-offset+1));if(range)headers.set('Content-Range',`bytes ${offset}-${end}/${meta.size}`);
 return new Response(file.body,{status:range?206:200,headers});
 }catch{return new Response(null,{status:503})}
}
