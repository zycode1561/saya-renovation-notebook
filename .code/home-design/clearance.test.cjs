const assert=require('node:assert/strict'),vm=require('node:vm');
const {context,run,read}=require('./walkthrough.test.cjs');
context.activeModel=false;context.clearanceEnabled=true;context.clearanceGroup=null;context.suiteGroup=null;
vm.runInContext(read('clearance.js'),context);
const rows=()=>run('computeClearances(THREE,clearanceItems,wallPieces,layoutMode,suiteGroup)');
const near=(a,b)=>assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const bounds=o=>new context.THREE.Box3().setFromObject(o);
let data=rows();assert.equal(new Set(data.map(r=>r.room)).size,6);
near(data.find(r=>r.title==='床尾通道').metres,1.24);
near(data.find(r=>r.title==='屏风桌后净距').metres,.65);
near(data.find(r=>r.room==='study').metres,3.11-bounds(context.clearanceItems.studyChair).max.z);
near(data.find(r=>r.room==='dining').metres,8.11-bounds(context.clearanceItems.diningChair).max.x);
assert.equal(data.find(r=>r.title==='床尾通道').text,'床尾通道 1,240 mm');
// A geometry edit must change the result; copied design prose cannot pass this.
context.clearanceItems.studyChair.position.z+=.1;
near(rows().find(r=>r.room==='study').metres,data.find(r=>r.room==='study').metres-.1);
context.clearanceItems.studyChair.position.z-=.1;
// Exercise actual label/line lifecycle and the toolbar handler without WebGL.
context.document.createElement=()=>({style:{},offsetWidth:140,offsetHeight:26});
context.$('#labels').appendChild=()=>{};
const attrs={};context.$('#clearance-toggle').setAttribute=(k,v)=>attrs[k]=v;
run("walkMode=false;privacyView=null;selected='master';setupClearances()");
assert.equal(run('clearanceGroup.children.filter(l=>l.visible).length'),2);
assert(run("clearanceGroup.userData.labels.filter(clearanceVisible).every(l=>l.room==='master')"));
context.$('#clearance-toggle').onclick();run('updateClearances()');assert.equal(attrs['aria-pressed'],'false');assert.equal(run('clearanceGroup.children.filter(l=>l.visible).length'),0);
context.$('#clearance-toggle').onclick();run("selected='dining';updateClearances()");assert.equal(attrs['aria-pressed'],'true');assert.equal(run('clearanceGroup.children.filter(l=>l.visible).length'),1);
run('walkMode=true;updateClearances()');assert.equal(run('clearanceGroup.children.filter(l=>l.visible).length'),0);
run("walkMode=false;privacyView='entry';updateClearances()");assert.equal(run('clearanceGroup.children.filter(l=>l.visible).length'),0);
run("privacyView=null;selected='all';updateClearances()");assert.equal(run('clearanceGroup.children.filter(l=>l.visible).length'),0);
// Load the actual alternate furniture, checking layout switches use its faces.
context.styleMaterials=[];context.window.__homeDesign={};context.applyStyle=()=>{};
vm.runInContext(read('suite.js'),context);run("buildSuiteModel();layoutMode='suite'");
near(rows().find(r=>r.room==='dining').metres,.91);
run("layoutMode='original'");near(rows().find(r=>r.room==='dining').metres,data.find(r=>r.room==='dining').metres);
assert(read('integrated.css').includes('.model-dimension-label:not(.clearance-label)'));
assert(read('app.js').includes('if(clearanceGroup)updateClearances();renderer.render'));
console.log('PASS: six rooms, geometry-derived mm, chair movement, suite dining, toolbar aria state, selected-room lines/labels, walk/privacy suppression and mobile CSS.');

run("selected='master';clearanceItems.screen.visible=false;updateClearances()");assert.equal(run('clearanceGroup.children.filter(l=>l.visible).length'),1);
run('clearanceItems.screen.visible=true;updateClearances()');
for(const l of run('clearanceGroup.userData.labels')){l.el.style.display=run('clearanceVisible') (l)?'':'none';l.el.style.left='150px';l.el.style.top='200px'}
run('positionClearanceLabels({width:320,height:540})');
const visible=run('clearanceGroup.userData.labels.filter(clearanceVisible)');assert(Math.abs(parseFloat(visible[0].el.style.top)-parseFloat(visible[1].el.style.top))>=30);
