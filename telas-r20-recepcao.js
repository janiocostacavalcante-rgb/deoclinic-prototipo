/* Rodada 20 (13/11/2026) · recepcao */
/* ==========================================================================
   Notas 613, 614, 615, 618, 619, 620, 631, 652, 663 e 664: Pacientes, avisos do Início, agenda do dia,
   Detalhes do agendamento, autorização do atendimento e unificação de cadastros no Novo atendimento.
   Fica depois dos arquivos da rodada 19: só acrescenta funções e embrulha as que já existem. Prefixos rc20 / R20_.
   ========================================================================== */

const rc20El=id=>(typeof document!=='undefined'&&document.getElementById)?document.getElementById(id):null;
const rc20V=id=>{const e=rc20El(id);return e&&typeof e.value==='string'?e.value.trim():''};
const rc20Chk=id=>{const e=rc20El(id);return !!(e&&e.checked)};
const rc20Aud=(t,o)=>{try{if(typeof r17Aud==='function')r17Aud(t,o)}catch(e){}};
const rc20Quem=()=>{try{return typeof rcResp==='function'?rcResp():operador().n}catch(e){return 'Usuário'}};
const rc20Agora=()=>{const d=new Date(),z=n=>String(n).padStart(2,'0');return z(d.getHours())+':'+z(d.getMinutes())};

/* ---------- Número do prontuário (notas 652 e 663) ----------
   Cada paciente ganha um número de prontuário fixo, que não muda nem é reaproveitado. */
let R20_PRONT_SEQ=120;
function rc20Pront(p){if(!p)return '';if(!p.pront)p.pront=String(++R20_PRONT_SEQ).padStart(5,'0');return p.pront}
/* Dois cadastros duplicados de exemplo, para testar a unificação (mesma pessoa, CPF digitado errado num deles) */
(function(){if(typeof PACIENTES==='undefined')return;const cpfDe=b=>{try{return mCPF(rc19CpfDv(b))}catch(e){return ''}};
 const dup=[{b:'390533447',n:'Ana de Souza',dn:'1988-04-12',sx:'F',mae:'Marta Souza',tel:'(85) 98877-1020',email:'',ativo:true,cron:['Não','Não']},
  {b:'746971314',n:'José Carlos de Lima',dn:'1956-09-30',sx:'M',mae:'',tel:'(85) 3222-1100',email:'jose.lima@email.com',ativo:true,cron:['Não','Não']}];
 PACIENTES.forEach(rc20Pront);
 dup.forEach(d=>{const cpf=cpfDe(d.b);if(!cpf||PACIENTES.some(p=>p.cpf===cpf))return;const {b,...x}=d;PACIENTES.push({...x,cpf,dupExemplo:true});rc20Pront(PACIENTES[PACIENTES.length-1])})})();

/* ---------- Pacientes: filtros na largura toda (nota 613) e coluna Prontuário (nota 652) ---------- */
function pacBuscaRows(l){if(!l.length)return vazioLinha(6,'Ninguém encontrado','Mude os filtros ou cadastre um novo paciente.');
 return l.map(p=>{const un=p.unificadoEm;return `<tr style="cursor:pointer" onclick="r17PacClique('${p.cpf}')">${td('Prontuário',`<span class="mono">${esc(rc20Pront(p))}</span>`)}${td('Paciente',`<a href="#" style="color:inherit" onclick="event.preventDefault()">${esc(p.n)}</a>`)}${td('CPF',`<span class="mono">${cpfVer(p.cpf)}</span>`)}${td('Data de Nascimento',dmy(p.dn))}${td('Telefone',esc(p.tel||''))}${td('Status',un?`<span class="badge neutral" title="Incorporado ao prontuário ${esc(un)}">Unificado em ${esc(un)}</span>`:`<span class="badge ${p.ativo?'ok':'neutral'}">${p.ativo?'Ativo':'Inativo'}</span>`)}</tr>`}).join('')}
{const _r=pacBuscaResultado;pacBuscaResultado=function(){const h=_r.apply(this,arguments);return h.replace('<thead><tr><th>Nome completo</th>','<thead><tr><th>Prontuário</th><th>Nome completo</th>').replace('class="tablewrap r17-pac-tab"','class="tablewrap r17-pac-tab rc20-pac-tab"')}}
/* Ficha do paciente: número do prontuário e cadastros incorporados ficam visíveis (Dados e Rastreabilidade) */
{const _f=pacFicha;pacFicha=function(cpf,aba){const r=_f.apply(this,arguments);try{const p=PACIENTES.find(x=>x.cpf===cpf),d=rc20El('drawer');if(!p||!d||typeof d.innerHTML!=='string')return r;let h=d.innerHTML;
  const vinc=(p.vinculos||[]).map(v=>`${esc(v.pront)} - ${esc(v.n)} (${dmy(v.dn)}), em ${esc(v.quando)} por ${esc(v.por)}`).join('; ');
  h=h.replace('<div class="db">',`<div class="db"><p class="tl rc20-fi-pr">Prontuário <b class="mono">${esc(rc20Pront(p))}</b>${p.unificadoEm?` · incorporado ao prontuário <b class="mono">${esc(p.unificadoEm)}</b>`:''}${vinc?` · cadastros incorporados: ${vinc}`:''}</p>`);
  if(PC_ABA==='rastro'){const ev=[...(p.vinculos||[]).map(v=>`<div class="stp ok"><span class="dot2"></span><div class="st">Cadastro ${esc(v.pront)} (${esc(v.n)}) incorporado por ${esc(v.por)}<small>${esc(v.quando)} · motivo: ${esc(v.mot)} · registrado na auditoria</small></div></div>`),...(p.unificadoEm?[`<div class="stp ok"><span class="dot2"></span><div class="st">Incorporado ao prontuário ${esc(p.unificadoEm)} por ${esc(p.unificadoPor||'')}<small>${esc(p.unificadoQuando||'')} · o cadastro fica guardado, só não abre atendimento novo</small></div></div>`]:[])].join('');if(ev)h=h.replace('<div class="steps">','<div class="steps">'+ev)}
  d.innerHTML=h}catch(e){}return r}}

