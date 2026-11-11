/* Rodada 17 (11/11/2026) · agenda */
/* ==========================================================================
   Notas 444 a 504 da Agenda: Agendamentos, Abrir agenda, Fila de Pré-agendamento,
   Agendamento a partir da fila, avisos do Início e botão de olho das anotações.
   Fica depois de telas-r17-recepcao.js: só acrescenta funções e embrulha as que já existem.
   ========================================================================== */

/* ---------- Trilha de auditoria: quem fez, quando e o quê (nota 504) ----------
   Toda movimentação que passa por rcHist entra aqui, além de bloqueios e desbloqueios de vagas. */
const AG_AUD=[];
const r17Hora=()=>{const d=new Date(),z=n=>String(n).padStart(2,'0');return z(d.getHours())+':'+z(d.getMinutes())+':'+z(d.getSeconds())};
const r17ProfId=n=>{if(!n)return '';const p=PROFISSIONAIS.find(x=>x.n===n||x.id===n);return p?p.id:''};
function r17DiaDe(x){const s=(x&&x.src)||x||{},d=s.data||x.data||s.dia||x.dia||'';if(/^\d{4}-\d\d-\d\d$/.test(d))return d;if(d==='hoje')return RC_HOJE;if(/^\d\d\/\d\d$/.test(d))return RC_HOJE.slice(0,4)+'-'+d.slice(3,5)+'-'+d.slice(0,2);return (location.hash==='#agenda'&&RC.ca&&RC.ca.dia)||''}
function r17Aud(acao,o){o=o||{};AG_AUD.unshift({op:o.op||rcResp(),d:o.d||RC_HOJE,hr:o.hr||r17Hora(),acao,prof:o.prof||'',dia:o.dia||'',h:o.h||''})}
{const _h=rcHist;rcHist=function(x,t,tit,txt,prof){const r=_h.apply(this,arguments);try{const pac=x&&(x.pac||x.n);if(pac)r17Aud(`${tit}${txt?': '+txt:''} · Paciente: ${pac}`,{prof:r17ProfId(prof)||(x.prof&&PROFISSIONAIS.some(y=>y.id===x.prof)?x.prof:''),dia:r17DiaDe(x),h:((x.src||x).h)||''})}catch(e){}return r}}
/* O que já estava no histórico da agenda antes desta rodada também aparece (operador e hora vêm do registro) */
function r17AudSeed(){RC.hist.filter(x=>x.t==='agenda').slice().reverse().forEach(x=>{const q=x.quem||'',hr=(q.match(/^\d\d:\d\d/)||[''])[0],op=(q.match(/Responsável: ([^·]+)/)||['',''])[1].trim(),pf=(q.match(/Profissional: ([^·]+)/)||['',''])[1].trim();AG_AUD.push({op:op||'Sistema',d:x.d||RC_HOJE,hr:hr?hr+':00':'',acao:`${x.tit}${x.txt?': '+x.txt:''} · Paciente: ${x.pac}`,prof:r17ProfId(pf),dia:x.d||'',h:''})})}
{const _rc=rc;rc=function(){const r=_rc.apply(this,arguments);if(typeof RC!=='undefined'&&RC&&RC.hist&&!RC.r17aud){RC.r17aud=true;try{if(!AG_AUD.length)r17AudSeed()}catch(e){}}return r}}
/* Bloquear e desbloquear vagas também ficam registrados */
{const _a=rcDiaAcao;rcDiaAcao=function(i,v){const x=RC.diaL&&RC.diaL[i],C=RC.ca;const r=_a.apply(this,arguments);if(x&&(v==='BLOQ'||v==='LIB'))r17Aud(`${v==='BLOQ'?'Vaga bloqueada':'Vaga desbloqueada'}: ${rcDiaBr(C.dia)} às ${x.h} · ${PROF(C.prof).n}`,{prof:C.prof,dia:C.dia,h:x.h});return r}}
{const _b=rcDiaBloqTodos;rcDiaBloqTodos=function(){const C=RC.ca,n=rcDiaLivres().length;const r=_b.apply(this,arguments);if(n)r17Aud(`${n} vaga(s) bloqueada(s) de uma vez: ${rcDiaBr(C.dia)} · ${PROF(C.prof).n}`,{prof:C.prof,dia:C.dia});return r}}
{const _d=rcDiaDesbloqTodos;rcDiaDesbloqTodos=function(){const C=RC.ca,n=rcDiaBloqs().length;const r=_d.apply(this,arguments);if(n)r17Aud(`${n} vaga(s) desbloqueada(s) de uma vez: ${rcDiaBr(C.dia)} · ${PROF(C.prof).n}`,{prof:C.prof,dia:C.dia});return r}}
const R17_AUD_ESC=[['h','Este horário'],['dia','Agenda do dia'],['tudo','Todo o sistema no dia']];
function r17AudLista(D){const e=D.audE||'dia';return AG_AUD.filter(x=>e==='tudo'?(x.dia===D.dia||x.d===D.dia):x.prof===D.prof&&x.dia===D.dia&&(e==='dia'||x.h===D.h))}
function r17AudHtml(D){const e=D.audE||'dia',l=r17AudLista(D);
 return `<div class="row" style="justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px"><h4 style="margin:0">Auditoria · ${rcDiaTxt(D.dia)}</h4><div class="row" style="gap:6px" role="group" aria-label="Período da auditoria">${R17_AUD_ESC.map(([k,t])=>chip(k==='h'?`${t} (${rcEhChegada(D.h)?'chegada':D.h})`:t,e===k,`RC.det.audE='${k}';rcDetPinta()`)).join('')}</div></div>
 ${tabela(['Operador','Data e Hora','Ação'],l.map(x=>`<tr>${td('Operador',esc(x.op))}${td('Data e Hora',`<span class="mono">${dmy(x.d)}${x.hr?' às '+x.hr:''}</span>`)}${td('Ação',esc(x.acao))}</tr>`),'Nenhuma movimentação registrada neste período')}<p class="tl" style="margin:6px 0 0">Registro automático e somente leitura: não dá para apagar nem editar.</p>`}

