// Lazily loaded native component. Shadow DOM isolates the model's CSS and IDs.
export async function createHomeWorkspace(host) {
 const version='home-20261029c';
 const [markupResponse,cssResponse,model]=await Promise.all([
  fetch(`./home/view.html?v=${version}`),fetch(`./home/model.css?v=${version}`),import(`./home/model.js?v=${version}`)
 ]);
 if(!markupResponse.ok||!cssResponse.ok)throw new Error('无法加载方案资源');
 const [markup,css]=await Promise.all([markupResponse.text(),cssResponse.text()]);
 const root=host.shadowRoot||host.attachShadow({mode:'open'});
 root.innerHTML=`<style>${css}</style>${markup}`;
 const $=selector=>root.querySelector(selector);
 const explorer=$('.explorer');
 const toolbar=document.createElement('div');toolbar.className='home-toolbar';
 toolbar.append($('.scene-top'));
 explorer.prepend(toolbar);
 const settings=document.createElement('details');settings.className='home-settings';
 settings.innerHTML='<summary>查看设置<span>风格、漫游、方案与门</span></summary><div class="home-settings-body"></div>';
 toolbar.after(settings);
 const settingBody=settings.querySelector('div');
 for(const selector of ['.style-bar','.walk-bar','.layout-bar','.privacy-bar','.tools'])settingBody.append($(selector));
 $('.tools').prepend($('#original-btn'));
 settings.after($('#room-menu'));
 // The caption and touch pad remain in the canvas; controls stay outside its gesture area.
 const modelController=model.mountModel(root);
 let requestedActive=true,reading=Boolean(document.querySelector('#article-dialog[open]'));
 const refresh=()=>modelController.setActive(requestedActive&&!reading&&!document.hidden&&!host.closest('[hidden]'));
 document.addEventListener('visibilitychange',refresh);
 // Reading an existing note suspends movement, while preserving the current view.
 document.addEventListener('home-reading-change',event=>{
  reading=Boolean(event.detail);refresh();
 });
 settings.addEventListener('toggle',()=>{if(!settings.open&&root.activeElement?.closest('.home-settings-body'))settings.querySelector('summary').focus();});
 refresh();
 return {setActive(value){requestedActive=Boolean(value);refresh();},get active(){return modelController.active}};
}
