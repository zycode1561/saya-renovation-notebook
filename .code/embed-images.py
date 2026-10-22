from pathlib import Path
p=Path('dist/app.js');s=p.read_text()
a=s.index('function noteGallery(');b=s.index('function coverageLabel(',a)
s=s[:a]+'''function inlineImages(n,images){
 return images.map(im=>{const index=n.images.indexOf(im);return `<figure class="inline-note-image" id="note-image-${im.sourceIndex||index+1}"><button data-image="${escapeHTML(n.id)}" data-image-index="${index}" aria-label="放大第${im.sourceIndex||index+1}张配图"><img src="${escapeHTML(im.src)}" alt="${escapeHTML(im.alt)}" width="${im.width}" height="${im.height}" loading="lazy" decoding="async"></button><figcaption>图 ${im.sourceIndex||index+1} · ${escapeHTML(im.caption||'配图')}</figcaption></figure>`;}).join('');
}
function noteGallery(n){return '';}
''' +s[b:]
a=s.index('function imageReferences(');b=s.index('function readingParagraphs(',a)
s=s[:a]+'''function imageReferences(n,refs=[]){
 return refs.filter(ref=>(n.images||[]).some(im=>im.sourceIndex===ref)).map(ref=>`<button class="summary-image-ref" data-note-jump="note-image-${ref}" aria-label="跳到笔记中的第${ref}张配图">图 ${ref} ↓</button>`).join('');
}
''' +s[b:]
a=s.index('function detailedSummary(');b=s.index('function readerContents(',a)
s=s[:a]+'''function detailedSummary(n){
 const used=new Set();
 const sectionImages=section=>{const refs=new Set(section.items.flatMap(item=>typeof item==='string'?[]:item.images||[]));const images=(n.images||[]).filter(im=>refs.has(im.sourceIndex)&&!used.has(im));images.forEach(im=>used.add(im));return inlineImages(n,images);};
 let body;
 if(!n.sections?.length)body=`<ul class="detail-points" role="list">${n.points.map(p=>`<li class="reader-point"><div class="reader-point-copy">${readerPointText(p)}</div></li>`).join('')}</ul>`;
 else body=n.sections.map((section,i)=>`<section class="summary-section" id="note-section-${i+1}"><h3><span>${String(i+1).padStart(2,'0')}</span>${escapeHTML(section.title)}</h3><ul class="detail-points" role="list">${section.items.map(item=>{const text=typeof item==='string'?item:item.text;const refs=typeof item==='string'?'':imageReferences(n,item.images);return `<li class="reader-point"><div class="reader-point-copy">${readerPointText(text)}</div>${refs?`<div class="reader-point-images">${refs}</div>`:''}</li>`;}).join('')}</ul>${sectionImages(section)}</section>`).join('');
 const remaining=(n.images||[]).filter(im=>!used.has(im));
 return `<section class="detailed-summary" id="note-summary" aria-label="图文笔记">${body}${remaining.length?`<section class="summary-section"><h3>补充配图</h3>${inlineImages(n,remaining)}</section>`:''}</section>`;
}
''' +s[b:]
a=s.index('function coveragePanel(');b=s.index('function scrollReaderTo(',a)
s=s[:a]+'''function coveragePanel(n){
 const c=n.coverage;
 return `<section class="reader-source note-source-end" aria-label="来源说明"><h3>来源说明</h3><p>小红书 · ${escapeHTML(n.author)} · ${escapeHTML(n.date)}</p><p>原帖：<a href="${escapeHTML(n.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(n.originalTitle||n.title)} ↗</a></p><p>配图来自原作者，保留原图与水印；文字为整理笔记。</p>${c?`<p>${escapeHTML(coverageLabel(n))}。${escapeHTML(c.note||'')}</p>`:''}<p>${escapeHTML(n.evidence)} · 核对日期：2026.10.22</p>${n.limits?`<p>${escapeHTML(n.limits)}</p>`:''}</section>`;
}
''' +s[b:]
s=s.replace('<div class="dialog-meta"><span>${escapeHTML(n.author)}</span><time datetime="${n.date}">${n.date}</time><span>小红书</span></div>','')
s=s.replace('${noteGallery(n)}${coveragePanel(n)}<div class="dialog-actions">','<div class="dialog-actions">')
s=s.replace('查看小红书原帖 ↗</a></div></article>','查看小红书原帖 ↗</a></div>${coveragePanel(n)}</article>')
s=s.replace("$('reader-gallery-button').hidden=!n.images?.length;","$('reader-gallery-button').hidden=!n.images?.length;if(n.images?.length)$('reader-gallery-button').dataset.noteJump=`note-image-${n.images[0].sourceIndex||1}`;")
p.write_text(s)
p=Path('dist/index.html');s=p.read_text().replace('reader-20261022','inline-20261022').replace('data-note-jump="note-gallery">图集','data-note-jump="note-gallery">配图');p.write_text(s)
