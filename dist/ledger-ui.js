/* Budget and inspection UI; token setup, modal scroll locking and toast belong to app.js. */
(function(){
 'use strict';
 const B=window.Budget,I=window.InspectChecklist,esc=escapeHTML;
 const docs={budget:null,inspect:null},errors={},busy={budget:false,inspect:false};
 const filters={stage:'全部',category:'全部'};
 let edit=null;
 const uid=prefix=>`${prefix}-${crypto.randomUUID()}`;
 const button=(label,action,value='')=>`<button type="button" class="secondary" data-ledger-action="${action}" data-value="${esc(value)}">${label}</button>`;
 const displayDate=B.formatDate;
 const settings=()=>'<button type="button" class="text-button" data-ledger-settings>同步设置</button>';
 function pills(name,values,value,label){return `<div class="ledger-choice"><span>${label}</span><div class="user-note-pills" role="group" aria-label="${label}">${values.map(v=>`<button type="button" data-ledger-choice="${name}" data-value="${esc(v)}" aria-pressed="${v===value}">${esc(v)}</button>`).join('')}</div></div>`;}
 function bar(done,total,label){return `<div class="ledger-track" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span style="width:${total?done/total*100:0}%"></span></div>`;}
 function heading(kind){return `<div class="ledger-heading"><div><span class="eyebrow">${kind==='budget'?'每一笔支出，都有去处':'施工现场，逐项核对'}</span><h1 id="${kind}-title">${kind==='budget'?'预算账本':'施工验收'}</h1><p>${kind==='budget'?'记录实际支出，让预算心中有数。':'按现场结果确认，问题与整改情况记在备注里。'}</p></div>${settings()}</div>`;}
 function render(kind){
  const root=$(kind+'-page'),doc=docs[kind];
  root.setAttribute('aria-busy',String(busy[kind]));
  if(!doc){root.innerHTML=heading(kind)+`<p role="status">${errors[kind]||'正在从 GitHub 同步…'}</p>`+(errors[kind]?button('重新加载','reload',kind):'');return;}
  if(kind==='budget'){
   const s=B.summary(doc),groups=B.aggregate(doc);
   const list=doc.entries.filter(e=>(filters.stage==='全部'||e.stage===filters.stage)&&(filters.category==='全部'||e.category===filters.category)).slice().sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
   root.innerHTML=heading(kind)+`<div class="ledger-summary">${[['总预算',s.totalBudget],['已花',s.spent],['剩余',s.remaining]].map(([label,n])=>`<div><div class="ledger-stat-title"><span>${label}</span>${label==='总预算'?button('编辑预算','total'):''}</div><strong class="ledger-number ${n<0?'ledger-over':''}">${B.formatMoney(n)}</strong></div>`).join('')}</div><section class="ledger-panel" aria-labelledby="budget-category-title"><h2 id="budget-category-title">按类别统计</h2><div class="ledger-chart">${groups.map(g=>`<div><span>${g.category}</span><span class="ledger-number">${B.formatMoney(g.amount)}</span></div>`).join('')}</div></section><section class="ledger-panel"><div class="ledger-heading"><h2>支出记录</h2>${button('新增支出','expense')}</div>${pills('filter-stage',['全部',...B.stages],filters.stage,'阶段')}${pills('filter-category',['全部',...B.categories],filters.category,'类别')}<p class="ledger-muted">${list.length} 笔记录${busy.budget?' · 正在保存…':''}</p><div class="ledger-entries">${list.map(e=>`<article class="ledger-entry"><div><h3>${esc(e.name)}</h3><p>${esc(displayDate(e.date))} · ${e.category} · ${e.stage}</p>${e.notes?`<p class="ledger-notes">${esc(e.notes)}</p>`:''}</div><strong class="ledger-number">${B.formatMoney(e.amount)}</strong><div class="ledger-row-actions">${button('编辑','expense',e.id)}${button('删除','delete-expense',e.id)}</div></article>`).join('')||'<p class="ledger-muted">暂无支出记录，可以先记下第一笔。</p>'}</div></section>`;
  }else{
   const p=I.progress(doc);
   root.innerHTML=heading(kind)+`<section class="ledger-panel"><div class="ledger-heading"><h2>总进度</h2><span class="ledger-number">${p.done} / ${p.total} · ${p.percent}%</span></div>${bar(p.done,p.total,'施工验收总进度')}<p class="ledger-muted">勾选与备注保存到 GitHub，所有设备同步。${busy.inspect?'正在保存…':''}</p></section>`+I.groups.map(group=>{
    const p=I.progress(doc,group.stage),items=I.allItems(doc).filter(i=>i.stage===group.stage);
    return `<section class="ledger-panel"><div class="ledger-heading"><h2>${group.stage}</h2><span class="ledger-number">${p.done} / ${p.total}</span></div>${bar(p.done,p.total,group.stage+'验收进度')}<div>${items.map(item=>{const value=doc.items[item.id]||{};return `<article class="inspect-item"><label><span class="inspect-check-control"><input type="checkbox" data-inspect-check="${item.id}" ${value.checked?'checked':''} ${busy.inspect?'disabled':''}></span><span>${esc(item.title)}${item.id.startsWith('custom-')?'<small>自建条目</small>':''}</span></label>${value.notes?`<p class="ledger-notes">${esc(value.notes)}</p>`:''}<div class="ledger-row-actions">${button(value.notes?'编辑备注':'添加备注','inspect-note',item.id)}${item.id.startsWith('custom-')?button('删除','delete-inspect',item.id):''}</div></article>`;}).join('')}</div>${button('新增验收项','inspect-add',group.stage)}</section>`;
   }).join('');
  }
  root.querySelectorAll('[data-ledger-action]').forEach(b=>{b.disabled=busy[kind];});
 }
 async function load(kind){errors[kind]='';render(kind);try{docs[kind]=await (kind==='budget'?B:I).load();}catch{errors[kind]='数据暂时无法加载，请重试。';}render(kind);}
 function field(label,name,value='',type='text',extra=''){return `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;}
 function notesField(value=''){return `<label>备注<textarea name="notes" rows="4">${esc(value)}</textarea></label>`;}
 function showForm(action,value){
  if(edit||busy.budget||busy.inspect)return;
  let title,html,kind=action.includes('inspect')?'inspect':'budget';
  const id=value||uid(kind==='budget'?'expense':'custom');
  edit={kind,action,id};
  if(action==='total'){title='编辑总预算';html=field('总预算（元）','totalBudget',docs.budget.totalBudget,'number','required min="0" step="0.01" inputmode="decimal"');}
  if(action==='expense'){
   const e=docs.budget.entries.find(e=>e.id===id)||{name:'',amount:'',category:'其他',stage:'设计',date:new Date(Date.now()+8*3600000).toISOString().slice(0,10),notes:''};
   title=value?'编辑支出':'新增支出';edit.category=e.category;edit.stage=e.stage;
   html=field('名称','name',e.name,'text','required maxlength="120"')+field('金额（元）','amount',e.amount,'number','required min="0" step="0.01" inputmode="decimal"')+pills('category',B.categories,e.category,'类别')+pills('stage',B.stages,e.stage,'阶段')+field('日期','date',displayDate(e.date),'text','required inputmode="numeric" placeholder="2026.10.28" maxlength="10" autocomplete="off"')+notesField(e.notes);
  }
  if(action==='inspect-add'){title='新增验收项';edit.id=uid('custom');edit.stage=value;html=field('验收内容','title','','text','required maxlength="200"')+pills('stage',I.stages,value,'阶段');}
  if(action==='inspect-note'){title='验收备注';const item=I.allItems(docs.inspect).find(i=>i.id===id);html=`<p>${esc(item.title)}</p>`+notesField(docs.inspect.items[id]?.notes);}
  if(action.startsWith('delete-')){const item=kind==='budget'?docs.budget.entries.find(e=>e.id===id):I.allItems(docs.inspect).find(i=>i.id===id);title=kind==='budget'?'删除这笔支出':'删除自建验收项';html=`<p class="ledger-delete-title">${esc(item.name||item.title)}</p><p>删除后所有设备同步，且不可恢复。</p>`;}
  $('ledger-dialog-title').textContent=title;$('ledger-fields').innerHTML=html;$('ledger-error').textContent='';$('ledger-submit').textContent=action.startsWith('delete-')?'确认删除':'保存';openModal($('ledger-dialog'));$('ledger-body').scrollTop=0;
  if(action.startsWith('delete-'))$('ledger-dialog').querySelector('.user-note-actions [data-ledger-close]').focus();else $('ledger-dialog-title').focus();
 }
 function tokenReady(){if(storedToken())return true;toast('请先在同步设置中连接 GitHub');openTokenSettings();return false;}
 async function save(kind,action){
  if(busy[kind]||!tokenReady())return false;
  busy[kind]=true;render(kind);$('ledger-form').setAttribute('aria-busy','true');$('ledger-form').querySelectorAll('button,input,textarea').forEach(e=>e.disabled=true);
  try{docs[kind]=await (kind==='budget'?B:I).write({action,token:storedToken()});toast('已保存到 GitHub');return true;}
  catch(error){if(edit)$('ledger-error').textContent=error.message;toast(error.message);return false;}
  finally{busy[kind]=false;render(kind);$('ledger-form').setAttribute('aria-busy','false');$('ledger-form').querySelectorAll('button,input,textarea').forEach(e=>e.disabled=false);}
 }
 document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-ledger-settings')){openTokenSettings();return;}
  if(b.hasAttribute('data-ledger-close')){if(!busy.budget&&!busy.inspect)$('ledger-dialog').close();return;}
  const choice=b.dataset.ledgerChoice;
  if(choice){if(choice.startsWith('filter-')){filters[choice.slice(7)]=b.dataset.value;render('budget');$('budget-page').querySelector(`[data-ledger-choice="${choice}"][data-value="${b.dataset.value}"]`).focus({preventScroll:true});}else{edit[choice]=b.dataset.value;b.parentElement.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}return;}
  if(b.dataset.ledgerAction==='reload')load(b.dataset.value);
  else if(b.dataset.ledgerAction)showForm(b.dataset.ledgerAction,b.dataset.value);
 });
 $('inspect-page').addEventListener('change',async event=>{
  const input=event.target,id=input.dataset.inspectCheck;if(!id)return;
  const checked=input.checked;input.checked=Boolean(docs.inspect.items[id]?.checked);
  await save('inspect',{type:'patch',id,patch:{checked}});
  $('inspect-page').querySelector(`[data-inspect-check="${id}"]`)?.focus({preventScroll:true});
 });
 $('ledger-form').addEventListener('submit',async event=>{
  event.preventDefault();if(!edit||busy[edit.kind])return;
  $('ledger-error').textContent='';const values=Object.fromEntries(new FormData(event.currentTarget));let action;
  try{
   if(edit.action==='total')action={type:'total',value:B.money(values.totalBudget)};
   else if(edit.action==='expense')action={type:'save',entry:B.entry({...values,id:edit.id,stage:edit.stage,category:edit.category})};
   else if(edit.action==='inspect-add')action={type:'add',item:I.customItem({id:edit.id,stage:edit.stage,title:values.title})};
   else if(edit.action==='inspect-note')action={type:'patch',id:edit.id,patch:{notes:values.notes}};
   else action={type:'delete',id:edit.id};
   if(await save(edit.kind,action))$('ledger-dialog').close();
  }catch(error){$('ledger-error').textContent=error.message;}
 });
 $('ledger-dialog').addEventListener('cancel',event=>{if(busy.budget||busy.inspect)event.preventDefault();});
 $('ledger-dialog').addEventListener('close',()=>{edit=null;restorePageScroll();});
 document.addEventListener('sync-refresh',()=>{for(const kind of ['budget','inspect'])if(!busy[kind])load(kind);});
 load('budget');load('inspect');
})();
