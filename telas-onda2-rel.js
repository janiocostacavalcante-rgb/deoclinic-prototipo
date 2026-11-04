/* ---------- DeoClinic onda 2 · alçadas de aprovação e relatórios da plataforma (04/11) ----------
   As alçadas ficam no Financeiro (telas-laudos-financeiro.js). Aqui: o catálogo de relatórios da plataforma (inventário Clinicas §11.2),
   ~20 relatórios que substituem os ~190 do legado, agrupados por área, com filtros, resumo, gráfico, tabela, exportação,
   envio agendado por e-mail e favoritos. Os relatórios do laboratório e a auditoria da tela anterior continuam nas abas
   Laboratório e Auditoria (reaproveita o VIEWS.relatorios anterior). Prefixo RLP_ / rlp. Números saem dos dados do protótipo
   (AG_CLIN, ORCS, CAIXAS, CONTAS, DRE_VAL, FLUXO_SEM, F2_*, STK_*); o que não existe lá é exemplo marcado. */

document.head.insertAdjacentHTML('beforeend',`<style>
.rlp-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr))}
.rlp-card{border:1px solid var(--border);border-radius:12px;padding:12px 14px;background:var(--surface);display:flex;flex-direction:column;gap:6px;cursor:pointer;min-width:0}
.rlp-card:hover{border-color:var(--accent)}
.rlp-card .t{display:flex;gap:8px;align-items:flex-start;justify-content:space-between}
.rlp-card b{color:var(--fg-strong);font-size:14.5px}
.rlp-card small{color:var(--fg2);font-size:12.5px;line-height:1.4}
.rlp-star{border:0;background:transparent;cursor:pointer;font-size:18px;line-height:1;color:var(--fg2);padding:0 2px}
.rlp-star.on{color:var(--warn)}
.rlp-area{margin:14px 0 8px;font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--fg2)}
.rlp-f select.in{width:auto;max-width:100%}
.rlp-sub{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}
.rlp-tools{display:flex;flex-wrap:wrap;gap:6px}
</style>`);

const RLP_OLD=VIEWS.relatorios;
let RLP_ABA='catalogo',RLP_REL=null,RLP_Q='',RLP_AREA='',RLP_SUB={};
const RLP_F={per:'mes',u:'',prof:'',conv:'',quem:''};
let RLP_FAV=new Set(['aging-pagar','caixas','ocupacao']);
try{const v=JSON.parse(localStorage.getItem('deoclinic-rel-fav')||'null');if(Array.isArray(v))RLP_FAV=new Set(v)}catch(e){}
const RLP_AGEND=[
 {id:'fluxo',f:'mês · todas as unidades',freq:'Toda segunda 07:00',para:'diretoria@clinica.exemplo',fmt:'PDF',por:'Sérgio',ult:'03/11'},
 {id:'aging-pagar',f:'mês · todas as unidades',freq:'Todo dia 07:30',para:'financeiro@clinica.exemplo',fmt:'CSV',por:'Lúcia',ult:'04/11'},
 {id:'estoque',f:'abaixo do mínimo · Unidade 10',freq:'Toda sexta 16:00',para:'compras@clinica.exemplo',fmt:'PDF',por:'Edna',ult:'31/10'}];

/* ---------- utilitários ---------- */
const RLP_PER={hoje:['Hoje (04/11)',1/22],semana:['Esta semana',5/22],mes:['Outubro/2026',1],mesant:['Setembro/2026',.96]};
const rlpK=()=>(RLP_PER[RLP_F.per]||RLP_PER.mes)[1];
const rlpN=v=>Math.round(v*rlpK());
const rlpPct=v=>isFinite(v)?(Math.round(v*1000)/10).toLocaleString('pt-BR')+'%':'—';
const rlpInt=v=>Math.round(v).toLocaleString('pt-BR');
const rlpMin=v=>{v=Math.round(v);return v>=60?Math.floor(v/60)+' h '+String(v%60).padStart(2,'0'):v+' min'};
const rlpMoeda=s=>parseFloat(String(s).replace(/[^\d,]/g,'').replace(',','.'))||0;
const rlpBarras=(l,fm)=>{const mx=Math.max(...l.map(x=>x[1]),1);return `<div class="barras">${l.map(([n,v])=>barra(esc(String(n)),v,mx,fm?fm(v):rlpInt(v))).join('')}</div>`};
const rlpProfNome=id=>(typeof PROF==='function'&&PROF(id)?PROF(id).n:id);
const rlpHoje=new Date(2026,10,4);
function rlpDias(venc){if(venc==='hoje')return 0;const m=/^(\d\d)\/(\d\d)$/.exec(venc||'');if(!m)return null;let [d,mm]=[+m[1],+m[2]];const y=mm<10?2027:2026;return Math.round((new Date(y,mm-1,d)-rlpHoje)/864e5)}
const rlpUOk=u=>!RLP_F.u||String(u)===String(RLP_F.u);
const rlpCCU=cc=>cc==='Posto 12'?12:cc==='Posto 14'?14:10;
function rlpCpfOk(c){const d=String(c||'').replace(/\D/g,'');if(d.length!==11||/^(\d)\1+$/.test(d))return false;let s=0;for(let i=0;i<9;i++)s+=+d[i]*(10-i);let r=(s*10)%11%10;if(r!==+d[9])return false;s=0;for(let i=0;i<10;i++)s+=+d[i]*(11-i);r=(s*10)%11%10;return r===+d[10]}

/* ---------- dados de exemplo que não existem em outras telas ---------- */
const RLP_CAP={p1:16,p2:20,p3:12,p4:14};
const RLP_OCM={p1:[352,318,19,12],p2:[440,402,21,9],p3:[264,221,24,15],p4:[308,262,16,11]};
const RLP_SEM=[['seg',8.1],['ter',5.9],['qua',6.4],['qui',7.2],['sex',9.8],['sáb',12.6]];
const RLP_REPR=[['US obstétrica','40901530',14,'próxima vaga 11/11 · Dra. Renata só 2 manhãs'],['US transvaginal','40901467',9,'próxima vaga 07/11'],['Eletrocardiograma','40101010',6,'Dr. Igor em congresso 05 e 06/11'],['Exérese de lesão de pele','30101921',3,'sala de procedimentos ocupada às terças']];
const RLP_TEMPOS=[['Consulta',9,7,18,0,45],['Ultrassom e imagem',11,0,24,95,150],['Procedimento',8,6,22,0,50],['Coleta de laboratório',6,0,5,1140,1260]];
const RLP_CART=[
 {n:'Ana Souza',cred:120,acordo:'',atr:0,dias:0,ult:'crédito de cancelamento · 28/10'},
 {n:'José Carlos Lima',cred:0,acordo:'3 × R$ 140,00 · 1 paga',atr:140,dias:12,ult:'lembrete WhatsApp · 01/11'},
 {n:'Francisco das Chagas',cred:0,acordo:'',atr:180,dias:34,ult:'ligação · 29/10 · promessa 08/11'},
 {n:'Rita de Cássia Lins',cred:45,acordo:'',atr:0,dias:0,ult:'troco em crédito · 21/10'},
 {n:'Luana Ferreira Castro',cred:0,acordo:'2 × R$ 225,00 · 0 pagas',atr:450,dias:96,ult:'carta de cobrança · 15/10'},
 {n:'Sebastião Gomes',cred:0,acordo:'',atr:70,dias:61,ult:'e-mail · 10/10'},
 {n:'Pedro Henrique Alves',cred:35,acordo:'',atr:0,dias:0,ult:'estorno em crédito (duplicidade) · hoje 09:12'}];
const RLP_PLANOS=[
 {n:'Plano DeoVita Família',tipo:'Plano',ass:98,mens:39.9,usos:141,top:'Consulta clínica (62) · US (31) · exames (48)',canc:3},
 {n:'Plano DeoVita Individual',tipo:'Plano',ass:33,mens:29.9,usos:37,top:'Consulta clínica (21) · exames (16)',canc:1},
 {n:'Pacote pré-natal (6 US obstétricas)',tipo:'Pacote',vend:12,ses:72,usad:41,venc:2,valor:960},
 {n:'Check-up executivo',tipo:'Pacote',vend:9,ses:9,usad:6,venc:1,valor:690},
 {n:'Pacote curativos (10 sessões)',tipo:'Pacote',vend:5,ses:50,usad:38,venc:0,valor:480}];
const RLP_ACESSOS=[
 {h:'04/11 07:02',quem:'Paula',mod:'Acesso',acao:'Login com 2º fator · Unidade 10 · Chrome'},
 {h:'04/11 07:05',quem:'Rafael',mod:'Acesso',acao:'Login com 2º fator · Unidade 10'},
 {h:'04/11 06:58',quem:'Carla',mod:'Acesso',acao:'Login · Posto 14'},
 {h:'04/11 06:41',quem:'desconhecido',mod:'Acesso',acao:'3 tentativas com senha errada para "lucia" · bloqueio de 15 min',alerta:true},
 {h:'03/11 15:10',quem:'Sérgio',mod:'Relatórios',acao:'Exportou CSV: Contas a pagar (aging) · mês · todas'},
 {h:'03/11 11:20',quem:'Jânio',mod:'Configurações',acao:'Alterou "Validade do orçamento": 15 → 30 dias'},
 {h:'02/11 19:40',quem:'Dra. Camila Rocha',mod:'Prontuário',acao:'Abriu prontuário fora do horário · justificativa: retorno por telefone',alerta:true}];
