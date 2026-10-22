"""按采集审计增量识别原图，并生成供内容核对的本机文本证据。"""
import json
import subprocess
from pathlib import Path

audit_path = Path('/tmp/renovation-complete-sources.json')
cache_path = Path('/tmp/renovation-complete-ocr.jsonl')
out_dir = Path('/tmp/renovation-complete-text')
out_dir.mkdir(exist_ok=True)
audit = json.loads(audit_path.read_text())
cache = {}
if cache_path.exists():
    for line in cache_path.read_text().splitlines():
        try:
            value = json.loads(line)
            cache[value['path']] = value
        except (ValueError, KeyError):
            pass
pending = [image['tempPath'] for note in audit for image in note['images']
           if image.get('downloaded') and image['tempPath'] not in cache]
for start in range(0, len(pending), 20):
    result = subprocess.run(['/tmp/renovation-image-ocr', *pending[start:start + 20]],
                            capture_output=True, text=True, check=True)
    with cache_path.open('a') as target:
        target.write(result.stdout)
    for line in result.stdout.splitlines():
        value = json.loads(line)
        cache[value['path']] = value
    print(f'OCR {min(start + 20, len(pending))}/{len(pending)}', flush=True)

for note in audit:
    lines = [f"# {note['id']} | {note['originalTitle']}",
             f"原图总数：{note.get('expectedImageCount')}；已下载：{len(note['images'])}；采集完整：{note.get('complete')}",
             '## 正文', note.get('body', ''), '## 逐图文字']
    ready = True
    for image in note['images']:
        value = cache.get(image['tempPath'])
        lines += [f"### 原帖图 {image['index']}", f"图片路径：{image['tempPath']}"]
        if not value or value.get('error'):
            ready = False
            lines += ['识别未完成：' + str((value or {}).get('error', 'pending'))]
        else:
            lines += [value.get('text', '') or '（图片无可识别文字，需结合原图查看）']
    if ready:
        (out_dir / f"{note['id']}.md").write_text('\n\n'.join(lines))
print(json.dumps({'notes': len(audit), 'images': sum(len(n['images']) for n in audit),
                  'readyTexts': len(list(out_dir.glob('*.md')))}, ensure_ascii=False), flush=True)
