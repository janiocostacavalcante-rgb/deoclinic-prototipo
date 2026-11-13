/* Rodada 20 (13/11/2026) · financeiro */
/* ==========================================================================
   Notas 632 a 640 (Financeiro), 641 a 654 (Conciliação bancária) e 655 a 662 (Repasse médico).
   Fica depois da rodada 19: só acrescenta funções e embrulha ou redefine as que já existem.
   Nada é apagado de verdade: o que sai da listagem fica na auditoria, com quem, quando e o motivo.
   ========================================================================== */

/* ---------- Peças comuns ---------- */
const fin20G=id=>{try{const e=document.getElementById(id);return e&&e.value!=null?String(e.value):''}catch(e){return ''}};
const fin20Num=s=>{s=String(s==null?'':s).replace(/[^\d,.-]/g,'');if(!s)return NaN;if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');return parseFloat(s)};
const fin20Agora=()=>'04/11 '+hhmm(new Date());
const fin20Aud=(tela,t)=>{if(typeof f2Aud==='function')f2Aud(tela,t)};
const fin20Print=()=>{try{window.print()}catch(e){}};
const fin20Html=(id,h)=>{try{const el=document.getElementById(id);if(el)el.innerHTML=h}catch(e){}};
/* Troca o HTML de um openModal ou openDrawer só durante uma chamada */
function fin20ComModal(fn,tr){const _om=openModal;openModal=function(h,cls){try{h=tr(String(h))}catch(e){}return _om.call(this,h,cls)};try{return fn()}finally{openModal=_om}}
function fin20ComDrawer(fn,tr){const _od=openDrawer;openDrawer=function(t,h){try{h=tr(String(h),t)}catch(e){}return _od.call(this,t,h)};try{return fn()}finally{openDrawer=_od}}
/* Botão "Trilha" passa a se chamar "Auditoria" (notas 643, 645 e 648) */
const fin20Auditoria=h=>String(h).replace(/>Trilha<\/button>/g,'>Auditoria</button>');

/* ==========================================================================
   FINANCEIRO · Visão do mês e listas laterais
   ========================================================================== */

/* ---------- 632 a 635: "Por origem" sem informação passando do quadro nem do gráfico ---------- */
/* Tamanho da letra do centro da rosca conforme o tamanho do texto, para caber no furo do gráfico */
const fin20FsC=t=>Math.max(6.5,Math.min(13,Math.round(56/(Math.max(1,String(t).length)*.6)*10)/10));
const fin20FsS=t=>Math.max(5.5,Math.min(8,Math.round(52/(Math.max(1,String(t).length)*.55)*10)/10));
{const _r=fin19Rosca;fin19Rosca=function(partes,o){let h=_r.apply(this,arguments);o=o||{};
 /* Margem em volta da rosca: a fatia que cresce ao passar o mouse não sai do desenho */
 h=h.replace('viewBox="0 0 128 128"','viewBox="-8 -8 144 144"');
 h=h.replace(/(<text class="fin19-rc-c"[^>]*?)font-size="[\d.]+"/,`$1font-size="${fin20FsC(o.centro||'')}"`).replace(/(<text class="fin19-rc-s"[^>]*?)font-size="[\d.]+"/,`$1font-size="${fin20FsS(o.sub||'')}"`);
 return h}}
{const _h=fin19RcHover;fin19RcHover=function(id,i){_h.apply(this,arguments);try{const el=document.getElementById(id);if(!el||!el.querySelector||!el.dataset)return;const c=el.querySelector('.fin19-rc-c'),s=el.querySelector('.fin19-rc-s');
 if(s&&i>=0){const p=JSON.parse(el.dataset.p||'[]')[i];if(p){const n=String(p[0]);s.textContent=(n.length>14?n.slice(0,13)+'…':n)+' · '+p[2]}}
 if(c&&c.setAttribute)c.setAttribute('font-size',fin20FsC(c.textContent||''));if(s&&s.setAttribute)s.setAttribute('font-size',fin20FsS(s.textContent||''))}catch(e){}}}

/* ---------- 637, 639 e 640: sai o botão "Abrir a aba Entradas/Saídas" da lista lateral ---------- */
{const _l=fin19Lista;fin19Lista=function(t,g){return fin20ComDrawer(()=>_l.apply(this,arguments),h=>h.replace(/<button class="btn sec" onclick="closeDrawer\(\);FN_ABA='[a-z]+';reView\(\)">Abrir a aba [^<]*<\/button>/,'').replace('class="at-list fin19-lista"','class="at-list fin19-lista fin20-lista"'))}}
/* 636 e 638: os blocos da lista lateral ficam organizados dentro do quadro (CSS no fim do arquivo) */

/* ==========================================================================
   CONCILIAÇÃO BANCÁRIA
   ========================================================================== */
const F20_CB={fech:null,sync:0,imp:[]};
const F20_KPI={'Saldo no banco':'saldo','Conciliado sozinho':'conc','Sugestões':'sug','Divergências':'div','Tarifas':'tar','A explicar':'expl'};

/* ---------- Tela: botão Auditoria, cards que abrem detalhe, sincronizar, OFX e fechar o mês ---------- */
{const _v=VIEWS.conciliacao;VIEWS.conciliacao=function(){let h=fin20Auditoria(_v.apply(this,arguments));
 /* 647: cada card abre uma tela com o que ele está mostrando */
 h=h.replace(/<div class="m ([^"]*?)"([^>]*)><div class="lab">([^<]+)<\/div>/g,(m,cls,at,lab)=>{const k=F20_KPI[lab];if(!k)return m;return `<div class="m ${cls.replace(/\bclk\b/g,'').trim()} clk fin20-kpi" onclick="fin20CbKpi('${k}')" role="button" tabindex="0" title="Clique para ver os detalhes"><div class="lab">${lab}</div>`});
 h=h.replace('onclick="cbOFX()"','onclick="fin20OFX()"').replace('onclick="cbSync()"','onclick="fin20Sync()"');
 /* 653/654: fechar o mês faz uma ação clara */
 const f=F20_CB.fech||{h:'04/11',por:FN_USU};
 h=h.replace(/<button class="btn sec" onclick="cbFechar\(\)"([^>]*)>Fechar conciliação de novembro<\/button>/,(m,at)=>CB_FECH['11/2026']?`<button class="btn sec" onclick="fin20CbFechar()">Novembro fechado · ver resumo</button><span class="badge ok">fechado em ${esc(f.h)} por ${esc(f.por)}</span>`:`<button class="btn" onclick="fin20CbFechar()"${at}>Fechar conciliação de novembro</button>`);
 return h}}
cbOFX=function(){return fin20OFX()};cbSync=function(){return fin20Sync()};cbFechar=function(){return fin20CbFechar()};

/* ---------- 641: "automático" centralizado embaixo de "Conciliado"; selo "novo" no que acabou de chegar ---------- */
{const _t=cbExtratoTab;cbExtratoTab=function(){return _t.apply(this,arguments).replace(/<td data-l="Situação">([\s\S]*?)<\/td>/g,'<td data-l="Situação" class="fin20-sitc"><span class="fin20-sit">$1</span></td>')
 .replace(/(onclick="cbLinha\('([\w-]+)'\)"[^>]*>[\s\S]*?<span class="two"><b>)/g,(m,a,id)=>{const e=F2_E(id);return e&&e.novo?a+'<span class="badge info fin20-novo">novo</span> ':a})}}

/* ---------- 643/645: Auditoria na gaveta do lançamento; sugestão ganha botão para conciliar direto ---------- */
{const _c=cbLinha;cbLinha=function(id){const e=F2_E(id);return fin20ComDrawer(()=>_c.apply(this,arguments),h=>{h=fin20Auditoria(h);
 if(e&&e.st==='sug'&&e.tit)h=h.replace(/(<div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap">)(<button class="btn ghost" onclick="f2Trilha)/,`$1<button class="btn" onclick="closeDrawer();cbConciliar('${e.id}')">Conciliar com ${e.tit}</button>$2`);return h})}}

/* ---------- 644: aviso das glosas do lote ganha botão que leva até as glosas ---------- */
{const _d=cbDivergencia;cbDivergencia=function(id){const e=F2_E(id),t=e&&e.tit&&F2_TT(e.tit);const lote=t?((/Lote ([A-Z]{3}-\d{4}-\d{2})/.exec(t.ref)||[])[1]||''):'';
 return fin20ComModal(()=>_d.apply(this,arguments),h=>lote?h.replace(/(O demonstrativo do lote já trouxe as glosas que explicam a diferença\.[\s\S]*?<\/span>)(<\/div>)/,`$1<button class="btn sm sec fin20-glbtn" onclick="fin20IrGlosas('${lote}')">Ver as glosas do lote ${lote}</button>$2`):h)}}
function fin20IrGlosas(l){try{closeModal();closeDrawer()}catch(e){}const x=typeof glLote==='function'?glLote(l):null;GL_ABA='glosas';GL_CONV=x?x.c:'';
 if((location.hash||'')==='#glosas')reView();else location.hash='glosas';
 setTimeout(()=>{try{if(x)glLoteDet(l)}catch(e){}},300)}

/* ---------- Linha de lançamento usada nas telas de detalhe ---------- */
function fin20CbRow(e,banco){const [sl,sc]=CB_ST[e.st];const bn=banco?' · '+F2_BANCOS.find(b=>b.id===e.b).n.split(' · ')[0]:'';
 return `<div class="at-row clk fin20-cbrow" onclick="fin20CbIr('${e.id}')" role="button" tabindex="0" title="Clique para ir até o lançamento e resolver"><div class="grow"><b>${esc(e.desc)}</b><small>${e.d} · ${esc(e.tipo)}${e.tit?' · título '+e.tit:''}${e.dt?' · '+esc(e.dt):''}${bn}</small></div><b class="fin20-v">${f2v(e.v)}</b><span class="badge ${sc}">${sl}</span>${e.st!=='conc'?'<span class="fin20-ir">resolver ›</span>':''}</div>`}
const fin20CbLista=a=>`<div class="at-list fin20-cblista">${a.length?a.map(e=>fin20CbRow(e)).join(''):'<div class="empty" style="padding:16px"><h4>Nada aqui</h4></div>'}</div>`;

