'use strict';
const assert=require('node:assert/strict'),P=require('../dist/personal-state.js'),S=require('../dist/github-store.js'),N=require('../dist/note-search.js');
const empty=P.initial();
let doc=P.mutate(empty,{type:'migrate',saved:['old','old'],checks:['task']});
assert.deepEqual(empty,P.initial());assert.deepEqual(doc.saved,{old:true});
doc=P.mutate(doc,{type:'set',group:'saved',id:'old',value:false});
doc=P.mutate(doc,{type:'set',group:'checks',id:'task',value:false});
doc=P.mutate(doc,{type:'migrate',saved:['old','new'],checks:['task','other']});
assert.equal(doc.saved.old,false);assert.equal(doc.checks.task,false);assert.equal(doc.saved.new,true);
assert.deepEqual(P.mutate(doc,{type:'reset-checks'}).checks,{task:false,other:false});
assert.throws(()=>P.normalize({version:1,saved:[],checks:{}}));assert.throws(()=>P.normalize({version:1,saved:{a:'yes'},checks:{}}));
const note={id:'a',title:'设计',stage:'准备',type:'攻略',summary:'概述',points:[],sections:[{title:'细节',items:[{text:'隐蔽正文关键字'}],tables:[{rows:[['独有表格词']]}]}]};
const state={view:'library',stage:'预算',type:'all',query:'隐蔽正文关键字',searchScope:'all'};
assert.equal(N.filter([note],state,new Set()).length,1);assert.equal(N.filter([note],{...state,searchScope:'stage'},new Set()).length,0);
assert.equal(N.filter([note],{...state,query:'独有表格词'},new Set()).length,1);
assert.equal(N.filter([note],{...state,view:'saved'},new Set()).length,0);
assert.equal(N.filter([note],{...state,view:'saved'},new Set(['a'])).length,1);
assert.equal(N.filter([note],{...state,type:'避坑'},new Set()).length,0);
assert.equal(N.filter([note],{...state,query:''},new Set()).length,0,'Blank search preserves browsing stage');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function run(){
 let puts=0,gets=0,remote=P.initial();
 const result=await P.write({token:'test-only',action:{type:'set',group:'checks',id:'task',value:true},fetch:async(url,o)=>{
  if(o.method!=='PUT')return {ok:true,json:async()=>({sha:String(++gets),content:S.encode(remote)})};
  const body=JSON.parse(o.body);assert.equal(body.sha,String(gets));
  if(++puts===1){remote.saved.other=true;return {ok:false,status:409};}
  return {ok:true};
 }});assert.equal(puts,2);assert.equal(result.saved.other,true);assert.equal(result.checks.task,true);
 let createBody;
 const created=await P.write({token:'test-only',action:{type:'set',group:'saved',id:'first',value:true},fetch:async(url,o)=>{if(o.method!=='PUT')return {ok:false,status:404};createBody=JSON.parse(o.body);return {ok:true};}});
 assert(!('sha' in createBody));assert(created.saved.first);
 let states=[];S.subscribe(list=>{states=list;});
 await assert.rejects(P.load({fetch:async()=>({ok:false,status:503})}));assert.equal(states.find(s=>s.path==='personal-state.json').state,'error');
 await assert.rejects(P.write({token:'test-only',action:{type:'reset-checks'},fetch:async()=>({ok:false,status:403})}));
 assert.equal(states.find(s=>s.path==='personal-state.json').state,'error');
 // An older in-flight read cannot replace a newly acknowledged write.
 let releaseRead;
 const pending=P.load({fetch:()=>new Promise(resolve=>{releaseRead=()=>resolve({ok:true,json:async()=>({sha:'old',content:S.encode(P.initial())})});})});
 await flush();
 const saved=await P.write({token:'test-only',action:{type:'set',group:'saved',id:'latest',value:true},fetch:async(url,o)=>o.method==='PUT'?{ok:true}:{ok:true,json:async()=>({sha:'new',content:S.encode(P.initial())})}});
 releaseRead();assert.deepEqual(await pending,saved);
 // A refresh started during a write waits for it, then reads the committed record.
 let finishPut,readCalls=0;
 const writing=P.write({token:'test-only',action:{type:'set',group:'checks',id:'latest-check',value:true},fetch:async(url,o)=>o.method==='PUT'?new Promise(resolve=>{finishPut=()=>resolve({ok:true});}):{ok:true,json:async()=>({sha:'s',content:S.encode(saved)})}});
 await flush();
 const refresh=P.load({fetch:async()=>{readCalls++;return {ok:true,json:async()=>({sha:'fresh',content:S.encode(P.mutate(saved,{type:'set',group:'checks',id:'latest-check',value:true}))})};}});
 await flush();assert.equal(readCalls,0);finishPut();await writing;assert((await refresh).checks['latest-check']);
 console.log('PASS: full-text/stage search, GitHub creation, migration tombstones, conflict merge, failure status and refresh/write races.');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
