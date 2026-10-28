from pathlib import Path
import base64
root=Path(__file__).resolve().parent
html=(root/'template.html').read_text()
values={'__CSS__':(root/'style.css').read_text()+'\n'+(root/'glass.css').read_text(),'__JS__':(root/'finishes.js').read_text()+'\n'+(root/'styles.js').read_text()+'\n'+(root/'app.js').read_text()+'\n'+(root/'privacy.js').read_text()+'\n'+(root/'walkthrough.js').read_text()+'\n'+(root/'suite.js').read_text()+'\n'+(root/'clearance.js').read_text(),'__THREE__':(root/'vendor/three.min.js').read_text(),'__PLAN__':'data:image/jpeg;base64,'+base64.b64encode((root/'source-plan.jpg').read_bytes()).decode(),'__MODERN_REFERENCE__':'data:image/jpeg;base64,'+base64.b64encode((root/'modern-reference.jpg').read_bytes()).decode(),'__LICENSE__':(root/'vendor/LICENSE-three.txt').read_text()}
for key,value in values.items():
    html=html.replace(key,value)
(root/'栖间·两人两猫装修方案.html').write_text(html)
print(f'Built {len(html.encode()):,} bytes')
# Both outputs use this directory as their only model source of truth.
import runpy
runpy.run_path(str(root/'build-integrated.py'))