/* ---------- Avisos do Início: testar como gestão (nota 614) e editar aviso publicado (nota 615) ---------- */
let R20_PERFIL_ANT='';try{R20_PERFIL_ANT=localStorage.getItem('r20-perfil-ant')||''}catch(e){}
function rc20TrocaPerfil(v){try{setPerfil(v)}catch(e){PERFIL=v}}
function rc20ComoGestao(){if(avisoDiaPode()){toast('Seu perfil já publica e edita avisos');return}R20_PERFIL_ANT=PERFIL;try{localStorage.setItem('r20-perfil-ant',PERFIL)}catch(e){}rc20TrocaPerfil('gestor');toast('Teste do protótipo: agora você está como Gestor de unidade')}
function rc20VoltarPerfil(){const v=R20_PERFIL_ANT||'recepcao';R20_PERFIL_ANT='';try{localStorage.removeItem('r20-perfil-ant')}catch(e){}rc20TrocaPerfil(v);toast('De volta ao perfil '+nomePerfil(v))}
function rc20AvisoFaixa(){if(!avisoDiaPode())return `<div class="rc20-av-teste"><span>Só a gestão e a administração publicam e editam avisos.</span><button type="button" class="btn sm sec" onclick="rc20ComoGestao()">Testar como gestão</button></div>`;
 if(R20_PERFIL_ANT)return `<div class="rc20-av-teste on"><span>Teste do protótipo: você está como <b>${esc(nomePerfil(PERFIL))}</b>. Clique no lápis de um aviso para editar.</span><button type="button" class="btn sm sec" onclick="rc20VoltarPerfil()">Voltar para ${esc(nomePerfil(R20_PERFIL_ANT))}</button></div>`;return ''}
{const _hm=VIEWS.home;VIEWS.home=function(){let h=_hm.apply(this,arguments);const i=h.indexOf('<h3>Avisos do Dia</h3>');if(i<0)return h;const j=h.indexOf('</div>',i);if(j<0)return h;const f=rc20AvisoFaixa();return f?h.slice(0,j+6)+f+h.slice(j+6):h}}
/* Lápis em cada aviso em exibição, para quem pode editar; o aviso editado mostra quem mudou e quando */
/* avisoItem é constante: o lápis e o "editado por" entram no HTML pronto do Início e da faixa de avisos dos módulos */
function rc20AvisoPos(h){if(typeof h!=='string'||!h.includes('aviso-dia-it'))return h;const pode=avisoDiaPode();
 return h.replace(/<div class="alert ([a-z]+) aviso-dia-it"><div class="aviso-m"><b>([^<]*)<\/b>([\s\S]*?)(<small>[^<]*)(<\/small>)/g,(t,cor,tit,meio,sm,fim)=>{const id=(meio.match(/avisoDiaForm\((\d+)\)/)||[])[1],a=(id&&AVISOS_DIA.find(x=>String(x.id)===id))||AVISOS_DIA.find(x=>esc(x.tit)===tit);if(!a)return t;
  const ed=pode&&!avisoEnc(a)?`<button type="button" class="btn sm ghost rc20-av-ed" title="Editar aviso" aria-label="Editar o aviso ${esc(a.tit)}" onclick="avisoDiaForm(${a.id},'${esc(a.mod||'Início')}')">${I.edit||'Editar'}</button>`:'';
  return `<div class="alert ${cor} aviso-dia-it">${ed}<div class="aviso-m"><b>${tit}</b>${meio}${sm}${a.editado?` · editado por ${esc(a.editado.por)} às ${esc(a.editado.h)}`:''}${fim}`})}
{const _hm=VIEWS.home;VIEWS.home=function(){return rc20AvisoPos(_hm.apply(this,arguments))}}
if(typeof avisoModuloFaixa==='function'){const _mf=avisoModuloFaixa;avisoModuloFaixa=function(){return rc20AvisoPos(_mf.apply(this,arguments))}}
{const _s=avisoDiaSalvar;avisoDiaSalvar=function(id){const a=id?AVISOS_DIA.find(x=>x.id===id):null,antes=a?{tit:a.tit,txt:a.txt,cat:a.cat,prio:a.prio,ini:a.ini,ate:a.ate,por:a.por,h:a.h}:null;const r=_s.apply(this,arguments);
 try{if(a&&antes&&(a.tit!==antes.tit||a.txt!==antes.txt||a.cat!==antes.cat||a.prio!==antes.prio||a.ini!==antes.ini||a.ate!==antes.ate)){(a.versoes=a.versoes||[]).push(antes);a.por=antes.por;a.h=antes.h;a.editado={por:operador().curto,h:rc20Agora()};rc20Aud(`Aviso do dia editado: ${a.tit}`);reView()}}catch(e){}return r}}

