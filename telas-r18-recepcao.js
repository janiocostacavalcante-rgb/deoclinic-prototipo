/* Rodada 18 (12/11/2026) · recepcao */
/* ==========================================================================
   Anotações 505 a 538 da Recepção: Procedimentos, convênios, Pacientes, Novo atendimento, Início, Caixa, Financeiro e Fidelidade.
   Fica depois dos arquivos da rodada 17: só acrescenta funções e embrulha as que já existem.
   ========================================================================== */

/* ---------- Convênios: PARTICULAR, DEOVITA, DEOVITA 100% e JCC (nota 507) ---------- */
/* Os exemplos antigos passam para os nomes novos (dados fictícios, só em memória):
   Unimed Fortaleza, Unimed e Plano DeoVita -> DEOVITA; Hapvida -> DEOVITA 100%; Bradesco Saúde, Bradesco (convênio), SulAmérica e Camed -> JCC.
   "Particular" continua com esse nome interno: o sistema inteiro usa a palavra para a regra de quem paga do bolso. */
const R18R_CONVS=['DEOVITA','DEOVITA 100%','JCC'];
const R18R_CV={'Unimed Fortaleza':'DEOVITA','Unimed':'DEOVITA','Plano DeoVita':'DEOVITA','Hapvida':'DEOVITA 100%','Bradesco Saúde':'JCC','Bradesco':'JCC','SulAmérica':'JCC','Camed':'JCC'};
const R18R_CV_RE=/Unimed Fortaleza|Bradesco Saúde|SulAmérica|Plano DeoVita|Hapvida|Camed|\bUnimed\b/g;
const r18rTxt=s=>typeof s==='string'?s.replace(R18R_CV_RE,m=>R18R_CV[m]):s;
/* Troca nomes em qualquer estrutura de dados: valor igual ao nome antigo, texto que cita o nome e chave de mapa (na colisão fica o primeiro, ou soma se pedido) */
function r18rRen(v,mapa,txt,soma,vis){vis=vis||new Set();if(!v||typeof v!=='object'||vis.has(v))return v;if(typeof Node!=='undefined'&&v instanceof Node)return v;vis.add(v);
 const tr=s=>mapa[s]!==undefined?mapa[s]:txt?txt(s):s;
 if(Array.isArray(v)){for(let i=0;i<v.length;i++){if(typeof v[i]==='string')v[i]=tr(v[i]);else r18rRen(v[i],mapa,txt,soma,vis)}return v}
 const pr=Object.getPrototypeOf(v);if(pr!==Object.prototype&&pr!==null)return v;
 Object.keys(v).forEach(k=>{const x=v[k];if(typeof x==='string')v[k]=tr(x);else if(x&&typeof x==='object')r18rRen(x,mapa,txt,soma,vis);
  const nk=mapa[k];if(nk===undefined||nk===k)return;if(!(nk in v))v[nk]=v[k];else if(soma&&typeof v[nk]==='number'&&typeof v[k]==='number')v[nk]+=v[k];delete v[k]});return v}
const r18rGlob=n=>{try{return (0,eval)(n)}catch(e){return undefined}};
const R18R_DADOS=['CONVENIOS','CL_TABS','CL_FATOR','AVISOS','CAIXAS','CX_RECEB','NAO_FAT','LP_PAC','PS_DEMO','FN_PROJ','CONTAS','PR_META','AG_CLIN','CL_AG_EXTRA','CL_LINHA','CL_LEITOS','PZ_AG','IM_EX','IM_GLOSAS','F2_AUD','F2_TIT','F2_PROD','F2_TABS','F2_PRECO','F2_GLMED','F2_LOTES','F2_IA','F2_GL','PDA','RLP_PLANOS','TAB_CONV','PRECOS','TABS_PRECO','PR_VAL','R17CV','FN_CONTATO','TS_GUIAS','RC','ORCS','ATENDS','PACIENTES','SAUDA'];
function r18rRenTudo(mapa,txt){(r18rGlob('CAIXAS')||[]).forEach(x=>{if(x&&x.conv)r18rRen(x.conv,mapa,null,true)});R18R_DADOS.forEach(n=>{const o=r18rGlob(n);if(o&&typeof o==='object')r18rRen(o,mapa,txt)})}
r18rRenTudo(R18R_CV,r18rTxt);
/* Listas globais na ordem pedida (o mesmo array: quem já guardou a referência, como CONV_TAB, vê os nomes novos) */
CONVENIOS.splice(0,CONVENIOS.length,...R18R_CONVS);CL_TABS.splice(0,CL_TABS.length,'Particular',...R18R_CONVS);
if(typeof F2_TABS!=='undefined')F2_TABS.splice(0,F2_TABS.length,'Particular',...R18R_CONVS);
if(typeof TABS_PRECO!=='undefined'){const vis=new Set(),u=TABS_PRECO.filter(([t])=>!vis.has(t)&&vis.add(t));TABS_PRECO.splice(0,TABS_PRECO.length,...u);
 R18R_CONVS.forEach((t,i)=>{if(!TABS_PRECO.some(([x])=>x===t))TABS_PRECO.splice(1+i,0,[t,t])})}
