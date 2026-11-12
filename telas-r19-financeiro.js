/* Rodada 19 (12/11/2026) · financeiro */
/* ==========================================================================
   Notas 545 (Caixa), 546 a 610 (Financeiro) e 611/612 (Conciliação bancária).
   Fica depois dos arquivos da rodada 18: só acrescenta funções e embrulha ou redefine as que já existem.
   Nada é apagado de verdade: o que sai da listagem fica no histórico da conta e na trilha de auditoria.
   ========================================================================== */

/* ---------- Peças comuns ---------- */
const fin19G=id=>{try{const e=document.getElementById(id);return e&&e.value!=null?String(e.value):''}catch(e){return ''}};
const fin19Num=s=>parseFloat(String(s||'').replace(/[^\d,.-]/g,'').replace(/\./g,'').replace(',','.'))||0;
const fin19Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
/* Troca o HTML de um openModal ou openDrawer só durante uma chamada */
function fin19ComModal(fn,tr){const _om=openModal;openModal=function(h,cls){try{h=tr(String(h))}catch(e){}return _om.call(this,h,cls)};try{return fn()}finally{openModal=_om}}
function fin19ComDrawer(fn,tr){const _od=openDrawer;openDrawer=function(t,h){try{h=tr(String(h),t)}catch(e){}return _od.call(this,t,h)};try{return fn()}finally{openDrawer=_od}}
const fin19Hist=(c,a)=>{if(typeof fnHist==='function')fnHist(c,a)};
const fin19Aud=t=>{if(typeof fnAud==='function')fnAud(t)};
const fin19Falta=c=>Math.max(0,Math.round((c.v-(c.recebido||0))*100)/100);
const fin19Mais7=()=>iso(new Date(new Date(FN_REF+'T12:00:00').getTime()+7*864e5));
/* Situação para mostrar: "Recebida em parte" vira "Recebido parcialmente · falta R$ X" (nota 569) */
const fin19SitTxt=c=>{const s=fnSit(c);return s==='Recebida em parte'?'Recebido parcialmente · falta '+fmt(fin19Falta(c)):s};
const fin19SitLab=s=>s==='Recebida em parte'?'Recebido parcialmente':s;
/* Data em que a conta foi paga ou recebida (dd/mm) */
const fin19DataMov=c=>{const x=String(c.pagoEm||(c.baixa&&c.baixa.h)||'').slice(0,5);return /^\d{2}\/\d{2}$/.test(x)?x:(c.venc==='hoje'?FN_REF.slice(8,10)+'/'+FN_REF.slice(5,7):String(c.venc||'').slice(0,5))};
const fin19FormaSaida=c=>c.pixTemp?'Pix copia e cola (código temporário)':c.bol?'Boleto':c.pix||(FORNECEDORES.find(x=>x.n===c.q)||{}).pix?'Pix (chave do credor)':'Transferência';

/* Exemplos (fictícios) de chave Pix e dados bancários de alguns credores, para o Pix carregar sozinho (nota 610),
   e a contestação da fatura do DB guardada com a conta (notas 576 e 579) */
(()=>{const D={'Pardini':{pix:'financeiro@pardini.exemplo.com.br',pixTipo:'E-mail',banco:'Itaú (341)',ag:'1500',cc:'22334-5',ccTipo:'Corrente'},'DB Diagnósticos':{pix:'11.111.111/0001-11',pixTipo:'CNPJ',banco:'Bradesco (237)',ag:'2020',cc:'778899-0',ccTipo:'Corrente'},'Labtubos Distribuidora':{pix:'12.345.678/0001-90',pixTipo:'CNPJ',banco:'Banco do Brasil (001)',ag:'3456',cc:'12345-6',ccTipo:'Corrente',cnpj:'12.345.678/0001-90'},'Limpa Mais Serviços':{pix:'(85) 98877-6655',pixTipo:'Telefone',banco:'Caixa Econômica (104)',ag:'0919',cc:'00012345-1',ccTipo:'Corrente'},'Contábil Nordeste':{pix:'contabil@nordeste.exemplo.com.br',pixTipo:'E-mail',banco:'Santander (033)',ag:'4410',cc:'13005566-2',ccTipo:'Corrente'}};
 if(typeof FORNECEDORES!=='undefined')FORNECEDORES.forEach(f=>{const d=D[f.n];if(d)Object.keys(d).forEach(k=>{if(f[k]==null||f[k]==='')f[k]=d[k]})});
 const db=typeof CONTAS!=='undefined'&&CONTAS.find(c=>c.t==='pagar'&&c.s==='Contestada');
 if(db&&!db.contest)db.contest={aberta:'03/11 15:20',por:'Lúcia',devido:7212,fatura:7590,prazo:'10/11',resp:'Aguardando resposta do DB',
  motivo:'A fatura de outubro do DB veio com R$ 7.590,00, mas pela tabela de custo o devido é R$ 7.212,00 (diferença de R$ 378,00). Um exame foi cobrado e não enviado, 4 ferritinas vieram com preço diferente da tabela e um painel genético enviado não foi cobrado. Pagamos só o valor conferido depois da resposta do DB.',
  itens:[['Cobrado e não enviado','Vitamina D · 12-00002230',42],['Preço diferente da tabela','Ferritina · 4 exames',96],['Enviado e não cobrado','Painel genético · 12-00002210',-610]]}})();

/* ==========================================================================
   CAIXA
   ========================================================================== */

/* ---------- Repasse médico: filtro por unidade sempre visível, com todas as unidades (nota 545) ---------- */
{const _rc=cxRepasseCard;cxRepasseCard=function(){let h=_rc.apply(this,arguments);
 const us=Object.keys(typeof UNIDS!=='undefined'?UNIDS:{10:'Central'}).map(Number).sort((a,b)=>a-b);
 if(CX_REP_UNID&&!us.includes(+CX_REP_UNID))CX_REP_UNID='';
 h=h.replace(/<div class="filters" style="margin:4px 0 8px">[\s\S]*?<\/div>/,'');
 const sel=`<div class="filters fin19-rp-unid" style="margin:4px 0 8px"><span class="tl">Unidade:</span>${chip('Todas as unidades',!CX_REP_UNID,`CX_REP_UNID='';reView()`)}${us.map(u=>chip(esc(unidNome(u)),CX_REP_UNID===String(u),`CX_REP_UNID='${u}';reView()`)).join('')}</div>`;
 h=h.replace(/(<div class="sub">[\s\S]*?<\/div>)/,'$1'+sel);
 if(CX_REP_UNID)h=h.replace('Nenhum médico atendeu hoje ainda','Nenhum médico atendeu hoje nesta unidade');
 return h}}

/* ==========================================================================
   FINANCEIRO · Visão do mês
   ========================================================================== */

/* ---------- Filtros da Visão do mês funcionando: Ambos/B2C/B2B, período e unidade (notas 546 e 554) ---------- */
const fin19UnidOrig=o=>o.n.startsWith('Posto 14')?'14':o.n.startsWith('Posto 12')?'12':'10';
const fin19UnidConta=c=>{const s=String(c.q||'');return s.startsWith('Posto 14')||c.cc==='Posto 14'?'14':s.startsWith('Posto 12')||c.cc==='Posto 12'?'12':'10'};
function fin19PerFator(){const s=(typeof PERIODO!=='undefined'&&PERIODO.fn)||{k:'mes'},k=s.k||'mes';
 if(k==='hoje')return [1/26,'hoje (04/11)'];if(k==='semana')return [6/26,'esta semana'];if(k==='ano')return [FN_MESES.rec.reduce((a,b)=>a+b,0)/FN_MESES.rec[11],'últimos 12 meses'];
 if(k==='intervalo'&&s.de&&s.ate){const d=Math.max(1,Math.round((new Date(s.ate+'T12:00:00')-new Date(s.de+'T12:00:00'))/864e5)+1);return [d/31,'de '+dmy(s.de)+' a '+dmy(s.ate)]}
 return [1,'outubro de 2026 (último mês fechado)']}
function fin19VisaoDados(){const f=(typeof FILTROS!=='undefined'&&FILTROS.fn)||{},u=String(f.unidade||''),[fat,perTxt]=fin19PerFator();
 let os=ORIGENS.map((o,i)=>Object.assign({},o,{i}));if(FN_LADO==='B2C')os=os.filter(o=>o.tipo==='matriz');else if(FN_LADO==='B2B')os=os.filter(o=>o.tipo!=='matriz');if(u)os=os.filter(o=>fin19UnidOrig(o)===u);
 const totAll=ORIGENS.reduce((s,o)=>s+o.rep,0),tot=os.reduce((s,o)=>s+o.rep,0),share=totAll?tot/totAll:0,rec=Math.round(tot*fat),b2c=Math.round(os.filter(o=>o.tipo==='matriz').reduce((s,o)=>s+o.rep,0)*fat);
 const ladoOk=c=>FN_LADO==='Ambos'||(FN_LADO==='B2C'?c.tipo==='particular':c.tipo!=='particular');
 const abR=CONTAS.map((c,i)=>[c,i]).filter(([c])=>c.t==='receber'&&c.s!=='Paga'&&(!u||fin19UnidConta(c)===u)&&ladoOk(c));
 const lim=fin19Mais7(),ab7=CONTAS.map((c,i)=>[c,i]).filter(([c])=>{const d=fnVencIso(c);return c.t==='pagar'&&c.s!=='Paga'&&d&&d<=lim&&(!u||fin19UnidConta(c)===u)});
 const pg=CONTAS.filter(c=>c.t==='pagar'&&c.s==='Paga'&&(!u||fin19UnidConta(c)===u)),rc=CONTAS.filter(c=>c.t==='receber'&&(c.s==='Paga'||c.recebido)&&(!u||fin19UnidConta(c)===u)&&ladoOk(c));
 const pk=((typeof PERIODO!=='undefined'&&PERIODO.fn)||{}).k||'mes';
 return {u,fat,perTxt,os,tot,share,rec,b2c,b2b:rec-b2c,custo:Math.round(rec*80510/272820),res:Math.round(rec*72070/272820),abR,ab7,pg,rc,filtrado:FN_LADO!=='Ambos'||!!u||pk!=='mes'}}
function fin19VisaoLimpar(){FN_LADO='Ambos';if(typeof FILTROS!=='undefined')FILTROS.fn={};if(typeof PERIODO!=='undefined'&&PERIODO.fn)PERIODO.fn.k='mes';reView()}

/* ---------- Gráfico de rosca com destaque ao passar o mouse (nota 555) ---------- */
const F19_CORES=['#2E7D6B','#3B82F6','#F59E0B','#8B5CF6','#EF4444','#14B8A6','#EC4899','#64748B'];
function fin19Rosca(partes,o){o=o||{};const tot=partes.reduce((s,p)=>s+p[1],0)||1,R=54,r=33,C=64,id=o.id||'fin19Rc';let a=-Math.PI/2;
 const P=(ang,rr)=>`${(C+rr*Math.cos(ang)).toFixed(1)},${(C+rr*Math.sin(ang)).toFixed(1)}`;
 const hv=i=>`onmouseenter="fin19RcHover('${id}',${i})" onmouseleave="fin19RcHover('${id}',-1)"`;
 const fat=partes.map(([l,v,oc],i)=>{const b=a+2*Math.PI*v/tot,big=b-a>Math.PI?1:0,d=partes.length===1?`M${C},${C-R} A${R},${R} 0 1 1 ${C-0.01},${C-R} L${C-0.01},${C-r} A${r},${r} 0 1 0 ${C},${C-r} Z`:`M${P(a,R)} A${R},${R} 0 ${big} 1 ${P(b,R)} L${P(b,r)} A${r},${r} 0 ${big} 0 ${P(a,r)} Z`;a=b;
  return `<path class="fin19-fat fin19-f${i}" d="${d}" fill="${F19_CORES[i%F19_CORES.length]}" ${hv(i)} ${oc?`onclick="${oc}"`:''}><title>${esc(l)}: ${o.fmt?o.fmt(v):v} (${Math.round(v/tot*100)}%)</title></path>`}).join('');
 const dados=JSON.stringify(partes.map(([l,v])=>[l,o.fmt?o.fmt(v):String(v),Math.round(v/tot*100)+'%'])).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
 return `<div class="fin19-rosca" id="${id}" data-p="${dados}" data-c="${esc(o.centro||'')}" data-s="${esc(o.sub||'')}"><svg viewBox="0 0 128 128" role="img" aria-label="${esc(o.aria||'Gráfico de rosca')}">${fat}<text class="fin19-rc-c" x="64" y="61" text-anchor="middle" font-size="${String(o.centro||'').length>8?10:13}" font-weight="800" fill="var(--fg-strong)">${esc(o.centro||'')}</text><text class="fin19-rc-s" x="64" y="76" text-anchor="middle" font-size="8" fill="var(--fg2)">${esc(o.sub||'')}</text></svg>
 <div class="fin19-leg">${partes.map(([l,v,oc,sub],i)=>`<div class="fin19-li fin19-l${i} ${oc?'clk':''}" ${hv(i)} ${oc?`onclick="${oc}" role="button" tabindex="0"`:''}><i style="background:${F19_CORES[i%F19_CORES.length]}"></i><span class="grow"><b>${esc(l)}</b>${sub?`<small>${sub}</small>`:''}</span><b class="fin19-li-v">${o.fmt?o.fmt(v):v}</b><span class="fin19-li-p">${Math.round(v/tot*100)}%</span></div>`).join('')}</div></div>`}