const RLP_PACX=[
 {n:'Larissa Monteiro',cpf:'321.456.987-10',dn:'1995-11-08',tel:'(85) 98111-7788',email:'larissa.m@email.com',ult:'04/11/2026',cons:'WhatsApp e e-mail'},
 {n:'Francisco das Chagas',cpf:'458.221.903-71',dn:'1958-11-02',tel:'(85) 99232-4545',email:'',ult:'04/11/2026',cons:'WhatsApp'},
 {n:'Raimundo Nonato Silva',cpf:'036.117.228-99',dn:'1947-03-19',tel:'(85) 98877-0001',email:'',ult:'04/11/2026',cons:'telefone'},
 {n:'Rita de Cássia Lins',cpf:'714.502.388-04',dn:'1983-11-15',mae:'',tel:'',email:'ritalins@email.com',ult:'04/11/2026',cons:'e-mail'},
 {n:'Luana Ferreira Castro',cpf:'000.000.000-00',dn:'1999-05-27',tel:'(85) 98400-1122',email:'',ult:'04/11/2026',cons:'WhatsApp'},
 {n:'Cícero Romão',cpf:'225.884.130-52',dn:'1940-11-30',mae:'',tel:'(85) 3221-4400',email:'',ult:'12/09/2025',cons:'telefone'},
 {n:'Maria Helena de Souza',cpf:'111.444.777-36',dn:'1961-03-12',tel:'(85) 98123-4455',email:'',ult:'02/02/2025',cons:'WhatsApp'},
 {n:'Antônio Batista',cpf:'444.555.666-11',dn:'1949-01-05',tel:'(85) 99999-1212',email:'',ult:'18/06/2025',cons:'nenhum'}];
const RLP_RET=[['Maria Helena Souza','Dra. Camila Rocha','consulta 04/11','retorno em 30 dias','04/12'],['José Carlos Lima','Dr. Igor Menezes','consulta 04/11','retorno com ECG','18/11'],['Ana Souza','Dr. Paulo Henrique Viana','US 04/11','controle em 6 meses','04/05/2027'],['Luiza Ferreira','Dra. Renata Albuquerque','consulta 14/10','retorno com exames','11/11'],['Francisca Oliveira','Dra. Camila Rocha','consulta 20/10','retorno com HbA1c','20/11']];
const RLP_CARTAO=[
 ['01/10 a 31/10','Crédito à vista','Stone',18240,2.9,'D+30','05/11 a 04/12','a receber'],
 ['01/10 a 31/10','Crédito parcelado 2–3×','Stone',6310,3.6,'D+30 por parcela','05/11 a 03/01','a receber'],
 ['03/11','Débito','Stone',2120,1.2,'D+1','04/11','recebido'],
 ['04/11 (hoje)','Débito','Stone',0,1.2,'D+1','05/11','a receber'],
 ['04/11 (hoje)','Crédito à vista','Stone',0,2.9,'D+30','04/12','a receber'],
 ['set/2026','Crédito à vista','Stone',17110,2.9,'D+30','até 31/10','recebido']];

/* ---------- motor de filtros ---------- */
function rlpFiltros(r){const f=r.f||[];const sel=(k,lab,ops)=>`<select class="in" aria-label="${lab}" onchange="RLP_F.${k}=this.value;reView()">${ops.map(([v,t])=>`<option value="${v}" ${String(RLP_F[k])===String(v)?'selected':''}>${t}</option>`).join('')}</select>`;
 return `<div class="filters rlp-f" style="margin-bottom:12px">${f.includes('per')?sel('per','Período',Object.entries(RLP_PER).filter(([k])=>!r.pers||r.pers.includes(k)).map(([k,v])=>[k,v[0]])):''}${f.includes('u')?sel('u','Unidade',[['','Todas as unidades'],...Object.entries(UNIDS).map(([k,v])=>[k,v])]):''}${f.includes('prof')?sel('prof','Profissional',[['','Todos os profissionais'],...PROFISSIONAIS.filter(p=>RLP_CAP[p.id]).map(p=>[p.id,p.n])]):''}${f.includes('conv')?sel('conv','Convênio',[['','Todos os convênios'],['Particular','Particular'],...CONVENIOS.map(c=>[c,c])]):''}${f.includes('quem')?sel('quem','Usuário',[['','Todos os usuários'],...[...new Set(rlpAudBase().map(a=>a.quem))].map(q=>[q,q])]):''}${r.subs?r.subs.map(([k,t])=>chip(t,rlpSub(r)===k,`RLP_SUB['${r.id}']='${k}';reView()`)).join(''):''}<button class="btn sm ghost" onclick="Object.assign(RLP_F,{per:'mes',u:'',prof:'',conv:'',quem:''});reView()">Limpar filtros</button></div>`}
const rlpSub=r=>RLP_SUB[r.id]||(r.subs?r.subs[0][0]:'');

/* ---------- os relatórios ---------- */
function rlpAudBase(){const a=(typeof F2_AUD!=='undefined'?F2_AUD:[]).map(x=>({h:x.h,quem:x.quem,mod:x.tela,acao:x.acao}));const e=(typeof STK_AUD!=='undefined'?STK_AUD:[]).map(x=>({h:x.h,quem:x.quem,mod:'Estoque',acao:x.acao}));return [...a,...e,...RLP_ACESSOS]}
function rlpAgingRun(t){const l=CONTAS.filter(c=>c.t===t&&c.s!=='Paga').map(c=>{const d=rlpDias(c.venc);const cc=typeof alCC==='function'?alCC(c):'Matriz';return {c,d,cc,fx:d==null?'sem data':d<0?'Vencido':d<=7?'até 7 dias':d<=30?'8 a 30 dias':d<=60?'31 a 60 dias':'mais de 60 dias'}}).filter(x=>rlpUOk(rlpCCU(x.cc)));
 const FX=['Vencido','até 7 dias','8 a 30 dias','31 a 60 dias','mais de 60 dias'];const soma=k=>l.filter(x=>x.fx===k).reduce((s,x)=>s+x.c.v,0);const tot=l.reduce((s,x)=>s+x.c.v,0);
 const pend=t==='pagar'&&typeof alInfo==='function'?l.filter(x=>alInfo(x.c).pend):[];
 return {k:[miniKpi('Em aberto',fmt(tot),l.length+' contas'),miniKpi('Vencido',fmt(soma('Vencido')),'',soma('Vencido')?'err':'ok'),miniKpi('Até 7 dias',fmt(soma('até 7 dias')),'','warn'),t==='pagar'?miniKpi('Aguardando alçada',pend.length,fmt(pend.reduce((s,x)=>s+x.c.v,0))+' sem todas as assinaturas',pend.length?'warn':'ok',"location.hash='#financeiro';FN_ABA='aprov'"):miniKpi('Maior devedor',l.length?esc([...l].sort((a,b)=>b.c.v-a.c.v)[0].c.q):'—','')],
  g:rlpBarras(FX.map(k=>[k,soma(k)]),fmt),gt:'Por faixa de vencimento',
  h:[t==='pagar'?'Favorecido':'Devedor','Centro de custo','Vencimento','Dias','Faixa','Valor',t==='pagar'?'Aprovação':'Situação'],
  r:l.sort((a,b)=>(a.d??999)-(b.d??999)).map(x=>[`<b>${esc(x.c.q)}</b><small class="tl" style="display:block">${esc(x.c.ref)}</small>`,x.cc,x.c.venc,x.d==null?'—':x.d<0?`<span class="prazo-err">${x.d}</span>`:x.d,x.fx==='Vencido'?'<span class="badge err">vencido</span>':x.fx,fmt(x.c.v),t==='pagar'&&typeof alProxTxt==='function'?alProxTxt(x.c):`<span class="badge ${x.c.s==='Vencido'?'err':'neutral'}">${x.c.s}</span>`]),
  nota:'Contas pagas saem do aging. Dias contados a partir de 04/11/2026; negativo = atrasado.'+(t==='pagar'?' A coluna Aprovação mostra a alçada (quem já assinou e quem falta).':'')}}
