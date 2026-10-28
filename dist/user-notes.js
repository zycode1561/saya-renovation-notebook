(function(root,factory){
 'use strict';
 const lib=factory();
 if(typeof module==='object'&&module.exports)module.exports=lib;
 else root.UserNotes=lib;
})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const stages=['准备','预算','施工','厨卫','安装','入住'];
 const endpoint='https://api.github.com/repos/zycode1561/saya-renovation-notebook/contents/dist/data/user-notes.json';
 const tokenKey='saya-renovation-gh-token-v1';
 function validateNoteInput(input={}){
  const normalized={};
  for(const key of ['title','content','stage','type','sourceUrl'])normalized[key]=String(input[key]??'').trim();
  if(normalized.type==='经验')normalized.type='攻略';
  const errors=[];
  if(!normalized.title)errors.push('请填写标题');
  if(!normalized.content)errors.push('请填写内容');
  if(!stages.includes(normalized.stage))errors.push('请选择有效阶段');
  if(!['避坑','攻略'].includes(normalized.type))errors.push('请选择避坑或经验');
  if(normalized.sourceUrl){try{const url=new URL(normalized.sourceUrl);if(!['http:','https:'].includes(url.protocol))throw Error();normalized.sourceUrl=url.href;}catch{errors.push('来源链接须为有效的 http 或 https 地址');}}
  return {ok:errors.length===0,errors,normalized};
 }
 function buildUserNote(normalized,{now=new Date()}={}){
  const time=new Date(now),date=new Date(time.getTime()+8*3600000).toISOString().slice(0,10);
  const random=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
  return {id:`user-${time.getTime()}-${random}`,title:normalized.title,summary:Array.from(normalized.content).slice(0,80).join(''),points:[normalized.content],type:normalized.type,stage:normalized.stage,tags:[],author:'沙耶',date,url:normalized.sourceUrl||'',sourceUrl:normalized.sourceUrl||'',userNote:true,images:[],sections:[],evidence:'本人记录',checkedAt:date,limits:'本人随手记录，请结合自家情况判断。'};
 }
 function mergeNotes(baseNotes,userNotes){
  const builtIn=baseNotes.filter(n=>n.userNote!==true),seen=new Set(builtIn.map(n=>n.id));
  const users=userNotes.filter(n=>n.userNote===true&&!seen.has(n.id)&&seen.add(n.id)).slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
  return [...users,...builtIn];
 }
 function encodeUserNotesFile(doc){
  const raw=JSON.stringify(doc,null,2)+'\n';
  if(typeof Buffer!=='undefined')return Buffer.from(raw,'utf8').toString('base64');
  return btoa(Array.from(new TextEncoder().encode(raw),b=>String.fromCharCode(b)).join(''));
 }
 function decodeUserNotesFile(raw,{base64=false}={}){
  try{
   if(base64)raw=typeof Buffer!=='undefined'?Buffer.from(raw,'base64').toString('utf8'):new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(raw.replace(/\s/g,'')),c=>c.charCodeAt(0)));
   const doc=JSON.parse(raw);
   if(doc.version!==1||!Array.isArray(doc.notes))throw Error();
   const ids=new Set();
   for(const n of doc.notes){
    if(!n||n.userNote!==true||typeof n.id!=='string'||!n.id.startsWith('user-')||ids.has(n.id)||!Array.isArray(n.points)||!n.points.length||!n.points.every(p=>typeof p==='string')||!Array.isArray(n.tags)||!n.tags.every(t=>typeof t==='string')||typeof n.summary!=='string'||n.author!=='沙耶'||!/^\d{4}-\d{2}-\d{2}$/.test(n.date)||!Array.isArray(n.images)||n.images.length||!Array.isArray(n.sections)||n.sections.length||!validateNoteInput({title:n.title,content:n.points.join('\n'),stage:n.stage,type:n.type,sourceUrl:n.url}).ok)throw Error();
    ids.add(n.id);
   }
   return doc;
  }catch{throw new Error('笔记文件格式不正确，未覆盖原文件');}
 }
 function buildPutPayload({doc,sha,title,mode}){return {message:`note: ${mode==='delete'?'delete ':''}${title}`,content:encodeUserNotesFile(doc),...(sha?{sha}:{}),branch:'main'};}
 function tokenStorage(storage){return {read:()=>storage.getItem(tokenKey)||'',write:value=>storage.setItem(tokenKey,value.trim()),clear:()=>storage.removeItem(tokenKey)};}
 async function loadUserNotes({fetch:request=globalThis.fetch}={}){
  for(const path of ['https://raw.githubusercontent.com/zycode1561/saya-renovation-notebook/main/dist/data/user-notes.json','./data/user-notes.json']){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
   try{const response=await request(`${path}?t=${Date.now()}`,{cache:'no-store',signal:controller.signal});if(response.ok)return decodeUserNotesFile(await response.text()).notes;}catch{}finally{clearTimeout(timer);}
  }
  return [];
 }
 async function writeUserNote({note,mode='add',token,fetch:request=globalThis.fetch}){
  if(!token)throw new Error('请先填写 GitHub 令牌');
  const headers={Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28'};
  async function call(url,options){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
   try{return await request(url,{...options,signal:controller.signal});}catch{throw new Error('网络连接失败或超时，请检查网络后重试');}finally{clearTimeout(timer);}
  }
  function failure(status){return new Error(status===401||status===403?'令牌无效或权限不足，请检查令牌设置':status===409?'笔记同时被修改，请稍后再试':'GitHub 写入失败，请稍后重试');}
  for(let attempt=0;attempt<3;attempt++){
   const response=await call(`${endpoint}?ref=main&t=${Date.now()}`,{headers,cache:'no-store'});
   if(!response.ok)throw failure(response.status);
   let file;try{file=await response.json();}catch{throw new Error('无法读取 GitHub 笔记文件');}
   if(!file.sha||typeof file.content!=='string')throw new Error('无法读取 GitHub 笔记文件');
   const doc=decodeUserNotesFile(file.content,{base64:true});
   doc.notes=doc.notes.filter(n=>n.id!==note.id);
   if(mode!=='delete')doc.notes.push(note);
   const result=await call(endpoint,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(buildPutPayload({doc,sha:file.sha,title:note.title,mode}))});
   if(result.ok)return doc.notes;
   if(result.status!==409||attempt===2)throw failure(result.status);
  }
 }
 return {validateNoteInput,buildUserNote,mergeNotes,encodeUserNotesFile,decodeUserNotesFile,buildPutPayload,tokenStorage,loadUserNotes,writeUserNote};
});
