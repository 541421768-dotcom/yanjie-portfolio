import {env} from 'cloudflare:workers';
import {isOwner,json,authorizeWrite,readPortfolio} from '../../../lib/portfolio-server';
import {validateProjects} from '../../../lib/portfolio-validation';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 try{
 const admin=new URL(request.url).searchParams.get('admin')==='1';
 if(admin&&!isOwner(request))return json({error:'请使用网站所有者账号登录'},403);
 const data=await readPortfolio();
 return json(admin?data:{projects:data.projects.filter((p:any)=>p.published),canManage:isOwner(request)});
 }catch{ return json({error:'读取作品失败，请稍后重试'},500) }
}
export async function PUT(request:Request){
 const denied=authorizeWrite(request);if(denied)return denied;
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'无效的数据格式'},415);
 let payload:any;try{const text=await request.text();if(text.length>2000000)return json({error:'数据过大'},413);payload=JSON.parse(text)}catch{return json({error:'数据格式无效'},400)}
 let projects;try{projects=validateProjects(payload.projects);if(!Number.isInteger(payload.revision)||payload.revision<0)throw Error('版本无效')}catch(e){return json({error:(e as Error).message},400)}
 try{
 const now=new Date().toISOString();
 const result=await env.DB!.prepare('INSERT INTO portfolio (id,data,revision,updated_by,updated_at) VALUES (1,?,1,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, revision=portfolio.revision+1, updated_by=excluded.updated_by, updated_at=excluded.updated_at WHERE portfolio.revision=? RETURNING revision').bind(JSON.stringify(projects),request.headers.get('oai-authenticated-user-id'),now,payload.revision).first<{revision:number}>();
 if(!result)return json({error:'作品已在其他窗口更新。请保留当前文字，刷新页面后再编辑。'},409);
 return json({revision:result.revision,updatedAt:now});
 }catch{return json({error:'保存失败，你的编辑仍保留在当前页面，请重试'},500)}
}