function rlpFluxoRows(){let saldo=38400;return FLUXO_SEM.map((s,i)=>{const [p,ep,er,sp,sr,ok]=s;const e=ok?er:(i===3?er+ep*0.55:ep),sa=ok?sr:(i===3?sr+sp*0.55:sp);saldo+=e-sa;return {p,ep,er,sp,sr,ok,i,e,sa,saldo:Math.round(saldo)}})}
const RLP=[
 {id:'ocupacao',area:'Agenda',n:'Ocupação e no-show',d:'Vagas, agendados, faltas e cancelamentos por profissional e por dia da semana.',subst:'Recepção Agenda, Ordem Atendimento, Mapa de Calor, Uso de Salas, Cancelamento Agendamento',f:['per','u','prof'],
  run(){const hoje=RLP_F.per==='hoje';const ps=Object.keys(RLP_CAP).filter(p=>!RLP_F.prof||RLP_F.prof===p);
   const rows=ps.map(p=>{let cap,ag,fal,can;if(hoje){const l=AG_CLIN.filter(a=>a.prof===p);cap=RLP_CAP[p];ag=l.length;fal=l.filter(a=>a.sit==='faltou').length;can=0}else{const m=RLP_OCM[p];cap=rlpN(m[0]);ag=rlpN(m[1]);fal=rlpN(m[2]);can=rlpN(m[3])}return {p,cap,ag,fal,can,oc:cap?ag/cap:0,ns:ag?fal/ag:0}});
   const T=k=>rows.reduce((s,r)=>s+r[k],0);const oc=T('cap')?T('ag')/T('cap'):0,ns=T('ag')?T('fal')/T('ag'):0;
   return {k:[miniKpi('Ocupação',rlpPct(oc),T('ag')+' de '+T('cap')+' vagas',oc<.75?'warn':'ok'),miniKpi('No-show',rlpPct(ns),T('fal')+' faltas',ns>.08?'err':'ok'),miniKpi('Cancelamentos',T('can'),hoje?'nenhum hoje':'com antecedência'),miniKpi('Vagas livres',T('cap')-T('ag'),'oferecer à lista de espera','')],
    g:rlpBarras(rows.map(r=>[rlpProfNome(r.p),Math.round(r.oc*100)]),v=>v+'%')+`<h4 style="margin-top:12px">No-show por dia da semana ${info('Mapa de calor do legado em forma de barras: sábado e sexta concentram as faltas. Exemplo.')}</h4>`+rlpBarras(RLP_SEM.map(([d,v])=>[d,v]),v=>String(v).replace('.',',')+'%'),gt:'Ocupação por profissional',
    h:['Profissional','Vagas','Agendados','Faltas','Cancelados','Ocupação','No-show'],r:rows.map(r=>[`<b>${esc(rlpProfNome(r.p))}</b><small class="tl" style="display:block">${esc((PROF(r.p)||{}).esp||'')}</small>`,r.cap,r.ag,r.fal,r.can,`<span class="mg ${r.oc<.75?'baixa':'ok'}">${rlpPct(r.oc)}</span>`,r.ns>.08?`<span class="prazo-err">${rlpPct(r.ns)}</span>`:rlpPct(r.ns)]),
    nota:hoje?'Hoje sai da agenda do dia (AG_CLIN); horários ainda não chegados contam como agendados.':'Período: totais de exemplo; a agenda do dia entra ao filtrar Hoje.'}}},
 {id:'demanda',area:'Agenda',n:'Demanda e conversão',d:'Orçamentos feitos, convertidos e perdidos (com motivo) e a demanda reprimida por falta de vaga.',subst:'Demanda Grupo, Orçamentos, Procedimento não atendido',f:['per','u'],nominal:true,
  run(){const val=o=>o.it.reduce((s,x)=>s+x.p,0);const conv=ORCS.filter(o=>o.sit==='convertido'),perd=ORCS.filter(o=>o.sit==='perdido'),ab=ORCS.filter(o=>o.sit==='aberto'||o.sit==='contato');
   return {k:[miniKpi('Orçamentos',ORCS.length,fmt(ORCS.reduce((s,o)=>s+val(o),0))),miniKpi('Conversão',rlpPct(conv.length/ORCS.length),conv.length+' convertidos','ok'),miniKpi('Em aberto',ab.length,fmt(ab.reduce((s,o)=>s+val(o),0))+' a recuperar','warn',"location.hash='#orcamentos'"),miniKpi('Demanda reprimida',RLP_REPR.reduce((s,x)=>s+x[2],0),'pedidos sem vaga em 7 dias','err')],
    g:rlpBarras(RLP_REPR.map(x=>[x[0],x[2]]),v=>v+' pedidos'),gt:'Demanda reprimida (sem vaga)',
    h:['Orçamento','Paciente','Itens','Valor','Situação','Atendente','Motivo / próximo contato'],r:ORCS.map(o=>[`<span class="mono">${o.id}</span>`,esc(o.n),o.it.length,fmt(val(o)),`<span class="badge ${(SITORC[o.sit]||['','neutral'])[1]}">${(SITORC[o.sit]||[o.sit])[0]}</span>`,o.quem,o.motivo?'perdido: '+esc(o.motivo):o.prox?o.prox.split('-').reverse().slice(0,2).join('/'):'—']),
    nota:'Demanda reprimida é exemplo: pedidos de agendamento recusados por falta de vaga. '+RLP_REPR.map(x=>x[0]+': '+x[3]).join('; ')+'.'}}},
 {id:'tempos',area:'Atendimento',n:'Tempos da jornada',d:'Senha → triagem → atendimento → laudo, por tipo de serviço, contra a meta.',subst:'os 7 relatórios de "Tempo médio…" e Consolidado por Sala',f:['per','u'],
  run(){const fx=RLP_F.per==='hoje'?1.12:RLP_F.per==='semana'?1.04:1;const l=RLP_TEMPOS.map(([t,a,b,c,d,m])=>({t,a:a*fx,b:b*fx,c,d:d*fx,m,tot:(a+b)*fx+c+d*fx}));const fora=l.filter(x=>x.tot>x.m);
   return {k:[miniKpi('Espera média na recepção',rlpMin(l.reduce((s,x)=>s+x.a,0)/l.length),'da senha à triagem ou chamada'),miniKpi('Consulta: chegada → médico',rlpMin(l[0].a+l[0].b),'meta 20 min',l[0].a+l[0].b>20?'warn':'ok'),miniKpi('Imagem: laudo',rlpMin(l[1].d),'depois do exame · meta 2 h',l[1].d>120?'warn':'ok'),miniKpi('Fora da meta',fora.length+' de '+l.length,'tipos de serviço',fora.length?'warn':'ok')],
    g:rlpBarras(l.map(x=>[x.t,Math.round(x.tot)]),rlpMin),gt:'Tempo total por tipo',
    h:['Serviço','Senha → triagem/chamada','Triagem → atendimento','Duração','Atendimento → laudo','Total','Meta'],r:l.map(x=>[`<b>${x.t}</b>`,rlpMin(x.a),x.b?rlpMin(x.b):'—',rlpMin(x.c),x.d?rlpMin(x.d):'—',x.tot>x.m?`<span class="prazo-err">${rlpMin(x.tot)}</span>`:`<b>${rlpMin(x.tot)}</b>`,rlpMin(x.m)]),
    nota:'Medianas. Cada etapa tem a hora gravada pela própria tela (senha, triagem, chamada, finalização, laudo assinado). Coleta: laudo do laboratório no mesmo dia. Exemplo.'}}},
 {id:'producao',area:'Atendimento',n:'Produção por serviço',d:'Quantidade e receita por procedimento, convênio, profissional ou tipo, com ticket médio.',subst:'Atendimento Grupo (4), Geral Convênio, Sintético Geral, Médico Solicitante (3), Técnico Convênio (2), Convênio Valor, Comparativo Mensal, Meta Mensal',f:['per','u','prof','conv'],subs:[['proc','Por procedimento'],['conv','Por convênio'],['prof','Por profissional'],['tipo','Por tipo']],
  run(){const SH={'Particular':.45,'Unimed Fortaleza':.25,'Hapvida':.15,'Bradesco Saúde':.1,'Camed':.05};const base=[];
   PROCEDIMENTOS.filter(p=>p.preco>0).forEach(p=>{const q=(typeof STK_AGF!=='undefined'&&STK_AGF[p.c])||0;const prof=((typeof F2_QUEM!=='undefined'&&F2_QUEM[p.c])||[]).find(x=>RLP_CAP[x])||'';Object.entries(SH).forEach(([cv,sh])=>{base.push({p,cv,prof,q:q*sh*rlpK(),v:q*sh*rlpK()*p.preco*((typeof CL_FATOR!=='undefined'&&CL_FATOR[cv])||1)})})});
   const l=base.filter(x=>(!RLP_F.conv||x.cv===RLP_F.conv)&&(!RLP_F.prof||x.prof===RLP_F.prof)&&(!RLP_F.u||RLP_F.u==='10'));const ag=rlpSub(this);const m={};
   l.forEach(x=>{const k=ag==='proc'?x.p.n:ag==='conv'?x.cv:ag==='prof'?(x.prof?rlpProfNome(x.prof):'Equipe (sem repasse)'):x.p.tipo;m[k]=m[k]||{q:0,v:0};m[k].q+=x.q;m[k].v+=x.v});
   const rows=Object.entries(m).map(([k,o])=>({k,q:Math.round(o.q),v:o.v})).sort((a,b)=>b.v-a.v);const tq=rows.reduce((s,r)=>s+r.q,0),tv=rows.reduce((s,r)=>s+r.v,0);
   return {k:[miniKpi('Atendimentos',rlpInt(tq),RLP_PER[RLP_F.per][0]),miniKpi('Receita',fmt(Math.round(tv)),'pelo valor de cada tabela'),miniKpi('Ticket médio',tq?fmt(Math.round(tv/tq*100)/100):'—',''),miniKpi('Maior grupo',rows[0]?esc(rows[0].k):'—',rows[0]?rlpPct(rows[0].v/tv)+' da receita':'')],
    g:rlpBarras(rows.slice(0,8).map(r=>[r.k,Math.round(r.v)]),v=>fmt(v)),gt:'Receita por grupo',
    h:[{proc:'Procedimento',conv:'Convênio',prof:'Profissional',tipo:'Tipo'}[ag],'Quantidade','Receita','Ticket médio','% da receita'],r:rows.map(r=>[`<b>${esc(r.k)}</b>`,rlpInt(r.q),fmt(Math.round(r.v)),r.q?fmt(Math.round(r.v/r.q*100)/100):'—',rlpPct(tv?r.v/tv:0)]),
    nota:'Volumes do mês iguais aos do consumo de kits do Estoque; receita pelo preço particular × fator de cada convênio. Laboratório fica na aba Laboratório.'}}},
 {id:'conferencia',area:'Faturamento',n:'Conferência pré-faturamento',d:'Guias do lote aberto com pendência e risco de glosa antes de fechar.',subst:'Conferência',f:['conv'],nominal:true,
  run(){const a=TS_GUIAS.map(g=>({g:g.g,n:g.n,conv:'Unimed Fortaleza',it:g.e+' exame(s)',v:rlpMoeda(g.v),pend:g.r,risco:g.r?55:8}));const b=(typeof F2_IA!=='undefined'?F2_IA:[]).map(x=>({g:x.g,n:x.pac,conv:x.conv==='Unimed'?'Unimed Fortaleza':x.conv,it:(PROC(x.proc)||{n:x.proc}).n,v:x.v,pend:x.risco>=40?x.acao:'',risco:x.risco}));
   const l=[...a,...b].filter(x=>!RLP_F.conv||x.conv===RLP_F.conv);const pend=l.filter(x=>x.pend);const alto=l.filter(x=>x.risco>=60);
   return {k:[miniKpi('Guias no lote aberto',l.length,fmt(l.reduce((s,x)=>s+x.v,0))),miniKpi('Com pendência',pend.length,fmt(pend.reduce((s,x)=>s+x.v,0))+' em risco',pend.length?'warn':'ok'),miniKpi('Risco alto (IA)',alto.length,'60% ou mais',alto.length?'err':'ok',"location.hash='#glosas'"),miniKpi('Prontas',l.length-pend.length,'podem entrar no lote','ok')],
    g:rlpBarras(l.map(x=>[x.g,x.risco]),v=>v+'%'),gt:'Risco de glosa por guia',
    h:['Guia','Beneficiário','Convênio','Itens','Valor','Pendência','Risco'],r:l.sort((a,b)=>b.risco-a.risco).map(x=>[`<span class="mono">${x.g}</span>`,esc(x.n),x.conv,esc(x.it),fmt(x.v),x.pend?`<span class="badge warn">${esc(x.pend)}</span>`:'<span class="badge ok">ok</span>',`<span class="badge ${x.risco>=60?'err':x.risco>=40?'warn':'ok'}">${x.risco}%</span>`]),
    nota:'Junta a conferência das guias do laboratório (Convênios e TISS) com a revisão da IA anti-glosa das guias da clínica (Glosas e recursos).'}}},
 {id:'lotes',area:'Faturamento',n:'Lotes TISS e glosas',d:'Enviado × glosado × recebido por lote e convênio, com recursos e reversões.',subst:'Lançamentos por Convênio, Faturamento Convênio CH, Solicit. SADT',f:['conv'],
  run(){const l=F2_LOTES.filter(x=>!RLP_F.conv||x.c===RLP_F.conv).map(x=>{const gs=F2_GL.filter(g=>g.l===x.l);const gl=x.pago!=null?x.env-x.pago:0;return {x,gs,gl,rec:gs.filter(g=>g.rec).reduce((s,g)=>s+g.v,0),rev:gs.filter(g=>g.st==='Revertida').reduce((s,g)=>s+g.v,0)}});
   const env=l.reduce((s,r)=>s+r.x.env,0),pago=l.reduce((s,r)=>s+(r.x.pago||0),0),gl=l.reduce((s,r)=>s+r.gl,0),envPago=l.filter(r=>r.x.pago!=null).reduce((s,r)=>s+r.x.env,0);const pc={};l.forEach(r=>{if(r.x.pago!=null){pc[r.x.c]=pc[r.x.c]||[0,0];pc[r.x.c][0]+=r.gl;pc[r.x.c][1]+=r.x.env}});
   return {k:[miniKpi('Enviado',fmt(env),l.length+' lotes'),miniKpi('Recebido',fmt(Math.round(pago*100)/100),'lotes com demonstrativo','ok'),miniKpi('Glosado',fmt(Math.round(gl*100)/100),rlpPct(envPago?gl/envPago:0)+' do que já voltou',gl/envPago>.02?'warn':'ok',"location.hash='#glosas'"),miniKpi('Em recurso',fmt(l.reduce((s,r)=>s+r.rec,0)),'revertido '+fmt(l.reduce((s,r)=>s+r.rev,0)))],
    g:rlpBarras(Object.entries(pc).map(([c,[g,e]])=>[c,Math.round(g/e*1000)/10]),v=>String(v).replace('.',',')+'%'),gt:'% de glosa por convênio',
    h:['Lote','Convênio','Competência','Guias','Enviado','Recebido','Glosado','% glosa','Situação'],r:l.map(r=>[`<span class="mono">${r.x.l}</span>`,r.x.c,r.x.comp,r.x.guias,fmt(r.x.env),r.x.pago!=null?fmt(r.x.pago):'—',r.x.pago!=null?fmt(Math.round(r.gl*100)/100):'—',r.x.pago!=null?rlpPct(r.gl/r.x.env):'—',`<span class="badge neutral">${r.x.st}</span>`]),
    nota:'Mesmos lotes e glosas da tela Glosas e recursos; o recebido vem do demonstrativo de retorno casado guia a guia.'}}},
 {id:'caixas',area:'Financeiro',n:'Sessões de caixa',d:'Aberturas, recebido por operador, sangrias, estornos, fechamentos e diferenças.',subst:'Caixa (todas as ~10 variantes), Balanço do Dia, Arquivos Relatório Caixa',f:['u'],
  run(){const l=CAIXAS.filter(c=>rlpUOk(c.unid));const tot=c=>Object.values(c.forma||{}).reduce((s,v)=>s+v,0);const sg=c=>(c.sang||[]).reduce((s,x)=>s+x.v,0);const es=c=>(c.estornos||[]).reduce((s,x)=>s+x.v,0);
   return {k:[miniKpi('Caixas abertos',l.filter(c=>!c.fechado).length,'de '+l.length+' hoje'),miniKpi('Recebido hoje',fmt(l.reduce((s,c)=>s+tot(c),0)),l.reduce((s,c)=>s+(c.at||0),0)+' atendimentos','ok'),miniKpi('Sangrias',fmt(l.reduce((s,c)=>s+sg(c),0)),'',''),miniKpi('Estornos',fmt(l.reduce((s,c)=>s+es(c),0)),'com motivo e quem autorizou',l.some(es)?'warn':'')],
    g:rlpBarras(l.map(c=>[c.u,tot(c)]),fmt),gt:'Recebido por operador',
    h:['Operador','Unidade','Abertura','Atendimentos','Recebido','Sangrias','Estornos','Situação'],r:l.map(c=>[`<b>${c.u}</b>`,UNIDS[c.unid]||c.unid,c.ab+(c.abQ?' · '+c.abQ:''),c.at||0,fmt(tot(c)),sg(c)?fmt(sg(c)):'—',es(c)?`<span class="prazo-err">${fmt(es(c))}</span>`:'—',c.fechado?'<span class="badge ok">fechado</span>':'<span class="badge info">aberto</span>']),
    extra:`<h4 style="margin-top:14px">Fechamentos anteriores ${info('Registrado × encontrado, com a justificativa. Mesmos dados da conciliação do Financeiro.')}</h4>${tabela(['Data','Caixa','Registrado','Encontrado','Diferença','Banco','Situação'],FN_CONCIL.map(([d,c,r,e,df,b,s])=>`<tr>${td('Data',d)}${td('Caixa',c)}${td('Registrado',r)}${td('Encontrado',e)}${td('Diferença',df.startsWith('−')?`<span class="prazo-err">${df}</span>`:df)}${td('Banco',b==='ok'?'<span class="badge ok">ok</span>':'<span class="badge neutral">pendente</span>')}${td('Situação',s)}</tr>`))}`,
    nota:'Um só relatório de caixa no lugar das variantes do legado: o período e a unidade filtram; fechamento item a item na tela Caixa.'}}},
 {id:'formas',area:'Financeiro',n:'Recebimentos por forma de pagamento',d:'Dinheiro, Pix, débito e crédito: bruto, taxa, líquido e quando cai na conta.',subst:'Caixa Cartão (4 variantes), Consolidado Cartão, Valor Médio',f:['per','u'],
  run(){const T={'Dinheiro':[0,'no fechamento'],'Pix':[0,'D+0'],'Cartão de débito':[1.2,'D+1'],'Cartão de crédito':[2.9,'D+30']};const m={};CAIXAS.filter(c=>rlpUOk(c.unid)).forEach(c=>Object.entries(c.forma||{}).forEach(([f,v])=>m[f]=(m[f]||0)+v));const dias=RLP_F.per==='hoje'?1:22*rlpK();
   const rows=Object.entries(m).map(([f,v])=>{const b=Math.round(v*dias*100)/100;const t=(T[f]||[0,''])[0];return {f,b,t,tx:Math.round(b*t)/100,liq:Math.round(b*(100-t))/100,q:(T[f]||[0,'—'])[1]}});const tb=rows.reduce((s,r)=>s+r.b,0),tt=rows.reduce((s,r)=>s+r.tx,0);const at=CAIXAS.filter(c=>rlpUOk(c.unid)).reduce((s,c)=>s+(c.at||0),0)*dias;
   return {k:[miniKpi('Bruto',fmt(tb),RLP_PER[RLP_F.per][0]),miniKpi('Taxas',fmt(Math.round(tt*100)/100),rlpPct(tb?tt/tb:0)+' do bruto','warn'),miniKpi('Líquido',fmt(Math.round((tb-tt)*100)/100),'','ok'),miniKpi('Valor médio',at?fmt(Math.round(tb/at*100)/100):'—','por atendimento')],
    g:rlpBarras(rows.map(r=>[r.f,r.b]),fmt),gt:'Bruto por forma',
    h:['Forma','Bruto','% do total','Taxa','Valor da taxa','Líquido','Cai na conta'],r:rows.map(r=>[`<b>${r.f}</b>`,fmt(r.b),rlpPct(tb?r.b/tb:0),r.t?String(r.t).replace('.',',')+'%':'—',r.tx?fmt(r.tx):'—',fmt(r.liq),r.q]),
    nota:'Hoje sai dos caixas abertos; semana e mês multiplicam o dia típico (exemplo). Taxas do contrato com a adquirente (Stone, exemplo).'}}},
 {id:'cartao',area:'Financeiro',n:'Cartão a receber',d:'Agenda de recebíveis da adquirente por data de crédito, com taxa e conciliação.',subst:'Caixa Cartão Receber, Consolidado Cartão',f:['u'],
  run(){const deb=CAIXAS.filter(c=>rlpUOk(c.unid)).reduce((s,c)=>s+((c.forma||{})['Cartão de débito']||0),0),cre=CAIXAS.filter(c=>rlpUOk(c.unid)).reduce((s,c)=>s+((c.forma||{})['Cartão de crédito']||0),0);const fu=RLP_F.u?({10:.74,12:.1,14:.16})[RLP_F.u]:1;
   const l=RLP_CARTAO.map(r=>{const x=[...r];if(r[0].startsWith('04/11'))x[3]=r[1]==='Débito'?deb:cre;else x[3]=Math.round(r[3]*fu);return x});const ar=l.filter(r=>r[7]==='a receber');const liq=r=>Math.round(r[3]*(100-r[4]))/100;
   return {k:[miniKpi('A receber',fmt(ar.reduce((s,r)=>s+liq(r),0)),'líquido de taxa','warn'),miniKpi('Nos próximos 7 dias',fmt(Math.round(ar.filter(r=>r[5]==='D+1'||r[6].startsWith('05/11')).reduce((s,r)=>s+liq(r)/(r[5]==='D+1'?1:4.3),0)*100)/100),'débito de hoje e parcelas',''),miniKpi('Taxa média',rlpPct(ar.reduce((s,r)=>s+r[3]*r[4]/100,0)/Math.max(1,ar.reduce((s,r)=>s+r[3],0))),'',''),miniKpi('Divergências',0,'vendas × extrato da adquirente','ok')],
    g:rlpBarras(ar.map(r=>[r[1]+' · '+r[0],liq(r)]),fmt),gt:'A receber por lote de vendas',
    h:['Vendas','Modalidade','Adquirente','Bruto','Taxa','Líquido','Prazo','Previsão','Situação'],r:l.map(r=>[r[0],r[1],r[2],fmt(r[3]),String(r[4]).replace('.',',')+'%',fmt(liq(r)),r[5],r[6],`<span class="badge ${r[7]==='recebido'?'ok':'info'}">${r[7]}</span>`]),
    nota:'Vendas de hoje vêm dos caixas abertos; os lotes de outubro e setembro são exemplo. Recebido = casado com o extrato na Conciliação bancária.'}}},
 {id:'aging-pagar',area:'Financeiro',n:'Contas a pagar (aging)',d:'Em aberto por faixa de vencimento, com a situação da alçada de aprovação.',subst:'Contas a Pagar, Acompanhamento de Contas, Dupla Assinatura',f:['u'],run(){return rlpAgingRun('pagar')}},
 {id:'aging-receber',area:'Financeiro',n:'Contas a receber (aging)',d:'Convênios, postos, empresas e particular por faixa de vencimento.',subst:'Contas a Receber, Acompanhamento de Contas',f:['u'],run(){return rlpAgingRun('receber')}},
 {id:'fluxo',area:'Financeiro',n:'Fluxo de caixa (realizado + previsto)',d:'Entradas e saídas previstas e realizadas por semana, com saldo acumulado.',subst:'Fluxo de Caixa (2), Movimentação, Resumo, Entrada/Saída por tipo/classe/conta/ano',f:['u'],
  run(){const l=rlpFluxoRows();const fu=RLP_F.u?({10:.74,12:.1,14:.16})[RLP_F.u]:1;const v=x=>Math.round(x*fu);const min=l.reduce((a,r)=>r.saldo<a.saldo?r:a,l[0]);
   return {k:[miniKpi('Entradas realizadas',fmt(v(l.reduce((s,r)=>s+r.er,0))),'conciliadas','ok'),miniKpi('Saídas realizadas',fmt(v(l.reduce((s,r)=>s+r.sr,0))),'conciliadas',''),miniKpi('Saldo projetado 30/11',fmt(v(l[l.length-1].saldo)),'saldo inicial R$ 38.400 em 06/10',''),miniKpi('Menor saldo',fmt(v(min.saldo)),min.p,min.saldo<20000?'err':'warn')],
    g:rlpBarras(l.map(r=>[r.p,Math.max(0,v(r.saldo))]),fmt),gt:'Saldo acumulado por semana',
    h:['Semana','Entradas previstas','Entradas realizadas','Saídas previstas','Saídas realizadas','Saldo acumulado',''],r:l.map(r=>[r.p,fmt(v(r.ep)),r.er?fmt(v(r.er)):'—',fmt(v(r.sp)),r.sr?fmt(v(r.sr)):'—',`<b>${fmt(v(r.saldo))}</b>`,r.ok?'<span class="badge ok">realizada</span>':r.i===3?'<span class="badge info">em curso</span>':'<span class="badge neutral">prevista</span>']),
    nota:'Mesmos números do Fluxo de caixa do Financeiro. Por unidade: rateio pela participação na receita (exemplo).'}}},
 {id:'dre',area:'Financeiro',n:'DRE gerencial',d:'Receita, deduções, custos, despesas e resultado do mês, com o orçado e o desvio.',subst:'Gastos (Manter Gastos), Saída por Ano, Resumo',f:['per'],pers:['mes','mesant'],
  run(){const f=RLP_F.per==='mesant'?.962:1;const val=c=>Math.round((DRE_VAL[c]||0)*f);const orc=c=>(typeof ORC_EST!=='undefined'&&ORC_EST[c]!=null)?ORC_EST[c]:null;const G=k=>PLANO.filter(p=>p[2]===k).reduce((s,p)=>s+val(p[0]),0);
   const rec=G('rec'),ded=G('ded'),cus=G('cus'),des=G('des'),liq=rec-ded,mb=liq-cus,res=mb-des;
   return {k:[miniKpi('Receita bruta',fmt(rec),RLP_PER[RLP_F.per][0]),miniKpi('Margem bruta',fmt(mb),rlpPct(mb/rec)+' da receita','ok'),miniKpi('Despesas',fmt(des),rlpPct(des/rec)),miniKpi('Resultado',fmt(res),rlpPct(res/rec)+' da receita',res>0?'ok':'err',"location.hash='#financeiro';FN_ABA='dre'")],
    g:rlpBarras([['Receita bruta',rec],['Deduções',ded],['Custos',cus],['Despesas',des],['Resultado',Math.max(0,res)]],fmt),gt:'Cascata do resultado',
    h:['Conta','Realizado','Orçado','Desvio','% da receita'],r:PLANO.filter(p=>p[2]!=='grupo').map(p=>{const v=val(p[0]),o=orc(p[0]);const dv=o?(v-o)/o:null;const ruim=dv!=null&&(p[2]==='rec'?dv<-.05:dv>.05);return [`${p[0]} · ${esc(p[1])}`,fmt(v),o!=null?fmt(o):'—',dv==null?'—':ruim?`<span class="prazo-err">${rlpPct(dv)}</span>`:rlpPct(dv),rlpPct(v/rec)]}),
    nota:'Mesma DRE do Financeiro (plano de contas em árvore, por competência). Orçado da aba Orçamento.'}}},
 {id:'carteira',area:'Financeiro',n:'Carteira do paciente',d:'Créditos em aberto, acordos de parcelamento e inadimplência por idade.',subst:'Crédito Paciente, Crédito Saldo, Crédito Estorno, Inadimplência Paciente, TCD/Reembolso',f:['u'],nominal:true,
  run(){const l=RLP_CART;const fx=d=>d===0?'em dia':d<=30?'até 30 dias':d<=90?'31 a 90 dias':'mais de 90 dias';
   return {k:[miniKpi('Créditos a usar',fmt(l.reduce((s,x)=>s+x.cred,0)),l.filter(x=>x.cred).length+' pacientes','ok'),miniKpi('Acordos ativos',l.filter(x=>x.acordo).length,'parcelas automáticas por Pix'),miniKpi('Inadimplência',fmt(l.reduce((s,x)=>s+x.atr,0)),l.filter(x=>x.atr).length+' pacientes','warn'),miniKpi('Mais de 90 dias',fmt(l.filter(x=>x.dias>90).reduce((s,x)=>s+x.atr,0)),'avaliar cobrança externa','err')],
    g:rlpBarras(['até 30 dias','31 a 90 dias','mais de 90 dias'].map(k=>[k,l.filter(x=>x.atr&&fx(x.dias)===k).reduce((s,x)=>s+x.atr,0)]),fmt),gt:'Inadimplência por idade',
    h:['Paciente','Crédito','Acordo','Em atraso','Dias','Faixa','Última ação'],r:l.map(x=>[`<b>${esc(x.n)}</b>`,x.cred?fmt(x.cred):'—',x.acordo||'—',x.atr?`<span class="prazo-err">${fmt(x.atr)}</span>`:'—',x.dias||'—',fx(x.dias),esc(x.ult)]),
    nota:'Exemplo. Crédito nasce de cancelamento, troco ou estorno; nunca se apaga, só se usa ou se devolve (com motivo). Cobrança só pelo canal que o paciente autorizou.'}}},
 {id:'repasse',area:'Repasse',n:'Extrato de repasse',d:'Produção, glosa descontada e repasse por profissional, técnico, promotor e terceiro.',subst:'Produção Médica/Técnico/Promotor/Terceirizado/Solicitante, Previsão Médica, Extratos, Ganhos APP, Outros Ganhos',f:['prof','conv'],
  run(){const cv=c=>c==='Unimed'?'Unimed Fortaleza':c==='Bradesco'?'Bradesco Saúde':c;const l=F2_PROD.filter(x=>(!RLP_F.prof||x.b===RLP_F.prof)&&(!RLP_F.conv||cv(x.conv)===RLP_F.conv));const m={};
   l.forEach(x=>{const c=rpLinhaCalc(x);m[x.b]=m[x.b]||{n:0,br:0,gl:0,rep:0,des:0};const o=m[x.b];o.n++;o.br+=x.v;o.gl+=x.gl||0;o.rep+=c.val;o.des+=c.desc});
   const rows=Object.entries(m).map(([b,o])=>({b:F2_B(b)||{n:b,papel:''},id:b,...o,fr:F2_FR.filter(f=>f.b===b)})).sort((a,b)=>b.rep-a.rep);const tr=rows.reduce((s,r)=>s+r.rep,0);
   return {k:[miniKpi('Produção',fmt(Math.round(rows.reduce((s,r)=>s+r.br,0)*100)/100),rows.reduce((s,r)=>s+r.n,0)+' itens'),miniKpi('Repasse calculado',fmt(Math.round(tr*100)/100),'pelas regras vigentes','ok'),miniKpi('Glosa descontada',fmt(Math.round(rows.reduce((s,r)=>s+r.des,0)*100)/100),'proporcional à regra','warn'),miniKpi('Fechamentos a aprovar',F2_FR.filter(f=>f.st==='Aguardando aprovação').length,'quem fecha não aprova','',"location.hash='#repasse'")],
    g:rlpBarras(rows.map(r=>[r.b.n,Math.round(r.rep*100)/100]),fmt),gt:'Repasse por beneficiário',
    h:['Beneficiário','Papel','Itens','Produção','Glosa','Repasse','Fechamentos'],r:rows.map(r=>[`<b>${esc(r.b.n)}</b>`,r.b.papel,r.n,fmt(Math.round(r.br*100)/100),r.gl?fmt(Math.round(r.gl*100)/100):'—',`<b>${fmt(Math.round(r.rep*100)/100)}</b>`,r.fr.length?r.fr.map(f=>f.id+' · '+f.st).join('<br>'):'<span class="tl">nenhum</span>']),
    nota:'Mesmo cálculo do Repasse médico (regra mais específica por profissional, procedimento e convênio; glosa desconta na proporção). O profissional vê o próprio extrato no portal.'}}},
 {id:'planos',area:'Fidelidade',n:'Uso de plano e pacote',d:'Assinantes, mensalidades, uso por serviço e saldo de sessões dos pacotes.',subst:'Uso Plano, Relatório Campanhas',f:['per','u'],
  run(){const pl=RLP_PLANOS.filter(p=>p.tipo==='Plano'),pc=RLP_PLANOS.filter(p=>p.tipo==='Pacote');const rec=pl.reduce((s,p)=>s+p.ass*p.mens,0);
   return {k:[miniKpi('Assinantes',pl.reduce((s,p)=>s+p.ass,0),pl.reduce((s,p)=>s+p.canc,0)+' cancelaram no mês'),miniKpi('Mensalidades',fmt(Math.round(rec*100)/100),'= conta 1.5 da DRE','ok'),miniKpi('Usos do plano',rlpN(pl.reduce((s,p)=>s+p.usos,0)),RLP_PER[RLP_F.per][0]),miniKpi('Sessões de pacote a usar',pc.reduce((s,p)=>s+p.ses-p.usad,0),pc.reduce((s,p)=>s+p.venc,0)+' vencem em 30 dias','warn')],
    g:rlpBarras(pc.map(p=>[p.n,Math.round(p.usad/p.ses*100)]),v=>v+'% usado'),gt:'Uso dos pacotes',
    h:['Plano / pacote','Tipo','Assinantes ou vendidos','Receita','Uso','Detalhe'],r:RLP_PLANOS.map(p=>p.tipo==='Plano'?[`<b>${p.n}</b>`,p.tipo,p.ass,fmt(Math.round(p.ass*p.mens*100)/100)+'/mês',rlpN(p.usos)+' usos',p.top]:[`<b>${p.n}</b>`,p.tipo,p.vend,fmt(p.valor*p.vend),p.usad+' de '+p.ses+' sessões',p.venc?p.venc+' vencem em 30 dias':'—']),
    nota:'Exemplo. Receita dos planos bate com a conta 1.5 (Plano DeoVita) da DRE de outubro.'}}},
 {id:'estoque',area:'Estoque',n:'Estoque: lote, movimentação, mínimo e vencimento',d:'Saldo por lote, itens abaixo do mínimo, lotes vencendo e movimentações.',subst:'os 17 relatórios de estoque e farmácia',f:['u'],subs:[['lote','Saldo por lote'],['min','Abaixo do mínimo'],['venc','Vencendo'],['mov','Movimentação']],
  run(){const us=[10,12,14].filter(x=>rlpUOk(x));const sal=i=>us.reduce((s,x)=>s+(i.s[x]||0),0);const fac=us.reduce((s,x)=>s+STK_FAC[x],0);const mn=i=>i.min==null?null:Math.ceil(i.min*fac),mx=i=>i.max==null?null:Math.ceil(i.max*fac);
   const lts=STK_LT.filter(l=>us.includes(l.u)).map(l=>({...l,it:STK(l.c),d:Math.round((new Date(l.v+'T00:00')-STK_HOJE)/864e5)})).filter(l=>l.it);
   const abx=STK_IT.filter(i=>i.ativo&&mn(i)!=null&&sal(i)<=mn(i));const vcd=lts.filter(l=>l.d<=STK_CFG.alerta);const mov=STK_MV.filter(m=>us.includes(m.u));const val=STK_IT.reduce((s,i)=>s+sal(i)*i.custo,0);const sub=rlpSub(this);
   const k=[miniKpi('Valor em estoque',fmt(Math.round(val*100)/100),STK_IT.length+' itens · custo médio'),miniKpi('Abaixo do mínimo',abx.length,'repor','warn',`RLP_SUB.estoque='min';reView()`),miniKpi('Vencendo em '+STK_CFG.alerta+' dias',vcd.filter(l=>l.d>=0).length,vcd.filter(l=>l.d<0).length+' já vencidos',vcd.length?'err':'ok',`RLP_SUB.estoque='venc';reView()`),miniKpi('Movimentações',mov.length,'recentes','',`RLP_SUB.estoque='mov';reView()`)];
   const vl=x=>stkQ(x);
   if(sub==='min')return {k,g:rlpBarras(abx.slice(0,8).map(i=>[i.n.slice(0,28),Math.round(sal(i)/Math.max(1,mn(i))*100)]),v=>v+'% do mín.'),gt:'Saldo em relação ao mínimo',h:['Código','Item','Saldo','Mínimo','Máximo','Comprar','Fornecedor'],r:abx.map(i=>[`<span class="mono">${i.c}</span>`,esc(i.n),vl(sal(i)),vl(mn(i)),mx(i)!=null?vl(mx(i)):'—',`<b>${vl(Math.max(0,(mx(i)||mn(i))-sal(i)))}</b> ${i.un.toLowerCase()}`,esc(i.forn)]),nota:'Mínimo e máximo por unidade (proporção de consumo de cada unidade). Gere o pedido em Ressuprimento.'};
   if(sub==='venc')return {k,g:rlpBarras(vcd.map(l=>[l.it.n.slice(0,24)+' · '+l.l,Math.max(0,l.d)]),v=>v+' dias'),gt:'Dias até vencer',h:['Item','Lote','Validade','Unidade','Quantidade','Valor','Dias'],r:vcd.sort((a,b)=>a.d-b.d).map(l=>[esc(l.it.n),`<span class="mono">${l.l}</span>`,l.v.split('-').reverse().join('/'),UNIDS[l.u],vl(l.q),fmt(Math.round(l.q*l.it.custo*100)/100),l.d<0?`<span class="prazo-err">vencido há ${-l.d}</span>`:l.d]),nota:'Alerta a partir de '+STK_CFG.alerta+' dias (configuração do estoque). Lote vencido não sai para setor; vira Perda com motivo.'};
   if(sub==='mov')return {k,g:rlpBarras(Object.entries(mov.reduce((m,x)=>{const t=(STK_TP[x.tipo]||[x.tipo])[0];m[t]=(m[t]||0)+1;return m},{})),v=>v+' lanç.'),gt:'Movimentações por tipo',h:['Nº','Tipo','Quando','Unidade','Setor / fornecedor','Itens','Documento','Por'],r:mov.map(m=>[m.n,(STK_TP[m.tipo]||[m.tipo])[0],m.d,UNIDS[m.u],m.forn?esc(m.forn):stkSetor(m.setor),m.it.length,m.doc||'—',esc(m.por)]),nota:'Cada movimentação é imutável; correção é estorno. Consumo automático vem do kit do procedimento ao finalizar o atendimento.'};
   return {k,g:rlpBarras(Object.entries(lts.reduce((m,l)=>{m[l.it.cat]=(m[l.it.cat]||0)+l.q*l.it.custo;return m},{})).map(([c,v])=>[c,Math.round(v*100)/100]),fmt),gt:'Valor por categoria (lotes)',h:['Item','Lote','Validade','Unidade','Quantidade','Valor'],r:lts.map(l=>[esc(l.it.n),`<span class="mono">${l.l}</span>`,l.v.split('-').reverse().join('/'),UNIDS[l.u],vl(l.q)+' '+l.it.un.toLowerCase(),fmt(Math.round(l.q*l.it.custo*100)/100)]),nota:'Mesmos lotes da tela Lotes e validades; saída sempre do lote que vence primeiro.'}}},
 {id:'auditoria',area:'Segurança',n:'Auditoria e acessos',d:'Quem fez o quê, quando e onde: financeiro, estoque, configurações, logins e exportações.',subst:'Auditoria Tabelas, Auditoria Login, Auditoria Split, Financeiro Excluído, Alteração Médico, Ocorrência',f:['per','quem'],pers:['hoje','semana','mes'],nominal:true,
  run(){const l=rlpAudBase().filter(a=>(!RLP_F.quem||a.quem===RLP_F.quem)&&(RLP_F.per!=='hoje'||a.h.startsWith('04/11')));const m={};l.forEach(a=>m[a.mod]=(m[a.mod]||0)+1);
   return {k:[miniKpi('Eventos',l.length,RLP_PER[RLP_F.per][0]),miniKpi('Financeiro',l.filter(a=>/Contas|Concilia|Repasse|Glosa|Custo/.test(a.mod)).length,'aprovações, pagamentos, conciliações'),miniKpi('Exportações',l.filter(a=>/Export/i.test(a.acao)).length,'cada uma registrada','warn'),miniKpi('Alertas de acesso',l.filter(a=>a.alerta).length,'senha errada, fora do horário',l.some(a=>a.alerta)?'err':'ok')],
    g:rlpBarras(Object.entries(m).sort((a,b)=>b[1]-a[1]),v=>v+' eventos'),gt:'Eventos por módulo',
    h:['Quando','Quem','Módulo','Ação'],r:l.map(a=>[a.h,esc(a.quem),a.mod,a.alerta?`<span class="prazo-err">${esc(a.acao)}</span>`:esc(a.acao)]),
    nota:'Trilha única: só inclusões, nada se apaga; desfazer e estornar geram registro novo. Inclui as assinaturas das alçadas do contas a pagar. Período obrigatório.'}}},
 {id:'relacionamento',area:'Pacientes',n:'Listas de relacionamento',d:'Aniversariantes do mês, retornos a agendar e pacientes sem contato há mais de 12 meses.',subst:'Aniversariantes, Paciente Telefone, Retorno, Revisão',f:['u','prof'],nominal:true,subs:[['aniv','Aniversariantes de novembro'],['ret','Retornos a agendar'],['sem','Sem contato há 12 meses']],
  run(){const base=[...PACIENTES.map(p=>({n:p.n,dn:p.dn,tel:p.tel,email:p.email,ult:p.ativo?'2026':'2025',cons:p.tel?'WhatsApp':'nenhum'})),...RLP_PACX];const sub=rlpSub(this);const idade=dn=>2026-+dn.slice(0,4);
   const aniv=base.filter(p=>p.dn&&p.dn.slice(5,7)==='11');const ret=RLP_RET.filter(r=>!RLP_F.prof||rlpProfNome(RLP_F.prof)===r[1]);const sem=RLP_PACX.filter(p=>/\/(2025|2024)$/.test(p.ult));
   const k=[miniKpi('Aniversariantes',aniv.length,'novembro','',`RLP_SUB.relacionamento='aniv';reView()`),miniKpi('Retornos a agendar',ret.length,'nos próximos 30 dias','warn',`RLP_SUB.relacionamento='ret';reView()`),miniKpi('Sem contato',sem.length,'há mais de 12 meses','',`RLP_SUB.relacionamento='sem';reView()`),miniKpi('Sem canal autorizado',base.filter(p=>p.cons==='nenhum').length,'fora de qualquer campanha (LGPD)','')];
   const acao=(n,c)=>c==='nenhum'?'<span class="tl">sem autorização</span>':`<button class="btn sm sec" onclick="event.stopPropagation();toast('Mensagem para ${esc(n).replace(/'/g,'')} na fila do ${c.split(' ')[0]}; registrada')">Enviar</button>`;
   if(sub==='ret')return {k,g:rlpBarras(Object.entries(ret.reduce((m,r)=>{m[r[1]]=(m[r[1]]||0)+1;return m},{})),v=>v+' retornos'),gt:'Retornos por profissional',h:['Paciente','Profissional','Última vez','Orientação','Retornar até',''],r:ret.map(r=>[`<b>${esc(r[0])}</b>`,r[1],r[2],r[3],r[4],`<button class="btn sm sec" onclick="event.stopPropagation();location.hash='#agenda'">Agendar</button>`]),nota:'Retorno sai da conduta registrada no prontuário. Exemplo.'};
   if(sub==='sem')return {k,g:rlpBarras(sem.map(p=>[p.n,Math.round((rlpHoje-new Date(p.ult.split('/').reverse().join('-')))/864e5/30)]),v=>v+' meses'),gt:'Meses sem vir',h:['Paciente','Último atendimento','Telefone','Canal autorizado',''],r:sem.map(p=>[`<b>${esc(p.n)}</b>`,p.ult,p.tel||'—',p.cons,acao(p.n,p.cons)]),nota:'Só entra em campanha quem autorizou o canal (LGPD). Exemplo.'};
   return {k,g:rlpBarras(aniv.map(p=>[p.n,+p.dn.slice(8,10)]),v=>'dia '+v),gt:'Dia do aniversário',h:['Paciente','Aniversário','Idade','Telefone','Canal autorizado',''],r:aniv.sort((a,b)=>a.dn.slice(8)-b.dn.slice(8)).map(p=>[`<b>${esc(p.n)}</b>`,p.dn.slice(8,10)+'/11',idade(p.dn)+' anos',p.tel||'—',p.cons,acao(p.n,p.cons)]),nota:'Mensagem de aniversário só pelo canal autorizado; nunca com dado de saúde.'}}},
 {id:'cadastro',area:'Pacientes',n:'Qualidade de cadastro',d:'Possíveis duplicados, CPF inválido e cadastro incompleto (sem telefone, e-mail ou nome da mãe).',subst:'Pacientes Duplicados, Paciente CPF Válido, Paciente CNH',f:['u'],nominal:true,
  run(){const base=[...PACIENTES.map(p=>({n:p.n,cpf:p.cpf,tel:p.tel,email:p.email,mae:p.mae,dn:p.dn})),...(typeof ORCS!=='undefined'?ORCS.map(o=>({n:o.n,cpf:o.cpf,tel:o.tel,email:'',mae:'?',dn:o.dn,orc:o.id})):[]),...RLP_PACX.map(p=>({...p,mae:p.mae??'informada'}))];
   const norm=n=>semAc(n).replace(/\b(de|da|do|dos|das)\b/g,'').replace(/\s+/g,' ').trim();const vistos={};const uniq=[];base.forEach(p=>{const k=norm(p.n)+'|'+p.cpf;if(!vistos[k]){vistos[k]=1;uniq.push(p)}});
   const prob=[];const grupos={};uniq.forEach(p=>{const k=norm(p.n)+'|'+p.dn;(grupos[k]=grupos[k]||[]).push(p)});
   Object.values(grupos).filter(g=>g.length>1&&new Set(g.map(x=>x.cpf)).size>1).forEach(g=>prob.push({t:'Possível duplicado',p:g.map(x=>x.n).join(' × '),d:'mesma data de nascimento; CPFs '+g.map(x=>x.cpf).join(' e '),a:'dup'}));
   uniq.filter(p=>!rlpCpfOk(p.cpf)).forEach(p=>prob.push({t:'CPF inválido',p:p.n,d:p.cpf+' não passa no dígito verificador',a:'cpf'}));
   uniq.filter(p=>!p.tel).forEach(p=>prob.push({t:'Sem telefone',p:p.n,d:'não recebe aviso nem confirmação',a:'inc'}));
   uniq.filter(p=>p.mae==='').forEach(p=>prob.push({t:'Sem nome da mãe',p:p.n,d:'obrigatório na guia TISS e na identificação',a:'inc'}));
   const c=k=>prob.filter(x=>x.t===k).length;
   return {k:[miniKpi('Cadastros analisados',uniq.length,'pacientes e orçamentos'),miniKpi('Possíveis duplicados',c('Possível duplicado'),'fundir mantém o histórico',c('Possível duplicado')?'err':'ok'),miniKpi('CPF inválido',c('CPF inválido'),'dígito verificador',c('CPF inválido')?'warn':'ok'),miniKpi('Incompletos',c('Sem telefone')+c('Sem nome da mãe'),'sem telefone ou nome da mãe','')],
    g:rlpBarras(['Possível duplicado','CPF inválido','Sem telefone','Sem nome da mãe'].map(k=>[k,c(k)]),v=>v+' cadastros'),gt:'Problemas por tipo',
    h:['Problema','Paciente','Detalhe',''],r:prob.map(x=>[x.t==='Possível duplicado'?`<span class="badge err">${x.t}</span>`:x.t==='CPF inválido'?`<span class="badge warn">${x.t}</span>`:`<span class="badge neutral">${x.t}</span>`,`<b>${esc(x.p)}</b>`,esc(x.d),x.a==='dup'?`<button class="btn sm sec" onclick="event.stopPropagation();location.hash='#pacientes'">Fundir</button>`:`<button class="btn sm ghost" onclick="event.stopPropagation();location.hash='#pacientes'">Corrigir</button>`]),
    nota:'CPF validado pelo dígito verificador de verdade; duplicado = mesmo nome (sem "de/da") e mesma data de nascimento com CPFs diferentes. Fundir fica na auditoria.'}}}
];
const RLP_AREAS=[...new Set(RLP.map(r=>r.area))];
const rlpR=id=>RLP.find(r=>r.id===id);