function fin19RcHover(id,i){try{const el=document.getElementById(id);if(!el||!el.dataset)return;const p=JSON.parse(el.dataset.p||'[]'),c=el.querySelector('.fin19-rc-c'),s=el.querySelector('.fin19-rc-s');
 el.classList.toggle('fin19-hv',i>=0);(el.querySelectorAll('.fin19-on')||[]).forEach(x=>x.classList.remove('fin19-on'));
 if(i>=0&&p[i]){(el.querySelectorAll('.fin19-f'+i+',.fin19-l'+i)||[]).forEach(x=>x.classList.add('fin19-on'));if(c)c.textContent=p[i][1];if(s)s.textContent=p[i][0].slice(0,22)+' · '+p[i][2]}
 else{if(c)c.textContent=el.dataset.c||'';if(s)s.textContent=el.dataset.s||''}}catch(e){}}

/* ---------- Linha colorida com o valor ao passar o mouse nos pontos (nota 556) ---------- */
function fin19Linha(labels,vals,o){o=o||{};const W=o.w||900,H=o.h||230,L=50,R=16,T=30,B=28,n=vals.length;if(n<2)return '';const todos=vals.concat(o.comp||[]);let lo=Math.min(...todos),hi=Math.max(...todos);const pad=(hi-lo||1)*.15;lo=Math.max(0,lo-pad);hi+=pad;
 const x=i=>L+i*(W-L-R)/(n-1),y=v=>T+(H-T-B)*(1-(v-lo)/(hi-lo)),f=o.fmt||(v=>String(v));
 const pts=vals.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`),area=`M${x(0).toFixed(1)},${H-B} L${pts.join(' L')} L${x(n-1).toFixed(1)},${H-B} Z`;
 const comp=o.comp?`<polyline fill="none" stroke="#F59E0B" stroke-dasharray="5 4" stroke-width="2" points="${o.comp.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`:'';
 const grade=[0,.25,.5,.75,1].map(k=>{const yy=T+(H-T-B)*k,v=hi-(hi-lo)*k;return `<line x1="${L}" x2="${W-R}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" stroke="var(--border)" stroke-dasharray="${k===1?'0':'2 4'}"/><text x="${L-6}" y="${(yy+3).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--fg2)">${esc(f(Math.round(v)))}</text>`}).join('');
 const ptsH=vals.map((v,i)=>{const up=i===0||v>=vals[i-1],cor=up?'#16A34A':'#DC2626',xx=x(i),yy=y(v),txt=labels[i]+': '+f(v),bw=Math.max(70,txt.length*7.2+16),bx=Math.min(Math.max(xx-bw/2,L),W-R-bw),by=yy-36<2?yy+12:yy-36,dif=i&&vals[i-1]?Math.round((v-vals[i-1])/vals[i-1]*1000)/10:null;
  return `<g class="fin19-pt" tabindex="0" ${o.onclick?`onclick="${o.onclick.replace('%i',i)}"`:''}><circle cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" r="14" fill="transparent"/><circle class="fin19-pt-c" cx="${xx.toFixed(1)}" cy="${yy.toFixed(1)}" r="5.5" fill="${cor}" stroke="var(--surface)" stroke-width="2"/><g class="fin19-pt-tip"><rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="26" rx="7" fill="var(--fg-strong)"/><text x="${(bx+bw/2).toFixed(1)}" y="${(by+17).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--surface)">${esc(txt)}</text></g><title>${esc(txt)}${dif!=null?` (${dif>=0?'+':''}${String(dif).replace('.',',')}% sobre o mês anterior)`:''}${o.comp?' · custo '+esc(f(o.comp[i])):''}</title><text x="${xx.toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="11" fill="var(--fg2)">${esc(labels[i])}</text></g>`}).join('');
 return `<svg class="fin19-linha" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria||'Gráfico de linha')}"><defs><linearGradient id="fin19GrA" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#3B82F6" stop-opacity=".35"/><stop offset="1" stop-color="#2E7D6B" stop-opacity=".03"/></linearGradient><linearGradient id="fin19GrL" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#2E7D6B"/><stop offset=".5" stop-color="#3B82F6"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>${grade}<path d="${area}" fill="url(#fin19GrA)"/>${comp}<polyline fill="none" stroke="url(#fin19GrL)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" points="${pts.join(' ')}"/>${ptsH}</svg>`}

/* ---------- Barras do fluxo de 90 dias que mostram que dá para clicar (nota 564) ---------- */
function fin19Barras(itens,o){o=o||{};const W=o.w||360,H=o.h||190,T=24,B=40,n=itens.length,max=Math.max(...itens.map(i=>i[1]))||1,bw=(W-20)/n;
 return `<svg class="fin19-barras" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria||'Gráfico de barras')}">${itens.map(([l,v,k],i)=>{const h=(H-T-B)*v/max,x=10+i*bw+bw*.16,w=bw*.68,cor=k==='warn'?'#F59E0B':k==='err'?'#DC2626':'#16A34A';
  return `<g class="fin19-bar" role="button" tabindex="0" onclick="${o.onclick.replace('%i',i)}"><rect class="fin19-bar-bg" x="${(10+i*bw+2).toFixed(1)}" y="2" width="${(bw-4).toFixed(1)}" height="${H-4}" rx="10" fill="transparent"/><rect x="${x.toFixed(1)}" y="${(H-B-h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="6" fill="${cor}"/><text x="${(x+w/2).toFixed(1)}" y="${(H-B-h-6).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--fg-strong)">${esc(o.fmt?o.fmt(v):String(v))}</text><text x="${(x+w/2).toFixed(1)}" y="${H-24}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--fg-strong)">${esc(l)}</text><text class="fin19-bar-ver" x="${(x+w/2).toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="10.5" fill="var(--accent)">ver detalhes ›</text><title>${esc(l)}: clique para ver cada entrada e saída</title></g>`}).join('')}</svg>`}

/* ---------- Monta a Visão do mês com os filtros aplicados ---------- */
function fin19Visao(h){const ini=h.indexOf('id="fb-fn"');if(ini<0)return h;const a=h.indexOf('<div class="mini">',ini);if(a<0)return h;const d=fin19VisaoDados(),k=d.share;
 const piadas=(h.slice(a).match(/<p class="fun">[\s\S]*?<\/p>/g)||[]).join('');
 const lab=[FN_LADO!=='Ambos'?FN_LADO+(FN_LADO==='B2C'?' (recepção)':' (postos, parceiros e empresas)'):'B2C e B2B',d.u?unidNome(+d.u):'todas as unidades',d.perTxt].join(' · ');
 const kp=[miniKpi('Receita do central',fmt(d.rec),esc(d.perTxt)+' · '+d.os.length+' origem(ns)','ok',`fin19VisaoLista('receita')`),
  miniKpi('B2C · B2B',d.rec?Math.round(d.b2c/d.rec*100)+'% · '+Math.round(d.b2b/d.rec*100)+'%':'—',fmt(d.b2c)+' recepção · '+fmt(d.b2b)+' postos, parceiros e empresas','',`fin19VisaoLista('lado')`),
  miniKpi('Custo dos exames',fmt(d.custo),d.rec?'30% da receita do filtro':'sem receita no filtro','',`fin19VisaoLista('custo')`),
  miniKpi('A receber',fmt(d.abR.reduce((s,[c])=>s+fin19Falta(c),0)),d.abR.length+' conta(s) em aberto','warn',`fin19Lista('receber','aberto')`),
  miniKpi('A pagar (7 dias)',fmt(d.ab7.reduce((s,[c])=>s+c.v,0)),d.ab7.length+' conta(s) até '+dmy(fin19Mais7()).slice(0,5),'warn',`fin19Lista('pagar','7d')`),
  miniKpi('Resultado',fmt(d.res),'26% da receita · ver DRE','ok',`FN_ABA='dre';reView()`),
  miniKpi('Já pago',fmt(d.pg.reduce((s,c)=>s+c.v,0)),d.pg.length+' conta(s) · aba Saídas','ok',`fin19Lista('saidas','total')`),
  miniKpi('Já recebido',fmt(d.rc.reduce((s,c)=>s+fnRecebido(c),0)),d.rc.length+' conta(s) · aba Entradas','ok',`fin19Lista('entradas','total')`)].join('');
 const resumo=`<div class="fin19-fsum ${d.filtrado?'on':''}"><span>Mostrando: <b>${esc(lab)}</b></span>${d.filtrado?`<button class="btn sm ghost" onclick="fin19VisaoLimpar()">Limpar filtros</button>`:''}</div>`;
 const rosca=d.os.length?fin19Rosca(d.os.map(o=>[o.n,Math.round(o.rep*d.fat),`fnOrigem(${o.i})`,(o.bal===o.rep?(o.i?'fatura direta':'valor ao paciente'):'balcão '+fmt(Math.round(o.bal*d.fat))+' · repassa '+Math.round(o.rep/o.bal*100)+'%')+(o.venc?' · <span style="color:var(--err);font-weight:700">vencido '+fmt(o.venc)+'</span>':o.aberto?' · em aberto '+fmt(o.aberto):'')]),{id:'fin19RcOrig',centro:'R$ '+Math.round(d.rec/1000).toLocaleString('pt-BR')+' mil',sub:d.perTxt.split(' (')[0],fmt:fmt,aria:'Receita por origem'}):'<div class="empty" style="padding:18px"><h4>Nenhuma origem com esses filtros</h4><p>Troque B2C/B2B ou a unidade.</p></div>';
 const meses=['nov','dez','jan','fev','mar','abr','mai','jun','jul','ago','set','out'];
 const linha=k?fin19Linha(meses,FN_MESES.rec.map(v=>Math.round(v*k)),{comp:FN_MESES.cus.map(v=>Math.round(v*k)),fmt:v=>'R$ '+v+' mil',onclick:'fnMes(%i)',aria:'Receita por mês'}):'<div class="empty" style="padding:18px"><h4>Sem receita com esses filtros</h4></div>';
 const postos=[['Posto 14 · Aldeota',72400,38120,'14'],['Posto 12 · Messejana',47300,24910,'12'],['Clínica Vida Plena (parceira)',18900,11200,'10'],['Mineradora Vale Verde (empresa)',26790,26790,'10']].filter(p=>FN_LADO!=='B2C'&&(!d.u||p[3]===d.u)).map(([n,b,r])=>[n,Math.round(b*d.fat),Math.round(r*d.fat)]);
 const grid=`<div class="grid g2"><div class="card ill at-card">${ILL.pizza}<h3>Por origem ${info('O que entra no central: recepção pelo valor ao paciente; postos, parceiros e empresas só pelo que pagam ao central. Passe o mouse num nome ou numa fatia para destacar; clique para o detalhe.')}</h3>${rosca}</div>
<div class="card ill at-card fin19-fluxo">${ILL.cofre}<h3>Fluxo de caixa · 90 dias ${info('Saldo projetado de cada mês a partir das contas lançadas e das recorrentes. Clique numa coluna ou num botão para ver cada entrada e cada saída.')}</h3><p class="fin19-dica">Clique numa coluna para ver o detalhe do mês</p>${fin19Barras([['nov',88,'ok'],['dez',64,'ok'],['jan',41,'warn']],{fmt:v=>'+ R$ '+v+' mil',onclick:'fnMes(11+%i)',aria:'Fluxo de caixa dos próximos 90 dias'})}<div class="row fin19-fluxo-bts">${[['novembro',11],['dezembro',12],['janeiro',13]].map(([m,i])=>`<button class="btn sm sec" onclick="fnMes(${i})">Ver ${m} ›</button>`).join('')}</div><p class="tl">Janeiro já desconta o 13º e a fatura do apoio.</p></div>
<div class="card ill at-card span2">${ILL.grafico}<h3>Receita por mês ${info('12 meses de receita do central no filtro escolhido. Passe o mouse num ponto para ver o valor; clique para abrir o mês. Ponto verde: subiu em relação ao mês anterior; vermelho: caiu.')}</h3>${linha}<p class="tl fin19-leg-l"><span><i style="background:linear-gradient(90deg,#2E7D6B,#3B82F6,#8B5CF6)"></i>Receita do central</span><span><i class="tr"></i>Custo dos exames</span><span><i class="ok"></i>subiu</span><span><i class="er"></i>caiu</span></p></div>
<div class="card ill at-card span2">${ILL.balanca}<h3>Postos e parceiros: balcão × repasse ${info('O que cada posto ou parceiro recebe no balcão e o que repassa ao central. Clique para o detalhe por exame.')}</h3>${FN_LADO==='B2C'?'<p class="tl">O filtro B2C mostra só a recepção da matriz. Escolha Ambos ou B2B para ver os postos e parceiros.</p>':tabela(['Posto / parceiro','Recebe no balcão','Repassa ao central','Fica com o posto','Margem'],postos.map(([n,b,r])=>`<tr class="clk" onclick="fnParceiro('${fin19Q(n)}',${b},${r})">${td('Posto',esc(n))}${td('Balcão',fmt(b))}${td('Repasse',fmt(r))}${td('Fica',b===r?'<span class="tl">fatura direta</span>':fmt(b-r))}${td('Margem',b===r?'—':`<span class="mg ${(b-r)/b<.2?'baixa':'ok'}">${Math.round((b-r)/b*100)}%</span>`)}</tr>`),'Nenhum posto ou parceiro nessa unidade')}</div></div>`;
 return h.slice(0,a)+resumo+`<div class="mini">${kp}</div>\n`+grid+'\n'+piadas}
