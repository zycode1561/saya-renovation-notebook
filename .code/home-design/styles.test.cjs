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
const styles=run('Object.keys(finishPresets)');assert.deepEqual(Array.from(styles),['natural','modern','cream','newChinese','wabi','industrial']);
for(let i=0;i<styles.length*4;i++){
 const style=styles[i%styles.length];run(`swapFurniture('${style}')`);
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
for(const style of styles)for(const role of ['woodFloor','cabinet','stone','fabric','metal','wall','art']){
 const m=new T.MeshStandardMaterial();m.userData.finishRole=role;context.testMaterial=m;run(`applyFinish(testMaterial,'${style}')`);const first=m.map;run(`applyFinish(testMaterial,'${style}')`);assert.equal(first,m.map);
 const kind=run(`finishPresets.${style}.${role}`);if(kind){assert.equal(m.map.image.width,512);run(`applyFinish(testMaterial,'${style==='natural'?'modern':'natural'}');applyFinish(testMaterial,'${style}')`);assert.equal(first,m.map)}
 assert(m.roughness>=0&&m.roughness<=1);assert.equal(m.metalness,role==='metal'?.8:0);
}
context.ambient=new T.HemisphereLight();context.sun=new T.DirectionalLight();
for(const style of styles)for(const night of [false,true]){
 context.currentStyle=style;context.night=night;run('syncFinishLighting()');const values=run(`finishPresets.${style}.${night?'night':'day'}`);
 assert.equal(context.ambient.intensity,values[0]);assert.equal(context.sun.intensity,values[1]);assert.equal(context.renderer.toneMappingExposure,values[2]);for(const v of values)assert(v>0&&v<4);assert.equal(context.nightLights.visible,night);
 for(const l of context.nightLights.children)assert(l.intensity>0&&l.intensity<5);
}
// Exercise the public style switch, including copy, colors and exclusive details.
context.document.body={dataset:{}};vm.runInContext(read('styles.js'),context);
run("modernDetails=new THREE.Group();modernCeiling=new THREE.Group();modernDetails.add(modernCeiling);home.add(modernDetails);naturalOnly=[new THREE.Group()];styleMaterials=[];home.traverse(o=>{if(o.material?.color)styleMaterials.push({material:o.material,color:'#'+o.material.color.getHexString(),roughness:o.material.roughness,metalness:o.material.metalness})});activeModel=true");
context.clearanceGroup=null;const switchCount=count();
for(const style of styles){
 run(`applyStyle('${style}')`);assert.equal(context.document.body.dataset.style,style);assert.equal(run('modernDetails.visible'),style==='modern');assert.equal(run('naturalOnly[0].visible'),style==='natural');assert.equal(count(),switchCount);
 parts.forEach((p,j)=>{assert(before[j].min.distanceTo(bounds(p).min)<1e-6);assert(before[j].max.distanceTo(bounds(p).max)<1e-6)});
 assert(context.$('#style-description').textContent.length>0);
 assert(run(`styleMaterials.filter(({material})=>!pickFloors.some(f=>f.material===material)).every(({material,color})=>material.color.getHexString()===(styleColorMaps.${style}[color]||color).slice(1))`));
}
let texturesDisposed=0,geometriesDisposed=0;for(const t of run('Array.from(finishTextures.values())'))t.addEventListener('dispose',()=>texturesDisposed++);for(const g of run('Array.from(variantGeometries.values())'))g.addEventListener('dispose',()=>geometriesDisposed++);
const textureCount=run('finishTextures.size'),geometryCount=run('variantGeometries.size');
run('disposeFinishResources()');assert.equal(run('finishTextures.size+variantGeometries.size'),0);
assert.equal(texturesDisposed,textureCount);assert.equal(geometriesDisposed,geometryCount);
console.log('PASS: 24 switches across all six styles; all furniture footprints, both-layout clearances, mattress privacy bounds and walk starts; shared geometry/textures, disposal and day/night presets.');
