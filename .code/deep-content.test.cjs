'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(root,'dist/data.js'),'utf8'),context);
vm.runInContext(code.slice(code.indexOf('function escapeHTML('),code.indexOf('const $=')),context);
vm.runInContext(code.slice(code.indexOf('function inlineImages('),code.indexOf('function noteGallery(')),context);
vm.runInContext(code.slice(code.indexOf('function imageReferences('),code.indexOf('function readerContents(')),context);
const notes=context.window.RENOVATION_NOTES,updated=notes.slice(0,8);
const plain=value=>JSON.parse(JSON.stringify(value));
const previous=vm.createContext({window:{}});
vm.runInContext(cp.execFileSync('git',['show','27c200d3b69ada4839338f4511c99dc6a10517e2:dist/data.js'],{cwd:root,encoding:'utf8'}),previous);
assert.deepEqual(plain(notes.slice(8)),plain(previous.window.RENOVATION_NOTES.slice(8)),'Original 15 notes must remain unchanged');
const evidence=JSON.parse(fs.readFileSync(path.join(root,'.code/budget-design-source-audit.json'),'utf8'));
let images=0,tables=0,rows=0;
for(const note of updated){
 const proof=evidence.find(n=>n.id===note.id);assert(proof);
 assert.equal(note.images.length,proof.imagesRead);
 const html=context.detailedSummary(note);
 assert.equal((html.match(/<figure class="inline-note-image"/g)||[]).length,note.images.length,'Every original image is embedded once');
 for(const im of note.images){
  const data=fs.readFileSync(path.join(root,'dist',im.src));
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),im.sha256);
  assert.equal(proof.images.find(p=>p.sourceIndex===im.sourceIndex).sha256,im.sha256);
  images++;
 }
 for(const section of note.sections){
  assert(['source','site','calculation'].includes(section.kind));
  if(section.kind!=='source')assert(section.items.every(i=>i.images.length===0),'Site additions must not imply source-image evidence');
  for(const table of section.tables||[]){
   assert.equal(table.rows.every(row=>row.length===table.columns.length),true);
   for(const cell of [...table.columns,...table.rows.flat()])assert(html.includes(context.escapeHTML(cell)),`Missing table content: ${note.id}`);
   tables++;rows+=table.rows.length;
  }
 }
}
assert.equal(images,40);assert.equal(tables,14);assert.equal(rows,135);
const budget=updated.find(n=>n.id==='6a8443160000000025006648');
const costTables=budget.sections.slice(1,5).flatMap(s=>s.tables);
const sums=costTables.map(t=>t.rows.reduce((sum,row)=>sum+(row[1]==='未列金额'?0:Number(row[1].replace(/,/g,''))),0));
assert.deepEqual(plain(sums),[190517,69100,42060,16350]);
assert.equal(sums.reduce((a,b)=>a+b),318027);
assert.equal(costTables.flatMap(t=>t.rows).length,61,'Repeated electric rows must be counted only once');
assert.equal(budget.caseAmounts.unboughtAirConditionerBudget,20000);
const unsafe=context.noteTables([{title:'<script>x</script>',columns:['<img>'],rows:[['<iframe>']],note:'<svg>'}]);
assert(!/<script>|<img>|<iframe>|<svg>/.test(unsafe),'Table content must be escaped');
console.log(`Deep content checks passed: ${images} audited images, ${tables} complete tables/${rows} rows, original 15 notes unchanged, budget arithmetic and escaped content verified.`);
