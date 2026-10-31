'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const I=require('../dist/inspect-checklist.js'),S=require('../dist/github-store.js');
const empty={version:1,items:{},custom:[]},first=I.presets[0];
assert.equal(I.groups.length,5);assert(I.groups.every(g=>g.items.length>=5&&g.items.length<=8));assert.equal(new Set(I.presets.map(i=>i.id)).size,I.presets.length);
assert.deepEqual(I.progress(empty),{done:0,total:31,percent:0});
let doc=I.mutate(empty,{type:'patch',id:first.id,patch:{checked:true}});assert.equal(I.progress(doc).done,1);assert.equal(I.progress(doc,'水电').done,1);assert.deepEqual(empty.items,{});
doc=I.mutate(doc,{type:'patch',id:first.id,patch:{notes:'  待复核  '}});assert(doc.items[first.id].checked);assert.equal(doc.items[first.id].notes,'待复核');
const item={id:'custom-test',stage:'安装',title:'  核对设备  '};doc=I.mutate(doc,{type:'add',item});assert.equal(I.progress(doc).total,32);assert.equal(doc.custom[0].title,'核对设备');assert.equal(I.mutate(doc,{type:'add',item}).custom.length,1);
doc=I.mutate(doc,{type:'patch',id:item.id,patch:{checked:true,notes:'已通过'}});doc=I.mutate(doc,{type:'delete',id:item.id});assert.equal(doc.custom.length,0);assert(!doc.items[item.id]);assert.equal(I.progress(doc).total,31);
assert.throws(()=>I.mutate(doc,{type:'delete',id:first.id}));assert.throws(()=>I.mutate(doc,{type:'patch',id:'custom-deleted',patch:{checked:true}}));
assert.throws(()=>I.customItem({...item,title:''}));assert.throws(()=>I.customItem({...item,stage:'未知'}));assert.throws(()=>I.normalize({...empty,custom:[item,item]}));assert.throws(()=>I.normalize({...empty,items:{[first.id]:{checked:'yes',notes:''}}}));assert.throws(()=>I.normalize({version:2}));
assert.deepEqual(I.normalize({...empty,items:{obsolete:{checked:true,notes:''}}}),empty);
const complete=I.presets.reduce((d,i)=>I.mutate(d,{type:'patch',id:i.id,patch:{checked:true}}),empty);assert.equal(I.progress(complete).percent,100);
async function run(){
 let gets=0,puts=0;
 const result=await I.write({token:'test-placeholder',action:{type:'patch',id:first.id,patch:{checked:true}},fetch:async(url,o)=>{
  assert(url.includes('/checklist.json'));
  if(o.method!=='PUT')return {ok:true,json:async()=>({sha:String(++gets),content:S.encode(gets===1?empty:{...empty,items:{[first.id]:{checked:false,notes:'另一设备的备注'}},custom:[item]})})};
  const payload=JSON.parse(o.body);assert.equal(payload.sha,String(gets));if(++puts===1)return {ok:false,status:409};return {ok:true};
 }});assert.equal(gets,2);assert(result.items[first.id].checked);assert.equal(result.items[first.id].notes,'另一设备的备注');assert.equal(result.custom.length,1);
 let calls=0;await assert.rejects(I.load({fetch:async()=>{calls++;return {ok:true,json:async()=>({sha:'remote',content:S.encode({version:2})})};}}),/格式不正确/);assert.equal(calls,1);
 let saved;await I.write({token:'test-placeholder',action:{type:'delete',id:item.id},fetch:async(url,o)=>{if(o.method!=='PUT')return {ok:true,json:async()=>({sha:'latest',content:S.encode(result)})};saved=JSON.parse(S.decode(JSON.parse(o.body).content));return {ok:true};}});assert.equal(saved.custom.length,0);assert.equal(saved.items[first.id].notes,'另一设备的备注');
 assert.deepEqual(JSON.parse(fs.readFileSync('dist/data/checklist.json','utf8')),empty);
 console.log('通过：验收预置项、数据规范化、阶段与总进度、自建条目增删、备注合并、409 重试与损坏数据拒绝。');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
