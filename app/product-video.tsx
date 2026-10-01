'use client';
import {useState} from 'react';
import {ExternalLink} from 'lucide-react';
import {usePreferences} from './preferences';
import {parseVideo,videoUrl,type SiteContent} from '@/lib/site-content';
export default function ProductVideo({content}:{content:SiteContent}){
 const {t,language}=usePreferences(),[failed,setFailed]=useState(false),video=parseVideo(videoUrl(content));
 if(!video)return null;
 const embed=video.kind==='youtube'?'https://www.youtube-nocookie.com/embed/'+video.id+'?autoplay=1&mute=1&rel=0&playsinline=1&hl='+language:'https://www.facebook.com/plugins/video.php?href='+encodeURIComponent(video.url)+'&show_text=false&autoplay=true&mute=1';
 return <section id="video" className="wrap section video-section"><div className="section-heading"><div><p className="eyebrow">{t('ভিডিওতে দেখুন')}</p><h2>{t(content.sample?'নমুনা ভিডিও':'পণ্যটি আরও কাছ থেকে দেখুন।')}</h2></div><p className="muted">{t(content.sample?'এটি ভিডিও প্লেয়ারের নমুনা, F-06 পণ্যের প্রদর্শনী নয়।':'ভিডিও দেখে পণ্য সম্পর্কে আরও জানুন।')}</p></div><div className="video-frame">{video.kind==='file'?<video key={video.url} src={video.url} autoPlay muted playsInline controls preload="auto" onError={()=>setFailed(true)} aria-label={t('F-06 পণ্যের ভিডিও')}/>:<iframe key={embed} src={embed} title={t('F-06 পণ্যের ভিডিও')} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>}</div><p className="fine">{t(failed?'ভিডিও লোড হয়নি। নিচের লিংকে আবার চেষ্টা করুন।':'ভিডিও শব্দ বন্ধ রেখে শুরু হবে। না চললে Play চাপুন।')} <a href={video.url} target="_blank" rel="noopener noreferrer" className="inline-link">{t('ভিডিও আলাদাভাবে খুলুন')}<ExternalLink size={14}/></a></p></section>
}