/* ---------- ações ---------- */
function rlpFav(id,ev){if(ev)ev.stopPropagation();RLP_FAV.has(id)?RLP_FAV.delete(id):RLP_FAV.add(id);try{localStorage.setItem('deoclinic-rel-fav',JSON.stringify([...RLP_FAV]))}catch(e){}reView();toast(RLP_FAV.has(id)?'Nos seus favoritos':'Fora dos favoritos')}
function rlpAbrir(id){RLP_REL=id;reView();window.scrollTo&&window.scrollTo(0,0)}
function rlpFiltroTxt(r){const f=r.f||[];return [f.includes('per')?RLP_PER[RLP_F.per][0]:'',f.includes('u')?(RLP_F.u?UNIDS[RLP_F.u]:'todas as unidades'):'',f.includes('prof')&&RLP_F.prof?rlpProfNome(RLP_F.prof):'',f.includes('conv')&&RLP_F.conv?RLP_F.conv:'',r.subs?r.subs.find(s=>s[0]===rlpSub(r))[1]:''].filter(Boolean).join(' · ')}
function rlpExport(id,tipo){const r=rlpR(id);const o=r.run();const nome=r.n.replace(/[^\wÀ-ú]+/g,'-').toLowerCase();if(typeof F2_AUD!=='undefined')F2_AUD.unshift({h:'04/11 '+hhmm(new Date()),quem:typeof FN_USU!=='undefined'?FN_USU:'Jânio',tela:'Relatórios',acao:`Exportou ${tipo}: ${r.n} · ${rlpFiltroTxt(r)}`});
 toast(`${tipo} gerado: ${nome}.${tipo.toLowerCase()} · ${o.r.length} linhas${r.nominal?' · nominal, com marca d’água do usuário':''} · registrado na auditoria (protótipo: arquivo de exemplo)`)}
