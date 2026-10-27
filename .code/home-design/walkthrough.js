// Model units are metres. Horizontal FOV stays constant across screen shapes.
const walk={x:3.75,z:4.8,yaw:-Math.PI/2,pitch:0,eye:1.65,fov:75,radius:.22,speed:1.15,lastTime:0};
const walkStarts={
 entry:[3.75,4.8,-Math.PI/2],living:[7.1,8.8,0],master:[10.9,8.25,Math.PI/2],
 kitchen:[6.4,1.35,0],study:[9.85,2.3,0],guest:[2.2,2.1,0],
 baths:[9.4,4.65,0],balcony:[6.4,10.65,Math.PI]
};
const walkKeys=new Set(),walkTouches=new Map();
let walkCamera=null,walkSaved=null,walkObstacles=[],walkFloors=[],walkCeiling=null,walkDrag=null;
const clampWalk=(n,a,b)=>Math.max(a,Math.min(b,n));
function clearWalkInput(){walkKeys.clear();walkTouches.clear();walkDrag=null;walk.lastTime=0;document.querySelectorAll('[data-walk-move]').forEach(b=>b.classList.remove('held'))}
function refreshWalkGeometry(){
 home.updateMatrixWorld(true);walkObstacles=[];
 const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true};
 home.traverse(o=>{
  if(!o.isMesh||!visible(o)||o===vanityUseZone||o.geometry.type==='TubeGeometry'||o.geometry.type==='TorusGeometry')return;
  for(let p=o;p;p=p.parent)if(p===catGroup||p===humanGroup||p===walkCeiling)return;
  const b=new THREE.Box3().setFromObject(o);
  // Ignore floor finishes, dimension marks, and objects entirely above the head.
  if(b.max.y>.08&&b.min.y<walk.eye+.14)walkObstacles.push(b);
 });
 walkFloors=pickFloors.map(o=>new THREE.Box3().setFromObject(o));
}
function canWalkAt(x,z){
 // Sample the body footprint against the union of floor rectangles (including seams).
 for(let i=0;i<16;i++){
  const a=i*Math.PI/8,px=x+Math.cos(a)*walk.radius,pz=z+Math.sin(a)*walk.radius;
  if(!walkFloors.some(b=>px>=b.min.x-1e-5&&px<=b.max.x+1e-5&&pz>=b.min.z-1e-5&&pz<=b.max.z+1e-5))return false;
 }
 return !walkObstacles.some(b=>{
  const dx=x-clampWalk(x,b.min.x,b.max.x),dz=z-clampWalk(z,b.min.z,b.max.z);
  return dx*dx+dz*dz<walk.radius*walk.radius-1e-9;
 });
}
function moveWalk(dx,dz){
 // Small substeps prevent crossing thin walls, even after a slow frame.
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.04));let moved=false;
 for(let i=0;i<count;i++){
  if(canWalkAt(walk.x+dx/count,walk.z)){walk.x+=dx/count;moved ||= dx!==0}
  if(canWalkAt(walk.x,walk.z+dz/count)){walk.z+=dz/count;moved ||= dz!==0}
 }
 return moved;
}
function refreshWalkCaption(){
 if(!walkMode)return;
 $('#camera-caption').textContent=`第一人称 · 眼高 ${walk.eye.toFixed(2)} m · 水平视场 ${walk.fov}°`;
 $('#interaction-hint').textContent='WASD / 方向键行走 · 拖动画面转头 · Q/E 转向 · Esc 退出';
}
function updateWalkCamera(){
 const r=$('#viewer').getBoundingClientRect();camera.aspect=r.width/r.height;
 camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(walk.fov)/2)/camera.aspect));
 camera.updateProjectionMatrix();camera.position.set(walk.x,.005+walk.eye,walk.z);
 camera.rotation.set(walk.pitch,walk.yaw,0,'YXZ');
}
function tickWalk(now){
 const dt=walk.lastTime?Math.min(Math.max((now-walk.lastTime)/1000,0),.05):0;walk.lastTime=now;
 const held=code=>walkKeys.has(code),touch=move=>[...walkTouches.values()].includes(move);
 let forward=Number(held('KeyW')||held('ArrowUp')||touch('forward'))-Number(held('KeyS')||held('ArrowDown')||touch('back'));
 let side=Number(held('KeyD')||held('ArrowRight')||touch('right'))-Number(held('KeyA')||held('ArrowLeft')||touch('left'));
 const turn=Number(held('KeyQ'))-Number(held('KeyE'));if(turn)walk.yaw+=turn*dt*1.5;
 const length=Math.hypot(forward,side);let moved=false;
 if(length){forward/=length;side/=length;const distance=walk.speed*dt;
  moved=moveWalk((-Math.sin(walk.yaw)*forward+Math.cos(walk.yaw)*side)*distance,(-Math.cos(walk.yaw)*forward-Math.sin(walk.yaw)*side)*distance);
 }
 return moved||turn!==0;
}
function jumpWalk(id){
 const p=layoutMode==='suite'&&suiteWalkStarts[id]?suiteWalkStarts[id]:walkStarts[id];if(!p)return false;refreshWalkGeometry();
 if(!canWalkAt(p[0],p[1])){toast('此起点暂被模型家具占用，请选择其他起点');return false}
 walk.x=p[0];walk.z=p[1];walk.yaw=p[2];walk.pitch=0;clearWalkInput();dirty=true;return true;
}
function enterWalk(){
 if(!activeModel||walkMode)return;if(privacyView)exitPrivacyView();
 walkSaved={camera,wallFull,cat:catGroup.visible,human:humanGroup.visible};
 wallFull=true;setWalls();catGroup.visible=false;humanGroup.visible=false;
 // Underside planes close the cutaway roof at the existing 2.7 m model wall height.
 if(!walkCeiling){walkCeiling=new THREE.Group();walkCeiling.name='walk-only-ceiling';home.add(walkCeiling);
  for(const f of pickFloors){const {width,depth}=f.geometry.parameters;
   const m=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshStandardMaterial({color:'#f2f1eb',side:THREE.DoubleSide,roughness:1}));
   m.rotation.x=Math.PI/2;m.position.set(f.position.x,2.7,f.position.z);walkCeiling.add(m);
  }
 }
 walkCeiling.visible=true;
 walkCamera ||= new THREE.PerspectiveCamera(60,1,.03,100);camera=walkCamera;walkMode=true;
 if(modernCeiling)modernCeiling.visible=false;
 if(!jumpWalk($('#walk-start').value)&&!jumpWalk('entry')){exitWalk();return}
 $('#viewer').classList.add('walking','eye-view');$('#walk-toggle').textContent='退出第一人称';$('#walk-toggle').setAttribute('aria-pressed','true');
 $('#view-walk').classList.add('active');$('#view-walk').setAttribute('aria-pressed','true');
 for(const id of ['view2d','view3d']){$('#'+id).classList.remove('active');$('#'+id).setAttribute('aria-pressed','false')}
 for(const id of ['wall-toggle','vanity-toggle','cat-toggle','human-toggle','privacy-toggle'])$('#'+id).disabled=true;
 $('#wall-toggle').textContent='漫游 · 全高墙';$('#wall-toggle').setAttribute('aria-pressed','true');
 $('.walk-pad').hidden=false;$('#scene').setAttribute('aria-label','第一人称住宅漫游：WASD或方向键行走，拖动转头，Q和E转向，Esc退出。');
 refreshWalkCaption();updateWalkCamera();$('#scene').focus({preventScroll:true});$('#viewer').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});dirty=true;
}
function exitWalk(){
 if(!walkMode)return;clearWalkInput();walkMode=false;camera=walkSaved.camera;wallFull=walkSaved.wallFull;setWalls();
 catGroup.visible=walkSaved.cat;humanGroup.visible=walkSaved.human;walkCeiling.visible=false;
 $('#viewer').classList.remove('walking','eye-view');$('#walk-toggle').textContent='进入第一人称';$('#walk-toggle').setAttribute('aria-pressed','false');
 $('#view-walk').classList.remove('active');$('#view-walk').setAttribute('aria-pressed','false');$('.walk-pad').hidden=true;
 for(const id of ['wall-toggle','vanity-toggle','cat-toggle','human-toggle','privacy-toggle'])$('#'+id).disabled=false;
 $('#wall-toggle').textContent=wallFull?'降低墙体':'完整墙高';$('#wall-toggle').setAttribute('aria-pressed',String(wallFull));
 for(const [id,on] of [['view2d',topView],['view3d',!topView]]){$('#'+id).classList.toggle('active',on);$('#'+id).setAttribute('aria-pressed',String(on))}
 $('#scene').setAttribute('aria-label','住宅交互3D模型：拖动旋转，滚轮缩放，方向键旋转，Home复位。');
 $('#interaction-hint').textContent=topView?'俯视沿用原图方向 · 拖动平移 · 点击房间查看方案':'拖动旋转 · 滚轮缩放 · 点击房间查看方案';
 syncModernLighting();fillDetail(selected);dirty=true;
}
function setupWalk(){
 const canvas=$('#scene');
 $('#walk-toggle').onclick=()=>walkMode?exitWalk():enterWalk();$('#view-walk').onclick=enterWalk;
 $('#walk-start').onchange=()=>{if(walkMode)jumpWalk($('#walk-start').value)};
 for(const [id,key,scale] of [['walk-height','eye',.01],['walk-fov','fov',1]])$('#'+id).oninput=e=>{
  const previous=walk[key];walk[key]=Number(e.target.value)*scale;
  if(walkMode&&key==='eye'){refreshWalkGeometry();if(!canWalkAt(walk.x,walk.z)){walk.eye=previous;e.target.value=Math.round(previous/scale);refreshWalkGeometry();toast('当前位置上方空间不足，请先移开再调高眼高')}}
  $('#'+id+'-value').textContent=key==='eye'?walk.eye.toFixed(2)+' m':walk.fov+'°';refreshWalkCaption();dirty=true;
 };
 canvas.addEventListener('pointerdown',e=>{if(!walkMode||walkDrag)return;e.preventDefault();canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);walkDrag={id:e.pointerId,x:e.clientX,y:e.clientY}});
 canvas.addEventListener('pointermove',e=>{if(!walkMode||walkDrag?.id!==e.pointerId)return;
  const width=canvas.getBoundingClientRect().width,sensitivity=THREE.MathUtils.degToRad(walk.fov)/width;
  walk.yaw-=(e.clientX-walkDrag.x)*sensitivity;walk.pitch=clampWalk(walk.pitch-(e.clientY-walkDrag.y)*sensitivity,-Math.PI*.44,Math.PI*.44);
  walkDrag.x=e.clientX;walkDrag.y=e.clientY;dirty=true;
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(walkDrag?.id===e.pointerId)walkDrag=null});
 const codes=['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'];
 document.addEventListener('keydown',e=>{
  if(!walkMode)return;if(e.code==='Escape'&&!document.querySelector('dialog[open]')){exitWalk();return}
  if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,select,textarea,dialog,button'))return;
  if(codes.includes(e.code)){e.preventDefault();walkKeys.add(e.code)}
 });
 document.addEventListener('keyup',e=>walkKeys.delete(e.code));window.addEventListener('blur',clearWalkInput);
 document.addEventListener('visibilitychange',clearWalkInput);
 document.addEventListener('focusin',e=>{if(e.target!==canvas)clearWalkInput()});
 for(const b of document.querySelectorAll('[data-walk-move]')){
  b.addEventListener('pointerdown',e=>{if(!walkMode)return;e.preventDefault();b.setPointerCapture(e.pointerId);walkTouches.set(e.pointerId,b.dataset.walkMove);b.classList.add('held')});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{walkTouches.delete(e.pointerId);b.classList.remove('held')});
  // Keyboard and assistive-technology clicks take one small step; pointer holds use the frame loop.
  b.addEventListener('click',e=>{if(walkMode&&e.detail===0){walkTouches.set('keyboard',b.dataset.walkMove);walk.lastTime=1;tickWalk(151);walkTouches.delete('keyboard');dirty=true}});
 }
 window.__homeDesign.walk={state:walk,starts:walkStarts,canWalkAt,move:moveWalk,get active(){return walkMode},get camera(){return camera}};
}
if(activeModel)setupWalk();else document.querySelectorAll('.walk-bar button,.walk-bar input,.walk-bar select,#view-walk').forEach(b=>b.disabled=true);
