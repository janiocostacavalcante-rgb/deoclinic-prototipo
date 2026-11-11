/* Rodada 17 (11/11/2026) · recepcao */
/* ==========================================================================
   Anotações 439 a 502 da Recepção: Listagem de Senhas, Pacientes, Novo atendimento e Procedimentos.
   Fica depois de telas-r16.js: só acrescenta funções e embrulha as que já existem.
   ========================================================================== */

/* ---------- Listagem de Senhas (notas 439 a 447) ---------- */
/* Nota 439: só o guichê que chamou inicia ou cancela a senha chamada ou em atendimento */
const r17GuicheDono=s=>{if(!s||!['chamada','atendimento'].includes(s.st)||!s.local)return true;const g=rcMeuGuiche();return !!g&&g.n===s.local&&g.unid===s.unid};
{const _i=rcIniciar;rcIniciar=function(id){const s=RC.senhas.find(x=>x.id===id);if(s&&!r17GuicheDono(s)){toast(`Só o ${s.local} pode iniciar este atendimento`,'warn');return}return _i.apply(this,arguments)}}
{const _c=rcCancelarModal;rcCancelarModal=function(id){const s=RC.senhas.find(x=>x.id===id);if(s&&!r17GuicheDono(s)){toast(`Só o ${s.local} pode cancelar esta senha`,'warn');return}return _c.apply(this,arguments)}}
/* Notas 442, 443 e 447: em atendimento mostra a hora da chamada; concluídos, a hora da finalização; cancelados, o motivo */
function r17SenhaSit(s){
 if(s.st==='chamada')return `Chamada às <b>${esc(s.hCham||'--:--')}</b> · ${esc(s.local)}${s.nCham>1?` · ${s.nCham}ª chamada`:''}`;
 if(s.st==='atendimento')return `${esc(s.local)} · chamada às <b>${esc(s.hCham||'--:--')}</b>${s.hIni?` · início ${esc(s.hIni)}`:''}`;
 if(s.st==='cancelada')return `${esc(s.motivo||'Sem motivo registrado')}${s.hFim?`<br><small class="tl">cancelada às ${esc(s.hFim)}</small>`:''}`;
 if(s.st==='finalizada')return s.hFim?`<b>${esc(s.hFim)}</b>`:'<span class="tl">não registrado</span>';
 return rcSenhaSit(s)}
/* Notas 439, 440, 441 e 445: "Finalizar" vira "Cancelar"; em Concluídos fica só a nota da pesquisa (NPS) */
function r17SenhaAcoes(s){
 if(s.st==='chamada'||s.st==='atendimento'){if(!r17GuicheDono(s))return `<span class="tl">Só o ${esc(s.local)} atende ou cancela</span>`;
  if(s.st==='chamada')return `<button class="btn sm" onclick="rcIniciar(${s.id})">Iniciar</button><button class="btn sm sec" onclick="rcRechamar(${s.id})">Rechamar</button><button class="btn sm ghost" onclick="rcCancelarModal(${s.id})">Cancelar</button>`;
  return `<button class="btn sm ghost" onclick="rcCancelarModal(${s.id})">Cancelar</button><button class="btn sm sec" onclick="naNovoSenha('${esc(s.cpf||'')}',${s.id})">Atendimento</button>`}
 if(s.st==='finalizada')return s.nps?`<select class="in" style="width:auto;height:28px;font-size:12px" aria-label="Nota da pesquisa" onchange="rcNotaNps(${s.id},this.value)"><option value="">Nota da pesquisa</option>${[...Array(11).keys()].map(n=>`<option ${String(s.nps.nota)===String(n)?'selected':''}>${n}</option>`).join('')}</select>`:'<span class="tl">sem pesquisa</span>';
 if(s.st==='cancelada')return '';
 return rcSenhaAcoes(s)}
function rcSenhaRows(){const q=semAc(RC.q.trim()),t=rcSenhaAba(),base=RC.senhas.filter(s=>s.unid===RC.unid&&(!q||semAc(s.pac).includes(q)||semAc(s.num).includes(q)));
 let l=t==='atendimento'?base.filter(s=>s.st==='chamada'||s.st==='atendimento'):base.filter(s=>s.st===t);
 if(t==='aguardando')l=rcOrdem(l,RC.cfg,RC.ptr);
 if(!l.length)return vazioLinha(7,t==='aguardando'?'Ninguém aguardando':'Nenhuma senha aqui',q?'Mude a busca.':t==='aguardando'?'As senhas do Pré-atendimento e do totem aparecem aqui.':'');
 return l.map((s,i)=>`<tr id="rcS${s.id}" class="${RC.foco===s.id?'rc-foco':''}">${td('Senha',`<span class="mono"><b>${esc(s.num)}</b></span>${t==='aguardando'&&i===0?' <span class="badge acc">próxima</span>':''}`)}${td('Paciente',s.pac?esc(s.pac):'<span class="tl">sem identificação</span>')}${td('Tipo',esc(rcTipo(s.tipo).n))}${td('Peso',rcPesoTag(s.peso))}${td('Gerada',s.h)}${td(t==='cancelada'?'Motivo':t==='finalizada'?'Finalizado às':'Situação',`<span title="${esc(s.log.join(' · '))}">${r17SenhaSit(s)}</span>`)}${td(t==='finalizada'?'Nota da pesquisa':'',`<div class="row" style="gap:4px;flex-wrap:nowrap">${r17SenhaAcoes(s)}</div>`)}</tr>`).join('')}
{const _v=VIEWS.senhas;VIEWS.senhas=function(){const h=_v.apply(this,arguments),m={finalizada:['Finalizado às','Nota da pesquisa'],cancelada:['Motivo','']}[rcSenhaAba()];return m?h.replace('<th>Situação</th><th></th>',`<th>${m[0]}</th><th>${m[1]}</th>`):h}}

/* ---------- Pacientes (notas 450 a 464 e 502) ---------- */
/* Notas 450, 456 e 457: filtros numa linha só, alinhados; "Guia" vira "Ficha" */
function pacBuscaFiltros(){const f=PAC_BUSCA,c=(k,l,ph,ex)=>`<div class="field" style="margin:0"><label for="pacF_${k}">${l}</label><input class="in" id="pacF_${k}" value="${esc(f[k])}" oninput="pacBuscaSet('${k}',this.value)" placeholder="${ph}" ${ex||''}></div>`;
 return `<div class="filters pac-filtros r17-pf">${c('n','Nome','Completo ou parte')}${c('cpf','CPF','Completo ou parte','inputmode="numeric"')}${c('dn','Data de Nascimento','','type="date"')}${c('guia','Ficha','Número da ficha')}<div class="field" style="margin:0"><label for="pacF_st">Status</label><select class="in" id="pacF_st" onchange="pacBuscaSet('st',this.value)">${[['ativos','Ativos'],['inativos','Inativos'],['todos','Todos']].map(([v,t])=>`<option value="${v}" ${f.st===v?'selected':''}>${t}</option>`).join('')}</select></div><button class="btn ghost" onclick="pacBuscaSet()">Limpar</button></div>`}
/* Nota 459: sem a coluna de Opções; clicar no paciente pergunta se é para editar o cadastro ou atender */
function pacBuscaRows(l){if(!l.length)return vazioLinha(5,'Ninguém encontrado','Mude os filtros ou cadastre um novo paciente.');
 return l.map(p=>`<tr style="cursor:pointer" onclick="r17PacClique('${p.cpf}')">${td('Paciente',`<a href="#" style="color:inherit" onclick="event.preventDefault()">${esc(p.n)}</a>`)}${td('CPF',`<span class="mono">${cpfVer(p.cpf)}</span>`)}${td('Data de Nascimento',dmy(p.dn))}${td('Telefone',esc(p.tel))}${td('Status',`<span class="badge ${p.ativo?'ok':'neutral'}">${p.ativo?'Ativo':'Inativo'}</span>`)}</tr>`).join('')}
function pacBuscaResultado(){if(!pacBuscaTem(PAC_BUSCA))return '<div class="empty pac-vazio"><h4>Pesquise para ver os pacientes</h4><p>Preencha ao menos um dos filtros acima.</p></div>';const l=pacBuscaFiltrar(PAC_BUSCA),d=soDig(PAC_BUSCA.cpf);
 if(!l.length&&d.length===11&&!PACIENTES.some(p=>soDig(p.cpf)===d))return `<div class="empty pac-vazio"><h4>CPF não encontrado</h4><p>Faça o cadastro para seguir com o atendimento.</p><button class="btn" onclick="rcPacEditar('',{cpf:'${mCPF(d)}'})">${I.plus} Cadastrar paciente com este CPF</button></div>`;
 return `<b id="pcTotal" style="display:block;margin:8px 0">${l.length===1?'1 paciente encontrado':l.length+' pacientes encontrados'}</b><div class="tablewrap r17-pac-tab"><table class="at-table"><thead><tr><th>Nome completo</th><th>CPF</th><th>Data de Nascimento</th><th>Telefone</th><th>Status</th></tr></thead><tbody id="pcBody">${pacBuscaRows(l)}</tbody></table></div>`}