function fin19VisaoLista(q){const d=fin19VisaoDados();
 if(q==='receita')return listaDrawer('Receita do central · '+d.perTxt,d.os.map(o=>`<b>${esc(o.n)}</b><small>${fmt(Math.round(o.rep*d.fat))}${o.bal!==o.rep?' de repasse (balcão '+fmt(Math.round(o.bal*d.fat))+')':''}</small>`),'Postos e parceiros entram só com o que pagam ao central.');
 if(q==='lado')return listaDrawer('B2C e B2B · '+d.perTxt,[`<b>B2C · recepção</b><small>${fmt(d.b2c)}</small>`,`<b>B2B · postos, parceiros e empresas</b><small>${fmt(d.b2b)}</small>`]);
 return listaDrawer('Custo dos exames · '+d.perTxt,[['Reagentes e insumos',.655],['Apoio (Pardini e DB)',.267],['Tubos e materiais de coleta',.078]].map(([n,p])=>`<b>${n}</b><small>${fmt(Math.round(d.custo*p))}</small>`))}

/* ==========================================================================
   FINANCEIRO · A receber, A pagar, Entradas e Saídas
   ========================================================================== */

/* ---------- Abas Entradas (já recebido) e Saídas (já pago) (notas 557 e 559) ---------- */
let F19_MV={entradas:{per:'todos',cat:''},saidas:{per:'todos',cat:''}};
const fin19Abertas=t=>CONTAS.map((c,i)=>[c,i]).filter(([c])=>c.t===t&&c.s!=='Paga');
const fin19Movs=t=>CONTAS.map((c,i)=>[c,i]).filter(([c])=>t==='entradas'?c.t==='receber'&&(c.s==='Paga'||(c.recebido||0)>0):c.t==='pagar'&&c.s==='Paga');
function fin19MovPassa(c,f){const m=fin19DataMov(c).slice(3,5);if(f.per==='out'&&m!=='10')return false;if(f.per==='nov'&&m!=='11')return false;if(f.cat&&c.cat!==f.cat)return false;return true}

/* ---------- Botões ao lado da situação, em todos os tipos de conta (notas 548 a 551 e 568) ---------- */
function fin19SitCel(c,i){const b=`<span class="badge ${fnSitCls(c)}">${fin19SitTxt(c)}</span>`,s='event.stopPropagation();';let a='';
 const cont=`<button class="btn sm ghost" onclick="${s}fin19Contestacao(${i})">Ver contestação</button>`;
 if(c.t==='pagar')a=c.s==='Paga'?`<button class="btn sm sec" onclick="${s}fnComprovante(${i})">Comprovante</button>`:c.s==='Contestada'?cont:fnPagarBtn(i,true).replace('style="margin-top:4px"','');
 else if(c.s==='Paga')a=`<button class="btn sm ghost" onclick="${s}fnBaixaDesfazer(${i})">Desfazer baixa</button>`;
 else if(c.x==='c'||c.s==='Contestada')a=cont;
 else a=`<button class="btn sm sec" onclick="${s}fnBaixa(${i})">${c.recebido?'Dar baixa do resto':'Dar baixa'}</button>`+((c.s==='Vencido'||fnVencIso(c)<FN_REF)?`<button class="btn sm warn" onclick="${s}fnCobrar(${i})">Cobrar</button>`:'');
 return `<span class="r18r-sit fin19-sit">${b}${a}</span>`}

