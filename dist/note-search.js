(function(root,factory){const lib=factory();if(typeof module==='object'&&module.exports)module.exports=lib;else root.NoteSearch=lib;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 function strings(value){if(typeof value==='string')return value;if(Array.isArray(value))return value.map(strings).join(' ');if(value&&typeof value==='object')return Object.values(value).map(strings).join(' ');return '';}
 function matches(note,query){return strings([note.title,note.originalTitle,note.author,note.summary,note.stage,note.tags,note.points,note.sections,note.images?.map(i=>i.caption)]).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());}
 function filter(notes,state,saved){const query=state.query.trim(),allStages=query&&state.searchScope==='all';return notes.filter(n=>(state.view!=='saved'||saved.has(n.id))&&(allStages||state.stage==='all'||n.stage===state.stage)&&(state.type==='all'||n.type===state.type)&&(!state.imagesOnly||n.images?.length)&&matches(n,query));}
 return {matches,filter};
});
