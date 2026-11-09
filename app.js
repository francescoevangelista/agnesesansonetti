const reduced=matchMedia('(prefers-reduced-motion: reduce)');
// Interface text for the page language (Italian at /, English at /en/).
const T={it:{projects:n=>`${n} progetti`,play:'Avvia film',pause:'Pausa film'},en:{projects:n=>`${n} projects`,play:'Play film',pause:'Pause film'}}[document.documentElement.lang]||{};
// IT / EN: remember the choice for a year; the home page middleware reads it.
document.querySelectorAll('.lang-switch a[data-lang]').forEach(a=>a.addEventListener('click',()=>{
 document.cookie=`lang=${a.dataset.lang}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;
 if(document.body.dataset.page==='archive'&&location.search){const url=new URL(a.href);url.search=location.search;a.href=url}
}));
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
const ease='cubic-bezier(.2,.7,.2,1)';
const fit=(ratio,maxW,maxH)=>{const w=Math.min(maxW,maxH*ratio);return {w,h:w/ratio}};
const index=document.querySelector('.archive-index');
if(index){
 // Home: A/S on the first screen, then the projects as an index of large titles (the same on computer and phone).
 // One title at a time is in light: the one under the pointer, or else the one crossing the reading line (42% of the screen).
 // The others dim and the cover of the title in light appears beside the list (computer) or in the lower corner (phone).
 const scroller=document.querySelector('.archive');
 const entries=[...index.querySelectorAll('.index-entry')].map(li=>({li,a:li.querySelector('a')}));
 const filters=[...document.querySelectorAll('[data-filter]')];
 const peek=document.querySelector('.index-peek'),peekImg=peek.querySelector('img');
 let hovered=null,active=null;
 function light(entry){
  if(entry===active)return;active=entry;
  entries.forEach(e=>e.li.classList.toggle('is-active',e===entry));index.classList.toggle('has-active',Boolean(entry));
  if(!entry){peek.classList.remove('is-on');return}
  peekImg.removeAttribute('srcset');peekImg.src=entry.a.dataset.cover;peekImg.srcset=entry.a.dataset.srcset;peekImg.sizes='(max-width: 700px) 46vw, 26vw';
  peek.classList.add('is-on');
 }
 const fromScroll=()=>{const line=innerHeight*.42;return entries.find(e=>{if(e.li.hidden)return false;const b=e.li.getBoundingClientRect();return b.top<=line&&b.bottom>=line})||null};
 const update=()=>light(hovered&&!hovered.li.hidden?hovered:fromScroll());
 function filter(value,save=true){
  if(!['all','Fashion','Accessories'].includes(value))value='all';
  entries.forEach(e=>{e.li.hidden=value!=='all'&&e.li.dataset.category!==value});
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===value)));
  document.querySelector('.archive-count').textContent=T.projects(entries.filter(e=>!e.li.hidden).length);
  if(save){const url=new URL(location.href);if(value==='all')url.searchParams.delete('category');else url.searchParams.set('category',value);history.replaceState(null,'',url)}
  update();
 }
 // The docked A/S hides while the large one is visible.
 const intro=document.querySelector('.archive-intro');
 const toIndex=(behavior='smooth')=>{if(intro&&scroller.scrollTop<index.offsetTop-40)scroller.scrollTo({top:index.offsetTop-20,behavior:reduced.matches?'instant':behavior})};
 if(intro)new IntersectionObserver(([entry])=>document.body.classList.toggle('intro-visible',entry.isIntersecting),{root:scroller,threshold:.35}).observe(intro.querySelector('.as-mark'));
 filters.forEach(b=>b.addEventListener('click',()=>{filter(b.dataset.filter);toIndex()}));
 let ticking=false;scroller.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{ticking=false;update()})}},{passive:true});
 addEventListener('resize',update);
 entries.forEach(e=>{
  e.a.addEventListener('pointerenter',ev=>{if(ev.pointerType==='mouse'){hovered=e;update()}});
  e.a.addEventListener('pointerleave',ev=>{if(ev.pointerType==='mouse'){hovered=null;update()}});
  e.a.addEventListener('focus',()=>{hovered=e;update()});e.a.addEventListener('blur',()=>{hovered=null;update()});
  // Opening a project: the title goes in light, its cover flies to the centre, then the project page opens.
  e.a.addEventListener('click',ev=>{
   hovered=e;update();
   try{sessionStorage.setItem('archive-return',location.pathname+location.search);sessionStorage.setItem('archive-scroll',String(scroller.scrollTop))}catch{}
   if(ev.defaultPrevented||reduced.matches||ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.button!==0)return;
   ev.preventDefault();
   const r=peekImg.getBoundingClientRect(),ratio=Number(e.a.dataset.ratio)||r.width/r.height;
   const fly=new Image();fly.src=peekImg.currentSrc||peekImg.src;fly.alt='';fly.className='cover-fly';
   Object.assign(fly.style,{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`});
   document.body.append(fly);document.body.classList.add('archive-leaving');
   const {w,h}=fit(ratio,innerWidth*.5,innerHeight*.6);
   fly.animate([{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`},{left:`${(innerWidth-w)/2}px`,top:`${(innerHeight-h)/2}px`,width:`${w}px`,height:`${h}px`}],{duration:720,easing:ease,fill:'forwards'}).finished.then(()=>{
    try{sessionStorage.setItem('cover-arrive',JSON.stringify({src:fly.src,ratio}))}catch{}
    location.href=e.a.href;
   });
  });
 });
 addEventListener('pageshow',ev=>{if(ev.persisted){document.body.classList.remove('archive-leaving');document.querySelectorAll('.cover-fly').forEach(f=>f.remove());hovered=null;update()}});
 const initial=new URL(location.href).searchParams.get('category');
 filter(initial||'all',false);
 if(initial)toIndex('instant');
 try{const saved=Number(sessionStorage.getItem('archive-scroll'));if(saved&&sessionStorage.getItem('archive-return')===location.pathname+location.search){scroller.scrollTo({top:saved,behavior:'instant'});sessionStorage.removeItem('archive-scroll')}}catch{}
 update();
}
const sequence=document.querySelector('.pseq');
if(sequence){
 // Project: an ordered sequence in depth. Films first, then main images alternating left and right, then process pages.
 // Scrolling moves forward one item at a time (gentle snap); the current item is numbered and captioned; clicking it enlarges it.
 // CSS 3D transforms set through the CSSOM (allowed by the Content-Security-Policy), no library.
 const PERSPECTIVE=1100,SPACING=1150;
 const smooth=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t)};
 const pad=n=>String(n).padStart(2,'0');
 const board=document.querySelector('.project-board'),scroller=sequence,stage=scroller.querySelector('.pseq-stage'),world=stage.querySelector('.pseq-world');
 const steps=[...scroller.querySelectorAll('.pseq-step')],ticks=[...document.querySelectorAll('.pseq-tick')];
 const count=document.querySelector('.pseq-count'),captionEl=document.querySelector('.pseq-caption'),hint=document.querySelector('.pseq-hint');
 const groups=JSON.parse(scroller.dataset.groups);
 const focusLayer=document.querySelector('.pseq-focus'),focusImg=focusLayer.querySelector('img'),focusCaption=focusLayer.querySelector('.pseq-focus-caption');
 const items=[...world.querySelectorAll('.pseq-item')].map((el,i)=>({el,i,media:el.querySelector('img,video'),group:el.dataset.group,ratio:Number(el.dataset.ratio),opacity:-1,hi:false}));
 const n=items.length;
 let W=0,H=0,stepH=1,zoom=1,pos=reduced.matches?0:-3.2,target=0,current=-1,tiltX=0,tilt=0,filmPaused=false;
 // Deterministic placement: films centred, then images alternating sides, process pages further out and smaller.
 let side=1;
 for(const d of items){if(d.group==='film'){d.side=0;d.jitter=0;continue}d.side=side;side=-side;d.jitter=((d.i*37)%11-5)/5}
 function layout(){
  const keep=scroller.scrollTop/(stepH||1);
  W=scroller.clientWidth;H=scroller.clientHeight;stepH=steps[0]?.offsetHeight||H*.62;
  stage.style.marginBottom=`${-H}px`;
  const narrow=W<700;
  for(const d of items){
   const share=d.group==='film'?.62:d.group==='main'?.68:.48;
   const {w,h}=fit(d.ratio,W*(narrow?.86:d.group==='film'?.7:.5)*zoom,H*share*zoom);
   d.x=d.side*W*(narrow?.06:d.group==='process'?.24:.17);d.y=d.jitter*H*.05;
   d.el.style.width=`${w}px`;d.el.style.height=`${h}px`;
   d.el.style.transform=`translate3d(${d.x}px,${d.y}px,${-d.i*SPACING}px) translate(-50%,-50%)`;
  }
  // Keep the same item in front when the area changes size (text panel opening or closing).
  if(keep>0){scroller.scrollTop=keep*stepH;target=Math.min(n-1,Math.max(0,keep))}
 }
 layout();new ResizeObserver(layout).observe(scroller);
 scroller.addEventListener('scroll',()=>{target=Math.min(n-1,Math.max(0,scroller.scrollTop/stepH));hint.classList.add('is-off')},{passive:true});
 const goTo=i=>scroller.scrollTo({top:Math.max(0,Math.min(n-1,i))*stepH,behavior:reduced.matches?'instant':'smooth'});
 ticks.forEach(tk=>tk.addEventListener('click',()=>goTo(Number(tk.dataset.to))));
 scroller.addEventListener('keydown',e=>{
  const k={ArrowDown:1,ArrowRight:1,PageDown:1,ArrowUp:-1,ArrowLeft:-1,PageUp:-1}[e.key];
  if(k){e.preventDefault();goTo(Math.round(target)+k)}
  if(e.key==='Home'){e.preventDefault();goTo(0)}
  if(e.key==='End'){e.preventDefault();goTo(n-1)}
  if(e.key==='Enter'&&e.target===scroller&&current>=0){e.preventDefault();openFocus(items[current])}
 });
 addEventListener('pointermove',e=>{if(e.pointerType==='mouse')tilt=(e.clientX/innerWidth-.5)*5},{passive:true});
 // Click: the current item enlarges (a film plays or pauses); another item becomes current.
 items.forEach(d=>d.el.addEventListener('click',()=>{if(d.i!==current){goTo(d.i);return}openFocus(d)}));
 const filmToggle=document.querySelector('[data-film-toggle]');
 const setFilmLabel=()=>{if(filmToggle){filmToggle.textContent=filmPaused?T.play:T.pause;filmToggle.setAttribute('aria-pressed',String(filmPaused))}};
 function openFocus(d){
  if(d.media.tagName==='VIDEO'){filmPaused=!d.media.paused;setFilmLabel();return}
  focusImg.src=d.media.dataset.medium;const full=new Image();full.src=d.media.dataset.full;full.decode().then(()=>{if(!focusLayer.hidden)focusImg.src=full.src}).catch(()=>{});
  focusImg.alt=d.media.alt;focusCaption.textContent=d.el.dataset.caption;focusLayer.hidden=false;
  if(!reduced.matches)focusImg.animate([{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'none'}],{duration:300,easing:ease});
  focusLayer.focus({preventScroll:true});
 }
 const closeFocus=()=>{focusLayer.hidden=true;scroller.focus({preventScroll:true})};
 focusLayer.addEventListener('click',closeFocus);
 // Tools: smaller / larger / back to the start / film.
 document.querySelectorAll('[data-board-action]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.boardAction;if(a==='in')zoom=Math.min(1.5,zoom*1.15);if(a==='out')zoom=Math.max(.5,zoom/1.15);if(a==='reset'){zoom=1;goTo(0)}layout()}));
 filmToggle?.addEventListener('click',()=>{filmPaused=!filmPaused;setFilmLabel()});
 // Text panel: open when the project opens. On a phone it closes at the first scroll so the images take the whole height.
 const details=document.querySelector('.project-details'),detailsButton=document.querySelector('.project-details-toggle');
 const setDetails=(open,restoreFocus=false)=>{details.hidden=!open;board.classList.toggle('details-open',open);detailsButton.setAttribute('aria-expanded',String(open));if(restoreFocus)detailsButton.focus({preventScroll:true})};
 detailsButton.addEventListener('click',()=>setDetails(details.hidden));details.querySelector('.details-close').addEventListener('click',()=>setDetails(false,true));
 const phone=matchMedia('(max-width: 700px)');let autoClosed=false;
 scroller.addEventListener('scroll',()=>{if(phone.matches&&!autoClosed&&!details.hidden&&scroller.scrollTop>stepH*.3){autoClosed=true;setDetails(false)}},{passive:true});
 document.addEventListener('keydown',e=>{if(e.key!=='Escape'||about?.open)return;if(!focusLayer.hidden)closeFocus();else if(!details.hidden)setDetails(false,true)});
 try{const close=document.querySelector('.close-project'),home=close.getAttribute('href'),back=sessionStorage.getItem('archive-return');if(back===home||back?.startsWith(home+'?'))close.href=back}catch{}
 // The cover that flew from the home fades while the sequence arrives from depth.
 let arrival=null;try{arrival=JSON.parse(sessionStorage.getItem('cover-arrive'));sessionStorage.removeItem('cover-arrive')}catch{}
 if(arrival?.src&&!reduced.matches){
  const fly=new Image();fly.src=arrival.src;fly.alt='';fly.className='cover-fly';
  const {w,h}=fit(arrival.ratio||1,innerWidth*.5,innerHeight*.6);
  Object.assign(fly.style,{left:`${(innerWidth-w)/2}px`,top:`${(innerHeight-h)/2}px`,width:`${w}px`,height:`${h}px`});
  document.body.append(fly);
  fly.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.85)'}],{duration:650,delay:120,easing:ease,fill:'forwards'}).finished.then(()=>fly.remove());
 }
 // Frame loop: ease the camera along the sequence, fade by depth, load sharper images nearby, play the near film.
 function frame(){
  pos+=(target-pos)*(reduced.matches?1:.11);
  tiltX+=(tilt-tiltX)*.06;
  world.style.transform=`translateZ(${pos*SPACING}px) rotateY(${tiltX}deg)`;
  for(const d of items){
   const depth=(pos-d.i)*SPACING;
   const o=depth>PERSPECTIVE*.8?0:smooth(-SPACING*4.2,-SPACING*2.2,depth)*(1-smooth(SPACING*.3,SPACING*.7,depth));
   if(Math.abs(o-d.opacity)>.02){d.opacity=o;d.el.style.opacity=o.toFixed(2);d.el.style.pointerEvents=o<.3?'none':'';d.el.classList.toggle('is-hidden',o<=0)}
   if(!d.hi&&d.media.tagName==='IMG'&&Math.abs(pos-d.i)<2.2){d.hi=true;const big=new Image();big.src=d.media.dataset.medium;big.decode().then(()=>{d.media.src=big.src}).catch(()=>{})}
   if(d.media.tagName==='VIDEO'){const near=Math.abs(pos-d.i)<1.4&&!filmPaused&&!document.hidden&&!about?.open;if(near&&d.media.paused)d.media.play().catch(()=>{});if(!near&&!d.media.paused)d.media.pause()}
  }
  const c=Math.round(Math.min(n-1,Math.max(0,target)));
  if(c!==current){
   current=c;items.forEach(d=>d.el.classList.toggle('is-current',d.i===c));ticks.forEach((t,i)=>t.classList.toggle('is-current',i===c));
   count.textContent=`${pad(c+1)} / ${pad(n)} — ${groups[items[c].group]}`;captionEl.textContent=items[c].el.dataset.caption;
  }
  requestAnimationFrame(frame);
 }
 setFilmLabel();requestAnimationFrame(frame);
}