/* ---------- Barra de filtros só com as contas em aberto ---------- */
function fin19FiltroBar(t,l){const f=fnFl(t),base=fin19Abertas(t).map(([c])=>c),tipos=[...new Set(base.map(c=>c.tipo))].sort(),cats=[...new Set(base.map(c=>c.cat))].sort(),sits=[...new Set(base.map(fnSit))].sort(),ativo=f.per!=='todos'||f.tipo||f.cat||f.sit;
 const sel=(k,lab,ops)=>`<label class="fn-f"><span>${lab}</span><select class="in" aria-label="${lab}" onchange="fnFlSet('${t}','${k}',this.value)">${ops.map(([v,x])=>`<option value="${esc(v)}" ${f[k]===v?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`;
 return `<div class="filters fn-filtros">${sel('per','Período (vencimento)',FN_PER)}${f.per==='pers'?`<label class="fn-f"><span>De</span><input class="in" type="date" value="${f.de}" aria-label="De" onchange="fnFlSet('${t}','de',this.value)"></label><label class="fn-f"><span>Até</span><input class="in" type="date" value="${f.ate}" aria-label="Até" onchange="fnFlSet('${t}','ate',this.value)"></label>`:''}${sel('tipo','Tipo de conta',[['','Todos os tipos'],...tipos.map(x=>[x,x])])}${sel('cat','Categoria',[['','Todas as categorias'],...cats.map(x=>[x,planoNome(x)])])}${sel('sit','Situação',[['','Todas'],...sits.map(x=>[x,fin19SitLab(x)])])}${ativo?`<button class="btn sm ghost" onclick="fnFlLimpar('${t}')">Limpar filtros</button>`:''}<span class="tl" style="margin-left:auto">${l.length} de ${base.length} contas em aberto · ${fmt(l.reduce((s,[c])=>s+fin19Falta(c),0))}</span></div>`}

/* ---------- Cards que abrem a lista à direita, com ações (notas 572, 573 e 575) ---------- */
function fin19Grupo(t,g){
 if(t==='entradas'||t==='saidas'){const l=fin19Movs(t).filter(([c])=>fin19MovPassa(c,F19_MV[t]));if(g==='mes')return l.filter(([c])=>fin19DataMov(c).slice(3,5)==='11');if(g==='parcial')return l.filter(([c])=>c.s!=='Paga');if(g==='pix')return l.filter(([c])=>!!c.pixTemp);return l}
 const ab=fin19Abertas(t),lim=fin19Mais7();
 if(g==='vencido')return ab.filter(([c])=>c.s==='Vencido'||(fnVencIso(c)&&fnVencIso(c)<FN_REF));
 if(g==='7d')return ab.filter(([c])=>{const d=fnVencIso(c);return d&&d<=lim});
 if(g==='aprov')return ab.filter(([c])=>alInfo(c).pend);
 if(g==='parcial')return ab.filter(([c])=>c.recebido);
 if(g==='cont')return ab.filter(([c])=>c.s==='Contestada'||c.x==='c');
 return ab}
const F19_GN={aberto:'Em aberto',vencido:'Vencidas',aprov:'Aguardando aprovação','7d':'Vencem em 7 dias',parcial:'Recebidas em parte',cont:'Contestadas',total:'Todas',mes:'Novembro de 2026',pix:'Pagas por Pix copia e cola'};
const F19_TN={receber:'A receber',pagar:'A pagar',entradas:'Entradas',saidas:'Saídas'};
function fin19Lista(t,g){const l=fin19Grupo(t,g),mov=t==='entradas'||t==='saidas',val=c=>t==='entradas'?fnRecebido(c):mov?c.v:fin19Falta(c),tot=l.reduce((s,[c])=>s+val(c),0);
 const linhas=l.map(([c,i])=>`<div class="at-row fin19-lrow clk" onclick="fnConta(${i})"><div class="grow"><b>${esc(c.q)}</b><small>${esc(c.ref)} · ${mov?(t==='entradas'?'recebido em ':'pago em ')+fin19DataMov(c):'vence '+esc(c.venc)}</small></div><b class="fin19-lval">${fmt(val(c))}</b>${fin19SitCel(c,i)}</div>`).join('');
 openDrawer(`${F19_TN[t]} · ${F19_GN[g]||g}`,`${kvs([['Contas',String(l.length)],['Total',`<b>${fmt(tot)}</b>`]])}
 <p class="tl" style="margin:8px 0">Clique na conta para abrir os detalhes. Os botões ao lado da situação fazem a ação direto daqui.</p>
 <div class="at-list fin19-lista">${linhas||'<div class="empty" style="padding:16px"><h4>Nenhuma conta aqui</h4></div>'}</div>
 <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap">${mov?`<button class="btn sec" onclick="closeDrawer();FN_ABA='${t}';reView()">Abrir a aba ${F19_TN[t]}</button>`:`<button class="btn sec" onclick="closeDrawer();fin19ListaFiltra('${t}','${g}')">Mostrar só estas na lista</button>`}${t==='pagar'&&g==='aprov'?`<button class="btn sec" onclick="closeDrawer();FN_ABA='aprov';reView()">Ir para Aprovações</button>`:''}<button class="btn ghost" onclick="fin19ListaCsv('${t}','${g}')">${I.dl} Baixar lista (Excel)</button></div>`)}
function fin19ListaFiltra(t,g){FN_ABA=t;if(g==='vencido')fnFlSet(t,'per','venc');else if(g==='7d')fnFlSet(t,'per','7d');else if(g==='parcial')fnFlSet(t,'sit','Recebida em parte');else if(g==='cont'&&t==='pagar')fnFlSet(t,'sit','Contestada');else fnFlLimpar(t)}
function fin19ListaCsv(t,g){const l=fin19Grupo(t,g),nome='financeiro-'+t+'-'+g+'.csv';r17Baixar(nome,r17Csv([['Favorecido ou devedor','Descrição','Categoria','Vencimento','Valor','Situação'],...l.map(([c])=>[c.q,c.ref,planoNome(c.cat),fnVencLongo(c),r17N(c.v),fin19SitTxt(c)])]));fin19Aud(`Lista "${F19_TN[t]} · ${F19_GN[g]||g}" baixada (${l.length} conta(s))`);toast('Lista baixada: '+nome)}

/* ---------- A receber e A pagar: só o que está em aberto; o pago vai para Saídas e o recebido para Entradas ---------- */
function fin19ContasTab(t){const pagar=t==='pagar',l=fnFiltradas(t).filter(([c])=>c.s!=='Paga'),ab=fin19Abertas(t),soma=a=>a.reduce((s,[c])=>s+fin19Falta(c),0),venc=fin19Grupo(t,'vencido'),mv=fin19Movs(pagar?'saidas':'entradas'),pc=fin19Grupo(t,'parcial');
 const kp=`<div class="mini fin19-kp" style="margin-bottom:10px">${miniKpi('Em aberto',fmt(soma(ab)),ab.length+' conta(s) · ver lista','',`fin19Lista('${t}','aberto')`)}${miniKpi('Vencido',fmt(soma(venc)),venc.length+' conta(s) · ver lista',venc.length?'err':'ok',`fin19Lista('${t}','vencido')`)}${pagar?miniKpi('Aguardando aprovação',String(fin19Grupo(t,'aprov').length),'conta(s) na alçada · ver lista','warn',`fin19Lista('pagar','aprov')`):miniKpi('Recebido parcialmente',fmt(soma(pc)),pc.length+' conta(s) · falta receber','warn',`fin19Lista('receber','parcial')`)}${miniKpi(pagar?'Já pago':'Já recebido',fmt(mv.reduce((s,[c])=>s+(pagar?c.v:fnRecebido(c)),0)),mv.length+' conta(s) · aba '+(pagar?'Saídas':'Entradas'),'ok',`fin19Lista('${pagar?'saidas':'entradas'}','total')`)}</div>`;
 return `${pagar?`<div class="alert info fn-regra"><span><b>Quem lança não aprova nem paga</b> (exceto o Administrador). Cada conta passa pela <b>alçada</b> do centro de custo antes de poder ser paga: gestor; acima do limite, dupla assinatura com o diretor financeiro; acima do 2º limite, também o Administrador. <a href="#" onclick="event.preventDefault();FN_ABA='aprov';reView()">Ver fila de aprovação</a>. ${info('Segregação de funções: uma pessoa lança, outra confere e paga. O Administrador pode as duas coisas; fica registrado na auditoria.')}</span><span class="row" style="gap:4px;margin-left:auto"><span class="tl">Testar como:</span>${fnComoChips()}</span></div>`:''}${kp}${fin19FiltroBar(t,l)}<p class="tl" style="margin-bottom:8px">${pagar?'Contas a pagar em aberto (apoio, fornecedores, despesas e acertos com postos). As já pagas ficam na aba <a href="#" onclick="event.preventDefault();FN_ABA=\'saidas\';reView()">Saídas</a>.':'Contas a receber em aberto (convênios, postos, parceiros, empresas e particular). O que já foi recebido fica na aba <a href="#" onclick="event.preventDefault();FN_ABA=\'entradas\';reView()">Entradas</a>.'} Clique na linha para ver a conta.</p>${tabela([pagar?'Favorecido':'Devedor','Categoria','Descrição','Vencimento','Valor','Recorrência',pagar?'Lançada por':'',pagar?'Aprovação':'','Situação'].filter(Boolean),l.map(([c,i])=>`<tr class="clk" onclick="fnConta(${i})" ${tipAttr('Conta','Abre a conta: parcelas, anexos (contrato, NF, recibo), recorrência e histórico.')}>${td(pagar?'Favorecido':'Devedor',`<span class="two" style="white-space:nowrap"><b>${esc(c.q)}</b><small class="tl" style="display:block">${esc(c.tipo)}</small></span>`)}${td('Categoria',`<span title="${planoNome(c.cat)}">${(PLANO.find(x=>x[0]===c.cat)||['',c.cat])[1]}</span>${fnOrcBadge(c.cat,true)}`)}${td('Descrição',esc(c.ref))}${td('Vencimento',c.s==='Vencido'?`<span class="prazo-err">${c.venc}</span>`:c.venc)}${td('Valor',fmt(c.v)+(c.recebido?`<small class="tl" style="display:block">recebido ${fmt(c.recebido)} · falta ${fmt(fin19Falta(c))}</small>`:''))}${td('Recorrência',recTag(c))}${pagar?td('Lançada por',esc(c.por||'Jânio')):''}${pagar?td('Aprovação',alProxTxt(c)):''}${td('Situação',fin19SitCel(c,i))}</tr>`),'Nenhuma conta em aberto com esses filtros').replace('class="at-table"','class="at-table compacta"')}`}
fnContasTab=function(t){return fin19ContasTab(t)};

function fin19MovTab(t){const ent=t==='entradas',f=F19_MV[t],base=fin19Movs(t),l=base.filter(([c])=>fin19MovPassa(c,f)),cats=[...new Set(base.map(([c])=>c.cat))].sort(),val=c=>ent?fnRecebido(c):c.v,soma=a=>a.reduce((s,[c])=>s+val(c),0),mes=fin19Grupo(t,'mes'),pc=fin19Grupo(t,'parcial'),px=fin19Grupo(t,'pix');
 const sel=(k,lab,ops)=>`<label class="fn-f"><span>${lab}</span><select class="in" aria-label="${lab}" onchange="F19_MV.${t}.${k}=this.value;reView()">${ops.map(([v,x])=>`<option value="${esc(v)}" ${f[k]===v?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`;
 const kp=`<div class="mini fin19-kp" style="margin-bottom:10px">${miniKpi(ent?'Total recebido':'Total pago',fmt(soma(l)),l.length+' conta(s) · ver lista','ok',`fin19Lista('${t}','total')`)}${miniKpi(ent?'Recebido em novembro':'Pago em novembro',fmt(soma(mes)),mes.length+' conta(s) · ver lista','',`fin19Lista('${t}','mes')`)}${ent?miniKpi('Recebido em parte',fmt(soma(pc)),pc.length+' conta(s) · o resto segue em A receber','warn',`fin19Lista('entradas','parcial')`):miniKpi('Pix copia e cola',String(px.length),'pagamento(s) com código temporário','',`fin19Lista('saidas','pix')`)}</div>`;
 return `<div class="alert info"><span>${ent?'<b>Entradas</b>: tudo o que já foi recebido (baixa total ou parcial). Desfazer uma baixa pede motivo e fica no histórico da conta e na auditoria; nada é apagado.':'<b>Saídas</b>: as contas já pagas, com o comprovante. Um pagamento não é apagado: correções ficam no histórico da conta e na trilha de auditoria.'}</span></div>${kp}
 <div class="filters fn-filtros">${sel('per',ent?'Recebido em':'Pago em',[['todos','Todo o período'],['out','Outubro de 2026'],['nov','Novembro de 2026']])}${sel('cat','Categoria',[['','Todas as categorias'],...cats.map(x=>[x,planoNome(x)])])}${f.per!=='todos'||f.cat?`<button class="btn sm ghost" onclick="F19_MV.${t}={per:'todos',cat:''};reView()">Limpar filtros</button>`:''}<span class="tl" style="margin-left:auto">${l.length} de ${base.length} · ${fmt(soma(l))}</span></div>
 ${tabela([ent?'Devedor':'Favorecido','Categoria','Descrição',ent?'Recebido em':'Pago em',ent?'Forma':'Pago por · forma',ent?'Valor recebido':'Valor pago','Situação'],l.map(([c,i])=>`<tr class="clk" onclick="fnConta(${i})">${td(ent?'Devedor':'Favorecido',`<span class="two" style="white-space:nowrap"><b>${esc(c.q)}</b><small class="tl" style="display:block">${esc(c.tipo)}</small></span>`)}${td('Categoria',(PLANO.find(x=>x[0]===c.cat)||['',c.cat])[1])}${td('Descrição',esc(c.ref))}${td(ent?'Recebido em':'Pago em',fin19DataMov(c))}${td('Forma',ent?esc((c.baixa&&c.baixa.forma)||'—')+(c.baixa&&c.baixa.q?`<small class="tl" style="display:block">baixa por ${esc(c.baixa.q)}</small>`:''):esc(c.pagoPor||'—')+`<small class="tl" style="display:block">${esc(fin19FormaSaida(c))}</small>`)}${td('Valor',fmt(val(c))+(ent&&c.s!=='Paga'?`<small class="tl" style="display:block">de ${fmt(c.v)} · falta ${fmt(fin19Falta(c))}</small>`:''))}${td('Situação',fin19SitCel(c,i))}</tr>`),ent?'Nada recebido neste filtro':'Nada pago neste filtro').replace('class="at-table"','class="at-table compacta"')}`}

/* ---------- Abas no Financeiro ---------- */
{const _f=VIEWS.financeiro;VIEWS.financeiro=function(){const aba=FN_ABA;let h=_f.apply(this,arguments);
 h=h.replace(/(<button class="tab [^"]*" onclick="FN_ABA='pagar';reView\(\)">A pagar<\/button>)/,`$1<button class="tab ${aba==='entradas'?'active':''}" onclick="FN_ABA='entradas';reView()">Entradas</button><button class="tab ${aba==='saidas'?'active':''}" onclick="FN_ABA='saidas';reView()">Saídas</button>`);
 if(aba==='entradas'||aba==='saidas'){const a=h.indexOf('<div class="tabs" role="tablist">'),b=a<0?-1:h.indexOf('</div>',a);if(b>=0)h=h.slice(0,b+6)+'\n'+fin19MovTab(aba)}
 if(aba==='visao')h=fin19Visao(h);
 return h}}

/* ---------- Dar baixa total: avisa que a conta foi para Entradas; pagar: foi para Saídas ---------- */
{const _b=fnBaixaOk;fnBaixaOk=function(i){const c=CONTAS[i],a=c&&c.s;const r=_b.apply(this,arguments);if(c&&a!=='Paga'&&c.s==='Paga')toast(`${c.q} foi para a aba Entradas (já recebido)`);return r}}
{const _p=fnPagar;fnPagar=function(i){const c=CONTAS[i],a=c&&c.s;if(c&&c.pixTemp&&a!=='Paga'&&fnPodePagar(c))c.pixTemp.usado=r17Agora();const r=_p.apply(this,arguments);if(c&&a!=='Paga'&&c.s==='Paga'){if(c.pixTemp)fin19Hist(c,'Paga por Pix copia e cola (código temporário, só para este pagamento)');toast(`${c.q} foi para a aba Saídas (já pago)`)}else if(c&&c.pixTemp&&c.s!=='Paga')c.pixTemp.usado=null;return r}}

/* ---------- Gaveta da conta: "Recebido parcialmente · falta", campo com o motivo da contestação (notas 569 e 579) ---------- */
{const _c=fnConta;fnConta=function(i){const c=CONTAS[i];if(!c)return _c.apply(this,arguments);return fin19ComDrawer(()=>_c.apply(this,arguments),h=>{
 h=h.replace(/>Recebida em parte</g,'>'+fin19SitTxt(c)+'<');
 if(c.contest&&!c.contest.fim)h=fin19ContBox(c,i)+h;
 if(c.pixTemp)h=h.replace(/(<h4 style="margin-top:10px">Anexos)/,`<div class="alert info fin19-pixinfo"><span><b>Pix copia e cola temporário</b> para este pagamento (registrado em ${esc(c.pixTemp.h)} por ${esc(c.pixTemp.q)}). Sai no comprovante.</span></div>$1`);
 return h})}}
function fin19ContBox(c,i){const k=c.contest;return `<div class="card fin19-cont"><div class="fin19-cont-t">Conta contestada · ${esc(k.resp)}</div><div class="field"><label for="fin19ContMot">Motivo da contestação</label><textarea class="in" id="fin19ContMot" rows="5">${esc(k.motivo)}</textarea></div><small class="tl">Aberta por ${esc(k.por)} em ${esc(k.aberta)} · resposta até ${esc(k.prazo)}. Mudar o motivo fica no histórico.</small><div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm" onclick="fin19ContSalvar(${i})">Salvar motivo</button><button class="btn sm sec" onclick="fin19Contestacao(${i})">Ver contestação completa</button></div></div>`}
function fin19ContSalvar(i){const c=CONTAS[i];if(!c||!c.contest)return;const m=fin19G('fin19ContMot').trim();if(m.length<10){toast('Escreva o motivo da contestação (pelo menos 10 letras)','warn');return}if(m===c.contest.motivo){toast('O motivo não mudou');return}
 c.contest.motivo=m;fin19Hist(c,'Motivo da contestação alterado: '+m);fin19Aud(`${c.q}: motivo da contestação alterado por ${FN_USU}`);fnConta(i);toast('Motivo da contestação salvo; fica no histórico da conta')}

/* ---------- Ver contestação: mostra a contestação de verdade, não só manda para outra tela (nota 576) ---------- */
function fin19Contestacao(i){const c=CONTAS[i];if(!c)return;const k=c.contest||{aberta:'—',por:c.por||'—',devido:c.v,fatura:c.v,prazo:'—',resp:'Aguardando resposta',motivo:'Motivo não informado ainda.',itens:[]};
 openModal(`${mh('Contestação · '+esc(c.q))}<div class="mb">${kvs([['Conta',esc(c.ref)],['Devido pela tabela',`<b>${fmt(k.devido)}</b>`],['Valor cobrado na fatura',fmt(k.fatura)],['Diferença contestada',`<b style="color:var(--err)">${fmt(k.fatura-k.devido)}</b>`],['Aberta por',esc(k.por)+' · '+esc(k.aberta)],['Situação',`<span class="badge warn">${esc(k.fim?'Encerrada':k.resp)}</span>`+(k.fim?'':` <small class="tl">resposta até ${esc(k.prazo)}</small>`)]])}
 <h4 style="margin-top:12px">Motivo da contestação</h4><div class="fin19-cont-mot">${esc(k.motivo)}</div>
 ${k.itens.length?`<h4 style="margin-top:12px">Itens contestados</h4>${tabela(['O que foi encontrado','Exame','Valor'],k.itens.map(([a,b,v])=>`<tr data-det="0">${td('O que',esc(a))}${td('Exame',esc(b))}${td('Valor',v<0?`<span style="color:var(--ok)">− ${fmt(-v)}</span>`:fmt(v))}</tr>`))}`:''}
 ${k.fim?`<div class="alert ok" style="margin-top:10px"><span><b>Encerrada</b> por ${esc(k.fim.q)} em ${esc(k.fim.h)}: ${esc(k.fim.m)}</span></div>`:''}
 <p class="tl" style="margin-top:8px">Enquanto a contestação está aberta, a conta não pode ser aprovada nem paga. Tudo fica no histórico da conta e na auditoria.</p></div>
 <div class="mf mf-fixo"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="closeModal();closeDrawer();location.hash='#apoio'">Abrir a tela do Apoio</button>${k.fim||!c.contest?'':`<button class="btn" onclick="fin19ContEncerrar(${i})">Encerrar contestação</button>`}</div>`,'wide')}
function fin19ContEncerrar(i){const c=CONTAS[i];if(!c||!c.contest)return;const go=m=>{c.contest.fim={q:FN_USU,h:r17Agora(),m};c.s='A vencer';c.s=fin19SitPorVenc(c);fin19Hist(c,'Contestação encerrada: '+m);fin19Aud(`${c.q} (${fmt(c.v)}): contestação encerrada por ${FN_USU}. ${m}`);closeModal();closeDrawer();reView();toast('Contestação encerrada; a conta voltou para a alçada como '+c.s)};
 if(typeof f2Motivo==='function')f2Motivo('Encerrar contestação · '+esc(c.q),'Conte o que o fornecedor respondeu (por exemplo: aceitou a diferença e mandou nova fatura). A contestação continua guardada no histórico.',go,'Encerrar','');else go('sem motivo')}

/* ---------- Editar conta: a data de vencimento é salva e a situação acompanha (nota 570) ---------- */
function fin19VencTxt(d){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(d||'');if(!m)return '';const curto=(m[1]==='2026'&&+m[2]>2)||(m[1]==='2027'&&+m[2]<=2);return m[3]+'/'+m[2]+(curto?'':'/'+m[1])}
function fin19SitPorVenc(c){if(['Paga','Contestada','Recebida em parte','A confirmar'].includes(c.s))return c.s;const d=fnVencIso(c);if(!d)return c.s;if(d<FN_REF)return 'Vencido';if(c.s==='Vencido')return c.t==='pagar'&&alInfo(c).ok?'Aprovada':'A vencer';return c.s}

/* ---------- Pix: chave do credor carrega sozinha, ou Pix copia e cola só para este pagamento (nota 610) ---------- */
function fin19LancarHtml(h,c){
 h=h.replace(/<input class="in" type="date" value="[^"]*">/,`<input class="in" type="date" id="fin19Venc" aria-label="Vencimento" value="${c?fnVencIso(c):''}">`);
 h=h.replace(/oninput="lcSugere\(this\.value\);lcFornIc\(\)"/,'oninput="lcSugere(this.value);lcFornIc();fin19PixAuto()"');
 const temp=!!(c&&c.pixTemp);
 h=h.replace(/(<input class="in" id="lcPix"[^>]*>)(<\/div>)/,`$1<label class="fn-f fin19-pixmodo"><span>Como pagar por Pix</span><select class="in" id="fin19PixModo" onchange="fin19PixModoUi()"><option value="chave" ${temp?'':'selected'}>Chave Pix do credor</option><option value="temp" ${temp?'selected':''}>Pix copia e cola (código só para este pagamento)</option></select></label><small class="tl" id="fin19PixOrig"></small>$2<div class="field" id="fin19PixCCw" style="grid-column:1/-1;${temp?'':'display:none'}"><label for="fin19PixCC">Código Pix copia e cola <span class="req">*</span></label><textarea class="in" id="fin19PixCC" rows="3" placeholder="Cole aqui o código que começa com 000201">${esc(temp?c.pixTemp.cod:'')}</textarea><small class="tl">Vale só para este pagamento: a chave do cadastro do credor não muda. O comprovante desta saída registra que foi por Pix copia e cola temporário.</small></div>`);
 return h}
function fin19PixModoUi(){try{const m=fin19G('fin19PixModo'),w=document.getElementById('fin19PixCCw'),p=document.getElementById('lcPix');if(w&&w.style)w.style.display=m==='temp'?'':'none';if(p)p.disabled=m==='temp'}catch(e){}}
function fin19PixMostra(f){try{const p=document.getElementById('lcPix'),o=document.getElementById('fin19PixOrig');if(!p||!f||!f.pix)return;p.value=f.pix;if(p.dataset)p.dataset.fin19Auto='1';if(o)o.textContent='Chave carregada do cadastro de '+f.n+(f.pixTipo?' ('+f.pixTipo+')':'')}catch(e){}}
function fin19PixAuto(){try{const n=fin19G('lcForn').trim(),f=FORNECEDORES.find(x=>x.n===n),p=document.getElementById('lcPix'),o=document.getElementById('fin19PixOrig');if(!p)return;const auto=p.dataset&&p.dataset.fin19Auto==='1';
 if(f&&f.pix&&(!p.value||auto))fin19PixMostra(f);else if(!f&&auto){p.value='';p.dataset.fin19Auto='';if(o)o.textContent=''}}catch(e){}}
{const _l=fnLancar;fnLancar=function(i){const c=i!=null?CONTAS[i]:null;const r=fin19ComModal(()=>_l.apply(this,arguments),h=>fin19LancarHtml(h,c));fin19PixModoUi();try{const f=FORNECEDORES.find(x=>x.n===fin19G('lcForn').trim()),o=document.getElementById('fin19PixOrig');if(o&&f&&f.pix&&fin19G('lcPix')===f.pix)o.textContent='Chave carregada do cadastro de '+f.n}catch(e){}return r}}
{const _e=lcEscolhe;lcEscolhe=function(n){const r=_e.apply(this,arguments);try{const f=FORNECEDORES.find(x=>x.n===n),p=document.getElementById('lcPix');if(f&&f.pix&&p&&(!p.value||(p.dataset&&p.dataset.fin19Auto==='1')||p.value===f.pix))fin19PixMostra(f)}catch(e){}return r}}
{const _g=lcGuarda;lcGuarda=function(){const g=_g.apply(this,arguments);['fin19Venc','fin19PixModo','fin19PixCC'].forEach(id=>{const v=fin19G(id);if(v)g[id]=v});return g}}
{const _v=lcVolta;lcVolta=function(){const r=_v.apply(this,arguments);fin19PixModoUi();return r}}
{const _s=lcSalvar;lcSalvar=function(i){const venc=fin19G('fin19Venc'),modo=fin19G('fin19PixModo')||'chave',cc=fin19G('fin19PixCC').trim().replace(/\s+/g,'');
 if(modo==='temp'){if(!cc){toast('Cole o código Pix copia e cola deste pagamento','warn');return}if(!/^000201/.test(cc)||cc.length<40){toast('Código Pix copia e cola inválido: ele começa com 000201 e é bem longo. Copie de novo da cobrança','warn');return}}
 const forn=fin19G('lcForn').trim(),bol=soDig(fin19G('lcBol')),ok=!!forn&&(!bol.length||[47,48].includes(bol.length)),n0=CONTAS.length;
 const r=_s.apply(this,arguments);if(!ok)return r;const c=i!=null?CONTAS[i]:(CONTAS.length>n0?CONTAS[CONTAS.length-1]:null);if(!c)return r;let mud=false,msg='';
 const nv=fin19VencTxt(venc);if(nv&&nv!==c.venc){const ant=c.venc;c.venc=nv;fin19Hist(c,'Vencimento alterado de '+ant+' para '+nv);mud=true}
 const s0=c.s,s1=fin19SitPorVenc(c);if(s1!==s0){c.s=s1;fin19Hist(c,`Situação mudou de ${s0} para ${s1} pela nova data de vencimento`);fin19Aud(`${c.q} (${fmt(c.v)}): vencimento ${c.venc}; situação ${s0} → ${s1}`);msg=`Vencimento salvo: ${c.q} agora está "${s1}"`;mud=true}
 if(modo==='temp'){if(!c.pixTemp||c.pixTemp.cod!==cc){c.pixTemp={cod:cc,h:r17Agora(),q:FN_USU};fin19Hist(c,'Pix copia e cola temporário registrado só para este pagamento');fin19Aud(`${c.q}: Pix copia e cola temporário registrado por ${FN_USU}`);mud=true}}
 else if(c.pixTemp&&!c.pixTemp.usado){c.pixTemp=null;fin19Hist(c,'Pix copia e cola temporário retirado; volta a usar a chave do credor');mud=true}
 if(mud){reView();if(msg)toast(msg)}return r}}
/* Comprovante: registra que a saída foi por Pix copia e cola temporário */
{const _c=fnComprovante;fnComprovante=function(i){const c=CONTAS[i];if(!c||!c.pixTemp)return _c.apply(this,arguments);return fin19ComModal(()=>_c.apply(this,arguments),h=>h.replace(/<span>Forma: [^<]*<\/span>/,'<span>Forma: Pix copia e cola (código temporário)</span>').replace(/(<tr data-det="0"><td>Valor pago<\/td>)/,`<tr data-det="0"><td>Pix copia e cola</td><td>Pago com código temporário, válido só para esta saída (a chave do cadastro do credor não foi usada) · registrado em ${esc(c.pixTemp.h)} por ${esc(c.pixTemp.q)}<span class="mono fin19-pixcod">${esc(c.pixTemp.cod)}</span></td></tr>$1`))}}

/* ---------- Cadastrar fornecedor: dados bancários e chave Pix; CNPJ só com 14 números (notas 608 e 609) ---------- */
const fin19CnpjMask=v=>{const d=String(v||'').replace(/\D/g,'').slice(0,14);return d.replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2}\.\d{3})(\d)/,'$1.$2').replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/,'$1/$2').replace(/^(\d{2}\.\d{3}\.\d{3}\/\d{4})(\d)/,'$1-$2')};
const F19_BANCOS=['Banco do Brasil (001)','Bradesco (237)','Caixa Econômica (104)','Itaú (341)','Santander (033)','Banco Inter (077)','Nubank (260)','Sicoob (756)','Banco do Nordeste (004)','Outro'];
function fin19BancoCampos(fo,comChave){fo=fo||{};const s=(id,lab,ops,v)=>`<div class="field"><label for="${id}">${lab}</label><select class="in" id="${id}"><option value="">Escolha</option>${ops.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select></div>`;
 return `<h4 class="fin19-bh">Dados bancários e chave Pix ${info('Usados para pagar o fornecedor. A chave Pix entra sozinha ao lançar uma conta para ele. Ficam só no financeiro.')}</h4>${s('fin19PixTipo','Tipo da chave Pix',['CNPJ','CPF','E-mail','Telefone','Chave aleatória'],fo.pixTipo)}${comChave?`<div class="field"><label for="fin19PixChave">Chave Pix</label><input class="in" id="fin19PixChave" value="${esc(fo.pix||'')}" placeholder="CNPJ, e-mail, telefone ou chave aleatória"></div>`:''}${s('fin19Banco','Banco',F19_BANCOS,fo.banco)}<div class="field"><label for="fin19Ag">Agência</label><input class="in" id="fin19Ag" inputmode="numeric" maxlength="6" value="${esc(fo.ag||'')}" placeholder="0000" oninput="this.value=this.value.replace(/[^0-9-]/g,'')"></div><div class="field"><label for="fin19Cc">Conta com dígito</label><input class="in" id="fin19Cc" inputmode="numeric" maxlength="15" value="${esc(fo.cc||'')}" placeholder="00000-0" oninput="this.value=this.value.replace(/[^0-9-]/g,'')"></div>${s('fin19CcTipo','Tipo de conta',['Corrente','Poupança','Pagamento'],fo.ccTipo)}`}