Object.assign(CL_FATOR,{'DEOVITA':CL_FATOR.DEOVITA||.86,'DEOVITA 100%':CL_FATOR['DEOVITA 100%']||.68,'JCC':CL_FATOR.JCC||.92});
if(typeof TAB_CONV!=='undefined')R18R_CONVS.forEach(t=>{if(TAB_CONV[t]==null)TAB_CONV[t]=CL_FATOR[t]});
if(typeof PR_META!=='undefined')R18R_CONVS.forEach(t=>{PR_META[t]=Object.assign(PR_META[t]||{vig:'01/11/2026',ver:1,por:'Sérgio'},{n:t,sub:'convênio',tipo:'Convênio'})});
if(typeof R17CV!=='undefined'&&!R18R_CONVS.includes(R17CV.conv))R17CV.conv='DEOVITA';
/* Consulta de convênio com valor fechado, agora pelos nomes novos */
const R18R_CONSULTA={'DEOVITA':110,'DEOVITA 100%':78,'JCC':125};
clPreco=function(c,tab){const p=PROC(c);if(!p)return 0;if(tab==='Particular'||!tab)return p.preco;if(p.tipo==='Consulta'&&p.preco)return R18R_CONSULTA[tab]||p.preco;return Math.round(p.preco*(CL_FATOR[tab]||1))};
/* Textos fixos das telas, janelas e gavetas (lotes, glosas, relatórios) também com os nomes novos */
const r18rTxtHtml=h=>typeof h==='string'?r18rTxt(h).replace(/>Bradesco</g,'>JCC<'):h;
function r18rEmbrulhaViews(){Object.keys(VIEWS).forEach(k=>{const f=VIEWS[k];if(typeof f!=='function'||f.r18)return;const g=function(){return r18rTxtHtml(f.apply(this,arguments))};g.r18=1;VIEWS[k]=g})}
r18rEmbrulhaViews();try{window.addEventListener('load',r18rEmbrulhaViews)}catch(e){}
{const _om=openModal;openModal=function(h,cls){return _om.call(this,r18rTxtHtml(h),cls)}}
{const _od=openDrawer;openDrawer=function(t,h){return _od.call(this,r18rTxtHtml(t),r18rTxtHtml(h))}}

/* Cadastro dos convênios (tela "Convênio" do módulo Procedimentos, nota 535).
   Guia TISS só para operadora de plano de saúde com registro na ANS (padrão TISS, RN ANS 501/2022); plano próprio da clínica não é plano de saúde (Lei 9.656/1998) e não gera guia. */
const R18R_CVTIPO=[['particular','Particular (paga do bolso)'],['proprio','Plano próprio DeoVita (fidelidade)'],['operadora','Operadora de plano de saúde (registro ANS)'],['empresa','Empresa ou parceiro']];
const R18R_CVCAD={'Particular':{tipo:'particular',ans:''},'DEOVITA':{tipo:'proprio',ans:''},'DEOVITA 100%':{tipo:'proprio',ans:''},'JCC':{tipo:'empresa',ans:''}};
const r18rCvCad=n=>R18R_CVCAD[n]||(R18R_CVCAD[n]={tipo:'empresa',ans:''});
const r18rCvTiss=n=>{const c=r18rCvCad(n);return c.tipo==='operadora'&&/^\d{6}$/.test(c.ans||'')};
const r18rCvCobre=n=>typeof r17CvLista==='function'?r17CvLista().filter(c=>r17Disp(c,n)).length:0;
VIEWS.convenios=()=>`${pageHead('','Convênio','',`<button class="btn" onclick="r18rCvForm()">${I.plus} Novo convênio</button>`)}
 <div class="tablewrap"><table class="at-table"><thead><tr><th>Convênio</th><th>Tipo</th><th>Registro na ANS</th><th>Guia TISS</th><th>Fator da tabela</th><th>Cobertos</th><th></th></tr></thead><tbody>${CL_TABS.map(n=>{const c=r18rCvCad(n);return `<tr>${td('Convênio',`<b>${esc(n)}</b>`)}${td('Tipo',esc((R18R_CVTIPO.find(t=>t[0]===c.tipo)||['',''])[1]))}${td('Registro na ANS',c.ans?`<span class="mono">${esc(c.ans)}</span>`:'<span class="tl">não se aplica</span>')}${td('Guia TISS',r18rCvTiss(n)?'<span class="badge ok">Sim</span>':'<span class="badge neutral">Não</span>')}${td('Fator da tabela',n==='Particular'?'<span class="tl">preço do cadastro</span>':String(Math.round((CL_FATOR[n]||1)*100))+'%')}${td('Cobertos',n==='Particular'?'<span class="tl">todos</span>':String(r18rCvCobre(n)))}${td('',n==='Particular'?'':`<button class="btn sm sec" onclick="r18rCvForm('${esc(n)}')">Editar</button>`)}</tr>`}).join('')}</tbody></table></div>
 <p class="tl" style="margin-top:8px">A guia TISS sai só para operadora de plano de saúde com registro na ANS. Plano próprio DeoVita e empresa seguem a tabela do convênio, sem guia.</p>`;