function rlpAgendar(id){const r=rlpR(id);if(r.nominal){retorno('erro','Relatório nominal não pode ser agendado',`${r.n} mostra nome de paciente. Para proteger os dados (LGPD), ele só é gerado na hora, por quem tem a permissão, e cada geração fica na auditoria. Salve como favorito para abrir rápido.`,[{l:'Entendi'}]);return}
 openModal(`${mh('Agendar envio por e-mail · '+r.n)}<div class="mb"><div class="formgrid"><div class="field"><label for="rlpFreq">Frequência</label><select class="in" id="rlpFreq"><option>Todo dia</option><option selected>Toda segunda</option><option>Toda sexta</option><option>Todo dia 1º</option></select></div><div class="field"><label for="rlpHora">Hora</label><input class="in" id="rlpHora" value="07:00"></div><div class="field"><label for="rlpPara">Para (e-mails da clínica)</label><input class="in" id="rlpPara" value="financeiro@clinica.exemplo"></div><div class="field"><label for="rlpFmt">Formato</label><select class="in" id="rlpFmt"><option>PDF</option><option>CSV</option></select></div></div><p class="tl">Vai com os filtros de agora: <b>${esc(rlpFiltroTxt(r))}</b>. Quem recebe só vê o que o perfil dele vê; o link do arquivo vale 7 dias. Fica na auditoria.</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="rlpAgendarOk('${id}')">Agendar</button></div>`)}
