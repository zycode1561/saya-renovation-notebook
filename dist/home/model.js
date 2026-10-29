import THREE from './three.js';
export function mountModel(root) {
let designAPI={},componentActive=true,frame=0,clearOrbitInput=()=>{};
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

// Six finish schemes share exactly the same architecture, furniture positions and circulation.
let currentStyle='natural',styleMaterials=[],naturalOnly=[],modernDetails=null,modernCeiling=null;
let naturalCopy=null;
const styleNames={natural:'原木自然风',modern:'现代简约风',cream:'奶油风',newChinese:'新中式',wabi:'侘寂风',industrial:'工业风'};
const modernColors={
 '#d5bf9e':'#d5d5d1','#d9c7a9':'#d4d4d1','#d8c5a6':'#d4d4d1','#dac8a9':'#d4d4d1','#d8c3a2':'#d4d4d1','#d5c09f':'#d5d5d1','#d8c3a3':'#d5d5d1',
 '#cfcec0':'#c9cccb','#d3d0c2':'#d4d6d4','#d4d2c6':'#c9cccb','#c9cec2':'#ced1d0','#cccdbd':'#c7cac9','#bbbfb3':'#b5b9b7',
 '#f5f2e7':'#f0f0ed','#efeee5':'#f1f1ed','#edece2':'#eceeeb','#eceadf':'#f1f1ed','#aeb8aa':'#32383a','#bfd2cc':'#b9c8cc','#bccabd':'#bac8cb','#9eaa9b':'#464e50',
 '#c1a77f':'#e8e8e3','#bb9f77':'#e5e6e2','#c5ac86':'#e9e9e4','#c2a77e':'#e0e1de','#c4aa83':'#c1c5c3','#bea37c':'#e6e7e2','#b8bfa9':'#dfe1dd','#bda078':'#555c5e','#e4dcc8':'#e9e9e5','#ac997a':'#bac0bd','#687060':'#343b3d',
 '#bca07e':'#858b8b','#9da48d':'#7a8182','#c6ab8c':'#a3a7a5','#f5f0df':'#f0f0ec','#e2e1cd':'#e4e5e0','#faf7e9':'#f7f6ef','#c5c9b3':'#babfba','#d1cebd':'#c3c6c1',
 '#c5a87d':'#f0f0eb','#666f60':'#333a3c','#a28c68':'#454c4d','#7d8b76':'#41484a','#b4bba1':'#353c3e','#7e8a74':'#454c4d','#a0aa90':'#c5c8c3',
 '#cacdb8':'#22282a','#dadcc8':'#303638','#dedfcc':'#282e30','#e8e8d5':'#3c4244','#8e9d82':'#707676','#bd956e':'#e9e9e3','#aa8c63':'#d7dad7','#d7d5c1':'#e2e1d8','#d5cfba':'#c2c3bb',
 '#2d3f37':'#151c20','#728c7c':'#56656b','#35443e':'#20282c','#9fb8ae':'#91a6b0','#5e665d':'#40484c','#ecece1':'#e4e7e4',
 '#809178':'#737d81','#efeddf':'#ebeeeb','#b7bdb0':'#a4adb0','#c9cec2':'#bac0c0','#c4c9be':'#b8bfc0','#697969':'#454e52','#b8c1b4':'#9ca7aa','#657560':'#39484e','#b3bbac':'#565f64',
 '#8a9b91':'#737f82','#bdc9bf':'#b9c6c7','#7b897d':'#616e72','#45524a':'#2b3337','#899586':'#7e898c','#343f38':'#1f282c',
 '#b8a37f':'#d4d8d5','#b89a70':'#949a97','#b5aa87':'#aaa99d','#c5b58d':'#b5b2a3','#b6ad95':'#9da4a0','#d8c7a6':'#c6c2b3','#c5c6ae':'#c0c5be','#bdad87':'#969e9b','#b8a482':'#a3aaa5',
 '#65705e':'#30383a','#f1e6cf':'#eaeae3','#ac9270':'#343b3d','#e6dbc0':'#e7e8e2','#f3e6c7':'#eae9e1','#9a875e':'#4e575a'
};
const stylePalettes={"cream":["#f7f1e6","#e6d5b8","#efe6d6","#e4d8c4","#c4a882","#cfc6b8","#eee5d8"],"newChinese":["#f3efe6","#8b6b4a","#6e5340","#9aa090","#8a6f4e","#d8d2c4","#c6bfae"],"wabi":["#e4ddd2","#b59a78","#cfc6b6","#b8ada0","#6a6056","#ddd6cb","#d2cbc0"],"industrial":["#c5c4c0","#6d6a64","#3a3d40","#5c5f62","#2a2d30","#8a6a4e","#a5a39e"]};
const styleDescriptions={"natural":"温暖原木 / 奶油白 / 低饱和绿","modern":"参考图同款气质 · 黑白灰 / 平整柜门 / 线性暖光","cream":"奶白燕麦 / 圆润软包 / 约 3000K 暖光","newChinese":"米白深木 / 对称竖格 / 水墨与沉稳暖光","wabi":"灰泥大地色 / 朴素低矮 / 柔和自然光","industrial":"水泥黑铁 / 厚板金属 / 冷灰日光与暖橙夜灯"};
const styleSwatches={"cream":["奶白哑光墙柜","雾面浅木地板","燕麦棉麻软包","暖灰石材","细香槟金属"],"newChinese":["米白留白墙","中深木地板","灰绿棉麻与深木柜","淡灰石材","暗铜五金"],"wabi":["矿物灰泥墙","风化木与微水泥地面","粗麻与亚麻灰柜","哑光微水泥","黑褐金属与陶器"],"industrial":["水泥灰墙","深灰水泥地面","深灰皮革与炭黑柜","粗粝水泥厚板","黑铁框架"]};
const styleColorMaps={natural:{},modern:modernColors};
for(const [id,palette] of Object.entries(stylePalettes)){const roles=['wall','woodFloor','cabinet','fabric','metal','art','stone'];styleColorMaps[id]={};for(const color of Object.keys(modernColors))styleColorMaps[id][color]=palette[Math.max(0,roles.indexOf(finishRole(color)))];}
const modernRoomOverrides={
 living:{desc:'沿用原客厅布局，以炭黑直排沙发搭配浅灰地面与米白地毯。电视柜改为深灰色，黑色几何落地灯与局部线性灯带呼应参考图；保留可替换猫墙模块，不因追求整洁而减少猫咪活动空间。',tags:['炭黑沙发','深灰电视柜','局部线性灯光'],facts:{'氛围与收纳':'白色墙面、浅灰大规格铺地示意、米白织物；深灰电视柜下设灯带。黑色沙发表面仅为视觉示意，实际选材先测试耐抓、易洁与触感。'}},
 kitchen:{desc:'保留原厨房的冰箱—水槽—备餐—灶具关系。柜门由灰绿切换为烟灰色，浅灰白台面搭配深色五金与玻璃分隔，呼应参考图的现代简约气质；不增加岛台，也不改变原有厨卫位置。',tags:['烟灰柜门','浅色台面','深色框线']},
 master:{facts:{'L 柜尺寸':'暖白连续 L 形衣柜，长边约 1,580 mm、短边约 1,630 mm，含 600 mm 转角重叠；短边末端嵌入 700 mm 浅色梳妆位及上方封闭柜，搭配烟灰凳。主柜深 600 mm，柜高 2,350 mm。'}},
 dining:{tags:['浅色餐桌','黑灰餐椅','白色玄关柜'],facts:{'入户收纳':'沿用约 350 mm 深玄关柜，改为平整白色柜门与深色细节；不照搬参考图的大体量餐边柜，以免压缩本户型通道。'}},
 study:{tags:['浅色双人桌','黑灰座椅','薄柜收纳']},
 guest:{tags:['灰色软包','暖白衣柜','客卧保留']}
};
function styledRoom(id){const base=rooms[id],patch=currentStyle==='modern'?(modernRoomOverrides[id]||{}):{};const result={...base,...patch,facts:base.facts.map(([key,value])=>[key,patch.facts?.[key]||value])};return layoutMode==='suite'?suiteRoomCopy(id,result):result}
function updateFloorSelection(){for(const m of pickFloors){const base=styleColorMaps[currentStyle][m.userData.color]||m.userData.color;m.material.color.set(m.userData.room===selected?(currentStyle==='modern'?'#b6c7cc':'#d5d9b8'):base)}}
function prepareStyleModel(){
 prepareFinishEnvironment();
 const seen=new Set();home.traverse(obj=>{for(const material of (Array.isArray(obj.material)?obj.material:obj.material?[obj.material]:[])){if(!material.color||seen.has(material))continue;seen.add(material);styleMaterials.push({material,color:'#'+material.color.getHexString(),roughness:material.roughness,metalness:material.metalness})}if(obj.userData.naturalOnly)naturalOnly.push(obj)});
 modernDetails=new THREE.Group();modernDetails.name='Modern finishes and lighting';home.add(modernDetails);modernCeiling=new THREE.Group();modernDetails.add(modernCeiling);
 function item(x,y,z,w,h,d,color,parent=modernDetails,extra={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.7,...extra}));m.position.set(x,y,z);m.receiveShadow=true;parent.add(m);return m}
 // Replace narrow plank joins with a quieter large tile rhythm, without moving room boundaries.
 for(const f of pickFloors){if(['baths','balcony','kitchen'].includes(f.userData.room))continue;const {width:w,depth:d}=f.geometry.parameters,x=f.position.x,z=f.position.z;for(let xx=x-w/2+.9;xx<x+w/2;xx+=.9)item(xx,.011,z,.007,.003,d-.03,'#b9bdbc');for(let zz=z-d/2+.9;zz<z+d/2;zz+=.9)item(x,.011,zz,w-.03,.003,.007,'#b9bdbc')}
 // Cutaway model: two open edge strips suggest indirect lighting, leaving the interior visible.
 for(const x of [4.76,8.04]){item(x,2.51,7.65,.12,.10,4.1,'#eeeeea',modernCeiling);item(x+(x<6?.065:-.065),2.47,7.65,.025,.025,4.0,'#fff0d3',modernCeiling,{emissive:'#ffd6a1',emissiveIntensity:1.0})}
 item(7.71,.20,7.9,.025,.025,1.95,'#fff0d3',modernDetails,{emissive:'#ffd6a1',emissiveIntensity:1.0});
 item(6.35,.83,.75,2.55,.018,.022,'#fff0d3',modernDetails,{emissive:'#ffd6a1',emissiveIntensity:.9});
 item(4.71,1.31,6.22,.028,2.45,.12,'#30373a');

}
function syncModernLighting(){if(!modernDetails)return;modernDetails.visible=currentStyle==='modern';modernCeiling.visible=!topView&&!privacyView&&!walkMode;modernDetails.traverse(o=>{if(o.material?.emissiveIntensity)o.material.emissiveIntensity=night?2.4:.9});if(ambient)syncFinishLighting()}
function applyStyle(id,notify=false){
 if(!styleNames[id])return;
 if(!naturalCopy){naturalCopy={};for(const s of ['.note-float h3','.note-float>p','#materials .section-head h2','#materials .section-head>p','#materials .swatches'])naturalCopy[s]=$(s).innerHTML}
 currentStyle=id;root.host.dataset.style=id;root.querySelectorAll('[data-style-choice]').forEach(b=>{const on=b.dataset.styleChoice===id;b.setAttribute('aria-pressed',String(on));b.classList.toggle('active',on)});
 if(id==='modern'){

 $('.note-float h3').textContent='黑白有序，光线有温度。';$('.note-float>p').innerHTML='浅色铺陈空间，<br>深色家具勾勒轮廓，<br>局部线性光柔和过渡。';
 $('#materials .section-head h2').textContent='克制的黑白，有温度的灰。';$('#materials .section-head>p').innerHTML='借鉴你提供的参考图：浅色柜门、深色软装与线性灯光。<br>保留本户型尺度，吊顶与灯带仅为概念示意。';
 const data=[['cream','01 / 暖白哑光','墙顶与平整柜门 · 明亮留白'],['wood','02 / 浅灰石纹','干区地面 · 大规格铺地示意'],['green','03 / 炭黑与烟灰','沙发、餐椅与厨房柜门'],['stone','04 / 米白织物','地毯与床品 · 柔化黑白对比'],['metal','05 / 深色金属','窗框、几何灯与细线条']];
 $('#materials .swatches').innerHTML=data.map(([c,t,d])=>`<div class="material-item"><div class="swatch ${c}"></div><h4>${t}</h4><p>${d}</p></div>`).join('');
 }else if(stylePalettes[id]){
 const palette=stylePalettes[id];

 $('.note-float h3').textContent=styleNames[id]+'，住进喜欢的日常。';$('.note-float>p').textContent=styleDescriptions[id];
 $('#materials .section-head h2').textContent=styleNames[id]+' · 色彩与触感';$('#materials .section-head>p').textContent=styleDescriptions[id];
 $('#materials .swatches').innerHTML=styleSwatches[id].map((t,i)=>`<div class="material-item"><div class="swatch" style="background:${palette[[0,1,3,6,4][i]]}"></div><h4>0${i+1} / ${t}</h4><p>${['墙面与柜体基调','地面主材','家具与软装','台面与茶几','灯具与五金'][i]}</p></div>`).join('');
 }else for(const [s,html] of Object.entries(naturalCopy))$(s).innerHTML=html;
 $('#style-description').textContent=styleDescriptions[id];
 if(activeModel){for(const {material,color,roughness,metalness} of styleMaterials){material.color.set(styleColorMaps[id][color]||color);material.roughness=roughness;material.metalness=metalness;applyFinish(material,id)}for(const obj of naturalOnly)obj.visible=id==='natural';swapFurniture(id);updateFloorSelection();syncModernLighting();if(clearanceGroup)updateClearances()}
 fillDetail(selected);if(walkMode){refreshWalkCaption();refreshWalkGeometry();}if(privacyView){$('#camera-caption').textContent='视线对比 / '+privacyViews[privacyView].name;refreshPrivacyStatus()}dirty=true;if(notify)toast('已切换为'+styleNames[id]+'，当前视角与房间布局保持一致');
}
function setupStyles(){if(activeModel)prepareStyleModel();root.querySelectorAll('[data-style-choice]').forEach(b=>b.onclick=()=>applyStyle(b.dataset.styleChoice,true));$('#style-reference-btn').onclick=()=>$('#style-dialog').showModal();$('#close-style-dialog').onclick=()=>$('#style-dialog').close();$('#style-dialog').addEventListener('click',e=>{if(e.target===$('#style-dialog'))$('#style-dialog').close()});applyStyle('modern')}

