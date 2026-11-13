/* Rodada 21 (13/11/2026) · recepcao */
/* ==========================================================================
   Notas 665, 666, 696, 697, 703 a 707 e 709: Autorizar atendimento em tela própria e com valor travado,
   módulo Profissionais no menu, resultados por empresa, Fidelidade (Novo Contrato e Clientes Cadastrados),
   Faturar orçamento, Detalhes do agendamento em cartões e cartões tirados da área de fichas.
   A nota 708 não foi aplicada (ver respostas). Fica depois dos arquivos da rodada 20: só acrescenta funções
   e embrulha as que já existem. Prefixos rc21 / R21_.
   ========================================================================== */

const rc21El=id=>{try{return (typeof document!=='undefined'&&document.getElementById)?document.getElementById(id):null}catch(e){return null}};
const rc21V=id=>{const e=rc21El(id);return e&&typeof e.value==='string'?e.value.trim():''};
const rc21Aud=t=>{try{if(typeof r17Aud==='function')r17Aud(t,{})}catch(e){}};
const rc21Hash=()=>{try{return typeof location!=='undefined'?location.hash:''}catch(e){return ''}};
const rc21Ir=h=>{try{if(typeof location!=='undefined')location.hash=h}catch(e){}};
const rc21Re=h=>{if(rc21Hash()===h){try{reView()}catch(e){}}};

/* ---------- Nota 666: Profissionais vira um grupo próprio no menu, como Fidelidade e Financeiro ----------
   Um caminho só: sai de Cadastros e o atalho de Procedimentos (rodada 20) sai do menu. A tela é a mesma.
   O endereço antigo #proc-profissionais continua levando para a tela, para links já salvos. */
try{const cad=MENU.find(g=>g[0]==='Cadastros');if(cad){const i=cad[1].findIndex(x=>x[0]==='profissionais');if(i>=0)cad[1].splice(i,1)}
 const pr=MENU.find(g=>g[0]==='Procedimentos');if(pr){const i=pr[1].findIndex(x=>x[0]==='proc-profissionais');if(i>=0)pr[1].splice(i,1)}
 if(!MENU.some(g=>g[0]==='Profissionais')){const f=MENU.findIndex(g=>g[0]==='Fidelidade');MENU.splice(f>=0?f:MENU.length,0,['Profissionais',[['profissionais','Profissionais']]])}
 NAMES.profissionais='Profissionais';
 if(typeof GICON!=='undefined')GICON['Profissionais']='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M18 8v6M15 11h6"/></svg>';
 if(typeof DESC!=='undefined')DESC.profissionais='Módulo Profissionais: dados pessoais, conselho, usuário, perfis e recebedor no Pagar.me (repasse).'}catch(e){}
if(typeof VIEWS!=='undefined'&&typeof VIEWS.profissionais==='function'){const _v=VIEWS.profissionais;VIEWS.profissionais=function(){return _v.apply(this,arguments).replace('<div class="crumbs">Cadastros</div><h1>Profissionais</h1>','<h1>Profissionais</h1>')}}

/* ---------- Nota 704: "Planos e pacotes" sai do grupo Fidelidade ----------
   Só sai do menu. As regras dos planos continuam valendo no Novo atendimento (desconto e cobertura). */
try{const g=MENU.find(x=>x[0]==='Fidelidade');if(g){const i=g[1].findIndex(x=>x[0]==='planos');if(i>=0)g[1].splice(i,1)}}catch(e){}

/* ---------- Notas 665 e 697: Autorizar atendimento numa tela própria, com o valor travado ----------
   665: sai da janela flutuante e abre como página (#autorizar-atendimento), com "Voltar aos detalhes".
   697: o valor é sempre o cadastrado para o procedimento no plano (Procedimentos do convênio). O colaborador não muda.
   Isso substitui o valor editável com motivo da rodada 20. */
try{NAMES['autorizar-atendimento']='Autorizar atendimento';if(typeof PAI!=='undefined')PAI['autorizar-atendimento']='agenda'}catch(e){}
const R21_AUT0=typeof rc20AutPinta==='function'?rc20AutPinta:null;
function rc21AutTrava(A){if(!A)return;A.valorTab=rc20Tab(A.proc,A.conv);A.valor=A.valorTab;A.valorEd=false;A.mot=''}
function rc21AutCorpo(){const D=typeof RC!=='undefined'&&RC?RC.det:null,A=D&&D.aut;if(!A||!R21_AUT0)return '';rc21AutTrava(A);
 let cap='';const om=openModal,ma=modalAberto;openModal=h=>{cap=h};modalAberto=()=>false;try{R21_AUT0()}catch(e){cap=''}finally{openModal=om;modalAberto=ma}
 if(!cap)return '';
 const vf=`<div class="field"><label for="rc20AuV">Valor (R$)</label><input class="in" id="rc20AuV" value="${rc20Moeda(A.valor)}" readonly aria-readonly="true"><span class="msg rc20-aut-tab rc21-aut-v">Valor cadastrado para o procedimento no plano ${esc(A.conv)}. Não pode ser mudado aqui: só em Procedimentos do convênio.</span></div>`;
 return cap.replace(/^<div class="mh">[\s\S]*?<\/div>/,'')
  .replace(/<div class="field"><label for="rc20AuV">[\s\S]*?<\/span><\/div>/,vf)
  .replace(/\s*<div class="field rc20-aut-l"><label for="rc20AuM">[\s\S]*?<\/div>/,'')
  .replace('Confira com o paciente, mude o que for preciso e confirme.','Confira com o paciente, mude o que for preciso e confirme. O valor segue o cadastro do procedimento no plano.')
  .replace('<div class="mb rc20-aut">','<div class="rc20-aut rc21-aut-b">')
  .replace('<div class="mf">','<div class="at-end rc21-aut-fim">')
  .replace('onclick="RC.det.aut=null;rcDetPinta()"','onclick="rc21AutVoltar()"')}
