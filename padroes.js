/* ---------- Padrões aplicados a todo o protótipo (29/10, noite), a partir das anotações da revisão ----------
   1. Colunas: nome do paciente largo; situação, WhatsApp, próximo contato, ações e códigos estreitos e sem quebra.
   2. Protocolo e código do tubo nunca quebram linha; em campo apertado vai o código do exame, não o nome.
   3. Filtro de período em toda informação filtrável: Hoje · Semana · Mês · Ano · Intervalo (calendário).
   4. Bipagem automática: leu o código, registrou e já está pronto para o próximo. Vale para receber, enviar, digitar e guardar.
   5. Código digitado: só unidade + protocolo (ex.: 10-18241 ou 1000018241) traz o paciente com todos os exames; os 14 dígitos trazem um tubo.
   6. Número de indicador é clicável: abre a lista do que ele conta.
   7. Senha com nome do paciente; a unidade configura se chama por senha, por nome ou pelos dois.
   8. Resultado fora da referência: negrito, vermelho e piscando. */

document.head.insertAdjacentHTML('beforeend',`<style>
/* 1 e 2: colunas e códigos */
.mono,.cod{white-space:nowrap}
.exame2{display:block;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.at-table th,.at-table td{padding:0 10px}
.at-table .btn.sm{padding:0 11px}.at-table .badge{padding:0 8px}
.grid .card table,.card .tablewrap table{min-width:0}
.urg2{margin-top:3px}
th.col-nome{width:30%;min-width:190px}
td.col-nome{max-width:0;min-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
td.col-nome .two,td.col-nome .two small,td.col-nome>a,td.col-nome>span,td.col-nome .pri-col>span:first-child{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
td.col-nome .pri-col{display:flex;align-items:center;gap:6px;min-width:0}
td.col-nome .pri-col>span:first-child{flex:1 1 auto;max-width:none}
th.col-just,td.col-just{width:1%;white-space:nowrap}td.col-just .row{flex-wrap:nowrap}
table.compacta td,table.compacta th{padding:0 8px}table.compacta td.col-nome{min-width:90px}table.compacta th.col-nome{min-width:90px}table.compacta td.col-nome .badge{display:inline-flex}
th.col-cod,td.col-cod{white-space:nowrap}
.pos{grid-template-columns:auto minmax(0,1fr) auto}
.pos>span:nth-child(2){min-width:0}
.pos .tl{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
/* 30/10: posição com botões ao lado (ex.: fila "resultado sem amostra"): em quadro estreito os botões descem para a linha de baixo, em vez de ficarem por cima do código */
.pos:has(> .row){display:flex;flex-wrap:wrap;align-items:center}.pos:has(> .row)>span:nth-child(2){flex:1 1 120px;min-width:0}.pos:has(> .row)>.row{flex:0 0 auto;margin-left:auto}.pos:has(> .row) .mono{font-size:13px;letter-spacing:0}
.barras div{grid-template-columns:minmax(0,1.6fr) minmax(50px,2fr) auto}
.barras div>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis}.barras div>span:first-child .mono{display:block;overflow:hidden;text-overflow:ellipsis}
.grid.larga{grid-template-columns:repeat(auto-fit,minmax(380px,1fr))}
.card.ill>.art+*,.card.ill>.h3row,.card.ill>.cx-user{padding-right:88px}
.pri-col>span:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px;display:inline-block;vertical-align:middle}
/* 3: período e filtros */
.periodo{display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap;background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:3px}
.periodo button{height:30px;padding:0 12px;border-radius:999px;border:0;background:transparent;color:var(--fg2);font:600 13px var(--font,inherit);cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:6px}
.periodo button.on{background:var(--accent);color:var(--on-accent)}
.periodo button:hover:not(.on){background:var(--surface)}
.periodo .datas{display:none;align-items:center;gap:6px;padding:0 4px}
.periodo .datas.show{display:inline-flex}
.periodo .datas input{height:30px;border:1px solid var(--border);border-radius:8px;padding:0 8px;font:13px var(--font,inherit);background:var(--surface);color:var(--fg)}
.periodo svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.fbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}
.fbar select.in,.fbar .inwrap{height:36px}
.fbar select.in{width:auto;height:36px;font-size:13px}
.fbar .inwrap input{height:36px}
.fbar .lab{font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--fg2);margin-right:2px}
/* 6: números clicáveis */
.mini .m.clk,.funil .et.clk,.kpi.clk{cursor:pointer}
.mini .m.clk:hover,.funil .et.clk:hover,.kpi.clk:hover{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.mini .m.clk .num::after,.funil .et.clk b::after{content:"";display:inline-block;width:7px;height:7px;border-right:2px solid var(--fg2);border-bottom:2px solid var(--fg2);transform:rotate(-45deg);margin-left:8px;vertical-align:middle;opacity:.6}
/* 8: fora da referência e prejuízo */
.fora{color:var(--err)!important;font-weight:800!important;animation:pisca 1s step-end infinite}
.prejuizo td{background:var(--err-soft)!important}
.prejuizo .badge{animation:pisca 1s step-end infinite}
/* janela larga (paciente inteiro) */
.modal.wide{width:min(980px,100%)}
.modal .tablewrap table{min-width:0}
/* lista por unidade com rolagem */
.cx-list.rol{max-height:272px;overflow:auto}
.cx-row.clk{cursor:pointer}.cx-row.clk:hover{background:var(--accent-soft)}
/* bipagem */
.bip-ok{border-color:var(--ok)!important;box-shadow:0 0 0 3px var(--ok-soft)!important}
.bip-log{display:flex;flex-direction:column;gap:4px;font-size:13px;margin-top:8px;max-height:160px;overflow:auto}
.bip-log div{display:flex;gap:8px;align-items:center;padding:4px 8px;border-radius:8px;background:var(--surface2)}
.bip-log .ok{color:var(--ok);font-weight:800}
/* senha chamada */
.chamada-nome{font-size:16px;font-weight:600;color:var(--fg-strong);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
</style>`);

/* ===== 1. Colunas: ajuste automático depois de cada renderização ===== */
const COL_NOME=/^(paciente|pessoa|nome|usu[aá]rio|m[eé]dico|respons[aá]vel|solicitante|cliente|exame$)/i;
const COL_JUSTA=/^(situa[cç][aã]o|whatsapp|pr[oó]ximo contato|urg[eê]ncia|a[cç][oõ]es|prazo|valor|r\$|qtd|quantidade|hora|data|espera|senha|letra|sit\.?|origem|prioridade|tubo|temp\.?|dias|n[ºo°]|cpf|telefone|nascimento|idade|unidade|posto|box|particular|unimed|hapvida|plano deovita|custo( do apoio| \(matriz\))?|repasse|margem|receita|custo|lucro|assinado por|quando|liberado|enviado|lido\/baixado|verifica[cç][aã]o|marca|carteirinha|guia|lote|apoio|per[ií]odo|atendimentos|contesta[cç][oõ]es|tubos|retornados|fora do prazo|vencimento|tipo|grupo|padr[aã]o|falhas|24 h|chamadas|canal|exames|lido)$/i;
const COL_COD=/^(protocolo|c[oó]digo|tubo|amostra|cpf|telefone|senha|remessa|n[ºo°]|lote|rack|posi[cç][aã]o|resultado|refer[eê]ncia|alerta|resultado e refer[eê]ncia|alerta e origem)$/i;
function ajustaColunas(root){(root||document).querySelectorAll('table').forEach(t=>{const ths=[...t.querySelectorAll('thead th')];if(!ths.length)return;
 const tipos=ths.map(th=>{const c=th.cloneNode(true);c.querySelectorAll('.tipicon,.tip,svg').forEach(x=>x.remove());const txt=(c.textContent||'').replace(/\s+/g,' ').trim();if(!txt)return 'just';if(COL_NOME.test(txt))return 'nome';if(COL_COD.test(txt))return COL_JUSTA.test(txt)?'justcod':'cod';if(COL_JUSTA.test(txt))return 'just';return ''});
 if(!tipos.some(Boolean))return;
 ths.forEach((th,i)=>{th.classList.toggle('col-nome',tipos[i]==='nome');th.classList.toggle('col-just',tipos[i]==='just'||tipos[i]==='justcod');th.classList.toggle('col-cod',tipos[i]==='cod')});
 t.querySelectorAll('tbody tr').forEach(tr=>{if(tr.querySelector('td[colspan]'))return;[...tr.children].forEach((td,i)=>{const k=tipos[i];if(!k)return;td.classList.toggle('col-nome',k==='nome');td.classList.toggle('col-just',k==='just'||k==='justcod');td.classList.toggle('col-cod',k==='cod')})})})}
{const _pr=posRender;posRender=function(id){_pr(id);ajustaColunas()};
 const _om=openModal;openModal=function(h,c){_om(h,c);ajustaColunas($('#modal'))};
 const _od=openDrawer;openDrawer=function(t,h){_od(t,h);ajustaColunas($('#drawer'))};
 let tmr=0;new MutationObserver(ms=>{if(ms.some(m=>m.target.closest&&m.target.closest('#view,#modal,#drawer')&&!m.target.closest('#rv-pins,#rv-pop,#rv-panel'))){clearTimeout(tmr);tmr=setTimeout(()=>ajustaColunas(),40)}}).observe(document.body,{childList:true,subtree:true})}