/* ---------- 646: clicar no lançamento leva direto até ele para ajustar ---------- */
function fin20CbIr(id){const e=F2_E(id);if(!e)return;try{closeDrawer();closeModal()}catch(x){}CB_BANCO=e.b;CB_ABA='extrato';CB_FILTRO='';CB_Q='';
 if((location.hash||'')!=='#conciliacao')location.hash='conciliacao';else reView();
 if(e.st==='div')cbDivergencia(id);else if(e.st==='tar')cbTarifa(id);else cbLinha(id)}

/* ---------- 647: tela de detalhe de cada card ---------- */
function fin20CbKpi(k){const b=cbBanco(),l=cbLinhas();
 if(k==='saldo'){const ent=l.filter(e=>e.v>0).reduce((s,e)=>s+e.v,0),sai=l.filter(e=>e.v<0).reduce((s,e)=>s+e.v,0),api=String(b.modo).startsWith('API');
  openDrawer('Saldo no banco · '+esc(b.n.split(' · ')[0]),`${kvs([['Saldo agora',`<b>${fmt(b.saldo)}</b>`],['Conta',esc(b.n)],['Unidade',esc(unidNome(b.u))],['Como chega o extrato',esc(b.modo)],['Última leitura',esc(b.sync)],['Entradas no extrato',f2v(ent)],['Saídas no extrato',f2v(sai)],['Lançamentos lidos',String(l.length)]])}
  <h4 style="margin-top:12px">Lançamentos desta conta</h4><p class="tl" style="margin-bottom:6px">Clique num lançamento para abrir.</p>${fin20CbLista(l)}
  <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap">${api?'<button class="btn" onclick="closeDrawer();fin20Sync()">Sincronizar agora</button>':'<button class="btn" onclick="closeDrawer();fin20OFX()">Importar OFX</button>'}</div>`);return}
 const sel={conc:['Conciliado sozinho',l.filter(e=>e.st==='conc'),'conc','Lançamentos que já casaram com um título. "automático": o sistema casou sozinho pelo identificador; "manual": alguém confirmou.'],
  sug:['Sugestões para confirmar',l.filter(e=>e.st==='sug'),'sug','O sistema achou um título parecido, mas precisa que alguém confirme. Abra e clique em Conciliar ou case com outro título.'],
  div:['Divergências',l.filter(e=>e.st==='div'),'div','Pagou a menor, a maior, em dobro ou sem título. Cada uma pede um destino e um motivo.'],
  tar:['Tarifas a classificar',l.filter(e=>e.st==='tar'),'tar','Tarifas do banco que ainda não foram lançadas em 4.10. As que vieram acima do contrato podem ser contestadas.'],
  expl:['A explicar · banco × sistema',l.filter(e=>e.st!=='conc'),'','Tudo o que ainda não foi conciliado nesta conta. A soma é a diferença entre o extrato do banco e o sistema.']}[k];
 if(!sel)return;const [tit,a,f,txt]=sel,tot=a.reduce((s,e)=>s+e.v,0),ok=a.length&&k!=='conc';
 openDrawer(tit+' · '+esc(b.n.split(' · ')[0]),`<p class="tl" style="margin-bottom:10px">${txt}</p>${kvs([['Lançamentos',String(a.length)],['Soma',f2v(tot)],['Conta',esc(b.n)]])}
 <p class="tl" style="margin:10px 0 6px">${ok?'Clique num lançamento para ir direto até ele e resolver.':'Clique num lançamento para abrir.'}</p>${fin20CbLista(a)}
 <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap"><button class="btn sec" onclick="closeDrawer();CB_ABA='extrato';CB_FILTRO='${f}';reView()">${f?'Mostrar só estes no extrato':'Mostrar o extrato inteiro'}</button></div>`)}

/* ---------- 651: sincronizar com barra de progresso, aviso e resumo do que mudou ---------- */
function fin20Sync(){const b=cbBanco();if(!String(b.modo).startsWith('API')){toast('Esta conta chega por arquivo OFX: escolha o arquivo do banco para importar','warn');fin20OFX();return}
 openModal(`${mh('Sincronizando com o banco')}<div class="mb"><p style="font-size:14px"><b>${esc(b.n)}</b> · última leitura ${esc(b.sync)}</p><div class="fin20-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso da sincronização"><i id="fin20SyncBar" style="width:6%"></i></div><p class="tl" id="fin20SyncTxt" style="margin-top:8px">Conectando ao banco</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Continuar em segundo plano</button></div>`);
 const passos=[[30,'Lendo o extrato desde '+String(b.sync).replace('hoje ','')],[60,'Comparando com o que já foi importado (nada entra duas vezes)'],[85,'Casando os lançamentos novos com os títulos'],[100,'Concluído']];
 passos.forEach(([p,t],i)=>setTimeout(()=>{try{const el=document.getElementById('fin20SyncBar'),tx=document.getElementById('fin20SyncTxt');if(el&&el.style)el.style.width=p+'%';if(tx)tx.textContent=t}catch(e){}if(p===100)setTimeout(fin20SyncFim,350)},450*(i+1)))}
function fin20SyncFim(){const b=cbBanco();const antes={saldo:b.saldo,sync:b.sync};const novos=[];
 if(b.id==='inter'&&!F20_CB.sync){
  if(!F2_TT('R-2215'))F2_TIT.push({id:'R-2215',t:'receber',q:'Joana Darc Pereira',ref:'Consulta · link de pagamento enviado 03/11',v:200,venc:'04/11',u:10,orig:'atendimento'});
  novos.push({id:'sy1',b:'inter',d:'04/11',desc:'PIX RECEBIDO · JOANA DARC PEREIRA',ident:'E18236120202611041012JD',tipo:'Pix',v:200,st:'conc',modo:'automático',conf:100,tit:'R-2215',crit:'identificador do Pix = cobrança do atendimento',novo:true},
   {id:'sy2',b:'inter',d:'04/11',desc:'TED RECEBIDA · HAPVIDA ASSISTENCIA MEDICA',ident:'TED 237.0091.5521',tipo:'TED',v:18070.64,st:'sug',conf:92,tit:'R-2190',crit:'CNPJ da operadora + lote HAP-2026-09 no histórico',novo:true},
   {id:'sy3',b:'inter',d:'04/11',desc:'TARIFA TED RECEBIDA',ident:'tarifa TED 237.0091.5521',tipo:'Tarifa',v:-2.5,st:'tar',conf:0,contrato:2.5,crit:'contrato: R$ 2,50 por TED recebida',novo:true})}
 F20_CB.sync++;
 novos.forEach(e=>{F2_EXT.unshift(e);b.saldo=Math.round((b.saldo+e.v)*100)/100});
 b.sync='hoje '+hhmm(new Date());
 const n=k=>novos.filter(e=>e.st===k).length;
 fin20Aud('Conciliação bancária',`Sincronização manual com a API do banco: ${novos.length?novos.length+' lançamento(s) novo(s), '+n('conc')+' conciliado(s) sozinho(s), '+n('sug')+' sugestão(ões), '+n('tar')+' tarifa(s)':'nenhum lançamento novo'}`);
 try{closeModal()}catch(e){}reView();
 toast(novos.length?`Sincronização concluída: ${novos.length} lançamento(s) novo(s). Veja o que mudou.`:'Sincronização concluída: nada mudou no banco desde a última leitura');
 openModal(`${mh('Sincronização concluída')}<div class="mb"><div class="alert ok fin20-alert"><span><b>${esc(b.n)}</b> sincronizado às ${esc(b.sync.replace('hoje ',''))}.</span></div>
 ${kvs([['Lançamentos novos',String(novos.length)],['Conciliados sozinhos',String(n('conc'))],['Sugestões para confirmar',String(n('sug'))],['Tarifas a classificar',String(n('tar'))],['Saldo',antes.saldo===b.saldo?fmt(b.saldo)+' (não mudou)':`${fmt(antes.saldo)} → <b>${fmt(b.saldo)}</b>`],['Última leitura',`${esc(antes.sync)} → ${esc(b.sync)}`]])}
 ${novos.length?`<h4 style="margin-top:12px">O que mudou</h4>${fin20CbLista(novos)}<p class="tl" style="margin-top:6px">Os novos aparecem no extrato com o selo "novo".</p>`:'<p class="tl" style="margin-top:10px">Nenhum lançamento novo no banco. O sistema continua lendo sozinho a cada 15 minutos.</p>'}</div>
 <div class="mf"><button class="btn" onclick="closeModal()">Entendi</button></div>`);return novos}

/* ---------- 649/650: importar OFX com escolha de arquivo de verdade e prévia antes de confirmar ---------- */
let F20_OFX=null,F20_OFX_TXT='',F20_OFX_NOME='';
const F20_OFX_EX=`OFXHEADER:100
DATA:OFXSGML
VERSION:102
CHARSET:1252
<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><CURDEF>BRL
<BANKACCTFROM><BANKID>0237<BRANCHID>1234<ACCTID>44556-7</BANKACCTFROM>
<BANKTRANLIST><DTSTART>20261101<DTEND>20261104
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20261104073300[-3:BRT]<TRNAMT>45.00<FITID>E60701190202611040733MV<MEMO>PIX RECEBIDO MARCOS V ROCHA</STMTTRN>
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20261104113000[-3:BRT]<TRNAMT>35.00<FITID>BR20261104A1<MEMO>PIX RECEBIDO RAIMUNDO NONATO</STMTTRN>
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20261104140000[-3:BRT]<TRNAMT>980.00<FITID>BR20261104A2<MEMO>DEPOSITO EM DINHEIRO AG 1234</STMTTRN>
<STMTTRN><TRNTYPE>FEE<DTPOSTED>20261104<TRNAMT>-12.90<FITID>BR20261104T1<MEMO>TARIFA PIX ENVIADO</STMTTRN>
<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20261030<TRNAMT>-59.90<FITID>BR20261030T9<MEMO>TARIFA MANUTENCAO DE CONTA</STMTTRN>
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20261104<TRNAMT>abc<FITID>BR20261104A3<MEMO>TED RECEBIDA CONSTRUTORA MAR AZUL</STMTTRN>
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED><TRNAMT>210.00<FITID>BR20261104A4<MEMO>PIX RECEBIDO</STMTTRN>
</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>`;
function fin20OFX(){F20_OFX=null;F20_OFX_TXT='';F20_OFX_NOME='';const pad=String(cbBanco().modo).startsWith('API')?'brad':CB_BANCO;
 openModal(`${mh('Importar extrato OFX')}<div class="mb"><div class="field"><label for="fin20OfxConta">Conta</label><select class="in" id="fin20OfxConta" onchange="fin20OfxReanalisa()">${F2_BANCOS.map(b=>`<option value="${b.id}" ${b.id===pad?'selected':''}>${esc(b.n)} · ${esc(unidNome(b.u))}</option>`).join('')}</select></div>
 <input type="file" id="fin20OfxArq" class="fin20-file" accept=".ofx,.qfx,.txt" onchange="fin20OfxArquivo(this)" aria-label="Escolher o arquivo OFX">
 <label for="fin20OfxArq" class="fin20-drop" id="fin20OfxDrop" ondragover="event.preventDefault();this.classList.add('on')" ondragleave="this.classList.remove('on')" ondrop="fin20OfxDrop(event)"><b>Arraste o arquivo .ofx aqui</b><span>ou clique para escolher no computador</span><span class="btn sec sm">Escolher arquivo</span><small id="fin20OfxNome"></small></label>
 <p class="tl" style="margin-top:6px">Não tem um OFX à mão? <a href="#" onclick="event.preventDefault();fin20OfxExemplo()">Usar um arquivo de exemplo</a>.</p>
 <div id="fin20OfxPrev"></div>
 <p class="tl" style="margin-top:8px">Antes de gravar, mostramos o que deu certo e o que deu errado. Lançamento que já entrou (mesmo FITID) é ignorado. Período fechado não recebe lançamento novo.</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" id="fin20OfxOk" onclick="fin20OfxConfirmar()">Importar</button></div>`,'wide')}
