'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(new URL('../dist/app.js',`file://${__filename}`),'utf8');
const start=source.indexOf("const imageViewport=$('viewer-scroll');");
const end=source.indexOf("$('close-image').addEventListener",start);
assert(start>0&&end>start);
function setup({count=10,zoomed=false}={}){
 const handlers={},moves=[],elements={
  'viewer-scroll':{dataset:{},clientWidth:350,classList:{contains:()=>zoomed},setAttribute(){},setPointerCapture(){},addEventListener:(name,handler)=>{handlers[name]=handler;}},
  'image-gesture-hint':{textContent:''}
 };
 const context=vm.createContext({$:id=>elements[id],byId:()=>({images:Array(count)}),state:{imageNote:'note'},moveImage:delta=>moves.push(delta)});
 vm.runInContext(source.slice(start,end)+'\nupdateImageGestureHint();',context);
 const send=(name,x,y,extra={})=>handlers[name]({pointerId:1,isPrimary:true,button:0,clientX:x,clientY:y,cancelable:true,preventDefault(){},...extra});
 return {send,moves};
}
function gesture(dx,dy,options){const h=setup(options);h.send('pointerdown',200,300);h.send('pointermove',200+dx,300+dy);h.send('pointerup',200+dx,300+dy);return h.moves;}
assert.deepEqual(gesture(-150,5),[1]);
assert.deepEqual(gesture(150,-5),[-1]);
assert.deepEqual(gesture(-25,0),[]);
assert.deepEqual(gesture(3,-180),[]);
assert.deepEqual(gesture(120,120),[]);
assert.deepEqual(gesture(-150,0,{zoomed:true}),[]);
assert.deepEqual(gesture(-150,0,{count:1}),[]);
for(const cancel of ['pointercancel','lostpointercapture']){
 const h=setup();h.send('pointerdown',200,300);h.send('pointermove',50,300);h.send(cancel,50,300);h.send('pointerup',50,300);assert.deepEqual(h.moves,[]);
}
const pinch=setup();pinch.send('pointerdown',200,300);pinch.send('pointerdown',250,300,{pointerId:2,isPrimary:false});pinch.send('pointermove',40,300);pinch.send('pointerup',40,300);assert.deepEqual(pinch.moves,[]);
const verticalFirst=setup();verticalFirst.send('pointerdown',200,300);verticalFirst.send('pointermove',205,340);verticalFirst.send('pointermove',20,340);verticalFirst.send('pointerup',20,340);assert.deepEqual(verticalFirst.moves,[]);
const once=setup();once.send('pointerdown',200,300);once.send('pointermove',30,300);once.send('pointerup',30,300);once.send('pointerup',30,300);assert.deepEqual(once.moves,[1]);
console.log('12 gesture cases passed: directions, threshold, vertical/diagonal intent, zoom, single image, cancel, capture loss, multi-touch, direction lock, one change per gesture.');
