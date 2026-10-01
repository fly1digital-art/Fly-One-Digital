export class RequestError extends Error {
 constructor(public status:number,public retryAfter?:number){super('REQUEST_REJECTED')}
}
export const responseHeaders={
 'Cache-Control':'no-store, private',
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'no-referrer',
 'Cross-Origin-Resource-Policy':'same-origin',
};
/** Limit bytes as they arrive: Content-Length may be absent or dishonest. */
export async function readRequestBody(request:Request,maxBytes=8192):Promise<Record<string,unknown>> {
 if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw new RequestError(403);
 if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')throw new RequestError(415);
 const declared=request.headers.get('content-length');
 if(declared&&(!/^\d+$/.test(declared)||Number(declared)>maxBytes))throw new RequestError(413);
 if(!request.body)throw new RequestError(400);
 const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new RequestError(413)}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
 try {const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!value||Array.isArray(value)||typeof value!=='object')throw new Error();return value}catch{throw new RequestError(400)}
}
export const validReference=(v:unknown):v is string=>typeof v==='string'&&/^F06-[A-F0-9]{16}$/.test(v);
export const validToken=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
export const validIdempotency=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(v);
