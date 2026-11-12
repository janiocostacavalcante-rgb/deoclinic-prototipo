/* Rodada 18 (12/11/2026) · agenda */
/* ==========================================================================
   Notas 514 a 543: Agendamentos, Fila de Pré-agendamento, Abrir agenda, Agendamento e Currículo Médico.
   Fica depois de telas-r18-recepcao.js: só acrescenta funções e embrulha ou redefine as que já existem.
   Convênios sempre da lista global (rcModal / CONVENIOS): nada de nome fixo aqui.
   ========================================================================== */

const ag18Conv0=()=>{const l=rcModal();return l.find(m=>semAc(String(m))==='particular')||l[0]||''};
/* Passa por cada linha do corpo de uma tabela (tabela() de telas-base.js) */
function ag18Linhas(h,fn){const i=h.indexOf('<tbody>'),j=h.indexOf('</tbody>',i);if(i<0||j<0)return h;return h.slice(0,i+7)+h.slice(i+7,j).split(/(?=<tr[\s>])/).map((r,k)=>fn(r,k)).join('')+h.slice(j)}

/* ---------- Vaga de encaixe (nota 543) ----------
   O encaixe é um horário a mais numa agenda já aberta naquele dia. Entra em rcSlots, então aparece como vaga livre,
   agenda pelas regras normais (rcAgendar) e fica na auditoria. Não pode repetir um horário que o profissional já tem no dia. */
const AG18_ENC=[];let AG18_ENC_SEQ=0;
const ag18EhEnc=(prof,d,h)=>AG18_ENC.some(x=>x.prof===prof&&x.dia===d&&x.h===h);
{const _s=rcSlots;rcSlots=function(a,d){const r=_s.apply(this,arguments);if(!a||!AG18_ENC.length)return r;const e=AG18_ENC.filter(x=>x.ag===a.id&&x.dia===d&&!r.includes(x.h)).map(x=>x.h);return e.length?r.concat(e):r}}
const ag18AgsDia=()=>{const C=RC.ca;return RC.agendas.filter(a=>a.prof===C.prof&&a.unid===RC.unid&&rcDiaAberto(a,C.dia))};
function ag18EncCriar({ag,prof,dia,h,mot}){const a=RC.agendas.find(x=>x.id===ag);if(!a||a.prof!==prof||!rcDiaAberto(a,dia))return {erro:'Não há agenda aberta deste profissional nesta data.'};
 if(dia<RC_HOJE)return {erro:'Não dá para abrir encaixe em data passada.'};if(!/^\d\d:\d\d$/.test(h||''))return {erro:'Informe o horário do encaixe.'};
 if(rcVagasProf(prof,dia).some(v=>v.h===h))return {erro:`${PROF(prof).n} já tem o horário ${h} nesta data. Escolha outro.`};
 AG18_ENC.push({id:++AG18_ENC_SEQ,ag,prof,dia,h,unid:a.unid,mot:mot||'',por:rcResp(),q:rcAgora()});
 r17Aud(`Vaga de encaixe aberta: ${rcDiaBr(dia)} às ${h} · ${PROF(prof).n}${mot?' · Motivo: '+mot:''}`,{prof,dia,h});return {ok:true}}
function ag18EncModal(){const C=RC.ca,ags=ag18AgsDia();if(C.dia<RC_HOJE){toast('Não dá para abrir encaixe em data passada','warn');return}if(!ags.length){toast('Sem agenda aberta nesta data nesta unidade','warn');return}
 openModal(`${mh('Abrir vaga de encaixe')}<div class="mb"><p class="tl" style="margin-top:0">${esc(PROF(C.prof).n)} · <b>${rcDiaLongo(C.dia)}</b>. O encaixe vira uma vaga a mais nesta agenda, livre para agendar, e fica registrado na auditoria.</p><div class="formgrid">${ags.length>1?`<div class="field"><label for="ag18EncA">Agenda</label><select class="in" id="ag18EncA">${rcOpts(ags.map(a=>[a.id,a.nome]),ags[0].id)}</select></div>`:`<input type="hidden" id="ag18EncA" value="${esc(ags[0].id)}">`}<div class="field"><label for="ag18EncH">Horário do encaixe <span class="req">*</span></label><input class="in" type="time" id="ag18EncH" step="300"></div></div><div class="field" style="margin-top:12px"><label for="ag18EncO">Motivo</label><input class="in" id="ag18EncO" placeholder="Ex.: retorno para mostrar exame"></div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="ag18EncSalvar()">Abrir encaixe</button></div>`)}
function ag18EncSalvar(){const C=RC.ca,h=($('#ag18EncH').value||'').slice(0,5),r=ag18EncCriar({ag:$('#ag18EncA').value,prof:C.prof,dia:C.dia,h,mot:($('#ag18EncO').value||'').trim()});if(r.erro){toast(r.erro,'warn');return}closeModal();reView();toast('Vaga de encaixe aberta às '+h)}
function ag18EncRemoverModal(i){const x=RC.diaL&&RC.diaL[i];if(!x||x.ev)return;modalOk('Remover a vaga de encaixe?',`<p>O encaixe das <b>${x.h}</b> de <b>${rcDiaLongo(RC.ca.dia)}</b> sai da agenda. Fica registrado na auditoria.</p>`,'Remover encaixe',`ag18EncRemover(${i})`,'danger')}
function ag18EncRemover(i){const x=RC.diaL&&RC.diaL[i],C=RC.ca;if(!x||x.ev)return;const k=AG18_ENC.findIndex(e=>e.prof===C.prof&&e.dia===C.dia&&e.h===x.h);if(k<0)return;AG18_ENC.splice(k,1);RC.bloq.delete(rcBk(C.prof,C.dia,x.h));r17Aud(`Vaga de encaixe removida: ${rcDiaBr(C.dia)} às ${x.h} · ${PROF(C.prof).n}`,{prof:C.prof,dia:C.dia,h:x.h});reView();toast('Encaixe removido')}
/* Encaixe livre ganha o botão de remover, ao lado do cadeado */
{const _c=rcDiaCelAcoes;rcDiaCelAcoes=function(v,i){let h=_c.apply(this,arguments);const C=RC.ca;if(h&&v&&!v.ev&&ag18EhEnc(C.prof,C.dia,v.h))h=h.replace(/<\/div>$/,()=>`<button type="button" class="btn sm ghost rc-ic" title="Remover vaga de encaixe" aria-label="Remover vaga de encaixe" onclick="ag18EncRemoverModal(${i})">${I.x}</button></div>`);return h}}