function r17PacClique(cpf){const p=PACIENTES.find(x=>x.cpf===cpf);if(!p)return;if(typeof pacOpFechar==='function')pacOpFechar();
 openModal(`${mh(esc(p.n))}<div class="mb"><p class="tl" style="margin:0 0 12px"><span class="mono">${cpfMask(p.cpf)}</span> · ${dmy(p.dn)} · ${p.ativo?'cadastro ativo':'cadastro inativo'}</p>
 <p style="margin:0 0 10px">O que você quer fazer?</p><div class="r17-esc"><button class="btn sec" onclick="closeModal();rcPacEditar('${cpf}')">${I.edit||''} Editar cadastro</button><button class="btn" ${p.ativo?'':'disabled'} onclick="closeModal();naNovo('atendimento','${cpf}',false,true)">Atendimento</button></div>
 ${p.ativo?'':'<p class="tl" style="margin-top:8px">Cadastro inativo: reative em Editar cadastro para atender.</p>'}
 <div class="row" style="gap:16px;margin-top:14px;flex-wrap:wrap"><a href="#" class="tl" onclick="event.preventDefault();closeModal();pacFicha('${cpf}')">Ficha completa e histórico</a>${pacPodeUnificar()?`<a href="#" class="tl" onclick="event.preventDefault();closeModal();pacFundir('${cpf}')">Unificar cadastros</a>`:''}</div></div>`)}
/* Nota 502: CPF completo que não existe abre o cadastro já com o CPF */
let R17_CPF_ULT='';
{const _s=pacBuscaSet;pacBuscaSet=function(k,v){_s.apply(this,arguments);if(k!=='cpf')return;const d=soDig(v);if(d.length!==11){R17_CPF_ULT='';return}if(d===R17_CPF_ULT)return;R17_CPF_ULT=d;if(PACIENTES.some(p=>soDig(p.cpf)===d))return;toast('CPF não encontrado: preencha o cadastro do paciente','warn');rcPacEditar('',{cpf:mCPF(d)})}}
/* Nota 464: aviso de CPF já cadastrado enquanto digita */
function r17CpfAviso(v){const d=soDig(v),m=document.getElementById('pfCMsg'),el=document.getElementById('pfC'),f=el&&el.closest?el.closest('.field'):null;if(!m)return;
 const p=d.length===11?PACIENTES.find(x=>soDig(x.cpf)===d):null;
 if(f&&f.classList)f.classList.toggle('err',!!p);
 if(!p){m.innerHTML='';return}
 m.style.color='var(--err)';m.innerHTML=`Já existe cadastro com este CPF. <a href="#" onclick="event.preventDefault();closeModal();${location.hash==='#pacientes'?`r17PacClique('${p.cpf}')`:`rcPacEditar('${p.cpf}')`}">Abrir o cadastro</a>`;
 if(m.dataset.cpf!==d){m.dataset.cpf=d;toast('Já existe cadastro com este CPF','warn')}}
{const _pe=rcPacEditar;rcPacEditar=function(cpf){const r=_pe.apply(this,arguments);if(cpf)return r;const el=document.getElementById('pfC');if(!el)return r;
 el.insertAdjacentHTML('afterend','<span class="msg" id="pfCMsg"></span>');el.oninput=function(){this.value=mCPF(this.value);r17CpfAviso(this.value)};if(el.value)r17CpfAviso(el.value);return r}}
/* Notas 460 e 461: cadastrou pela tela Pacientes, já abre o atendimento com o paciente novo */
{const _ps=rcPacSalvar;rcPacSalvar=function(){const novo=!RC.pEd,daTela=location.hash==='#pacientes',el=document.getElementById('pfC'),c=mCPF(((el&&el.value)||'').trim()),n0=PACIENTES.length;
 const r=_ps.apply(this,arguments);if(novo&&daTela&&PACIENTES.length>n0&&rcPacCpf(c)){naNovo('atendimento',c,false,true);toast('Paciente cadastrado. Siga com o atendimento')}return r}}

/* ---------- Procedimentos: entrega, urgência, preparo e perguntas (nota 498) ---------- */
/* R17P[codigo] = {dias: prazo de entrega em dias úteis, urg:{ok,tipo:'fixo'|'pct',v}, jej: horas de jejum, prep: outras orientações} */
const R17P={};
const R17_URG0={HEMO:{ok:true,tipo:'pct',v:20},'40901122':{ok:true,tipo:'fixo',v:50},'40101010':{ok:true,tipo:'fixo',v:30}};
function r17DiasPadrao(c){const e=(typeof EX!=='undefined'&&EX[c])||{};if(PROC(c)||e.proc){const t=prCfg(c).prazo||'',n=+(t.match(/\d+/)||[0])[0];return /hora/.test(t)?Math.ceil(n/24):n}return e.serv?0:(e.d||0)+1}
function r17Cfg(c){if(!R17P[c]){const p=PROC(c),e=(typeof EX!=='undefined'&&EX[c])||{},pr=(p&&p.prep)||(e.proc&&e.prep)||'',m=/jejum de (\d+)/i.exec(pr);
 const resto=pr.replace(/jejum de \d+ horas?( e )?/i,'').replace(/^sem preparo$/i,'').trim();
 R17P[c]={dias:r17DiasPadrao(c),urg:{...(R17_URG0[c]||{ok:!!e.u&&!e.proc,tipo:'pct',v:0})},jej:m?+m[1]:(e.j||0),prep:resto?resto[0].toUpperCase()+resto.slice(1):''}}return R17P[c]}
const r17Dias=c=>r17Cfg(c).dias;
const r17PrazoTxt=n=>!n?'':n===1?'24 horas':n===2?'48 horas':n===3?'72 horas':n+' dias úteis';
const r17PrepTxt=c=>{const g=r17Cfg(c);return [g.jej?`Jejum de ${g.jej} horas`:'',g.prep].filter(Boolean).join(' e ')};
const r17UrgTxt=c=>{const u=r17Cfg(c).urg;return !u.ok?'Não aceita urgência':`Aceita urgência · taxa ${u.v?(u.tipo==='pct'?String(u.v).replace('.',',')+'%':fmt(+u.v)):'sem acréscimo'}`};
/* Preparo agrupado: um jejum só (o maior) e sem orientações repetidas */
{const _pj=clPrepJornada;clPrepJornada=function(itens){itens=itens||[];const base=_pj(itens).filter(t=>!/^jejum de/i.test(t));
 const jej=Math.max(0,...itens.map(c=>Math.max((EX[c]&&EX[c].j)||0,r17Cfg(c).jej||0)));const out=jej?[`Jejum de ${jej} horas (água liberada)`,...base]:base;
 const vistos=out.map(t=>semAc(t));itens.forEach(c=>{const t=(r17Cfg(c).prep||'').trim();if(!t||/bexiga/i.test(t))return;const k=semAc(t);if(vistos.some(v=>v.includes(k)))return;vistos.push(k);out.push(t)});return out}}

/* Banco único de perguntas (sim ou não, ou texto livre), usado pela triagem e pelo questionário de cada procedimento */
let R17_BANCO=null,R17_BSEQ=1;
function r17Banco(){if(!R17_BANCO){R17_BANCO=[];Object.values(PR_CFG).forEach(g=>(g.perg||[]).forEach(x=>{let b=R17_BANCO.find(y=>semAc(y.q)===semAc(x.q));if(!b){b={id:'q'+(R17_BSEQ++),q:x.q,t:x.t,ops:x.ops?[...x.ops]:undefined};R17_BANCO.push(b)}x.bid=b.id}))}return R17_BANCO}
const r17TipoPerg=t=>t==='sn'?'Sim ou não':t==='esc'?'Múltipla escolha':'Texto livre';
function r17QLista(c,marc){const sel=marc||new Set(c?(prCfg(c).perg||[]).map(x=>x.bid||(r17Banco().find(b=>semAc(b.q)===semAc(x.q))||{}).id):[]);
 return r17Banco().map(b=>`<label class="check"><input type="checkbox" id="r17Q_${b.id}" ${sel.has(b.id)?'checked':''}>${esc(b.q)} <span class="tl">· ${r17TipoPerg(b.t)}</span></label>`).join('')||'<p class="tl">Nenhuma pergunta no banco.</p>'}
function r17QAddForm(){const q=($('#r17QNova').value||'').trim(),t=$('#r17QTipo').value;if(!q){toast('Escreva a pergunta','warn');return}
 const marc=new Set(r17Banco().filter(b=>{const e=document.getElementById('r17Q_'+b.id);return e&&e.checked}).map(b=>b.id));
 let b=r17Banco().find(y=>semAc(y.q)===semAc(q));if(!b){b={id:'q'+(R17_BSEQ++),q,t};R17_BANCO.push(b)}marc.add(b.id);$('#r17QList').innerHTML=r17QLista('',marc);$('#r17QNova').value='';toast('Pergunta incluída no banco')}
