// World-space furniture envelopes include tops, handles and rotated chair backs.
// Each dimension is a local straight gap, not a promise of a continuous walking route.
function clearanceGap(T,room,title,a,b,axis,cross){
 if(!a||!b)return null;
 const A=new T.Box3().setFromObject(a),B=new T.Box3().setFromObject(b),other=axis==='x'?'z':'x';
 const lo=Math.max(A.min[other],B.min[other]),hi=Math.min(A.max[other],B.max[other]);
 if(cross===undefined)cross=(lo+hi)/2;
 const metres=B.min[axis]-A.max[axis];
 if(hi<lo||cross<lo||cross>hi||!Number.isFinite(metres)||metres<=0)return null;
 const start=axis==='x'?[A.max.x,.07,cross]:[cross,.07,A.max.z],end=axis==='x'?[B.min.x,.07,cross]:[cross,.07,B.min.z];
 return {room,title,metres,start,end,text:title+' '+Math.round(metres*1000).toLocaleString('en-US')+' mm'};
}
function computeClearances(T,items,walls,layout,suite){
 const wall=(x,z)=>walls.find(({m})=>Math.abs(m.position.x-x)<1e-6&&Math.abs(m.position.z-z)<1e-6)?.m;
 const named=n=>suite?.getObjectByName(n),gap=(...args)=>clearanceGap(T,...args);
 return [
  gap('master','床尾通道',items.masterBed,wall(11.68,7.6),'x'),
  items.screen?.visible?gap('master','屏风桌后净距',items.screen,items.masterBed,'z'):null,
  gap('living','沙发—茶几',items.sofa,items.coffee,'x'),
  gap('living','电视柜前通道',items.coffee,items.tv,'x'),
  layout==='suite'?gap('dining','餐边柜前通道',named('suite-dining-top'),named('sideboard-top'),'x'):gap('dining','东侧椅后通道',items.diningChair,wall(8.2,4.1),'x'),
  gap('study','椅后净距',items.studyChair,layout==='suite'?named('suite-study-bath-boundary'):wall(9.85,3.2),'z'),
  gap('guest','床尾柜前净距',items.guestBed,items.guestWardrobe,'z'),
  gap('kitchen','冰箱—台面通道',items.fridge,items.kitchenTop,'x')
 ].filter(Boolean);
}
function clearanceVisible(l){return clearanceEnabled&&selected===l.room&&!walkMode&&!privacyView}
function setClearanceEnabled(value){clearanceEnabled=Boolean(value);$('#clearance-toggle').setAttribute('aria-pressed',String(clearanceEnabled));dirty=true}
function updateClearances(){
 const rows=computeClearances(THREE,clearanceItems,wallPieces,layoutMode,suiteGroup);
 for(let i=0;i<rows.length;i++){
  const row=rows[i];let l=clearanceGroup.userData.labels[i];
  if(!l){
   const el=document.createElement('span');el.className='room-label clearance-label';el.title='按当前模型外包计算的局部净距，非现场实测';$('#labels').appendChild(el);
   const material=new THREE.LineBasicMaterial({color:0x315f50,depthTest:false,transparent:true,opacity:.9});
   const line=new THREE.LineSegments(new THREE.BufferGeometry(),material);line.renderOrder=20;clearanceGroup.add(line);
   l={clearance:true,el,p:new THREE.Vector3(),line};labels.push(l);clearanceGroup.userData.labels.push(l);
  }
  Object.assign(l,{room:row.room});l.el.textContent=row.text;l.p.fromArray(row.start).lerp(new THREE.Vector3(...row.end),.5);l.p.y=.16;
  const [a,b]=[row.start,row.end],axis=a[0]===b[0]?0:2,points=[...a,...b];
  for(const p of [a,b]){const c=[...p],d=[...p];c[axis]-=.07;d[axis]+=.07;points.push(...c,...d)}
  const position=l.line.geometry.getAttribute('position');if(position){position.array.set(points);position.needsUpdate=true}else l.line.geometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));l.line.geometry.computeBoundingSphere();l.line.visible=clearanceVisible(l);
 }
 for(const l of clearanceGroup.userData.labels.slice(rows.length)){l.room=null;l.line.visible=false}
}
// Keep projected labels inside the viewer and separate adjacent measurements on phones.
function positionClearanceLabels(rect){
 const placed=[];
 for(const l of clearanceGroup.userData.labels){
  if(l.el.style.display==='none')continue;
  const w=l.el.offsetWidth,h=l.el.offsetHeight,margin=8;
  let x=Math.max(w/2+margin,Math.min(rect.width-w/2-margin,parseFloat(l.el.style.left))),y=Math.max(h/2+margin,Math.min(rect.height-h/2-margin,parseFloat(l.el.style.top)));
  for(let n=0;n<placed.length+1;n++){const hit=placed.find(p=>Math.abs(x-p.x)<(w+p.w)/2+4&&Math.abs(y-p.y)<(h+p.h)/2+4);if(!hit)break;y=hit.y-(h+hit.h)/2-5}
  l.el.style.left=x+'px';l.el.style.top=y+'px';placed.push({x,y,w,h});
 }
}
function setupClearances(){
 clearanceGroup=new THREE.Group();clearanceGroup.name='room-clearance-annotations';clearanceGroup.userData.labels=[];scene.add(clearanceGroup);
 $('#clearance-toggle').onclick=()=>setClearanceEnabled(!clearanceEnabled);setClearanceEnabled(clearanceEnabled);updateClearances();
}
if(activeModel)setupClearances();