/* ===== 3. Período e barra de filtros ===== */
const PER_NOMES={hoje:'Hoje',semana:'Semana',mes:'Mês',ano:'Ano',intervalo:'Intervalo'};
const PERIODO={};  // estado por id
const CAL='<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
/* periodo(id, ao mudar (string de JS), padrão) → o controle. O estado fica em PERIODO[id] = {k, de, ate}. */
function periodo(id,onchange,padrao){const st=PERIODO[id]||(PERIODO[id]={k:padrao||'hoje',de:'2026-10-01',ate:'2026-10-29'});const oc=(onchange||'').replace(/"/g,'&quot;');
 return `<span class="periodo" id="per-${id}" role="group" aria-label="Período">${['hoje','semana','mes','ano'].map(k=>`<button type="button" data-k="${k}" class="${st.k===k?'on':''}" onclick="periodoSet('${id}','${k}',&quot;${oc}&quot;)">${PER_NOMES[k]}</button>`).join('')}<button type="button" data-k="intervalo" class="${st.k==='intervalo'?'on':''}" onclick="periodoSet('${id}','intervalo',&quot;${oc}&quot;)" ${tipAttr('Intervalo','Escolha no calendário qualquer intervalo de datas.')}>${CAL} Intervalo</button><span class="datas ${st.k==='intervalo'?'show':''}"><input type="date" value="${st.de}" aria-label="De" onchange="PERIODO['${id}'].de=this.value;${oc}"><span style="font-size:12px;color:var(--fg2)">até</span><input type="date" value="${st.ate}" aria-label="Até" onchange="PERIODO['${id}'].ate=this.value;${oc}"></span></span>`}
function periodoSet(id,k,oc){PERIODO[id].k=k;const el=document.getElementById('per-'+id);if(el){el.querySelectorAll('button[data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k===k));el.querySelector('.datas').classList.toggle('show',k==='intervalo')}if(k!=='intervalo'||!oc)toast('Período: '+periodoTexto(id));if(oc)try{new Function(oc)()}catch(e){}}
function periodoTexto(id){const s=PERIODO[id];if(!s)return 'hoje';if(s.k==='intervalo'){const d=x=>x.split('-').reverse().join('/');return s.de===s.ate?d(s.de):d(s.de)+' a '+d(s.ate)}return {hoje:'hoje',semana:'esta semana',mes:'este mês',ano:'este ano'}[s.k]}
/* Multiplicador de exemplo para os números do protótipo mudarem com o período */
function periodoFator(id){const s=PERIODO[id];const k=s?s.k:'hoje';if(k==='intervalo'&&s.de&&s.ate){const d=Math.round((new Date(s.ate+'T12:00:00')-new Date(s.de+'T12:00:00'))/864e5)+1;return Math.max(1,Math.round(Math.max(1,d)*0.76*10)/10)}return {hoje:1,semana:5.4,mes:22.6,ano:248,intervalo:19.3}[k]||1}
/* Dias úteis aproximados do período (para médias por dia) */
function periodoDias(id){const s=PERIODO[id];const k=s?s.k:'hoje';if(k==='intervalo'&&s.de&&s.ate)return Math.max(1,Math.round((new Date(s.ate+'T12:00:00')-new Date(s.de+'T12:00:00'))/864e5)+1);return {hoje:1,semana:6,mes:26,ano:300}[k]||1}
/* Barra de filtros: filtroBarra({id, periodo:true, unidade:true, bancada:true, exame:true, situacao:[...], convenio:true, busca:'texto', extra:'html', onchange:'js'}) */
const FILTROS={};  // valores escolhidos, por barra: FILTROS.cf = {bancada:'', exame:'', ...}
function filtroSet(id,k,v){(FILTROS[id]=FILTROS[id]||{})[k]=v}
const filtroDe=(id,k)=>(FILTROS[id]||{})[k]||'';
function filtroBarra(o){const id=o.id||'f';FILTROS[id]=FILTROS[id]||{};const oc=(o.onchange||`toast('Filtros aplicados')`).replace(/"/g,'&quot;');const sel=(k,lab,ops,tip)=>`<select class="in" aria-label="${lab}" onchange="filtroSet('${id}','${k}',this.value);${oc}" ${tip?tipAttr(lab,tip):''}><option value="">${lab}: ${k==='situacao'?'todas':k==='urgencia'?'todas':'todos'}</option>${ops.map(x=>{const [v,t]=Array.isArray(x)?x:[x,x];return `<option value="${v}" ${filtroDe(id,k)==String(v)?'selected':''}>${t}</option>`}).join('')}</select>`;
 return `<div class="fbar" id="fb-${o.id||'f'}">${o.busca?`<div class="inwrap" style="flex:1 1 200px;max-width:320px">${LUPA}<input class="in" placeholder="${o.busca}" aria-label="${o.busca}" value="${esc(filtroDe(id,'q')||'')}" oninput="${o.oninput||''}"></div>`:''}${o.periodo?periodo(o.id||'f',o.onchange,o.padrao):''}${o.unidade?sel('unidade','Unidade',Object.entries(UNIDS).map(([k,v])=>[k,v]),'Filtra por unidade ou posto.'):''}${o.bancada?sel('bancada','Bancada',BANCADAS.filter(b=>b.ativo).map(b=>b.n),'Só os exames desta bancada.'):''}${o.exame?sel('exame','Exame',EXAMES.filter(e=>!e.serv).map(e=>[e.c,e.c+' · '+e.n]),'Um exame só.'):''}${o.situacao?sel('situacao','Situação',o.situacao):''}${o.convenio?sel('convenio','Convênio',['Particular',...CONVENIOS]):''}${o.urgencia?sel('urgencia','Urgência',[['urg','Urgentes'],['nor','Normais']]):''}${o.extra||''}</div>`}

/* ===== 4 e 5. Códigos e bipagem automática ===== */
/* parseCodigo: '10-00018241-03-01' ou 14 dígitos → tubo; '10-18241', '10-00018241' ou 1000018241 → protocolo (unidade + número). */
function parseCodigo(txt){const d=String(txt||'').replace(/\D/g,'');if(d.length===14)return {tipo:'tubo',unid:+d.slice(0,2),prot:+d.slice(2,10),amostra:+d.slice(10,12),tubo:+d.slice(12,14),cod:`${d.slice(0,2)}-${d.slice(2,10)}-${d.slice(10,12)}-${d.slice(12,14)}`};
 if(d.length>=3&&d.length<=10)return {tipo:'protocolo',unid:+d.slice(0,2),prot:+d.slice(2),cod:`${d.slice(0,2)}-${String(+d.slice(2)).padStart(8,'0')}`};return null}
/* Amostras de um código: tubo → só ele; protocolo → todos os tubos e exames do paciente, sem separar por bancada ou tipo. */
function amostrasDe(c){if(!c)return [];if(c.tipo==='tubo')return AMOSTRAS.filter(a=>a.cod===c.cod);return AMOSTRAS.filter(a=>a.prot===c.cod)}
/* bipAuto(input, fn): o campo registra sozinho ao completar 14 dígitos ou ao dar Enter com um protocolo; depois limpa e volta o foco. */
function bipAuto(el,fn){if(!el||el.dataset.bip)return;el.dataset.bip='1';const go=()=>{const c=parseCodigo(el.value);if(!c)return;const r=fn(c,el.value);if(r!==false){el.value='';el.classList.add('bip-ok');setTimeout(()=>el.classList.remove('bip-ok'),500)}el.focus()};
 el.addEventListener('input',()=>{if(el.value.replace(/\D/g,'').length>=14)go()});el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go()}});el.setAttribute('autocomplete','off')}
const BIP_LOG={};
function bipLog(id,html){(BIP_LOG[id]=BIP_LOG[id]||[]).unshift(html);const el=document.getElementById(id);if(el)el.innerHTML=BIP_LOG[id].slice(0,8).map(h=>`<div>${h}</div>`).join('')}

/* ===== 6. Números clicáveis: lista do que o indicador conta ===== */
function listaDrawer(titulo,itens,sub){openDrawer(titulo,`${sub?`<p style="font-size:13px;color:var(--fg2);margin-bottom:10px">${sub}</p>`:''}<div class="at-list">${itens.length?itens.map(i=>`<div class="at-row"><div class="grow">${i}</div></div>`).join(''):'<div class="empty" style="padding:16px"><h4>Nada aqui</h4></div>'}</div>`)}
/* Linha padrão de amostra para as listas: código, paciente, exames (códigos), situação */
const linhaAmostra=a=>`<span class="lin-top"><span class="mono">${a.cod}</span>${a.urg?'<span class="badge err pisca">URGENTE</span>':''}</span><small>${esc(a.n)} · ${a.ex.join(', ')} · ${a.banc} · ${LETRAS[a.sit]||a.sit}</small>`;

/* ===== 7. Chamada por senha, por nome ou pelos dois (configuração da unidade) ===== */
let CHAMAR_POR='ambos';try{CHAMAR_POR=localStorage.getItem('deoclinic-chamar')||'ambos'}catch(e){}
function setChamar(v){CHAMAR_POR=v;try{localStorage.setItem('deoclinic-chamar',v)}catch(e){}toast('Esta unidade chama por '+({senha:'senha',nome:'nome',ambos:'senha e nome'})[v]+' (configuração da unidade)');if(typeof reView==='function')reView()}
const nomeCurto=n=>{if(!n)return '';const p=n.split(' ');return p.length>2?p[0]+' '+p[p.length-1]:n};
function chamadaTexto(p){if(!p)return '—';if(CHAMAR_POR==='nome'&&p.n)return esc(nomeCurto(p.n));if(CHAMAR_POR==='senha'||!p.n)return p.s;return `${p.s} <span class="chamada-nome">${esc(p.n)}</span>`}
/* Fila da recepção com nomes (quem agendou ou se identificou no totem); quem só pegou senha fica sem nome até o guichê. */
FILA.rec[0].n='Antônio Carlos Bezerra';FILA.rec[1].n='Ana Souza';FILA.rec[3].n='Marcos Vinícius Rocha';

/* ======================================================================
   Revisão 2 (29/10, noite): calendário de intervalo em um clique, marcar todos,
   margem por exame (lucro/prejuízo clicável), gráfico do histórico, laudo de atendimentos anteriores.
   ====================================================================== */
document.head.insertAdjacentHTML('beforeend',`<style>
/* calendário de intervalo */
.rng{display:inline-flex;align-items:center;gap:8px;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--border);background:var(--surface);color:var(--fg);font:600 13px var(--font,inherit);cursor:pointer;white-space:nowrap}
.rng:hover{border-color:var(--accent)}
.rng svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
#rng-pop{position:fixed;z-index:80;background:var(--surface);color:var(--fg);border:1px solid var(--border);border-radius:16px;box-shadow:var(--shadow);padding:14px;display:none;gap:16px;font-size:13px;user-select:none}
#rng-pop.show{display:flex;flex-wrap:wrap;max-width:520px}
#rng-pop .mes{width:224px;flex:none}
#rng-pop .mh2{display:flex;align-items:center;justify-content:space-between;font-weight:700;color:var(--fg-strong);margin-bottom:6px;height:28px}
#rng-pop .mh2 button{width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:transparent;color:inherit;cursor:pointer}
#rng-pop .dias{display:grid;grid-template-columns:repeat(7,30px);gap:2px}
#rng-pop .dias span{font-size:10px;font-weight:700;color:var(--fg2);text-align:center;text-transform:uppercase;padding:2px 0}
#rng-pop .dias b{display:grid;place-items:center;height:30px;border-radius:8px;font-weight:500;cursor:pointer;color:var(--fg)}
#rng-pop .dias b.off{color:var(--border);cursor:default}
#rng-pop .dias b:hover:not(.off){background:var(--surface2)}
#rng-pop .dias b.in{background:var(--accent-soft);border-radius:0}
#rng-pop .dias b.a,#rng-pop .dias b.z{background:var(--accent);color:var(--on-accent);font-weight:800;border-radius:8px}
#rng-pop .dias b.hoje{outline:1px dashed var(--accent);outline-offset:-2px}
#rng-pop .rodape{flex-basis:100%;display:flex;justify-content:space-between;align-items:center;gap:8px;border-top:1px solid var(--border);padding-top:10px;margin-top:4px;color:var(--fg2)}
#rng-pop .rodape .atalhos{display:flex;gap:4px;flex-wrap:wrap}
#rng-pop .rodape .atalhos button,#rng-pop .rodape>button{height:26px;padding:0 10px;border-radius:999px;border:1px solid var(--border);background:transparent;color:var(--fg);font:600 12px var(--font,inherit);cursor:pointer}
#rng-pop .rodape>button.ok{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
/* gráfico da Home: coluna sob o mouse fica destacada (anotação 92) */
.card.chart g.col>rect:first-child{transition:fill .15s}.card.chart g.col:hover>rect:first-child{fill:var(--accent-soft)}
/* notícias: data e fonte não invadem o texto */
.noticia .nd{width:66px}.noticia .nd small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
/* caixa: linhas em grade, nome inteiro, colunas alinhadas (29/10). Refeito em 30/10 (anotação 56): a coluna do nome tem largura mínima
   e nunca é espremida pela barra nem pelo valor; o que não cabe ganha reticências em vez de quebrar por cima da linha de baixo.
   Em lista estreita (gaveta, celular, painel lateral), a barra desce para baixo do nome. */
.cx-list{container-type:inline-size;container-name:cx}
.cx-list .cx-row:has(.cx-bar){display:grid;grid-template-columns:minmax(150px,1fr) minmax(56px,110px) max-content;align-items:center;column-gap:12px;text-align:left}
.cx-list .cx-row:has(.cx-bar)>b,.cx-list .cx-row.tot>span:last-child{text-align:right;white-space:nowrap}
.cx-list .cx-row>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cx-list .cx-row>span:first-child>small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cx-list .cx-row.tot{display:grid;grid-template-columns:minmax(0,1fr) auto}
.cx-list .cx-row.tot>span:first-child{white-space:normal}
.cx-bar{max-width:none;width:100%}
@container cx (max-width:360px){.cx-list .cx-row:has(.cx-bar){grid-template-columns:minmax(0,1fr) max-content;row-gap:4px}.cx-list .cx-row:has(.cx-bar)>.cx-bar{grid-column:1/-1;order:3;max-width:none}}
/* quadro de caixas por unidade: a lista ocupa a largura toda e os botões ficam embaixo (não ao lado, onde espremiam a lista) */
.cx-grid.um{grid-template-columns:minmax(0,1fr)}.cx-grid.um .cx-acts{justify-content:flex-end}
/* "i" dentro de texto com reticências: fica numa linha flexível ao lado do texto, nunca cortado pelas reticências (30/10) */
.ti-line{display:flex;align-items:center;min-width:0;max-width:100%}
.ti-line>.ti-txt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ti-line>.ti{flex:none}
/* margem por exame */
.mg{font-size:12px;font-weight:700;white-space:nowrap}.mg.ok{color:var(--ok)}.mg.warn{color:var(--warn)}.mg.err{color:var(--err)}
/* 30/10 (anotação 57): margem abaixo de 20% = alerta amarelo "Margem baixa" (sem piscar; só o prejuízo pisca) */
.alert.baixa{background:#FFF8D6;border-color:#F2D15C;color:#5C4300}.alert.baixa b{color:#5C4300}:root[data-theme="dark"] .alert.baixa{background:#3A2F00;border-color:#8A6D00;color:#FFE38A}:root[data-theme="dark"] .alert.baixa b{color:#FFE38A}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .alert.baixa{background:#3A2F00;border-color:#8A6D00;color:#FFE38A}:root:not([data-theme="light"]) .alert.baixa b{color:#FFE38A}}
.mg.baixa{display:inline-flex;align-items:center;gap:4px;background:#FFF3B0;color:#6B4E00;border:1px solid #F2D15C;border-radius:999px;padding:2px 8px;font-size:11.5px;letter-spacing:.02em}
:root[data-theme="dark"] .mg.baixa{background:#4A3B00;color:#FFE38A;border-color:#8A6D00}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .mg.baixa{background:#4A3B00;color:#FFE38A;border-color:#8A6D00}}
tr.clk{cursor:pointer}
.mgrow{display:grid;grid-template-columns:minmax(0,1.3fr) 120px minmax(110px,max-content);gap:8px 12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px}.mgrow:last-child{border-bottom:0}
.mgrow .mg{justify-self:start;min-width:0}
.mgrow input{height:34px;text-align:right}
.mgrow small{display:block;color:var(--fg2);font-size:12px}
/* gráfico do histórico */
.ghist{width:100%;height:auto;max-height:150px;margin-top:8px}
.hist-lista{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.hist-lista .badge{cursor:pointer}
.hist-lista .vermais{height:26px;padding:0 10px;border-radius:999px;border:1px dashed var(--accent);background:transparent;color:var(--accent);font:600 12px var(--font,inherit);cursor:pointer}
</style>`);

/* ===== Calendário de intervalo: um retângulo; clica no início, passa o mouse, clica no fim ===== */
const RNG={id:null,oc:'',ini:null,fim:null,hover:null,m:null};
const MESES=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const isoD=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const brD=s=>s?s.split('-').reverse().join('/'):'';
function rangeAbre(id,oc,btn){const st=PERIODO[id];RNG.id=id;RNG.oc=oc||'';RNG.ini=st.de;RNG.fim=st.ate;RNG.hover=null;RNG.m=new Date(st.de.slice(0,7)+'-01T12:00:00');
 let pop=document.getElementById('rng-pop');if(!pop){pop=document.createElement('div');pop.id='rng-pop';document.body.appendChild(pop);pop.addEventListener('click',e=>e.stopPropagation());document.addEventListener('pointerdown',e=>{if(pop.classList.contains('show')&&!pop.contains(e.target)&&!e.target.closest('.rng,#rv-pop,#rv-pins,#rv-bar,#rv-panel,#rv-btn'))rangeFecha()},true);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pop.classList.contains('show'))rangeFecha()})}
 rangeDesenha();pop.classList.add('show');const b=btn.getBoundingClientRect();let x=b.left,y=b.bottom+8;if(x+pop.offsetWidth>innerWidth-12)x=innerWidth-pop.offsetWidth-12;if(y+pop.offsetHeight>innerHeight-12)y=Math.max(12,b.top-pop.offsetHeight-8);pop.style.left=x+'px';pop.style.top=y+'px'}