/* Formulário do procedimento: prazo em dias úteis, urgência com taxa, preparo e perguntas */
function r17FormExtra(h,c){const g=c?r17Cfg(c):{dias:0,urg:{ok:false,tipo:'pct',v:0},jej:0,prep:''},u=g.urg;
 const dias=`<div class="field"><label for="r17Dias">Prazo de entrega (dias úteis) ${info('Sai no orçamento e na ficha impressa, com a data prevista. Zero quando é feito e entregue na própria visita, como a consulta.')}</label><input class="in" id="r17Dias" type="number" min="0" max="60" value="${g.dias||0}"><input type="hidden" id="prP" value="${esc(c?prCfg(c).prazo||'':'')}"></div>`;
 h=h.replace(/<div class="field"><label for="prP">[\s\S]*?<\/select><\/div>/,dias);
 const extra=`<h4 style="margin:14px 0 6px">Urgência</h4>
 <label class="check"><input type="checkbox" id="r17UrgOk" ${u.ok?'checked':''} onchange="$('#r17UrgBox').hidden=!this.checked">Pode ser feito em caráter de urgência</label>
 <div class="formgrid" id="r17UrgBox" ${u.ok?'':'hidden'}><div class="field"><label for="r17UrgTipo">Taxa de urgência</label><select class="in" id="r17UrgTipo"><option value="pct" ${u.tipo==='pct'?'selected':''}>Percentual sobre o valor</option><option value="fixo" ${u.tipo==='fixo'?'selected':''}>Valor fixo em reais</option></select></div><div class="field"><label for="r17UrgV">Valor da taxa ${info('Percentual (ex.: 20) ou reais (ex.: 50,00). Zero para urgência sem acréscimo. Ao marcar o item como urgente, o acréscimo aparece no orçamento.')}</label><input class="in" id="r17UrgV" inputmode="decimal" value="${String(u.v||0).replace('.',',')}"></div></div>
 <h4 style="margin:14px 0 6px">Preparo</h4><div class="formgrid"><div class="field"><label for="r17Jej">Jejum (horas) ${info('Com vários itens no mesmo atendimento, vale só o maior jejum.')}</label><input class="in" id="r17Jej" type="number" min="0" max="24" value="${g.jej||0}"></div><div class="field" style="grid-column:span 2"><label for="r17Prep">Outras orientações de preparo</label><input class="in" id="r17Prep" value="${esc(g.prep||'')}" placeholder="Ex.: bexiga cheia; suspender AAS 7 dias antes"></div></div>
 <h4 style="margin:14px 0 6px">Perguntas da triagem ou do questionário ${info('Vêm do banco único de perguntas, que serve a todos os procedimentos. Valem quando "Exige antes do atendimento" é Triagem ou Questionário. O questionário pode ser impresso para o paciente responder.')}</h4>
 <div id="r17QList" class="r17-qlist">${r17QLista(c)}</div>
 <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><input class="in" id="r17QNova" placeholder="Nova pergunta para o banco" style="flex:1 1 220px" aria-label="Nova pergunta"><select class="in" id="r17QTipo" style="width:auto" aria-label="Tipo de resposta"><option value="sn">Sim ou não</option><option value="txt">Texto livre</option></select><button class="btn sm sec" type="button" onclick="r17QAddForm()">${I.plus} Incluir no banco</button></div>`;
 const k=h.indexOf('<h4 style="margin:14px 0 6px">Convênios em que aparece');return k>0?h.slice(0,k)+extra+h.slice(k):h.replace('<div class="mf">',extra+'<div class="mf">')}
{const _f=clPrcForm;clPrcForm=function(c){const _om=openModal;openModal=function(h,cls){return _om(r17FormExtra(h,c),cls)};try{return _f.apply(this,arguments)}finally{openModal=_om}}}
function r17LerForm(){const v=id=>{const e=document.getElementById(id);return e?e.value:''},ck=id=>{const e=document.getElementById(id);return !!(e&&e.checked)};
 const dias=Math.max(0,Math.round(+v('r17Dias')||0)),ok=ck('r17UrgOk'),tipo=v('r17UrgTipo')==='fixo'?'fixo':'pct',tv=parseFloat(String(v('r17UrgV')||'0').replace(/\./g,'').replace(',','.')),jej=Math.max(0,Math.round(+v('r17Jej')||0));
 if(dias>60)return {erro:'O prazo de entrega vai até 60 dias úteis'};if(ok&&!(tv>=0))return {erro:'Informe a taxa de urgência (zero se não houver)'};if(ok&&tipo==='pct'&&tv>100)return {erro:'A taxa percentual vai até 100%'};if(jej>24)return {erro:'O jejum vai até 24 horas'};
 const perg=r17Banco().filter(b=>ck('r17Q_'+b.id));if(v('prE')==='questionario'&&!perg.length)return {erro:'Marque pelo menos uma pergunta do questionário'};
 return {dias,urg:{ok,tipo,v:ok?tv:0},jej,prep:v('r17Prep').trim(),perg}}
{const _s=prSalvar;prSalvar=function(c){const cod=c||String((document.getElementById('prC')||{}).value||'').trim(),d=r17LerForm();if(d.erro){toast(d.erro,'warn');return}
 const hp=document.getElementById('prP');if(hp)hp.value=r17PrazoTxt(d.dias);
 let ok=false;const _cm=closeModal;closeModal=function(){ok=true;return _cm.apply(this,arguments)};try{_s.apply(this,arguments)}finally{closeModal=_cm}
 if(!ok)return;const p=PROC(cod);Object.assign(r17Cfg(cod),{dias:d.dias,urg:d.urg,jej:d.jej,prep:d.prep});if(p)p.prep=r17PrepTxt(cod)||'Sem preparo';
 const g=prCfg(cod),ant=g.perg||[];g.perg=g.exige?d.perg.map(b=>{const a=ant.find(x=>x.bid===b.id||semAc(x.q)===semAc(b.q));return {q:b.q,t:b.t,ops:b.ops,ob:a?a.ob:b.t==='sn',bid:b.id}}):[];
 if(location.hash==='#procedimentos'&&!modalAberto())reView()}}

/* Banco de perguntas: tela única para cadastrar, editar e tirar perguntas */
let R17_BED=null;
function r17BancoModal(){R17_BED=r17Banco().map(b=>({...b}));r17BancoPinta()}
function r17BancoPinta(){const h=`${mh('Banco de perguntas')}<div class="mb"><p class="tl" style="margin:0 0 10px">Perguntas usadas na triagem e nos questionários dos procedimentos. Mudar o texto aqui muda em todos os procedimentos que usam a pergunta.</p>
 ${R17_BED.length?R17_BED.map((b,i)=>`<div class="r17-bq"><input class="in" value="${esc(b.q)}" aria-label="Pergunta ${i+1}" oninput="R17_BED[${i}].q=this.value"><select class="in" aria-label="Tipo de resposta" onchange="R17_BED[${i}].t=this.value">${[['sn','Sim ou não'],['txt','Texto livre'],...(b.t==='esc'?[['esc','Múltipla escolha']]:[])].map(([k,t])=>`<option value="${k}" ${b.t===k?'selected':''}>${t}</option>`).join('')}</select><button class="btn sm ghost" aria-label="Tirar pergunta" onclick="R17_BED.splice(${i},1);r17BancoPinta()">${I.x}</button></div>`).join(''):'<p class="tl">Nenhuma pergunta.</p>'}
 <button class="btn sm sec" style="margin-top:8px" onclick="R17_BED.push({id:'q'+(R17_BSEQ++),q:'',t:'sn'});r17BancoPinta()">${I.plus} Pergunta</button></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="r17BancoSalvar()">Salvar</button></div>`;if(modalAberto())$('#modal').innerHTML=h;else openModal(h,'wide')}
function r17BancoSalvar(){const v=R17_BED.findIndex(b=>!b.q.trim());if(v>=0){toast(`A pergunta ${v+1} está em branco`,'warn');return}
 const ids=new Set(R17_BED.map(b=>b.id));let tirou=0;Object.values(PR_CFG).forEach(g=>{g.perg=(g.perg||[]).filter(x=>{if(x.bid&&!ids.has(x.bid)){tirou++;return false}return true});g.perg.forEach(x=>{const b=R17_BED.find(y=>y.id===x.bid);if(b){x.q=b.q.trim();x.t=b.t}})});
 R17_BANCO=R17_BED.map(b=>({...b,q:b.q.trim()}));closeModal();reView();toast(tirou?`Banco salvo. ${tirou} pergunta(s) saíram dos procedimentos que as usavam`:'Banco de perguntas salvo')}
{const _v=VIEWS.procedimentos;VIEWS.procedimentos=function(){return _v.apply(this,arguments).replace('<button class="btn" onclick="clPrcForm()"',`<button class="btn sec" onclick="r17BancoModal()">Banco de perguntas</button><button class="btn" onclick="clPrcForm()"`)}}
/* Detalhes do procedimento: entrega, urgência, preparo e questionário para imprimir */
{const _pv=clPrcVer;clPrcVer=function(c,aba){const _od=openDrawer;openDrawer=function(t,h){if((aba||'dados')==='dados'){const g=prCfg(c);
  h=h.replace('<div class="row" style="margin-top:12px">',`<h4 style="margin:14px 0 6px">Entrega, urgência e preparo</h4>${kvs([['Prazo de entrega',r17Dias(c)?r17Dias(c)+' dias úteis':'Na própria visita'],['Urgência',esc(r17UrgTxt(c))],['Preparo',esc(r17PrepTxt(c)||'Sem preparo')],['Antes do atendimento',g.exige==='triagem'?'Triagem':g.exige==='questionario'?`Questionário (${(g.perg||[]).length} perguntas)`:'Nada']])}${g.exige&&(g.perg||[]).length?`<button class="btn sm sec" style="margin-top:8px" onclick="r17ImprimirQuest(['${c}'])">${I.print||''} Imprimir questionário</button>`:''}<div class="row" style="margin-top:12px">`)}return _od(t,h)};try{return _pv.apply(this,arguments)}finally{openDrawer=_od}}}