function fin20OfxArquivo(inp){const f=inp&&inp.files&&inp.files[0];fin20OfxLerArq(f)}
function fin20OfxDrop(ev){try{ev.preventDefault();if(ev.currentTarget&&ev.currentTarget.classList)ev.currentTarget.classList.remove('on');fin20OfxLerArq(ev.dataTransfer&&ev.dataTransfer.files&&ev.dataTransfer.files[0])}catch(e){}}
function fin20OfxLerArq(f){if(!f)return;if(!/\.(ofx|qfx|txt)$/i.test(f.name||'')){toast('Escolha um arquivo .ofx (o extrato que o banco exporta)','warn');fin20Html('fin20OfxPrev',`<div class="alert err fin20-alert"><span>O arquivo "${esc(f.name||'')}" não é um .ofx.</span></div>`);return}
 try{const r=new FileReader();r.onload=()=>fin20OfxPrevia(String(r.result||''),f.name);r.onerror=()=>toast('Não foi possível ler o arquivo','warn');r.readAsText(f,'ISO-8859-1')}catch(e){toast('Não foi possível ler o arquivo neste navegador','warn')}}
function fin20OfxExemplo(){return fin20OfxPrevia(F20_OFX_EX,'extrato-exemplo-bradesco.ofx')}
function fin20OfxReanalisa(){if(F20_OFX_TXT)fin20OfxPrevia(F20_OFX_TXT,F20_OFX_NOME)}
function fin20OfxPrevia(txt,nome){F20_OFX_TXT=txt;F20_OFX_NOME=nome;const conta=fin20G('fin20OfxConta')||'brad';F20_OFX=fin20OfxAnalisa(txt,F2_BANCOS.some(b=>b.id===conta)?conta:'brad');F20_OFX.nome=nome;
 fin20Html('fin20OfxNome','Arquivo: '+esc(nome));fin20Html('fin20OfxPrev',fin20OfxPrevHtml(F20_OFX));
 const ok=F20_OFX.itens.filter(x=>x.st==='ok').length;try{const bt=document.getElementById('fin20OfxOk');if(bt){bt.textContent=ok?`Importar os ${ok} que deram certo`:'Nada para importar';if(bt.classList)bt.classList.toggle('fin20-off',!ok)}}catch(e){}return F20_OFX}
/* Lê o OFX (formato SGML dos bancos): cada <STMTTRN> é um lançamento */
function fin20OfxAnalisa(txt,conta){const s=String(txt||''),r={conta,itens:[],aviso:'',contaAviso:''};
 if(!/<OFX>/i.test(s)&&!/<STMTTRN>/i.test(s)){r.aviso='Este arquivo não parece um extrato OFX (não tem as marcas OFX e STMTTRN). Peça ao banco o extrato no formato OFX.';return r}
 const tag=(b,t)=>{const m=new RegExp('<'+t+'>([^<\\r\\n]*)','i').exec(b);return m?m[1].trim():''};
 const acc=tag(s,'ACCTID').replace(/\D/g,''),bk=F2_BANCOS.find(b=>b.id===conta),bd=bk?((/c\/c ([\d-]+)/.exec(bk.n)||[])[1]||'').replace(/\D/g,''):'';
 if(acc&&bd&&acc!==bd)r.contaAviso=`O arquivo diz ser da conta ${tag(s,'ACCTID')}, mas a conta escolhida é ${bk.n}. Confira antes de importar.`;
 const vistos=new Set();
 s.split(/<STMTTRN>/i).slice(1).map(x=>x.split(/<\/STMTTRN>/i)[0]).forEach((bl,i)=>{const fit=tag(bl,'FITID'),dt=tag(bl,'DTPOSTED'),amt=tag(bl,'TRNAMT'),memo=tag(bl,'MEMO')||tag(bl,'NAME')||'(sem descrição)',typ=tag(bl,'TRNTYPE').toUpperCase();
  const it={n:i+1,fit,memo,typ,v:null,d:'',st:'ok',det:''},v=parseFloat(amt.replace(',','.')),m=/^(\d{4})(\d{2})(\d{2})/.exec(dt);
  if(!fit){it.st='erro';it.det='sem identificador (FITID): não dá para garantir que não entra duas vezes'}
  else if(!m){it.st='erro';it.det='data inválida ou ausente ('+(dt||'vazia')+')'}
  else if(!amt||!/^-?\d+([.,]\d+)?$/.test(amt)||isNaN(v)){it.st='erro';it.det='valor inválido ('+(amt||'vazio')+')'}
  else{it.v=Math.round(v*100)/100;it.d=m[3]+'/'+m[2];const per=m[2]+'/'+m[1];
   if(CB_FECH[per]){it.st='erro';it.det='data em '+per+', mês já fechado: período fechado não recebe lançamento novo'}
   else if(F2_EXT.some(e=>e.ident===fit)||vistos.has(fit)){it.st='dup';it.det='já importado antes (mesmo FITID): ignorado, nada duplicado'}
   else it.det='entra como lançamento novo'}
  if(fit)vistos.add(fit);r.itens.push(it)});
 if(!r.itens.length)r.aviso='O arquivo não tem nenhum lançamento.';
 return r}
function fin20OfxPrevHtml(r){if(!r)return '';if(r.aviso)return `<div class="alert err fin20-alert"><span>${esc(r.aviso)}</span></div>`;
 const ok=r.itens.filter(x=>x.st==='ok'),dup=r.itens.filter(x=>x.st==='dup'),er=r.itens.filter(x=>x.st==='erro');
 const tab=l=>tabela(['Linha','Data','Descrição','Valor','Resultado'],l.map(x=>`<tr data-det="0">${td('Linha',String(x.n))}${td('Data',x.d||'sem data')}${td('Descrição',esc(x.memo))}${td('Valor',x.v==null?'sem valor':f2v(x.v))}${td('Resultado',`<b class="fin20-st-${x.st}">${x.st==='ok'?'deu certo':x.st==='dup'?'já existia':'deu errado'}</b><small class="tl" style="display:block">${esc(x.det)}</small>`)}</tr>`));
 return `<div class="fin20-ofx-res">${r.contaAviso?`<div class="alert warn fin20-alert"><span>${esc(r.contaAviso)}</span></div>`:''}<div class="mini">${miniKpi('Deram certo',ok.length,'vão entrar','ok')}${miniKpi('Já existiam',dup.length,'ignorados pelo FITID')}${miniKpi('Deram errado',er.length,'não entram',er.length?'err':'')}</div>
 ${ok.length?`<h4 class="fin20-h-ok">Deram certo (${ok.length})</h4>${tab(ok)}`:''}
 ${er.length?`<h4 class="fin20-h-er">Deram errado (${er.length})</h4><p class="tl">O que deu errado em cada linha. Essas linhas não entram: corrija com o banco ou peça um arquivo novo.</p>${tab(er)}<button class="btn sm ghost" style="margin-top:6px" onclick="fin20OfxErrosCsv()">${I.dl} Baixar a lista dos erros (Excel)</button>`:''}
 ${dup.length?`<h4>Já existiam (${dup.length})</h4>${tab(dup)}`:''}</div>`}
function fin20OfxErrosCsv(){const r=F20_OFX;if(!r)return;const er=r.itens.filter(x=>x.st==='erro');if(typeof r17Baixar==='function')r17Baixar('erros-ofx.csv',r17Csv([['Linha','FITID','Data','Descrição','Valor','O que deu errado'],...er.map(x=>[x.n,x.fit,x.d,x.memo,x.v==null?'':r17N(x.v),x.det])]));toast('Lista dos erros baixada: erros-ofx.csv')}
function fin20OfxConfirmar(){const r=F20_OFX;if(!r){toast('Escolha o arquivo .ofx primeiro: clique na caixa ou arraste o arquivo','warn');return}if(r.aviso){toast(r.aviso,'warn');return}
 const ok=r.itens.filter(x=>x.st==='ok');if(!ok.length){toast('Nenhuma linha deu certo para importar. Veja na lista o que deu errado.','warn');return}
 const b=F2_BANCOS.find(x=>x.id===r.conta)||cbBanco(),novos=fin20OfxGravar(r,b),dup=r.itens.filter(x=>x.st==='dup').length,er=r.itens.filter(x=>x.st==='erro').length,n=k=>novos.filter(e=>e.st===k).length;
 F20_OFX=null;try{closeModal()}catch(e){}CB_BANCO=b.id;CB_ABA='extrato';CB_FILTRO='';reView();
 retorno('ok','Extrato importado',`${novos.length} lançamento(s) entraram em ${esc(b.n)}: ${n('sug')} sugestão(ões) para confirmar, ${n('div')} para resolver e ${n('tar')} tarifa(s) a classificar. ${dup} já existia(m) e foi(foram) ignorado(s). ${er} linha(s) com erro não entrou(entraram). Os novos aparecem no extrato com o selo "novo".`,[{l:'Ver o extrato'}]);return novos}