function r18rCvForm(n){const c=n?r18rCvCad(n):{tipo:'empresa',ans:''};openModal(`${mh(n?'Editar convênio':'Novo convênio')}<div class="mb"><div class="formgrid">
 <div class="field"><label for="r18rCvN">Nome <span class="req">*</span></label><input class="in" id="r18rCvN" value="${esc(n||'')}" autocomplete="off"></div>
 <div class="field"><label for="r18rCvT">Tipo <span class="req">*</span></label><select class="in" id="r18rCvT">${R18R_CVTIPO.filter(t=>t[0]!=='particular').map(([k,t])=>`<option value="${k}" ${c.tipo===k?'selected':''}>${t}</option>`).join('')}</select></div>
 <div class="field"><label for="r18rCvA">Registro na ANS ${info('Seis números. Obrigatório só para operadora de plano de saúde; é ele que libera a guia TISS.')}</label><input class="in mono" id="r18rCvA" inputmode="numeric" maxlength="6" value="${esc(c.ans||'')}"></div>
 <div class="field"><label for="r18rCvF">Fator da tabela (%) ${info('Percentual sobre o preço particular. Ex.: 86 = 86% do preço do cadastro. O valor de cada item pode ser ajustado em Procedimentos Convênio.')}</label><input class="in" id="r18rCvF" type="number" min="1" max="200" value="${n?Math.round((CL_FATOR[n]||1)*100):100}"></div></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="r18rCvSalvar(${n?`'${esc(n)}'`:''})">Salvar</button></div>`)}
function r18rCvSalvar(ant){const v=id=>(($('#'+id)||{}).value||'').trim(),n=v('r18rCvN').replace(/\s+/g,' '),tipo=v('r18rCvT')||'empresa',ans=soDig(v('r18rCvA')),f=+v('r18rCvF')||100;
 if(!n){toast('Informe o nome do convênio','warn');return}if(semAc(n)===semAc('Particular')){toast('Particular já existe e não pode ser repetido','warn');return}
 if(CL_TABS.some(t=>t!==ant&&semAc(t)===semAc(n))){toast('Já existe um convênio com esse nome','warn');return}
 if(tipo==='operadora'&&ans.length!==6){toast('Operadora de plano de saúde precisa do registro na ANS (6 números)','warn');return}
 if(f<1||f>200){toast('O fator vai de 1% a 200%','warn');return}
 if(ant&&ant!==n){r18rRenTudo({[ant]:n},null);R18R_CVCAD[n]=R18R_CVCAD[ant];delete R18R_CVCAD[ant];delete CL_FATOR[ant];
  [typeof R17_EXCONV!=='undefined'?R17_EXCONV:null,typeof R17_CODCONV!=='undefined'?R17_CODCONV:null].forEach(o=>{if(o&&o[ant]){o[n]=o[ant];delete o[ant]}})}
 if(!ant){CONVENIOS.push(n);CL_TABS.push(n);if(typeof TABS_PRECO!=='undefined'&&!TABS_PRECO.some(([t])=>t===n))TABS_PRECO.push([n,n])}
 R18R_CVCAD[n]={tipo,ans:tipo==='operadora'?ans:''};CL_FATOR[n]=Math.round(f)/100;if(typeof TAB_CONV!=='undefined')TAB_CONV[n]=CL_FATOR[n];
 closeModal();reView();toast(ant?'Convênio salvo':'Convênio cadastrado')}

/* ---------- Grupo e Subgrupo dos procedimentos (nota 535): o mesmo cadastro que o formulário do procedimento já usa (PR_GRUPOS e prCfg) ---------- */
const r18rCods=()=>[...new Set([...PROCEDIMENTOS.map(p=>p.c),...Object.keys(PR_CFG)])];
const r18rDoGrupo=(g,s)=>r18rCods().filter(c=>prCfg(c).grupo===g&&(s===undefined||prCfg(c).sub===s));
const r18rNome=c=>typeof prqNome==='function'?prqNome(c):((PROC(c)||EX[c]||{}).n||c);
VIEWS['proc-grupos']=()=>`${pageHead('','Grupo','',`<button class="btn" onclick="r18rGrForm()">${I.plus} Novo grupo</button>`)}
 <div class="tablewrap"><table class="at-table"><thead><tr><th>Grupo</th><th>Subgrupos</th><th>Procedimentos</th><th></th></tr></thead><tbody>${Object.keys(PR_GRUPOS).map((k,i)=>`<tr>${td('Grupo',`<b>${esc(k)}</b>`)}${td('Subgrupos',PR_GRUPOS[k].length?esc(PR_GRUPOS[k].join(', ')):'<span class="tl">nenhum</span>')}${td('Procedimentos',String(r18rDoGrupo(k).length))}${td('',`<button class="btn sm sec" onclick="r18rGrForm(${i})">Editar</button>`)}</tr>`).join('')}</tbody></table></div>`;
