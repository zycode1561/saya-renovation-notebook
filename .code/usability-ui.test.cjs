'use strict';
// npm install --prefix /tmp/zh-notes-ui-test --ignore-scripts jsdom
// NODE_PATH=/tmp/zh-notes-ui-test/node_modules node .code/usability-ui.test.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM,VirtualConsole}=require('jsdom');
const source=fs.readFileSync('dist/index.html','utf8'),S=require('../dist/github-store.js');
const flush=async()=>{for(let i=0;i<15;i++)await new Promise(r=>setImmediate(r));};
async function boot({token=true,legacy=true,failMigration=false}={}){
 const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(source,{url:'https://test.invalid/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
 const w=dom.window,ctx=dom.getInternalVMContext();
 w.matchMedia=q=>({matches:q.includes('max-width:600px'),addEventListener(){},removeEventListener(){}});
 w.ResizeObserver=class{observe(){}disconnect(){}};w.scrollTo=()=>{};
 w.HTMLElement.prototype.scrollIntoView=function(){};w.HTMLElement.prototype.scrollTo=function(){};
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
 w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.confirm=()=>true;
 const files=new Map(['budget.json','checklist.json','user-notes.json'].map(name=>[name,JSON.parse(fs.readFileSync('dist/data/'+name,'utf8'))]));
 let failWrites=failMigration,puts=0;
 w.fetch=async(url,options)=>{
  const path=new URL(url).pathname.split('/').at(-1);
  if(options.method==='PUT'){
   puts++;if(failWrites)return {ok:false,status:503};
   files.set(path,JSON.parse(S.decode(JSON.parse(options.body).content)));return {ok:true};
  }
  return files.has(path)?{ok:true,json:async()=>({sha:'test-sha',content:S.encode(files.get(path))})}:{ok:false,status:404};
 };
 const legacyId='preplanning-roadmap-20261028';
 if(token)w.localStorage.setItem('saya-renovation-gh-token-v1','test-only');
 if(legacy){w.localStorage.setItem('saya-renovation-saved-v1',JSON.stringify([legacyId]));w.localStorage.setItem('saya-renovation-checks-v1',JSON.stringify(['planning-needs']));}
 for(const script of w.document.querySelectorAll('script[src]'))vm.runInContext(fs.readFileSync('dist/'+script.getAttribute('src').split('?')[0],'utf8'),ctx,{filename:script.getAttribute('src')});
 await flush();assert.deepEqual(errors,[]);
 return {dom,w,ctx,files,legacyId,get puts(){return puts;},set failWrites(v){failWrites=v;},$:id=>w.document.getElementById(id),eval:code=>vm.runInContext(code,ctx),close:()=>w.close()};
}
async function run(){
 const x=await boot();
 try{
  assert.equal(x.files.get('personal-state.json').saved[x.legacyId],true);assert.equal(x.files.get('personal-state.json').checks['planning-needs'],true);
  assert.equal(x.w.localStorage.getItem('saya-renovation-saved-v1'),null);assert.equal(x.w.localStorage.getItem('saya-renovation-checks-v1'),null);
  assert.equal(x.$('sync-status').textContent,'GitHub 已同步');
  const ids=[...x.w.document.querySelectorAll('[id]')].map(e=>e.id);assert.equal(ids.length,new Set(ids).size);
  x.$('nav-more').click();assert.equal(x.$('nav-more').getAttribute('aria-expanded'),'true');
  x.w.document.querySelector('[data-view="inspect"]').click();assert.equal(x.$('nav-more').textContent,'验收 ▾');assert.equal(x.$('nav-more').getAttribute('aria-expanded'),'false');assert(!x.$('inspect-page').hidden);
  x.w.document.querySelector('[data-view="checklist"]').click();assert(!x.$('checklist-page').hidden);assert.equal(x.$('breadcrumb').textContent,'开工准备');
  const checkbox=x.w.document.querySelector('[data-check="planning-needs"]');checkbox.checked=false;checkbox.dispatchEvent(new x.w.Event('change',{bubbles:true}));await flush();assert.equal(x.files.get('personal-state.json').checks['planning-needs'],false);
  x.failWrites=true;
  const check2=x.w.document.querySelector('[data-check="planning-needs"]');check2.checked=true;check2.dispatchEvent(new x.w.Event('change',{bubbles:true}));await flush();assert.equal(x.w.document.querySelector('[data-check="planning-needs"]').checked,false);assert(x.$('sync-status').textContent.includes('失败'));
  x.failWrites=false;x.$('sync-refresh').click();await flush();assert.equal(x.$('sync-status').textContent,'GitHub 已同步');
  x.w.document.querySelector('[data-view="library"]').click();
  x.eval("notes.push({...notes[0],id:'test-fulltext',title:'正文测试',summary:'摘要',stage:'准备',sections:[{title:'详情',items:[{text:'独有正文词xyz'}],tables:[]}]})");
  x.eval("setStage('预算')");x.$('search-input').value='独有正文词xyz';x.$('search-input').dispatchEvent(new x.w.Event('input',{bubbles:true}));
  assert(x.$('article-grid').innerHTML.includes('test-fulltext'));
  x.$('search-current-stage').click();assert(!x.$('empty').hidden);assert(!x.$('search-all-stages').hidden);
  x.$('search-all-stages').click();assert(x.$('empty').hidden);assert(x.$('article-grid').innerHTML.includes('test-fulltext'));
  x.$('reset-filters').click();assert.equal(x.$('search-input').value,'');assert.equal(x.eval('state.stage'),'all');
  x.$('add-note').click();x.w.document.querySelector('#user-note-form [name=title]').value='未提交草稿';
  x.w.document.querySelector('[data-sync-settings]').click();assert(x.$('sync-dialog').open);assert(x.$('user-note-dialog').open);
  x.$('close-sync').click();assert.equal(x.w.document.querySelector('#user-note-form [name=title]').value,'未提交草稿');
  x.$('close-user-note').click();
  // A failed refresh must not erase existing records or be labelled successful.
  const before=[...x.$('article-grid').querySelectorAll('[data-note]')].map(e=>e.dataset.note);x.w.fetch=async()=>({ok:false,status:503});x.eval('refreshAll()');await flush();assert(x.$('sync-status').textContent.includes('失败'));assert.deepEqual([...x.$('article-grid').querySelectorAll('[data-note]')].map(e=>e.dataset.note),before);
 }finally{x.close();}
 const y=await boot({token:false});
 try{
  assert.equal(y.puts,0);assert(y.w.localStorage.getItem('saya-renovation-saved-v1'));assert.equal(y.$('sync-status').textContent,'旧记录待同步');
  const result=await y.eval("savePersonal({type:'set',group:'saved',id:'new',value:true})");assert.equal(result,false);assert(y.$('sync-dialog').open);assert.equal(y.puts,0);
  y.$('user-note-token').value='test-only';y.$('sync-form').dispatchEvent(new y.w.Event('submit',{bubbles:true,cancelable:true}));await flush();
  assert(y.files.get('personal-state.json').saved[y.legacyId]);assert.equal(y.w.localStorage.getItem('saya-renovation-saved-v1'),null);
 }finally{y.close();}
 const z=await boot({failMigration:true});
 try{assert(z.w.localStorage.getItem('saya-renovation-saved-v1'));assert(!z.files.has('personal-state.json'));assert(z.$('sync-status').textContent.includes('失败'));}finally{z.close();}
 console.log('PASS: full-page DOM initialization, GitHub migration/rollback, missing-token setup, draft preservation, search scopes/reset and mobile navigation.');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
