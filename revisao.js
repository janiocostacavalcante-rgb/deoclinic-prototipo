/* Modo de anotação do protótipo (09/11, nota 239: também sobre o menu lateral e o cabeçalho; os títulos dos grupos continuam abrindo e fechando, para chegar aos módulos; 29/10, 17:45; 29/10 noite: funciona dentro de janelas e gavetas, que não fecham ao anotar; 30/10: barra levada para o rodapé, pois cobria o topo das janelas e gavetas; funciona também no calendário de período; pino de janela só aparece com a janela certa aberta). Arquivo separado: não mexe nas telas.
   Botão "Anotar" no canto inferior esquerdo; clique no item, escreva, salve. Cada anotação vira um pino numerado
   na tela e fica guardada no banco do artefato (lido pelo Claude). Sem banco, fica só neste navegador, com "Copiar tudo". */
(function(){
'use strict';
const TELA=()=>{const id=(location.hash||'#home').slice(1);return (typeof NAMES!=='undefined'&&NAMES[id])?id:'home'};
const TELA_NOME=id=>(typeof NAMES!=='undefined'&&NAMES[id])||id;
const h=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const aviso=(m,k)=>{if(typeof toast==='function')toast(m,k||'ok')};
let modo=false,notas=[],telas={},store=null,fila=[],alvoAtual=null,aberto=null;
/* Quem anotou (04/11): cada anotação guarda o id da pessoa; o nome é resolvido na hora de mostrar. */
let usr=null,meId='',nomes={};
const nomeDe=id=>id?(nomes[id]||'…'):'';
const quem=n=>n.autorNome||nomeDe(n.autor);
const quando=iso=>{try{const d=new Date(iso);return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}catch(e){return ''}};
function resolveNomes(){if(!usr)return;const ids=[...new Set(notas.map(n=>n.autor).filter(id=>id&&!(id in nomes)))];if(!ids.length)return;ids.forEach(id=>nomes[id]='…');usr.profiles(ids).then(ps=>{ids.forEach(id=>nomes[id]=(ps&&ps[id]&&ps[id].name)||'Testador');refresh()}).catch(()=>{ids.forEach(id=>nomes[id]='Testador')})}

/* ---------- Estilo ---------- */
const st=document.createElement('style');st.textContent=`
#rv-btn{position:fixed;left:max(16px,env(safe-area-inset-left,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:62;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px 0 14px;border-radius:999px;border:0;background:#C96F1B;color:#fff;font:600 15px/1 var(--font,system-ui);cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25)}
#rv-btn:hover{filter:brightness(1.08)}
#rv-btn.on{background:#263238}
#rv-btn svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#rv-btn .n{background:#fff;color:#C96F1B;border-radius:999px;min-width:22px;height:22px;padding:0 6px;display:inline-grid;place-items:center;font-size:12px;font-weight:800}
#rv-btn.on .n{color:#263238}
#rv-bar{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:88;display:none;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;max-width:min(640px,calc(100% - 240px));padding:8px 12px;border-radius:999px;background:#263238;color:#fff;font:500 13px/1.3 var(--font,system-ui);box-shadow:0 8px 24px rgba(0,0,0,.3)}
#rv-bar.show{display:flex}
#rv-bar b{font-weight:800}
#rv-bar button{white-space:nowrap;height:30px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.4);background:transparent;color:#fff;font:600 13px var(--font,system-ui);cursor:pointer}
#rv-bar button.ok{background:#18A403;border-color:#18A403}
#rv-bar button:hover{background:rgba(255,255,255,.15)}
#rv-bar button.ok:hover{background:#148c03}
#rv-hl{position:fixed;z-index:84;pointer-events:none;border:2px dashed #C96F1B;border-radius:8px;background:rgba(201,111,27,.08);display:none}
body.rv-modo #view{padding-bottom:72px}
body.rv-modo #view *,body.rv-modo #modal *,body.rv-modo #drawer *,body.rv-modo #rng-pop *,body.rv-modo #side a,body.rv-modo #side a *,body.rv-modo #side .sair,body.rv-modo .top a,body.rv-modo .top input,body.rv-modo .top .unit{cursor:crosshair!important}
#rv-pins{position:fixed;inset:0;z-index:82;pointer-events:none}
.rv-pin{position:absolute;width:26px;height:26px;border-radius:50%;background:#C96F1B;color:#fff;font:800 12px/1 var(--font,system-ui);display:grid;place-items:center;pointer-events:auto;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid #fff;transform:translate(-50%,-50%)}
.rv-pin.ok{background:#18A403}
.rv-pin:hover{transform:translate(-50%,-50%) scale(1.15)}
#rv-pop{position:fixed;z-index:90;width:min(360px,calc(100% - 32px));background:var(--surface,#fff);color:var(--fg,#333);border:1px solid var(--border,#ccc);border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,.3);padding:14px 16px;display:none;flex-direction:column;gap:10px;font:14px/1.4 var(--font,system-ui)}
#rv-pop.show{display:flex}
#rv-pop .t{font-size:12px;color:var(--fg2,#777);font-weight:600}
#rv-pop .t b{color:var(--fg-strong,#111);font-size:13px;display:block;margin-top:2px}
#rv-pop textarea{width:100%;min-height:84px;border:1px solid var(--border,#ccc);border-radius:8px;padding:8px 10px;font:inherit;background:var(--surface,#fff);color:inherit;resize:vertical}
#rv-pop textarea:focus{outline:none;border-color:#C96F1B;box-shadow:0 0 0 3px rgba(201,111,27,.25)}
#rv-pop .acts{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
#rv-pop .acts button{height:34px;padding:0 14px;border-radius:999px;border:1px solid transparent;font:600 13px var(--font,system-ui);cursor:pointer;background:#C96F1B;color:#fff}
#rv-pop .acts button.sec{background:transparent;border-color:var(--border,#ccc);color:var(--fg,#333)}
#rv-pop .acts button.del{background:transparent;border-color:#D62422;color:#D62422;margin-right:auto}
#rv-pop .txt{white-space:pre-wrap;font-size:15px;color:var(--fg-strong,#111)}
#rv-pop .resp{border-left:3px solid #18A403;padding:4px 10px;font-size:13px;color:var(--fg,#333);white-space:pre-wrap}
#rv-pop .st{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;border-radius:999px;padding:3px 10px;background:#FBEFE3;color:#C96F1B;align-self:flex-start}
#rv-pop .st.ok{background:#E6F7E3;color:#1B7A2E}
#rv-panel{position:fixed;top:env(safe-area-inset-top,0px);right:0;bottom:0;width:min(440px,100%);z-index:89;background:var(--surface,#fff);color:var(--fg,#333);box-shadow:0 0 32px rgba(0,0,0,.3);display:none;flex-direction:column;font:14px/1.4 var(--font,system-ui)}
#rv-panel.show{display:flex}
#rv-panel .ph{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border,#ccc)}
#rv-panel .ph h3{margin:0;font-size:18px;color:var(--fg-strong,#111)}
#rv-panel .pb{padding:16px 20px;overflow:auto;display:flex;flex-direction:column;gap:14px}
#rv-panel .grp>b{display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--fg2,#777);margin-bottom:6px}
#rv-panel .it{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border:1px solid var(--border,#ccc);border-radius:12px;margin-bottom:6px;cursor:pointer}
#rv-panel .it:hover{background:var(--surface2,#f5f5f5)}
#rv-panel .it .num{flex:none;width:24px;height:24px;border-radius:50%;background:#C96F1B;color:#fff;display:grid;place-items:center;font-size:11px;font-weight:800}
#rv-panel .it.ok .num{background:#18A403}
#rv-panel .it small{display:block;color:var(--fg2,#777);font-size:12px}
#rv-panel .x{width:36px;height:36px;border-radius:50%;border:1px solid var(--border,#ccc);background:transparent;color:inherit;cursor:pointer;font-size:18px}
#rv-panel .pf{padding:12px 20px;border-top:1px solid var(--border,#ccc);display:flex;gap:8px;flex-wrap:wrap}
#rv-panel .pf button{height:34px;padding:0 14px;border-radius:999px;border:1px solid var(--border,#ccc);background:transparent;color:inherit;font:600 13px var(--font,system-ui);cursor:pointer}
#rv-panel .aviso{font-size:13px;color:#C96F1B;background:#FBEFE3;border-radius:10px;padding:8px 12px}
@media(max-width:960px){#rv-btn{left:auto;right:max(16px,env(safe-area-inset-right,0px));bottom:max(76px,calc(env(safe-area-inset-bottom,0px) + 76px))}#rv-bar{max-width:calc(100% - 32px);flex-wrap:nowrap}#rv-bar>span:first-child{display:none}}
@media print{#rv-btn,#rv-bar,#rv-pins,#rv-pop,#rv-panel,#rv-hl{display:none!important}}
`;document.head.appendChild(st);

/* ---------- Elementos ---------- */
const PEN='<svg viewBox="0 0 24 24"><path d="M4 20h4l10-10-4-4L4 16zM13 7l4 4"/></svg>';
const btn=document.createElement('button');btn.id='rv-btn';btn.type='button';btn.setAttribute('aria-label','Anotar nesta tela');
const bar=document.createElement('div');bar.id='rv-bar';
const hl=document.createElement('div');hl.id='rv-hl';
const pins=document.createElement('div');pins.id='rv-pins';
const pop=document.createElement('div');pop.id='rv-pop';
const panel=document.createElement('aside');panel.id='rv-panel';panel.setAttribute('aria-label','Anotações da revisão');
document.body.append(btn,bar,hl,pins,pop,panel);

/* ---------- Guarda das anotações ---------- */
function localStore(){const K='deoclinic-rev';const load=()=>{try{return JSON.parse(localStorage.getItem(K)||'{"notas":[],"telas":{}}')}catch(e){return {notas:[],telas:{}}}};const save=d=>{try{localStorage.setItem(K,JSON.stringify(d))}catch(e){}};let cb=null;const emit=()=>cb&&cb(load());
 return {local:true,watch(f){cb=f;emit()},async addNota(n){const d=load();d.notas.push(n);save(d);emit()},async setNota(id,p){const d=load();const n=d.notas.find(x=>x.id===id);if(n)Object.assign(n,p);save(d);emit()},async delNota(id){const d=load();d.notas=d.notas.filter(x=>x.id!==id);save(d);emit()},async setTela(id,v){const d=load();d.telas[id]=v;save(d);emit()}}}
function dbStore(db){const col=db.collection('notas'),tcol=db.collection('telas');
 return {local:false,watch(cb){let a=[],b={};const emit=()=>cb({notas:a,telas:b});col.onSnapshot(s=>{a=s.docs.map(d=>({id:d.id,...d.data()}));emit()},()=>{});tcol.onSnapshot(s=>{b={};s.docs.forEach(d=>b[d.id]=d.data());emit()},()=>{})},
  addNota(n){return col.doc(n.id).set(n)},setNota(id,p){return col.doc(id).update(p)},delNota(id){return col.doc(id).delete()},setTela(id,v){return tcol.doc(id).set(v)}}}
/* Site público de teste (04/11): sem o banco do Claude, as anotações vão para a planilha do endereço DEO_NOTAS_URL (config.js). */
/* Aplica as respostas de atendidas.js às notas que vieram da planilha, se o texto não mudou */
function marcaAtendidas(d){const A=window.DEO_ATENDIDAS||{};(d&&d.notas||[]).forEach(n=>{const x=A[n.num];if(x&&String(n.texto||'').slice(0,40)===x.t&&n.status!=='atendida'){n.status=x.st;if(!n.resposta)n.resposta=x.r}});return d}
function remoteStore(url){let cb=null,last={notas:[],telas:{}};const pull=async()=>{try{const r=await fetch(url,{cache:'no-store'});last=marcaAtendidas(await r.json());cb&&cb(last)}catch(e){}};
 const post=async b=>{await fetch(url,{method:'POST',body:JSON.stringify(b),headers:{'Content-Type':'text/plain;charset=utf-8'}});await pull()};
 return {local:false,remoto:true,watch(f){cb=f;pull();setInterval(pull,20000)},addNota(n){return post({acao:'add',nota:n})},setNota(id,p){return post({acao:'set',id,patch:p})},delNota(id){return post({acao:'del',id,autorNome:testador()})},setTela(id,v){return post({acao:'tela',id,valor:v})}}}
function testador(){let n='';try{n=localStorage.getItem('deoclinic-testador')||''}catch(e){}if(!n){n=(prompt('Para registrar suas anotações, qual é o seu nome?')||'').trim().slice(0,60);if(n)try{localStorage.setItem('deoclinic-testador',n)}catch(e){}}return n||'Testador'}
async function init(){let db=null;try{if(window.claude&&typeof window.claude.use==='function')db=await window.claude.use('db')}catch(e){db=null}
 try{if(window.claude&&typeof window.claude.use==='function'){usr=await window.claude.use('user');if(usr)meId=await usr.id()}}catch(e){usr=null}
 store=db?dbStore(db):(window.DEO_NOTAS_URL?remoteStore(window.DEO_NOTAS_URL):localStore());store.watch(d=>{notas=d.notas.filter(n=>n.app!=='deovita-app').sort((a,b)=>(a.num||0)-(b.num||0));telas=d.telas||{};resolveNomes();refresh()});
 const f=fila;fila=[];for(const fn of f)await fn()}
const comStore=fn=>store?fn():new Promise(r=>fila.push(async()=>{await fn();r()}));

/* ---------- Alvo, descrição e caminho do item ---------- */
const ALVOS='button,a,input,select,textarea,label,h1,h2,h3,h4,th,td,tr,img,.card,.kpi,.alert,.badge,.chip,.tab,.mod,.at-row,.cx-row,.field,p,li,.hero,.fala,summary,.empty,.aviso-mod'; /* 12/11, nota 597: cada pergunta das dúvidas frequentes, os avisos de módulo e as mensagens de lista vazia viram alvos próprios */
function alvoDe(t){if(!(t instanceof Element))return null;if(t.closest('#rv-btn,#rv-bar,#rv-pop,#rv-panel,#rv-pins'))return null;if(t.closest('#menuBtn,#perfilBtn,#side .ghead')||t.id==='backdrop'||t.id==='toasts'||t.closest('#toasts'))return 'nav';if(t.closest('#side,.top')&&!t.closest(ALVOS))return 'nav';return t.closest(ALVOS)||t}
function selOf(el){const parts=[];let e=el;while(e&&e!==document.body){let s=e.tagName.toLowerCase();if(e.id&&!/^\d/.test(e.id)&&e.id!=='view'){parts.unshift('#'+CSS.escape(e.id));break}const p=e.parentElement;if(p){const sib=[...p.children].filter(x=>x.tagName===e.tagName);if(sib.length>1)s+=':nth-of-type('+(sib.indexOf(e)+1)+')'}parts.unshift(s);e=p}return parts.join('>')}
function textoDe(el){const c=el.cloneNode(true);c.querySelectorAll('.ti,.tip,.tipicon,.sr,svg').forEach(x=>x.remove());return c.textContent||''}
function descOf(el){const a=el.getAttribute('aria-label')||el.getAttribute('placeholder')||el.getAttribute('title');const bloco=!/^(BUTTON|A|INPUT|SELECT|TEXTAREA|LABEL|H[1-4]|TH|TD|IMG|P|SPAN|LI)$/.test(el.tagName);const cab=bloco?el.querySelector('h1,h2,h3,h4,.lab,b,label,td,.av-cod'):null;let t=(a||(cab?textoDe(cab):textoDe(el))||'').replace(/\s+/g,' ').trim();if(!t&&el.tagName==='IMG')t=el.alt||'imagem';if(!t&&el.tagName==='INPUT')t=(el.value||'').trim();if(t.length>50)t=t.slice(0,47)+'…';
 const tipo={BUTTON:'botão',A:'link',INPUT:'campo',SELECT:'lista',TEXTAREA:'campo',H1:'título',H2:'título',H3:'título',H4:'título',TH:'coluna',TD:'célula',TR:'linha',IMG:'imagem',LABEL:'rótulo',P:'texto',LI:'item',SPAN:'texto'}[el.tagName]||(el.classList.contains('card')?'cartão':el.classList.contains('kpi')?'indicador':el.classList.contains('alert')?'aviso':el.classList.contains('badge')?'etiqueta':'bloco');
 return tipo+(t?' “'+t+'”':'')}
function dentroDe(el){if(el.closest('#rng-pop'))return 'calendário “Período”';const m=el.closest('#modal'),d=el.closest('#drawer');const t=m?m.querySelector('.mh h3,h3'):d?d.querySelector('.dh h3,h3'):null;if(!t)return '';return (m?'janela ':'gaveta ')+'“'+(textoDe(t).replace(/\s+/g,' ').trim().slice(0,40))+'”'}
/* Um item anotado dentro de uma janela só existe enquanto aquela janela (mesmo título) está aberta; evita pino em janela errada. */
function achaNota(n){const el=acha(n.sel);if(!el)return null;if(n.dentro&&dentroDe(el)!==n.dentro)return null;const d=el.closest('#drawer');if(d&&!d.classList.contains('show'))return null;return el}
function acha(sel){try{return document.querySelector(sel)}catch(e){return null}}
function onde(el){const b=el.getBoundingClientRect();if(!b.width&&!b.height)return null;for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){const o=getComputedStyle(p).overflowY;if(o==='auto'||o==='scroll'){const r=p.getBoundingClientRect();if(b.bottom<r.top||b.top>r.bottom)return null}}return b}

/* ---------- Modo ---------- */
function setModo(v){modo=v;document.body.classList.toggle('rv-modo',v);bar.classList.toggle('show',v);btn.classList.toggle('on',v);hl.style.display='none';if(!v)fechaPop();refresh()}
btn.onclick=()=>setModo(!modo);
document.addEventListener('mousemove',e=>{if(!modo||pop.classList.contains('show'))return;const a=alvoDe(e.target);if(!a||a==='nav'){hl.style.display='none';return}const b=onde(a);if(!b){hl.style.display='none';return}hl.style.display='block';hl.style.left=(b.left-3)+'px';hl.style.top=(b.top-3)+'px';hl.style.width=(b.width+6)+'px';hl.style.height=(b.height+6)+'px'},true);
document.addEventListener('click',e=>{if(!modo)return;const a=alvoDe(e.target);if(a===null)return;if(a==='nav'){fechaPop();return}e.preventDefault();e.stopImmediatePropagation();if(pop.classList.contains('show')){fechaPop();return}novaNota(a)},true);
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(panel.classList.contains('show')){panel.classList.remove('show');e.stopImmediatePropagation();return}if(pop.classList.contains('show')){fechaPop();e.stopImmediatePropagation();return}if(modo){setModo(false);e.stopImmediatePropagation()}},true);
addEventListener('hashchange',()=>{fechaPop();refresh()});

