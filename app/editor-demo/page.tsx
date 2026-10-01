import SiteSettings from '../admin/site-settings';
import {PreferenceControls} from '../preferences';
import {readSiteContent} from '@/lib/site-settings';
export const dynamic='force-dynamic';
export const metadata={title:'সম্পাদনা প্যানেলের নমুনা | F-06',robots:{index:false,follow:false}};
export default async function EditorDemo(){return <main className="wrap admin-shell"><PreferenceControls/><SiteSettings demo initial={await readSiteContent()}/></main>}
