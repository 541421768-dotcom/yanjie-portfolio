import {env} from 'cloudflare:workers';
import {isOwner,authorizeWrite,json} from '../../../lib/portfolio-server';
import {readFooter} from '../../../lib/footer-server';
import {validateFooter} from '../../../lib/footer';
export const dynamic='force-dynamic';
export async function GET(request:Request){if(!isOwner(request))return json({error:'请使用网站所有者账号登录'},403);try{return json(await readFooter())}catch{return json({error:'尾屏文案加载失败，请重试'},500)}}
export async function PUT(request:Request){
 const denied=authorizeWrite(request);if(denied)return denied;
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'无效的数据格式'},415);
 let footer,revision;
 try{const text=await request.text();if(text.length>16000)throw Error('文案内容过长');const data=JSON.parse(text);footer=validateFooter(data.footer);revision=data.revision;if(!Number.isInteger(revision)||revision<0)throw Error('版本无效，请刷新重试')}catch(e){return json({error:(e as Error).message},400)}
 try{const now=new Date().toISOString();const result=await env.DB!.prepare('INSERT INTO site_footer (id,data,revision,updated_by,updated_at) VALUES (1,?,1,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,revision=site_footer.revision+1,updated_by=excluded.updated_by,updated_at=excluded.updated_at WHERE site_footer.revision=? RETURNING revision').bind(JSON.stringify(footer),request.headers.get('oai-authenticated-user-id'),now,revision).first<{revision:number}>();if(!result)return json({error:'尾屏已在其他窗口更新，请保留文字，刷新后再编辑。'},409);return json({footer,revision:result.revision,updatedAt:now})}catch{return json({error:'保存失败，你的编辑仍保留在页面中，请重试'},500)}
}
