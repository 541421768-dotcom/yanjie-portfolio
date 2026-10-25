import {env} from 'cloudflare:workers';
import {defaultFooter,type Footer} from './footer';
export async function readFooter(){const row=await env.DB!.prepare('SELECT data,revision,updated_at FROM site_footer WHERE id=1').first<{data:string;revision:number;updated_at:string}>();return row?{footer:{...defaultFooter,...JSON.parse(row.data)} as Footer,revision:row.revision,updatedAt:row.updated_at}:{footer:defaultFooter,revision:0,updatedAt:null}}
