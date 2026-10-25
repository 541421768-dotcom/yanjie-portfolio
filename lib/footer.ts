import {escapeHtml} from './intro';
export const defaultFooter={eyebrow:'A LITTLE ABOUT ME',body:'I create visual identities\nand packaging with',highlight:'clarity & character.',name:'Yanjie',role:'VISUAL & GRAPHIC DESIGNER',services:'BRAND IDENTITY · PACKAGING DESIGN',backToTop:'Back to top'};
export type Footer=typeof defaultFooter;
export function validateFooter(value:any):Footer{
 const limits={eyebrow:80,body:500,highlight:150,name:40,role:150,services:200,backToTop:30};const out:any={};
 for(const key of Object.keys(limits) as (keyof Footer)[]){if(typeof value?.[key]!=='string'||value[key].length>limits[key])throw Error(`尾屏字段 ${key} 格式无效，最多 ${limits[key]} 字`);out[key]=value[key].trim()}
 if(!out.name||!out.backToTop)throw Error('尾屏署名和返回顶部文字不能为空');return out;
}
export function renderFooter(html:string,footer:Footer){
 let result=html;for(const key of Object.keys(defaultFooter) as (keyof Footer)[]){const start=`<!--footer:${key}-->`,end=`<!--/footer:${key}-->`;const a=result.indexOf(start),b=result.indexOf(end,a);if(a>=0&&b>=0)result=result.slice(0,a)+start+escapeHtml(footer[key])+result.slice(b)}
 const length=Array.from(footer.name).reduce((n,c)=>n+(c.charCodeAt(0)>255?1.8:1),0);return result.replace('__FOOTER_SCALE__',String(Math.min(1,6/Math.max(1,length))));
}
