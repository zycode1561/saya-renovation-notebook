"""Assemble reviewed summaries and verified original images; no remote fetching."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--base', required=True)
parser.add_argument('--stages', required=True)
parser.add_argument('--audit', required=True)
parser.add_argument('--summaries', nargs='+', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
read = lambda path: json.loads(Path(path).read_text())
base, stages, audit = read(args.base), read(args.stages), read(args.audit)
summaries = [note for path in args.summaries for note in read(path)]
assert len(base) == len(audit) == len(summaries) == 15
assert len({n['id'] for n in summaries}) == 15
sources, reviewed = {n['id']: n for n in audit}, {n['id']: n for n in summaries}
notes = []
for old in base:
    source, summary = sources[old['id']], reviewed[old['id']]
    count = source['expectedImageCount']
    images = sorted(source['images'], key=lambda image: image['index'])
    assert source['complete'] and len(images) == count
    assert [image['index'] for image in images] == list(range(1, count + 1))
    assert set(summary['imageCaptions']) == {str(i) for i in range(1, count + 1)}
    note = {**old, **{key: summary[key] for key in ['title', 'summary', 'sections', 'limits']}}
    for section in note['sections']:
        assert section['title'] and section['items']
        for item in section['items']:
            assert item['text'] and all(1 <= index <= count for index in item['images'])
            item['text'] = item['text'].replace('，完成正文 OCR 曾遗漏的设备安装环节；原图明确列出了这一步', '')
    note['points'] = [item['text'] for section in note['sections'] for item in section['items']]
    note['images'] = []
    for image in images:
        assert image['downloaded'] and image['imageIntegrityVerified']
        data = Path(image['tempPath']).read_bytes()
        assert hashlib.sha256(data).hexdigest() == image['sha256']
        dest = root / 'dist/media/complete' / note['id'] / f"{image['index']:02}.webp"
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(image['tempPath'], dest)
        caption = summary['imageCaptions'][str(image['index'])]
        note['images'].append({
            'src': str(dest.relative_to(root / 'dist')),
            'sourceIndex': image['index'],
            'alt': f"{note['author']} · 原帖第{image['index']}张：{caption}",
            'caption': caption, 'width': image['width'], 'height': image['height'],
            'sourceUrl': image['sourceUrl'], 'sha256': image['sha256'],
        })
    live_photo = source.get('mediaType') == 'live-photo'
    note['coverage'] = {
        'bodyRead': True, 'expectedImages': count, 'downloadedImages': count,
        'imagesComplete': True, 'summaryComplete': True,
        'mediaType': source.get('mediaType', 'images'),
        'note': f'已按完整正文及全部 {count} 张静态配图分主题整理，配图按原帖顺序收录。'
                + ('本帖含 Live Photo，仅收录静态画面，动态片段未收录。' if live_photo else '')
    }
    note['evidence'] = f'已读取完整正文及全部 {count} 张静态配图，详细要点可点击对应图号交叉查看'
    notes.append(note)
assert len({n['id'] for n in notes}) == 15
image_count = sum(len(note['images']) for note in notes)
item_count = sum(len(note['points']) for note in notes)
assert image_count == 147 and item_count == 213
(root / 'dist/data.js').write_text(
    'window.RENOVATION_STAGES = ' + json.dumps(stages, ensure_ascii=False, indent=2) + ';\n'
    + 'window.RENOVATION_NOTES = ' + json.dumps(notes, ensure_ascii=False, indent=2) + ';\n'
)
print(json.dumps({'notes': len(notes), 'images': image_count, 'summaryItems': item_count,
                  'bytes': sum((root / 'dist' / image['src']).stat().st_size for n in notes for image in n['images'])}))
