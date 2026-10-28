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
 label('baths','干区 · 洗漱 / 如厕',[9.86,.1,4.44]);suiteLabels.at(-1).detailRoom='baths';
 label('baths','湿区 · 玻璃移门',[10.94,.1,4.6]);suiteLabels.at(-1).detailRoom='baths';
 label('study','第三处猫砂位',[9.5,.3,2.75]);suiteLabels.at(-1).detailRoom='study';
 for(const l of labels)if(['净宽','屏风＋窄桌','转角净距','L 形衣柜','内嵌梳妆位'].some(t=>l.el.textContent.startsWith(t)))l.detailRoom='master';
 for(const l of labels)if(l.id==='cat-砂 ③')l.layout='original';
 // The original third cat resource ring belongs to catGroup; suppress it in the alternate layout.
 for(const o of catGroup.children)if(o.isMesh&&Math.abs(o.position.x-10.1)<.01&&Math.abs(o.position.z-4.82)<.01)o.userData.suiteOriginal=true;
 window.__homeDesign.suite={group:suiteGroup,bathDoor:suiteBathDoor,showerDoor:suiteShowerDoor};
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
 for(const b of document.querySelectorAll('[data-layout]'))b.setAttribute('aria-pressed',String(b.dataset.layout===layoutMode));
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
 document.querySelectorAll('[data-layout]').forEach(b=>b.onclick=()=>setLayout(b.dataset.layout));
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
if(activeModel)setupSuite();else document.querySelectorAll('.layout-bar button,.layout-bar input').forEach(b=>b.disabled=true);
