import {readRecord} from './meoo-cloud';
import {defaultIntro,type Intro} from './intro';
export async function readIntro(){
  const row=await readRecord<Intro>('site_intro');
  return row?{intro:row.data,revision:row.revision,updatedAt:row.updated_at}:{intro:defaultIntro,revision:0,updatedAt:null};
}