function rangeFecha(){const p=document.getElementById('rng-pop');if(p)p.classList.remove('show')}
function rangeMes(y,m){const first=new Date(y,m,1),dias=new Date(y,m+1,0).getDate(),ini=first.getDay();const hoje=isoD(new Date());let a=RNG.ini,z=RNG.fim;if(a&&!z&&RNG.hover){z=RNG.hover;if(z<a){[a,z]=[z,a]}}
 let h=`<div class="mes"><div class="mh2"><button type="button" onclick="RNG.m=new Date(${y},${m-1},1,12);rangeDesenha()" aria-label="Mês anterior">‹</button><span>${MESES[m]} ${y}</span><button type="button" onclick="RNG.m=new Date(${y},${m+1},1,12);rangeDesenha()" aria-label="Mês seguinte">›</button></div><div class="dias">${['D','S','T','Q','Q','S','S'].map(d=>`<span>${d}</span>`).join('')}`;
 for(let i=0;i<ini;i++)h+='<b class="off"></b>';
 for(let d=1;d<=dias;d++){const s=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const cls=[s===hoje?'hoje':'',a&&s===a?'a':'',z&&s===z?'z':'',a&&z&&s>a&&s<z?'in':''].join(' ');h+=`<b class="${cls}" data-d="${s}" onclick="rangeClica('${s}')" onmouseenter="rangeHover('${s}')">${d}</b>`}
 return h+'</div></div>'}
