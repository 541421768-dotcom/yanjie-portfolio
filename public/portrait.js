import {coverRect,fragmentGrid} from './portrait-geometry.mjs';
import {advancePortrait} from './portrait-motion.mjs';
const frame=document.querySelector('#portrait'),photo=document.querySelector('#portrait-image'),layer=frame.querySelector('.portrait-shards');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
const canvas=document.createElement('canvas');canvas.className='portrait-canvas';canvas.setAttribute('aria-hidden','true');layer.replaceChildren(canvas);
const ctx=canvas.getContext('2d',{alpha:true});
const margin=160;let tiles=[],width=0,height=0,dpr=1,source='',ready=false,target=0,state={position:0,velocity:0,settled:true};
let raf=0,lastTime=0,queued=false,visible=true,canvasVisible=false,touched=false;
function stop(){if(raf)cancelAnimationFrame(raf);raf=0;lastTime=0;}
function setCanvasVisibility(show){if(canvasVisible===show)return;canvasVisible=show;canvas.style.opacity=show?'1':'0';photo.style.opacity=show?'0':target?'0':'';}
function settle(){stop();state={position:target,velocity:0,settled:true};setCanvasVisibility(false);photo.style.opacity=target?'0':'';}
function render(){
 const p=state.position;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width+margin*2,height+margin*2);
 if(p<=0){ctx.drawImage(raster,margin,margin,width,height);return}
 const alpha=Math.pow(1-p,.72);if(alpha<.001)return;
 for(const tile of tiles){
  const q=Math.pow(p,tile.speed),rotation=tile.rotation*q,scale=1-.6*q;
  const cos=Math.cos(rotation)*scale,sin=Math.sin(rotation)*scale;
  const x=margin+tile.cx+tile.dx*q,y=margin+tile.cy+tile.dy*q;
  ctx.setTransform(dpr*cos,dpr*sin,-dpr*sin,dpr*cos,dpr*x,dpr*y);ctx.globalAlpha=alpha;
  ctx.drawImage(tile.sprite,-tile.w/2,-tile.h/2,tile.w,tile.h);
 }
 ctx.globalAlpha=1;
}
function tick(time){
 raf=0;if(!ready||reduced.matches||document.hidden||!visible){settle();return}
 const dt=lastTime?(time-lastTime)/1000:1/60;lastTime=time;state=advancePortrait(state,target,dt);
 if(state.settled){settle();return}
 render();setCanvasVisibility(true);raf=requestAnimationFrame(tick);
}
function wake(){if(!raf&&ready&&!reduced.matches&&!document.hidden&&visible){lastTime=0;raf=requestAnimationFrame(tick)}}
function transition(next){
 const value=Number(next);if(value===target)return;target=value;frame.classList.toggle('is-scattered',next);
 if(reduced.matches||!ctx){photo.style.transition='opacity 140ms ease';photo.style.opacity=next?'.12':'';return}
 // No image encoding, layout read, DOM allocation, or fragment construction here.
 wake();
}
let raster=null;
function prepare(){
 queued=false;if(!ctx||!photo.complete||!photo.naturalWidth||reduced.matches)return;
 const w=frame.clientWidth,h=frame.clientHeight,url=photo.currentSrc||photo.src;
 if(!w||!h||(ready&&w===width&&h===height&&url===source))return;
 stop();width=w;height=h;source=url;dpr=Math.min(devicePixelRatio||1,1.5);
 raster=document.createElement('canvas');raster.width=Math.ceil(w*dpr);raster.height=Math.ceil(h*dpr);
 const rc=raster.getContext('2d'),fit=coverRect(photo.naturalWidth,photo.naturalHeight,raster.width,raster.height);rc.drawImage(photo,fit.x,fit.y,fit.width,fit.height);
 canvas.width=Math.ceil((w+margin*2)*dpr);canvas.height=Math.ceil((h+margin*2)*dpr);canvas.style.width=(w+margin*2)+'px';canvas.style.height=(h+margin*2)+'px';
 // Triangular masks are rasterized once, then reused for every hover and reversal.
 tiles=fragmentGrid(w,h,6,8).map((p,i)=>{
  const sprite=document.createElement('canvas');sprite.width=Math.ceil(p.width*dpr);sprite.height=Math.ceil(p.height*dpr);const c=sprite.getContext('2d'),sw=sprite.width,sh=sprite.height;
  c.beginPath();if(i%2){c.moveTo(sw,0);c.lineTo(sw,sh);c.lineTo(0,sh)}else{c.moveTo(0,0);c.lineTo(sw,0);c.lineTo(0,sh)}c.closePath();c.clip();c.drawImage(raster,p.x*dpr,p.y*dpr,p.width*dpr,p.height*dpr,0,0,sw,sh);
  const jitter=Math.sin((i+1)*73.17);return {sprite,w:p.width+.45,h:p.height+.45,cx:p.x+p.width/2,cy:p.y+p.height/2,dx:(p.cx-w/2)*.6+55+jitter*45,dy:(p.cy-h/2)*.4-20+Math.cos(i*21.8)*55,rotation:jitter*1.1,speed:1+(i%5)*.055};
 });
 ready=true;state={position:0,velocity:0,settled:true};canvasVisible=false;canvas.style.opacity='0';photo.style.opacity='';if(target)wake();
}
function schedulePreparation(){if(queued)return;queued=true;if('requestIdleCallback' in window)requestIdleCallback(prepare,{timeout:250});else setTimeout(prepare,0)}
async function loaded(){try{await photo.decode();schedulePreparation()}catch{ready=false}}
loaded();photo.addEventListener('load',loaded);
frame.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')transition(true)});
frame.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')transition(false)});
frame.addEventListener('focus',()=>{if(frame.matches(':focus-visible')&&!coarse.matches)transition(true)});
frame.addEventListener('blur',()=>{touched=false;transition(false)});
frame.addEventListener('click',e=>{if(coarse.matches||e.detail===0){touched=!touched;transition(touched)}});
new ResizeObserver(schedulePreparation).observe(frame);
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){target=0;frame.classList.remove('is-scattered');settle()}}).observe(frame);
document.addEventListener('visibilitychange',()=>{if(document.hidden){target=0;frame.classList.remove('is-scattered');settle()}});
reduced.addEventListener('change',()=>{stop();state={position:0,velocity:0,settled:true};canvasVisible=false;canvas.style.opacity='0';photo.style.transition=reduced.matches?'opacity 140ms ease':'';photo.style.opacity=reduced.matches&&target?'.12':'';if(!reduced.matches){schedulePreparation();if(target)wake()}});
