import {readRecord} from './meoo-cloud';
import {defaultFooter,type Footer} from './footer';
export async function readFooter(){
  const row=await readRecord<Footer>('site_footer');
  return row?{footer:{...defaultFooter,...row.data},revision:row.revision,updatedAt:row.updated_at}:{footer:defaultFooter,revision:0,updatedAt:null};
}
