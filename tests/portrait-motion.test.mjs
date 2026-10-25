import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {advancePortrait} from '../public/portrait-motion.mjs';
let state={position:0,velocity:0};
for(let i=0;i<12;i++)state=advancePortrait(state,1,1/60);
const moving=state;state=advancePortrait(state,0,0);assert.equal(state.position,moving.position);assert.equal(state.velocity,moving.velocity);
let steps=0;while(!state.settled&&steps++<60)state=advancePortrait(state,0,1/60);assert.equal(state.position,0);assert.ok(steps<40);
let s30={position:0,velocity:0},s120={...s30};for(let i=0;i<6;i++)s30=advancePortrait(s30,1,1/30);for(let i=0;i<24;i++)s120=advancePortrait(s120,1,1/120);assert.ok(Math.abs(s30.position-s120.position)<1e-10);
const callbacks=new Map(),idle=[],handlers={},photoHandlers={},documentHandlers={};let rafId=0,clock=0,canvases=0,reads=0,draws=0;
const mq={matches:false,addEventListener(){}};
const photo={naturalWidth:2400,naturalHeight:3200,complete:true,currentSrc:'/media/photo.jpg',style:{},decode:async()=>{},addEventListener(type,fn){photoHandlers[type]=fn}};
const layer={replaceChildren(){}};
const frame={style:{},classList:{toggle(){},remove(){}},querySelector(){return layer},addEventListener(type,fn){handlers[type]=fn},matches(){return false},get clientWidth(){reads++;return 300},get clientHeight(){reads++;return 400}};
const drawContext=()=>({setTransform(){},clearRect(){},drawImage(){draws++},beginPath(){},moveTo(){},lineTo(){},closePath(){},clip(){},globalAlpha:1});
const document={hidden:false,querySelector(sel){return sel==='#portrait'?frame:photo},createElement(tag){assert.equal(tag,'canvas');canvases++;return {style:{},setAttribute(){},getContext:drawContext,toDataURL(){throw Error('Image encoding must never run on hover')}}},addEventListener(type,fn){documentHandlers[type]=fn}};
const context=vm.createContext({document,window:{requestIdleCallback:true},devicePixelRatio:2,matchMedia:()=>mq,ResizeObserver:class{observe(){}},IntersectionObserver:class{observe(){}},requestIdleCallback:fn=>idle.push(fn),requestAnimationFrame:fn=>{callbacks.set(++rafId,fn);return rafId},cancelAnimationFrame:id=>callbacks.delete(id),setTimeout:fn=>idle.push(fn),console});
const motion=new vm.SourceTextModule(await readFile('public/portrait-motion.mjs','utf8'),{context});
const geometry=new vm.SourceTextModule(await readFile('public/portrait-geometry.mjs','utf8'),{context});
const runtime=new vm.SourceTextModule(await readFile('public/portrait.js','utf8'),{context});
await runtime.link(spec=>spec.includes('geometry')?geometry:motion);await runtime.evaluate();await Promise.resolve();while(idle.length)idle.shift()();
const prepared=canvases,measured=reads;assert.equal(prepared,98);assert.equal(measured,2);assert.equal(callbacks.size,0);
function frameTick(){clock+=1000/60;const work=[...callbacks.values()];callbacks.clear();work.forEach(fn=>fn(clock))}
function settle(){let n=0;while(callbacks.size&&n++<100)frameTick();assert.equal(callbacks.size,0);assert.ok(n<65)}
handlers.pointerenter({pointerType:'mouse'});assert.equal(canvases,prepared);assert.equal(reads,measured);for(let i=0;i<12;i++)frameTick();handlers.pointerleave({pointerType:'mouse'});settle();assert.equal(photo.style.opacity,'');
for(let i=0;i<40;i++){handlers.pointerenter({pointerType:'mouse'});frameTick();handlers.pointerleave({pointerType:'mouse'});frameTick()}settle();assert.equal(photo.style.opacity,'');assert.equal(canvases,prepared);assert.equal(reads,measured);
handlers.pointerenter({pointerType:'mouse'});settle();assert.equal(photo.style.opacity,'0');handlers.pointerleave({pointerType:'mouse'});settle();assert.equal(photo.style.opacity,'');
handlers.pointerenter({pointerType:'mouse'});frameTick();document.hidden=true;documentHandlers.visibilitychange();assert.equal(callbacks.size,0);assert.equal(photo.style.opacity,'');
assert.ok(draws>0);console.log('PASS: continuous reversal, frame-rate independence, cached fragment reuse across 40 rapid reversals, zero hover layout reads/encoding/DOM allocations, correct restored state and no idle/hidden rendering.');
