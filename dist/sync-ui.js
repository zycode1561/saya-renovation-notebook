'use strict';
// Legacy browser records are read once, uploaded by merge, then removed only after success.
let personalBusy=false,personalReady=false,syncStates=[],syncConnecting=false;
let legacyPending=Boolean((Array.isArray(storedSaved)&&storedSaved.length)||(Array.isArray(storedChecks)&&storedChecks.length));
const syncNames={'personal-state.json':'收藏与开工准备','user-notes.json':'个人笔记','budget.json':'预算账本','checklist.json':'施工验收'};
const syncLabels={loading:'正在读取',saving:'正在保存',synced:'已同步',error:'同步失败'};
function renderSyncStatus(){
 const working=syncStates.some(s=>['loading','saving'].includes(s.state)),error=syncStates.some(s=>s.state==='error');
 const message=working?'GitHub 同步中…':error?'同步失败 · 重试':legacyPending?'旧记录待同步':storedToken()?'GitHub 已同步':'连接 GitHub';
 $('sync-status').textContent=message;$('sync-settings').dataset.state=error?'error':working?'busy':'ready';
 $('sync-settings').setAttribute('aria-label',`${message}，打开同步设置`);
 $('sync-details').innerHTML=Object.entries(syncNames).map(([path,name])=>{const item=syncStates.find(s=>s.path===path);return `<li><span>${name}</span><b>${item?syncLabels[item.state]:'等待读取'}</b>${item?.message?`<p>${escapeHTML(item.message)}；未保存的操作请重试。</p>`:''}</li>`;}).join('');
 $('sync-migration').hidden=!legacyPending;
 $('sync-migration').textContent='发现本设备的旧收藏或开工准备勾选。连接 GitHub 后自动合并，成功后再移除本机旧记录。';
 $('sync-refresh').disabled=working||syncConnecting;
 $('checklist-storage-note').textContent=legacyPending?'本设备旧记录尚待上传，请打开同步设置。':personalReady?'收藏与勾选已从 GitHub 读取，修改成功后同步到其他设备。勾选不代替现场验收。':'正在从 GitHub 读取收藏与勾选；读取失败可在同步设置重试。';
}
function setPersonalBusy(value){
 personalBusy=value;
 document.querySelectorAll('[data-save],[data-check],#reset-checklist').forEach(b=>{b.disabled=value;b.setAttribute('aria-busy',String(value));});
}
function applyPersonal(doc){
 if(legacyPending)doc=window.PersonalState.mutate(doc,{type:'migrate',saved:Array.isArray(storedSaved)?storedSaved:[],checks:Array.isArray(storedChecks)?storedChecks:[]});
 saved.clear();checked.clear();
 for(const [id,value] of Object.entries(doc.saved))if(value)saved.add(id);
 for(const [id,value] of Object.entries(doc.checks))if(value)checked.add(id);
 renderLibrary();renderChecklist();if(state.opened)updateDialogSave(state.opened);
 setPersonalBusy(personalBusy);
}
async function migratePersonal(){
 const doc=await window.PersonalState.write({action:{type:'migrate',saved:Array.isArray(storedSaved)?storedSaved:[],checks:Array.isArray(storedChecks)?storedChecks:[]},token:storedToken()});
 // False entries are kept remotely, so another old device cannot resurrect an unchecked item.
 legacyPending=false;
 try{localStorage.removeItem('saya-renovation-saved-v1');localStorage.removeItem('saya-renovation-checks-v1');}catch{}
 return doc;
}
async function loadPersonal(){
 if(personalBusy)return;
 setPersonalBusy(true);
 try{let doc=await window.PersonalState.load();if(legacyPending&&storedToken())doc=await migratePersonal();personalReady=true;applyPersonal(doc);}
 catch{toast('收藏与开工准备同步失败，请在同步设置中重试');}
 finally{setPersonalBusy(false);renderSyncStatus();}
}
async function savePersonal(action){
 if(personalBusy)return false;
 if(!storedToken()){toast('请先连接 GitHub，当前操作尚未保存');openTokenSettings();return false;}
 setPersonalBusy(true);
 try{
  if(legacyPending)applyPersonal(await migratePersonal());
  const doc=await window.PersonalState.write({action,token:storedToken()});personalReady=true;applyPersonal(doc);return true;
 }catch(error){toast(`${error.message}；本次操作未确认保存，请重试`);return false;}
 finally{setPersonalBusy(false);renderSyncStatus();}
}
function refreshAll(){
 if(personalBusy||syncStates.some(s=>s.state==='saving'))return;
 loadPersonal();document.dispatchEvent(new CustomEvent('sync-refresh'));
}
window.GithubStore.subscribe(states=>{syncStates=states;renderSyncStatus();});
$('sync-settings').addEventListener('click',openTokenSettings);
document.addEventListener('click',event=>{if(event.target.closest('[data-sync-settings]'))openTokenSettings();});
$('close-sync').addEventListener('click',()=>{if(!syncConnecting)$('sync-dialog').close();});
$('sync-dialog').addEventListener('cancel',event=>{if(syncConnecting)event.preventDefault();});
$('sync-dialog').addEventListener('close',()=>{hideUserToken();$('user-note-token').value='';restorePageScroll();});
$('sync-refresh').addEventListener('click',refreshAll);
$('sync-form').addEventListener('submit',async event=>{
 event.preventDefault();if(syncConnecting)return;
 const token=$('user-note-token').value.trim()||storedToken();
 if(!token){$('sync-error').textContent='请填写 GitHub 令牌';$('user-note-token').focus();return;}
 syncConnecting=true;$('sync-connect').disabled=true;$('clear-user-token').disabled=true;$('sync-error').textContent='正在验证连接…';
 try{
  await userNotes.loadUserNotes({token});userNotes.tokenStorage(localStorage).write(token);
  $('user-note-token').value='';hideUserToken();refreshTokenUI();$('sync-error').textContent='连接已保存。返回原页面即可继续保存记录。';
  refreshAll();
 }catch(error){$('sync-error').textContent=error.message;}
 finally{syncConnecting=false;$('sync-connect').disabled=false;$('clear-user-token').disabled=false;renderSyncStatus();}
});
// Refresh on return to the site, without polling or disrupting an open form.
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&!document.querySelector('dialog[open]'))refreshAll();});
loadPersonal();

function closeMobileNavigation(focus=false){$('nav-extra').classList.remove('is-open');$('nav-more').setAttribute('aria-expanded','false');if(focus)$('nav-more').focus();}
function updateMobileNavigation(view){
 const extra={saved:'收藏',home:'我的家',inspect:'验收'},label=extra[view];
 $('nav-more').textContent=label?`${label} ▾`:'更多 ▾';$('nav-more').classList.toggle('active',Boolean(label));
 $('nav-more').setAttribute('aria-label',label?`当前：${label}，更多导航`:'更多导航');closeMobileNavigation();
}
$('nav-more').addEventListener('click',()=>{const open=$('nav-more').getAttribute('aria-expanded')!=='true';$('nav-more').setAttribute('aria-expanded',String(open));$('nav-extra').classList.toggle('is-open',open);});
document.addEventListener('click',event=>{if(!event.target.closest('.site-nav'))closeMobileNavigation();});
document.querySelector('.site-nav').addEventListener('keydown',event=>{if(event.key==='Escape')closeMobileNavigation(true);});
document.querySelector('.site-nav').addEventListener('focusout',event=>{if(!event.currentTarget.contains(event.relatedTarget))closeMobileNavigation();});