VIEWS['autorizar-atendimento']=function(){const corpo=rc21AutCorpo();
 if(!corpo)return `${pageHead('Agendamentos','Autorizar atendimento','')}<div class="card at-card"><div class="empty" style="padding:24px 12px"><h4>Nenhum agendamento escolhido</h4><p>Abra o agendamento na agenda e toque em Autorizar Atendimento.</p><a class="btn sec" href="#agenda">Ir para Agendamentos</a></div></div>`;
 return `${pageHead('Agendamentos','Autorizar atendimento','',`<button class="btn ghost" onclick="rc21AutVoltar()">${typeof BACK_SVG!=='undefined'?BACK_SVG:''} Voltar aos detalhes</button>`)}<div class="card at-card rc21-aut-pg">${corpo}</div>`};
/* Pintar a autorização: na tela própria, redesenha a página; fora dela, fecha a janela e abre a página */
if(R21_AUT0)rc20AutPinta=function(){const D=typeof RC!=='undefined'&&RC?RC.det:null;if(!D||!D.aut)return;
 if(rc21Hash()==='#autorizar-atendimento'){const v=rc21El('view');if(v)v.innerHTML=VIEWS['autorizar-atendimento']();return}
 try{closeModal()}catch(e){}rc21Ir('#autorizar-atendimento')};
function rc21AutVoltar(){const D=typeof RC!=='undefined'&&RC?RC.det:null;if(D)D.aut=null;rc21Ir('#agenda');if(D){try{rcDetPinta()}catch(e){}}}
if(typeof rc20AutAbrir==='function'){const _a=rc20AutAbrir;rc20AutAbrir=function(){const r=_a.apply(this,arguments);try{if(RC.det&&RC.det.aut)rc21AutTrava(RC.det.aut)}catch(e){}return r}}
if(typeof rc20AutCampo==='function'){const _c=rc20AutCampo;rc20AutCampo=function(k,v){const A=RC.det&&RC.det.aut;if(!A)return;
 if(k==='valor'){rc21AutTrava(A);toast('O valor vem do cadastro do procedimento no plano e não pode ser mudado aqui','warn');rc20AutPinta();return}
 const _p=rc20AutPinta;let pinta=false;rc20AutPinta=function(){pinta=true};try{_c.apply(this,arguments)}finally{rc20AutPinta=_p}rc21AutTrava(A);if(pinta)rc20AutPinta()}}
if(typeof rc20AutConfirmar==='function'){const _f=rc20AutConfirmar;rc20AutConfirmar=function(){const D=RC.det,A=D&&D.aut;if(!A)return;rc21AutTrava(A);
 const r=_f.apply(this,arguments);try{if(RC.det&&!RC.det.aut&&RC.det.src&&RC.det.src.autorizado&&rc21Hash()==='#autorizar-atendimento')rc21Ir('#agenda')}catch(e){}return r}}

/* ---------- Nota 706: Detalhes do agendamento com nome e data de nascimento em campos separados ----------
   Ficam no mesmo padrão dos campos Telefone, Convênio e Procedimento. São só leitura: corrige-se em Editar cadastro. */
const rc21Ro=(id,l,v)=>`<div class="field"><label for="${id}">${l}</label><input class="in" id="${id}" value="${esc(v)}" readonly aria-readonly="true"></div>`;
if(typeof rcDetPinta==='function'){const _p=rcDetPinta;rcDetPinta=function(){const r=_p.apply(this,arguments);try{const m=rc21El('modal'),D=typeof RC!=='undefined'&&RC?RC.det:null;if(!m||typeof m.innerHTML!=='string'||!D)return r;const p=D.p||{};
 const h=m.innerHTML.replace(/<div class="rc-det-pac">[\s\S]*?<\/div>\s*<div class="formgrid" style="margin-top:8px">/,`<div class="formgrid rc21-det-g" style="margin-top:10px">${rc21Ro('rc21DetN','Nome do paciente',p.n||(D.ev&&D.ev.pac)||'')}${rc21Ro('rc21DetD','Data de nascimento',p.dn?dmy(p.dn):'não informado')}`);
 if(h!==m.innerHTML)m.innerHTML=h}catch(e){}return r}}

/* ---------- Novo atendimento: notas 705, 707 e 709 ----------
   707: o cartão "Plano e pacote" sai da área de fichas. O contrato de fidelidade passa para o cartão Paciente (aba Dados)
        e o desconto do plano continua entrando sozinho no preço de cada item.
   709: o cartão "Prioridade" sai. A prioridade legal continua: entra sozinha pela idade (60 anos ou mais: Prioridade;
        80 anos ou mais: Prioridade Especial), aparece no cartão Paciente e continua podendo ser marcada na senha
        (pré-atendimento) e alterada na Listagem de Senhas e na sala de espera, com motivo.
        Lei 10.048/2000; Estatuto da Pessoa Idosa (Lei 10.741/2003, art. 3º); Lei 13.466/2017 (80 anos ou mais). */
function rc21PriLegal(){if(typeof NA==='undefined'||!NA||!NA.pac||typeof r17PriMin!=='function')return 'NOR';const dn=NA.pac.dn,m=r17PriMin(dn),s=typeof r17SenhaNA==='function'?r17SenhaNA():null;
 if(s){if(m&&r17PriPode(dn,s.peso)){const de=s.peso;s.peso=m;try{(s.log=s.log||[]).push(`Prioridade legal pela idade às ${hhmm(new Date())}: ${rcPeso(de).n} para ${rcPeso(m).n}`);rcHist(s,'recepcao','Prioridade legal aplicada',`${rcPeso(de).n} para ${rcPeso(m).n} (${idade(dn)} anos)`);RC.at.filter(e=>e.sid===s.id).forEach(e=>e.peso=m)}catch(e){}}
  NA.pri=s.peso==='NOR'?'':rcPeso(s.peso).n;return s.peso}
 if(m&&r17PriPode(dn,NA.peso17||'NOR'))NA.peso17=m;const p=NA.peso17||'NOR';NA.pri=p==='NOR'?'':rcPeso(p).n;return p}