/* ---------- Agenda do dia: só o horário nas vagas por ordem de chegada (nota 533), botão de encaixe (543), destaque do que acabou de ser agendado (527) ---------- */
let AG18_DEST=null;
{const _d=rcDiaHtml;rcDiaHtml=function(){let h=_d.apply(this,arguments);const C=RC.ca,l=RC.diaL||[];
 h=h.replace(/<small class="tl rc-cheg">[^<]*<\/small>/g,'');
 if(C.dia>=RC_HOJE&&ag18AgsDia().length){const bt=`<button type="button" class="btn sm ghost rc-ic ag18-enc-bt" title="Abrir vaga de encaixe nesta data" aria-label="Abrir vaga de encaixe nesta data" onclick="ag18EncModal()">${I.plus}</button>`,bq=`onclick="rcDiaBloqTodosModal()">${rcCadeado()}</button>`;
  h=h.includes(bq)?h.replace(bq,()=>bq+bt):h.replace('<span class="rc-th-ac">AÇÕES',()=>'<span class="rc-th-ac">AÇÕES'+bt)}
 const dest=AG18_DEST&&AG18_DEST.prof===C.prof&&AG18_DEST.dia===C.dia&&Date.now()-AG18_DEST.t<120000?AG18_DEST.h:'';
 return ag18Linhas(h,(r,i)=>{const v=l[i];if(!v)return r;if(ag18EhEnc(C.prof,C.dia,v.h))r=r.replace(/(<td data-l="Hora">[\s\S]*?)(<\/td>)/,'$1<span class="ag18-enc-tag">Encaixe</span>$2');if(dest&&v.h===dest)r=r.replace(/^<tr/,'<tr class="ag18-novo"');return r})}}

/* ---------- Detalhes do agendamento: auditoria só do horário escolhido (nota 519) ----------
   A trilha continua completa em AG_AUD (nada é apagado). A gestão ainda pode ver o dia inteiro, para fiscalização. */
const ag18AudGest=()=>['admin','gestor'].includes(PERFIL);
function r17AudLista(D){const e=D.audE||'h';
 if(e==='h')return AG_AUD.filter(x=>x.prof===D.prof&&x.dia===D.dia&&(x.h===D.h||(!x.h&&D.ev&&D.ev.pac&&x.acao.endsWith('Paciente: '+D.ev.pac))));
 return AG_AUD.filter(x=>e==='tudo'?(x.dia===D.dia||x.d===D.dia):x.prof===D.prof&&x.dia===D.dia)}
function r17AudHtml(D){if(!D.audE||!ag18AudGest())D.audE='h';const e=D.audE,l=r17AudLista(D),hr=rcEhChegada(D.h)?'ordem de chegada':D.h;
 const tit=e==='h'?`Auditoria deste horário · ${rcDiaTxt(D.dia)} · ${hr}`:`Auditoria ${e==='dia'?'da agenda do dia':'de todo o sistema no dia'} · ${rcDiaTxt(D.dia)}`;
 const lk=!ag18AudGest()?'':e==='h'?`<button type="button" class="btn sm ghost" onclick="RC.det.audE='dia';rcDetPinta()">Ver o dia inteiro (gestão)</button>`:`<button type="button" class="btn sm ghost" onclick="RC.det.audE='h';rcDetPinta()">Voltar a este horário</button>`;
 return `<div class="row" style="justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px"><h4 style="margin:0">${tit}</h4>${lk}</div>
 ${tabela(['Operador','Data e Hora','Ação'],l.map(x=>`<tr>${td('Operador',esc(x.op))}${td('Data e Hora',`<span class="mono">${dmy(x.d)}${x.hr?' às '+x.hr:''}</span>`)}${td('Ação',esc(x.acao))}</tr>`),'Nenhuma movimentação registrada neste horário')}<p class="tl" style="margin:6px 0 0">Registro automático e somente leitura: não dá para apagar nem editar.</p>`}

/* ---------- Janela de agendamento a partir da agenda (notas 521, 522, 524 e 525) ----------
   Igual à de telas-recepcao.js, com: cartão de nascimento e idade ao lado do nome; procedimentos com campo para digitar
   que filtra a lista (continua dando para clicar); sem o botão "Ver agendamentos realizados" na confirmação. */
function ag18VjProcVis(){const V=RC.vj,q=semAc((V.pq||'').trim());return rcVjProcs(V).filter(x=>!q||semAc(clProcNome(x.c)+' '+x.c).includes(q))}
function ag18VjProcLista(){const V=RC.vj,l=ag18VjProcVis();
 return l.length?`<div class="at-list">${l.map(x=>`<label class="at-row check"><input type="radio" name="rcVjP" ${V.proc===x.c?'checked':''} onchange="rcVjProc('${x.c}')"><div class="grow">${esc(clProcNome(x.c))}<small>R$ ${rcMoeda(x.v)}</small></div></label>`).join('')}</div>`:'<p class="tl" style="margin:0">Nenhum procedimento com esse nome. Apague o texto para ver todos.</p>'}
