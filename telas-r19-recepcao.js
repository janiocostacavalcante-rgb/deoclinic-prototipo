/* Rodada 19 (12/11/2026) · recepcao */
/* ==========================================================================
   Notas 544, 553, 560, 566, 567, 592, 594 a 597, 599 e 600: Guia de Exames, Perfil do profissional, Fila de Pré-agendamento,
   Pacientes, janela de agendamento, módulos Profissionais e Empresas.
   Fica depois dos arquivos da rodada 18: só acrescenta funções e embrulha as que já existem. Prefixos rc19 / R19_.
   ========================================================================== */

const rc19V=id=>{const e=document.getElementById(id);return ((e&&e.value)||'').trim()};
const rc19Chk=id=>{const e=document.getElementById(id);return !!(e&&e.checked)};
const R19_LIXO='<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
const R19_MESES=['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
function rc19CpfDv(b){const d=String(b).replace(/\D/g,'').slice(0,9).split('').map(Number);for(let k=0;k<2;k++){let s=0;for(let i=0;i<d.length;i++)s+=d[i]*(d.length+1-i);let r=(s*10)%11;if(r===10)r=0;d.push(r)}return d.join('')}
function rc19CpfOk(v){const s=soDig(v);if(s.length!==11||/^(\d)\1+$/.test(s))return false;return rc19CpfDv(s.slice(0,9))===s}
function rc19CnpjOk(v){const s=soDig(v);if(s.length!==14||/^(\d)\1+$/.test(s))return false;const c=n=>{const w=n===12?[5,4,3,2,9,8,7,6,5,4,3,2]:[6,5,4,3,2,9,8,7,6,5,4,3,2];let t=0;for(let i=0;i<n;i++)t+=+s[i]*w[i];const r=t%11;return r<2?0:11-r};return c(12)===+s[12]&&c(13)===+s[13]}
const rc19MCnpj=v=>{const d=soDig(v).slice(0,14);return d.replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2')};
const rc19MCep=v=>soDig(v).slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2');
const rc19Hora=()=>{try{return hhmm(new Date())}catch(e){return '08:00'}};
const rc19Aud=(t,o)=>{if(typeof r17Aud==='function')r17Aud(t,o)};

/* ==========================================================================
   Guia de Exames: coluna de sinônimos, e a busca também procura neles (nota 544)
   Sódio entra como exame de exemplo (só no guia), para o caso citado: Sódio, Na, NaCl.
   ========================================================================== */
if(typeof EX!=='undefined'&&!EX.NA)EX.NA={c:'NA',n:'Sódio',s:'Na eletrolito',m:'Soro',p:12,d:1,j:0,u:1,k:2.4};
const R19_SIN={NA:['Na','NaCl','Natremia','Cloreto de sódio'],K:['K','Kalemia','Calemia','Potássio sérico'],GLI:['Glicemia','Glicemia de jejum','Açúcar no sangue'],HEMO:['Hemograma','Hemo','Série vermelha e branca'],
 TRIG:['Triglicérides','TG'],COL:['Lipidograma','Perfil lipídico','HDL','LDL','CT'],TSH:['Tireotrofina','Hormônio tireoestimulante'],T4L:['Tiroxina livre','FT4'],CREA:['Creatinina sérica','Função renal'],UREIA:['Ur','BUN','Função renal'],
 TGO:['AST','Aspartato aminotransferase','Transaminase'],TGP:['ALT','Alanina aminotransferase','Transaminase'],HBA1C:['A1c','Glicada','HbA1c'],EAS:['Sumário de urina','Urina rotina','EAS'],VITD:['25-OH vitamina D','Calcidiol'],
 FERR:['Ferritina sérica','Estoque de ferro'],PSA:['Antígeno prostático específico'],BHCG:['Teste de gravidez','HCG','Beta'],TAP:['TP','INR','RNI','Tempo de protrombina'],GENE:['Exame de DNA','Genético'],DOM:['Coleta em casa','Coleta domiciliar']};
const rc19Sin=c=>R19_SIN[c]||[];
function rcGeLista(){const G=RC.ge,q=semAc(G.q.trim());
 const l=Object.values(EX).filter(e=>e&&e.n&&(!q||semAc([e.n,e.c,e.s||'',...rc19Sin(e.c)].join(' ')).includes(q))&&(!G.mat||(G.mat==='proc'?!!e.proc:e.m===G.mat)));
 const exato=e=>q&&[e.n,e.c,...rc19Sin(e.c)].some(s=>semAc(s)===q)?0:1;
 return l.sort((a,b)=>exato(a)-exato(b)||a.n.localeCompare(b.n))}
function rcGeRows(){const l=rcGeLista();if(!l.length)return vazioLinha(7,'Nenhum exame encontrado','Tente outro nome ou sinônimo.');
 return l.map(e=>{const s=rc19Sin(e.c);return `<tr style="cursor:pointer" onclick="rcGeVer('${e.c}')">${td('Exame',`<div class="two">${esc(e.n)}<small class="mono">${esc(e.c)}</small></div>`)}${td('Sinônimos',s.length?`<span class="rc19-sin">${s.map(esc).join(', ')}</span>`:'<span class="tl">Nenhum</span>')}${td('Material',esc(e.m||e.proc||''))}${td('Preparo',esc(clPrepItem(e.c)||'Sem preparo'))}${td('Prazo',rcPrazo(e))}${td('Urgência',e.u?e.u+' h':'Não')}${td('Valor',fmt(e.p||0))}</tr>`}).join('')}
{const _g=VIEWS['guia-exames'];VIEWS['guia-exames']=function(){return _g.apply(this,arguments).replace('<th>Exame</th>','<th>Exame</th><th>Sinônimos</th>')}}
/* Ficha do exame: sinônimos em lista; gestão e administração podem alterar */
{const _gv=rcGeVer;rcGeVer=function(c){const e=EX[c];if(!e)return;const _od=openDrawer;openDrawer=function(t,h){const s=rc19Sin(c);h=String(h).replace(/<span>Também chamado<\/span><div>[\s\S]*?<\/div>/,'');
  const bloco=`<div class="rc19-ge-sin"><b>Sinônimos</b><p>${s.length?s.map(esc).join(', '):'Nenhum cadastrado.'}</p>${rcCurPode()?`<div class="field"><label for="rc19GeSin">Alterar sinônimos (separe por vírgula)</label><input class="in" id="rc19GeSin" value="${esc(s.join(', '))}"></div><button type="button" class="btn sm sec" onclick="rc19GeSinSalvar('${c}')">Salvar sinônimos</button>`:''}</div>`;
  return _od(t,bloco+h)};try{return _gv.apply(this,arguments)}finally{openDrawer=_od}}}
function rc19GeSinSalvar(c){if(!rcCurPode()){toast('Seu perfil só consulta o guia','warn');return}const l=rc19V('rc19GeSin').split(',').map(s=>s.trim()).filter(Boolean);R19_SIN[c]=[...new Set(l)];
 rc19Aud(`Guia de Exames: sinônimos de ${EX[c].n} alterados para "${R19_SIN[c].join(', ')}"`);closeDrawer();if(location.hash==='#guia-exames')reView();toast('Sinônimos atualizados')}
if(typeof GUIDES!=='undefined')GUIDES['guia-exames']=['Busque pelo nome, por um sinônimo (ex.: Na, NaCl) ou pelo código.','A coluna Sinônimos mostra os outros nomes do exame.','Clique no exame para ver a ficha completa.'];

/* ==========================================================================
   Perfil do profissional: abas Informações e Dúvidas frequentes, cabeçalho sempre visível (nota 553)
   ========================================================================== */
let R19_CP_ABA='info';
/* "Faixa etária atendida" entra entre as informações (a nota pede); dados de exemplo */
if(typeof AG18_CUR_CAMPOS!=='undefined'&&!AG18_CUR_CAMPOS.some(c=>c[0]==='idade')){const k=AG18_CUR_CAMPOS.findIndex(c=>c[0]==='atend');AG18_CUR_CAMPOS.splice(k+1,0,['idade','Faixa etária atendida'])}
const R19_IDADE={p1:'A partir de 16 anos (exemplo).',p2:'Todas as idades; crianças sempre com acompanhante (exemplo).',p3:'A partir da primeira menstruação; menores de 18 anos com responsável (exemplo).',p4:'Adultos, a partir de 18 anos (exemplo).',p5:'Não se aplica: não faz consulta (exemplo).',p6:'Todas as idades (exemplo).',p7:'Adultos, a partir de 18 anos (exemplo).'};
{const _d=ag18CurDados;ag18CurDados=function(id){const c=_d.apply(this,arguments);if(!c.r19){c.r19=true;if(!c.idade||/^A partir de 16 anos \(exemplo\)$/.test(c.idade))c.idade=R19_IDADE[id]||c.idade||''}return c}}
{const _a=ag18CurAbrir;ag18CurAbrir=function(){R19_CP_ABA='info';return _a.apply(this,arguments)}}
function rc19CpAba(k){R19_CP_ABA=k;AG18_CUR_ED={};reView()}
{const _f=ag18FaqEd;ag18FaqEd=function(){R19_CP_ABA='faq';return _f.apply(this,arguments)}}
{const _ec=ag18CurEdCampo;ag18CurEdCampo=function(){R19_CP_ABA='info';return _ec.apply(this,arguments)}}
{const _cp=VIEWS['curriculo-perfil'];VIEWS['curriculo-perfil']=function(){const h=_cp.apply(this,arguments);
 const iT=h.indexOf('<section class="card ag18-cp-top"'),iG=h.indexOf('<div class="ag18-cp-g">'),iE=h.indexOf('<div class="ag18-cp-esq">'),iF=h.indexOf('<section class="card ag18-cp-faq"'),iP=h.indexOf('<p class="tl ag18-cp-pe">');
 if([iT,iG,iE,iF,iP].some(i=>i<0))return h;
 const cab=h.slice(0,iT),topo=h.slice(iT,iG),info=h.slice(iE+'<div class="ag18-cp-esq">'.length,iF).replace(/<\/div>\s*$/,''),faq=h.slice(iF,iP).replace(/<\/div>\s*$/,''),pe=h.slice(iP);
 const n=(ag18CurDados(AG18_CUR_ID).faq||[]).length,a=R19_CP_ABA==='faq'?'faq':'info';
 const tab=(k,t)=>`<button type="button" role="tab" id="rc19CpT_${k}" aria-selected="${a===k}" aria-controls="rc19CpPainel" class="tab ${a===k?'active':''}" onclick="rc19CpAba('${k}')">${t}</button>`;
 const abas=`<div class="tabs rc19-cp-abas" role="tablist" aria-label="Seções do perfil">${tab('info','Informações')}${tab('faq',`Dúvidas frequentes <span class="n">${n}</span>`)}</div>`;
 return `${cab}<div class="rc19-cp-fixo">${topo}${abas}</div><div id="rc19CpPainel" role="tabpanel" aria-labelledby="rc19CpT_${a}" class="${a==='info'?'rc19-cp-info':'rc19-cp-faqp'}">${a==='info'?info:faq}</div>${pe}`}}
if(typeof GUIDES!=='undefined')GUIDES['curriculo-perfil']=['O cabeçalho com nome, especialidade, CRM e RQE fica sempre visível.','Na aba Informações estão os dados do atendimento; na aba Dúvidas frequentes, as perguntas e respostas.','Gestão e administração incluem, editam e excluem as informações.'];

/* ==========================================================================
   Fila de Pré-agendamento (notas 560, 566, 567 e 592)
   Data da solicitação antes do paciente; da mais recente para a mais antiga; navegador de meses;
   pedido Cancelado pode ser excluído, com motivo, e a exclusão fica registrada (LGPD, art. 37: registro das operações de tratamento).
   ========================================================================== */
let R19_PRE_MES=String(typeof RC_HOJE!=='undefined'?RC_HOJE:'2026-11-04').slice(0,7),R19_PRE_OK=false;
const R19_PRE_EXC=[];
const rc19PreDh=x=>(x.data||'')+' '+(x.hr||'00:00');
const rc19PreOrd=(a,b)=>rc19PreDh(b).localeCompare(rc19PreDh(a))||(b.id-a.id);
const rc19NoMes=x=>String(x.data||'').slice(0,7)===R19_PRE_MES;
const rc19MesTxt=k=>`${R19_MESES[+k.slice(5,7)-1]}/${k.slice(0,4)}`;
/* Exemplos: os pedidos de exemplo passam a ter datas diferentes, e entram pedidos de outubro e um cancelado (dados fictícios) */
function rc19PreSeed(){if(R19_PRE_OK||typeof RC==='undefined'||!RC.pre)return;R19_PRE_OK=true;
 const ds=['2026-11-04 10:20','2026-11-03 15:05','2026-11-02 09:40','2026-11-01 08:15'];
 RC.pre.forEach((x,i)=>{if(x.hr)return;const d=(ds[i]||'2026-11-01 08:00').split(' ');x.data=d[0];x.hr=d[1]});
 const livres=PACIENTES.filter(p=>p.ativo&&p.cpf&&!RC.pre.some(x=>x.cpf===p.cpf));
 [['p1','10101012','Cancelado','2026-11-02','11:30','Paciente desistiu do atendimento'],['p4','40101010','Agendado','2026-10-28','14:10',''],['p3','10101012','Cancelado','2026-10-21','09:00','Pedido registrado em duplicidade']].forEach(([prof,proc,st,data,hr,obs],i)=>{const p=livres[i];if(!p||!PROF(prof))return;
  RC.pre.push({id:++RC.seqId,cpf:p.cpf,unid:10,prof,proc,per:'',obs,pac:p.n,data,hr,st,resp:'Exemplo',log:[]})})}
{const _rc=rc;rc=function(){const novo=typeof RC_OK!=='undefined'&&!RC_OK,r=_rc.apply(this,arguments);if(novo)rc19PreSeed();return r}}
if(typeof RC_OK!=='undefined'&&RC_OK)rc19PreSeed();
{const _c=rcPreCriar;rcPreCriar=function(){const r=_c.apply(this,arguments);if(r&&r.ok&&R19_PRE_OK&&!r.ok.hr)r.ok.hr=rc19Hora();return r}}
{const _r=rcPreRows;rcPreRows=function(){rc19PreSeed();const todos=RC.pre;RC.pre=todos.filter(rc19NoMes).sort(rc19PreOrd);let h;try{h=_r.apply(this,arguments)}finally{RC.pre=todos}
 if(!/rcPreSt\(/.test(h))return h.replace(/colspan="\d+"/,'colspan="7"').replace('Mude os filtros ou registre um novo.',`Nada em ${rc19MesTxt(R19_PRE_MES).toLowerCase()} com estes filtros. Use as setas para ver outro mês.`);
 return h.split(/(?=<tr[\s>])/).map(r=>{const m=r.match(/rcPreSt\((\d+),/);if(!m)return r;const x=todos.find(y=>y.id===+m[1]);if(!x)return r;
  r=r.replace(/^<tr([^>]*)>/,a=>a+td('Solicitação',`<div class="two"><span class="mono">${dmy(x.data)}</span><small>${x.hr?'às '+x.hr:''}</small></div>`));
  if(x.st==='Cancelado')r=r.replace(/<td data-l="">([\s\S]*?)<\/td><\/tr>\s*$/,(a,c)=>`<td data-l="">${c}<button type="button" class="btn sm ghost rc19-pre-del" title="Excluir este pedido cancelado" aria-label="Excluir o pedido cancelado de ${esc(x.pac)}" onclick="rc19PreExcluir(${x.id})">${R19_LIXO} Excluir</button></td></tr>`);
  return r}).join('')}}
function rc19PreMes(d){let y=+R19_PRE_MES.slice(0,4),m=+R19_PRE_MES.slice(5,7)+d;if(m<1){m=12;y--}if(m>12){m=1;y++}R19_PRE_MES=`${y}-${String(m).padStart(2,'0')}`;reView()}
{const _v=VIEWS['pre-agendamento'];VIEWS['pre-agendamento']=function(){rc();rc19PreSeed();const todos=RC.pre;RC.pre=todos.filter(rc19NoMes);let h;try{h=_v.apply(this,arguments)}finally{RC.pre=todos}
 h=h.replace('<th>Paciente</th>','<th>Solicitação</th><th>Paciente</th>');
 const nav=`<nav class="rc19-mes" aria-label="Mês das solicitações"><button type="button" class="ibtn" aria-label="Mês anterior" title="Mês anterior" onclick="rc19PreMes(-1)"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button><b aria-live="polite">${rc19MesTxt(R19_PRE_MES)}</b><button type="button" class="ibtn" aria-label="Próximo mês" title="Próximo mês" onclick="rc19PreMes(1)"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button></nav>`;
 const k=h.indexOf('<div class="tablewrap">',Math.max(0,h.indexOf('ag18-pre-fil')));h=k>=0?h.slice(0,k)+nav+h.slice(k):h+nav;
 return h+(R19_PRE_EXC.length?`<p class="tl rc19-pre-exc"><a href="#" onclick="event.preventDefault();rc19PreExcLista()">Ver pedidos excluídos (${R19_PRE_EXC.length})</a> · a exclusão fica registrada com quem fez, quando e o motivo.</p>`:'')}}
function rc19PreExcluir(id){const x=RC.pre.find(y=>y.id===id);if(!x)return;if(x.st!=='Cancelado'){toast('Só pedidos com a situação Cancelado podem ser excluídos','warn');return}
 openModal(`${mh('Excluir pedido cancelado')}<div class="mb"><p style="margin-top:0">O pedido de <b>${esc(x.pac)}</b> (${esc(clProcNome(x.proc))} · ${esc((PROF(x.prof)||{}).n||'')}), feito em ${dmy(x.data)}, sai da fila.</p><p class="tl">Fica registrado quem excluiu, quando e o motivo. O registro não pode ser apagado.</p><div class="field"><label for="rc19PreMot">Motivo da exclusão <span class="req">*</span></label><input class="in" id="rc19PreMot" placeholder="Ex.: pedido duplicado; paciente desistiu"></div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn danger" onclick="rc19PreExcluirOk(${id})">Excluir pedido</button></div>`)}
function rc19PreExcluirOk(id,mot){const i=RC.pre.findIndex(y=>y.id===id);if(i<0)return;const x=RC.pre[i];mot=(mot!==undefined?String(mot):rc19V('rc19PreMot')).trim();
 if(x.st!=='Cancelado'){toast('Só pedidos com a situação Cancelado podem ser excluídos','warn');return}if(mot.length<3){toast('Escreva o motivo da exclusão','warn');return}
 RC.pre.splice(i,1);const por=rcResp(),em=rcAgora();R19_PRE_EXC.unshift({id:x.id,pac:x.pac,cpf:x.cpf,prof:x.prof,proc:x.proc,data:x.data,hr:x.hr||'',st:x.st,mot,por,em});
 rcHist(x,'pre','Pré-agendamento excluído',`${clProcNome(x.proc)} · pedido de ${dmy(x.data)} · Motivo: ${mot}`,(PROF(x.prof)||{}).n);
 rc19Aud(`Pré-agendamento cancelado excluído: ${x.pac} · pedido de ${dmy(x.data)} · Motivo: ${mot}`,{prof:x.prof});
 closeModal();if(location.hash==='#pre-agendamento')reView();toast('Pedido excluído. A exclusão ficou registrada')}
function rc19PreExcLista(){openModal(`${mh('Pedidos excluídos')}<div class="mb">${tabela(['Solicitação','Paciente','Profissional','Excluído por','Em','Motivo'],R19_PRE_EXC.map(e=>`<tr>${td('Solicitação',dmy(e.data)+(e.hr?' às '+e.hr:''))}${td('Paciente',esc(e.pac))}${td('Profissional',esc((PROF(e.prof)||{}).n||''))}${td('Excluído por',esc(e.por))}${td('Em',esc(e.em))}${td('Motivo',esc(e.mot))}</tr>`),'Nenhum pedido excluído')}<p class="tl" style="margin:8px 0 0">Registro somente leitura, guardado para rastreabilidade (LGPD).</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button></div>`,'wide')}
if(typeof GUIDES!=='undefined')GUIDES['pre-agendamento']=['Use as setas do mês para ver as solicitações de cada mês; a mais recente aparece primeiro.','Quando a agenda abrir, a linha mostra Aberta com vaga: entre em contato.','Pedido cancelado pode ser excluído, com motivo. A exclusão fica registrada.'];

/* ==========================================================================
   Pacientes: mesma organização das outras telas (nota 594)
   ========================================================================== */
VIEWS.pacientes=()=>{rc();return `${pageHead('Recepção','Pacientes','Pesquise pelo nome, CPF, data de nascimento ou número da ficha. Clique no paciente para editar o cadastro ou abrir o atendimento.',`<button class="btn" onclick="pacNovo()" ${tipAttr('Novo Paciente','Cadastro pelo CPF; sem CPF só com a exceção configurada (criança, estrangeiro). CPF já cadastrado é recusado.')}>${I.plus} Novo Paciente</button>`)}
<div class="rc19-pac">${pacBuscaFiltros()}</div><div id="pacResultado">${pacBuscaResultado()}</div>`};

/* ==========================================================================
   Janela "Novo agendamento", passo 2: campos no mesmo padrão e nascimento separado da idade (notas 595 e 596)
   ========================================================================== */
function rc19VjCampos(V){const p=V.pac||{},E=V.ed||{};
 return `<div class="pf-g rc19-vj-g"><div class="field s6"><label for="rcVjN">Nome do paciente <span class="req">*</span></label><input class="in cx" id="rcVjN" value="${esc(E.n||'')}"></div>
 <div class="field s3 ag18-nasc"><label for="rc19VjDn">Data de nascimento</label><input class="in rc19-ro" id="rc19VjDn" readonly aria-readonly="true" value="${p.dn?dmy(p.dn):'Não informada'}"></div>
 <div class="field s3"><label for="rc19VjId">Idade</label><input class="in rc19-ro" id="rc19VjId" readonly aria-readonly="true" value="${p.dn?idade(p.dn)+' anos':'Não informada'}"></div>
 <div class="field s3"><label for="rcVjC">CPF <span class="req">*</span></label><input class="in" id="rcVjC" value="${esc(E.cpf||'')}" oninput="this.value=mCPF(this.value)"></div>
 <div class="field s3"><label for="rcVjW">WhatsApp <span class="req">*</span></label><input class="in" id="rcVjW" value="${esc(E.wa||'')}" oninput="this.value=mTel(this.value)"></div></div>`}
{const _vj=rcVjHtml;rcVjHtml=function(){const h=_vj.apply(this,arguments),V=RC.vj;if(!V||V.etapa!==2)return h;const i=h.indexOf('<div class="pf-g">'),j=h.indexOf('<p class="tl" style="margin:8px 0 0">Confira o WhatsApp');if(i<0||j<i)return h;return h.slice(0,i)+rc19VjCampos(V)+h.slice(j)}}

/* ==========================================================================
   Módulo Profissionais (nota 599)
   Lista com busca por nome, CPF, tipo e número do conselho e filtro de situação; novo profissional; recebedor Pagar.me.
   SIMULAÇÃO: nada é enviado ao Pagar.me. O ID do recebedor e o link de prova de vida são fictícios.
   Senha: só o campo (tipo senha); o protótipo não guarda o texto digitado, apenas que foi definida.
   ========================================================================== */
const R19_CONS=[['CRM','CRM · Medicina'],['CRO','CRO · Odontologia'],['CRP','CRP · Psicologia'],['CREFITO','CREFITO · Fisioterapia'],['COREN','COREN · Enfermagem'],['CRBM','CRBM · Biomedicina'],['CRF','CRF · Farmácia'],['CRN','CRN · Nutrição'],['CRFa','CRFa · Fonoaudiologia'],['CRTR','CRTR · Técnicos em radiologia']];
const R19_UFS='AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const R19_OCUP={CRM:'Médico(a)',CRO:'Cirurgião(ã)-dentista',CRP:'Psicólogo(a)',CREFITO:'Fisioterapeuta',COREN:'Enfermeiro(a)',CRBM:'Biomédico(a)',CRF:'Farmacêutico(a)',CRN:'Nutricionista',CRFa:'Fonoaudiólogo(a)',CRTR:'Técnico(a) em radiologia'};
const R19_REC_ST={analise:['Em análise','warn'],afiliacao:['Em afiliação · apto para a prova de vida','info'],ativo:['Ativo','ok'],recusado:['Recusado','err']};
const R19_PRF_X={};let R19_PRF_SEQ=0,R19_REC_SEQ=0,R19_PF={n:'',cpf:'',tipo:'',num:'',st:'ativos'},R19_PF_ED=null;
const R19_PRF_SEED={p1:['201345678','1985-03-12','(85) 98811-2201','camila.rocha',['medico']],p2:['302456781','1978-07-25','(85) 98822-3302','paulo.viana',['imagem','medico']],p3:['403567812','1982-11-02','(85) 98833-4403','renata.albuquerque',['medico']],
 p4:['504678123','1980-01-30','(85) 98844-5504','igor.menezes',['medico']],p5:['605781234','1975-05-18','(85) 98855-6605','helena.brito',['dr']],p6:['706812345','1990-09-09','(85) 98866-7706','tatiane.lopes',['enfermagem']],p7:['807923456','1979-12-14','(85) 98877-8807','reinaldo.pontes',['medico']]};
function rc19Cons(p){const m=/^([A-Za-zÇç]+)(?:-([A-Z]{2}))?\s*(.*)$/.exec(String(p.cons||'').trim())||[];return {tipo:m[1]||'',uf:m[2]||'',num:(m[3]||'').trim()}}
function rc19PrfX(id){if(R19_PRF_X[id])return R19_PRF_X[id];const s=R19_PRF_SEED[id];
 const rec=k=>({id:'re_exemplo0000000000000'+k,st:k==='p1'?'ativo':'afiliacao',em:k==='p1'?'01/10/2026 09:12':'10/11/2026 16:40',por:'Exemplo',link:'',conta:'Conta de exemplo',log:['Recebedor de exemplo (fictício)']});
 return R19_PRF_X[id]=s?{cpf:mCPF(rc19CpfDv(s[0])),dn:s[1],tel:s[2],user:s[3],perfis:s[4].slice(),senha:true,receb:id==='p1'||id==='p2'?rec(id):null}:{cpf:'',dn:'',tel:'',user:'',perfis:[],senha:false,receb:null}}
const rc19PerfNome=k=>((typeof PERFIS!=='undefined'?PERFIS:[]).find(p=>p[0]===k)||['',k])[1];
function rc19PfLista(){const F=R19_PF,q=semAc(F.n.trim()),c=soDig(F.cpf),nd=soDig(F.num),nt=semAc(F.num.trim());
 return PROFISSIONAIS.filter(p=>{const x=rc19PrfX(p.id),k=rc19Cons(p);return (F.st==='todos'||(F.st==='ativos'?p.ativo:!p.ativo))&&(!q||semAc(p.n).includes(q))&&(!c||soDig(x.cpf).includes(c))&&(!F.tipo||k.tipo.toUpperCase()===F.tipo.toUpperCase())&&(!nt||(nd?soDig(k.num).includes(nd):semAc(k.num).includes(nt)))})
  .sort((a,b)=>(typeof rcNomeOrdem==='function'?rcNomeOrdem(a).localeCompare(rcNomeOrdem(b),'pt-BR'):a.n.localeCompare(b.n)))}
function rc19PfRows(){const l=rc19PfLista();if(!l.length)return vazioLinha(8,'Nenhum profissional encontrado','Mude a pesquisa ou o filtro de situação.');
 return l.map(p=>{const x=rc19PrfX(p.id),k=rc19Cons(p),r=x.receb,rs=r&&R19_REC_ST[r.st];
  return `<tr style="cursor:pointer" onclick="if(!event.target.closest('button'))clPrfVer('${p.id}')">${td('Profissional',`<div class="two">${esc(p.n)}<small>${esc(p.esp||'')}</small></div>`)}${td('CPF',x.cpf?`<span class="mono">${cpfMask(x.cpf)}</span>`:'<span class="tl">Não informado</span>')}${td('Conselho',`<span class="mono">${esc(k.tipo)}${k.uf?'-'+esc(k.uf):''}</span>`)}${td('Número',`<span class="mono">${esc(k.num)}</span>`)}${td('Perfis',x.perfis.length?x.perfis.map(rc19PerfNome).map(esc).join(', '):'<span class="tl">Nenhum</span>')}${td('Recebedor',r?`<span class="badge ${rs[1]}">${esc(rs[0])}</span>`:'<span class="tl">Não é recebedor</span>')}${td('Situação',`<span class="badge ${p.ativo?'ok':'neutral'}">${p.ativo?'Ativo':'Inativo'}</span>`)}${td('',`<div class="row rc19-ac"><button type="button" class="btn sm ghost" onclick="rc19PfForm('${p.id}')">${I.edit} Editar</button>${r?`<button type="button" class="btn sm ghost" onclick="rc19RecVer('${p.id}')">Recebedor</button>`:''}<button type="button" class="btn sm ghost" onclick="rc19PfSit('${p.id}')">${p.ativo?'Inativar':'Ativar'}</button></div>`)}</tr>`}).join('')}
function rc19PfSet(k,v){R19_PF[k]=v;const b=document.getElementById('rc19PfB');if(b)b.innerHTML=rc19PfRows()}
VIEWS.profissionais=()=>{rc();const F=R19_PF,cnt=k=>PROFISSIONAIS.filter(p=>k==='todos'||(k==='ativos'?p.ativo:!p.ativo)).length;
 return `${pageHead('Cadastros','Profissionais','Cadastro dos profissionais: dados pessoais, conselho, acesso ao sistema, perfis e recebedor no Pagar.me.',`<button class="btn" onclick="rc19PfForm()">${I.plus} Novo profissional</button>`)}
 <div class="filters rc19-pf-f"><div class="field"><label for="rc19PfQn">Nome</label><input class="in" id="rc19PfQn" value="${esc(F.n)}" placeholder="Completo ou parte" oninput="rc19PfSet('n',this.value)"></div><div class="field"><label for="rc19PfQc">CPF</label><input class="in" id="rc19PfQc" inputmode="numeric" value="${esc(F.cpf)}" placeholder="Completo ou parte" oninput="rc19PfSet('cpf',this.value)"></div>
 <div class="field"><label for="rc19PfQt">Tipo de conselho</label><select class="in" id="rc19PfQt" onchange="rc19PfSet('tipo',this.value)"><option value="">Todos</option>${R19_CONS.map(([v,t])=>`<option value="${v}" ${F.tipo===v?'selected':''}>${t}</option>`).join('')}</select></div><div class="field"><label for="rc19PfQr">Número do conselho</label><input class="in" id="rc19PfQr" value="${esc(F.num)}" placeholder="Ex.: 14512" oninput="rc19PfSet('num',this.value)"></div>
 <div class="field"><label for="rc19PfQs">Situação</label><select class="in" id="rc19PfQs" onchange="rc19PfSet('st',this.value)">${[['ativos','Ativos'],['inativos','Inativos'],['todos','Todos']].map(([v,t])=>`<option value="${v}" ${F.st===v?'selected':''}>${t} (${cnt(v)})</option>`).join('')}</select></div></div>
 <div class="tablewrap"><table class="at-table"><thead><tr>${['Profissional','CPF','Conselho','Número','Perfis','Recebedor','Situação',''].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody id="rc19PfB">${rc19PfRows()}</tbody></table></div>
 <p class="tl" style="margin-top:8px">Clique na linha para ver a ficha (grade da agenda, o que faz e repasse). Recebedor Pagar.me: simulação no protótipo, nada é enviado.</p>`};
function rc19PfSit(id){const p=PROF(id);if(!p)return;modalOk(p.ativo?'Inativar profissional?':'Ativar profissional?',`<p><b>${esc(p.n)}</b> ${p.ativo?'deixa de aparecer para agendar e para novos atendimentos. O histórico continua.':'volta a aparecer para agendar e atender.'}</p>`,p.ativo?'Inativar':'Ativar',`rc19PfSitOk('${id}')`,p.ativo?'danger':'')}
function rc19PfSitOk(id){const p=PROF(id);if(!p)return;p.ativo=!p.ativo;rc19Aud(`Profissional ${p.ativo?'ativado':'inativado'}: ${p.n}`,{prof:id});if(location.hash==='#profissionais')reView();toast(p.ativo?'Profissional ativado':'Profissional inativado')}
/* Formulário */
const rc19Campo=(id,lab,val,o)=>{o=o||{};return `<div class="field ${o.cls||''}"><label for="${id}">${lab}${o.req?' <span class="req">*</span>':''}</label>${o.sel?`<select class="in" id="${id}" ${o.at||''}>${o.sel}</select>`:`<input class="in" id="${id}" type="${o.type||'text'}" value="${esc(val||'')}" ${o.at||''}>`}${o.dica?`<small class="tl">${o.dica}</small>`:''}</div>`};
function rc19PfForm(id){rc();const p=id?PROF(id):null,x=id?rc19PrfX(id):{cpf:'',dn:'',tel:'',user:'',perfis:[],receb:null},k=p?rc19Cons(p):{tipo:'',uf:'CE',num:''};R19_PF_ED={id:id||'',rec:null};
 const perf=(typeof PERFIS!=='undefined'?PERFIS:[]).filter(q=>q[0]!=='admin');
 openModal(`${mh(id?'Editar profissional':'Novo profissional')}<div class="mb"><div class="pf-g rc19-pf-g">
 ${rc19Campo('rc19PfN','Nome',p?p.n:'',{req:1,cls:'s4'})}${rc19Campo('rc19PfC','CPF',x.cpf,{req:1,cls:'s2',at:'inputmode="numeric" oninput="this.value=mCPF(this.value)"'})}
 ${rc19Campo('rc19PfD','Data de nascimento',x.dn,{req:1,cls:'s2',type:'date'})}${rc19Campo('rc19PfT','Telefone',x.tel,{req:1,cls:'s2',at:'inputmode="tel" oninput="this.value=mTel(this.value)"'})}${rc19Campo('rc19PfE','Especialidade',p?p.esp:'',{cls:'s2',dica:'Opcional. Aparece na agenda e no currículo.'})}
 ${rc19Campo('rc19PfK','Conselho',k.tipo,{req:1,cls:'s2',sel:`<option value="">Selecione</option>${R19_CONS.map(([v,t])=>`<option value="${v}" ${k.tipo.toUpperCase()===v.toUpperCase()?'selected':''}>${t}</option>`).join('')}`})}${rc19Campo('rc19PfU','UF do conselho',k.uf,{req:1,cls:'s1',sel:R19_UFS.map(u=>`<option ${u===(k.uf||'CE')?'selected':''}>${u}</option>`).join('')})}${rc19Campo('rc19PfR','Número do conselho',k.num,{req:1,cls:'s3'})}
 ${rc19Campo('rc19PfL','Nome de usuário',x.user,{req:1,cls:'s3',at:'autocomplete="off" autocapitalize="none"',dica:'Letras minúsculas, números, ponto ou traço.'})}${rc19Campo('rc19PfS','Senha','',{req:!id,cls:'s3',type:'password',at:'autocomplete="new-password"',dica:id?'Deixe em branco para manter a senha atual.':'Mínimo de 8 caracteres, com letras e números. No protótipo a senha não é guardada.'})}
 <div class="field s6"><span class="rc19-lab">Tipos de perfil <span class="req">*</span></span><div class="rc19-chk">${perf.map(([v,t])=>`<label><input type="checkbox" id="rc19PfP_${v}" ${x.perfis.includes(v)?'checked':''}> ${esc(t)}</label>`).join('')}</div></div>
 ${x.receb?`<div class="field s6"><div class="alert info"><span>Já é recebedor no Pagar.me · ID <span class="mono">${esc(x.receb.id)}</span> · ${esc(R19_REC_ST[x.receb.st][0])}. Use o botão Recebedor na lista.</span></div></div>`:`<div class="field s6"><label class="rc19-flag"><input type="checkbox" id="rc19PfRec" onchange="rc19RecTog(this.checked)"> <b>Também é recebedor</b> <span class="tl">(cria o recebedor no Pagar.me para receber o repasse)</span></label></div>`}
 </div><div id="rc19RecBox"></div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="rc19PfSalvar()">${id?'Salvar':'Cadastrar profissional'}</button></div>`,'wide')}
/* Recebedor Pagar.me: dados pedidos para pessoa física (cadastro, endereço, conta bancária e transferência) */
const R19_REC_CAMPOS=[['nome','Nome completo',1,'s4'],['cpf','CPF',1,'s2'],['email','E-mail',1,'s3'],['tel','Telefone',1,'s3'],['dn','Data de nascimento',1,'s2'],['renda','Renda mensal (R$)',1,'s2'],['ocup','Profissão',1,'s2'],
 ['cep','CEP',1,'s2'],['rua','Rua',1,'s3'],['num','Número',1,'s1'],['comp','Complemento',0,'s2'],['bairro','Bairro',1,'s2'],['cidade','Cidade',1,'s2'],['uf','UF',1,'s1'],['ref','Ponto de referência',1,'s3'],
 ['banco','Banco (código)',1,'s2'],['ag','Agência',1,'s1'],['agdv','Dígito da agência',0,'s1'],['conta','Conta',1,'s1'],['contadv','Dígito da conta',1,'s1'],['tipo','Tipo de conta',1,'s2'],['transf','Transferência automática',1,'s2']];
function rc19RecDoCadastro(){const t=rc19V('rc19PfK');return {nome:rc19V('rc19PfN'),cpf:rc19V('rc19PfC'),tel:rc19V('rc19PfT'),dn:rc19V('rc19PfD'),ocup:R19_OCUP[t]||'',uf:rc19V('rc19PfU')}}
function rc19RecTog(on){const b=document.getElementById('rc19RecBox');if(!R19_PF_ED)R19_PF_ED={id:'',rec:null};if(!on){R19_PF_ED.rec=null;if(b)b.innerHTML='';return}
 const d=rc19RecDoCadastro(),cheio=Object.fromEntries(Object.entries(d).filter(([,v])=>v));R19_PF_ED.rec={tipo:'Conta corrente',transf:'Semanal (toda segunda-feira)',cidade:'Fortaleza',...cheio,auto:Object.keys(cheio)};if(b)b.innerHTML=rc19RecHtml(R19_PF_ED.rec)}
function rc19RecCopiar(){if(!R19_PF_ED||!R19_PF_ED.rec)return;rc19RecLer();const d=rc19RecDoCadastro();Object.entries(d).forEach(([k,v])=>{if(v){R19_PF_ED.rec[k]=v;if(!R19_PF_ED.rec.auto.includes(k))R19_PF_ED.rec.auto.push(k)}});const b=document.getElementById('rc19RecBox');if(b)b.innerHTML=rc19RecHtml(R19_PF_ED.rec);toast('Dados copiados do cadastro do profissional')}
function rc19RecHtml(R){const c=([k,l,req,cls])=>{const at=k==='cpf'?'oninput="this.value=mCPF(this.value)"':k==='tel'?'oninput="this.value=mTel(this.value)"':k==='cep'?'oninput="this.value=rc19MCep(this.value)"':'';
  const dica=R.auto.includes(k)?'Copiado do cadastro':'';
  if(k==='tipo')return rc19Campo('rc19Rc_tipo',l,'',{req,cls,sel:['Conta corrente','Conta poupança'].map(o=>`<option ${R.tipo===o?'selected':''}>${o}</option>`).join('')});
  if(k==='transf')return rc19Campo('rc19Rc_transf',l,'',{req,cls,sel:['Diária','Semanal (toda segunda-feira)','Mensal (dia 10)'].map(o=>`<option ${R.transf===o?'selected':''}>${o}</option>`).join('')});
  if(k==='uf')return rc19Campo('rc19Rc_uf',l,'',{req,cls:cls+(dica?' rc19-auto':''),dica,sel:R19_UFS.map(u=>`<option ${u===(R.uf||'CE')?'selected':''}>${u}</option>`).join('')});
  return rc19Campo('rc19Rc_'+k,l,R[k]||'',{req,cls:cls+(dica?' rc19-auto':''),type:k==='dn'?'date':k==='email'?'email':'text',at,dica})};
 const sec=(t,ks)=>`<h4 class="rc19-rec-h">${t}</h4><div class="pf-g">${R19_REC_CAMPOS.filter(x=>ks.includes(x[0])).map(c).join('')}</div>`;
 return `<section class="rc19-rec" aria-label="Recebedor Pagar.me"><div class="rc19-rec-top"><h3>Recebedor no Pagar.me</h3><button type="button" class="btn sm ghost" onclick="rc19RecCopiar()">Copiar de novo do cadastro</button></div>
 <p class="tl" style="margin:0 0 8px">Os campos marcados vieram do cadastro do profissional. A conta bancária precisa estar no nome e no CPF do próprio profissional. <b>Simulação:</b> no protótipo nada é enviado ao Pagar.me; o ID gerado é fictício.</p>
 ${sec('Dados do recebedor',['nome','cpf','email','tel','dn','renda','ocup'])}${sec('Endereço',['cep','rua','num','comp','bairro','cidade','uf','ref'])}${sec('Conta bancária e transferência',['banco','ag','agdv','conta','contadv','tipo','transf'])}</section>`}
function rc19RecLer(){const R=R19_PF_ED&&R19_PF_ED.rec;if(!R)return null;R19_REC_CAMPOS.forEach(([k])=>{const e=document.getElementById('rc19Rc_'+k);if(e&&typeof e.value==='string'&&(e.value!==''||R[k]===undefined))R[k]=e.value.trim()});return R}
function rc19RecValida(R,cpfPf){const falta=R19_REC_CAMPOS.filter(([k,,req])=>req&&!String(R[k]||'').trim()).map(x=>x[1]);if(falta.length)return 'Recebedor: preencha '+falta.slice(0,3).join(', ')+(falta.length>3?' e outros':'');
 if(!rc19CpfOk(R.cpf))return 'Recebedor: CPF inválido';if(soDig(R.cpf)!==soDig(cpfPf))return 'Recebedor: o CPF precisa ser o do profissional (titular da conta)';if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(R.email))return 'Recebedor: e-mail inválido';
 if(soDig(R.cep).length!==8)return 'Recebedor: CEP com 8 números';if(!/^\d{3}$/.test(soDig(R.banco)))return 'Recebedor: código do banco com 3 números (ex.: 001, 237, 341)';return ''}
function rc19PfSalvar(){const E=R19_PF_ED||{id:''},id=E.id,p=id?PROF(id):null;
 const f={n:rc19V('rc19PfN'),cpf:rc19V('rc19PfC'),dn:rc19V('rc19PfD'),tel:rc19V('rc19PfT'),esp:rc19V('rc19PfE'),tipo:rc19V('rc19PfK'),uf:rc19V('rc19PfU')||'CE',num:rc19V('rc19PfR'),user:rc19V('rc19PfL').toLowerCase(),senha:rc19V('rc19PfS'),
  perfis:(typeof PERFIS!=='undefined'?PERFIS:[]).map(q=>q[0]).filter(k=>rc19Chk('rc19PfP_'+k))};
 const outros=PROFISSIONAIS.filter(q=>q.id!==id),erro=!f.n?'Informe o nome':!rc19CpfOk(f.cpf)?'CPF inválido: confira os números':outros.some(q=>soDig(rc19PrfX(q.id).cpf)===soDig(f.cpf))?'Já existe profissional com este CPF':
  !f.dn?'Informe a data de nascimento':f.dn>=RC_HOJE?'Data de nascimento inválida':!f.tipo?'Escolha o conselho':!f.num?'Informe o número do conselho':outros.some(q=>{const k=rc19Cons(q);return k.tipo.toUpperCase()===f.tipo.toUpperCase()&&k.uf===f.uf&&soDig(k.num)===soDig(f.num)})?'Este número de conselho já está cadastrado':
  soDig(f.tel).length<10?'Telefone com DDD':!/^[a-z0-9._-]{3,}$/.test(f.user)?'Nome de usuário: mínimo 3 caracteres, sem espaço nem acento':outros.some(q=>rc19PrfX(q.id).user===f.user)?'Este nome de usuário já existe':
  (!id||f.senha)&&!(f.senha.length>=8&&/[A-Za-z]/.test(f.senha)&&/\d/.test(f.senha))?'Senha: mínimo de 8 caracteres, com letras e números':!f.perfis.length?'Marque pelo menos um tipo de perfil':'';
 if(erro){toast(erro,'warn');return}
 const R=rc19RecLer();if(R){const e=rc19RecValida(R,f.cpf);if(e){toast(e,'warn');return}}
 const cons=`${f.tipo}-${f.uf} ${f.num}`,nome=f.n.toUpperCase();let q=p;
 if(q)Object.assign(q,{n:nome,cons,esp:f.esp||q.esp});else{let nid;do{nid='p'+(100+ ++R19_PRF_SEQ)}while(PROF(nid));q={id:nid,n:nome,ini:nome.replace(/^(DRA?|ENF)\.\s*/,'').split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join(''),cons,esp:f.esp||'Não informada',unids:[RC.unid||10],cor:'#0E7490',repasse:'A definir',ativo:true};PROFISSIONAIS.push(q)}
 const x=rc19PrfX(q.id);Object.assign(x,{cpf:mCPF(f.cpf),dn:f.dn,tel:f.tel,user:f.user,perfis:f.perfis,senha:x.senha||!!f.senha});
 rc19Aud(`Profissional ${p?'alterado':'cadastrado'}: ${nome} · ${cons}${f.senha?' · senha definida':''}`,{prof:q.id});
 let msg=p?'Cadastro atualizado':'Profissional cadastrado';
 if(R){x.receb=rc19RecCriar(R,q);msg+=`. Recebedor criado no Pagar.me (simulação) · ID ${x.receb.id}`}
 R19_PF_ED=null;closeModal();if(location.hash==='#profissionais')reView();toast(msg)}
/* Criação simulada do recebedor: devolve um ID fictício e liga ao cadastro do profissional */
function rc19RecCriar(R,p){const n=++R19_REC_SEQ,id='re_sim'+(Date.now().toString(36)+'000000000000').slice(0,12)+String(n).padStart(8,'0');
 const r={id,st:'analise',em:rcAgora(),por:rcResp(),link:'',log:[`${rcAgora()} · Recebedor criado (simulação) por ${rcResp()}`],conta:`Banco ${soDig(R.banco)} · Ag. ${R.ag} · Conta ****${String(R.conta).slice(-3)}-${R.contadv}`,email:R.email};
 rc19Aud(`Recebedor Pagar.me criado (simulação): ${p.n} · ID ${id}`,{prof:p.id});return r}
function rc19RecVer(id){const p=PROF(id),x=rc19PrfX(id),r=x.receb;if(!p||!r)return;const s=R19_REC_ST[r.st];
 const acoes=r.st==='analise'?`<button class="btn sec" onclick="rc19RecAvanca('${id}','afiliacao')">Simular: Pagar.me colocou em afiliação</button>`
  :r.st==='afiliacao'?`${r.link?`<button class="btn sec" onclick="rc19RecEnviar('${id}')">Enviar o link ao profissional</button>`:`<button class="btn" onclick="rc19RecLink('${id}')">Link de prova de vida</button>`}<button class="btn ghost" onclick="rc19RecAvanca('${id}','ativo')">Simular: prova de vida concluída</button>`:'';
 openModal(`${mh('Recebedor no Pagar.me')}<div class="mb">${kvs([['Profissional',esc(p.n)],['ID do recebedor',`<span class="mono">${esc(r.id)}</span> <span class="tl">(fictício)</span>`],['Situação',`<span class="badge ${s[1]}">${esc(s[0])}</span>`],['Conta',esc(r.conta||'Conta de exemplo')],['Criado em',esc(r.em)+' · '+esc(r.por)],...(r.link?[['Link de prova de vida',`<span class="mono rc19-link">${esc(r.link)}</span>`]]:[])])}
 ${r.st==='afiliacao'?'<p class="tl">O recebedor está em afiliação e apto para ativação: falta a prova de vida, que o próprio profissional faz pelo celular, com o link.</p>':r.st==='analise'?'<p class="tl">O Pagar.me analisa o cadastro. Quando entrar em afiliação, o link de prova de vida fica disponível aqui.</p>':''}
 <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">${acoes}</div><h4 style="margin:14px 0 6px">Histórico</h4><ul class="rc19-log">${r.log.map(l=>`<li>${esc(l)}</li>`).join('')}</ul><p class="tl">Simulação: no protótipo nada é enviado ao Pagar.me nem ao profissional.</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button></div>`)}
function rc19RecAvanca(id,st){const r=rc19PrfX(id).receb;if(!r)return;r.st=st;r.log.push(`${rcAgora()} · Situação: ${R19_REC_ST[st][0]} (simulação)`);rc19Aud(`Recebedor Pagar.me: ${R19_REC_ST[st][0]} (simulação) · ${PROF(id).n}`,{prof:id});rc19RecVer(id);if(location.hash==='#profissionais'){const b=document.getElementById('rc19PfB');if(b)b.innerHTML=rc19PfRows()}}
function rc19RecLink(id){const r=rc19PrfX(id).receb;if(!r||r.st!=='afiliacao'){toast('O link só fica disponível com o recebedor em afiliação','warn');return}r.link=`https://prova-de-vida.exemplo.invalid/${r.id}`;r.log.push(`${rcAgora()} · Link de prova de vida obtido por ${rcResp()} (simulação)`);rc19RecVer(id);toast('Link de prova de vida gerado (simulação)')}
function rc19RecEnviar(id){const x=rc19PrfX(id),r=x.receb;if(!r||!r.link)return;r.log.push(`${rcAgora()} · Link enviado para ${x.tel||'o profissional'} por ${rcResp()} (simulação)`);rc19Aud(`Link de prova de vida enviado (simulação) · ${PROF(id).n}`,{prof:id});rc19RecVer(id);toast('Link enviado ao profissional (simulação: nada saiu do protótipo)')}

/* ==========================================================================
   Módulo Empresas: cadastro de novas unidades (nota 600)
   Lista própria do protótipo (dados fictícios). As unidades usadas no restante do sistema continuam as mesmas até a ligação com o sistema real.
   ========================================================================== */
let R19_EMP=null,R19_EMP_Q='',R19_EMP_ST='ativos',R19_EMP_SEQ=0,R19_EMP_ED='';
const R19_EMP_TIPOS=['Matriz','Filial','Posto de coleta','Clínica parceira'];
function rc19Emps(){if(R19_EMP)return R19_EMP;R19_EMP=(typeof UNIDADES!=='undefined'?UNIDADES:[]).map(u=>({id:'e'+u.c,razao:'DeoVita Clínicas Ltda (exemplo)',fant:u.n,cnpj:/^\d/.test(u.cnpj||'')?u.cnpj:'',tipo:u.c===10?'Matriz':'Posto de coleta',cnes:u.cnes||'',tel:'(85) 3000-00'+String(u.c).padStart(2,'0'),email:'',cep:'',rua:'',num:'',bairro:'',cidade:'Fortaleza',uf:'CE',rt:'Dra. Helena Brito · CRBM 12345',ativo:u.sit!==false}));return R19_EMP}
function rc19EmpRows(){const q=semAc(R19_EMP_Q.trim()),d=soDig(R19_EMP_Q),l=rc19Emps().filter(e=>(R19_EMP_ST==='todos'||(R19_EMP_ST==='ativos'?e.ativo:!e.ativo))&&(!q||semAc(e.fant+' '+e.razao+' '+e.cidade).includes(q)||(d.length>=3&&soDig(e.cnpj).includes(d))));
 if(!l.length)return vazioLinha(7,'Nenhuma empresa encontrada','Mude a pesquisa ou o filtro de situação.');
 return l.map(e=>`<tr>${td('Empresa',`<div class="two">${esc(e.fant)}<small>${esc(e.razao)}</small></div>`)}${td('CNPJ',e.cnpj?`<span class="mono">${esc(e.cnpj)}</span>`:'<span class="tl">Usa o da matriz</span>')}${td('Tipo',esc(e.tipo))}${td('CNES',`<span class="mono">${esc(e.cnes||'')}</span>`)}${td('Cidade',esc(e.cidade+(e.uf?'/'+e.uf:'')))}${td('Situação',`<span class="badge ${e.ativo?'ok':'neutral'}">${e.ativo?'Ativa':'Inativa'}</span>`)}${td('',`<div class="row rc19-ac"><button type="button" class="btn sm ghost" onclick="rc19EmpForm('${e.id}')">${I.edit} Editar</button><button type="button" class="btn sm ghost" onclick="rc19EmpSit('${e.id}')">${e.ativo?'Inativar':'Ativar'}</button></div>`)}</tr>`).join('')}
function rc19EmpSet(k,v){if(k==='q')R19_EMP_Q=v;else R19_EMP_ST=v;const b=document.getElementById('rc19EmpB');if(b)b.innerHTML=rc19EmpRows()}
VIEWS.empresas=()=>{rc();return `${pageHead('Cadastros','Empresas','Cadastro das empresas e unidades da rede: matriz, filiais, postos de coleta e parceiras.',`<button class="btn" onclick="rc19EmpForm()">${I.plus} Nova empresa</button>`)}
 <div class="filters rc19-emp-f"><div class="field" style="flex:1 1 260px"><label for="rc19EmpQ">Pesquisar</label><input class="in" id="rc19EmpQ" value="${esc(R19_EMP_Q)}" placeholder="Nome, razão social, cidade ou CNPJ" oninput="rc19EmpSet('q',this.value)"></div><div class="field"><label for="rc19EmpS">Situação</label><select class="in" id="rc19EmpS" onchange="rc19EmpSet('st',this.value)">${[['ativos','Ativas'],['inativos','Inativas'],['todos','Todas']].map(([v,t])=>`<option value="${v}" ${R19_EMP_ST===v?'selected':''}>${t}</option>`).join('')}</select></div></div>
 <div class="tablewrap"><table class="at-table"><thead><tr>${['Empresa','CNPJ','Tipo','CNES','Cidade','Situação',''].map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody id="rc19EmpB">${rc19EmpRows()}</tbody></table></div>`};
function rc19EmpForm(id){const e=id?rc19Emps().find(x=>x.id===id):null,v=k=>e?e[k]:'';R19_EMP_ED=id||'';
 openModal(`${mh(e?'Editar empresa':'Nova empresa')}<div class="mb"><div class="pf-g">
 ${rc19Campo('rc19EmR','Razão social',v('razao'),{req:1,cls:'s4'})}${rc19Campo('rc19EmT','Tipo',v('tipo'),{req:1,cls:'s2',sel:R19_EMP_TIPOS.map(t=>`<option ${t===(v('tipo')||'Filial')?'selected':''}>${t}</option>`).join('')})}
 ${rc19Campo('rc19EmF','Nome fantasia (nome da unidade)',v('fant'),{req:1,cls:'s4'})}${rc19Campo('rc19EmC','CNPJ',v('cnpj'),{req:1,cls:'s2',at:'inputmode="numeric" oninput="this.value=rc19MCnpj(this.value)"',dica:'Posto que usa o CNPJ da matriz: repita o da matriz.'})}
 ${rc19Campo('rc19EmN','CNES',v('cnes'),{cls:'s2',at:'inputmode="numeric" maxlength="7"',dica:'Cadastro Nacional de Estabelecimentos de Saúde, 7 números.'})}${rc19Campo('rc19EmTel','Telefone',v('tel'),{req:1,cls:'s2',at:'oninput="this.value=mTel(this.value)"'})}${rc19Campo('rc19EmE','E-mail',v('email'),{cls:'s2',type:'email'})}
 ${rc19Campo('rc19EmCep','CEP',v('cep'),{req:1,cls:'s2',at:'oninput="this.value=rc19MCep(this.value)"'})}${rc19Campo('rc19EmRua','Rua',v('rua'),{req:1,cls:'s3'})}${rc19Campo('rc19EmNum','Número',v('num'),{req:1,cls:'s1'})}
 ${rc19Campo('rc19EmB','Bairro',v('bairro'),{req:1,cls:'s2'})}${rc19Campo('rc19EmCid','Cidade',v('cidade')||'Fortaleza',{req:1,cls:'s3'})}${rc19Campo('rc19EmUf','UF','',{req:1,cls:'s1',sel:R19_UFS.map(u=>`<option ${u===(v('uf')||'CE')?'selected':''}>${u}</option>`).join('')})}
 ${rc19Campo('rc19EmRt','Responsável técnico (nome e conselho)',v('rt'),{req:1,cls:'s6',dica:'A vigilância sanitária exige responsável técnico para a unidade de saúde funcionar.'})}
 </div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="rc19EmpSalvar()">${e?'Salvar':'Cadastrar empresa'}</button></div>`,'wide')}
function rc19EmpSalvar(){const id=R19_EMP_ED,L=rc19Emps(),f={razao:rc19V('rc19EmR'),tipo:rc19V('rc19EmT')||'Filial',fant:rc19V('rc19EmF'),cnpj:rc19V('rc19EmC'),cnes:soDig(rc19V('rc19EmN')),tel:rc19V('rc19EmTel'),email:rc19V('rc19EmE'),cep:rc19V('rc19EmCep'),rua:rc19V('rc19EmRua'),num:rc19V('rc19EmNum'),bairro:rc19V('rc19EmB'),cidade:rc19V('rc19EmCid'),uf:rc19V('rc19EmUf')||'CE',rt:rc19V('rc19EmRt')};
 const falta=[['razao','a razão social'],['fant','o nome fantasia'],['cnpj','o CNPJ'],['tel','o telefone'],['cep','o CEP'],['rua','a rua'],['num','o número'],['bairro','o bairro'],['cidade','a cidade'],['rt','o responsável técnico']].find(([k])=>!f[k]);
 const erro=falta?'Informe '+falta[1]:!rc19CnpjOk(f.cnpj)?'CNPJ inválido: confira os números':f.cnes&&f.cnes.length!==7?'CNES com 7 números':soDig(f.cep).length!==8?'CEP com 8 números':f.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)?'E-mail inválido':
  L.some(e=>e.id!==id&&semAc(e.fant)===semAc(f.fant))?'Já existe empresa com este nome fantasia':L.some(e=>e.id!==id&&f.tipo!=='Posto de coleta'&&e.tipo!=='Posto de coleta'&&soDig(e.cnpj)===soDig(f.cnpj))?'Este CNPJ já está cadastrado em outra empresa':'';
 if(erro){toast(erro,'warn');return}
 f.fant=f.fant.toUpperCase();let e=id&&L.find(x=>x.id===id);if(e)Object.assign(e,f);else{e={id:'en'+(++R19_EMP_SEQ),ativo:true,...f};L.push(e)}
 rc19Aud(`Empresa ${id?'alterada':'cadastrada'}: ${f.fant} · CNPJ ${f.cnpj}`);R19_EMP_ED='';closeModal();if(location.hash==='#empresas')reView();toast(id?'Empresa atualizada':'Empresa cadastrada')}
function rc19EmpSit(id){const e=rc19Emps().find(x=>x.id===id);if(!e)return;modalOk(e.ativo?'Inativar empresa?':'Ativar empresa?',`<p><b>${esc(e.fant)}</b> ${e.ativo?'deixa de receber novos atendimentos. O histórico continua.':'volta a receber atendimentos.'}</p>`,e.ativo?'Inativar':'Ativar',`rc19EmpSitOk('${id}')`,e.ativo?'danger':'')}
function rc19EmpSitOk(id){const e=rc19Emps().find(x=>x.id===id);if(!e)return;e.ativo=!e.ativo;rc19Aud(`Empresa ${e.ativo?'ativada':'inativada'}: ${e.fant}`);if(location.hash==='#empresas')reView();toast(e.ativo?'Empresa ativada':'Empresa inativada')}

/* ---------- Menu: em Cadastros, Estabelecimentos, Empresas, Unidades e Profissionais ficam juntos ---------- */
{const g=MENU.find(x=>x[0]==='Cadastros');if(g){const L=g[1],pi=L.findIndex(i=>i[0]==='profissionais'),prf=pi>=0?L.splice(pi,1)[0]:['profissionais','Profissionais'];
 if(!L.some(i=>i[0]==='empresas')){const ui=L.findIndex(i=>i[0]==='unidades');L.splice(ui>=0?ui:L.length,0,['empresas','Empresas'])}
 const u2=L.findIndex(i=>i[0]==='unidades');L.splice(u2>=0?u2+1:L.length,0,prf)}}
NAMES.empresas='Empresas';NAMES.profissionais='Profissionais';
if(typeof DESC!=='undefined')Object.assign(DESC,{empresas:'Cadastro das empresas e unidades da rede: razão social, CNPJ, CNES, endereço e responsável técnico.',profissionais:'Cadastro dos profissionais: CPF, conselho, usuário, perfis e recebedor no Pagar.me (repasse).'});
if(typeof GUIDES!=='undefined')Object.assign(GUIDES,{empresas:['Pesquise pelo nome, razão social, cidade ou CNPJ.','Clique em Nova empresa para cadastrar uma unidade.','Inativar não apaga: o histórico continua.'],profissionais:['Pesquise por nome, CPF, tipo ou número do conselho; filtre ativos, inativos ou todos.','Novo profissional: marque "Também é recebedor" para abrir os dados do Pagar.me, já com o que foi preenchido.','No botão Recebedor fica o link de prova de vida, quando o recebedor estiver em afiliação.']});

/* ---------- Estilos ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
.rc19-sin{font-size:13px;color:var(--fg)}
.rc19-ge-sin{border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:12px;display:flex;flex-direction:column;gap:8px}
.rc19-ge-sin p{margin:0}.rc19-ge-sin .field{margin:0}
.rc19-cp-fixo{position:sticky;top:72px;z-index:6;background:var(--bg);padding:4px 0 0;box-shadow:0 8px 8px -8px rgba(0,0,0,.12)}
.rc19-cp-fixo .ag18-cp-top{margin-top:0}
.rc19-cp-abas{margin:10px 0 0;background:var(--bg)}
.rc19-cp-abas .tab{font-size:15px;font-weight:700}
.rc19-cp-info{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px;align-items:start}
.rc19-cp-faqp{margin-top:14px}
.rc19-mes{display:flex;align-items:center;justify-content:center;gap:14px;margin:4px auto 12px}
.rc19-mes b{min-width:190px;text-align:center;font-size:17px;letter-spacing:.04em;color:var(--fg-strong)}
.rc19-mes .ibtn{border:1px solid var(--border);border-radius:10px;width:38px;height:38px;display:grid;place-items:center;background:var(--surface)}
.rc19-mes .ibtn:hover{border-color:var(--accent);color:var(--accent)}
.rc19-pre-del{margin-left:6px;color:var(--err)}
.rc19-pre-exc{margin-top:8px;font-size:13px}
.rc19-pac{margin-top:4px}
.rc19-vj-g .rc19-ro{background:var(--surface2);color:var(--fg-strong);font-weight:600;cursor:default}
.rc19-pf-f,.rc19-emp-f{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end}
.rc19-pf-f .field,.rc19-emp-f .field{margin:0;flex:1 1 170px}
.rc19-ac{gap:4px;flex-wrap:nowrap;justify-content:flex-end}
.rc19-lab{display:block;font-size:13px;font-weight:600;margin-bottom:6px}
.rc19-chk{display:flex;flex-wrap:wrap;gap:6px 16px}.rc19-chk label{display:inline-flex;gap:6px;align-items:center;font-weight:500}
.rc19-flag{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:10px 12px;border:1px dashed var(--accent);border-radius:12px;background:var(--accent-soft)}
.rc19-rec{margin-top:14px;border:1px solid var(--border);border-top:4px solid var(--accent);border-radius:14px;padding:14px 16px}
.rc19-rec-top{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}.rc19-rec-top h3{margin:0}
.rc19-rec-h{margin:12px 0 6px;font-size:14px;color:var(--accent)}
.rc19-auto .in{border-color:color-mix(in srgb,var(--ok) 55%,var(--border))}.rc19-auto small{color:var(--ok)}
.rc19-link{overflow-wrap:anywhere}
.rc19-log{margin:0;padding-left:18px;font-size:13px;color:var(--fg)}
@media(max-width:760px){.rc19-cp-info{grid-template-columns:1fr}.rc19-cp-fixo{position:static}.rc19-pf-g>*,.rc19-rec .pf-g>*,.rc19-vj-g>*{grid-column:span 6}}
</style>`);