function rc21PriTag(){try{const p=rc21PriLegal();if(p==='NOR')return '';const m=r17PriMin(NA.pac.dn),s=r17SenhaNA();
 return ` <span class="rc21-pri">${rcPesoTag(p)}<small>${m&&p===m?`pela idade (${idade(NA.pac.dn)} anos, garantida em lei)`:s?`pela senha ${esc(s.num)}`:'marcada no atendimento'}</small></span>`}catch(e){return ''}}
function rc21FidLinha(){try{const ks=typeof naPlContratos==='function'?naPlContratos():[];
 if(!ks.length)return '<p class="tl rc21-fidpac">Fidelidade: sem plano de fidelidade.</p>';
 return `<p class="tl rc21-fidpac">Fidelidade: ${ks.map(k=>{const s=plSit(k);return `contrato <b class="mono">${esc(k.id)}</b> · ${k.tipo==='pacote'?'pacote':'plano'} ${esc((plRef(k)||{n:'não encontrado'}).n)} · <span class="badge ${s[2]}">${esc(s[1])}</span>`}).join('; ')}. O desconto entra sozinho no preço.</p>`}catch(e){return ''}}
/* 705: "Faturar orçamento" em cada orçamento do paciente: traz os itens e gera a ficha */
function rc21OrcBtn(o){return NA&&!NA.autz&&o&&o.sit!=='convertido'&&NA.orcAuto!==o.id?`<button class="btn sm" onclick="rc21OrcFaturar('${esc(o.id)}')">Faturar orçamento</button>`:''}
if(typeof naPacCard==='function'){const _k=naPacCard;naPacCard=function(){let h=_k.apply(this,arguments);if(!h||typeof NA==='undefined'||!NA||NA.modo!=='atendimento')return h;
 try{h=h.replace('<h3>Paciente</h3>','<h3>Paciente'+rc21PriTag()+'</h3>');
  const ab=typeof NA_PAC_ABA!=='undefined'?NA_PAC_ABA:'dados';
  if(ab==='orc')h=h.replace(/(<div class="at-row"><div class="grow"><span class="mono">(ORC-[\w-]+)<\/span>[\s\S]*?<\/small><\/div>)/g,(t,a,id)=>a+rc21OrcBtn(ORCS.find(o=>o.id===id)));
  if(ab==='dados'){const k=h.lastIndexOf('</div>');if(k>0)h=h.slice(0,k)+rc21FidLinha()+h.slice(k)}}catch(e){}return h}}
function rc21OrcFaturar(id){if(typeof NA==='undefined'||!NA||NA.modo!=='atendimento')return;const o=ORCS.find(x=>x.id===id);if(!o)return;
 if(NA.autz){toast(`Este atendimento já tem a ficha ${NA.ficha}. Desfaça a autorização para faturar outro orçamento`,'warn');return}
 if(o.sit==='convertido'){toast(`Este orçamento já virou a ficha ${o.conv||''}`,'warn');return}
 const conv=o.convenio&&o.convenio!=='Particular'?o.convenio:'Particular',venc=o.val<iso(HOJE);
 const it=o.it.filter(i=>EX[i.c]);if(!it.length){toast('Este orçamento não tem itens que ainda estejam ativos','warn');return}
 NA.tipo=conv==='Particular'?'particular':'convenio';NA.conv=conv==='Particular'?'':conv;
 NA.ex=it.map(i=>r17Calc({c:i.c,pb:venc?r17Preco(i.c,conv):Math.round((i.p-(i.urg?(i.taxa||0):0))*100)/100,urg:!!i.urg,med:i.med||''}));
 o.ct=o.ct||[];NA.orc=o;NA.usarOrc=true;NA.orcAuto=o.id;NA.orcSig='';NA.err={};NA_PAC_ABA='orc';
 r17Autorizar();
 if(NA.autz){o.ct.push({d:`${dm(iso(HOJE))} ${NA.autz.h}`,c:'Balcão',r:`Orçamento faturado: gerou a ficha ${NA.ficha} com ${it.length} item(ns).`,q:typeof USU_ORC!=='undefined'?USU_ORC:'Você'});rc21Aud(`Orçamento ${o.id} faturado: ficha ${NA.ficha}`);
  toast(`Orçamento ${o.id} faturado: ficha ${NA.ficha} gerada com ${it.length} item(ns)${venc?' (orçamento vencido: valores de hoje)':''}`)}
 else toast(`Os itens do orçamento ${o.id} estão no pedido. Complete os campos marcados e toque em Autorizar orçamento para gerar a ficha`,'warn')}
/* 707 e 709: os dois cartões saem do Pedido (e o de plano também do Pagamento) */
if(typeof naP2==='function'){const _p2=naP2;naP2=function(){if(typeof NA==='undefined'||!NA||NA.modo!=='atendimento')return _p2.apply(this,arguments);rc21PriLegal();
 const a=naPlCard,b=typeof r17PriCard==='function'?r17PriCard:null;naPlCard=()=>'';if(b)r17PriCard=()=>'';try{return _p2.apply(this,arguments)}finally{naPlCard=a;if(b)r17PriCard=b}}}
if(typeof naP3==='function'){const _p3=naP3;naP3=function(){if(typeof NA==='undefined'||!NA||NA.modo!=='atendimento')return _p3.apply(this,arguments);rc21PriLegal();
 const a=naPlCard;naPlCard=()=>'';try{return _p3.apply(this,arguments)}finally{naPlCard=a}}}
/* 709: a senha já sai com a prioridade legal pela idade, mesmo que outro peso tenha sido marcado */
if(typeof rcGerarSenha==='function'){const _g=rcGerarSenha;rcGerarSenha=function(o){o=Object.assign({},o||{});try{const p=(o.cpf&&rcPacCpf(o.cpf))||(o.pac&&PACIENTES.find(x=>x.n===o.pac));const m=p&&r17PriMin(p.dn);
  if(m&&r17PriPode(p.dn,o.peso||'NOR')&&rcPesoUnid(rcPeso(m),+(o.unid||RC.unid)))o.peso=m}catch(e){}return _g.call(this,o)}}
