import {readFile,writeFile} from 'node:fs/promises';
const home=await readFile('home-template.html','utf8');
const admin=await readFile('admin-template.html','utf8');
await writeFile('lib/page-html.ts',`export const homeHtml = ${JSON.stringify(home)};\nexport const adminHtml = ${JSON.stringify(admin)};\n`);