/* ---------- Agenda do dia: WhatsApp abre a conversa de verdade (nota 618) ----------
   Abre o wa.me numa aba nova com o número do paciente. A mensagem não cita exame nem procedimento (LGPD, art. 6º, III). */
function rc20WaLink(tel,msg){let d=soDig(tel||'');if(d.length===10||d.length===11)d='55'+d;if(d.length<12)return '';return 'https://wa.me/'+d+(msg?'?text='+encodeURIComponent(msg):'')}
function rcDiaWhats(i){const x=RC.diaL&&RC.diaL[i];if(!x||!x.ev)return;const src=x.ev.src||x.ev,cpf=x.ev.cpf||src.cpf||'',p=(cpf&&PACIENTES.find(y=>y.cpf===cpf))||PACIENTES.find(y=>y.n===x.ev.pac)||{},t=p[rcVjCampoWa(p)]||p.tel||'';
 const msg=`Olá, ${String(x.ev.pac||'').split(' ')[0]}! Aqui é da DeoVita Clínicas, sobre o seu agendamento de ${rcDiaBr(RC.ca.dia)} às ${x.h}.`,url=rc20WaLink(t,msg);
 if(!url){toast('Paciente sem telefone válido no cadastro','warn');return}
 rcHist(x.ev,'agenda','Contato pelo WhatsApp',x.h,PROF(RC.ca.prof).n);
 let w=null;try{w=window.open(url,'_blank');if(w)w.opener=null}catch(e){}
 toast(w?`Conversa com ${x.ev.pac} aberta numa nova aba`:`Abrindo a conversa com ${x.ev.pac}. Se não abriu, libere as janelas novas (pop-up) no navegador.`,'ok')}

/* ---------- Detalhes do agendamento (notas 619, 620 e 631) ----------
   "Guia de Atendimento" vira "Fichas de atendimento"; o botão do painel aberto fica destacado;
   "Autorizar Atendimento" abre a tela de autorização já preenchida, para conferir e mudar antes de confirmar. */
{const _p=rcDetPinta;rcDetPinta=function(){const r=_p.apply(this,arguments);try{const m=rc20El('modal'),D=RC.det;if(!m||typeof m.innerHTML!=='string'||!D)return r;let h=m.innerHTML;
  h=h.replace('>Guia de Atendimento</button>','>Fichas de atendimento</button>').replace('<h4 style="margin:0 0 6px">Guias do paciente</h4>','<h4 style="margin:0 0 6px">Fichas de atendimento</h4>').replace('Nenhuma guia vinculada a este paciente.','Nenhuma ficha de atendimento vinculada a este paciente.');
  h=h.replace('onclick="rcDetAutorizar()"','onclick="rc20AutAbrir()"');
  ['guias','re','aud'].forEach(k=>{const on=D.painel===k;h=h.replace(`<button class="btn sm sec" onclick="rcDetPainel('${k}')">`,`<button class="btn sm sec${on?' rc20-on':''}" aria-pressed="${on}" onclick="rcDetPainel('${k}')">`)});
  m.innerHTML=h}catch(e){}return r}}
const rc20Tab=(c,conv)=>{try{return typeof r17Preco==='function'?(+r17Preco(c,conv)||0):(rcPreco(c)||0)}catch(e){return rcPreco(c)||0}};
const rc20Moeda=v=>(Math.round((+v||0)*100)/100).toFixed(2).replace('.',',');
const rc20Num=v=>{const s=String(v==null?'':v).trim().replace(/[^\d,.-]/g,'');if(!s)return NaN;const n=s.includes(',')?s.replace(/\./g,'').replace(',','.'):s;return parseFloat(n)};
function rc20AutAbrir(){const D=RC.det;if(!D)return;if(D.src.autorizado){toast('Este atendimento já foi autorizado','warn');return}
 const conv=D.conv||D.src.conv||'Particular',proc=D.proc||D.ev.itens[0],sala=D.src.sala||'',tab=rc20Tab(proc,conv);
 D.aut={prof:D.prof,proc,conv,sala,tel:D.tel||'',valorTab:tab,valor:D.src.valor!=null?+D.src.valor:tab,valorEd:D.src.valor!=null&&+D.src.valor!==tab,mot:'',erro:''};rc20AutPinta()}