if(typeof VIEWS!=='undefined'&&typeof VIEWS['pre-atendimento']==='function'){const _pa=VIEWS['pre-atendimento'];VIEWS['pre-atendimento']=function(){const h=_pa.apply(this,arguments);
 return h.replace('<h4 style="margin:10px 0 6px">Peso do atendimento</h4>','<h4 style="margin:10px 0 6px">Peso do atendimento</h4><p class="tl rc21-pa-lei">Quem tem 60 anos ou mais já entra com Prioridade, e 80 anos ou mais com Prioridade Especial, pela idade do cadastro (Lei 10.048/2000; Lei 10.741/2003, art. 3º; Lei 13.466/2017). Gestante, pessoa com deficiência e outros casos da lei: marque aqui.</p>')}}

/* ---------- Nota 703: Painel da Fidelidade com Novo Contrato e Clientes Cadastrados ----------
   Substitui o aviso "Em definição para a V1". A lista usa os contratos cadastrados no sistema (PL_CONTRATOS): no protótipo
   ficam na memória do navegador; no sistema definitivo, vêm do banco de dados. Cada contrato é ligado ao paciente pelo CPF
   (ou pelo nome, quando o titular não tem CPF) e o Paciente ID é o número do prontuário. Situação é calculada, ninguém escolhe à mão. */
const R21_FID_PODE=['admin','gestor','recepcao','financeiro'];
const rc21FidPode=()=>R21_FID_PODE.includes(typeof PERFIL!=='undefined'?PERFIL:'');
const R21_FORMAS=['Pix','Pix recorrente','Boleto','Cartão recorrente','Cartão de crédito à vista','Cartão parcelado','Faturado à empresa','Dinheiro'];
const rc21Formas=()=>[...new Set([...R21_FORMAS,...(typeof PL_CONTRATOS!=='undefined'?PL_CONTRATOS:[]).map(k=>k.forma).filter(Boolean)])];
const R21_SITS=[['adimplente','Adimplente'],['carencia','Em carência'],['inadimplente','Inadimplente'],['ativo','Ativo (pacote)'],['vencido','Vencido'],['esgotado','Saldo usado'],['cancelado','Cancelado']];
const R21_FID_COLS=[['id','Paciente ID'],['ct','Contrato'],['n','Nome'],['forma','Forma de pagamento'],['cpf','CPF'],['sit','Situação']];
const R21_FID_VAZIO=()=>({id:'',ct:'',n:'',forma:'',cpf:'',sit:''});
let R21_FID={...R21_FID_VAZIO(),ord:'ct',dir:1,pag:1,tam:5,aberto:true},R21_CT_ED='';
function rc21FidPac(k){if(typeof PACIENTES==='undefined')return null;return (k.cpf&&PACIENTES.find(p=>!p.unificadoEm&&p.cpf===k.cpf))||PACIENTES.find(p=>!p.unificadoEm&&p.n===k.tit)||null}
function rc21FidLinhas(){return (typeof PL_CONTRATOS!=='undefined'?PL_CONTRATOS:[]).map(k=>{const p=rc21FidPac(k),s=plSit(k);
 return {k,id:p&&typeof rc20Pront==='function'?rc20Pront(p):'',ct:k.id,n:k.tit,forma:k.forma||'',cpf:k.cpf||(p&&p.cpf)||'',sit:s[0],sitT:s[1],cor:s[2]}})}
function rc21FidFiltra(){const F=R21_FID,d=x=>soDig(x||''),t=x=>semAc(String(x||'').trim());
 return rc21FidLinhas().filter(r=>(!d(F.id)||r.id.includes(d(F.id)))&&(!t(F.ct)||t(r.ct).includes(t(F.ct)))&&(!t(F.n)||t(r.n).includes(t(F.n)))&&(!F.forma||r.forma===F.forma)&&(!d(F.cpf)||d(r.cpf).includes(d(F.cpf)))&&(!F.sit||r.sit===F.sit))
  .sort((a,b)=>{const c=F.ord==='sit'?'sitT':F.ord;return F.dir*String(a[c]||'').localeCompare(String(b[c]||''),'pt-BR',{numeric:true})})}
function rc21FidCorpo(){const F=R21_FID,l=rc21FidFiltra(),np=Math.max(1,Math.ceil(l.length/F.tam));if(F.pag>np)F.pag=np;if(F.pag<1)F.pag=1;
 const ini=(F.pag-1)*F.tam,pg=l.slice(ini,ini+F.tam),pode=rc21FidPode();
 const rows=pg.length?pg.map(r=>`<tr class="rc21-fid-tr" onclick="if(!event.target.closest('button'))rc21CtVer('${esc(r.ct)}')">${td('Paciente ID',r.id?`<span class="mono">${esc(r.id)}</span>`:'<span class="tl">sem cadastro</span>')}${td('Contrato',`<span class="mono">${esc(r.ct)}</span>`)}${td('Nome',`<b class="rc21-nome">${esc(r.n)}</b>`)}${td('Forma de pagamento',esc(r.forma))}${td('CPF',r.cpf?`<span class="mono">${cpfVer(r.cpf)}</span>`:'<span class="tl">sem CPF</span>')}${td('Situação',`<span class="badge ${r.cor}">${esc(r.sitT)}</span>`)}${td('Ações',`<div class="row rc21-fid-ac"><button type="button" class="btn sm ghost" onclick="rc21CtVer('${esc(r.ct)}')">Ver</button><button type="button" class="btn sm ghost" ${pode&&r.sit!=='cancelado'?'':`disabled title="${pode?'Contrato cancelado não é editado':'Seu perfil só consulta contratos'}"`} onclick="rc21CtForm('${esc(r.ct)}')">${I.edit} Editar</button></div>`)}</tr>`).join('')
  :vazioLinha(7,'Nenhum contrato encontrado','Mude ou limpe os filtros.');
 const pager=`<div class="rc21-pg"><span class="tl">${l.length?`Mostrando ${ini+1} a ${ini+pg.length} de ${l.length}`:'Nenhum resultado'}</span><label class="rc21-pg-t">Por página <select class="in" aria-label="Contratos por página" onchange="rc21FidTam(this.value)">${[5,10,25].map(n=>`<option ${n===F.tam?'selected':''}>${n}</option>`).join('')}</select></label>
 <div class="row rc21-pg-b"><button type="button" class="btn sm ghost" ${F.pag>1?'':'disabled'} onclick="rc21FidPag(-1)" aria-label="Página anterior">‹ Anterior</button><span>Página ${F.pag} de ${np}</span><button type="button" class="btn sm ghost" ${F.pag<np?'':'disabled'} onclick="rc21FidPag(1)" aria-label="Próxima página">Próxima ›</button></div></div>`;
 return {rows,pager,n:l.length}}