'use strict';
const $=s=>root.querySelector(s);
const rooms={
 all:{num:'01',name:'全屋鸟瞰',title:'保留格局，重新组织生活',en:'THE WHOLE HOME',center:[6.0,5.55],span:17,desc:'保留三房两卫与厨卫位置，以中部餐客厅串联日常。右下主卧安静休息，右上双人书房高效工作，左上次卧应对来客与偶尔分开休息。全屋不依赖拆墙，先把家具和动线做好。',tags:['两人常住','两猫共居','不预设拆墙'],facts:[['空间分工','三间房分别承担睡眠、双人工作、来客与弹性使用；餐厅保持开放通行。'],['尺寸策略','家具按图示比例放置，优先让出门口、椅后与床尾空间，实际尺寸须实测确认。'],['长期使用','封闭收纳为主，照明分区；猫咪食水、猫砂和高处休息点分开设置。'],['阅读方式','点击左侧房间或模型标签聚焦；切换俯视、猫咪地图与生活动线，逐项检查方案。']]},
 living:{num:'02',name:'客厅',title:'一起放松，也给猫留一条路',en:'LIVING TOGETHER',center:[6.4,7.8],span:7.4,desc:'约 3.6 米宽的中部空间更适合轻巧直排沙发。电视靠右墙，沙发靠左，避免大转角占满通道。低台、猫抓柱与分段跳台在客厅一侧串联，地面仍可轻松打扫。',tags:['直排沙发','轻量茶几','可替换猫抓件'],facts:[['家具组合','约 2,100 × 850 mm 沙发，800 × 450 mm 小茶几，深约 300 mm 电视柜；不做大型固定茶台。'],['走动空间','餐厅—客厅—阳台保持连续通行。茶几可移动，通道目标约 800–900 mm，以家具实际外径复核。'],['猫咪使用','猫墙有起点、观察点和回落点；不跨房门、不接近电视线缆。两端跳台按猫咪体能调整。'],['氛围与收纳','暖白墙面、浅木地面，灰绿靠包；落地灯与电视侧照明独立控制，电线隐藏收束。']]},
 dining:{num:'03',name:'餐厅 · 玄关',title:'家里的交汇处，要留白',en:'THE DAILY CROSSROADS',center:[5.9,3.85],span:7.4,desc:'厨房门口直达四人餐桌，餐桌长边沿原图上下方向，左右留出通往各房间的通道。玄关只布置必要鞋物收纳，避免用整排深柜挤占回家路线。',tags:['四人餐桌','无岛台','轻量玄关'],facts:[['餐桌尺寸','约 1,300 × 750 mm 圆角餐桌，两侧各两把椅；不用位时推入桌下，主通道目标约 900 mm。'],['入户收纳','玄关柜深约 350 mm，局部开放放钥匙；门扇扫过区域留空，底部预留扫地机位。'],['适应变化','两人日常用桌一侧，来客拉出其他椅。尽量避免固定卡座，以便以后调整。'],['需核实','图中左侧凹口的入户门、公区边界与净宽不够清晰，本模型仅示意连接关系，柜体待复测后定。']]},
 kitchen:{num:'04',name:'厨房',title:'一条顺手的备餐路线',en:'A QUIET, PRACTICAL KITCHEN',center:[6.4,1.05],span:6.1,desc:'保留原厨房位置与设备侧关系。冰箱靠入口左侧，水槽靠上侧，灶具靠右侧，中间留备餐台。灰绿地柜搭配浅色台面，保留可关闭的厨房分隔，兼顾烹饪和猫咪隔离。',tags:['L 形操作台','灰绿柜门','保留厨房分隔'],facts:[['工作顺序','冰箱取物 → 水槽清洗 → 中段备餐 → 右侧烹饪。水槽、灶具位置须服从实际管道与烟道。'],['柜体预留','地柜按 600 mm 深示意；水槽旁预留约 600 mm 洗碗机位，灶旁保留落锅空间。'],['收纳与灯','常用器具收在抽屉，台面上只留必需品；吊柜下任务照明独立开关。'],['现场条件','原图未给设备井净尺寸、燃气位置与窗开启范围。高柜、烟机与厨房门方案必须据此调整。']]},
 master:{num:'05',name:'主卧 · 右下',title:'床头靠客厅背墙，屏风带一张窄桌',en:'THE MAIN BEDROOM',center:[9.94,7.6],span:7.4,desc:'按沙耶要求将床调头 180°，并向窗侧微移 100 mm 留出床尾转角，床头改靠左侧、客厅背后的墙，床头灯与小边几同步移位。保留 1.8 米床与右上 L 形衣柜、内嵌梳妆位。入口原实板改为细边框遮影屏风，卧室侧接一张 860 × 240 mm 窄桌，作为随手置物台；不预留固定座椅，避免占用通路。',tags:['床头改靠左墙','屏风＋窄桌','1.8 米床保留'],facts:[['睡眠核心','床垫 1,800 × 2,000 mm，床架约 1,880 × 2,050 mm；床头靠左墙，床尾朝右。窗侧间距约 620 mm，右侧床尾空间约 1,060 mm（模型值）。'],['L 柜尺寸','长边约 1,580 mm、短边约 1,630 mm（含 600 mm 转角重叠及 700 mm 梳妆位），主柜深 600 mm、高 2,350 mm；柜体位置保留。'],['入口遮挡','屏风宽 950 mm、高 2,000 mm，使用连续遮影面板与细边框，不采用通透格栅。窄桌长 860 mm、深 240 mm，台面高 800 mm，接在卧室侧。固定视点可切换有／无屏风检查，不保证所有斜角完全遮挡。'],['收纳与通行','床尾通路改到右侧，屏风与桌子不进入主卫入口。梳妆凳收入台下时检查日常通行；拉出使用会占用床尾入口一部分空间，应先收凳再通过。'],['一体梳妆','保留 700 × 450 mm 台面、高 750 mm，上方柜底约 1,950 mm；原 320 mm 凳支持收起／拉出。屏风窄桌仅作置物台，不作为第二处坐式梳妆台。']]},
 study:{num:'06',name:'书房 · 右上',title:'并肩工作，也各有一方天地',en:'A STUDIO FOR TWO',center:[9.85,1.6],span:6.8,desc:'用约 2.6 米长桌形成双人工位，每人约 1.3 米。桌面面向原图上侧窗，显示器加可调支架和遮光帘控制眩光；右侧薄书柜收纳，房间中央留给椅子后退和走动。',tags:['双人独立工位','薄书柜','设备线缆收束'],facts:[['工作尺度','桌面约 2,600 × 650 mm，高度随使用者调整；椅后净距目标 900 mm。柜门开启也要计入活动区。'],['视频会议','两套可独立控制的任务灯与电源。需要同时通话时，一人移到次卧临时使用小桌。'],['猫咪陪伴','书房左侧设独立食点，与客厅食点分开；窗边休息台不挡窗扇，不让猫接触未收束线缆。'],['窗与屏幕','窗宽、窗台高度未给定。若窗光影响屏幕，先调遮光和屏幕角度，再决定桌子是否转向侧墙。']]},
 guest:{num:'07',name:'次卧 · 左上',title:'给来客，也给生活留一点余量',en:'A ROOM WITH ROOM TO CHANGE',center:[1.4,1.9],span:6.6,desc:'采用 1.35 米成品床与下侧衣柜，不做难以调整的满铺榻榻米。平时作为独处和临时休息空间，来客时依然是一间完整卧室。房门附近保留可移动的小桌位。',tags:['成品床','客卧保留','弹性使用'],facts:[['床与衣柜','床垫约 1,350 × 2,000 mm，床头靠图上侧墙；衣柜深约 600 mm。床右侧保留通道，床尾与衣柜之间预留约 700 mm 的目标距离。'],['备用工作','小桌按约 700 × 400 mm 示意，适合短时使用，不能替代长期办公工位；若常用可改 1.2 米床释放面积。'],['猫砂位置','角落留开放猫砂盆位，用可擦洗垫承接；远离门口与床头。来客若关门，须先另设可达替代盆位。'],['安静收纳','换季被褥收进衣柜，墙面不堆展示架，预留成品家具调整的余地。']]},
 baths:{num:'08',name:'双卫 · 洗漱',title:'保留双卫，早晨不用排队',en:'BATH & EVERYDAY CARE',center:[8.7,3.9],span:7.7,desc:'保留原图两处卫生间及左侧外置洗手区，避免迁移排水。右卫承担主要淋浴、如厕与洗漱，左卫作为辅助。湿区边界、防水、排风与检修条件优先于造型。',tags:['不迁排水','保留外置台盆','开放猫砂位'],facts:[['干湿划分','右卫右侧淋浴区以玻璃分隔示意，主通行和门扇打开区留空；玻璃与地漏位置现场确定。'],['早高峰','两人可分别使用外置台盆和右卫，左卫保留辅助如厕与淋浴能力。'],['猫咪可达','主卫干区预留第三处猫砂盆，远离淋浴溅水和门扇范围，必须保证随时进入；不装进密闭柜。'],['工程条件','不因模型调整排水或拆墙。防水闭水、排水坡度、排风和地面防滑需施工图与现场验收。']]},
 balcony:{num:'09',name:'阳台',title:'洗衣与晒太阳，各有自己的角落',en:'A LITTLE EVERYDAY RETREAT',center:[6.4,10.9],span:6.5,desc:'保留客厅与阳台边界。洗衣烘干叠放在一侧，猫砂盆放另一侧安静端，中央留作通道和活动。窗边设置低位休息垫，优先完成可靠的防逃与遮阳方案。',tags:['洗烘叠放','防逃优先','分开清洁与休息'],facts:[['家政尺度','洗烘叠放按约 700 × 700 mm 外包尺寸示意，实际需叠放件、散热、检修和门扇净空。'],['猫砂与噪声','猫砂盆与洗衣机分置两端；若机器运行造成紧张，应将盆移到更安静的室内位置，不强迫适应。'],['通行保留','不铺满地台，不默认拆客厅阳台门窗。落地收纳和猫爬架避免影响开门、晾晒及逃生路径。'],['必须确认','给排水、地漏、防水、外窗承载和物业要求尚未知；无相应条件时洗衣设备保留原有合法位置。']]}
};
let selected='all';
for(const [id,r] of Object.entries(rooms)){const b=document.createElement('button');b.dataset.room=id;b.innerHTML=`<span>${r.num}</span>${r.name}`;b.addEventListener('click',()=>selectRoom(id));$('#room-menu').appendChild(b)}
function fillDetail(id){const r=styledRoom(id);$('#detail-num').textContent=r.num;$('#detail-title').textContent=r.title;$('#detail-en').textContent=r.en;$('#detail-desc').textContent=r.desc;$('#detail-tags').innerHTML=r.tags.map(t=>`<span class="tag">${t}</span>`).join('');$('#detail-list').innerHTML=r.facts.map(([a,b])=>`<li><b>${a}</b><span>${b}</span></li>`).join('');root.querySelectorAll('[data-room]').forEach(b=>{b.classList.toggle('active',b.dataset.room===id);b.setAttribute('aria-pressed',b.dataset.room===id?'true':'false')});$('#camera-caption').textContent=`${r.num} / ${r.name}${id==='master'?' · 轴距330cm':''}`;$('#viewer').classList.toggle('focused',id!=='all')}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}
function openPlan(){$('#plan-dialog').showModal()}
$('#original-btn').onclick=openPlan;$('#original-lower').onclick=openPlan;$('#close-dialog').onclick=()=>$('#plan-dialog').close();$('#plan-dialog').addEventListener('click',e=>{if(e.target===$('#plan-dialog'))$('#plan-dialog').close()});
let state={theta:.16,phi:.71,span:17,cx:6.0,cz:5.55},goal={...state},topView=false,wallFull=false,night=false;let scene,renderer,camera,home,wallGroup,catGroup,humanGroup,ambient,sun,nightLights,highlight;
const labels=[],pickFloors=[],wallPieces=[],allMeshes=[];
let walkMode=false,layoutMode='original';
const layoutParts={};
const clearanceItems={};let clearanceGroup=null,clearanceEnabled=true;
let masterBedModel;
let privacyScreen,privacyCamera,privacyView=null,privacyEnabled=true;
let activeModel=false,dirty=true,vanityStool,vanityUseZone,vanityInUse=false;
function selectRoom(id){if(walkMode)exitWalk();if(privacyView)exitPrivacyView();selected=id;fillDetail(id);if(activeModel){goal.cx=rooms[id].center[0];goal.cz=rooms[id].center[1];goal.span=rooms[id].span;goal.phi=topView?.015:.66;goal.theta=topView?0:.12;updateFloorSelection();dirty=true}}
fillDetail('all');
try{init3D();activeModel=true;animate()}catch(e){console.error(e);$('#viewer').classList.add('no-webgl');['clearance-toggle','cat-toggle','human-toggle','vanity-toggle','privacy-toggle','wall-toggle','night-toggle','zoom-in','zoom-out','reset','capture','view2d','view3d'].forEach(id=>$('#'+id).disabled=true)}
function init3D(){
 const T=THREE;scene=new T.Scene();renderer=new T.WebGLRenderer({canvas:$('#scene'),antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 camera=new T.OrthographicCamera(-10,10,10,-10,.1,120);scene.add(camera);home=new T.Group();scene.add(home);wallGroup=new T.Group();home.add(wallGroup);catGroup=new T.Group();home.add(catGroup);humanGroup=new T.Group();home.add(humanGroup);catGroup.visible=false;humanGroup.visible=false;nightLights=new T.Group();home.add(nightLights);nightLights.visible=false;
 ambient=new T.HemisphereLight(0xfff9e9,0x9ba998,1.7);scene.add(ambient);sun=new T.DirectionalLight(0xfff0d2,2.15);sun.position.set(-4,18,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:.5,far:50});sun.shadow.normalBias=.04;sun.shadow.bias=-.0002;sun.target.position.set(6,0,5);scene.add(sun,sun.target);const fill=new T.DirectionalLight(0xe3ecfa,.8);fill.position.set(15,8,-10);scene.add(fill);
 function captureLayout(key,build){const previous=new Set(home.children);build();layoutParts[key]=home.children.filter(o=>!previous.has(o));}
 const mats=new Map();function mat(c,extra={}){const key=c+JSON.stringify(extra);if(!mats.has(key)){const {finishRole:role,...options}=extra;const m=new T.MeshStandardMaterial({color:c,roughness:.8,...options});m.userData.finishRole=role||(typeof finishRole==='function'?finishRole(c):'paint');mats.set(key,m);}return mats.get(key)}
 function box(x,y,z,w,h,d,c,parent=home,extra={}){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c,extra));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);allMeshes.push(m);return m}
 function cyl(x,y,z,r,h,c,parent=home,r2=r){const m=new T.Mesh(new T.CylinderGeometry(r,r2,h,32),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function ball(x,y,z,rx,ry,rz,c,parent=home){const m=new T.Mesh(new T.SphereGeometry(1,20,12),mat(c));m.position.set(x,y,z);m.scale.set(rx,ry,rz);m.castShadow=true;parent.add(m);return m}
 function line(points,c,r=.018,parent=home){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(curve,Math.max(16,points.length*8),r,8,false),mat(c));parent.add(m);return m}
 function local(x,z,rot=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;home.add(g);return g}
 function floor(x,z,w,d,c,id){const m=box(x,-.055,z,w,.12,d,c);m.material=m.material.clone();m.material.userData.finishRole=['baths','balcony','kitchen'].includes(id)?'stone':'woodFloor';m.userData={room:id,color:c};pickFloors.push(m);return m}
 // Plan coordinates: x follows the supplied 4.6 / 3.6 / 3.3 m segments; z follows drawing downward.
 floor(1.4,1.9,2.8,3.8,'#d5bf9e','guest');floor(3.7,1.0,1.8,2.0,'#cfcec0','baths');floor(3.7,2.6,1.8,1.2,'#d9c7a9','dining');floor(3.7,3.5,1.8,.6,'#d3d0c2','baths');floor(3.7,4.55,1.8,1.5,'#d8c5a6','dining');floor(6.4,1,3.6,2,'#d4d2c6','kitchen');floor(6.4,3.65,3.6,3.3,'#dac8a9','dining');floor(6.4,7.6,3.6,4.6,'#d8c3a2','living');floor(9.85,1.6,3.3,3.2,'#d5c09f','study');floor(9.85,4.25,3.3,2.1,'#c9cec2','baths');floor(9.85,7.6,3.3,4.6,'#d8c3a3','master');floor(6.3,10.9,3.4,2,'#cccdbd','balcony');
 // Subtle plank and tile joints preserve readable room boundaries.
 for(const m of pickFloors){const {width:w,depth:d}=m.geometry.parameters;const x=m.position.x,z=m.position.z,isTile=['baths','balcony','kitchen'].includes(m.userData.room);for(let xx=x-w/2+.22;xx<x+w/2;xx+=isTile?.6:.22)box(xx,.009,z,.007,.003,d-.03,isTile?'#bbbfb3':'#baa482').userData.naturalOnly=!isTile;for(let zz=z-d/2+.7;zz<z+d/2;zz+=isTile?.6:1.25)box(x,.009,zz,w-.03,.003,.006,isTile?'#bbbfb3':'#c5b08d').userData.naturalOnly=!isTile;}
 // Foundation pads follow the irregular footprint, not a fictitious rectangular home.
 box(5.75,-.23,1.9,11.68,.3,3.98,'#f5f2e7');box(7.15,-.23,4.55,8.88,.3,1.5,'#f5f2e7');box(8.05,-.23,7.6,7.08,.3,4.6,'#f5f2e7');box(6.3,-.23,10.9,3.58,.3,2.18,'#f5f2e7');
 function wall(x,z,w,d,h=2.7){const m=box(x,.53,z,w,1.06,d,'#efeee5',wallGroup);wallPieces.push({m,h});return m}
 // Exterior walls with explicit window openings; interior doors remain open passages.
 wall(.0,1.9,.18,3.8);wall(11.5,2,.18,4);wall(11.5,7.25,.18,5.3);wall(1.4,3.8,2.8,.18);wall(2.8,5.15,.18,.3);wall(3.7,5.3,1.8,.18);wall(4.6,7.6,.18,4.6);wall(4.6,10.9,.18,2);
 function win(x,z,w,along='x'){const g=new T.Group();home.add(g);g.position.set(x,0,z);if(along==='z')g.rotation.y=Math.PI/2;box(0,.43,0,w,.86,.16,'#edece2',g);box(0,1.7,0,w,1.55,.035,'#bfd2cc',g,{transparent:true,opacity:.25,depthWrite:false});for(const xx of [-w/2,0,w/2])box(xx,1.7,0,.035,1.6,.06,'#aeb8aa',g);box(0,.95,0,w+.12,.06,.25,'#eceadf',g);box(0,2.46,0,w,.04,.06,'#aeb8aa',g);return g}
 // Openings traced against the 11.5 m dimension chain (no invented clear-width extension).
 wall(.4,0,.8,.18);win(1.65,0,1.7);wall(3.08,0,1.16,.18);win(3.95,0,.58);wall(4.94,0,1.4,.18);win(6.25,0,1.22);wall(7.9,0,2.08,.18);win(9.85,0,1.82);wall(11.13,0,.74,.18);
 wall(8.7,9.9,1,.18);wall(11.3,9.9,.4,.18);win(6.3,11.9,3.4);win(8,11,1.8,'z');win(11.5,4.3,.6,'z');
 wall(2.8,1,.15,2);wall(2.8,3.4,.15,.8);wall(2.95,2,.3,.15);wall(4.25,2,.7,.15);wall(4.6,1,.18,2);wall(4.6,3.5,.18,.6);wall(3.7,3.8,1.8,.15);wall(8.2,1,.18,2);wall(8.2,4.1,.18,2.4);wall(8.2,8.1,.18,3.6);wall(9.85,3.2,3.3,.18).userData.suiteOriginal=true;wall(8.5,5.3,.6,.18).userData.suiteOriginal=true;wall(10.55,5.3,1.9,.18).userData.suiteOriginal=true;
 // Left WC opens south into the circulation strip below the shower.

 // Bay: open to the bedroom at z=9.9, solid sill and three glazed outer faces.
 const bay=local(10.15,10.2);bay.name='master-bay-window';
 box(0,.42,0,1.9,.84,.6,'#edece2',bay);box(0,.87,0,2,.06,.7,'#eceadf',bay);
 function bayGlass(x,z,w,rot=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;bay.add(g);box(0,1.7,0,w,1.55,.035,'#bfd2cc',g,{transparent:true,opacity:.25,depthWrite:false});for(const xx of [-w/2,w/2])box(xx,1.7,0,.035,1.6,.06,'#aeb8aa',g);for(const y of [.95,2.46])box(0,y,0,w,.04,.06,'#aeb8aa',g);}
 bayGlass(0,.3,1.9);bayGlass(-.95,0,.6,Math.PI/2);bayGlass(.95,0,.6,Math.PI/2);
 function acLedge(name,x,z,w,d){const g=local(x,z);g.name=name;box(0,-.02,0,w,.16,d,'#eceadf',g);for(const xx of [-w/2,w/2])box(xx,.23,0,.07,.5,d,'#efeee5',g);box(0,.23,z<0?-d/2:d/2,w,.5,.07,'#efeee5',g);}
 acLedge('ac-guest',3,-.45,1.18,.7);acLedge('ac-study',8.5,-.45,1.18,.7);acLedge('ac-master',8.65,10.3,1.18,.7);

 // Glazed kitchen separation and balcony boundary, kept in original locations.
 for(const x of [4.85,7.95])box(x,1.1,2,.4,2.2,.035,'#bccabd',home,{transparent:true,opacity:.23,depthWrite:false});box(6.4,.025,2,3.5,.04,.1,'#9eaa9b');box(6.4,.025,9.9,3.5,.04,.12,'#9eaa9b');
 function door(x,z,rot=0,w=.8){const g=local(x,z,rot);const leaf=box(w/2,1.02,0,w,2.04,.045,'#d7c4a8',g);g.rotation.y+=-.28;box(w-.08,1,0,.035,.035,.11,'#5f6759',g);const arc=[];for(let i=0;i<=20;i++){let a=i/20*Math.PI/2;arc.push([x+w*Math.cos(a),.025,z+w*Math.sin(a)])}line(arc,'#a4aa97',.008);return leaf}
 // Door arcs are floor hints; physical panels omitted in cutaway to avoid visually blocking rooms.
 function arc(x,z,angle,w=.8){const pts=[];for(let i=0;i<=24;i++){const a=angle+i/24*Math.PI/2;pts.push([x+Math.cos(a)*w,.028,z+Math.sin(a)*w])}line(pts,'#9da58e',.007)}
 // Door leaf strokes and quarter-circle swings, all measured approximately from raster.
 function planDoor(x,z,angle,w){arc(x,z,angle,w);const a=angle+Math.PI/2;line([[x,.028,z],[x+Math.cos(a)*w,.028,z+Math.sin(a)*w]],'#9da58e',.012);}
 planDoor(2.8,3,Math.PI,.95);captureLayout('studyArc',()=>planDoor(8.2,3,-Math.PI/2,.95));planDoor(8.2,5.5,0,.9);captureLayout('bathArc',()=>planDoor(8.8,5.3,-Math.PI/2,.8));planDoor(2.8,3.95,Math.PI/2,1.05);planDoor(3.1,2,-Math.PI/2,.8);planDoor(2.8,5.15,Math.PI,.3);

 function rug(x,z,w,d,c){box(x,.025,z,w,.025,d,c,home,{finishRole:'fabric'});for(let i=0;i<5;i++)box(x-w/2+.08+i*.025,.041,z,.008,.004,d-.12,'#d5cfba')}
 function cabinet(x,z,w,d,h,c='#c1a77f',rot=0){const g=local(x,z,rot);box(0,h/2,0,w,h,d,c,g,{finishRole:'cabinet'});box(0,h+.025,0,w+.025,.05,d+.025,'#e4dcc8',g,{finishRole:'stone'});let n=Math.ceil(w/.5);for(let i=1;i<n;i++)box(-w/2+w*i/n,h/2,-d/2-.006,.012,h-.08,.01,'#ac997a',g);for(let i=0;i<n;i++)box(-w/2+w*(i+.5)/n,h*.65,-d/2-.022,.09,.012,.03,'#687060',g).userData.naturalOnly=true;return g}
 function bed(x,z,w,len,rot,c){const g=local(x,z,rot);box(0,.17,0,w+.08,.26,len+.1,'#bca07e',g);box(0,.39,0,w,.23,len,'#f5f0df',g);box(0,.99,-len/2-.045,w+.16,1.2,.1,c,g).userData.furniturePart='headboard';box(0,.54,.22,w+.025,.08,len-.45,'#e2e1cd',g);for(const xx of [-w*.25,w*.25])box(xx,.58,-len/2+.35,w*.43,.13,.44,'#faf7e9',g);box(0,.59,.63,w+.04,.07,.48,c,g);return g}
 function bedside(x,z,c='#bca07e'){cyl(x,.26,z,.23,.48,c);cyl(x,.56,z,.065,.1,'#9a875e');cyl(x,.72,z,.14,.2,'#f3e6c7',home,.10)}
 // MASTER LAYOUT START. Interior faces x=8.29..11.41: user-assumed 3.30 m clear width.
 function compactBed(x,z){const g=local(x,z,Math.PI/2);g.name='master-bed-head-west';box(0,.17,-.005,1.84,.26,2.03,'#bca07e',g);box(0,.39,0,1.8,.23,2,'#f5f0df',g);box(0,.84,-1.025,1.88,.95,.03,'#9da48d',g).userData.furniturePart='headboard';box(0,.54,.23,1.82,.08,1.5,'#e2e1cd',g);for(const xx of [-.45,.45])box(xx,.58,-.65,.76,.13,.44,'#faf7e9',g);box(0,.59,.65,1.82,.07,.45,'#9da48d',g);return g}
 function lWardrobe(){
  const g=local(0,0);g.name='master-L-wardrobe';
  // Two touching volumes form the L; the 600 mm corner is counted only once.
  box(10.49,1.175,5.72,.98,2.35,.6,'#c1a77f',g);
  box(11.28,1.175,5.885,.6,2.35,.93,'#c1a77f',g);
  for(const x of [10.25,10.73])box(x,1.18,6.017,.46,2.25,.006,'#e4dcc8',g);
  box(10.983,1.18,6.185,.006,2.25,.3,'#e4dcc8',g);
  // The return remains continuous above the recessed vanity.
  box(11.43,2.15,6.7,.3,.4,.7,'#c1a77f',g);
  box(11.283,2.15,6.7,.006,.36,.66,'#e4dcc8',g);
  g.position.x=-.18;return g;
 }
 const masterBed=compactBed(9.34,8.25);masterBedModel=masterBed;clearanceItems.masterBed=masterBed;
 const masterWardrobe=lWardrobe();
 rug(9.65,8.25,2.5,2.7,'#c5c9b3');box(8.34,1.48,7.45,.07,.2,.14,'#65705e');bedside(8.75,9.52);
 function createMasterVanity(){
  const g=local(0,0);g.name='master-vanity';
  box(11.355,.735,6.7,.45,.03,.7,'#e4dcc8',g);
  box(11.36,.69,6.7,.42,.06,.66,'#c1a77f',g);
  box(11.14,.69,6.7,.018,.055,.64,'#bb9f77',g);
  box(11.355,.36,7.04,.45,.72,.02,'#c1a77f',g);
  box(11.565,.37,6.7,.025,.7,.66,'#c1a77f',g);
  box(11.56,1.31,6.7,.025,.88,.54,'#65705e',g);
  box(11.54,1.31,6.7,.012,.83,.49,'#b8c8bc',g,{metalness:.65,roughness:.18});
  for(const z of [6.405,6.995])box(11.52,1.31,z,.025,.75,.018,'#f3e6c7',g,{emissive:'#ffe1ad',emissiveIntensity:.35});
  box(11.47,.79,6.46,.1,.08,.13,'#65705e',g);
  const stool=local(11.16,6.7);stool.name='vanity-stool';
  cyl(0,.42,0,.16,.08,'#9da48d',stool);
  for(const x of [-.095,.095])for(const z of [-.095,.095])box(x,.19,z,.025,.38,.025,'#687060',stool);
  g.position.x=-.18;return {furniture:g,stool};
 }
 function createPrivacyScreen(){
  const g=local(0,0);g.name='master-screen-console';
  // A continuous light-coloured infill obscures views; the divisions are framing, not open slats.
  const infill=box(8.765,1.02,6.38,.88,1.86,.025,'#f1e6cf',g);infill.name='screen-privacy-infill';
  for(const x of [8.3075,9.2225])box(x,1,6.38,.035,2,.08,'#65705e',g);
  for(const y of [.035,1.9825])box(8.765,y,6.38,.95,.035,.08,'#65705e',g);
  for(const x of [8.61,8.92])box(x,1.02,6.36,.012,1.86,.016,'#c1a77f',g);
  box(8.765,.58,6.36,.88,.018,.018,'#c1a77f',g);
  // Narrow console faces the bedroom and stays outside the entry's reserved door sweep.
  const top=box(8.765,.7825,6.54,.86,.035,.24,'#e4dcc8',g);top.name='screen-console-top';
  for(const x of [8.365,9.165])for(const z of [6.45,6.63])box(x,.38,z,.025,.76,.025,'#687060',g);
  box(8.765,.62,6.45,.82,.025,.025,'#687060',g);
  return g;
 }
 privacyScreen=createPrivacyScreen();clearanceItems.screen=privacyScreen;
 const masterVanity=createMasterVanity();vanityStool=masterVanity.stool;
 vanityUseZone=box(10.55,.036,6.7,.78,.008,.62,'#ba946c',home,{transparent:true,opacity:.2,depthWrite:false});vanityUseZone.visible=false;
 line([[8.29,.055,9.69],[11.41,.055,9.69]],'#65705e',.009);
 for(const x of [8.29,11.41])line([[x,.055,9.6],[x,.055,9.78]],'#65705e',.009);
 addLabel('master','轴距 330 cm · 净宽约312 cm',[9.6,.1,9.69]);
 addLabel('master','屏风＋窄桌 · 桌深 24 cm',[8.765,2.08,6.38]);
 addLabel('master','转角净距 ≈ 66 cm · 路径不足80 cm',[9.65,.08,6.2]);
 addLabel('master','L 形衣柜',[10.5,2.42,5.65]);
 addLabel('master','内嵌梳妆位',[11.18,.85,6.7]);
 // MASTER LAYOUT END
 // Guest room keeps a proper bed and enclosed storage.
 rug(1.3,1.65,2.25,2.1,'#d1cebd');clearanceItems.guestBed=bed(1.0,1.3,1.35,2,0,'#c6ab8c');clearanceItems.guestWardrobe=cabinet(1.27,3.4,2.3,.6,2.15,'#c5ac86',Math.PI);cabinet(2.45,2.8,.4,.7,.73,'#c2a77e',Math.PI/2);
 function desk(x,z,w,d,rot=0){const g=local(x,z,rot);box(0,.75,0,w,.065,d,'#c5a87d',g);for(const xx of [-w/2+.08,w/2-.08])for(const zz of [-d/2+.06,d/2-.06])box(xx,.37,zz,.045,.74,.045,'#666f60',g);return g}
 function chair(x,z,rot=0,c='#7e8a74'){const g=local(x,z,rot);box(0,.45,0,.44,.11,.43,c,g);box(0,.72,.2,.44,.5,.07,c,g).userData.furniturePart='back';for(let xx of [-.16,.16])for(let zz of [-.16,.16])box(xx,.22,zz,.035,.44,.035,'#a28c68',g);return g}
 desk(9.85,.57,2.6,.65);for(const x of [9.2,10.5]){box(x,1.12,.48,.62,.4,.045,'#35443e');box(x,1.12,.507,.57,.35,.006,'#9fb8ae');box(x,.86,.48,.035,.16,.04,'#5e665d');box(x,.8,.49,.23,.025,.14,'#5e665d');box(x,.795,.75,.42,.015,.13,'#ecece1');clearanceItems.studyChair=chair(x,1.38,0,'#7d8b76');cyl(x+.4,.79,.65,.04,.06,'#c3b9a4')}
 // Thin side shelves and books.
 cabinet(11.22,1.85,1.9,.3,1.7,'#c4aa83',Math.PI/2);for(let j=0;j<2;j++)for(let i=0;i<7;i++)box(11.02,1.76+j*.2,1.15+i*.19,.12,.16,.06,['#a9b09a','#d3b28b','#e9e3cf'][i%3]);
 rug(6.38,7.7,2.7,3.0,'#d7d5c1');
 // Sofa, facing the right-side television wall.
 const sofa=local(5.25,7.65,Math.PI/2);box(0,.25,0,2.1,.3,.85,'#cacdb8',sofa);box(0,.72,-.34,2.1,.7,.18,'#dadcc8',sofa).userData.furniturePart='back';for(let x of [-.99,.99])box(x,.52,0,.17,.62,.83,'#dedfcc',sofa);for(let x of [-.48,0,.48])box(x,.44,.01,.47,.13,.63,'#e8e8d5',sofa);box(-.6,.65,-.14,.37,.37,.17,'#8e9d82',sofa).rotation.z=.14;box(.62,.65,-.14,.33,.33,.16,'#bd956e',sofa).rotation.z=-.17;
 clearanceItems.sofa=sofa;
 const coffee=local(6.45,7.8);box(0,.36,0,.45,.055,.8,'#aa8c63',coffee).userData.furniturePart='top';for(let z of [-.26,.26])box(0,.18,z,.2,.35,.07,'#aa8c63',coffee).userData.furniturePart='leg';cyl(6.45,.41,7.75,.08,.03,'#eee3c9');box(6.45,.405,8.02,.2,.025,.15,'#89987e');
 clearanceItems.coffee=coffee;clearanceItems.tv=cabinet(7.9,7.9,2.15,.3,.42,'#bda078',Math.PI/2);box(8.07,1.28,7.9,.06,.83,1.45,'#2d3f37');box(8.03,1.28,7.9,.012,.74,1.36,'#728c7c');
 // Side reading chair, lamp, and art.
 chair(6.35,6.05,Math.PI*.85,'#a0aa90');cyl(5.05,.04,6.15,.21,.06,'#65705e');cyl(5.05,.85,6.15,.023,1.65,'#65705e');cyl(5.05,1.68,6.15,.25,.24,'#f1e6cf',home,.18).userData.furniturePart='shade';box(4.72,1.65,7.5,.04,.68,.65,'#ac9270');box(4.745,1.65,7.5,.02,.58,.55,'#e6dbc0').userData.furniturePart='headboard';
 // Dining: long axis runs down the drawing, leaving side passages.
 captureLayout('dining',()=>{
 desk(6.4,3.27,.75,1.3);for(const z of [2.87,3.68]){chair(5.85,z,-Math.PI/2,'#b4bba1');clearanceItems.diningChair=chair(6.95,z,Math.PI/2,'#b4bba1')}cyl(6.4,.88,3.28,.075,.18,'#b8a482');line([[6.4,.97,3.28],[6.42,1.15,3.25]],'#788567',.008);ball(6.46,1.13,3.25,.09,.025,.04,'#8b9675');
 });
 cabinet(4.32,4.5,1.25,.35,1.5,'#bea37c',Math.PI/2);box(2.87,.045,4.8,.3,.06,.4,'#3d4740');box(2.86,1.12,4.45,.04,.55,.4,'#c4d1bf',home, {metalness:.3});
 // Kitchen L: wash on upper side, prepare in the middle, cook at right.
 cabinet(6.35,.43,2.75,.6,.85,'#809178');cabinet(7.77,1.13,1.35,.6,.85,'#809178',Math.PI/2);box(6.35,.9,.43,2.8,.055,.64,'#efeddf');clearanceItems.kitchenTop=box(7.77,.9,1.12,.64,.055,1.35,'#efeddf');box(6.35,.935,.43,.65,.025,.43,'#8a9b91');box(6.35,.95,.43,.54,.01,.34,'#bdc9bf');line([[6.55,.95,.27],[6.55,1.18,.27],[6.43,1.18,.27],[6.43,1.08,.27]],'#7b897d',.018);box(7.77,.94,1.2,.48,.025,.62,'#45524a');for(const z of [1.03,1.37]){cyl(7.77,.96,z,.105,.015,'#899586');cyl(7.77,.971,z,.075,.01,'#343f38')}
 clearanceItems.fridge=box(5.02,1.01,1.25,.68,2.02,.64,'#b7bdb0');box(5.02,1.34,1.579,.62,1.24,.015,'#c9cec2');box(5.02,.36,1.579,.62,.65,.015,'#c4c9be');box(5.25,1.4,1.6,.025,.36,.03,'#697969');box(5.7,.53,.752,.59,.64,.02,'#b8c1b4');box(5.7,.78,.772,.46,.035,.02,'#657560');box(7.8,1.85,1.18,.55,.22,.75,'#b3bbac');
 function toilet(x,z,rot=0){const g=local(x,z,rot);box(0,.57,-.16,.38,.7,.19,'#f6f5ec',g);ball(0,.3,.04,.21,.28,.28,'#f4f3e9',g);ball(0,.54,.04,.19,.035,.25,'#d2d9ce',g);ball(0,.56,.04,.14,.01,.19,'#9da99c',g)}
 function basin(x,z,w=.8,rot=0){const g=cabinet(x,z,w,.48,.65,'#b8bfa9',rot);box(0,.74,0,w+.03,.14,.49,'#efeee3',g);ball(0,.817,0,w*.27,.014,.16,'#b1bcae',g);box(0,.95,-.18,.035,.25,.035,'#7b8b7e',g);box(0,1.35,-.26,w*.8,.7,.035,'#c0cdbf',g,{metalness:.35,roughness:.15});return g}
 function shower(x,z,w,d){box(x,.04,z,w,.055,d,'#d0d4c9');box(x-w/2,1.15,z,.022,2.2,d,'#b5c9bb',home,{transparent:true,opacity:.18,depthWrite:false});box(x,1.15,z+d/2,w,2.2,.02,'#b5c9bb',home,{transparent:true,opacity:.18,depthWrite:false});box(x+w/2-.06,1.2,z,.04,1.55,.04,'#6e7e70');cyl(x+w/2-.18,2.02,z,.12,.03,'#708273');box(x,.075,z,.08,.01,.08,'#879784')}
 captureLayout('bath',()=>{basin(8.9,3.58,.95);toilet(10.06,3.7);shower(10.92,4.0,.94,1.25);});toilet(4.2,1.53,Math.PI/2);shower(3.55,.62,1.12,1.0);basin(3.3,3.46,.7,Math.PI);box(4.12,.43,3.45,.58,.85,.53,'#d9ddd2');box(4.12,.55,3.17,.43,.5,.015,'#adb9aa');
 // Balcony washing station and separate cat zone.
 box(4.99,.48,10.7,.68,.94,.7,'#e6e7dc');box(4.99,1.41,10.7,.68,.9,.7,'#e2e5d9');for(const y of [.51,1.44]){const m=cyl(4.99,y,11.061,.21,.025,'#657a6b');m.rotation.x=Math.PI/2;const glass=cyl(4.99,y,11.079,.15,.026,'#9bb0a0');glass.rotation.x=Math.PI/2}box(5.01,2.0,10.7,.78,.19,.75,'#b8a37f');rug(6.45,11.25,.85,.6,'#b1b99e');cyl(6.5,.17,11.3,.28,.22,'#bea483');
 // Sculptural greenery only; final species needs cat-safety checking.
 function plant(x,z,s=1){cyl(x,.2*s,z,.18*s,.35*s,'#bbac8d',home,.14*s);for(let i=0;i<7;i++){const a=i*2.4;line([[x,.35*s,z],[x+Math.sin(a)*.12*s,.8*s,z+Math.cos(a)*.12*s]],'#859477',.009*s);const leaf=ball(x+Math.sin(a)*.17*s,.78*s,z+Math.cos(a)*.17*s,.06*s,.18*s,.045*s,['#879a77','#a0ad8c','#708769'][i%3]);leaf.rotation.z=Math.sin(a)*.6}}plant(7.75,9.35,1.1);plant(11.0,2.76,.75);plant(6.95,.42,.35);
 // Cat climbing wall: open modules, two descent directions, no enclosed litter furniture.
 const steps=[[4.94,9.3,.28],[4.91,8.95,.64],[4.89,8.5,1.2],[4.88,7.94,1.55],[4.89,7.38,1.9],[4.89,6.85,1.55],[5.02,6.5,1.05]];for(const [x,z,h] of steps)box(x,h,z,.48,.055,.39,'#b89a70');cyl(4.98,.43,9.0,.055,.8,'#b5aa87');cyl(5.0,.56,6.5,.06,1.08,'#c5b58d');
 function cat(x,y,z,c,rot=0){const g=local(x,z,rot);g.position.y=y;ball(0,.12,0,.12,.12,.22,c,g);ball(0,.28,-.15,.11,.11,.10,c,g);for(const xx of [-.065,.065]){const ear=new T.Mesh(new T.ConeGeometry(.05,.1,3),mat(c));ear.position.set(xx,.39,-.16);g.add(ear)}line([[0,.12,.17],[.12,.16,.25],[.18,.3,.25]],c,.025,g);return g}cat(4.89,1.93,7.38,'#c58b5b');cat(6.45,.3,11.25,'#62715b',.5);
 function litter(x,z,rot=0){const g=local(x,z,rot);box(0,.08,0,.65,.13,.45,'#b6ad95',g);box(0,.15,0,.57,.015,.37,'#d8c7a6',g);for(const zz of [-.225,.225])box(0,.19,zz,.65,.15,.025,'#b6ad95',g);for(const xx of [-.325,.325])box(xx,.19,0,.025,.15,.45,'#b6ad95',g);rug(x,z,.85,.65,'#c5c6ae')}
 litter(7.65,11.4,Math.PI/2);litter(2.2,.55,Math.PI/2);captureLayout('bathLitter',()=>litter(10.1,4.82));
 function bowl(x,z,c='#bdad87'){cyl(x,.06,z,.105,.08,c);cyl(x,.105,z,.08,.015,'#777a62')};bowl(7.55,6.1);bowl(8.64,1.0);bowl(7.45,9.2,'#91a899');bowl(10.7,2.75,'#91a899');
 // The overlay distinguishes ground access routes from the climbing route.
 function route(points,c,parent,r=.022){line(points,c,r,parent);for(let i=1;i<points.length;i++){const a=new T.Vector3(...points[i-1]),b=new T.Vector3(...points[i]),v=b.clone().sub(a);if(v.length()<.3)continue;const arrow=new T.ArrowHelper(v.clone().normalize(),a.clone().lerp(b,.56),.27,c,.12,.08);parent.add(arrow)}}
 route([[3.65,.07,5.5],[3.9,.07,4.75],[5.0,.07,4.65],[6.35,.07,4.65],[6.45,.07,5.55],[7.15,.07,6.3],[7.15,.07,8.9],[6.4,.07,10.1],[6.4,.07,10.8]],'#557b68',humanGroup,.025);
 route([[5.05,.07,4.65],[5.05,.07,2.25],[6.4,.07,2.25],[6.4,.07,1.5]],'#557b68',humanGroup,.023);route([[6.45,.07,4.65],[7.65,.07,4.65],[7.65,.07,2.5],[8.65,.07,2.5],[9.6,.07,1.8]],'#557b68',humanGroup);route([[6.45,.07,5.55],[7.65,.07,5.55],[8.7,.07,5.8],[9.45,.07,5.8],[9.66,.07,6.27],[9.64,.07,6.5],[9.6,.07,6.75],[10.65,.07,6.95],[10.9,.07,7.4],[10.9,.07,8.0]],'#557b68',humanGroup);route([[8.7,.07,5.72],[9.4,.07,5.72],[9.4,.07,5.3],[9.4,.07,4.65]],'#557b68',humanGroup);route([[5.05,.07,2.25],[3.6,.07,2.5],[2.5,.07,2.5],[2.15,.07,2.7]],'#557b68',humanGroup);
 route([[7.62,.09,11.1],[6.5,.09,10.3],[5.4,.09,9.55],[4.94,.36,9.3],[4.91,.73,8.95],[4.89,1.29,8.5],[4.88,1.64,7.94],[4.89,1.99,7.38],[4.89,1.64,6.85],[5.02,1.14,6.5],[5.4,.09,6.3]],'#c27c4a',catGroup,.025);
 for(const [x,z,n] of [[7.65,11.4,'砂 ①'],[2.2,.55,'砂 ②'],[10.1,4.82,'砂 ③'],[7.55,6.1,'食 A'],[8.64,1,'食 B'],[7.45,9.2,'水'],[10.7,2.75,'水']]){const ring=new T.Mesh(new T.TorusGeometry(.29,.018,8,40),mat('#bb7647'));ring.rotation.x=Math.PI/2;ring.position.set(x,.07,z);catGroup.add(ring);addLabel('cat-'+n,n,[x,.55,z],true)}
 // Warm pools of light, intentionally approximate mood lighting.
 for(const [x,z] of [[6.4,3.3],[5.05,6.15],[10.95,6.6],[10.95,9.1],[9.85,.6],[6.35,.8]]){const l=new T.PointLight(0xffd59a,3,5,2);l.position.set(x,2.1,z);nightLights.add(l)}
 const ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.13}));ground.rotation.x=-Math.PI/2;ground.position.y=-.4;ground.receiveShadow=true;scene.add(ground);
 for(const [id,point] of Object.entries({guest:[1.5,.7,2.5],kitchen:[6.4,.8,1.4],study:[9.85,.7,2.25],dining:[6.4,.6,4.55],baths:[9.55,.65,4.5],master:[9.75,.8,8.8],living:[6.65,.7,8.7],balcony:[6.4,.5,11.5]})){addLabel(id,({guest:'卧室',study:'（规划局）卧室',master:'主卧',baths:'卫生间'}[id]||rooms[id].name.replace(/ · .*/,'')),point)}
 addLabel('baths','卫生间 · 左卫',[3.8,.8,.7]);addLabel('master','飘窗',[10.15,.9,10.3]);
 setupInput();resize();new ResizeObserver(resize).observe($('#viewer'));designAPI={rooms,scene,renderer,camera,selectRoom,state,goal,labels,pickFloors};
}
function addLabel(id,text,point,cat=false){const b=document.createElement('button');b.className='room-label';b.textContent=text;b.title=cat?'猫咪资源预留位置':`查看${text}设计`;if(!cat){b.dataset.room=id;b.onclick=e=>{e.stopPropagation();selectRoom(id)}}else b.onclick=()=>toast('猫咪资源位置需结合日常开门习惯与实际使用调整');$('#labels').appendChild(b);labels.push({id,el:b,p:new THREE.Vector3(...point),cat})}
function resize(){if(!renderer)return;const rect=$('#viewer').getBoundingClientRect();if(!componentActive||!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;dirty=true}
function updateCamera(){if(walkMode){updateWalkCamera();return}if(privacyView){updatePrivacyCamera();return}const aspect=camera.aspect||1;let vertical=aspect<.8?state.span*1.4:Math.max(state.span*.8,state.span/aspect);camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();const distance=25,px=Math.sin(state.phi)*Math.sin(state.theta)*distance,pz=Math.sin(state.phi)*Math.cos(state.theta)*distance;camera.position.set(state.cx+px,Math.cos(state.phi)*distance,state.cz+pz);camera.up.set(0,1,0);camera.lookAt(state.cx,0,state.cz)}
// Measure the rendered box, including CSS transforms and any label-container offset.
function positionLabelWithinViewer(el,rect,x,y){
 el.style.left=x+'px';el.style.top=y+'px';
 const box=el.getBoundingClientRect(),margin=8;
 if(!box.width||!box.height)return null;
 if(box.width>rect.width-2*margin||box.height>rect.height-2*margin){el.style.display='none';return null}
 const left=Math.max(margin,Math.min(rect.width-box.width-margin,box.left-rect.left));
 const top=Math.max(margin,Math.min(rect.height-box.height-margin,box.top-rect.top));
 el.style.left=(x+left-(box.left-rect.left))+'px';
 el.style.top=(y+top-(box.top-rect.top))+'px';
 return {left,top,width:box.width,height:box.height};
}
function labelAnchorVisible(point,projected){
 return point.clone().applyMatrix4(camera.matrixWorldInverse).z<0&&
  [projected.x,projected.y,projected.z].every(Number.isFinite)&&
  Math.abs(projected.x)<=1.5&&Math.abs(projected.y)<=1.5&&Math.abs(projected.z)<=1;
}
function animate(now=0){if(!componentActive)return;frame=requestAnimationFrame(animate);let moving=walkMode?tickWalk(now):false;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;for(const k of Object.keys(state)){const diff=goal[k]-state[k];if(Math.abs(diff)>.00015){state[k]+=diff*(reduced?1:.12);moving=true}}if(dirty||moving){updateCamera();if(clearanceGroup)updateClearances();renderer.render(scene,camera);}const rect=$('#viewer').getBoundingClientRect();for(const l of labels){const p=l.p.clone().project(camera);l.el.style.display=(l.clearance&&!clearanceVisible(l))||(l.detailRoom&&selected!==l.detailRoom)||(l.layout&&l.layout!==layoutMode)||walkMode||privacyView||(l.cat&&!catGroup.visible)||!labelAnchorVisible(l.p,p)||(l.el.textContent.startsWith('屏风＋窄桌')&&!privacyEnabled)?'none':'';if(l.el.style.display!=='none')positionLabelWithinViewer(l.el,rect,(p.x*.5+.5)*rect.width,(-p.y*.5+.5)*rect.height);l.el.style.opacity=l.cat?'1':selected!=='all'&&l.el.dataset.room!==selected?'.25':'1'}positionClearanceLabels(rect);dirty=false}
function setupInput(){const canvas=$('#scene'),pointers=new Map();let last=null,down=null,pinch=0,mid=null;clearOrbitInput=()=>{for(const id of pointers.keys())if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);pointers.clear();last=null;down=null;pinch=0;mid=null};
 // Rebase both gestures whenever the active pointer set changes.
 function resetGesture(){last=pointers.size===1?[...pointers.values()][0]:null;pinch=0;mid=null;if(pointers.size===2){const [a,b]=[...pointers.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1]);mid=[(a[0]+b[0])/2,(a[1]+b[1])/2]}}
 canvas.addEventListener('pointerdown',e=>{if(privacyView||walkMode)return;pointers.set(e.pointerId,[e.clientX,e.clientY]);canvas.setPointerCapture(e.pointerId);resetGesture();down={x:e.clientX,y:e.clientY,time:Date.now(),multi:pointers.size>1}});canvas.addEventListener('pointermove',e=>{if(walkMode||privacyView)return;if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,[e.clientX,e.clientY]);if(pointers.size===2){const a=[...pointers.values()],d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);const nextMid=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2];if(mid){goal.cx-=(nextMid[0]-mid[0])*.012;goal.cz-=(nextMid[1]-mid[1])*.012}mid=nextMid;if(pinch&&d)goal.span=Math.max(4,Math.min(24,goal.span*pinch/d));pinch=d;if(down)down.multi=true;return}if(pointers.size!==1)return;if(last){const dx=e.clientX-last[0],dy=e.clientY-last[1];if(topView||e.shiftKey||e.buttons===2){goal.cx-=dx*.012;goal.cz-=dy*.012}else{goal.theta-=dx*.007;goal.phi=Math.max(.15,Math.min(1.25,goal.phi+dy*.006))}last=[e.clientX,e.clientY]}});canvas.addEventListener('pointerup',e=>{if(walkMode||privacyView){pointers.clear();resetGesture();down=null;return}if(down&&!down.multi&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5&&Date.now()-down.time<500){const r=canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hits=ray.intersectObjects(pickFloors);if(hits.length)selectRoom(hits[0].object.userData.room)}pointers.delete(e.pointerId);resetGesture();down=null});canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);resetGesture();down=null});canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('wheel',e=>{e.preventDefault();if(privacyView||walkMode)return;goal.span=Math.max(4,Math.min(24,goal.span*Math.exp(e.deltaY*.001)))},{passive:false});canvas.addEventListener('keydown',e=>{if(walkMode||privacyView)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','=','Home'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft')goal.theta-=.12;if(e.key==='ArrowRight')goal.theta+=.12;if(e.key==='ArrowUp')goal.phi=Math.max(.015,goal.phi-.09);if(e.key==='ArrowDown')goal.phi=Math.min(1.25,goal.phi+.09);if(e.key==='+'||e.key==='=')goal.span=Math.max(4,goal.span*.85);if(e.key==='-')goal.span=Math.min(24,goal.span*1.15);if(e.key==='Home')reset()});
 $('#view3d').onclick=()=>view(false);$('#view2d').onclick=()=>view(true);$('#zoom-in').onclick=()=>goal.span=Math.max(4,goal.span*.82);$('#zoom-out').onclick=()=>goal.span=Math.min(24,goal.span*1.22);$('#reset').onclick=reset;
 $('#vanity-toggle').onclick=()=>{setVanityUse(!vanityInUse);selectRoom('master');if(vanityInUse)toast('浅色区域为梳妆使用预留；L形短边包含梳妆位，不全部计为挂衣容量')};
 $('#cat-toggle').onclick=()=>{catGroup.visible=!catGroup.visible;$('#cat-toggle').setAttribute('aria-pressed',catGroup.visible);dirty=true;if(catGroup.visible)toast('橙线为客厅—阳台猫咪活动示意，圆环标出三处砂盆与分散食水点')};$('#human-toggle').onclick=()=>{humanGroup.visible=!humanGroup.visible;$('#human-toggle').setAttribute('aria-pressed',humanGroup.visible);dirty=true};$('#wall-toggle').onclick=()=>{wallFull=!wallFull;setWalls();$('#wall-toggle').setAttribute('aria-pressed',wallFull);$('#wall-toggle').textContent=wallFull?'降低墙体':'完整墙高';dirty=true};$('#night-toggle').onclick=()=>{night=!night;setNight();dirty=true};$('#capture').onclick=capture;
}
function setWalls(){for(const {m,h} of wallPieces){const height=wallFull?h:Math.min(h,1.06);m.scale.y=height/1.06;m.position.y=height/2}}
function setNight(){$('#night-toggle').setAttribute('aria-pressed',night);$('#night-toggle').textContent=night?'日间采光':'夜间氛围';$('#viewer').classList.toggle('night',night);ambient.intensity=night?.65:1.7;sun.intensity=night?.25:2.15;nightLights.visible=night;renderer.toneMappingExposure=night?1.4:1.05;syncModernLighting()}
function view(isTop){if(walkMode)exitWalk();if(privacyView)exitPrivacyView();topView=isTop;goal.phi=isTop?.015:.71;goal.theta=isTop?0:.16;$('#view2d').classList.toggle('active',isTop);$('#view3d').classList.toggle('active',!isTop);$('#view2d').setAttribute('aria-pressed',isTop);$('#view3d').setAttribute('aria-pressed',!isTop);$('#interaction-hint').textContent=isTop?'俯视沿用原图方向 · 单指/双指拖动平移 · 滚轮/捏合缩放 · 点击房间查看方案':'拖动旋转 · 双指平移 · 滚轮/捏合缩放 · 点击房间查看方案';syncModernLighting();dirty=true}
function setVanityUse(value){vanityInUse=value;vanityStool.position.x=value?10.60:11.16;vanityUseZone.visible=value;$('#vanity-toggle').setAttribute('aria-pressed',String(value));$('#vanity-toggle').textContent=value?'收起梳妆凳':'拉出梳妆凳';dirty=true}
function reset(){if(walkMode)exitWalk();if(privacyView)exitPrivacyView();setPrivacyEnabled(true);setVanityUse(false);selected='all';view(false);wallFull=false;setWalls();night=false;setNight();catGroup.visible=false;humanGroup.visible=false;for(const id of ['cat-toggle','human-toggle','wall-toggle'])$('#'+id).setAttribute('aria-pressed','false');$('#wall-toggle').textContent='完整墙高';selectRoom('all');goal.theta=.16;goal.phi=.71;goal.span=17;dirty=true}
function capture(){renderer.render(scene,camera);const out=document.createElement('canvas'),source=renderer.domElement;out.width=source.width;out.height=source.height+90;const c=out.getContext('2d');c.fillStyle=night?'#354139':currentStyle==='modern'?'#e8ebea':'#efeee5';c.fillRect(0,0,out.width,out.height);c.drawImage(source,0,0);c.fillStyle=night?'#f7f3df':'#365c4b';c.font='24px sans-serif';c.fillText('住前笔记 · '+styleNames[currentStyle]+' · '+rooms[selected].name,35,out.height-48);c.font='15px sans-serif';c.fillText('为沙耶设计 / 概念模型 · 尺寸与结构待现场核实',35,out.height-22);const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download='我的家-'+styleNames[currentStyle]+'-'+rooms[selected].name.replaceAll(' · ','-')+'.png';a.click();toast('已生成当前视角 PNG')}