function ag18VjProcEnter(){const l=ag18VjProcVis();if(l.length!==1)return;rcVjProc(l[0].c);$('#rcVjPL').innerHTML=ag18VjProcLista()}
function rcVjHtml(){const V=RC.vj,a=RC.agendas.find(x=>x.id===V.agenda),m=PROF(a.prof),pas=['Paciente','Conferir dados','Convênio e procedimento'],p=V.pac,E=V.ed;
 const topo=`<div class="rc-vj-p">${pas.map((t,i)=>`<span class="${V.etapa===i+1?'on':V.etapa>i+1?'ok':''}">${i+1}. ${t}</span>`).join('')}</div><div class="rc-vj-res"><b>${esc(m.n)}</b> · ${esc(m.esp)} · <b>${rcDiaTxt(V.data)} ${rcHoraTxt(V.h)}</b> · ${esc(rcUnidNome(a.unid))}${V.etapa>2?` · ${esc(p.n)}`:''}</div>`;
 let corpo,rod;
 if(V.etapa===1){corpo=`<div class="inwrap">${LUPA}<input class="in" id="rcVjQ" placeholder="Pesquise pelo nome ou CPF do paciente" aria-label="Pesquisar paciente por nome ou CPF" value="${esc(V.q)}" oninput="RC.vj.q=this.value;$('#rcVjRes').innerHTML=rcVjLista()"></div><div id="rcVjRes">${rcVjLista()}</div>`;rod=`<button class="btn ghost" onclick="closeModal()">Cancelar</button>`}
 else if(V.etapa===2){const nasc=p.dn?`${dmy(p.dn)}<small>${idade(p.dn)} anos</small>`:'<span class="tl">Não informado</span>';
  corpo=`<div class="pf-g"><div class="field s4"><label for="rcVjN">Nome do paciente <span class="req">*</span></label><input class="in cx" id="rcVjN" value="${esc(E.n)}"></div><div class="s2 r17-pc ag18-nasc" aria-label="Data de nascimento e idade"><span>Nascimento e idade</span><div>${nasc}</div></div><div class="field s3"><label for="rcVjC">CPF <span class="req">*</span></label><input class="in" id="rcVjC" value="${esc(E.cpf)}" oninput="this.value=mCPF(this.value)"></div><div class="field s3"><label for="rcVjW">WhatsApp <span class="req">*</span></label><input class="in" id="rcVjW" value="${esc(E.wa)}" oninput="this.value=mTel(this.value)"></div></div><p class="tl" style="margin:8px 0 0">Confira o WhatsApp: é por ele que o paciente confirma o atendimento.</p>`;
  rod=`<button class="btn ghost" onclick="RC.vj.etapa=1;rcVjPinta()">Voltar</button><button class="btn" onclick="rcVjDados()">Continuar</button>`}
 else{const l=rcVjProcs(V);corpo=`<h4 style="margin:0 0 6px"><label for="rcVjConvC">Convênio <span class="req">*</span></label></h4>${cbHtml({id:'rcVjConvC',val:V.conv,ph:'Selecione ou digite o convênio',min:1,fn:'rcVjConv',itens:Object.keys(RC_VJ_CONV).map(c=>({v:c,t:c}))})}<h4 style="margin:14px 0 6px"><label for="rcVjPq">Procedimentos</label></h4>${!V.conv?'<p class="tl" style="margin:0">Selecione o convênio para ver os procedimentos deste médico.</p>':!l.length?`<div class="empty" style="padding:14px 8px"><h4>Sem procedimentos</h4><p>${esc(m.n)} não tem procedimento neste horário por ${esc(V.conv)}.</p></div>`:`<div class="inwrap ag18-vj-pq">${LUPA}<input class="in" id="rcVjPq" autocomplete="off" placeholder="Digite o procedimento ou escolha na lista" value="${esc(V.pq||'')}" oninput="RC.vj.pq=this.value;$('#rcVjPL').innerHTML=ag18VjProcLista()" onkeydown="if(event.key==='Enter'){event.preventDefault();ag18VjProcEnter()}"></div><div id="rcVjPL">${ag18VjProcLista()}</div>`}`;
  rod=`<button class="btn ghost" onclick="RC.vj.etapa=2;RC.vj.ed={n:RC.vj.pac.n,cpf:RC.vj.pac.cpf,wa:RC.vj.pac[rcVjCampoWa(RC.vj.pac)]||''};rcVjPinta()">Voltar</button><button class="btn" id="rcVjFim" ${V.proc?'':'disabled'} onclick="rcVjFinalizar()">Finalizar agendamento</button>`}
 const obs=rcObsVaga(a,V.data,V.h);return `${mh('Novo agendamento')}<div class="mb">${topo}${obs?`<div class="alert warn rc-vj-obs"><div><b>Observações da agenda:</b> ${esc(obs)}</div></div>`:''}${corpo}</div><div class="mf">${rod}</div>`}
{const _cv=rcVjConv;rcVjConv=function(){if(RC.vj)RC.vj.pq='';return _cv.apply(this,arguments)}}
function rcVjFinalizar(){const V=RC.vj,r=rcAgendar({agenda:V.agenda,data:V.data,h:V.h,cpf:V.pac.cpf,proc:V.proc,conv:V.conv});closeModal();rcReViewSeguro();
 if(r.erro){retorno('erro','Não foi possível agendar',r.erro);return}RC.vj=null;retorno('ok','Agendamento confirmado',rcAgdTxtOk(r,r.ok.data,r.ok.h))}

/* ---------- Fila de Pré-agendamento: filtros de paciente e de profissional com busca, lado a lado (notas 528 a 530) ---------- */
function ag18PreFPac(v){RC.preF.pac=v||'';$('#rcPrB').innerHTML=rcPreRows()}
function ag18PreFProf(v){RC.preF.pid=v||'';$('#rcPrB').innerHTML=rcPreRows()}
const ag18PreChave=x=>x.cpf||x.pac;
{const _r=rcPreRows;rcPreRows=function(){const F=RC.preF;if(!F.pac&&!F.pid)return _r.apply(this,arguments);const todos=RC.pre;RC.pre=todos.filter(x=>(!F.pac||ag18PreChave(x)===F.pac)&&(!F.pid||x.prof===F.pid));try{return _r.apply(this,arguments)}finally{RC.pre=todos}}}
VIEWS['pre-agendamento']=()=>{rc();const F=RC.preF,c=k=>RC.pre.filter(x=>x.st===k).length;F.q='';F.profQ='';
 const pm=new Map();RC.pre.forEach(x=>{const k=ag18PreChave(x);if(k)pm.set(k,{n:x.pac,q:((pm.get(k)||{}).q||0)+1})});
 const pacs=[...pm].sort((a,b)=>a[1].n.localeCompare(b[1].n,'pt-BR')).map(([k,o])=>({v:k,t:o.n,nome:o.n,s:o.q+(o.q>1?' pedidos na fila':' pedido na fila')}));
 const profs=[...new Set(RC.pre.map(x=>x.prof))].map(PROF).filter(Boolean).sort((a,b)=>rcNomeOrdem(a).localeCompare(rcNomeOrdem(b),'pt-BR')).map(p=>({v:p.id,t:p.n,nome:p.n,s:p.esp}));
 if(F.pac&&!pm.has(F.pac))F.pac='';if(F.pid&&!profs.some(p=>p.v===F.pid))F.pid='';
 return `<div class="pagehead"><div><div class="crumbs">Recepção</div><div class="r17-tit"><h1>Fila de Pré-agendamento</h1><button class="btn" onclick="rcPreNovo()">${I.plus} Novo pré-agendamento</button></div><p style="color:var(--fg2);margin-top:4px">Quem quer atendimento e ainda não tem agenda ou horário. Retome o contato quando abrir.</p></div><div class="tools"></div></div>
 <div class="mini rc-pre-st r17-pre-st">${miniKpi('Todos',RC.pre.length,F.st?'':'filtrando',F.st?'':'on',"RC.preF.st='';reView()")}${RC_PRE_ST.map(s=>miniKpi(s,c(s),F.st===s?'filtrando':'',(F.st===s?'on ':'')+(rcPreBadge(s)==='err'?'err':rcPreBadge(s)==='warn'?'warn':rcPreBadge(s)==='ok'?'ok':''),`rcPreFiltroSt('${s}')`)).join('')}</div>
 <div class="ag18-pre-fil"><div class="field"><label for="ag18PrPac">Paciente</label>${cbHtml({id:'ag18PrPac',val:F.pac||'',ph:'Digite ou selecione o paciente',min:1,fn:'ag18PreFPac',icone:CB_ICONE,itens:pacs})}</div><div class="field"><label for="ag18PrProf">Profissional</label>${cbHtml({id:'ag18PrProf',val:F.pid||'',ph:'Digite ou selecione o profissional',min:1,fn:'ag18PreFProf',icone:CB_ICONE,itens:profs})}</div></div>
 <div class="tablewrap"><table class="at-table"><thead><tr>${['Paciente','Profissional','Procedimento','Agenda','Situação',''].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody id="rcPrB">${rcPreRows()}</tbody></table></div>`};