function rc21FidPinta(){const c=rc21FidCorpo(),b=rc21El('rc21FidB'),p=rc21El('rc21FidPg'),n=rc21El('rc21FidN');if(b)b.innerHTML=c.rows;if(p)p.innerHTML=c.pager;if(n)n.textContent=String(c.n);return c}
function rc21FidSet(k,v){R21_FID[k]=String(v==null?'':v);R21_FID.pag=1;rc21FidPinta()}
function rc21FidLimpar(){Object.assign(R21_FID,R21_FID_VAZIO(),{pag:1});rc21Re('#fidelidade')}
function rc21FidOrd(k){if(R21_FID.ord===k)R21_FID.dir=-R21_FID.dir;else{R21_FID.ord=k;R21_FID.dir=1}rc21Re('#fidelidade')}
function rc21FidPag(n){R21_FID.pag+=n;rc21FidPinta()}
function rc21FidTam(v){R21_FID.tam=Math.max(1,+v||5);R21_FID.pag=1;rc21FidPinta()}
function rc21FidFiltros(){const F=R21_FID,inp=(k,ph,extra)=>`<th><input class="in" aria-label="Filtrar por ${ph}" placeholder="${ph}" value="${esc(F[k])}" oninput="rc21FidSet('${k}',this.value)" ${extra||''}></th>`;
 return `<tr class="rc21-fid-f">${inp('id','Paciente ID','inputmode="numeric"')}${inp('ct','Contrato')}${inp('n','Nome')}<th><select class="in" aria-label="Filtrar por forma de pagamento" onchange="rc21FidSet('forma',this.value)"><option value="">Todas as formas</option>${rc21Formas().map(f=>`<option ${F.forma===f?'selected':''}>${esc(f)}</option>`).join('')}</select></th>${inp('cpf','CPF','inputmode="numeric"')}<th><select class="in" aria-label="Filtrar por situação" onchange="rc21FidSet('sit',this.value)"><option value="">Todas as situações</option>${R21_SITS.map(([v,t])=>`<option value="${v}" ${F.sit===v?'selected':''}>${t}</option>`).join('')}</select></th><th><button type="button" class="btn sm ghost" onclick="rc21FidLimpar()">Limpar filtros</button></th></tr>`}
VIEWS.fidelidade=function(){const F=R21_FID,c=rc21FidCorpo(),pode=rc21FidPode();
 const ths=R21_FID_COLS.map(([k,t])=>`<th aria-sort="${F.ord===k?(F.dir>0?'ascending':'descending'):'none'}"><button type="button" class="rc21-ord" onclick="rc21FidOrd('${k}')" title="Ordenar por ${t}">${t} <span aria-hidden="true">${F.ord===k?(F.dir>0?'▲':'▼'):'↕'}</span></button></th>`).join('');
 return `${pageHead('Fidelidade','Painel da Fidelidade','Cadastre um novo contrato e consulte os clientes que já têm contrato de fidelidade.',`<button class="btn" ${pode?'':'disabled title="Seu perfil só consulta contratos"'} onclick="rc21CtForm()">${I.plus} Novo Contrato</button>`)}
 <details class="card at-card rc21-fid" ${F.aberto?'open':''} ontoggle="R21_FID.aberto=this.open"><summary><h3>Clientes Cadastrados <span class="badge neutral" id="rc21FidN">${c.n}</span></h3><span class="tl rc21-fid-dica">Clique para abrir ou recolher</span></summary>
 <div class="tablewrap rc21-fid-tw"><table class="at-table rc21-fid-t"><thead><tr>${ths}<th>Ações</th></tr>${rc21FidFiltros()}</thead><tbody id="rc21FidB">${c.rows}</tbody></table></div><div id="rc21FidPg">${c.pager}</div>
 <p class="tl" style="margin:8px 0 0">Clique na linha ou em Ver para abrir o contrato completo. A situação é calculada: mensalidade vencida há mais de 10 dias, carência do plano, validade e saldo do pacote.</p></details>`};
/* Ver: abre os dados completos do contrato (dependentes, carências, saldo e consumo) */
function rc21CtVer(id){const k=PL_CONTRATOS.find(x=>x.id===id);if(!k)return;if(typeof plnContrato==='function'){try{plnContrato(id);return}catch(e){}}
 openDrawer(esc(k.id),kvs([['Titular',esc(k.tit)],['Forma de pagamento',esc(k.forma||'')],['Situação',esc(plSit(k)[1])]]))}
