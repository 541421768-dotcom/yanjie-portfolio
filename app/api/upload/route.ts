import {env} from 'cloudflare:workers';
import {authorizeWrite,json} from '../../../lib/portfolio-server';
import {imageExtension} from '../../../lib/portfolio-validation';
export async function POST(request:Request){
 const denied=authorizeWrite(request);if(denied)return denied;
 const max=30*1024*1024;
 if(Number(request.headers.get('content-length'))>max+65536)return json({error:'单张图片不能超过 30MB'},413);
 try{
 const form=await request.formData();const file=form.get('file');
 if(!(file instanceof File)||!file.size||file.size>max)return json({error:'请选择 30MB 以内的图片'},400);
 const buffer=await file.arrayBuffer();const ext=imageExtension(new Uint8Array(buffer));
 if(!ext)return json({error:'支持 JPG、PNG、WebP、GIF 图片'},415);
 const types:Record<string,string>={jpg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif'};
 const key=crypto.randomUUID()+'.'+ext;await env.BUCKET!.put(key,buffer,{httpMetadata:{contentType:types[ext],cacheControl:'public, max-age=31536000, immutable'}});
 return json({url:'/media/'+key});
 }catch{return json({error:'上传失败，请重新选择图片再试'},500)}
}