/* 30/10 (anotações 91, 93 a 96 e 109): o calendário era reconstruído inteiro a cada passada do mouse sobre um dia; o dia sob o cursor
   virava outro elemento entre o apertar e o soltar do botão e o clique se perdia (não dava para escolher o fim nem usar o Aplicar).
   Agora o desenho só acontece ao abrir, trocar de mês ou clicar; a passada do mouse só muda as classes dos dias e o texto do rodapé. */
function rangeDesenha(){const pop=document.getElementById('rng-pop');const y=RNG.m.getFullYear(),m=RNG.m.getMonth();const y2=m===11?y+1:y,m2=(m+1)%12;
 pop.innerHTML=`${rangeMes(y,m)}${rangeMes(y2,m2)}<div class="rodape"><span class="rng-txt"></span><span class="atalhos">${[['7 dias',6],['30 dias',29],['90 dias',89]].map(([t,n])=>`<button type="button" onclick="rangeAtalho(${n})">${t}</button>`).join('')}<button type="button" onclick="rangeAtalho('mes')">Este mês</button></span><button type="button" class="ok" onclick="rangeAplica()">Aplicar</button></div>`;rangePinta()}
/* Pinta início, fim e o miolo sem reconstruir nada */
function rangePinta(){const pop=document.getElementById('rng-pop');if(!pop)return;let a=RNG.ini,z=RNG.fim;if(a&&!z&&RNG.hover){z=RNG.hover;if(z<a){[a,z]=[z,a]}}
 pop.querySelectorAll('.dias b[data-d]').forEach(b=>{const s=b.dataset.d;b.classList.toggle('a',!!a&&s===a);b.classList.toggle('z',!!z&&s===z);b.classList.toggle('in',!!a&&!!z&&s>a&&s<z)});
 const t=pop.querySelector('.rng-txt');if(t)t.textContent=(RNG.ini?brD(RNG.ini):'—')+' até '+(RNG.fim?brD(RNG.fim):(RNG.hover&&RNG.ini?brD(RNG.hover):'…'))+(RNG.ini&&!RNG.fim?' · clique no último dia (ou Aplicar para um dia só)':'');
 const ok=pop.querySelector('.rodape .ok');if(ok)ok.disabled=!RNG.ini}
