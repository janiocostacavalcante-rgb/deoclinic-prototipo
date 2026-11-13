/* Rodada 20 · procedimentos */
/* ==========================================================================
   Anotações 616 a 630 (Procedimentos) e 642 (Plano).
   Fica depois dos arquivos da rodada 19: só acrescenta funções e embrulha as que já existem.
   ========================================================================== */

const pr20Esc=s=>typeof esc==='function'?esc(s):String(s??'');
const pr20Doc=()=>typeof document!=='undefined'?document:null;
const pr20El=id=>{const d=pr20Doc();try{return d&&d.getElementById?d.getElementById(id):null}catch(e){return null}};

/* ---------- Nota 625: inativar esconde de todas as listagens; reativar devolve tudo como era ----------
   Nada é apagado. O item sai das listas PROCEDIMENTOS/EXAMES (de onde saem Novo atendimento, agenda, orçamento,
   procedimentos do plano, guia de exames etc.) e fica guardado em P20_GUARDA com a posição original.
   Planos, valores (PR_VAL), preparo, grupo e questionário (PR_CFG) e o mapa EX ficam intactos.
   A busca por código (PROC e EXAMES.find) continua achando o item escondido, para o histórico mostrar o nome. */
const P20_GUARDA={};/* P20_GUARDA[codigo] = {lista:'PROCEDIMENTOS'|'EXAMES', idx, obj} */
const pr20Lista=k=>k==='PROCEDIMENTOS'?(typeof PROCEDIMENTOS!=='undefined'?PROCEDIMENTOS:null):(typeof EXAMES!=='undefined'?EXAMES:null);
const pr20Guardados=k=>Object.values(P20_GUARDA).filter(g=>g.lista===k).map(g=>g.obj);
['PROCEDIMENTOS','EXAMES'].forEach(k=>{const a=pr20Lista(k);if(!a||Object.prototype.hasOwnProperty.call(a,'find'))return;
 try{Object.defineProperty(a,'find',{value:function(f,t){const r=Array.prototype.find.call(this,f,t);return r!==undefined?r:pr20Guardados(k).find(f,t)},enumerable:false,writable:true,configurable:true})}catch(e){}});
const pr20Inativo=c=>!!((typeof PR_CFG!=='undefined'&&PR_CFG[c]&&PR_CFG[c].inativo)||P20_GUARDA[c]);
function pr20Esconde(c){if(P20_GUARDA[c])return;['PROCEDIMENTOS','EXAMES'].forEach(k=>{const a=pr20Lista(k);if(!a||P20_GUARDA[c])return;
 const i=a.findIndex(x=>x&&x.c===c);if(i>=0)P20_GUARDA[c]={lista:k,idx:i,obj:a.splice(i,1)[0]}})}
function pr20Mostra(c){const g=P20_GUARDA[c];if(!g)return;const a=pr20Lista(g.lista);delete P20_GUARDA[c];if(!a||a.some(x=>x&&x.c===c))return;a.splice(Math.min(g.idx,a.length),0,g.obj)}
/* O catálogo da tela Procedimentos continua mostrando os inativos (filtro Situação) */
if(typeof pr19Catalogo==='function'){const _cat=pr19Catalogo;pr19Catalogo=function(){const l=_cat.apply(this,arguments),vis=new Set(l.map(x=>x.c));
 Object.entries(P20_GUARDA).forEach(([c,g])=>{if(vis.has(c))return;const o=g.obj,cf=pr19Cfg(c);l.push({c,n:o.n,grupo:cf.grupo||o.tipo||'Laboratório',sub:cf.sub||'',ativo:false,lab:g.lista==='EXAMES'})});return l}}
const pr20Item=c=>typeof pr19Catalogo==='function'?pr19Catalogo().find(x=>x.c===c)||null:null;
const pr20Aud=t=>{try{if(typeof r17Aud==='function')r17Aud(t,{})}catch(e){}};
function pr20Inativar(c){const x=pr20Item(c);if(!x)return;
 modalOk('Inativar procedimento?',`<p><b>${pr20Esc(x.n)}</b> sai do Novo atendimento, da agenda, dos orçamentos e dos procedimentos do plano.</p><p class="tl" style="margin-top:6px">Nada é apagado: planos, valores, preparo e histórico ficam guardados e voltam do mesmo jeito ao reativar.</p>`,'Inativar',`pr20InatOk('${pr20Esc(c)}')`,'danger')}
