'use strict';
const $=s=>document.querySelector(s);
const rooms={
 all:{num:'01',name:'全屋鸟瞰',title:'保留格局，重新组织生活',en:'THE WHOLE HOME',center:[6.0,5.55],span:17,desc:'保留三房两卫与厨卫位置，以中部餐客厅串联日常。右下主卧安静休息，右上双人书房高效工作，左上次卧应对来客与偶尔分开休息。全屋不依赖拆墙，先把家具和动线做好。',tags:['两人常住','两猫共居','不预设拆墙'],facts:[['空间分工','三间房分别承担睡眠、双人工作、来客与弹性使用；餐厅保持开放通行。'],['尺寸策略','家具按图示比例放置，优先让出门口、椅后与床尾空间，实际尺寸须实测确认。'],['长期使用','封闭收纳为主，照明分区；猫咪食水、猫砂和高处休息点分开设置。'],['阅读方式','点击左侧房间或模型标签聚焦；切换俯视、猫咪地图与生活动线，逐项检查方案。']]},
 living:{num:'02',name:'客厅',title:'一起放松，也给猫留一条路',en:'LIVING TOGETHER',center:[6.4,7.8],span:7.4,desc:'约 3.6 米宽的中部空间更适合轻巧直排沙发。电视靠右墙，沙发靠左，避免大转角占满通道。低台、猫抓柱与分段跳台在客厅一侧串联，地面仍可轻松打扫。',tags:['直排沙发','轻量茶几','可替换猫抓件'],facts:[['家具组合','约 2,100 × 850 mm 沙发，800 × 450 mm 小茶几，深约 300 mm 电视柜；不做大型固定茶台。'],['走动空间','餐厅—客厅—阳台保持连续通行。茶几可移动，通道目标约 800–900 mm，以家具实际外径复核。'],['猫咪使用','猫墙有起点、观察点和回落点；不跨房门、不接近电视线缆。两端跳台按猫咪体能调整。'],['氛围与收纳','暖白墙面、浅木地面，灰绿靠包；落地灯与电视侧照明独立控制，电线隐藏收束。']]},
 dining:{num:'03',name:'餐厅 · 玄关',title:'家里的交汇处，要留白',en:'THE DAILY CROSSROADS',center:[5.9,3.85],span:7.4,desc:'厨房门口直达四人餐桌，餐桌长边沿原图上下方向，左右留出通往各房间的通道。玄关只布置必要鞋物收纳，避免用整排深柜挤占回家路线。',tags:['四人餐桌','无岛台','轻量玄关'],facts:[['餐桌尺寸','约 1,300 × 750 mm 圆角餐桌，两侧各两把椅；不用位时推入桌下，主通道目标约 900 mm。'],['入户收纳','玄关柜深约 350 mm，局部开放放钥匙；门扇扫过区域留空，底部预留扫地机位。'],['适应变化','两人日常用桌一侧，来客拉出其他椅。尽量避免固定卡座，以便以后调整。'],['需核实','图中左侧凹口的入户门、公区边界与净宽不够清晰，本模型仅示意连接关系，柜体待复测后定。']]},
 kitchen:{num:'04',name:'厨房',title:'一条顺手的备餐路线',en:'A QUIET, PRACTICAL KITCHEN',center:[6.4,1.05],span:6.1,desc:'保留原厨房位置与设备侧关系。冰箱靠入口左侧，水槽靠上侧，灶具靠右侧，中间留备餐台。灰绿地柜搭配浅色台面，保留可关闭的厨房分隔，兼顾烹饪和猫咪隔离。',tags:['L 形操作台','灰绿柜门','保留厨房分隔'],facts:[['工作顺序','冰箱取物 → 水槽清洗 → 中段备餐 → 右侧烹饪。水槽、灶具位置须服从实际管道与烟道。'],['柜体预留','地柜按 600 mm 深示意；水槽旁预留约 600 mm 洗碗机位，灶旁保留落锅空间。'],['收纳与灯','常用器具收在抽屉，台面上只留必需品；吊柜下任务照明独立开关。'],['现场条件','原图未给设备井净尺寸、燃气位置与窗开启范围。高柜、烟机与厨房门方案必须据此调整。']]},
 master:{num:'05',name:'主卧 · 右下',title:'床头靠客厅背墙，屏风带一张窄桌',en:'THE MAIN BEDROOM',center:[9.94,7.6],span:7.4,desc:'按沙耶要求将床调头 180°，并向窗侧微移 100 mm 留出床尾转角，床头改靠左侧、客厅背后的墙，床头灯与小边几同步移位。保留 1.8 米床与右上 L 形衣柜、内嵌梳妆位。入口原实板改为细边框遮影屏风，卧室侧接一张 860 × 240 mm 窄桌，作为随手置物台；不预留固定座椅，避免占用通路。',tags:['床头改靠左墙','屏风＋窄桌','1.8 米床保留'],facts:[['睡眠核心','床垫 1,800 × 2,000 mm，床架约 1,880 × 2,050 mm；床头靠左墙，床尾朝右。窗侧间距约 620 mm，右侧床尾空间约 1,240 mm（模型值）。'],['L 柜尺寸','长边约 1,580 mm、短边约 1,630 mm（含 600 mm 转角重叠及 700 mm 梳妆位），主柜深 600 mm、高 2,350 mm；柜体位置保留。'],['入口遮挡','屏风宽 950 mm、高 2,000 mm，使用连续遮影面板与细边框，不采用通透格栅。窄桌长 860 mm、深 240 mm，台面高 800 mm，接在卧室侧。固定视点可切换有／无屏风检查，不保证所有斜角完全遮挡。'],['收纳与通行','床尾通路改到右侧，屏风与桌子不进入主卫入口。梳妆凳收入台下时检查日常通行；拉出使用会占用床尾入口一部分空间，应先收凳再通过。'],['一体梳妆','保留 700 × 450 mm 台面、高 750 mm，上方柜底约 1,950 mm；原 320 mm 凳支持收起／拉出。屏风窄桌仅作置物台，不作为第二处坐式梳妆台。']]},
 study:{num:'06',name:'书房 · 右上',title:'并肩工作，也各有一方天地',en:'A STUDIO FOR TWO',center:[9.85,1.6],span:6.8,desc:'用约 2.6 米长桌形成双人工位，每人约 1.3 米。桌面面向原图上侧窗，显示器加可调支架和遮光帘控制眩光；右侧薄书柜收纳，房间中央留给椅子后退和走动。',tags:['双人独立工位','薄书柜','设备线缆收束'],facts:[['工作尺度','桌面约 2,600 × 650 mm，高度随使用者调整；椅后净距目标 900 mm。柜门开启也要计入活动区。'],['视频会议','两套可独立控制的任务灯与电源。需要同时通话时，一人移到次卧临时使用小桌。'],['猫咪陪伴','书房左侧设独立食点，与客厅食点分开；窗边休息台不挡窗扇，不让猫接触未收束线缆。'],['窗与屏幕','窗宽、窗台高度未给定。若窗光影响屏幕，先调遮光和屏幕角度，再决定桌子是否转向侧墙。']]},
 guest:{num:'07',name:'次卧 · 左上',title:'给来客，也给生活留一点余量',en:'A ROOM WITH ROOM TO CHANGE',center:[1.4,1.9],span:6.6,desc:'采用 1.35 米成品床与下侧衣柜，不做难以调整的满铺榻榻米。平时作为独处和临时休息空间，来客时依然是一间完整卧室。房门附近保留可移动的小桌位。',tags:['成品床','客卧保留','弹性使用'],facts:[['床与衣柜','床垫约 1,350 × 2,000 mm，床头靠图上侧墙；衣柜深约 600 mm。床右侧保留通道，床尾与衣柜之间预留约 700 mm 的目标距离。'],['备用工作','小桌按约 700 × 400 mm 示意，适合短时使用，不能替代长期办公工位；若常用可改 1.2 米床释放面积。'],['猫砂位置','角落留开放猫砂盆位，用可擦洗垫承接；远离门口与床头。来客若关门，须先另设可达替代盆位。'],['安静收纳','换季被褥收进衣柜，墙面不堆展示架，预留成品家具调整的余地。']]},
 baths:{num:'08',name:'双卫 · 洗漱',title:'保留双卫，早晨不用排队',en:'BATH & EVERYDAY CARE',center:[8.7,3.9],span:7.7,desc:'保留原图两处卫生间及左侧外置洗手区，避免迁移排水。右卫承担主要淋浴、如厕与洗漱，左卫作为辅助。湿区边界、防水、排风与检修条件优先于造型。',tags:['不迁排水','保留外置台盆','开放猫砂位'],facts:[['干湿划分','右卫右侧淋浴区以玻璃分隔示意，主通行和门扇打开区留空；玻璃与地漏位置现场确定。'],['早高峰','两人可分别使用外置台盆和右卫，左卫保留辅助如厕与淋浴能力。'],['猫咪可达','主卫干区预留第三处猫砂盆，远离淋浴溅水和门扇范围，必须保证随时进入；不装进密闭柜。'],['工程条件','不因模型调整排水或拆墙。防水闭水、排水坡度、排风和地面防滑需施工图与现场验收。']]},
 balcony:{num:'09',name:'阳台',title:'洗衣与晒太阳，各有自己的角落',en:'A LITTLE EVERYDAY RETREAT',center:[6.4,10.9],span:6.5,desc:'保留客厅与阳台边界。洗衣烘干叠放在一侧，猫砂盆放另一侧安静端，中央留作通道和活动。窗边设置低位休息垫，优先完成可靠的防逃与遮阳方案。',tags:['洗烘叠放','防逃优先','分开清洁与休息'],facts:[['家政尺度','洗烘叠放按约 700 × 700 mm 外包尺寸示意，实际需叠放件、散热、检修和门扇净空。'],['猫砂与噪声','猫砂盆与洗衣机分置两端；若机器运行造成紧张，应将盆移到更安静的室内位置，不强迫适应。'],['通行保留','不铺满地台，不默认拆客厅阳台门窗。落地收纳和猫爬架避免影响开门、晾晒及逃生路径。'],['必须确认','给排水、地漏、防水、外窗承载和物业要求尚未知；无相应条件时洗衣设备保留原有合法位置。']]}
};
let selected='all';
for(const [id,r] of Object.entries(rooms)){const b=document.createElement('button');b.dataset.room=id;b.innerHTML=`<span>${r.num}</span>${r.name}`;b.addEventListener('click',()=>selectRoom(id));$('#room-menu').appendChild(b)}
function fillDetail(id){const r=styledRoom(id);$('#detail-num').textContent=r.num;$('#detail-title').textContent=r.title;$('#detail-en').textContent=r.en;$('#detail-desc').textContent=r.desc;$('#detail-tags').innerHTML=r.tags.map(t=>`<span class="tag">${t}</span>`).join('');$('#detail-list').innerHTML=r.facts.map(([a,b])=>`<li><b>${a}</b><span>${b}</span></li>`).join('');document.querySelectorAll('[data-room]').forEach(b=>{b.classList.toggle('active',b.dataset.room===id);b.setAttribute('aria-pressed',b.dataset.room===id?'true':'false')});$('#camera-caption').textContent=`${r.num} / ${r.name}${id==='master'?' · 净宽330cm（暂定）':''}`;$('#viewer').classList.toggle('focused',id!=='all')}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}
function openPlan(){$('#plan-dialog').showModal()}
$('#original-btn').onclick=openPlan;$('#original-lower').onclick=openPlan;$('#close-dialog').onclick=()=>$('#plan-dialog').close();$('#plan-dialog').addEventListener('click',e=>{if(e.target===$('#plan-dialog'))$('#plan-dialog').close()});$('#print').onclick=()=>window.print();
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
 const mats=new Map();function mat(c,extra={}){const key=c+JSON.stringify(extra);if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color:c,roughness:.8,...extra}));return mats.get(key)}
 function box(x,y,z,w,h,d,c,parent=home,extra={}){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c,extra));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);allMeshes.push(m);return m}
 function cyl(x,y,z,r,h,c,parent=home,r2=r){const m=new T.Mesh(new T.CylinderGeometry(r,r2,h,32),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function ball(x,y,z,rx,ry,rz,c,parent=home){const m=new T.Mesh(new T.SphereGeometry(1,20,12),mat(c));m.position.set(x,y,z);m.scale.set(rx,ry,rz);m.castShadow=true;parent.add(m);return m}
 function line(points,c,r=.018,parent=home){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const m=new T.Mesh(new T.TubeGeometry(curve,Math.max(16,points.length*8),r,8,false),mat(c));parent.add(m);return m}
 function local(x,z,rot=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rot;home.add(g);return g}
 function floor(x,z,w,d,c,id){const m=box(x,-.055,z,w,.12,d,c);m.material=m.material.clone();m.userData={room:id,color:c};pickFloors.push(m);return m}
 // Plan coordinates: x follows the supplied 4.6 / 3.6 / 3.3 m segments; z follows drawing downward.
 floor(1.4,1.9,2.8,3.8,'#d5bf9e','guest');floor(3.7,1.0,1.8,2.0,'#cfcec0','baths');floor(3.7,2.6,1.8,1.2,'#d9c7a9','dining');floor(3.7,3.5,1.8,.6,'#d3d0c2','baths');floor(3.7,4.7,1.8,1.8,'#d8c5a6','dining');floor(6.4,1,3.6,2,'#d4d2c6','kitchen');floor(6.4,3.65,3.6,3.3,'#dac8a9','dining');floor(6.4,7.6,3.6,4.6,'#d8c3a2','living');floor(9.85,1.6,3.3,3.2,'#d5c09f','study');floor(9.85,4.25,3.3,2.1,'#c9cec2','baths');floor(9.94,7.6,3.48,4.6,'#d8c3a3','master');floor(6.4,10.9,3.6,2,'#cccdbd','balcony');
 // Subtle plank and tile joints preserve readable room boundaries.
 for(const m of pickFloors){const {width:w,depth:d}=m.geometry.parameters;const x=m.position.x,z=m.position.z,isTile=['baths','balcony','kitchen'].includes(m.userData.room);for(let xx=x-w/2+.22;xx<x+w/2;xx+=isTile?.6:.22)box(xx,.009,z,.007,.003,d-.03,isTile?'#bbbfb3':'#baa482').userData.naturalOnly=!isTile;for(let zz=z-d/2+.7;zz<z+d/2;zz+=isTile?.6:1.25)box(x,.009,zz,w-.03,.003,.006,isTile?'#bbbfb3':'#c5b08d').userData.naturalOnly=!isTile;}
 // Foundation pads follow the irregular footprint, not a fictitious rectangular home.
 box(5.75,-.23,1.9,11.75,.3,4.05,'#f5f2e7');box(7.2,-.23,4.7,9.1,.3,1.8,'#f5f2e7');box(8.14,-.23,7.75,7.38,.3,4.5,'#f5f2e7');box(6.4,-.23,11,3.85,.3,2.2,'#f5f2e7');
 function wall(x,z,w,d,h=2.7){const m=box(x,.53,z,w,1.06,d,'#efeee5',wallGroup);wallPieces.push({m,h});return m}
 // Exterior walls with explicit window openings; interior doors remain open passages.
 wall(.0,1.9,.18,3.8);wall(11.5,2.65,.18,5.3);wall(11.68,7.6,.18,4.6);wall(1.4,3.8,2.8,.18);wall(2.8,4.45,.18,1.3);wall(3.2,5.6,.8,.18);wall(4.4,5.6,.4,.18);wall(4.6,7.75,.18,4.3);wall(4.6,10.9,.18,2);wall(8.2,11,.18,2);wall(6.4,11.9,3.6,.18,.85);
 function win(x,z,w,along='x'){const g=new T.Group();home.add(g);g.position.set(x,0,z);if(along==='z')g.rotation.y=Math.PI/2;box(0,.43,0,w,.86,.16,'#edece2',g);box(0,1.7,0,w,1.55,.035,'#bfd2cc',g,{transparent:true,opacity:.25,depthWrite:false});for(const xx of [-w/2,0,w/2])box(xx,1.7,0,.035,1.6,.06,'#aeb8aa',g);box(0,.95,0,w+.12,.06,.25,'#eceadf',g);box(0,2.46,0,w,.04,.06,'#aeb8aa',g);return g}
 wall(.4,0,.8,.18);win(1.6,0,1.6);wall(2.75,0,.7,.18);win(3.7,0,1.2);wall(4.8,0,1,.18);win(6.4,0,2.1);wall(8.1,0,1.3,.18);win(9.85,0,2.1);wall(11.2,0,.6,.18);wall(8.5,9.9,.6,.18);win(10.09,9.9,2.58);wall(11.53,9.9,.3,.18);win(6.4,11.9,3.4);win(11.5,4.3,.8,'z');
 wall(2.8,1,.15,2);wall(2.8,3.25,.15,1.1);wall(3.1,2,.6,.15);wall(4.35,2,.5,.15);wall(4.6,1,.18,2);wall(4.6,3.5,.18,.6);wall(3.6,3.8,1.8,.15);wall(8.2,1,.18,2);wall(8.2,4.1,.18,2.4);wall(8.2,8.1,.18,3.6);wall(9.85,3.2,3.3,.18).userData.suiteOriginal=true;wall(8.55,5.3,.7,.18).userData.suiteOriginal=true;wall(10.79,5.3,1.78,.18).userData.suiteOriginal=true;
 // Glazed kitchen separation and balcony boundary, kept in original locations.
 for(const x of [4.85,7.95])box(x,1.1,2,.4,2.2,.035,'#bccabd',home,{transparent:true,opacity:.23,depthWrite:false});box(6.4,.025,2,3.5,.04,.1,'#9eaa9b');box(6.4,.025,9.9,3.5,.04,.12,'#9eaa9b');
 function door(x,z,rot=0,w=.8){const g=local(x,z,rot);const leaf=box(w/2,1.02,0,w,2.04,.045,'#d7c4a8',g);g.rotation.y+=-.28;box(w-.08,1,0,.035,.035,.11,'#5f6759',g);const arc=[];for(let i=0;i<=20;i++){let a=i/20*Math.PI/2;arc.push([x+w*Math.cos(a),.025,z+w*Math.sin(a)])}line(arc,'#a4aa97',.008);return leaf}
 // Door arcs are floor hints; physical panels omitted in cutaway to avoid visually blocking rooms.
 function arc(x,z,angle,w=.8){const pts=[];for(let i=0;i<=24;i++){const a=angle+i/24*Math.PI/2;pts.push([x+Math.cos(a)*w,.028,z+Math.sin(a)*w])}line(pts,'#9da58e',.007)}
 arc(2.8,2.8,-Math.PI/2,.75);captureLayout('studyArc',()=>arc(8.2,2.9,-Math.PI/2,.75));arc(8.2,6.2,-Math.PI/2,.8);captureLayout('bathArc',()=>arc(9.1,5.3,-Math.PI/2,.75));arc(3.55,5.6,-Math.PI/2,.75);
 function rug(x,z,w,d,c){box(x,.025,z,w,.025,d,c);for(let i=0;i<5;i++)box(x-w/2+.08+i*.025,.041,z,.008,.004,d-.12,'#d5cfba')}
 function cabinet(x,z,w,d,h,c='#c1a77f',rot=0){const g=local(x,z,rot);box(0,h/2,0,w,h,d,c,g);box(0,h+.025,0,w+.025,.05,d+.025,'#e4dcc8',g);let n=Math.ceil(w/.5);for(let i=1;i<n;i++)box(-w/2+w*i/n,h/2,-d/2-.006,.012,h-.08,.01,'#ac997a',g);for(let i=0;i<n;i++)box(-w/2+w*(i+.5)/n,h*.65,-d/2-.022,.09,.012,.03,'#687060',g).userData.naturalOnly=true;return g}
 function bed(x,z,w,len,rot,c){const g=local(x,z,rot);box(0,.17,0,w+.08,.26,len+.1,'#bca07e',g);box(0,.39,0,w,.23,len,'#f5f0df',g);box(0,.99,-len/2-.045,w+.16,1.2,.1,c,g);box(0,.54,.22,w+.025,.08,len-.45,'#e2e1cd',g);for(const xx of [-w*.25,w*.25])box(xx,.58,-len/2+.35,w*.43,.13,.44,'#faf7e9',g);box(0,.59,.63,w+.04,.07,.48,c,g);return g}
 function bedside(x,z,c='#bca07e'){cyl(x,.26,z,.23,.48,c);cyl(x,.56,z,.065,.1,'#9a875e');cyl(x,.72,z,.14,.2,'#f3e6c7',home,.10)}
 // MASTER LAYOUT START. Interior faces x=8.29..11.59: user-assumed 3.30 m clear width.
 function compactBed(x,z){const g=local(x,z,Math.PI/2);g.name='master-bed-head-west';box(0,.17,-.005,1.84,.26,2.03,'#bca07e',g);box(0,.39,0,1.8,.23,2,'#f5f0df',g);box(0,.84,-1.025,1.88,.95,.03,'#9da48d',g);box(0,.54,.23,1.82,.08,1.5,'#e2e1cd',g);for(const xx of [-.45,.45])box(xx,.58,-.65,.76,.13,.44,'#faf7e9',g);box(0,.59,.65,1.82,.07,.45,'#9da48d',g);return g}
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
  return g;
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
  const stool=local(11.34,6.7);stool.name='vanity-stool';
  cyl(0,.42,0,.16,.08,'#9da48d',stool);
  for(const x of [-.095,.095])for(const z of [-.095,.095])box(x,.19,z,.025,.38,.025,'#687060',stool);
  return {furniture:g,stool};
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
 vanityUseZone=box(10.73,.036,6.7,.78,.008,.62,'#ba946c',home,{transparent:true,opacity:.2,depthWrite:false});vanityUseZone.visible=false;
 line([[8.29,.055,9.69],[11.59,.055,9.69]],'#65705e',.009);
 for(const x of [8.29,11.59])line([[x,.055,9.6],[x,.055,9.78]],'#65705e',.009);
 addLabel('master','净宽 330 cm · 暂定',[9.6,.1,9.69]);
 addLabel('master','屏风＋窄桌 · 桌深 24 cm',[8.765,2.08,6.38]);
 addLabel('master','转角净距 ≈ 82 cm',[9.65,.08,6.2]);
 addLabel('master','L 形衣柜',[10.5,2.42,5.65]);
 addLabel('master','内嵌梳妆位',[11.18,.85,6.7]);
 // MASTER LAYOUT END
 // Guest room keeps a proper bed and enclosed storage.
 rug(1.3,1.65,2.25,2.1,'#d1cebd');clearanceItems.guestBed=bed(1.0,1.3,1.35,2,0,'#c6ab8c');clearanceItems.guestWardrobe=cabinet(1.27,3.4,2.3,.6,2.15,'#c5ac86',Math.PI);cabinet(2.45,2.8,.4,.7,.73,'#c2a77e',Math.PI/2);
 function desk(x,z,w,d,rot=0){const g=local(x,z,rot);box(0,.75,0,w,.065,d,'#c5a87d',g);for(const xx of [-w/2+.08,w/2-.08])for(const zz of [-d/2+.06,d/2-.06])box(xx,.37,zz,.045,.74,.045,'#666f60',g);return g}
 function chair(x,z,rot=0,c='#7e8a74'){const g=local(x,z,rot);box(0,.45,0,.44,.11,.43,c,g);box(0,.72,.2,.44,.5,.07,c,g);for(let xx of [-.16,.16])for(let zz of [-.16,.16])box(xx,.22,zz,.035,.44,.035,'#a28c68',g);return g}
 desk(9.85,.57,2.6,.65);for(const x of [9.2,10.5]){box(x,1.12,.48,.62,.4,.045,'#35443e');box(x,1.12,.507,.57,.35,.006,'#9fb8ae');box(x,.86,.48,.035,.16,.04,'#5e665d');box(x,.8,.49,.23,.025,.14,'#5e665d');box(x,.795,.75,.42,.015,.13,'#ecece1');clearanceItems.studyChair=chair(x,1.38,0,'#7d8b76');cyl(x+.4,.79,.65,.04,.06,'#c3b9a4')}
 // Thin side shelves and books.
 cabinet(11.22,1.85,1.9,.3,1.7,'#c4aa83',Math.PI/2);for(let j=0;j<2;j++)for(let i=0;i<7;i++)box(11.02,1.76+j*.2,1.15+i*.19,.12,.16,.06,['#a9b09a','#d3b28b','#e9e3cf'][i%3]);
 rug(6.38,7.7,2.7,3.0,'#d7d5c1');
 // Sofa, facing the right-side television wall.
 const sofa=local(5.25,7.65,Math.PI/2);box(0,.25,0,2.1,.3,.85,'#cacdb8',sofa);box(0,.72,-.34,2.1,.7,.18,'#dadcc8',sofa);for(let x of [-.99,.99])box(x,.52,0,.17,.62,.83,'#dedfcc',sofa);for(let x of [-.48,0,.48])box(x,.44,.01,.47,.13,.63,'#e8e8d5',sofa);box(-.6,.65,-.14,.37,.37,.17,'#8e9d82',sofa).rotation.z=.14;box(.62,.65,-.14,.33,.33,.16,'#bd956e',sofa).rotation.z=-.17;
 clearanceItems.sofa=sofa;
 const coffee=local(6.45,7.8);box(0,.36,0,.45,.055,.8,'#aa8c63',coffee);for(let z of [-.26,.26])box(0,.18,z,.2,.35,.07,'#aa8c63',coffee);cyl(6.45,.41,7.75,.08,.03,'#eee3c9');box(6.45,.405,8.02,.2,.025,.15,'#89987e');
 clearanceItems.coffee=coffee;clearanceItems.tv=cabinet(7.9,7.9,2.15,.3,.42,'#bda078',Math.PI/2);box(8.07,1.28,7.9,.06,.83,1.45,'#2d3f37');box(8.03,1.28,7.9,.012,.74,1.36,'#728c7c');
 // Side reading chair, lamp, and art.
 chair(6.35,6.05,Math.PI*.85,'#a0aa90');cyl(5.05,.04,6.15,.21,.06,'#65705e');cyl(5.05,.85,6.15,.023,1.65,'#65705e').userData.naturalOnly=true;cyl(5.05,1.68,6.15,.25,.24,'#f1e6cf',home,.18).userData.naturalOnly=true;box(4.72,1.65,7.5,.04,.68,.65,'#ac9270');box(4.745,1.65,7.5,.02,.58,.55,'#e6dbc0');
 // Dining: long axis runs down the drawing, leaving side passages.
 captureLayout('dining',()=>{
 desk(6.4,3.27,.75,1.3);for(const z of [2.87,3.68]){chair(5.85,z,-Math.PI/2,'#b4bba1');clearanceItems.diningChair=chair(6.95,z,Math.PI/2,'#b4bba1')}cyl(6.4,.88,3.28,.075,.18,'#b8a482');line([[6.4,.97,3.28],[6.42,1.15,3.25]],'#788567',.008);ball(6.46,1.13,3.25,.09,.025,.04,'#8b9675');
 });
 cabinet(3.04,4.56,1.25,.35,1.5,'#bea37c',-Math.PI/2);box(2.87,.045,4.8,.3,.06,.4,'#3d4740');box(2.86,1.12,4.45,.04,.55,.4,'#c4d1bf',home, {metalness:.3});
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
 for(const [id,point] of Object.entries({guest:[1.5,.7,2.5],kitchen:[6.4,.8,1.4],study:[9.85,.7,2.25],dining:[6.4,.6,4.55],baths:[9.55,.65,4.5],master:[9.75,.8,8.8],living:[6.65,.7,8.7],balcony:[6.4,.5,11.5]})){addLabel(id,rooms[id].name.replace(/ · .*/,''),point)}
 setupInput();resize();new ResizeObserver(resize).observe($('#viewer'));window.__homeDesign={rooms,scene,renderer,camera,selectRoom,state,goal,labels,pickFloors};
}
function addLabel(id,text,point,cat=false){const b=document.createElement('button');b.className='room-label';b.textContent=text;b.title=cat?'猫咪资源预留位置':`查看${text}设计`;if(!cat){b.dataset.room=id;b.onclick=e=>{e.stopPropagation();selectRoom(id)}}else b.onclick=()=>toast('猫咪资源位置需结合日常开门习惯与实际使用调整');$('#labels').appendChild(b);labels.push({id,el:b,p:new THREE.Vector3(...point),cat})}
function resize(){if(!renderer)return;const rect=$('#viewer').getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;dirty=true}
function updateCamera(){if(walkMode){updateWalkCamera();return}if(privacyView){updatePrivacyCamera();return}const aspect=camera.aspect||1;let vertical=aspect<.8?state.span*1.4:Math.max(state.span*.8,state.span/aspect);camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();const distance=25,px=Math.sin(state.phi)*Math.sin(state.theta)*distance,pz=Math.sin(state.phi)*Math.cos(state.theta)*distance;camera.position.set(state.cx+px,Math.cos(state.phi)*distance,state.cz+pz);camera.up.set(0,1,0);camera.lookAt(state.cx,0,state.cz)}
function animate(now=0){requestAnimationFrame(animate);let moving=walkMode?tickWalk(now):false;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;for(const k of Object.keys(state)){const diff=goal[k]-state[k];if(Math.abs(diff)>.00015){state[k]+=diff*(reduced?1:.12);moving=true}}if(!dirty&&!moving)return;updateCamera();if(clearanceGroup)updateClearances();renderer.render(scene,camera);const rect=$('#viewer').getBoundingClientRect();for(const l of labels){const p=l.p.clone().project(camera);l.el.style.display=(l.clearance&&!clearanceVisible(l))||(l.detailRoom&&selected!==l.detailRoom)||(l.layout&&l.layout!==layoutMode)||walkMode||privacyView||(l.cat&&!catGroup.visible)||p.z>1||p.z< -1||(l.el.textContent.startsWith('屏风＋窄桌')&&!privacyEnabled)?'none':'';l.el.style.left=(p.x*.5+.5)*rect.width+'px';l.el.style.top=(-p.y*.5+.5)*rect.height+'px';l.el.style.opacity=l.cat?'1':selected!=='all'&&l.el.dataset.room!==selected?'.25':'1'}if(clearanceGroup)positionClearanceLabels(rect);dirty=false}
function setupInput(){const canvas=$('#scene'),pointers=new Map();let last=null,down=null,pinch=0,mid=null;
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
function setVanityUse(value){vanityInUse=value;vanityStool.position.x=value?10.78:11.34;vanityUseZone.visible=value;$('#vanity-toggle').setAttribute('aria-pressed',String(value));$('#vanity-toggle').textContent=value?'收起梳妆凳':'拉出梳妆凳';dirty=true}
function reset(){if(walkMode)exitWalk();if(privacyView)exitPrivacyView();setPrivacyEnabled(true);setVanityUse(false);selected='all';view(false);wallFull=false;setWalls();night=false;setNight();catGroup.visible=false;humanGroup.visible=false;for(const id of ['cat-toggle','human-toggle','wall-toggle'])$('#'+id).setAttribute('aria-pressed','false');$('#wall-toggle').textContent='完整墙高';selectRoom('all');goal.theta=.16;goal.phi=.71;goal.span=17;dirty=true}
function capture(){renderer.render(scene,camera);const out=document.createElement('canvas'),source=renderer.domElement;out.width=source.width;out.height=source.height+90;const c=out.getContext('2d');c.fillStyle=night?'#354139':currentStyle==='modern'?'#e8ebea':'#efeee5';c.fillRect(0,0,out.width,out.height);c.drawImage(source,0,0);c.fillStyle=night?'#f7f3df':'#365c4b';c.font='24px sans-serif';c.fillText('栖间 · '+styleNames[currentStyle]+' · '+rooms[selected].name,35,out.height-48);c.font='15px sans-serif';c.fillText('为沙耶设计 / 概念模型 · 尺寸与结构待现场核实',35,out.height-22);const a=document.createElement('a');a.href=out.toDataURL('image/png');a.download='栖间-'+styleNames[currentStyle]+'-'+rooms[selected].name.replaceAll(' · ','-')+'.png';a.click();toast('已生成当前视角 PNG')}

let printDetails=[];window.addEventListener('beforeprint',()=>{printDetails=[...document.querySelectorAll('details')].map(d=>[d,d.open]);printDetails.forEach(([d])=>d.open=true)});window.addEventListener('afterprint',()=>printDetails.forEach(([d,open])=>d.open=open));

setupStyles();
