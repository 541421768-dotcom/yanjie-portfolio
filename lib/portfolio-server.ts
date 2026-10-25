import { env } from 'cloudflare:workers';
import { demoProjects } from './demo-projects';
export function isOwner(request:Request){return !!request.headers.get('oai-authenticated-user-id')&&request.headers.get('oai-authenticated-user-email')?.toLowerCase()==='yanyongjie1991@gmail.com'}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export function authorizeWrite(request:Request){
 if(!isOwner(request))return json({error:'请使用网站所有者账号登录'},403);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'无效的请求来源'},403);
 return null;
}
export async function readPortfolio(){
 const row=await env.DB!.prepare('SELECT data, revision, updated_at FROM portfolio WHERE id = 1').first<{data:string;revision:number;updated_at:string}>();
 return row?{projects:JSON.parse(row.data),revision:row.revision,updatedAt:row.updated_at}:{projects:demoProjects,revision:0,updatedAt:null};
}
