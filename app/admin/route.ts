import {adminHtml} from '../../lib/page-html';
import {isOwner} from '../../lib/portfolio-server';
export const dynamic='force-dynamic';
export function GET(request:Request){
 if(!request.headers.get('oai-authenticated-user-id'))return Response.redirect(new URL('/signin-with-chatgpt?return_to=%2Fadmin',request.url),302);
 if(!isOwner(request))return new Response('仅网站所有者可以管理作品。',{status:403,headers:{'Content-Type':'text/plain;charset=utf-8'}});
 return new Response(adminHtml,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}
