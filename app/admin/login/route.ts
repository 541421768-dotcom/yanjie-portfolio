import {isSameOrigin,makeSessionCookie,verifyAdminPassword,verifyAdminSession} from '../../../lib/admin-auth';
export const dynamic='force-dynamic';
function page(error=false):Response{
  const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>管理登录 — Yanjie</title>'
   +'<style>body{background:#f5f5f0;color:#20211f;font-family:Arial,"PingFang SC",sans-serif;margin:0;min-height:100vh;display:grid;place-items:center}.card{width:min(420px,calc(100% - 48px))}h1{font-size:42px;font-weight:500;letter-spacing:-.06em;margin:20px 0 36px}label{display:block;font-size:14px;margin-bottom:10px}input{width:100%;padding:15px;border:1px solid #aaa;background:transparent;border-radius:8px;box-sizing:border-box;font:inherit}button{width:100%;padding:15px;border:none;border-radius:8px;background:#20211f;color:white;font:inherit;margin-top:20px;cursor:pointer}.error{color:#a31c1c;font-size:13px}a{color:inherit;text-decoration:none}</style></head><body>'
   +'<main class="card"><a href="/">yanjie® ← 返回网站</a><h1>作品管理</h1>'
   +(error?'<p class="error" role="alert">登录失败，请检查管理员密码。</p>':'')
   +'<form method="POST" action="/admin/login"><label for="password">管理员密码</label><input id="password" name="password" type="password" required autocomplete="current-password"><button type="submit">登录管理后台 ↗</button></form></main></body></html>';
  return new Response(html,{status:error?401:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export function GET(request:Request){
  if(verifyAdminSession(request))return Response.redirect(new URL('/admin',request.url),302);
  return page();
}
export async function POST(request:Request){
  if(!isSameOrigin(request))return new Response('Invalid origin',{status:403});
  if(!request.headers.get('content-type')?.includes('application/x-www-form-urlencoded'))return page(true);
  const data=await request.formData(),password=data.get('password');
  if(typeof password!=='string'||!verifyAdminPassword(password))return page(true);
  const response=Response.redirect(new URL('/admin',request.url),303);
  response.headers.set('Set-Cookie',makeSessionCookie());
  response.headers.set('Cache-Control','no-store');
  return response;
}