let printDetails=[];window.addEventListener('beforeprint',()=>{if(!componentActive)return;printDetails=[...root.querySelectorAll('details')].map(d=>[d,d.open]);printDetails.forEach(([d])=>d.open=true)});window.addEventListener('afterprint',()=>{printDetails.forEach(([d,open])=>d.open=open);printDetails=[]});

setupStyles();

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
 root.querySelectorAll('[data-privacy-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.privacyView===id)));
 $('#camera-caption').textContent='视线对比 / '+privacyViews[id].name;
 $('#interaction-hint').textContent='真实透视 · 原墙完整高度 · 点击“看主卧布局”返回旋转';
 if(modernCeiling)modernCeiling.visible=false;
 updatePrivacyCamera();refreshPrivacyStatus();dirty=true;
}
function exitPrivacyView(){
 if(!privacyView)return;
 camera=orbitCamera;privacyView=null;wallFull=savedWallFull;setWalls();$('#wall-toggle').disabled=false;$('#wall-toggle').textContent=wallFull?'降低墙体':'完整墙高';$('#wall-toggle').setAttribute('aria-pressed',String(wallFull));for(const [key,on] of [['view3d',!topView],['view2d',topView]]){$('#'+key).classList.toggle('active',on);$('#'+key).setAttribute('aria-pressed',String(on))}
 $('#viewer').classList.remove('eye-view');root.querySelectorAll('[data-privacy-view]').forEach(b=>b.setAttribute('aria-pressed','false'));
 syncModernLighting();fillDetail(selected);refreshPrivacyStatus();dirty=true;
}
function setPrivacyEnabled(enabled){privacyEnabled=enabled;if(privacyScreen)privacyScreen.visible=enabled;refreshPrivacyStatus();dirty=true}
if(activeModel){
 $('#privacy-toggle').onclick=()=>setPrivacyEnabled(!privacyEnabled);
 $('#privacy-orbit').onclick=()=>{exitPrivacyView();view(false);selectRoom('master');goal.theta=.62;goal.phi=.86;goal.span=7.3;goal.cz=7.5;$('#viewer').scrollIntoView({block:'center',behavior:'smooth'})};
 root.querySelectorAll('[data-privacy-view]').forEach(b=>b.onclick=()=>enterPrivacyView(b.dataset.privacyView));

 designAPI.privacy={views:privacyViews,visibility:privacyVisibility,screen:privacyScreen};
}else root.querySelectorAll('.privacy-actions button').forEach(b=>b.disabled=true);
refreshPrivacyStatus();

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
function clearWalkInput(){walkKeys.clear();walkTouches.clear();walkDrag=null;walk.lastTime=0;root.querySelectorAll('[data-walk-move]').forEach(b=>b.classList.remove('held'))}
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
 $('#scene').setAttribute('aria-label','住宅交互3D模型：拖动旋转（俯视时平移），双指平移，滚轮或捏合缩放，方向键旋转，Home复位。');
 $('#interaction-hint').textContent=topView?'俯视沿用原图方向 · 单指/双指拖动平移 · 滚轮/捏合缩放 · 点击房间查看方案':'拖动旋转 · 双指平移 · 滚轮/捏合缩放 · 点击房间查看方案';
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
 root.addEventListener('keydown',e=>{
  if(!componentActive||!walkMode)return;if(e.code==='Escape'&&!root.querySelector('dialog[open]')){exitWalk();return}
  if(e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,select,textarea,dialog,button'))return;
  if(codes.includes(e.code)){e.preventDefault();walkKeys.add(e.code)}
 });
 root.addEventListener('keyup',e=>walkKeys.delete(e.code));window.addEventListener('blur',clearWalkInput);
 root.addEventListener('visibilitychange',clearWalkInput);
 root.addEventListener('focusin',e=>{if(e.target!==canvas)clearWalkInput()});
 for(const b of root.querySelectorAll('[data-walk-move]')){
  b.addEventListener('pointerdown',e=>{if(!walkMode)return;e.preventDefault();b.setPointerCapture(e.pointerId);walkTouches.set(e.pointerId,b.dataset.walkMove);b.classList.add('held')});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{walkTouches.delete(e.pointerId);b.classList.remove('held')});
  // Keyboard and assistive-technology clicks take one small step; pointer holds use the frame loop.
  b.addEventListener('click',e=>{if(walkMode&&e.detail===0){walkTouches.set('keyboard',b.dataset.walkMove);walk.lastTime=1;tickWalk(151);walkTouches.delete('keyboard');dirty=true}});
 }
 designAPI.walk={state:walk,starts:walkStarts,canWalkAt,move:moveWalk,get active(){return walkMode},get camera(){return camera}};
}
if(activeModel)setupWalk();else root.querySelectorAll('.walk-bar button,.walk-bar input,.walk-bar select,#view-walk').forEach(b=>b.disabled=true);

