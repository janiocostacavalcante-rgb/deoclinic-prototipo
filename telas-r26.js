/* Rodada 26 (16/11/2026) · notas 710 a 766
   ==========================================================================
   Financeiro (conciliação, acerto entre postos, apoio), Novo atendimento (pagamento, fichas, solicitante,
   questionário consolidado), Agendamentos, Autorizar atendimento, Pacientes, Pré-atendimento,
   Listagem de Senhas e Estoque. O painel de tarefas (729 a 737) fica em telas-tarefas.js.
   Retidas: 748 (texto da prioridade legal), 750 (código da senha no painel) e 765 (entrega do resultado).
   Fica depois dos arquivos da rodada 21: só acrescenta funções e embrulha as que já existem. Prefixo r26 / R26_.
   ========================================================================== */

const r26El=id=>{try{return document.getElementById(id)}catch(e){return null}};
const r26Hash=()=>{try{return location.hash}catch(e){return ''}};
const r26Num=v=>{const n=typeof rc20Num==='function'?rc20Num(v):parseFloat(String(v||'').replace(/\./g,'').replace(',','.'));return isNaN(n)?0:n};
const r26Moeda=v=>(Math.round((+v||0)*100)/100).toFixed(2).replace('.',',');
const r26Aud=(tela,t)=>{try{if(typeof ft21Aud==='function')ft21Aud(tela,t);else if(typeof r17Aud==='function')r17Aud(t,{})}catch(e){}};

try{document.head.insertAdjacentHTML('beforeend',`<style>
/* 710: lista do fechamento da conciliação mais organizada */
.fin20-cblista .fin20-cbrow{flex-wrap:wrap;align-items:center;gap:6px 10px;padding:10px 12px}
.fin20-cblista .fin20-cbrow>.grow{flex:1 1 100%;min-width:0}
.fin20-cblista .fin20-cbrow>.grow b{display:block;overflow-wrap:anywhere;line-height:1.3}
.fin20-cblista .fin20-cbrow>.grow small{display:block;margin-top:2px}
.fin20-cblista .fin20-cbrow .fin20-v{margin-right:auto}
.fin20-cblista .fin20-cbrow .fin20-ir{white-space:nowrap}
/* postos e apoio */
.r26-doc{border:1px solid var(--border);border-radius:12px;padding:16px;background:#fff;color:#222;font-size:13px}
.r26-doc h4{color:#111;margin:0 0 6px}.r26-doc table{min-width:0;font-size:12.5px;color:#222}.r26-doc td,.r26-doc th{color:#222;border-color:#ddd}
.r26-doc .r26-doc-h{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-bottom:2px solid #23756D;padding-bottom:8px;margin-bottom:10px}
.r26-ass{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:28px}.r26-ass div{border-top:1px solid #444;padding-top:4px;text-align:center;font-size:12px}
.r26-etqs{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.r26-etq{display:flex;gap:10px;align-items:flex-start;border:1px dashed var(--border);border-radius:10px;padding:10px;background:var(--surface);cursor:pointer;font-size:12.5px}
.r26-etq input{width:18px;height:18px;accent-color:var(--accent);flex:none;margin-top:2px}
.r26-etq.on{border-style:solid;border-color:var(--accent);background:var(--accent-soft)}
.r26-etq .bc{font-family:monospace;font-size:11px;letter-spacing:1px;margin-top:4px;display:block;background:repeating-linear-gradient(90deg,var(--fg-strong) 0 2px,transparent 2px 4px,var(--fg-strong) 4px 5px,transparent 5px 8px);height:22px;border-radius:2px}
.mini .m.clk{cursor:pointer}.mini .m.clk:hover{border-color:var(--accent)}
/* pagamento (727, 746, 764) */
.r26-pag{display:flex;flex-direction:column;gap:12px}
.r26-pag-g{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))}
.r26-ro{background:var(--surface2)!important;font-weight:700;color:var(--fg-strong)}
.r26-desc{display:flex;gap:6px}.r26-desc .in{flex:1;min-width:0}
.r26-seg{display:inline-flex;border:1px solid var(--border);border-radius:8px;overflow:hidden;flex:none}
.r26-seg button{border:0;background:var(--surface);color:var(--fg);font:inherit;font-size:13px;font-weight:700;padding:0 12px;height:40px;cursor:pointer}
.r26-seg button[aria-pressed=true]{background:var(--accent);color:var(--on-accent)}
.r26-pg-l{display:grid;gap:10px;grid-template-columns:minmax(150px,1.3fr) minmax(110px,1fr) minmax(110px,1fr) minmax(140px,1.2fr) auto;align-items:end;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface2)}
.r26-pg-l .field{margin:0}.r26-pg-l .tq-x{margin-bottom:5px}
.r26-pag-res{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;justify-content:flex-end;padding:10px 14px;border-radius:12px;background:var(--accent-soft);font-size:14px}
.r26-pag-res b{color:var(--fg-strong);font-size:16px}
.r26-pag-res .ok{color:var(--ok);font-weight:800}.r26-pag-res .err{color:var(--err);font-weight:800}
@media (max-width:760px){.r26-pg-l{grid-template-columns:1fr 1fr}.r26-pg-l .tq-x{justify-self:end;grid-column:1/-1}.r26-pg-l .r26-vz{display:none}}
/* 738: dados do paciente em cartões */
.r26-dados{display:flex;flex-direction:column;gap:12px}
.r26-dados h5{margin:0 0 6px;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--fg2)}
.r26-dg{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr))}
.r26-dado{border:1px solid var(--border);border-radius:12px;padding:10px 12px;background:var(--surface2);min-width:0}
.r26-dado span{display:block;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg2)}
.r26-dado b{display:block;color:var(--fg-strong);font-size:15px;margin-top:2px;overflow-wrap:anywhere}
.r26-dado.dest{border-color:var(--accent);background:var(--accent-soft)}
.r26-dado.falta{border-color:var(--err);background:var(--err-soft)}.r26-dado.falta b{color:var(--err)}
/* fichas (739, 740, 728, 766) */
.r26-fic td,.r26-fic th{text-align:left}
.r26-fic-ok{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
/* 741: autorizar atendimento com cartões destacados */
.card.rc21-aut-pg{background:transparent;border:0;padding:0;box-shadow:none}
.rc21-aut-pg .rc20-aut{display:flex;flex-direction:column;gap:16px}
.rc21-aut-pg .rc20-aut-c{background:var(--surface);border:1px solid var(--border);border-left:4px solid var(--accent);border-radius:16px;padding:18px 20px;box-shadow:var(--shadow)}
.rc21-aut-pg .rc20-aut-c h4{font-size:16px;margin:0 0 14px;color:var(--fg-strong);display:flex;align-items:center;gap:8px}
.rc21-aut-pg .rc20-aut-c h4::before{content:'';width:10px;height:10px;border-radius:50%;background:var(--accent)}
.rc21-aut-pg .rc20-aut-g{gap:16px 20px}
.rc21-aut-pg .rc20-aut-g .field label{font-size:13px}
.rc21-aut-pg .rc21-aut-fim{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:14px 20px;margin-top:4px}
/* 749: detalhes do agendamento em dois blocos */
.r26-det-b{border:1px solid var(--border);border-radius:14px;padding:12px 14px;background:var(--surface2)}
.r26-det-b h5{margin:0 0 8px;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--fg2)}
.r26-det-b .formgrid{grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr));gap:12px;margin:0!important}
.r26-det-b .r26-w2{grid-column:span 2}
@media (max-width:560px){.r26-det-b .r26-w2{grid-column:auto}}
/* 762: vaga de encaixe diferente */
tr.r26-enc>td{background:var(--warn-soft)}
tr.r26-enc>td:first-child{box-shadow:inset 4px 0 0 var(--warn)}
tr.r26-enc .ag18-enc-tag{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:999px;background:var(--warn);color:#fff;font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.rc-ind.r26-ind-enc{color:var(--warn)}.rc-ind.r26-ind-enc i{background:var(--warn)}
/* 744: Pacientes sem "Recepção" */
.pagehead.r26-pac-ph{align-items:center;margin-bottom:8px}.pagehead.r26-pac-ph h1{margin:0}
/* 742: gráfico com valores ao passar o mouse */
.r26-ln .col{cursor:default}.r26-ln .col:focus{outline:none}.r26-ln .col:focus rect.hl,.r26-ln .col:hover rect.hl{fill:var(--accent-soft);opacity:.6}
/* questionário consolidado (761 e 763) */
details.r26-q>summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
details.r26-q>summary::-webkit-details-marker{display:none}
details.r26-q>summary h3{margin:0}
details.r26-q[open]>summary{margin-bottom:10px}
.r26-q-usa{display:block;font-size:11.5px;color:var(--fg2);font-weight:400;margin-top:2px}
</style>`)}catch(e){}

/* ==========================================================================
   710 · Conciliação: a lista do "Fechar conciliação" fica organizada (só estilo, acima)
   ========================================================================== */

/* ==========================================================================
   ACERTO ENTRE POSTOS · 711 a 717
   ========================================================================== */
/* Datas de cada período da fatura, para o filtro de período (711) */
try{const D={'16–31/10':['2026-10-16','2026-10-31'],'01–15/10':['2026-10-01','2026-10-15'],'out/2026':['2026-10-01','2026-10-31'],'set/2026':['2026-09-01','2026-09-30']};
 PS_LISTA.forEach(x=>{const d=D[x.pe];if(d){x.ini=d[0];x.fim=d[1]}});
 const pg=PS_LISTA.find(x=>x.s==='Pago');if(pg&&!pg.comp)pg.comp={h:'05/10/2026 10:42',forma:'Pix',v:pg.r,aut:'E00000000202610051042ABC12',por:'Gestor do Posto 12'};
}catch(e){}
function r26PsJanela(){const s=PERIODO.ps||{k:'mes'},h=iso(HOJE);
 if(s.k==='hoje')return [h,h];if(s.k==='mes')return [h.slice(0,7)+'-01',h.slice(0,7)+'-31'];if(s.k==='ano')return [h.slice(0,4)+'-01-01',h.slice(0,4)+'-12-31'];
 if(s.k==='semana'){const o=new Date(HOJE);o.setDate(o.getDate()-(o.getDay()+6)%7);const a=iso(o);o.setDate(o.getDate()+6);return [a,iso(o)]}
 return [s.de||'2000-01-01',s.ate||'2100-12-31']}
const r26PsDentro=x=>{if(!x||!x.ini)return true;const [a,b]=r26PsJanela();return x.fim>=a&&x.ini<=b};
const R26_PS_ST={'Aguardando retorno do posto':'info','Fechado':'acc'};
if(typeof VIEWS.postos==='function'){const _v=VIEWS.postos;VIEWS.postos=function(){if(!PERIODO.ps)PERIODO.ps={k:'ano',de:'2026-10-01',ate:'2026-10-31'};let h=_v.apply(this,arguments);
 /* 711: o período filtra a lista (período da fatura que toca o intervalo escolhido) */
 let resta=0;h=h.replace(/<tr class="clk" onclick="psDetalhe\((\d+)\)"[\s\S]*?<\/tr>/g,(m,i)=>{if(!r26PsDentro(PS_LISTA[+i]))return '';resta++;
  const x=PS_LISTA[+i];
  /* 714: situação nova depois de responder a contestação */
  if(R26_PS_ST[x.s])m=m.replace(/<span class="badge [a-z]+">[^<]*<\/span>/,`<span class="badge ${R26_PS_ST[x.s]}">${esc(x.s)}</span>`);
  if(x.s==='Aguardando retorno do posto')m=m.replace('>Responder contestação</button>','>Ver contestação</button>');
  /* 715: fatura e comprovante */
  if(x.s==='Pago')m=m.replace(/<button class="btn sm ghost" onclick="event\.stopPropagation\(\);psFatura\((\d+)\)">PDF da fatura<\/button>/,(mm,j)=>`<div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm ghost" onclick="event.stopPropagation();psFatura(${j})">Ver fatura</button><button class="btn sm sec" onclick="event.stopPropagation();r26PsComp(${j})">Comprovante</button></div>`);
  return m});
 if(!resta)h=h.replace(/(<table[^>]*>[\s\S]*?<tbody>)([\s\S]*?)(<\/tbody>)/,(m,a,b,c)=>/vazio|empty/.test(b)?m:a+vazioLinha(7,'Nenhum período neste filtro','Mude o período, o posto ou a situação.')+c);
 h=h.replace(/(<select class="in" aria-label="Situação"[^>]*>[\s\S]*?)(<\/select>)/,(m,a,b)=>a+['Fechado','Aguardando retorno do posto'].map(s=>`<option value="${s}" ${filtroDe('ps','situacao')===s?'selected':''}>${s}</option>`).join('')+b);
 /* 717: o botão muda quando não há período aberto para fechar */
 h=h.replace(/<button class="btn" onclick="psFechar\((\d+)\)"[^>]*>Fechar período · ([^<]+)<\/button>/,(m,u,n)=>PS_LISTA.some(x=>x.p.startsWith('Posto '+u)&&x.s==='Aberto')?m:`<button class="btn" disabled title="Não há período em aberto para este posto">Período já fechado · ${n}</button>`);
 return h}}