function pr20InatOk(c){const x=pr20Item(c);if(!x)return;prCfg(c).inativo=true;pr20Esconde(c);pr20Aud(`Procedimento inativado: ${x.n} (${c})`);
 if(typeof closeModal==='function')closeModal();if(typeof location!=='undefined'&&location.hash==='#procedimentos')reView();toast('Procedimento inativado. Para ver de novo, filtre por Inativos.')}
function pr20Reativar(c){const x=pr20Item(c);if(!x)return;prCfg(c).inativo=false;pr20Mostra(c);pr20Aud(`Procedimento reativado: ${x.n} (${c})`);
 if(typeof closeModal==='function')closeModal();if(typeof location!=='undefined'&&location.hash==='#procedimentos')reView();toast('Procedimento reativado, com os mesmos planos e valores de antes')}

/* ---------- Notas 616 e 617: colunas Procedimento, Código TUSS, Grupo e Subgrupo, centralizadas e sem cortes ---------- */
const P20_TH='<thead><tr><th>Procedimento</th><th>Código TUSS</th><th>Grupo</th><th>Subgrupo</th></tr></thead>';
pr19Linhas=function(){if(!P19_F.ok)return vazioLinha(4,'Faça uma pesquisa','Preencha um ou mais filtros e toque em Pesquisar. Para ver todos, toque em Pesquisar sem filtro.');
 const l=pr19Lista();if(!l.length)return vazioLinha(4,'Nenhum procedimento encontrado','Mude os filtros e pesquise de novo.');
 return l.map(x=>`<tr style="cursor:pointer" onclick="pr20Acoes('${pr20Esc(x.c)}')">${td('Procedimento',pr20Esc(x.n))}${td('Código TUSS',`<span class="mono">${pr20Esc(x.c)}</span>`)}${td('Grupo',pr20Esc(x.grupo))}${td('Subgrupo',x.sub?pr20Esc(x.sub):'<span class="tl">sem subgrupo</span>')}</tr>`).join('')};
/* Ao clicar: situação e as opções Editar, Inativar ou Reativar */
function pr20Acoes(c){const x=pr20Item(c);if(!x)return;const ab=x.lab?`exForm('${pr20Esc(c)}')`:`clPrcForm('${pr20Esc(c)}')`;
 openModal(`${mh(pr20Esc(x.n))}<div class="mb pr20-acoes">${kvs([['Código TUSS',`<span class="mono">${pr20Esc(x.c)}</span>`],['Grupo',pr20Esc(x.grupo)],['Subgrupo',x.sub?pr20Esc(x.sub):'sem subgrupo'],['Situação',x.ativo?'<span class="badge ok">Ativo</span>':'<span class="badge neutral">Inativo</span>']])}
 <p class="tl" style="margin-top:10px">${x.ativo?'Inativar tira o procedimento de todas as listas, sem apagar nada.':'Este procedimento está inativo. Reativar devolve o procedimento a todas as listas, com os planos e valores de antes.'}</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="closeModal();${ab}">Editar</button>${x.ativo?`<button class="btn danger" onclick="pr20Inativar('${pr20Esc(c)}')">Inativar</button>`:`<button class="btn" onclick="pr20Reativar('${pr20Esc(c)}')">Reativar</button>`}</div>`)}
{const _v=VIEWS.procedimentos;VIEWS.procedimentos=function(){let h=_v.apply(this,arguments);
 h=h.replace(/<table class="at-table"><thead><tr><th>Código TUSS<\/th>[\s\S]*?<\/thead>/,`<table class="at-table pr20-tab">${P20_TH}`)
  .replace(/(<button class="btn" onclick="clPrcForm\(\)")\s+data-tip="[^"]*"/,'$1')/* 621 */
  .replace(/Toque na linha para ver e editar o preparo, os planos vinculados e o valor em cada um\./,'Toque no procedimento para ver a situação e as opções Editar, Inativar ou Reativar.');
 return h}}
