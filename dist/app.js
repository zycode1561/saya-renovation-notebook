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
const state={view:'library',stage:'预算',type:'all',query:'',sort:'recommended',opened:null,imagesOnly:false,imageNote:null,imageIndex:0};
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2300);}
function visibleNotes(){
 const query=state.query.trim().toLocaleLowerCase();
 let result=notes.filter(n=>(state.view!=='saved'||saved.has(n.id))&&(state.stage==='all'||n.stage===state.stage)&&(state.type==='all'||n.type===state.type)&&(!state.imagesOnly||n.images?.length)&&(!query||[n.title,n.originalTitle,n.author,n.summary,n.stage,stageFor(n.stage)?.title,...n.tags,...n.points,...(n.images||[]).map(i=>i.caption)].join(' ').toLocaleLowerCase().includes(query)));
 if(state.sort==='newest')result=result.slice().sort((a,b)=>b.date.localeCompare(a.date));
 return result;
}
function renderStages(){
 $('filter-chips').innerHTML=[{id:'all',title:'全部阶段'},...stages].map(s=>`<button class="chip ${state.stage===s.id?'active':''}" data-stage="${s.id}" aria-pressed="${state.stage===s.id}">${s.title}</button>`).join('')+`<button class="chip image-filter ${state.imagesOnly?'active':''}" data-images-filter aria-pressed="${state.imagesOnly}">▧ 有配图 · ${notes.filter(n=>n.images?.length).length}</button>`;
}
const coverCopy={
 '69d5b6da0000000023004c9a':{tone:'sage',label:'DESIGN BRIEF',lines:['给设计师的','需求说明书'],footer:'从生活动线，到空间功能'},
 '69ddcb4e000000001d01a01f':{tone:'lilac',label:'BEFORE YOU SIGN',lines:['装修公司','到底怎么选？'],footer:'现场 · 明细 · 负责人'},
 '6a1a292600000000080272aa':{tone:'sand',label:'FIRST MEETING',lines:['第一次到店，','该问什么？'],footer:'费用边界与施工沟通'},
 '6aa6b1ff0000000026014d71':{tone:'sage',label:'DESIGN NOTES',lines:['先聊生活，','再聊风格。'],footer:'喜欢的、不要的、待确认的'},
 '6a756d0600000000280318f0':{tone:'sand',label:'HOME PLANNING',lines:['装修之前，','先认识自己。'],footer:'核心需求 · 空间活动 · 家庭取舍'},
 '688778790000000025015e87':{tone:'lilac',label:'TALK TO DESIGNER',lines:['把需求，','讲具体一点。'],footer:'家庭、功能、设备与方案反馈'},
 '6a8443160000000025006648':{tone:'sand',label:'BUDGET NOTES',lines:['预计预算 ≠','最终花费'],footer:'149㎡自装业主的预算记录'},
 '69b551f7000000001a022244':{tone:'lilac',label:'BUDGET & DESIGN',lines:['预算不同，','配置差在哪？'],footer:'把价格档位，改成配置问题'}
};
function mediaPreview(n,s){
 if(coverCopy[n.id]||!n.images?.length){
  const cover=coverCopy[n.id]||{tone:'sand',label:'RENOVATION NOTES',lines:[n.title],footer:s?.title||'装修笔记'};
  return `<button class="note-cover cover-${escapeHTML(cover.tone)}" data-open="${escapeHTML(n.id)}" aria-label="阅读笔记：${escapeHTML(n.title)}"><span class="cover-label">${escapeHTML(cover.label)}</span><span class="cover-title">${cover.lines.map(escapeHTML).join('<br>')}</span><span class="cover-rule" aria-hidden="true"></span><span class="cover-footer">${escapeHTML(cover.footer)}</span><span class="cover-credit">整理封面 · ${n.expandedAt?'图文详解':'正文笔记'}</span>${n.images?.length?`<span class="cover-image-count">${n.images.length} 张配图</span>`:''}</button>`;
 }
 return `<button class="card-photo" data-open="${escapeHTML(n.id)}" aria-label="阅读笔记：${escapeHTML(n.title)}，含${n.images.length}张原帖配图"><img src="${escapeHTML(n.images[0].src)}" alt="${escapeHTML(n.images[0].alt)}" loading="lazy" decoding="async"><span class="photo-badge">${n.images.length} 张配图</span></button>`;
}
function inlineImages(n,images){
 return images.map(im=>{const index=n.images.indexOf(im);return `<figure class="inline-note-image" id="note-image-${im.sourceIndex||index+1}"><button data-image="${escapeHTML(n.id)}" data-image-index="${index}" aria-label="放大第${im.sourceIndex||index+1}张配图"><img src="${escapeHTML(im.src)}" alt="${escapeHTML(im.alt)}" width="${im.width}" height="${im.height}" loading="lazy" decoding="async"></button><figcaption>图 ${im.sourceIndex||index+1} · ${escapeHTML(im.caption||'配图')}</figcaption></figure>`;}).join('');
}
function noteGallery(n){return '';}
function coverageLabel(n){
 if(!n.coverage)return n.evidence.includes('配图')||n.evidence.includes('拼图')?'正文 / 配图已核对':'正文已核对';
 const c=n.coverage;
 if(c.mode==='body-only')return '正文已读 · 配图未核对';
 if(c.mode==='full-images')return `图文已核对 · 图 ${n.images?.length||0}/${c.expectedImages}`;
 return `${c.bodyRead?'正文已读':'正文待核对'} · 图 ${n.images?.length||0}/${c.expectedImages??'?'}${c.summaryComplete?' · 详细整理':''}`;
}
function imageReferences(n,refs=[]){
 return refs.filter(ref=>(n.images||[]).some(im=>im.sourceIndex===ref)).map(ref=>`<button class="summary-image-ref" data-note-jump="note-image-${ref}" aria-label="跳到笔记中的第${ref}张配图">图 ${ref} ↓</button>`).join('');
}
function readingParagraphs(text){
 const result=[];let part='';const nesting=[];
 const pairs={'“':'”','‘':'’','（':'）','【':'】','《':'》','「':'」'};
 for(const character of text){
  part+=character;
  if(pairs[character])nesting.push(pairs[character]);
  else if(character===nesting[nesting.length-1])nesting.pop();
  if('。！？'.includes(character)&&!nesting.length&&part.length>=90){result.push(part);part='';}
 }
 if(part){if(part.length<25&&result.length)result[result.length-1]+=part;else result.push(part);}
 return result;
}
function readerPointText(text){
 const lead=text.match(/^([^。！？；]{2,28}[：:])([\s\S]+)$/u);
 const heading=lead?`<h4>${escapeHTML(lead[1])}</h4>`:'';
 return heading+readingParagraphs(lead?lead[2]:text).map(p=>`<p>${escapeHTML(p)}</p>`).join('');
}
function noteTables(tables=[]){
 return tables.map(t=>`<div class="note-table-wrap"><table class="note-table columns-${t.columns.length}">${t.title?`<caption>${escapeHTML(t.title)}</caption>`:''}<thead><tr>${t.columns.map(c=>`<th scope="col">${escapeHTML(c)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map(cell=>`<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table>${t.note?`<p class="note-table-explanation">${escapeHTML(t.note)}</p>`:''}</div>`).join('');
}
function sectionOrigin(section){
 const labels={source:'原帖整理',site:'本站建议',calculation:'本站核算'};
 return section.kind?`<div class="section-origin ${section.kind==='source'?'':'site-origin'}">${labels[section.kind]||'本站整理'}</div>`:'';
}
function detailedSummary(n){
 const used=new Set();
 const sectionImages=section=>{const refs=new Set(section.items.flatMap(item=>typeof item==='string'?[]:item.images||[]));const images=(n.images||[]).filter(im=>refs.has(im.sourceIndex)&&!used.has(im));images.forEach(im=>used.add(im));return inlineImages(n,images);};
 let body;
 if(!n.sections?.length)body=`<ul class="detail-points" role="list">${n.points.map(p=>`<li class="reader-point"><div class="reader-point-copy">${readerPointText(p)}</div></li>`).join('')}</ul>`;
 else body=n.sections.map((section,i)=>`<section class="summary-section" id="note-section-${i+1}">${sectionOrigin(section)}<h3><span>${String(i+1).padStart(2,'0')}</span>${escapeHTML(section.title)}</h3><ul class="detail-points" role="list">${section.items.map(item=>{const text=typeof item==='string'?item:item.text;const refs=typeof item==='string'?'':imageReferences(n,item.images);return `<li class="reader-point"><div class="reader-point-copy">${readerPointText(text)}</div>${refs?`<div class="reader-point-images">${refs}</div>`:''}</li>`;}).join('')}</ul>${noteTables(section.tables)}${sectionImages(section)}</section>`).join('');
 const remaining=(n.images||[]).filter(im=>!used.has(im));
 return `<section class="detailed-summary" id="note-summary" aria-label="图文笔记">${body}${remaining.length?`<section class="summary-section"><h3>补充配图</h3>${inlineImages(n,remaining)}</section>`:''}</section>`;
}
function readerContents(n){
 if(!n.sections?.length)return '';
 return `<details class="reader-toc" id="reader-toc"><summary><span>本篇目录</span><small>${n.sections.length} 个主题</small></summary><nav aria-label="本篇主题目录">${n.sections.map((section,i)=>`<button data-note-jump="note-section-${i+1}"><span>${String(i+1).padStart(2,'0')}</span>${escapeHTML(section.title)}</button>`).join('')}</nav></details>`;
}
function coveragePanel(n){
 const c=n.coverage;
 return `<section class="reader-source note-source-end" aria-label="来源说明"><h3>来源说明</h3><p>小红书 · ${escapeHTML(n.author)} · ${escapeHTML(n.date)}</p><p>原帖：<a href="${escapeHTML(n.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(n.originalTitle||n.title)} ↗</a></p><p>${n.images?.length?(n.expandedAt?'配图按原帖顺序保留，含原作者收集的参考图及署名；原帖整理、本站建议与核算分区标注。':'配图来自原作者，保留原图与水印；文字为整理笔记。'):'文字为本站根据原帖正文整理的摘要；本次未收录配图。'}</p>${c?`<p>${escapeHTML(coverageLabel(n))}。${escapeHTML(c.note||'')}</p>`:''}<p>${escapeHTML(n.evidence)} · 核对日期：${escapeHTML(n.checkedAt||'2026-10-22')}</p>${n.limits?`<p>${escapeHTML(n.limits)}</p>`:''}</section>`;
}
function scrollReaderTo(id){
 const content=$('dialog-content'),section=document.getElementById(id);
 if(section)content.scrollTo({top:content.scrollTop+section.getBoundingClientRect().top-content.getBoundingClientRect().top-16,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
function card(n){
 const s=stageFor(n.stage);const isSaved=saved.has(n.id);
 return `<article class="article-card" data-note="${escapeHTML(n.id)}">${mediaPreview(n,s)}<div class="card-body"><div class="card-meta"><span class="type-tag ${n.type==='避坑'?'pitfall':''}">${n.type==='避坑'?'避坑经验':'装修攻略'}</span><span>${escapeHTML(s?.title)}</span></div><h3 class="card-title"><button class="title-button" data-open="${escapeHTML(n.id)}">${escapeHTML(n.title)}</button></h3><p class="card-summary">${escapeHTML(n.summary)}</p><div class="card-tags">${n.tags.map(t=>`<span># ${escapeHTML(t)}</span>`).join('')}</div><div class="card-bottom"><span class="author-dot">${escapeHTML(n.author.slice(0,1))}</span><span class="author-name" title="${escapeHTML(n.author)}">${escapeHTML(n.author)}</span><time class="card-date" datetime="${n.date}">${n.date.slice(5).replace('-','.')}</time><button class="bookmark-button ${isSaved?'saved':''}" data-save="${escapeHTML(n.id)}" aria-label="${isSaved?'取消收藏':'收藏'}：${escapeHTML(n.title)}" aria-pressed="${isSaved}">${icon('bookmark')}</button></div></div><div class="card-source-row"><span>${escapeHTML(coverageLabel(n))}</span><a href="${escapeHTML(n.url)}" target="_blank" rel="noopener noreferrer">查看原帖 ↗</a></div></article>`;
}
function renderLibrary(){
 const result=visibleNotes();const isSaved=state.view==='saved';
 $('article-grid').innerHTML=result.map(card).join('');
 $('result-total').textContent=`${result.length} 篇`;
 $('library-title').firstChild.textContent=isSaved?'我的收藏 ':'装修笔记 ';
 $('library-eyebrow').textContent=isSaved?'把有用的经验，留在手边':'收藏一点经验，少走一点弯路';
 $('saved-count').textContent=saved.size;
 $('side-count').textContent=notes.length;
 $('hero-count').textContent=notes.length;
 $('source-stats').textContent=`${notes.length} 篇 · ${notes.reduce((sum,n)=>sum+(n.images?.length||0),0)} 张配图 · ${notes.reduce((sum,n)=>sum+n.points.length,0)} 条要点`;
 $('empty').hidden=result.length>0;
 $('empty-title').textContent=isSaved&&saved.size===0?'把有用的经验，先收进来。':'暂时没有匹配的笔记';
 $('empty-copy').textContent=isSaved&&saved.size===0?'点击笔记右下角的书签图标，在这里随时回看。':'换一个关键词，或者清除筛选再试试。';
 $('result-note').textContent=state.stage!=='all'||state.query||state.imagesOnly?`当前找到 ${result.length} 篇${state.stage!=='all'?`「${stageFor(state.stage).title}」`:''}${state.imagesOnly?'带配图的':''}笔记${state.query?`，关键词「${state.query}」`:''}`:'';
 document.querySelectorAll('[data-type]').forEach(b=>{b.classList.toggle('active',b.dataset.type===state.type);b.setAttribute('aria-pressed',String(b.dataset.type===state.type));});
}
// Each workspace owns its browsing state; model resources load only on first entry.
const workspaceState=new Map();
let homeController=null,homeLoading=null;
function syncHomeWorkspace(){
 if(homeController){homeController.setActive(state.view==='home');return;}
 if(state.view!=='home'||homeLoading)return;
 const status=$('home-load-status');status.hidden=false;status.innerHTML='<p>正在打开我家的方案…</p>';
 homeLoading=import('./home-workspace.js?v=home-20261027e').then(module=>module.createHomeWorkspace($('home-model'))).then(controller=>{
  homeController=controller;controller.setActive(state.view==='home');status.hidden=true;
 }).catch(error=>{
  console.error('Home workspace:',error);status.innerHTML='<p>方案暂时没能加载，笔记和清单仍可使用。</p><button class="primary" id="home-retry">重新加载方案</button>';
  $('home-retry').onclick=syncHomeWorkspace;
 }).finally(()=>{homeLoading=null;});
}
function setView(view,scroll=true){
 if(!['library','saved','checklist','home'].includes(view))return;
 workspaceState.set(state.view,{stage:state.stage,type:state.type,query:state.query,imagesOnly:state.imagesOnly,sort:state.sort,scrollY:window.scrollY});
 const previous=workspaceState.get(view);
 state.view=view;
 Object.assign(state,previous||{stage:view==='library'?'预算':'all',type:'all',query:'',imagesOnly:false,sort:'recommended'});
 $('search-input').value=state.query;
 const titles={library:'发现笔记',saved:'我的收藏',checklist:'检查清单',home:'我的家'};
 $('breadcrumb').textContent=titles[view];
 $('current-stage').hidden=view!=='library';$('hero').hidden=view!=='library';$('library').hidden=!['library','saved'].includes(view);$('checklist-page').hidden=view!=='checklist';$('home-page').hidden=view!=='home';
 document.querySelectorAll('.site-nav [data-view]').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);if(b.dataset.view===view)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 $('sort-value').textContent=state.sort==='newest'?'最新发布':'推荐阅读';
 document.querySelectorAll('[data-sort]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.sort===state.sort)));
 renderStages();renderLibrary();if(view==='checklist')renderChecklist();syncHomeWorkspace();
 if(scroll)window.scrollTo({top:previous?.scrollY||0,behavior:'instant'});
}
function setStage(id){
 if(!['library','saved'].includes(state.view))setView('library',false);
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
 document.dispatchEvent(new CustomEvent('home-reading-change',{detail:true}));
 const n=byId(id);if(!n)return;state.opened=id;
 const count=n.sections?.reduce((sum,section)=>sum+section.items.length,0)||n.points.length;
 const tableCount=n.sections?.reduce((sum,section)=>sum+(section.tables?.length||0),0)||0;
 $('dialog-content').innerHTML=`<article class="reader-document"><header class="reader-heading"><div class="card-meta"><span class="type-tag ${n.type==='避坑'?'pitfall':''}">${n.type==='避坑'?'避坑经验':'装修攻略'}</span><span>${escapeHTML(stageFor(n.stage)?.title)}</span></div><h2 id="dialog-title" tabindex="-1" autofocus>${escapeHTML(n.title)}</h2><div class="reader-stats"><span>${count} 条要点</span><span>${n.images?.length||0} 张配图</span>${tableCount?`<span>${tableCount} 组对照表</span>`:''}</div><p class="dialog-intro">${escapeHTML(n.summary)}</p></header>${readerContents(n)}${detailedSummary(n)}<div class="dialog-actions"><button class="secondary" id="dialog-save" data-save="${escapeHTML(n.id)}"></button><a class="primary" href="${escapeHTML(n.url)}" target="_blank" rel="noopener noreferrer">查看小红书原帖 ↗</a></div>${coveragePanel(n)}</article>`;
 $('reader-contents-button').hidden=!n.sections?.length;$('reader-contents-button').setAttribute('aria-expanded','false');$('reader-gallery-button').hidden=!n.images?.length;if(n.images?.length)$('reader-gallery-button').dataset.noteJump=`note-image-${n.images[0].sourceIndex||1}`;
 updateDialogSave(id);openModal($('article-dialog'));$('dialog-content').scrollTo({top:0,left:0,behavior:'instant'});
}
function showImage(id,index=0){
 const note=byId(id);if(!note?.images?.length)return;
 $('image-details').hidden=true;$('image-info').setAttribute('aria-expanded','false');imageCarousel.reset();state.imageNote=id;state.imageIndex=(index+note.images.length)%note.images.length;
 renderImage();openModal($('image-dialog'));$('viewer-scroll').scrollTo({top:0,left:0,behavior:'instant'});
}
function renderImage(){
 const n=byId(state.imageNote);if(!n?.images?.length)return;
 const image=n.images[state.imageIndex];
 $('image-viewer-title').textContent=n.title;
 $('image-position').textContent=`${image.sourceIndex||state.imageIndex+1} / ${n.coverage?.expectedImages??n.images.length}`;
 $('viewer-image').alt=image.alt;
 if($('viewer-image').getAttribute('src')!==image.src)$('viewer-image').src=image.src;
 $('viewer-image').width=image.width;$('viewer-image').height=image.height;
 $('viewer-image').hidden=false;
 $('viewer-scroll').querySelector('.image-fallback').hidden=true;
 $('image-caption').textContent=image.caption||image.alt;
 $('image-credit').textContent=`图片来源：小红书 · ${n.author} · 保留原图与水印`;
 $('image-limits').textContent=n.limits||'原图内容为作者经验，请结合自家实际条件判断。';
 $('image-source').href=n.url;
 $('image-prev').disabled=n.images.length<2;$('image-next').disabled=n.images.length<2;
 $('viewer-scroll').classList.remove('zoomed');$('image-zoom').textContent='放大查看';$('image-zoom').setAttribute('aria-pressed','false');updateImageGestureHint();
 $('viewer-scroll').scrollTop=0;$('viewer-scroll').scrollLeft=0;primeImageNeighbors(n);
}
function moveImage(delta){
 if(!state.imageNote)return;
 if(imageViewport.classList.contains('zoomed')){
  imageCarousel.reset();state.imageIndex=(state.imageIndex+delta+byId(state.imageNote).images.length)%byId(state.imageNote).images.length;renderImage();
 }else imageCarousel.step(delta);
}
const imageViewport=$('viewer-scroll');
function updateImageGestureHint(){
 const multiple=(byId(state.imageNote)?.images?.length||0)>1;
 const zoomed=imageViewport.classList.contains('zoomed');
 $('viewer-stage').dataset.swipeEnabled=String(multiple&&!zoomed);$('viewer-stage').classList.toggle('is-zoomed',zoomed);
 $('image-gesture-hint').textContent=zoomed?'已放大 · 可上下左右滑动查看':multiple?'左右拖动翻图 · 轻甩切换 · 上下看长图':'上下滑动查看长图';
 imageViewport.setAttribute('aria-label',zoomed?'已放大图片，可上下左右滑动查看':multiple?'原帖大图，左右滑动切换图片，上下滑动查看长图':'原帖大图，可上下滑动查看长图');
}
function primeImageNeighbors(note){
 for(const [delta,id] of [[-1,'viewer-previous'],[1,'viewer-next']]){
  const pane=$(id),img=pane.querySelector('img');
  const image=note.images[(state.imageIndex+delta+note.images.length)%note.images.length];
  img.hidden=false;img.width=image.width;img.height=image.height;
  if(img.getAttribute('src')!==image.src){img.src=image.src;if(img.decode)img.decode().catch(()=>{});}
  pane.dataset.ready=String(img.complete&&img.naturalWidth>0);pane.scrollTop=0;
 }
}
function promoteImageNeighbor(delta){
 const pane=$(delta>0?'viewer-next':'viewer-previous');
 const incoming=pane.querySelector('img'),outgoing=$('viewer-image');
 outgoing.removeAttribute('id');incoming.id='viewer-image';
 outgoing.replaceWith(incoming);pane.prepend(outgoing);
 const note=byId(state.imageNote);state.imageIndex=(state.imageIndex+delta+note.images.length)%note.images.length;
 renderImage();
}
const imageCarousel=window.createImageCarousel({
 stage:$('viewer-stage'),track:$('viewer-track'),
 canSwipe:()=>$('image-dialog').open&&$('viewer-stage').dataset.swipeEnabled==='true',
 onStep:promoteImageNeighbor
});
$('viewer-stage').addEventListener('load',event=>{if(event.target.parentElement?.classList.contains('viewer-neighbor'))event.target.parentElement.dataset.ready='true';},true);
$('viewer-stage').addEventListener('error',event=>{
 if(event.target.id==='viewer-image'){event.target.hidden=true;imageViewport.querySelector('.image-fallback').hidden=false;}
},true);
$('image-info').addEventListener('click',()=>{const panel=$('image-details');panel.hidden=!panel.hidden;$('image-info').setAttribute('aria-expanded',String(!panel.hidden));});
$('close-image').addEventListener('click',()=>$('image-dialog').close());
$('image-prev').addEventListener('click',()=>moveImage(-1));
$('image-next').addEventListener('click',()=>moveImage(1));
$('image-zoom').addEventListener('click',()=>{imageCarousel.reset();const zoomed=$('viewer-scroll').classList.toggle('zoomed');$('image-zoom').textContent=zoomed?'适应宽度':'放大查看';$('image-zoom').setAttribute('aria-pressed',String(zoomed));updateImageGestureHint();});
$('image-dialog').addEventListener('close',()=>{imageCarousel.reset();state.imageNote=null;restorePageScroll();});
$('image-dialog').addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();moveImage(event.key==='ArrowRight'?1:-1);}});
$('image-dialog').addEventListener('click',event=>{if(event.target===$('image-dialog')){const r=$('image-dialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('image-dialog').close();}});

const checklist=[
 {stage:'准备',items:[['plan-list','列出硬装、定制、家具软装和电器，建立完整预算表。','6937eb83000000001e0100df'],['plan-size','在水电定位前明确主要电器、橱柜和卫浴设备的尺寸与位置。','6937eb83000000001e0100df']]},
 {stage:'预算',items:[['budget-whole','把预计总额、已支付、未采购和报价未包含项目分别列出。','6a8443160000000025006648'],['company-visit','线下查看施工现场与落地效果，确认实际项目负责人和团队。','69ddcb4e000000001d01a01f'],['company-detail','用相同配置比较报价，追问材料系列、厚度、规格和工艺。','69ddcb4e000000001d01a01f'],['design-brief','写清居住者、生活动线、总预算和各房间的主要用途。','69d5b6da0000000023004c9a'],['design-reference','参考图标注喜欢的具体部分，把不考虑和待确认事项一起列出。','6aa6b1ff0000000026014d71'],['design-feedback','收到方案后逐区反馈原因，核对设备和新增功能是否落实。','688778790000000025015e87'],['budget-range','核对报价中的品牌、型号、数量和服务包含范围。','company'],['budget-extra','确认搬运、清运、拆后修补的费用与计价方式。','extras'],['budget-contract','在合同中明确工期、质保、延期处理和增项确认方式。','company'],['budget-own','把套餐内、套餐外、业主自购分别列预算。','6ad4b548000000000c00a11b']]},
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
 if(target.dataset.noteJump){if(target.closest('.reader-toc'))$('reader-toc').open=false;scrollReaderTo(target.dataset.noteJump);}
 if(target.hasAttribute('data-reader-contents')){const toc=$('reader-toc');if(toc){toc.open=true;scrollReaderTo('reader-toc');}}
});
$('search-input').addEventListener('input',event=>{state.query=event.target.value;renderLibrary();});
const sortControl=$('sort-control'),sortTrigger=$('sort-trigger'),sortOptions=$('sort-options');
const sortChoices=[...sortOptions.querySelectorAll('[data-sort]')];
function closeSortMenu(restoreFocus=false){sortOptions.hidden=true;sortTrigger.setAttribute('aria-expanded','false');if(restoreFocus)sortTrigger.focus();}
function openSortMenu(){sortOptions.hidden=false;sortTrigger.setAttribute('aria-expanded','true');sortChoices.find(choice=>choice.dataset.sort===state.sort).focus();}
sortTrigger.addEventListener('click',()=>{if(sortOptions.hidden)openSortMenu();else closeSortMenu();});
sortTrigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();openSortMenu();}});
sortOptions.addEventListener('click',event=>{const choice=event.target.closest('[data-sort]');if(!choice)return;state.sort=choice.dataset.sort;$('sort-value').textContent=choice.textContent.trim();sortChoices.forEach(option=>option.setAttribute('aria-selected',String(option===choice)));closeSortMenu(true);renderLibrary();});
sortOptions.addEventListener('keydown',event=>{
 const index=sortChoices.indexOf(document.activeElement);
 if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?sortChoices.length-1:(index+(event.key==='ArrowDown'?1:-1)+sortChoices.length)%sortChoices.length;sortChoices[next].focus();}
});
sortControl.addEventListener('keydown',event=>{if(event.key==='Escape'&&!sortOptions.hidden){event.preventDefault();closeSortMenu(true);}if(event.key==='Tab')closeSortMenu();});
sortControl.addEventListener('focusout',event=>{if(!sortControl.contains(event.relatedTarget))closeSortMenu();});
document.addEventListener('click',event=>{if(!sortControl.contains(event.target))closeSortMenu();});
$('reset-filters').addEventListener('click',()=>{setView('library',false);state.stage='all';renderStages();renderLibrary();$('library').scrollIntoView({behavior:'smooth'});});
document.addEventListener('toggle',event=>{if(event.target.id==='reader-toc')$('reader-contents-button').setAttribute('aria-expanded',String(event.target.open));},true);
$('close-dialog').addEventListener('click',()=>$('article-dialog').close());
$('article-dialog').addEventListener('close',()=>{state.opened=null;restorePageScroll();document.dispatchEvent(new CustomEvent('home-reading-change',{detail:false}));});
$('article-dialog').addEventListener('click',event=>{if(event.target===$('article-dialog')){const r=$('article-dialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('article-dialog').close();}});
$('checklist-groups').addEventListener('change',event=>{const id=event.target.dataset.check;if(!id)return;if(event.target.checked)checked.add(id);else checked.delete(id);writeStorage('saya-renovation-checks-v1',[...checked]);const focusId=event.target.id;renderChecklist();document.getElementById(focusId)?.focus();if(!storageAvailable)toast('当前浏览器无法保存，进度仅在本次打开期间保留');});
$('reset-checklist').addEventListener('click',()=>{if(!checked.size){toast('清单尚未勾选');return;}if(window.confirm('将清除当前浏览器中的所有清单勾选，确认重置吗？')){checked.clear();writeStorage('saya-renovation-checks-v1',[]);renderChecklist();toast('勾选已重置');}});
document.addEventListener('keydown',event=>{if(state.view==='home')return;if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('article-dialog').open&&!$('image-dialog').open){event.preventDefault();if(!['library','saved'].includes(state.view))setView('library',false);$('search-input').focus();}});
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();setView('library');});
fillIcons();renderStages();renderLibrary();renderChecklist();
