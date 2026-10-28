(function(root,factory){const lib=factory(typeof module==='object'&&module.exports?require('./github-store.js'):root.GithubStore);if(typeof module==='object'&&module.exports)module.exports=lib;else root.Budget=lib;})(typeof window==='undefined'?globalThis:window,function(store){
 'use strict';
 const categories=['设计','拆改','水电','泥瓦','木工','油漆','主材','定制','家电','软装','其他'];
 const stages=['设计','拆改','水电','泥瓦','木工','油漆','安装','软装'];
 function money(value){if(!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(String(value))||!Number.isSafeInteger(Math.round(Number(value)*100)))throw Error('金额须为非负数字，最多两位小数');return Math.round(Number(value)*100)/100;}
 function formatMoney(value){const n=Math.round(value*100)/100;return `${n<0?'-':''}¥${Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2})}`;}
 // Keep repository dates in ISO form; accept common separators only at the input boundary.
 function parseDate(value){
  const match=String(value??'').trim().match(/^(\d{4})([.\/-])(\d{2})\2(\d{2})$/);
  if(!match)throw Error('日期请按 YYYY.MM.DD 填写');
  const iso=`${match[1]}-${match[3]}-${match[4]}`,date=new Date(iso);
  if(Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==iso)throw Error('请填写真实有效的日期');
  return iso;
 }
 function formatDate(value){return parseDate(value).replace(/-/g,'.');}
 function entry(input){const e={id:String(input.id||'').trim(),name:String(input.name||'').trim(),amount:money(input.amount),category:input.category,stage:input.stage,date:parseDate(input.date),notes:String(input.notes||'').trim()};if(!e.id||!e.name||!categories.includes(e.category)||!stages.includes(e.stage)||!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||Number.isNaN(Date.parse(e.date))||new Date(e.date).toISOString().slice(0,10)!==e.date)throw Error('请填写名称并选择有效的类别、阶段和日期');return e;}
 function normalize(doc){if(!doc||doc.version!==1||!Array.isArray(doc.entries))throw Error('预算文件格式不正确，未覆盖原文件');const ids=new Set();const entries=doc.entries.map(entry);for(const e of entries){if(ids.has(e.id))throw Error('支出编号重复');ids.add(e.id);}return {version:1,totalBudget:money(doc.totalBudget),entries};}
 const parse=raw=>normalize(JSON.parse(raw));
 function summary(doc){const spent=doc.entries.reduce((s,e)=>s+Math.round(e.amount*100),0);return {totalBudget:doc.totalBudget,spent:spent/100,remaining:(Math.round(doc.totalBudget*100)-spent)/100};}
 function aggregate(doc){return categories.map(category=>({category,amount:doc.entries.filter(e=>e.category===category).reduce((s,e)=>s+Math.round(e.amount*100),0)/100}));}
 function mutate(doc,action){doc=normalize(doc);if(action.type==='total')doc.totalBudget=money(action.value);else if(action.type==='delete')doc.entries=doc.entries.filter(e=>e.id!==action.id);else if(action.type==='save'){const e=entry(action.entry);doc.entries=doc.entries.filter(v=>v.id!==e.id);doc.entries.push(e);}else throw Error('未知预算操作');return normalize(doc);}
 const load=options=>store.load({...options,path:'budget.json',parse});
 const write=({action,...options})=>store.write({...options,path:'budget.json',parse,message:'budget: update ledger',mutate:doc=>mutate(doc,action)});
 return {categories,stages,money,formatMoney,parseDate,formatDate,entry,normalize,summary,aggregate,mutate,load,write};
});
