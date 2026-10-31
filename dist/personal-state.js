(function(root,factory){const lib=factory(typeof module==='object'&&module.exports?require('./github-store.js'):root.GithubStore);if(typeof module==='object'&&module.exports)module.exports=lib;else root.PersonalState=lib;})(typeof window==='undefined'?globalThis:window,function(store){
 'use strict';
 const initial=()=>({version:1,saved:{},checks:{}});
 function normalize(doc){
  if(!doc||doc.version!==1)throw Error('个人记录格式不正确，未覆盖原文件');
  const result=initial();
  for(const key of ['saved','checks']){
   if(!doc[key]||typeof doc[key]!=='object'||Array.isArray(doc[key]))throw Error('个人记录格式不正确，未覆盖原文件');
   for(const [id,value] of Object.entries(doc[key])){if(!id||['__proto__','constructor','prototype'].includes(id)||typeof value!=='boolean')throw Error('个人记录格式不正确，未覆盖原文件');result[key][id]=value;}
  }
  return result;
 }
 const parse=raw=>normalize(JSON.parse(raw));
 function mutate(doc,action){
  doc=normalize(doc);
  if(action.type==='set'){
   if(!['saved','checks'].includes(action.group)||typeof action.value!=='boolean'||typeof action.id!=='string'||!action.id||['__proto__','constructor','prototype'].includes(action.id))throw Error('无效的个人记录操作');
   doc[action.group][action.id]=action.value;
  }else if(action.type==='reset-checks'){for(const id of Object.keys(doc.checks))doc.checks[id]=false;}
  else if(action.type==='migrate'){
   for(const key of ['saved','checks'])for(const id of action[key]||[]){if(typeof id==='string'&&id&&!Object.hasOwn(doc[key],id)&&!['__proto__','constructor','prototype'].includes(id))doc[key][id]=true;}
  }else throw Error('未知个人记录操作');
  return normalize(doc);
 }
 const load=options=>store.load({...options,path:'personal-state.json',parse,initial});
 const write=({action,...options})=>store.write({...options,path:'personal-state.json',parse,initial,message:'personal: update favorites and preparation',mutate:doc=>mutate(doc,action)});
 return {initial,normalize,mutate,load,write};
});
