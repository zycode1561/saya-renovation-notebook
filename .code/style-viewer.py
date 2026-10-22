from pathlib import Path
p=Path('dist/index.html');s=p.read_text();a=s.index('    <div class="viewer-toolbar">');b=s.index('    <div class="viewer-stage"',a)
s=s[:a]+'''    <div class="viewer-toolbar"><h2 id="image-viewer-title" tabindex="-1" autofocus></h2><button class="viewer-info-toggle" id="image-info" aria-label="图片说明与来源" aria-expanded="false" aria-controls="image-details">ⓘ</button><button class="icon-button" id="close-image" aria-label="关闭图片"><span data-icon="close"></span></button></div>
''' +s[b:]
a=s.index('    <div class="viewer-caption">');b=s.index('\n  </dialog>',a)
s=s[:a]+'''    <section class="viewer-caption" id="image-details" aria-label="图片说明与来源" hidden><p id="image-caption"></p><span id="image-credit"></span><a id="image-source" target="_blank" rel="noopener noreferrer">查看原帖 ↗</a><p class="viewer-gesture-hint" id="image-gesture-hint">左右滑动切图 · 上下滑动看长图</p><p id="image-limits"></p></section>
    <div class="viewer-controls"><div class="viewer-paging"><button id="image-prev" aria-label="上一张图片">‹</button><span id="image-position" aria-live="polite"></span><button id="image-next" aria-label="下一张图片">›</button></div><button id="image-zoom" aria-pressed="false">放大查看</button></div>''' +s[b:]
s=s.replace('header-20261022','viewer-20261022');p.write_text(s)
p=Path('dist/app.js');s=p.read_text().replace("imageCarousel.reset();state.imageNote=id;","$('image-details').hidden=true;$('image-info').setAttribute('aria-expanded','false');imageCarousel.reset();state.imageNote=id;")
s=s.replace("$('close-image').addEventListener", "$('image-info').addEventListener('click',()=>{const panel=$('image-details');panel.hidden=!panel.hidden;$('image-info').setAttribute('aria-expanded',String(!panel.hidden));});\n$('close-image').addEventListener",1)
p.write_text(s)