/* 617: sem reticências na tabela e nos filtros */
try{const d=pr20Doc();if(d&&d.createElement&&d.head&&d.head.appendChild){const st=d.createElement('style');st.textContent=
 '.pr20-tab th,.pr20-tab td{text-align:center!important;vertical-align:middle}'+
 '.pr20-tab td,.pr20-tab td *{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;max-width:none!important;overflow-wrap:anywhere}'+
 '.pr20-tab td.col-nome{min-width:220px}.pr20-tab td.col-nome .two,.pr20-tab td.col-nome>span{display:inline}'+
 '.pr19-filtros select.in{flex:1 0 auto!important;width:auto;min-width:max-content;text-overflow:clip}.pr19-filtros .inwrap{min-width:280px}.pr19-filtros input.in{text-overflow:clip}';
 d.head.appendChild(st)}}catch(e){}

/* ---------- Janela do procedimento: notas 622 a 629 ---------- */
function pr20Situacao(c){if(!c)return '';const x=pr20Item(c),at=x?x.ativo:!pr20Inativo(c);
 return `<div class="pr20-sit" style="margin-top:18px;padding-top:12px;border-top:1px solid var(--border)"><h4 style="margin:0 0 6px">Situação</h4>
 <div class="row" style="gap:10px;align-items:center;flex-wrap:wrap">${at?'<span class="badge ok">Ativo</span>':'<span class="badge neutral">Inativo</span>'}<span class="tl" style="flex:1 1 220px">${at?'Inativar tira o procedimento de todas as listas. Nada é apagado.':'Reativar devolve o procedimento a todas as listas, com os planos e valores de antes.'}</span>
 ${at?`<button class="btn sm danger" type="button" onclick="pr20Inativar('${pr20Esc(c)}')">Inativar procedimento</button>`:`<button class="btn sm" type="button" onclick="pr20Reativar('${pr20Esc(c)}')">Reativar procedimento</button>`}</div></div>`}
function pr20Form(h,c){h=h.replace(/\s?<span class="tipicon"[^>]*>i<span class="tip">[\s\S]*?<\/span><\/span>/g,'')/* 622 */
  .replace(/\sdata-tip="[^"]*"/g,'')
  .replace(/Procedimento médico dependente: precisa de um profissional na agenda e gera uma ficha|Procedimento médico dependente\s*(?=<\/label>)/,'Atendimento com profissional')/* 623 */
  .replace(/\s*<p class="tl pr19-dep"[^>]*>[\s\S]*?<\/p>/,'')/* 624 */
  .replace(/\s*<label class="check"[^>]*><input type="checkbox" id="pr19Ativo"[^>]*>[\s\S]*?<\/label>/,'')/* 625: sai daqui e vai para o fim */
  .replace(/<input class="in" id="r17Prep"/,'<input class="in" id="r17Prep"'+P19_CAIXA)/* 626 */
  .replace(/\s*<div class="pr19-vinc"[\s\S]*?<\/h4>(?:<div class="tablewrap">[\s\S]*?<\/table><\/div>|<p class="tl">[\s\S]*?<\/p>)<\/div>/,'');/* 627 a 629 */
 const k=h.lastIndexOf('</div><div class="mf">');return k>0?h.slice(0,k)+pr20Situacao(c)+h.slice(k):h}
{const _f=clPrcForm;clPrcForm=function(c){const _om=openModal,_vi=pr19Vinculos;openModal=function(h,cls){return _om(pr20Form(h,c),cls)};pr19Vinculos=()=>'';
 try{return _f.apply(this,arguments)}finally{openModal=_om;pr19Vinculos=_vi}}}
{const _s=prSalvar;prSalvar=function(c){const p=pr20El('r17Prep'),k=pr20El('prC');
 if(p&&typeof p.value==='string')p.value=pr19Caixa(p.value);
 const cod=String(k&&typeof k.value==='string'?k.value:'').trim().toLocaleUpperCase('pt-BR');
 if(!c&&cod&&P20_GUARDA[cod]){toast('Já existe um procedimento inativo com este código. Reative-o em Procedimentos (filtro Inativos).','warn');return}
 return _s.apply(this,arguments)}}

/* ---------- Nota 630: atalho para Profissionais logo abaixo de Procedimento ----------
   A tela é a mesma de Cadastros > Profissionais (rodada 19). O atalho só leva até lá, sem criar outra tela. */