/* ---------- Janela da anotação ---------- */
function posiciona(b){pop.style.visibility='hidden';pop.classList.add('show');const w=pop.offsetWidth,hh=pop.offsetHeight;let x=b?b.left:innerWidth/2-w/2,y=b?b.bottom+10:innerHeight/2-hh/2;if(y+hh>innerHeight-12)y=Math.max(12,(b?b.top:y)-hh-10);if(x+w>innerWidth-12)x=innerWidth-w-12;if(x<12)x=12;if(y<12)y=12;pop.style.left=x+'px';pop.style.top=y+'px';pop.style.visibility=''}
function fechaPop(){pop.classList.remove('show');pop.innerHTML='';aberto=null;alvoAtual=null}
function novaNota(el){alvoAtual=el;const tela=TELA(),item=descOf(el),dentro=dentroDe(el);
 pop.innerHTML=`<div class="t">Nova anotação · ${h(TELA_NOME(tela))}${dentro?' · '+h(dentro):''}<b>${h(item)}</b></div><textarea id="rv-txt" placeholder="O que mudar? Ex.: tirar; trocar o texto por…; mais visível; não entendi"></textarea><div class="acts"><button class="sec" type="button" id="rv-cancel">Cancelar</button><button type="button" id="rv-save">Salvar anotação</button></div>`;
 posiciona(onde(el));const ta=pop.querySelector('#rv-txt');ta.focus();
 pop.querySelector('#rv-cancel').onclick=fechaPop;
 const salvar=async()=>{const txt=ta.value.trim();if(!txt){ta.focus();return}const num=notas.reduce((m,n)=>Math.max(m,n.num||0),0)+1;const n={id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),num,tela,telaNome:TELA_NOME(tela),item,dentro:dentroDe(el),sel:selOf(el),texto:txt,criado:new Date().toISOString(),status:'aberta',resposta:'',autor:meId||'',...(store&&store.remoto?{autorNome:testador()}:{})};
  try{await comStore(()=>store.addNota(n));fechaPop();aviso('Anotação '+num+' salva'+(store&&store.local?' (só neste navegador)':''))}catch(e){aviso('Não consegui salvar. Tente de novo.','err')}};
 pop.querySelector('#rv-save').onclick=salvar;ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))salvar()})}
