import type {CustomColours} from './site-content';
const rgb=(hex:string)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const hex=(a:number[])=>'#'+a.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('');
const mix=(a:string,b:string,f:number)=>hex(rgb(a).map((v,i)=>v*(1-f)+rgb(b)[i]*f));
export function ink(bg:string){const a=rgb(bg).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});const l=a[0]*.2126+a[1]*.7152+a[2]*.0722;return (l+.05)/.05>=1.05/(l+.05)?'#000000':'#ffffff'}
export function colourTokens(c:CustomColours,dark:boolean):Record<string,string>{const bg=dark?mix(c.background,'#000000',.87):c.background,card=dark?mix(c.surface,'#000000',.8):c.surface,fg=ink(bg),cardFg=ink(card);return {'--background':bg,'--foreground':fg,'--card':card,'--card-foreground':cardFg,'--popover':card,'--popover-foreground':cardFg,'--primary':c.primary,'--primary-foreground':ink(c.primary),'--muted-foreground':fg,'--border':mix(bg,fg,.35),'--input':mix(card,cardFg,.5),'--accent':card,'--accent-foreground':cardFg,'--surface':card,'--surface-soft':mix(bg,card,.5),'--badge':c.primary,'--badge-ink':ink(c.primary),'--ring':c.primary}}