function rlpAgendarOk(id){const r=rlpR(id);const para=($('#rlpPara').value||'').trim();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+(\s*[,;]\s*[^@\s]+@[^@\s]+\.[^@\s]+)*$/.test(para)){toast('Informe e-mails válidos (separe por vírgula)','warn');return}
 const freq=$('#rlpFreq').value+' '+$('#rlpHora').value;RLP_AGEND.unshift({id,f:rlpFiltroTxt(r),freq,para,fmt:$('#rlpFmt').value,por:typeof FN_USU!=='undefined'?FN_USU:'Jânio',ult:'—'});closeModal();RLP_ABA='agend';RLP_REL=null;reView();toast('Envio agendado: '+r.n+' · '+freq+' · registrado na auditoria')}
function rlpDesagendar(i){const a=RLP_AGEND[i];modalOk('Parar envio agendado',`<p style="font-size:14px">${esc(rlpR(a.id).n)} · ${esc(a.freq)} para ${esc(a.para)}. O histórico de envios continua na auditoria.</p>`,'Parar envio',`RLP_AGEND.splice(${i},1);reView();toast('Envio agendado parado')`,'warn')}

/* ---------- telas ---------- */
const rlpStar=id=>`<button class="rlp-star ${RLP_FAV.has(id)?'on':''}" onclick="rlpFav('${id}',event)" aria-label="${RLP_FAV.has(id)?'Tirar dos favoritos':'Favoritar'}" ${tipAttr(RLP_FAV.has(id)?'Favorito':'Favoritar','Favoritos aparecem primeiro na aba Favoritos.')}>${RLP_FAV.has(id)?'★':'☆'}</button>`;
const rlpCard=r=>`<div class="rlp-card" onclick="rlpAbrir('${r.id}')" role="button" tabindex="0"><div class="t"><b>${r.n}</b>${rlpStar(r.id)}</div><small>${r.d}</small><div class="row" style="gap:6px;flex-wrap:wrap">${r.nominal?'<span class="badge warn">nominal · exige permissão</span>':'<span class="badge ok">sem nome de paciente</span>'}<span class="tl" style="font-size:12px">substitui ${(r.subst.match(/,/g)||[]).length+1} ${info('No Clinicas: '+r.subst)}</span></div></div>`;
function rlpCatalogo(){const q=semAc(RLP_Q);const l=RLP.filter(r=>(!RLP_AREA||r.area===RLP_AREA)&&(!q||semAc(r.n+' '+r.d+' '+r.area+' '+r.subst).includes(q)));
 return `<div class="filters" style="margin-bottom:6px"><div class="inwrap" style="flex:1 1 220px">${LUPA}<input class="in" id="rlpBusca" placeholder="Busque pelo nome ou pelo relatório antigo (ex.: Caixa Cartão)" value="${esc(RLP_Q)}" oninput="RLP_Q=this.value;reView();setTimeout(()=>{const i=document.getElementById('rlpBusca');if(i){i.focus();i.setSelectionRange(99,99)}},0)"></div>${chip('Todas as áreas',!RLP_AREA,`RLP_AREA='';reView()`)}${RLP_AREAS.map(a=>chip(a,RLP_AREA===a,`RLP_AREA='${a}';reView()`)).join('')}</div>
 ${l.length?RLP_AREAS.filter(a=>l.some(r=>r.area===a)).map(a=>`<div class="rlp-area">${a}</div><div class="rlp-grid">${l.filter(r=>r.area===a).map(rlpCard).join('')}</div>`).join(''):'<div class="empty" style="padding:24px"><h4>Nenhum relatório com esse nome</h4><p class="tl">Busque pelo nome antigo também: "Caixa Cartão", "Produção Médica", "Aniversariantes".</p></div>'}
 <p class="tl" style="margin-top:12px">${RLP.length} relatórios da plataforma no lugar dos ~190 do Clinicas (inventário §11.2). Os do laboratório continuam na aba Laboratório.</p>
 ${piada(141,{financeiro:'20 relatórios no lugar de 190. O financeiro chorou de alegria; o contador pediu o 21º.',admin:'Antes eram 5 relatórios de caixa diferentes. Agora é um, com filtro. O sexto era o "Caixa Antigo", que ninguém sabia o que era.',todos:'Favorite o relatório que você abre toda segunda. A estrela não julga.'})}`}