/* ---------- Novo pré-agendamento: "Procedimento", depois do convênio (nota 526) ---------- */
function r17PreProcCampo(){const P=R17_PRE,l=r17ProcsProf(P.prof),pf=P.prof&&PROFISSIONAIS.find(x=>x.id===P.prof);
 const campo=!P.prof?'<input class="in" id="prCq" disabled placeholder="Escolha o profissional primeiro">':!l.length?'<input class="in" id="prCq" disabled placeholder="Nenhum procedimento cadastrado">':cbHtml({id:'prCq',val:P.proc,ph:'Digite o procedimento',min:1,fn:'r17PreProc',itens:l.map(c=>({v:c,t:clProcNome(c)}))});
 return `<label for="prCq">Procedimento <span class="req">*</span></label>${campo}<input type="hidden" id="prC" value="${esc(P.proc)}">${pf?`<small class="tl r17-dica">${l.length?`Só o que ${esc(pf.n)} realiza (${esc(pf.esp)}).`:'Este profissional não tem procedimentos para agendar.'}</small>`:''}`}
function rcPreNovo(){rc();const A=location.hash==='#agendamento'?RC.agd:{},u=A.unid||RC.unid,P=R17_PRE;P.cpf=A.cpf||'';P.prof=A.prof||'';P.proc=A.proc&&r17ProcsProf(P.prof).includes(A.proc)?A.proc:'';
 const pac=PACIENTES.filter(p=>p.ativo&&p.cpf).sort((a,b)=>a.n.localeCompare(b.n,'pt-BR')).map(p=>({v:p.cpf,t:p.n+' · '+cpfMask(p.cpf),nome:p.n,s:'CPF '+cpfMask(p.cpf)}));
 const profs=PROFISSIONAIS.filter(p=>p.ativo).sort((a,b)=>rcNomeOrdem(a).localeCompare(rcNomeOrdem(b),'pt-BR')).map(p=>({v:p.id,t:p.n+' · '+p.esp,nome:p.n,s:p.esp}));
 openModal(`${mh('Novo pré-agendamento')}<div class="mb"><div class="formgrid r17-pre-f"><div class="field"><label for="prPq">Paciente <span class="req">*</span></label>${cbHtml({id:'prPq',val:P.cpf,ph:'Digite o nome ou o CPF',min:2,fn:'r17PrePac',icone:CB_ICONE,itens:pac})}<input type="hidden" id="prP" value="${esc(P.cpf)}"></div>
 <input type="hidden" id="prU" value="${u}"><div class="field"><label for="prMq">Profissional desejado <span class="req">*</span></label>${cbHtml({id:'prMq',val:P.prof,ph:'Digite o nome ou a especialidade',min:2,fn:'r17PreProf',icone:CB_ICONE,itens:profs})}<input type="hidden" id="prM" value="${esc(P.prof)}"></div>
 <div class="field"><label for="prV">Convênio</label><select class="in" id="prV">${rcOpts(rcModal().map(m=>[m,m]),A.conv||ag18Conv0())}</select></div>
 <div class="field" id="r17PrCw">${r17PreProcCampo()}</div></div>
 <div class="field"><label for="prO">Observações</label><textarea class="in" id="prO" rows="2" style="height:auto"></textarea></div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="rcPreSalvar()">Registrar</button></div>`,'wide')}

/* ---------- Agendar pela fila: depois de confirmar, abre Agendamentos já na data e no profissional (nota 527) ---------- */
function ag18IrAgenda(prof,data,h){if(typeof AG_MODO!=='undefined'&&AG_MODO==='semana')AG_MODO='medico';Object.assign(RC.ca,{prof,dia:data,modo:'dia',st:'',busca:'prof',esp:'',ano:+data.slice(0,4),mes:+data.slice(5,7)-1});AG18_DEST={prof,dia:data,h,t:Date.now()};if(location.hash==='#agenda')rcReViewSeguro();else location.hash='#agenda'}
const ag18OutraUnid=a=>a&&a.unid!==RC.unid?` Atenção: a vaga é na unidade ${esc(rcUnidNome(a.unid))}; troque de unidade para vê-la na agenda.`:'';
function r17AgdDireto(id,h){const A=RC.agd,p=rcAgdPac(),pr=A.pre&&RC.pre.find(x=>x.id===A.pre);if(!p){toast('Selecione o paciente antes do horário','warn');return}if(!pr){rcAgdEscolher(id,h);return}
 const data=A.data,r=rcAgendar({agenda:id,data,h,cpf:A.cpf,proc:A.proc,conv:A.conv||pr.conv||ag18Conv0(),alt:A.alt});if(r.erro){rcReViewSeguro();retorno('erro','Não foi possível agendar',r.erro);return}
 pr.st='Agendado';pr.log.push('Agendado para '+rcDiaBr(data)+' '+rcHoraTxt(h));rcHist(pr,'pre','Pré-agendamento convertido',r.ok.cod,(PROF(pr.prof)||{}).n);
 const ag=RC.agendas.find(x=>x.id===id);Object.assign(A,{pre:null,alt:null,vaga:null,cpf:'',prof:'',proc:'',conv:'',cm:null,cmodo:'mes',tab:'novo'});RC.preF.st='';
 const txt=rcAgdTxtOk(r,data,h);ag18IrAgenda(pr.prof,data,h);retorno('ok','Agendamento confirmado',txt+' O pedido ficou como Agendado na fila. Esta é a agenda do dia marcado.'+ag18OutraUnid(ag))}
/* Pelo caminho antigo (janela de confirmação), o mesmo destino */
{const _o=rcAgdOk;rcAgdOk=function(id,h){const pre=RC.agd.pre,data=RC.agd.data,r=_o.apply(this,arguments);if(pre&&!RC.agd.pre&&location.hash==='#pre-agendamento'&&RC.pre.some(x=>x.id===pre&&x.st==='Agendado')){const ag=RC.agendas.find(x=>x.id===id);if(ag)ag18IrAgenda(ag.prof,data,h)}return r}}

/* ---------- Agendamento: sem a lista "Horários livres" abaixo do calendário (nota 536); situação com as cores de Agendamentos (537); só o horário na ordem de chegada (533) ---------- */
function r17AgdSlots(){return ''}
function r17AgdDia(p,pr){const A=RC.agd,k=A.data,f=r17AgdInfo(k),todos=rcVagasProf(A.prof,k,A.unid);
 if(!todos.length||!f.ab){const px=r17PrimVaga();return `<div class="empty"><h4>Sem agenda aberta neste dia</h4><p>Escolha outra data no calendário.</p>${px!==k&&r17AgdInfo(px).liv.length?`<button class="btn sm sec" onclick="r17AgdDia1('${px}')">Próxima vaga: ${rcDiaTxt(px)}</button>`:''}</div>`}
 const nome=p?esc(r17Titulo(p.n.split(' ')[0])):'';
 const rows=todos.map(v=>{const l=f.liv.find(x=>x.h===v.h),fn=l?(pr?`r17AgdDireto('${l.id}','${v.h}')`:`rcAgdEscolher('${l.id}','${v.h}')`):'';
  const hora=`<b>${rcEhChegada(v.h)?rcChegadaIni(A.prof,k,v.h):v.h}</b>`;
  const quem=l?'<span class="tl">Livre</span>':v.st==='VAGA DISPONÍVEL'?'<span class="tl">Livre, mas este procedimento não é feito neste período</span>':v.st==='VAGA BLOQUEADA'?'<span class="tl">Bloqueado</span>':'Horário ocupado';
  const sit=`<span class="rc-ind ${RC_STATUS[v.st]||''}"><i></i>${v.st}</span>`;
  return `<tr ${l&&p?`style="cursor:pointer" onclick="if(!event.target.closest('button'))${fn}"`:''}>${td('Hora',hora)}${td('Paciente',quem)}${td('Situação',sit)}${td('',l?`<button class="btn sm" ${p?'':'disabled'} onclick="${fn}">${pr&&nome?'Agendar '+nome:'Agendar'}</button>`:'')}</tr>`});
 return tabela(['Hora','Paciente','Situação',''],rows,'Nenhum horário').replace('<table class="at-table">','<table class="at-table r17-dia r17-agd-t">')}

