import {database} from './server';
import {defaultContent,isPalette,resolveDocument,type SiteContent} from './site-content';
export async function readSiteContent():Promise<SiteContent>{
 const row=await database().prepare('SELECT palette,video_id,sample,document FROM site_settings WHERE id = 1').first<{palette:string;video_id:string;sample:number;document:string}>();
 if(!row)return {...defaultContent};
 return {palette:isPalette(row.palette)?row.palette:defaultContent.palette,videoId:/^[A-Za-z0-9_-]{11}$/.test(row.video_id)?row.video_id:defaultContent.videoId,sample:!!row.sample,document:resolveDocument(JSON.parse(row.document))};
}