function rlpFavoritos(){const l=RLP.filter(r=>RLP_FAV.has(r.id));return l.length?`<div class="rlp-grid">${l.map(rlpCard).join('')}</div>`:'<div class="empty" style="padding:24px"><h4>Nenhum favorito ainda</h4><p class="tl">Toque na estrela de um relatório para ele aparecer aqui.</p></div>'}
function rlpAgendados(){return `<p class="tl" style="margin-bottom:8px">Envios por e-mail com os filtros salvos. Relatório nominal (com nome de paciente) não pode ser agendado.</p>${tabela(['Relatório','Filtros','Quando','Para','Formato','Criado por','Último envio',''],RLP_AGEND.map((a,i)=>`<tr class="clk" onclick="rlpAbrir('${a.id}')">${td('Relatório',`<b>${esc(rlpR(a.id).n)}</b>`)}${td('Filtros',esc(a.f))}${td('Quando',esc(a.freq))}${td('Para',esc(a.para))}${td('Formato',a.fmt)}${td('Criado por',esc(a.por))}${td('Último envio',a.ult)}${td('',`<span class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm sec" onclick="event.stopPropagation();toast('Enviado agora para ${esc(a.para)}; registrado')">Enviar agora</button><button class="btn sm ghost" onclick="event.stopPropagation();rlpDesagendar(${i})">Parar</button></span>`)}</tr>`),'Nenhum envio agendado')}`}
function rlpOld(aba){if(typeof RLP_OLD!=='function')return '';try{RL_ABA=aba;return RLP_OLD().replace(/^\s*<div class="pagehead">[\s\S]*?<div class="tabs" role="tablist">[\s\S]*?<\/div>/,'')}catch(e){return '<p class="tl">Relatórios do laboratório indisponíveis.</p>'}}
function rlpRelatorio(r){let o;try{o=r.run()}catch(e){console.error(e);o={k:[],h:['Aviso'],r:[['Não foi possível montar o relatório com estes filtros.']],nota:''}}
 return `${pageHead('Qualidade e gestão · Relatórios · '+r.area,r.n,r.d+' Dados de exemplo.',`<div class="rlp-tools"><button class="btn ghost" onclick="RLP_REL=null;reView()">← Catálogo</button>${rlpStar(r.id)}<button class="btn sec" onclick="rlpExport('${r.id}','CSV')" ${tipAttr('CSV','Planilha com as linhas da tabela e os filtros no cabeçalho. Fica na auditoria.')}>CSV</button><button class="btn sec" onclick="rlpExport('${r.id}','PDF')" ${tipAttr('PDF','Resumo, gráfico e tabela, com os filtros e quem gerou no rodapé.')}>PDF</button><button class="btn" onclick="rlpAgendar('${r.id}')" ${tipAttr('Agendar envio por e-mail',r.nominal?'Relatório nominal: não pode ser agendado (LGPD).':'Envio automático com os filtros de agora.')}>Agendar envio</button></div>`)}
 ${rlpFiltros(r)}
 <div class="mini">${o.k.join('')}</div>
 ${o.g?`<div class="card at-card" style="margin-top:12px"><h3>${o.gt||'Gráfico'} ${info('Mesmos números da tabela abaixo, com os filtros aplicados.')}</h3>${o.g}</div>`:''}
 <div class="card at-card" style="margin-top:12px"><h3>Detalhe ${info('Substitui no Clinicas: '+r.subst+'.')}</h3>${tabela(o.h,o.r.map(row=>`<tr>${row.map((v,j)=>td(o.h[j]||'',v)).join('')}</tr>`),'Nada com estes filtros')}${o.extra||''}<p class="tl" style="margin-top:8px">${o.nota||''} ${r.nominal?'<b>Nominal:</b> só quem tem a permissão vê; cada abertura fica na auditoria.':''}</p></div>`}
