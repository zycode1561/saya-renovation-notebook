const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(__dirname+'/../'+p,'utf8');
const app=read('dist/app.js'),model=read('dist/home/model.js');
// Exercise the actual view switcher with DOM/render adapters, without changing storage.
const elements=new Map();
const $=id=>{if(!elements.has(id))elements.set(id,{hidden:false,value:'',textContent:'',classList:{toggle(){}},setAttribute(){}});return elements.get(id)};
const state={view:'library',stage:'厨房',type:'攻略',query:'台面',imagesOnly:true,sort:'newest'};
const calls=[];
const ctx={state,$,workspaceState:new Map(),document:{querySelectorAll:()=>[]},window:{scrollY:740,scrollTo(o){this.scrollY=o.top}},renderStages(){},renderLibrary(){},renderChecklist(){},syncHomeWorkspace(){calls.push(state.view)}};
vm.createContext(ctx);vm.runInContext(app.slice(app.indexOf('function setView('),app.indexOf('function setStage(')),ctx);
ctx.setView('home');assert.equal(ctx.window.scrollY,0);assert.equal($('home-page').hidden,false);assert.equal($('library').hidden,true);
ctx.window.scrollY=340;ctx.setView('library');
assert.deepEqual([state.stage,state.type,state.query,state.imagesOnly,state.sort],['厨房','攻略','台面',true,'newest']);assert.equal(ctx.window.scrollY,740);assert.equal($('search-input').value,'台面');
ctx.setView('home');assert.equal(ctx.window.scrollY,340);ctx.setView('saved');assert.equal(state.query,'');ctx.setView('library');assert.equal(state.query,'台面');
assert.equal(app.includes("localStorage.clear("),false);
// Run the emitted frame loop and lifecycle, including idempotent resumes and zero-size resize.
const queued=new Map();let next=0,renders=0,resizes=0,clears=0;
const sceneNode={classList:{remove(){}},getBoundingClientRect:()=>({width:640,height:540})};
const life={clearanceGroup:null,componentActive:true,frame:0,activeModel:true,dirty:true,walkMode:false,labels:[],state:{cx:3},goal:{cx:3},renderer:{render(){renders++},setSize(){resizes++}},scene:{},camera:{},root:{querySelectorAll:()=>[]},$:()=>sceneNode,clearWalkInput(){clears++},clearOrbitInput(){clears++},toast:{},clearTimeout(){},resize:null,matchMedia:()=>({matches:false}),updateCamera(){},requestAnimationFrame(fn){queued.set(++next,fn);return next},cancelAnimationFrame(id){queued.delete(id)}};
vm.createContext(life);
const animate=model.slice(model.indexOf('function animate('),model.indexOf('function setupInput('));
const resize=model.slice(model.indexOf('function resize('),model.indexOf('function updateCamera('));
const lifecycle=model.slice(model.indexOf('function setActive(value)'),model.indexOf('return {setActive,get active'));
vm.runInContext(resize+animate+lifecycle,life);
life.animate();assert.equal(renders,1);assert.equal(queued.size,1);
life.setActive(false);assert.equal(queued.size,0);assert.equal(clears,2);const before=[renders,resizes];life.resize();life.animate();assert.deepEqual([renders,resizes],before);
life.setActive(true);assert.equal(queued.size,1);assert.equal(renders,2);assert.equal(resizes,1);life.setActive(true);assert.equal(queued.size,1);
assert.equal(life.state.cx,3);life.setActive(false);sceneNode.getBoundingClientRect=()=>({width:0,height:0});life.setActive(true);assert.equal(resizes,1);assert.equal(Number.isNaN(life.camera.aspect),false);
// Isolation and content references are build contracts, in addition to browser checks.
assert(!model.includes("$('#privacy-orbit').click()"),'Loading the component must not scroll the active workspace');
assert(!model.includes('window.__homeDesign'));assert(!model.includes('document.querySelector'));assert(!read('dist/home/view.html').includes('<iframe'));
const context={window:{}};vm.createContext(context);vm.runInContext(read('dist/data.js'),context);
const ids=new Set(context.window.RENOVATION_NOTES.map(n=>n.id));
const html=read('dist/index.html');const section=html.slice(html.indexOf('id="home-page"'),html.indexOf('<aside class="bottom-note">'));
for(const [,id] of section.matchAll(/data-open="([^"]+)"/g))assert(ids.has(id),'Related note must exist: '+id);
console.log('PASS: independent filters/scroll, native isolation, valid related notes, pause/cancel, input cleanup, idempotent resume and zero-size resize.');

const version="home-20261027f";for(const file of ["dist/app.js","dist/index.html","dist/home-workspace.js"]){const versions=read(file).match(/home-\d{8}[a-z]?/g);assert(versions?.length);assert(versions.every(v=>v===version),file+" cache mismatch")}
