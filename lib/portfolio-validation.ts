export type Picture = {url:string;width:number;height:number};
export type Project = {id:string;title:string;category:string;description:string;published:boolean;featured?:boolean;demo?:boolean;cover:Picture;details:Picture[]};
export const categories=['Brand identity','Packaging','Editorial'];
export function validPicture(p:any):p is Picture {
 return !!p && typeof p.url==='string' && (/^\/assets\/[a-z0-9-]+\.(svg|jpg)$/.test(p.url)||/^\/media\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/.test(p.url)) && Number.isInteger(p.width)&&p.width>0&&p.width<=40000&&Number.isInteger(p.height)&&p.height>0&&p.height<=100000;
}
export function validateProjects(value:any):Project[] {
 if(!Array.isArray(value)||value.length>200)throw new Error('最多支持 200 个作品');
 if(value.some(p=>p?.featured!==undefined&&typeof p.featured!=='boolean'))throw new Error('首页精选设置无效');
 if(value.filter(p=>p?.featured&&p?.published&&!p?.demo).length>12)throw new Error('首页最多展示 12 个精选项目，请先取消一个现有精选');
 const ids=new Set();
 return value.map(p=>{
  if(!p||typeof p.id!=='string'||!(/^[a-zA-Z0-9-]{1,80}$/).test(p.id)||ids.has(p.id))throw new Error('作品编号无效');
  ids.add(p.id);
  if(typeof p.title!=='string'||!p.title.trim()||p.title.length>120)throw new Error('请填写作品名称（最多 120 字）');
  if(!categories.includes(p.category))throw new Error('请选择作品分类');
  if(typeof p.description!=='string'||p.description.length>10000||typeof p.published!=='boolean')throw new Error('作品信息格式无效');
  if(!validPicture(p.cover)||!Array.isArray(p.details)||p.details.length>30||!p.details.every(validPicture))throw new Error('请检查封面和详情图片（最多 30 张）');
  return {id:p.id,title:p.title.trim(),category:p.category,description:p.description,published:p.published,...(p.featured===undefined?{}:{featured:p.featured}),demo:!!p.demo,cover:p.cover,details:p.details};
 });
}
export function imageExtension(bytes:Uint8Array):string|null {
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'jpg';
 if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'png';
 const text=new TextDecoder().decode(bytes.slice(0,12));
 if(text.startsWith('GIF87a')||text.startsWith('GIF89a'))return 'gif';
 if(text.startsWith('RIFF')&&text.slice(8,12)==='WEBP')return 'webp';
 return null;
}
