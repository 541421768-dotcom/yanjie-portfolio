// Server-side adapter. The service key must never be exposed to client code.
export type Collection = 'portfolio' | 'site_intro' | 'site_footer';
function config() {
  const base = process.env.MEOO_CLOUD_URL?.replace(/\/+$/, '');
  const key = process.env.MEOO_SERVICE_KEY;
  if (!base || !key || !/^https?:\/\//.test(base)) throw new Error('请配置 MEOO_CLOUD_URL 与 MEOO_SERVICE_KEY');
  return { base, key };
}
async function cloudFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { base, key } = config();
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  headers.set('Authorization', 'Bearer ' + key);
  return fetch(base + path, { ...init, headers, cache: 'no-store' });
}
export async function readRecord<T>(table: Collection): Promise<{data:T;revision:number;updated_at:string|null}|null> {
  const response = await cloudFetch('/rest/v1/' + table + '?id=eq.1&select=data,revision,updated_at');
  if (!response.ok) throw Error('读取 Meoo Cloud 数据失败（HTTP ' + response.status + '）');
  const rows = await response.json() as Array<{data:T|string;revision:number;updated_at:string}>;
  if (!rows.length) return null;
  const row = rows[0];
  return {data:(typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as T,revision:row.revision,updated_at:row.updated_at};
}
export class RevisionConflict extends Error {
  constructor() {super('内容已被其他窗口更新，请刷新后重试');}
}
export async function saveRecord<T>(table: Collection, data:T, revision:number): Promise<{revision:number;updatedAt:string}> {
  const updatedAt = new Date().toISOString();
  const creating = revision === 0;
  const path = '/rest/v1/' + table + (creating ? '?select=revision,updated_at' : '?id=eq.1&revision=eq.' + revision + '&select=revision,updated_at');
  const response = await cloudFetch(path, {
    method: creating ? 'POST' : 'PATCH',
    headers: {'Content-Type':'application/json',Prefer:'return=representation'},
    body:JSON.stringify({id:1,data,revision:revision+1,updated_by:'admin',updated_at:updatedAt})
  });
  if (response.status === 409) throw new RevisionConflict();
  if (!response.ok) throw Error('保存 Meoo Cloud 数据失败（HTTP ' + response.status + '）');
  const rows = await response.json() as Array<{revision:number;updated_at:string}>;
  if (!rows?.length) throw new RevisionConflict();
  return {revision:rows[0].revision,updatedAt:rows[0].updated_at};
}
function storagePath(key:string, authenticated:boolean) {
  const bucket = process.env.MEOO_STORAGE_BUCKET;
  if (!bucket || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}$/.test(bucket)) throw Error('请配置有效的 MEOO_STORAGE_BUCKET');
  return (authenticated ? '/storage/v1/object/authenticated/' : '/storage/v1/object/') + encodeURIComponent(bucket) + '/' + encodeURIComponent(key);
}
export async function uploadImage(key:string, bytes:ArrayBuffer, type:string) {
  const response = await cloudFetch(storagePath(key,false), {
    method:'POST',headers:{'Content-Type':type,'x-upsert':'false','Cache-Control':'3600'},body:bytes
  });
  if (!response.ok) throw Error('图片写入 Meoo Cloud Storage 失败（HTTP ' + response.status + '）');
}
export async function fetchImage(key:string) {return cloudFetch(storagePath(key,true));}
