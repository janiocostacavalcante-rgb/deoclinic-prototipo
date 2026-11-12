/* Rodada 19 · procedimentos */
/* ==========================================================================
   Anotações 552 a 591 do grupo Procedimentos/Convênio.
   Fica depois dos arquivos da rodada 18: só acrescenta funções e embrulha as que já existem.
   ========================================================================== */

/* ---------- Nota 552: "Convênio" passa a "Plano" só no texto que a pessoa lê ----------
   Valores internos, dados, ids, onclick e nomes de função continuam iguais (ex.: g.st==='Convênio').
   A troca é feita na camada de exibição: num observador da página (navegador) e numa função de texto
   usada pelos testes. "Convênio e plano" / "Convênio ou plano" viram só "Plano" para não repetir.
   Convênio e plano são palavras masculinas: "do convênio" vira "do plano" sem outro ajuste.
   Termos da ANS/TISS: o padrão TISS usa "operadora" e "plano", não "convênio"; nada na lei obriga a palavra. */
const P19_RE=/(?<![\p{L}])(?:([Cc])onvênio(s?)(?: (?:e|ou) planos?)?|CONVÊNIO(S?)(?: (?:E|OU) PLANOS?)?)(?![\p{L}])/gu;
const P19_TEM=/onvênio|ONVÊNIO/;
const pr19Plano=s=>typeof s==='string'&&P19_TEM.test(s)?s.replace(P19_RE,(m,c,s1,s2)=>c?(c==='C'?'Plano':'plano')+(s1||''):'PLANO'+(s2||'')):s;
const P19_ATTR=['placeholder','title','aria-label','data-tip','alt'];
/* Versão para HTML em texto: troca só o texto entre as tags e os atributos de exibição; <option> sem value guarda o valor antigo */
function pr19PlanoHtml(h){if(typeof h!=='string'||!P19_TEM.test(h))return h;
 h=h.replace(/<option\b((?:(?!\bvalue=)[^>])*)>([^<]*)/g,(m,a,t)=>pr19Plano(t)!==t?`<option${a} value="${t.replace(/"/g,'&quot;')}">${t}`:m);
 return h.replace(/<!--[\s\S]*?-->|<(script|style|textarea)\b[^>]*>[\s\S]*?<\/\1>|<[^>]+>|[^<]+/gi,(m,raw)=>{if(raw||m.startsWith('<!--'))return m;
  if(m[0]==='<')return m.replace(/(\s(?:placeholder|title|aria-label|data-tip|alt)=")([^"]*)"/g,(x,a,v)=>a+pr19Plano(v)+'"');return pr19Plano(m)})}
/* Versão para a página: percorre os textos e atributos de exibição de um pedaço da tela */
function pr19PlanoDom(raiz){try{if(!raiz||typeof document==='undefined'||!document.createTreeWalker)return;
 if(raiz.nodeType===3){if(raiz.parentElement)pr19PlanoDom(raiz.parentElement);return}if(raiz.nodeType!==1||raiz.closest('script,style,textarea,#rv-panel'))return;
 const w=document.createTreeWalker(raiz,4,{acceptNode:t=>t.parentElement&&t.parentElement.closest('script,style,textarea')?2:1}),l=[];while(w.nextNode())l.push(w.currentNode);
 l.forEach(t=>{const v=pr19Plano(t.nodeValue);if(v===t.nodeValue)return;const o=t.parentElement;if(o&&o.tagName==='OPTION'&&!o.hasAttribute('value'))o.setAttribute('value',o.textContent);t.nodeValue=v});
 [raiz,...raiz.querySelectorAll(P19_ATTR.map(a=>`[${a}]`).join(','))].forEach(e=>P19_ATTR.forEach(a=>{if(!e.hasAttribute(a))return;const v=e.getAttribute(a),n=pr19Plano(v);if(n!==v)e.setAttribute(a,n)}))}catch(e){}}
try{if(typeof MutationObserver!=='undefined'&&typeof document!=='undefined'&&document.body&&document.body.nodeType===1){
 new MutationObserver(ms=>ms.forEach(m=>{if(m.type==='childList')m.addedNodes.forEach(pr19PlanoDom);else pr19PlanoDom(m.target)})).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:P19_ATTR});
 pr19PlanoDom(document.body);if(document.title)document.title=pr19Plano(document.title)}}catch(e){}

/* ---------- Nota 561: sem o botão "Voltar para ..." nas telas do menu Procedimentos (o menu lateral já leva a cada uma) ---------- */
{const _iv=injetaVoltar;injetaVoltar=function(id){if(groupOf(id)==='Procedimentos')return;return _iv.apply(this,arguments)}}

/* ---------- Notas 585 e 563: lista de procedimentos e exames só depois de uma pesquisa, com filtros ---------- */
let P19_F={nome:'',cod:'',grupo:'',sub:'',st:'ativos',ok:false};
/* Configuração sem criar cadastro novo (prCfg cria; aqui só lemos) */
const pr19Cfg=c=>PR_CFG[c]||{grupo:PROC(c)?PROC(c).tipo:'Laboratório',sub:'',inativo:false};
/* Catálogo único: procedimentos da clínica e exames de laboratório */
function pr19Catalogo(){const vis=new Set(),l=[];
 PROCEDIMENTOS.forEach(p=>{if(vis.has(p.c))return;vis.add(p.c);const g=pr19Cfg(p.c);l.push({c:p.c,n:p.n,grupo:g.grupo||p.tipo,sub:g.sub||'',ativo:!g.inativo,lab:false})});
 (typeof EXAMES!=='undefined'?EXAMES:[]).forEach(e=>{if(vis.has(e.c))return;vis.add(e.c);const g=pr19Cfg(e.c);l.push({c:e.c,n:e.n,grupo:g.grupo||'Laboratório',sub:g.sub||'',ativo:!g.inativo,lab:true})});
 return l}
function pr19Lista(f){f=f||P19_F;const n=semAc(String(f.nome||'').trim()),c=semAc(String(f.cod||'').trim());
 return pr19Catalogo().filter(x=>(!n||semAc(x.n).includes(n))&&(!c||semAc(x.c).includes(c))&&(!f.grupo||x.grupo===f.grupo)&&(!f.sub||x.sub===f.sub)&&(f.st==='todos'||(f.st==='inativos'?!x.ativo:x.ativo)))
  .sort((a,b)=>a.n.localeCompare(b.n,'pt-BR'))}
const pr19Subs=g=>g?(PR_GRUPOS[g]||[]):[...new Set(Object.values(PR_GRUPOS).flat())];
const pr19SubOpts=g=>`<option value="">Todos os subgrupos</option>${pr19Subs(g).map(s=>`<option value="${esc(s)}" ${P19_F.sub===s?'selected':''}>${esc(s)}</option>`).join('')}`;
function pr19Linhas(){if(!P19_F.ok)return vazioLinha(6,'Faça uma pesquisa','Preencha um ou mais filtros e toque em Pesquisar. Para ver todos, toque em Pesquisar sem filtro.');
 const l=pr19Lista();if(!l.length)return vazioLinha(6,'Nenhum procedimento encontrado','Mude os filtros e pesquise de novo.');
 return l.map(x=>{const ab=x.lab?`exForm('${x.c}')`:`clPrcForm('${x.c}')`;return `<tr style="cursor:pointer" onclick="${ab}">${td('Código TUSS',`<span class="mono">${esc(x.c)}</span>`)}${td('Procedimento',esc(x.n))}${td('Grupo',esc(x.grupo))}${td('Subgrupo',x.sub?esc(x.sub):'<span class="tl">—</span>')}${td('Situação',x.ativo?'<span class="badge ok">Ativo</span>':'<span class="badge neutral">Inativo</span>')}${td('',`<button class="btn sm sec" onclick="event.stopPropagation();${ab}">Editar</button>`)}</tr>`}).join('')}
function pr19Filtros(){const f=P19_F,ent=`onkeydown="if(event.key==='Enter')pr19Pesquisar()"`;
 return `<div class="filters pr19-filtros" style="flex-wrap:wrap;gap:8px">
 <div class="inwrap" style="flex:2 1 200px">${LUPA}<input class="in" id="pr19Nome" placeholder="Nome do procedimento ou exame" value="${esc(f.nome)}" aria-label="Filtrar por nome" ${ent}></div>
 <input class="in mono" id="pr19Cod" style="flex:1 1 130px" placeholder="Código" value="${esc(f.cod)}" aria-label="Filtrar por código" ${ent}>
 <select class="in" id="pr19Grupo" style="flex:1 1 150px" aria-label="Filtrar por grupo" onchange="pr19GrupoMuda()"><option value="">Todos os grupos</option>${Object.keys(PR_GRUPOS).map(g=>`<option value="${esc(g)}" ${f.grupo===g?'selected':''}>${esc(g)}</option>`).join('')}</select>
 <select class="in" id="pr19Sub" style="flex:1 1 150px" aria-label="Filtrar por subgrupo">${pr19SubOpts(f.grupo)}</select>
 <select class="in" id="pr19St" style="flex:1 1 140px" aria-label="Filtrar por situação">${[['ativos','Ativos'],['inativos','Inativos'],['todos','Ativos e inativos']].map(([k,t])=>`<option value="${k}" ${f.st===k?'selected':''}>${t}</option>`).join('')}</select>
 <button class="btn" onclick="pr19Pesquisar()">Pesquisar</button><button class="btn ghost" onclick="pr19Limpar()">Limpar</button></div>`}
const pr19Val=id=>{const e=typeof document!=='undefined'&&document.getElementById(id);return e&&typeof e.value==='string'?e.value:null};
function pr19LerFiltros(){[['nome','pr19Nome'],['cod','pr19Cod'],['grupo','pr19Grupo'],['sub','pr19Sub'],['st','pr19St']].forEach(([k,id])=>{const v=pr19Val(id);if(v!==null&&(v!==''||k!=='st'))P19_F[k]=v})}
function pr19GrupoMuda(){pr19LerFiltros();if(P19_F.sub&&!pr19Subs(P19_F.grupo).includes(P19_F.sub))P19_F.sub='';const s=typeof document!=='undefined'&&document.getElementById('pr19Sub');if(s)s.innerHTML=pr19SubOpts(P19_F.grupo)}
function pr19Pesquisar(){pr19LerFiltros();P19_F.ok=true;reView()}
function pr19Limpar(){P19_F={nome:'',cod:'',grupo:'',sub:'',st:'ativos',ok:false};reView()}

/* ---------- Tela Procedimentos: notas 558, 562, 563 (cabeçalho) e 586 a 591 (colunas) ---------- */
{const _v=VIEWS.procedimentos;VIEWS.procedimentos=function(){const h=_v.apply(this,arguments);
 const i=h.indexOf('<div class="filters">'),j=h.indexOf('</tbody></table></div>',i);if(i<0||j<0)return h;
 const cab=h.slice(0,i).replace(/<p style="color:var\(--fg2\);margin-top:4px">[\s\S]*?<\/p>/,'')/* 558 */
  .replace(/<button class="rules"[^>]*>[\s\S]*?<\/button>/,'')/* 562 */
  .replace(/<a class="btn sec" href="#exames"[^>]*>[\s\S]*?<\/a>/,'');/* 563 */
 return `${cab}${pr19Filtros()}
<div class="tablewrap"><table class="at-table"><thead><tr><th>Código TUSS</th><th>Procedimento</th><th>Grupo</th><th>Subgrupo</th><th>Situação</th><th></th></tr></thead><tbody id="pr19Body">${pr19Linhas()}</tbody></table></div>${P19_F.ok?`<p class="tl" style="margin-top:8px">${pr19Lista().length} resultado(s). Toque na linha para ver e editar o preparo, os planos vinculados e o valor em cada um.</p>`:''}${h.slice(j+'</tbody></table></div>'.length)}`}}

/* Inativo não aparece no Novo atendimento nem no orçamento */
if(typeof r17Disp==='function'){const _d=r17Disp;r17Disp=function(c){if(PR_CFG[c]&&PR_CFG[c].inativo)return false;return _d.apply(this,arguments)}}

/* ---------- Janela do procedimento: notas 571/574 (sem duração), 580/581 (caixa alta), 584 (dependente), 589 (planos e valores), ativo ---------- */
const pr19Caixa=s=>String(s??'').toLocaleUpperCase('pt-BR');
function pr19CaixaIn(el){if(!el)return;const v=pr19Caixa(el.value);if(v===el.value)return;const p=el.selectionStart;el.value=v;try{if(p!=null)el.setSelectionRange(p,p)}catch(e){}}
const P19_CAIXA=' oninput="pr19CaixaIn(this)" style="text-transform:uppercase" autocapitalize="characters"';
function pr19Vinculos(c){const l=c?prConvs(c).map(t=>[t,prValor(c,t)]):[];
 return `<div class="pr19-vinc" style="margin:14px 0 4px"><h4 style="margin:0 0 6px">Planos vinculados e valores</h4>${l.length?`<div class="tablewrap"><table><thead><tr><th>Plano</th><th style="text-align:right">Valor</th></tr></thead><tbody>${l.map(([t,v])=>`<tr><td>${esc(t)}</td><td style="text-align:right">${v?fmt(v):'<span class="tl">sem valor</span>'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="tl">Nenhum plano vinculado ainda. Marque abaixo onde o procedimento aparece e informe o valor.</p>'}</div>`}
function pr19Form(h,c){const g=c&&PR_CFG[c]?PR_CFG[c]:{};
 h=h.replace(/(<input class="in" id="prN")/,'$1'+P19_CAIXA).replace(/(<input class="in mono" id="prC")/,'$1'+P19_CAIXA)
  .replace(/<div class="field"><label for="prD">Duração \(min\)<\/label><input class="in" id="prD" type="number" value="([^"]*)"><\/div>/,'<input type="hidden" id="prD" value="$1">')
  .replace(/(<input type="checkbox" id="prDep"[^>]*>)Procedimento médico dependente <span class="tipicon"[\s\S]*?<\/span><\/span><\/label>/,
   `$1Procedimento médico dependente: precisa de um profissional na agenda e gera uma ficha</label>
 <p class="tl pr19-dep" style="margin:2px 0 0 26px">Marque quando o procedimento é feito ou laudado por um profissional (médico). Ele só pode ser agendado na agenda de um profissional, a recepção é obrigada a escolher esse profissional no atendimento e, ao atender, é gerada a ficha do paciente para ele.</p>
 <label class="check" style="margin-top:8px"><input type="checkbox" id="pr19Ativo" ${g.inativo?'':'checked'}>Ativo (desmarque para tirar o procedimento do Novo atendimento e dos orçamentos, sem apagar o histórico)</label>`);
 const k=h.indexOf('<h4 style="margin:14px 0 6px">Convênios em que aparece');return k>0?h.slice(0,k)+pr19Vinculos(c)+h.slice(k):h}
{const _f=clPrcForm;clPrcForm=function(c){const _om=openModal;openModal=function(h,cls){return _om(pr19Form(h,c),cls)};try{return _f.apply(this,arguments)}finally{openModal=_om}}}
{const _s=prSalvar;prSalvar=function(c){const d=typeof document!=='undefined'?document:null,n=d&&d.getElementById('prN'),k=d&&d.getElementById('prC'),at=d&&d.getElementById('pr19Ativo');
 if(n&&typeof n.value==='string')n.value=pr19Caixa(n.value).trim();if(k&&typeof k.value==='string')k.value=pr19Caixa(k.value).trim();
 const cod=c||String(k&&k.value||'').trim(),ativo=at&&typeof at.checked==='boolean'?at.checked:null;
 const _cm=closeModal;closeModal=function(){if(ativo!==null&&cod)prCfg(cod).inativo=!ativo;return _cm.apply(this,arguments)};try{return _s.apply(this,arguments)}finally{closeModal=_cm}}}

/* ---------- Nota 589 nos detalhes: a aba de preço mostra os planos vinculados e o valor de cada um ---------- */
{const _pv=clPrcVer;clPrcVer=function(c,aba){const _od=openDrawer;openDrawer=function(t,h){h=h.replace('>Preço por tabela</button>','>Planos e valores</button>');
  if(aba==='precos')h=h.replace(/<div style="margin-top:10px">[\s\S]*<\/div><div class="row" style="margin-top:12px">/,`<div style="margin-top:10px">${pr19Vinculos(c)}<p class="tl" style="margin-top:8px">Para mudar, toque em Editar. O valor novo vale para os próximos atendimentos.</p></div><div class="row" style="margin-top:12px">`);
  return _od(t,h)};try{return _pv.apply(this,arguments)}finally{openDrawer=_od}}}