function fin20OfxGravar(r,b){const novos=[],seq=F20_CB.imp.length+1;r.itens.filter(x=>x.st==='ok').forEach((x,k)=>{const tar=/TARIFA|TAXA|CESTA/i.test(x.memo)||x.typ==='FEE'||x.typ==='SRVCHG';
 const e={id:'of'+seq+'_'+k,b:b.id,d:x.d,desc:x.memo.toUpperCase(),ident:x.fit,tipo:tar?'Tarifa':/PIX/i.test(x.memo)?'Pix':/TED|DOC/i.test(x.memo)?'TED':/DEP/i.test(x.memo)?'Depósito':/BOLETO/i.test(x.memo)?'Boleto':'Outro',v:x.v,st:'div',dt:'sem título',conf:0,crit:'importado do OFX '+(r.nome||''),novo:true};
 if(tar){e.st='tar';e.contrato=Math.abs(x.v);delete e.dt}
 else{const c=cbCandidatos(e);if(c.length&&c[0].s>=70){e.st='sug';e.tit=c[0].t.id;e.conf=c[0].s;delete e.dt;e.crit='valor e nome parecidos com '+c[0].t.id+' (importado do OFX)'}}
 F2_EXT.push(e);b.saldo=Math.round((b.saldo+x.v)*100)/100;novos.push(e)});
 b.sync=fin20Agora();const dup=r.itens.filter(x=>x.st==='dup').length,er=r.itens.filter(x=>x.st==='erro').length;
 F20_CB.imp.push({nome:r.nome||'',conta:b.id,h:fin20Agora(),por:FN_USU,ok:novos.length,dup,er});
 fin20Aud('Conciliação bancária',`OFX "${r.nome||'arquivo'}" importado em ${b.n}: ${novos.length} entraram, ${dup} já existiam (ignorados pelo FITID), ${er} com erro não entraram`);return novos}

/* ---------- 653/654 e 646: fechar a conciliação do mês ---------- */
function fin20CbFechar(){const p=F2_EXT.filter(e=>e.st!=='conc'),tot=F2_EXT.length;
 if(CB_FECH['11/2026']){const f=F20_CB.fech||{h:'04/11',por:'sem registro'};
  openDrawer('Conciliação de novembro · fechada',`${kvs([['Situação','<span class="badge ok">fechada</span>'],['Fechada em',esc(f.h)],['Por',esc(f.por)],['Lançamentos conciliados',String(tot-p.length)+' de '+tot]])}<div class="alert info fin20-alert" style="margin-top:10px"><span>Mês fechado não muda. Desfazer uma conciliação agora só com o Administrador e motivo; correção vira ajuste no mês aberto.</span></div><div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap"><button class="btn sec" onclick="fin20CbReabrir()">Reabrir novembro (Administrador)</button><button class="btn ghost" onclick="f2Trilha('Conciliação bancária')">Auditoria</button></div>`);return}
 if(p.length){const pct=Math.round((tot-p.length)/tot*100);toast(`Ainda faltam ${p.length} lançamento(s) para fechar novembro`,'warn');
  openDrawer('Fechar conciliação de novembro',`<div class="alert warn fin20-alert"><span>Ainda não dá para fechar: faltam <b>${p.length} lançamento(s)</b> sem conciliar nas ${F2_BANCOS.length} contas. <b>Clique em cada um</b> para ir direto até ele, ajustar e conciliar.</span></div>
  <div class="fin20-bar" style="margin:10px 0 4px" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><p class="tl">${tot-p.length} de ${tot} lançamentos conciliados (${pct}%)</p>
  <div class="at-list fin20-cblista" style="margin-top:8px">${p.map(e=>fin20CbRow(e,true)).join('')}</div>
  <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap"><button class="btn" onclick="fin20CbIr('${p[0].id}')">Resolver o primeiro</button></div>`);return}
 modalOk('Fechar conciliação de novembro',`${kvs([['Contas',F2_BANCOS.map(b=>esc(b.n.split(' · ')[0])).join(' e ')],['Lançamentos conciliados',tot+' de '+tot],['Fechado por',esc(FN_USU)]])}<div class="alert info fin20-alert" style="margin-top:10px"><span>Depois de fechado, o mês trava: desfazer uma conciliação só com o Administrador e motivo.</span></div>`,'Fechar novembro','fin20CbFecharOk()')}
function fin20CbFecharOk(){const p=F2_EXT.filter(e=>e.st!=='conc');if(p.length){toast(`Ainda faltam ${p.length} lançamento(s)`,'warn');fin20CbFechar();return}
 CB_FECH['11/2026']=true;F20_CB.fech={h:fin20Agora(),por:FN_USU};fin20Aud('Conciliação bancária',`Conciliação de novembro fechada (${F2_EXT.length} lançamentos nas ${F2_BANCOS.length} contas)`);reView();
 retorno('ok','Novembro fechado',`Conciliação de novembro fechada às ${F20_CB.fech.h.slice(6)} por ${esc(FN_USU)}. A partir de agora, nada muda sem o Administrador.`)}
function fin20CbReabrir(){if(!f2Admin()){toast('Só o Administrador reabre um mês fechado, com motivo. Para testar, escolha "Jânio · Administrador" em Testar como.','warn');return}
 f2Motivo('Reabrir novembro','A conciliação de novembro volta a aceitar mudanças. Fica na auditoria com o seu nome.',m=>{delete CB_FECH['11/2026'];F20_CB.fech=null;fin20Aud('Conciliação bancária','Conciliação de novembro reaberta. Motivo: '+m);try{closeDrawer()}catch(e){}reView();toast('Novembro reaberto e registrado na auditoria','warn')},'Reabrir','warn')}

/* ==========================================================================
   REPASSE MÉDICO
   ========================================================================== */
/* Botão Auditoria também nas outras telas do financeiro completo (mesmo nome em todas) */
['repasse','glosas','custos-procedimento'].forEach(k=>{const _v=VIEWS[k];if(typeof _v==='function')VIEWS[k]=function(){return fin20Auditoria(_v.apply(this,arguments))}});

/* ---------- 655: filtros de período e unidade funcionando no extrato ---------- */
const F20_RP_UNID={p1:10,p2:10,p3:14,p4:12,t1:10,te1:10,pr1:12}; // unidade onde cada um atende (dados de exemplo)
const fin20RpUnid=x=>x.u||F20_RP_UNID[x.b]||10;
const fin20RpIso=x=>{const m=/^(\d{2})\/(\d{2})$/.exec(x&&x.d||'');return m?'2026-'+m[2]+'-'+m[1]:''};
const fin20RpPassa=x=>{const u=filtroDe('rp','unidade');if(u&&String(fin20RpUnid(x))!==String(u))return false;return perDentro('rp',fin20RpIso(x),'mes')};
const fin20RpPerTxt=()=>{const s=PERIODO.rp;if(!s||s.k==='mes')return 'out/2026';return periodoTexto('rp')};

/* Ajuste aprovado passa a valer no cálculo (657) */
{const _c=rpLinhaCalc;rpLinhaCalc=function(x){const r=_c.apply(this,arguments);if(x&&x.ajOk!=null)return Object.assign({},r,{val:x.ajOk});return r}}

