'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const B=require('../dist/budget.js'),S=require('../dist/github-store.js');
const empty={version:1,totalBudget:100,entries:[]};
const e={id:'expense-1',name:'  设计费  ',amount:'12345.50',category:'设计',stage:'设计',date:'2026-10-28',notes:'  初稿  '};
assert.equal(B.formatMoney(12345),'¥12,345');assert.equal(B.formatMoney(12345.5),'¥12,345.50');assert.equal(B.formatMoney(-12.01),'-¥12.01');assert.equal(B.formatMoney(0),'¥0');
for(const value of ['2026.10.28','2026-10-28','2026/10/28',' 2026.10.28 ']){assert.equal(B.parseDate(value),'2026-10-28');assert.equal(B.formatDate(value),'2026.10.28');assert.equal(B.entry({...e,date:value}).date,'2026-10-28');}
assert.equal(B.parseDate('2024.02.29'),'2024-02-29');assert.equal(B.formatDate('2000-02-29'),'2000.02.29');
for(const value of ['2026.02.29','1900.02.29','2026/04/31','2026.13.01','2026.00.01','2026.10.00','2026.10.32','2026.10/28','10/28/2026','2026.1.2','','今天',null])assert.throws(()=>B.parseDate(value));
assert.equal(B.parseDate(B.formatDate('2026-10-28')),'2026-10-28');
const normalized=B.entry(e);assert.equal(normalized.name,'设计费');assert.equal(normalized.notes,'初稿');assert.equal(normalized.amount,12345.5);
for(const amount of ['',null,-1,'NaN',Infinity,'1.001','1e3'])assert.throws(()=>B.money(amount));
for(const delta of [{name:''},{category:'未知'},{stage:'入住'},{date:'2026-02-30'},{date:'无效'}])assert.throws(()=>B.entry({...e,...delta}));
assert.throws(()=>B.normalize({version:2,entries:[]}));assert.throws(()=>B.normalize({...empty,entries:[e,e]}));
let doc=B.mutate(empty,{type:'save',entry:e});assert.equal(empty.entries.length,0);assert.deepEqual(B.summary(doc),{totalBudget:100,spent:12345.5,remaining:-12245.5});
doc=B.mutate(doc,{type:'save',entry:{...e,amount:0.1}});doc=B.mutate(doc,{type:'save',entry:{...e,id:'expense-2',amount:0.2}});
assert.equal(doc.entries.length,2);assert.equal(B.summary(doc).spent,0.3);assert.equal(B.aggregate(doc).find(g=>g.category==='设计').amount,0.3);assert.equal(B.aggregate(doc).find(g=>g.category==='泥瓦').amount,0);
assert.equal(B.mutate(doc,{type:'total',value:'200.25'}).totalBudget,200.25);assert.equal(B.mutate(doc,{type:'delete',id:e.id}).entries.length,1);
async function run(){
 let gets=0,puts=0;
 const result=await B.write({token:'test-placeholder',action:{type:'save',entry:e},fetch:async(url,options)=>{
  assert(url.includes('/budget.json'));
  if(options.method!=='PUT')return {ok:true,json:async()=>({sha:String(++gets),content:S.encode({...empty,entries:gets>1?[{...normalized,id:'other-device'}]:[]})})};
  const body=JSON.parse(options.body);assert.equal(body.sha,String(gets));assert.equal(body.branch,'main');
  if(++puts===1)return {ok:false,status:409};return {ok:true};
 }});assert.equal(gets,2);assert.equal(result.entries.length,2);
 let paths=[];assert.deepEqual(await B.load({fetch:async url=>{paths.push(url);return {ok:true,json:async()=>({sha:'remote',content:S.encode(empty)})};}}),empty);assert.equal(paths.length,1);assert(paths[0].startsWith('https://api.github.com/'));
 await assert.rejects(B.load({fetch:async()=>({ok:false})}),/读写失败/);
 await assert.rejects(B.write({token:'',action:{type:'total',value:0}}),/连接 GitHub/);
 await assert.rejects(B.write({token:'test-placeholder',action:{type:'total',value:0},fetch:async()=>({ok:false,status:403})}),/权限不足/);
 await assert.rejects(B.write({token:'test-placeholder',action:{type:'total',value:0},fetch:async()=>{throw Error('test-placeholder');}}),e=>!e.message.includes('test-placeholder'));
 let attempts=0;await assert.rejects(B.write({token:'test-placeholder',action:{type:'total',value:0},fetch:async(url,o)=>o.method==='PUT'?(attempts++,{ok:false,status:409}):{ok:true,json:async()=>({sha:'s',content:S.encode(empty)})}}),/同时被修改/);assert.equal(attempts,3);
 let wrote=false;await assert.rejects(B.write({token:'test-placeholder',action:{type:'total',value:0},fetch:async(url,o)=>{if(o.method==='PUT')wrote=true;return {ok:true,json:async()=>({sha:'s',content:S.encode({version:2})})};}}));assert(!wrote);
 assert.deepEqual(B.normalize(JSON.parse(fs.readFileSync('dist/data/budget.json','utf8'))),{version:1,totalBudget:0,entries:[]});
 console.log('通过：预算金额格式、校验规范化、汇总与分类聚合、增改删、SHA 冲突重试、GitHub 单源读取和错误处理。');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