/* Novo Contrato e Editar: titular, plano ou pacote, forma de pagamento, vencimento e início */
function rc21CtNovoId(tipo){const pre=tipo==='pacote'?'PC-':'CT-',n=PL_CONTRATOS.filter(k=>k.id.startsWith(pre)).map(k=>+k.id.slice(3)||0);return pre+String(Math.max(0,...n)+1).padStart(4,'0')}
function rc21CtForm(id){if(!rc21FidPode()){toast('Seu perfil só consulta contratos','warn');return}const k=id?PL_CONTRATOS.find(x=>x.id===id):null;if(id&&!k)return;if(k&&k.cancelado){toast('Contrato cancelado não é editado','warn');return}R21_CT_ED=id||'';
 const pacs=(typeof PACIENTES!=='undefined'?PACIENTES:[]).map((p,i)=>({p,i})).filter(x=>x.p.ativo!==false&&!x.p.unificadoEm).sort((a,b)=>a.p.n.localeCompare(b.p.n,'pt-BR'));
 const refs=`<optgroup label="Planos (mensalidade)">${PL_PLANOS.filter(p=>p.ativo!==false).map(p=>`<option value="plano:${p.id}">${esc(p.n)} · ${fmt(p.mens)} por mês</option>`).join('')}</optgroup><optgroup label="Pacotes (saldo)">${PL_PACOTES.map(p=>`<option value="pacote:${p.id}">${esc(p.n)} · ${fmt(p.preco)}</option>`).join('')}</optgroup>`;
 const sel=(v,o)=>o.replace(`value="${v}"`,`value="${v}" selected`);
 openModal(`${mh(k?'Editar contrato '+esc(k.id):'Novo Contrato')}<div class="mb"><div class="formgrid rc21-ct-g">
 ${k?rc21Ro('rc21CtT','Paciente titular',k.tit+(k.cpf?' · CPF '+cpfMask(k.cpf):'')):`<div class="field" style="grid-column:1/-1"><label for="rc21CtP">Paciente titular <span class="req">*</span></label><select class="in" id="rc21CtP"><option value="">Escolha o paciente</option>${pacs.map(x=>`<option value="${x.i}">${esc(x.p.n)}${x.p.cpf?' · CPF '+cpfMask(x.p.cpf):''}</option>`).join('')}</select><span class="msg tl">Quem não tem cadastro: cadastre antes em Pacientes.</span></div>`}
 ${k?rc21Ro('rc21CtRo','Plano ou pacote',(plRef(k)||{n:''}).n):`<div class="field" style="grid-column:1/-1"><label for="rc21CtR">Plano ou pacote <span class="req">*</span></label><select class="in" id="rc21CtR"><option value="">Escolha o plano ou o pacote</option>${refs}</select></div>`}
 <div class="field"><label for="rc21CtF">Forma de pagamento <span class="req">*</span></label><select class="in" id="rc21CtF"><option value="">Escolha</option>${sel(k?esc(k.forma||''):'',rc21Formas().map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join(''))}</select></div>
 <div class="field"><label for="rc21CtD">Dia do vencimento (plano)</label><select class="in" id="rc21CtD">${sel(String(k&&k.dia?k.dia:10),[5,10,15,20,25].map(d=>`<option value="${d}">Dia ${d}</option>`).join(''))}</select></div>
 ${k?rc21Ro('rc21CtIr','Início',dmy(k.ini)):`<div class="field"><label for="rc21CtI">Início <span class="req">*</span></label><input class="in" id="rc21CtI" type="date" value="${esc(typeof PL_HOJE!=='undefined'?PL_HOJE:'')}"></div>`}
 <div class="field"><label for="rc21CtE">Empresa (quando a empresa paga)</label><input class="in" id="rc21CtE" maxlength="80" value="${esc(k&&k.empresa||'')}" placeholder="Ex.: Construtora Delta Ltda"></div></div>
 <p class="tl" style="margin-top:8px">${k?'Titular, plano e início não mudam: para trocar de plano, cancele este contrato e faça um novo. A situação é calculada sozinha.':'O contrato entra na hora na lista de Clientes Cadastrados e o desconto do plano passa a valer no Novo atendimento.'} Tudo fica na auditoria.</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="rc21CtSalvar()">${k?'Salvar':'Cadastrar contrato'}</button></div>`,'wide')}
function rc21CtSalvar(){if(!rc21FidPode()){toast('Seu perfil só consulta contratos','warn');return}const id=R21_CT_ED,forma=rc21V('rc21CtF'),dia=+rc21V('rc21CtD')||10,emp=rc21V('rc21CtE');
 if(id){const k=PL_CONTRATOS.find(x=>x.id===id);if(!k)return;if(!forma){toast('Escolha a forma de pagamento','warn');return}const ch=[];
  if(forma!==k.forma)ch.push(`forma de pagamento de ${k.forma||'vazio'} para ${forma}`);if(k.tipo==='plano'&&dia!==k.dia)ch.push(`vencimento do dia ${k.dia} para o dia ${dia}`);if(emp!==(k.empresa||''))ch.push(`empresa para ${emp||'nenhuma'}`);
  k.forma=forma;if(k.tipo==='plano')k.dia=dia;if(emp)k.empresa=emp;else delete k.empresa;rc21Aud(`Contrato ${k.id} alterado: ${ch.join('; ')||'sem mudanças'}`);R21_CT_ED='';closeModal();rc21Re('#fidelidade');toast(ch.length?'Contrato atualizado':'Nada mudou no contrato');return}
 const pi=rc21V('rc21CtP'),ref=rc21V('rc21CtR'),ini=rc21V('rc21CtI'),p=pi!==''?PACIENTES[+pi]:null,[tipo,rid]=ref.split(':');
 const erro=!p?'Escolha o paciente titular':!ref||!rid?'Escolha o plano ou o pacote':!forma?'Escolha a forma de pagamento':!/^\d{4}-\d{2}-\d{2}$/.test(ini)?'Informe a data de início':'';if(erro){toast(erro,'warn');return}
 const r=tipo==='plano'?plPlano(rid):plPacote(rid);if(!r){toast('Plano ou pacote não encontrado','warn');return}
 const dup=PL_CONTRATOS.find(k=>!k.cancelado&&k.ref===rid&&((p.cpf&&k.cpf===p.cpf)||k.tit===p.n)&&plSit(k)[0]!=='vencido'&&plSit(k)[0]!=='esgotado');if(dup){toast(`${p.n} já tem o contrato ${dup.id} deste ${tipo}`,'warn');return}
 const nid=rc21CtNovoId(tipo),k={id:nid,tipo,ref:rid,tit:p.n,cpf:p.cpf||'',deps:[],ini,forma,consumo:[],criadoPor:typeof rc20Quem==='function'?rc20Quem():'Usuário'};
 if(tipo==='plano'){k.dia=dia;k.mensAbertas=[]}else k.saldo=Object.fromEntries(r.itens.map(([c,q])=>[c,q]));if(emp)k.empresa=emp;
 PL_CONTRATOS.push(k);rc21Aud(`Contrato ${nid} cadastrado: ${p.n} · ${r.n} · ${forma}`);R21_CT_ED='';closeModal();rc21Re('#fidelidade');toast(`Contrato ${nid} cadastrado para ${p.n.split(' ')[0]}`)}