/* ---------- Reagendar: calendário só com as datas de agenda aberta do profissional e só horários livres (notas 444 e 446) ---------- */
function r17ReVagas(D,k){const vs=RC.agendas.filter(a=>a.prof===D.prof&&a.procs.includes(D.proc)&&rcDiaAberto(a,k)).sort((a,b)=>(b.unid===RC.unid)-(a.unid===RC.unid))
  .flatMap(a=>rcLivres(a,k).filter(h=>!(k===D.dia&&h===D.h)&&rcProcsDoHorario(a,k,h).includes(D.proc)).map(h=>({id:a.id,h,unid:a.unid})));
 const vis=new Set(),out=[];let ch=null;vs.forEach(v=>{if(rcEhChegada(v.h)){if(!ch){ch={...v,n:0};out.push(ch)}ch.n++;return}if(vis.has(v.h))return;vis.add(v.h);out.push(v)});
 return out.sort((a,b)=>rcEhChegada(a.h)-rcEhChegada(b.h)||a.h.localeCompare(b.h))}
function rcDetVagas(D){return r17ReVagas(D,D.reD)}
const r17ReAberta=(D,k)=>k>=RC_HOJE&&RC.agendas.some(a=>a.prof===D.prof&&a.procs.includes(D.proc)&&rcDiaAberto(a,k));
function r17ReCal(D){const [an,me]=D.reM,prim=new Date(an,me,1),n=new Date(an,me+1,0).getDate(),cel=[];for(let i=0;i<prim.getDay();i++)cel.push('<div></div>');
 for(let d=1;d<=n;d++){const k=iso(new Date(an,me,d)),ab=r17ReAberta(D,k),q=ab?r17ReVagas(D,k).length:0;
  cel.push(ab?`<button type="button" class="rc-d ${q?'on':'cheio'} ${k===D.reD?'r17-sel':''} ${k===RC_HOJE?'hj':''}" ${q?`onclick="rcDetReDia('${k}')"`:'disabled'} aria-label="${d} de ${RC_MESES[me]}: ${q?q+' horário(s) livre(s)':'agenda aberta sem vaga'}"><b>${d}</b><small>${q?q+(q>1?' livres':' livre'):'sem vaga'}</small></button>`:`<div class="rc-d r17-off" aria-hidden="true"><b>${d}</b></div>`)}
 const volta=new Date(an,me,1)>new Date(+RC_HOJE.slice(0,4),+RC_HOJE.slice(5,7)-1,1);
 return `<div class="r17-mini"><div class="r17-mini-h"><button type="button" class="btn sm ghost" ${volta?'':'disabled'} onclick="r17ReMes(-1)" aria-label="Mês anterior">‹</button><b>${RC_MESES[me]} de ${an}</b><button type="button" class="btn sm ghost" onclick="r17ReMes(1)" aria-label="Próximo mês">›</button></div><div class="rc-mes r17-sem">${['D','S','T','Q','Q','S','S'].map(x=>`<span>${x}</span>`).join('')}</div><div class="rc-mes">${cel.join('')}</div><div class="cl-leg"><span><i style="background:var(--accent-soft);border:1px solid var(--accent)"></i>Agenda aberta com vaga</span><span><i style="background:var(--warn-soft);border:1px solid var(--warn)"></i>Aberta, sem vaga</span><span><i style="background:var(--surface2);border:1px solid var(--border)"></i>Sem agenda</span></div></div>`}
function r17ReMes(n){const D=RC.det,d=new Date(D.reM[0],D.reM[1]+n,1);D.reM=[d.getFullYear(),d.getMonth()];rcDetPinta()}
/* Primeira abertura: vai direto para a primeira data com vaga */
function r17ReIni(D){if(D.reIni)return;D.reIni=true;const base=D.reD>RC_HOJE?D.reD:RC_HOJE;let k=base;for(let i=0;i<120;i++){const d=rcSomaDia(base,i);if(r17ReAberta(D,d)&&r17ReVagas(D,d).length){k=d;break}}D.reD=k;D.reM=[+k.slice(0,4),+k.slice(5,7)-1]}
function r17RePainel(D){r17ReIni(D);if(!D.reM)D.reM=[+D.reD.slice(0,4),+D.reD.slice(5,7)-1];const v=rcDetVagas(D),ab=r17ReAberta(D,D.reD);
 const op=s=>rcEhChegada(s.h)?`Ordem de chegada (${s.n} vaga${s.n>1?'s':''})`:`às ${s.h}`+(s.unid!==RC.unid?' · '+rcUnidNome(s.unid):'');
 return `<h4 style="margin:0 0 8px">Reagendar</h4><div class="r17-re">${r17ReCal(D)}<div class="r17-re-d"><div class="field"><span class="r17-lab">Nova data</span><b class="r17-re-dia">${rcDiaLongo(D.reD)}</b></div><div class="field"><label for="rcDetH">Horário</label><select class="in" id="rcDetH" ${v.length?'':'disabled'} onchange="const o=this.selectedOptions[0];if(o&&o.value)rcDetReSel(o.dataset.ag,o.value)"><option value="">${v.length?'Selecione o horário':ab?'Sem horário livre nesta data':'Sem agenda aberta nesta data'}</option>${v.map(s=>`<option value="${s.h}" data-ag="${s.id}" ${D.reS&&D.reS.h===s.h?'selected':''}>${esc(op(s))}</option>`).join('')}</select></div><p class="tl" style="margin:0 0 10px">${v.length} horário(s) livre(s). Ocupados e bloqueados não aparecem, para não marcar dois pacientes no mesmo horário.</p><button class="btn" ${D.reS?'':'disabled'} onclick="rcDetReagendar()">Confirmar novo horário</button></div></div>`}

