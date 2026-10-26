import {isOwner,json,authorizeWrite,readPortfolio} from '../../../lib/portfolio-server';
import {saveRecord,RevisionConflict} from '../../../lib/meoo-cloud';
import {validateProjects} from '../../../lib/portfolio-validation';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  try{
    const admin=new URL(request.url).searchParams.get('admin')==='1';
    if(admin&&!isOwner(request))return json({error:'请先登录作品管理后台'},403);
    const data=await readPortfolio();
    return json(admin?data:{projects:data.projects.filter((p:any)=>p.published),canManage:isOwner(request)});
  }catch{return json({error:'读取作品失败，请稍后重试'},500);}
}
export async function PUT(request:Request){
  const denied=authorizeWrite(request);if(denied)return denied;
  if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'无效的数据格式'},415);
  let payload:any;
  try{const text=await request.text();if(text.length>2000000)return json({error:'数据过大'},413);payload=JSON.parse(text);}
  catch{return json({error:'数据格式无效'},400);}
  let projects;
  try{projects=validateProjects(payload.projects);if(!Number.isInteger(payload.revision)||payload.revision<0)throw Error('版本无效');}
  catch(e){return json({error:(e as Error).message},400);}
  try{return json(await saveRecord('portfolio',projects,payload.revision));}
  catch(e){
    if(e instanceof RevisionConflict)return json({error:'作品已在其他窗口更新。请保留当前文字，刷新页面后再编辑。'},409);
    return json({error:'保存失败，你的编辑仍保留在当前页面，请重试'},500);
  }
}
