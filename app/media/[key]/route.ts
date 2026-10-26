import {fetchImage} from '../../../lib/meoo-cloud';
export const dynamic='force-dynamic';
export async function GET(_request:Request,context:{params:Promise<{key:string}>}){
  const {key}=await context.params;
  if(!/^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/.test(key))return new Response('Not found',{status:404});
  try{
    const upstream=await fetchImage(key);
    if(upstream.status===404)return new Response('Not found',{status:404});
    if(!upstream.ok)return new Response('Image unavailable',{status:502});
    const headers=new Headers();
    headers.set('Content-Type',upstream.headers.get('Content-Type')||'application/octet-stream');
    headers.set('Cache-Control','public, max-age=31536000, immutable');
    headers.set('X-Content-Type-Options','nosniff');
    const etag=upstream.headers.get('ETag');if(etag)headers.set('ETag',etag);
    return new Response(upstream.body,{headers});
  }catch{return new Response('Image unavailable',{status:502});}
}
