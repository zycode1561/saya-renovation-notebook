const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const T=require('./vendor/three.min.js'),source=fs.readFileSync(__dirname+'/app.js','utf8');
const helpers=source.split('\n').filter(l=>/^ (const mats=|function (box|cyl|local|cabinet|compactBed)\()/.test(l));
const lBuilder='function lWardrobe(){'+source.split(' function lWardrobe(){')[1].split(' const masterBed=')[0];
const vanityBuilder='function createMasterVanity(){'+source.split(' function createMasterVanity(){')[1].split(' const masterVanity=createMasterVanity();')[0];
const setup=['masterBed','masterWardrobe'].map(n=>source.match(new RegExp('const '+n+'=[^;]+;'))[0]);
const context={T,home:new T.Group(),allMeshes:[],Math};vm.createContext(context);
vm.runInContext(helpers.join('\n')+'\n'+lBuilder+'\n'+setup.join('\n')+'\n'+vanityBuilder+'\nthis.items={masterBed,masterWardrobe,vanity:createMasterVanity()};',context);
context.home.updateMatrixWorld(true);const {masterBed,masterWardrobe,vanity}=context.items;
const bounds=o=>new T.Box3().setFromObject(o),rect=(a,b)=>new T.Box3(new T.Vector3(...a),new T.Vector3(...b));
const meshes=o=>{const b=[];o.traverse(m=>{if(m.isMesh)b.push(bounds(m))});return b};
const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>1e-6);
const bed=bounds(masterBed),wardrobe=bounds(masterWardrobe),desk=bounds(vanity.furniture);
const approach=rect([8.29,0,5.39],[9.9,2.1,6.3]),sweep=rect([8.9,0,4.3],[9.9,2.1,5.39]);
const interior=rect([8.29,-1e-6,5.39],[11.59,2.7,9.81]);
assert(source.includes('wall(11.68,7.6,.18,4.6)')&&source.includes('wall(8.2,8.1,.18,3.6)'));
assert(Math.abs(11.68-.09-(8.2+.09)-3.3)<1e-8);
assert(source.includes('wall(8.55,5.3,.7,.18)')&&source.includes('wall(10.79,5.3,1.78,.18)'));
for(const obj of [masterBed,masterWardrobe,vanity.furniture])for(const b of meshes(obj)){assert(interior.containsBox(b),'Outside master room');assert(!overlap(b,approach)&&!overlap(b,sweep),'Bathroom access blocked');}
const groups=[meshes(masterBed),meshes(masterWardrobe),meshes(vanity.furniture)];
for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++)for(const a of groups[i])for(const b of groups[j])assert(!overlap(a,b),'Separate furniture meshes overlap');
// Explicit L: continuous upper cabinet coverage around the corner, not two detached rectangles.
const upper=meshes(masterWardrobe).filter(b=>b.min.y<2.1&&b.max.y>2.1);
for(const [x,z] of [[10.05,5.7],[10.96,5.7],[11.05,5.7],[11.43,6.1],[11.43,6.34],[11.43,6.36],[11.43,7.0]])assert(upper.some(b=>b.containsPoint(new T.Vector3(x,2.1,z))),'L-shaped overhead storage is disconnected');
assert(Math.abs(wardrobe.max.x-wardrobe.min.x-1.58)<1e-6);
assert(Math.abs(wardrobe.max.z-wardrobe.min.z-1.63)<1e-6);
assert(Math.abs(bed.max.x-bed.min.x-2.05)<1e-6);
assert(masterBed.children.some(m=>Math.abs(m.geometry?.parameters.width-1.8)<1e-6&&Math.abs(m.geometry?.parameters.depth-2)<1e-6));
assert(Math.abs((11.59-bed.max.x)-1.24)<1e-6,'Foot space mismatch');
assert(Math.abs((bed.min.z-6.02)-1.29)<1e-6,'North cabinet aisle mismatch');
assert(Math.abs((bed.min.z-desk.max.z)-.26)<1e-6,'Desk-end gap mismatch');
assert(9.81-bed.max.z>.619,'Window-side space below 620 mm');
const knee=rect([11.15,.47,6.39],[11.53,.65,7.0]);
for(const b of meshes(vanity.furniture))assert(!overlap(knee,b),'Knee space blocked');
const stored=bounds(vanity.stool);assert(stored.min.x>=11.13&&stored.max.x<=11.55&&stored.max.y<.66&&stored.min.z>=6.35&&stored.max.z<=7.03);
const use=rect([10.34,0,6.39],[11.12,1.8,7.01]);
for(const b of [...groups.flat(),approach,sweep])assert(!overlap(use,b),'Dressing use allowance blocked');
vanity.stool.position.x=10.78;context.home.updateMatrixWorld(true);assert(use.containsBox(bounds(vanity.stool)));
assert(source.includes('vanityStool.position.x=value?10.78:11.34'));
assert(!source.includes('footWardrobe()'),'Obsolete foot wardrobe remains');
console.log('PASS: continuous L cabinet 1580 x 1630 mm; 1800 x 2000 mattress; 3300 mm assumed clear room width.');
console.log('PASS: bathroom approach/sweep; separate furniture meshes; knee space; stored and pulled stool.');
assert(bed.min.x>8.299&&bed.min.x<8.301,'Headboard must sit by the west living-room wall');
console.log('PASS: headboard moved to west wall; north clearance 1290 mm; east foot space 1240 mm; window side 620 mm.');
// Entrance screen: validate the rendered volume, door approaches and walking envelopes.
const screenBuilder='function createPrivacyScreen(){'+source.split(' function createPrivacyScreen(){')[1].split(' privacyScreen=createPrivacyScreen();')[0];
vm.runInContext(screenBuilder+';this.screen=createPrivacyScreen();',context);context.home.updateMatrixWorld(true);
const screen=bounds(context.screen);
for(const [k,size] of [['x',.95],['y',2],['z',.32]])assert(Math.abs(screen.max[k]-screen.min[k]-size)<1e-6);
for(const b of [...groups.flat(),approach,sweep,use,stored,bounds(vanity.stool)])assert(!overlap(screen,b),'Screen blocks furniture or access');
assert(interior.clone().expandByScalar(1e-6).containsBox(screen));
assert(Math.abs(use.min.x-screen.max.x-1.10)<1e-6);
const entrySweep=rect([8.29,0,5.4],[9.0,2.1,6.3]);assert(!overlap(screen,entrySweep),'Screen blocks bedroom door swing');
const top=bounds(context.screen.getObjectByName('screen-console-top'));
assert(Math.abs(top.max.x-top.min.x-.86)<1e-6&&Math.abs(top.max.z-top.min.z-.24)<1e-6);
assert(Math.abs(top.max.y-.8)<1e-6);
const cabinetPinch=Math.hypot(10-screen.max.x,screen.min.z-6.02);
assert(cabinetPinch>.82,'Cabinet / screen corner pinch below target');
// Search the changed entry-to-east-foot route with the vanity stool stored.
vanity.stool.position.x=11.34;context.home.updateMatrixWorld(true);
const routeObstacles=[...groups.flat().filter(b=>b.max.y>.05&&b.min.y<1.9),...meshes(context.screen),...meshes(vanity.stool)];
function routeExists(obstacles,radius=.4){
 const step=.01,x0=8.29+radius,z0=5.39+radius,nx=Math.floor((3.3-2*radius)/step)+1,nz=Math.floor((4.42-2*radius)/step)+1;
 const clear=(ix,iz)=>{const x=x0+ix*step,z=z0+iz*step;return obstacles.every(b=>Math.hypot(Math.max(b.min.x-x,0,x-b.max.x),Math.max(b.min.z-z,0,z-b.max.z))>=radius-1e-7)};
 const start=[Math.round((8.74-x0)/step),Math.round((5.82-z0)/step)],queue=[start],seen=new Set([start.join(',')]);if(!clear(...start))return false;
 for(let head=0;head<queue.length;head++){const [ix,iz]=queue[head];if(Math.abs(x0+ix*step-10.95)<.04&&Math.abs(z0+iz*step-8.25)<.04)return true;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=ix+dx,z=iz+dz,key=x+','+z;if(x<0||z<0||x>=nx||z>=nz||seen.has(key)||!clear(x,z))continue;seen.add(key);queue.push([x,z])}}
 return false;
}
assert(routeExists(routeObstacles),'No continuous 800 mm route from entry to the new east bed foot with stool stored');
assert(!routeExists([...routeObstacles,use]),'Keep vanity-use limitation documented: full use reserve reduces the east entry route');
// Full-height walls are essential: cutaway walls would give a false privacy result.
const privacySource=fs.readFileSync(__dirname+'/privacy.js','utf8');
const viewDefs=privacySource.split('const privacyViews=')[1].split('\nlet orbitCamera')[0];
const viewContext={};vm.createContext(viewContext);vm.runInContext('this.views='+viewDefs,viewContext);
const walls=[];const wallPattern=/wall\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)(?:,([\d.]+))?\)/g;
for(const m of source.matchAll(wallPattern)){const [x,z,w,d,h]=m.slice(1).map((s,i)=>s===undefined?(i===4?2.7:0):+s);walls.push(rect([x-w/2,0,z-d/2],[x+w/2,h,z+d/2]));}
const mattress=bounds(masterBed.children.find(m=>m.geometry?.parameters.width===1.8&&m.geometry?.parameters.depth===2));
function countVisible(eye,objects){let visible=0;for(let ix=0;ix<=8;ix++)for(let iz=0;iz<=8;iz++){const start=new T.Vector3(...eye),target=new T.Vector3(mattress.min.x+ix*(mattress.max.x-mattress.min.x)/8,.65,mattress.min.z+iz*(mattress.max.z-mattress.min.z)/8),delta=target.clone().sub(start),ray=new T.Ray(start,delta.clone().normalize());if(!objects.some(b=>{const hit=ray.intersectBox(b,new T.Vector3());return hit&&hit.distanceTo(start)<delta.length()}))visible++}return visible}
const scores=Object.entries(viewContext.views).map(([id,v])=>[id,countVisible(v.eye,walls),countVisible(v.eye,[...walls,...meshes(context.screen)])]);
assert(scores.find(a=>a[0]==='entry')[1]>0,'Door view needs a visible baseline');assert.equal(scores.find(a=>a[0]==='entry')[2],0,'Screen should block selected doorway view');
assert(scores.some(a=>a[1]>a[2]),'Screen has no verified benefit');
const oblique=viewContext.views.oblique.eye;
console.log('PASS: framed 950 x 2000 screen with 860 x 240 console; door sweep clear; 800 mm east-foot route with stool stored; vanity-use limitation explicit.');
console.log('Bed-surface sample counts before/after screen (81 per view):',JSON.stringify(scores),'oblique standing:',countVisible(oblique,[...walls,...meshes(context.screen)]));