function rangeClica(s){if(!RNG.ini||RNG.fim){RNG.ini=s;RNG.fim=null;RNG.hover=null;rangePinta();return}if(s<RNG.ini){RNG.fim=RNG.ini;RNG.ini=s}else RNG.fim=s;rangePinta();rangeAplica()}
function rangeHover(s){if(RNG.ini&&!RNG.fim&&RNG.hover!==s){RNG.hover=s;rangePinta()}}
function rangeAtalho(n){const h=new Date();if(n==='mes'){RNG.ini=isoD(new Date(h.getFullYear(),h.getMonth(),1));RNG.fim=isoD(h)}else{RNG.fim=isoD(h);RNG.ini=isoD(new Date(h.getTime()-n*864e5))}rangePinta();rangeAplica()}
function rangeAplica(){if(!RNG.ini)return;if(!RNG.fim)RNG.fim=RNG.ini;const st=PERIODO[RNG.id];st.de=RNG.ini;st.ate=RNG.fim;st.k='intervalo';rangeFecha();const el=document.getElementById('per-'+RNG.id);if(el){el.querySelectorAll('button[data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k==='intervalo'));const r=el.querySelector('.rng span');if(r)r.textContent=brD(st.de)+' – '+brD(st.ate)}toast('Período: '+periodoTexto(RNG.id));if(RNG.oc)try{new Function(RNG.oc)()}catch(e){}}
/* O controle de período passa a usar o calendário de intervalo no lugar dos dois campos de data */
function periodo(id,onchange,padrao){const st=PERIODO[id]||(PERIODO[id]={k:padrao||'hoje',de:'2026-10-01',ate:'2026-10-29'});const oc=(onchange||'').replace(/"/g,'&quot;');
 return `<span class="periodo" id="per-${id}" role="group" aria-label="Período">${['hoje','semana','mes','ano'].map(k=>`<button type="button" data-k="${k}" class="${st.k===k?'on':''}" onclick="periodoSet('${id}','${k}',&quot;${oc}&quot;)">${PER_NOMES[k]}</button>`).join('')}<button type="button" data-k="intervalo" class="rng ${st.k==='intervalo'?'on':''}" onclick="rangeAbre('${id}',&quot;${oc}&quot;,this)" ${tipAttr('Intervalo','Abre o calendário: clique no primeiro dia, passe o mouse e clique no último. Um clique só para cada ponta.')}>${CAL} <span>${st.k==='intervalo'?brD(st.de)+' – '+brD(st.ate):'Intervalo'}</span></button></span>`}
function periodoSet(id,k,oc){if(k==='intervalo')return;PERIODO[id].k=k;const el=document.getElementById('per-'+id);if(el){el.querySelectorAll('button[data-k]').forEach(b=>b.classList.toggle('on',b.dataset.k===k));const r=el.querySelector('.rng span');if(r)r.textContent='Intervalo'}toast('Período: '+periodoTexto(id));if(oc)try{new Function(oc)()}catch(e){}}

/* ===== Marcar todos: toda tabela com caixinhas na primeira coluna ganha uma no título ===== */
function marcarTodos(root){(root||document).querySelectorAll('table').forEach(t=>{const th=t.querySelector('thead th');if(!th||th.querySelector('input'))return;const cbs=[...t.querySelectorAll('tbody tr>td:first-child>input[type=checkbox]')];if(!cbs.length)return;
 th.innerHTML=`<input type="checkbox" class="sel-all" aria-label="Selecionar todos" title="Marca ou desmarca todos desta lista">`;th.querySelector('input').onchange=e=>{t.querySelectorAll('tbody tr>td:first-child>input[type=checkbox]').forEach(c=>{if(c.checked!==e.target.checked){c.checked=e.target.checked;c.dispatchEvent(new Event('change'))}})}})}
{const _a=ajustaColunas;ajustaColunas=function(root){_a(root);marcarTodos(root)}}

/* ===== Margem por exame: lucro ou prejuízo em toda tabela de preço, clicável para corrigir ===== */
const TAB_CONV={'Unimed Fortaleza':0.82,'Hapvida':0.78,'Plano DeoVita':0.6};
const PRECOS={};  // edições feitas no protótipo: PRECOS[c] = {particular, 'Unimed Fortaleza', ..., posto12, posto14, custo}
function precoDe(c,tab){const p=PRECOS[c]||{};if(tab==='particular')return p.particular??EX[c].p;if(tab==='custo')return p.custo??EX[c].k;if(tab==='posto12'||tab==='posto14')return p[tab]??TAB_POSTO[c]??EX[c].p;return p[tab]??+(EX[c].p*(TAB_CONV[tab]||1)).toFixed(2)}
const TABS_PRECO=[['particular','Particular · cliente final (matriz)'],['Unimed Fortaleza','Unimed Fortaleza'],['Hapvida','Hapvida'],['Plano DeoVita','Plano DeoVita'],['posto14','Posto 14 · repasse ao central'],['posto12','Posto 12 · repasse ao central']];
const margemDe=(preco,custo)=>preco?Math.round((preco-custo)/preco*100):-100;
function prejuizoDe(c){const k=precoDe(c,'custo');return TABS_PRECO.filter(([t])=>precoDe(c,t)<k).map(([,n])=>n)}
/* etiqueta discreta de margem; prejuízo em vermelho piscando. Clique abre a correção. */
function margemTag(c,tab){const p=precoDe(c,tab),k=precoDe(c,'custo'),m=margemDe(p,k);if(p<k)return `<span class="badge err pisca" style="cursor:pointer" onclick="event.stopPropagation();exameMargem('${c}')" ${tipAttr('Prejuízo','Custo '+fmt(k)+' maior que o cobrado '+fmt(p)+'. Clique para corrigir em todas as tabelas.')}>PREJUÍZO ${m}%</span>`;if(m<20)return `<span class="mg baixa pisca" style="cursor:pointer" onclick="event.stopPropagation();exameMargem('${c}')" ${tipAttr('Margem baixa','Margem de só '+m+'% sobre o custo de '+fmt(k)+' (abaixo de 20%). Clique para ajustar o preço ou o custo em todas as tabelas.')}>MARGEM BAIXA ${m}%</span>`;return `<span class="mg ok" style="cursor:pointer" onclick="event.stopPropagation();exameMargem('${c}')" title="Margem de ${m}% sobre o custo de ${fmt(k)}. Clique para ajustar.">${m}%</span>`}
function exameMargem(c){const e=EX[c];const k=precoDe(c,'custo');
 openModal(`${mh('Margem do exame · '+c+' · '+esc(e.n))}<div class="mb"><p style="font-size:13px;color:var(--fg2)">Todas as tabelas deste exame num lugar só. Mude o custo ou qualquer preço: a margem recalcula na hora; abaixo de 20% fica amarelo (margem baixa) e abaixo do custo fica vermelho (prejuízo). ${info('Custo vem do cadastro do exame; os preços, da versão vigente de cada tabela. Salvar cria versão nova nas tabelas alteradas, com quem e quando.')}</p>
 <div class="mgrow" style="background:var(--surface2);border-radius:10px;padding:8px 10px"><span><b>Custo do exame</b><small>do cadastro do exame</small></span><input class="in" id="mg-custo" value="${k.toFixed(2).replace('.',',')}" oninput="mgRecalc('${c}')"><span class="tl">base da margem</span></div>
 ${TABS_PRECO.map(([t,n])=>`<div class="mgrow"><span>${n}<small>${t==='particular'?'preço ao paciente':t.startsWith('posto')?'o que a matriz cobra do posto':'preço de tabela do convênio'}</small></span><input class="in" data-tab="${t}" value="${precoDe(c,t).toFixed(2).replace('.',',')}" oninput="mgRecalc('${c}')"><span class="mg" data-mg="${t}"></span></div>`).join('')}
 <div class="row" style="gap:6px;margin-top:8px"><button class="btn sm ghost" onclick="mgAjuste('${c}',0.1)">+10% em tudo</button><button class="btn sm ghost" onclick="mgAjuste('${c}',-0.1)">−10% em tudo</button><button class="btn sm ghost" onclick="mgMargem('${c}',30)">Margem mínima de 30%</button></div>
 </div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="mgSalvar('${c}')">Salvar nas tabelas</button></div>`,'wide');mgRecalc(c)}
const mgNum=el=>parseFloat(String(el.value).replace(/\./g,'').replace(',','.'))||0;
function mgRecalc(c){const k=mgNum($('#mg-custo'));document.querySelectorAll('#modal input[data-tab]').forEach(i=>{const p=mgNum(i),m=margemDe(p,k),s=document.querySelector(`#modal [data-mg="${i.dataset.tab}"]`);s.className='mg '+(p<k?'err pisca':m<20?'baixa pisca':'ok');s.textContent=p<k?'PREJUÍZO '+m+'%':m<20?'MARGEM BAIXA '+m+'%':'margem '+m+'%';i.classList.toggle('fora',p<k)})}
function mgAjuste(c,f){document.querySelectorAll('#modal input[data-tab]').forEach(i=>{i.value=(mgNum(i)*(1+f)).toFixed(2).replace('.',',')});mgRecalc(c)}
function mgMargem(c,pct){const k=mgNum($('#mg-custo'));document.querySelectorAll('#modal input[data-tab]').forEach(i=>{const min=k/(1-pct/100);if(mgNum(i)<min)i.value=min.toFixed(2).replace('.',',')});mgRecalc(c)}
function mgSalvar(c){const p=PRECOS[c]=PRECOS[c]||{};p.custo=mgNum($('#mg-custo'));document.querySelectorAll('#modal input[data-tab]').forEach(i=>p[i.dataset.tab]=mgNum(i));EX[c].k=p.custo;EX[c].p=p.particular;if(p.posto14!=null)TAB_POSTO[c]=p.posto14;closeModal();retorno('ok','Tabelas atualizadas','Versão nova criada em cada tabela alterada, com quem e quando. '+(prejuizoDe(c).length?'Ainda em prejuízo em: '+prejuizoDe(c).join(', ')+'.':'Nenhuma tabela abaixo do custo.'));if(typeof reView==='function')reView()}

/* ===== Gráfico do histórico de um exame (linha com a faixa de referência) ===== */
function graficoHist(hist,faixa,atual){const pts=[...hist].reverse().map(([d,v])=>[d,parseFloat(String(v).replace(',','.')),String(v)]).filter(p=>!isNaN(p[1]));if(atual!=null&&!isNaN(atual))pts.push(['hoje',atual,String(atual).replace('.',',')]);if(pts.length<2)return '';
 const W=420,H=140,L=36,R=12,T=12,B=26;const vals=pts.map(p=>p[1]);let lo=Math.min(...vals),hi=Math.max(...vals);if(faixa){lo=Math.min(lo,faixa[0]);hi=Math.max(hi,faixa[1])}const pad=(hi-lo)*0.15||1;lo-=pad;hi+=pad;const x=i=>L+i*(W-L-R)/(pts.length-1),y=v=>T+(H-T-B)*(1-(v-lo)/(hi-lo));
 let g=faixa?`<rect x="${L}" y="${y(faixa[1])}" width="${W-L-R}" height="${y(faixa[0])-y(faixa[1])}" fill="var(--ok-soft)"/><text x="${W-R-2}" y="${y(faixa[0])-3}" text-anchor="end" font-size="9" fill="var(--ok)">faixa ${String(faixa[0]).replace('.',',')}–${String(faixa[1]).replace('.',',')}</text>`:'';
 g+=`<polyline fill="none" stroke="var(--accent)" stroke-width="2" points="${pts.map((p,i)=>x(i).toFixed(1)+','+y(p[1]).toFixed(1)).join(' ')}"/>`;
 pts.forEach((p,i)=>{const fora=faixa&&(p[1]<faixa[0]||p[1]>faixa[1]);g+=`<circle cx="${x(i).toFixed(1)}" cy="${y(p[1]).toFixed(1)}" r="4" fill="${fora?'var(--err)':'var(--accent)'}"/><text x="${x(i).toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--fg2)">${p[0]}</text><text x="${x(i).toFixed(1)}" y="${(y(p[1])-8).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="${fora?'var(--err)':'var(--fg-strong)'}">${p[2]}</text>`});
 return `<svg class="ghist" viewBox="0 0 ${W} ${H}" role="img" aria-label="Histórico do exame">${g}</svg>`}

/* ===== Laudo de um atendimento anterior (modelo aprovado em 28/10, resumido) ===== */
function verLaudo(nome,prot,data,linhas){openModal(`${mh('Laudo · '+data)}<div class="mb"><div class="laudo" style="max-width:none;padding:16px"><div class="lh"><div><b style="font-size:15px;color:var(--fg-strong)">DeoClinic · Laboratório Central</b><div class="tl">CNPJ 00.000.000/0001-00 · CNES 1234567 · RT Dra. Helena Brito CRBM 1ª 12345</div></div><div style="text-align:right"><b>${esc(nome)}</b><div class="tl">Protocolo <span class="mono">${prot}</span> · liberado em ${data}</div></div></div>
 ${tabela(['Exame','Resultado','Referência','Régua'],linhas.map(([e,r,ref,p,fora])=>`<tr>${td('Exame',e)}${td('Resultado',`<b class="${fora?'fora':''}">${r}</b>${setaPos(p,fora)}`)}${td('Referência',ref)}${td('Régua',reguaHtml(p))}</tr>`))}
 <div class="lh" style="border-top:1px solid var(--border);border-bottom:0;margin-top:12px;padding-top:8px"><div class="tl">Assinado eletronicamente por <b>Dra. Helena Brito</b> · CRBM 1ª 12345 · ${data}</div><div style="text-align:right"><span class="mono">K7P2-4Q9X</span><div class="tl">verifique em deoclinic.com.br/verificar</div></div></div></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="toast('PDF do laudo aberto em nova aba')">Abrir PDF</button><button class="btn sec" onclick="toast('Laudo enviado à impressora (preto e branco, padrão da unidade)')">Imprimir</button></div>`,'wide')}

/* ===== 9. Gráficos simples em SVG (30/10): linha, barras e rosca, com as cores do tema. Cada ponto/barra pode abrir a lista do que conta. ===== */
function svgLinha(labels,vals,o={}){const W=o.w||480,H=o.h||150,L=34,R=10,T=14,B=24;const n=vals.length;if(n<2)return '';const todos=o.comp?vals.concat(o.comp):vals;let lo=o.min??Math.min(...todos),hi=o.max??Math.max(...todos);if(o.meta!=null){lo=Math.min(lo,o.meta);hi=Math.max(hi,o.meta)}if(hi===lo)hi=lo+1;const pad=(hi-lo)*.12;lo-=pad;hi+=pad;const x=i=>L+i*(W-L-R)/(n-1),y=v=>T+(H-T-B)*(1-(v-lo)/(hi-lo));
 const pts=vals.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');const area=`M${x(0).toFixed(1)},${(H-B).toFixed(1)} L${pts.split(' ').join(' L')} L${x(n-1).toFixed(1)},${(H-B).toFixed(1)} Z`;
 const comp=o.comp?`<polyline fill="none" stroke="var(--fg2)" stroke-dasharray="4 4" stroke-width="1.5" points="${o.comp.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`:'';
 const meta=o.meta!=null?`<line x1="${L}" x2="${W-R}" y1="${y(o.meta).toFixed(1)}" y2="${y(o.meta).toFixed(1)}" stroke="var(--warn)" stroke-dasharray="3 3"/><text x="${W-R}" y="${(y(o.meta)-4).toFixed(1)}" text-anchor="end" font-size="9" fill="var(--warn)">meta ${o.meta}${o.suf||''}</text>`:'';
 return `<svg class="gsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.aria||'Gráfico de linha'}">${[0,.5,1].map(k=>`<line x1="${L}" x2="${W-R}" y1="${(T+(H-T-B)*k).toFixed(1)}" y2="${(T+(H-T-B)*k).toFixed(1)}" stroke="var(--border)"/>`).join('')}<path d="${area}" fill="var(--accent-soft)"/>${comp}${meta}<polyline fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" points="${pts}"/>${vals.map((v,i)=>`<g ${o.onclick?`style="cursor:pointer" onclick="${o.onclick.replace(/"/g,'&quot;').replace('%i',i)}"`:''}><circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4" fill="var(--accent)"><title>${labels[i]}: ${o.fmt?o.fmt(v):v}</title></circle>${n<=14||i%Math.ceil(n/12)===0?`<text x="${x(i).toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--fg2)">${labels[i]}</text>`:''}</g>`).join('')}<text x="${L-4}" y="${T+4}" text-anchor="end" font-size="9" fill="var(--fg2)">${o.fmt?o.fmt(hi-pad):Math.round(hi-pad)}</text><text x="${L-4}" y="${H-B+3}" text-anchor="end" font-size="9" fill="var(--fg2)">${o.fmt?o.fmt(lo+pad):Math.round(lo+pad)}</text></svg>`}
function svgBarras(itens,o={}){const W=o.w||480,H=o.h||150,L=10,R=10,T=18,B=24;const n=itens.length;const max=o.max||Math.max(...itens.map(i=>i[1]))||1;const bw=(W-L-R)/n;
 return `<svg class="gsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.aria||'Gráfico de barras'}">${itens.map(([l,v,k],i)=>{const h=(H-T-B)*v/max;const x=L+i*bw+bw*.15,w=bw*.7;return `<g ${o.onclick?`style="cursor:pointer" onclick="${o.onclick.replace(/"/g,'&quot;').replace('%i',i)}"`:''}><rect x="${x.toFixed(1)}" y="${(H-B-h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${k==='err'?'var(--err)':k==='warn'?'var(--warn)':k==='ok'?'var(--ok)':k==='muted'?'var(--border)':'var(--accent)'}"><title>${l}: ${o.fmt?o.fmt(v):v}</title></rect><text x="${(x+w/2).toFixed(1)}" y="${(H-B-h-4).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--fg-strong)">${o.fmt?o.fmt(v):v}</text><text x="${(x+w/2).toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--fg2)">${l}</text></g>`}).join('')}</svg>`}
function svgRosca(partes,o={}){const tot=partes.reduce((s,p)=>s+p[1],0)||1;const R=46,r=30,C=60;let a=-Math.PI/2;const cores=['var(--accent)','var(--info)','var(--warn)','var(--ok)','var(--err)','var(--fg2)'];
 const fat=partes.map(([l,v,k],i)=>{const b=a+2*Math.PI*v/tot;const big=b-a>Math.PI?1:0;const p=(ang,rr)=>`${(C+rr*Math.cos(ang)).toFixed(1)},${(C+rr*Math.sin(ang)).toFixed(1)}`;const d=`M${p(a,R)} A${R},${R} 0 ${big} 1 ${p(b,R)} L${p(b,r)} A${r},${r} 0 ${big} 0 ${p(a,r)} Z`;a=b;return `<path d="${d}" fill="${k==='err'?'var(--err)':k==='warn'?'var(--warn)':k==='ok'?'var(--ok)':cores[i%cores.length]}" ${o.onclick?`style="cursor:pointer" onclick="${o.onclick.replace(/"/g,'&quot;').replace('%i',i)}"`:''}><title>${l}: ${v} (${Math.round(v/tot*100)}%)</title></path>`}).join('');
 return `<div class="rosca"><svg viewBox="0 0 120 120" role="img" aria-label="${o.aria||'Gráfico de rosca'}">${fat}<text x="60" y="57" text-anchor="middle" font-size="${String(o.centro??tot).length>6?10:16}" font-weight="800" fill="var(--fg-strong)">${o.centro??tot}</text><text x="60" y="71" text-anchor="middle" font-size="8" fill="var(--fg2)">${o.sub||''}</text></svg><div class="leg">${partes.map(([l,v,k],i)=>`<span ${o.onclick?`class="clk" onclick="${o.onclick.replace(/"/g,'&quot;').replace('%i',i)}"`:''}><i style="background:${k==='err'?'var(--err)':k==='warn'?'var(--warn)':k==='ok'?'var(--ok)':cores[i%cores.length]}"></i>${l} <b>${o.fmt?o.fmt(v):v.toLocaleString('pt-BR')}</b></span>`).join('')}</div></div>`}
document.head.insertAdjacentHTML('beforeend',`<style>
.gsvg{width:100%;height:auto;max-height:220px;display:block}
.grid.g2{grid-template-columns:repeat(auto-fit,minmax(min(100%,360px),1fr))}.grid .span2{grid-column:1/-1}
.rosca{display:flex;gap:14px;align-items:center;flex-wrap:wrap}.rosca svg{width:120px;height:120px;flex:none}.rosca .leg{display:flex;flex-direction:column;gap:4px;font-size:13px;min-width:0}.rosca .leg span{display:flex;align-items:center;gap:6px}.rosca .leg span.clk{cursor:pointer}.rosca .leg span.clk:hover{color:var(--accent)}.rosca .leg i{width:10px;height:10px;border-radius:3px;flex:none}.rosca .leg b{margin-left:auto;color:var(--fg-strong)}
.barras div.clk{cursor:pointer;border-radius:6px}.barras div.clk:hover{background:var(--accent-soft)}
/* "?" do exame: centralizado no círculo, ao lado do nome, nunca em linha própria (anotação 61) */
td.col-nome>span.tipicon,td.col-nome>span.ti,.two>span.tipicon{display:inline-grid}td.col-nome>span.ti-line{display:flex;overflow:visible}.ti-line>.tipicon{flex:none}
.tipicon.qmark{margin-left:4px;line-height:1}
/* último resultado do histórico, clicável (anotação 62) */
.hist-ult{border:1px solid var(--border);background:var(--surface);color:var(--fg);border-radius:999px;padding:3px 10px;font:500 12.5px var(--font,inherit);cursor:pointer;white-space:nowrap}.hist-ult:hover{border-color:var(--accent);background:var(--accent-soft)}.hist-ult b{color:var(--fg-strong)}.hist-ult.fora b{color:var(--err)}.hist-ult small{color:var(--fg2)}
/* área do paciente (anotações 72 a 74) */
.fig-sm,img.fig.fig-sm{width:56px;height:56px;max-width:56px;border-radius:50%;flex:none;margin:0;display:block}
.ap-prog{display:flex;align-items:center;gap:10px;margin:8px 0 10px}.ap-prog .bar{flex:1;height:12px;border-radius:6px;background:var(--surface2);overflow:hidden}.ap-prog i{display:block;height:100%;background:var(--ok);border-radius:6px}.ap-prog span{font-size:12px;font-weight:800;color:var(--fg-strong);white-space:nowrap}
.ap-ex{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.ap-item{display:flex;flex-direction:column;gap:4px;align-items:flex-start;text-align:left;border:1px solid var(--border);border-radius:14px;padding:10px 12px;background:var(--surface);color:var(--fg);font:inherit;cursor:pointer}.ap-item:hover{border-color:var(--accent);background:var(--accent-soft)}.ap-item b{color:var(--fg-strong)}.ap-item small{color:var(--fg2);font-size:12px}.ap-item .badge{margin-top:2px}
.viagem{display:grid;gap:6px;grid-template-columns:repeat(auto-fit,minmax(120px,1fr))}.vg{border:1px solid var(--border);border-radius:12px;padding:8px 10px;font-size:12.5px;display:flex;flex-direction:column;gap:2px;background:var(--surface2);opacity:.75}.vg b{color:var(--fg-strong);font-size:12.5px}.vg small{color:var(--fg2)}.vg .vdot{width:20px;height:20px;border-radius:50%;background:var(--border);display:grid;place-items:center;font-size:11px;color:#fff;margin-bottom:2px}.vg.ok{opacity:1;background:var(--surface)}.vg.ok .vdot{background:var(--ok)}.vg.cur{opacity:1;border-color:var(--accent);background:var(--accent-soft)}.vg.cur .vdot{background:var(--accent)}
/* etiquetas de margem com a tabela embaixo */
.sub-tab{display:block;font-size:11px;margin-top:2px;white-space:nowrap}
</style>`);
/* 30/10: a ilustração do quadro não cobre a primeira linha do conteúdo (ficou menor e o título reserva a altura dela quando não há subtítulo) */
document.head.insertAdjacentHTML('beforeend',`<style>.card.ill>.art{width:52px;height:52px;top:14px;right:18px}.card.ill>h3:not(:has(+.sub)){min-height:44px;padding-right:76px}.card.ill>h3,.card.ill>.sub{padding-right:76px}</style>`);

/* ======================================================================
   Revisão 3 (30/10, tarde), anotações 115, 120 e 125: três padrões para o sistema inteiro.
   ====================================================================== */
document.head.insertAdjacentHTML('beforeend',`<style>
/* Dr. Deo em toda tela (anotação 125) */
.deo-fala{display:flex;align-items:center;gap:12px;margin:-4px 0 14px;padding:8px 14px 8px 8px;border:1px dashed var(--border);border-radius:999px;background:var(--surface);font-size:13.5px;color:var(--fg)}
.deo-fala img.fig{width:44px;height:44px;max-width:44px;border-radius:50%;margin:0;flex:none}
.deo-fala b{color:var(--fg-strong)}
.deo-fala .fun{display:inline;margin-left:6px}
.deo-fala .x{margin-left:auto;flex:none;width:26px;height:26px;border-radius:50%;border:1px solid var(--border);background:transparent;color:var(--fg2);cursor:pointer}
@media(max-width:700px){.deo-fala{border-radius:16px;align-items:flex-start}}
/* linhas que abrem detalhes (anotação 120) */
tbody tr.clk.auto:hover td{background:var(--accent-soft)}
.det-lista{display:grid;grid-template-columns:minmax(90px,max-content) minmax(0,1fr);gap:6px 14px;font-size:14px}
.det-lista>span:nth-child(odd){color:var(--fg2);font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding-top:2px}
.det-lista>span:nth-child(even){color:var(--fg-strong);min-width:0;overflow-wrap:anywhere}
</style>`);

/* ===== 115. Em qualquer tela, todo exame mostra código e sinônimos =====
   Todo elemento cujo texto é exatamente o nome ou o código de um exame ganha a explicação (o "i" entra sozinho, pelo padrão de 29/10);
   o "?" do exame (nome + para que serve) ganha também código, sinônimos e material. */
const EX_SIN={HEMO:'hemograma, sangue, CBC',GLI:'glicemia, glicemia de jejum, açúcar no sangue',TRIG:'triglicérides, TG',COL:'lipidograma, perfil lipídico, HDL, LDL',TSH:'hormônio tireoestimulante, tireoide',T4L:'tiroxina livre, T4 livre',CREA:'creatinina, função renal',UREIA:'ureia, BUN',TGO:'AST, transaminase oxalacética',TGP:'ALT, transaminase pirúvica',HBA1C:'hemoglobina glicada, A1c, glicada',EAS:'sumário de urina, urina tipo 1, urina rotina',VITD:'25-OH vitamina D, vitamina D3',FERR:'ferritina, reserva de ferro',PSA:'antígeno prostático, PSA total',BHCG:'beta HCG, teste de gravidez',K:'potássio',TAP:'tempo de protrombina, TP, INR'};
function exTexto(el){const c=el.cloneNode(true);c.querySelectorAll('.ti,.tip,.tipicon,svg,small,.badge,.mg,.sub-tab,.pr-sin,.tl').forEach(x=>x.remove());return (c.textContent||'').replace(/\s+/g,' ').trim()}
function exTip(e){return `Código ${e.c} · Também chamado: ${EX_SIN[e.c]||e.s||'—'} · Material: ${e.m||'—'}`}
function marcarExames(root){if(typeof EXAMES==='undefined')return;const porNome={},porCod={};EXAMES.forEach(e=>{porNome[e.n.toLowerCase()]=e;porCod[e.c]=e});
 (root||document).querySelectorAll('#view td, #view li, #view b, #view .exame2, #view h3, #view h4, #modal td, #modal b, #modal h3, #modal h4, #modal li, #drawer td, #drawer b, #drawer li, #drawer h4').forEach(el=>{if(el.hasAttribute('data-tip')||el.closest('[data-tip]')||el.closest('.deo-fala,.tip,#rv-pop,#rv-panel,.laudo,.laudo-prev,.doc-prev,.fatura,.comprovante'))return;if(/c[oó]digo|sin[oô]nimo/i.test(el.getAttribute('title')||'')||el.querySelector('[title*="digo"],[title*="nimo"],.pr-sin'))return;if(el.querySelector('table,ul,.at-row,input,select'))return;const t=exTexto(el);if(!t||t.length>40)return;const e=porNome[t.toLowerCase()]||(t===t.toUpperCase()&&porCod[t]);if(!e)return;el.setAttribute('data-tip',e.n.replace(/"/g,'')+'|'+exTip(e).replace(/"/g,''))});
 (root||document).querySelectorAll('.tipicon.qmark .tip:not([data-ex])').forEach(tp=>{const ln=tp.closest('.ti-line');const t=ln?exTexto(ln.querySelector('.ti-txt')||ln):'';const e=porNome[(t||'').toLowerCase()];if(!e)return;tp.setAttribute('data-ex',e.c);tp.insertAdjacentHTML('beforeend',`<br><b>Código:</b> ${e.c} · <b>Também chamado:</b> ${EX_SIN[e.c]||e.s||'—'} · <b>Material:</b> ${e.m||'—'}`)});
 if(typeof marcarI==='function')marcarI()}

/* ===== 120. Toda linha de tabela abre detalhes =====
   Linha de tabela sem ação própria vira clicável e abre uma gaveta com tudo o que a linha mostra (no sistema real, a ficha completa). */
function detalhesGenericos(root){(root||document).querySelectorAll('#view table, #drawer table, #modal table').forEach(t=>{const ths=[...t.querySelectorAll('thead th')].map(th=>exTexto(th));
 t.querySelectorAll('tbody tr').forEach(tr=>{if(tr.classList.contains('clk')||tr.dataset.det||tr.hasAttribute('onclick')||tr.onclick||tr.querySelector('td[colspan]')||tr.children.length<2)return;if(tr.closest('.laudo,#rng-pop')||tr.querySelector('input,select,textarea,.switch'))return;tr.dataset.det='1';tr.classList.add('clk','auto');tr.setAttribute('title','Clique para ver os detalhes');
  tr.addEventListener('click',e=>{if(e.target.closest('button,a,input,select,textarea,label,.ti,.tipicon,.badge[onclick],[onclick]'))return;const cels=[...tr.children].map(td=>exTexto(td)||td.textContent.trim());const titulo=cels.find(x=>x)||'Detalhes';
   openDrawer('Detalhes · '+esc(titulo.slice(0,48)),`<div class="det-lista">${cels.map((v,i)=>v?`<span>${esc(ths[i]||'Campo '+(i+1))}</span><span>${esc(v)}</span>`:'').join('')}</div><p class="tl" style="margin-top:14px">No sistema real, esta gaveta abre a ficha completa do item, com histórico e ações do seu perfil. ${BRINCA?'No protótipo, mostra o que a linha já conta, só que com mais espaço para respirar.':''}</p>`)})})})}

/* ===== 125. Dr. Deo em toda tela, com uma fala para o setor de cada módulo (numeradas de 101 em diante) =====
   Entra abaixo do cabeçalho da tela quando o modo descontraído está ligado; o X esconde só naquela tela, só neste navegador. */
const DEO_FALAS={
 fluxo:[101,'Painel de fluxo: a única novela em que todo mundo torce para o protagonista sair logo de cena.'],
 pacientes:[102,'Recepção: se o paciente diz que “é só uma glicose rapidinha”, já pode separar a ficha dos outros quatro exames.'],
 atendimentos:[103,'Hoje é dia de atender bem e digitar o CPF certo. Um dos dois o sistema confere; o outro é com você.'],
 agenda:[104,'Agenda cheia de manhã, vazia à tarde. O paciente brasileiro acorda 6h só para ser o primeiro da fila.'],
 caixa:[105,'Caixa: o único lugar do laboratório onde “deu diferença” é pior que “deu positivo”.'],
 orcamentos:[106,'Orçamento aberto é paciente pensando. Um WhatsApp educado converte mais que três promoções.'],
 coleta:[107,'Coletador: se a veia sumiu, não foi pessoal. Ela só viu a agulha antes de você.'],
 domiciliar:[108,'Coleta domiciliar: a única visita em que o cachorro late e o paciente também, só de ver o tubo.'],
 transporte:[109,'Transporte: amostra viaja melhor que gente. Gelada, no escuro e sem conversar.'],
 recebimento:[110,'Recebimento: tubo sem etiqueta é um paciente sem nome. Devolve com carinho, mas devolve.'],
 mapa:[111,'Mapa de trabalho: a bancada que termina primeiro não ganha prêmio. Ganha a próxima urgência.'],
 digitacao:[112,'Digitação: hemoglobina 14 é normal. Hemoglobina 140 é dedo pesado. O sistema avisa, mas quem digita é você.'],
 conferencia:[113,'Conferência: Dr., o botão “Liberar sem crítica” é um privilégio, não um reflexo. Olhe os vermelhos primeiro.'],
 recoletas:[114,'Recoleta: o paciente volta, o técnico suspira, o tubo hemolisado se esconde na lixeira fingindo inocência.'],
 soroteca:[115,'Soroteca: o freezer é a memória do laboratório. Rack e posição certas, ou vira caça ao tesouro a −20 °C.'],
 micro:[116,'Microbiologia: aqui a pressa não funciona. Bactéria cresce no tempo dela, e ela não lê os avisos de urgência.'],
 aparelhos:[117,'Aparelhos: se o analisador parou de falar com o sistema, antes de reiniciar tudo, confira se alguém tropeçou no cabo.'],
 cq:[118,'Controle de qualidade: 1-2s é um aviso. 2-2s é o Westgard batendo na porta com cara de poucos amigos.'],
 laudos:[119,'Laudo bonito não cura ninguém, mas laudo confuso atrapalha quem cura. Modelo limpo, letra legível, assinatura certa.'],
 entrega:[120,'Entrega: terceiro sem autorização não leva laudo nem com sorriso. Com foto e autorização, leva até com abraço.'],
 'portal-medico':[121,'Portal do médico: aqui o doutor vê o resultado antes de o paciente mandar print do WhatsApp.'],
 'area-paciente':[122,'Área do paciente: o exame explicado em português claro evita 40% das ligações e 100% dos sustos desnecessários.'],
 precos:[123,'Tabela de preços: exame abaixo do custo é caridade sem recibo. O vermelho piscando é o financeiro pedindo socorro.'],
 tiss:[124,'TISS: a guia perfeita existe. Ela mora ao lado do unicórnio, numa glosa que nunca aconteceu.'],
 postos:[125,'Acerto entre postos: matriz e posto são família. E família fecha a conta no fim do mês para continuar família.'],
 apoio:[126,'Apoio: amostra que vai para o Pardini ou o DB também é sua. O paciente não sabe quem processou, só sabe quem prometeu a data.'],
 financeiro:[127,'Financeiro: contas a pagar não esperam, contas a receber não têm pressa. O fluxo de caixa é o árbitro dessa briga.'],
 dashboard:[128,'Dashboard: gráfico subindo é bom, mas pergunte sempre o quê. Recoleta também sobe.'],
 qualidade:[129,'Qualidade: não conformidade registrada é problema pela metade resolvido. A outra metade é a ação corretiva, não o café.'],
 relatorios:[130,'Auditoria: o sistema lembra quem clicou em quê. Não é desconfiança, é memória com carimbo.'],
 estabelecimentos:[131,'Estabelecimentos: cada laboratório cliente é um mundo. O DeoClinic é o mapa; a licença em dia é o passaporte.'],
 unidades:[132,'Unidades: posto novo é alegria. Posto sem responsável técnico cadastrado é alegria com multa.'],
 usuarios:[133,'Usuários: senha no post-it do monitor não é senha, é convite. O sistema troca a sua a cada 90 dias por amor.'],
 perfis:[134,'Perfis e permissões: recepção não vê resultado, técnico não mexe no caixa e o administrador vê tudo (e por isso dorme pouco).'],
 bancadas:[135,'Bancadas: toda bancada acha que é a mais importante. A hematologia tem razão, mas não conte para a bioquímica.'],
 exames:[136,'Cadastro de exames: sinônimo bem cadastrado é a recepção achando “glicada” de primeira. Economiza uma ligação para o Dr.'],
 'componentes-exame':[137,'Componentes: a fórmula do LDL é velha de 1972 e ainda funciona. Nem todo software pode dizer o mesmo.'],
 perguntas:[138,'Perguntas da recepção: “está gestante?” antes do beta-HCG evita um resultado positivo e uma cara de surpresa.'],
 observacoes:[139,'Observações: o texto pronto certo poupa o Dr. de escrever “amostra hemolisada” pela milésima vez com o mesmo suspiro.'],
 variaveis:[140,'Variáveis: {nome_do_paciente} é lindo no modelo. No laudo impresso, tem que virar gente.'],
 etiquetas:[141,'Etiquetas: código de barras torto não lê. Etiqueta na tampa não lê. Etiqueta no dedo do coletador, já vi.'],
 config:[142,'Configurações: cada laboratório é de um jeito. Aqui você diz o seu, e o sistema para de insistir.'],
 importar:[143,'Importar e exportar: dado antigo é patrimônio. Entra conferido, com prévia, e ninguém perde o histórico de 2015.'],
 integracoes:[144,'Integrações: sistema que não conversa com os outros é ilha. Bonita, mas sem ponte.'],
 lgpd:[145,'LGPD: CPF mascarado, consentimento guardado e exportação registrada. O paciente confia; a lei confere.'],
 ajuda:[146,'Ajuda: se o guia não resolveu, não foi culpa sua. Foi do guia, e a gente conserta.'],
 componentes:[147,'Biblioteca de componentes: um botão aprovado aqui vira cem botões iguais nas telas. É a economia de escala da beleza.'],
 'novo-atendimento':[148,'Novo atendimento: começa pelo CPF, termina com o paciente sabendo quando e como recebe. O meio é com o sistema.'],
 'novo-orcamento':[149,'Orçamento: preço claro, validade na cara e um WhatsApp bem escrito. Metade das vendas é só não complicar.'],
};
let DEO_OFF={};try{DEO_OFF=JSON.parse(localStorage.getItem('deoclinic-deo-off')||'{}')}catch(e){}
function deoFechar(id){DEO_OFF[id]=1;try{localStorage.setItem('deoclinic-deo-off',JSON.stringify(DEO_OFF))}catch(e){}const el=document.querySelector('#view .deo-fala');if(el)el.remove()}
function injetaDeo(id){if(!BRINCA||id==='home'||DEO_OFF[id])return;const f=DEO_FALAS[id];if(!f)return;const head=document.querySelector('#view .pagehead');if(!head||document.querySelector('#view .deo-fala'))return;
 head.insertAdjacentHTML('afterend',`<div class="deo-fala" role="note" title="Brincadeira ${f[0]}"><img class="fig" src="figura-ok.webp" alt="" aria-hidden="true"><span><b>Dr. Deo diz:</b> ${f[1]}</span><button type="button" class="x" aria-label="Esconder nesta tela" title="Esconder nesta tela (só neste navegador)" onclick="deoFechar('${id}')">×</button></div>`)}

{const _pr=posRender;posRender=function(id){_pr(id);injetaDeo(id)};
 const _a=ajustaColunas;ajustaColunas=function(root){_a(root);marcarExames(root);detalhesGenericos(root)}}