/* ---------- Procedimentos do convênio (nota 499) ---------- */
const R17_EXCONV={};/* exames de laboratório por convênio: R17_EXCONV[convenio][codigo] = {off, v} */
const R17_CODCONV={};/* código próprio do convênio: R17_CODCONV[convenio][codigo] */
let R17CV={conv:'Unimed Fortaleza',q:'',tipo:''};
const r17Convs=()=>['Particular',...[...CL_TABS,...CONVENIOS].filter((c,i,a)=>c!=='Particular'&&a.indexOf(c)===i)];
const r17EhProc=c=>!!(PROC(c)||(EX[c]&&EX[c].proc));
function r17Disp(c,conv){const e=EX[c];if(!e)return false;if(e.serv||conv==='Particular')return true;if(r17EhProc(c))return prConvs(c).includes(conv);return !((R17_EXCONV[conv]||{})[c]||{}).off}
function r17Preco(c,conv){const e=EX[c]||{};if(conv==='Particular'||e.serv)return r17EhProc(c)&&PR_VAL[c]&&PR_VAL[c].Particular!=null?PR_VAL[c].Particular:(e.p||0);if(r17EhProc(c))return prValor(c,conv)||0;const o=(R17_EXCONV[conv]||{})[c];return o&&o.v!=null?o.v:precoDe(c,conv)}
const r17CvLista=()=>[...PROCEDIMENTOS.map(p=>p.c),...EXAMES.filter(e=>!e.serv&&!e.proc).map(e=>e.c)].filter(c=>EX[c]);
function r17CvRows(){const conv=R17CV.conv,q=semAc(R17CV.q.trim()),l=r17CvLista().filter(c=>(!R17CV.tipo||(R17CV.tipo==='lab'?!r17EhProc(c):r17EhProc(c)))&&(!q||semAc(EX[c].n+' '+c+' '+((R17_CODCONV[conv]||{})[c]||'')).includes(q)));
 if(!l.length)return vazioLinha(6,'Nada encontrado','Mude a busca ou o tipo.');
 return l.map(c=>{const e=EX[c],on=r17Disp(c,conv),cod=(R17_CODCONV[conv]||{})[c]||'';return `<tr>${td('Código',`<span class="mono">${esc(c)}</span>`)}${td('Procedimento',`<div class="two">${esc(e.n)}<small>${r17EhProc(c)?esc(CL_TIPOS[e.proc]?CL_TIPOS[e.proc][0]:e.proc||'Procedimento'):'Exame de laboratório'}${prCfg(c).dep?' · depende de médico':''}</small></div>`)}${td('Código no convênio',cod?`<span class="mono">${esc(cod)}</span>`:'<span class="tl">o mesmo</span>')}${td('Valor no convênio',on?fmt(r17Preco(c,conv)):'<span class="tl">não coberto</span>')}${td('Coberto',`<label class="switch"><input type="checkbox" ${on?'checked':''} aria-label="Coberto por ${esc(conv)}" onchange="r17CvTog('${c}',this.checked)"><span class="tr"></span></label>`)}${td('',`<button class="btn sm sec" onclick="r17CvEditar('${c}')">Editar</button>`)}</tr>`}).join('')}
VIEWS['procedimentos-convenio']=()=>{if(!r17Convs().includes(R17CV.conv)||R17CV.conv==='Particular')R17CV.conv=r17Convs()[1];
 return `${pageHead('','Procedimentos do convênio','')}<p class="tl" style="margin:0 0 10px">O que cada convênio cobre, com o valor e o código usados nele. O Novo atendimento só oferece o que o convênio escolhido cobre.</p>
 <div class="filters"><select class="in" style="width:auto" aria-label="Convênio" onchange="R17CV.conv=this.value;reView()">${r17Convs().filter(c=>c!=='Particular').map(c=>`<option ${R17CV.conv===c?'selected':''}>${esc(c)}</option>`).join('')}</select><div class="inwrap" style="flex:1 1 220px">${LUPA}<input class="in" placeholder="Nome ou código" value="${esc(R17CV.q)}" oninput="R17CV.q=this.value;$('#r17CvBody').innerHTML=r17CvRows()" aria-label="Buscar procedimento"></div>${[['','Todos'],['proc','Procedimentos'],['lab','Exames de laboratório']].map(([k,t])=>chip(t,R17CV.tipo===k,`R17CV.tipo='${k}';reView()`)).join('')}</div>
 <div class="tablewrap"><table class="at-table"><thead><tr><th>Código</th><th>Procedimento</th><th>Código no convênio</th><th>Valor no convênio</th><th>Coberto</th><th></th></tr></thead><tbody id="r17CvBody">${r17CvRows()}</tbody></table></div>`};
function r17PvIni(c){if(!PR_VAL[c]){const o={};prConvs(c).forEach(t=>o[t]=prValor(c,t));PR_VAL[c]=o}return PR_VAL[c]}
function r17CvTog(c,on){const conv=R17CV.conv;if(r17EhProc(c)){const o=r17PvIni(c);if(on)o[conv]=o[conv]!=null?o[conv]:(clPreco(c,conv)||PROC(c)&&PROC(c).preco||EX[c].p||0);else delete o[conv]}
 else{const x=(R17_EXCONV[conv]=R17_EXCONV[conv]||{});x[c]={...(x[c]||{}),off:!on}}
 $('#r17CvBody').innerHTML=r17CvRows();toast(on?`${EX[c].n} passa a ser coberto por ${conv}`:`${EX[c].n} deixa de aparecer para ${conv}`)}
function r17CvEditar(c){const conv=R17CV.conv,on=r17Disp(c,conv);openModal(`${mh(esc(EX[c].n)+' · '+esc(conv))}<div class="mb"><div class="formgrid"><div class="field"><label for="r17CvCod">Código no convênio ${info('Quando o convênio usa um código próprio. Em branco, vale o código do cadastro.')}</label><input class="in mono" id="r17CvCod" value="${esc((R17_CODCONV[conv]||{})[c]||'')}" placeholder="${esc(c)}"></div><div class="field"><label for="r17CvV">Valor no convênio <span class="req">*</span></label><input class="in" id="r17CvV" inputmode="decimal" value="${on?String(r17Preco(c,conv).toFixed(2)).replace('.',','):''}"></div></div><p class="tl">Vale para os próximos atendimentos; o que já foi atendido não muda.</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="r17CvEditarOk('${c}')">Salvar</button></div>`)}
function r17CvEditarOk(c){const conv=R17CV.conv,v=parseFloat(($('#r17CvV').value||'').replace(/\./g,'').replace(',','.')),cod=($('#r17CvCod').value||'').trim();if(!(v>=0)){toast('Informe o valor','warn');return}
 (R17_CODCONV[conv]=R17_CODCONV[conv]||{})[c]=cod;if(r17EhProc(c))r17PvIni(c)[conv]=v;else{const x=(R17_EXCONV[conv]=R17_EXCONV[conv]||{});x[c]={off:false,v}}
 closeModal();reView();toast('Procedimento do convênio salvo')}
{const g=MENU.find(x=>x[0]==='Procedimentos');if(g&&!g[1].some(i=>i[0]==='procedimentos-convenio')){const k=g[1].findIndex(i=>i[0]==='procedimentos');g[1].splice(k+1,0,['procedimentos-convenio','Procedimentos do convênio'])}
 NAMES['procedimentos-convenio']='Procedimentos do convênio';if(typeof DESC!=='undefined')DESC['procedimentos-convenio']='O que cada convênio cobre, com valor e código próprios.'}