/* ---------- Abrir agenda: Nome, Profissional (com busca) e Especialidade na mesma linha, bordas destacadas (notas 531 e 532) ---------- */
function ag18AbProf(id){const p=id&&PROF(id);rcAbProf(p?p.n:'')}
{const _ab=VIEWS['abertura-agenda'];VIEWS['abertura-agenda']=function(){let h=_ab.apply(this,arguments);const B=RC.ab,f=B.form;if(B.tela!=='form'||!f||f.etapa>1)return h;
 const esp=h.match(/<div class="field" style="margin-top:12px;max-width:520px"><label for="abEsp">[\s\S]*?role="listbox" hidden onmousedown="event\.preventDefault\(\)"><\/div><\/div><\/div>/),prof=h.match(/<div class="field"><label for="abM">[\s\S]*?<\/datalist><\/div>/);if(!esp||!prof)return h;
 const profs=PROFISSIONAIS.filter(p=>p.ativo).sort((a,b)=>rcNomeOrdem(a).localeCompare(rcNomeOrdem(b),'pt-BR')).map(p=>({v:p.id,t:p.n,nome:p.n,s:p.esp}));
 const novo=`<div class="field"><label for="abMq">Profissional <span class="req">*</span></label>${cbHtml({id:'abMq',val:f.prof||'',ph:'Digite ou selecione o profissional',min:1,fn:'ag18AbProf',icone:CB_ICONE,itens:profs})}</div>`+esp[0].replace(' style="margin-top:12px;max-width:520px"','');
 h=h.replace(esp[0],'').replace(prof[0],()=>novo);
 return h.replace('<div class="formgrid"><div class="field"><label for="abN">','<div class="formgrid ag18-ab3"><div class="field"><label for="abN">')}}

/* ---------- Currículo Médico: busca destacada, categorias, cartões em duas colunas e perfil numa tela própria (notas 539 a 542) ----------
   Dados de exemplo: categoria, RQE e textos. Resolução CFM 2.336/2023: especialidade médica só com RQE; sem RQE, o cartão avisa
   para não apresentar o profissional como especialista. Uso interno da equipe: não é peça de divulgação ao público.
   Todos consultam; incluir, editar e excluir fica com quem cuida do cadastro (gestão e administração, regra da nota 293). */
const AG18_CUR_CAT=[['','Todos'],['med','Médicos'],['odo','Odontólogos'],['psi','Psicólogos'],['fis','Fisioterapeutas'],['us','Ultrassonografistas'],['out','Outros Profissionais']];
const AG18_CUR_INFO={
 p1:{cat:['med'],rqe:'RQE 8.214',sobre:'Clínica médica, com foco em atenção ao adulto e acompanhamento de doenças crônicas (exemplo).',atend:'Consulta clínica, retorno, check-up do adulto, acompanhamento de hipertensão e diabetes (exemplo).',part:'Consultas de 20 minutos. Encaixe só com autorização da coordenação (exemplo).',restr:'Atende a partir de 16 anos. Pedir ao paciente que traga exames e receitas anteriores (exemplo).',
  faq:[['A partir de qual idade atende?','A partir de 16 anos (exemplo).'],['O profissional realiza laudos?','Não emite laudo de exame. Emite atestado e relatório da própria consulta (exemplo).'],['Quais convênios aceita?','{conv}']]},
 p2:{cat:['med','us'],rqe:'RQE 5.031',sobre:'Médico radiologista, responsável pelos exames de ultrassonografia da unidade (exemplo).',atend:'Ultrassonografia de abdome, tireoide, mamas, obstétrica e transvaginal (exemplo).',part:'O laudo sai em até 2 dias úteis. Exames com doppler pedem horário duplo (exemplo).',restr:'Abdome: jejum de 6 horas. Pélvico: bexiga cheia. Trazer exames anteriores para comparar (exemplo).',
  faq:[['O profissional realiza laudos?','Sim, dos exames que ele mesmo realiza (exemplo).'],['Atende todas as faixas etárias?','Sim, inclusive crianças, sempre com acompanhante (exemplo).'],['Quais procedimentos realiza?','Ultrassonografias. Não faz biópsia guiada (exemplo).']]},
 p3:{cat:['med'],rqe:'RQE 9.877',sobre:'Ginecologia e obstetrícia, com pré-natal de risco habitual (exemplo).',atend:'Consulta ginecológica, pré-natal, coleta de preventivo, ultrassom obstétrico (exemplo).',part:'Pré-natal tem prioridade de encaixe pela coordenação (exemplo).',restr:'Preventivo: sem relação sexual e sem creme vaginal nas 48 horas anteriores (exemplo).',
  faq:[['A partir de qual idade atende?','A partir da primeira menstruação, com responsável se menor de 18 anos (exemplo).'],['Quais procedimentos realiza?','Consulta, preventivo e ultrassom obstétrico (exemplo).']]},
 p4:{cat:['med'],rqe:'RQE 11.402',sobre:'Cardiologia clínica do adulto (exemplo).',atend:'Consulta cardiológica, eletrocardiograma, avaliação para cirurgia (exemplo).',part:'Retorno em até 30 dias sem custo para mostrar exames (exemplo).',restr:'Trazer a lista dos remédios em uso e exames do coração anteriores (exemplo).',
  faq:[['Atende todas as faixas etárias?','Não: só adultos, a partir de 18 anos (exemplo).'],['O profissional realiza laudos?','Sim, do eletrocardiograma feito na unidade (exemplo).']]},
 p5:{cat:['out'],rqe:'',sobre:'Biomédica, responsável técnica pelo laboratório de análises clínicas (exemplo).',atend:'Supervisão da coleta e liberação de resultados de exames laboratoriais (exemplo).',part:'Não faz consulta: tira dúvidas técnicas sobre preparo e coleta (exemplo).',restr:'Preparo de cada exame: consultar o Guia de Exames (exemplo).',faq:[['Quem libera os resultados?','A responsável técnica, depois da conferência (exemplo).']]},
 p6:{cat:['out'],rqe:'',sobre:'Enfermeira da triagem (exemplo).',atend:'Triagem, sinais vitais, aplicação de medicação com prescrição (exemplo).',part:'Atende por ordem de chegada na triagem (exemplo).',restr:'Medicação só com receita médica válida (exemplo).',faq:[]},
 p7:{cat:['med'],rqe:'',sobre:'Médico com atuação em gastroenterologia (exemplo).',atend:'Consulta e endoscopia digestiva alta (exemplo).',part:'Endoscopia pede acompanhante adulto (exemplo).',restr:'Endoscopia: jejum de 8 horas, sem dirigir no dia (exemplo).',faq:[['Precisa de acompanhante?','Sim, para a endoscopia (exemplo).']]}};