function r18rGrForm(i){const k=i==null?'':Object.keys(PR_GRUPOS)[i];openModal(`${mh(k?'Editar grupo':'Novo grupo')}<div class="mb"><div class="field"><label for="r18rGrN">Nome do grupo <span class="req">*</span></label><input class="in" id="r18rGrN" value="${esc(k)}" autocomplete="off"></div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="r18rGrSalvar(${i==null?'':i})">Salvar</button></div>`)}
function r18rGrSalvar(i){const ks=Object.keys(PR_GRUPOS),k=i==null?'':ks[i],n=(($('#r18rGrN')||{}).value||'').trim().replace(/\s+/g,' ');if(!n){toast('Informe o nome do grupo','warn');return}
 if(ks.some(x=>x!==k&&semAc(x)===semAc(n))){toast('Já existe um grupo com esse nome','warn');return}
 if(!k)PR_GRUPOS[n]=[];else if(n!==k){const m={};ks.forEach(x=>{m[x===k?n:x]=PR_GRUPOS[x];delete PR_GRUPOS[x]});Object.assign(PR_GRUPOS,m);r18rCods().forEach(c=>{if(PR_CFG[c]&&PR_CFG[c].grupo===k)PR_CFG[c].grupo=n})}
 closeModal();reView();toast(k?'Grupo salvo':'Grupo cadastrado')}
const r18rSubs=()=>Object.keys(PR_GRUPOS).flatMap(g=>PR_GRUPOS[g].map(s=>[g,s]));
VIEWS['proc-subgrupos']=()=>{const l=r18rSubs();return `${pageHead('','Subgrupo','',`<button class="btn" onclick="r18rSgForm()">${I.plus} Novo subgrupo</button>`)}
 <div class="tablewrap"><table class="at-table"><thead><tr><th>Subgrupo</th><th>Grupo</th><th>Procedimentos</th><th></th></tr></thead><tbody>${l.length?l.map(([g,s],i)=>{const ps=r18rDoGrupo(g,s);return `<tr>${td('Subgrupo',`<b>${esc(s)}</b>`)}${td('Grupo',esc(g))}${td('Procedimentos',ps.length?esc(ps.map(r18rNome).join(', ')):'<span class="tl">nenhum</span>')}${td('',`<button class="btn sm sec" onclick="r18rSgForm(${i})">Editar</button>`)}</tr>`}).join(''):vazioLinha(4,'Nenhum subgrupo','Cadastre o primeiro.')}</tbody></table></div>`};
function r18rSgProcs(g,s){const l=r18rDoGrupo(g);return l.length?l.map(c=>`<label class="check"><input type="checkbox" id="r18rSp_${esc(c)}" ${s&&prCfg(c).sub===s?'checked':''}>${esc(r18rNome(c))} <span class="tl">· ${esc(c)}${prCfg(c).sub&&prCfg(c).sub!==s?' · hoje em '+esc(prCfg(c).sub):''}</span></label>`).join(''):'<p class="tl">Nenhum procedimento neste grupo.</p>'}
function r18rSgForm(i){const it=i==null?null:r18rSubs()[i],g=it?it[0]:Object.keys(PR_GRUPOS)[0],s=it?it[1]:'';openModal(`${mh(it?'Editar subgrupo':'Novo subgrupo')}<div class="mb"><div class="formgrid">
 <div class="field"><label for="r18rSgN">Nome do subgrupo <span class="req">*</span></label><input class="in" id="r18rSgN" value="${esc(s)}" autocomplete="off"></div>
 <div class="field"><label for="r18rSgG">Grupo <span class="req">*</span></label><select class="in" id="r18rSgG" ${it?'disabled':''} onchange="$('#r18rSgL').innerHTML=r18rSgProcs(this.value,'')">${Object.keys(PR_GRUPOS).map(k=>`<option ${k===g?'selected':''}>${esc(k)}</option>`).join('')}</select></div></div>
 <h4 style="margin:12px 0 6px">Procedimentos deste subgrupo</h4><div id="r18rSgL" class="r17-qlist">${r18rSgProcs(g,s)}</div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="r18rSgSalvar(${i==null?'':i})">Salvar</button></div>`,'wide')}
function r18rSgSalvar(i){const it=i==null?null:r18rSubs()[i],g=it?it[0]:(($('#r18rSgG')||{}).value||''),n=(($('#r18rSgN')||{}).value||'').trim().replace(/\s+/g,' ');
 if(!n){toast('Informe o nome do subgrupo','warn');return}if(!PR_GRUPOS[g]){toast('Escolha o grupo','warn');return}
 if(PR_GRUPOS[g].some(x=>x!==(it&&it[1])&&semAc(x)===semAc(n))){toast('Esse grupo já tem um subgrupo com esse nome','warn');return}
 if(it){const k=PR_GRUPOS[g].indexOf(it[1]);PR_GRUPOS[g][k]=n;r18rDoGrupo(g,it[1]).forEach(c=>{prCfg(c).sub=n})}else PR_GRUPOS[g].push(n);
 r18rDoGrupo(g).forEach(c=>{const e=document.getElementById('r18rSp_'+c);if(!e)return;if(e.checked)prCfg(c).sub=n;else if(prCfg(c).sub===n)prCfg(c).sub=''});
 closeModal();reView();toast(it?'Subgrupo salvo':'Subgrupo cadastrado')}
