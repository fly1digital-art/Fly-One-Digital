export const palettes = ['mono','red','noir','ocean','clay','lavender','sage','gold','teal','pink','custom'] as const;
export type Palette=typeof palettes[number];
export const isPalette=(v:unknown):v is Palette=>typeof v==='string'&&(palettes as readonly string[]).includes(v);
export const SAMPLE_VIDEO='M7lc1UVf-VE';
export type CopyEntry={bn:string;en:string};
export const imageSlots=['hero','checkout','product','gallery0','gallery1','gallery2','gallery3','gallery4','gallery5','gallery6'] as const;
export const sectionKeys=['details','gallery','video','steps','faq'] as const;
export type CustomColours={background:string;primary:string;surface:string};
export const defaultColours:CustomColours={background:"#ffffff",primary:"#b92332",surface:"#f4e8e9"};
export const validColours=(v:unknown):v is CustomColours=>!!v&&typeof v==="object"&&["background","primary","surface"].every(k=>/^#[a-fA-F0-9]{6}$/.test((v as Record<string,string>)[k]||""));
export type ContentDocument={videoUrl?:string;design:CustomColours;copy:Record<string,CopyEntry>;images:Record<string,string>;sections:Record<string,boolean>;product:{name:string;model:string;brand:string;price:number;regular:number;deliveryFee:number;phone:string;facebook:string;version:string;battery:string};seo:{title:string;description:string}};
export type SiteContent={palette:Palette;videoId:string;sample:boolean;document:ContentDocument};
export const defaultDocument:ContentDocument={design:defaultColours,copy:{},images:{hero:'/images/77767.webp',checkout:'/images/77768.webp',product:'/images/77767.webp',gallery0:'/images/77767.webp',gallery1:'/images/77768.webp',gallery2:'/images/77769.webp',gallery3:'/images/77770.webp',gallery4:'/images/77757.webp',gallery5:'/images/77752.webp',gallery6:'/images/77755.webp'},sections:{details:true,gallery:true,video:true,steps:true,faq:true},product:{name:'Glasses Wireless headset',model:'F-06',brand:'Glasses',price:799,regular:1199,deliveryFee:130,phone:'+8801323527412',facebook:'https://www.facebook.com/99fay/',version:'V5.4',battery:'80mAh'},seo:{title:'F-06 গ্লাসেস ওয়্যারলেস হেডসেট | ৳৭৯৯-এ ক্যাশ অন ডেলিভারি',description:'চশমা পরুন। প্রিয় গানও শুনুন। F-06 Glasses Wireless headset এখন ৳৭৯৯। সারা বাংলাদেশে ডেলিভারি ৳১৩০।'}};
export function resolveDocument(raw:Partial<ContentDocument>={}):ContentDocument{return {videoUrl:raw.videoUrl,design:raw.design||defaultColours,copy:raw.copy||{},images:{...defaultDocument.images,...raw.images},sections:{...defaultDocument.sections,...raw.sections},product:{...defaultDocument.product,...raw.product,phone:(!raw.product?.phone||raw.product.phone==='+8801990090262')?defaultDocument.product.phone:raw.product.phone},seo:{...defaultDocument.seo,...raw.seo}}}
export function safeImage(v:unknown):v is string{return typeof v==='string'&&v.length<=500&&(/^\/images\/[A-Za-z0-9_.-]+\.(?:webp|png|jpg|jpeg)$/.test(v)||/^\/api\/media\/[a-f0-9-]{36}\.(?:webp|png|jpg)$/.test(v))}
export function validDocument(v:unknown):v is ContentDocument {
 if(!v||typeof v!=='object')return false;const d=v as ContentDocument;if(!validColours(d.design)||!d.product||!d.images||!d.sections||!d.copy||!d.seo)return false;
 if(d.videoUrl!==undefined&&!parseVideo(d.videoUrl))return false;const p=d.product;for(const key of ['price','regular','deliveryFee'] as const)if(!Number.isSafeInteger(p[key])||p[key]<0||p[key]>1000000)return false;
 if(p.price<1||p.regular<p.price||!/^\+8801[3-9]\d{8}$/.test(p.phone))return false;
 for(const key of ['name','model','brand','version','battery'] as const)if(typeof p[key]!=='string'||!p[key].trim()||p[key].length>120)return false;
 try{const u=new URL(p.facebook);if(u.protocol!=='https:'||!['www.facebook.com','facebook.com'].includes(u.hostname)||u.username||u.password)return false}catch{return false}
 if(imageSlots.some(k=>!safeImage(d.images[k]))||Object.keys(d.images).some(k=>!(imageSlots as readonly string[]).includes(k)))return false;
 if(sectionKeys.some(k=>typeof d.sections[k]!=='boolean'))return false;
 if(Object.keys(d.copy).length>500)return false;for(const [k,x] of Object.entries(d.copy))if(k.length>1500||!x||typeof x.bn!=='string'||typeof x.en!=='string'||x.bn.length>3000||x.en.length>3000)return false;
 return typeof d.seo.title==='string'&&d.seo.title.length>0&&d.seo.title.length<=160&&typeof d.seo.description==='string'&&d.seo.description.length<=400;
}
export const defaultContent:SiteContent={palette:'red',videoId:SAMPLE_VIDEO,sample:true,document:defaultDocument};
export const paletteNames:Record<Palette,string>={mono:'সাদা ও কালো',red:'লাল ও সাদা',noir:'কালো ও লাল',gold:'সোনালি',teal:'সমুদ্র সবুজ',pink:'গোলাপি',custom:'নিজের রং',ocean:'নীল ও নেভি',clay:'টেরাকোটা',lavender:'ল্যাভেন্ডার',sage:'সেজ সবুজ'};
/** Only known YouTube hosts and single-video identifiers are accepted. */
export function youtubeId(value:unknown):string|null {
 if(typeof value!=='string'||value.length>500)return null;
 try{const url=new URL(value.trim());if(url.protocol!=='https:'||url.username||url.password||url.port)return null;const host=url.hostname.toLowerCase();let id:string|null=null;
 if(host==='youtu.be')id=url.pathname.split('/')[1];
 else if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(host)){
 const parts=url.pathname.split('/').filter(Boolean);if(url.pathname==='/watch')id=url.searchParams.get('v');else if(['embed','shorts','live'].includes(parts[0])&&parts.length===2)id=parts[1];}
 return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null;
 }catch{return null}
}

export function parseVideo(value:unknown):{kind:'youtube'|'facebook'|'file';url:string;id?:string}|null {
 if(typeof value!=='string'||value.length>500)return null;
 const s=value.trim(),id=youtubeId(s);if(id)return {kind:'youtube',url:'https://www.youtube.com/watch?v='+id,id};
 if(/^\/api\/media\/[a-f0-9-]{36}\.(mp4|webm)$/.test(s))return {kind:'file',url:s};
 try{const u=new URL(s);if(u.protocol!=='https:'||u.username||u.password||u.port||!['www.facebook.com','facebook.com','m.facebook.com'].includes(u.hostname))return null;
 const valid=/^\/[^/]+\/videos\/(?:[^/]+\/)?\d+\/?$/.test(u.pathname)||/^\/reel\/\d+\/?$/.test(u.pathname)||(u.pathname==='/watch/'||u.pathname==='/watch'||u.pathname==='/video.php')&&/^\d+$/.test(u.searchParams.get('v')||'');
 if(!valid)return null;u.hostname='www.facebook.com';u.hash='';return {kind:'facebook',url:u.toString()};}catch{return null}
}
export const videoUrl=(c:SiteContent)=>c.document.videoUrl||'https://www.youtube.com/watch?v='+c.videoId;