function rc20AutProfs(A){return PROFISSIONAIS.filter(p=>p.id===A.prof||(p.ativo&&RC.agendas.some(a=>a.prof===p.id&&a.procs.includes(A.proc))))}
function rc20AutProcs(A){const D=RC.det;return [...new Set([D.proc,A.proc,...RC.agendas.filter(a=>a.prof===A.prof).flatMap(a=>a.procs)].filter(Boolean))]}
function rc20AutSalas(A){const l=(typeof SALAS!=='undefined'?SALAS:[]).filter(s=>!s.unid||s.unid===RC.unid||s.id===A.sala).map(s=>[s.id,s.n]);if(A.sala&&!l.some(x=>x[0]===A.sala))l.unshift([A.sala,(typeof clSala==='function'?clSala(A.sala).n:A.sala)]);return l}
function rc20AutPinta(){const D=RC.det,A=D&&D.aut;if(!A)return;const p=D.p||{},convs=[...new Set([A.conv,...rcModal()])],dif=A.valorEd&&Math.abs(A.valor-A.valorTab)>0.004;
 const ro=(id,l,v)=>`<div class="field"><label for="${id}">${l}</label><input class="in" id="${id}" value="${esc(v)}" readonly aria-readonly="true"></div>`;
 const h=`${mh('Autorizar atendimento')}<div class="mb rc20-aut"><p class="tl" style="margin:0 0 10px">Os dados vieram do agendamento. Confira com o paciente, mude o que for preciso e confirme.</p>
 <section class="rc20-aut-c" aria-label="Paciente"><h4>Paciente</h4><div class="rc20-aut-g">${ro('rc20AuN','Nome completo',p.n||D.ev.pac||'')}${ro('rc20AuD','Data de nascimento',p.dn?dmy(p.dn):'não informado')}${ro('rc20AuC','CPF',p.cpf?cpfMask(p.cpf):'sem CPF')}<div class="field"><label for="rc20AuT">Telefone</label><input class="in" id="rc20AuT" value="${esc(A.tel)}" oninput="this.value=mTel(this.value);RC.det.aut.tel=this.value"></div></div>
 <p class="tl" style="margin:6px 0 0">Nome e nascimento identificam o paciente: para corrigir, use Editar cadastro (fica na auditoria).</p></section>
 <section class="rc20-aut-c" aria-label="Atendimento"><h4>Atendimento</h4><div class="rc20-aut-g">${ro('rc20AuQ','Data e horário',`${rcDiaTxt(D.dia)} · ${rcHoraTxt(D.h)}`)}
 <div class="field"><label for="rc20AuPr">Profissional <span class="req">*</span></label><select class="in" id="rc20AuPr" onchange="rc20AutCampo('prof',this.value)">${rcOpts(rc20AutProfs(A).map(x=>[x.id,x.n]),A.prof)}</select></div>
 <div class="field rc20-aut-l"><label for="rc20AuP">Procedimento <span class="req">*</span></label><select class="in" id="rc20AuP" onchange="rc20AutCampo('proc',this.value)">${rcOpts(rc20AutProcs(A).map(c=>[c,clProcNome(c)]),A.proc)}</select></div>
 <div class="field"><label for="rc20AuCv">Convênio ou plano <span class="req">*</span></label><select class="in" id="rc20AuCv" onchange="rc20AutCampo('conv',this.value)">${rcOpts(convs.map(c=>[c,c]),A.conv)}</select></div>
 <div class="field"><label for="rc20AuS">Sala <span class="req">*</span></label><select class="in" id="rc20AuS" onchange="rc20AutCampo('sala',this.value)"><option value="">Escolha a sala</option>${rcOpts(rc20AutSalas(A),A.sala)}</select></div>
 <div class="field"><label for="rc20AuV">Valor (R$) <span class="req">*</span></label><input class="in" id="rc20AuV" inputmode="decimal" value="${rc20Moeda(A.valor)}" onchange="rc20AutCampo('valor',this.value)"><span class="msg rc20-aut-tab">Valor da tabela (${esc(A.conv)}): ${fmt(A.valorTab)}${dif?' · valor alterado':''}</span></div>
 ${dif?`<div class="field rc20-aut-l"><label for="rc20AuM">Motivo da mudança de valor <span class="req">*</span></label><input class="in" id="rc20AuM" maxlength="120" value="${esc(A.mot)}" oninput="RC.det.aut.mot=this.value" placeholder="Ex.: desconto autorizado pela gestão"></div>`:''}
 </div></section>${A.erro?`<div class="alert warn" role="alert"><span>${esc(A.erro)}</span></div>`:''}</div>
 <div class="mf"><button class="btn ghost" onclick="RC.det.aut=null;rcDetPinta()">Voltar aos detalhes</button><button class="btn" onclick="rc20AutConfirmar()">Confirmar autorização</button></div>`;
 if(modalAberto())$('#modal').innerHTML=h;else openModal(h,'wide')}
function rc20AutCampo(k,v){const A=RC.det&&RC.det.aut;if(!A)return;A.erro='';
 if(k==='valor'){const n=rc20Num(v);A.valor=isNaN(n)?A.valor:Math.max(0,n);A.valorEd=true;rc20AutPinta();return}
 A[k]=v;if(k==='prof'&&!rc20AutProcs(A).includes(A.proc))A.proc=rc20AutProcs(A)[0]||A.proc;
 if(k==='proc'||k==='conv'||k==='prof'){A.valorTab=rc20Tab(A.proc,A.conv);if(!A.valorEd)A.valor=A.valorTab}rc20AutPinta()}
