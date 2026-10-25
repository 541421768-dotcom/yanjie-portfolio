// First exhibition. Stable project IDs survive title and cover edits.
export const defaultSelection = [
 '33338c6c-6f62-4df0-bbb2-ec9f625d409e', // 逐月级
 '9b140834-f084-4ef9-b982-c924d18ee895', // 仲秋辞话
 '0753501c-1afc-412f-bba4-f88e332a8c4b', // PureCraft
 'demo-2', // 1677
 '318eadcc-af7f-4539-bc11-29924a370242', // 云岭古韵
 '0d6f697e-294c-4310-90f6-06a579768522', // 虎喫海喝
 'demo-3', // 荷礼过年
 'demo-1', // 天籁教育
 'demo-5', // 俏皮谷
 '7bffe108-1dde-4b30-911d-44b20d7a655f', // HOTO
 'a34d8179-a25d-4eaa-8cca-766d3e8bb7f2', // 活力无龄界
 '1a49bedb-2ea9-49f6-8681-cdd81b27d909' // 村超英雄传
];
export function prepareProjects(projects) {
 const custom = projects.some(p => typeof p.featured === 'boolean');
 const result = projects.map(p => ({...p, featured: custom ? p.featured === true : !p.demo && defaultSelection.includes(p.id)}));
 if (!custom) result.sort((a,b) => {
  const rank = p => {const i=defaultSelection.indexOf(p.id);return i<0?defaultSelection.length:i};
  return rank(a)-rank(b);
 });
 return result;
}
export function selectedProjects(projects) {
 return prepareProjects(projects).filter(p => p.published && p.featured && !p.demo)
  .sort((a,b) => Number(a.category==='Editorial')-Number(b.category==='Editorial')).slice(0,12);
}
