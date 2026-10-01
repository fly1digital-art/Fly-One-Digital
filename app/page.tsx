import Storefront from './storefront';
import {config} from '@/lib/server';
import {readSiteContent} from '@/lib/site-settings';
export const dynamic='force-dynamic';
export default async function Home(){return <Storefront config={config()} content={await readSiteContent()}/>}