function verNota(n,b){aberto=n.id;const ok=n.status==='atendida';
 pop.innerHTML=`<div class="t">Anotação ${n.num} · ${h(n.telaNome||TELA_NOME(n.tela))}${n.dentro?' · '+h(n.dentro):''}<b>${h(n.item)}</b>${quem(n)||n.criado?`<small style="display:block;opacity:.75;margin-top:2px">${quem(n)?'por '+h(quem(n))+' · ':''}${h(quando(n.criado))}</small>`:''}</div><span class="st ${ok?'ok':''}">${ok?'Atendida pelo Claude':'Aberta'}</span><div class="txt" id="rv-view">${h(n.texto)}</div>${n.resposta?`<div class="resp">${h(n.resposta)}</div>`:''}<div class="acts"><button class="del" type="button" id="rv-del">Excluir</button><button class="sec" type="button" id="rv-edit">Editar</button><button type="button" id="rv-close">Fechar</button></div>`;
 posiciona(b);pop.querySelector('#rv-close').onclick=fechaPop;
 pop.querySelector('#rv-del').onclick=async()=>{if(!confirm('Excluir a anotação '+n.num+'?'))return;try{await store.delNota(n.id);fechaPop();aviso('Anotação '+n.num+' excluída')}catch(e){aviso('Não consegui excluir.','err')}};
 pop.querySelector('#rv-edit').onclick=()=>{const v=pop.querySelector('#rv-view');v.outerHTML=`<textarea id="rv-txt">${h(n.texto)}</textarea>`;const ta=pop.querySelector('#rv-txt');ta.focus();const e=pop.querySelector('#rv-edit');e.textContent='Salvar';e.className='';e.onclick=async()=>{const txt=ta.value.trim();if(!txt)return;try{await store.setNota(n.id,{texto:txt,status:'aberta',resposta:''});fechaPop();aviso('Anotação '+n.num+' atualizada')}catch(err){aviso('Não consegui salvar.','err')}}}}