function rc20AutConfirmar(){const D=RC.det,A=D&&D.aut;if(!A)return;A.erro='';const m=rc20El('rc20AuM');if(m&&typeof m.value==='string'&&m.value)A.mot=m.value;
 const dif=A.valorEd&&Math.abs(A.valor-A.valorTab)>0.004,erro=!A.prof?'Escolha o profissional.':!A.proc?'Escolha o procedimento.':!A.conv?'Escolha o convênio ou plano.':!A.sala?'Escolha a sala.':!(A.valor>=0)?'Informe o valor.':dif&&!String(A.mot||'').trim()?'Diga o motivo da mudança de valor: fica na auditoria.':'';
 if(!erro&&A.prof!==D.prof){try{if(rcVagasProf(A.prof,D.dia).some(v=>v.h===D.h&&v.ev&&(v.ev.src||v.ev)!==D.src))A.erro='Este profissional já tem paciente neste horário. Escolha outro ou reagende.'}catch(e){}}
 if(erro||A.erro){A.erro=erro||A.erro;rc20AutPinta();toast(A.erro,'warn');return}
 const s=D.src,ch=[],pr0=D.ev.itens[0],cv0=s.conv||D.ev.conv||'Particular';
 if(A.prof!==D.prof){ch.push(`Profissional de ${PROF(D.prof).n} para ${PROF(A.prof).n}`);s.prof=A.prof;if(D.ev!==s)D.ev.prof=A.prof;D.prof=A.prof}
 if(A.proc!==pr0){ch.push(`Procedimento de ${clProcNome(pr0)} para ${clProcNome(A.proc)}`);if(s.itens)s.itens[0]=A.proc;if(s.proc)s.proc=A.proc;D.ev.itens=[A.proc]}D.proc=A.proc;
 if(A.conv!==cv0){ch.push(`Convênio de ${cv0} para ${A.conv}`);s.conv=A.conv;D.ev.conv=A.conv}D.conv=A.conv;
 if(A.sala!==(s.sala||'')){ch.push(`Sala de ${s.sala?(typeof clSala==='function'?clSala(s.sala).n:s.sala):'não definida'} para ${typeof clSala==='function'?clSala(A.sala).n:A.sala}`);s.sala=A.sala}
 if(A.tel!==(D.p.tel||'')){ch.push(`Telefone de ${D.p.tel||'vazio'} para ${A.tel||'vazio'}`);D.p.tel=A.tel}D.tel=A.tel;
 s.valor=A.valor;s.valorTab=A.valorTab;if(dif){s.valorMot=String(A.mot).trim();ch.push(`Valor de ${fmt(A.valorTab)} (tabela) para ${fmt(A.valor)}. Motivo: ${s.valorMot}`)}
 rcHist(D.ev,'agenda','Autorização conferida',(ch.length?ch.join('; '):'Sem alterações')+` · Valor: ${fmt(A.valor)}`,PROF(D.prof).n);
 D.aut=null;rcDetAutorizar()}

/* ---------- Novo atendimento: campo Unificar no cartão Paciente (notas 663 e 664) ----------
   Pesquisa enquanto digita e mostra "PRONTUÁRIO - NOME - NASCIMENTO". O cadastro escolhido é incorporado ao principal:
   nada é apagado. O cadastro incorporado fica guardado, inativo e ligado ao principal (prontuário guardado por 20 anos,
   Lei 13.787/2018, art. 6º), e a unificação entra na auditoria com quem fez, quando, o motivo e o que foi movido (LGPD, art. 6º, X e art. 37). */
const R20_UNIF=[];let R20_UN={q:''};
const rc20UnPrincipal=()=>(typeof NA!=='undefined'&&NA&&NA.modo==='atendimento'&&NA.pacExiste&&NA.pac&&NA.pac.cpf)?PACIENTES.find(p=>p.cpf===NA.pac.cpf)||null:null;
const rc20UnTxt=p=>`${rc20Pront(p)} - ${String(p.n||'').toUpperCase()} - ${p.dn?dmy(p.dn):'sem data'}`;
function rc20UnOpcoes(q,pri){const k=semAc(String(q||'').trim()),d=soDig(q||'');if(k.length<2&&d.length<3)return [];
 return PACIENTES.filter(p=>p!==pri&&!p.unificadoEm&&(semAc(p.n).includes(k)||(d.length>=3&&rc20Pront(p).includes(d)))).sort((a,b)=>a.n.localeCompare(b.n,'pt-BR')).slice(0,8)}
function rc20UnSug(q){const pri=rc20UnPrincipal();if(!pri)return '';const l=rc20UnOpcoes(q,pri),k=String(q||'').trim();if(semAc(k).length<2&&soDig(k).length<3)return '';
 if(!l.length)return `<div class="rc20-sug-v">Nenhum cadastro com “${esc(k)}”.</div>`;
 return l.map(p=>`<button type="button" role="option" class="rc20-sug-i" onclick="rc20UnEscolher(${PACIENTES.indexOf(p)})">${esc(rc20UnTxt(p))}${p.ativo?'':' <small>(inativo)</small>'}</button>`).join('')}