/* ---------- Novo atendimento: cartão do paciente (notas 492 e 493) ---------- */
/* Nota 492: CPF ainda mais curto no cartão (só três números do meio); LGPD, art. 6º, III (necessidade) */
const r17CpfCurto=c=>c?'***.***.'+String(c).slice(8,11)+'-**':'Sem CPF';
const R17_AGST={agendado:['Agendado','info'],confirmado:['Confirmado','ok'],chegou:['Chegou','acc'],atendimento:['Em atendimento','warn'],'em atendimento':['Em atendimento','warn'],finalizado:['Finalizado','ok'],atendido:['Atendido','ok'],faltou:['Faltou','err'],cancelado:['Cancelado','neutral']};
const r17AgSt=s=>{const k=String(s||'').toLowerCase(),m=R17_AGST[k];return m?`<span class="badge ${m[1]}">${m[0]}</span>`:`<span class="badge neutral">${esc(s||'Sem situação')}</span>`};
/* Nota 493: todos os agendamentos do paciente, de hoje, futuros e passados, com a situação de cada um */
function r17AgsDe(p){const hoje=(typeof AG_CLIN!=='undefined'?AG_CLIN.filter(a=>a.pac===p.n).map(a=>({...a,data:a.data||RC_HOJE})):[]),out=(typeof RC!=='undefined'&&RC?RC.ag.filter(a=>a.pac===p.n):[]);
 const l=[...hoje];out.forEach(a=>{if(!l.some(b=>b.data===a.data&&b.h===a.h&&b.prof===a.prof))l.push(a)});return l.sort((a,b)=>(b.data+b.h).localeCompare(a.data+a.h))}
function naPacCard(){const p=NA.pac||{};if(!p.n)return '';const cpf=NA.cpf,ab=NA_PAC_ABA;
 const ags=r17AgsDe(p),orcs=cpf?ORCS.filter(o=>o.cpf===cpf):[],fichas=ATENDS.filter(a=>a.n===p.n);
 const abas=[['dados','Dados'],['ag','Agendamentos',ags.length],['orc','Orçamentos',orcs.length],['fichas','Fichas',fichas.length]];
 const corpo=ab==='ag'?(ags.length?`<div class="at-list">${ags.map(a=>`<div class="at-row"><div class="grow">${esc((a.itens||[a.proc]).map(c=>clProcNome(c)).join(', '))}<small>${a.data===RC_HOJE?'Hoje':dmy(a.data)} às ${esc(a.h)} · ${esc((PROF(a.prof)||{n:'Sem profissional'}).n)} · ${esc(a.conv||'Particular')}${a.cod?' · '+esc(a.cod):''}</small></div>${r17AgSt(a.sit)}</div>`).join('')}</div>`:'<p class="tl">Nenhum agendamento.</p>')
  :ab==='orc'?(orcs.length?`<div class="at-list">${orcs.map(o=>{const aberto=abertoOrc(o),usando=NA.orc&&NA.orc.id===o.id&&NA.usarOrc;return `<div class="at-row"><div class="grow"><span class="mono">${o.id}</span> · ${o.it.length} ${o.it.length>1?'itens':'item'} · ${fmt(o.it.reduce((s,i)=>s+i.p,0))}<small>Feito em ${dm(o.feito)} por ${esc(o.quem)} · ${o.sit==='convertido'?'virou a ficha '+esc(o.conv||''):aberto?`válido até ${dm(o.val)}`:'fechado'}${usando?' · <b>itens no pedido</b>':''}${NA.orcAuto===o.id?' · <b>deste atendimento</b>':''}</small></div>${aberto&&NA.orc&&NA.orc.id===o.id&&!NA.autz?(usando?`<button class="btn sm ghost" onclick="naUsarOrc(false)">Tirar do pedido</button>`:`<button class="btn sm sec" onclick="naUsarOrc(true)">Usar os itens</button>`):''}</div>`}).join('')}</div>`:'<p class="tl">Nenhum orçamento.</p>')
  :ab==='fichas'?(fichas.length?`<div class="at-list">${fichas.map(a=>`<div class="at-row"><div class="grow"><span class="mono">${a.p}</span><small>${esc(a.orig)} · ${esc(a.tot)}</small></div><button class="btn sm ghost" onclick="atFicha('${a.p}')">Abrir ficha</button></div>`).join('')}</div>`:'<p class="tl">Nenhuma ficha anterior.</p>')
  :kvs([['Nome',esc(p.n)+(p.ns?` <span class="tl">(nome social: ${esc(p.ns)})</span>`:'')],['CPF',cpf?`<span class="mono">${r17CpfCurto(cpf)}</span>`:'Sem CPF'],['Nascimento',p.dn?`${dmy(p.dn)} · ${idade(p.dn)} anos`:'Não informado'],['Sexo',p.sx==='F'?'Feminino':p.sx==='M'?'Masculino':'Não informado'],['Nome da mãe',p.mae?esc(p.mae):'<span class="tl">não informado</span>'],['Telefone',esc(p.tel||'Não informado')],['E-mail',esc(p.email||'Não informado')],p.resp?['Responsável',esc(p.resp)]:null]);
 return `<div class="card at-card na-pac"><div class="row" style="justify-content:space-between;align-items:center"><h3>Paciente</h3><button class="btn sm sec" onclick="NA.passo=1;naRender(true)">${I.edit||'✎'} Editar cadastro</button></div>
 <div class="tabs" role="tablist">${abas.map(([k,t,n])=>`<button class="tab ${ab===k?'active':''}" onclick="NA_PAC_ABA='${k}';naRender()">${t}${n!==undefined?` <span class="tl">${n}</span>`:''}</button>`).join('')}</div>${corpo}</div>`}

/* ---------- Novo atendimento: convênio, procedimentos, solicitante e orçamento automático (notas 494, 495, 497 e 498) ---------- */
const r17ConvAtual=()=>NA.tipo==='convenio'&&NA.conv?NA.conv:'Particular';
const r17TipoEx=e=>e.proc?(typeof CL_TIPOS!=='undefined'&&CL_TIPOS[e.proc]?CL_TIPOS[e.proc][0]:e.proc):e.serv?'Serviço':'Exame de laboratório';
const r17Medicos=()=>PROFISSIONAIS.filter(p=>p.ativo!==false&&(!p.unids||p.unids.includes(RC.unid)));
function r17Taxa(x){if(!x.urg)return 0;const u=r17Cfg(x.c).urg;if(!u||!u.ok||!u.v)return 0;return u.tipo==='pct'?Math.round((x.pb||0)*u.v)/100:+u.v}
function r17Calc(x){x.taxa=r17Taxa(x);x.p0=Math.round(((x.pb||0)+x.taxa)*(x.q||1)*100)/100;x.p=x.p0;return x}
function r17Norm(){NA.ex.forEach(x=>{if(x.pb==null)x.pb=Math.round(((x.p0!=null?x.p0:x.p)/(x.q||1)-(x.taxa||0))*100)/100})}
function r17Urg(i){const x=NA.ex[i];if(!x)return;r17Norm();x.urg=!x.urg;r17Calc(x);naRender()}
function r17UrgTodos(){r17Norm();NA.ex.forEach(x=>{if(r17Cfg(x.c).urg.ok&&!x.urg){x.urg=true;r17Calc(x)}});naRender()}
function r17SetConv(v){if(NA.autz)return;NA.tipo=v==='Particular'?'particular':'convenio';NA.conv=v==='Particular'?'':v;if(NA.tipo==='convenio'&&NA.semSol)naSemSol(false);
 r17Norm();const fora=[];NA.ex=NA.ex.filter(x=>{if(!r17Disp(x.c,v)){fora.push(EX[x.c].n);return false}x.pb=r17Preco(x.c,v);r17Calc(x);return true});NA.err={};naRender();
 if(fora.length)toast(`${v} não cobre: ${fora.join(', ')}. Saiu do pedido`,'warn')}
{const _a=naAdd;naAdd=function(c){if(!NA||NA.modo!=='atendimento')return _a.apply(this,arguments);if(NA.autz){toast('O orçamento já foi autorizado. Desfaça a autorização para mudar os itens','warn');return}
 if(NA.ex.some(x=>x.c===c))return;const conv=r17ConvAtual();if(!r17Disp(c,conv)){toast(`${conv} não cobre este procedimento`,'warn');return}
 const ag=[...(typeof AG_CLIN!=='undefined'?AG_CLIN:[]),...RC.ag].find(a=>a.pac===NA.pac.n&&(a.itens||[a.proc]).includes(c)&&a.prof);
 NA.ex.push(r17Calc({c,pb:r17Preco(c,conv),urg:false,med:prCfg(c).dep&&ag?ag.prof:''}));naRender();const q=$('#naQ');if(q)q.focus()}}
/* A edição do valor vale como valor base; a taxa de urgência é refeita em cima dele */
{const _eo=naEditOk;naEditOk=function(i){const x=NA.ex[i],tx=x?(x.taxa||0):0;const r=_eo.apply(this,arguments);if(x&&NA.modo==='atendimento'&&NA.ex[i]===x){x.pb=Math.round((x.p/(x.q||1)-tx)*100)/100;r17Calc(x);naRender()}return r}}
/* Nota 495: a busca e a lista não mostram o material (soro, sangue): isso é do setor técnico */
function r17Resultados(q){q=semAc(q.trim());if(q.length<2)return '';const conv=r17ConvAtual(),cat=[...EXAMES,...PROCEDIMENTOS.map(p=>EX[p.c]).filter(Boolean)].filter((e,i,a)=>a.indexOf(e)===i);
 const r=cat.filter(e=>semAc(e.n+' '+e.c+' '+(e.s||'')).includes(q)&&r17Disp(e.c,conv)).slice(0,6);
 if(!r.length)return `<p style="font-size:14px;color:var(--fg2)">Nada encontrado em ${esc(conv)} para essa busca.</p>`;
 return `<div class="at-list">${r.map(e=>{const ja=NA.ex.some(x=>x.c===e.c);return `<button class="at-row at-pick" ${ja?'disabled':''} onclick="naAdd('${e.c}');naQFoco()"><div class="grow">${esc(e.n)}<small>${e.c} · ${r17TipoEx(e)}${prCfg(e.c).dep?' · depende de médico':''}</small></div><span class="at-price">${ja?'incluído':fmt(r17Preco(e.c,conv))}</span></button>`}).join('')}</div>`}