/* ---------- Pinos, barra e botão ---------- */
let raf=0;
function refresh(){cancelAnimationFrame(raf);raf=requestAnimationFrame(desenha)}
function desenha(){const tela=TELA(),daTela=notas.filter(n=>n.tela===tela),abertas=notas.filter(n=>n.status!=='atendida');
 btn.innerHTML=`${PEN}<span>${modo?'Sair da anotação':'Anotar'}</span>${daTela.length?`<span class="n" title="Anotações nesta tela">${daTela.length}</span>`:''}`;
 const apr=telas[tela]&&telas[tela].aprovada;
 bar.innerHTML=`<span><b>Anotando.</b> Clique no item. Esc sai.</span>${apr?`<span style="color:#7fe08a;font-weight:700">✓ Tela aprovada</span><button type="button" id="rv-desapr">Desfazer</button>`:`<button class="ok" type="button" id="rv-apr">✓ Aprovar esta tela</button>`}<button type="button" id="rv-lista">Lista (${abertas.length} abertas)</button>`;
 const a=bar.querySelector('#rv-apr');if(a)a.onclick=async()=>{try{await comStore(()=>store.setTela(tela,{aprovada:true,nome:TELA_NOME(tela),quando:new Date().toISOString()}));aviso('Tela “'+TELA_NOME(tela)+'” aprovada')}catch(e){aviso('Não consegui salvar.','err')}};
 const d=bar.querySelector('#rv-desapr');if(d)d.onclick=async()=>{try{await store.setTela(tela,{aprovada:false,nome:TELA_NOME(tela),quando:new Date().toISOString()})}catch(e){}};
 bar.querySelector('#rv-lista').onclick=abrePanel;
 pins.innerHTML='';daTela.forEach(n=>{const p=document.createElement('button');p.type='button';p.className='rv-pin'+(n.status==='atendida'?' ok':'');p.textContent=n.num;p.title='Anotação '+n.num+': '+n.texto;p.dataset.id=n.id;p.onclick=e=>{e.stopPropagation();if(aberto===n.id)fechaPop();else{const el=achaNota(n);verNota(n,el&&onde(el))}};pins.appendChild(p);poePin(p,n)});
 if(panel.classList.contains('show'))montaPanel()}
