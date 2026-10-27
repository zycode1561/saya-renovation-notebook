const assert=require('node:assert/strict'),vm=require('node:vm');
const {context,run,read}=require('./walkthrough.test.cjs');
context.activeModel=false;context.styleMaterials=[];context.window.__homeDesign={};context.applyStyle=()=>{};
context.addLabel=(id,text,p)=>context.labels.push({id,el:{textContent:text,style:{}},p:new context.THREE.Vector3(...p)});
vm.runInContext(read('finishes.js'),context);vm.runInContext(read('suite.js'),context);run("buildSuiteModel();setLayout('original',false)");
vm.runInContext(read('clearance.js'),context);
const T=context.THREE,bounds=o=>new T.Box3().setFromObject(o),parts=[];
context.home.traverse(o=>{if(o.userData.furniturePart)parts.push(o)});
assert(parts.length>=16);const before=parts.map(bounds),count=()=>{let n=0;context.home.traverse(o=>{if(o.isMesh)n++});return n},initialCount=count();
const rows=()=>run('computeClearances(THREE,clearanceItems,wallPieces,layoutMode,suiteGroup)').map(r=>[r.title,r.metres]);
const initial=rows();context.layoutMode='suite';const suiteInitial=rows();context.layoutMode='original';
const mattress=context.clearanceItems.masterBed.children.find(m=>m.geometry?.parameters.width===1.8),bedBefore=bounds(mattress);
let last=[],disposed=0;
for(let i=0;i<20;i++){
 const style=i%2?'modern':'natural';run(`swapFurniture('${style}')`);
 parts.forEach((p,j)=>{assert.equal(p.userData.furnitureStyle,style);assert(before[j].min.distanceTo(bounds(p).min)<1e-6);assert(before[j].max.distanceTo(bounds(p).max)<1e-6);if(last[j])assert.notEqual(last[j],p.geometry)});
 assert.equal(count(),initialCount);assert(bounds(mattress).equals(bedBefore));
 const compare=expected=>rows().forEach((r,j)=>{assert.equal(r[0],expected[j][0]);assert(Math.abs(r[1]-expected[j][1])<1e-6)});
 compare(initial);context.layoutMode='suite';compare(suiteInitial);context.layoutMode='original';
 run('refreshWalkGeometry()');for(const name of run('Object.keys(walkStarts)'))assert(run(`canWalkAt(...walkStarts[${JSON.stringify(name)}])`),name);
 last=parts.map(p=>p.geometry);for(const g of new Set(last))g.addEventListener('dispose',()=>disposed++);
 assert(run('variantGeometries.size')<20);
}
assert(disposed>0);const chairs=parts.filter(p=>p.name==='suite-chair-back');assert.equal(chairs.length,4);assert.equal(new Set(chairs.map(p=>p.geometry)).size,1);
const fakeContext={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}};
context.document.createElement=()=>({getContext:()=>fakeContext});
context.home.traverse(o=>{if(o.material?.color)o.material.userData.finishRole=run(`finishRole('#${o.material.color.getHexString()}')`)});
for(const role of ['woodFloor','cabinet','stone','fabric','metal','wall']){
 const m=new T.MeshStandardMaterial();m.userData.finishRole=role;context.testMaterial=m;run("applyFinish(testMaterial,'natural')");const first=m.map;run("applyFinish(testMaterial,'natural')");assert.equal(first,m.map);if(['woodFloor','cabinet','stone','fabric'].includes(role))assert.equal(m.map.image.width,512);run("applyFinish(testMaterial,'modern')");assert(m.roughness>=0&&m.roughness<=1);assert.equal(m.metalness,role==='metal'?.8:0);
}
context.ambient=new T.HemisphereLight();context.sun=new T.DirectionalLight();context.currentStyle='modern';context.night=true;run('syncFinishLighting()');assert.equal(context.ambient.intensity,.48);context.currentStyle='natural';run('syncFinishLighting()');assert.equal(context.ambient.intensity,.55);context.night=false;run('syncFinishLighting()');assert.equal(context.ambient.intensity,1.7);
run('disposeFinishResources()');assert.equal(run('finishTextures.size+variantGeometries.size'),0);
console.log('PASS: 20 style switches; all furniture footprints, both-layout clearances, mattress privacy bounds and walk starts; shared geometry/textures, disposal and day/night presets.');