rpExtrato=function(){if(!PERIODO.rp)PERIODO.rp={k:'mes',de:'2026-10-01',ate:'2026-10-29'};
 const b=F2_B(RP_BEN),todos=rpItens(RP_BEN),l=todos.filter(fin20RpPassa),calc=l.map(x=>({x,...rpLinhaCalc(x)})),lib=todos.filter(x=>x.st==='liberado'&&!x.fech),fechado=todos.some(x=>x.fech);
 const tot=k=>calc.reduce((s,c)=>s+c[k],0),bruto=l.reduce((s,x)=>s+x.v,0),glo=tot('desc'),aPagar=calc.filter(c=>c.x.st==='liberado'&&!c.x.fech).reduce((s,c)=>s+c.val,0),prev=calc.filter(c=>c.x.st!=='liberado').reduce((s,c)=>s+c.cheio,0);
 const per=fin20RpPerTxt(),u=filtroDe('rp','unidade'),filtrado=l.length!==todos.length||!!u;
 const ajP=F20_AJ.map((a,k)=>[a,k]).filter(([a])=>a.st==='Aguardando aprovação'&&F2_PROD[a.i]&&F2_PROD[a.i].b===RP_BEN);
 const sit=c=>{const a=c.x.aj!=null?F20_AJ[c.x.aj]:null;const base=c.x.fech?`<span class="badge ok">${c.x.fech}</span> <span class="f2-lock">travado</span>`:c.x.st==='liberado'?'<span class="badge ok">liberado</span>':c.x.st==='recurso'?'<span class="badge acc">glosa em recurso</span>':'<span class="badge warn">aguarda convênio</span>';
  return base+(a&&a.st==='Aguardando aprovação'?`<button class="badge warn fin20-ajb" onclick="event.stopPropagation();fin20AjVer(${c.x.aj})">ajuste em aprovação</button>`:a&&a.st==='Aprovado'?`<small class="tl" style="display:block">ajustado de ${fmt(a.de)} para ${fmt(a.para)}${c.x.fech&&c.x.ajProx!=null?' (entra no próximo fechamento)':''}</small>`:'')};
 const rep=c=>{const a=c.x.aj!=null?F20_AJ[c.x.aj]:null;return `<b>${fmt(c.x.st==='previsto'?c.cheio:c.val)}</b>${a&&a.st==='Aguardando aprovação'?`<small class="tl" style="display:block">proposto ${fmt(a.para)}</small>`:''}`};
 return `<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">${F2_BEN.map(x=>chip(`${x.n.split(' ').slice(0,3).join(' ')} · ${x.papel.toLowerCase()}`,RP_BEN===x.id,`RP_BEN='${x.id}';reView()`)).join('')}</div>
 ${filtroBarra({id:'rp',periodo:true,padrao:'mes',unidade:true,onchange:'reView()'})}
 <div class="fin19-fsum fin20-rpsum ${filtrado?'on':''}"><span>Mostrando: <b>${l.length} de ${todos.length} atendimento(s)</b> · ${esc(per)} · ${u?esc(unidNome(+u)):'todas as unidades'}</span>${filtrado?`<button class="btn sm ghost" onclick="fin20RpLimpar()">Limpar filtros</button>`:''}</div>
 <div class="mini">${miniKpi('Produção',fmt(bruto),l.length+' atendimento(s) · '+esc(per))}${miniKpi('Repasse cheio',fmt(tot('cheio')),'pela regra vigente')}${miniKpi('Glosa descontada','− '+fmt(glo),calc.filter(c=>c.desc>0).length+' item(ns)',glo?'err':'')}${miniKpi('Aguardando o convênio',fmt(prev),'só libera quando receber','warn')}${miniKpi('Liberado para fechar',fmt(aPagar),calc.filter(c=>c.x.st==='liberado'&&!c.x.fech).length+' item(ns) no filtro','ok')}</div>
 ${ajP.length?`<div class="alert warn fin20-alert" style="margin-top:12px"><span><b>${ajP.length} ajuste(s) aguardando aprovação</b> de outra pessoa do financeiro: ${ajP.map(([a,k])=>`<a href="#" onclick="event.preventDefault();fin20AjVer(${k})">${esc(F2_PROD[a.i].pac)} (${fmt(a.de)} → ${fmt(a.para)})</a>`).join(' · ')}.</span></div>`:''}
 <div class="card at-card" style="margin-top:12px"><h3>${esc(b.n)} · ${b.papel} ${info('Cada linha mostra a regra aplicada, a base e o valor, calculados no servidor. Mudar um valor só com ajuste, motivo e aprovação de outra pessoa.')}</h3><p class="tl" style="margin:-4px 0 8px">${esc(b.doc)} · pagamento: ${esc(b.pag)}${b.split?' · <b>split ligado</b> (parte do particular já sai paga no Pix/cartão)':''}</p>
 ${tabela(['Data','Paciente','Procedimento','Convênio','Valor','Regra','Glosa','Repasse','Situação'],calc.map(c=>`<tr class="clk" onclick="rpItem(${c.x.i})">${td('Data',c.x.d)}${td('Paciente',esc(c.x.pac))}${td('Procedimento',PROC(c.x.proc).n)}${td('Convênio',c.x.conv)}${td('Valor',fmt(c.x.v))}${td('Regra',`<span class="tl">${rpRegraTxt(c.r)}</span>`)}${td('Glosa',c.desc?`<span class="f2-menos" title="${esc(c.x.glr||'')}">− ${fmt(c.desc)}</span>`:'<span class="tl">nenhuma</span>')}${td('Repasse',rep(c))}${td('Situação',sit(c))}</tr>`),'Nenhum atendimento com estes filtros. Troque o período ou a unidade.')}
 <div class="row" style="margin-top:12px;gap:8px;flex-wrap:wrap"><button class="btn" ${lib.length?'':'aria-disabled="true"'} onclick="${lib.length?`rpFechar('${RP_BEN}')`:`toast('Nada liberado para fechar neste período','warn')`}" ${tipAttr('Fechar extrato','Junta todos os itens liberados de outubro (não só os do filtro) num fechamento; ele vai para aprovação de outra pessoa e depois vira conta a pagar. Os itens ficam travados.')}>Fechar extrato de outubro</button><button class="btn sec" onclick="rpExtratoDoc('${RP_BEN}')">${I.print} Extrato para o profissional</button>${fechado?'<span class="tl">Itens fechados estão travados: correção vira ajuste no próximo fechamento, com motivo.</span>':''}</div>
 <p class="tl" style="margin-top:6px">O fechamento sempre junta o mês inteiro de outubro (${lib.length} item(ns) liberado(s)), não só o que o filtro mostra.</p></div>`};
function fin20RpLimpar(){FILTROS.rp={};PERIODO.rp={k:'mes',de:'2026-10-01',ate:'2026-10-29'};reView()}

/* ---------- 656: extrato para o profissional abre de verdade ---------- */
rpExtratoDoc=function(bid){const b=F2_B(bid);if(!b)return;const l=rpItens(bid).filter(fin20RpPassa),calc=l.map(x=>({x,...rpLinhaCalc(x)})),per=fin20RpPerTxt();
 const lib=calc.filter(c=>c.x.st==='liberado'),prev=calc.filter(c=>c.x.st!=='liberado'),soma=a=>a.reduce((s,c)=>s+(c.x.st==='previsto'?c.cheio:c.val),0),glo=calc.reduce((s,c)=>s+c.desc,0);
 fin20Aud('Repasse médico',`Extrato de ${b.n} (${per}) aberto para o profissional`);
 openModal(`${mh('Extrato para o profissional')}<div class="mb rel fin20-doc">
 <div class="row rel-cab" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><div><h2>Extrato de repasse</h2><span style="color:var(--fg2)">${esc(b.n)} · ${esc(b.papel)} · ${esc(b.doc)}</span></div><img class="rel-logo" src="logo-deovita.png" alt="DeoVita Clínicas"></div>
 <div class="meta"><span>Período: ${esc(per)}</span><span>Gerado em ${dmy(iso(new Date()))} às ${hhmm(new Date())} por ${esc(FN_USU)}</span><span>Pagamento: ${esc(b.pag)}</span></div>
 <div class="tablewrap" style="border-radius:12px"><table><thead><tr><th>Data</th><th>Paciente</th><th>Procedimento</th><th>Convênio</th><th style="text-align:right">Valor</th><th>Regra</th><th style="text-align:right">Glosa</th><th style="text-align:right">Repasse</th><th>Situação</th></tr></thead><tbody>${calc.length?calc.map(c=>`<tr data-det="0"><td>${c.x.d}</td><td>${esc(c.x.pac)}</td><td>${esc(PROC(c.x.proc).n)}</td><td>${esc(c.x.conv)}</td><td style="text-align:right">${fmt(c.x.v)}</td><td>${rpRegraTxt(c.r)}</td><td style="text-align:right">${c.desc?'− '+fmt(c.desc):'nenhuma'}</td><td style="text-align:right"><b>${fmt(c.x.st==='previsto'?c.cheio:c.val)}</b></td><td>${c.x.fech?'fechado em '+c.x.fech:c.x.st==='liberado'?'liberado':c.x.st==='recurso'?'glosa em recurso':'aguarda convênio'}</td></tr>`).join(''):'<tr data-det="0"><td colspan="9">Nenhum atendimento neste período.</td></tr>'}
 <tr data-det="0" style="font-weight:800"><td colspan="4">Total</td><td style="text-align:right">${fmt(l.reduce((s,x)=>s+x.v,0))}</td><td></td><td style="text-align:right">${glo?'− '+fmt(glo):'nenhuma'}</td><td style="text-align:right">${fmt(soma(calc))}</td><td></td></tr></tbody></table></div>
 ${kvs([['Liberado',fmt(soma(lib))+' · '+lib.length+' item(ns)'],['Aguardando convênio ou recurso',fmt(soma(prev))+' · '+prev.length+' item(ns)']])}
 <p class="tl" style="margin-top:8px">Valores calculados pelo sistema a partir das regras vigentes. A glosa é descontada na proporção do glosado e volta se o recurso for aceito. O profissional também vê este extrato no portal do médico.</p>
 <p class="tl fin20-env" id="fin20Env">${b.envExt?fin20EnvTxt(b.envExt):''}</p></div>
 <div class="mf mf-fixo"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="fin20RpWhats('extrato','${bid}')">Enviar pelo WhatsApp</button><button class="btn sec" onclick="fin20Print()">${I.print} Imprimir</button><button class="btn" onclick="toast('Na janela que abrir, escolha Salvar como PDF');fin20Print()">${I.dl} Baixar PDF</button></div>`,'wide')};

/* ---------- 657: ajuste com novo valor, que vai para aprovação e aparece como "em aprovação" ---------- */
const F20_AJ=[];
rpAjuste=function(i){const x=F2_PROD[i];if(!x)return;const c=rpLinhaCalc(x);const pk=F20_AJ.findIndex(a=>a.i===i&&a.st==='Aguardando aprovação');
 if(pk>=0){toast('Este atendimento já tem um ajuste aguardando aprovação','warn');fin20AjVer(pk);return}
 openModal(`${mh('Ajuste de repasse')}<div class="mb">${kvs([['Paciente',esc(x.pac)],['Atendimento',x.d+' · '+esc(PROC(x.proc).n)],['Profissional',esc(F2_B(x.b).n)],['Regra',rpRegraTxt(c.r)],['Repasse atual',`<b>${fmt(c.val)}</b>`]])}
 <div class="field" style="margin-top:10px"><label for="fin20AjV">Novo valor do repasse <span class="req">*</span></label><input class="in" id="fin20AjV" inputmode="decimal" value="${c.val.toFixed(2).replace('.',',')}"></div>
 <div class="field"><label for="fin20AjMot">Motivo <span class="req">*</span></label><textarea class="in" id="fin20AjMot" rows="3" placeholder="Por que o valor muda (pelo menos 10 letras). Fica na auditoria com o seu nome e a hora."></textarea></div>
 <div class="alert info fin20-alert"><span>O ajuste vai para <b>aprovação de outra pessoa do financeiro</b> (ou do Administrador). O novo valor só passa a valer depois de aprovado.${x.fech?' Item travado no '+x.fech+': o valor aprovado entra no próximo fechamento.':''}</span></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="fin20AjSalvar(${i})">Registrar ajuste</button></div>`)};
function fin20AjSalvar(i){const x=F2_PROD[i];if(!x)return;const c=rpLinhaCalc(x),vt=fin20G('fin20AjV'),v=fin20Num(vt),m=fin20G('fin20AjMot').trim();
 if(!vt.trim()||isNaN(v)||v<0){toast('Informe o novo valor do repasse (ex.: 95,00)','warn');return}
 if(Math.abs(v-c.val)<0.005){toast('O novo valor é igual ao atual. Mude o valor ou cancele.','warn');return}
 if(m.length<10){toast('Escreva o motivo do ajuste (pelo menos 10 letras)','warn');return}
 const a={i,de:c.val,para:Math.round(v*100)/100,m,por:FN_USU,h:fin20Agora(),st:'Aguardando aprovação'};F20_AJ.push(a);x.aj=F20_AJ.length-1;
 fin20Aud('Repasse médico',`Ajuste pedido em ${x.pac} (${x.d}, ${F2_B(x.b).n}): de ${fmt(a.de)} para ${fmt(a.para)}. Enviado para aprovação. Motivo: ${m}`);
 try{closeModal();closeDrawer()}catch(e){}reView();
 retorno('ok','Ajuste enviado para aprovação',`${esc(x.pac)} · de ${fmt(a.de)} para <b>${fmt(a.para)}</b>. Outra pessoa do financeiro precisa aprovar; até lá vale o valor atual. No extrato, a linha mostra "ajuste em aprovação".`,[{l:'Ver o ajuste',on:`fin20AjVer(${x.aj})`},{l:'Fechar',sec:true}]);return a}
