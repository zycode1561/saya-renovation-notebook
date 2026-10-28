/* Shared Contents API transport. Mutations are reapplied to the latest SHA on conflict. */
(function(root,factory){const lib=factory();if(typeof module==='object'&&module.exports)module.exports=lib;else root.GithubStore=lib;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const repo='zycode1561/saya-renovation-notebook';
 function encode(doc){const raw=JSON.stringify(doc,null,2)+'\n';return typeof Buffer!=='undefined'?Buffer.from(raw,'utf8').toString('base64'):btoa(Array.from(new TextEncoder().encode(raw),b=>String.fromCharCode(b)).join(''));}
 function decode(raw){return typeof Buffer!=='undefined'?Buffer.from(raw,'base64').toString('utf8'):new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(raw.replace(/\s/g,'')),c=>c.charCodeAt(0)));}
 async function call(request,url,options={},timeout=20000){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);try{return await request(url,{...options,signal:controller.signal});}catch{throw Error('网络连接失败或超时，请检查网络后重试');}finally{clearTimeout(timer);}}
 async function load({path,parse,fetch:request=globalThis.fetch}){
  for(const url of [`https://raw.githubusercontent.com/${repo}/main/dist/data/${path}`,`./data/${path}`]){try{const response=await call(request,`${url}?t=${Date.now()}`,{cache:'no-store'},8000);if(response.ok)return parse(await response.text());}catch{}}
  throw Error('数据暂时无法加载，请重试');
 }
 async function write({path,parse,mutate,message,token,fetch:request=globalThis.fetch}){
  if(!token)throw Error('请先填写 GitHub 令牌');
  const endpoint=`https://api.github.com/repos/${repo}/contents/dist/data/${path}`;
  const headers={Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28'};
  const failure=status=>Error(status===401||status===403?'令牌无效或权限不足，请检查令牌设置':status===409?'记录同时被修改，请稍后再试':'GitHub 写入失败，请稍后重试');
  for(let attempt=0;attempt<3;attempt++){
   const response=await call(request,`${endpoint}?ref=main&t=${Date.now()}`,{headers,cache:'no-store'});
   if(!response.ok)throw failure(response.status);
   let file;try{file=await response.json();}catch{throw Error('无法读取 GitHub 数据文件');}
   if(!file.sha||typeof file.content!=='string')throw Error('无法读取 GitHub 数据文件');
   const doc=mutate(parse(decode(file.content)));
   const result=await call(request,endpoint,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({message,content:encode(doc),sha:file.sha,branch:'main'})});
   if(result.ok)return doc;
   if(result.status!==409||attempt===2)throw failure(result.status);
  }
 }
 return {encode,decode,load,write};
});