VIEWS.relatorios=()=>{if(RLP_REL&&rlpR(RLP_REL))return rlpRelatorio(rlpR(RLP_REL));RLP_REL=null;
 const tabs=[['catalogo','Catálogo ('+RLP.length+')'],['fav','Favoritos ('+RLP_FAV.size+')'],['agend','Agendados ('+RLP_AGEND.length+')'],['lab','Laboratório'],['aud','Auditoria']];
 let corpo;if(RLP_ABA==='fav')corpo=rlpFavoritos();else if(RLP_ABA==='agend')corpo=rlpAgendados();else if(RLP_ABA==='aud')corpo=rlpOld('aud');else if(RLP_ABA==='lab'){if(typeof RL_ABA!=='undefined'&&RL_ABA==='aud')RL_ABA='rel';const cur=typeof RL_ABA!=='undefined'?RL_ABA:'rel';corpo=`<div class="rlp-sub">${[['rel','Relatórios do laboratório'],['meus','Meus relatórios'],['fila','Fila de geração']].map(([k,t])=>chip(t,cur===k,`RL_ABA='${k}';reView()`)).join('')}</div>${rlpOld(cur)}`}else corpo=rlpCatalogo();
 return `${pageHead('Qualidade e gestão','Relatórios e auditoria','Catálogo da plataforma por área (agenda, atendimento, faturamento, financeiro, repasse, estoque, pacientes, segurança), com filtros, resumo, gráfico, exportação, envio agendado e favoritos. Os do laboratório e a auditoria continuam aqui. Dados de exemplo.',`${rulesBtn('Relatórios e auditoria')}<button class="btn sec" onclick="RLP_ABA='agend';reView()">Agendados</button><button class="btn" onclick="RLP_ABA='aud';reView()">Auditoria</button>`)}
 <div class="tabs" role="tablist">${tabs.map(([k,t])=>`<button class="tab ${RLP_ABA===k?'active':''}" onclick="RLP_ABA='${k}';RLP_REL=null;reView()">${t}</button>`).join('')}</div>${corpo}`};
GUIDES.relatorios=['No Catálogo, busque pelo nome novo ou pelo antigo do Clinicas (ex.: "Caixa Cartão") ou filtre pela área; toque no relatório para abrir.','Cada relatório abre com filtros (período, unidade, profissional ou convênio), resumo, gráfico e tabela; exporte em CSV ou PDF (fica na auditoria).','Agende o envio por e-mail com os filtros de agora (nominal não pode) e marque os que você mais usa com a estrela.','Os relatórios do laboratório, Meus relatórios e a Fila de geração ficam na aba Laboratório; a trilha completa, em Auditoria.'];
if(REGRAS['Relatórios e auditoria'])REGRAS['Relatórios e auditoria'].itens.push(
 ['Catálogo da plataforma','~20 relatórios por área (inventário Clinicas §11.2) no lugar dos ~190 do legado: ocupação e no-show, demanda e conversão, tempos da jornada, produção, conferência pré-faturamento, lotes TISS e glosas, sessões de caixa, formas de pagamento, cartão a receber, aging a pagar e a receber, fluxo de caixa, DRE, carteira do paciente, repasse, planos e pacotes, estoque, auditoria e acessos, relacionamento e qualidade de cadastro.'],
 ['Um número só','Cada relatório lê os mesmos dados das telas (caixa, contas, DRE, glosas, repasse, estoque); não há cópia que fique diferente.'],
 ['Filtros','Período, unidade, profissional e convênio quando fazem sentido; a unidade vem do escopo do usuário (sem "empresa vazia = todas").'],
 ['Exportar e agendar','CSV e PDF com filtros e quem gerou; toda exportação vai para a auditoria; envio agendado por e-mail com link de 7 dias; relatório nominal não pode ser agendado.'],
 ['Favoritos','Cada pessoa marca os seus; aparecem na aba Favoritos.']);
window.addEventListener('hashchange',()=>{if(location.hash!=='#relatorios')RLP_REL=null},true);