/* ---------- Menu Procedimentos na ordem pedida (nota 535); título e texto de Procedimentos Convênio (notas 505 e 506) ---------- */
{const g=MENU.find(x=>x[0]==='Procedimentos');if(g){const ordem=[['procedimentos','Procedimento'],['proc-grupos','Grupo'],['proc-subgrupos','Subgrupo'],['convenios','Convênio'],['procedimentos-convenio','Procedimentos Convênio']];
 const resto=g[1].filter(i=>!ordem.some(o=>o[0]===i[0]));g[1].splice(0,g[1].length,...ordem,...resto)}
 Object.assign(NAMES,{'procedimentos-convenio':'Procedimentos Convênio','proc-grupos':'Grupo','proc-subgrupos':'Subgrupo',convenios:'Convênio'});
 if(typeof DESC!=='undefined')Object.assign(DESC,{'proc-grupos':'Grupos dos procedimentos.','proc-subgrupos':'Subgrupos de cada grupo, com os procedimentos.',convenios:'Convênios aceitos, tipo, registro na ANS e fator da tabela.'})}
{const _v=VIEWS['procedimentos-convenio'];VIEWS['procedimentos-convenio']=function(){return _v.apply(this,arguments).replace('<h1>Procedimentos do convênio</h1>','<h1>PROCEDIMENTOS CONVÊNIO</h1>').replace(/<p class="tl" style="margin:0 0 10px">O que cada convênio cobre[\s\S]*?<\/p>/,'')}}

/* ---------- Pacientes: sem o link "Ficha completa e histórico" (nota 508) ---------- */
{const _pc=r17PacClique;r17PacClique=function(cpf){const _om=openModal;openModal=function(h,cls){return _om(String(h).replace(/<a href="#" class="tl" onclick="event\.preventDefault\(\);closeModal\(\);pacFicha\('[^']*'\)">Ficha completa e histórico<\/a>/,''),cls)};try{return _pc.apply(this,arguments)}finally{openModal=_om}}}

/* ---------- Novo atendimento ---------- */
/* Nota 509: "Editar cadastro" abre a edição dos dados do paciente (a mesma janela de Pacientes) e volta para o atendimento com os dados novos */
let R18R_NA_ED=null;
function r18rEditarCad(){if(!NA||!NA.pac)return;const p=NA.cpf&&!NA.semCpf?rcPacCpf(NA.cpf):null;
 R18R_NA_ED={cpf:p?p.cpf:''};if(p){rcPacEditar(p.cpf);return}
 rcPacEditar('',{n:NA.pac.n||'',dn:NA.pac.dn||'',sx:NA.pac.sx||'F',mae:NA.pac.mae||'',tel:NA.pac.tel||'',cpf:NA.semCpf?'':(NA.cpf||'')})}
{const _ps=rcPacSalvar;rcPacSalvar=function(){const ed=R18R_NA_ED,naTela=location.hash==='#novo-atendimento'&&NA&&NA.modo==='atendimento',el=document.getElementById('pfC'),c=mCPF(((el&&el.value)||'').trim());
 const r=_ps.apply(this,arguments);if(ed&&naTela&&!modalAberto()){const p=rcPacCpf(c)||(ed.cpf&&rcPacCpf(ed.cpf));R18R_NA_ED=null;if(p){Object.assign(NA.pac,p);NA.cpf=p.cpf;NA.semCpf=false;naRender()}}return r}}
{const _pk=naPacCard;naPacCard=function(){return _pk.apply(this,arguments).replace('onclick="NA.passo=1;naRender(true)">','onclick="r18rEditarCad()">')}}
/* Nota 523: o "Cancelar" vira "Voltar" e leva à listagem de pacientes */
{const _nv=naView;naView=function(){const h=_nv.apply(this,arguments);return NA&&NA.modo==='atendimento'&&!NA.sid?h.replace('<a class="btn ghost" href="#atendimentos">Cancelar</a>',`<a class="btn ghost" href="#pacientes">${BACK_SVG} Voltar</a>`):h}}
/* Nota 510: "Plano e pacote" só com o número do contrato e o plano, vindos da Fidelidade; sem contrato, "Sem plano de fidelidade" */
naPlCard=function(){if(!NA||NA.modo!=='atendimento'||!NA.pac||!NA.pac.n)return '';const ks=naPlContratos();
 return `<div class="card at-card" id="naPlano"><h3>Plano e pacote ${info('Vem do módulo Fidelidade: número do contrato e plano do paciente.')}</h3>${ks.length?`<div class="at-list">${ks.map(k=>`<div class="at-row"><div class="grow">Contrato <b class="mono">${esc(k.id)}</b><small>${k.tipo==='pacote'?'Pacote':'Plano'}: ${esc((plRef(k)||{n:'não encontrado'}).n)}</small></div></div>`).join('')}</div>`:'<p class="tl" style="margin:0">Sem plano de fidelidade</p>'}</div>`};

