'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const B=require('../dist/budget.js'),I=require('../dist/inspect-checklist.js');
const elements=new Map(),handlers={};
function element(id){if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',dataset:{},listeners:{},open:false,attrs:{},querySelectorAll:()=>[],querySelector:()=>({focus(){}}),focus(){},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,v){this.listeners[k]=v;},close(){this.open=false;this.listeners.close?.();}});return elements.get(id);}
let budget={version:1,totalBudget:100,entries:[]},inspect={version:1,items:{},custom:[]},token='',settingsOpened=0,writes=0,fail=false,fields={},serial=0;
const context={window:{Budget:{...B,load:async()=>budget,write:async({action})=>{writes++;if(fail)throw Error('GitHub 写入失败，请稍后重试');return budget=B.mutate(budget,action);}},InspectChecklist:{...I,load:async()=>inspect,write:async({action})=>{writes++;return inspect=I.mutate(inspect,action);}}},document:{addEventListener(k,v){handlers[k]=v;}},$:element,escapeHTML:v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),crypto:{randomUUID:()=>`test-${++serial}`},Date,FormData:function(){return Object.entries(fields);},storedToken:()=>token,openTokenSettings:()=>settingsOpened++,toast(){},openModal:dialog=>dialog.open=true,restorePageScroll(){}};
vm.createContext(context);vm.runInContext(fs.readFileSync('dist/ledger-ui.js','utf8'),context);
const click=(action,value='')=>handlers.click({target:{closest:()=>({dataset:{ledgerAction:action,value},hasAttribute:()=>false})}});
const submit=()=>element('ledger-form').listeners.submit({preventDefault(){},currentTarget:element('ledger-form')});
async function run(){
 await new Promise(resolve=>setImmediate(resolve));
 assert(element('budget-page').innerHTML.includes('暂无支出'));assert(element('inspect-page').innerHTML.includes('0 / 31'));
 assert.equal(settingsOpened,0);
 click('expense');assert(element('ledger-dialog').open);assert(!element('ledger-fields').innerHTML.includes('type="date"'));
 assert(element('ledger-fields').innerHTML.includes('inputmode="numeric" placeholder="2026.10.28"'));assert(element('ledger-fields').innerHTML.includes('textarea name="notes"'));assert(!element('ledger-fields').innerHTML.includes('data-ledger-settings'));
 assert(!element('ledger-fields').innerHTML.includes('ledger-date-display'));
 assert(element('ledger-fields').innerHTML.includes('value="'+B.formatDate(new Date(Date.now()+8*3600000).toISOString().slice(0,10))+'"'));
 fields={name:'<img src=x>',amount:'123.50',date:'2026.10.28',notes:'测试备注'};
 await submit();assert.equal(settingsOpened,1);assert.equal(writes,0);assert(element('ledger-dialog').open);
 token='test-placeholder';fail=true;await submit();assert(element('ledger-dialog').open);assert(element('ledger-error').textContent.includes('写入失败'));assert(element('ledger-fields').innerHTML.includes('金额'));
 fail=false;await submit();assert(!element('ledger-dialog').open);assert.equal(budget.entries.length,1);assert(element('budget-page').innerHTML.includes('&lt;img src=x&gt;'));assert(element('budget-page').innerHTML.includes('-¥23.50'));
 assert(element('budget-page').innerHTML.includes('2026.10.28'));assert.equal(budget.entries[0].date,'2026-10-28');
 const id=budget.entries[0].id;click('expense',id);fields.amount='50';await submit();assert.equal(budget.entries.length,1);assert.equal(budget.entries[0].amount,50);
 click('delete-expense',id);assert.equal(element('ledger-dialog-title').textContent,'删除这笔支出');assert(element('ledger-fields').innerHTML.includes('&lt;img src=x&gt;'));assert.equal(element('ledger-submit').textContent,'确认删除');assert.equal(budget.entries.length,1);await submit();assert.equal(budget.entries.length,0);
 click('inspect-add','安装');fields={title:'核对定制尺寸'};await submit();assert.equal(inspect.custom.length,1);const item=inspect.custom[0];
 click('inspect-note',item.id);fields={notes:'等待整改'};await submit();assert.equal(inspect.items[item.id].notes,'等待整改');
 await element('inspect-page').listeners.change({target:{dataset:{inspectCheck:item.id},checked:true}});assert(inspect.items[item.id].checked);assert(element('inspect-page').innerHTML.includes('1 / 32'));
 click('delete-inspect',item.id);assert(element('ledger-fields').innerHTML.includes('核对定制尺寸'));await submit();assert.equal(inspect.custom.length,0);
 assert(!element('budget-page').innerHTML.includes(token));assert(!element('inspect-page').innerHTML.includes(token));
 const html=fs.readFileSync('dist/index.html','utf8');const dialog=html.slice(html.indexOf('<dialog id="ledger-dialog"'),html.indexOf('<dialog id="user-note-dialog"'));assert(!dialog.includes('data-ledger-settings'));assert(dialog.indexOf('id="ledger-fields"')<dialog.indexOf('class="user-note-actions"'));
 for(const view of ['budget','inspect'])assert(!html.match(new RegExp('<button[^>]+data-view="'+view+'"[^>]*>(.*?)</button>'))[1].includes('data-icon'));
 assert(element('inspect-page').innerHTML.includes('<label><span class="inspect-check-control"><input type="checkbox"'));
 const app=fs.readFileSync('dist/app.js','utf8');assert(app.includes("document.querySelector('#user-note-dialog .user-note-handle')"));assert(app.includes("document.querySelector('#user-note-dialog .user-note-body')"));
 console.log('通过：预算和验收表单流程、无令牌引导、失败保留、编辑删除确认、文本转义与笔记 DOM 隔离。');
}
run().catch(e=>{console.error(e);process.exitCode=1;});