function r17Prazo(x){const e=EX[x.c],n=r17Dias(x.c);if(e.serv)return '';if(x.urg&&e.u)return `urgente: entrega hoje até ${hhmm(new Date(HOJE.getTime()+e.u*36e5))}`;return n?`entrega em ${n} ${n>1?'dias úteis':'dia útil'} (${dm(iso(maisUteis(n)))})`:'feito na visita'}
function r17Item(x,i){const e=EX[x.c],dep=prCfg(x.c).dep,aut=!!NA.autz,er=NA.err['med'+i],u=r17Cfg(x.c).urg;
 return `<div class="at-row r17-it"><div class="grow">${esc(e.n)}${e.semTuss?' <span class="tag">sem TUSS</span>':''}<small>${r17TipoEx(e)}${e.proc?' · TUSS '+e.c:''} · ${r17Prazo(x)}${x.urg&&x.taxa?` · taxa de urgência ${fmt(x.taxa)}`:''}</small>
 ${dep?`<div class="field ${er?'err':''}" style="margin:6px 0 0;max-width:360px"><label for="naMed${i}">Médico <span class="req">*</span> ${info('Procedimento que depende de médico: sem o médico não dá para autorizar.')}</label><select class="in" id="naMed${i}" ${aut?'disabled':''} onchange="NA.ex[${i}].med=this.value;delete NA.err['med${i}']"><option value="">Escolha o médico</option>${r17Medicos().map(m=>`<option value="${m.id}" ${x.med===m.id?'selected':''}>${esc(m.n)} · ${esc(m.esp||'')}</option>`).join('')}</select>${er?'<span class="msg">Obrigatório</span>':''}</div>`:''}
 <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap">${u.ok&&!aut?`<button class="chip at-chip-sm ${x.urg?'on':''}" onclick="r17Urg(${i})">${x.urg?'URGENTE':'Marcar urgente'}${u.v?` (+${u.tipo==='pct'?String(u.v).replace('.',',')+'%':fmt(+u.v)})`:''}</button>`:x.urg?'<span class="badge err">URGENTE</span>':''}${prExige(x.c)==='questionario'&&(prCfg(x.c).perg||[]).length?`<button class="btn sm ghost" onclick="r17ImprimirQuest(['${x.c}'])">${I.print||''} Imprimir questionário</button>`:''}</div></div>
 <span class="at-price">${fmt(x.p)}</span>${aut?'':`<button class="ibtn plain" aria-label="Editar ${esc(e.n)}" title="Editar" onclick="naEditItem(${i})">${I.edit||'✎'}</button><button class="ibtn plain" aria-label="Tirar ${esc(e.n)}" title="Tirar do pedido" onclick="NA.ex.splice(${i},1);NA.err={};naRender()">${I.x}</button>`}</div>`}
/* Nota 497: o orçamento é gravado sozinho enquanto os itens entram */
function r17AutoOrc(){if(!NA||NA.modo!=='atendimento'||NA.autz||!NA.ex.length||!NA.pac||!NA.pac.n)return;const conv=r17ConvAtual(),sig=JSON.stringify([conv,NA.ex.map(x=>[x.c,x.p,!!x.urg,x.med||''])]);if(sig===NA.orcSig)return;NA.orcSig=sig;
 const it=NA.ex.map(x=>({c:x.c,p:x.p,urg:!!x.urg,taxa:x.taxa||0,med:x.med||''}));let o=NA.orcAuto&&ORCS.find(x=>x.id===NA.orcAuto);if(!o&&NA.orc&&NA.usarOrc)o=NA.orc;
 if(!o){o={id:'ORC-0'+(SEQ_ORC++),cpf:NA.semCpf?'':NA.cpf,n:NA.pac.n,dn:NA.pac.dn,tel:NA.pac.tel,it,feito:iso(HOJE),val:iso(maisDias(30)),quem:'Você',prox:'',sit:'aberto',ct:[],unid:RC.unid,convenio:conv,auto:true};ORCS.unshift(o)}else Object.assign(o,{it,convenio:conv});
 NA.orcAuto=o.id;NA.orcH=hhmm(new Date())}
function r17Autorizar(){if(!NA.ex.length){toast('Inclua pelo menos um procedimento','warn');return}const e={},soClin=NA.ex.every(x=>EX[x.c].proc==='Consulta');
 NA.ex.forEach((x,i)=>{if(prCfg(x.c).dep&&!x.med)e['med'+i]=1});
 if(!NA.semSol&&!soClin){if(!String(NA.med||'').trim())e.med=1;if(!String(NA.crm||'').trim())e.crm=1}
 if(NA.tipo==='convenio'){if(!NA.conv)e.conv=1;if(!String(NA.cart||'').trim())e.cart=1}
 if(!String(NA.pac.mae||'').trim())e.mae=1;
 NA.err=e;if(Object.keys(e).length){naRender();toast(Object.keys(e).some(k=>/^med\d/.test(k))?'Informe o médico dos procedimentos que dependem de médico':'Preencha os campos obrigatórios','warn');return}
 if(NA.tipo==='convenio'&&!NA.anexo){toast('No convênio, anexe o pedido médico antes de autorizar','warn');return}
 r17AutoOrc();const o=ORCS.find(x=>x.id===NA.orcAuto);NA.fichaSeq=SEQ_AT;NA.ficha=RC.unid+'-000'+(SEQ_AT++);NA.autz={h:hhmm(new Date()),orc:o?o.id:''};
 if(o){o.sit='convertido';o.conv=NA.ficha;o.prox='';o.ct.push({d:`${dm(iso(HOJE))} ${NA.autz.h}`,c:'Balcão',r:`Orçamento autorizado: virou a ficha ${NA.ficha}.`,q:typeof USU_ORC!=='undefined'?USU_ORC:'Você'})}
 if(NA.sid){const s=RC.senhas.find(x=>x.id===NA.sid);if(s)rcHist(s,'recepcao','Orçamento autorizado',`${o?o.id+' virou a ':''}ficha ${NA.ficha}`)}
 naRender();toast(`Orçamento autorizado: ficha ${NA.ficha} criada`)}
function r17Desautorizar(){const o=NA.autz&&ORCS.find(x=>x.id===NA.autz.orc);if(o){o.sit='aberto';delete o.conv;o.ct.push({d:`${dm(iso(HOJE))} ${hhmm(new Date())}`,c:'Balcão',r:`Autorização desfeita; a ficha ${NA.ficha} foi descartada.`,q:typeof USU_ORC!=='undefined'?USU_ORC:'Você'})}
 NA.autz=null;NA.ficha=null;NA.fichaSeq=null;NA.orcSig='';naRender();toast('Autorização desfeita: o orçamento voltou a ficar aberto','warn')}
