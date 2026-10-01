import {createRoot} from 'react-dom/client';
import Storefront from '../app/storefront';
import AdminPanel from '../app/admin/panel';
import SiteSettings from '../app/admin/site-settings';
import {PreferencesProvider,PreferenceControls,LocalizedText} from '../app/preferences';
import {defaultContent,resolveDocument,type SiteContent} from '../lib/site-content';
import type {PublicConfig} from '../lib/product';
import '../app/globals.css';
type Bootstrap={content:SiteContent;config:PublicConfig;page:string;csrf:string};
const initial=JSON.parse(document.getElementById('f06-bootstrap')!.textContent!) as Bootstrap;
const content={...defaultContent,...initial.content,document:resolveDocument(initial.content.document)};
function Admin(){return <main className="wrap admin-shell"><PreferenceControls/><a className="inline-link" href="/"><LocalizedText>← পণ্যের পাতায় ফিরুন</LocalizedText></a><div className="admin-heading"><h1><LocalizedText>অর্ডার ব্যবস্থাপনা</LocalizedText></h1><form action="/logout.php" method="post"><input type="hidden" name="csrf" value={initial.csrf}/><button className="outline-btn"><LocalizedText>সাইন আউট</LocalizedText></button></form></div><SiteSettings initial={content}/><AdminPanel/></main>}
createRoot(document.getElementById('root')!).render(<PreferencesProvider document={content.document} defaultPalette={content.palette}>{initial.page==='admin'?<Admin/>:<Storefront config={initial.config} content={content}/>}</PreferencesProvider>);