const fin19CnpjCampo=h=>h.replace(/<input class="in" id="nfCnpj"/,'<input class="in" id="nfCnpj" maxlength="18" inputmode="numeric" oninput="this.value=fin19CnpjMask(this.value)"').replace(/(id="nfCnpj"[^>]*?value=")([^"]*)"/,(m,a,v)=>a+fin19CnpjMask(v)+'"');
const fin19LerBanco=()=>({pixTipo:fin19G('fin19PixTipo'),banco:fin19G('fin19Banco'),ag:fin19G('fin19Ag').trim(),cc:fin19G('fin19Cc').trim(),ccTipo:fin19G('fin19CcTipo')});
const fin19CnpjOk=()=>{const d=fin19G('nfCnpj').replace(/\D/g,'');if(d&&d.length!==14){toast(`O CNPJ tem 14 números; você digitou ${d.length}`,'warn');return false}return true};
{const _n=lcNovoForn;lcNovoForn=function(){return fin19ComModal(()=>_n.apply(this,arguments),h=>fin19CnpjCampo(h).replace(/<\/div><\/div><div class="mf">/,fin19BancoCampos({},true)+'</div></div><div class="mf">'))}}
{const _o=lcNovoFornOk;lcNovoFornOk=function(){if(!fin19CnpjOk())return;const n=fin19G('nfNome').trim(),b=fin19LerBanco(),pix=fin19G('fin19PixChave').trim(),cnpj=fin19G('nfCnpj'),cont=fin19G('nfCont');
 const r=_o.apply(this,arguments);const f=n&&FORNECEDORES.find(x=>x.n===n);if(f){Object.assign(f,b,{cnpj,cont,pix});if(pix&&!fin19G('lcPix'))fin19PixMostra(f)}return r}}
{const _e=lcEditForn;lcEditForn=function(){const fo=FORNECEDORES.find(x=>x.n===fin19G('lcForn').trim());return fin19ComModal(()=>_e.apply(this,arguments),h=>fin19CnpjCampo(h).replace(/<\/div><p class="tl">Mudanças valem/,fin19BancoCampos(fo,false)+'</div><p class="tl">Mudanças valem'))}}
{const _o=lcEditFornOk;lcEditFornOk=function(antigo){if(!fin19CnpjOk())return;const n=fin19G('nfNome').trim(),b=fin19LerBanco();const r=_o.apply(this,arguments);const f=n&&FORNECEDORES.find(x=>x.n===n);if(f)Object.assign(f,b);return r}}