const AG18_CUR_CAMPOS=[['sobre','Sobre o profissional'],['atend','Principais atendimentos'],['part','Particularidades do atendimento'],['restr','Restrições e orientações']];
let AG18_CUR_CATSEL='',AG18_CUR_ID='',AG18_CUR_ED={};
const ag18CurCatDe=p=>{const x=AG18_CUR_INFO[p.id];if(x&&x.cat)return x.cat;const c=String(p.cons||'').toUpperCase();return [c.startsWith('CRM')?'med':c.startsWith('CRO')?'odo':c.startsWith('CRP')?'psi':c.startsWith('CREFITO')?'fis':'out']};
const ag18EhMed=p=>String(p.cons||'').toUpperCase().startsWith('CRM');
/* Junta os dados de exemplo ao currículo que já existia (RC_CUR, nota 293): uma fonte só */
function ag18CurDados(id){const c=rcCurDe(id);if(c.ag18)return c;const x=AG18_CUR_INFO[id]||{};c.ag18=true;
 c.rqe=c.rqe&&!/^Exemplo/.test(c.rqe)?c.rqe:(x.rqe||'');c.sobre=c.sobre||x.sobre||c.forma||'';c.atend=c.atend||x.atend||c.procs||'';c.part=c.part||x.part||'';c.restr=c.restr||x.restr||c.orient||'';
 c.faq=c.faq||(x.faq||[]).map(([p,r],i)=>({p,r:r==='{conv}'?rcModal().join(', ')+' (exemplo).':r,ab:i===0}));return c}
const ag18CurReg=(p,c)=>`${esc(p.cons||'Registro não informado')}${ag18EhMed(p)?` · ${c.rqe?esc(c.rqe):'RQE não informado'}`:''}`;
const AG18_SETA='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
function ag18CurLista(){const q=semAc(RC_CUR_Q.trim()),cn=k=>(AG18_CUR_CAT.find(c=>c[0]===k)||['',''])[1];
 const l=PROFISSIONAIS.filter(p=>p.ativo&&(!AG18_CUR_CATSEL||ag18CurCatDe(p).includes(AG18_CUR_CATSEL))&&(!q||semAc(p.n+' '+p.esp+' '+ag18CurCatDe(p).map(cn).join(' ')).includes(q))).sort((a,b)=>rcNomeOrdem(a).localeCompare(rcNomeOrdem(b),'pt-BR'));
 if(!l.length)return `<div class="empty" style="grid-column:1/-1"><h4>Nenhum profissional encontrado</h4><p>${AG18_CUR_CATSEL?`Não há ${esc(cn(AG18_CUR_CATSEL).toLowerCase())} com esta pesquisa.`:'Mude a pesquisa.'}</p></div>`;
 return l.map(p=>{const c=ag18CurDados(p.id);return `<button type="button" class="card ag18-cur-c" onclick="ag18CurAbrir('${p.id}')" aria-label="Abrir o perfil de ${esc(p.n)}"><span class="ag18-av" style="--c:${esc(p.cor||'var(--accent)')}" aria-hidden="true">${esc(p.ini||p.n.slice(0,2))}</span><span class="ag18-cur-t"><b>${esc(p.n)}</b><span>${esc(p.esp)}</span><small class="${ag18EhMed(p)&&!c.rqe?'ag18-sem-rqe':''}">${ag18CurReg(p,c)}</small></span><span class="ag18-cur-seta" aria-hidden="true">${AG18_SETA}</span></button>`}).join('')}
function ag18CurCat(k){AG18_CUR_CATSEL=k;reView()}
VIEWS['curriculo-medico']=()=>{rc();const n=k=>PROFISSIONAIS.filter(p=>p.ativo&&(!k||ag18CurCatDe(p).includes(k))).length;
 return `${pageHead('Recepção','Currículo Médico','Consulte as informações e as particularidades do atendimento de cada profissional.','')}
 <div class="inwrap ag18-cur-busca">${LUPA}<input class="in" type="search" placeholder="Pesquise pelo nome do profissional ou pela especialidade" value="${esc(RC_CUR_Q)}" oninput="RC_CUR_Q=this.value;$('#rcCurB').innerHTML=ag18CurLista()" aria-label="Pesquisar médico"></div>
 <div class="row ag18-cur-cat" role="group" aria-label="Categoria">${AG18_CUR_CAT.map(([k,t])=>chip(`${t} <span class="ag18-n">${n(k)}</span>`,AG18_CUR_CATSEL===k,`ag18CurCat('${k}')`)).join('')}</div>
 <div class="ag18-cur-grid" id="rcCurB">${ag18CurLista()}</div>`};
/* Segunda tela: perfil do profissional, página própria com menu e cabeçalho do sistema */
NAMES['curriculo-perfil']='Perfil do profissional';if(typeof PAI!=='undefined')PAI['curriculo-perfil']='curriculo-medico';
if(typeof DESC!=='undefined')DESC['curriculo-perfil']='Perfil de um profissional: informações do atendimento e dúvidas frequentes.';
if(typeof GUIDES!=='undefined')GUIDES['curriculo-perfil']=['Veja as informações do profissional à esquerda e as dúvidas frequentes à direita.','Clique numa pergunta para abrir ou fechar a resposta.','Gestão e administração incluem, editam e excluem as informações.'];
function ag18CurAbrir(id){AG18_CUR_ID=id;AG18_CUR_ED={};if(location.hash==='#curriculo-perfil')reView();else location.hash='#curriculo-perfil'}
function ag18CurVoltar(){AG18_CUR_ED={};location.hash='#curriculo-medico'}
const ag18Txt=s=>esc(s).replace(/\n/g,'<br>');
function ag18CurSalvo(c){c.por=rcResp();c.q=rcAgora()}
function ag18CurEdCampo(k){if(!rcCurPode()){toast('Seu perfil só consulta o currículo','warn');return}AG18_CUR_ED={campo:k};reView()}
function ag18CurSalvaCampo(k){if(!rcCurPode())return;const c=ag18CurDados(AG18_CUR_ID),t=$('#ag18CurT');c[k]=((t&&t.value)||'').trim();ag18CurSalvo(c);AG18_CUR_ED={};reView();toast('Informação atualizada')}
function ag18CurRqe(){if(!rcCurPode())return;const c=ag18CurDados(AG18_CUR_ID),t=$('#ag18CurRqe');c.rqe=((t&&t.value)||'').trim();ag18CurSalvo(c);AG18_CUR_ED={};reView();toast('RQE atualizado')}
function ag18FaqEd(i){if(!rcCurPode()){toast('Seu perfil só consulta o currículo','warn');return}AG18_CUR_ED={faq:i};reView()}
function ag18FaqSalvar(i){if(!rcCurPode())return;const c=ag18CurDados(AG18_CUR_ID),p=(($('#ag18FaqP')||{}).value||'').trim(),r=(($('#ag18FaqR')||{}).value||'').trim();if(!p||!r){toast('Escreva a pergunta e a resposta','warn');return}
 if(i<0)c.faq.push({p,r,ab:true});else if(c.faq[i])Object.assign(c.faq[i],{p,r});ag18CurSalvo(c);AG18_CUR_ED={};reView();toast(i<0?'Pergunta incluída':'Pergunta atualizada')}
