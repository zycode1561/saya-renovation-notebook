"""Generate a native, scoped home component from the shared offline model sources."""
from pathlib import Path
import json,re,shutil
root=Path(__file__).resolve().parent
out=root.parent.parent/'dist'/'home'
out.mkdir(exist_ok=True)
html=(root/'template.html').read_text()
def between(start,end): return html[html.index(start):html.index(end)]
explorer=between('<section class="explorer"','<section class="content" id="room-info"')
detail=between('<div class="room-detail"','<div class="principles"')
materials=between('<section class="materials"','<section class="content" id="cats"')
technical=between('<section class="content" id="notes"','<footer class="footer"')
dialogs=between('<dialog id="style-dialog"','<script>__THREE__')
markup='<div class="home-component">'+explorer+'<aside class="home-room-card" aria-label="当前空间说明">'+detail+'</aside></div>'
markup+='<details class="home-more"><summary>材质与落地说明</summary>'+materials+'<section id="cats"><div class="cat-copy"><h3>两只猫的日常</h3><p>食水与猫砂分开，猫墙留回落路线，窗户与阳台先落实可靠防逃。</p><p></p></div></section>'+technical+'</details>'+dialogs
markup=markup.replace('__PLAN__','./home/source-plan.jpg').replace('__MODERN_REFERENCE__','./home/modern-reference.jpg')
markup=markup.replace('建议用支持 WebGL 的桌面浏览器打开本文件。','可尝试支持 WebGL 的现代浏览器。')
(out/'view.html').write_text(markup)
shutil.copyfile(root/'source-plan.jpg',out/'source-plan.jpg')
shutil.copyfile(root/'modern-reference.jpg',out/'modern-reference.jpg')
shutil.copyfile(root/'vendor/LICENSE-three.txt',out/'LICENSE-three.txt')
# Use the vendored UMD build in module-local CommonJS bindings; no window.THREE.
vendor=(root/'vendor/three.min.js').read_text()
(out/'three.js').write_text('const exports = {}; const module = {exports};\n'+vendor+'\nexport default exports;\n')
source='\n'.join((root/n).read_text() for n in ['finishes.js','styles.js','app.js','privacy.js','walkthrough.js','suite.js','clearance.js'])
source=source.replace('document.querySelectorAll','root.querySelectorAll').replace('document.querySelector','root.querySelector').replace('document.body','root.host').replace('document.addEventListener','root.addEventListener').replace('window.__homeDesign','designAPI')
source=source.replace("'.intro>div>p',",'')
source=re.sub(r" \$\('\.intro>div>p'\)\.textContent=[^;]+;",'',source)
source=source.replace("$('#print').onclick=()=>window.print();",'')
# Offline startup scrolls to the model; the integrated workspace must keep its own scroll.
source=source.replace(" $('#privacy-orbit').click();",'')
source=source.replace("'栖间 · '","'住前笔记 · '").replace("'栖间-'","'我的家-'")
source=source.replace('function animate(now=0){requestAnimationFrame(animate);','function animate(now=0){if(!componentActive)return;frame=requestAnimationFrame(animate);')
source=source.replace("const rect=$('#viewer').getBoundingClientRect();renderer.setSize", "const rect=$('#viewer').getBoundingClientRect();if(!componentActive||!rect.width||!rect.height)return;renderer.setSize")
source=source.replace('let last=null,down=null,pinch=0,mid=null;', 'let last=null,down=null,pinch=0,mid=null;clearOrbitInput=()=>{for(const id of pointers.keys())if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);pointers.clear();last=null;down=null;pinch=0;mid=null};')
source=source.replace("if(!walkMode)return;if(e.code==='Escape'", "if(!componentActive||!walkMode)return;if(e.code==='Escape'")
# Bubble keyboard events only within this workspace; hidden tabs cannot move the model.
source=source.replace("window.addEventListener('beforeprint',()=>{", "window.addEventListener('beforeprint',()=>{if(!componentActive)return;")
source=source.replace("window.addEventListener('afterprint',()=>printDetails.forEach(([d,open])=>d.open=open));", "window.addEventListener('afterprint',()=>{printDetails.forEach(([d,open])=>d.open=open);printDetails=[]});")
prelude="""import THREE from './three.js';
export function mountModel(root) {
let designAPI={},componentActive=true,frame=0,clearOrbitInput=()=>{};
"""
end="""
// Dimension notes remain readable in the room card on narrow screens.
for(const label of labels)if(label.detailRoom)label.el.classList.add('model-dimension-label');
function setActive(value){
 value=Boolean(value);if(value===componentActive)return;
 componentActive=value;cancelAnimationFrame(frame);frame=0;
 clearWalkInput();clearOrbitInput();
 if(!value){for(const dialog of root.querySelectorAll('dialog[open]'))dialog.close();clearTimeout(toast.timer);$('#toast').classList.remove('show');}
 if(value&&activeModel){resize();dirty=true;animate();}
}
return {setActive,get active(){return componentActive},get supported(){return activeModel}};
}
"""
(out/'model.js').write_text(prelude+source+end)
css=re.sub(r'body\[data-style=([^\]]+)\]',r':host([data-style=\1])',(root/'style.css').read_text())
css+='\n'+(root/'integrated.css').read_text()
(out/'model.css').write_text(css)
print('Built native home component from shared model sources')
