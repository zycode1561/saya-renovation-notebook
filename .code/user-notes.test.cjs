'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const lib=require('./user-notes-lib.cjs');
const input={title:'台面留插座',content:'现场核对尺寸。\n别忘了电器插头的位置。',stage:'厨卫',type:'经验',sourceUrl:''};
const valid=lib.validateNoteInput(input);
assert(valid.ok);assert.equal(valid.normalized.type,'攻略');
for(const change of [{title:''},{content:'  '},{stage:'厨房'},{type:'其他'},{sourceUrl:'javascript:alert(1)'},{sourceUrl:'ftp://example.com'},{sourceUrl:'不是网址'}])assert(!lib.validateNoteInput({...input,...change}).ok);
for(const sourceUrl of ['http://example.com','https://example.com/a?q=中文'])assert(lib.validateNoteInput({...input,sourceUrl}).ok);
const note=lib.buildUserNote(valid.normalized,{now:'2026-10-27T18:00:00Z'});
assert.equal(note.date,'2026-10-28');assert.equal(note.checkedAt,note.date);assert.equal(note.author,'沙耶');assert.equal(note.userNote,true);assert.equal(note.type,'攻略');assert.equal(note.evidence,'本人记录');assert.deepEqual(note.points,[input.content]);assert.deepEqual(note.images,[]);assert.deepEqual(note.sections,[]);assert.equal(note.url,'');
assert.match(note.id,/^user-\d+-/);assert.notEqual(note.id,lib.buildUserNote(valid.normalized,{now:'2026-10-27T18:00:00Z'}).id);
const base=[{id:'内置',date:'2026-10-01'}],doc={version:1,notes:[note]};
const merged=lib.mergeNotes(base,[note,note]);
assert.equal(merged.length,2);assert.equal(merged.find(n=>n.id===note.id),note);assert.equal(base.length,1);
assert.deepEqual(lib.mergeNotes(merged,[note]),merged);assert.deepEqual(lib.mergeNotes(merged,[]),base);
assert.deepEqual(lib.decodeUserNotesFile(lib.encodeUserNotesFile(doc),{base64:true}),doc);
assert.deepEqual(lib.decodeUserNotesFile(JSON.stringify(doc)),doc);
assert.throws(()=>lib.decodeUserNotesFile('{'));assert.throws(()=>lib.decodeUserNotesFile('{"version":1,"notes":[{}]}'));
const payload=lib.buildPutPayload({doc,sha:'当前版本',title:note.title});
assert.equal(payload.sha,'当前版本');assert.equal(payload.message,'note: 台面留插座');assert.equal(payload.branch,'main');assert.deepEqual(lib.decodeUserNotesFile(payload.content,{base64:true}).notes,[note]);
const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
const tokens=lib.tokenStorage(storage);assert.equal(tokens.read(),'');tokens.write('  测试用占位值  ');assert.equal(tokens.read(),'测试用占位值');tokens.clear();assert.equal(tokens.read(),'');
// 同一份代码在没有 Node 内置对象的浏览器环境下也能处理中文与表情。
const browser={window:{},URL,TextEncoder,TextDecoder,btoa,atob,Uint8Array,Date,Math};vm.createContext(browser);vm.runInContext(fs.readFileSync('dist/user-notes.js','utf8'),browser);
assert.equal(browser.window.UserNotes.encodeUserNotesFile(doc),lib.encodeUserNotesFile(doc));assert.equal(browser.window.UserNotes.decodeUserNotesFile(payload.content,{base64:true}).notes[0].title,note.title);
// 验证实际页面渲染：本人记录不冒充原帖，输入文本经过转义。
const app=fs.readFileSync('dist/app.js','utf8');
const elements=new Map();
const element=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',hidden:false,dataset:{},setAttribute(){},scrollTo(){}});return elements.get(id);};
const renderer={window:{matchMedia:()=>({matches:false})},coverCopy:{},saved:new Set(),stageFor:()=>({title:'厨卫'}),icon:()=>'',escapeHTML:value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),byId:()=>note,state:{},$:element,document:{dispatchEvent(){}},CustomEvent:function(){},updateDialogSave(){},openModal(){},readerContents:()=>'',detailedSummary:()=>''};
vm.createContext(renderer);
for(const [start,end] of [['mediaPreview','inlineImages'],['coverageLabel','imageReferences'],['coveragePanel','scrollReaderTo'],['card','renderLibrary'],['selectMobileReaderSegment','showImage']])vm.runInContext(app.slice(app.indexOf(`function ${start}(`),app.indexOf(`function ${end}(`)),renderer);
const card=renderer.card(note);assert(card.includes('我的'));assert(card.includes('本人记录'));assert(!card.includes('查看原帖'));assert(!renderer.coveragePanel(note).includes('小红书'));
renderer.showNote(note.id);assert(element('dialog-content').innerHTML.includes('删除这条'));assert(element('dialog-content').innerHTML.includes('我的'));assert(!element('dialog-content').innerHTML.includes('查看小红书原帖'));
assert(renderer.card({...note,url:'https://example.com',title:'<img src=x>'}).includes('&lt;img src=x&gt;'));assert(renderer.card({...note,url:'https://example.com'}).includes('打开来源链接'));
// 验证表单状态切换及胶囊键盘交互，不触发真实 GitHub 请求。
const uiElements=new Map();
function uiElement(id){
 if(!uiElements.has(id))uiElements.set(id,{value:'',type:'password',hidden:false,disabled:false,textContent:'',dataset:{},attrs:{},className:'',listeners:{},
  classList:{_set:new Set(),add(c){this._set.add(c);},remove(c){this._set.delete(c);},contains(c){return this._set.has(c);},toggle(c,force){if(force===false||(force===undefined&&this._set.has(c)))this._set.delete(c);else this._set.add(c);}},
  setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.listeners[k]=fn;},focus(){this.focused=true;},close(){this.closed=true;},
  querySelector(){return uiElement(id+'-summary');},scrollIntoView(){}});
 return uiElements.get(id);
}
const groups=['type','stage'].map(name=>{
 const group=uiElement('group-'+name);group.dataset.choice=name;
 group.buttons=(name==='type'?['避坑','经验']:['准备','预算','施工','厨卫','安装','入住']).map(value=>{const b=uiElement(name+value);b.dataset.value=value;return b;});
 group.querySelectorAll=()=>group.buttons;return group;
});
const uiForm=uiElement('user-note-form');uiForm.elements={type:{value:'避坑'},stage:{value:'准备'}};
uiForm.reset=()=>{uiForm.elements.type.value='避坑';uiForm.elements.stage.value='准备';};
let uiToken='saved-token';
const ui={window:{UserNotes:{tokenStorage:()=>({read:()=>uiToken,clear:()=>{uiToken='';}})}},localStorage:{},$:uiElement,
 document:{querySelectorAll:()=>groups,querySelector:()=>uiElement('body')},renderSyncStatus(){},state:{stage:'厨卫'},stageFor:v=>v==='厨卫',openModal(){},restorePageScroll(){}};