try{const g=MENU.find(x=>x[0]==='Procedimentos');if(g&&!g[1].some(i=>i[0]==='proc-profissionais')){const i=g[1].findIndex(x=>x[0]==='procedimentos');g[1].splice(i>=0?i+1:0,0,['proc-profissionais','Profissionais'])}
 NAMES['proc-profissionais']='Profissionais';
 if(typeof DESC!=='undefined')DESC['proc-profissionais']='Atalho para o cadastro de Profissionais, que fica em Cadastros.'}catch(e){}
VIEWS['proc-profissionais']=function(){try{if(typeof HIST!=='undefined'&&HIST[HIST.length-1]==='proc-profissionais')HIST.pop()}catch(e){}
 try{if(typeof location!=='undefined')setTimeout(()=>{if(location.hash!=='#proc-profissionais')return;if(typeof location.replace==='function')location.replace('#profissionais');else location.hash='#profissionais'},0)}catch(e){}
 return typeof VIEWS.profissionais==='function'?VIEWS.profissionais():''};

/* ---------- Nota 642: criar um plano do zero com a nomenclatura e a marca "recebe em caixa para faturar a ficha" ----------
   Tipo e fator já vêm preenchidos (Empresa ou parceiro, 100%), então basta o nome e a marca.
   Tipo e registro na ANS continuam na janela: a guia TISS só pode sair para operadora com registro na ANS (padrão TISS, RN ANS 501/2022). */
const P20_CVCX={'Particular':true};
const pr20CvCaixa=n=>!!P20_CVCX[n];
if(typeof r18rCvForm==='function'){const _f=r18rCvForm;r18rCvForm=function(n){const _om=openModal;openModal=function(h,cls){
  h=h.replace(/(<label for="r18rCvN">)Nome( <span class="req">\*<\/span>)/,'$1Nomenclatura (nome do plano)$2');
  const cx=`<label class="check pr20-cvcx" style="margin-top:12px"><input type="checkbox" id="pr20CvCx" ${n&&pr20CvCaixa(n)?'checked':''}>Recebe em caixa para faturar a ficha</label>
 <p class="tl" style="margin:2px 0 0 26px">Marque quando o paciente paga no caixa da recepção (valor ou parte dele) antes de a ficha ser faturada. Desmarcado, a ficha vai direto para o faturamento do plano.</p>`;
  const k=h.lastIndexOf('</div></div>');if(k>0)h=h.slice(0,k)+'</div>'+cx+h.slice(k+'</div>'.length);
  return _om(h,cls)};try{return _f.apply(this,arguments)}finally{openModal=_om}}}
if(typeof r18rCvSalvar==='function'){const _s=r18rCvSalvar;r18rCvSalvar=function(ant){const e=pr20El('r18rCvN'),x=pr20El('pr20CvCx');
 const n=String(e&&typeof e.value==='string'?e.value:'').trim().replace(/\s+/g,' '),cx=!!(x&&x.checked===true);
 const _cm=closeModal;closeModal=function(){if(n){if(ant&&ant!==n)delete P20_CVCX[ant];P20_CVCX[n]=cx}return _cm.apply(this,arguments)};
 try{return _s.apply(this,arguments)}finally{closeModal=_cm}}}
{const _v=VIEWS.convenios;VIEWS.convenios=function(){let h=_v.apply(this,arguments);const nomes={};(typeof CL_TABS!=='undefined'?CL_TABS:[]).forEach(t=>{nomes[pr20Esc(t)]=t});
 h=h.replace('<th>Tipo</th>','<th>Tipo</th><th>Recebe em caixa</th>')
  .replace(/(<td data-l="Convênio"><b>([^<]*)<\/b><\/td><td data-l="Tipo">[^<]*<\/td>)/g,(m,a,nm)=>a+td('Recebe em caixa',pr20CvCaixa(nomes[nm]!==undefined?nomes[nm]:nm)?'<span class="badge ok">Sim</span>':'<span class="badge neutral">Não</span>'))
  .replace(/(<p class="tl" style="margin-top:8px">A guia TISS)/,'<p class="tl" style="margin-top:8px">Para criar um plano novo basta a nomenclatura e marcar se ele recebe em caixa para faturar a ficha. Tipo e fator já vêm preenchidos e podem ser mudados.</p>$1');
 return h}}