/* 717: fechar o período muda a situação (o botão de fechar some até abrir o próximo) */
if(typeof psFechar==='function'){const _f=psFechar;psFechar=function(u){const x=PS_LISTA.find(p=>p.p.startsWith('Posto '+u)&&p.s==='Aberto');if(!x){toast('Não há período em aberto para este posto: o último já foi fechado','warn');return}
 const r=_f.apply(this,arguments);x.s='Fechado';x.x='';x.c='—';x.fechH=hhmm(new Date());r26Aud('Acerto entre postos',`Período ${x.pe} do ${x.p} fechado; demonstrativo enviado para o aceite do posto`);try{if(r26Hash()==='#postos')reView()}catch(e){}return r}}
/* 712 e 713: sai o botão "Abrir PDF" da fatura (fica Imprimir e Enviar ao posto) */
if(typeof psFatura==='function'){const _f=psFatura;psFatura=function(i){const om=openModal;openModal=function(h,c){h=String(h).replace(/<button class="btn sec" onclick="toast\('PDF da fatura aberto em nova aba'\)">Abrir PDF<\/button>/,'');const x=PS_LISTA[i];if(x&&x.s==='Pago')h=h.replace('<button class="btn sec" onclick="toast(\'Fatura enviada à impressora\')">',`<button class="btn sec" onclick="r26PsComp(${i})">Ver comprovante</button><button class="btn sec" onclick="toast('Fatura enviada à impressora')">`);return om.call(this,h,c)};try{return _f.apply(this,arguments)}finally{openModal=om}}}
/* 715 e 716: comprovante do pagamento da fatura */
function r26PsComp(i){const x=PS_LISTA[i];if(!x)return;if(x.s!=='Pago'||!x.comp){toast('Esta fatura ainda não foi paga: o comprovante aparece depois do pagamento','warn');return}const c=x.comp,u=x.p.startsWith('Posto 14')?14:12,fat=`FAT-${u}-2026-${x.pe.startsWith('set')?'09':'10'}${x.pe.startsWith('16')?'B':'A'}`;
 openModal(`${mh('Comprovante de pagamento · '+esc(x.p)+' · '+esc(x.pe))}<div class="mb"><div class="r26-doc"><div class="r26-doc-h"><div><b style="font-size:15px">Comprovante de pagamento</b><br>${esc(c.forma)} · ${esc(c.h)}</div><div style="text-align:right">Fatura <b>${fat}</b><br>Situação: <b>Pago</b></div></div>
 ${tabela(['Campo','Valor'],[['Pagador',x.p],['Recebedor','DeoClinic Laboratório Central'],['Valor pago',c.v],['Forma',c.forma],['Identificador da transação',c.aut],['Registrado por',c.por]].map(([a,b])=>`<tr data-det="0">${td('Campo',`<b>${esc(a)}</b>`)}${td('Valor',`<span class="${/transação/.test(a)?'mono':''}">${esc(b)}</span>`)}</tr>`))}
 <p class="tl" style="margin:8px 0 0;color:#555">Comprovante anexado pelo posto e conferido na conciliação bancária.</p></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="psFatura(${i})">Ver fatura</button><button class="btn" onclick="toast('Comprovante enviado à impressora')">${I.print} Imprimir</button></div>`,'wide')}
if(typeof psDetalhe==='function'){const _d=psDetalhe;psDetalhe=function(i){const x=PS_LISTA[i],od=openDrawer;openDrawer=function(t,h){h=String(h);
  if(R26_PS_ST[x&&x.s])h=h.replace(/<span class="badge neutral">[^<]*<\/span>/,`<span class="badge ${R26_PS_ST[x.s]}">${esc(x.s)}</span>`);
  if(x&&x.s==='Pago')h=h.replace('>Exportar demonstrativo</button>',`>Exportar demonstrativo</button><button class="btn sec" onclick="closeDrawer();r26PsComp(${i})">Comprovante de pagamento</button>`);
  if(x&&x.s==='Aguardando retorno do posto')h=h.replace('>Responder contestação</button>','>Ver contestação</button>');
  return od.call(this,t,h)};try{return _d.apply(this,arguments)}finally{openDrawer=od}}}
/* 714: respondida a contestação, a situação vira "Aguardando retorno do posto" */
if(typeof ft21PsOk==='function'){const _o=ft21PsOk;ft21PsOk=function(){const r=_o.apply(this,arguments);if(r){const p=PS_LISTA.find(x=>x.x==='c');if(p){p.s='Aguardando retorno do posto';r26Aud('Acerto entre postos',`${p.p} · ${p.pe}: situação mudou para "Aguardando retorno do posto" depois da resposta à contestação`);try{if(r26Hash()==='#postos')reView()}catch(e){}}}return r}}

/* ==========================================================================
   APOIO · 718 a 724
   ========================================================================== */
const R26_AP_TUBOS={
 'PAR-1029':[['10-00018260-01-01','Severino Alves','GENE','aguardando · prazo 18/11','info'],['10-00018262-02-01','Teresa Cristina Moura','VITD','aguardando · prazo 08/11','info'],['10-00018263-01-01','Pedro Henrique Alves','FERR','aguardando · prazo 07/11','info']],
 'DB-1028':[['12-00002211-01-01','Rita de Cássia Lins','VITD','voltou · 2 dias','ok'],['12-00002210-01-01','Severino Alves','GENE','aguardando · prazo 18/11','info'],['10-00018250-02-01','Larissa Monteiro','FERR','voltou · 1 dia','ok'],['14-00004490-01-01','Joana Darc Pereira','VITD','fora do prazo · 4 dias','err']],
 'PAR-1027':[['10-00018201-01-01','Josefa Barros','TSH','voltou · 2 dias','ok'],['10-00018202-01-01','Helena Martins','VITD','voltou · 3 dias','ok']],
 'DB-1024':[['14-00004470-01-01','Edvaldo Pires','GENE','voltou · 6 dias','ok'],['14-00004471-01-01','Luana Ferreira Castro','VITD','fora do prazo · 5 dias','err']]};
const r26ApTubos=l=>R26_AP_TUBOS[l]||[];
let R26_AP_Q='';
function r26ApFiltra(l){const q=semAc(R26_AP_Q.trim()),d=soDig(R26_AP_Q);if(!q)return l;
 return l.filter(x=>semAc(x.l).includes(q)||(d&&soDig(x.l).includes(d))||r26ApTubos(x.l).some(t=>semAc(t[1]).includes(q)||(d&&soDig(t[0]).includes(d))))}
function r26ApLinhas(){const f=FILTROS.ap||{},l=r26ApFiltra(AP_LOTES.filter(x=>(!f.situacao||x.s===f.situacao)&&(!f.apoio||x.a===f.apoio)));
 if(!l.length)return vazioLinha(8,'Nenhum lote encontrado',R26_AP_Q?'Ninguém com “'+esc(R26_AP_Q)+'” no lote ou no paciente.':'Mude os filtros.');
 const q=semAc(R26_AP_Q.trim());
 return l.map(x=>{const ach=q?r26ApTubos(x.l).filter(t=>semAc(t[1]).includes(q)||soDig(t[0]).includes(soDig(R26_AP_Q)||'#')):[];
  return `<tr class="clk" onclick="apLote('${x.l}')">${td('Lote',`<span class="mono">${x.l}</span>${ach.length?`<small class="tl" style="display:block">${ach.map(t=>esc(t[1])).join(', ')}</small>`:''}`)}${td('Apoio',x.a)}${td('Tubos',x.t)}${td('Enviado',x.e)}${td('Retornados',x.r)}${td('Fora do prazo',x.f==='1'?`<span class="prazo-err">1</span>`:x.f)}${td('Situação',`<span class="badge ${x.s==='Concluído'?'ok':x.s==='Parcial'?'warn':'info'}">${x.s}</span>`)}${td('',x.x?`<button class="btn sm sec" onclick="event.stopPropagation();toast('Cobrança enviada ao apoio pela tela; registrada')">Cobrar</button>`:`<button class="btn sm ghost" onclick="event.stopPropagation();apLote('${x.l}')">Detalhes</button>`)}</tr>`}).join('')}