/* Rolagem e redimensionamento só movem os pinos; não reconstroem nada. */
function poePin(p,n){const el=achaNota(n);const b=el&&onde(el);if(!b){p.style.display='none';return}p.style.display='';p.style.left=(b.right-6)+'px';p.style.top=(b.top+2)+'px'}
function reposiciona(){pins.querySelectorAll('.rv-pin').forEach(p=>{const n=notas.find(x=>x.id===p.dataset.id);if(n)poePin(p,n)})}
let raf2=0;const rep=()=>{cancelAnimationFrame(raf2);raf2=requestAnimationFrame(reposiciona)};
addEventListener('scroll',rep,true);addEventListener('resize',rep);
const MEUS='#rv-btn,#rv-bar,#rv-pins,#rv-pop,#rv-panel,#rv-hl';
new MutationObserver(ms=>{if(ms.every(m=>m.target instanceof Element&&m.target.closest(MEUS)))return;clearTimeout(desenha.t);desenha.t=setTimeout(refresh,60)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});

/* ---------- Lista de todas as anotações ---------- */
function abrePanel(){panel.classList.add('show');montaPanel()}
function montaPanel(){const grupos={};notas.forEach(n=>{(grupos[n.tela]=grupos[n.tela]||[]).push(n)});const aprovadas=Object.entries(telas).filter(([,v])=>v&&v.aprovada).map(([k,v])=>v.nome||TELA_NOME(k));
 panel.innerHTML=`<div class="ph"><h3>Anotações da revisão</h3><button class="x" type="button" aria-label="Fechar" id="rv-pclose">×</button></div><div class="pb">${store&&store.local?'<div class="aviso">Sem conexão com o banco do protótipo: as anotações ficam só neste navegador. Use “Copiar tudo” e cole no chat.</div>':''}
 ${notas.length?Object.entries(grupos).map(([t,l])=>`<div class="grp"><b>${h(l[0].telaNome||TELA_NOME(t))}</b>${l.map(n=>`<div class="it ${n.status==='atendida'?'ok':''}" data-id="${n.id}"><span class="num">${n.num}</span><div>${h(n.texto)}<small>${n.dentro?h(n.dentro)+' · ':''}${h(n.item)}${quem(n)?' · '+h(quem(n)):''}${n.status==='atendida'?' · atendida':''}</small></div></div>`).join('')}</div>`).join(''):'<p style="color:var(--fg2,#777)">Nenhuma anotação ainda. Clique em Anotar e depois no item que quer comentar.</p>'}
 ${aprovadas.length?`<div class="grp"><b>Telas aprovadas</b><p style="font-size:13px">${aprovadas.map(h).join(' · ')}</p></div>`:''}</div>
 <div class="pf"><button type="button" id="rv-copy">Copiar tudo</button></div>`;
 panel.querySelector('#rv-pclose').onclick=()=>panel.classList.remove('show');
 panel.querySelectorAll('.it').forEach(el=>el.onclick=()=>{const n=notas.find(x=>x.id===el.dataset.id);if(!n)return;panel.classList.remove('show');if(TELA()!==n.tela)location.hash='#'+n.tela;setTimeout(()=>{const e=achaNota(n);if(e){e.scrollIntoView({block:'center'});setTimeout(()=>verNota(n,onde(e)),250)}else verNota(n,null)},TELA()!==n.tela?300:0)});
 panel.querySelector('#rv-copy').onclick=async()=>{const txt=notas.map(n=>`${n.num}. [${n.telaNome||n.tela}]${quem(n)?' ('+quem(n)+')':''} ${n.item}: ${n.texto}${n.status==='atendida'?' (atendida)':''}`).join('\n')+(aprovadas.length?'\nTelas aprovadas: '+aprovadas.join(', '):'');try{await navigator.clipboard.writeText(txt);aviso('Copiado. Cole no chat.')}catch(e){prompt('Copie o texto:',txt)}}}
document.addEventListener('pointerdown',e=>{if(panel.classList.contains('show')&&!panel.contains(e.target)&&!bar.contains(e.target))panel.classList.remove('show');if(pop.classList.contains('show')&&!pop.contains(e.target)&&!e.target.closest('.rv-pin')&&!modo)fechaPop()},true);

refresh();init();
})();