function fin20AjVer(k){const a=F20_AJ[k];if(!a)return;const x=F2_PROD[a.i];
 openDrawer('Ajuste de repasse · '+esc(x.pac),`${kvs([['Situação',`<span class="badge ${a.st==='Aprovado'?'ok':a.st==='Recusado'?'err':'warn'}">${a.st}</span>`],['Profissional',esc(F2_B(x.b).n)],['Atendimento',x.d+' · '+esc(PROC(x.proc).n)+' · '+esc(x.conv)],['Valor antes',fmt(a.de)],['Valor pedido',`<b>${fmt(a.para)}</b>`],['Diferença',f2v(Math.round((a.para-a.de)*100)/100)],['Pedido por',esc(a.por)+' · '+a.h],['Motivo',esc(a.m)],a.apor?[a.st==='Aprovado'?'Aprovado por':'Recusado por',esc(a.apor)+' · '+a.ah+(a.rm?' · '+esc(a.rm):'')]:null])}
 ${a.st==='Aguardando aprovação'?`<div class="alert info fin20-alert" style="margin-top:10px"><span>Quem pediu o ajuste não aprova (exceto o Administrador). Para testar, troque a pessoa em Testar como.</span></div><div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap"><button class="btn" onclick="fin20AjAprovar(${k})">Aprovar ajuste</button><button class="btn ghost" onclick="fin20AjRecusar(${k})">Recusar</button></div>`:''}`)}
function fin20AjAprovar(k){const a=F20_AJ[k];if(!a||a.st!=='Aguardando aprovação')return;if(a.por===FN_USU&&!f2Admin()){toast(`Quem pediu o ajuste não aprova: ${a.por} pediu. Outra pessoa do financeiro aprova (ou o Administrador).`,'warn');return}
 const x=F2_PROD[a.i];a.st='Aprovado';a.apor=FN_USU;a.ah=fin20Agora();if(x.fech)x.ajProx=a.para;else x.ajOk=a.para;
 fin20Aud('Repasse médico',`Ajuste aprovado em ${x.pac} (${x.d}): de ${fmt(a.de)} para ${fmt(a.para)}${x.fech?', entra no próximo fechamento':''}`);try{closeDrawer()}catch(e){}reView();toast('Ajuste aprovado: o repasse passa a ser '+fmt(a.para)+(x.fech?' no próximo fechamento':''))}
function fin20AjRecusar(k){const a=F20_AJ[k];if(!a||a.st!=='Aguardando aprovação')return;f2Motivo('Recusar ajuste','O valor continua o atual. Fica na auditoria.',m=>{const x=F2_PROD[a.i];a.st='Recusado';a.apor=FN_USU;a.ah=fin20Agora();a.rm=m;fin20Aud('Repasse médico',`Ajuste recusado em ${x.pac} (${x.d}). Motivo: ${m}`);try{closeDrawer()}catch(e){}reView();toast('Ajuste recusado e registrado na auditoria','warn')},'Recusar','warn')}
/* A gaveta do atendimento mostra o ajuste pedido */
{const _i=rpItem;rpItem=function(i){const x=F2_PROD[i];return fin20ComDrawer(()=>_i.apply(this,arguments),h=>{const a=x&&x.aj!=null?F20_AJ[x.aj]:null;if(!a)return h;
 return h.replace(/(<div class="row" style="margin-top:12px;gap:6px"><button class="btn sec" onclick="rpAjuste)/,`<div class="alert ${a.st==='Aguardando aprovação'?'warn':'info'} fin20-alert" style="margin-top:10px"><span>Ajuste ${a.st.toLowerCase()}: de ${fmt(a.de)} para <b>${fmt(a.para)}</b>, pedido por ${esc(a.por)}. <a href="#" onclick="event.preventDefault();fin20AjVer(${x.aj})">Ver o ajuste</a></span></div>$1`)})}}

/* ---------- 658: enviar o comprovante em PDF pelo WhatsApp do profissional ---------- */
const F20_TEL={p1:'(85) 98812-4410',p2:'(85) 99654-2231',p3:'(85) 98177-0932',p4:'(85) 99230-5518',t1:'(85) 98745-6620',te1:'(85) 99261-7788',pr1:'(85) 99981-3040'}; // celulares do cadastro (exemplo)
const fin20TelMask=t=>String(t||'').replace(/(\d{4,5})-(\d{4})$/,(m,a,b)=>a.slice(0,1)+'****-'+b);
const F20_ENVIOS=[];
const fin20EnvTxt=e=>e?`<span class="badge ok">enviado</span> ${esc(e.arq)} pelo WhatsApp para ${esc(fin20TelMask(e.tel))} em ${e.h}, por ${esc(e.por)}`:'';
function fin20RpWhats(tipo,ref){const f=tipo==='comp'?F2_FR.find(x=>x.id===ref):null,bid=f?f.b:ref,b=F2_B(bid);if(!b)return;const tel=F20_TEL[bid];
 if(!tel){toast(`${b.n} não tem celular com WhatsApp no cadastro. Cadastre em Profissionais.`,'warn');return}
 const arq=f?`Comprovante de repasse ${f.id}.pdf`:`Extrato de repasse ${fin20RpPerTxt().replace(/\//g,'-')}.pdf`;
 const env={tipo,ref,para:b.n,tel,arq,h:fin20Agora(),por:FN_USU};F20_ENVIOS.unshift(env);if(f)f.env=env;else b.envExt=env;
 fin20Aud('Repasse médico',`${f?'Comprovante '+f.id:'Extrato do período'} enviado em PDF pelo WhatsApp para ${b.n} (${fin20TelMask(tel)})`);
 toast(`Enviado: ${arq} pelo WhatsApp de ${b.n} (${fin20TelMask(tel)})`);fin20Html('fin20Env',fin20EnvTxt(env));return env}
{const _c=rpComprovante;rpComprovante=function(id){const f=F2_FR.find(x=>x.id===id);return fin20ComModal(()=>_c.apply(this,arguments),h=>h
 .replace(`onclick="toast('Comprovante enviado ao profissional por e-mail e no portal do médico')">Enviar ao profissional`,`onclick="fin20RpWhats('comp','${id}')">Enviar ao profissional pelo WhatsApp`)
 .replace(`onclick="toast('PDF do comprovante aberto para imprimir')"`,`onclick="fin20Print()"`)
 .replace('</div></div><div class="mf">',`<p class="tl fin20-env" id="fin20Env">${f&&f.env?fin20EnvTxt(f.env):''}</p></div></div><div class="mf">`))}}

/* ---------- 659: "Aguardando aprovação" mostra a observação de quem fechou ---------- */
const F20_FR_OBS={'FR-0934':'Conferir a quantidade de laudos de ECG com a planilha da CardioDiag antes de aprovar: vieram 8 laudos a mais que em agosto.'};
F2_FR.forEach(f=>{if(F20_FR_OBS[f.id]&&!f.obs)f.obs=F20_FR_OBS[f.id]});
let F20_FROBS='';
{const _f=rpFechs;rpFechs=function(){return _f.apply(this,arguments).replace(/<tr class="clk" onclick="rpComprovante\('([^']+)'\)">[\s\S]*?<\/tr>/g,(row,id)=>row.replace('<span class="badge warn">Aguardando aprovação</span>',`<button class="badge warn fin20-obsb" onclick="event.stopPropagation();fin20FrObs('${id}')" title="Clique para ver a observação de quem fechou">Aguardando aprovação · ver obs.</button>`))}}
function fin20FrObs(id){const f=F2_FR.find(x=>x.id===id);if(!f)return;const b=F2_B(f.b);
 openDrawer('Fechamento '+f.id+' · aguardando aprovação',`${kvs([['Beneficiário',esc(b.n)+' · '+esc(b.papel)],['Período',f.per],['Valor',`<b>${fmt(f.v)}</b>`],['Fechado por',esc(f.fpor)],['Situação',`<span class="badge warn">${esc(f.st)}</span>`]])}
 <h4 style="margin-top:12px">Observação de quem fechou</h4><div class="fin20-obs">${f.obs?esc(f.obs):'<span class="tl">Nenhuma observação foi escrita no fechamento.</span>'}</div>
 <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap">${f.st==='Aguardando aprovação'?`<button class="btn" onclick="closeDrawer();rpAprovar('${f.id}')">Aprovar</button><button class="btn ghost" onclick="closeDrawer();rpDevolver('${f.id}')">Devolver</button>`:''}<button class="btn sec" onclick="closeDrawer();rpComprovante('${f.id}')">Ver o fechamento</button></div>`)}
{const _r=rpFechar;rpFechar=function(b){F20_FROBS='';return fin20ComModal(()=>_r.apply(this,arguments),h=>h.replace('</div><div class="mf">',`<div class="field" style="margin-top:10px"><label for="fin20FrObsIn">Observação para quem vai aprovar</label><textarea class="in" id="fin20FrObsIn" rows="2" placeholder="Opcional. Aparece ao clicar em Aguardando aprovação." oninput="F20_FROBS=this.value"></textarea></div></div><div class="mf">`))}}
{const _o=rpFecharOk;rpFecharOk=function(b,id,v){const obs=String(F20_FROBS||'').trim();F20_FROBS='';const r=_o.apply(this,arguments);const f=F2_FR.find(x=>x.id===id);if(f&&obs){f.obs=obs;fin20Aud('Repasse médico',`Observação no fechamento ${id}: ${obs}`)}return r}}

/* ---------- 660: ligar e desligar o split funcionando, com motivo; quem não é Administrador pede ---------- */
rpSplitSet=function(id,on){const b=F2_B(id);if(!b)return;const adm=f2Admin();
 openModal(`${mh((on?'Ligar':'Desligar')+' o split · '+esc(b.n))}<div class="mb"><p style="font-size:14px">${on?'Com o split ligado, a parte do profissional nos pagamentos particulares por Pix e cartão vai direto para a conta dele na hora do pagamento.':'Com o split desligado, o profissional passa a receber pelo fechamento mensal do repasse.'} Vale para os próximos pagamentos; o que já foi pago não muda.</p>
 ${adm?'':'<div class="alert warn fin20-alert"><span>Muda para onde vai o dinheiro, por isso <b>só o Administrador confirma</b>. Seu pedido fica aguardando o Administrador.</span></div>'}
 <div class="field"><label for="fin20SpMot">Motivo <span class="req">*</span></label><textarea class="in" id="fin20SpMot" rows="2" placeholder="Pelo menos 10 letras. Fica na auditoria."></textarea></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal();reView()">Cancelar</button><button class="btn" onclick="fin20SplitOk('${id}',${on?'true':'false'})">${adm?(on?'Ligar o split':'Desligar o split'):'Pedir ao Administrador'}</button></div>`)};
function fin20SplitOk(id,on){const b=F2_B(id);if(!b)return;const m=fin20G('fin20SpMot').trim();if(m.length<10){toast('Escreva o motivo (pelo menos 10 letras)','warn');return}try{closeModal()}catch(e){}
 if(f2Admin()){b.split=on;delete b.splitPed;fin20Aud('Repasse médico',`Split ${on?'ligado':'desligado'} para ${b.n}. Motivo: ${m}`);reView();toast(`Split ${on?'ligado':'desligado'} para ${b.n}; vale para os próximos pagamentos`);return}
 b.splitPed={on,por:FN_USU,h:fin20Agora(),m};fin20Aud('Repasse médico',`Pedido para ${on?'ligar':'desligar'} o split de ${b.n}, aguardando o Administrador. Motivo: ${m}`);reView();toast('Pedido enviado ao Administrador. O split muda quando ele aprovar.','warn')}
function fin20SplitAprovar(id){const b=F2_B(id);if(!b||!b.splitPed)return;if(!f2Admin()){toast('Só o Administrador aprova. Para testar, escolha "Jânio · Administrador" em Testar como.','warn');return}
 const p=b.splitPed;b.split=p.on;delete b.splitPed;fin20Aud('Repasse médico',`Split ${p.on?'ligado':'desligado'} para ${b.n} (pedido de ${p.por} aprovado)`);reView();toast(`Split ${p.on?'ligado':'desligado'} para ${b.n}`)}
function fin20SplitRecusar(id){const b=F2_B(id);if(!b||!b.splitPed)return;if(!f2Admin()){toast('Só o Administrador recusa o pedido','warn');return}const p=b.splitPed;delete b.splitPed;fin20Aud('Repasse médico',`Pedido de ${p.por} para ${p.on?'ligar':'desligar'} o split de ${b.n} recusado`);reView();toast('Pedido recusado','warn')}
function fin20SplitCard(){return `<div class="card at-card"><h3>Quem tem split</h3><div class="at-list">${F2_BEN.filter(b=>b.papel==='Médico').map(b=>{const p=b.splitPed;
 return `<div class="switchrow fin20-sprow"><span><b>${esc(b.n)}</b><small>${b.split?'Ligado · recebedor verificado, subconta Banco Inter':'Desligado · repasse pelo fechamento mensal'}</small>${p?`<small class="fin20-ped">Pedido de ${p.on?'ligar':'desligar'} por ${esc(p.por)} em ${p.h}: aguardando o Administrador. <button class="btn sm" onclick="fin20SplitAprovar('${b.id}')">Aprovar</button> <button class="btn sm ghost" onclick="fin20SplitRecusar('${b.id}')">Recusar</button></small>`:''}</span><label class="switch"><input type="checkbox" ${b.split?'checked':''} ${p?'disabled':''} onchange="rpSplitSet('${b.id}',this.checked)" aria-label="Split de ${esc(b.n)}"><span class="tr"></span><span class="fin20-swtxt">${b.split?'Ligado':'Desligado'}</span></label></div>`}).join('')}</div><p class="tl" style="margin-top:8px">Ligar ou desligar pede motivo e fica na auditoria. Convênio nunca tem split: o convênio paga a clínica e o repasse sai no fechamento, já com a glosa descontada.</p></div>`}

/* ---------- 661: pagamento do split abre detalhe com botão para imprimir o comprovante ---------- */
{const _s=rpSplit;rpSplit=function(){const h=_s.apply(this,arguments);let n=0;const k=h.indexOf('<div class="card at-card"><h3>Quem tem split</h3>');
 const a=(k>=0?h.slice(0,k):h).replace(/<tr>(<td data-l="Pagamento">)/g,(m,t)=>`<tr class="clk" onclick="fin20SplitDet(${n++})" title="Clique para ver o pagamento e imprimir o comprovante">${t}`);
 return k>=0?a+fin20SplitCard()+'</div>':a}}
function fin20SplitParte(s){const r=rpRegra(s.b,s.proc,'Particular');return {r,m:rpValor(r,s.v,0)}}
function fin20SplitDet(i){const s=F2_SPLIT[i];if(!s)return;const {r,m}=fin20SplitParte(s);
 openDrawer('Detalhes · '+s.d,`${kvs([['Pagamento',s.d],['Paciente',esc(s.pac)],['Procedimento',esc(PROC(s.proc).n)],['Profissional',esc(F2_B(s.b).n)],['Forma',esc(s.forma)],['Total pago',`<b>${fmt(s.v)}</b>`],['Parte do profissional',fmt(m)+' · '+rpRegraTxt(r)],['Parte da clínica',fmt(s.v-m)],['Situação','<span class="badge ok">pago no split</span>']])}
 <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap"><button class="btn" onclick="fin20SplitComp(${i})">${I.print} Imprimir comprovante deste pagamento</button></div>`)}
function fin20SplitComp(i){const s=F2_SPLIT[i];if(!s)return;const {r,m}=fin20SplitParte(s),b=F2_B(s.b);fin20Aud('Repasse médico',`Comprovante do pagamento com split de ${s.d} (${s.pac}) aberto para imprimir`);
 openModal(`${mh('Comprovante do pagamento')}<div class="mb rel fin20-doc"><div class="row rel-cab" style="justify-content:space-between;flex-wrap:wrap;gap:8px"><div><h2>Comprovante de pagamento com split</h2><span style="color:var(--fg2)">DeoVita Clínicas · ${esc(unidNome(10))}</span></div><img class="rel-logo" src="logo-deovita.png" alt="DeoVita Clínicas"></div>
 ${kvs([['Data e hora',s.d],['Paciente',esc(s.pac)],['Procedimento',esc(PROC(s.proc).n)+' (TUSS '+s.proc+')'],['Forma',esc(s.forma)],['Total pago',`<b>${fmt(s.v)}</b>`],['Para o profissional',esc(b.n)+' · '+fmt(m)+' ('+rpRegraTxt(r)+')'],['Para a clínica',fmt(s.v-m)]])}
 <p class="tl" style="margin-top:8px">A parte do profissional foi para a conta dele no momento do pagamento e não entra no fechamento do repasse. Código de verificação SP-${s.d.replace(/\D/g,'')}-${s.b.toUpperCase()}.</p></div>
 <div class="mf mf-fixo"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="fin20Print()">${I.print} Imprimir</button><button class="btn" onclick="toast('Na janela que abrir, escolha Salvar como PDF');fin20Print()">${I.dl} Baixar PDF</button></div>`,'wide')}

/* ---------- 662: excluir versão da regra, com motivo e auditoria; com pagamentos, só inativar ---------- */
const F20_RG_EXC=[];
const F20_PER={'set/2026':'2026-09-15','out/2026':'2026-10-15'};
const fin20DmyIso=s=>{const m=/^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s||'');return m?m[3]+'-'+m[2]+'-'+m[1]:''};
/* Pagamentos feitos com a versão: fechamentos pagos ou aprovados, pagamentos no split e itens de fechamentos pagos, dentro da vigência */
function fin20RgUso(r){const ini=fin20DmyIso(r.vig)||'0000',fim=fin20DmyIso(r.fim)||'9999',dentro=d=>!!d&&d>=ini&&d<=fim;
 const fr=F2_FR.filter(f=>f.b===r.b&&['Pago','Aprovado'].includes(f.st)&&dentro(F20_PER[f.per]||''));
 const sp=F2_SPLIT.filter(s=>s.b===r.b&&r.conv!=='Convênios'&&(r.proc==='*'||r.proc===s.proc)&&dentro('2026-'+s.d.slice(3,5)+'-'+s.d.slice(0,2)));
 const it=F2_PROD.filter(x=>x.b===r.b&&x.fech&&dentro(fin20RpIso(x))&&((F2_FR.find(f=>f.id===x.fech)||{}).st==='Pago'));
 return {fr,sp,it,n:fr.length+sp.length+it.length}}
{const _g=rpRegras;rpRegras=function(){let n=0;let h=_g.apply(this,arguments).replace(/<tr([^>]*)>(<td data-l="Beneficiário">[\s\S]*?)<\/tr>/g,(row,op,ins)=>{const r=F2_RG[n++];if(!r)return row;
  let x=ins.replace(/<td data-l="">([\s\S]*?)<\/td>$/,`<td data-l=""><span class="row fin20-rgbts">$1<button class="btn sm ghost fin20-exc" onclick="fin20RgExcluir('${r.id}')">${r.inat?'Ver':'Excluir'}</button></span></td>`);
  if(r.inat)x=x.replace('<span class="badge neutral">encerrada</span>','<span class="badge neutral">inativada</span>');return `<tr${op||''}>${x}</tr>`});
 if(F20_RG_EXC.length)h+=`<div class="card at-card fin20-exc-l" style="margin-top:10px"><h3>Versões excluídas (${F20_RG_EXC.length})</h3><div class="at-list">${F20_RG_EXC.map(e=>`<div class="at-row"><div class="grow"><b>${esc(F2_B(e.r.b).n)} · ${rpProcTxt(e.r.proc)} · ${e.r.conv==='*'?'Todos':e.r.conv} · ${rpRegraTxt(e.r)}</b><small>Excluída em ${e.h} por ${esc(e.por)} · motivo: ${esc(e.m)}</small></div></div>`).join('')}</div><p class="tl" style="margin-top:6px">Saíram da lista, mas continuam guardadas na auditoria.</p></div>`;
 return h}}
const fin20RgDesc=r=>`${esc(F2_B(r.b).n)} · ${rpProcTxt(r.proc)} · ${r.conv==='*'?'Todos':r.conv} · ${rpRegraTxt(r)} (${r.fim?r.vig+' a '+r.fim:'desde '+r.vig})`;
function fin20RgExcluir(id){const r=F2_RG.find(x=>x.id===id);if(!r)return;
 if(!f2Admin()){toast('Só o Administrador exclui ou inativa versão de regra de repasse. Para testar, escolha "Jânio · Administrador" em Testar como.','warn');return}
 const u=fin20RgUso(r);
 if(u.n){const lista=[...u.fr.map(f=>`Fechamento ${f.id} · ${f.per} · ${fmt(f.v)} · ${f.st.toLowerCase()}`),...u.sp.map(s=>`Pagamento no split ${s.d} · ${esc(s.pac)} · ${fmt(s.v)}`),...u.it.map(x=>`Atendimento ${x.d} · ${esc(x.pac)} · fechamento ${x.fech}`)];
  if(r.inat){openDrawer('Versão inativada',`<p>${fin20RgDesc(r)}</p>${kvs([['Inativada em',r.inat.h],['Por',esc(r.inat.por)],['Motivo',esc(r.inat.m)],['Pagamentos com esta versão',String(u.n)]])}<p class="tl" style="margin-top:8px">Tem pagamentos, por isso não pode ser apagada. Continua guardada para conferência.</p>`);return}
  openModal(`${mh('Esta versão não pode ser apagada')}<div class="mb"><p style="font-size:14px">${fin20RgDesc(r)}</p><div class="alert warn fin20-alert"><span>Ela já tem <b>${u.n} pagamento(s)</b> feitos com esta regra. Apagar faria sumir a base de cálculo do que já foi pago, e esses documentos precisam ser guardados para conferência do profissional e da fiscalização. Por isso ela só pode ser <b>inativada</b>: deixa de valer para atendimentos novos e continua guardada.</span></div>
  <h4 style="margin-top:10px">Pagamentos com esta versão</h4><ul class="fin20-ul">${lista.map(x=>`<li>${x}</li>`).join('')}</ul>${r.fim?'':'<p class="tl">Atenção: sem esta regra, atendimentos novos deste profissional ficam sem repasse até você criar uma versão nova.</p>'}
  <div class="field"><label for="fin20RgMot">Motivo da inativação <span class="req">*</span></label><textarea class="in" id="fin20RgMot" rows="2" placeholder="Pelo menos 10 letras. Fica na auditoria."></textarea></div></div>
  <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn warn" onclick="fin20RgInativar('${id}')">Inativar versão</button></div>`);return}
 const pend=r.fim?0:F2_PROD.filter(x=>x.b===r.b&&!x.fech).length;
 openModal(`${mh('Excluir versão da regra')}<div class="mb"><p style="font-size:14px">${fin20RgDesc(r)}</p><div class="alert info fin20-alert"><span>Nenhum pagamento usou esta versão. Ela sai da lista, mas fica registrada na auditoria com o motivo.${pend?` Os ${pend} atendimento(s) ainda não fechados deste profissional passam a usar a próxima regra que servir.`:''}</span></div>
 <div class="field"><label for="fin20RgMot">Motivo da exclusão <span class="req">*</span></label><textarea class="in" id="fin20RgMot" rows="2" placeholder="Pelo menos 10 letras. Fica na auditoria."></textarea></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn warn" onclick="fin20RgExcluirOk('${id}')">Excluir versão</button></div>`)}
function fin20RgMotivo(){const m=fin20G('fin20RgMot').trim();if(m.length<10){toast('Escreva o motivo (pelo menos 10 letras)','warn');return null}return m}
function fin20RgExcluirOk(id){const k=F2_RG.findIndex(x=>x.id===id);if(k<0)return;const r=F2_RG[k];if(fin20RgUso(r).n){toast('Esta versão tem pagamentos: só pode ser inativada','warn');return}const m=fin20RgMotivo();if(!m)return;
 F2_RG.splice(k,1);F20_RG_EXC.unshift({r,m,por:FN_USU,h:fin20Agora()});fin20Aud('Repasse médico',`Versão de regra excluída: ${F2_B(r.b).n} · ${rpProcTxt(r.proc)} · ${r.conv} · ${rpRegraTxt(r)} (${r.fim?r.vig+' a '+r.fim:'desde '+r.vig}). Motivo: ${m}`);
 try{closeModal()}catch(e){}reView();toast('Versão excluída da lista e registrada na auditoria');return r}
function fin20RgInativar(id){const r=F2_RG.find(x=>x.id===id);if(!r)return;const m=fin20RgMotivo();if(!m)return;
 r.inat={m,por:FN_USU,h:fin20Agora()};if(!r.fim)r.fim='03/11/2026';fin20Aud('Repasse médico',`Versão de regra inativada (tem pagamentos, não pode ser apagada): ${F2_B(r.b).n} · ${rpProcTxt(r.proc)} · ${r.conv} · ${rpRegraTxt(r)}. Motivo: ${m}`);
 try{closeModal()}catch(e){}reView();toast('Versão inativada: não vale para atendimentos novos e continua guardada');return r}

/* ---------- Estilos da rodada ---------- */
try{document.head.insertAdjacentHTML('beforeend',`<style>
/* 632 a 635: Por origem dentro do quadro */
.at-card:has(>.fin19-rosca){container-type:inline-size;overflow:hidden}
.fin19-rosca{grid-template-columns:minmax(110px,170px) minmax(0,1fr)}
.fin19-leg{min-width:0}
.fin19-li{display:grid;grid-template-columns:12px minmax(0,1fr) auto;grid-template-areas:"c n v" "c n p";column-gap:8px;align-items:center}
.fin19-li i{grid-area:c}.fin19-li .grow{grid-area:n;min-width:0}.fin19-li-v{grid-area:v;text-align:right}.fin19-li-p{grid-area:p;text-align:right}
.fin19-li b,.fin19-li small{overflow-wrap:anywhere;word-break:normal;white-space:normal}
.fin19-li:hover,.fin19-li.fin19-on{transform:none}
.fin19-rc-c,.fin19-rc-s{pointer-events:none}
@container (max-width:460px){.fin19-rosca{grid-template-columns:1fr}.fin19-rosca svg{max-width:190px;margin:0 auto}}
/* 636 e 638: blocos da lista lateral sem sobrepor */
#drawer .fin19-lrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 10px;align-items:start;padding:10px 12px}
#drawer .fin19-lrow .grow b,#drawer .fin19-lrow .grow small{overflow-wrap:anywhere;white-space:normal}
#drawer .fin19-lrow .fin19-sit{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:flex-start;min-width:0}
#drawer .fin19-lrow .fin19-sit .badge{white-space:normal;max-width:100%}
/* 641 */
.fin20-sit{display:inline-flex;flex-direction:column;align-items:center;text-align:center;gap:2px}
.fin20-sit small{display:block!important;text-align:center}
.fin20-novo{font-size:11px;margin-right:4px}
/* 644 */
.fin20-glbtn{margin-left:auto;white-space:nowrap}
/* 646/647/653 */
.fin20-cbrow{flex-wrap:wrap;gap:8px}.fin20-cbrow .fin20-v{white-space:nowrap}
.fin20-cbrow .grow b,.fin20-cbrow .grow small{overflow-wrap:anywhere}
.fin20-ir{font-size:12px;color:var(--accent);font-weight:700;white-space:nowrap}
.fin20-cbrow:hover{background:var(--accent-soft)}
.fin20-kpi{cursor:pointer}
.fin20-alert{max-width:100%;box-sizing:border-box;flex-wrap:wrap}
.fin20-alert>span{flex:1 1 0;min-width:0;white-space:normal;overflow-wrap:anywhere}
/* 649/650 */
.fin20-file{position:absolute;opacity:0;width:1px;height:1px;overflow:hidden;pointer-events:none}
.fin20-drop{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;border:2px dashed var(--border);border-radius:12px;padding:20px;cursor:pointer;transition:border-color .15s,background .15s}
.fin20-drop:hover,.fin20-drop.on{border-color:var(--accent);background:var(--accent-soft)}
.fin20-drop span{color:var(--fg2);font-size:13px}.fin20-drop .btn{color:inherit}
.fin20-drop small{font-weight:700;color:var(--fg)}
.fin20-ofx-res{margin-top:10px}.fin20-ofx-res h4{margin:12px 0 6px}
.fin20-h-ok,.fin20-st-ok{color:var(--ok)}.fin20-h-er,.fin20-st-erro{color:var(--err)}.fin20-st-dup{color:var(--fg2)}
.fin20-off{opacity:.55}
/* 651 */
.fin20-bar{height:10px;border-radius:999px;background:var(--surface2);border:1px solid var(--border);overflow:hidden}
.fin20-bar i{display:block;height:100%;background:linear-gradient(90deg,#2E7D6B,#3B82F6);border-radius:999px;transition:width .4s ease}
/* 657/659 */
button.badge.fin20-ajb,button.badge.fin20-obsb{cursor:pointer;border:1px dashed currentColor;font:inherit;font-size:12px;margin-left:4px}
button.badge.fin20-ajb:hover,button.badge.fin20-obsb:hover{text-decoration:underline}
.fin20-obs{border:1px solid var(--border);border-radius:10px;padding:10px 12px;background:var(--surface2);white-space:pre-wrap;overflow-wrap:anywhere}
.fin20-env{margin-top:6px}
/* 660 */
.fin20-sprow .switch{flex:none}.fin20-swtxt{font-size:13px;color:var(--fg2);min-width:66px}
.fin20-ped{color:var(--warn)!important;font-weight:600}.fin20-ped .btn{margin-top:4px}
/* 662 */
.fin20-rgbts{gap:4px;flex-wrap:nowrap}
.fin20-ul{margin:4px 0 10px 18px;font-size:13px}
.fin20-doc .tablewrap{overflow-x:auto}
</style>`)}catch(e){}