function rc20UnBusca(v){R20_UN.q=v;const l=rc20El('rc20UnL');if(l){l.innerHTML=rc20UnSug(v);l.hidden=!l.innerHTML}}
function rc20UnCampo(){const pri=rc20UnPrincipal();if(!pri)return '';const pode=pacPodeUnificar(),q=R20_UN.q||'',sug=rc20UnSug(q);
 return `<div class="rc20-unif"><div class="field" style="margin:0"><label for="rc20UnQ">Unificar ${info('Junta um cadastro duplicado desta mesma pessoa ao cadastro principal. Nada é apagado: o histórico passa para o principal e o cadastro incorporado fica guardado, ligado a ele, e registrado na auditoria.')}</label>
 <div class="rc20-ac"><input class="in" id="rc20UnQ" role="combobox" aria-autocomplete="list" aria-controls="rc20UnL" aria-expanded="${!!sug}" autocomplete="off" placeholder="Digite o nome do cadastro duplicado" value="${esc(q)}" oninput="rc20UnBusca(this.value)"><div class="rc20-sug" id="rc20UnL" role="listbox" aria-label="Cadastros encontrados" ${sug?'':'hidden'}>${sug}</div></div>
 <span class="msg tl">Cadastro principal: <b>${esc(rc20UnTxt(pri))}</b>.${pode?'':' Seu perfil pesquisa, mas quem confirma a unificação é a gestão.'}</span></div></div>`}
{const _p1=naP1;naP1=function(){const h=_p1.apply(this,arguments);try{const c=rc20UnCampo();if(!c)return h;const i=h.indexOf('<h3>Paciente</h3>');if(i<0)return h;let j=h.indexOf('</div>\n<div class="card',i);if(j<0)j=h.lastIndexOf('</div>');return j<0?h:h.slice(0,j)+c+h.slice(j)}catch(e){return h}}}
/* Ao trocar de paciente, a pesquisa começa vazia */
{const _a=naAchar;naAchar=function(){R20_UN.q='';return _a.apply(this,arguments)}}
const R20_UN_CAMPOS=[['tel','Telefone'],['tel2','Segundo telefone'],['email','E-mail'],['mae','Nome da mãe'],['ns','Nome social'],['resp','Responsável']];
function rc20UnPreenche(pri,sec){return R20_UN_CAMPOS.filter(([k])=>!String(pri[k]||'').trim()&&String(sec[k]||'').trim())}
const rc20UnBloqueio=()=>pacPodeUnificar()?'':`<div class="alert warn"><span>Seu perfil não tem a permissão de unificar cadastros. Quem confirma é a gestão.</span></div>${R20_PERFIL_ANT?'':'<button type="button" class="btn sm sec" style="align-self:flex-start" onclick="closeModal();rc20ComoGestao()">Testar como gestão</button>'}`;
function rc20UnEscolher(i){const pri=rc20UnPrincipal(),sec=PACIENTES[i];if(!pri||!sec||sec===pri)return;const pode=pacPodeUnificar(),pre=rc20UnPreenche(pri,sec),dnDif=pri.dn!==sec.dn;
 const lin=(l,a,b)=>`<tr><td>${l}</td><td>${a}</td><td>${b}</td></tr>`;
 openModal(`${mh('Unificar cadastros')}<div class="mb"><p style="margin:0 0 10px">O cadastro <b>${esc(rc20UnTxt(sec))}</b> será incorporado ao cadastro principal <b>${esc(rc20UnTxt(pri))}</b>.</p>
 <div class="tablewrap"><table class="at-table rc20-un-t"><thead><tr><th></th><th>Principal (fica)</th><th>Incorporado</th></tr></thead><tbody>
 ${lin('Prontuário',`<span class="mono">${esc(rc20Pront(pri))}</span>`,`<span class="mono">${esc(rc20Pront(sec))}</span>`)}${lin('Nome',esc(pri.n),esc(sec.n))}${lin('Nascimento',dmy(pri.dn),dmy(sec.dn))}${lin('CPF',cpfMask(pri.cpf),cpfMask(sec.cpf))}${R20_UN_CAMPOS.map(([k,l])=>lin(l,esc(pri[k]||'')||'<span class="tl">vazio</span>',esc(sec[k]||'')||'<span class="tl">vazio</span>')).join('')}</tbody></table></div>
 ${dnDif?'<div class="alert warn"><span>As datas de nascimento são diferentes. Confira com o documento: se não for a mesma pessoa, não unifique.</span></div>':''}
 <ul class="rc20-un-reg"><li>Fica o cadastro principal. ${pre.length?`Campos vazios nele recebem os dados do outro: ${pre.map(x=>x[1].toLowerCase()).join(', ')}.`:'Os dados dele não mudam.'}</li><li>Atendimentos, agendamentos, guias, orçamentos e histórico do outro cadastro passam para o principal, com a marca de onde vieram.</li><li>O cadastro incorporado não é apagado: fica guardado, inativo e ligado ao principal (prontuário guardado por 20 anos, Lei 13.787/2018).</li><li>A unificação fica na auditoria: quem fez, quando, o motivo e o que foi movido (LGPD).</li></ul>
 ${pode?`<div class="formgrid"><div class="field"><label for="rc20UnM">Motivo <span class="req">*</span></label><select class="in" id="rc20UnM">${['Mesma pessoa cadastrada duas vezes','CPF digitado errado num dos cadastros','Cadastro antigo sem CPF da mesma pessoa'].map(t=>`<option>${t}</option>`).join('')}</select></div></div>
 <label class="at-row check" style="margin-top:8px"><input type="checkbox" id="rc20UnOk"><div class="grow">Conferi com um documento com foto: é a mesma pessoa.</div></label>`:rc20UnBloqueio()}</div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button>${pode?`<button class="btn" onclick="rc20UnConfirmar(${i})">Unificar</button>`:''}</div>`,'wide')}