function ag18FaqDel(i){if(!rcCurPode())return;AG18_CUR_ED={del:i};reView()}
function ag18FaqDelOk(i){if(!rcCurPode())return;const c=ag18CurDados(AG18_CUR_ID);if(!c.faq[i])return;c.faq.splice(i,1);ag18CurSalvo(c);AG18_CUR_ED={};reView();toast('Pergunta excluída')}
function ag18FaqTodas(ab){const c=ag18CurDados(AG18_CUR_ID);c.faq.forEach(f=>f.ab=ab);reView()}
const ag18Cancela='<button type="button" class="btn sm ghost" onclick="AG18_CUR_ED={};reView()">Cancelar</button>';
function ag18FaqForm(i,f){return `<div class="ag18-faq-f"><div class="field"><label for="ag18FaqP">Pergunta</label><input class="in" id="ag18FaqP" value="${esc(f?f.p:'')}" placeholder="Ex.: A partir de qual idade atende?"></div><div class="field"><label for="ag18FaqR">Resposta</label><textarea class="in" id="ag18FaqR" rows="3" style="height:auto">${esc(f?f.r:'')}</textarea></div><small class="tl">Escreva o que orienta o paciente. Sem promessa de resultado nem comparação com outros profissionais (Resolução CFM 2.336/2023).</small><div class="row" style="gap:6px;justify-content:flex-end">${ag18Cancela}<button type="button" class="btn sm" onclick="ag18FaqSalvar(${i})">Salvar</button></div></div>`}
VIEWS['curriculo-perfil']=()=>{rc();const p=PROF(AG18_CUR_ID)||[...PROFISSIONAIS].filter(x=>x.ativo).sort((a,b)=>rcNomeOrdem(a).localeCompare(rcNomeOrdem(b),'pt-BR'))[0];if(!p)return '<div class="empty"><h4>Nenhum profissional</h4></div>';AG18_CUR_ID=p.id;
 const c=ag18CurDados(p.id),pode=rcCurPode(),E=AG18_CUR_ED,med=ag18EhMed(p),cats=ag18CurCatDe(p).map(k=>(AG18_CUR_CAT.find(x=>x[0]===k)||['',k])[1]);
 const lapis=(fn,t)=>pode?`<button type="button" class="btn sm ghost rc-ic" title="${t}" aria-label="${t}" onclick="${fn}">${I.edit}</button>`:'';
 const rqe=!med?'':E.campo==='rqe'?`<span class="ag18-rqe-ed"><input class="in" id="ag18CurRqe" value="${esc(c.rqe)}" placeholder="RQE 0000" aria-label="RQE"><button type="button" class="btn sm" onclick="ag18CurRqe()">Salvar</button>${ag18Cancela}</span>`:`<span class="badge ${c.rqe?'ok':'warn'}">${c.rqe?esc(c.rqe):'RQE não informado'}</span>${lapis("ag18CurEdCampo('rqe')",'Editar o RQE')}`;
 const topo=`<section class="card ag18-cp-top"><span class="ag18-av lg" style="--c:${esc(p.cor||'var(--accent)')}" aria-hidden="true">${esc(p.ini||p.n.slice(0,2))}</span><div class="ag18-cp-id"><h2>${esc(p.n)}</h2><div class="ag18-cp-esp">${esc(p.esp)} · ${esc(cats.join(', '))}</div><div class="ag18-cp-reg"><span class="badge">${esc(p.cons||'Registro não informado')}</span>${rqe}</div>${med&&!c.rqe?'<p class="ag18-cp-av">Sem RQE cadastrado: ao orientar o paciente, não apresente como especialista (Resolução CFM 2.336/2023).</p>':''}</div></section>`;
 const info=AG18_CUR_CAMPOS.map(([k,t])=>`<section class="card ag18-cp-card"><div class="ag18-cp-h"><h3>${t}</h3>${E.campo===k?'':lapis(`ag18CurEdCampo('${k}')`,'Editar '+t.toLowerCase())}</div>${E.campo===k?`<textarea class="in" id="ag18CurT" rows="4" style="height:auto" aria-label="${t}">${esc(c[k]||'')}</textarea><div class="row" style="gap:6px;justify-content:flex-end;margin-top:8px">${pode&&c[k]?`<button type="button" class="btn sm ghost danger" onclick="$('#ag18CurT').value='';ag18CurSalvaCampo('${k}')">Excluir texto</button>`:''}${ag18Cancela}<button type="button" class="btn sm" onclick="ag18CurSalvaCampo('${k}')">Salvar</button></div>`:c[k]?`<p>${ag18Txt(c[k])}</p>`:'<p class="tl">Não informado.</p>'}</section>`).join('');
 const faq=c.faq.map((f,i)=>E.faq===i?`<div class="ag18-faq">${ag18FaqForm(i,f)}</div>`:`<details class="ag18-faq" ${f.ab?'open':''} ontoggle="const f=ag18CurDados(AG18_CUR_ID).faq[${i}];if(f)f.ab=this.open"><summary><b>${esc(f.p)}</b><svg class="i ag18-faq-s" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><p>${ag18Txt(f.r)}</p>${pode?`<div class="row ag18-faq-ac">${E.del===i?`<span class="tl">Excluir esta pergunta?</span>${ag18Cancela}<button type="button" class="btn sm danger" onclick="ag18FaqDelOk(${i})">Excluir</button>`:`<button type="button" class="btn sm ghost" onclick="ag18FaqEd(${i})">${I.edit} Editar</button><button type="button" class="btn sm ghost danger" onclick="ag18FaqDel(${i})">${I.x} Excluir</button>`}</div>`:''}</details>`).join('');
 const dir=`<section class="card ag18-cp-faq" aria-label="Dúvidas frequentes"><div class="ag18-cp-h"><h3>Dúvidas frequentes</h3><span class="row" style="gap:6px">${c.faq.length>1?`<button type="button" class="btn sm ghost" onclick="ag18FaqTodas(true)">Abrir todas</button><button type="button" class="btn sm ghost" onclick="ag18FaqTodas(false)">Fechar todas</button>`:''}${pode&&E.faq!==-1?`<button type="button" class="btn sm" onclick="ag18FaqEd(-1)">${I.plus} Nova pergunta</button>`:''}</span></div>${E.faq===-1?`<div class="ag18-faq">${ag18FaqForm(-1)}</div>`:''}${c.faq.length?`<div class="ag18-faq-l">${faq}</div>`:E.faq===-1?'':'<p class="tl">Nenhuma pergunta cadastrada para este profissional.</p>'}</section>`;
 return `<div class="pagehead"><div><div class="crumbs">Recepção · Currículo Médico</div><h1>Perfil do profissional</h1><button type="button" class="back" onclick="ag18CurVoltar()">${BACK_SVG} Voltar à pesquisa de profissionais</button></div><div class="tools"></div></div>
 ${topo}<div class="ag18-cp-g"><div class="ag18-cp-esq">${info}</div>${dir}</div>
 <p class="tl ag18-cp-pe">${c.q?`Última atualização: ${esc(c.q)} · ${esc(c.por)}. `:''}Uso interno da equipe, para orientar o paciente. Não é material de divulgação ao público.${pode?'':' Seu perfil consulta; quem altera é a gestão ou a administração.'}</p>`};

