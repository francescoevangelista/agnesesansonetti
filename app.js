import {fitBox,zoomAt,constrain} from './board-math.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const about=document.querySelector('.about-panel');
let aboutTrigger=null,closeTimer;
function openAbout(trigger){
 clearTimeout(closeTimer);aboutTrigger=trigger||document.querySelector('[data-about-open]');about.classList.remove('is-closing');
 if(!about.open)about.showModal();document.body.classList.add('about-open');
 history.replaceState(null,'',location.pathname+location.search+'#about');
}
function closeAbout(){
 const finish=()=>{about.close();about.classList.remove('is-closing');document.body.classList.remove('about-open');if(location.hash==='#about')history.replaceState(null,'',location.pathname+location.search);aboutTrigger?.focus({preventScroll:true})};
 if(reduced.matches)finish();else{about.classList.add('is-closing');closeTimer=setTimeout(finish,180)}
}
if(about){
 document.querySelectorAll('[data-about-open]').forEach(b=>b.addEventListener('click',()=>openAbout(b)));
 about.querySelectorAll('[data-about-close]').forEach(b=>b.addEventListener('click',closeAbout));
 about.addEventListener('cancel',e=>{e.preventDefault();closeAbout()});
 if(location.hash==='#about')openAbout();
 window.addEventListener('hashchange',()=>{if(location.hash==='#about')openAbout();else if(about.open)closeAbout()});
}
document.querySelector('.print-cv')?.addEventListener('click',()=>window.print());
const grid=document.querySelector('.archive-grid');
if(grid){
 const scroller=document.querySelector('.archive');
 const entries=[...grid.querySelectorAll('.archive-entry')];
 const filters=[...document.querySelectorAll('[data-filter]')];
 function filter(value,save=true){
  if(!['all','Fashion','Accessories'].includes(value))value='all';
  entries.forEach(e=>{e.hidden=value!=='all'&&e.dataset.category!==value;e.classList.remove('is-revealed')});
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===value)));
  document.querySelector('.archive-count').textContent=entries.filter(e=>!e.hidden).length+' projects';
  if(save){const url=new URL(location.href);if(value==='all')url.searchParams.delete('category');else url.searchParams.set('category',value);history.replaceState(null,'',url)}
 }
 filters.forEach(b=>b.addEventListener('click',()=>filter(b.dataset.filter)));
 filter(new URL(location.href).searchParams.get('category')||'all',false);
 entries.forEach(entry=>{
  const link=entry.querySelector('a');let pointer='mouse';
  link.addEventListener('pointerdown',e=>pointer=e.pointerType);
  link.addEventListener('click',e=>{
   if(pointer!=='mouse'&&e.detail!==0&&!entry.classList.contains('is-revealed')){e.preventDefault();entries.forEach(x=>x.classList.remove('is-revealed'));entry.classList.add('is-revealed');return}
   try{sessionStorage.setItem('archive-return',location.pathname+location.search);sessionStorage.setItem('archive-scroll',String(scroller.scrollTop))}catch{}
  });
 });
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.archive-entry'))entries.forEach(x=>x.classList.remove('is-revealed'))});
 try{const saved=Number(sessionStorage.getItem('archive-scroll'));if(saved&&sessionStorage.getItem('archive-return')===location.pathname+location.search){scroller.scrollTo({top:saved,behavior:'instant'});sessionStorage.removeItem('archive-scroll')}}catch{}
}
const viewport=document.querySelector('.board-viewport');
if(viewport){
 const board=document.querySelector('.project-board');
 const world=viewport.querySelector('.board-world');
 const cards=[...world.querySelectorAll('.board-item')];
 const images=cards.map(c=>c.querySelector('img'));
 const rects=cards.map(el=>({x:Number(el.dataset.x),y:Number(el.dataset.y),width:Number(el.dataset.w),height:Number(el.dataset.h)}));
 const radius=Math.max(...rects.flatMap(r=>[Math.abs(r.x),Math.abs(r.y),Math.abs(r.x+r.width),Math.abs(r.y+r.height)]));
 const bounds={x:-radius,y:-radius,width:radius*2,height:radius*2};
 let size={width:viewport.clientWidth,height:viewport.clientHeight},state={x:0,y:0,scale:1},minimum=.01,frame=0,transitionTimer,mediaTimer,mode='overview',selected=-1;
 const status=document.querySelector('.board-status');
 const tools=[...document.querySelectorAll('[data-board-action]')];
 const films=cards.flatMap((card,index)=>{const video=card.querySelector('video');return video?[{video,index}]:[]});
 const filmToggle=document.querySelector('[data-film-toggle]');
 let filmPaused=false;
 function updateFilmLabel(){if(filmToggle){const stopped=filmPaused||films.every(({video})=>video.paused);filmToggle.textContent=stopped?'Play film':'Pause film';filmToggle.setAttribute('aria-pressed',String(stopped))}}
 function syncFilms(){
  films.forEach(({video,index})=>{
   video.muted=true;
   const visible=mode!=='focus'||selected===index;
   if(filmPaused||document.hidden||about.open||!visible)video.pause();
   else if(video.paused)video.play().catch(updateFilmLabel);
  });
  updateFilmLabel();
 }
 films.forEach(({video})=>{video.addEventListener('play',updateFilmLabel);video.addEventListener('pause',updateFilmLabel)});
 filmToggle?.addEventListener('click',()=>{filmPaused=!films.every(({video})=>video.paused);if(!filmPaused&&mode==='focus'&&!cards[selected]?.querySelector('video'))overview();syncFilms()});
 document.addEventListener('visibilitychange',syncFilms);
 new MutationObserver(syncFilms).observe(about,{attributes:true,attributeFilter:['open']});
 const points=new Map();let drag=null,pinch=null,moved=false,downItem=null;
 function loadVisible(){
  images.forEach((img,i)=>{
   if(cards[i].dataset.kind==='video')return;
   const r=rects[i],x=state.x+r.x*state.scale,y=state.y+r.y*state.scale,w=r.width*state.scale,h=r.height*state.scale;
   if((mode==='focus'&&selected!==i)||x+w< -80||y+h< -80||x>size.width+80||y>size.height+80)return;
   const pixels=Math.max(w,h)*Math.min(devicePixelRatio||1,2);
   const quality=selected===i||pixels>850?3:pixels>190?2:1;
   if(quality===1||Number(img.dataset.quality||0)>=quality)return;
   img.fetchPriority=selected===i?'high':'low';
   img.src=img.dataset[quality===3?'full':quality===2?'medium':'thumb'];
   img.dataset.quality=quality;
  });
 }
 function render(){
  frame=0;world.style.setProperty('--board-scale',state.scale);world.style.transform=`translate3d(${state.x}px,${state.y}px,0) scale(${state.scale})`;
  viewport.dataset.scale=state.scale.toFixed(4);viewport.dataset.panX=state.x.toFixed(1);viewport.dataset.panY=state.y.toFixed(1);viewport.dataset.mode=mode;syncFilms();
  clearTimeout(mediaTimer);mediaTimer=setTimeout(loadVisible,100);
 }
 function update(next,{animate=false,limit=true}={}){
  clearTimeout(transitionTimer);world.classList.toggle('is-transitioning',animate&&!reduced.matches);
  state=limit?constrain(next,bounds,size):next;if(!frame)frame=requestAnimationFrame(render);
  if(animate)transitionTimer=setTimeout(()=>world.classList.remove('is-transitioning'),340);
 }
 function select(index){
  selected=index;
  cards.forEach((c,i)=>c.classList.toggle('is-selected',i===index));
 }
 function focus(index,animate=true){
  select(index);mode='focus';update(fitBox(rects[index],size,size.width<700?24:36,1.8),{animate});
  status.textContent=cards[index].querySelector('.board-focus').getAttribute('aria-label').replace(/^Focus (image|film): /,'');
 }
 function overview(animate=true){mode='overview';select(-1);update(fitBox(bounds,size,size.width<700?14:24,1),{animate});status.textContent=`All ${cards.length} items`}
 function measure(){size={width:viewport.clientWidth,height:viewport.clientHeight};minimum=Math.max(.005,fitBox(bounds,size,14,1).scale*.6)}
 function zoom(factor,point={x:size.width/2,y:size.height/2},animate=false){mode='explore';update(zoomAt(state,factor,point,minimum,3),{animate})}
 measure();overview(false);loadVisible();
 cards.forEach((el,i)=>{
  const button=el.querySelector('.board-focus');
  images[i].addEventListener('load',()=>images[i].dataset.ready='true');
  button.addEventListener('click',e=>{e.preventDefault();if(e.detail===0)focus(i)});
  button.addEventListener('focus',()=>{if(!points.size&&selected!==i)focus(i)});
 });
 tools.forEach(b=>b.addEventListener('click',()=>{const action=b.dataset.boardAction;if(action==='reset')overview();if(action==='in')zoom(1.3,undefined,true);if(action==='out')zoom(1/1.3,undefined,true)}));
 const local=e=>{const r=viewport.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}};
 const pinchInfo=()=>{const [a,b]=[...points.values()];return {point:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))}};
 viewport.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.target.closest('video'))return;
  const p=local(e);points.set(e.pointerId,p);viewport.setPointerCapture(e.pointerId);world.classList.remove('is-transitioning');
  if(points.size===1){drag={point:p,state:{...state}};moved=false;downItem=e.target.closest('.board-item')}
  if(points.size===2){pinch={...pinchInfo(),state:{...state}};moved=true;downItem=null}
 });
 viewport.addEventListener('pointermove',e=>{
  if(!points.has(e.pointerId))return;const p=local(e);points.set(e.pointerId,p);
  if(points.size===2&&pinch){const info=pinchInfo();const scaled=zoomAt(pinch.state,info.distance/pinch.distance,pinch.point,minimum,3);scaled.x+=info.point.x-pinch.point.x;scaled.y+=info.point.y-pinch.point.y;mode='explore';update(scaled);return}
  if(points.size===1&&drag){const dx=p.x-drag.point.x,dy=p.y-drag.point.y;if(Math.hypot(dx,dy)>5)moved=true;if(moved){mode='explore';viewport.classList.add('is-dragging');update({...drag.state,x:drag.state.x+dx,y:drag.state.y+dy})}}
 });
 function release(e,cancelled=false){
  if(!points.has(e.pointerId))return;points.delete(e.pointerId);
  if(!points.size){viewport.classList.remove('is-dragging');if(!cancelled&&!moved&&downItem)focus(cards.indexOf(downItem));drag=null;pinch=null;downItem=null}
  else if(points.size===1){drag={point:[...points.values()][0],state:{...state}};pinch=null;moved=true}
 }
 viewport.addEventListener('pointerup',e=>release(e));viewport.addEventListener('pointercancel',e=>release(e,true));viewport.addEventListener('lostpointercapture',e=>release(e,true));
 viewport.addEventListener('wheel',e=>{if(e.target.closest('video'))return;e.preventDefault();const amount=e.deltaMode===1?e.deltaY*16:e.deltaY;zoom(Math.exp(-Math.max(-160,Math.min(160,amount))*.003),local(e))},{passive:false});
 viewport.addEventListener('keydown',e=>{
  if(e.target.closest('video'))return;
  const moves={ArrowLeft:[90,0],ArrowRight:[-90,0],ArrowUp:[0,90],ArrowDown:[0,-90]};
  if(moves[e.key]){e.preventDefault();mode='explore';const [dx,dy]=moves[e.key];update({...state,x:state.x+dx,y:state.y+dy},{animate:true})}
  if(['+','='].includes(e.key)){e.preventDefault();zoom(1.25,undefined,true)}
  if(e.key==='-'){e.preventDefault();zoom(.8,undefined,true)}
  if(e.key==='Home'){e.preventDefault();overview()}
 });
 new ResizeObserver(()=>{const previousMode=mode;measure();if(previousMode==='focus')focus(Math.max(0,selected),false);else overview(false)}).observe(viewport);
 const details=document.querySelector('.project-details'),detailsButton=document.querySelector('.project-details-toggle');
 function setDetails(open,restoreFocus=false){details.hidden=!open;board.classList.toggle('details-open',open);detailsButton.setAttribute('aria-expanded',String(open));if(restoreFocus)detailsButton.focus({preventScroll:true})}
 detailsButton.addEventListener('click',()=>setDetails(details.hidden));
 details.querySelector('.details-close').addEventListener('click',()=>setDetails(false,true));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!about.open){if(!details.hidden)setDetails(false,true);else if(mode==='focus')overview()}});
 try{const back=sessionStorage.getItem('archive-return');if(back?.startsWith('/?')||back==='/')document.querySelector('.close-project').href=back}catch{}
}
