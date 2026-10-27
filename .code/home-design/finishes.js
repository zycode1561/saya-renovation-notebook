// Resource ownership: textures/environment live for the model lifetime; variant
// geometries live only until the next style change. Mesh anchors never change.
const finishPresets={
 natural:{woodFloor:'wood',cabinet:'wood',stone:'stone',fabric:'fabric',metal:null,wall:null,art:'art',light:['#fff9e9','#9ba998','#fff0d2','#ffd59a'],day:[1.7,2.15,1.05],night:[.55,.22,1.35]},
 modern:{woodFloor:'stone',cabinet:null,stone:'stone',fabric:'fabric',metal:null,wall:null,art:'art',light:['#f7f8f5','#a3acaf','#fff7eb','#ffe4bd'],day:[1.55,2,1.08],night:[.48,.18,1.45]},
 cream:{woodFloor:'wood',cabinet:null,stone:'stone',fabric:'fabric',metal:null,wall:null,art:'art',light:['#fff6e8','#c9b8a0','#ffe8c8','#ffd4a0'],day:[1.75,2.1,1.1],night:[.58,.2,1.38]},
 newChinese:{woodFloor:'wood',cabinet:'wood',stone:'stone',fabric:'fabric',metal:null,wall:null,art:'art',light:['#f6efdf','#96958a','#ffe5c2','#ffc887'],day:[1.5,1.85,1.02],night:[.45,.16,1.25]},
 wabi:{woodFloor:'plaster',cabinet:'wood',stone:'plaster',fabric:'linen',metal:null,wall:'plaster',art:'art',light:['#f1efea','#a29b90','#f4ebdb','#f4d7ae'],day:[1.65,1.55,1.02],night:[.6,.12,1.22]},
 industrial:{woodFloor:'concrete',cabinet:null,stone:'concrete',fabric:'leather',metal:null,wall:'concrete',art:'art',light:['#e8eff5','#888e94','#e6edf6','#ffbf83'],day:[1.45,1.95,1.04],night:[.38,.15,1.3]}
};
const finishSurfaces={natural:[.65,.32,.3,.28,3],modern:[.48,.32,.3,.45,2.7],cream:[.85,.6,.38,.3,2.8],newChinese:[.7,.45,.4,.32,2.6],wabi:[.95,.94,.65,.2,2.4],industrial:[.7,.88,.35,.55,3.1]};
const finishTextures=new Map(),variantGeometries=new Map();
let finishEnvironment=null,variantStyle=null;
function finishRole(color){
 const groups={woodFloor:['#d5bf9e','#d9c7a9','#d8c5a6','#dac8a9','#d8c3a2','#d5c09f','#d8c3a3'],cabinet:['#c1a77f','#bb9f77','#c5ac86','#c2a77e','#c4aa83','#bea37c','#bda078','#bca07e','#aa8c63','#c5a87d','#809178'],stone:['#e4dcc8','#efeddf','#cfcec0','#d4d2c6','#cccdbd'],fabric:['#cacdb8','#dadcc8','#dedfcc','#e8e8d5','#9da48d','#b4bba1','#7e8a74','#f5f0df','#e2e1cd','#faf7e9','#d7d5c1'],metal:['#a28c68','#666f60','#687060','#65705e','#aeb8aa','#7b897d'],wall:['#efeee5','#f5f2e7'],art:['#e6dbc0']};
 return Object.keys(groups).find(k=>groups[k].includes(color))||'paint';
}
function finishTexture(style,kind){
 const key=style+kind;if(finishTextures.has(key))return finishTextures.get(key);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(512,512);
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const noise=Math.sin(x*127.1+y*311.7)*43758.5453%1;
  let v=245;
  if(kind==='wood')v=222+15*Math.sin(x*.19+3*Math.sin(y*.018))+7*Math.sin(x*.8+y*.012)+noise*4;
  if(kind==='stone')v=245-25*Math.pow((1+Math.sin(x*.025+y*.019+2*Math.sin(y*.023)))/2,18)+noise*3;
  if(kind==='fabric')v=231+9*Math.sin(x*Math.PI/2)*Math.sin(y*Math.PI/2)+noise*6;
  if(kind==='art')v=style==='natural'?(Math.sin(x*.012)+Math.cos(y*.014)>.3?145:235):((x>260&&y<350)||(x<170&&y>180)?65:240);
  if(kind==='plaster'||kind==='concrete')v=233+8*Math.sin(x*.047)*Math.cos(y*.039)+noise*(kind==='concrete'?18:10);
  if(kind==='linen')v=225+12*Math.sin(x*1.7)*Math.sin(y*1.7)+noise*12;
  if(kind==='leather')v=230+noise*15+4*Math.sin(x*.12+y*.08);
  if(kind==='art'&&style==='cream')v=((x-180)**2/220**2+(y-260)**2/170**2<1)?211:248;
  if(kind==='art'&&style==='newChinese')v=y>320+45*Math.sin(x*.014)?115:y>240+60*Math.sin(x*.009)?185:248;
  if(kind==='art'&&style==='wabi')v=Math.abs(y-290-12*Math.sin(x*.012))<9&&x>100&&x<410?100:245;
  if(kind==='art'&&style==='industrial')v=x+y>510&&x-y<160?65:245;
  const i=(y*512+x)*4;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;
 }
 ctx.putImageData(pixels,0,0);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=2;finishTextures.set(key,t);return t;
}
function applyFinish(material,style){
 const role=material.userData.finishRole||'paint',kind=finishPresets[style][role],surface=finishSurfaces[style];
 const map=kind?finishTexture(style,kind):null;
 if(material.map!==map){material.map=map;material.needsUpdate=true;}
 material.roughness=({woodFloor:.72,cabinet:surface[0],stone:surface[1],fabric:style==='industrial'?.65:.96,metal:surface[2],wall:.92,art:.9})[role]??material.roughness;
 material.metalness=role==='metal'?.8:0;material.envMapIntensity=surface[3];
}
function prepareFinishEnvironment(){
 if(finishEnvironment)return;
 // A static studio room captured once at the vendored PMREM default (256 px); no per-frame cube rendering.
 const room=new THREE.Scene(),geometry=new THREE.BoxGeometry(12,8,12);
 const shell=new THREE.MeshBasicMaterial({color:0xc8c6c1,side:THREE.BackSide});room.add(new THREE.Mesh(geometry,shell));
 const panelGeometry=new THREE.PlaneGeometry(5,4),panelMaterial=new THREE.MeshBasicMaterial({color:0xffffff});
 for(const x of [-5.8,5.8]){const panel=new THREE.Mesh(panelGeometry,panelMaterial);panel.position.set(x,1,0);panel.rotation.y=x<0?Math.PI/2:-Math.PI/2;room.add(panel)}
 const pmrem=new THREE.PMREMGenerator(renderer);finishEnvironment=pmrem.fromScene(room,.06,.1,30);scene.environment=finishEnvironment.texture;
 pmrem.dispose();geometry.dispose();shell.dispose();panelGeometry.dispose();panelMaterial.dispose();
}
// Merge low-poly parts into a single draw per existing furniture component.
function furnitureGeometry(kind,style,size){
 const key=[kind,style,...size].join(':');if(variantGeometries.has(key))return variantGeometries.get(key);
 const parts=[];
 function cube(x,y,z,w,h,d){const g=new THREE.BoxGeometry(w,h,d).toNonIndexed();g.translate(x,y,z);parts.push(g)}
 function cylinder(top=.5,bottom=.5,segments=16){parts.push(new THREE.CylinderGeometry(top,bottom,1,segments).toNonIndexed())}
 function soft(){parts.push(new THREE.SphereGeometry(.5,16,8).toNonIndexed())}
 if(style==='cream'){
  if(['back','headboard','top','seat','shade'].includes(kind))soft();else cylinder(.42,.5);
 }else if(style==='newChinese'){
  if(['back','headboard'].includes(kind)){cube(0,.44,0,1,.12,1);cube(0,-.44,0,1,.12,1);for(let i=0;i<5;i++)cube(-.44+i*.22,0,0,.12,.88,.8)}
  else if(kind==='shade')cylinder(.28,.5,4);else cube(0,0,0,1,1,1);
 }else if(style==='wabi'){
  if(kind==='top'){cylinder(.45,.5,7);parts[0].rotateY(.2)}
  else if(kind==='shade')cylinder(.46,.5,12);
  else if(kind==='back'){cube(0,-.12,0,1,.76,1);cube(0,.38,0,.92,.24,.85)}
  else cube(0,0,0,1,1,1);
 }else if(style==='industrial'){
  if(kind==='headboard'){for(const y of [-.27,.27])cube(0,y,0,1,.46,1)}
  else if(kind==='leg'){cube(0,0,0,.32,1,.32);cube(0,-.45,0,1,.1,1)}
  else if(kind==='shade')cylinder(.3,.5,12);
  else if(kind==='top'){cube(0,.15,0,1,.7,1);for(const x of [-.42,.42])cube(x,-.35,0,.16,.3,.8)}
  else cube(0,0,0,1,1,1);
 }else if(style==='natural'&&['back','headboard'].includes(kind)){
  cube(0,-.44,0,1,.12,1);cube(0,.44,0,1,.12,1);
  for(let i=0;i<7;i++)cube(-.45+i*.15,0,0,.1,.88,.72);
 }else if(style==='modern'&&kind==='back'){
  cube(0,.18,0,1,.64,1);for(const x of [-.44,.44])cube(x,-.32,0,.12,.36,.65);
 }else if(style==='modern'&&kind==='headboard'){
  for(const x of [-.255,.255])cube(x,0,0,.49,1,1);
 }else if(style==='natural'&&['top','shade','seat'].includes(kind)){
  cylinder(.5,kind==='shade'?.35:.5,16);
 }else if(style==='modern'&&kind==='leg'){
  cube(0,0,0,1,1,.32);cube(0,-.45,0,1,.1,1);
 }else cube(0,0,0,1,1,1);
 const g=new THREE.BufferGeometry();for(const name of ['position','normal','uv']){const data=[];for(const p of parts)data.push(...p.getAttribute(name).array);g.setAttribute(name,new THREE.Float32BufferAttribute(data,name==='uv'?2:3))}
 for(const p of parts)p.dispose();g.computeBoundingBox();const extent=g.boundingBox.getSize(new THREE.Vector3()),center=g.boundingBox.getCenter(new THREE.Vector3());g.translate(-center.x,-center.y,-center.z);g.scale(size[0]/extent.x,size[1]/extent.y,size[2]/extent.z);g.computeBoundingBox();variantGeometries.set(key,g);return g;
}
function swapFurniture(style){
 if(variantStyle!==style){for(const g of variantGeometries.values())g.dispose();variantGeometries.clear();variantStyle=style}
 home.traverse(o=>{
  const kind=o.userData.furniturePart;if(!kind)return;
  if(!o.userData.finishSize){o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;o.userData.finishSize=b.getSize(new THREE.Vector3()).toArray();o.geometry.dispose();}
  o.geometry=furnitureGeometry(kind,style,o.userData.finishSize);o.userData.furnitureStyle=style;
 });
 home.updateMatrixWorld(true);
}
function syncFinishLighting(){
 const p=finishPresets[currentStyle],values=night?p.night:p.day;
 ambient.color.set(p.light[0]);ambient.groundColor.set(p.light[1]);sun.color.set(p.light[2]);ambient.intensity=values[0];sun.intensity=values[1];renderer.toneMappingExposure=values[2];nightLights.visible=night;
 nightLights.children.forEach(l=>{l.color.set(p.light[3]);l.intensity=finishSurfaces[currentStyle][4]});
}
function disposeFinishResources(){for(const t of finishTextures.values())t.dispose();finishTextures.clear();for(const g of variantGeometries.values())g.dispose();variantGeometries.clear();finishEnvironment?.dispose();finishEnvironment=null;}
