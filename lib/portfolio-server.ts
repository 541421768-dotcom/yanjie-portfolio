import { demoProjects } from './demo-projects';
import { verifyAdminSession, isSameOrigin } from './admin-auth';
import { readRecord } from './meoo-cloud';
export function isOwner(request:Request){return verifyAdminSession(request);}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
export function authorizeWrite(request:Request){
  if(!isOwner(request))return json({error:'请先登录作品管理后台'},403);
  if(!isSameOrigin(request))return json({error:'无效的请求来源'},403);
  return null;
}
export async function readPortfolio(){
  const row=await readRecord<unknown[]>('portfolio');
  return row?{projects:row.data,revision:row.revision,updatedAt:row.updated_at}:{projects:demoProjects,revision:0,updatedAt:null};
}