/* ---------- Detalhes do agendamento: reagendar e auditoria novos; o resto igual (notas 444, 446 e 504) ---------- */
function rcDetPinta(){const D=RC.det,p=D.p,a=RC.agendas.find(x=>x.prof===D.prof&&rcDiaAberto(x,D.dia)&&rcSlots(x,D.dia).includes(D.h)),procs=[...new Set([D.proc,...(a?rcProcsDoHorario(a,D.dia,D.h):[])])],conv=[...new Set([D.conv,...rcModal()])],guias=p.cpf||p.n?rcGuiasDe(p):[];
 let pn='';if(D.painel==='guias')pn=`<h4 style="margin:0 0 6px">Guias do paciente</h4>${guias.length?`<div class="at-list">${guias.map(g=>`<div class="at-row"><div class="grow">${esc(g)}</div></div>`).join('')}</div>`:'<p class="tl" style="margin:0">Nenhuma guia vinculada a este paciente.</p>'}`;
 if(D.painel==='re')pn=r17RePainel(D);
 if(D.painel==='aud')pn=r17AudHtml(D);
 const h=`${mh('Detalhes do agendamento')}<div class="mb"><div class="rc-det-top"><div class="rc-det-prof">${esc(PROF(D.prof).n)}</div><div class="rc-det-qd">${rcDiaTxt(D.dia)} · ${rcHoraTxt(D.h)}</div></div><div class="rc-det-pac"><b>${esc(p.n)}</b><span>Nascimento: ${p.dn?dmy(p.dn):'não informado'}</span></div><div class="formgrid" style="margin-top:8px"><div class="field"><label for="rcDetT">Telefone</label><input class="in" id="rcDetT" value="${esc(D.tel)}" oninput="this.value=mTel(this.value);rcDetCampo('tel',this.value)"></div><div class="field"><label for="rcDetC">Convênio</label><select class="in" id="rcDetC" onchange="rcDetCampo('conv',this.value)">${rcOpts(conv.map(c=>[c,c]),D.conv)}</select></div><div class="field" style="grid-column:1/-1"><label for="rcDetP">Procedimento</label><select class="in" id="rcDetP" onchange="rcDetCampo('proc',this.value)">${rcOpts(procs.map(c=>[c,clProcNome(c)]),D.proc)}</select></div></div><div class="rc-det-ac"><button class="btn sm sec" onclick="rcDetPainel('guias')">Guia de Atendimento</button><button class="btn sm sec" ${D.src.autorizado?'disabled':''} onclick="rcDetAutorizar()">${D.src.autorizado?'Atendimento autorizado':'Autorizar Atendimento'}</button><button class="btn sm sec" onclick="rcDetPainel('re')">Reagendar</button><button class="btn sm sec" onclick="rcDetPainel('aud')">Ver Auditoria</button></div>${pn?`<div class="rc-det-p">${pn}</div>`:''}</div><div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn" onclick="rcDetSalvar()">Salvar Alterações</button></div>`;if(modalAberto())$('#modal').innerHTML=h;else openModal(h,'wide')}

/* ---------- Agenda do dia: desbloquear todas pede confirmação, como o bloqueio (nota 449); tabela com nomes maiores (notas 458 e 500) ---------- */
{const _d=rcDiaHtml;rcDiaHtml=function(){return _d.apply(this,arguments).replace('onclick="rcDiaDesbloqTodos()"','onclick="rcDiaDesbloqTodosModal()"').replace('<table class="at-table">','<table class="at-table r17-dia">')}}
function rcDiaDesbloqTodosModal(){const n=rcDiaBloqs().length;if(!n){toast('Não há vaga bloqueada nesta data','warn');return}modalOk('Desbloquear todas as vagas bloqueadas?',`<p><b>${n}</b> vaga(s) de <b>${rcDiaLongo(RC.ca.dia)}</b> voltam a ficar disponíveis para agendamento. Quem já está agendado não muda.</p>`,'Desbloquear todas','rcDiaDesbloqTodos()')}

/* ---------- Abrir agenda: sem o "Recepção" e sem o texto de apoio no topo (notas 462 e 463) ---------- */
{const _ab=VIEWS['abertura-agenda'];VIEWS['abertura-agenda']=function(){return _ab.apply(this,arguments).replace(/<div class="pagehead"><div><div class="crumbs">Recepção<\/div><h1>Abrir agenda<\/h1>(<p [^>]*>[^<]*<\/p>)?/,'<div class="pagehead"><div><h1>Abrir agenda</h1>')}}

/* ---------- Início: botão + para criar aviso e lápis para editar ou excluir (nota 448) ----------
   Só a gestão e a administração veem o lápis (regra das notas 244 e 314). Fora do modo de edição, os avisos ficam limpos. */
let R17_AV_ED=false;
{const _hm=VIEWS.home;VIEWS.home=function(){let h=_hm.apply(this,arguments);const pode=avisoDiaPode(),ed=R17_AV_ED&&pode;
 h=h.replace('<section class="card at-card" aria-label="Avisos do Dia">',`<section class="card at-card r17-av${ed?' r17-av-ed':''}" aria-label="Avisos do Dia">`);
 if(pode)h=h.replace(`<h3>Avisos do Dia</h3>${avisoMaisBtn()}`,`<h3>Avisos do Dia</h3><span class="r17-av-bts">${avisoMaisBtn()}<button type="button" class="btn sm ${ed?'':'sec'} aviso-mais" title="${ed?'Concluir a edição':'Editar ou excluir avisos'}" aria-label="${ed?'Concluir a edição dos avisos':'Editar ou excluir avisos'}" aria-pressed="${ed}" onclick="R17_AV_ED=!R17_AV_ED;reView()">${ed?I.check:I.edit}</button></span>${ed?'<p class="tl r17-av-dica">Modo de edição: use Editar ou Excluir em cada aviso. Clique no ✓ para concluir.</p>':''}`);
 return h}}

/* ---------- Fila de Pré-agendamento (notas 475 a 478) ----------
   Sem os atalhos Agendamento e Agendamentos realizados; Novo pré-agendamento ao lado do título; indicador Todos. */
VIEWS['pre-agendamento']=()=>{rc();const F=RC.preF,c=k=>RC.pre.filter(x=>x.st===k).length;
 return `<div class="pagehead"><div><div class="crumbs">Recepção</div><div class="r17-tit"><h1>Fila de Pré-agendamento</h1><button class="btn" onclick="rcPreNovo()">${I.plus} Novo pré-agendamento</button></div><p style="color:var(--fg2);margin-top:4px">Quem quer atendimento e ainda não tem agenda ou horário. Retome o contato quando abrir.</p></div><div class="tools"></div></div>
 <div class="mini rc-pre-st r17-pre-st">${miniKpi('Todos',RC.pre.length,F.st?'':'filtrando',F.st?'':'on',"RC.preF.st='';reView()")}${RC_PRE_ST.map(s=>miniKpi(s,c(s),F.st===s?'filtrando':'',(F.st===s?'on ':'')+(rcPreBadge(s)==='err'?'err':rcPreBadge(s)==='warn'?'warn':rcPreBadge(s)==='ok'?'ok':''),`rcPreFiltroSt('${s}')`)).join('')}</div>
 <div class="filters" style="margin-top:12px"><div class="inwrap" style="flex:1 1 220px">${LUPA}<input class="in" placeholder="Paciente ou profissional" value="${esc(F.q)}" oninput="RC.preF.q=this.value;$('#rcPrB').innerHTML=rcPreRows()" aria-label="Buscar"></div><input class="in" style="width:240px" list="rcPrProfs" placeholder="Profissional" value="${esc(F.profQ||'')}" oninput="rcPreProfFiltro(this.value)" aria-label="Profissional"><datalist id="rcPrProfs">${[...new Set(RC.pre.map(x=>PROF(x.prof).n))].sort().map(n=>`<option value="${esc(n)}">`).join('')}</datalist></div>
 <div class="tablewrap"><table class="at-table"><thead><tr>${['Paciente','Profissional','Procedimento','Agenda','Situação',''].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody id="rcPrB">${rcPreRows()}</tbody></table></div>`};

