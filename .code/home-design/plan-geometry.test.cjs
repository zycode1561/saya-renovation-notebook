const assert=require('node:assert/strict');
const {context,run}=require('./walkthrough.test.cjs');
const T=context.THREE;context.home.updateMatrixWorld(true);
const bay=context.home.getObjectByName('master-bay-window');assert(bay,'Missing bay volume');
const bounds=new T.Box3().setFromObject(bay);
assert(bounds.max.z>10.49&&bounds.min.z<9.91,'Bay must project beyond bedroom');
let glass=[];bay.traverse(m=>{if(m.isMesh&&m.material.transparent)glass.push(m)});
assert.equal(glass.length,3,'Front and both side faces must be glazed');
assert(glass.every(m=>m.geometry.parameters.height>1.5));
for(const name of ['ac-guest','ac-study','ac-master'])assert(context.home.getObjectByName(name),name);
assert(!context.wallPieces.some(({m})=>{const b=new T.Box3().setFromObject(m);return b.containsPoint(new T.Vector3(11.5,1.5,4.3))}),'Right bathroom window occluded');
const master=context.pickFloors.find(m=>m.userData.room==='master');assert.equal(master.geometry.parameters.width,3.3);assert.equal(master.position.x,9.85);
assert(!context.wallPieces.some(({m})=>m.position.x>11.5),'Invented east-wall extension');
assert(!context.wallPieces.some(({m})=>new T.Box3().setFromObject(m).containsPoint(new T.Vector3(2.8,1,4.6))),'Entrance must open on the west recess');
console.log('PASS: CAD footprint, protruding three-sided bay, three AC ledges, unobstructed bathroom window and west entrance.');

for(const full of [false,true]){
 run(`wallFull=${full};setWalls()`);context.home.updateMatrixWorld(true);
 for(const name of ['front','left','right']){
  const face=bay.getObjectByName('bay-'+name);
  assert(face && face.visible,name+' face missing');
  const pane=face.getObjectByName('bay-glass-'+name);
  const b=new T.Box3().setFromObject(pane);
  assert(b.min.y>.9 && b.max.y>2.4,'Glazing must span sill to head');
  assert.equal(pane.geometry.type,'PlaneGeometry','Glazing must not stack transparent box faces');
  assert.equal(pane.material,glass[0].material,'All faces share the same glass');
  assert.equal(pane.material.side,T.DoubleSide);
  assert.equal(pane.material.depthWrite,false);
  assert.equal(pane.material.depthTest,true);
  assert.equal(pane.castShadow,false);
  assert.equal(pane.renderOrder,1);
  // Check the entire pane, especially its rear 90 mm where the exterior wall
  // used to share the glass plane. Interior samples alone miss that overlap.
  context.home.traverse(m=>{
   if(!m.isMesh||m.material.transparent||!m.visible||['bay-mullion','bay-rail'].includes(m.name))return;
   assert(!new T.Box3().setFromObject(m).intersectsBox(b.clone().expandByScalar(.001)),name+' pane intersects opaque geometry '+m.name);
  });
  // Sample each clear light at two heights; nearby walls must not cover a return.
  for(const x of [-.25,.25])for(const y of [1.2,2.1]){
   const center=face.localToWorld(new T.Vector3(x*pane.geometry.parameters.width,y,0));
   context.home.traverse(m=>{
    if(m.isMesh&&!m.material.transparent&&m.visible)
     assert(!new T.Box3().setFromObject(m).containsPoint(center),name+' glazing covered by '+m.name);
   });
  }
  assert.equal(face.children.filter(m=>m.name==='bay-mullion').length,3);
  assert.equal(face.children.filter(m=>m.name==='bay-rail').length,2);
  if(name!=='front')assert(b.max.z-b.min.z>.59,'Side pane needs the full bay return');
 }
}
for(const [name,wallZ,outward] of [['ac-guest',0,-1],['ac-study',0,-1],['ac-master',9.9,1]]){
 const ledge=context.home.getObjectByName(name),slab=ledge.getObjectByName('ac-slab');
 const b=new T.Box3().setFromObject(slab);
 const inner=outward>0?b.min.z:b.max.z,outer=outward>0?b.max.z:b.min.z;
 assert(Math.abs(inner-wallZ)<1e-6,'Slab must meet exterior wall');
 assert(Math.abs(outer-wallZ)>.09,'Slab must protrude beyond wall face');
 assert(Math.abs(outer-wallZ)<.6,'AC slab must be shallower than bay');
 assert(slab.geometry.parameters.height<=.12,'AC slab must stay thin');
 assert(new T.Box3().setFromObject(ledge).max.y<.4,'AC edge must stay low');
 assert(!context.wallPieces.some(({m})=>m.parent===ledge),'AC ledge must not cut or grow with walls');
}
console.log('PASS: three-face bay frames in both wall modes; attached shallow outdoor AC slabs.');