/* ==========================================================================
   FINANCEIRO · Plano de contas, Fluxo, DRE, Orçamento, Conciliação, Alçadas, Importação
   ========================================================================== */

/* ---------- Incluir categoria no plano de contas (nota 582) ---------- */
{const _p=fnPlanoTab;fnPlanoTab=function(){return _p.apply(this,arguments).replace(/onclick="toast\('Nova categoria: só o Administrador[^"]*"/,'onclick="fin19NovaCat()"')}}
function fin19ProxCod(g){const ns=PLANO.filter(p=>p[2]!=='grupo'&&p[0].split('.')[0]===g).map(p=>+p[0].split('.')[1]||0);return g+'.'+((ns.length?Math.max(...ns):0)+1)}
function fin19NovaCat(){if(fnPapelDe(FN_USU)!=='admin'){toast('Só o Administrador inclui categoria no plano de contas. Para testar, escolha "Jânio · Administrador" em Testar como, na aba A pagar.','warn');return}const gs=PLANO.filter(p=>p[2]==='grupo');
 openModal(`${mh('Incluir categoria')}<div class="mb"><div class="formgrid"><div class="field"><label for="fin19CatG">Grupo <span class="req">*</span></label><select class="in" id="fin19CatG" onchange="document.getElementById('fin19CatC').value=fin19ProxCod(this.value)">${gs.map(g=>`<option value="${g[0]}" ${g[0]==='4'?'selected':''}>${g[0]} · ${g[1]}</option>`).join('')}</select></div><div class="field"><label for="fin19CatC">Código</label><input class="in" id="fin19CatC" value="${fin19ProxCod('4')}"></div><div class="field" style="grid-column:1/-1"><label for="fin19CatN">Nome da categoria <span class="req">*</span></label><input class="in" id="fin19CatN" placeholder="Ex.: Seguros"></div><div class="field"><label for="fin19CatR">Recorrência padrão</label><select class="in" id="fin19CatR"><option value="var">Variável</option><option value="fixo">Fixa</option></select></div></div><p class="tl">A categoria entra no lançamento de contas, no orçamento, no fluxo de caixa e na DRE. Fica registrado quem incluiu.</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="fin19NovaCatOk()">Incluir</button></div>`);setTimeout(()=>{try{document.getElementById('fin19CatN').focus()}catch(e){}},50)}
function fin19NovaCatOk(){const g=fin19G('fin19CatG')||'4',cod=fin19G('fin19CatC').trim(),n=fin19G('fin19CatN').trim(),r=fin19G('fin19CatR')||'var';
 if(!n){toast('Digite o nome da categoria','warn');return}if(!new RegExp('^'+g+'\\.\\d+$').test(cod)){toast(`O código precisa começar com ${g}. (ex.: ${fin19ProxCod(g)})`,'warn');return}if(PLANO.some(p=>p[0]===cod)){toast('Já existe uma categoria com o código '+cod,'warn');return}if(PLANO.some(p=>p[2]!=='grupo'&&semAc(p[1])===semAc(n))){toast('Já existe uma categoria com esse nome','warn');return}
 const tipo={1:'rec',2:'ded',3:'cus'}[g]||'des';let pos=PLANO.length;for(let k=PLANO.length-1;k>=0;k--){if(PLANO[k][0]===g||PLANO[k][0].split('.')[0]===g){pos=k+1;break}}
 PLANO.splice(pos,0,[cod,n,tipo,r]);DRE_VAL[cod]=0;fin19Aud(`Categoria incluída no plano de contas: ${cod} · ${n} (${r==='fixo'?'fixa':'variável'})`);closeModal();reView();toast(`Categoria ${cod} · ${n} incluída no plano de contas`)}

/* ---------- Fluxo de caixa: dinheiro total da empresa agora (nota 583) ---------- */
function fin19Caixas(){return (typeof CAIXAS!=='undefined'?CAIXAS:[]).filter(c=>!c.naoAberto&&!c.fechado).map(c=>[c,Math.max(0,regDe(c,'Dinheiro'))])}
function fin19SaldoEmpresa(){const bs=typeof F2_BANCOS!=='undefined'?F2_BANCOS:[],cx=fin19Caixas(),b=bs.reduce((s,x)=>s+(x.saldo||0),0),g=cx.reduce((s,[,v])=>s+v,0);return {bs,cx,b,g,tot:b+g}}
{const _fx=fnFluxoTab;fnFluxoTab=function(){const h=_fx.apply(this,arguments),s=fin19SaldoEmpresa(),p=h.indexOf('<svg');if(p<0)return h;
 const k=`<div class="fin19-saldo"><div class="fin19-saldo-tot clk" onclick="fin19SaldoDet()" role="button" tabindex="0"><span class="lab">Dinheiro total da empresa agora</span><b>${fmt(s.tot)}</b><small>bancos + gavetas dos caixas abertos · ver detalhe ›</small></div><div class="mini">${s.bs.map(x=>miniKpi(esc(x.n.split(' · ')[0]),fmt(x.saldo),'atualizado '+esc(x.sync),'',`fin19SaldoDet()`)).join('')}${miniKpi('Caixas abertos (gavetas)',fmt(s.g),s.cx.length+' caixa(s) com dinheiro','',`fin19SaldoDet()`)}</div></div>`;
 return h.slice(0,p)+k+h.slice(p)}}
function fin19SaldoDet(){const s=fin19SaldoEmpresa();openDrawer('Dinheiro total da empresa',`${kvs([['Total agora',`<b>${fmt(s.tot)}</b>`],['Nas contas bancárias',fmt(s.b)],['Nas gavetas dos caixas',fmt(s.g)]])}<h4 style="margin-top:10px">Contas bancárias</h4><div class="at-list">${s.bs.map(x=>`<div class="at-row"><div class="grow"><b>${esc(x.n)}</b><small>${esc(x.modo)} · atualizado ${esc(x.sync)}</small></div><b>${fmt(x.saldo)}</b></div>`).join('')}</div><h4 style="margin-top:10px">Caixas abertos</h4><div class="at-list">${s.cx.map(([c,v])=>`<div class="at-row"><div class="grow"><b>Caixa de ${esc(c.u)}</b><small>${esc(unidNome(c.unid))} · dinheiro na gaveta</small></div><b>${fmt(v)}</b></div>`).join('')||'<p class="tl">Nenhum caixa aberto agora.</p>'}</div><p class="tl" style="margin-top:8px">Saldo dos bancos pela API do Banco Inter e pelo último OFX importado; gavetas pelo que cada caixa registrou hoje (fundo + dinheiro − sangrias − estornos).</p>`)}

/* ---------- DRE: totais de meta, orçado e previsto recalculam ao mudar um número (nota 593) ---------- */
fnDreTab=function(){const f={out:1,set:.962,ago:.945}[DRE_MES];const v=c=>Math.round((DRE_VAL[c]||0)*f);const atual=DRE_MES==='out';const prevC=c=>atual?fnPrevistoLanc(c):v(c);
 const T=k=>PLANO.filter(p=>p[2]===k).reduce((s,p)=>({meta:s.meta+fnMeta(p[0]),orc:s.orc+fnPrevisto(p[0]),prev:s.prev+prevC(p[0]),real:s.real+v(p[0])}),{meta:0,orc:0,prev:0,real:0});
 const sub=(a,b)=>({meta:a.meta-b.meta,orc:a.orc-b.orc,prev:a.prev-b.prev,real:a.real-b.real});
 const R=T('rec'),D=T('ded'),C=T('cus'),E=T('des'),RL=sub(R,D),MB=sub(RL,C),RES=sub(MB,E),rb=R.real,pct=x=>rb?Math.round(x/rb*100)+'%':'—';
 const cel=(cod,tipo,val)=>`<input class="in dre-in" value="${Math.round(val).toLocaleString('pt-BR')}" onclick="event.stopPropagation()" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}" onchange="fnDreSet('${tipo}','${cod}',this.value)" aria-label="${tipo==='meta'?'Meta':'Orçado'} de ${planoNome(cod)}" ${tipAttr(tipo==='meta'?'Meta':'Orçado',(tipo==='meta'?'Meta do mês para esta linha.':'Orçamento (limite) do mês.')+' Digite e aperte Enter (ou saia do campo): os totais recalculam na hora.')}>`;
 const linha=cod=>{const p=PLANO.find(x=>x[0]===cod),rec=p[2]==='rec';return `<tr class="clk" onclick="fnPlanoCat('${cod}')">${td('Linha',`<span style="padding-left:18px">${p[1]}</span>`)}${td('Meta',cel(cod,'meta',fnMeta(cod)))}${td('Orçado',cel(cod,'orc',fnPrevisto(cod)))}${td('Previsto',`<span ${tipAttr('Previsto','Realizado até agora + contas '+(rec?'a receber':'a pagar')+' já lançadas e ainda em aberto nesta categoria.')}>${fmt(prevC(cod))}</span>`)}${td('Realizado',fmt(v(cod)))}${td('% da receita',pct(v(cod)))}${td('Orçamento',atual?fnOrcBadge(cod):'')}</tr>`};
 const tot=(nome,t,cls)=>`<tr class="fin19-dre-t ${cls||''}" data-det="0">${td('Linha',`<b>${nome}</b>`)}${td('Meta',`<b>${fmt(t.meta)}</b>`)}${td('Orçado',`<b>${fmt(t.orc)}</b>`)}${td('Previsto',`<b>${fmt(t.prev)}</b>`)}${td('Realizado',`<b>${fmt(t.real)}</b>`)}${td('% da receita','<b>'+pct(t.real)+'</b>')}${td('','')}</tr>`;
 const cats=k=>PLANO.filter(p=>p[2]===k).map(p=>linha(p[0]));
 const alertas=atual?PLANO.filter(p=>(p[2]==='cus'||p[2]==='des')&&!/fixa/.test(fnOrcBadge(p[0]))&&fnOrcUso(p[0])>=.9):[];
 return `<div class="card at-card"><div class="h3row" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><h3 style="margin:0">DRE · ${{out:'outubro',set:'setembro',ago:'agosto'}[DRE_MES]} de 2026 ${info('Demonstrativo do resultado do mês por categoria do plano de contas, com meta, orçado (limite), previsto (realizado + contas lançadas em aberto) e realizado. Meta e orçado se editam aqui mesmo; os totais de cada grupo e o resultado recalculam na hora. Clique numa linha para ver as contas.')}</h3><div class="row" style="gap:4px">${['out','set','ago'].map(m=>chip(m,DRE_MES===m,`DRE_MES='${m}';reView()`)).join('')}<button class="btn sm sec" onclick="fnImpExp('importar','metas')">Importar</button><button class="btn sm sec" onclick="fnImpExp('exportar','dre')">Exportar</button></div></div>
 ${alertas.length?`<div class="alert warn" style="margin:8px 0"><span><b>Orçamento:</b> ${alertas.map(p=>{const o=fnPrevisto(p[0]),pv=fnPrevistoLanc(p[0]);return pv>o?`<b style="color:var(--err)">${p[1]} estourou ${fmt(pv-o)}</b>`:`${p[1]}: faltam ${fmt(o-pv)} para estourar`}).join(' · ')}. Estouro avisa quem lança e quem paga.</span></div>`:''}
 <p class="tl fin19-dre-dica">Mude a meta ou o orçado de uma linha e aperte Enter: o total do grupo, a receita líquida, a margem e o resultado (meta, orçado e previsto) são recalculados na hora.</p>
 ${tabela(['Linha','Meta','Orçado','Previsto','Realizado','% da receita','Orçamento'],[].concat([tot('Receita bruta',R)],cats('rec'),[tot('(−) Deduções',D)],cats('ded'),[tot('= Receita líquida',RL,'fin19-dre-s')],[tot('(−) Custos dos exames',C)],cats('cus'),[tot('= Margem bruta',MB,'fin19-dre-s')],[tot('(−) Despesas',E)],cats('des'),[`<tr class="fin19-dre-res" data-det="0" style="background:var(--ok-soft)">${td('Linha','<b>= Resultado operacional</b>')}${td('Meta',`<b>${fmt(RES.meta)}</b>`)}${td('Orçado',`<b>${fmt(RES.orc)}</b>`)}${td('Previsto',`<b>${fmt(RES.prev)}</b>`)}${td('Valor',`<b style="color:${RES.real>=0?'var(--ok)':'var(--err)'};font-size:16px">${fmt(RES.real)}</b>`)}${td('%','<b>'+pct(RES.real)+'</b>')}${td('','')}</tr>`])).replace('class="at-table"','class="at-table compacta dre-tab"')}
 <p class="tl" style="margin-top:8px">Por unidade e consolidada; a matriz vê tudo, o gestor de posto vê só o posto dele. Alerta de orçamento em 90% do orçado (faltam 10%); ao estourar, avisa quem lança e quem paga. Quem lança não paga, exceto o Administrador.</p></div>
 ${piada(60,{financeiro:'DRE: a única demonstração em que "resultado" vem com sinal e não com desculpa.',todos:'Receita líquida é a bruta depois que o governo e as glosas tomaram o café delas.'})}`};

/* ---------- Orçamento: valor positivo em verde e negativo em vermelho (nota 601) ---------- */
{const _o=fnOrcTab;fnOrcTab=function(){let h=_o.apply(this,arguments).replace(/<span style="color:var\(--(?:ok|err)\);font-weight:700">([+−]) /g,(m,s)=>`<span class="fin19-dif ${s==='+'?'pos':'neg'}" style="color:var(--${s==='+'?'ok':'err'});font-weight:700">${s} `);
 const p=h.indexOf('<div class="tablewrap">');if(p>=0)h=h.slice(0,p)+'<p class="tl fin19-orc-leg"><span class="pos">+ verde</span> = diferença positiva (realizado acima do previsto) · <span class="neg">− vermelho</span> = diferença negativa (realizado abaixo do previsto).</p>'+h.slice(p);return h}}

/* ---------- Conciliação dos caixas: mostrar o que está pendente (notas 604 e 605) ---------- */
function fin19PendItens(i){const x=FN_CONCIL[i];if(!x)return [];const v=fin19Num(x[2]),pix=Math.round(v*.45*100)/100,car=Math.round(v*.4*100)/100,din=Math.round((v-pix-car)*100)/100;
 return [['Cartão (crédito e débito)',car,'a maquininha paga em 1 ou 2 dias; o crédito ainda não apareceu no extrato do banco'],['Pix',pix,'recebido no caixa, mas o extrato do dia ainda não foi importado (OFX) para conferir'],['Dinheiro para depósito',din,'malote do dia ainda não depositado na conta da clínica']]}
function fin19Pend(i){const x=FN_CONCIL[i];if(!x)return;const it=fin19PendItens(i);
 openDrawer('Pendente · '+esc(x[1])+' · '+x[0],`${kvs([['Caixa',esc(x[1])],['Data',x[0]],['Registrado',x[2]],['Situação','<span class="badge neutral">aguardando extrato do banco</span>']])}<h4 style="margin-top:10px">O que está pendente</h4><div class="at-list">${it.map(([n,v,d])=>`<div class="at-row"><div class="grow"><b>${n}</b><small>${d}</small></div><b>${fmt(v)}</b></div>`).join('')}</div><div class="alert info fin19-alert" style="margin-top:10px"><span>Fica conciliado sozinho quando o extrato (OFX ou API do banco) trouxer esses valores. Se passar de 2 dias úteis, aparece como divergência na Conciliação bancária.</span></div><div class="row" style="margin-top:10px;gap:6px;flex-wrap:wrap"><button class="btn sec" onclick="closeDrawer();location.hash='#conciliacao'">Abrir a Conciliação bancária</button><button class="btn ghost" onclick="fnConcil(${i})">Ver o fechamento</button></div>`)}
{const _t=fnConcilTab;fnConcilTab=function(){return _t.apply(this,arguments).replace(/<tr class="clk" onclick="fnConcil\((\d+)\)"[\s\S]*?<\/tr>/g,(row,i)=>row.replace('<span class="badge neutral">pendente</span>',`<button class="badge neutral fin19-pend" onclick="event.stopPropagation();fin19Pend(${i})" ${tipAttr('Pendente','Clique para ver o que ainda falta aparecer no extrato do banco.')}>pendente · ver o quê</button><small class="tl" style="display:block">${fin19PendItens(+i).map(x=>x[0].split(' ')[0].toLowerCase()).join(', ')} sem extrato</small>`))}}

/* ---------- Fechamento do caixa: justificativa dentro do quadro e relatório com modelo, baixar ou imprimir (notas 602 e 603) ---------- */
{const _c=fnConcil;fnConcil=function(i){return fin19ComDrawer(()=>_c.apply(this,arguments),h=>{h=h.replace(/onclick="toast\('Relatório de prestação de contas aberto'\)"/,`onclick="fin19RelConcil(${i})"`).replace('<div class="alert warn" style="margin-top:10px">','<div class="alert warn fin19-alert" style="margin-top:10px">');
 if((FN_CONCIL[i]||[])[5]==='pendente')h=h.replace(/(<h4 style="margin-top:10px">Item a item)/,`<div class="alert info fin19-alert" style="margin:10px 0"><span><b>Pendente no banco:</b> ${fin19PendItens(i).map(([n,v])=>n+' '+fmt(v)).join(' · ')}. <a href="#" onclick="event.preventDefault();fin19Pend(${i})">Ver o que falta</a>.</span></div>$1`);return h})}}
function fin19RelConcil(i){const x=FN_CONCIL[i];if(!x)return;const [d,c,r,e,df,b,s]=x,z=i===0,it=[['Dinheiro',z?'R$ 412,00':'R$ 300,00',z?'R$ 399,50':'R$ 300,00',z?'− R$ 12,50':'R$ 0,00'],['Pix',z?'R$ 520,00':'R$ 498,00',z?'R$ 520,00':'R$ 498,00','R$ 0,00'],['Cartão',z?'R$ 554,00':'R$ 400,00',z?'R$ 554,00':'R$ 400,00','R$ 0,00']];
 fin19Aud(`Relatório de prestação de contas aberto: caixa ${c} · ${d}`);
 openModal(`${mh('Relatório de prestação de contas')}<div class="mb rel fin19-rel">
 <div class="row rel-cab" style="justify-content:space-between"><div><h2>Prestação de contas do caixa</h2><span style="color:var(--fg2)">Caixa de ${esc(c)} · ${d}/2026 · DeoVita Clínicas</span></div><img class="rel-logo" src="logo-deovita.png" alt="DeoVita Clínicas"></div>
 <div class="meta"><span>Data: ${d}/2026</span><span>Gerado às ${hhmm(new Date())} por ${esc(FN_USU)}</span><span>Banco (OFX): ${b==='ok'?'conciliado':'aguardando extrato'}</span><span>Situação: ${esc(s)}</span></div>
 <div class="tablewrap" style="border-radius:12px"><table><thead><tr><th>Forma</th><th style="text-align:right">Registrado</th><th style="text-align:right">Encontrado</th><th style="text-align:right">Diferença</th></tr></thead><tbody>${it.map(([f,a,bb,dd])=>`<tr data-det="0"><td>${f}</td><td style="text-align:right">${a}</td><td style="text-align:right">${bb}</td><td style="text-align:right;${dd.startsWith('−')?'color:#C62828;font-weight:700':''}">${dd}</td></tr>`).join('')}<tr data-det="0" style="font-weight:800"><td>Total</td><td style="text-align:right">${r}</td><td style="text-align:right">${e}</td><td style="text-align:right">${df}</td></tr></tbody></table></div>
 ${z?'<p class="fin19-rel-just"><b>Justificativa da diferença:</b> troco a menor no atendimento 10-00018277, registrado pela Paula às 17:42 e aceito pelo gestor.</p>':''}${b!=='ok'?`<p class="fin19-rel-just"><b>Pendente no banco:</b> ${fin19PendItens(i).map(([n,v])=>n+' '+fmt(v)).join(' · ')}.</p>`:''}
 <div class="ass"><div>${esc(c)} · operador(a) do caixa</div><div>Gestor(a) · conferência</div></div>
 <p class="tl" style="margin-top:10px">Documento interno do financeiro. Guarde com o fechamento do dia.</p></div>
 <div class="mf mf-fixo"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="toast('Na janela que abrir, escolha a impressora');window.print()">${I.print||''} Imprimir</button><button class="btn" onclick="toast('Na janela que abrir, escolha Salvar como PDF');window.print()">${I.dl} Baixar PDF</button></div>`,'wide')}

/* ---------- Alçadas: remover da listagem, com registro na trilha e opção de voltar (nota 606) ---------- */
const F19_REMOV={cc:{},p:{}};
const fin19Re=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
{const _a=alConfigTab;alConfigTab=function(){const adm=fnPapelDe(FN_USU)==='admin';let h=_a.apply(this,arguments);
 Object.keys(F19_REMOV.p).forEach(n=>{h=h.replace(new RegExp(`<tr[^>]*>(?:(?!<\\/tr>)[\\s\\S])*?alEditPessoa\\('${fin19Re(n)}'\\)[\\s\\S]*?<\\/tr>`),'')});
 if(adm)h=h.replace(/(<button class="btn sm sec" onclick="alEditCC\('([^']+)'\)">Alterar<\/button>)/g,(m,b,k)=>`<span class="row fin19-al-bts">${b}${k==='Matriz'?'':`<button class="btn sm ghost" onclick="event.stopPropagation();fin19RemCC('${k}')">Remover</button>`}</span>`).replace(/(<button class="btn sm ghost" onclick="alEditPessoa\('([^']+)'\)">Alterar<\/button>)/g,(m,b,n)=>`<span class="row fin19-al-bts">${b}<button class="btn sm ghost" onclick="event.stopPropagation();fin19RemPessoa('${n}')">Remover</button></span>`);
 const rs=[...Object.entries(F19_REMOV.cc).map(([k,x])=>[`Centro de custo ${k}`,x,`fin19VoltaCC('${fin19Q(k)}')`]),...Object.entries(F19_REMOV.p).map(([n,x])=>[`${n} (aprovador)`,x,`fin19VoltaPessoa('${fin19Q(n)}')`])];
 if(rs.length){const card=`<div class="card at-card span2 fin19-rem"><h3>Removidos da listagem ${info('Saem da listagem, mas continuam na trilha de auditoria com quem removeu, quando e o motivo. Dá para voltar.')}</h3><div class="at-list">${rs.map(([t,x,oc])=>`<div class="at-row"><div class="grow"><b>${esc(t)}</b><small>removido por ${esc(x.q)} em ${esc(x.h)} · motivo: ${esc(x.m)}</small></div>${adm?`<button class="btn sm sec" onclick="${oc}">Voltar para a lista</button>`:''}</div>`).join('')}</div></div>`;const p=h.lastIndexOf('</div>');h=h.slice(0,p)+card+h.slice(p)}
 return h}}
function fin19RemCC(k){if(fnPapelDe(FN_USU)!=='admin'){toast('Só o Administrador remove','warn');return}if(k==='Matriz'){toast('A Matriz é a alçada padrão e não pode sair da lista','warn');return}const n=CONTAS.filter(c=>c.t==='pagar'&&c.s!=='Paga'&&alCC(c)===k).length;
 f2Motivo('Remover da listagem · centro de custo '+esc(k),`Sai da lista de alçadas. ${n?`<b>${n} conta(s) em aberto</b> deste centro de custo passam a seguir a alçada da Matriz. `:''}Nada é apagado: fica na trilha de auditoria e dá para voltar.`,m=>{F19_REMOV.cc[k]=Object.assign({},AL_CC[k],{q:FN_USU,h:r17Agora(),m});delete AL_CC[k];alAud(`Centro de custo ${k} removido da listagem de alçadas por ${FN_USU}. Motivo: ${m}`);reView();toast('Centro de custo '+k+' removido da lista; registrado na trilha')},'Remover','err')}
function fin19VoltaCC(k){const x=F19_REMOV.cc[k];if(!x)return;AL_CC[k]={gestor:x.gestor,sub:x.sub,f1:x.f1,f2:x.f2};delete F19_REMOV.cc[k];alAud(`Centro de custo ${k} voltou para a listagem de alçadas (${FN_USU})`);reView();toast('Centro de custo '+k+' voltou para a lista')}
function fin19RemPessoa(n){if(fnPapelDe(FN_USU)!=='admin'){toast('Só o Administrador remove','warn');return}if(n===FN_USU){toast('Você não pode remover a si mesmo da lista','warn');return}const cc=Object.entries(AL_CC).filter(([,f])=>f.gestor===n||f.sub===n).map(([k])=>k);if(cc.length){toast(`${n} é gestor ou substituto em ${cc.join(', ')}. Troque em "Alterar" antes de remover.`,'warn');return}
 f2Motivo('Remover da listagem · '+esc(n),`${esc(n)} sai da lista de aprovadores e deixa de assinar contas (teto zero). As assinaturas que já deu continuam valendo e ficam na trilha. Dá para voltar.`,m=>{F19_REMOV.p[n]={teto:(AL_PESSOA[n]||{}).teto,q:FN_USU,h:r17Agora(),m};AL_PESSOA[n]={teto:0};alAud(`${n} removido(a) da listagem de aprovadores por ${FN_USU}. Motivo: ${m}`);reView();toast(n+' removido(a) da lista; registrado na trilha')},'Remover','err')}
function fin19VoltaPessoa(n){const x=F19_REMOV.p[n];if(!x)return;AL_PESSOA[n]={teto:x.teto===undefined?null:x.teto};delete F19_REMOV.p[n];alAud(`${n} voltou para a listagem de aprovadores (${FN_USU})`);reView();toast(n+' voltou para a lista')}

/* ---------- Importação: Baixar relatório mostra o modelo antes (nota 607) ---------- */
const F19_IE_BAIXAR=fnIeRelBaixar;
fnIeRelBaixar=function(){const r=FN_IE.res||[],ok=r.filter(x=>x.st==='entra').length,up=r.filter(x=>x.st==='atualiza').length,er=r.filter(x=>x.st==='erro').length,nome=(FN_IE_ITENS.find(x=>x[0]===FN_IE.sel)||['',''])[1];
 openModal(`${mh('Relatório da importação')}<div class="mb rel fin19-rel">
 <div class="row rel-cab" style="justify-content:space-between"><div><h2>Relatório da importação em teste</h2><span style="color:var(--fg2)">${esc(nome)} · arquivo ${esc(FN_IE.arq||'exemplo')}</span></div><img class="rel-logo" src="logo-deovita.png" alt="DeoVita Clínicas"></div>
 <div class="meta"><span>Gerado em ${dmy(iso(new Date()))} às ${hhmm(new Date())}</span><span>Por: ${esc(FN_USU)}</span><span>Linhas lidas: ${r.length}</span><span>Entram: ${ok} · atualizam: ${up} · com erro: ${er}</span></div>
 <div class="tablewrap" style="border-radius:12px"><table><thead><tr><th>Linha</th><th>Conteúdo</th><th>Resultado</th><th>Detalhe</th></tr></thead><tbody>${r.map(x=>`<tr data-det="0"><td>${x.n}</td><td>${esc(x.res)}</td><td><b style="color:${x.st==='erro'?'#C62828':x.st==='atualiza'?'#5b6b6a':'#2E7D6B'}">${x.st==='erro'?'erro':x.st==='atualiza'?'atualiza':'entra'}</b></td><td>${esc(x.det)}</td></tr>`).join('')||'<tr data-det="0"><td colspan="4">Nenhuma linha</td></tr>'}</tbody></table></div>
 <p class="tl" style="margin-top:8px">Nada foi gravado ainda. Corrija as linhas com erro na planilha e rode o teste de novo, ou grave só as que deram certo.</p></div>
 <div class="mf mf-fixo"><button class="btn ghost" onclick="fnIeRelatorio()">Voltar</button><button class="btn sec" onclick="toast('Na janela que abrir, escolha a impressora ou Salvar como PDF');window.print()">${I.print||''} Imprimir ou PDF</button><button class="btn" onclick="F19_IE_BAIXAR()">${I.dl} Baixar planilha (Excel)</button></div>`,'wide')};

/* ---------- Estilos da rodada ---------- */
{const N=[0,1,2,3,4,5,6,7];document.head.insertAdjacentHTML('beforeend',`<style>
/* 545 */
.fin19-rp-unid{align-items:center;gap:6px;flex-wrap:wrap}
/* 546/554 */
.fin19-fsum{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:13px;color:var(--fg2);margin:4px 0 10px}
.fin19-fsum.on{color:var(--fg);background:var(--accent-soft);border:1px solid var(--accent);border-radius:10px;padding:6px 10px}
/* 555 rosca */
.fin19-rosca{display:grid;grid-template-columns:minmax(150px,200px) 1fr;gap:14px;align-items:center}
@media (max-width:640px){.fin19-rosca{grid-template-columns:1fr}.fin19-rosca svg{max-width:220px;margin:0 auto}}
.fin19-rosca svg{width:100%;height:auto;overflow:visible}
.fin19-fat{cursor:pointer;transition:opacity .15s,transform .15s;transform-origin:64px 64px;transform-box:view-box}
.fin19-rosca.fin19-hv .fin19-fat{opacity:.3}
.fin19-rosca .fin19-fat.fin19-on,.fin19-rosca .fin19-fat:hover{opacity:1;transform:scale(1.07)}
.fin19-leg{display:flex;flex-direction:column;gap:4px}
.fin19-li{display:flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid transparent;border-radius:10px;transition:background .15s,border-color .15s,transform .15s}
.fin19-li i{width:12px;height:12px;border-radius:4px;flex:none}
.fin19-li .grow{min-width:0}.fin19-li small{display:block;color:var(--fg2);font-size:12px}
.fin19-li:hover,.fin19-li.fin19-on{background:var(--accent-soft);border-color:var(--accent);transform:translateX(3px)}
.fin19-li-v{white-space:nowrap}.fin19-li-p{font-size:12px;color:var(--fg2);min-width:34px;text-align:right}
/* 556 linha */
.fin19-linha{width:100%;height:auto;display:block}
.fin19-pt{cursor:pointer;outline:none}
.fin19-pt-c{transition:r .15s}
.fin19-pt:hover .fin19-pt-c,.fin19-pt:focus .fin19-pt-c{r:8}
.fin19-pt-tip{opacity:0;transition:opacity .15s;pointer-events:none}
.fin19-pt:hover .fin19-pt-tip,.fin19-pt:focus .fin19-pt-tip{opacity:1}
.fin19-leg-l{display:flex;gap:14px;flex-wrap:wrap;align-items:center}
.fin19-leg-l span{display:inline-flex;align-items:center;gap:6px}
.fin19-leg-l i{display:inline-block;width:18px;height:4px;border-radius:3px}
.fin19-leg-l i.tr{background:repeating-linear-gradient(90deg,#F59E0B 0 5px,transparent 5px 9px)}
.fin19-leg-l i.ok{width:10px;height:10px;border-radius:50%;background:#16A34A}.fin19-leg-l i.er{width:10px;height:10px;border-radius:50%;background:#DC2626}
/* 564 barras */
.fin19-barras{width:100%;height:auto;display:block;max-height:230px}
.fin19-bar{cursor:pointer;outline:none}
.fin19-bar .fin19-bar-bg{transition:fill .15s}
.fin19-bar:hover .fin19-bar-bg,.fin19-bar:focus .fin19-bar-bg{fill:var(--accent-soft)}
.fin19-bar:hover .fin19-bar-ver{text-decoration:underline;font-weight:700}
.fin19-dica{font-size:13px;color:var(--accent);font-weight:600;margin:2px 0 4px}
.fin19-fluxo-bts{gap:6px;flex-wrap:wrap;margin:6px 0}
/* 548-551, 568 */
.fin19-sit{flex-wrap:nowrap}.fin19-sit .btn{margin:0!important;white-space:nowrap}
/* 575 */
.fin19-lrow{flex-wrap:wrap;gap:8px}.fin19-lrow .fin19-lval{white-space:nowrap}
.fin19-kp .m.clk .hint{color:var(--accent)}
/* 579 / 576 */
.fin19-cont{border:2px solid var(--warn);background:var(--warn-soft);border-radius:14px;padding:12px 14px;margin:0 0 12px}
.fin19-cont-t{font-weight:700;color:var(--warn);margin-bottom:6px}
.fin19-cont textarea{width:100%;min-height:96px;height:auto;resize:vertical;white-space:pre-wrap}
.fin19-cont-mot{border:1px solid var(--border);border-radius:10px;padding:10px 12px;background:var(--surface2);white-space:pre-wrap;overflow-wrap:anywhere}
/* 577/578: sem cor escura ao passar o mouse nas tabelas de documentos e relatórios */
#modal .fn-prev tr:hover td,#modal .rel tr:hover td,#modal .fin19-rel tr:hover td{background:transparent!important}
/* 583 */
.fin19-saldo{margin:10px 0 12px;display:flex;flex-direction:column;gap:8px}
.fin19-saldo-tot{display:flex;flex-direction:column;gap:2px;border:2px solid var(--ok);background:var(--ok-soft);border-radius:14px;padding:12px 16px;cursor:pointer}
.fin19-saldo-tot .lab{font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--fg2)}
.fin19-saldo-tot b{font-size:26px;color:var(--ok);line-height:1.2}.fin19-saldo-tot small{color:var(--fg2)}
.fin19-saldo-tot:hover{box-shadow:0 0 0 3px var(--accent-soft)}
/* 593 */
.fin19-dre-t td{background:var(--surface2)}.fin19-dre-s td{background:var(--info-soft)}
.fin19-dre-dica{margin:6px 0 8px}
/* 601 */
.fin19-orc-leg{margin:6px 0 8px}.fin19-orc-leg .pos{color:var(--ok);font-weight:700}.fin19-orc-leg .neg{color:var(--err);font-weight:700}
/* 602, 611, 612: aviso enquadrado no quadro, sem rolar para o lado */
#drawer .db{overflow-x:hidden}
#drawer .alert{max-width:100%;box-sizing:border-box;flex-wrap:wrap}
#drawer .alert>span{flex:1 1 0;min-width:0;white-space:normal;overflow-wrap:anywhere;word-break:normal}
/* 604 */
button.badge.fin19-pend{cursor:pointer;border:1px dashed var(--fg2);font:inherit;font-size:12px}
button.badge.fin19-pend:hover{border-color:var(--accent);color:var(--accent)}
/* 606 */
.fin19-al-bts{gap:4px;flex-wrap:nowrap}
/* 608/609/610 */
.fin19-bh{grid-column:1/-1;margin:6px 0 0}
.fin19-pixmodo{margin-top:6px}.fin19-pixmodo .in{min-width:0;width:100%}
.fin19-pixcod{display:block;font-size:11px;word-break:break-all;margin-top:4px;color:var(--fg2)}
.fin19-rel-just{margin-top:8px;white-space:normal;overflow-wrap:anywhere}
</style><style>
${N.map(i=>`.fin19-rosca:has(.fin19-li:hover) .fin19-fat`).slice(0,1)}{opacity:.3}
${N.map(i=>`.fin19-rosca:has(.fin19-l${i}:hover) .fin19-f${i}`).join(',')}{opacity:1;transform:scale(1.07)}
${N.map(i=>`.fin19-rosca:has(.fin19-f${i}:hover) .fin19-l${i}`).join(',')}{background:var(--accent-soft);border-color:var(--accent)}
</style>`)}
