'use strict';
const paths={house:'M3 10 12 3l9 7M5 9v12h14V9M9 21v-8h6v8',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',bookmark:'M6 3h12v18l-6-4-6 4V3Z',checklist:'M8 4h13M8 11h13M8 18h13M2 4l1 1 2-3M2 11l1 1 2-3M2 18l1 1 2-3',check:'m5 12 4 4L20 5',arrow:'M4 12h16m-6-6 6 6-6 6',search:'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM16 16l6 6',close:'m5 5 14 14M19 5 5 19',book:'M12 5v16M12 5C8 2 3 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-4-2-7-1-10 1Z',plan:'M5 3h14v18H5zM9 7h6M9 11h6M9 15h3M3 7h3M3 12h3M3 17h3',receipt:'M5 2h14v20l-3-2-4 2-4-2-3 2V2ZM9 7h6M9 11h6M9 15h3',tool:'m14 5 5 5M2 22l9-9M14 4l3-2 5 5-2 3-6-6ZM6 4l4 4-2 2-4-4-2 1V2h5l-1 2ZM12 15l7 7 3-3-7-7',kitchen:'M3 12h18v9H3zM7 12V6a3 3 0 0 1 6 0v1M10 8h6M8 16v2M16 16v2M12 12v9M2 12h20',cabinet:'M4 3h16v18H4zM12 3v18M9 10v4M15 10v4M4 7h16'};
function icon(name){return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.book}"/></svg>`;}
function fillIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.icon);});}
function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const $=id=>document.getElementById(id);
const stages=window.RENOVATION_STAGES;
const notes=window.RENOVATION_NOTES;
const stageFor=id=>stages.find(s=>s.id===id);
const byId=id=>notes.find(n=>n.id===id);
let storageAvailable=true;
function readStorage(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{storageAvailable=false;return fallback;}}
function writeStorage(key,data){try{localStorage.setItem(key,JSON.stringify(data));}catch{storageAvailable=false;}}
const knownIds=new Set(notes.map(n=>n.id));
const storedSaved=readStorage('saya-renovation-saved-v1',[]);
const saved=new Set(Array.isArray(storedSaved)?storedSaved.filter(id=>knownIds.has(id)):[]);
const storedChecks=readStorage('saya-renovation-checks-v1',[]);
const checked=new Set(Array.isArray(storedChecks)?storedChecks:[]);
const state={view:'library',stage:'all',type:'all',query:'',sort:'recommended',opened:null,imagesOnly:false,imageNote:null,imageIndex:0};
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2300);}
function visibleNotes(){
 const query=state.query.trim().toLocaleLowerCase();
 let result=notes.filter(n=>(state.view!=='saved'||saved.has(n.id))&&(state.stage==='all'||n.stage===state.stage)&&(state.type==='all'||n.type===state.type)&&(!state.imagesOnly||n.images?.length)&&(!query||[n.title,n.originalTitle,n.author,n.summary,n.stage,stageFor(n.stage)?.title,...n.tags,...n.points,...(n.images||[]).map(i=>i.caption)].join(' ').toLocaleLowerCase().includes(query)));
 if(state.sort==='newest')result=result.slice().sort((a,b)=>b.date.localeCompare(a.date));
 return result;
}
function renderStages(){
 $('stage-nav').innerHTML=stages.map((s,i)=>`<button data-stage="${s.id}" class="${state.stage===s.id?'active':''}"><span>${String(i+1).padStart(2,'0')}</span>${s.title}</button>`).join('');
 $('stage-cards').innerHTML=stages.map((s,i)=>`<button class="stage-card ${state.stage===s.id?'active':''}" data-stage="${s.id}" aria-pressed="${state.stage===s.id}"><div class="stage-card-top">${icon(s.icon)}<small>0${i+1}</small></div><b>${s.title}</b><p>${s.hint}</p></button>`).join('');
 $('filter-chips').innerHTML=[{id:'all',title:'全部阶段'},...stages].map(s=>`<button class="chip ${state.stage===s.id?'active':''}" data-stage="${s.id}" aria-pressed="${state.stage===s.id}">${s.title}</button>`).join('')+`<button class="chip image-filter ${state.imagesOnly?'active':''}" data-images-filter aria-pressed="${state.imagesOnly}">▧ 有配图 · ${notes.filter(n=>n.images?.length).length}</button>`;
}
function mediaPreview(n,s){
 if(!n.images?.length)return `<div class="card-banner ${s?.color||''}"><span class="banner-category">${escapeHTML(s?.title)} / ${n.type==='攻略'?'GUIDE':'LESSONS'}</span><span class="banner-title">${escapeHTML(n.banner||s?.banner)}</span><span class="banner-icon">${icon(s?.icon)}</span></div>`;
 return `<button class="card-photo" data-image="${escapeHTML(n.id)}" data-image-index="0" aria-label="查看${escapeHTML(n.author)}的${n.images.length}张原帖配图"><img src="${escapeHTML(n.images[0].src)}" alt="${escapeHTML(n.images[0].alt)}" loading="lazy" decoding="async"><span class="photo-badge">▧ ${n.images.length} 张原帖配图 · 点击放大</span></button>`;
}
function noteGallery(n){
 if(!n.images?.length)return '';
 const expected=n.coverage?.expectedImages??n.images.length;
 return `<section class="note-gallery" id="note-gallery" aria-label="${escapeHTML(n.title)}的原帖配图"><div class="gallery-heading"><h3>原帖图集 <span>${n.images.length} / ${expected} 张</span></h3><small>按原帖顺序 · 点击放大</small></div><div class="gallery-thumbnails">${n.images.map((im,i)=>`<button data-image="${escapeHTML(n.id)}" data-image-index="${i}" aria-label="放大原帖第${im.sourceIndex||i+1}张图片：${escapeHTML(im.alt)}"><img src="${escapeHTML(im.src)}" alt="${escapeHTML(im.alt)}" loading="lazy" decoding="async"><span>原帖 ${String(im.sourceIndex||i+1).padStart(2,'0')} / ${escapeHTML(im.caption||'原帖配图')}</span></button>`).join('')}</div><p class="gallery-attribution">图片来自小红书作者 ${escapeHTML(n.author)}，保留原图与水印。已收录 ${n.images.length} 张${n.images.length===expected?'，静态配图已按原帖数量收齐':'；缺失部分见完整度说明'}。</p></section>`;
}
function coverageLabel(n){
 if(!n.coverage)return n.evidence.includes('配图')||n.evidence.includes('拼图')?'正文 / 配图已核对':'正文已核对';
 const c=n.coverage;
 return `${c.bodyRead?'正文已读':'正文待核对'} · 图 ${n.images?.length||0}/${c.expectedImages??'?'}${c.summaryComplete?' · 详细整理':''}`;
}
function imageReferences(n,refs=[]){
 return refs.map(ref=>{const index=(n.images||[]).findIndex(im=>im.sourceIndex===ref);if(index<0)return '';return `<button class="summary-image-ref" data-image="${escapeHTML(n.id)}" data-image-index="${index}" aria-label="查看此要点对应的原帖第${ref}张图片">图 ${ref} ↗</button>`;}).join('');
}
function detailedSummary(n){
 if(!n.sections?.length)return `<div class="detail-label" id="note-summary">内容要点</div><ul class="detail-points">${n.points.map(p=>`<li>${escapeHTML(p)}</li>`).join('')}</ul>`;
 return `<section class="detailed-summary" id="note-summary" aria-label="完整内容整理"><div class="detail-label">完整内容整理 <span>${n.sections.reduce((sum,s)=>sum+s.items.length,0)} 项</span></div>${n.sections.map((section,i)=>`<section class="summary-section"><h3><span>${String(i+1).padStart(2,'0')}</span>${escapeHTML(section.title)}</h3><ul class="detail-points">${section.items.map(item=>`<li>${escapeHTML(typeof item==='string'?item:item.text)}${typeof item==='string'?'':imageReferences(n,item.images)}</li>`).join('')}</ul></section>`).join('')}</section>`;
}
function coveragePanel(n){
 if(!n.coverage)return '';
 const c=n.coverage;
 return `<div class="coverage-panel ${c.summaryComplete&&c.imagesComplete?'complete':'partial'}"><b>原帖核对范围</b><span>${escapeHTML(coverageLabel(n))}</span><p>${escapeHTML(c.note||'正文和配图分别核对；总结中保留作者经验与适用条件。')}</p></div>`;
}
function card(n){
 const s=stageFor(n.stage);const isSaved=saved.has(n.id);
 return `<article class="article-card" data-note="${escapeHTML(n.id)}">${mediaPreview(n,s)}<div class="card-body"><div class="card-meta"><span class="type-tag ${n.type==='避坑'?'pitfall':''}">${n.type==='避坑'?'避坑经验':'装修攻略'}</span><span>${escapeHTML(s?.title)}</span></div><h3 class="card-title"><button class="title-button" data-open="${escapeHTML(n.id)}">${escapeHTML(n.title)}</button></h3><p class="card-summary">${escapeHTML(n.summary)}</p><div class="card-tags">${n.tags.map(t=>`<span># ${escapeHTML(t)}</span>`).join('')}</div><div class="card-bottom"><span class="author-dot">${escapeHTML(n.author.slice(0,1))}</span><span class="author-name" title="${escapeHTML(n.author)}">${escapeHTML(n.author)}</span><time class="card-date" datetime="${n.date}">${n.date.slice(5).replace('-','.')}</time><button class="bookmark-button ${isSaved?'saved':''}" data-save="${escapeHTML(n.id)}" aria-label="${isSaved?'取消收藏':'收藏'}：${escapeHTML(n.title)}" aria-pressed="${isSaved}">${icon('bookmark')}</button></div></div><div class="card-source-row"><span>${escapeHTML(coverageLabel(n))}</span><a href="${escapeHTML(n.url)}" target="_blank" rel="noopener noreferrer">查看原帖 ↗</a></div></article>`;
}
function renderLibrary(){
 const result=visibleNotes();const isSaved=state.view==='saved';
 $('article-grid').innerHTML=result.map(card).join('');
 $('result-total').textContent=`${result.length} 篇`;
 $('library-title').firstChild.textContent=isSaved?'我的收藏 ':'攻略与避坑资料库 ';
 $('library-eyebrow').textContent=isSaved?'KEEP THE NOTES THAT MATTER':'YOUR RENOVATION LIBRARY';
 $('saved-count').textContent=saved.size;
 $('side-count').textContent=notes.length;
 $('hero-count').textContent=notes.length;
 $('empty').hidden=result.length>0;
 $('empty-title').textContent=isSaved&&saved.size===0?'把有用的经验，先收进来。':'暂时没有匹配的笔记';
 $('empty-copy').textContent=isSaved&&saved.size===0?'点击笔记右下角的书签图标，在这里随时回看。':'换一个关键词，或者清除筛选再试试。';
 $('result-note').textContent=state.stage!=='all'||state.query||state.imagesOnly?`当前找到 ${result.length} 篇${state.stage!=='all'?`「${stageFor(state.stage).title}」`:''}${state.imagesOnly?'带配图的':''}笔记${state.query?`，关键词「${state.query}」`:''}`:'';
 document.querySelectorAll('[data-type]').forEach(b=>{b.classList.toggle('active',b.dataset.type===state.type);b.setAttribute('aria-pressed',String(b.dataset.type===state.type));});
}
function setView(view,scroll=true){
 state.view=view;state.stage='all';state.type='all';state.query='';state.imagesOnly=false;$('search-input').value='';
 const titles={library:'攻略与避坑',saved:'我的收藏',checklist:'装修检查清单'};
 $('breadcrumb').textContent=titles[view];
 $('hero').hidden=view!=='library';$('stage-section').hidden=view!=='library';$('library').hidden=view==='checklist';$('checklist-page').hidden=view!=='checklist';
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
 renderStages();renderLibrary();if(view==='checklist')renderChecklist();
 if(scroll)window.scrollTo({top:0,behavior:'smooth'});
}
function setStage(id){
 if(state.view==='checklist')setView('library',false);
 state.stage=id;renderStages();renderLibrary();
 $('library').scrollIntoView({behavior:'smooth',block:'start'});
}
function toggleSaved(id){
 if(!byId(id))return;
 if(saved.has(id)){saved.delete(id);toast('已取消收藏');}else{saved.add(id);toast('已收藏，随时回看这篇笔记');}
 writeStorage('saya-renovation-saved-v1',[...saved]);
 if(!storageAvailable)toast('当前浏览器无法保存，记录仅在本次打开期间保留');
 renderLibrary();
 if(state.opened===id)updateDialogSave(id);
}
function updateDialogSave(id){const b=$('dialog-save');if(b){b.textContent=saved.has(id)?'已收藏 · 点击取消':'收藏这篇笔记';b.setAttribute('aria-pressed',String(saved.has(id)));}}
// 固定背景而非仅设置 overflow，兼容手机浏览器的触摸滚动；嵌套弹窗共用一把锁。
let modalPagePosition=null;
function openModal(dialog){
 if(dialog.open)return;
 if(!modalPagePosition){
  modalPagePosition={x:window.scrollX,y:window.scrollY};
  document.body.style.setProperty('--modal-page-top',`${-modalPagePosition.y}px`);
  document.documentElement.classList.add('modal-open');
  document.body.classList.add('modal-open');
 }
 dialog.showModal();
}
function restorePageScroll(){
 if(document.querySelector('dialog[open]')||!modalPagePosition)return;
 const position=modalPagePosition;modalPagePosition=null;
 document.body.classList.remove('modal-open');
 document.documentElement.classList.remove('modal-open');
 document.body.style.removeProperty('--modal-page-top');
 window.scrollTo({left:position.x,top:position.y,behavior:'auto'});
}
function showNote(id){
 const n=byId(id);if(!n)return;state.opened=id;
 $('dialog-content').innerHTML=`<div class="card-meta"><span class="type-tag ${n.type==='避坑'?'pitfall':''}">${n.type==='避坑'?'避坑经验':'装修攻略'}</span><span>${escapeHTML(stageFor(n.stage)?.title)}</span></div><h2 id="dialog-title">${escapeHTML(n.title)}</h2><div class="dialog-meta">${escapeHTML(n.author)} <span>·</span> 发布于 ${n.date} <span>·</span> 小红书</div><p class="dialog-intro">${escapeHTML(n.summary)}</p>${coveragePanel(n)}<div class="note-shortcuts"><button data-note-jump="note-summary">详细总结 ↓</button>${n.images?.length?`<button data-note-jump="note-gallery">原帖图集 · ${n.images.length} 张 ↓</button>`:''}</div>${detailedSummary(n)}${noteGallery(n)}<div class="evidence-box"><b>资料核对</b> ${escapeHTML(n.evidence)} · 2026.10.22${n.limits?`<br>${escapeHTML(n.limits)}`:''}</div><div class="dialog-actions"><a class="primary" href="${escapeHTML(n.url)}" target="_blank" rel="noopener noreferrer">查看小红书原帖 ↗</a><button class="secondary" id="dialog-save" data-save="${escapeHTML(n.id)}"></button></div><p class="dialog-original">原帖标题：${escapeHTML(n.originalTitle||n.title)}</p>`;
 updateDialogSave(id);$('dialog-content').scrollTop=0;openModal($('article-dialog'));
}
function showImage(id,index=0){
 const note=byId(id);if(!note?.images?.length)return;
 state.imageNote=id;state.imageIndex=(index+note.images.length)%note.images.length;
 renderImage();openModal($('image-dialog'));
}
function renderImage(){
 const n=byId(state.imageNote);if(!n?.images?.length)return;
 const image=n.images[state.imageIndex];
 $('image-viewer-title').textContent=n.title;
 $('image-position').textContent=`${image.sourceIndex||state.imageIndex+1} / ${n.coverage?.expectedImages??n.images.length}`;
 $('viewer-image').alt=image.alt;
 $('viewer-image').src=image.src;
 $('viewer-image').hidden=false;
 $('viewer-scroll').querySelector('.image-fallback').hidden=true;
 $('image-caption').textContent=image.caption||image.alt;
 $('image-credit').textContent=`图片来源：小红书 · ${n.author} · 保留原图与水印`;
 $('image-limits').textContent=n.limits||'原图内容为作者经验，请结合自家实际条件判断。';
 $('image-source').href=n.url;
 $('image-prev').disabled=n.images.length<2;$('image-next').disabled=n.images.length<2;
 $('viewer-scroll').classList.remove('zoomed');$('image-zoom').textContent='放大查看';$('image-zoom').setAttribute('aria-pressed','false');
 $('viewer-scroll').scrollTop=0;$('viewer-scroll').scrollLeft=0;
}
function moveImage(delta){if(state.imageNote)showImage(state.imageNote,state.imageIndex+delta);}
$('close-image').addEventListener('click',()=>$('image-dialog').close());
$('image-prev').addEventListener('click',()=>moveImage(-1));
$('image-next').addEventListener('click',()=>moveImage(1));
$('image-zoom').addEventListener('click',()=>{const zoomed=$('viewer-scroll').classList.toggle('zoomed');$('image-zoom').textContent=zoomed?'适应宽度':'放大查看';$('image-zoom').setAttribute('aria-pressed',String(zoomed));});
$('image-dialog').addEventListener('close',()=>{state.imageNote=null;restorePageScroll();});
$('image-dialog').addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveImage(event.key==='ArrowRight'?1:-1);}});
$('image-dialog').addEventListener('click',event=>{if(event.target===$('image-dialog')){const r=$('image-dialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('image-dialog').close();}});
$('viewer-image').addEventListener('error',()=>{$('viewer-image').hidden=true;$('viewer-scroll').querySelector('.image-fallback').hidden=false;});
const checklist=[
 {stage:'准备',items:[['plan-list','列出硬装、定制、家具软装和电器，建立完整预算表。','6937eb83000000001e0100df'],['plan-size','在水电定位前明确主要电器、橱柜和卫浴设备的尺寸与位置。','6937eb83000000001e0100df']]},
 {stage:'预算',items:[['budget-range','核对报价中的品牌、型号、数量和服务包含范围。','company'],['budget-extra','确认搬运、清运、拆后修补的费用与计价方式。','extras'],['budget-contract','在合同中明确工期、质保、延期处理和增项确认方式。','company'],['budget-own','把套餐内、套餐外、业主自购分别列预算。','6ad4b548000000000c00a11b']]},
 {stage:'施工',items:[['electric-plan','逐处核对插座与开关，确认家具遮挡和线缆空间。','6abc64740000000002028ea2'],['electric-label','核对合同中的管材、电线和网线标识。','690c8eb50000000005011f07'],['electric-record','封闭前拍照保存管线位置，归档施工图和验收记录。','690c8eb50000000005011f07']]},
 {stage:'厨卫',items:[['bath-water','和施工方确认门口、门槛及周边墙面的防水收口。','69b942730000000020038cfe'],['bath-drain','查看地漏清理便利性、壁龛积水和检修条件。','69b942730000000020038cfe'],['bath-power','确认卫浴设备的用电点位及防溅措施。','69b942730000000020038cfe'],['bath-air','安装后查看卫生间排风管是否接到通风口。','lived']]},
 {stage:'安装',items:[['custom-material','分别写清柜体、门板的基材、饰面和封边工艺。','custom'],['custom-report','核对检测报告对应的产品与实际合同配置。','custom'],['custom-clean','检查柜体缝隙、拉手与窗边收口的清洁和维护条件。','lived']]},
 {stage:'入住',items:[['lived-color','把门与窗帘的样品放在家中实际光线下比较。','lived'],['lived-finish','记录安装收口、排风和清洁上的问题，联系责任方处理。','lived']]}
];
function renderChecklist(){
 const valid=checklist.flatMap(g=>g.items).filter(i=>byId(i[2]));
 const count=valid.filter(i=>checked.has(i[0])).length;
 $('progress-label').textContent=`已确认 ${count} / ${valid.length} 项`;
 $('progress-fill').style.width=`${valid.length?count/valid.length*100:0}%`;
 $('checklist-groups').innerHTML=checklist.map((g,index)=>{const s=stageFor(g.stage);const items=g.items.filter(i=>byId(i[2]));return `<section class="check-group"><h2>${icon(s.icon)}${s.title}<small>0${index+1}</small></h2>${items.map(([id,text,source])=>`<div class="check-item"><input type="checkbox" id="check-${id}" data-check="${id}" ${checked.has(id)?'checked':''}><label for="check-${id}">${escapeHTML(text)}</label><button class="check-source" data-open="${source}" aria-label="查看此清单项的来源笔记">来源 ↗</button></div>`).join('')}</section>`;}).join('');
}
document.addEventListener('click',event=>{
 const target=event.target.closest('button,a');if(!target)return;
 if(target.dataset.view)setView(target.dataset.view);
 if(target.dataset.stage)setStage(target.dataset.stage);
 if(target.dataset.type){state.type=target.dataset.type;renderLibrary();}
 if(target.dataset.open)showNote(target.dataset.open);
 if(target.dataset.save)toggleSaved(target.dataset.save);
 if(target.dataset.image)showImage(target.dataset.image,Number(target.dataset.imageIndex)||0);
 if(target.hasAttribute('data-images-filter')){state.imagesOnly=!state.imagesOnly;renderStages();renderLibrary();}
 if(target.dataset.noteJump){const content=$('dialog-content');const section=document.getElementById(target.dataset.noteJump);if(section)content.scrollTo({top:content.scrollTop+section.getBoundingClientRect().top-content.getBoundingClientRect().top-12,behavior:'smooth'});}
});
$('search-input').addEventListener('input',event=>{state.query=event.target.value;renderLibrary();});
$('sort-select').addEventListener('change',event=>{state.sort=event.target.value;renderLibrary();});
$('explore').addEventListener('click',()=>$('stage-section').scrollIntoView({behavior:'smooth'}));
$('open-checklist').addEventListener('click',()=>setView('checklist'));
$('all-stages').addEventListener('click',()=>setStage('all'));
$('reset-filters').addEventListener('click',()=>{setView('library',false);$('library').scrollIntoView({behavior:'smooth'});});
$('close-dialog').addEventListener('click',()=>$('article-dialog').close());
$('article-dialog').addEventListener('close',()=>{state.opened=null;restorePageScroll();});
$('article-dialog').addEventListener('click',event=>{if(event.target===$('article-dialog')){const r=$('article-dialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('article-dialog').close();}});
$('checklist-groups').addEventListener('change',event=>{const id=event.target.dataset.check;if(!id)return;if(event.target.checked)checked.add(id);else checked.delete(id);writeStorage('saya-renovation-checks-v1',[...checked]);const focusId=event.target.id;renderChecklist();document.getElementById(focusId)?.focus();if(!storageAvailable)toast('当前浏览器无法保存，进度仅在本次打开期间保留');});
$('reset-checklist').addEventListener('click',()=>{if(!checked.size){toast('清单尚未勾选');return;}if(window.confirm('将清除当前浏览器中的所有清单勾选，确认重置吗？')){checked.clear();writeStorage('saya-renovation-checks-v1',[]);renderChecklist();toast('勾选已重置');}});
document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('article-dialog').open&&!$('image-dialog').open){event.preventDefault();if(state.view==='checklist')setView('library',false);$('search-input').focus();}});
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();setView('library');});
fillIcons();renderStages();renderLibrary();renderChecklist();