function rc20UnConfirmar(i){const pri=rc20UnPrincipal(),sec=PACIENTES[i];if(!pri||!sec)return;if(!rc20Chk('rc20UnOk')){toast('Confirme que conferiu o documento: é a mesma pessoa','warn');return}
 const r=rc20Unificar(pri.cpf,sec.cpf,rc20V('rc20UnM')||'Mesma pessoa cadastrada duas vezes');if(r.erro){toast(r.erro,'warn');return}
 closeModal();R20_UN.q='';NA.pac={...pri};NA.pacExiste=true;if(typeof naRender==='function'){try{naRender()}catch(e){}}
 toast(`Cadastro ${r.ok.de} incorporado ao prontuário ${r.ok.em}. ${r.ok.mov} registro(s) movido(s)`)}
/* Unificação: não apaga nada. Move as referências marcando a origem, guarda o vínculo nos dois cadastros e registra tudo. */
function rc20Unificar(cpfPri,cpfSec,mot){if(!pacPodeUnificar())return {erro:'Seu perfil não tem a permissão de unificar pacientes'};
 const pri=PACIENTES.find(p=>p.cpf===cpfPri),sec=PACIENTES.find(p=>p.cpf===cpfSec);if(!pri||!sec)return {erro:'Cadastro não encontrado'};if(pri===sec)return {erro:'Escolha um cadastro diferente do principal'};
 if(sec.unificadoEm)return {erro:'Este cadastro já foi incorporado ao prontuário '+sec.unificadoEm};if(pri.unificadoEm)return {erro:'O cadastro principal já foi incorporado a outro: use o prontuário '+pri.unificadoEm};
 if(!String(mot||'').trim())return {erro:'Informe o motivo'};
 const de=rc20Pront(sec),em=rc20Pront(pri),quando=`${dmy(typeof RC_HOJE!=='undefined'?RC_HOJE:avisoDiaHoje())} às ${rc20Agora()}`,por=rc20Quem(),mesmoNome=semAc(sec.n)===semAc(pri.n);
 const doSec=x=>x&&((sec.cpf&&x.cpf===sec.cpf)||(!x.cpf&&!mesmoNome&&(x.pac===sec.n||x.n===sec.n)));let mov=0;
 const move=l=>{if(!Array.isArray(l))return;l.forEach(x=>{if(!doSec(x))return;if('cpf' in x)x.cpf=pri.cpf;if(x.pac===sec.n)x.pac=pri.n;if(x.n===sec.n)x.n=pri.n;x.unifDe=de;mov++})};
 try{rc()}catch(e){}
 const R=typeof RC!=='undefined'&&RC?RC:{};
 [R.ag,R.guias,R.pre,typeof CL_AG_NOVOS!=='undefined'?CL_AG_NOVOS:null,typeof AG_CLIN!=='undefined'?AG_CLIN:null,typeof ATENDS!=='undefined'?ATENDS:null,typeof ORCS!=='undefined'?ORCS:null].forEach(move);
 if(typeof CL_LINHA!=='undefined'&&!mesmoNome&&Array.isArray(CL_LINHA[sec.n])&&CL_LINHA[sec.n].length){CL_LINHA[pri.n]=(CL_LINHA[pri.n]||[]).concat(CL_LINHA[sec.n].map(e=>({...e,unifDe:de})));mov+=CL_LINHA[sec.n].length}
 const pre=rc20UnPreenche(pri,sec);pre.forEach(([k])=>{pri[k]=sec[k]});
 if(sec.guias&&sec.guias.length)pri.guias=[...new Set([...(pri.guias||[]),...sec.guias])];
 (pri.vinculos=pri.vinculos||[]).push({pront:de,n:sec.n,cpf:sec.cpf,dn:sec.dn,quando,por,mot});
 Object.assign(sec,{ativo:false,unificadoEm:em,unificadoQuando:quando,unificadoPor:por,unificadoMot:mot});
 const reg={quando,por,mot,principal:{pront:em,n:pri.n,cpf:pri.cpf},incorporado:{pront:de,n:sec.n,cpf:sec.cpf,dn:sec.dn},movidos:mov,preenchidos:pre.map(x=>x[1])};R20_UNIF.unshift(reg);
 const txt=`Prontuário ${de} (${sec.n}, ${dmy(sec.dn)}) incorporado ao prontuário ${em} (${pri.n}). Motivo: ${mot}. ${mov} registro(s) movido(s)${pre.length?'; campos completados: '+pre.map(x=>x[1].toLowerCase()).join(', '):''}`;
 try{rcHist({pac:pri.n},'cadastro','Cadastros unificados',txt);if(!mesmoNome)rcHist({pac:sec.n},'cadastro','Cadastro incorporado a outro',txt)}catch(e){}
 return {ok:{de,em,mov,pre:pre.map(x=>x[1])}}}
