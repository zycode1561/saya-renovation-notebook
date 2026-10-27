const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const THREE=require('./vendor/three.min.js');
const read=n=>fs.readFileSync(__dirname+'/'+n,'utf8');
const source=read('app.js');
// Build the actual scene with real Three geometry, without WebGL or a browser.
const geometry=source.slice(source.indexOf(' const mats=new Map();'),source.indexOf(' setupInput();resize();'));
const elements=new Map();const $=s=>{if(!elements.has(s))elements.set(s,{value:s==='#walk-start'?'entry':'',textContent:'',hidden:true,style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},focus(){},scrollIntoView(){},getBoundingClientRect:()=>({width:1200,height:600})});return elements.get(s)};
const context={clearanceItems:{},layoutMode:'original',layoutParts:{},THREE,console,Math,$,matchMedia:()=>({matches:true}),document:{querySelectorAll:()=>[]},toast(){},selectRoom(){},exitPrivacyView(){},syncModernLighting(){},fillDetail(){},activeModel:false,privacyView:null,topView:false,walkMode:false,wallFull:true,selected:'master',window:{},
 scene:new THREE.Scene(),home:new THREE.Group(),wallGroup:new THREE.Group(),catGroup:new THREE.Group(),humanGroup:new THREE.Group(),nightLights:new THREE.Group(),pickFloors:[],allMeshes:[],wallPieces:[],addLabel(){},labels:[],
 camera:new THREE.OrthographicCamera(),modernCeiling:null,vanityUseZone:null,vanityStool:null,privacyEnabled:true,
 renderer:{},state:{},goal:{}};
context.home.add(context.wallGroup,context.catGroup,context.humanGroup,context.nightLights);
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('const rooms='),source.indexOf("let selected='all'")),context);
vm.runInContext(source.match(/ function captureLayout[^\n]+/)[0]+'\nconst T=THREE;\n'+geometry,context);
vm.runInContext(source.match(/function setWalls\(\)\{[^\n]+/)[0]+';setWalls();',context);
vm.runInContext(read('walkthrough.js'),context);
const run=s=>vm.runInContext(s,context);
run('refreshWalkGeometry()');
for(const name of run('Object.keys(walkStarts)'))assert(run(`canWalkAt(...walkStarts[${JSON.stringify(name)}])`),'Blocked start: '+name);
assert(!run('canWalkAt(8.2,8.1)'),'Interior wall must collide');
assert(!run('canWalkAt(9.34,8.25)'),'Bed must collide');
assert(!run('canWalkAt(8.765,6.38)'),'Entrance screen must collide');
assert(!run('canWalkAt(6.4,12.1)'),'Cannot leave the floor footprint');
assert(run('canWalkAt(7.1,9.9)'),'Floor seams must remain traversable');
run('walk.x=7.1;walk.z=8.8;moveWalk(3,0)');
assert(run('walk.x<7.6'),'Long step tunneled through TV cabinet or wall');
assert(run('canWalkAt(walk.x,walk.z)'),'Movement left body inside an obstacle');
// Follow an actual clear route through the master doorway, around the screen.
run('walk.x=7.65;walk.z=5.65;moveWalk(1.75,0);moveWalk(0,.35);moveWalk(.30,.65)');
assert(run('walk.x>9.4&&walk.z>6.6'),'Master doorway / screen route blocked');
assert(run('canWalkAt(walk.x,walk.z)'));
run('activeModel=true;enterWalk();updateWalkCamera()');assert(context.walkMode);assert.equal(context.camera.type,'PerspectiveCamera');
assert(Math.abs(context.camera.position.y-1.655)<1e-8);
const hFov=c=>THREE.MathUtils.radToDeg(2*Math.atan(Math.tan(THREE.MathUtils.degToRad(c.fov)/2)*c.aspect));
assert(Math.abs(hFov(context.camera)-75)<1e-8);
elements.get('#viewer').getBoundingClientRect=()=>({width:390,height:620});run('updateWalkCamera()');
assert(Math.abs(hFov(context.camera)-75)<1e-8,'Horizontal FOV changed on portrait screen');
run('walk.fov=110;walk.eye=1.85;updateWalkCamera()');assert(Math.abs(context.camera.position.y-1.855)<1e-8);assert(Math.abs(hFov(context.camera)-110)<1e-8);
const oldX=run('walk.x');run("walkKeys.add('KeyW');walk.lastTime=100;tickWalk(150)");assert(run('walk.x')>oldX,'Forward key did not move relative to heading');
run('clearWalkInput()');assert.equal(run('walkKeys.size'),0);
run('exitWalk()');assert.equal(context.walkMode,false);assert.equal(context.camera.type,'OrthographicCamera');
console.log('PASS: all 8 starts; wall, bed and screen collisions; floor edges and seams; long-step collision; open master doorway and screen route.');
console.log('PASS: metre-scaled eye height; horizontal FOV 75/110 degrees in landscape and portrait; keyboard movement; input cleanup; camera restoration.');

module.exports={context,run,read,elements};