vm.createContext(ui);
vm.runInContext(app.slice(app.indexOf('const userNotes=window.UserNotes;'),app.indexOf("$('user-note-form').addEventListener('submit'")),ui);
ui.openUserNoteForm();assert.equal(uiForm.elements.stage.value,'厨卫');assert.equal(groups[1].buttons[3].attrs['aria-checked'],'true');
assert.equal(uiElement('submit-user-note').textContent,'保存笔记');assert(uiElement('user-note-delete').hidden);
let prevented=false;groups[0].listeners.keydown({target:groups[0].buttons[0],key:'ArrowRight',preventDefault(){prevented=true;}});
assert(prevented);assert.equal(uiForm.elements.type.value,'经验');assert.equal(groups[0].buttons[1].tabIndex,0);assert.equal(groups[0].buttons[0].tabIndex,-1);
uiElement('toggle-user-token').listeners.click();assert.equal(uiElement('user-note-token').type,'text');
uiElement('toggle-user-token').listeners.click();assert.equal(uiElement('user-note-token').type,'password');
ui.openUserNoteForm(note);assert.equal(uiElement('user-note-delete-title').textContent,note.title);assert(uiElement('user-note-fields').disabled);assert(uiElement('user-note-fields').hidden);
assert.equal(uiElement('submit-user-note').textContent,'确认删除');assert(!uiElement('cancel-user-note').hidden);
vm.runInContext('userNoteBusy=true',ui);ui.closeUserNoteForm();assert(!uiElement('user-note-dialog').closed);
vm.runInContext('userNoteBusy=false',ui);ui.closeUserNoteForm();assert(uiElement('user-note-dialog').closed);
uiElement('clear-user-token').listeners.click();assert.equal(uiToken,'');assert(uiElement('user-note-token-settings').open);assert(!uiElement('user-token-input').hidden);
ui.openUserNoteForm();assert.equal(uiForm.elements.type.value,'避坑');assert(!uiElement('user-note-fields').disabled);
assert(!app.includes("window.confirm('确定删除这条笔记"));
async function run(){
 const other=lib.buildUserNote({...valid.normalized,title:'其他设备记录'},{now:'2026-10-29'});
 let gets=0,puts=0;
 const request=async(url,options)=>{
  assert(url.startsWith('https://api.github.com/repos/zycode1561/saya-renovation-notebook/contents/dist/data/user-notes.json'));
  if(options.method!=='PUT')return {ok:true,json:async()=>({sha:`版本${++gets}`,content:lib.encodeUserNotesFile({version:1,notes:gets===1?[]:[other]})})};
  const body=JSON.parse(options.body);assert.equal(body.sha,`版本${gets}`);assert.equal(body.message,`note: ${note.title}`);assert.equal(body.branch,'main');
  const written=lib.decodeUserNotesFile(body.content,{base64:true});assert.equal(written.notes.filter(n=>n.id===note.id).length,1);
  if(++puts<3)return {ok:false,status:409};
  assert(written.notes.some(n=>n.id===other.id));return {ok:true};
 };
 const result=await lib.writeUserNote({note,token:'测试用占位值',fetch:request});assert.equal(gets,3);assert.equal(puts,3);assert.equal(result.length,2);
 let deletion;
 await lib.writeUserNote({note,mode:'delete',token:'测试用占位值',fetch:async(url,options)=>{
  if(options.method!=='PUT')return {ok:true,json:async()=>({sha:'删除前',content:lib.encodeUserNotesFile({version:1,notes:result})})};
  const body=JSON.parse(options.body);assert.equal(body.message,`note: delete ${note.title}`);deletion=lib.decodeUserNotesFile(body.content,{base64:true});return {ok:true};
 }});
 assert(!deletion.notes.some(n=>n.id===note.id));assert.equal(deletion.notes[0].id,other.id);
 let conflicts=0;
 await assert.rejects(lib.writeUserNote({note,token:'测试用占位值',fetch:async(url,options)=>options.method==='PUT'?(conflicts++,{ok:false,status:409}):{ok:true,json:async()=>({sha:'版本',content:lib.encodeUserNotesFile(doc)})}}),/同时被修改/);assert.equal(conflicts,3);
 await assert.rejects(lib.writeUserNote({note,token:'测试用占位值',fetch:async()=>({ok:false,status:403})}),/权限不足/);
 await assert.rejects(lib.writeUserNote({note,token:'测试用占位值',fetch:async()=>{throw Error('测试用占位值');}}),error=>!error.message.includes('测试用占位值'));
 let paths=[];
 assert.deepEqual(await lib.loadUserNotes({fetch:async url=>{paths.push(url);return {ok:true,json:async()=>({sha:'remote',content:lib.encodeUserNotesFile(doc)})};}}),[note]);
 assert.equal(paths.length,1);assert(paths[0].startsWith('https://api.github.com/'));
 await assert.rejects(lib.loadUserNotes({fetch:async()=>({ok:false})}));
 assert.deepEqual(JSON.parse(fs.readFileSync('dist/data/user-notes.json','utf8')),{version:1,notes:[]});
 console.log('通过：输入校验、北京时间、合并去重、中文编码、写入与冲突重试、删除、令牌存取、单源读取与失败提示。');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
