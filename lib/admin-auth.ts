import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
const COOKIE = 'yanjie_admin';
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw Error('SESSION_SECRET 至少 32 个字符');
  return s;
}
function signature(expiry:string) {return createHmac('sha256',secret()).update('yanjie-admin:'+expiry).digest('base64url');}
function equals(a:string,b:string) {
  const x=Buffer.from(a,'utf8'),y=Buffer.from(b,'utf8');
  return x.length===y.length && timingSafeEqual(x,y);
}
export function verifyAdminSession(request:Request) {
  try {
    const cookie=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
    if(!cookie)return false;
    const parts=cookie.split('.');
    if(parts.length!==2||!/^\d{13}$/.test(parts[0]))return false;
    const expires=Number(parts[0]);
    return expires>Date.now() && expires<=Date.now()+MAX_AGE && equals(parts[1],signature(parts[0]));
  } catch{return false;}
}
export function verifyAdminPassword(password:string) {
  const p=(process.env.ADMIN_PASSWORD_SCRYPT||'').split('$');
  if(!password||password.length>1024||p.length!==3||p[0]!=='scrypt')return false;
  try{
    const salt=Buffer.from(p[1],'base64url'),expected=Buffer.from(p[2],'base64url');
    if(salt.length<16||expected.length!==64)return false;
    return timingSafeEqual(scryptSync(password,salt,expected.length),expected);
  }catch{return false;}
}
export function makeSessionCookie() {
  const expiry=String(Date.now()+MAX_AGE);
  return COOKIE+'='+expiry+'.'+signature(expiry)+'; HttpOnly; Path=/; SameSite=Strict; Max-Age=604800'
    +(process.env.NODE_ENV==='production'?'; Secure':'');
}
export function clearSessionCookie() {
  return COOKIE+'=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0'
    +(process.env.NODE_ENV==='production'?'; Secure':'');
}
export function isSameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin;}
