// Fixed, true perspective viewpoints; the existing orbit camera is restored on exit.
const privacyViews={
 sofa:{name:'沙发坐姿',eye:[5.6,1.18,7.1],target:[9.34,.85,8.25]},
 dining:{name:'餐桌坐姿',eye:[6.95,1.2,3.68],target:[9.34,.8,8.25]},
 oblique:{name:'餐厅过道斜角',eye:[7.65,1.6,5.05],target:[9.34,.85,8.25]},
 entry:{name:'主卧门外站姿',eye:[7.65,1.6,5.75],target:[9.34,.9,8.25]}
};
let orbitCamera=null,savedWallFull=false;
function updatePrivacyCamera(){
 const preset=privacyViews[privacyView],rect=$('#viewer').getBoundingClientRect();
 camera.aspect=rect.width/rect.height;camera.fov=rect.width<700?85:72;camera.updateProjectionMatrix();
 camera.position.set(...preset.eye);camera.up.set(0,1,0);camera.lookAt(...preset.target);
}
function privacyBedBounds(){
 const mattress=masterBedModel.children.find(m=>m.geometry?.parameters.width===1.8&&m.geometry?.parameters.depth===2);
 return new THREE.Box3().setFromObject(mattress);
}
function privacyVisibility(enabled=privacyEnabled){
 if(!privacyView)return null;
 home.updateMatrixWorld(true);
 const start=new THREE.Vector3(...privacyViews[privacyView].eye);
 const obstacles=wallPieces.filter(p=>{for(let o=p.m;o;o=o.parent)if(!o.visible)return false;return true}).map(p=>p.m);if(enabled)privacyScreen.traverse(o=>{if(o.isMesh)obstacles.push(o)});
 let visible=0,total=0;const bed=privacyBedBounds();
 // Samples cover the mattress, with full-height existing walls and no credit for movable furniture.
 for(let ix=0;ix<=8;ix++)for(let iz=0;iz<=8;iz++){
  const target=new THREE.Vector3(bed.min.x+ix*(bed.max.x-bed.min.x)/8,.65,bed.min.z+iz*(bed.max.z-bed.min.z)/8),delta=target.clone().sub(start);
  const ray=new THREE.Raycaster(start,delta.clone().normalize(),.01,delta.length()-.01);
  if(!ray.intersectObjects(obstacles,false).length)visible++;total++;
 }
 return {visible,total};
}
function refreshPrivacyStatus(){
 $('#privacy-toggle').setAttribute('aria-pressed',String(privacyEnabled));$('#privacy-toggle').textContent=privacyEnabled?'有隔断 · 点击对比':'无隔断 · 点击对比';
 if(!privacyView){$('#privacy-status').textContent='床头改靠客厅背墙；屏风 95 × 200 cm，卧室侧窄桌 86 × 24 cm、台高 80 cm。可选客餐厅视点检查遮挡。';return}
 const now=privacyVisibility(),before=privacyVisibility(false);
 $('#privacy-status').textContent=privacyViews[privacyView].name+' · '+(now.visible===0?(before.visible===0?'原墙已遮挡抽样床面；此位置不是主要暴露点。':'屏风遮住了此视点的抽样床面。'):(privacyEnabled?'此斜角仍可看到部分床面；屏风不能替代关门。':'移除屏风后，此位置可直接看到床面。'))+' 固定视点示意，不代表所有身高和站位。';
}
function enterPrivacyView(id){
 if(!activeModel||!privacyViews[id])return;
 if(walkMode)exitWalk();
 if(privacyView)exitPrivacyView();selectRoom('master');
 orbitCamera=camera;savedWallFull=wallFull;privacyView=id;
 privacyCamera ||= new THREE.PerspectiveCamera(72,1,.05,100);camera=privacyCamera;
 wallFull=true;setWalls();$('#wall-toggle').disabled=true;$('#wall-toggle').textContent='视线检查 · 全高墙';$('#wall-toggle').setAttribute('aria-pressed','true');$('#viewer').classList.add('eye-view');for(const key of ['view3d','view2d']){$('#'+key).classList.remove('active');$('#'+key).setAttribute('aria-pressed','false')}
 document.querySelectorAll('[data-privacy-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.privacyView===id)));
 $('#camera-caption').textContent='视线对比 / '+privacyViews[id].name;
 $('#interaction-hint').textContent='真实透视 · 原墙完整高度 · 点击“看主卧布局”返回旋转';
 if(modernCeiling)modernCeiling.visible=false;
 updatePrivacyCamera();refreshPrivacyStatus();dirty=true;
}
function exitPrivacyView(){
 if(!privacyView)return;
 camera=orbitCamera;privacyView=null;wallFull=savedWallFull;setWalls();$('#wall-toggle').disabled=false;$('#wall-toggle').textContent=wallFull?'降低墙体':'完整墙高';$('#wall-toggle').setAttribute('aria-pressed',String(wallFull));for(const [key,on] of [['view3d',!topView],['view2d',topView]]){$('#'+key).classList.toggle('active',on);$('#'+key).setAttribute('aria-pressed',String(on))}
 $('#viewer').classList.remove('eye-view');document.querySelectorAll('[data-privacy-view]').forEach(b=>b.setAttribute('aria-pressed','false'));
 syncModernLighting();fillDetail(selected);refreshPrivacyStatus();dirty=true;
}
function setPrivacyEnabled(enabled){privacyEnabled=enabled;if(privacyScreen)privacyScreen.visible=enabled;refreshPrivacyStatus();dirty=true}
if(activeModel){
 $('#privacy-toggle').onclick=()=>setPrivacyEnabled(!privacyEnabled);
 $('#privacy-orbit').onclick=()=>{exitPrivacyView();view(false);selectRoom('master');goal.theta=.62;goal.phi=.86;goal.span=7.3;goal.cz=7.5;$('#viewer').scrollIntoView({block:'center',behavior:'smooth'})};
 document.querySelectorAll('[data-privacy-view]').forEach(b=>b.onclick=()=>enterPrivacyView(b.dataset.privacyView));
 $('#privacy-orbit').click();
 window.__homeDesign.privacy={views:privacyViews,visibility:privacyVisibility,screen:privacyScreen};
}else document.querySelectorAll('.privacy-actions button').forEach(b=>b.disabled=true);
refreshPrivacyStatus();
