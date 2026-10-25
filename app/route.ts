import {homeHtml} from '../lib/page-html';
import {readIntro} from '../lib/intro-server';
import {renderIntro} from '../lib/intro';
import {readFooter} from '../lib/footer-server';
import {renderFooter} from '../lib/footer';
export const dynamic='force-dynamic';
export async function GET(){
 const [{intro},{footer}]=await Promise.all([readIntro(),readFooter()]);
 return new Response(renderFooter(renderIntro(homeHtml,intro),footer),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}