/* A ficha autorizada mantém o número quando o atendimento é concluído */
{const _c=naConcluir;naConcluir=function(){if(NA&&NA.modo==='atendimento'&&NA.fichaSeq!=null&&!NA.fim){const k=SEQ_AT;SEQ_AT=NA.fichaSeq;try{return _c.apply(this,arguments)}finally{SEQ_AT=Math.max(k,SEQ_AT)}}return _c.apply(this,arguments)}}
function r17ProcCard(){const e=NA.err,conv=r17ConvAtual(),aut=!!NA.autz,cv=NA.tipo==='convenio',sub=NA.ex.reduce((s,x)=>s+(x.p0!=null?x.p0:x.p),0),tx=NA.ex.reduce((s,x)=>s+(x.taxa||0)*(x.q||1),0),tot=NA.ex.reduce((s,x)=>s+x.p,0);
 const pr=clPrepJornada(NA.ex.map(x=>x.c));
 return `<div class="card at-card" id="naProc"><div class="row" style="justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">Convênio e procedimentos</h3>${aut?`<span class="badge ok">Ficha ${esc(NA.ficha)}</span>`:NA.orcAuto&&NA.ex.length?`<span class="tl">Orçamento <b class="mono">${esc(NA.orcAuto)}</b> salvo sozinho às ${esc(NA.orcH||'')}</span>`:''}</div>
 <div class="sub">Escolha o convênio: a busca mostra só o que ele cobre. Inclua quantos procedimentos precisar.</div>
 <div class="formgrid"><div class="field ${e.conv?'err':''}"><label for="naConv">Convênio <span class="req">*</span></label><select class="in" id="naConv" ${aut?'disabled':''} onchange="r17SetConv(this.value)">${r17Convs().map(c=>`<option ${c===conv?'selected':''}>${esc(c)}</option>`).join('')}</select>${e.conv?'<span class="msg">Obrigatório</span>':''}</div>
 ${cv?`<div class="field ${e.cart?'err':''}"><label for="naCart">Carteirinha <span class="req">*</span></label><input class="in" id="naCart" value="${esc(NA.cart)}" ${aut?'disabled':''} oninput="NA.cart=this.value">${e.cart?'<span class="msg">Obrigatório</span>':''}</div><div class="field"><label for="naGuia">Guia</label><input class="in" id="naGuia" value="${esc(NA.guia)}" ${aut?'disabled':''} oninput="NA.guia=this.value"></div>`:''}</div>
 ${cv?`<button class="btn ${!NA.anexo?'sec':'ghost'} sm" style="align-self:flex-start" ${aut?'disabled':''} onclick="NA.anexo=true;naRender()">${NA.anexo?'Pedido médico anexado ✓':'Anexar pedido médico (obrigatório no convênio)'}</button>`:''}
 ${aut?'':`<div class="inwrap">${LUPA}<input class="in" id="naQ" placeholder="Busque em ${esc(conv)}: nome, código TUSS ou sinônimo" autocomplete="off" oninput="NA_ACESO=-1;$('#naRes').innerHTML=r17Resultados(this.value)" onkeydown="naQTecla(event)" aria-label="Buscar procedimento"></div><div id="naRes"></div>`}
 ${NA.ex.length?`<div class="at-list">${NA.ex.map(r17Item).join('')}</div>`:`<div class="empty" style="padding:12px 8px"><h4>Nenhum procedimento ainda</h4><p>Busque acima para incluir.</p></div>`}
 ${!aut&&NA.ex.filter(x=>r17Cfg(x.c).urg.ok&&!x.urg).length>1?`<button class="btn ghost sm" style="align-self:flex-start" onclick="r17UrgTodos()">Marcar todos como urgentes</button>`:''}
 ${pr.length?`<div class="alert warn"><span><b>Preparo:</b> ${pr.map(esc).join('; ')}. Quando há vários itens, vale a orientação mais restritiva (por exemplo, o maior jejum).</span></div>`:''}
 <div class="at-totals">${tx?`<div><span>Procedimentos</span><span>${fmt(sub-tx)}</span></div><div><span>Taxa de urgência</span><span>${fmt(tx)}</span></div>`:''}${tot<sub-0.004?`<div><span>Plano ou pacote</span><span>− ${fmt(sub-tot)}</span></div>`:''}<div class="at-big"><span>Total</span><span>${fmt(tot)}</span></div></div>
 <h4 style="margin:12px 0 4px">Solicitante ${info('Informe por último, depois dos procedimentos. Só com o solicitante o orçamento pode ser autorizado.')}</h4>
 <div class="formgrid"><div class="field ${e.med?'err':''}"><label for="naSolM">Médico solicitante ${NA.semSol?'':'<span class="req">*</span>'}</label><input class="in" id="naSolM" value="${esc(NA.med)}" placeholder="Nome do médico" ${NA.semSol||aut?'disabled':''} oninput="NA.med=this.value">${e.med?'<span class="msg">Obrigatório</span>':''}</div>
 <div class="field ${e.crm?'err':''}"><label for="naSolC">Conselho e número ${NA.semSol?'':'<span class="req">*</span>'} ${info('O registro liga o exame ao portal do médico e ao aviso de valor crítico.')}</label><input class="in" id="naSolC" value="${esc(NA.crm)}" placeholder="CRM-CE 12345" ${NA.semSol||aut?'disabled':''} oninput="NA.crm=this.value">${e.crm?'<span class="msg">Obrigatório</span>':''}</div></div>
 <label class="check"><input type="checkbox" ${NA.semSol?'checked':''} ${cv||aut?'disabled':''} onchange="naSemSol(this.checked)">Sem solicitante ${info(cv?'No convênio a guia TISS exige o profissional solicitante.':'Para quem vem por conta própria (particular, sem pedido médico).')}</label>
 <div class="field ${e.mae?'err':''}" style="max-width:520px"><label for="naMae">Nome da mãe <span class="req">*</span></label><input class="in" id="naMae" value="${esc(NA.pac.mae||'')}" autocomplete="off" ${aut?'disabled':''} oninput="NA.pac.mae=this.value">${e.mae?'<span class="msg">Obrigatório</span>':''}</div>
 ${aut?`<div class="alert ok"><span>Orçamento ${esc(NA.autz.orc||'')} autorizado às ${esc(NA.autz.h)}: agora é a <b>ficha ${esc(NA.ficha)}</b>. Continue o atendimento para receber e faturar.</span></div>`:''}
</div>`}
/* Nota 467: "Dados clínicos e motivo" só quando há exame (laboratório ou imagem); só consulta, não aparece */
const r17TemExame=()=>NA.ex.some(x=>{const e=EX[x.c];return e&&!e.serv&&e.proc!=='Consulta'});
function r17Quest(g,a){const h=naQuestionario(g,a);return r17TemExame()?h:h.replace('<div class="field" style="grid-column:1/-1"><label for="naClin">','<div class="field" hidden style="grid-column:1/-1"><label for="naClin">')}
/* Nota 496: a prioridade vem do pré-atendimento; aqui só muda se precisar, com motivo e respeitando a prioridade legal */
const r17PriMin=dn=>{const a=dn?idade(dn):0;return a>=80?'ESP':a>=60?'PRI':''};
function r17PriPode(dn,p){const m=r17PriMin(dn);if(!m)return '';if(rcPeso(p).valor>=rcPeso(m).valor||p==='URG')return '';return `Pessoa com ${idade(dn)} anos tem ${rcPeso(m).n} garantida em lei (Estatuto da Pessoa Idosa, Lei 10.741/2003, art. 3º${m==='ESP'?', e Lei 13.466/2017':''}). Não dá para baixar.`}
const r17SenhaNA=()=>NA&&NA.sid?RC.senhas.find(x=>x.id===NA.sid):null;
function r17PriCard(){const s=r17SenhaNA(),p=s?s.peso:(NA.peso17||'NOR');if(s&&!NA.priIni){NA.priIni=1;NA.pri=s.peso==='NOR'?'':rcPeso(s.peso).n}
 return `<div class="card at-card"><div class="row" style="justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><div><h3 style="margin:0">Prioridade</h3><div class="sub" style="margin:2px 0 0">${s?`Definida no pré-atendimento (senha ${esc(s.num)}). Mude só se precisar.`:'Sem senha: Normal, a não ser que você mude.'}</div></div><div class="row" style="gap:8px;align-items:center">${rcPesoTag(p)}<button class="btn sm sec" onclick="r17PriModal()">Alterar</button></div></div>${NA.priMot?`<p class="tl" style="margin:6px 0 0">Alterada: ${esc(NA.priMot)}</p>`:''}</div>`}
function r17PriForm(atual,dn,ok){return `<div class="mb"><div class="field"><label for="r17Pri">Nova prioridade</label><select class="in" id="r17Pri">${rcOpts(RC.cfg.pesos.filter(p=>rcPesoUnid(p,RC.unid)).map(p=>[p.id,p.n]),atual)}</select></div><div class="field"><label for="r17PriM">Motivo <span class="req">*</span></label><input class="in" id="r17PriM" autocomplete="off" placeholder="Ex.: exame com jejum; gestante"></div>${r17PriMin(dn)?`<p class="tl">Pessoa com ${idade(dn)} anos: a prioridade não pode ficar abaixo de ${esc(rcPeso(r17PriMin(dn)).n)}.</p>`:''}<p class="tl">Fica registrado com quem mudou e quando.</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="${ok}">Salvar</button></div>`}
function r17PriModal(){const s=r17SenhaNA();openModal(mh('Alterar prioridade')+r17PriForm(s?s.peso:(NA.peso17||'NOR'),NA.pac.dn,'r17PriOk()'))}
function r17PriOk(){const p=$('#r17Pri').value,m=($('#r17PriM').value||'').trim(),s=r17SenhaNA();if(!m){toast('Informe o motivo','warn');return}const er=r17PriPode(NA.pac.dn,p);if(er){toast(er,'warn');return}
 const de=s?s.peso:(NA.peso17||'NOR');if(s){s.peso=p;s.log.push(`Prioridade alterada às ${hhmm(new Date())}: ${rcPeso(de).n} para ${rcPeso(p).n} (${m})`);rcHist(s,'recepcao','Prioridade alterada',`${rcPeso(de).n} para ${rcPeso(p).n}: ${m}`);RC.at.filter(e=>e.sid===s.id).forEach(e=>e.peso=p)}else NA.peso17=p;
 NA.pri=p==='NOR'?'':rcPeso(p).n;NA.priMot=`${rcPeso(de).n} para ${rcPeso(p).n}, ${m}`;closeModal();naRender();toast('Prioridade alterada')}
