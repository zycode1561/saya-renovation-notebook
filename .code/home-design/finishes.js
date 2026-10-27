// Resource ownership: textures/environment live for the model lifetime; variant
// geometries live only until the next style change. Mesh anchors never change.
const finishPresets={
 natural:{woodFloor:'wood',cabinet:'wood',stone:'stone',fabric:'fabric',metal:null,wall:null,art:'art',light:['#fff9e9','#9ba998','#fff0d2','#ffd59a'],day:[1.7,2.15,1.05],night:[.55,.22,1.35]},
 modern:{woodFloor:'stone',cabinet:null,stone:'stone',fabric:'fabric',metal:null,wall:null,art:'art',light:['#f7f8f5','#a3acaf','#fff7eb','#ffe4bd'],day:[1.55,2,1.08],night:[.48,.18,1.45]}
};
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
  const i=(y*512+x)*4;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;
 }
 ctx.putImageData(pixels,0,0);const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=2;finishTextures.set(key,t);return t;
}
function applyFinish(material,style){
 const role=material.userData.finishRole||'paint',kind=finishPresets[style][role];
 const map=kind?finishTexture(style,kind):null;
 if(material.map!==map){material.map=map;material.needsUpdate=true;}
 material.roughness=({woodFloor:.72,cabinet:style==='natural'?.65:.48,stone:.32,fabric:.96,metal:.3,wall:.92,art:.9})[role]??material.roughness;
 material.metalness=role==='metal'?.8:0;material.envMapIntensity=style==='modern'?.45:.28;
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
 if(style==='natural'&&['back','headboard'].includes(kind)){
  cube(0,-.44,0,1,.12,1);cube(0,.44,0,1,.12,1);
  for(let i=0;i<7;i++)cube(-.45+i*.15,0,0,.1,.88,.72);
 }else if(style==='modern'&&kind==='back'){
  cube(0,.18,0,1,.64,1);for(const x of [-.44,.44])cube(x,-.32,0,.12,.36,.65);
 }else if(style==='modern'&&kind==='headboard'){
  for(const x of [-.255,.255])cube(x,0,0,.49,1,1);
 }else if(style==='natural'&&['top','shade','seat'].includes(kind)){
  const g=new THREE.CylinderGeometry(.5,kind==='shade'?.35:.5,1,16).toNonIndexed();parts.push(g);
 }else if(style==='modern'&&kind==='leg'){
  cube(0,0,0,1,1,.32);cube(0,-.45,0,1,.1,1);
 }else cube(0,0,0,1,1,1);
 const g=new THREE.BufferGeometry();for(const name of ['position','normal','uv']){const data=[];for(const p of parts)data.push(...p.getAttribute(name).array);g.setAttribute(name,new THREE.Float32BufferAttribute(data,name==='uv'?2:3))}
 for(const p of parts)p.dispose();g.scale(...size);g.computeBoundingBox();variantGeometries.set(key,g);return g;
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
 nightLights.children.forEach(l=>{l.color.set(p.light[3]);l.intensity=currentStyle==='modern'?2.7:3});
}
function disposeFinishResources(){for(const t of finishTextures.values())t.dispose();finishTextures.clear();for(const g of variantGeometries.values())g.dispose();variantGeometries.clear();finishEnvironment?.dispose();finishEnvironment=null;}