/* 724: a busca filtra enquanto digita (lote, nome do paciente ou números do tubo) */
function r26ApBusca(v){R26_AP_Q=v||'';const tb=document.querySelector('#view table tbody');if(tb)tb.innerHTML=r26ApLinhas()}
if(typeof VIEWS.apoio==='function'){const _v=VIEWS.apoio;VIEWS.apoio=function(){let h=_v.apply(this,arguments);
 h=h.replace(/(<div class="fbar" id="fb-ap"><div class="inwrap"[^>]*>[\s\S]*?<input class="in" placeholder="Lote ou paciente" aria-label="Lote ou paciente" value=")[^"]*(" oninput=")[^"]*"/,(m,a,b)=>`${a}${esc(R26_AP_Q)}${b}r26ApBusca(this.value)"`);
 h=h.replace(/(<table[^>]*>[\s\S]*?<tbody>)[\s\S]*?(<\/tbody>)/,(m,a,b)=>a+r26ApLinhas()+b);
 /* 722: "Enviados no mês" abre os atendimentos enviados */
 h=h.replace(/<div class="m\s*"\s*><div class="lab">Enviados no mês<\/div>/,`<div class="m  clk" onclick="r26ApEnviados()" role="button" tabindex="0" onkeydown="if(event.key==='Enter')r26ApEnviados()" title="Clique para ver os atendimentos enviados"><div class="lab">Enviados no mês</div>`);
 return h}}
function r26ApEnviados(){const it=AP_LOTES.flatMap(l=>r26ApTubos(l.l).map(t=>({l,t})));
 listaDrawer('Enviados no mês · '+it.length+' tubos de exemplo',it.map(({l,t})=>`<span style="display:flex;gap:8px;align-items:center;justify-content:space-between"><b>${esc(t[1])}</b><span class="badge ${t[4]}">${esc(t[3].split(' ·')[0])}</span></span><small><span class="mono">${t[0].slice(0,11)}</span> · ${esc(EX[t[2]]?EX[t[2]].n:t[2])} · lote ${l.l} (${l.a}) · ${esc(l.e)}</small>`),'Atendimentos com exame enviado ao apoio no mês (418 no total; aqui, os de exemplo). Clique para abrir o atendimento.');
 setTimeout(()=>{try{document.querySelectorAll('#drawer .db .at-row,#drawer .db .at-list>div').forEach((r,i)=>{const x=it[i];if(!x)return;r.classList.add('clk');r.setAttribute('role','button');r.setAttribute('tabindex','0');r.onclick=()=>{closeDrawer();const p=x.t[0].slice(0,11);if(typeof ATENDS!=='undefined'&&ATENDS.some(a=>a.p===p)&&typeof atFicha==='function')atFicha(p);else apLote(x.l.l)}})}catch(e){}},0)}
/* 718 a 721: guia de remessa e etiquetas de verdade */
if(typeof apLote==='function'){const _a=apLote;apLote=function(id){const od=openDrawer;openDrawer=function(t,h){const x=AP_LOTES.find(l=>l.l===id)||AP_LOTES[0],tb=r26ApTubos(x.l);h=String(h)
  .replace(/<h4 style="margin-top:10px">Tubos do lote<\/h4><div class="at-list">[\s\S]*?<\/div><div class="row" style="margin-top:12px;gap:6px">/,`<h4 style="margin-top:10px">Tubos do lote</h4><div class="at-list">${tb.map(([c,n,e,s,k])=>`<div class="at-row"><div class="grow"><span class="mono">${c}</span><small>${esc(n)} · ${esc(EX[e]?EX[e].n:e)} · ${esc(s)}</small></div><span class="badge ${k}">${esc(s.split(' ·')[0])}</span></div>`).join('')}</div><div class="row" style="margin-top:12px;gap:6px">`)
  .replace(`<button class="btn sec" onclick="toast('Guia de remessa reimpressa')">Guia de remessa</button>`,`<button class="btn sec" onclick="r26ApGuia('${x.l}')">Guia de remessa</button>`)
  .replace(`<button class="btn ghost" onclick="toast('Etiquetas do apoio reimpressas')">Etiquetas</button>`,`<button class="btn ghost" onclick="r26ApEtq('${x.l}')">Etiquetas</button>`);return od.call(this,t,h)};try{return _a.apply(this,arguments)}finally{openDrawer=od}}}
function r26ApGuia(id){const x=AP_LOTES.find(l=>l.l===id);if(!x)return;const tb=r26ApTubos(id);
 openModal(`${mh('Guia de remessa · '+esc(x.l))}<div class="mb"><div class="r26-doc"><div class="r26-doc-h"><div><b style="font-size:15px">GUIA DE REMESSA DE AMOSTRAS</b><br>DeoClinic · Laboratório Central · Unidade 10</div><div style="text-align:right">Nº <b>${x.l.slice(-4)}</b> · Lote <b>${esc(x.l)}</b><br>Destino: <b>${esc(x.a)}</b><br>Enviado: ${esc(x.e)}</div></div>
 ${tabela(['Tubo','Paciente','Exame','Material'],tb.map(([c,n,e])=>`<tr data-det="0">${td('Tubo',`<span class="mono">${c}</span>`)}${td('Paciente',esc(n))}${td('Exame',esc(EX[e]?EX[e].n:e))}${td('Material',esc(EX[e]&&EX[e].m||'Soro'))}</tr>`))}
 <p style="margin:8px 0 0">Total: <b>${tb.length} de ${esc(x.t)} tubo(s)</b> (exemplo) · transporte em caixa 2–8 °C · temperatura na saída: 5,1 °C.</p>
 <div class="r26-ass"><div>Responsável pelo envio</div><div>Recebido pelo apoio (nome, data e hora)</div></div></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="r26ApEtq('${x.l}')">Etiquetas</button><button class="btn" onclick="toast('Guia de remessa ${esc(x.l)} enviada à impressora')">${I.print} Imprimir guia</button></div>`,'wide')}
let R26_AP_SEL={};
function r26ApEtq(id){const tb=r26ApTubos(id);if(!R26_AP_SEL[id])R26_AP_SEL[id]=new Set();const S=R26_AP_SEL[id];
 openModal(`${mh('Etiquetas do lote '+esc(id))}<div class="mb"><p class="tl" style="margin:0">Marque as etiquetas para reimprimir, ou reimprima todas. A reimpressão fica registrada.</p>
 <label class="check"><input type="checkbox" ${S.size===tb.length&&tb.length?'checked':''} onchange="r26ApEtqTodas('${id}',this.checked)"> Selecionar todas (${tb.length})</label>
 <div class="r26-etqs">${tb.map(([c,n,e],i)=>`<label class="r26-etq ${S.has(i)?'on':''}"><input type="checkbox" ${S.has(i)?'checked':''} onchange="r26ApEtqSel('${id}',${i},this.checked)"><span><b>${esc(n)}</b><br>${esc(EX[e]?EX[e].n:e)} · ${esc(id.split('-')[0]==='PAR'?'Pardini':'DB')}<span class="bc" aria-hidden="true"></span><span class="mono">${c}</span></span></label>`).join('')}</div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" ${S.size?'':'disabled'} onclick="r26ApEtqImp('${id}',false)">Reimprimir selecionadas (${S.size})</button><button class="btn" onclick="r26ApEtqImp('${id}',true)">${I.print} Reimprimir todas</button></div>`,'wide')}
function r26ApEtqSel(id,i,on){const S=R26_AP_SEL[id];if(on)S.add(i);else S.delete(i);r26ApEtq(id)}
function r26ApEtqTodas(id,on){const S=R26_AP_SEL[id];S.clear();if(on)r26ApTubos(id).forEach((_,i)=>S.add(i));r26ApEtq(id)}
function r26ApEtqImp(id,todas){const tb=r26ApTubos(id),S=R26_AP_SEL[id],n=todas?tb.length:S.size;if(!n){toast('Marque pelo menos uma etiqueta','warn');return}r26Aud('Apoio',`Reimpressão de ${n} etiqueta(s) do lote ${id}${todas?' (todas)':': '+[...S].map(i=>tb[i][0]).join(', ')}`);S.clear();closeModal();toast(`${n} etiqueta(s) do lote ${id} enviada(s) à impressora; registrado`)}
/* 723: contestar diferenças pede o motivo */
if(typeof apConferir==='function'){const _c=apConferir;apConferir=function(){const om=openModal;openModal=function(h,c){h=String(h).replace(`<button class="btn" onclick="closeModal();toast('Contestação enviada ao DB; valor conferido alimenta o custo do mês')">Contestar diferenças</button>`,`<button class="btn" onclick="r26ApContestar()">Contestar diferenças</button>`);return om.call(this,h,c)};try{return _c.apply(this,arguments)}finally{openModal=om}}}
function r26ApContestar(){openModal(`${mh('Contestar diferenças · DB · outubro')}<div class="mb"><p class="tl" style="margin:0">Diferença de <b>R$ 378,00</b> em 3 itens: cobrado e não enviado, preço diferente da tabela e enviado e não cobrado.</p>
 <div class="field" id="r26ApMf"><label for="r26ApMot">Motivos da contestação <span class="req">*</span></label><textarea class="in" id="r26ApMot" rows="4" placeholder="Ex.: Vitamina D do tubo 12-00002230 foi cobrada e não foi enviada; Ferritina com preço acima da tabela de custo (4 exames)"></textarea><span class="msg" id="r26ApMsg">Vai junto com a contestação para o apoio e fica no histórico.</span></div></div>
 <div class="mf"><button class="btn ghost" onclick="apConferir()">Voltar</button><button class="btn" onclick="r26ApContestarOk()">Enviar contestação</button></div>`);setTimeout(()=>{const t=r26El('r26ApMot');if(t&&t.focus)t.focus()},0)}
function r26ApContestarOk(){const t=r26El('r26ApMot'),v=t?String(t.value||'').trim():'';if(v.length<10){const f=r26El('r26ApMf');if(f)f.classList.add('err');const m=r26El('r26ApMsg');if(m)m.textContent='Escreva os motivos (pelo menos 10 letras).';toast('Escreva os motivos da contestação','warn');return false}
 r26Aud('Apoio',`Contestação da fatura do DB (outubro) enviada. Motivos: ${v}`);closeModal();toast('Contestação enviada ao DB com os motivos; o valor conferido alimenta o custo do mês');return true}

/* ==========================================================================
   PACIENTES · 743 a 745: sem a frase e sem o "Recepção" no topo
   ========================================================================== */
if(typeof VIEWS.pacientes==='function'){const _v=VIEWS.pacientes;VIEWS.pacientes=function(){return String(_v.apply(this,arguments)).replace(/<div class="pagehead"><div><div class="crumbs">Recepção<\/div>(<h1>Pacientes<\/h1>)<p style="color:var\(--fg2\);margin-top:4px">[^<]*<\/p>/,'<div class="pagehead r26-pac-ph"><div>$1')}}

/* ==========================================================================
   PRÉ-ATENDIMENTO · 747: ao localizar quem tem e-ticket ou pendência, abre um aviso e faz o check-in
   ========================================================================== */
function r26PaSel(cpf){RC.pa.cpf=cpf;const p=rcPacCpf(cpf),l=typeof rcCkItens==='function'?rcCkItens(p):[];if(!l.length){reView();return}
 const et=l.filter(x=>x.k==='ag'),pe=l.filter(x=>x.k==='at');rcCheckin(cpf);
 openModal(`<div class="ret ok"><button class="ibtn plain ret-x" aria-label="Fechar" onclick="closeModal()">${I.x}</button>${FIG('ok','grande')}<h3>${et.length?'E-ticket validado':'Pendência encaminhada'}</h3>
 <p><b>${esc(p.n)}</b> está em <b>espera (check-in)</b>. Não precisa gerar senha.</p>
 ${et.length?`<div class="alert ok" style="text-align:left"><span><b>E-ticket validado:</b> ${et.map(x=>esc(rcProcsTxt(x.procs))+(x.h?' às '+x.h:'')).join('; ')}. Procedimentos pagos e agendados: a ficha é gerada na sala.</span></div>`:''}
 ${pe.length?`<div class="alert info" style="text-align:left"><span><b>Saindo da pendência:</b> ${pe.map(x=>esc(rcProcsTxt(x.procs))+(x.h?' às '+x.h:'')).join('; ')}. Os procedimentos foram retirados da pendência e encaminhados para a espera (check-in).</span></div>`:''}
 <div class="ret-acts"><button class="btn" onclick="closeModal()">Entendi</button></div></div>`,'retorno ok')}
if(typeof rcPaResultados==='function'){const _r=rcPaResultados;rcPaResultados=function(){return _r.apply(this,arguments).replace(/onclick="RC\.pa\.cpf='([^']*)';reView\(\)"/g,`onclick="r26PaSel('$1')"`)}}

/* ==========================================================================
   LISTAGEM DE SENHAS · 751, 754, 758, 759 e 760
   ========================================================================== */
/* 751: depois da terceira rechamada, a senha volta para Aguardando e a tela vai junto */
if(typeof rcRechamar==='function'){const _r=rcRechamar;rcRechamar=function(id){const r=_r.apply(this,arguments);const s=RC.senhas.find(x=>x.id===id);if(s&&s.st==='aguardando'){RC.tab='aguardando';RC.foco=s.id;try{reView()}catch(e){}}return r}}
/* 754: Iniciar já abre o cadastro do paciente; 758: Atendimento não pede o CPF de novo */
function r26SenhaPac(s){if(!s)return null;if(s.cpf){const p=rcPacCpf(s.cpf);if(p)return p}if(s.pac){const n=semAc(s.pac);return PACIENTES.find(p=>p.ativo!==false&&semAc(p.n)===n)||null}return null}
function r26SenhaAtender(id){const s=RC.senhas.find(x=>x.id===id);if(!s)return;const p=r26SenhaPac(s);
 if(p&&p.cpf){naNovoSenha(p.cpf,id);if(r26Hash()!=='#novo-atendimento')location.hash='#novo-atendimento';return}
 naNovoSenha('',id);
 if(s.pac){/* sem cadastro achado: abre o cadastro já com o nome da senha, sem nova busca */NA.buscou=true;NA.semCpf=false;NA.pacExiste=false;NA.pac={cpf:'',n:s.pac,ns:'',dn:'',sx:'',mae:'',tel:'',email:'',resp:'',ativo:true,cron:['','']};NA.passo=1}
 if(r26Hash()!=='#novo-atendimento')location.hash='#novo-atendimento';else naRender(true);
 if(s.pac)setTimeout(()=>toast(`${s.pac.split(' ')[0]} ainda não tem cadastro: complete os dados (o nome veio da senha)`,'warn'),60)}
if(typeof rcIniciar==='function'){const _i=rcIniciar;rcIniciar=function(id){const r=_i.apply(this,arguments);const s=RC.senhas.find(x=>x.id===id);if(s&&s.st==='atendimento')r26SenhaAtender(id);return r}}
if(typeof r17SenhaAcoes==='function'){const _a=r17SenhaAcoes;r17SenhaAcoes=function(s){return String(_a.apply(this,arguments)).replace(/onclick="naNovoSenha\('[^']*',(\d+)\)"/g,'onclick="r26SenhaAtender($1)"')}}
if(typeof rcSenhaAcoes==='function'){const _a=rcSenhaAcoes;rcSenhaAcoes=function(s){return String(_a.apply(this,arguments)).replace(/onclick="naNovoSenha\('[^']*',(\d+)\)"/g,'onclick="r26SenhaAtender($1)"')}}
/* 759 e 760: saem as abas Concluídos e Cancelados (as senhas continuam nos relatórios e na auditoria) */
if(typeof VIEWS.senhas==='function'){const _v=VIEWS.senhas;VIEWS.senhas=function(){if(RC&&(RC.tab==='finalizada'||RC.tab==='cancelada'))RC.tab='aguardando';
 return _v.apply(this,arguments).replace(/<button class="tab [^"]*" onclick="RC\.tab='finalizada';reView\(\)">Concluídos <span class="n">\d+<\/span><\/button>/,'').replace(/<button class="tab [^"]*" onclick="RC\.tab='cancelada';reView\(\)">Cancelados <span class="n">\d+<\/span><\/button>/,'')}}

/* ==========================================================================
   COMPONENTE DE PAGAMENTO · 727, 764 (Novo atendimento) e 746 (faturamento após autorizar)
   ========================================================================== */
const R26_FORMAS=['Pix','Dinheiro','Cartão de crédito','Cartão de débito','Boleto'];
const R26P={};
function r26PagIni(k,total,o){const S={k,total:Math.round((+total||0)*100)/100,descT:'R$',desc:'',aj:'',pags:[{f:'Pix',v:r26Moeda(total),parc:'1',aut:''}],auto:true,o:o||{}};R26P[k]=S;return S}
function r26PagCalc(S){const d=r26Num(S.desc),dv=S.descT==='%'?S.total*d/100:d,desc=Math.min(S.total,Math.max(0,Math.round(dv*100)/100)),base=Math.round((S.total-desc)*100)/100,aj=S.o.ajuste?r26Num(S.aj):0,fin=Math.round(base*(1+aj/100)*100)/100,pago=Math.round(S.pags.reduce((s,p)=>s+r26Num(p.v),0)*100)/100,din=S.pags.filter(p=>p.f==='Dinheiro').reduce((s,p)=>s+r26Num(p.v),0);
 const dif=Math.round((fin-pago)*100)/100,troco=dif<0&&din>=-dif?-dif:0;return {desc,base,aj,fin,pago,dif,troco,pct:S.total?desc/S.total*100:0}}
function r26PagErro(k){const S=R26P[k];if(!S)return '';const c=r26PagCalc(S);
 if(S.o.gestor&&c.pct>(typeof CFG!=='undefined'?CFG.descLimite:10)+1e-9&&!S.o.gestorOk())return 'O desconto acima de '+CFG.descLimite+'% precisa da senha de um gestor';
 for(const p of S.pags){if(r26Num(p.v)<=0)return 'Informe o valor de cada forma de pagamento (ou tire a forma vazia)';if(/^Cartão/.test(p.f)&&!String(p.aut||'').trim())return 'Informe o código de autorização do cartão ('+p.f.toLowerCase()+')'}
 if(c.dif>0.004)return `Ainda falta receber ${fmt(c.dif)}: a soma dos pagamentos tem que fechar o valor final`;
 if(c.dif<-0.004&&!c.troco)return `Os pagamentos passam ${fmt(-c.dif)} do valor final: ajuste os valores (troco só no dinheiro)`;return ''}
function r26PagHtml(k){const S=R26P[k],c=r26PagCalc(S),o=S.o,lim=typeof CFG!=='undefined'?CFG.descLimite:10,acima=o.gestor&&c.pct>lim+1e-9;
 const fp=(p,i)=>{const cred=p.f==='Cartão de crédito',card=/^Cartão/.test(p.f),v=r26Num(p.v),np=Math.max(1,+p.parc||1);
  return `<div class="r26-pg-l"><div class="field"><label for="r26f_${k}_${i}">Forma ${S.pags.length>1?i+1:''}</label><select class="in" id="r26f_${k}_${i}" onchange="r26PagSetP('${k}',${i},'f',this.value)">${R26_FORMAS.map(f=>`<option ${f===p.f?'selected':''}>${f}</option>`).join('')}</select></div>
  <div class="field"><label for="r26v_${k}_${i}">Valor (R$)</label><input class="in" id="r26v_${k}_${i}" inputmode="decimal" value="${esc(p.v)}" placeholder="0,00" onchange="r26PagSetP('${k}',${i},'v',this.value)"></div>
  ${cred?`<div class="field"><label for="r26p_${k}_${i}">Parcelas</label><select class="in" id="r26p_${k}_${i}" onchange="r26PagSetP('${k}',${i},'parc',this.value)">${Array.from({length:12},(_,j)=>j+1).map(n=>`<option value="${n}" ${n===np?'selected':''}>${n}x${v?' de '+fmt(v/n):''}</option>`).join('')}</select></div>`:'<div class="r26-vz"></div>'}
  ${card?`<div class="field"><label for="r26a_${k}_${i}">Código de autorização <span class="req">*</span></label><input class="in" id="r26a_${k}_${i}" value="${esc(p.aut)}" placeholder="Ex.: 123456" autocomplete="off" onchange="r26PagSetP('${k}',${i},'aut',this.value)"></div>`:'<div class="r26-vz"></div>'}
  ${S.pags.length>1?`<button type="button" class="tq-x" aria-label="Tirar a forma ${i+1}" onclick="r26PagDel('${k}',${i})"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`:'<span class="r26-vz"></span>'}</div>`};
 return `<div class="r26-pag" id="r26pag_${k}"><div class="r26-pag-g">
 <div class="field"><label>${o.ajuste?'Valor total a faturar':'Subtotal'}</label><input class="in r26-ro" readonly value="${fmt(S.total)}" aria-label="${o.ajuste?'Valor total a faturar':'Subtotal'}"></div>
 <div class="field"><label for="r26d_${k}">Desconto ${info(o.gestor?'Em reais (valor fixo) ou em porcentagem. Até '+lim+'% a recepção dá sozinha; acima disso, precisa da senha de um gestor. Fica registrado quem deu e quem autorizou.':'Em reais (valor fixo) ou em porcentagem. Fica registrado no faturamento.')}</label><div class="r26-desc"><div class="r26-seg" role="group" aria-label="Tipo de desconto"><button type="button" aria-pressed="${S.descT==='R$'}" onclick="r26PagSet('${k}','descT','R$')">R$</button><button type="button" aria-pressed="${S.descT==='%'}" onclick="r26PagSet('${k}','descT','%')">%</button></div><input class="in" id="r26d_${k}" inputmode="decimal" value="${esc(S.desc)}" placeholder="${S.descT==='%'?'0':'0,00'}" onchange="r26PagSet('${k}','desc',this.value)"></div>${c.desc?`<span class="msg">− ${fmt(c.desc)} (${r26Moeda(c.pct).replace(',00','')}%)</span>`:''}</div>
 ${o.ajuste?`<div class="field"><label for="r26j_${k}">Ajuste (%) ${info('Acréscimo ou redução em porcentagem sobre o valor com desconto (ex.: 5 para taxa da maquininha). Use número negativo para reduzir.')}</label><input class="in" id="r26j_${k}" inputmode="decimal" value="${esc(S.aj)}" placeholder="0" onchange="r26PagSet('${k}','aj',this.value)"></div>
 <div class="field"><label>Valor ajustado</label><input class="in r26-ro" readonly value="${fmt(c.fin)}" aria-label="Valor ajustado"></div>`:''}</div>
 ${acima?(o.gestorOk()?`<div class="alert ok"><span>Desconto acima de ${lim}% autorizado pelo gestor. Fica registrado.</span></div>`:`<div class="alert warn"><span>Desconto acima de ${lim}%: precisa da senha de um gestor.</span></div><button class="btn sec sm" style="align-self:flex-start" onclick="${o.gestorFn||'naGestor()'}">Pedir autorização do gestor</button>`):''}
 <h4 style="margin:0">Formas de pagamento</h4>${S.pags.map(fp).join('')}
 <div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn sm sec" onclick="r26PagAdd('${k}')">${I.plus} Adicionar forma de pagamento</button>${c.dif>0.004&&S.pags.length?`<button type="button" class="btn sm ghost" onclick="r26PagResto('${k}')">Lançar o que falta (${fmt(c.dif)}) na última forma</button>`:''}</div>
 <div class="r26-pag-res" role="status" aria-live="polite"><span>Valor final <b>${fmt(c.fin)}</b></span><span>Recebido <b>${fmt(c.pago)}</b></span>${Math.abs(c.dif)<0.005?'<span class="ok">✓ Sem diferença</span>':c.troco?`<span class="ok">Troco ${fmt(c.troco)}</span>`:c.dif>0?`<span class="err">Falta ${fmt(c.dif)}</span>`:`<span class="err">Passou ${fmt(-c.dif)}</span>`}</div></div>`}
function r26PagPinta(k){const S=R26P[k],el=r26El('r26pag_'+k);if(S&&S.o.onchange)try{S.o.onchange(S,r26PagCalc(S))}catch(e){}if(el)el.outerHTML=r26PagHtml(k)}
function r26PagAuto(S){if(S.auto&&S.pags.length===1)S.pags[0].v=r26Moeda(r26PagCalc({...S,pags:[]}).fin)}
function r26PagSet(k,f,v){const S=R26P[k];if(!S)return;S[f]=v;r26PagAuto(S);r26PagPinta(k)}
function r26PagSetP(k,i,f,v){const S=R26P[k];if(!S||!S.pags[i])return;S.pags[i][f]=v;if(f==='v')S.auto=false;if(f==='v'&&v)S.pags[i].v=r26Moeda(r26Num(v));r26PagPinta(k)}
function r26PagAdd(k){const S=R26P[k];if(!S)return;const c=r26PagCalc(S);S.auto=false;S.pags.push({f:'Cartão de crédito',v:c.dif>0?r26Moeda(c.dif):'',parc:'1',aut:''});r26PagPinta(k)}
function r26PagDel(k,i){const S=R26P[k];if(!S||S.pags.length<2)return;S.pags.splice(i,1);r26PagPinta(k)}
function r26PagResto(k){const S=R26P[k];if(!S||!S.pags.length)return;const c=r26PagCalc(S),p=S.pags[S.pags.length-1];p.v=r26Moeda(r26Num(p.v)+c.dif);S.auto=false;r26PagPinta(k)}
const r26PagTxt=S=>S.pags.map(p=>`${p.f} ${fmt(r26Num(p.v))}${p.f==='Cartão de crédito'&&+p.parc>1?' em '+p.parc+'x':''}${p.aut?' (aut. '+p.aut+')':''}`).join(' + ');

/* ---------- Novo atendimento: cartão Pagamento com desconto em R$ ou %, parcelas, código de autorização e várias formas ---------- */
function r26NaPag(){if(!NA||NA.modo!=='atendimento')return null;const tot=Math.round(naTotal()*100)/100;let S=NA.r26pag;
 if(!S||S.na!==NA){S=r26PagIni('na',tot,{gestor:true,gestorOk:()=>!!NA.descAut,gestorFn:'naGestor()',onchange:(S,c)=>{const p=Math.round(c.pct*100)/100;if(Math.abs((+NA.desc||0)-p)>0.001)NA.descAut=false;NA.desc=p;const f=(S.pags[0]||{}).f||'Pix';NA.forma=/^Cartão/.test(f)?'Cartão':f==='Boleto'?'Pix':f}});S.na=NA;NA.r26pag=S}
 else R26P.na=S;
 if(Math.abs(S.total-tot)>0.004){S.total=tot;r26PagAuto(S)}return S}
if(typeof naP3==='function'){const _p3=naP3;naP3=function(){let h=_p3.apply(this,arguments);if(!NA||NA.modo!=='atendimento'||NA.tipo==='convenio')return h;const S=r26NaPag();if(!S)return h;
 const i=h.indexOf('<div class="card at-card"><h3>Pagamento</h3>'),j=h.indexOf('<div class="card at-card"><h3>Entrega do resultado</h3>');if(i<0||j<i)return h;
 return h.slice(0,i)+(S.total<=0?`<div class="card at-card" id="r26NaPagCard"><h3>Pagamento</h3><div class="alert ok"><span><b>Nada a cobrar:</b> os procedimentos estão cobertos pelo plano ou pacote do paciente.</span></div></div>`:`<div class="card at-card" id="r26NaPagCard"><h3>Pagamento</h3><div class="sub">Particular: por padrão, paga tudo no atendimento. Dá para dividir em várias formas (ex.: metade no Pix e metade no cartão).</div>${r26PagHtml('na')}</div>`)+h.slice(j)}}
if(typeof naGestor==='function'){const _g=naGestor;naGestor=function(){if(NA&&NA.r26pag){const c=r26PagCalc(NA.r26pag);NA.desc=Math.round(c.pct*100)/100}return _g.apply(this,arguments)}}

/* ==========================================================================
   FICHAS DO PACIENTE · 739, 740, 728 e 766: histórico do que foi autorizado, recebido e faturado
   ========================================================================== */
const R26_FICHAS=[];   /* fichas criadas nesta sessão: {prot,n,cpf,data,h,conv,itens,total,pags,st} */
const R26_FAT=[];      /* faturamentos feitos depois de autorizar (746) */
let R26_FP={cpf:'',n:'',ok:null,filtro:''};
function r26FichasDe(n,cpf){const out=[],nn=semAc(n||'');
 R26_FICHAS.filter(f=>semAc(f.n)===nn).forEach(f=>out.push({data:f.data,h:f.h,prot:f.prot,itens:f.itens,conv:f.conv,total:f.total,st:f.conv==='Particular'?'Recebido':'Faturado',det:f.pags?r26PagTxt({pags:f.pags}):'',orig:'Balcão'}));
 (typeof ATENDS!=='undefined'?ATENDS:[]).filter(a=>semAc(a.n)===nn&&!R26_FICHAS.some(f=>f.prot===a.p)).forEach(a=>{const am=(typeof AMOSTRAS!=='undefined'?AMOSTRAS:[]).filter(x=>x.prot===a.p),it=[...new Set(am.flatMap(x=>(x.ex||[]).map(e=>typeof e==='string'?e:e.c||e)))].filter(Boolean);
  out.push({data:'',h:'',prot:a.p,itens:it,conv:a.conv||'Particular',total:null,st:a.orig==='Clínicas'?'Faturado':'Recebido',det:a.tot||'',orig:a.orig||'Balcão'})});
 const ags=(typeof RC!=='undefined'&&RC?RC.ag:[]).concat(typeof AG_CLIN!=='undefined'?AG_CLIN:[]).filter(a=>semAc(a.pac||'')===nn&&(a.autorizado||a.faturado));
 ags.forEach(a=>{const fat=a.faturado||R26_FAT.find(f=>f.src===a);out.push({data:a.data||(typeof RC_HOJE!=='undefined'?RC_HOJE:''),h:a.h||'',prot:a.cod||a.ficha||'',itens:a.itens||[a.proc].filter(Boolean),conv:a.conv||'Particular',total:fat?fat.fin:(a.valor!=null?+a.valor:null),st:fat?'Faturado':'Autorizado',det:fat?r26PagTxt(fat):'aguardando faturamento',orig:'Agenda'})});
 return out}
const R26_FST={Autorizado:'info',Recebido:'ok',Faturado:'acc'};
function r26FichasTabela(l,curto){if(!l.length)return '<p class="tl">Nenhuma ficha ainda: as fichas aparecem aqui quando um procedimento é autorizado, recebido ou faturado.</p>';
 const nomeP=c=>{try{return typeof clProcNome==='function'?clProcNome(c):(EX[c]?EX[c].n:c)}catch(e){return c}};
 return `<div style="overflow-x:auto"><table class="r26-fic" style="min-width:${curto?0:640}px"><thead><tr><th>Ficha</th><th>Procedimentos</th><th>Plano</th><th>Situação</th>${curto?'':'<th>Valor</th><th>Detalhe</th>'}</tr></thead><tbody>${l.map(f=>`<tr data-det="0" class="${f.prot&&R26_FP.ok&&R26_FP.ok.prot===f.prot?'r26-novo':''}">${td('Ficha',`<span class="mono">${esc(f.prot||'—')}</span>${f.data?`<small class="tl" style="display:block">${dmy(f.data)}${f.h?' '+esc(f.h):''}</small>`:''}`)}${td('Procedimentos',f.itens&&f.itens.length?f.itens.map(c=>esc(nomeP(c))).join(', '):'<span class="tl">ver na ficha</span>')}${td('Plano',esc(f.conv))}${td('Situação',`<span class="badge ${R26_FST[f.st]}">${f.st}</span>`)}${curto?'':td('Valor',f.total!=null?fmt(f.total):'—')+td('Detalhe',`<small>${esc(f.det||f.orig)}</small>`)}</tr>`).join('')}</tbody></table></div>`}
function r26FichasAbrir(cpf,n,ok){const p=cpf?PACIENTES.find(x=>x.cpf===cpf):null;R26_FP={cpf:cpf||'',n:(p&&p.n)||n||'',ok:ok||null,filtro:''};try{closeModal()}catch(e){}try{closeDrawer()}catch(e){}if(r26Hash()==='#fichas-paciente')reView();else location.hash='#fichas-paciente'}
try{NAMES['fichas-paciente']='Fichas do paciente';if(typeof PAI!=='undefined')PAI['fichas-paciente']='pacientes';if(typeof DESC!=='undefined')DESC['fichas-paciente']='Histórico de todos os procedimentos autorizados, recebidos e faturados do paciente.'}catch(e){}
VIEWS['fichas-paciente']=function(){const F=R26_FP,p=F.cpf?PACIENTES.find(x=>x.cpf===F.cpf):PACIENTES.find(x=>semAc(x.n)===semAc(F.n||''));const n=(p&&p.n)||F.n;
 if(!n)return `${pageHead('','Fichas do paciente','')}<div class="card at-card"><div class="empty"><h4>Nenhum paciente escolhido</h4><p>Abra as fichas pelo atendimento, pela agenda ou por Pacientes.</p><a class="btn sec" href="#pacientes">Ir para Pacientes</a></div></div>`;
 const todas=r26FichasDe(n,F.cpf),l=F.filtro?todas.filter(f=>f.st===F.filtro):todas,cont=k=>todas.filter(f=>f.st===k).length;
 const ok=F.ok?`<div class="card at-card"><div class="r26-fic-ok">${FIG('ok','fig-sm')}<div class="grow"><h3 style="margin:0">Atendimento concluído</h3><p style="margin:4px 0 0">Protocolo <b class="mono">${esc(F.ok.prot)}</b>. ${esc(n.split(' ')[0])} vai para a fila${F.ok.canais&&F.ok.canais.length?'; entrega por '+esc(F.ok.canais.join(' e ')):''}.${F.ok.pag?' Pagamento: '+esc(F.ok.pag)+'.':''}</p></div><div class="row" style="gap:6px;flex-wrap:wrap">${typeof docComprovante==='function'?`<button class="btn sec" onclick="docComprovante()">${I.print} Comprovante</button>`:''}${typeof docDeclaracao==='function'?`<button class="btn sec" onclick="docDeclaracao()">${I.doc} Declaração</button>`:''}<button class="btn" onclick="naNovo('atendimento')">${I.plus} Novo atendimento</button></div></div></div>`:'';
 return `${pageHead('Pacientes','Fichas do paciente',`${esc(n)}${p?` · ${p.cpf?'<span class="mono">'+r17CpfCurto(p.cpf)+'</span>':'sem CPF'} · ${p.dn?dmy(p.dn):''}`:''}`,`${p&&p.cpf?`<button class="btn sec" onclick="rcPacEditar('${p.cpf}')">${I.edit} Editar cadastro</button><button class="btn" onclick="naNovo('atendimento','${p.cpf}',false,true)">${I.plus} Novo atendimento</button>`:''}`)}
${ok}<div class="card at-card"><div class="row" style="justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">Histórico de fichas</h3><div class="row" style="gap:6px;flex-wrap:wrap">${[['','Todas',todas.length],['Autorizado','Autorizadas',cont('Autorizado')],['Recebido','Recebidas',cont('Recebido')],['Faturado','Faturadas',cont('Faturado')]].map(([k,t,c])=>chip(`${t} (${c})`,F.filtro===k,`R26_FP.filtro='${k}';reView()`)).join('')}</div></div>
<p class="tl" style="margin:0">Tudo o que foi autorizado, recebido e faturado para o paciente. As opções de cada ficha (reimprimir, estornar, recibo) entram nas próximas etapas.</p>${r26FichasTabela(l)}</div>`};
/* 739: aba Fichas do cartão Paciente vira o histórico; 738: aba Dados em cartões */
function r26PacDados(p,cpf){const c=(l,v,cls)=>`<div class="r26-dado ${cls||''}"><span>${l}</span><b>${v}</b></div>`;
 return `<div class="r26-dados"><div><h5>Identificação</h5><div class="r26-dg">${c('Nome',esc(p.n)+(p.ns?` <small class="tl">(nome social: ${esc(p.ns)})</small>`:''),'dest')}${c('CPF',cpf?`<span class="mono">${r17CpfCurto(cpf)}</span>`:'Sem CPF')}${c('Nascimento',p.dn?`${dmy(p.dn)} · ${idade(p.dn)} anos`:'Não informado')}${c('Sexo',p.sx==='F'?'Feminino':p.sx==='M'?'Masculino':'Não informado')}${c('Nome da mãe',p.mae?esc(p.mae):'Falta no cadastro',p.mae?'':'falta')}</div></div>
 <div><h5>Contato</h5><div class="r26-dg">${c('Telefone',esc(p.tel||'Não informado'))}${c('E-mail',esc(p.email||'Não informado'))}${p.resp?c('Responsável',esc(p.resp)):''}</div></div></div>`}
if(typeof naPacCard==='function'){const _c=naPacCard;naPacCard=function(){let h=_c.apply(this,arguments);if(!h||!NA||!NA.pac||!NA.pac.n)return h;const p=NA.pac,ab=typeof NA_PAC_ABA!=='undefined'?NA_PAC_ABA:'dados';
 const fic=r26FichasDe(p.n,NA.cpf);h=h.replace(/(onclick="NA_PAC_ABA='fichas';naRender\(\)">Fichas) <span class="tl">\d+<\/span>/,`$1 <span class="tl">${fic.length}</span>`);
 const k=h.indexOf('</div>',h.indexOf('<div class="tabs" role="tablist">'));if(k<0)return h;const corpoIni=k+6,corpoFim=h.lastIndexOf('</div>');
 const corpo=ab==='fichas'?`${r26FichasTabela(fic.slice(0,6),true)}<div class="row" style="margin-top:8px"><button class="btn sm sec" onclick="r26FichasAbrir('${NA.cpf||''}','${esc(p.n).replace(/'/g,'&#39;')}')">Abrir as fichas do paciente${fic.length>6?' ('+fic.length+')':''}</button></div>`:ab==='dados'?r26PacDados(p,NA.cpf)+(typeof rc21FidLinha==='function'?rc21FidLinha():''):null;
 return corpo==null?h:h.slice(0,corpoIni)+corpo+h.slice(corpoFim)}}
/* 740: "Fichas de atendimento" nos detalhes do agendamento leva às fichas do paciente */
if(typeof rcDetPinta==='function'){const _p=rcDetPinta;rcDetPinta=function(){const r=_p.apply(this,arguments);try{const m=r26El('modal'),D=RC.det;if(!m||typeof m.innerHTML!=='string'||!D)return r;let h=m.innerHTML;const p=D.p||{};
  h=h.replace(/<button class="btn sm sec[^"]*"( aria-pressed="[a-z]+")? onclick="rcDetPainel\('guias'\)">Fichas de atendimento<\/button>/,`<button class="btn sm sec" onclick="r26FichasAbrir('${esc(p.cpf||D.cpf||'')}','${esc(p.n||'').replace(/'/g,'&#39;')}')">Fichas de atendimento</button>`);
  if(h!==m.innerHTML)m.innerHTML=h;
  /* 749: os campos em dois blocos (paciente e atendimento) */
  const g=m.querySelector&&m.querySelector('.rc21-det-g');if(g&&g.children&&!m.querySelector('.r26-det-b')){const fs=[...g.children],ehPac=f=>!!f.querySelector('#rc21DetN,#rc21DetD,#rcDetT'),pac=fs.filter(ehPac),at=fs.filter(f=>!ehPac(f));
   if(pac.length&&at.length){const bloco=(t,l)=>{const b=document.createElement('div');b.className='r26-det-b';b.innerHTML='<h5>'+t+'</h5>';const fg=document.createElement('div');fg.className='formgrid';l.forEach(f=>{if(f.querySelector('#rc21DetN,#rcDetP'))f.classList.add('r26-w2');f.style.gridColumn='';fg.appendChild(f)});b.appendChild(fg);return b};
    const a=bloco('Paciente',pac),b=bloco('Atendimento',at);b.style.marginTop='10px';g.replaceWith(a);a.after(b)}}
 }catch(e){}return r}}