/* ---------- Estilos ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
.rc-ac .btn.ghost.rc-ic,.rc-th-ac .btn.ghost.rc-ic{border:1px solid color-mix(in srgb,var(--accent) 45%,transparent);background:var(--accent-soft)}
.rc-ac .btn.ghost.rc-ic:hover,.rc-th-ac .btn.ghost.rc-ic:hover{border-color:var(--accent)}
.rc-th-ac{gap:6px}
.ag18-enc-tag{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:700;color:var(--accent);background:var(--accent-soft);border:1px solid color-mix(in srgb,var(--accent) 40%,transparent);vertical-align:middle}
tr.ag18-novo td{background:color-mix(in srgb,var(--accent) 12%,transparent)}
tr.ag18-novo td:first-child{box-shadow:inset 4px 0 0 var(--accent)}
.ag18-nasc{align-self:end}
.ag18-nasc>div small{display:block;font-size:13px;font-weight:700;color:var(--accent);margin-top:2px}
.ag18-vj-pq{margin-bottom:8px}
.ag18-pre-fil{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:12px 0}
.ag18-pre-fil label{display:block;font-size:12px;font-weight:700;color:var(--fg2);margin-bottom:4px}
.ag18-ab3{grid-template-columns:repeat(3,minmax(0,1fr))}
.ag18-ab3 .in{border:1.5px solid var(--accent)}
.ag18-ab3 .in:focus{box-shadow:0 0 0 3px var(--accent-soft)}
.ag18-cur-busca .in{height:54px;font-size:16px;border:2px solid var(--accent);border-radius:14px;padding-left:46px;background:var(--surface)}
.ag18-cur-busca svg{top:17px;left:16px;width:20px;height:20px;color:var(--accent)}
.ag18-cur-cat{gap:8px;flex-wrap:wrap;margin-top:12px}
.ag18-n{display:inline-block;min-width:18px;margin-left:4px;padding:0 6px;border-radius:999px;background:var(--surface2);color:var(--fg2);font-size:11px}
.chip.on .ag18-n{background:var(--surface);color:var(--accent)}
.ag18-cur-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}
.ag18-cur-c{display:flex;align-items:center;gap:14px;padding:16px 18px;text-align:left;font:inherit;color:inherit;cursor:pointer;width:100%}
.ag18-cur-c:hover,.ag18-cur-c:focus-visible{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 4%,var(--surface))}
.ag18-av{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-weight:800;font-size:16px;color:#fff;background:var(--c)}
.ag18-av.lg{width:72px;height:72px;font-size:24px}
.ag18-cur-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.ag18-cur-t b{font-size:15.5px;color:var(--fg-strong)}
.ag18-cur-t span{font-size:14px;color:var(--fg)}
.ag18-cur-t small{font-size:12.5px;color:var(--fg2)}
.ag18-cur-t small.ag18-sem-rqe{color:var(--warn)}
.ag18-cur-seta{flex:none;color:var(--accent)}.ag18-cur-seta .i{width:22px;height:22px}
.ag18-cp-top{display:flex;align-items:center;gap:18px;margin-top:4px}
.ag18-cp-id h2{margin:0;color:var(--fg-strong)}
.ag18-cp-esp{color:var(--fg);margin-top:2px}
.ag18-cp-reg{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px}
.ag18-cp-reg .badge:not(.ok):not(.warn){background:var(--surface2);color:var(--fg-strong);border:1px solid var(--border)}
.ag18-rqe-ed{display:inline-flex;gap:6px;align-items:center}.ag18-rqe-ed .in{width:140px;height:32px}
.ag18-cp-av{margin:8px 0 0;color:var(--warn);font-size:13px;font-weight:600}
.ag18-cp-g{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:16px;margin-top:16px;align-items:start}
.ag18-cp-esq{display:flex;flex-direction:column;gap:12px}
.ag18-cp-card,.ag18-cp-faq{padding:18px 20px}
.ag18-cp-card p{margin:6px 0 0;color:var(--fg-strong);line-height:1.5}
.ag18-cp-h{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.ag18-cp-h h3{margin:0}
.ag18-cp-faq{border-top:4px solid var(--accent)}
.ag18-cp-faq>.ag18-cp-h h3{font-size:18px;color:var(--accent)}
.ag18-faq-l{display:flex;flex-direction:column;gap:10px;margin-top:12px}
.ag18-faq{border:1px solid var(--border);border-radius:14px;background:var(--surface);padding:0}
.ag18-faq[open]{border-color:color-mix(in srgb,var(--accent) 45%,var(--border))}
.ag18-faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px}
.ag18-faq summary::-webkit-details-marker{display:none}
.ag18-faq summary b{font-size:15.5px;color:var(--fg-strong)}
.ag18-faq-s{flex:none;width:18px;height:18px;color:var(--accent);transition:transform .15s}
.ag18-faq[open] .ag18-faq-s{transform:rotate(180deg)}
.ag18-faq>p{margin:0;padding:10px 16px 14px;color:var(--fg);line-height:1.5;border-top:1px dashed var(--border)}
.ag18-faq-ac{gap:6px;justify-content:flex-end;padding:0 12px 12px}
.ag18-faq-f{display:flex;flex-direction:column;gap:8px;padding:14px 16px}
.ag18-faq-f .field{margin:0}
.ag18-cp-pe{margin-top:14px;font-size:12.5px}
@media(max-width:900px){.ag18-ab3,.ag18-cp-g{grid-template-columns:1fr}}
@media(max-width:760px){.ag18-cur-grid,.ag18-pre-fil{grid-template-columns:1fr}.pf-g .ag18-nasc{grid-column:span 6}}
</style>`);