/* Mesma regra na sala de espera (Atendimentos): o seletor vira um botão Alterar, com motivo */
function r17AtPriModal(id){const e=rcAtDa(id);if(!e)return;const pc=e.cpf?rcPacCpf(e.cpf):rcPacNome(e.pac);openModal(mh('Alterar prioridade · '+esc(e.num))+r17PriForm(e.peso,pc&&pc.dn,`r17AtPriOk(${id})`))}
function r17AtPriOk(id){const e=rcAtDa(id),p=$('#r17Pri').value,m=($('#r17PriM').value||'').trim();if(!e)return;if(!m){toast('Informe o motivo','warn');return}const pc=e.cpf?rcPacCpf(e.cpf):rcPacNome(e.pac),er=r17PriPode(pc&&pc.dn,p);if(er){toast(er,'warn');return}
 const de=e.peso;closeModal();rcHist(e,'recepcao','Prioridade alterada na espera',`${rcPeso(de).n} para ${rcPeso(p).n}: ${m}`);rcAtPeso(id,p)}
{const _l=rcAtLinhas;rcAtLinhas=function(l,tipo){const h=_l.apply(this,arguments);return tipo!=='espera'?h:h.replace(/<div style="margin-top:4px"><select[^>]*onchange="rcAtPeso\((\d+),this\.value\)">[\s\S]*?<\/select><\/div>/g,(x,id)=>`<div style="margin-top:4px"><button class="btn sm ghost" onclick="r17AtPriModal(${id})">Alterar</button></div>`)}}
/* Barra final: orçamento automático, autorizar, e depois continuar para receber e faturar */
function r17Fim(){const aut=!!NA.autz;return `<div class="at-end"><button class="btn ghost" onclick="NA.passo=1;naRender(true)">Voltar</button>${NA.ex.length?`<button class="btn sec" onclick="r17ImprimirDoc('${aut?'ficha':'orc'}')">${I.print||''} Imprimir ${aut?'ficha':'orçamento'}</button>`:''}${aut?`<button class="btn ghost" onclick="r17Desautorizar()">Desfazer autorização</button><button class="btn" onclick="naP2Ok()">Continuar atendimento e faturar</button>`:`<button class="btn" onclick="r17Autorizar()" ${NA.ex.length?'':'disabled'}>Autorizar orçamento</button>`}</div>`}
{const _p2=naP2;naP2=function(){if(!NA||NA.modo!=='atendimento')return _p2.apply(this,arguments);r17Norm();naPlRecalc();
 const temGest=NA.pac.sx==='F'&&NA.ex.some(x=>(EX[x.c].q||[]).includes('gest')),temAnti=NA.ex.some(x=>(EX[x.c].q||[]).includes('anticoag'));
 r17AutoOrc();return `${naPacCard()}${naPlCard()}${r17ProcCard()}${r17Quest(temGest,temAnti)}${r17PriCard()}${r17Fim()}`}}

/* ---------- Impressão: orçamento e ficha com prazo de entrega; questionário para o paciente (nota 498) ---------- */
function r17Print(tit,corpo){const fr=document.createElement('iframe');fr.style.cssText='position:fixed;width:0;height:0;border:0';fr.srcdoc=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(tit)}</title><style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;color:#000;font-size:11pt}h1{font-size:16pt;margin:0 0 4px}h2{font-size:12pt;margin:16px 0 6px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #999;padding:5px 4px;text-align:left;vertical-align:top}td.r,th.r{text-align:right}.tl{color:#444;font-size:9.5pt}.q{margin:10px 0}.ln{border-bottom:1px solid #000;height:22px}</style></head><body>${corpo}</body></html>`;fr.onload=()=>{fr.contentWindow.focus();fr.contentWindow.print();setTimeout(()=>fr.remove(),60000)};document.body.appendChild(fr)}
function r17DocHtml(tipo){const p=NA.pac,conv=r17ConvAtual(),aut=tipo==='ficha',tot=NA.ex.reduce((s,x)=>s+x.p,0),tx=NA.ex.reduce((s,x)=>s+(x.taxa||0)*(x.q||1),0),pr=clPrepJornada(NA.ex.map(x=>x.c));
 const id=aut?'Ficha '+(NA.ficha||(NA.fim&&NA.fim.prot)||''):'Orçamento '+(NA.orcAuto||'');
 return `<h1>${esc(id)}</h1><div class="tl">${esc(rcUnidNome(RC.unid))} · emitido em ${dmy(iso(HOJE))} às ${hhmm(new Date())}</div>
 <h2>Paciente</h2><div>${esc(p.n)} · CPF ${esc(r17CpfCurto(NA.semCpf?'':NA.cpf))}${p.dn?' · nascimento '+dmy(p.dn):''}</div><div>Convênio: ${esc(conv)}${NA.cart?' · carteirinha '+esc(NA.cart):''}</div><div>Solicitante: ${esc(NA.semSol?'Sem solicitante':[NA.med,NA.crm].filter(Boolean).join(' · ')||'a informar')}</div>
 <h2>Procedimentos</h2><table><thead><tr><th>Procedimento</th><th>Prazo de entrega</th><th class="r">Valor</th></tr></thead><tbody>${NA.ex.map(x=>`<tr><td>${esc(EX[x.c].n)}${x.urg?' <b>(urgente)</b>':''}${x.med?`<div class="tl">Médico: ${esc((PROF(x.med)||{n:''}).n)}</div>`:''}${x.urg&&x.taxa?`<div class="tl">Inclui taxa de urgência de ${fmt(x.taxa)}</div>`:''}</td><td>${esc(r17Prazo(x)||'Não se aplica')}</td><td class="r">${fmt(x.p)}</td></tr>`).join('')}</tbody></table>
 <p style="text-align:right">${tx?`Taxa de urgência incluída: ${fmt(tx)}<br>`:''}<b>Total: ${fmt(tot)}</b></p>
 ${pr.length?`<h2>Preparo</h2><ul>${pr.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`:''}
 ${aut?'':`<p class="tl">Orçamento válido por 30 dias. Prazos em dias úteis, contados a partir do atendimento.</p>`}`}
function r17ImprimirDoc(tipo){if(!NA||!NA.ex.length){toast('Inclua pelo menos um procedimento','warn');return}r17AutoOrc();r17Print(tipo==='ficha'?'Ficha':'Orçamento',r17DocHtml(tipo));toast(tipo==='ficha'?'Ficha enviada para a impressora':'Orçamento enviado para a impressora')}
/* Questionário impresso em branco, só com o nome do paciente: as respostas (dado de saúde) ficam no papel com o paciente até voltarem ao sistema */
function r17ImprimirQuest(cods){const l=(cods||[]).filter(c=>(prCfg(c).perg||[]).length);if(!l.length){toast('Nenhuma pergunta configurada','warn');return}const n=NA&&NA.pac&&NA.pac.n?NA.pac.n:'';
 r17Print('Questionário',`<h1>Questionário</h1><div class="tl">${esc(rcUnidNome(RC.unid))} · ${dmy(iso(HOJE))}</div><p>Paciente: ${n?esc(n):'<span class="ln" style="display:inline-block;width:70%"></span>'}</p>${l.map(c=>`<h2>${esc(prqNome(c))}</h2>${prCfg(c).perg.map((x,i)=>`<div class="q"><b>${i+1}. ${esc(x.q)}</b>${x.ob?' *':''}<div>${x.t==='sn'?'( ) Sim &nbsp;&nbsp; ( ) Não':x.t==='esc'?(x.ops||[]).map(o=>'( ) '+esc(o)).join(' &nbsp;&nbsp; '):'<div class="ln"></div><div class="ln"></div>'}</div></div>`).join('')}`).join('')}<p class="tl">* resposta obrigatória. Entregue este papel à recepção ou à sala do exame.</p><p style="margin-top:30px">Assinatura do paciente ou responsável: ______________________________</p>`);toast('Questionário enviado para a impressora')}
{const _fim=naFim;naFim=function(){const h=_fim.apply(this,arguments);return NA&&NA.fim&&NA.fim.tipo==='at'&&NA.ex&&NA.ex.length?h.replace('<button class="btn sec" onclick="docComprovante()"',`<button class="btn sec" onclick="r17ImprimirDoc('ficha')">${I.print||''} Imprimir ficha</button><button class="btn sec" onclick="docComprovante()"`):h}}

document.head.insertAdjacentHTML('beforeend',`<style>
.filters.pac-filtros.r17-pf{grid-template-columns:minmax(0,2.2fr) minmax(0,1.3fr) minmax(0,1.3fr) minmax(0,1.3fr) minmax(0,1fr) auto;align-items:end}
@media (max-width:900px){.filters.pac-filtros.r17-pf{grid-template-columns:1fr 1fr}}
@media (min-width:761px){.r17-pac-tab .at-table th,.r17-pac-tab .at-table td{text-align:center}}
.r17-esc{display:grid;grid-template-columns:1fr 1fr;gap:10px}.r17-esc .btn{height:48px}
.r17-qlist{display:flex;flex-direction:column;gap:2px;max-height:220px;overflow:auto;border:1px solid var(--border);border-radius:8px;padding:6px 10px}
.r17-bq{display:grid;grid-template-columns:1fr 170px auto;gap:6px;margin-bottom:6px;align-items:center}
.r17-it .grow small{display:block}
@media (max-width:640px){.r17-esc{grid-template-columns:1fr}.r17-bq{grid-template-columns:1fr}}
</style>`);