/* ==========================================================================
   NOVO ATENDIMENTO · 725, 726, 728, 755 a 757, 761, 763, 764 e 766
   ========================================================================== */
/* 755 a 757: saem as dicas de CPF de teste e a chave de configuração (os CPFs de teste ficam no guia, botão ?) */
if(typeof naP1==='function'){const _p=naP1;naP1=function(){return String(_p.apply(this,arguments)).replace(/<div class="at-hint"><div><b>Planos e pacotes:<\/b>[\s\S]*?<\/label><\/div>/,'').replace(/<div class="at-hint"><div><b>Para testar, digite um destes CPFs:<\/b>[\s\S]*?<\/label><\/div>/,'')}}
try{if(typeof GUIDES!=='undefined')GUIDES['novo-atendimento']=(GUIDES['novo-atendimento']||[]).concat(['CPFs de teste: 123.456.789-09 (orçamento aberto), 987.654.321-00 (sem orçamento), 555.666.777-80 (orçamento vencido), 444.555.666-11 (desativado), 111.444.777-35 (plano família), 246.357.468-59 (pacote pré-natal).'])}catch(e){}
/* 725: o nome da mãe sai do pedido; vem do cadastro (obrigatório, D13) e aparece no topo. Sem ele, o atendimento pede para completar o cadastro. */
function r26MaeFalta(){return NA&&NA.modo==='atendimento'&&NA.pac&&!String(NA.pac.mae||'').trim()}
function r26MaeCompletar(){if(typeof r18rEditarCad==='function'&&NA&&NA.pac){r18rEditarCad();setTimeout(()=>{const e=r26El('pfMae');if(e&&e.focus)e.focus()},60);return}if(NA&&NA.cpf&&typeof rcPacEditar==='function'&&rcPacCpf(NA.cpf)){rcPacEditar(NA.cpf);setTimeout(()=>{const e=r26El('pfMae');if(e&&e.focus)e.focus()},60);return}NA.passo=1;naRender(true);toast('Complete o cadastro com o nome da mãe','warn')}
if(typeof rcPacSalvar==='function'){const _s=rcPacSalvar;rcPacSalvar=function(){const cpf=RC.pEd,r=_s.apply(this,arguments);try{if(NA&&NA.modo==='atendimento'&&cpf&&NA.cpf===cpf){const p=rcPacCpf(cpf);if(p&&NA.pac){NA.pac.mae=p.mae||NA.pac.mae;NA.pac.n=p.n||NA.pac.n;if(r26Hash()==='#novo-atendimento')naRender()}}}catch(e){}return r}}
/* 725 (D13): o cadastro do paciente, no passo 1, pede o nome da mãe (obrigatório) */
if(typeof naCadastro==='function'){const _c=naCadastro;naCadastro=function(){const h=String(_c.apply(this,arguments));if(!NA||NA.modo!=='atendimento'||(NA.pac&&NA.pac.ativo===false))return h;const e=NA.err||{};
 const f=`<div class="field ${e.mae?'err':''}"><label for="naMaeCad">Nome da mãe <span class="req">*</span> ${info('Obrigatório em todo cadastro (decisão D13). Vai para o resultado como está escrito aqui.')}</label><input class="in" id="naMaeCad" value="${esc(NA.pac.mae||'')}" autocomplete="off" oninput="NA.pac.mae=this.value">${e.mae?'<span class="msg">Obrigatório</span>':''}</div>`;
 const m=/<div class="field [^"]*"><label>Nome social/.exec(h);if(m)return h.slice(0,m.index)+f+h.slice(m.index);const k=h.indexOf('<div class="field',h.indexOf('<div class="formgrid">'));return k<0?h:h.slice(0,h.indexOf('</div>',h.indexOf('</label>',k))+6)+f+h.slice(h.indexOf('</div>',h.indexOf('</label>',k))+6)}}
if(typeof naP1Ok==='function'){const _o=naP1Ok;naP1Ok=function(){if(NA&&NA.modo==='atendimento'&&NA.pac&&NA.pac.ativo!==false&&!String(NA.pac.mae||'').trim()){NA.err=Object.assign({},NA.err||{},{mae:'Obrigatório'});naRender();toast('Preencha o nome da mãe: é obrigatório no cadastro','warn');const el=r26El('naMaeCad');if(el&&el.focus)el.focus();return}return _o.apply(this,arguments)}}
/* 726: cadastrar o solicitante no próprio atendimento, e a busca acha os cadastrados */
const R26_SOL=[{n:'Dra. Camila Rocha',cons:'CRM',uf:'CE',num:'12345',esp:'Clínica médica'},{n:'Dr. Paulo Viana',cons:'CRM',uf:'CE',num:'20871',esp:'Ginecologia e obstetrícia'},{n:'Dra. Beatriz Sales',cons:'CRM',uf:'CE',num:'18702',esp:'Endocrinologia'}];
const r26SolReg=s=>`${s.cons}-${s.uf} ${s.num}`;
function r26SolTodos(){const l=R26_SOL.slice();try{(PROFISSIONAIS||[]).forEach(p=>{if(p.ativo!==false&&p.cons&&!l.some(s=>semAc(s.n)===semAc(p.n))){const m=/^([A-Z]+)-?([A-Z]{2})?\s*(\d+)/.exec(p.cons)||[];l.push({n:p.n,cons:m[1]||'CRM',uf:m[2]||'CE',num:m[3]||p.cons,esp:p.esp||''})}})}catch(e){}return l}
function r26SolPick(v){NA.med=v;const s=r26SolTodos().find(x=>semAc(x.n)===semAc(String(v).trim()));if(s){NA.crm=r26SolReg(s);const c=r26El('naSolC');if(c)c.value=NA.crm}}
function r26SolModal(){const nome=(NA&&NA.med&&NA.med!=='Sem solicitante')?NA.med:'';
 openModal(`${mh('Cadastrar solicitante')}<div class="mb"><p class="tl" style="margin:0">Fica na base de solicitantes: aparece na busca dos próximos atendimentos, vai para a ficha e para o resultado.</p>
 <div class="formgrid"><div class="field" style="grid-column:1/-1" id="r26SoNf"><label for="r26SoN">Nome completo <span class="req">*</span></label><input class="in" id="r26SoN" value="${esc(nome)}" autocomplete="off"></div>
 <div class="field"><label for="r26SoC">Conselho <span class="req">*</span></label><select class="in" id="r26SoC">${['CRM','CRO','CRF','CRBM','COREN','CRN','CREFITO','CRP'].map(c=>`<option>${c}</option>`).join('')}</select></div>
 <div class="field"><label for="r26SoU">UF <span class="req">*</span></label><select class="in" id="r26SoU">${(typeof RC_UFS!=='undefined'?RC_UFS:['CE']).map(u=>`<option ${u==='CE'?'selected':''}>${u}</option>`).join('')}</select></div>
 <div class="field" id="r26SoRf"><label for="r26SoR">Número do registro <span class="req">*</span></label><input class="in" id="r26SoR" inputmode="numeric" autocomplete="off"></div>
 <div class="field"><label for="r26SoE">Especialidade</label><input class="in" id="r26SoE" autocomplete="off"></div>
 <div class="field"><label for="r26SoT">Telefone ou WhatsApp</label><input class="in" id="r26SoT" oninput="this.value=mTel(this.value)"></div></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="r26SolSalvar()">Cadastrar e usar</button></div>`);setTimeout(()=>{const e=r26El('r26SoN');if(e&&e.focus)e.focus()},0)}
function r26SolSalvar(){const v=id=>{const e=r26El(id);return e?String(e.value||'').trim():''};const n=v('r26SoN'),num=soDig(v('r26SoR'));
 if(n.split(/\s+/).length<2){const f=r26El('r26SoNf');if(f)f.classList.add('err');toast('Escreva o nome completo do solicitante','warn');return null}
 if(!num){const f=r26El('r26SoRf');if(f)f.classList.add('err');toast('Informe o número do registro no conselho','warn');return null}
 const s={n,cons:v('r26SoC')||'CRM',uf:v('r26SoU')||'CE',num,esp:v('r26SoE'),tel:v('r26SoT')};
 if(r26SolTodos().some(x=>x.cons===s.cons&&x.uf===s.uf&&soDig(x.num)===num)){toast('Este registro já está cadastrado: escolha o solicitante na busca','warn');return null}
 R26_SOL.push(s);NA.semSol=false;NA.med=s.n;NA.crm=r26SolReg(s);if(NA.err){delete NA.err.med;delete NA.err.crm}r26Aud('Solicitantes',`Solicitante cadastrado no atendimento: ${s.n} (${r26SolReg(s)})`);closeModal();naRender();toast(`Solicitante ${s.n} cadastrado e vinculado à ficha`);return s}
if(typeof r17ProcCard==='function'){const _pc=r17ProcCard;r17ProcCard=function(){let h=_pc.apply(this,arguments);if(!NA||NA.modo!=='atendimento')return h;const aut=!!NA.autz;
 /* 725 */
 h=h.replace(/<div class="field[^"]*" style="max-width:520px"><label for="naMae">[\s\S]*?<\/div>/,r26MaeFalta()?`<div class="alert err" role="alert"><span><b>Falta o nome da mãe no cadastro.</b> Ele é obrigatório e vai para o resultado como está no cadastro. Complete o cadastro para seguir.</span></div><button class="btn sm sec" style="align-self:flex-start" onclick="r26MaeCompletar()">${I.edit} Completar o cadastro</button>`:'');
 /* 726 */
 h=h.replace(/(<input class="in" id="naSolM" value="[^"]*" placeholder="Nome do médico" )([^>]*?)oninput="NA\.med=this\.value">/,(m,a,b)=>`${a}list="r26SolL" ${b}oninput="r26SolPick(this.value)">`);
 if(!aut&&!NA.semSol)h=h.replace(/(<label class="check"><input type="checkbox" [^>]*onchange="naSemSol\(this\.checked\)">)/,`<datalist id="r26SolL">${r26SolTodos().map(s=>`<option value="${esc(s.n)}">${esc(r26SolReg(s))}${s.esp?' · '+esc(s.esp):''}</option>`).join('')}</datalist><button type="button" class="btn sm ghost" style="align-self:flex-start" onclick="r26SolModal()">${I.plus} Cadastrar solicitante</button>$1`);
 return h}}
/* 725: autorizar e continuar só com o nome da mãe no cadastro */
['r17Autorizar','naP2Ok'].forEach(fn=>{if(typeof window[fn]!=='function')return;const _f=window[fn];window[fn]=function(){if(r26MaeFalta()){NA.err=Object.assign({},NA.err||{},{mae:1});toast('Falta o nome da mãe no cadastro: complete o cadastro para seguir','warn');try{naRender()}catch(e){}return}return _f.apply(this,arguments)}});
/* 761 e 763: questionário único, montado pela configuração dos procedimentos, sem perguntas repetidas */
const r26QNorm=q=>semAc(String(q||'')).replace(/[^a-z0-9]+/g,' ').trim();
function r26QLista(){const cods=(NA&&NA.ex||[]).map(x=>x.c),nome=c=>{try{return typeof prqNome==='function'?prqNome(c):(EX[c]?EX[c].n:c)}catch(e){return c}};const m=new Map();
 const add=(q,t,ob,ops,c,fixa)=>{const k=r26QNorm(q);if(!k)return;const x=m.get(k)||{k,q,t:t||'txt',ob:false,ops:ops||[],usa:[],fixa:!!fixa};x.ob=x.ob||!!ob;if(c&&!x.usa.includes(nome(c)))x.usa.push(nome(c));m.set(k,x)};
 (typeof CRONICAS!=='undefined'?CRONICAS:[]).forEach(q=>add(q,'txt',false,[],null,true));
 add('Dados clínicos e motivo da realização dos exames','txt',false,[],null,true);
 cods.forEach(c=>{const e=EX[c]||{};(e.q||[]).forEach(t=>{if(t==='gest'&&NA.pac&&NA.pac.sx==='F')add(PERGS.gest,'txt',false,[],c);if(t==='anticoag')add(PERGS.anticoag,'txt',false,[],c)});
  try{((typeof prCfg==='function'?prCfg(c).perg:[])||[]).forEach(p=>add(p.q,p.t,p.ob,p.ops,c))}catch(e){}});
 return [...m.values()]}
function r26QVal(x){const cr=(NA.pac&&NA.pac.cron)||['',''];const ci=(typeof CRONICAS!=='undefined'?CRONICAS:[]).findIndex(q=>r26QNorm(q)===x.k);if(ci>=0)return NA.perg['c'+ci]??cr[ci]??'';if(/^dados clinicos/.test(x.k))return NA.perg.clin||'';return (NA.perg||{})['q:'+x.k]||''}
function r26QSet(k,v){const ci=(typeof CRONICAS!=='undefined'?CRONICAS:[]).findIndex(q=>r26QNorm(q)===k);if(ci>=0)NA.perg['c'+ci]=v;else if(/^dados clinicos/.test(k))NA.perg.clin=v;else NA.perg['q:'+k]=v;
 if(r26QNorm(PERGS.gest)===k)NA.perg.gest=v;if(r26QNorm(PERGS.anticoag)===k)NA.perg.anticoag=v}
let R26_Q_ABERTO=false;
if(typeof r17Quest==='function'){r17Quest=function(){const l=r26QLista().filter(x=>!(/^dados clinicos/.test(x.k)&&typeof r17TemExame==='function'&&!r17TemExame())),lt=r26QLista(),proc=l.filter(x=>!x.fixa).length,falta=l.filter(x=>x.ob&&!String(r26QVal(x)).trim()).length;
 const campo=x=>{const v=r26QVal(x),id=/^dados clinicos/.test(x.k)?'naClin':'r26q_'+x.k.replace(/ /g,'_').slice(0,40);return `<div class="field" ${/^dados clinicos/.test(x.k)?`${typeof r17TemExame==='function'&&!r17TemExame()?'hidden ':''}style="grid-column:1/-1"`:''}><label for="${id}">${esc(x.q)}${x.ob?' <span class="req">*</span>':''}${x.usa.length?`<span class="r26-q-usa">${x.usa.length>1?'Pedida por '+x.usa.length+' procedimentos: ':'Pedida por: '}${x.usa.map(esc).join(', ')}</span>`:''}</label>${x.t==='sn'?`<select class="in" id="${id}" onchange="r26QSet('${x.k}',this.value)"><option value=""></option>${['Sim','Não'].map(o=>`<option ${v===o?'selected':''}>${o}</option>`).join('')}</select>`:x.t==='esc'?`<select class="in" id="${id}" onchange="r26QSet('${x.k}',this.value)"><option value=""></option>${(x.ops||[]).map(o=>`<option ${v===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`:/^dados clinicos/.test(x.k)?`<textarea class="in" id="naClin" rows="2" style="height:auto" oninput="r26QSet('${x.k}',this.value)">${esc(v)}</textarea>`:`<input class="in" id="${id}" value="${esc(v)}" placeholder="Não" oninput="r26QSet('${x.k}',this.value)">`}</div>`};
 return `<details class="card at-card r26-q" ${R26_Q_ABERTO||falta?'open':''} ontoggle="R26_Q_ABERTO=this.open"><summary><h3>Questionário</h3><span class="tl">${l.length} pergunta${l.length!==1?'s':''} montada${l.length!==1?'s':''} pela configuração ${NA.ex.length>1?'dos '+NA.ex.length+' procedimentos':'do procedimento'}${falta?` · <b style="color:var(--err)">${falta} obrigatória${falta>1?'s':''} sem resposta</b>`:''} · ${R26_Q_ABERTO||falta?'fechar':'abrir'}</span></summary>
 <p class="tl" style="margin:0 0 8px">Um questionário só para todos os procedimentos: pergunta repetida aparece uma vez. ${proc?'':'Os procedimentos escolhidos não têm perguntas próprias; ficam as do prontuário.'}</p><div class="formgrid">${lt.map(campo).join('')}</div>
 <div class="row" style="margin-top:10px"><button type="button" class="btn sm sec" onclick="r17ImprimirQuest()">${I.print} Imprimir questionário único</button></div></details>`}}
if(typeof r17ImprimirQuest==='function'){r17ImprimirQuest=function(){const l=r26QLista().filter(x=>!(/^dados clinicos/.test(x.k)&&typeof r17TemExame==='function'&&!r17TemExame()));if(!l.length){toast('Nenhuma pergunta configurada','warn');return}const n=NA&&NA.pac&&NA.pac.n?NA.pac.n:'';
 r17Print('Questionário',`<h1>Questionário</h1><div class="tl">${esc(rcUnidNome(RC.unid))} · ${dmy(iso(HOJE))} · ${NA.ex.length} procedimento(s): ${esc(NA.ex.map(x=>EX[x.c]?EX[x.c].n:x.c).join(', '))}</div><p>Paciente: ${n?esc(n):'<span class="ln" style="display:inline-block;width:70%"></span>'}</p>${l.map((x,i)=>`<div class="q"><b>${i+1}. ${esc(x.q)}</b>${x.ob?' *':''}${x.usa.length?`<div class="tl">Para: ${x.usa.map(esc).join(', ')}</div>`:''}<div>${x.t==='sn'?'( ) Sim &nbsp;&nbsp; ( ) Não':x.t==='esc'?(x.ops||[]).map(o=>'( ) '+esc(o)).join(' &nbsp;&nbsp; '):'<div class="ln"></div><div class="ln"></div>'}</div></div>`).join('')}<p class="tl">* resposta obrigatória. Um questionário só para todos os procedimentos; perguntas repetidas aparecem uma vez. Entregue este papel à recepção ou à sala do exame.</p><p style="margin-top:30px">Assinatura do paciente ou responsável: ______________________________</p>`);toast(`Questionário único enviado para a impressora (${l.length} perguntas)`)}}
/* 727 e 764: a conclusão confere o pagamento; 766: depois de concluir, vai para as fichas do paciente */
if(typeof naConcluir==='function'){const _c=naConcluir;naConcluir=function(){if(NA&&NA.modo==='atendimento'&&!NA.fim&&NA.tipo!=='convenio'&&NA.r26pag&&naTotal()>0){const e=r26PagErro('na');if(e){toast(e,'warn');return}}
 const pag=NA&&NA.r26pag&&NA.tipo!=='convenio'&&naTotal()>0?{pags:NA.r26pag.pags.map(p=>({...p})),fin:r26PagCalc(NA.r26pag).fin}:null;const r=_c.apply(this,arguments);
 try{if(NA&&NA.fim&&NA.fim.tipo==='at'&&!NA.fim.r26){NA.fim.r26=true;const f=NA.fim,p=NA.pac||{};
  R26_FICHAS.unshift({prot:f.prot,n:p.n,cpf:NA.semCpf?'':NA.cpf,data:typeof RC_HOJE!=='undefined'?RC_HOJE:iso(HOJE),h:hhmm(new Date()),conv:NA.tipo==='convenio'?(NA.conv||'Convênio'):'Particular',itens:NA.ex.map(x=>x.c),total:pag?pag.fin:naTotal(),pags:pag?pag.pags:null});
  r26FichasAbrir(NA.semCpf?'':NA.cpf,p.n,{prot:f.prot,canais:f.canais,pag:pag?r26PagTxt(pag):''})}}catch(e){}return r}}
/* 728: no "Atendimento concluído" (se alguém voltar a ele), o botão das fichas */
if(typeof naFim==='function'){const _f=naFim;naFim=function(){const h=_f.apply(this,arguments);if(!NA||!NA.fim||NA.fim.tipo!=='at')return h;return h.replace(/(<div class="row"><button class="btn" onclick="naNovo\('atendimento'\)">)/,`<div class="row"><button class="btn sec" onclick="r26FichasAbrir('${NA.semCpf?'':esc(NA.cpf||'')}','${esc((NA.pac||{}).n||'').replace(/'/g,'&#39;')}',{prot:'${esc(NA.fim.prot)}'})">Abrir as fichas do paciente</button></div>$1`)}}

/* ==========================================================================
   AUTORIZAR ATENDIMENTO · 741 (estilo, acima) e 746: faturamento numa janela, sem sair da tela
   ========================================================================== */
let R26_FAT_D=null;
function r26FatAbrir(D){if(!D||!D.src)return;R26_FAT_D=D;const tot=D.src.valor!=null?+D.src.valor:(typeof rc20Tab==='function'?rc20Tab(D.proc,D.conv||'Particular'):0);
 if(!R26P.fat||R26P.fat.src!==D.src){r26PagIni('fat',tot,{ajuste:true,gestor:false});R26P.fat.src=D.src}r26FatPinta()}
function r26FatPinta(){const D=R26_FAT_D;if(!D)return;const p=D.p||{};
 const h=`${mh('Faturar atendimento autorizado')}<div class="mb"><p class="tl" style="margin:0">${esc(p.n||D.ev.pac||'')} · ${esc(clProcNome(D.proc))} · ${esc(D.conv||'Particular')} · ${esc(PROF(D.prof).n)}</p>${r26PagHtml('fat')}</div>
 <div class="mf"><button class="btn ghost" onclick="closeModal();toast('Atendimento autorizado: o faturamento fica pendente nas fichas do paciente','warn')">Faturar depois</button><button class="btn" onclick="r26FatOk()">Concluir faturamento</button></div>`;
 if(typeof modalAberto==='function'&&modalAberto()&&r26El('r26pag_fat'))r26El('modal').innerHTML=h;else openModal(h,'wide')}
function r26FatOk(){const D=R26_FAT_D,S=R26P.fat;if(!D||!S)return null;const e=r26PagErro('fat');if(e){toast(e,'warn');return null}const c=r26PagCalc(S);
 const fat={src:D.src,total:S.total,desc:c.desc,aj:c.aj,fin:c.fin,pags:S.pags.map(p=>({...p})),h:hhmm(new Date()),por:typeof FN_USU!=='undefined'?FN_USU:'Recepção'};D.src.faturado=fat;R26_FAT.push(fat);
 try{rcHist(D.ev,'agenda','Faturamento concluído',`${fmt(c.fin)} · ${r26PagTxt(S)}${c.desc?' · desconto '+fmt(c.desc):''}${c.aj?' · ajuste '+r26Moeda(c.aj).replace(',00','')+'%':''}`,PROF(D.prof).n)}catch(x){}
 closeModal();try{reView()}catch(x){}toast(`Faturamento concluído: ${fmt(c.fin)} (${r26PagTxt(S)})`);return fat}
if(typeof rc20AutConfirmar==='function'){const _c=rc20AutConfirmar;rc20AutConfirmar=function(){const D=RC.det,antes=!!(D&&D.src&&D.src.autorizado);const r=_c.apply(this,arguments);try{if(D&&D.src&&D.src.autorizado&&!antes&&!D.src.faturado)setTimeout(()=>r26FatAbrir(D),30)}catch(e){}return r}}

/* ==========================================================================
   AGENDAMENTOS · 753: reagendar para outro profissional que faz o mesmo procedimento; 762: encaixe diferente
   ========================================================================== */
const r26Esp=p=>semAc(String((p&&p.esp)||'').split(' (')[0]);
function r26ReProfs(D){const ids=new Set(RC.agendas.filter(a=>a.procs.includes(D.proc)).map(a=>a.prof)),e=r26Esp(PROF(D.prof));return PROFISSIONAIS.filter(p=>p.ativo!==false&&ids.has(p.id)&&(!e||p.id===D.prof||r26Esp(p)===e))}
function r26ReProf(id){const D=RC.det;if(!D)return;D.reProf=id===D.prof?'':id;D.reIni=false;D.reS=null;D.reD=RC_HOJE;D.reM=null;rcDetPinta();const s=r26El('r26ReP');if(s&&s.focus)s.focus()}
if(typeof r17RePainel==='function'){const _r=r17RePainel;r17RePainel=function(D){const P=new Proxy(D,{get:(t,k)=>k==='prof'&&t.reProf?t.reProf:t[k],set:(t,k,v)=>{t[k]=v;return true}});const h=_r.call(this,P),ps=r26ReProfs(D),cur=D.reProf||D.prof;
 const sel=`<div class="field" style="margin:0 0 10px"><label for="r26ReP">Profissional</label><select class="in" id="r26ReP" onchange="r26ReProf(this.value)">${ps.map(p=>`<option value="${p.id}" ${p.id===cur?'selected':''}>${esc(p.n)}${p.esp?' · '+esc(String(p.esp).split(' (')[0]):''}${p.id===D.prof?' (atual)':''}</option>`).join('')}</select><span class="msg">Só aparece quem é da mesma especialidade e atende ${esc(clProcNome(D.proc))}. ${D.reProf?'Os horários abaixo são da agenda de '+esc(PROF(D.reProf).n)+'.':''}</span></div>`;
 return h.replace('<h4 style="margin:0 0 8px">Reagendar</h4>',`<h4 style="margin:0 0 8px">Reagendar</h4>${ps.length>1?sel:''}`)}}
if(typeof rcDetReagendar==='function'){const _r=rcDetReagendar;rcDetReagendar=function(){const D=RC.det,np=D&&D.reProf;const r=_r.apply(this,arguments);if(np){try{r26Aud('Agendamentos',`Reagendado de ${PROF(D.prof).n} para ${PROF(np).n} (mesmo procedimento: ${clProcNome(D.proc)})`)}catch(e){}}return r}}
if(typeof rcDiaHtml==='function'){const _d=rcDiaHtml;rcDiaHtml=function(){return String(_d.apply(this,arguments)).replace(/<tr([^>]*)>(<td[^>]*><b>[^<]*<\/b><span class="ag18-enc-tag">[\s\S]*?<\/tr>)/g,(m,a,b)=>`<tr class="r26-enc"${a}>${b.replace('<span class="rc-ind acc"><i></i>VAGA DISPONÍVEL</span>','<span class="rc-ind r26-ind-enc"><i></i>VAGA DE ENCAIXE</span>')}`)}}

/* ==========================================================================
   ESTOQUE · 742: valores ao passar o mouse no gráfico; 752: validade digitada
   ========================================================================== */
function r26Linha(lab,ent,sai){const W=480,H=160,L=38,R=12,T=16,B=26,n=lab.length,all=ent.concat(sai);let lo=Math.min(...all),hi=Math.max(...all);const pad=(hi-lo)*.15||1;lo-=pad;hi+=pad;
 const x=i=>L+i*(W-L-R)/(n-1),y=v=>T+(H-T-B)*(1-(v-lo)/(hi-lo)),pts=a=>a.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' '),gw=(W-L-R)/(n-1),br=v=>'R$ '+String(v).replace('.',',')+' mil';
 const tip=i=>`<b>${lab[i]}</b><span style='display:flex;justify-content:space-between;gap:12px'>Entradas <b>${br(ent[i])}</b></span><span style='display:flex;justify-content:space-between;gap:12px'>Saídas <b>${br(sai[i])}</b></span><span style='display:flex;justify-content:space-between;gap:12px'>Saldo <b>${(ent[i]-sai[i]>=0?'+ ':'− ')+br(Math.abs(Math.round((ent[i]-sai[i])*10)/10))}</b></span>`;
 return `<svg class="r26-ln" viewBox="0 0 ${W} ${H}" role="img" aria-label="Entradas e saídas dos últimos 6 meses" style="width:100%;height:auto;max-height:220px">
 ${[0,.5,1].map(f=>{const v=lo+(hi-lo)*f;return `<line x1="${L}" x2="${W-R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="var(--border)"/><text x="${L-6}" y="${(y(v)+4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--fg2)">${Math.round(v)}</text>`}).join('')}
 <polyline fill="none" stroke="var(--fg2)" stroke-dasharray="4 4" stroke-width="1.5" points="${pts(sai)}"/><polyline fill="none" stroke="var(--accent)" stroke-width="2.5" points="${pts(ent)}"/>
 ${lab.map((l,i)=>`<g class="col" tabindex="0" role="button" aria-label="${l}: entradas ${br(ent[i])}, saídas ${br(sai[i])}" onmouseenter="r26LnTip(this,&quot;${tip(i)}&quot;)" onfocus="r26LnTip(this,&quot;${tip(i)}&quot;)" onmouseleave="r26LnTipFora()" onblur="r26LnTipFora()"><rect class="hl" x="${(x(i)-gw/2).toFixed(1)}" y="${T}" width="${gw.toFixed(1)}" height="${H-T-B}" fill="transparent"/><circle cx="${x(i).toFixed(1)}" cy="${y(ent[i]).toFixed(1)}" r="4" fill="var(--accent)"/><circle cx="${x(i).toFixed(1)}" cy="${y(sai[i]).toFixed(1)}" r="3.5" fill="var(--surface)" stroke="var(--fg2)" stroke-width="1.5"/><text x="${x(i).toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="11" fill="var(--fg2)">${l}</text></g>`).join('')}</svg>`}
function r26LnTip(el,html){const t=r26El('tip');if(!t||!el.getBoundingClientRect)return;t.innerHTML=html;t.style.display='block';const b=el.getBoundingClientRect(),w=t.offsetWidth,h=t.offsetHeight;let x=b.left+b.width/2-w/2,y=b.top-h-6;if(y<8)y=b.bottom+6;x=Math.max(8,Math.min(x,innerWidth-w-8));t.style.left=x+'px';t.style.top=y+'px'}
function r26LnTipFora(){const t=r26El('tip');if(t)t.style.display='none'}
if(typeof VIEWS.estoque==='function'){const _v=VIEWS.estoque;VIEWS.estoque=function(){const h=_v.apply(this,arguments);const i=h.indexOf('<h3>Entradas e saídas · 6 meses');if(i<0)return h;const a=h.indexOf('<svg',i),b=h.indexOf('</svg>',a);if(a<0||b<0)return h;
 return h.slice(0,a)+r26Linha(['mai','jun','jul','ago','set','out'],[18.2,21.4,19.8,23.1,20.6,22.9],[17.9,20.2,20.4,21.8,21.2,22.4])+'<p class="tl" style="margin:4px 0 0">Passe o mouse (ou o foco do teclado) sobre um mês para ver os valores.</p>'+h.slice(b+6)}}
function r26Validade(ix,el){const v=String(el.value||'').trim();if(!v){stkLinha(ix,'v','');return}const d=soDig(v);if(d.length!==8){toast('Digite a validade com dia, mês e ano (dd/mm/aaaa)','warn');el.focus();return}
 const dd=+d.slice(0,2),mm=+d.slice(2,4),yy=+d.slice(4,8),x=new Date(yy,mm-1,dd,12);if(mm<1||mm>12||x.getDate()!==dd||yy<2000){toast('Validade inválida','warn');el.focus();return}
 stkLinha(ix,'v',iso(x));if(iso(x)<iso(HOJE))setTimeout(()=>toast('Atenção: esta validade já passou','warn'),40)}
if(typeof VIEWS['estoque-lancar']==='function'){const _v=VIEWS['estoque-lancar'];VIEWS['estoque-lancar']=function(){return String(_v.apply(this,arguments)).replace(/<input class="in" type="date" value="([^"]*)" style="margin-top:4px" onchange="stkLinha\((\d+),'v',this\.value\)" aria-label="Validade">/g,(m,v,ix)=>`<input class="in" value="${v?dmy(v):''}" inputmode="numeric" maxlength="10" placeholder="Validade dd/mm/aaaa" style="margin-top:4px" oninput="this.value=mData(this.value)" onchange="r26Validade(${ix},this)" aria-label="Validade (dd/mm/aaaa)">`)}}

/* 753: uma segunda médica de clínica médica (fictícia), com agenda à tarde, para dar para reagendar entre profissionais da mesma especialidade */
try{if(typeof PROFISSIONAIS!=='undefined'&&!PROFISSIONAIS.some(p=>p.id==='p26'))PROFISSIONAIS.push({id:'p26',n:'Dra. Lorena Matos',ini:'LM',cons:'CRM-CE 21.450',esp:'Clínica médica',unids:[10],cor:'#7C3AED',repasse:'60% particular · 70% convênio',ativo:true})}catch(e){}
if(typeof rc==='function'){const _rc=rc;rc=function(){const r=_rc.apply(this,arguments);try{if(typeof RC!=='undefined'&&RC&&RC.agendas&&!RC.r26){RC.r26=true;const b=RC.agendas.find(a=>a.id==='ag1');if(b&&!RC.agendas.some(a=>a.prof==='p26'))RC.agendas.push({...b,id:'ag26',nome:'DRA LORENA MATOS',prof:'p26',ini:'13:00',fim:'17:00',dias:[1,2,3,4,5],obs:''})}}catch(e){}return r}}