// Alternate concept geometry; the original layout is retained for direct comparison.
let suiteGroup=null,suiteRoutes=null,suiteBathDoor=null,suiteShowerDoor=null,suiteStudyClosure=null;
let suiteBathOpen=true,suiteShowerOpen=false;
const suiteWalkStarts={baths:[9.75,4.46,-Math.PI/2],suite:[8.74,5.8,0]};
const suiteOriginalRoutes=[...humanGroup?.children||[]];
const suiteLabels=[];
function suiteRoomCopy(id,base){
 const copies={
  all:{title:'餐边柜与一条独立的套区内廊',desc:'餐厅新增 1,800 × 400 mm 餐边柜，餐桌横放并左移。主卫左侧划出约 900 mm 干走廊，连接主卧与双人书房；主卫另设侧门，洗漱如厕与淋浴以可关闭玻璃移门分隔。默认关闭书房外入口，可勾选保留双入口。',tags:['餐边柜','书房—主卧内通','淋浴独立封闭'],facts:[['餐厅通行','餐边柜深 400 mm，餐桌台面到柜前约 910 mm；四把餐椅布置在桌子长边，不占柜前主通道。'],['套区关系','现主卧入口进入后，可转入干走廊到书房；不穿过主卫干区或淋浴区。'],['干湿分离','主卫左侧为洗手台与马桶干区，右侧为约 950 × 1,920 mm 淋浴湿区，玻璃移门可开关。'],['试摆前提','墙体开门、管道、防水与实际净尺寸尚未核实；模型可走通不代表可以照图施工。']]},
  dining:{title:'餐边柜靠右，餐桌横过来',desc:'在主卫外墙的餐厅一侧放置 1,800 mm 长、400 mm 深的餐边柜。下部封闭收纳，中部留小电器台面，上部薄吊柜。1,300 × 750 mm 餐桌横放并左移约 250 mm，四把椅子分列长边。',tags:['1.8 m 餐边柜','40 cm 深','柜前约 91 cm'],facts:[['柜体外包','下柜及台面总深 400 mm，台高 900 mm，上柜深约 280 mm；不默认可放任意深度的电器。'],['主通道','按模型台面外缘计算，餐桌到柜前约 910 mm。餐椅位于上下两侧；拉椅后的进出仍须按实物复核。'],['电器与收纳','台面示意烧水与咖啡用途，未配置水槽。插座、散热及电器净深需按实际型号深化。'],['边界','保留厨房入口、玄关与套区入口，不把餐边柜延伸进门洞。']]},
  baths:{title:'干走廊、主卫干区、封闭淋浴区',desc:'原主卫左侧让出约 900 mm 干走廊。主卫从内廊侧门进入，马桶与洗手台布置在干区；右侧用玻璃隔断和移门封闭为独立淋浴湿区。内廊连接书房与主卧，日常通行不经过淋浴区。',tags:['独立内廊','淋浴玻璃移门','主卫干湿分离'],facts:[['三段空间','内廊净宽约 900 mm；主卫干区约 1,140 mm 宽，淋浴区约 950 × 1,920 mm，均为模型估算。'],['门与开口','主卫侧门为约 880 mm 开口的概念暗藏移门；淋浴玻璃为一固一移，可开关查看，开启后模型净口约 920 mm。'],['洁具安排','马桶大致保留原位置；洗手台移到干区下侧。排污立管、台盆排水与门套净宽仍待核实。'],['猫砂调整','原主卫第三处猫砂盆移到书房下侧角落，保留另两处位置，不占淋浴区或内廊。']]},
  study:{title:'仍是双人书房，多了一条内部通路',desc:'双人工位和右侧薄书柜保留。房间下侧左端接入干走廊，直接到达主卧入口区。默认封闭原面向餐厅的门洞，也可勾选“另保留书房独立门”对比双入口。',tags:['双人工位保留','内部相通','可选独立外门'],facts:base.facts},
  master:{title:'从主卧入口，进入自己的套区',desc:'保留 1.8 m 床与门旁 L 形衣柜、内嵌梳妆位。入口上侧接入干走廊，可通往书房和主卫干区。床头已换到客厅背后的左墙，入口改为带 860 × 240 mm 窄桌的遮影屏风。',tags:['1.8 m 床保留','L 柜保留','连接书房与主卫'],facts:base.facts}
 };
 return copies[id]?{...base,...copies[id]}:base;
}
function buildSuiteModel(){
 const T=THREE;suiteGroup=new T.Group();suiteGroup.name='suite-alternative';home.add(suiteGroup);
 function material(color,extra={}){const m=new T.MeshStandardMaterial({color,roughness:.8,...extra});m.userData.finishRole=typeof finishRole==='function'?finishRole(color):'paint';styleMaterials.push({material:m,color,roughness:m.roughness,metalness:m.metalness});return m}
 function box(name,x,y,z,w,h,d,color,parent=suiteGroup,extra={}){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material(color,extra));m.name=name;m.position.set(x,y,z);m.castShadow=!extra.transparent;m.receiveShadow=true;parent.add(m);return m}
 function wall(name,x,z,w,d,parent=suiteGroup){const m=box(name,x,.53,z,w,1.06,d,'#efeee5',parent);wallPieces.push({m,h:2.7});return m}
 function ball(name,x,y,z,rx,ry,rz,color,parent=suiteGroup){const m=new T.Mesh(new T.SphereGeometry(1,20,12),material(color));m.name=name;m.position.set(x,y,z);m.scale.set(rx,ry,rz);parent.add(m);return m}
 function cylinder(name,x,y,z,r,h,color,parent=suiteGroup){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,24),material(color));m.name=name;m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m}
 // Full-height partitions are included in the same cutaway/full-height controls as the original walls.
 wall('suite-study-bath-boundary',10.37,3.2,2.26,.18);
 wall('suite-bath-master-boundary',10.46,5.3,2.44,.18);
 wall('suite-corridor-upper',9.24,3.65,.1,.9);
 wall('suite-corridor-lower',9.24,5.14,.1,.32);
 suiteStudyClosure=wall('suite-study-external-door-infill',8.2,2.45,.18,.9);
 box('suite-corridor-floor',8.74,.018,4.25,.9,.012,1.92,'#d9c7a9');
 box('suite-dry-floor',9.86,.019,4.25,1.14,.014,1.92,'#d3d0c2');
 box('suite-wet-floor',10.94,.021,4.25,.94,.018,1.92,'#c9cec2');
 for(let z=3.6;z<5.2;z+=.4)box('wet-tile-joint',10.94,.032,z,.91,.002,.006,'#bbbfb3');
 box('shower-linear-drain',11.29,.035,4.25,.04,.004,.75,'#65705e');
 // Side door hides into the upper partition; its closed state has real collision geometry.
 suiteBathDoor=new T.Group();suiteBathDoor.name='suite-bath-pocket-door';suiteGroup.add(suiteBathDoor);
 box('bath-door-panel',9.24,1.075,4.54,.035,2.15,.88,'#d8c7a6',suiteBathDoor);
 box('bath-door-recessed-handle',9.218,1.03,4.79,.008,.17,.025,'#65705e',suiteBathDoor);
 // Existing WC position is retained approximately; basin moves to the lower dry wall.
 box('suite-wc-cistern',10.06,.57,3.54,.38,.7,.19,'#f6f5ec');
 ball('suite-wc-bowl',10.06,.3,3.74,.21,.28,.28,'#f4f3e9');
 ball('suite-wc-seat',10.06,.54,3.74,.19,.035,.25,'#d2d9ce');
 box('suite-basin-cabinet',9.82,.37,4.98,.72,.70,.42,'#b8bfa9');
 box('suite-basin-top',9.82,.77,4.98,.75,.10,.44,'#efeee3');
 ball('suite-basin-bowl',9.82,.825,4.98,.22,.01,.14,'#b1bcae');
 box('suite-basin-tap',9.82,.94,5.13,.025,.24,.025,'#7b8b7e');
 box('suite-basin-mirror',9.82,1.4,5.183,.62,.75,.025,'#c0cdbf',suiteGroup,{metalness:.35,roughness:.15});
 // One fixed half and one sliding half fully enclose the shower when closed.
 const glass={transparent:true,opacity:.25,depthWrite:false,side:T.DoubleSide};
 box('shower-fixed-glass',10.45,1.1,3.775,.012,2.2,.95,'#bfd2cc',suiteGroup,glass);
 for(const z of [3.3,4.25])box('shower-fixed-frame',10.45,1.1,z,.025,2.2,.025,'#aeb8aa');
 for(const y of [.045,2.19])box('shower-fixed-rail',10.45,y,3.775,.025,.025,.95,'#aeb8aa');
 suiteShowerDoor=new T.Group();suiteShowerDoor.name='suite-shower-sliding-door';suiteGroup.add(suiteShowerDoor);
 box('shower-moving-glass',10.42,1.1,4.725,.012,2.2,.95,'#bfd2cc',suiteShowerDoor,glass);
 for(const z of [4.25,5.2])box('shower-door-frame',10.42,1.1,z,.025,2.2,.025,'#aeb8aa',suiteShowerDoor);
 for(const y of [.045,2.19])box('shower-door-rail',10.42,y,4.725,.025,.025,.95,'#aeb8aa',suiteShowerDoor);
 box('shower-door-handle',10.39,1.05,5.08,.035,.28,.025,'#65705e',suiteShowerDoor);
 box('shower-top-track',10.435,2.23,4.25,.07,.045,1.94,'#aeb8aa');
 box('shower-bottom-track',10.435,.035,4.25,.07,.025,1.94,'#aeb8aa');
 box('suite-shower-riser',11.34,1.27,3.85,.035,1.6,.035,'#708273');
 box('suite-shower-arm',11.2,2.04,3.85,.29,.025,.025,'#708273');
 cylinder('suite-shower-head',11.08,2.02,3.85,.12,.025,'#708273');
 // 1800 x 400 mm cabinet, including its top. No handles project into the aisle.
 box('sideboard-lower',7.915,.44,4.05,.37,.86,1.8,'#c1a77f');
 box('sideboard-top',7.91,.885,4.05,.4,.03,1.8,'#e4dcc8');
 box('sideboard-upper',7.97,1.9,4.05,.28,.65,1.8,'#c1a77f');
 for(const z of [3.45,4.05,4.65]){
  box('sideboard-lower-front',7.725,.44,z,.01,.79,.57,'#e4dcc8');
  box('sideboard-upper-front',7.824,1.9,z,.012,.59,.57,'#e4dcc8');
 }
 box('sideboard-backsplash',8.092,1.22,4.05,.018,.62,1.8,'#efeee5');
 box('sideboard-led',7.84,1.565,4.05,.02,.015,1.71,'#f3e6c7',suiteGroup,{emissive:'#ffe1ad',emissiveIntensity:.35});
 cylinder('sideboard-kettle',7.93,1.025,3.48,.085,.24,'#b7bdb0');
 box('sideboard-coffee-machine',7.93,1.055,4.49,.25,.31,.23,'#45524a');
 // Four chairs face the long sides, leaving the entire east aisle free.
 box('suite-dining-top',6.15,.75,3.65,1.3,.065,.75,'#c5a87d');
 for(const x of [5.58,6.72])for(const z of [3.335,3.965])box('suite-table-leg',x,.37,z,.045,.74,.045,'#666f60');
 for(const x of [5.8,6.5])for(const z of [2.99,4.31]){
  const front=z<3.65?1:-1;
  box('suite-chair-seat',x,.45,z,.44,.11,.43,'#b4bba1');
  box('suite-chair-back',x,.72,z-front*.2,.44,.5,.07,'#b4bba1').userData.furniturePart='back';
  for(const dx of [-.16,.16])for(const dz of [-.16,.16])box('suite-chair-leg',x+dx,.22,z+dz,.035,.44,.035,'#a28c68');
 }
 cylinder('suite-table-vase',6.15,.88,3.65,.07,.18,'#b8a482');
 // Third litter position moves out of the compact bathroom into a study corner.
 box('suite-litter-tray',9.5,.09,2.75,.65,.16,.45,'#b6ad95');
 box('suite-litter-insert',9.5,.175,2.75,.57,.01,.37,'#d8c7a6');
 suiteRoutes=new T.Group();suiteRoutes.name='suite-human-routes';humanGroup.add(suiteRoutes);
 function route(points){for(let i=1;i<points.length;i++){const a=new T.Vector3(...points[i-1]),b=new T.Vector3(...points[i]),d=b.clone().sub(a);const mesh=new T.Mesh(new T.CylinderGeometry(.022,.022,d.length(),12),material('#557b68'));mesh.position.copy(a.clone().add(b).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());suiteRoutes.add(mesh)}}
 route([[3.75,.07,5.1],[5.0,.07,4.8],[7.25,.07,4.8],[7.6,.07,5.7],[8.74,.07,5.7],[8.74,.07,2.3],[9.85,.07,2.3]]);
 route([[8.74,.07,4.46],[9.75,.07,4.46]]);route([[8.74,.07,5.7],[9.5,.07,6.1],[9.6,.07,6.75],[10.65,.07,6.95],[10.9,.07,7.4],[10.9,.07,8.0]]);
 route([[7.25,.07,4.8],[7.15,.07,8.9],[6.4,.07,10.6]]);route([[5.0,.07,4.8],[5.0,.07,2.3],[6.4,.07,2.3],[6.4,.07,1.35]]);route([[5.0,.07,2.3],[2.2,.07,2.3]]);
 function label(id,text,point){addLabel(id,text,point);const l=labels[labels.length-1];l.layout='suite';suiteLabels.push(l)}
 label('dining','餐边柜 · 180 × 40 cm',[7.91,2.32,4.05]);
 label('baths','内廊 · 净宽约 90 cm',[8.74,.12,3.85]);
 labels[labels.length-1].el.className+=' suite-corridor-label';
 label('baths','干区 · 洗漱 / 如厕',[9.86,.1,4.44]);suiteLabels.at(-1).detailRoom='baths';
 label('baths','湿区 · 玻璃移门',[10.94,.1,4.6]);suiteLabels.at(-1).detailRoom='baths';
 label('study','第三处猫砂位',[9.5,.3,2.75]);suiteLabels.at(-1).detailRoom='study';
 for(const l of labels)if(['净宽','屏风＋窄桌','转角净距','L 形衣柜','内嵌梳妆位'].some(t=>l.el.textContent.startsWith(t)))l.detailRoom='master';
 for(const l of labels)if(l.id==='cat-砂 ③')l.layout='original';
 // The original third cat resource ring belongs to catGroup; suppress it in the alternate layout.
 for(const o of catGroup.children)if(o.isMesh&&Math.abs(o.position.x-10.1)<.01&&Math.abs(o.position.z-4.82)<.01)o.userData.suiteOriginal=true;
 designAPI.suite={group:suiteGroup,bathDoor:suiteBathDoor,showerDoor:suiteShowerDoor};
}
function showSuiteViewer(){$('#viewer').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
function focusSuite(){view(false);selectRoom('all');goal.cx=8.6;goal.cz=4.9;goal.span=11;goal.theta=-.25;goal.phi=.65;dirty=true}
function setSuiteDoor(which,open){
 const door=which==='bath'?suiteBathDoor:suiteShowerDoor;if(!door)return false;
 const old=door.position.z;door.position.z=open?-(which==='bath'?.88:.95):0;
 if(walkMode){refreshWalkGeometry();if(!canWalkAt(walk.x,walk.z)){door.position.z=old;refreshWalkGeometry();toast('请先离开门扇关闭的位置');return false}}
 if(which==='bath')suiteBathOpen=open;else suiteShowerOpen=open;
 const b=$('#suite-'+(which==='bath'?'bath':'shower')+'-door');b.textContent=(open?'关闭':'打开')+(which==='bath'?'主卫门':'淋浴门');b.setAttribute('aria-pressed',String(open));dirty=true;return true;
}
function syncSuiteVisibility(){
 const on=layoutMode==='suite';suiteGroup.visible=on;
 for(const key of ['dining','bath','bathLitter','bathArc'])for(const o of layoutParts[key]||[])o.visible=!on;
 for(const {m} of wallPieces)if(m.userData.suiteOriginal)m.visible=!on;
 suiteStudyClosure.visible=!$('#suite-study-door').checked;for(const o of layoutParts.studyArc||[])o.visible=!on||!suiteStudyClosure.visible;
 for(const o of suiteOriginalRoutes)o.visible=!on;suiteRoutes.visible=on;
 for(const o of catGroup.children)if(o.userData.suiteOriginal)o.visible=!on;
 for(const b of root.querySelectorAll('[data-layout]'))b.setAttribute('aria-pressed',String(b.dataset.layout===layoutMode));
 for(const id of ['suite-overview','suite-dining','suite-bath','suite-walk','suite-bath-door','suite-shower-door','suite-study-door'])$('#'+id).disabled=!on;
 $('#layout-status').textContent=on?'内廊约 90 cm · 餐边柜 180 × 40 cm · 主卫玻璃移门封闭干湿分区。开门位置、结构、管道与防水须现场核实。':'原布局对比：原餐桌、主卫洁具与房间分隔保持。选择“餐边柜＋套区”查看新方案。';
 $('#dining-size-note').textContent=on?'餐厅试摆：餐桌 1,300 × 750 mm 横放；餐边柜 1,800 × 400 mm，模型柜前到桌边约 910 mm。':'餐厅原布局：约 1,300 × 750 mm 四人桌，长边沿原图上下方向；通行按椅子使用状态复核。';
 $('#cats .cat-copy>p:nth-of-type(2)').textContent=on?'套区方案将原主卫猫砂盆移到书房下侧角落；另两处仍在阳台与次卧。保留三处预留位，房门需保证猫咪可达，位置与实际接受情况仍须观察调整。':'三处猫砂位分别落在阳台安静端、次卧角落和主卫干区。主卫与次卧门必须常开或使用经确认可行的宠物通道；若关门或噪声影响使用，应调整盆位。';
 if(walkMode)refreshWalkGeometry();fillDetail(selected);dirty=true;
}
function setLayout(id,focus=true){
 if(!suiteGroup||!['suite','original'].includes(id))return;if(walkMode)exitWalk();if(privacyView)exitPrivacyView();
 layoutMode=id;syncSuiteVisibility();setWalls();if(focus){if(id==='suite')focusSuite();else{view(false);selectRoom('all')}}
}
function setupSuite(){
 buildSuiteModel();setSuiteDoor('bath',true);setSuiteDoor('shower',false);applyStyle(currentStyle);
 root.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>setLayout(b.dataset.layout));
 $('#suite-overview').onclick=()=>{focusSuite();showSuiteViewer()};
 $('#suite-dining').onclick=()=>{view(false);selectRoom('dining');goal.cx=6.6;goal.cz=3.65;goal.span=6.8;goal.theta=-.65;goal.phi=.86;showSuiteViewer()};
 $('#suite-bath').onclick=()=>{view(true);selectRoom('baths');goal.cx=9.85;goal.cz=4.25;goal.span=4.8;showSuiteViewer()};
 $('#suite-walk').onclick=()=>{if(walkMode)exitWalk();$('#walk-start').value='master';enterWalk();jumpWalk('suite')};
 $('#suite-bath-door').onclick=()=>setSuiteDoor('bath',!suiteBathOpen);
 $('#suite-shower-door').onclick=()=>setSuiteDoor('shower',!suiteShowerOpen);
 $('#suite-study-door').onchange=()=>{const old=suiteStudyClosure.visible;suiteStudyClosure.visible=!$('#suite-study-door').checked;
  if(walkMode){refreshWalkGeometry();if(!canWalkAt(walk.x,walk.z)){suiteStudyClosure.visible=old;$('#suite-study-door').checked=!old;refreshWalkGeometry();toast('请先离开书房外门口再封闭门洞')}}for(const o of layoutParts.studyArc||[])o.visible=!suiteStudyClosure.visible;dirty=true};
 setLayout('suite');selectRoom('master');goal.theta=.62;goal.phi=.86;goal.span=7.3;goal.cz=7.5;
}
if(activeModel)setupSuite();else root.querySelectorAll('.layout-bar button,.layout-bar input').forEach(b=>b.disabled=true);

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
  gap('master','床尾通道',items.masterBed,wall(11.5,7.25),'x'),
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
// Both model dimensions and live clearance capsules share one collision pass.
function positionClearanceLabels(rect){
 const placed=[],gap=8,margin=8;
 const overlaps=(a,b)=>a.left<b.left+b.width+gap&&a.left+a.width+gap>b.left&&a.top<b.top+b.height+gap&&a.top+a.height+gap>b.top;
 for(const l of labels){
  if(!(l.clearance||/净距|净宽|\b(?:cm|mm)\b/.test(l.el.textContent))||l.el.style.display==='none')continue;
  const x=parseFloat(l.el.style.left),y=parseFloat(l.el.style.top);
  const box=positionLabelWithinViewer(l.el,rect,x,y);if(!box)continue;
  const start={...box};
  // Search the current row horizontally first, then rows below existing boxes.
  const rows=[box.top,...placed.map(p=>p.top+p.height+gap).filter(top=>top>box.top).sort((a,b)=>a-b)];
  let target=null;
  for(const top of rows){
   if(top+box.height>rect.height-margin)continue;
   const candidates=[box.left,...placed.flatMap(p=>[p.left+p.width+gap,p.left-box.width-gap])]
    .filter(left=>left>=margin&&left+box.width<=rect.width-margin).sort((a,b)=>Math.abs(a-start.left)-Math.abs(b-start.left));
   for(const left of candidates){const next={...box,left,top};if(!placed.some(p=>overlaps(next,p))){target=next;break}}
   if(target)break;
  }
  // A full canvas cannot accommodate another capsule without clipping/overlap.
  if(!target){l.el.style.display='none';continue}
  l.el.style.left=(parseFloat(l.el.style.left)+target.left-start.left)+'px';
  l.el.style.top=(parseFloat(l.el.style.top)+target.top-start.top)+'px';
  placed.push(target);
 }
}
function setupClearances(){
 clearanceGroup=new THREE.Group();clearanceGroup.name='room-clearance-annotations';clearanceGroup.userData.labels=[];scene.add(clearanceGroup);
 $('#clearance-toggle').onclick=()=>setClearanceEnabled(!clearanceEnabled);setClearanceEnabled(clearanceEnabled);updateClearances();
}
if(activeModel)setupClearances();

// Dimension notes remain readable in the room card on narrow screens.
for(const label of labels)if(label.detailRoom)label.el.classList.add('model-dimension-label');
function setActive(value){
 value=Boolean(value);if(value===componentActive)return;
 componentActive=value;cancelAnimationFrame(frame);frame=0;
 clearWalkInput();clearOrbitInput();
 if(!value){for(const dialog of root.querySelectorAll('dialog[open]'))dialog.close();clearTimeout(toast.timer);$('#toast').classList.remove('show');}
 if(value&&activeModel){resize();dirty=true;animate();}
}
return {setActive,get active(){return componentActive},get supported(){return activeModel}};
}
