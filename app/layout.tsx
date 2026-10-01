import type { Metadata } from 'next';
import './globals.css';
import {readSiteContent} from '@/lib/site-settings';
import {PreferencesProvider} from './preferences';
const origin='https://f06-wireless-glasses.kamrun-nahar242424.chatgpt.site';
const title='F-06 গ্লাসেস ওয়্যারলেস হেডসেট | ৳৭৯৯-এ ক্যাশ অন ডেলিভারি';
const description='চশমা পরুন। প্রিয় গানও শুনুন। F-06 Glasses Wireless headset এখন ৳৭৯৯। সারা বাংলাদেশে ডেলিভারি ৳১৩০।';
const baseMetadata: Metadata = {metadataBase:new URL(origin),title,description,alternates:{canonical:origin},referrer:'no-referrer',icons:{icon:'/favicon.svg'},openGraph:{type:'website',locale:'bn_BD',url:origin,title,description,images:[{url:origin+'/images/77767.webp',width:1600,height:900,alt:'F-06 গ্লাসেস ওয়্যারলেস হেডসেট — বাস্তব পণ্যের ছবি'}]},twitter:{card:'summary_large_image',title,description,images:[origin+'/images/77767.webp']}};
export async function generateMetadata():Promise<Metadata>{const c=await readSiteContent(),{title,description}=c.document.seo;return {...baseMetadata,title,description,openGraph:{...baseMetadata.openGraph,title,description,images:[{url:origin+c.document.images.hero,width:1600,height:900,alt:c.document.product.name}]},twitter:{...baseMetadata.twitter,title,description,images:[origin+c.document.images.hero]}}}
export default async function RootLayout({children}:{children:React.ReactNode}){const content=await readSiteContent();return <html lang="bn" data-palette={content.palette}><head><link rel="stylesheet" href="/fonts/fonts.css"/></head><body><PreferencesProvider defaultPalette={content.palette} document={content.document}>{children}</PreferencesProvider></body></html>}


