import {env} from 'cloudflare:workers';
import {defaultIntro,type Intro} from './intro';
export async function readIntro(){
 const row=await env.DB!.prepare('SELECT data,revision,updated_at FROM site_intro WHERE id=1').first<{data:string;revision:number;updated_at:string}>();
 return row?{intro:JSON.parse(row.data) as Intro,revision:row.revision,updatedAt:row.updated_at}:{intro:defaultIntro,revision:0,updatedAt:null};
}