/* ---------- Novo pré-agendamento: campos com digitação, procedimentos do profissional e convênio (notas 479, 480 e 487) ----------
   Procedimentos de cada especialidade: dados de exemplo, somados aos das agendas já abertas do profissional. */
const R17_ESP_PROCS={'Clínica médica':['10101012','10101039','40101010','20104090'],'Radiologia e ultrassonografia':['40901122','40901300','40901467','40901483','40901530'],'Ginecologia e obstetrícia':['10101012','10101039','40901467','40901483','40901530'],'Cardiologia':['10101012','10101039','40101010'],'Gastroenterologia':['10101020','10101039','40202615'],'Enfermagem':['20104090','20104138']};
function r17ProcsProf(id){const p=id&&PROFISSIONAIS.find(x=>x.id===id);if(!p)return [];const e=(p.esp||'').split(' (')[0],l=[...(R17_ESP_PROCS[e]||[]),...RC.agendas.filter(a=>a.prof===id).flatMap(a=>a.procs||[])];return [...new Set(l)].filter(c=>PROCEDIMENTOS.some(x=>x.c===c))}
const R17_PRE={cpf:'',prof:'',proc:''};
function r17PreProcCampo(){const P=R17_PRE,l=r17ProcsProf(P.prof),pf=P.prof&&PROFISSIONAIS.find(x=>x.id===P.prof);
 const campo=!P.prof?'<input class="in" id="prCq" disabled placeholder="Escolha o profissional primeiro">':!l.length?'<input class="in" id="prCq" disabled placeholder="Nenhum procedimento cadastrado">':cbHtml({id:'prCq',val:P.proc,ph:'Digite o procedimento',min:1,fn:'r17PreProc',itens:l.map(c=>({v:c,t:clProcNome(c)}))});
 return `<label for="prCq">Procedimento ou especialidade <span class="req">*</span></label>${campo}<input type="hidden" id="prC" value="${esc(P.proc)}">${pf?`<small class="tl r17-dica">${l.length?`Só o que ${esc(pf.n)} realiza (${esc(pf.esp)}).`:'Este profissional não tem procedimentos para agendar.'}</small>`:''}`}
function r17PrePac(v){R17_PRE.cpf=v||'';$('#prP').value=R17_PRE.cpf}
function r17PreProf(v){const P=R17_PRE;P.prof=v||'';$('#prM').value=P.prof;if(!r17ProcsProf(P.prof).includes(P.proc))P.proc='';const w=$('#r17PrCw');if(w)w.innerHTML=r17PreProcCampo()}
function r17PreProc(v){R17_PRE.proc=v||'';$('#prC').value=R17_PRE.proc}
function rcPreNovo(){rc();const A=location.hash==='#agendamento'?RC.agd:{},u=A.unid||RC.unid,P=R17_PRE;P.cpf=A.cpf||'';P.prof=A.prof||'';P.proc=A.proc&&r17ProcsProf(P.prof).includes(A.proc)?A.proc:'';
 const pac=PACIENTES.filter(p=>p.ativo&&p.cpf).sort((a,b)=>a.n.localeCompare(b.n,'pt-BR')).map(p=>({v:p.cpf,t:p.n+' · '+cpfMask(p.cpf),nome:p.n,s:'CPF '+cpfMask(p.cpf)}));
 const profs=PROFISSIONAIS.filter(p=>p.ativo).sort((a,b)=>rcNomeOrdem(a).localeCompare(rcNomeOrdem(b),'pt-BR')).map(p=>({v:p.id,t:p.n+' · '+p.esp,nome:p.n,s:p.esp}));
 openModal(`${mh('Novo pré-agendamento')}<div class="mb"><div class="formgrid r17-pre-f"><div class="field"><label for="prPq">Paciente <span class="req">*</span></label>${cbHtml({id:'prPq',val:P.cpf,ph:'Digite o nome ou o CPF',min:2,fn:'r17PrePac',icone:CB_ICONE,itens:pac})}<input type="hidden" id="prP" value="${esc(P.cpf)}"></div>
 <input type="hidden" id="prU" value="${u}"><div class="field"><label for="prMq">Profissional desejado <span class="req">*</span></label>${cbHtml({id:'prMq',val:P.prof,ph:'Digite o nome ou a especialidade',min:2,fn:'r17PreProf',icone:CB_ICONE,itens:profs})}<input type="hidden" id="prM" value="${esc(P.prof)}"></div>
 <div class="field" id="r17PrCw">${r17PreProcCampo()}</div>
 <div class="field"><label for="prV">Convênio</label><select class="in" id="prV">${rcOpts(rcModal().map(m=>[m,m]),A.conv||'Particular')}</select></div></div>
 <div class="field"><label for="prO">Observações</label><textarea class="in" id="prO" rows="2" style="height:auto"></textarea></div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="rcPreSalvar()">Registrar</button></div>`,'wide')}
function rcPreSalvar(){const prof=$('#prM').value,proc=$('#prC').value,cv=$('#prV'),conv=(cv&&cv.value)||'Particular';
 if(prof&&proc&&!r17ProcsProf(prof).includes(proc)){toast('Este profissional não realiza este procedimento','warn');return}
 const r=rcPreCriar({cpf:$('#prP').value,unid:$('#prU').value,prof,proc,conv,per:'',obs:$('#prO').value.trim()});if(r.erro){toast(r.erro,'warn');return}closeModal();if(location.hash==='#pre-agendamento')reView();else location.hash='#pre-agendamento';toast('Pré-agendamento registrado na fila')}

/* ---------- WhatsApp da fila: mensagem com o profissional e modelo editável (nota 473) ----------
   As variáveis são trocadas pelos dados de cada pedido. O nome do procedimento fica de fora: é dado de saúde (LGPD, art. 11). */
