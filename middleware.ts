import {NextResponse,type NextRequest} from 'next/server';
export function middleware(request:NextRequest){
 const response=NextResponse.next();
 const development=process.env.NODE_ENV==='development';
 const policy=["default-src 'self'","script-src 'self' 'unsafe-inline' https://connect.facebook.net"+(development?" 'unsafe-eval'":''),"style-src 'self' 'unsafe-inline'","img-src 'self' data: https://www.facebook.com","font-src 'self'","connect-src 'self' https://www.facebook.com https://connect.facebook.net"+(development?' ws: wss:':''),"frame-src https://www.youtube-nocookie.com","object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com",...(!development?['upgrade-insecure-requests']:[])].join('; ');
 response.headers.set('Content-Security-Policy',policy);response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Referrer-Policy','no-referrer');response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=()');
 if(request.nextUrl.pathname.startsWith('/admin')||request.nextUrl.pathname.startsWith('/api/')){response.headers.set('Cache-Control','private, no-store');response.headers.set('X-Robots-Tag','noindex, nofollow')}
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|images/|fonts/|favicon.svg).*)']};
