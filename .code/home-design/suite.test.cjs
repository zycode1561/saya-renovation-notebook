const assert=require('node:assert/strict'),vm=require('node:vm');
const {context,run,read}=require('./walkthrough.test.cjs');
context.activeModel=false;context.styleMaterials=[];context.window.__homeDesign={};
context.applyStyle=()=>{};
context.addLabel=(id,text,point,cat=false)=>context.labels.push({id,el:{textContent:text,style:{}},p:new context.THREE.Vector3(...point),cat});
vm.runInContext(read('suite.js'),context);
run("buildSuiteModel();setSuiteDoor('bath',true);setSuiteDoor('shower',false);setLayout('suite',false);walk.eye=1.65;refreshWalkGeometry()");
const suiteSource=read('suite.js');
run(suiteSource.slice(suiteSource.indexOf(" $('#suite-study-door').onchange="),suiteSource.indexOf("\n setLayout('suite');")));
run("$('#suite-study-door').checked=true;$('#suite-study-door').onchange();refreshWalkGeometry()");assert(run('canWalkAt(8.2,2.45)'),'Optional study door did not reopen');
run("$('#suite-study-door').checked=false;$('#suite-study-door').onchange();refreshWalkGeometry()");assert(!run('canWalkAt(8.2,2.45)'),'Optional study door did not close');
for(const name of run('Object.keys(walkStarts)'))assert(run(`canWalkAt(...(suiteWalkStarts[${JSON.stringify(name)}]||walkStarts[${JSON.stringify(name)}]))`),'Blocked alternate start: '+name);
// No wet-room traversal is needed between the master entry and the study.
run('walk.x=8.74;walk.z=5.8;moveWalk(0,-3.5)');assert(Math.abs(run('walk.z')-2.3)<1e-7,'Internal corridor blocked');
assert(!run('canWalkAt(8.2,2.45)'),'Single-entry study infill must block the old entrance');
assert(!run('canWalkAt(9.24,3.7)'),'Corridor partition must block movement');
run('walk.x=8.74;walk.z=5.8;moveWalk(.86,.4);moveWalk(.25,.5);moveWalk(.7,.46);moveWalk(.4,1.09)');assert(run('walk.x>10.8&&walk.z>8.1'),'Moved bed foot is unreachable from the suite entry');
assert(!run('canWalkAt(7.91,4.05)'),'Sideboard collision missing');
run('walk.x=7.25;walk.z=4.75;moveWalk(0,-2.4)');assert(run('walk.z<2.36'),'Sideboard / chair aisle blocked');
run('walk.x=8.74;walk.z=4.5;moveWalk(1.04,0)');assert(run('walk.x>9.7'),'Open main bath doorway blocked');
run('moveWalk(1.3,0)');assert(run('walk.x<10.3'),'Closed shower glass did not block movement');
run("setSuiteDoor('shower',true);refreshWalkGeometry();moveWalk(1.2,0)");assert(run('walk.x>10.8'),'Open shower doorway blocked');
assert(run('canWalkAt(walk.x,walk.z)'));
// Closing a door on the body must be refused, including glass doors.
run('walk.x=10.42;walk.z=4.5;walkMode=true');assert.equal(run("setSuiteDoor('shower',false)"),false);
run('walkMode=false;walk.x=9.75;walk.z=4.46');assert.equal(run("setSuiteDoor('shower',false)"),true);
run("setSuiteDoor('bath',false);refreshWalkGeometry()");assert(!run('canWalkAt(9.24,4.5)'),'Closed main bath door collision missing');
run("setSuiteDoor('bath',true);refreshWalkGeometry()");assert(run('canWalkAt(9.24,4.5)'));
const bounds=name=>new context.THREE.Box3().setFromObject(run(`suiteGroup.getObjectByName(${JSON.stringify(name)})`));
context.home.updateMatrixWorld(true);
const top=bounds('sideboard-top'),table=bounds('suite-dining-top');assert(Math.abs(top.min.x-table.max.x-.91)<1e-6);
assert(Math.abs(top.max.x-top.min.x-.4)<1e-6);assert(Math.abs(top.max.z-top.min.z-1.8)<1e-6);
// The fixed and moving glass cover the full 1.9 m span in the closed state.
const fixed=bounds('shower-fixed-glass'),moving=bounds('shower-moving-glass');assert(Math.abs(fixed.max.z-moving.min.z)<1e-6);assert(Math.abs(moving.max.z-fixed.min.z-1.9)<1e-6);
// Check separate fixtures, door openings, and the clear circulation strips.
const overlap=(a,b)=>['x','y','z'].every(k=>Math.min(a.max[k],b.max[k])-Math.max(a.min[k],b.min[k])>1e-6);
for(const name of ['suite-basin-top','suite-wc-cistern','suite-wc-bowl'])for(const glass of [fixed,moving])assert(!overlap(bounds(name),glass),'Dry fixture crosses shower partition');
run("setLayout('original',false);refreshWalkGeometry()");
assert(!run('suiteGroup.visible'));assert(run("layoutParts.dining.every(o=>o.visible)&&layoutParts.bath.every(o=>o.visible)"));
assert(!run('canWalkAt(8.74,3.2)'),'Original study / bath wall was not restored');
assert(run('canWalkAt(8.2,2.45)'),'Original study doorway was not restored');
run("setLayout('suite',false);refreshWalkGeometry()");assert(run('canWalkAt(8.74,3.2)'),'Suite doorway did not return');
console.log('PASS: suite / original comparison, all alternate starts, master-to-study dry corridor, sideboard aisle, dry-room doorway, closed/open shower collision and door-body guard.');
console.log('PASS: sideboard 1800 x 400 mm; 910 mm table-edge clearance; fixed + sliding shower glass close the wet zone; dry fixtures remain outside it.');

// Privacy samples follow the actual moved mattress and the actual framed screen meshes.
vm.runInContext(read('privacy.js'),context);
for(const id of run('Object.keys(privacyViews)')){
 run(`privacyView=${JSON.stringify(id)}`);
 const withScreen=run('privacyVisibility(true)'),withoutScreen=run('privacyVisibility(false)');
 assert(withScreen.visible<=withoutScreen.visible,'Screen makes a selected privacy view worse');
 assert.equal(withScreen.visible,0,'Moved bed is visible at selected viewpoint: '+id);
}
run('privacyView=null');
console.log('PASS: moved-mattress privacy samples at sofa, dining, doorway and oblique presets use actual active suite walls and screen meshes.');