let R17_WA_TPL='Olá, {paciente}! Tudo bem? Estamos entrando em contato para informar que surgiu uma vaga com {profissional} para o atendimento que você havia solicitado conosco. Gostaria de verificar se ainda tem interesse em agendar?';
const R17_WA_VARS=[['{paciente}','primeiro nome do paciente'],['{profissional}','profissional da agenda pedida'],['{unidade}','unidade']];
const r17Titulo=s=>String(s||'').toLowerCase().replace(/(^|\s)(\S)/g,(m,a,b)=>a+b.toUpperCase()).replace(/ (De|Da|Do|Das|Dos|E) /g,m=>m.toLowerCase());
function r17WaTxt(x,tpl){return (tpl||R17_WA_TPL).replace(/\{paciente\}/g,r17Titulo((x.pac||'').split(' ')[0])).replace(/\{profissional\}/g,r17Titulo((PROF(x.prof)||{}).n||'o profissional')).replace(/\{unidade\}/g,rcUnidNome(x.unid||RC.unid))}
function rcPreWhats(id){const x=RC.pre.find(y=>y.id===id);if(!x)return;const t=(rcPacCpf(x.cpf)||{}).tel||'';if(soDig(t).length<10){toast('Paciente sem telefone no cadastro','warn');return}
 const h=`${mh('Avisar pelo WhatsApp')}<div class="mb"><p class="tl">${esc(x.pac)} · ${esc(t)} · ${esc(PROF(x.prof).n)}</p><div class="field"><label for="rcWaM">Mensagem</label><textarea class="in" id="rcWaM" rows="5" style="height:auto">${esc(r17WaTxt(x))}</textarea></div><button type="button" class="btn sm ghost" onclick="r17WaModelo(${id})">${I.edit} Editar mensagem padrão</button></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="rcPreWhatsAbrir(${id})">Abrir no WhatsApp</button></div>`;
 if(modalAberto())$('#modal').innerHTML=h;else openModal(h)}
function r17WaModelo(id){const x=RC.pre.find(y=>y.id===id);if(!x)return;
 $('#modal').innerHTML=`${mh('Mensagem padrão do aviso de vaga')}<div class="mb"><p class="tl">Vale para todos os avisos da fila. Clique numa variável para colocá-la no texto: o sistema troca pelos dados de cada paciente.</p><div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:8px">${R17_WA_VARS.map(([v,t])=>`<button type="button" class="chip" title="${t}" onclick="r17WaVar('${v}')">${v}</button>`).join('')}</div><div class="field"><label for="rcWaTpl">Modelo</label><textarea class="in" id="rcWaTpl" rows="5" style="height:auto" oninput="$('#rcWaPrev').textContent=r17WaTxt(RC.pre.find(y=>y.id===${id}),this.value)">${esc(R17_WA_TPL)}</textarea></div><span class="r17-lab">Como fica para ${esc(x.pac)}</span><p class="r17-wa-prev" id="rcWaPrev">${esc(r17WaTxt(x))}</p></div><div class="mf"><button class="btn ghost" onclick="rcPreWhats(${id})">Voltar</button><button class="btn" onclick="r17WaSalvar(${id})">Salvar modelo</button></div>`}
function r17WaVar(v){const t=$('#rcWaTpl');if(!t)return;const i=t.selectionStart??t.value.length,j=t.selectionEnd??i;t.value=t.value.slice(0,i)+v+t.value.slice(j);if(t.focus)t.focus();if(t.setSelectionRange)t.setSelectionRange(i+v.length,i+v.length);if(t.dispatchEvent&&typeof Event==='function')t.dispatchEvent(new Event('input'))}
function r17WaSalvar(id){const v=($('#rcWaTpl').value||'').trim();if(!v){toast('Escreva a mensagem','warn');return}if(!v.includes('{profissional}')){toast('Inclua {profissional}: o paciente precisa saber com quem é a vaga','warn');return}R17_WA_TPL=v;r17Aud('Mensagem padrão do aviso de vaga pelo WhatsApp alterada');toast('Mensagem padrão atualizada');rcPreWhats(id)}

/* ---------- Agendar a partir da fila: tudo já vem do pré-agendamento (nota 488) ---------- */
function r17PrimVaga(){for(let i=0;i<120;i++){const d=rcSomaDia(RC_HOJE,i);if(r17AgdInfo(d).liv.length)return d}return RC_HOJE}
function rcPreAgendar(id){const x=RC.pre.find(y=>y.id===id);if(!x)return;Object.assign(RC.agd,{cpf:x.cpf,prof:x.prof,proc:x.proc,unid:String(x.unid),conv:x.conv||'Particular',tab:'novo',pre:x.id,vaga:null,alt:null,cmodo:'mes'});
 const d=r17PrimVaga();RC.agd.data=d;RC.agd.cm=[+d.slice(0,4),+d.slice(5,7)-1];if(x.st!=='Em contato'){x.st='Em contato';x.log.push('Em contato às '+hhmm(new Date()))}location.hash='#agendamento'}
/* Pelo caminho antigo (janela de confirmação), a solicitação agendada também volta para a fila */
{const _o=rcAgdOk;rcAgdOk=function(){const pre=RC.agd.pre;const r=_o.apply(this,arguments);if(pre&&!RC.agd.pre&&RC.pre.some(x=>x.id===pre&&x.st==='Agendado')){Object.assign(RC.agd,{tab:'novo',conv:'',cm:null,cmodo:'mes'});RC.preF.st='';location.hash='#pre-agendamento'}return r}}

/* ---------- Agendamento: agenda igual à tela de Agendamentos, com calendário (notas 481 e 488) ---------- */
function r17AgdInfo(k){const A=RC.agd,ags=RC.agendas.filter(a=>a.prof===A.prof&&(!A.unid||a.unid===+A.unid)&&(!A.proc||a.procs.includes(A.proc))&&rcDiaAberto(a,k)),liv=[];
 if(k>=RC_HOJE)ags.forEach(a=>rcLivres(a,k).forEach(h=>{if((!A.proc||rcProcsDoHorario(a,k,h).includes(A.proc))&&!liv.some(x=>x.h===h))liv.push({id:a.id,h})}));return {ab:ags.length>0,liv}}