/* ---------- Início: botões ajustados e blocos que abrem e fecham (nota 511) ---------- */
let R18R_HOME={avisos:true},R18R_HOME_KEYS=[];try{const s=JSON.parse(localStorage.getItem('r18home')||'null');if(s&&typeof s==='object')R18R_HOME=s}catch(e){}
function r18rHomeTog(k,on){R18R_HOME[k]=!!on;try{localStorage.setItem('r18home',JSON.stringify(R18R_HOME))}catch(e){}}
function r18rHomeTodos(on){R18R_HOME_KEYS.forEach(k=>r18rHomeTog(k,on));try{document.querySelectorAll('#view details.r18r-box').forEach(d=>{d.open=on})}catch(e){}}
const r18rSlug=t=>semAc(t).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'bloco';
function r18rBox(k,tit,html){R18R_HOME_KEYS.push(k);return `<details class="r18r-box" data-k="${k}" ${R18R_HOME[k]?'open':''} ontoggle="r18rHomeTog('${k}',this.open)"><summary class="r18r-box-s"><span>${tit}</span><span class="r18r-box-d" aria-hidden="true"></span></summary><div class="r18r-box-c">${html}</div></details>`}
/* Filhos diretos de um trecho, contando só as tags div */
function r18rFilhos(h){const out=[];let d=0,ini=-1,m;const re=/<div\b|<\/div>/g;while((m=re.exec(h))){if(m[0]==='</div>'){d--;if(d===0&&ini>=0){out.push(h.slice(ini,m.index+6));ini=-1}}else{if(d===0)ini=m.index;d++}}return out}
function r18rHomeBoxes(h){R18R_HOME_KEYS=[];
 h=h.replace(/<section class="card at-card[^"]*" aria-label="([^"]+)"[\s\S]*?<\/section>/g,(sec,lab)=>/^Avisos/.test(lab)?r18rBox('avisos','Avisos do Dia',sec):/^Chat/.test(lab)?r18rBox('chat','Chat da equipe',sec):sec);
 const a=h.indexOf('<div class="home-painel">');if(a<0)return h;const tudo=r18rFilhos(h.slice(a))[0];if(!tudo)return h;
 const ab='<div class="home-painel">',fil=r18rFilhos(tudo.slice(ab.length,-6));let novo='',pend=[];
 const titulo=g=>{const hs=[...new Set([...g.join('').matchAll(/<h3[^>]*>([^<]+)/g)].map(x=>x[1].trim()).filter(Boolean))];const t=hs.slice(0,3).join(' · ')+(hs.length>3?' e mais':'');return /^<div class="fbar/.test(g[0])?'Indicadores do laboratório'+(t?' · '+t:''):t||'Mais informações'};
 const flush=()=>{if(!pend.length)return;const t=titulo(pend);novo+=r18rBox('p-'+r18rSlug(t),t,pend.join('\n'));pend=[]};
 fil.forEach(c=>{if(/^<div class="(home-painel-t|atl)\b/.test(c)){flush();novo+=c;return}pend.push(c);if(/<h[23][\s>]/.test(c))flush()});flush();
 return h.replace(tudo,()=>ab+novo+'</div>').replace('<div class="inicio-grid">',`<div class="r18r-home-bts"><button type="button" class="btn sm ghost" onclick="r18rHomeTodos(true)">Abrir todos</button><button type="button" class="btn sm ghost" onclick="r18rHomeTodos(false)">Fechar todos</button></div><div class="inicio-grid">`)}
{const _h=VIEWS.home;VIEWS.home=function(){return r18rHomeBoxes(_h.apply(this,arguments))}}

/* ---------- Caixa: relatório de repasse separado por médico ou unificado (nota 512) ---------- */
let CX_REP_MODO='sep',CX_REP_MED='';
function cxRepRel(){const todos=cxRepasseDia(),us=[...new Set(todos.map(x=>x.unid))],porU=CX_REP_UNID?todos.filter(x=>String(x.unid)===CX_REP_UNID):todos,meds=[...new Set(porU.map(x=>x.prof))];
 if(CX_REP_MED&&!meds.includes(CX_REP_MED))CX_REP_MED='';const uni=CX_REP_MODO==='uni',l=!uni&&CX_REP_MED?porU.filter(x=>x.prof===CX_REP_MED):porU;
 const tot=l.reduce((s,x)=>s+x.v,0),pago=l.filter(x=>cxRepPg(x.k)).reduce((s,x)=>s+x.v,0),hoje=dmy(iso(typeof HOJE!=='undefined'?HOJE:new Date())),pgTxt=p=>p?`<b>Pago às ${esc(p.h)}</b> por ${esc(p.op)} · dinheiro retirado de: <b>${esc(p.orig)}</b>`:'<b>Ainda não pago.</b> Ao pagar, registre no caixa para constar aqui de onde saiu o dinheiro.';
 const cab=(tit,sub)=>`<div class="row rel-cab" style="justify-content:space-between"><div><h2>${tit}</h2><span style="color:var(--fg2)">${sub}</span></div><img class="rel-logo" src="logo-deovita.png" alt="DeoVita Clínicas"></div>`;
 const unidTxt=CX_REP_UNID?esc(unidNome(+CX_REP_UNID)):'Todas as unidades';let corpo;
 if(uni){const ls=l.flatMap(x=>x.linhas).sort((a,b)=>PROF(a.prof).n.localeCompare(PROF(b.prof).n)||a.h.localeCompare(b.h));
  corpo=`<div class="r18r-pg">${cab('Repasse da produção médica · unificado',unidTxt+' · '+hoje)}
  <div class="meta"><span>Data: ${hoje}</span><span>Gerado às ${hhmm(new Date())} por ${esc(cxOperador())}</span><span>Médicos: ${l.length}</span><span>Pacientes: ${l.reduce((s,x)=>s+x.at,0)}</span></div>
  <h4 style="margin-top:12px">Resumo por médico</h4><div class="tablewrap" style="border-radius:12px"><table><thead><tr><th>Médico</th><th>Unidade</th><th>Pacientes</th><th>Pagamento</th><th style="text-align:right">Valor do repasse</th></tr></thead><tbody>${l.map(x=>{const p=cxRepPg(x.k);return `<tr data-det="0"><td>${esc(PROF(x.prof).n)}</td><td>${esc(unidNome(x.unid))}</td><td>${x.at}</td><td>${p?`Pago às ${esc(p.h)} · ${esc(p.orig)}`:'Ainda não pago'}</td><td style="text-align:right">${fmt(x.v)}</td></tr>`}).join('')||'<tr data-det="0"><td colspan="5">Nenhum médico com atendimento finalizado hoje.</td></tr>'}</tbody></table></div>
  <h4 style="margin-top:12px">Todos os atendimentos</h4><div class="tablewrap" style="border-radius:12px"><table><thead><tr><th>Hora</th><th>Médico</th><th>Paciente</th><th>Procedimento</th><th>Convênio</th><th style="text-align:right">Valor do repasse</th></tr></thead><tbody>${ls.map(y=>`<tr data-det="0"><td>${esc(y.h)}</td><td>${esc(PROF(y.prof).n)}</td><td>${esc(y.pac)}</td><td>${esc(y.itens.join(', '))}</td><td>${esc(y.conv)}</td><td style="text-align:right">${fmt(y.v)}</td></tr>`).join('')}</tbody></table></div>
  <div class="ass"><div>${esc(cxOperador())} · financeiro<br>Conferido por</div><div>Gestor(a) da unidade<br>Visto</div></div>
  <p class="tl" style="margin-top:6px">O relatório unificado é para a conferência do financeiro. Para o médico assinar o recebimento, use "Separado por médico": cada um vê só os próprios pacientes (LGPD, art. 6º, III).</p></div>`}
 else corpo=l.map(x=>{const p=cxRepPg(x.k),pr=PROF(x.prof);return `<div class="r18r-pg">${cab('Repasse da produção médica · '+esc(pr.n),esc(unidNome(x.unid))+' · '+hoje)}
  <div class="meta"><span>Data: ${hoje}</span><span>Gerado às ${hhmm(new Date())} por ${esc(cxOperador())}</span><span>${esc(pr.cons||'')}</span><span>Regra: ${esc(pr.repasse||'—')}</span></div>
  <div class="tablewrap" style="border-radius:12px"><table><thead><tr><th>Hora</th><th>Paciente</th><th>Procedimento</th><th>Convênio</th><th style="text-align:right">Valor do repasse</th></tr></thead><tbody>${x.linhas.map(y=>`<tr data-det="0"><td>${esc(y.h)}</td><td>${esc(y.pac)}</td><td>${esc(y.itens.join(', '))}</td><td>${esc(y.conv)}</td><td style="text-align:right">${fmt(y.v)}</td></tr>`).join('')}<tr data-det="0" style="font-weight:800"><td colspan="4">Total a pagar a ${esc(pr.n)}</td><td style="text-align:right">${fmt(x.v)}</td></tr></tbody></table></div>
  <p style="margin-top:6px">${pgTxt(p)}</p><div class="ass"><div>${esc(pr.n)} · ${esc(pr.cons||'')}<br>Recebi o valor acima</div><div>${p?esc(p.op):'Operador(a)'} · quem pagou</div></div></div>`}).join('')||'<p class="tl">Nenhum médico com atendimento finalizado hoje.</p>';
 const sel=(id,lab,oc,ops,v)=>`<select class="in" id="${id}" style="width:auto" aria-label="${lab}" onchange="${oc}">${ops.map(([k,t])=>`<option value="${esc(k)}" ${v===k?'selected':''}>${esc(t)}</option>`).join('')}</select>`;
 openModal(`${mh('Relatório de repasse médico')}<div class="mb rel">${corpo}
 <div class="tablewrap" style="border-radius:12px;margin-top:12px"><table><tbody><tr data-det="0" style="font-weight:800"><td>Montante final do repasse${!uni&&CX_REP_MED?' deste médico':''}</td><td style="text-align:right">${fmt(tot)}</td></tr><tr data-det="0"><td>Já pago</td><td style="text-align:right">${fmt(pago)}</td></tr></tbody></table></div>
 <p class="tl" style="margin-top:10px">Documento interno e confidencial: traz nomes de pacientes e procedimentos só para conferência do repasse (LGPD, art. 6º, III, e art. 11). Guarde com o financeiro; não envie por WhatsApp nem por e-mail aberto.</p></div>
 <div class="mf mf-fixo r18r-rel-f">${sel('r18rRpModo','Formato do relatório',"CX_REP_MODO=this.value;cxRepRel()",[['sep','Separado por médico'],['uni','Unificado (todos juntos)']],CX_REP_MODO)}${uni?'':sel('r18rRpMed','Médico',"CX_REP_MED=this.value;cxRepRel()",[['','Todos os médicos'],...meds.map(m=>[m,PROF(m).n])],CX_REP_MED)}${us.length>1?sel('r18rRpUnid','Unidade do relatório',"CX_REP_UNID=this.value;cxRepRel()",[['','Todas as unidades'],...us.map(u=>[String(u),unidNome(u)])],CX_REP_UNID):''}<button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn" onclick="toast('Na janela de impressão, escolha Salvar como PDF');window.print()">${I.dl} Baixar PDF</button></div>`,'wide')}
{const _rc=cxRepasseCard;cxRepasseCard=function(){return _rc.apply(this,arguments).replace(/<button class="btn sm sec" onclick="cxRepRel\(\)">[\s\S]*?<\/button>/,()=>`<label class="r18r-rp-op"><span class="tl">Relatório</span><select class="in" style="width:auto" aria-label="Formato do relatório de repasse" onchange="CX_REP_MODO=this.value"><option value="sep" ${CX_REP_MODO==='sep'?'selected':''}>Separado por médico</option><option value="uni" ${CX_REP_MODO==='uni'?'selected':''}>Unificado (todos juntos)</option></select></label><button class="btn sm sec" onclick="cxRepRel()">${I.print} Gerar relatório (PDF)</button>`)}}

/* ---------- Financeiro ---------- */
/* Notas 515 a 517: na coluna Aprovação, a conta paga mostra "aprovada" (a situação "Paga" continua na coluna Situação) */
{const _ap=alProxTxt;alProxTxt=function(c){return c&&c.t==='pagar'&&c.s==='Paga'?'<span class="badge ok">aprovada</span>':_ap.apply(this,arguments)}}
/* Nota 518: botão Comprovante ao lado da situação, na mesma linha */
{const _ct=fnContasTab;fnContasTab=function(){return _ct.apply(this,arguments).replace(/(<span class="badge [a-z]+">[^<]*<\/span>)<br><button class="btn sm sec" style="margin-top:4px" onclick="event\.stopPropagation\(\);fnComprovante\((\d+)\)">Comprovante<\/button>/g,'<span class="r18r-sit">$1<button class="btn sm sec" onclick="event.stopPropagation();fnComprovante($2)">Comprovante</button></span>')}}
/* Nota 513: no comprovante, Anexar e Baixar PDF juntos em cima e o Fechar embaixo, na largura toda */
{const _cp=fnComprovante;fnComprovante=function(){const _om=openModal;openModal=function(h,cls){h=String(h).replace(/<div class="mf mf-fixo">(<label class="btn sec"[\s\S]*?<\/label>)<button class="btn ghost" onclick="closeModal\(\)">Fechar<\/button>(<button class="btn"[\s\S]*?<\/button>)<\/div>$/,'<div class="mf mf-fixo r18r-mf2"><div class="r18r-mf-acoes">$1$2</div><button class="btn ghost r18r-fechar" onclick="closeModal()">Fechar</button></div>');return _om(h,cls)};try{return _cp.apply(this,arguments)}finally{openModal=_om}}}

/* ---------- Painel da Fidelidade: sem campos até a definição da V1 (nota 538). Os dados dos contratos ficam guardados. ---------- */
VIEWS.fidelidade=()=>`${pageHead('','Painel da Fidelidade','')}<div class="card at-card"><div class="empty" style="padding:28px 12px"><h4>Em definição para a V1</h4><p>Assinantes, contratos e indicadores voltam a aparecer aqui quando as necessidades da V1 forem definidas.</p></div></div>`;

document.head.insertAdjacentHTML('beforeend',`<style>
.btn.sm.aviso-mais{width:34px;min-width:34px;height:34px;min-height:34px;padding:0;flex:none}
.btn.sm.aviso-mais svg{width:16px;height:16px;flex:none}
.btn.sm.chat-clip{width:38px;min-width:38px;padding:0;flex:none}
.chat-novos .btn{min-width:0}.home-painel-t .row{flex-wrap:wrap}.atl-i{white-space:nowrap}
.r18r-home-bts{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap;margin:0 0 8px}
.r18r-box{min-width:0;margin-bottom:12px}
.r18r-box-s{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 16px;border:1px solid var(--border);border-radius:14px;background:var(--surface);font-weight:700;font-size:15px;color:var(--fg-strong);cursor:pointer;list-style:none}
.r18r-box-s::-webkit-details-marker{display:none}
.r18r-box-s:hover{border-color:var(--accent)}
.r18r-box-d::after{content:'Abrir ▾';font-size:13px;font-weight:600;color:var(--fg2)}
.r18r-box[open]>.r18r-box-s .r18r-box-d::after{content:'Fechar ▴'}
.r18r-box[open]>.r18r-box-s{margin-bottom:8px}
.r18r-box-c>.card:last-child,.r18r-box-c>section:last-child{margin-bottom:0}
.r18r-rp-op{display:inline-flex;align-items:center;gap:6px;margin-right:6px}
.r18r-rel-f{flex-wrap:wrap}
@media print{.r18r-pg+.r18r-pg{break-before:page}}
.r18r-sit{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.modal .mf.r18r-mf2{flex-direction:column;align-items:stretch;gap:8px}
.r18r-mf-acoes{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
.r18r-fechar{width:100%}
</style>`);

/* Início: dentro da caixa que abre e fecha, o título repetido do cartão some; os botões + e editar ficam */
{const st=document.createElement('style');st.textContent='.r18r-box-c>section>.inicio-tit>h3{display:none}.r18r-box-c>section>.inicio-tit{justify-content:flex-end}';document.head.appendChild(st)}
