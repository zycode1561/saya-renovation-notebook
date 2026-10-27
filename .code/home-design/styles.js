// Two finish schemes share exactly the same architecture, furniture positions and circulation.
let currentStyle='natural',styleMaterials=[],naturalOnly=[],modernDetails=null,modernCeiling=null;
let naturalCopy=null;
const styleNames={natural:'原木自然风',modern:'现代简约风'};
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
const modernRoomOverrides={
 living:{desc:'沿用原客厅布局，以炭黑直排沙发搭配浅灰地面与米白地毯。电视柜改为深灰色，黑色弧形落地灯与局部线性灯带呼应参考图；保留可替换猫墙模块，不因追求整洁而减少猫咪活动空间。',tags:['炭黑沙发','深灰电视柜','局部线性灯光'],facts:{'氛围与收纳':'白色墙面、浅灰大规格铺地示意、米白织物；深灰电视柜下设灯带。黑色沙发表面仅为视觉示意，实际选材先测试耐抓、易洁与触感。'}},
 kitchen:{desc:'保留原厨房的冰箱—水槽—备餐—灶具关系。柜门由灰绿切换为烟灰色，浅灰白台面搭配深色五金与玻璃分隔，呼应参考图的现代简约气质；不增加岛台，也不改变原有厨卫位置。',tags:['烟灰柜门','浅色台面','深色框线']},
 master:{facts:{'L 柜尺寸':'暖白连续 L 形衣柜，长边约 1,580 mm、短边约 1,630 mm，含 600 mm 转角重叠；短边末端嵌入 700 mm 浅色梳妆位及上方封闭柜，搭配烟灰凳。主柜深 600 mm，柜高 2,350 mm。'}},
 dining:{tags:['浅色餐桌','黑灰餐椅','白色玄关柜'],facts:{'入户收纳':'沿用约 350 mm 深玄关柜，改为平整白色柜门与深色细节；不照搬参考图的大体量餐边柜，以免压缩本户型通道。'}},
 study:{tags:['浅色双人桌','黑灰座椅','薄柜收纳']},
 guest:{tags:['灰色软包','暖白衣柜','客卧保留']}
};
function styledRoom(id){const base=rooms[id],patch=currentStyle==='modern'?(modernRoomOverrides[id]||{}):{};const result={...base,...patch,facts:base.facts.map(([key,value])=>[key,patch.facts?.[key]||value])};return layoutMode==='suite'?suiteRoomCopy(id,result):result}
function updateFloorSelection(){for(const m of pickFloors){const base=currentStyle==='modern'?(modernColors[m.userData.color]||m.userData.color):m.userData.color;m.material.color.set(m.userData.room===selected?(currentStyle==='modern'?'#b6c7cc':'#d5d9b8'):base)}}
function prepareStyleModel(){
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
 const path=new THREE.CatmullRomCurve3([[5.05,.08,6.15],[5.05,.95,6.15],[5.15,1.8,6.13],[5.48,2.02,6.1],[5.76,1.88,6.1]].map(p=>new THREE.Vector3(...p)));
 const arch=new THREE.Mesh(new THREE.TubeGeometry(path,40,.018,8,false),new THREE.MeshStandardMaterial({color:'#272e31',metalness:.35,roughness:.4}));modernDetails.add(arch);
 const shade=new THREE.Mesh(new THREE.SphereGeometry(.19,24,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:'#272e31',side:THREE.DoubleSide}));shade.position.set(5.76,1.79,6.1);shade.scale.y=.65;modernDetails.add(shade);
}
function syncModernLighting(){if(!modernDetails)return;modernDetails.visible=currentStyle==='modern';modernCeiling.visible=!topView&&!privacyView&&!walkMode;modernDetails.traverse(o=>{if(o.material?.emissiveIntensity)o.material.emissiveIntensity=night?2.4:.9});if(ambient){ambient.color.set(currentStyle==='modern'?'#f7f8f5':'#fff9e9');ambient.groundColor.set(currentStyle==='modern'?'#a3acaf':'#9ba998');sun.color.set(currentStyle==='modern'?'#fff7eb':'#fff0d2')}}
function applyStyle(id,notify=false){
 if(!styleNames[id])return;
 if(!naturalCopy){naturalCopy={};for(const s of ['.intro>div>p','.note-float h3','.note-float>p','#materials .section-head h2','#materials .section-head>p','#materials .swatches'])naturalCopy[s]=$(s).innerHTML}
 currentStyle=id;document.body.dataset.style=id;document.querySelectorAll('[data-style-choice]').forEach(b=>{const on=b.dataset.styleChoice===id;b.setAttribute('aria-pressed',String(on));b.classList.toggle('active',on)});
 if(id==='modern'){
 $('.intro>div>p').textContent='为沙耶定制的现代简约风住宅提案 · 炭黑 × 暖白 × 浅灰';
 $('.note-float h3').textContent='黑白有序，光线有温度。';$('.note-float>p').innerHTML='浅色铺陈空间，<br>深色家具勾勒轮廓，<br>局部线性光柔和过渡。';
 $('#materials .section-head h2').textContent='克制的黑白，有温度的灰。';$('#materials .section-head>p').innerHTML='借鉴你提供的参考图：浅色柜门、深色软装与线性灯光。<br>保留本户型尺度，吊顶与灯带仅为概念示意。';
 const data=[['cream','01 / 暖白哑光','墙顶与平整柜门 · 明亮留白'],['wood','02 / 浅灰石纹','干区地面 · 大规格铺地示意'],['green','03 / 炭黑与烟灰','沙发、餐椅与厨房柜门'],['stone','04 / 米白织物','地毯与床品 · 柔化黑白对比'],['metal','05 / 深色金属','窗框、弧形灯与细线条']];
 $('#materials .swatches').innerHTML=data.map(([c,t,d])=>`<div class="material-item"><div class="swatch ${c}"></div><h4>${t}</h4><p>${d}</p></div>`).join('');
 }else for(const [s,html] of Object.entries(naturalCopy))$(s).innerHTML=html;
 $('#style-description').textContent=id==='modern'?'参考图同款气质 · 黑白灰 / 平整柜门 / 线性暖光':'温暖原木 / 奶油白 / 低饱和绿';
 if(activeModel){for(const {material,color,roughness,metalness} of styleMaterials){material.color.set(id==='modern'?(modernColors[color]||color):color);material.roughness=roughness;material.metalness=metalness;if(id==='modern'&&['#cacdb8','#dadcc8','#dedfcc','#e8e8d5'].includes(color))material.roughness=.48}for(const obj of naturalOnly)obj.visible=id==='natural';updateFloorSelection();syncModernLighting()}
 fillDetail(selected);if(walkMode){refreshWalkCaption();refreshWalkGeometry();}if(privacyView){$('#camera-caption').textContent='视线对比 / '+privacyViews[privacyView].name;refreshPrivacyStatus()}dirty=true;if(notify)toast('已切换为'+styleNames[id]+'，当前视角与房间布局保持一致');
}
function setupStyles(){if(activeModel)prepareStyleModel();document.querySelectorAll('[data-style-choice]').forEach(b=>b.onclick=()=>applyStyle(b.dataset.styleChoice,true));$('#style-reference-btn').onclick=()=>$('#style-dialog').showModal();$('#close-style-dialog').onclick=()=>$('#style-dialog').close();$('#style-dialog').addEventListener('click',e=>{if(e.target===$('#style-dialog'))$('#style-dialog').close()});applyStyle('modern')}