function r17AgdMes(){const A=RC.agd,[an,me]=A.cm,prim=new Date(an,me,1),n=new Date(an,me+1,0).getDate(),cel=[];for(let i=0;i<prim.getDay();i++)cel.push('<div></div>');
 for(let d=1;d<=n;d++){const k=iso(new Date(an,me,d)),f=r17AgdInfo(k),ok=f.ab&&k>=RC_HOJE,mar=ok?rcVagasProf(A.prof,k,A.unid).filter(x=>!x.st.startsWith('VAGA')).length:0;
  cel.push(`<button type="button" class="rc-d ${ok?(f.liv.length?'on':'cheio'):''} ${k===RC_HOJE?'hj':''} ${k===A.data?'r17-sel':''}" ${ok?`onclick="r17AgdDia1('${k}')"`:'disabled'} aria-label="${d} de ${RC_MESES[me]}${ok?`: ${f.liv.length} vaga(s)`:''}"><b>${d}</b><small>${ok?`${mar} marcados · ${f.liv.length} vagas`:''}</small></button>`)}
 return `<div class="rc-mes" style="margin-bottom:6px">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(x=>`<span>${x}</span>`).join('')}</div><div class="rc-mes">${cel.join('')}</div><div class="cl-leg" style="margin-top:10px"><span><i style="background:var(--accent-soft);border:1px solid var(--accent)"></i>Agenda aberta com vaga</span><span><i style="background:var(--warn-soft);border:1px solid var(--warn)"></i>Agenda aberta sem vaga</span><span><i style="background:var(--surface);border:1px solid var(--border)"></i>Sem agenda</span></div>`}
/* Lista do dia como na Agenda; horários ocupados aparecem sem o nome de outros pacientes (LGPD: só o necessário) */
function r17AgdDia(p,pr){const A=RC.agd,k=A.data,f=r17AgdInfo(k),todos=rcVagasProf(A.prof,k,A.unid);
 if(!todos.length||!f.ab){const px=r17PrimVaga();return `<div class="empty"><h4>Sem agenda aberta neste dia</h4><p>Escolha outra data no calendário.</p>${px!==k&&r17AgdInfo(px).liv.length?`<button class="btn sm sec" onclick="r17AgdDia1('${px}')">Próxima vaga: ${rcDiaTxt(px)}</button>`:''}</div>`}
 const nome=p?esc(r17Titulo(p.n.split(' ')[0])):'';
 const rows=todos.map(v=>{const l=f.liv.find(x=>x.h===v.h),fn=l?(pr?`r17AgdDireto('${l.id}','${v.h}')`:`rcAgdEscolher('${l.id}','${v.h}')`):'';
  const hora=rcEhChegada(v.h)?`<b>${rcChegadaIni(A.prof,k,v.h)}</b><small class="tl rc-cheg">${v.h}</small>`:`<b>${v.h}</b>`;
  const quem=l?'<span class="tl">Livre</span>':v.st==='VAGA DISPONÍVEL'?'<span class="tl">Livre, mas este procedimento não é feito neste período</span>':v.st==='VAGA BLOQUEADA'?'<span class="tl">Bloqueado</span>':'Horário ocupado';
  const sit=l?'<span class="rc-ind ok"><i></i>VAGA DISPONÍVEL</span>':`<span class="rc-ind ${RC_STATUS[v.st]||''}"><i></i>${v.st}</span>`;
  return `<tr ${l&&p?`style="cursor:pointer" onclick="if(!event.target.closest('button'))${fn}"`:''}>${td('Hora',hora)}${td('Paciente',quem)}${td('Situação',sit)}${td('',l?`<button class="btn sm" ${p?'':'disabled'} onclick="${fn}">${pr&&nome?'Agendar '+nome:'Agendar'}</button>`:'')}</tr>`});
 return tabela(['Hora','Paciente','Situação',''],rows,'Nenhum horário').replace('<table class="at-table">','<table class="at-table r17-dia r17-agd-t">')}
/* No modo Mês, os horários livres da data marcada ficam logo abaixo do calendário */
function r17AgdSlots(p,pr){const A=RC.agd,f=r17AgdInfo(A.data);if(!f.ab)return '';const fn=x=>pr?`r17AgdDireto('${x.id}','${x.h}')`:`rcAgdEscolher('${x.id}','${x.h}')`,hr=f.liv.filter(x=>!rcEhChegada(x.h)),ch=f.liv.filter(x=>rcEhChegada(x.h));
 return `<div class="r17-agd-sl"><b>Horários livres em ${rcDiaTxt(A.data)}</b>${f.liv.length?`<div class="rc-sl">${hr.map(x=>`<button type="button" ${p?'':'disabled'} onclick="${fn(x)}">${x.h}</button>`).join('')}${ch.length?`<button type="button" ${p?'':'disabled'} onclick="${fn(ch[0])}">Ordem de chegada: ${ch.length} vaga(s)</button>`:''}</div>`:'<span class="tl">Sem horário livre nesta data.</span>'}</div>`}
function r17AgdDia1(k){const A=RC.agd;A.data=k;A.cm=[+k.slice(0,4),+k.slice(5,7)-1];A.cmodo='dia';reView()}
function r17AgdMover(n){const A=RC.agd;if(A.cmodo==='dia'){const d=rcSomaDia(A.data,n);if(d<RC_HOJE){toast('Não dá para agendar em data passada','warn');return}A.data=d;A.cm=[+d.slice(0,4),+d.slice(5,7)-1]}else{const d=new Date(A.cm[0],A.cm[1]+n,1);if(d<new Date(+RC_HOJE.slice(0,4),+RC_HOJE.slice(5,7)-1,1))return;A.cm=[d.getFullYear(),d.getMonth()]}reView()}
function r17AgdHoje(){const A=RC.agd;A.data=RC_HOJE;A.cm=[+RC_HOJE.slice(0,4),+RC_HOJE.slice(5,7)-1];reView()}
function r17AgdFiltro(k,v){const A=RC.agd;A[k]=v;A.cmodo='mes';reView()}
function r17AgdCard(p){const A=RC.agd,pr=A.pre&&RC.pre.find(x=>x.id===A.pre);if(!A.data||A.data<RC_HOJE)A.data=RC_HOJE;if(!A.cm)A.cm=[+A.data.slice(0,4),+A.data.slice(5,7)-1];const modo=A.cmodo==='dia'?'dia':'mes';
 const topo=pr?`<div class="r17-agd-res">${[['Profissional',esc(PROF(A.prof).n)],['Procedimento',esc(clProcNome(A.proc))],['Convênio',esc(A.conv||'Particular')],['Unidade',esc(rcUnidNome(+A.unid||RC.unid))]].map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`
  :`<div class="filters" style="margin-top:8px"><select class="in" style="width:auto" aria-label="Unidade" onchange="r17AgdFiltro('unid',this.value)"><option value="">Todas as unidades</option>${rcUnidOpts(A.unid)}</select><select class="in" style="width:auto" aria-label="Profissional" onchange="r17AgdFiltro('prof',this.value)"><option value="">Todos os profissionais</option>${rcProfOpts(A.prof)}</select><select class="in" style="width:auto" aria-label="Procedimento" onchange="r17AgdFiltro('proc',this.value)"><option value="">Todos os procedimentos</option>${rcOpts(PROCEDIMENTOS.map(x=>[x.c,x.n]),A.proc)}</select></div>`;
 const nav=`<div class="rc-cab2 r17-agd-cab"><div class="rc-cab-g"><button class="btn sm ghost" onclick="r17AgdMover(-1)">‹ Anterior</button><button class="btn sm ghost" onclick="r17AgdHoje()">Hoje</button><button class="btn sm ghost" onclick="r17AgdMover(1)">Próximo ›</button></div><div class="rc-cab-c"><b class="rc-cab-data">${modo==='dia'?rcDiaLongo(A.data):RC_MESES[A.cm[1]]+' de '+A.cm[0]}</b></div><div class="rc-cab-g dir">${chip('Mês',modo==='mes',"RC.agd.cmodo='mes';reView()")}${chip('Lista',modo==='dia',"RC.agd.cmodo='dia';reView()")}</div></div>`;
 const passo=pr?`<p class="tl" style="margin:8px 0 0">${modo==='mes'?'Escolha uma data com vaga.':'Escolha o horário: o agendamento é feito na hora, com o cadastro já ligado ao pré-agendamento.'}</p>`:'';
 return `<div class="card" style="margin-top:12px"><h3>2. Agendas disponíveis</h3>${p?'':'<p class="tl">Localize o paciente para marcar. Os horários já podem ser consultados.</p>'}${topo}${nav}${passo}<div style="margin-top:12px">${modo==='dia'?r17AgdDia(p,pr):r17AgdMes()+r17AgdSlots(p,pr)}</div>${pr?'':`<p class="tl" style="margin-top:8px">Não achou horário? <a href="#" onclick="event.preventDefault();rcPreNovo()">Registrar pré-agendamento</a></p>`}</div>`}
