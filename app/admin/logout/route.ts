import {clearSessionCookie,isSameOrigin} from '../../../lib/admin-auth';
export const dynamic='force-dynamic';
export function POST(request:Request){
  if(!isSameOrigin(request))return new Response('Invalid origin',{status:403});
  const response=Response.redirect(new URL('/',request.url),303);
  response.headers.set('Set-Cookie',clearSessionCookie());
  response.headers.set('Cache-Control','no-store');
  return response;
}
