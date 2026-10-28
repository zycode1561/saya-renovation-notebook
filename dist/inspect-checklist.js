(function(root,factory){const lib=factory(typeof module==='object'&&module.exports?require('./github-store.js'):root.GithubStore);if(typeof module==='object'&&module.exports)module.exports=lib;else root.InspectChecklist=lib;})(typeof window==='undefined'?globalThis:window,function(store){
 'use strict';
 // Stable IDs must not change when wording is revised. Only user state is stored in JSON.
 const groups=[
 ['水电','water',['给水打压试验，留存压力与时长记录','封槽前拍照归档线管走向','核对强弱电间距及交叉屏蔽','核对开关插座高度与家具位置','核验卫生间等电位连接','检查排水坡度并通水试验','核验回路标识与漏电保护测试']],
 ['泥瓦','tile',['闭水试验48小时，检查楼下及周边渗漏','敲击检查空鼓，记录范围并核对允许值','靠尺检查墙地面平整度','核对瓷砖留缝宽度与顺直度','检查阴阳角方正','检查地面坡向地漏且无积水']],
 ['木工','wood',['检查吊顶龙骨间距与固定','检查石膏板留缝及接缝处理','核对柜体垂直度与水平度','检查转角整板与接缝错缝','核对检修口位置与开启空间','检查木作防潮及收口']],
 ['油漆','paint',['侧光检查腻子平整度','检查阴阳角顺直','检查涂膜无明显色差、流坠','检查墙顶面无开裂、起皮','检查遮蔽边界及收口整洁','核对涂料型号与施工记录']],
 ['安装','install',['洁具通水检查接口无渗漏','逐个测试开关插座通电与接线','检查门窗开合、锁闭及密封','通水检查地漏排水通畅','检查橱柜五金与柜门调平','核验设备运行及检修空间']]
 ].map(([stage,prefix,titles])=>({stage,items:titles.map((title,i)=>({id:`inspect-${prefix}-${i+1}`,stage,title}))}));
 const stages=groups.map(g=>g.stage),presets=groups.flatMap(g=>g.items);
 function customItem(input){const item={id:String(input.id||''),stage:input.stage,title:String(input.title||'').trim()};if(!/^custom-[\w-]+$/.test(item.id)||!stages.includes(item.stage)||!item.title)throw Error('请填写验收项并选择阶段');return item;}
 function normalize(doc){if(!doc||doc.version!==1||!doc.items||Array.isArray(doc.items)||typeof doc.items!=='object'||!Array.isArray(doc.custom))throw Error('验收文件格式不正确，未覆盖原文件');const custom=doc.custom.map(customItem),ids=new Set(presets.map(i=>i.id));for(const item of custom){if(ids.has(item.id))throw Error('验收编号重复');ids.add(item.id);}const items={};for(const [id,value] of Object.entries(doc.items)){if(!ids.has(id))continue;if(!value||typeof value.checked!=='boolean'||typeof value.notes!=='string')throw Error('验收记录格式不正确');items[id]={checked:value.checked,notes:value.notes.trim()};}return {version:1,items,custom};}
 const parse=raw=>normalize(JSON.parse(raw));
 function allItems(doc){return [...presets,...doc.custom];}
 function progress(doc,stage){const items=allItems(doc).filter(i=>!stage||i.stage===stage),done=items.filter(i=>doc.items[i.id]?.checked).length;return {done,total:items.length,percent:items.length?Math.round(done/items.length*100):0};}
 function mutate(doc,action){doc=normalize(doc);if(action.type==='add'){const item=customItem(action.item);if(!doc.custom.some(i=>i.id===item.id))doc.custom.push(item);}else if(action.type==='delete'){if(!action.id.startsWith('custom-'))throw Error('预置验收项不能删除');doc.custom=doc.custom.filter(i=>i.id!==action.id);delete doc.items[action.id];}else if(action.type==='patch'){if(!allItems(doc).some(i=>i.id===action.id))throw Error('该验收项已被删除，请刷新后重试');doc.items[action.id]={checked:false,notes:'',...doc.items[action.id],...action.patch};}else throw Error('未知验收操作');return normalize(doc);}
 const load=options=>store.load({...options,path:'checklist.json',parse});
 const write=({action,...options})=>store.write({...options,path:'checklist.json',parse,message:'inspect: update checklist',mutate:doc=>mutate(doc,action)});
 return {groups,stages,presets,customItem,normalize,allItems,progress,mutate,load,write};
});
