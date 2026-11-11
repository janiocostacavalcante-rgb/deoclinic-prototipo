/* ==========================================================================
   Rodada 16 (11/11/2026): anotações 385 a 435.
   Fica depois de telas-r15.js: só acrescenta funções e embrulha as que já existem.
   ========================================================================== */

/* ---------- Listagem de Senhas (notas 404, 405, 409) ---------- */
/* "Chamados" entra em "Em atendimento" e "Nos setores" entra em "Concluídos". Abas antigas guardadas viram as novas. */
function rcSenhaAba(){const t=RC.tab;return t==='chamada'?'atendimento':t==='setor'?'finalizada':(['aguardando','atendimento','finalizada','cancelada'].includes(t)?t:'aguardando')}
/* Só o tempo, contando em tempo real: 27:05 (minutos e segundos) ou 1:02:10 depois de uma hora */
function rcCron(ts){const s=Math.max(0,Math.floor((Date.now()-ts)/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60,d=n=>String(n).padStart(2,'0');return h?`${h}:${d(m)}:${d(x)}`:`${d(m)}:${d(x)}`}
setInterval(()=>{document.querySelectorAll('.rc-cron').forEach(e=>{e.textContent=rcCron(+e.dataset.ts)})},1000);

/* ---------- Atendimento a partir da senha (notas 421 e 422) ---------- */
function naNovoSenha(cpf,sid){naNovo('atendimento',cpf,false,true);NA.sid=sid;if(location.hash==='#novo-atendimento')naRender()}
/* Voltar: a senha continua como está. Cancelar: cancela a senha, com motivo, e volta para chamar a próxima */
function naCancelarSenha(){const s=RC.senhas.find(x=>x.id===NA.sid);if(!s){location.hash='#senhas';return}
 openModal(`${mh('Cancelar a senha '+esc(s.num))}<div class="mb"><p class="tl">O atendimento em andamento é descartado e a senha sai do painel.</p><div class="field"><label for="rcMot">Motivo <span class="req">*</span></label><input class="in" id="rcMot" autocomplete="off"></div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Voltar</button><button class="btn danger" onclick="naCancelarSenhaOk()">Cancelar senha</button></div>`)}
function naCancelarSenhaOk(){const s=RC.senhas.find(x=>x.id===NA.sid),m=$('#rcMot').value.trim();if(!m){toast('Informe o motivo','warn');return}rcCancelar(s,m);closeModal();NA=null;RC.tab='aguardando';rcPublica();location.hash='#senhas';toast(`Senha ${s.num} cancelada. Pode chamar a próxima`)}

/* ---------- Cadastro completo do paciente no atendimento (notas 419, 423 e 424) ---------- */
let NA_PAC_ABA='dados';
function naPacCard(){const p=NA.pac||{};if(!p.n)return '';const cpf=NA.cpf,ab=NA_PAC_ABA;
 const ags=[...(typeof AG_CLIN!=='undefined'?AG_CLIN.filter(a=>a.pac===p.n).map(a=>({...a,dia:a.dia||'hoje'})):[]),...(typeof RC!=='undefined'&&RC?RC.ag.filter(a=>a.pac===p.n):[])];
 const orcs=cpf?ORCS.filter(o=>o.cpf===cpf):[],fichas=ATENDS.filter(a=>a.n===p.n);
 const abas=[['dados','Dados'],['ag','Agendamentos',ags.length],['orc','Orçamentos',orcs.length],['fichas','Fichas',fichas.length]];
 const corpo=ab==='ag'?(ags.length?`<div class="at-list">${ags.map(a=>`<div class="at-row"><div class="grow">${esc((a.itens||[a.proc]).map(c=>clProcNome(c)).join(', '))}<small>${esc(a.dia==='hoje'?'Hoje':a.dia||'')} às ${esc(a.h)} · ${esc(PROF(a.prof).n)} · ${esc(a.conv||'Particular')} · ${esc(a.sit)}</small></div></div>`).join('')}</div>`:'<p class="tl">Nenhum agendamento.</p>')
  :ab==='orc'?(orcs.length?`<div class="at-list">${orcs.map(o=>{const aberto=abertoOrc(o),usando=NA.orc&&NA.orc.id===o.id&&NA.usarOrc;return `<div class="at-row"><div class="grow"><span class="mono">${o.id}</span> · ${o.it.length} ${o.it.length>1?'itens':'item'} · ${fmt(o.it.reduce((s,i)=>s+i.p,0))}<small>Feito em ${dm(o.feito)} por ${esc(o.quem)} · ${aberto?`válido até ${dm(o.val)}`:'fechado'}${usando?' · <b>itens no pedido</b>':''}</small></div>${aberto&&NA.orc&&NA.orc.id===o.id?(usando?`<button class="btn sm ghost" onclick="naUsarOrc(false)">Tirar do pedido</button>`:`<button class="btn sm sec" onclick="naUsarOrc(true)">Usar os itens</button>`):''}</div>`}).join('')}</div>`:'<p class="tl">Nenhum orçamento.</p>')
  :ab==='fichas'?(fichas.length?`<div class="at-list">${fichas.map(a=>`<div class="at-row"><div class="grow"><span class="mono">${a.p}</span><small>${esc(a.orig)} · ${esc(a.tot)}</small></div><button class="btn sm ghost" onclick="atFicha('${a.p}')">Abrir ficha</button></div>`).join('')}</div>`:'<p class="tl">Nenhuma ficha anterior.</p>')
  :kvs([['Nome',esc(p.n)+(p.ns?` <span class="tl">(nome social: ${esc(p.ns)})</span>`:'')],['CPF',cpf?`<span class="mono">${cpfMask(cpf)}</span>`:'Sem CPF'],['Nascimento',p.dn?`${dmy(p.dn)} · ${idade(p.dn)} anos`:'Não informado'],['Sexo',p.sx==='F'?'Feminino':p.sx==='M'?'Masculino':'Não informado'],['Nome da mãe',p.mae?esc(p.mae):'<span class="tl">não informado</span>'],['Telefone',esc(p.tel||'Não informado')],['E-mail',esc(p.email||'Não informado')],p.resp?['Responsável',esc(p.resp)]:null]);
 return `<div class="card at-card na-pac"><div class="row" style="justify-content:space-between;align-items:center"><h3>Paciente</h3><button class="btn sm sec" onclick="NA.passo=1;naRender(true)">${I.edit||'✎'} Editar cadastro</button></div>
 <div class="tabs" role="tablist">${abas.map(([k,t,n])=>`<button class="tab ${ab===k?'active':''}" onclick="NA_PAC_ABA='${k}';naRender()">${t}${n!==undefined?` <span class="tl">${n}</span>`:''}</button>`).join('')}</div>${corpo}</div>`}
{const _nn=naNovo;naNovo=function(){NA_PAC_ABA='dados';return _nn.apply(this,arguments)}}

/* ---------- Sala de coleta: triagem junta atendimento, paciente e exames, e pode ser editada (nota 417) ---------- */
function colTriagemHtml(p){const t=triDe(p.prot),comQ=p.exs.filter(c=>prCfg(c).perg.length);
 const exs=comQ.length?comQ.map(c=>{const r=PRQ_RESP[p.n+'|'+c];return `<h5 class="col-tri-ex">${esc(prqNome(c))}</h5>${r?kvs(prCfg(c).perg.map((x,i)=>[esc(x.q),r[i]?esc(r[i]):'—'])):`<p class="tl">Não respondido. <a href="#" onclick="event.preventDefault();prqResponder('${esc(p.n).replace(/'/g,'')}','${c}')">Responder agora</a></p>`}`}).join(''):'<p class="tl">Nenhum exame deste paciente tem questionário.</p>';
 return `<div class="col-tri"><div class="row" style="justify-content:space-between;align-items:center"><h4 style="margin:0">Triagem</h4><button class="btn sm sec" onclick="colTriEditar('${p.prot}')">${I.edit||'✎'} Editar</button></div>
 <h5>Do atendimento</h5>${kvs([['Dados clínicos e motivo dos exames',t.clin?esc(t.clin):'<span class="tl">não informado</span>'],['Observações',t.obs?esc(t.obs):'—']])}
 <h5>Questionário do paciente</h5>${kvs([['Medicamentos de uso contínuo',t.med?esc(t.med):'<span class="tl">não informado</span>'],['Doenças crônicas',(t.cron||[]).length?t.cron.map(esc).join(', '):'<span class="tl">nenhuma informada</span>'],['Jejum',t.jejum?esc(t.jejum):'—']])}
 <h5>Questionário dos exames</h5>${exs}</div>`}
function colTriEditar(prot){const t=triDe(prot),f=(id,l,v,area)=>`<div class="field"${area?' style="grid-column:1/-1"':''}><label for="${id}">${l}</label>${area?`<textarea class="in" id="${id}" rows="2" style="height:auto">${esc(v||'')}</textarea>`:`<input class="in" id="${id}" value="${esc(v||'')}">`}</div>`;
 openModal(`${mh('Editar triagem')}<div class="mb"><p class="tl">O que for acrescentado na coleta fica no atendimento, com quem alterou e quando.</p><div class="formgrid">${f('ctClin','Dados clínicos e motivo dos exames',t.clin,1)}${f('ctMed','Medicamentos de uso contínuo',t.med)}${f('ctCron','Doenças crônicas (separe por vírgula)',(t.cron||[]).join(', '))}${f('ctJej','Jejum',t.jejum)}${f('ctObs','Observações',t.obs,1)}</div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="colTriSalvar('${prot}')">Salvar</button></div>`,'wide')}
function colTriSalvar(prot){const t=triDe(prot),v=id=>($('#'+id).value||'').trim();t.clin=v('ctClin');t.med=v('ctMed');t.cron=v('ctCron').split(',').map(x=>x.trim()).filter(Boolean);t.jejum=v('ctJej');t.obs=v('ctObs');closeModal();reView();toast('Triagem atualizada no atendimento')}
{const _col=VIEWS.coleta;VIEWS.coleta=function(){const h=_col.apply(this,arguments),p=colPac();if(!p)return h;return h.replace(/<details open style="margin-top:10px"><summary[^>]*>Triagem \(medicamentos, doenças crônicas, jejum\)<\/summary>[\s\S]*?<\/details>/,colTriagemHtml(p))}}
/* Exemplo: o primeiro paciente da coleta já chega com o que a recepção preencheu */
if(typeof TRIAGENS!=='undefined'){const t=triDe('10-00018270');if(!t.clin)t.clin='Check-up anual pedido pela clínica geral. Queixa de cansaço há 2 meses.';if(!t.med)t.med='Losartana 50 mg';if(!(t.cron||[]).length)t.cron=['Hipertensão'];if(!t.jejum)t.jejum='12 horas'}

/* ---------- Busca de exame: o primeiro resultado já vem marcado e as setas mudam a marcação, bem visível (nota 411) ---------- */
document.addEventListener('input',e=>{if(e.target&&e.target.id==='naQ'){const b=document.querySelector('#naRes .at-pick:not([disabled])');if(b){NA_ACESO=0;b.classList.add('on')}}});

/* ---------- Estilos ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
.rc-sen-tab th,.rc-sen-tab td{text-align:center}
#naRes .at-pick.on{background:var(--accent);color:#fff;outline:0}
#naRes .at-pick.on small,#naRes .at-pick.on .at-price{color:#fff}
.rc-sen-tab td .row{justify-content:center}
.rc-cron{font-variant-numeric:tabular-nums;font-weight:600}
.rc-pre-st .m.on{outline:2px solid var(--accent);outline-offset:-2px}
.rc-pre-ac{gap:6px;flex-wrap:nowrap;justify-content:flex-end}
.rc-wa{color:#1FA855}
.rc-wa:hover{background:rgba(31,168,85,.12)}
.na-pac .tabs{margin:4px 0 8px}
.col-tri{margin-top:12px;display:flex;flex-direction:column;gap:6px}
.col-tri h5{margin:8px 0 2px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--fg2)}
.col-tri h5.col-tri-ex{text-transform:none;letter-spacing:0;font-size:13px;color:var(--fg-strong)}
</style>`);
