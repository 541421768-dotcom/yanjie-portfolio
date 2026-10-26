import {adminHtml} from '../../lib/page-html';
import {isOwner} from '../../lib/portfolio-server';
export const dynamic='force-dynamic';
export function GET(request:Request){
  if(!isOwner(request))return Response.redirect(new URL('/admin/login',request.url),302);
  return new Response(adminHtml,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