/* ---------- Nota 696: liberação de resultados configurada em cada empresa ----------
   Em Cadastros > Empresas, o botão Resultados abre as opções: site (Área do paciente e Portal do médico), WhatsApp, SMS,
   aplicativo e multifuncional (totem), para o paciente e para o médico solicitante, e quando o aviso sai.
   SIMULAÇÃO: nada é enviado. O aviso só sai depois que o laudo é liberado pelo responsável e não leva o nome do exame
   nem o resultado: só avisa e manda o acesso com CPF e data de nascimento (LGPD, art. 11, dado de saúde). */
const R21_RES_CANAIS=[['site','Site','Área do paciente e Portal do médico, com login'],['whats','WhatsApp','Mensagem com o link de acesso'],['sms','SMS','Mensagem curta com o link de acesso'],['app','Aplicativo','Aviso no aplicativo DeoVita'],['totem','Multifuncional (totem)','O paciente imprime o laudo na unidade com CPF e data de nascimento']];
const R21_RES_QUANDO=[['liberado','Assim que o laudo for liberado'],['horas','Algumas horas depois da liberação'],['manual','Só quando a operação mandar']];
const R21_RES={},R21_RES_LOG=[];
function rc21Res(id){return R21_RES[id]||(R21_RES[id]={site:true,whats:true,sms:false,app:true,totem:false,quando:'liberado',horas:2,pac:true,med:true,msg:'Olá, {nome}! Seu resultado na DeoVita ({unidade}) já está disponível. Acesse com seu CPF e data de nascimento.'})}
const rc21ResCanais=c=>R21_RES_CANAIS.filter(([k])=>c[k]).map(x=>x[1]);
function rc21ResForm(id){const e=rc19Emps().find(x=>x.id===id);if(!e)return;const c=rc21Res(id),log=R21_RES_LOG.filter(x=>x.emp===id).slice(0,5);
 openModal(`${mh('Resultados · '+esc(e.fant))}<div class="mb rc21-res">
 <p class="tl" style="margin:0 0 10px">Escolha por onde pacientes e médicos recebem o aviso de resultado pronto. Vale só para esta empresa.</p>
 <h4>Canais</h4><div class="rc21-res-c">${R21_RES_CANAIS.map(([k,t,d])=>`<label class="check rc21-res-i"><input type="checkbox" id="rc21Rs_${k}" ${c[k]?'checked':''}><span><b>${t}</b><small>${d}</small></span></label>`).join('')}</div>
 <h4>Para quem</h4><div class="rc21-res-c"><label class="check"><input type="checkbox" id="rc21RsPac" ${c.pac?'checked':''}>Paciente</label><label class="check"><input type="checkbox" id="rc21RsMed" ${c.med?'checked':''}>Médico solicitante (Portal do médico)</label></div>
 <div class="formgrid"><div class="field"><label for="rc21RsQ">Quando avisar</label><select class="in" id="rc21RsQ">${R21_RES_QUANDO.map(([v,t])=>`<option value="${v}" ${c.quando===v?'selected':''}>${t}</option>`).join('')}</select></div>
 <div class="field"><label for="rc21RsH">Horas depois da liberação</label><input class="in" id="rc21RsH" type="number" min="1" max="72" value="${esc(c.horas)}"><span class="msg tl">Usado só em "Algumas horas depois".</span></div>
 <div class="field" style="grid-column:1/-1"><label for="rc21RsM">Mensagem (WhatsApp, SMS e aplicativo)</label><input class="in" id="rc21RsM" maxlength="160" value="${esc(c.msg)}"><span class="msg tl">Pode usar {nome} e {unidade}. A mensagem não leva o nome do exame nem o resultado (LGPD).</span></div></div>
 <div class="alert info"><span>O aviso só sai depois que o laudo é liberado pelo responsável. Valor crítico continua sendo avisado por telefone ao médico, como manda a rotina do laboratório.</span></div>
 ${log.length?`<h4>Últimos disparos simulados</h4><div class="ab-log">${log.map(x=>`<div>${esc(x.txt)}<small>${esc(x.quando)} · ${esc(x.por)}</small></div>`).join('')}</div>`:''}</div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn sec" onclick="rc21ResTeste('${esc(id)}')">Simular disparo</button><button class="btn" onclick="rc21ResSalvar('${esc(id)}')">Salvar</button></div>`,'wide')}
function rc21ResLer(id){const c=rc21Res(id),n={...c};R21_RES_CANAIS.forEach(([k])=>{const el=rc21El('rc21Rs_'+k);if(el&&typeof el.checked==='boolean')n[k]=el.checked});
 const pe=rc21El('rc21RsPac'),me=rc21El('rc21RsMed');if(pe&&typeof pe.checked==='boolean')n.pac=pe.checked;if(me&&typeof me.checked==='boolean')n.med=me.checked;
 const q=rc21V('rc21RsQ'),h=+rc21V('rc21RsH'),m=rc21V('rc21RsM');if(q)n.quando=q;if(h>0)n.horas=Math.min(72,Math.round(h));if(m)n.msg=m;return n}
