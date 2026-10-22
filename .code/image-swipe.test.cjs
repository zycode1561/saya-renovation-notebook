'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(new URL('../dist/image-carousel.js',`file://${__filename}`),'utf8');
function setup({enabled=true,reduced=false}={}){
 const handlers={},moves=[],animations=[],frames=new Map(),classes=new Set();let frameId=0;
 const stage={clientWidth:350,setPointerCapture(){},addEventListener:(name,handler)=>{handlers[name]=handler;},classList:{add:cls=>classes.add(cls),remove:cls=>classes.delete(cls)}};
 const track={style:{},animate(keyframes,options){
  let resolve,reject;const finished=new Promise((yes,no)=>{resolve=yes;reject=no;});
  const animation={finished,keyframes,options,cancel(){reject(new Error('cancelled'));},finish(){resolve();}};
  animations.push(animation);return animation;
 }};
 const context=vm.createContext({window:{addEventListener(){}},matchMedia:()=>({matches:reduced}),requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id),getComputedStyle:()=>({transform:'matrix(1,0,0,1,-200,0)'}),DOMMatrixReadOnly:class{constructor(){this.m41=-200;}}});
 vm.runInContext(source,context);
 const carousel=context.window.createImageCarousel({stage,track,canSwipe:()=>enabled,onStep:delta=>moves.push(delta)});
 const send=(name,x=200,y=300,extra={})=>handlers[name]({pointerId:1,isPrimary:true,button:0,clientX:x,clientY:y,timeStamp:0,cancelable:true,preventDefault(){},...extra});
 const flush=()=>{for(const [id,fn]of frames){frames.delete(id);fn();}};
 const finish=async()=>{animations.at(-1)?.finish();await Promise.resolve();};
 return {send,moves,animations,track,carousel,flush,finish,classes};
}
async function gesture(dx,dy,options,elapsed=400){const h=setup(options);h.send('pointerdown');h.send('pointermove',200+dx,300+dy,{timeStamp:elapsed});h.flush();h.send('pointerup',200+dx,300+dy,{timeStamp:elapsed+10});await h.finish();return h;}
(async()=>{
 let h=setup();h.send('pointerdown');h.send('pointermove',90,304,{timeStamp:300});h.flush();assert.match(h.track.style.transform,/-110px/);assert.equal(h.moves.length,0,'drag follows the pointer without changing the index');
 h.send('pointerup',90,304,{timeStamp:310});assert.equal(h.moves.length,0,'index waits for the outgoing animation');assert.match(h.animations[0].keyframes[1].transform,/-350px/);await h.finish();assert.deepEqual(h.moves,[1]);assert.match(h.track.style.transform,/0px/);
 assert.deepEqual((await gesture(-150,5)).moves,[1]);assert.deepEqual((await gesture(150,-5)).moves,[-1]);
 h=await gesture(-25,0);assert.deepEqual(h.moves,[]);assert.equal(h.animations.length,1,'short drags animate back');assert.match(h.animations[0].keyframes[1].transform,/0px/);
 h=await gesture(-35,0,{},40);assert.deepEqual(h.moves,[1],'a short fast flick advances');
 assert.deepEqual((await gesture(-35,0,{},400)).moves,[],'a short slow drag returns');
 assert.deepEqual((await gesture(3,-180)).moves,[]);assert.deepEqual((await gesture(120,120)).moves,[]);
 assert.deepEqual((await gesture(-150,0,{enabled:false})).moves,[],'zoom/single-image disables gestures');
 for(const cancel of ['pointercancel','lostpointercapture']){h=setup();h.send('pointerdown');h.send('pointermove',50,300,{timeStamp:200});h.send(cancel);await h.finish();assert.deepEqual(h.moves,[]);}
 h=setup();h.send('pointerdown');h.send('pointermove',50,300,{timeStamp:200});h.send('pointerdown',250,300,{pointerId:2,isPrimary:false});h.send('pointerup',50,300,{timeStamp:210});await h.finish();assert.deepEqual(h.moves,[],'multi-touch cancels navigation');
 h=setup();h.carousel.step(1);h.carousel.reset();await h.finish();assert.deepEqual(h.moves,[],'closing/reset prevents a late commit');
 h=setup();h.carousel.step(1);h.carousel.step(1);await h.finish();assert.deepEqual(h.moves,[1]);await h.finish();assert.deepEqual(h.moves,[1,1],'consecutive button input remains ordered');
 h=setup();h.carousel.step(1);h.send('pointerdown');h.flush();assert.match(h.track.style.transform,/150px/,'regrabbing preserves the displayed offset');h.send('pointermove',310,300,{timeStamp:300});h.send('pointerup',310,300,{timeStamp:310});await h.finish();assert.deepEqual(h.moves,[-1]);
 h=await gesture(-150,0,{reduced:true});assert.deepEqual(h.moves,[1]);assert.equal(h.animations.length,0,'reduced-motion preference skips animation');
 console.log('Carousel checks passed: live drag, deferred commit, snapback, velocity, directions, gesture cancellation, zoom/single-image guard, interrupted motion, queued input, cleanup and reduced motion.');
})().catch(error=>{console.error(error);process.exitCode=1;});
