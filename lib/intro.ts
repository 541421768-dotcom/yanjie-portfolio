import {validPicture,type Picture} from './portfolio-validation';
export type Intro={greeting:string;nameLine:string;introduction:string;portrait?:Picture|null};
export const defaultIntro:Intro={greeting:'HEY',nameLine:'I am Yanjie.',introduction:'I am a visual graphic designer, good at brand visual design and packaging design.'};
export function validateIntro(value:any):Intro{
 const limits={greeting:12,nameLine:40,introduction:500};const labels={greeting:'问候语',nameLine:'姓名文案',introduction:'个人介绍'};
 const out:any={};
 for(const key of Object.keys(limits) as (keyof typeof limits)[]){
  if(typeof value?.[key]!=='string'||!value[key].trim()||value[key].length>limits[key])throw Error(`${labels[key]}不能为空，最多 ${limits[key]} 个字符`);
  out[key]=value[key].trim();
 }
 if(value.portrait!==undefined){if(value.portrait!==null&&!validPicture(value.portrait))throw Error('个人照片无效，请重新上传');out.portrait=value.portrait;}
 return out;
}
export function escapeHtml(text:string){return text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
export function renderIntro(html:string,intro:Intro){
 let result=html;
 for(const key of ['greeting','nameLine','introduction'] as const){const from=`<!--intro:${key}-->`,to=`<!--/intro:${key}-->`;const start=result.indexOf(from),end=result.indexOf(to,start);if(start>=0&&end>=0)result=result.slice(0,start)+from+escapeHtml(intro[key])+result.slice(end);}
 const portrait=intro.portrait;
 result=result.replace('__PORTRAIT_URL__',escapeHtml(portrait?.url||'/assets/portrait-placeholder.svg')).replace('__PORTRAIT_ALT__',portrait?'个人照片':'个人照片占位图');
 const measure=(text:string)=>Array.from(text).reduce((n,c)=>n+(c.charCodeAt(0)>255?1.7:1),0);
 return result.replace('__GREETING_SCALE__',String(Math.min(1,3/measure(intro.greeting)))).replace('__NAME_SCALE__',String(Math.min(1,14/measure(intro.nameLine))));
}