/* A opção "Unificar cadastros" da tela Pacientes leva ao campo Unificar do Novo atendimento, com a mesma regra */
function pacFundir(cpf){const p=PACIENTES.find(x=>x.cpf===cpf);if(!p)return;if(p.unificadoEm){toast('Este cadastro já foi incorporado ao prontuário '+p.unificadoEm,'warn');return}naNovo('atendimento',cpf);R20_UN.q='';toast('Pesquise no campo Unificar o cadastro duplicado de '+p.n.split(' ')[0])}
/* Cadastro incorporado não abre atendimento novo: o sistema leva para o principal */
{const _b=naAchar;naAchar=function(){const r=_b.apply(this,arguments);try{const p=PACIENTES.find(x=>x.cpf===NA.cpf);if(p&&p.unificadoEm){const pri=PACIENTES.find(x=>x.pront===p.unificadoEm&&!x.unificadoEm);if(pri){NA.cpf=pri.cpf;NA.pac={...pri};NA.pacExiste=true;setTimeout(()=>toast(`Este CPF foi incorporado ao prontuário ${pri.pront} (${pri.n}): o atendimento segue nele`,'warn'),0)}}}catch(e){}return r}}

document.head.insertAdjacentHTML('beforeend',`<style>
/* 613: filtros de Pacientes na largura toda */
.rc19-pac .filters.pac-filtros.r17-pf,.filters.pac-filtros.r17-pf{max-width:none;width:100%;margin:0;grid-template-columns:minmax(0,3fr) minmax(0,1.6fr) minmax(0,1.5fr) minmax(0,1.5fr) minmax(0,1.1fr) auto}
.filters.pac-filtros.r17-pf .btn{min-width:96px}
@media (max-width:1000px){.filters.pac-filtros.r17-pf{grid-template-columns:repeat(2,minmax(0,1fr))}.filters.pac-filtros.r17-pf>:first-child{grid-column:1/-1}}
@media (max-width:560px){.filters.pac-filtros.r17-pf{grid-template-columns:1fr}}
.rc20-pac-tab td[data-l="Prontuário"],.rc20-pac-tab th:first-child{white-space:nowrap;width:1%}
.rc20-fi-pr{margin:0 0 10px}
/* 614 e 615 */
.rc20-av-teste{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border:1px dashed var(--border);border-radius:10px;padding:8px 10px;margin:0 0 10px;font-size:13px;color:var(--fg2)}
.rc20-av-teste.on{border-color:var(--accent);background:var(--accent-soft);color:var(--fg)}
.aviso-dia-it{position:relative}
.rc20-av-ed{position:absolute;top:6px;right:6px;width:32px;height:32px;padding:0;justify-content:center}
.rc20-av-ed svg{width:15px;height:15px}
.aviso-dia-it:has(.rc20-av-ed) .aviso-m{padding-right:38px}
/* 620: botão do painel aberto destacado */
.rc-det-ac .btn.rc20-on{background:var(--accent);border-color:var(--accent);color:#fff;box-shadow:0 0 0 3px var(--accent-soft)}
/* 631: tela de autorização no mesmo padrão dos outros formulários */
.rc20-aut-c{border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin:0 0 12px}
.rc20-aut-c h4{margin:0 0 8px}
.rc20-aut-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px}
.rc20-aut-g .field{margin:0}.rc20-aut-g .rc20-aut-l{grid-column:1/-1}
.rc20-aut-g input[readonly]{background:var(--surface2);color:var(--fg)}
.rc20-aut-tab{color:var(--fg2)}
@media (max-width:640px){.rc20-aut-g{grid-template-columns:1fr}}
/* 663 e 664: campo Unificar com sugestões */
.rc20-unif{margin-top:10px;padding-top:10px;border-top:1px solid var(--border)}
.rc20-ac{position:relative}
.rc20-sug{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:30;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:4px;max-height:260px;overflow:auto}
.rc20-sug-i{display:block;width:100%;text-align:left;border:0;background:none;padding:9px 10px;border-radius:8px;font:inherit;font-size:14px;color:var(--fg);cursor:pointer}
.rc20-sug-i:hover,.rc20-sug-i:focus{background:var(--accent-soft);outline:none}
.rc20-sug-v{padding:9px 10px;font-size:13px;color:var(--fg2)}
.rc20-un-t td:first-child{font-weight:600;white-space:nowrap}
.rc20-un-reg{margin:10px 0;padding-left:18px;font-size:13px;color:var(--fg)}
</style>`);