/* Escolheu o horário: usa o paciente, o procedimento e o convênio do pré-agendamento e já agenda, pelas regras normais (rcAgendar) */
function r17AgdDireto(id,h){const A=RC.agd,p=rcAgdPac(),pr=A.pre&&RC.pre.find(x=>x.id===A.pre);if(!p){toast('Selecione o paciente antes do horário','warn');return}if(!pr){rcAgdEscolher(id,h);return}
 const data=A.data,r=rcAgendar({agenda:id,data,h,cpf:A.cpf,proc:A.proc,conv:A.conv||pr.conv||'Particular',alt:A.alt});if(r.erro){rcReViewSeguro();retorno('erro','Não foi possível agendar',r.erro);return}
 pr.st='Agendado';pr.log.push('Agendado para '+rcDiaBr(data)+' '+rcHoraTxt(h));rcHist(pr,'pre','Pré-agendamento convertido',r.ok.cod,(PROF(pr.prof)||{}).n);
 Object.assign(A,{pre:null,alt:null,vaga:null,cpf:'',prof:'',proc:'',conv:'',cm:null,cmodo:'mes',tab:'novo'});RC.preF.st='';
 const txt=rcAgdTxtOk(r,data,h);if(location.hash==='#pre-agendamento')rcReViewSeguro();else location.hash='#pre-agendamento';retorno('ok','Agendamento confirmado',txt+' O pedido saiu dos pendentes e ficou como Agendado na fila.')}
function r17PacCards(p){return `<div class="r17-pcards">${[['Nome',esc(p.n)],['CPF',`<span class="mono">${cpfMask(p.cpf)}</span>`],['Nascimento',p.dn?dmy(p.dn)+' · '+idade(p.dn)+' anos':'Não informado'],['Telefone',esc(p.tel||'Não informado')],['Situação',`<span class="r17-tag${p.ativo?'':' off'}">${p.ativo?'Ativo':'Inativo'}</span>`]].map(([k,v],i)=>`<div class="r17-pc${i?'':' r17-pc-n'}"><span>${k}</span><div>${v}</div></div>`).join('')}</div>`}
{const _ag=VIEWS.agendamento;VIEWS.agendamento=function(){let h=_ag.apply(this,arguments);const A=RC.agd,p=rcAgdPac(),pr=A.pre&&RC.pre.find(x=>x.id===A.pre);
 /* Nota 491: sem a aba Agendamentos realizados (a lista ainda aparece logo depois de confirmar) */
 const tabs=rcTabs([['novo','Novo agendamento'],['feitos','Agendamentos realizados',(RC.agdL||[]).length]],A.tab,'RC.agd.tab');
 h=h.replace(tabs,A.tab==='novo'?'':`<div class="row"><button class="btn sm sec" onclick="RC.agd.tab='novo';reView()">${I.plus} Novo agendamento</button></div>`);
 if(A.tab!=='novo')return h;
 /* Nota 490: um cartão para cada dado do paciente */
 if(p){const k=kvs([['Nome',esc(p.n)],['CPF',`<span class="mono">${cpfMask(p.cpf)}</span>`],['Nascimento',dmy(p.dn)+' · '+idade(p.dn)+' anos'],['Telefone',esc(p.tel)],['Situação',p.ativo?'Ativo':'Inativo']]);h=h.replace(`<div style="margin-top:8px">${k}<div class="row">`,`<div>${r17PacCards(p)}<div class="row">`)}
 if(pr)h=h.replace('<div class="card"><h3>1. Paciente</h3>',`<div class="alert info"><span>Agendando o pedido da fila de pré-agendamento de <b>${esc(pr.pac)}</b>. Os dados já vieram do pedido: falta só a data e o horário.</span><button class="btn sm ghost" onclick="RC.agd.pre=null;location.hash='#pre-agendamento'">Voltar à fila</button></div><div class="card"><h3>1. Paciente</h3>`);
 /* Notas 481 e 488: a agenda do profissional no mesmo calendário da tela de Agendamentos */
 const mk='<div class="card" style="margin-top:12px"><h3>2. Agendas disponíveis</h3>',i=h.indexOf(mk);
 if(i>=0&&A.prof)h=h.slice(0,i)+r17AgdCard(p)+'</div>';
 return h}}

/* ---------- Botão de olho: esconde os pontos das anotações durante os testes (nota 501) ----------
   O revisao.js não tem esse botão. Aqui ele só alterna uma classe no body; o CSS esconde #rv-pins (os pinos numerados). */