function rc21ResValida(n){if((n.pac||n.med)&&!rc21ResCanais(n).length)return 'Ligue pelo menos um canal, ou desmarque paciente e médico';return ''}
function rc21ResSalvar(id){const e=rc19Emps().find(x=>x.id===id);if(!e)return;const n=rc21ResLer(id),er=rc21ResValida(n);if(er){toast(er,'warn');return}
 R21_RES[id]=n;rc21Aud(`Resultados da empresa ${e.fant}: ${rc21ResCanais(n).join(', ')||'nenhum canal'} · ${(R21_RES_QUANDO.find(x=>x[0]===n.quando)||['',''])[1]}`);closeModal();rc21Re('#empresas');toast('Liberação de resultados salva para '+e.fant)}
function rc21ResTeste(id){const e=rc19Emps().find(x=>x.id===id);if(!e)return;const n=rc21ResLer(id),er=rc21ResValida(n);if(er){toast(er,'warn');return}
 const can=rc21ResCanais(n),quem=[n.pac?'paciente':'',n.med?'médico solicitante':''].filter(Boolean).join(' e ');if(!can.length||!quem){toast('Nada a disparar: nenhum canal ou destinatário ligado','warn');return}
 const d=new Date(),z=x=>String(x).padStart(2,'0');R21_RES_LOG.unshift({emp:id,txt:`Teste para ${quem} por ${can.join(', ')}`,quando:`${z(d.getDate())}/${z(d.getMonth()+1)} ${z(d.getHours())}:${z(d.getMinutes())}`,por:typeof rc20Quem==='function'?rc20Quem():'Usuário'});
 toast(`Disparo simulado para ${quem} por ${can.join(', ')}. Nada foi enviado de verdade`)}
if(typeof rc19EmpRows==='function'){const _r=rc19EmpRows;rc19EmpRows=function(){return _r.apply(this,arguments).replace(/(<div class="row rc19-ac">)(<button type="button" class="btn sm ghost" onclick="rc19EmpForm\('([^']+)'\)">)/g,(t,a,b,id)=>`${a}<button type="button" class="btn sm ghost" onclick="rc21ResForm('${id}')" title="Liberação de resultados">Resultados</button>${b}`)}}
if(typeof VIEWS!=='undefined'&&typeof VIEWS.empresas==='function'){const _e=VIEWS.empresas;VIEWS.empresas=function(){return _e.apply(this,arguments)+'<p class="tl" style="margin-top:8px">Em Resultados, cada empresa escolhe como libera os resultados para pacientes e médicos: site, WhatsApp, SMS, aplicativo e multifuncional (totem). No protótipo os disparos são simulados.</p>'}}

document.head.insertAdjacentHTML('beforeend',`<style>
/* 665 e 697 */
.rc21-aut-pg{padding:16px 18px}
.rc21-aut-fim{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin-top:6px}
.rc21-aut-v{color:var(--fg2)}
/* 706 */
.rc21-det-g input[readonly]{background:var(--surface2);color:var(--fg);font-weight:600}
/* 705, 707 e 709 */
.rc21-pri{display:inline-flex;align-items:center;gap:6px;margin-left:8px;font-size:13px;font-weight:500;vertical-align:middle}
.rc21-pri small{color:var(--fg2);font-size:12px}
.rc21-fidpac{margin:10px 0 0}
.rc21-pa-lei{margin:0 0 6px}
/* 703 */
.rc21-fid summary{display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;list-style:none}
.rc21-fid summary::-webkit-details-marker{display:none}
.rc21-fid summary h3{margin:0;display:flex;align-items:center;gap:8px}
.rc21-fid summary::after{content:'▾';color:var(--fg2);transition:transform .15s}
.rc21-fid:not([open]) summary::after{transform:rotate(-90deg)}
.rc21-fid[open] summary{margin-bottom:10px}
.rc21-fid-t th{vertical-align:bottom}
.rc21-fid-t td{white-space:nowrap}
.rc21-fid-t td[data-l="Nome"],.rc21-fid-t td[data-l="Nome"] *{white-space:normal;overflow:visible;text-overflow:clip}
.rc21-ord{border:0;background:none;font:inherit;font-weight:700;color:inherit;cursor:pointer;padding:0;display:inline-flex;gap:4px;align-items:center}
.rc21-ord:hover,.rc21-ord:focus-visible{color:var(--accent)}
.rc21-fid-f th{padding-top:4px;padding-bottom:8px;font-weight:400}
.rc21-fid-f .in{width:100%;min-width:120px;height:34px;font-size:13px}
.rc21-fid-tr{cursor:pointer}
.rc21-fid-ac{gap:4px;flex-wrap:nowrap;justify-content:flex-end}
.rc21-pg{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:10px}
.rc21-pg-t{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--fg2)}.rc21-pg-t .in{width:auto;height:32px}
.rc21-pg-b{gap:8px;align-items:center;font-size:13px}
.rc21-ct-g .field{margin:0}
.rc21-ct-g input[readonly]{background:var(--surface2)}
@media(max-width:640px){.rc21-fid-t thead{display:block}.rc21-fid-t thead tr:first-child{display:none}.rc21-fid-t .rc21-fid-f{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:8px 0;border:0}.rc21-fid-f th{display:block;padding:0}.rc21-fid-t td{white-space:normal}}
/* 696 */
.rc21-res h4{margin:12px 0 6px}
.rc21-res-c{display:flex;flex-wrap:wrap;gap:8px 18px}
.rc21-res-i{align-items:flex-start;border:1px solid var(--border);border-radius:10px;padding:8px 10px;flex:1 1 220px}
.rc21-res-i span{display:flex;flex-direction:column}.rc21-res-i small{color:var(--fg2);font-size:12px}
</style>`);
