import {env} from 'cloudflare:workers';
import {isOwner,authorizeWrite,json} from '../../../lib/portfolio-server';
import {readIntro} from '../../../lib/intro-server';
import {validateIntro} from '../../../lib/intro';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!isOwner(request))return json({error:'请使用网站所有者账号登录'},403);
 try{return json(await readIntro())}catch{return json({error:'首屏文案加载失败，请重试'},500)}
}
export async function PUT(request:Request){
 const denied=authorizeWrite(request);if(denied)return denied;
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'无效的数据格式'},415);
 let intro,revision;
 try{const text=await request.text();if(text.length>12000)throw Error('文案内容过长');const data=JSON.parse(text);intro=validateIntro(data.intro);revision=data.revision;if(!Number.isInteger(revision)||revision<0)throw Error('版本无效，请刷新重试')}catch(e){return json({error:(e as Error).message},400)}
 try{if(intro.portrait===undefined){const current=await readIntro();intro.portrait=current.intro.portrait??null;}const now=new Date().toISOString();
 const result=await env.DB!.prepare('INSERT INTO site_intro (id,data,revision,updated_by,updated_at) VALUES (1,?,1,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data, revision=site_intro.revision+1,updated_by=excluded.updated_by,updated_at=excluded.updated_at WHERE site_intro.revision=? RETURNING revision').bind(JSON.stringify(intro),request.headers.get('oai-authenticated-user-id'),now,revision).first<{revision:number}>();
 if(!result)return json({error:'首屏文案已在其他窗口更新。请保留当前文字，刷新后再编辑。'},409);
 return json({intro,revision:result.revision,updatedAt:now});
 }catch{return json({error:'保存失败，你的文案仍保留在页面中，请重试'},500)}
}
