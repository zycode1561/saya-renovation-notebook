/* GitHub is the source of truth. Never present bundled data as a successful sync. */
(function(root,factory){const lib=factory();if(typeof module==='object'&&module.exports)module.exports=lib;else root.GithubStore=lib;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const repo='zycode1561/saya-renovation-notebook',states=new Map(),listeners=new Set(),versions=new Map(),latest=new Map();
 let tokenProvider=()=>'',queue=Promise.resolve();
 function configure(getToken){tokenProvider=getToken;}
 function status(path,state,message=''){states.set(path,{path,state,message,time:Date.now()});for(const listener of listeners)listener([...states.values()]);}
 function subscribe(listener){listeners.add(listener);listener([...states.values()]);return ()=>listeners.delete(listener);}
 function encode(doc){const raw=JSON.stringify(doc,null,2)+'\n';return typeof Buffer!=='undefined'?Buffer.from(raw,'utf8').toString('base64'):btoa(Array.from(new TextEncoder().encode(raw),b=>String.fromCharCode(b)).join(''));}
 function decode(raw){return typeof Buffer!=='undefined'?Buffer.from(raw,'base64').toString('utf8'):new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(raw.replace(/\s/g,'')),c=>c.charCodeAt(0)));}
 async function call(request,url,options={},timeout=20000){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);try{return await request(url,{...options,signal:controller.signal});}catch{throw Error('网络连接失败或超时，请检查网络后重试');}finally{clearTimeout(timer);}}
 const endpoint=path=>`https://api.github.com/repos/${repo}/contents/dist/data/${path}`;
 const headers=token=>({Accept:'application/vnd.github+json',...(token?{Authorization:`Bearer ${token}`}:{ }),'X-GitHub-Api-Version':'2022-11-28'});
 const failure=code=>Error(code===401||code===403?'GitHub 连接无效、权限不足或请求受限，请检查同步设置':code===409?'记录同时被修改，请稍后再试':'GitHub 数据读写失败，请稍后重试');
 async function read({path,parse,initial,token,fetch:request}){
  const response=await call(request,`${endpoint(path)}?ref=main&t=${Date.now()}`,{headers:headers(token),cache:'no-store'});
  if(response.status===404&&initial)return {doc:initial(),sha:null};
  if(!response.ok)throw failure(response.status);
  let file;try{file=await response.json();}catch{throw Error('无法读取 GitHub 数据文件');}
  if(!file.sha||typeof file.content!=='string')throw Error('无法读取 GitHub 数据文件');
  return {doc:parse(decode(file.content)),sha:file.sha};
 }
 async function load({path,parse,initial,token=tokenProvider(),fetch:request=globalThis.fetch}){
  await queue;
  const version=versions.get(path)||0;status(path,'loading');
  try{const {doc}=await read({path,parse,initial,token,fetch:request});if(version!==(versions.get(path)||0)){await queue;return latest.get(path)||doc;}latest.set(path,doc);status(path,'synced');return doc;}
  catch(error){if(version===(versions.get(path)||0))status(path,'error',error.message);throw error;}
 }
 function write(options){
  const {path}=options;versions.set(path,(versions.get(path)||0)+1);status(path,'saving');
  const operation=queue.then(()=>commit(options));queue=operation.catch(()=>{});return operation;
 }
 async function commit({path,parse,initial,mutate,message,token=tokenProvider(),fetch:request=globalThis.fetch}){
  try{
   if(!token)throw Error('请先在同步设置中连接 GitHub');
   for(let attempt=0;attempt<3;attempt++){
    const {doc:current,sha}=await read({path,parse,initial,token,fetch:request}),doc=mutate(current);
    const response=await call(request,endpoint(path),{method:'PUT',headers:{...headers(token),'Content-Type':'application/json'},body:JSON.stringify({message,content:encode(doc),...(sha?{sha}:{}),branch:'main'})});
    if(response.ok){latest.set(path,doc);status(path,'synced');return doc;}
    if(![409,422].includes(response.status)||attempt===2)throw failure(response.status);
   }
  }catch(error){status(path,'error',error.message);throw error;}
 }
 return {encode,decode,load,write,configure,subscribe};
});
