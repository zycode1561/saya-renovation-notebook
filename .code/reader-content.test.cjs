'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const context=vm.createContext({window:{},escapeHTML});
vm.runInContext(fs.readFileSync(path.join(root,'dist/data.js'),'utf8'),context);
const start=source.indexOf('function readingParagraphs('),end=source.indexOf('function detailedSummary(',start);
assert(start>0&&end>start);vm.runInContext(source.slice(start,end),context);
const compact=value=>value.replace(/\s/g,'');
let count=0,paragraphs=0;
for(const note of context.window.RENOVATION_NOTES){
 for(const section of note.sections){for(const item of section.items){
  const html=context.readerPointText(item.text);
  assert.equal(compact(html.replace(/<[^>]+>/g,'')),compact(escapeHTML(item.text)),`Reading layout must preserve all text: ${note.id}`);
  paragraphs+=(html.match(/<p>/g)||[]).length;count++;
 }}
}
const baseline=context.window.RENOVATION_NOTES.filter(note=>note.checkedAt!=='2026-10-23');
assert.equal(baseline.length,15);
assert.equal(baseline.reduce((sum,note)=>sum+note.sections.reduce((n,section)=>n+section.items.length,0),0),213);
assert.equal(count,context.window.RENOVATION_NOTES.reduce((sum,note)=>sum+note.points.length,0));
const unsafe='<script>bad</script> & "quote"';assert(!context.readerPointText(unsafe).includes('<script>'));
assert.equal(context.readingParagraphs('“句中。引号”与（括号。内容）都完整保留。').join(''),'“句中。引号”与（括号。内容）都完整保留。');
console.log(`Reader checks passed: ${count} original items preserved across ${paragraphs} paragraphs, including punctuation, reference numbers and escaped HTML.`);
