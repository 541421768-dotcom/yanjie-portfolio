import {env} from 'cloudflare:workers';
export async function GET(request:Request,context:{params:Promise<{key:string}>}){
 const {key}=await context.params;
 if(!/^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/.test(key))return new Response('Not found',{status:404});
 const item=await env.BUCKET!.get(key);if(!item)return new Response('Not found',{status:404});
 const headers=new Headers();item.writeHttpMetadata(headers);headers.set('ETag',item.httpEtag);headers.set('X-Content-Type-Options','nosniff');
 return new Response(item.body,{headers});
}
