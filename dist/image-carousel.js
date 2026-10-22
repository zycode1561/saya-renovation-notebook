'use strict';
// Three live image panels keep the incoming, already decoded image on screen.
window.createImageCarousel=function({stage,track,canSwipe,onStep}){
 let drag=null,motion=null,frame=0,offset=0,queuedStep=0;
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 const transform=value=>`translate3d(calc(-100% + ${value}px),0,0)`;
 function paint(){frame=0;track.style.transform=transform(offset);}
 function place(value,immediate=false){
  offset=value;
  if(immediate){if(frame)cancelAnimationFrame(frame);paint();}
  else if(!frame)frame=requestAnimationFrame(paint);
 }
 function stopMotion(){
  if(!motion)return;
  const old=motion;motion=null;old.animation.cancel();
  stage.classList.remove('is-settling');
 }
 function reset(){
  drag=null;queuedStep=0;stopMotion();place(0,true);
  stage.classList.remove('is-dragging');
 }
 function finish(record){
  if(motion!==record)return;
  motion=null;
  // Promote the actual incoming <img>, then recenter in the same frame.
  if(record.delta)onStep(record.delta);
  place(0,true);record.animation.cancel();stage.classList.remove('is-settling');
  const next=queuedStep;queuedStep=0;if(next)settle(next);
 }
 function settle(delta,velocity=0){
  if(motion){queuedStep=Math.sign(delta);return;}
  stage.classList.remove('is-dragging');
  const target=delta?-delta*stage.clientWidth:0;
  if(!delta&&Math.abs(offset)<.5){place(0,true);return;}
  place(offset,true);
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||typeof track.animate!=='function'){
   if(delta)onStep(delta);place(0,true);return;
  }
  const remaining=Math.abs(target-offset);
  const duration=delta?clamp(remaining/Math.max(1.4,Math.abs(velocity)),150,290):220;
  const animation=track.animate([{transform:transform(offset)},{transform:transform(target)}],{
   duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'
  });
  const record={animation,delta};motion=record;stage.classList.add('is-settling');
  animation.finished.then(()=>finish(record),()=>{});
 }
 function release(event,cancelled=false){
  if(!drag||event.pointerId!==drag.id)return;
  const gesture=drag;drag=null;
  if(cancelled){settle(gesture.resumeDelta||0);return;}
  if(gesture.axis!=='x'){settle(gesture.resumeDelta||0);return;}
  const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;
  place(clamp(gesture.startOffset+dx,-stage.clientWidth,stage.clientWidth),true);
  const recent=event.timeStamp-gesture.lastAt<90;
  const velocity=recent?gesture.velocity:0;
  const distance=Math.abs(offset),threshold=Math.max(56,stage.clientWidth*.22);
  const flick=distance>=18&&Math.abs(velocity)>.45&&Math.sign(velocity)===Math.sign(offset);
  const horizontal=Math.abs(dx)>Math.abs(dy)*1.2;
  const delta=horizontal&&(distance>=threshold||flick)?(offset<0?1:-1):0;
  settle(delta,velocity);
 }
 stage.addEventListener('pointerdown',event=>{
  if(!event.isPrimary){if(drag)release({pointerId:drag.id},true);return;}
  if(event.button!==0||!canSwipe())return;
  let resumeDelta=0;
  if(motion){
   // A second gesture can catch a moving panel without jumping to its endpoint.
   resumeDelta=motion.delta;queuedStep=0;
   const matrix=new DOMMatrixReadOnly(getComputedStyle(track).transform);
   const visibleOffset=matrix.m41+stage.clientWidth;
   stopMotion();place(visibleOffset,true);
  }
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,startOffset:offset,
   axis:null,lastX:event.clientX,lastAt:event.timeStamp,velocity:0,resumeDelta};
  stage.setPointerCapture(event.pointerId);
 });
 stage.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.axis&&Math.max(Math.abs(dx),Math.abs(dy))>=8){
   if(Math.abs(dx)>Math.abs(dy)*1.25){drag.axis='x';stage.classList.add('is-dragging');}
   else if(Math.abs(dy)>Math.abs(dx)*1.25){release(event,true);return;}
  }
  if(drag.axis!=='x')return;
  const elapsed=event.timeStamp-drag.lastAt;
  if(elapsed>0)drag.velocity=(event.clientX-drag.lastX)/elapsed;
  drag.lastX=event.clientX;drag.lastAt=event.timeStamp;
  place(clamp(drag.startOffset+dx,-stage.clientWidth,stage.clientWidth));
  if(event.cancelable)event.preventDefault();
 });
 stage.addEventListener('pointerup',event=>release(event));
 stage.addEventListener('pointercancel',event=>release(event,true));
 stage.addEventListener('lostpointercapture',event=>release(event,true));
 window.addEventListener('resize',reset);
 return {reset,step(delta){if(canSwipe()){drag=null;settle(Math.sign(delta));}}};
};
