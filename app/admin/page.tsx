import { requireChatGPTUser, chatGPTSignOutPath } from '@/app/chatgpt-auth';
import { allowedAdmin } from '@/lib/server';
import {PreferenceControls,LocalizedText} from '../preferences';
import AdminPanel from './panel';
import SiteSettings from './site-settings';
export const dynamic='force-dynamic';
export const metadata={title:'অর্ডার ব্যবস্থাপনা | F-06',robots:{index:false,follow:false}};
export default async function Admin(){const user=await requireChatGPTUser('/admin');const allowed=await allowedAdmin();return <main className="wrap admin-shell"><PreferenceControls/><a className="inline-link" href="/"><LocalizedText>← পণ্যের পাতায় ফিরুন</LocalizedText></a><div className="admin-heading"><h1><LocalizedText>অর্ডার ব্যবস্থাপনা</LocalizedText></h1><a href={chatGPTSignOutPath('/')} target="_top"><LocalizedText>সাইন আউট</LocalizedText></a></div>{allowed?<><SiteSettings/><AdminPanel/></>:<div className="admin-panel"><h2><LocalizedText>প্রবেশাধিকার চালু হয়নি</LocalizedText></h2><p><LocalizedText>এই অ্যাকাউন্টের জন্য বিক্রেতার প্রবেশাধিকার অনুমোদিত নয়।</LocalizedText></p><p><LocalizedText>আপনার সাইন-ইন ইমেইল: </LocalizedText><strong>{user.email}</strong></p><p><LocalizedText>সাইটের মালিককে এই ইমেইলটি অনুমোদন করতে হবে।</LocalizedText></p></div>}</main>}