const R17_OLHO_ON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const R17_OLHO_OFF='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
function r17OlhoPinta(){const b=document.getElementById('r17-olho');if(!b||!b.setAttribute)return;const sem=document.body.classList.contains('rv-sem-pinos');b.innerHTML=sem?R17_OLHO_OFF:R17_OLHO_ON;b.title=sem?'Mostrar os pontos das anotações':'Ocultar os pontos das anotações';b.setAttribute('aria-label',b.title);b.setAttribute('aria-pressed',String(sem))}
function r17Olho(){const sem=!document.body.classList.contains('rv-sem-pinos');document.body.classList.toggle('rv-sem-pinos',sem);try{localStorage.setItem('rv-sem-pinos',sem?'1':'')}catch(e){}r17OlhoPinta();if(typeof toast==='function')toast(sem?'Pontos das anotações ocultos':'Pontos das anotações visíveis')}
try{if(document.body&&typeof document.body.append==='function'){const b=document.createElement('button');b.id='r17-olho';b.type='button';document.body.append(b);
 try{if(localStorage.getItem('rv-sem-pinos'))document.body.classList.add('rv-sem-pinos')}catch(e){}r17OlhoPinta();
 /* Fase de captura na janela: roda antes do modo Anotar do revisao.js, que não transforma o clique numa anotação */
 addEventListener('click',e=>{if(e.target&&e.target.closest&&e.target.closest('#r17-olho')){e.preventDefault();e.stopPropagation();r17Olho()}},true);
 /* Só aparece quando a revisão (revisao.js) está carregada */
 addEventListener('load',()=>{if(!document.getElementById('rv-btn'))b.hidden=true})}}catch(e){}

/* ---------- Estilos ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
#r17-olho{position:fixed;left:max(16px,env(safe-area-inset-left,0px));bottom:max(70px,calc(env(safe-area-inset-bottom,0px) + 70px));z-index:62;width:44px;height:44px;border-radius:50%;border:0;background:#263238;color:#fff;display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.25)}
#r17-olho[hidden]{display:none}
#r17-olho svg{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#r17-olho[aria-pressed="true"]{background:#C96F1B}
body.rv-sem-pinos #rv-pins,body.rv-sem-pinos #rv-hl{display:none!important}
@media(max-width:960px){#r17-olho{left:auto;right:max(16px,env(safe-area-inset-right,0px));bottom:max(130px,calc(env(safe-area-inset-bottom,0px) + 130px))}}
@media print{#r17-olho{display:none!important}}
.r17-tit{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.r17-tit h1{margin:0}
.r17-pre-st{grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}
.r17-dica{display:block;margin-top:4px;font-size:12px}
.r17-lab{display:block;font-size:12px;font-weight:700;color:var(--fg2);margin-bottom:4px}
.r17-wa-prev{white-space:pre-wrap;margin:0;padding:10px 12px;border-radius:10px;background:var(--surface2);font-size:14px;color:var(--fg-strong)}
.r17-av-bts{display:inline-flex;gap:6px;margin-left:auto}
.r17-av:not(.r17-av-ed) .aviso-dia-it .row{display:none}
.r17-av-dica{flex-basis:100%;margin:0;font-size:12.5px}
.r17-re{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:18px;align-items:start}
.r17-re-dia{display:block;font-size:16px;color:var(--fg-strong)}
.r17-mini-h{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.r17-mini-h b{color:var(--fg-strong)}
.r17-mini .rc-mes{gap:4px}
.r17-mini .rc-mes.r17-sem{margin-bottom:4px}
.r17-mini .rc-mes span{padding:4px 0;font-size:12px}
.r17-mini .rc-d{min-height:44px;padding:4px}
.r17-mini .rc-d small{font-size:10.5px}
.rc-d.r17-off{background:var(--surface2);color:var(--fg2);opacity:.55;cursor:default;border-color:var(--border)}
.rc-d.r17-off:hover{border-color:var(--border)}
.rc-d:disabled{cursor:default;opacity:.85}
.rc-d:not(.on):not(.cheio):disabled{opacity:.5}
.rc-d.r17-sel{outline:2px solid var(--accent);outline-offset:1px;font-weight:800}
.r17-agd-sl{margin-top:12px;padding-top:12px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px}
.r17-agd-sl>b{color:var(--fg-strong)}
.r17-agd-res{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin:10px 0 12px}
.r17-agd-res div{padding:8px 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface2)}
.r17-agd-res span{display:block;font-size:12px;font-weight:700;color:var(--fg2)}
.r17-agd-res b{color:var(--fg-strong);font-size:14.5px}
.r17-pcards{display:grid;grid-template-columns:2fr 1.3fr 1.5fr 1.3fr 1fr;gap:10px;margin:10px 0 12px}
.r17-pc{background:var(--surface);border:1px solid var(--border);border-left:4px solid var(--ok);border-radius:10px;padding:10px 12px;min-width:0}
.r17-pc>span{display:block;font-size:12px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:var(--accent)}
.r17-pc>div{margin-top:4px;font-size:16px;font-weight:600;color:var(--fg-strong);overflow-wrap:anywhere}
.r17-tag{display:inline-block;padding:2px 12px;border-radius:999px;background:var(--ok-soft);color:var(--ok);font-size:13.5px;font-weight:700}
.r17-tag.off{background:var(--surface2);color:var(--fg2)}
@media(max-width:1100px){.r17-pcards{grid-template-columns:repeat(auto-fit,minmax(160px,1fr))}}
@media(max-width:760px){.r17-re{grid-template-columns:1fr}}
.r17-dia .rc-ind{height:30px;padding:0 12px;border:1px solid color-mix(in srgb,var(--c) 45%,transparent);border-radius:999px;background:color-mix(in srgb,var(--c) 8%,transparent)}
.r17-dia .rc-sit-bt:hover{outline:0;background:color-mix(in srgb,var(--c) 16%,transparent);border-color:var(--c)}
@media(min-width:641px){
 .r17-dia td:nth-child(1),.r17-dia th:nth-child(1){width:1%;white-space:nowrap;padding-right:36px}
 .r17-dia td:nth-child(2){font-size:15.5px;font-weight:700;color:var(--fg-strong)}
 .r17-dia td:nth-child(2) a{font-size:15.5px;font-weight:700}
 .r17-dia td:nth-child(3){font-size:15px;color:var(--fg-strong)}
 .r17-dia td:nth-last-child(2),.r17-dia th:nth-last-child(2){width:1%;white-space:nowrap;padding-right:40px}
 .r17-dia td:last-child,.r17-dia th:last-child{width:1%;white-space:nowrap;padding-left:20px}
 .r17-agd-t td:nth-child(2){font-size:14.5px;font-weight:500}
}
</style>`);
