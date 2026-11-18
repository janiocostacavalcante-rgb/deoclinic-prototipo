/* Rodada 28 (18/11/2026) · notas 767 a 823
   ==========================================================================
   Novo atendimento (abas do cartão Paciente, fichas e orçamentos que abrem, agendar do orçamento, valor por profissional,
   acréscimo do cartão, "Totalmente faturado", salvar e autorizar orçamento, volta ao cadastro depois de faturar),
   cadastro do paciente em três cartões e correção do CPF com registro, Pacientes, Fidelidade ligada ao cadastro,
   área técnica (mapa por bancada, digitação, conferência), urgência sem piscar, estoque, questionário digital da
   tomografia com contraste, procedimentos sem questionário, currículo médico, WhatsApp da agenda e Tarefas
   (restaurar coluna com tarefas, excluir coluna, por etiqueta, aprovação, recorrente e tarefas automáticas).
   Fica depois de telas-tarefas.js: só acrescenta funções e embrulha as que já existem. Prefixo r28 / R28_.
   ========================================================================== */

const r28El=id=>{try{return document.getElementById(id)}catch(e){return null}};
const r28Hash=()=>{try{return location.hash}catch(e){return ''}};
const r28Num=v=>{const n=parseFloat(String(v==null?'':v).replace(/\./g,'').replace(',','.'));return isNaN(n)?0:n};
const r28Moeda=v=>(Math.round((+v||0)*100)/100).toFixed(2).replace('.',',');
const r28Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
const r28Agora=()=>{const d=new Date();return `${dmy(iso(d))} às ${hhmm(d)}`};
function r28Aud(t,txt,quem){try{if(typeof rcHist==='function')rcHist(quem||{pac:''},'cadastro',t,txt)}catch(e){}}

try{document.head.insertAdjacentHTML('beforeend',`<style>
/* 809: tela de atendimento mais organizada (cartões com borda verde acinzentada, títulos em destaque) */
.na28 .at-card{border:1px solid color-mix(in srgb,var(--accent) 30%,var(--border));border-radius:16px;padding:20px 22px;margin-bottom:16px;box-shadow:none}
.na28 .at-card>h3,.na28 .at-card summary h3,.na28 .at-card>.row>h3{font-size:17px;font-weight:800;color:var(--fg-strong);letter-spacing:.01em}
.na28 .at-card .sub{margin-bottom:12px}
.na28 .formgrid{gap:14px 16px}
.na28 .field label{font-weight:700}
.na28 .at-end{border-top:1px solid color-mix(in srgb,var(--accent) 22%,var(--border));padding-top:14px;margin-top:4px}
.na28 .tabs{margin-bottom:12px}
.r28-dica{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.r28-dica p{margin:0}
/* 810, 812, 792: fichas, orçamentos e agendamentos do cartão Paciente */
.r28-lista{display:flex;flex-direction:column;gap:8px}
details.r28-ficha{border:1px solid color-mix(in srgb,var(--accent) 26%,var(--border));border-radius:12px;background:var(--surface);overflow:hidden}
details.r28-ficha>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px}
details.r28-ficha>summary::-webkit-details-marker{display:none}
details.r28-ficha>summary .r28-fic-t{flex:1 1 220px;min-width:0}
details.r28-ficha>summary .r28-fic-t b{display:block;color:var(--fg-strong)}
details.r28-ficha>summary .r28-fic-t small{display:block;color:var(--fg2);margin-top:2px}
details.r28-ficha>summary .r28-chev{transition:transform .15s;flex:none}
details.r28-ficha[open]>summary .r28-chev{transform:rotate(180deg)}
details.r28-ficha[open]>summary{border-bottom:1px solid var(--border);background:var(--accent-soft)}
details.r28-ficha.novo{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}
.r28-fic-c{padding:10px 14px 12px}
.r28-fic-c table{width:100%;min-width:0}
.r28-fic-c td,.r28-fic-c th{text-align:left}
.r28-orc-g{cursor:pointer}
.r28-orc-g:hover .mono{text-decoration:underline}
.r28-orc-it{margin-top:8px;border-top:1px dashed var(--border);padding-top:8px;display:flex;flex-direction:column;gap:4px}
.r28-orc-it div{display:flex;justify-content:space-between;gap:10px;font-size:13.5px}
.r28-ag{width:100%;text-align:left;cursor:pointer;font:inherit;color:inherit;background:transparent;border:0;border-bottom:1px solid var(--border)}
.r28-ag:hover{background:var(--accent-soft)}
.r28-ag .r28-ir{color:var(--accent);font-weight:700;font-size:13px;white-space:nowrap}
.r28-ok{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.r28-ok h3{margin:0}
/* 818: agendar o procedimento do orçamento */
.r28-agd{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin-top:6px;font-size:13px}
.r28-slots{display:flex;flex-wrap:wrap;gap:6px}
.r28-slots button{min-width:64px}
.r28-slots button[aria-pressed=true]{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
/* 800, 803: acréscimo do cartão */
.r26-pg-l.r28-cred{grid-template-columns:minmax(140px,1.3fr) minmax(100px,1fr) minmax(100px,1fr) minmax(100px,.8fr) minmax(140px,1.2fr) auto}
.r28-acr-m{display:block;font-size:12px;color:var(--fg2);margin-top:3px}
.r26-pag-res .r28-tf{background:var(--ok-soft,rgba(46,160,67,.15));color:var(--ok);padding:3px 10px;border-radius:999px;font-weight:800}
@media (max-width:760px){.r26-pg-l.r28-cred{grid-template-columns:1fr 1fr}}
/* 785, 786, 787, 808: cadastro em três cartões */
.r28-cad{border:1px solid color-mix(in srgb,var(--accent) 34%,var(--border));border-radius:14px;margin:0 0 14px;background:var(--surface);overflow:hidden}
.r28-cad>h4{margin:0!important;padding:9px 16px;font-size:13px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);background:var(--accent-soft);border-bottom:1px solid color-mix(in srgb,var(--accent) 24%,var(--border))}
.r28-cad>.pf-g{padding:14px 16px 4px}
.r28-cad .in{background:var(--surface);border-color:var(--border)}
.r28-cpf-box{grid-column:1/-1;border:1px dashed var(--warn);border-radius:10px;padding:10px 12px;margin:0 0 8px;font-size:13px}
/* 807: títulos da lista de pacientes em destaque */
.rc20-pac-tab th,.r17-pac-tab th{font-weight:800!important;color:var(--fg-strong)!important;font-size:12.5px!important;background:var(--accent-soft)}
.r28-fid-b{display:inline-block;margin-left:8px;font-size:11px;font-weight:700;padding:1px 8px;border-radius:999px;background:var(--accent-soft);color:var(--accent);vertical-align:middle;text-decoration:none}
/* 776, 778: digitação */
.res-acoes{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:8px}
.res-acoes .res-prox{flex:1 0 100%;margin:0 0 2px}
.res-acoes>.btn{height:40px;display:inline-flex;align-items:center;margin:0}
#fb-dg{display:flex!important;flex-wrap:nowrap!important;align-items:center;gap:8px;overflow-x:auto}
#fb-dg .periodo{flex:none}
#fb-dg>select{flex:1 1 120px;min-width:110px;width:auto}
/* 780: dica do Enter na conferência */
.r28-enter{font-size:12px;color:var(--fg2);margin-left:6px;white-space:nowrap}
/* 796: sugestões do estoque em lista */
.r28-ac{position:relative}
.r28-ac-l{position:absolute;left:0;right:0;top:100%;z-index:50;margin:4px 0 0;padding:4px;list-style:none;background:var(--surface);border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.25);max-height:260px;overflow:auto}
.r28-ac-l li{padding:8px 10px;border-radius:8px;cursor:pointer;font-size:13.5px;display:flex;justify-content:space-between;gap:10px}
.r28-ac-l li small{color:var(--fg2)}
.r28-ac-l li[aria-selected=true],.r28-ac-l li:hover{background:var(--accent-soft)}
.r28-prev{border:1px solid var(--border);border-radius:12px;padding:16px;background:#fff;color:#222;max-height:56vh;overflow:auto}
.r28-prev *{color:#222!important}.r28-prev table{min-width:0;font-size:12px}.r28-prev th,.r28-prev td{border-color:#ddd!important;background:#fff!important}
.r28-prev .r28-prev-h{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;border-bottom:2px solid #23756D;padding-bottom:8px;margin-bottom:10px}
.r28-prev.paisagem{aspect-ratio:auto}
/* 801: questionário digital */
.r28-qd h4{margin:16px 0 8px;padding:7px 12px;border-radius:8px;background:var(--accent-soft);color:var(--accent);font-size:13px;letter-spacing:.05em;text-transform:uppercase}
.r28-qd .r28-q{border-bottom:1px solid var(--border);padding:10px 0}
.r28-qd .r28-q>b{display:block;margin-bottom:6px;color:var(--fg-strong)}
.r28-qd .r28-op{display:flex;gap:14px;flex-wrap:wrap}
.r28-qd .r28-sub{margin-top:8px}
.r28-qd .r28-termo{border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--surface2);font-size:13.5px;line-height:1.5}
.r28-ass{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.r28-ass canvas{width:100%;height:120px;border:1px dashed var(--fg2);border-radius:10px;background:#fff;touch-action:none;cursor:crosshair}
@media (max-width:700px){.r28-ass{grid-template-columns:1fr}}
/* 815: abas do perfil do profissional centralizadas */
.rc19-cp-abas{justify-content:center!important;gap:6px;border:0!important;background:var(--surface2);padding:6px;border-radius:999px;width:max-content;max-width:100%;margin:10px auto 14px!important}
.rc19-cp-abas .tab{border-radius:999px!important;padding:8px 22px!important;border:0!important;font-weight:700}
.rc19-cp-abas .tab.active{background:var(--accent)!important;color:var(--on-accent)!important;box-shadow:0 2px 8px rgba(0,0,0,.18)}
.rc19-cp-abas .tab.active .n{color:var(--on-accent)}
/* 814: o lápis de editar do perfil aparecia espremido (quase invisível); agora é um botão "Editar" visível */
.btn.rc-ic svg.i{width:16px!important;min-width:16px;height:16px;flex:none}
.ag18-cp-h .rc-ic,.ag18-cp-reg .rc-ic{width:auto!important;padding:0 10px!important;border:1px solid color-mix(in srgb,var(--accent) 45%,transparent)!important;background:var(--accent-soft)!important;gap:6px}
.ag18-cp-h .rc-ic::after,.ag18-cp-reg .rc-ic::after{content:'Editar';font-size:12.5px;font-weight:700}
/* 781, 782, 783: Tarefas */
.tq-aval{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;background:var(--warn-soft);color:var(--warn);margin:4px 0}
.tq-rec{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:var(--accent)}
.r28-etq-g h3{display:flex;align-items:center;gap:8px}
.r28-etq-g h3 .tq-etq{font-size:12px}
</style>`)}catch(e){}

/* ==========================================================================
   770 e 772: URGENTE fica só vermelho, sem piscar, em todas as telas
   ========================================================================== */
function r28SemPiscar(root){try{(root&&root.querySelectorAll?root:document).querySelectorAll('.pisca').forEach(el=>{if(/urgen/i.test(el.textContent||''))el.classList.add('sem-pisca')})}catch(e){}}
try{if(typeof MutationObserver!=='undefined'&&document.body){new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes||[])if(n.nodeType===1){if(n.classList&&n.classList.contains('pisca')&&/urgen/i.test(n.textContent||''))n.classList.add('sem-pisca');else if(n.querySelector&&n.querySelector('.pisca'))r28SemPiscar(n)}}).observe(document.body,{childList:true,subtree:true})}}catch(e){}
try{document.head.insertAdjacentHTML('beforeend','<style>.pisca.sem-pisca,.urg2{animation:none!important}</style>')}catch(e){}

/* ==========================================================================
   811, 806 e 817: sem o "Dr. Deo diz" no Novo atendimento, em Pacientes e nas Fichas do paciente
   ========================================================================== */
try{if(typeof DEO_FALAS!=='undefined')['novo-atendimento','pacientes','fichas-paciente'].forEach(k=>{delete DEO_FALAS[k]})}catch(e){}

/* ==========================================================================
   773: o mapa de trabalho muda de verdade quando se troca a bancada
   ========================================================================== */
const R28_MAPA_BIO=typeof MAPA_POS!=='undefined'?MAPA_POS.slice():[];
const R28_MAPA={
 HEM:[{n:1,cod:'10-00018241-03-01',pac:'Raimundo N. S.',ex:'HEMO',sit:'aparelho',urg:true},{n:2,cod:'CQ-HEM-N2-1104',pac:'Controle nível 2',ex:'HEMO',sit:'controle'},{n:3,cod:'10-00018246-03-01',pac:'Rita de C. L.',ex:'HEMO',sit:'recebido'},{n:4,cod:'10-00018250-03-01',pac:'Larissa M.',ex:'HEMO',sit:'recebido'},{n:5,cod:'12-00007710-03-01',pac:'Severino A.',ex:'HEMO',sit:'fila',urg:true},{n:6,cod:'14-00004503-03-01',pac:'Joana D. P.',ex:'HEMO',sit:'fila'}],
 HOR:[{n:1,cod:'CQ-TSH-N1-1101',pac:'Controle nível 1',ex:'TSH',sit:'controle'},{n:2,cod:'10-00018250-01-01',pac:'Larissa M.',ex:'TSH',sit:'aparelho'},{n:3,cod:'10-00018250-01-01',pac:'Larissa M.',ex:'T4L',sit:'aparelho'},{n:4,cod:'10-00018233-01-01',pac:'Maria H. S.',ex:'VITD',sit:'recebido'},{n:5,cod:'10-00018259-01-01',pac:'Antônio C. N.',ex:'PSA',sit:'fila'},{n:6,cod:'14-00004505-01-01',pac:'Francisca O.',ex:'BHCG',sit:'fila',urg:true},{n:7,cod:'10-00018233-01-01',pac:'Maria H. S.',ex:'FERR',sit:'recebido',rep:true}],
 URI:[{n:1,cod:'10-00018270-04-01',pac:'Josefa B.',ex:'EAS',sit:'recebido'},{n:2,cod:'14-00004503-04-01',pac:'Joana D. P.',ex:'EAS',sit:'fila'},{n:3,cod:'10-00018233-04-01',pac:'Maria H. S.',ex:'EAS',sit:'digitado'}],
 COA:[{n:1,cod:'CQ-TAP-N1-1101',pac:'Controle nível 1',ex:'TAP',sit:'controle'},{n:2,cod:'10-00018262-02-01',pac:'Cícero R.',ex:'TAP',sit:'aparelho',urg:true},{n:3,cod:'10-00018255-02-01',pac:'Francisco C.',ex:'TAP',sit:'fila'}]};
if(typeof VIEWS.mapa==='function'&&typeof MAPA_POS!=='undefined'){const _v=VIEWS.mapa;VIEWS.mapa=function(){
 const l=MP_BANC==='BIO'?R28_MAPA_BIO:(R28_MAPA[MP_BANC]||[]);MAPA_POS.splice(0,MAPA_POS.length,...l);let h=String(_v.apply(this,arguments));
 const u=l.filter(p=>p.urg).length,r=l.filter(p=>p.rep).length,c=l.filter(p=>p.sit==='controle').length,rodou=l.filter(p=>['aparelho','recebido','digitado','controle'].includes(p.sit)).length,faltam=l.filter(p=>['fila','mapa'].includes(p.sit));
 h=h.replace(/(<div class="sub">)\d+ posições · 3 urgentes · 1 repetição · 1 controle/,`$1${l.length} posições · ${u} urgente${u!==1?'s':''} · ${r} repetiç${r!==1?'ões':'ão'} · ${c} controle${c!==1?'s':''}`);
 try{const ant=miniKpi('Rodou','5','de 8')+miniKpi('Faltam','2','posições 6 e 7','warn')+miniKpi('Sem amostra','1','','err');h=h.replace(ant,miniKpi('Rodou',String(rodou),'de '+l.length)+miniKpi('Faltam',String(faltam.length),faltam.length?'posições '+faltam.map(p=>p.n).join(' e '):'nenhuma','warn')+miniKpi('Sem amostra',MP_BANC==='BIO'?'1':'0','',MP_BANC==='BIO'?'err':''))}catch(e){}
 if(!l.length)h=h.replace(/<div class="stack">(?=<\/div>)/,'<div class="stack"><p class="tl">Nada pendente nesta bancada agora.</p>');
 return h}}

/* ==========================================================================
   777: a lista da Digitação não tem mais o botão "Digitar" (clicar na linha já abre)
   ========================================================================== */
if(typeof VIEWS.digitacao==='function'){const _v=VIEWS.digitacao;VIEWS.digitacao=function(){let h=String(_v.apply(this,arguments));
 h=h.replace(/<button class="btn sm sec" onclick="event\.stopPropagation\(\);dgAbrir\(\d+\)">(?:Digitar|Continuar|Corrigir)<\/button>/g,'');
 h=h.replace(/<td data-l=""><\/td>/g,'').replace(/<th[^>]*>\s*<\/th>(?=<\/tr><\/thead>)/,'');return h}}

/* ==========================================================================
   779: na conferência, "Liberar" de um exame com crítica que já está aberto na tela libera direto
   780: Enter aciona o botão Liberar do exame aberto
   O valor crítico continua sendo avisado ao médico (RDC 978/2025) e a revisão fica na trilha do exame.
   Quando a liberação é em lote ("Liberar todos"), cada exame com crítica ainda abre a janela, porque ali ele não foi visto.
   ========================================================================== */
if(typeof cfLiberar==='function'){const _l=cfLiberar;cfLiberar=function(i,depois){const c=typeof CONF!=='undefined'?CONF[i]:null,dr=r28El('drawer');
 if(!depois&&c&&c.al&&typeof ehDr==='function'&&ehDr()&&cfSt(c)!=='liberado'&&dr&&dr.classList.contains('show')&&CF_ABERTO===i){
  try{cfTrilha(c,'Revisado com crítica na tela de conferência')}catch(e){}cfMarca([c],'liberado');
  cfAviso(EX[c.ex].n+' liberado e assinado',(c.al==='critico'?'Aviso de valor crítico enviado ao médico com confirmação de leitura; sem resposta em 30 min, o acionamento aparece nos avisos. ':'')+'Só este exame. Entra na janela de desfazer de 10 min; depois só retificação.');return}
 return _l.apply(this,arguments)}}
function r28CfBotao(){const dr=r28El('drawer');if(!dr||!dr.classList.contains('show'))return null;return [...dr.querySelectorAll('button')].find(b=>/cfLiberar\(\d+\)/.test(b.getAttribute('onclick')||'')&&/^\s*Liberar\b/.test(b.textContent||'')&&!/todos/i.test(b.textContent||''))||null}
try{document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.altKey||e.metaKey)return;if(r28Hash()!=='#conferencia')return;const bd=r28El('backdrop');if(bd&&bd.classList.contains('show'))return;
 const t=e.target,tg=(t&&t.tagName)||'';if(/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(tg)||(t&&t.isContentEditable))return;const b=r28CfBotao();if(b&&!b.disabled){e.preventDefault();b.click()}})}catch(e){}
if(typeof cfAbrir==='function'){const _a=cfAbrir;cfAbrir=function(){const r=_a.apply(this,arguments);try{const b=r28CfBotao();if(b&&!b.querySelector('.r28-enter'))b.insertAdjacentHTML('beforeend','<span class="r28-enter">(Enter)</span>')}catch(e){}return r}}

/* ==========================================================================
   FIDELIDADE · 794 (sem a coluna Paciente ID), 768 (contrato pelos números) e 795 (contratos ligados ao cadastro)
   No protótipo, o contrato fica ligado ao cadastro pelo CPF (ou pelo vínculo feito aqui). A integração de verdade com o
   sistema Fidelidade que já existe (banco ou API) fica para o sistema definitivo.
   ========================================================================== */
try{if(typeof R21_FID_COLS!=='undefined'){const k=R21_FID_COLS.findIndex(c=>c[0]==='id');if(k>=0)R21_FID_COLS.splice(k,1)}}catch(e){}
if(typeof rc21FidPac==='function'){const _p=rc21FidPac;rc21FidPac=function(k){if(k&&k.pacCpf&&typeof PACIENTES!=='undefined'){const p=PACIENTES.find(x=>!x.unificadoEm&&x.cpf===k.pacCpf);if(p)return p}return _p.apply(this,arguments)}}
if(typeof rc21FidFiltra==='function'){const _f=rc21FidFiltra;rc21FidFiltra=function(){const F=R21_FID,ct=soDig(F.ct||'');F.ct='';let l;try{l=_f.apply(this,arguments)}finally{F.ct=ct}return ct?l.filter(r=>soDig(r.ct).includes(ct)):l}}
if(typeof rc21FidCorpo==='function'){const _c=rc21FidCorpo;rc21FidCorpo=function(){const c=_c.apply(this,arguments);try{
 c.rows=String(c.rows).replace(/<td data-l="Paciente ID">[\s\S]*?<\/td>/g,'').replace(/colspan="7"/g,'colspan="6"')
  .replace(/(rc21CtVer\('([^']+)'\)">Ver<\/button>)/g,(m,a,id)=>{const k=PL_CONTRATOS.find(x=>x.id===id),p=k&&rc21FidPac(k);return a+(p?`<button type="button" class="btn sm ghost" title="Abrir o cadastro e as fichas de ${esc(p.n)}" onclick="r28FidCadastro('${r28Q(id)}')">Cadastro</button>`:`<button type="button" class="btn sm sec" title="Ligar este contrato a um cadastro de paciente" onclick="r28FidVincular('${r28Q(id)}')">Vincular ao cadastro</button>`)})}catch(e){}return c}}
if(typeof rc21FidFiltros==='function'){const _f=rc21FidFiltros;rc21FidFiltros=function(){return String(_f.apply(this,arguments)).replace(/<th><input class="in" aria-label="Filtrar por Paciente ID"[^>]*><\/th>/,'')
 .replace(/placeholder="Contrato" value="([^"]*)" oninput="rc21FidSet\('ct',this\.value\)"/,(m,v)=>`placeholder="Contrato (só números)" value="${v}" inputmode="numeric" oninput="this.value=this.value.replace(/\\D/g,'');rc21FidSet('ct',this.value)"`)}}
function r28FidCadastro(id){const k=PL_CONTRATOS.find(x=>x.id===id),p=k&&rc21FidPac(k);if(!p){r28FidVincular(id);return}if(typeof r26FichasAbrir==='function')r26FichasAbrir(p.cpf||'',p.n);else if(p.cpf)rcPacEditar(p.cpf)}
let R28_VINC={ct:'',q:''};
function r28FidVincular(id){const k=PL_CONTRATOS.find(x=>x.id===id);if(!k)return;if(typeof rc21FidPode==='function'&&!rc21FidPode()){toast('Seu perfil só consulta contratos','warn');return}R28_VINC={ct:id,q:k.tit||''};
 openModal(`${mh('Vincular o contrato '+esc(id)+' ao cadastro')}<div class="mb"><p style="margin:0 0 10px">Titular no contrato: <b>${esc(k.tit)}</b>${k.cpf?' · CPF '+cpfVer(k.cpf):' · sem CPF'}. Escolha o cadastro do paciente. Depois de ligado, o contrato aparece no cadastro, nas fichas e no Novo atendimento, e o desconto do plano entra sozinho.</p>
 <div class="field"><label for="r28VQ">Buscar paciente (nome, CPF ou prontuário)</label><input class="in" id="r28VQ" value="${esc(R28_VINC.q)}" oninput="R28_VINC.q=this.value;r28El('r28VL').innerHTML=r28VincLista()" autocomplete="off"></div><div id="r28VL">${r28VincLista()}</div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn sec" onclick="r28VincNovo()">${I.plus} Cadastrar paciente com os dados do contrato</button></div>`)}
function r28VincLista(){const q=semAc(String(R28_VINC.q||'').trim()),d=soDig(R28_VINC.q||'');if(q.length<2&&d.length<3)return '<p class="tl">Digite pelo menos 2 letras ou 3 números.</p>';
 const l=PACIENTES.filter(p=>!p.unificadoEm&&p.ativo!==false&&(semAc(p.n).includes(q)||(d.length>=3&&(soDig(p.cpf||'').includes(d)||String(typeof rc20Pront==='function'?rc20Pront(p):'').includes(d))))).slice(0,8);
 return l.length?`<div class="at-list">${l.map(p=>`<div class="at-row"><div class="grow"><b>${esc(p.n)}</b><small>${p.cpf?'CPF '+cpfVer(p.cpf):'sem CPF'}${p.dn?' · '+dmy(p.dn):''}${typeof rc20Pront==='function'?' · prontuário '+esc(rc20Pront(p)):''}</small></div><button class="btn sm" onclick="r28VincOk('${r28Q(p.cpf||'')}','${r28Q(p.n)}')">Vincular</button></div>`).join('')}</div>`:'<p class="tl">Nenhum paciente encontrado. Use "Cadastrar paciente com os dados do contrato".</p>'}
function r28VincOk(cpf,n){const k=PL_CONTRATOS.find(x=>x.id===R28_VINC.ct);if(!k)return;const p=PACIENTES.find(x=>(cpf&&x.cpf===cpf)||(!cpf&&x.n===n));if(!p)return;if(!p.cpf){toast('Para vincular, o cadastro precisa de CPF','warn');return}
 k.pacCpf=p.cpf;r28Aud('Contrato de fidelidade vinculado ao cadastro',`${k.id} ligado ao cadastro de ${p.n}`,{pac:p.n});closeModal();try{rc21FidPinta()}catch(e){}try{reView()}catch(e){}toast(`Contrato ${k.id} ligado ao cadastro de ${p.n}`)}
function r28VincNovo(){const k=PL_CONTRATOS.find(x=>x.id===R28_VINC.ct);if(!k)return;R28_VINC.pend=k.id;closeModal();rcPacEditar('',{n:k.tit||'',cpf:k.cpf||''});toast('Complete o cadastro e salve: o contrato fica ligado a ele')}
function r28FidDe(p){if(!p||typeof PL_CONTRATOS==='undefined'||typeof rc21FidPac!=='function')return [];return PL_CONTRATOS.filter(k=>{try{return rc21FidPac(k)===p}catch(e){return false}})}
function r28FidBadges(p){return r28FidDe(p).map(k=>{let s='';try{s=plSit(k)[1]}catch(e){}return `<span class="r28-fid-b" title="Fidelidade: ${esc(k.id)}${s?' · '+esc(s):''}">Fidelidade ${esc(k.id)}</span>`}).join('')}
/* Novo contrato: dá para cadastrar o paciente na hora, sem sair */
if(typeof rc21CtForm==='function'){const _f=rc21CtForm;rc21CtForm=function(id){const _om=openModal;openModal=function(h,c){return _om(String(h).replace('<span class="msg tl">Quem não tem cadastro: cadastre antes em Pacientes.</span>',`<span class="msg tl">Quem não tem cadastro: <button type="button" class="btn sm ghost" onclick="R28_VINC={ct:'',novoCt:true};closeModal();pacNovo()">${I.plus} Cadastrar paciente agora</button></span>`),c)};try{return _f.apply(this,arguments)}finally{openModal=_om}}}

/* ==========================================================================
   PACIENTES · 771 (busca do topo formata a data de nascimento), 807 (títulos em destaque), selo da Fidelidade (795)
   ========================================================================== */
function r28MascaraBusca(el){const v=el.value;if(!/^[\d\/]*$/.test(v))return;const d=v.replace(/\D/g,'');
 if(d.length>8){if(v.includes('/'))el.value=d;return}
 const dd=+d.slice(0,2),mm=+d.slice(2,4);if(d.length>=2&&(dd<1||dd>31)){if(v.includes('/'))el.value=d;return}if(d.length>=4&&(mm<1||mm>12)){if(v.includes('/'))el.value=d;return}
 const nv=d.length>4?d.slice(0,2)+'/'+d.slice(2,4)+'/'+d.slice(4):d.length>2?d.slice(0,2)+'/'+d.slice(2):d;if(nv!==v){el.value=nv;try{el.setSelectionRange(nv.length,nv.length)}catch(e){}}}
try{const gs=r28El('globalSearch');if(gs){gs.addEventListener('input',()=>r28MascaraBusca(gs));gs.setAttribute('placeholder','Buscar paciente (nome, CPF ou dd/mm/aaaa)')}}catch(e){}
function r28PacResultado(){const el=r28El('pcBody');if(!el)return;try{el.querySelectorAll('tr').forEach(tr=>{const m=/r17PacClique\('([^']*)'\)/.exec(tr.getAttribute('onclick')||'');if(!m||tr.querySelector('.r28-fid-b'))return;const p=PACIENTES.find(x=>x.cpf===m[1]);const b=r28FidBadges(p);if(!b)return;const td=tr.querySelector('td.col-nome');if(td)td.insertAdjacentHTML('beforeend',b)})}catch(e){}}
['pacBuscaSet','reView'].forEach(fn=>{if(typeof window[fn]!=='function')return;const _f=window[fn];window[fn]=function(){const r=_f.apply(this,arguments);if(r28Hash()==='#pacientes')setTimeout(r28PacResultado,0);return r}});

/* ==========================================================================
   CADASTRO DO PACIENTE · 785, 786, 787 e 808 (três cartões: Dados pessoais, Contato e Endereço) e 767 (correção do CPF)
   767: o CPF continua travado na edição comum. "Corrigir CPF" libera o campo com motivo obrigatório; o sistema confere os
   dígitos, recusa CPF de outro cadastro e grava a correção (de/para, quem e quando) no histórico do paciente.
   LGPD, art. 18, III: o titular tem direito à correção de dados incompletos, inexatos ou desatualizados.
   ========================================================================== */
function r28CadCards(h){h=String(h);if(!/id="pfN"/.test(h)||/r28-cad/.test(h))return h;
 const iMb=h.indexOf('<div class="mb">');if(iMb<0)return h;const ini=iMb+'<div class="mb">'.length;
 const tC='<h4 style="margin:12px 0 6px">Contato</h4>',tE='<h4 style="margin:12px 0 6px">Endereço</h4>',tS='<div style="margin-top:10px"><label class="switch">';
 const iC=h.indexOf(tC,ini),iE=h.indexOf(tE,ini);let iS=h.indexOf(tS,ini);if(iC<0||iE<0)return h;if(iS<0)iS=h.indexOf('</div><div class="mf">',ini);if(iS<0)return h;
 let a=h.slice(ini,iC);const b=h.slice(iC+tC.length,iE),c=h.slice(iE+tE.length,iS);
 a=a.replace(/(<input class="in[^"]*" id="pfC"[^>]*disabled[^>]*>)/,`$1<button type="button" class="btn sm ghost" style="margin-top:4px;align-self:flex-start;padding-left:2px" onclick="r28CpfCorrigir()">${I.edit} Corrigir CPF</button>`);
 return h.slice(0,ini)+`<section class="r28-cad"><h4>Dados pessoais</h4>${a}<div id="r28CpfBox"></div></section><section class="r28-cad"><h4>Contato</h4>${b}</section><section class="r28-cad"><h4>Endereço</h4>${c}</section>`+h.slice(iS)}
['rcPacEditar','pacNovo'].forEach(fn=>{if(typeof window[fn]!=='function')return;const _f=window[fn];window[fn]=function(){R28_CPF=null;const _om=openModal;openModal=function(h,c){return _om(r28CadCards(h),c)};try{return _f.apply(this,arguments)}finally{openModal=_om}}});
let R28_CPF=null;
function r28CpfOk(c){const d=soDig(c);if(d.length!==11||/^(\d)\1{10}$/.test(d))return false;const dv=n=>{let s=0;for(let i=0;i<n;i++)s+=+d[i]*(n+1-i);const r=s*10%11;return r===10?0:r};return dv(9)===+d[9]&&dv(10)===+d[10]}
function r28CpfCorrigir(){const el=r28El('pfC'),box=r28El('r28CpfBox');if(!el||!box)return;const pode=typeof PERFIL==='undefined'||['admin','gestor','recepcao'].includes(PERFIL);if(!pode){toast('Seu perfil não corrige CPF','warn');return}
 R28_CPF={de:el.value};el.disabled=false;el.focus();box.innerHTML=`<div class="r28-cpf-box"><b>Correção do CPF.</b> Confira com um documento do paciente. A correção fica no histórico do cadastro, com o CPF anterior, o motivo, quem fez e quando.<div class="field" style="margin:8px 0 0"><label for="r28CpfM">Motivo da correção <span class="req">*</span></label><input class="in" id="r28CpfM" placeholder="Ex.: CPF digitado errado no cadastro" maxlength="160"></div></div>`}
if(typeof rcPacSalvar==='function'){const _s=rcPacSalvar;rcPacSalvar=function(){const novo=!RC.pEd,el=r28El('pfC');let corr=null;
 if(!novo&&R28_CPF&&el){const de=RC.pEd,para=mCPF(String(el.value||'').trim());if(soDig(para)!==soDig(de)){const mot=String((r28El('r28CpfM')||{}).value||'').trim();
  if(!r28CpfOk(para)){toast('CPF inválido: confira os números','warn');return}if(PACIENTES.some(p=>soDig(p.cpf||'')===soDig(para)))return toast('Este CPF já pertence a outro cadastro: use Unificar cadastros','warn');
  if(!mot){toast('Informe o motivo da correção do CPF','warn');const m=r28El('r28CpfM');if(m)m.focus();return}corr={de,para,mot}}}
 const antes=PACIENTES.length,pend=R28_VINC&&R28_VINC.pend,novoCt=R28_VINC&&R28_VINC.novoCt;const r=_s.apply(this,arguments);
 try{if(corr){const p=PACIENTES.find(x=>x.cpf===corr.para)||PACIENTES.find(x=>x.cpf===corr.de);if(p){p.cpf=corr.para;const tr=o=>{if(o&&o.cpf===corr.de)o.cpf=corr.para};
   (typeof ORCS!=='undefined'?ORCS:[]).forEach(tr);(RC.ag||[]).forEach(tr);(typeof PL_CONTRATOS!=='undefined'?PL_CONTRATOS:[]).forEach(k=>{tr(k);if(k.pacCpf===corr.de)k.pacCpf=corr.para});R26_FICHAS.forEach(tr);
   if(typeof NA!=='undefined'&&NA&&NA.cpf===corr.de){NA.cpf=corr.para;NA.pac=Object.assign({},NA.pac,p)}
   r28Aud('CPF corrigido',`De ${corr.de} para ${corr.para}. Motivo: ${corr.mot}`,{pac:p.n});R28_CPF=null;toast('CPF corrigido. A correção ficou no histórico do cadastro.');try{if(r28Hash()==='#novo-atendimento')naRender();else reView()}catch(e){}}}
  if(PACIENTES.length>antes){const p=PACIENTES[0];if(pend){const k=PL_CONTRATOS.find(x=>x.id===pend);if(k&&p.cpf){k.pacCpf=p.cpf;r28Aud('Contrato de fidelidade vinculado ao cadastro',`${k.id} ligado ao cadastro novo de ${p.n}`,{pac:p.n});toast(`Cadastro criado e ligado ao contrato ${k.id}`)}}
   if(novoCt&&typeof rc21CtForm==='function'){setTimeout(()=>{rc21CtForm();const s=r28El('rc21CtP');if(s){const o=[...s.options].find(o=>o.textContent.startsWith(p.n));if(o)s.value=o.value}},120)}}
  if(R28_VINC&&(R28_VINC.pend||R28_VINC.novoCt)&&PACIENTES.length>antes)R28_VINC={ct:'',q:''}}catch(e){}
 return r}}

/* ==========================================================================
   ESTOQUE · 793 (fornecedor novo no cadastro do item), 796 (sugestões em lista) e 797 (prévia antes de imprimir)
   793: o fornecedor novo entra "em qualificação": a qualificação de fornecedores é exigida para o laboratório
   (RDC 978/2025 e PALC). Ele já pode ser usado no cadastro do item, mas aparece marcado até a qualidade aprovar.
   ========================================================================== */
if(typeof stkNovoItem==='function'){const _n=stkNovoItem;stkNovoItem=function(){const _om=openModal;openModal=function(h,c){h=String(h).replace(/(<select class="in" id="stkNF")>/,`$1 onchange="r28El('r28FornBox').hidden=this.value!=='__novo';if(this.value==='__novo')setTimeout(()=>{const e=r28El('r28FnN');if(e)e.focus()},0)">`).replace(/(<select class="in" id="stkNF"[^>]*>[\s\S]*?)(<\/select>)/,`$1<option value="__novo">+ Cadastrar fornecedor que não está na lista</option>$2`)
  .replace(/(<p class="tl">O saldo começa zerado)/,`<div id="r28FornBox" hidden class="r28-cpf-box" style="border-color:var(--accent)"><b>Fornecedor novo</b><div class="formgrid" style="margin-top:8px"><div class="field"><label for="r28FnN">Nome <span class="req">*</span></label><input class="in" id="r28FnN" maxlength="80"></div><div class="field"><label for="r28FnC">CNPJ <span class="req">*</span></label><input class="in" id="r28FnC" inputmode="numeric" placeholder="00.000.000/0000-00" oninput="this.value=r28Cnpj(this.value)"></div><div class="field"><label for="r28FnT">Telefone</label><input class="in" id="r28FnT" oninput="this.value=mTel(this.value)"></div><div class="field"><label for="r28FnP">Prazo de entrega (dias)</label><input class="in" id="r28FnP" type="number" min="1" max="60" value="5"></div></div><p class="tl" style="margin:6px 0 0">Ele entra como <b>em qualificação</b>: a equipe da qualidade avalia e aprova o fornecedor (exigência do laboratório).</p>$1`);return _om(h,c)};try{return _n.apply(this,arguments)}finally{openModal=_om}}}
const r28Cnpj=v=>{const d=soDig(v).slice(0,14);return d.replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2')};
if(typeof stkNovoOk==='function'){const _o=stkNovoOk;stkNovoOk=function(){const s=r28El('stkNF');if(s&&s.value==='__novo'){const n=String((r28El('r28FnN')||{}).value||'').trim().toUpperCase(),c=String((r28El('r28FnC')||{}).value||'').trim();
  if(!n){toast('Informe o nome do fornecedor novo','warn');return}if(soDig(c).length!==14){toast('Informe o CNPJ do fornecedor com 14 números','warn');return}
  if(STK_FORN.some(f=>semAc(f.n)===semAc(n))){toast('Este fornecedor já está cadastrado: escolha na lista','warn');return}
  STK_FORN.push({n,cnpj:c,prazo:+((r28El('r28FnP')||{}).value)||5,cond:'A combinar',tel:String((r28El('r28FnT')||{}).value||''),qual:'em qualificação'});s.insertAdjacentHTML('beforeend',`<option>${esc(n)}</option>`);s.value=n;
  try{if(typeof stkAud==='function')stkAud(`Fornecedor ${n} cadastrado (em qualificação)`)}catch(e){}}
 return _o.apply(this,arguments)}}
/* 796 */
let R28_STK={ix:-1,l:[],sel:0};
function r28StkSug(ix,el){const q=semAc(String(el.value||'').trim());const ul=r28El('r28StkL_'+ix);if(!ul)return;if(q.length<1){ul.hidden=true;return}
 const l=STK_IT.filter(i=>i.ativo!==false&&semAc(i.c+' '+i.n).includes(q)).slice(0,10);R28_STK={ix,l,sel:0};
 ul.innerHTML=l.length?l.map((i,k)=>`<li role="option" id="r28StkO_${ix}_${k}" aria-selected="${k===0}" onmousedown="event.preventDefault();r28StkPick(${ix},${k})"><span><b class="mono">${esc(i.c)}</b> · ${esc(i.n)}</span><small>${esc(i.un||'')}</small></li>`).join(''):'<li aria-disabled="true"><small>Nenhum material com esse código ou nome</small></li>';ul.hidden=false;el.setAttribute('aria-expanded','true')}
function r28StkPick(ix,k){const i=R28_STK.l[k];if(!i)return;const ul=r28El('r28StkL_'+ix);if(ul)ul.hidden=true;stkLinha(ix,'c',i.c)}
function r28StkKey(e,ix,el){const ul=r28El('r28StkL_'+ix);if(!ul||ul.hidden||R28_STK.ix!==ix||!R28_STK.l.length)return;
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();R28_STK.sel=(R28_STK.sel+(e.key==='ArrowDown'?1:-1)+R28_STK.l.length)%R28_STK.l.length;ul.querySelectorAll('li').forEach((li,k)=>li.setAttribute('aria-selected',String(k===R28_STK.sel)))}
 else if(e.key==='Enter'){e.preventDefault();r28StkPick(ix,R28_STK.sel)}else if(e.key==='Escape'){ul.hidden=true}}
function r28StkFecha(){document.querySelectorAll('.r28-ac-l').forEach(u=>u.hidden=true)}
if(typeof VIEWS['estoque-lancar']==='function'){const _v=VIEWS['estoque-lancar'];VIEWS['estoque-lancar']=function(){return String(_v.apply(this,arguments)).replace(/<input class="in" list="stkDL" value="([^"]*)" onchange="stkLinha\((\d+),'c',this\.value\.split\(' · '\)\[0\]\.trim\(\)\)" placeholder="Código ou nome">/g,
 (m,v,ix)=>`<div class="r28-ac"><input class="in" value="${v}" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="r28StkL_${ix}" aria-expanded="false" oninput="r28StkSug(${ix},this)" onkeydown="r28StkKey(event,${ix},this)" onblur="setTimeout(r28StkFecha,150)" onchange="if(!R28_STK.l.some(i=>i.c===this.value.split(' · ')[0].trim())&&STK(this.value.split(' · ')[0].trim()))stkLinha(${ix},'c',this.value.split(' · ')[0].trim())" placeholder="Código ou nome"><ul class="r28-ac-l" id="r28StkL_${ix}" role="listbox" hidden></ul></div>`)}}
/* 797 */
let R28_PRV={mod:'retrato',val:true};
const R28_REL_N={posicao:'Posição do estoque',consumo:'Consumo por setor',procedimento:'Consumo por procedimento',perdas:'Perdas',abc:'Curva ABC',parados:'Itens parados',compras:'Compras por fornecedor'};
function r28StkPrevHtml(){let corpo='';try{corpo=String(stkRel())}catch(e){corpo='<p>Relatório indisponível.</p>'}corpo=corpo.replace(/<button[\s\S]*?<\/button>/g,'');if(!R28_PRV.val)corpo=corpo.replace(/R\$\s?[\d.]+,\d{2}/g,'—');
 return `<div class="r28-prev ${R28_PRV.mod}"><div class="r28-prev-h"><div><b style="font-size:15px">${esc(R28_REL_N[STK_REL]||'Relatório do estoque')}</b><div style="font-size:12px">${esc(typeof unidNome==='function'?unidNome(STK_U):'')}</div></div><div style="font-size:12px;text-align:right">DeoVita Clínicas · Estoque<br>Emitido em ${r28Agora()}</div></div>${corpo}<p style="font-size:11px;margin-top:12px">Folha ${R28_PRV.mod==='paisagem'?'A4 deitada':'A4 em pé'}${R28_PRV.val?'':' · sem valores'}.</p></div>`}
function r28StkPrev(){openModal(`${mh('Imprimir relatório · prévia')}<div class="mb"><div class="row" style="gap:10px;flex-wrap:wrap;margin-bottom:10px"><div class="field" style="margin:0"><label for="r28PrvM">Modelo</label><select class="in" id="r28PrvM" onchange="R28_PRV.mod=this.value;r28El('r28PrvB').innerHTML=r28StkPrevHtml()"><option value="retrato" ${R28_PRV.mod==='retrato'?'selected':''}>A4 em pé</option><option value="paisagem" ${R28_PRV.mod==='paisagem'?'selected':''}>A4 deitada</option></select></div><label class="check" style="align-self:flex-end"><input type="checkbox" ${R28_PRV.val?'checked':''} onchange="R28_PRV.val=this.checked;r28El('r28PrvB').innerHTML=r28StkPrevHtml()">Mostrar valores em reais</label></div><div id="r28PrvB">${r28StkPrevHtml()}</div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn" onclick="r28StkImprimir()">${I.print} Imprimir</button></div>`,'wide')}
function r28StkImprimir(){const h=r28StkPrevHtml();if(typeof r17Print==='function')r17Print(R28_REL_N[STK_REL]||'Relatório do estoque',`<style>@page{size:A4 ${R28_PRV.mod==='paisagem'?'landscape':'portrait'}}</style>`+h);closeModal();toast('Relatório enviado para a impressora')}
if(typeof VIEWS['estoque-relatorios']==='function'){const _v=VIEWS['estoque-relatorios'];VIEWS['estoque-relatorios']=function(){return String(_v.apply(this,arguments)).replace(`onclick="toast('Relatório enviado para imprimir')"`,'onclick="r28StkPrev()"')}}

/* ==========================================================================
   769: a prévia das etiquetas da coleta não tem mais o texto explicativo (tirado em telas-base.js)
   ========================================================================== */

/* ==========================================================================
   801: questionário digital da Tomografia computadorizada com contraste (perguntas, autorização do contraste,
   consentimento e assinaturas numa etapa só). 819: procedimento sem questionário.
   Normas: dado de saúde é dado sensível (LGPD, art. 11, II, f: tutela da saúde); o consentimento do paciente é dever do
   médico (Código de Ética Médica, art. 22); gravidez e amamentação ficam registradas antes do exame com radiação e
   contraste (RDC 611/2022). A assinatura na tela é simulada: no sistema definitivo, assinatura eletrônica nos termos da
   Lei 14.063/2020 (o termo assinado vai para o prontuário).
   ========================================================================== */
const R28_TC='41001095';
try{if(typeof PROCEDIMENTOS!=='undefined'&&!PROC(R28_TC)){PROCEDIMENTOS.push({c:R28_TC,n:'Tomografia computadorizada com contraste',tipo:'Imagem',dur:30,preco:650,custo:260,sala:'Tomografia',prep:'Jejum de 4 horas'});
 if(typeof EX!=='undefined'&&!EX[R28_TC])EX[R28_TC]={c:R28_TC,n:'Tomografia computadorizada com contraste',s:'imagem tomografia computadorizada com contraste tc '+R28_TC,m:'',p:650,d:0,j:4,u:0,k:260,proc:'Imagem',prep:'Jejum de 4 horas',dur:30}}
 if(typeof PR_CFG!=='undefined')PR_CFG[R28_TC]={grupo:'Imagem',sub:'Tomografia',dep:true,prazo:'72 horas',exige:'questionario',campos:[],perg:[],digital:'tcc'};
 if(typeof RC!=='undefined'&&RC&&RC.agendas){const a=RC.agendas.find(x=>x.id==='ag2');if(a&&!a.procs.includes(R28_TC))a.procs.push(R28_TC)}}catch(e){}
const R28_QD=[
 {s:'Questionário de avaliação clínica'},
 {k:'motivo',q:'1. Motivo do exame: quais os motivos que levaram o paciente a procurar o médico? Qual a suspeita clínica?',t:'txt',ob:true},
 {k:'med1',q:'2. O paciente toma alguma medicação? Qual(is)?',t:'txt'},
 {k:'cir',q:'3. Já foi submetido(a) a alguma cirurgia?',t:'sn',sub:'Qual(is)?',ob:true},
 {k:'tum',q:'4. Já fez tratamento para algum tumor? Qual(is)?',t:'txt'},
 {k:'qrt',q:'5. Já realizou quimioterapia ou radioterapia?',t:'sn',ob:true},
 {k:'alg',q:'6. É alérgico(a) a algum alimento ou medicamento?',t:'sn',sub:'Qual(is)?',ob:true},
 {k:'exa',q:'7. Já realizou exames anteriores da região que será estudada ou ligados ao problema atual?',t:'sn',sub:'Qual(is) exame(s) e quando?',ob:true},
 {k:'ctr',q:'8. Já realizou exames com contraste iodado pela veia?',t:'sn',sub:'Apresentou alguma reação? Qual?',ob:true},
 {k:'iodo',q:'9. Tem alergia a iodo?',t:'sn',ob:true},
 {k:'fum',q:'10. Você é fumante?',t:'sn',sub2:[['fumT','Há quanto tempo?'],['fumQ','Quantos cigarros por dia?']],ob:true},
 {k:'poe',q:'11. Já trabalhou com poeiras inorgânicas (sílica, asbesto, amianto)?',t:'sn',ob:true},
 {k:'cron',q:'12. Apresenta alguma destas condições? (pode marcar mais de uma)',t:'multi',ops:['Asma','Enfisema pulmonar','Diabetes','Hipertensão arterial','Doença do coração','Outras'],sub:'Quais outras?'},
 {k:'med2',q:'13. Você usa algum medicamento?',t:'sn',sub:'Qual(is)?',ob:true},
 {k:'grav',q:'14. Está grávida ou existe suspeita de gravidez?',t:'sn',soF:true,ob:true},
 {k:'amam',q:'15. Está amamentando?',t:'sn',soF:true,ob:true}];
const R28_TERMO='Em alguns casos, é necessário administrar contraste por via oral, retal e/ou endovenosa para tornar o exame mais esclarecedor. Esses produtos contêm iodo em sua fórmula básica, uma substância relativamente segura, que, ao ser administrada, pode provocar desde uma leve sensação de queimação no corpo e um';
let R28_QDE=null;
function r28QdDe(c){if(!NA)return null;NA.r28qd=NA.r28qd||{};return NA.r28qd[c]||(NA.r28qd[c]={r:{},aut:'',cons:false,assP:'',assPor:'',resp:'',assProf:'',em:''})}
function r28QdFalta(c){const D=r28QdDe(c);if(!D)return ['questionário'];const F=(NA.pac&&NA.pac.sx)==='F',f=[];
 R28_QD.forEach(x=>{if(!x.k||!x.ob||(x.soF&&!F))return;if(!String(D.r[x.k]||'').trim())f.push(x.q.split(' ')[0].replace('.',''))});
 if(!D.aut)f.push('autorização do contraste');if(!D.cons)f.push('consentimento');if(!D.assP)f.push('assinatura do paciente');if(!D.assProf)f.push('assinatura do profissional');return f}
function r28QdAbrir(c,prev){R28_QDE={c,prev:!!prev};if(!prev&&!r28QdDe(c))return;r28QdPinta()}
function r28QdPinta(){const E=R28_QDE;if(!E)return;const prev=E.prev,D=prev?(E.D=E.D||{r:{},aut:'',cons:false,assP:'',assProf:''}):r28QdDe(E.c),p=prev?{n:'(nome do paciente)',dn:'',sx:'F'}:(NA.pac||{}),F=p.sx==='F';
 const set=(k,v)=>`r28QdSet('${k}',${v})`;
 const q=x=>{if(x.s)return `<h4>${esc(x.s)}</h4>`;if(x.soF&&!F)return '';const v=D.r[x.k]||'';let h=`<div class="r28-q"><b>${esc(x.q)}${x.ob?' <span class="req">*</span>':''}${x.soF?' <span class="tl">(para mulheres)</span>':''}</b>`;
  if(x.t==='txt')h+=`<textarea class="in" rows="2" style="height:auto" oninput="${set(x.k,'this.value')}">${esc(v)}</textarea>`;
  else if(x.t==='sn')h+=`<div class="r28-op">${['Sim','Não'].map(o=>`<label class="check"><input type="radio" name="r28q_${x.k}" ${v===o?'checked':''} onchange="${set(x.k,`'${o}'`)};r28QdPinta()">${o}</label>`).join('')}</div>`;
  else if(x.t==='multi'){const l=v?String(v).split('|'):[];h+=`<div class="r28-op">${x.ops.map(o=>`<label class="check"><input type="checkbox" ${l.includes(o)?'checked':''} onchange="r28QdMulti('${x.k}','${o}',this.checked)">${o}</label>`).join('')}</div>`}
  if(x.sub&&(v==='Sim'||(x.t==='multi'&&String(v).split('|').includes('Outras'))))h+=`<div class="field r28-sub"><label>${esc(x.sub)}</label><input class="in" value="${esc(D.r[x.k+'_q']||'')}" oninput="${set(x.k+'_q','this.value')}"></div>`;
  if(x.sub2&&v==='Sim')h+=`<div class="formgrid r28-sub">${x.sub2.map(([k,t])=>`<div class="field"><label>${t}</label><input class="in" value="${esc(D.r[k]||'')}" oninput="${set(k,'this.value')}"></div>`).join('')}</div>`;
  return h+'</div>'};
 const idd=p.dn?idade(p.dn)+' anos':'—';
 const html=`${mh('Questionário digital · Tomografia computadorizada com contraste'+(prev?' (prévia)':''))}<div class="mb r28-qd">
 ${prev?'<div class="alert info"><span>Prévia da configuração. No atendimento, o questionário abre com os dados do paciente e as respostas ficam na ficha.</span></div>':''}
 <h4>1. Identificação do paciente</h4><div class="formgrid"><div class="field"><label>Nome completo <span class="req">*</span></label><input class="in r26-ro" readonly value="${esc(p.n||'')}"></div><div class="field"><label>Idade <span class="req">*</span></label><input class="in r26-ro" readonly value="${esc(idd)}"></div><div class="field"><label>Sexo</label><input class="in r26-ro" readonly value="${p.sx==='F'?'Feminino':p.sx==='M'?'Masculino':'Não informado'}"></div><div class="field"><label>Data do preenchimento</label><input class="in r26-ro" readonly value="${dmy(iso(HOJE))}"></div></div>
 ${R28_QD.map(q).join('')}
 <h4>3. Autorização para administração do meio de contraste iodado</h4><div class="r28-termo">${esc(R28_TERMO)} […]<br><small class="tl">O texto chegou cortado na anotação. A clínica cola aqui o texto completo do termo (efeitos possíveis, cuidados e o que fazer em caso de reação).</small></div>
 <div class="r28-op" style="margin-top:8px">${[['autorizo','Autorizo a administração do contraste'],['nao','Não autorizo']].map(([k,t])=>`<label class="check"><input type="radio" name="r28qAut" ${D.aut===k?'checked':''} onchange="R28_QDE&&r28QdCampo('aut','${k}')">${t}</label>`).join('')}</div>
 ${D.aut==='nao'?'<div class="alert warn" style="margin-top:8px"><span>Sem autorização, o exame com contraste não é feito. Avise o médico responsável para decidir o exame sem contraste.</span></div>':''}
 <h4>4. Consentimento para realização do exame</h4><label class="check"><input type="checkbox" ${D.cons?'checked':''} onchange="r28QdCampo('cons',this.checked)">Declaro que as informações acima são verdadeiras, que recebi as orientações sobre o exame e que consinto em realizá-lo.</label>
 <h4>5. Assinaturas</h4><div class="r28-ass"><div><div class="field"><label>Paciente ou responsável</label><input class="in" placeholder="Nome do responsável (se não for o paciente)" value="${esc(D.resp||'')}" oninput="r28QdCampo('resp',this.value,true)"></div><canvas id="r28Cv" width="600" height="160" aria-label="Assine aqui com o dedo ou o mouse"></canvas><div class="row" style="justify-content:space-between;margin-top:4px"><small class="tl">${D.assP?'Assinado em '+esc(D.assPor||''):'Assine com o dedo (tablet) ou o mouse'}</small><button type="button" class="btn sm ghost" onclick="r28QdLimpaAss()">Limpar</button></div></div>
 <div><div class="field"><label>Profissional responsável</label><input class="in r26-ro" readonly value="${esc(D.assProf||'Ainda não assinado')}"></div><button type="button" class="btn sm sec" ${prev?'disabled':''} onclick="r28QdAssProf()">Assinar como profissional</button><p class="tl" style="margin-top:6px">A assinatura fica com o nome, o registro, a data e a hora. No sistema definitivo, com assinatura eletrônica (Lei 14.063/2020).</p></div></div>
 </div><div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button>${prev?'':`<button class="btn sec" onclick="r28QdImprimir()">${I.print} Imprimir</button><button class="btn" onclick="r28QdSalvar()">Salvar questionário</button>`}</div>`;
 if(typeof modalAberto==='function'&&modalAberto()){const m=r28El('modal'),st=m.querySelector('.mb')?m.querySelector('.mb').scrollTop:0;m.innerHTML=html;const mb=m.querySelector('.mb');if(mb)mb.scrollTop=st}else openModal(html,'wide');setTimeout(()=>r28QdCanvas(D,prev),0)}
function r28QdD(){const E=R28_QDE;return E?(E.prev?E.D:r28QdDe(E.c)):null}
function r28QdSet(k,v){const D=r28QdD();if(D)D.r[k]=v}
function r28QdCampo(k,v,sem){const D=r28QdD();if(!D)return;D[k]=v;if(!sem)r28QdPinta()}
function r28QdMulti(k,o,on){const D=r28QdD();if(!D)return;const l=new Set(String(D.r[k]||'').split('|').filter(Boolean));on?l.add(o):l.delete(o);D.r[k]=[...l].join('|');r28QdPinta()}
function r28QdCanvas(D,prev){const cv=r28El('r28Cv');if(!cv||!cv.getContext)return;const g=cv.getContext('2d');if(!g)return;g.lineWidth=2.4;g.lineCap='round';g.strokeStyle='#111';
 if(D.assP){const im=new Image();im.onload=()=>g.drawImage(im,0,0);im.src=D.assP}let des=false;
 const pt=e=>{const r=cv.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return [(t.clientX-r.left)*cv.width/r.width,(t.clientY-r.top)*cv.height/r.height]};
 const ini=e=>{des=true;const [x,y]=pt(e);g.beginPath();g.moveTo(x,y);e.preventDefault()},mov=e=>{if(!des)return;const [x,y]=pt(e);g.lineTo(x,y);g.stroke();e.preventDefault()},fim=()=>{if(!des)return;des=false;D.assP=cv.toDataURL('image/png');D.assPor=r28Agora()};
 cv.addEventListener('mousedown',ini);cv.addEventListener('mousemove',mov);addEventListener('mouseup',fim);cv.addEventListener('touchstart',ini,{passive:false});cv.addEventListener('touchmove',mov,{passive:false});cv.addEventListener('touchend',fim)}
function r28QdLimpaAss(){const D=r28QdD();if(!D)return;D.assP='';D.assPor='';r28QdPinta()}
function r28QdAssProf(){const D=r28QdD();if(!D)return;const n=typeof nomePerfil==='function'?nomePerfil(typeof PERFIL!=='undefined'?PERFIL:''):'Profissional';D.assProf=`${n} · ${r28Agora()}`;r28QdPinta()}
function r28QdSalvar(){const E=R28_QDE;if(!E||E.prev)return;const D=r28QdDe(E.c);D.em=r28Agora();const f=r28QdFalta(E.c);closeModal();try{naRender()}catch(e){}
 toast(f.length?`Questionário salvo, mas ainda falta: ${f.slice(0,4).join(', ')}${f.length>4?'…':''}`:'Questionário completo e assinado: fica na ficha do paciente',f.length?'warn':'ok')}
function r28QdImprimir(){const E=R28_QDE;if(!E)return;const D=r28QdDe(E.c),p=NA.pac||{},F=p.sx==='F';
 const lin=R28_QD.filter(x=>x.k&&!(x.soF&&!F)).map(x=>{const v=D.r[x.k]||'';return `<div class="q"><b>${esc(x.q)}</b><div>${esc(String(v).replace(/\|/g,', '))||'<span class="ln" style="display:inline-block;width:60%"></span>'}${x.sub&&D.r[x.k+'_q']?' · '+esc(D.r[x.k+'_q']):''}${x.sub2&&v==='Sim'?' · '+x.sub2.map(([k,t])=>esc(t)+' '+esc(D.r[k]||'')).join(' · '):''}</div></div>`}).join('');
 r17Print('Questionário · Tomografia com contraste',`<h1>Questionário e autorização · Tomografia computadorizada com contraste</h1><div class="tl">${esc(rcUnidNome(RC.unid))} · ${dmy(iso(HOJE))}</div><h2>Identificação</h2><div>${esc(p.n||'')} · ${p.dn?idade(p.dn)+' anos':''} · ${p.sx==='F'?'Feminino':'Masculino'}</div><h2>Avaliação clínica</h2>${lin}<h2>Autorização do contraste iodado</h2><p>${esc(R28_TERMO)} […]</p><p><b>${D.aut==='autorizo'?'Autorizo':D.aut==='nao'?'Não autorizo':'( ) Autorizo  ( ) Não autorizo'}</b></p><h2>Consentimento</h2><p>${D.cons?'Consentimento dado.':'( ) Consinto em realizar o exame.'}</p><h2>Assinaturas</h2>${D.assP?`<img src="${D.assP}" style="height:70px">`:'<p>______________________________</p>'}<div class="tl">Paciente${D.resp?' / responsável: '+esc(D.resp):''}</div><p style="margin-top:14px">${esc(D.assProf||'Profissional: ______________________________')}</p>`)}
/* No Novo atendimento: cartão próprio quando o pedido tem a tomografia com contraste */
if(typeof r17Quest==='function'){const _q=r17Quest;r17Quest=function(){const h=_q.apply(this,arguments);if(!NA||NA.modo!=='atendimento')return h;const l=(NA.ex||[]).filter(x=>(prCfg(x.c)||{}).digital);if(!l.length)return h;
 return l.map(x=>{const f=r28QdFalta(x.c);return `<div class="card at-card"><div class="row" style="justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><div><h3 style="margin:0">Questionário digital · ${esc(EX[x.c].n)}</h3><div class="sub" style="margin:4px 0 0">Perguntas, autorização do contraste, consentimento e assinaturas numa etapa só.</div></div><span class="badge ${f.length?'warn':'ok'}">${f.length?'Pendente: '+f.length+' item'+(f.length>1?'s':''):'Completo e assinado'}</span><button class="btn ${f.length?'':'sec'}" onclick="r28QdAbrir('${x.c}')">${f.length?'Preencher questionário':'Ver questionário'}</button></div></div>`}).join('')+h}}
/* Triagem e questionários: o modelo digital aparece na configuração do procedimento */
if(typeof prqPinta==='function'){const _p=prqPinta;prqPinta=function(){const r=_p.apply(this,arguments);try{const E=PRQ_ED,m=r28El('modal');if(E&&m){const dig=E.digital!==undefined?E.digital:(prCfg(E.c).digital||'');E.digital=dig;const mb=m.querySelector('.mb');
 if(mb&&!mb.querySelector('.r28-dig'))mb.insertAdjacentHTML('beforeend',`<div class="r28-dig r28-cpf-box" style="border-color:var(--accent);margin-top:12px"><label class="check"><input type="checkbox" ${dig==='tcc'?'checked':''} onchange="PRQ_ED.digital=this.checked?'tcc':'';if(this.checked)PRQ_ED.exige='questionario';prqPinta()"><span><b>Questionário digital completo</b> (modelo da tomografia com contraste): identificação, 15 perguntas com campos que abrem conforme a resposta, autorização do contraste iodado, consentimento e assinaturas.</span></label>${dig==='tcc'?`<button type="button" class="btn sm sec" style="margin-top:8px" onclick="r28QdAbrir('${E.c}',true)">Ver o questionário</button>`:''}</div>`)}}catch(e){}return r}}
if(typeof prqSalvar==='function'){const _s=prqSalvar;prqSalvar=function(){const E=PRQ_ED;if(E&&E.digital==='tcc'&&E.exige==='questionario'&&!E.perg.length){Object.assign(prCfg(E.c),{exige:'questionario',campos:[],perg:[],digital:'tcc'});closeModal();reView();toast('Configuração salva: questionário digital completo');return}
 const r=_s.apply(this,arguments);try{if(E)prCfg(E.c).digital=E.digital||''}catch(e){}return r}}
if(typeof prqEditar==='function'){const _e=prqEditar;prqEditar=function(c){const r=_e.apply(this,arguments);return r}}
/* 819: no cadastro do procedimento, a opção "Este procedimento não tem questionário" */
if(typeof clPrcForm==='function'){const _f=clPrcForm;clPrcForm=function(c){const _om=openModal;openModal=function(h,cl){h=String(h);const g=c?prCfg(c):null,sem=!!(g&&(g.semQuest||(!g.exige&&!(g.perg||[]).length&&!g.digital)));
  h=h.replace('<div id="r17QList" class="r17-qlist">',`<label class="check" style="margin:0 0 6px"><input type="checkbox" id="r28SemQ" ${sem?'checked':''} onchange="r28SemQ(this.checked)"><b>Este procedimento não tem questionário</b></label><div id="r28QWrap" ${sem?'hidden':''}><div id="r17QList" class="r17-qlist">`).replace(/(<button class="btn sm sec" type="button" onclick="r17QAddForm\(\)">[\s\S]*?<\/button><\/div>)/,'$1</div>');
  h=h.replace('<h4 style="margin:14px 0 6px">Convênios em que aparece',r28PrecoProfForm(c)+'<h4 style="margin:14px 0 6px">Convênios em que aparece');
  return _om(h,cl)};try{return _f.apply(this,arguments)}finally{openModal=_om}}}
function r28SemQ(on){const w=r28El('r28QWrap');if(w)w.hidden=on;if(on){document.querySelectorAll('#modal [id^="r17Q_"]').forEach(x=>x.checked=false);const e=r28El('prE');if(e&&e.value==='questionario')e.value=''}}
if(typeof prSalvar==='function'){const _s=prSalvar;prSalvar=function(c){const sem=r28El('r28SemQ'),on=!!(sem&&sem.checked);if(on){document.querySelectorAll('#modal [id^="r17Q_"]').forEach(x=>x.checked=false);const e=r28El('prE');if(e&&e.value==='questionario')e.value=''}
 const cod=c||String((r28El('prC')||{}).value||'').trim(),pp=r28LerPrecoProf();const r=_s.apply(this,arguments);try{if(PROC(cod)){prCfg(cod).semQuest=on;if(on){prCfg(cod).perg=[];if(prCfg(cod).exige==='questionario')prCfg(cod).exige=''}if(pp)R28_PP[cod]=pp}}catch(e){}return r}}

/* ==========================================================================
   798: o valor muda quando se troca o profissional (preço por profissional, no particular)
   Configurável no cadastro do procedimento ("Valor por profissional"). Sem valor próprio, vale o da tabela.
   ========================================================================== */
const R28_PP={'10101012':{p1:180,p3:250,p4:280,p26:200},'10101039':{p3:90},'40901122':{p2:220},'40901467':{p2:180,p3:210},'40901483':{p2:170,p3:190},'40901530':{p2:200,p3:240},'40101010':{p1:90,p4:120}};
const r28PodeAtender=c=>PROFISSIONAIS.filter(p=>p.ativo!==false&&(RC.agendas||[]).some(a=>a.prof===p.id&&a.procs.includes(c)));
function r28PrecoProf(c,prof){const t=R28_PP[c];return t&&t[prof]!=null?+t[prof]:null}
function r28PrecoProfForm(c){if(!c||!PROC(c))return '';const l=r28PodeAtender(c);if(!l.length)return '';const t=R28_PP[c]||{};
 return `<h4 style="margin:14px 0 6px">Valor por profissional (particular) ${info('Quando o valor muda conforme o profissional. Deixe em branco para usar o valor da tabela. No Novo atendimento, ao trocar o médico, o valor muda sozinho.')}</h4><div class="pr-conv">${l.map(p=>`<label class="pr-cv"><span>${esc(p.n)}</span><input class="in" id="r28pp_${p.id}" inputmode="decimal" placeholder="valor da tabela" value="${t[p.id]!=null?r28Moeda(t[p.id]):''}" aria-label="Valor com ${esc(p.n)}"></label>`).join('')}</div>`}
function r28LerPrecoProf(){const l=[...document.querySelectorAll('#modal [id^="r28pp_"]')];if(!l.length)return null;const o={};l.forEach(e=>{const v=String(e.value||'').trim();if(v)o[e.id.slice(6)]=r28Num(v)});return o}
if(typeof r17Calc==='function'){const _c=r17Calc;r17Calc=function(x){try{if(typeof NA!=='undefined'&&NA&&NA.modo==='atendimento'&&x&&x.med&&x.med!==x.ppMed&&r17ConvAtual()==='Particular'&&R28_PP[x.c]){const v=r28PrecoProf(x.c,x.med);x.pb=v!=null?v:r17Preco(x.c,'Particular');x.ppMed=x.med}}catch(e){}return _c.apply(this,arguments)}}
function r28MedSet(i,v){const x=NA.ex[i];if(!x)return;x.med=v;delete NA.err['med'+i];if(!v){naRender();return}const antes=x.p;r17Norm();r17Calc(x);naRender();if(Math.abs(x.p-antes)>0.004)toast(`Valor ajustado para ${fmt(x.p)}: preço de ${(PROF(v)||{n:'profissional'}).n}`)}
if(typeof r17SetConv==='function'){const _s=r17SetConv;r17SetConv=function(){try{(NA.ex||[]).forEach(x=>{delete x.ppMed})}catch(e){}return _s.apply(this,arguments)}}

/* ==========================================================================
   818: agendar direto do orçamento, sem duplicar (um agendamento e um orçamento do mesmo procedimento, ligados)
   ========================================================================== */
const r28AgDoItem=c=>(RC.ag||[]).find(a=>NA&&NA.pac&&a.pac===NA.pac.n&&(a.itens||[]).includes(c)&&!['cancelado','faltou','finalizado','atendido'].includes(String(a.sit||'').toLowerCase())&&a.data>=(typeof RC_HOJE!=='undefined'?RC_HOJE:''));
if(typeof r17Item==='function'){const _i=r17Item;r17Item=function(x,i){let h=String(_i.apply(this,arguments));if(!NA||NA.modo!=='atendimento'||!x)return h;
 h=h.replace(/onchange="NA\.ex\[(\d+)\]\.med=this\.value;delete NA\.err\['med\d+'\]"/,'onchange="r28MedSet($1,this.value)"');
 if(R28_PP[x.c]&&prCfg(x.c).dep)h=h.replace(/(id="naMed\d+"[^>]*>[\s\S]*?<\/select>)/,'$1<small class="tl" style="display:block;margin-top:3px">O valor muda conforme o profissional escolhido.</small>');
 const pede=prCfg(x.c).dep||(NA.tipo==='convenio'&&['Imagem','Procedimento'].includes((EX[x.c]||{}).proc));if(!pede)return h;const ag=r28AgDoItem(x.c);
 const lin=ag?`<div class="r28-agd"><span class="badge ok">Agendado</span><span>${ag.data===RC_HOJE?'Hoje':dmy(ag.data)} às ${esc(ag.h)} · ${esc((PROF(ag.prof)||{n:''}).n)} · <span class="mono">${esc(ag.cod||'')}</span>${ag.orc?' · ligado ao '+esc(ag.orc):''}${ag.autzConv?' · <b>'+esc(ag.autzConv)+'</b>':''}</span><button type="button" class="btn sm ghost" onclick="r28AbrirAgObj('${r28Q(ag.cod||'')}')">Ver agendamento</button></div>`
  :`<div class="r28-agd"><span class="tl">${NA.tipo==='convenio'?'Depende de autorização do convênio e de agendamento.':'Procedimento médico: precisa de agendamento.'}</span><button type="button" class="btn sm sec" onclick="r28AgdModal(${i})">Agendar este procedimento</button></div>`;
 return h.replace(/(<\/div><\/div>\s*<span class="at-price">)/,lin+'$1')}}
let R28_AGD=null;
function r28AgdModal(i){const x=NA.ex[i];if(!x)return;if(!NA.cpf||NA.semCpf||!rcPacCpf(NA.cpf)){toast('Para agendar, o paciente precisa ter cadastro com CPF','warn');return}
 const ags=(RC.agendas||[]).filter(a=>a.procs.includes(x.c)&&(!a.unid||a.unid===RC.unid));if(!ags.length){toast('Nenhuma agenda aberta faz este procedimento. Abra a agenda em Abrir agenda.','warn');return}
 let dia=typeof RC_HOJE!=='undefined'?RC_HOJE:iso(HOJE);R28_AGD={i,c:x.c,ag:x.med&&ags.find(a=>a.prof===x.med)?ags.find(a=>a.prof===x.med).id:ags[0].id,dia,h:''};
 for(let k=0;k<20;k++){if(r28AgdSlots().length)break;R28_AGD.dia=rcSomaDia(R28_AGD.dia,1)}r28AgdPinta()}
function r28AgdSlots(){const A=R28_AGD,a=RC.agendas.find(x=>x.id===A.ag);if(!a)return [];try{if(!rcDiaAberto(a,A.dia))return [];return rcLivres(a,A.dia).filter(h=>rcProcsDoHorario(a,A.dia,h).includes(A.c))}catch(e){return []}}
function r28AgdPinta(){const A=R28_AGD;if(!A)return;const ags=RC.agendas.filter(a=>a.procs.includes(A.c)&&(!a.unid||a.unid===RC.unid)),sl=r28AgdSlots();
 const html=`${mh('Agendar · '+esc(EX[A.c].n))}<div class="mb"><p style="margin:0 0 10px">${esc(NA.pac.n)} · ${esc(r17ConvAtual())}${NA.orcAuto?' · orçamento <span class="mono">'+esc(NA.orcAuto)+'</span>':''}. O agendamento fica ligado a este orçamento: um registro de cada, sem duplicar.</p>
 <div class="formgrid"><div class="field"><label for="r28AgP">Profissional</label><select class="in" id="r28AgP" onchange="R28_AGD.ag=this.value;R28_AGD.h='';r28AgdPinta()">${ags.map(a=>`<option value="${a.id}" ${a.id===A.ag?'selected':''}>${esc((PROF(a.prof)||{n:a.prof}).n)}</option>`).join('')}</select></div><div class="field"><label for="r28AgD">Dia</label><input class="in" type="date" id="r28AgD" value="${A.dia}" min="${RC_HOJE}" onchange="R28_AGD.dia=this.value||RC_HOJE;R28_AGD.h='';r28AgdPinta()"></div></div>
 <h4 style="margin:12px 0 6px">Horários livres</h4>${sl.length?`<div class="r28-slots">${sl.map(h=>`<button type="button" class="btn sm ghost" aria-pressed="${A.h===h}" onclick="R28_AGD.h='${h}';r28AgdPinta()">${h}</button>`).join('')}</div>`:'<p class="tl">Sem horário livre neste dia. Escolha outro dia ou outro profissional.</p>'}
 ${NA.tipo==='convenio'?'<div class="alert info" style="margin-top:10px"><span>Convênio: o agendamento fica como <b>aguardando autorização</b> até a guia ser liberada.</span></div>':''}</div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" ${A.h?'':'disabled'} onclick="r28AgdOk()">Agendar ${A.h?'às '+A.h:''}</button></div>`;
 if(typeof modalAberto==='function'&&modalAberto())r28El('modal').innerHTML=html;else openModal(html)}
function r28AgdOk(){const A=R28_AGD;if(!A||!A.h)return;const x=NA.ex[A.i];try{r17AutoOrc()}catch(e){}
 const r=rcAgendar({agenda:A.ag,data:A.dia,h:A.h,cpf:NA.cpf,proc:A.c,conv:r17ConvAtual()});if(r.erro){toast(r.erro,'warn');return}const ag=r.ok;ag.orc=NA.orcAuto||'';if(NA.tipo==='convenio')ag.autzConv='aguardando autorização do convênio';
 const o=NA.orcAuto&&ORCS.find(y=>y.id===NA.orcAuto);if(o){o.ag=(o.ag||[]).concat(ag.cod);o.ct=o.ct||[];o.ct.push({d:`${dm(iso(HOJE))} ${hhmm(new Date())}`,c:'Balcão',r:`Agendamento ${ag.cod} feito pelo orçamento: ${dmy(A.dia)} às ${A.h}.`,q:typeof USU_ORC!=='undefined'?USU_ORC:'Você'})}
 if(x&&prCfg(A.c).dep&&!x.med){x.med=(RC.agendas.find(a=>a.id===A.ag)||{}).prof||'';r17Norm();r17Calc(x)}closeModal();naRender();toast(`Agendado: ${dmy(A.dia)} às ${A.h} (${ag.cod}), ligado ao orçamento ${ag.orc||''}`)}

/* ==========================================================================
   792: no cartão Paciente, clicar no agendamento leva ao agendamento
   ========================================================================== */
let R28_AGL=[];
function r28AbrirAgObj(cod){const a=(RC.ag||[]).find(x=>x.cod===cod);if(a)r28AbrirAg(a)}
function r28AbrirAg(a){if(typeof a==='number')a=R28_AGL[a];if(!a)return;if(!a.prof){toast('Este agendamento não tem profissional: abra pela agenda','warn');return}
 const d=a.data||RC_HOJE;Object.assign(RC.ca,{prof:a.prof,busca:'prof',esp:'',dia:d,ano:+d.slice(0,4),mes:+d.slice(5,7)-1,modo:'dia',st:''});try{closeModal()}catch(e){}
 const abre=()=>{const l=RC.diaL||[],i=l.findIndex(x=>x&&x.ev&&(((x.ev.src||x.ev).cod&&(x.ev.src||x.ev).cod===a.cod)||(x.ev.pac===a.pac&&x.h===a.h)));if(i>=0)rcDetAbrir(i);else toast(`Agendamento de ${dmy(d)} às ${a.h}: confira na agenda de ${(PROF(a.prof)||{n:''}).n}`)};
 if(r28Hash()==='#agenda'){reView();setTimeout(abre,60)}else{location.hash='#agenda';setTimeout(abre,450)}}

/* ==========================================================================
   NOVO ATENDIMENTO · cartão Paciente
   788 e 789: a aba Dados mostra só os dados do paciente; 790 e 791: a aba Agendamentos só o histórico de agendamentos;
   o pedido (plano, procedimentos, solicitante e questionário) fica só na aba Orçamentos, que já abre ao entrar no passo 2.
   810 e 802: aba Fichas com todas as fichas, cada uma abre e mostra os procedimentos; 812: orçamento abre com os itens.
   ========================================================================== */
let R28_OK=null,R28_NA_FIM=null;const R28_FIC_AB=new Set(),R28_ORC_AB=new Set();
function r28FicTog(p,on){on?R28_FIC_AB.add(p):R28_FIC_AB.delete(p)}
function r28OrcTog(id){R28_ORC_AB.has(id)?R28_ORC_AB.delete(id):R28_ORC_AB.add(id);naRender()}
/* Fichas de exemplo sem data: data e hora de exemplo, para mostrar como fica */
const R28_FIC_DT={};
if(typeof r26FichasDe==='function'){const _f=r26FichasDe;r26FichasDe=function(){const l=_f.apply(this,arguments);l.forEach((f,j)=>{if(!f.data&&f.prot){if(!R28_FIC_DT[f.prot]){const n=Object.keys(R28_FIC_DT).length;R28_FIC_DT[f.prot]={data:typeof RC_HOJE!=='undefined'?RC_HOJE:iso(HOJE),h:`0${7+Math.floor(n/3)}:${String(10+(n*17)%50).padStart(2,'0')}`.slice(-5)}}Object.assign(f,R28_FIC_DT[f.prot])}const s=R26_FICHAS.find(x=>x.prot===f.prot);if(s&&s.acr&&!/acréscimo/.test(f.det||''))f.det=(f.det||'')+' + acréscimo do cartão '+fmt(s.acr)});return l}}
const R28_CHEV='<svg class="i r28-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
function r28FichasLista(l){if(!l.length)return '<p class="tl">Nenhuma ficha ainda: as fichas aparecem aqui quando um procedimento é autorizado, recebido ou faturado.</p>';
 const nomeP=c=>{try{return typeof clProcNome==='function'?clProcNome(c):(EX[c]?EX[c].n:c)}catch(e){return c}};
 return `<div class="r28-lista">${l.map(f=>{const novo=R28_OK&&R28_OK.prot===f.prot,ab=novo||R28_FIC_AB.has(f.prot);const pr=f.itens||[];
  return `<details class="r28-ficha ${novo?'novo':''}" ${ab?'open':''} ontoggle="r28FicTog('${r28Q(f.prot)}',this.open)"><summary><span class="r28-fic-t"><b>Ficha <span class="mono">${esc(f.prot||'—')}</span>${novo?' <span class="badge ok">nova</span>':''}</b><small>Gerada em ${f.data?dmy(f.data):'—'}${f.h?' às '+esc(f.h):''}</small></span><span class="badge ${R26_FST[f.st]||'neutral'}">${esc(f.st)}</span>${f.total!=null?`<b>${fmt(f.total)}</b>`:''}${R28_CHEV}</summary>
  <div class="r28-fic-c">${pr.length?`<table><thead><tr><th>Procedimentos desta ficha (${pr.length})</th><th>Tipo</th></tr></thead><tbody>${pr.map(c=>`<tr><td>${esc(nomeP(c))}</td><td><small class="tl">${esc(EX[c]?(EX[c].proc||'Exame de laboratório'):'')}</small></td></tr>`).join('')}</tbody></table>`:'<p class="tl">Os procedimentos estão na ficha completa.</p>'}
  <p class="tl" style="margin:8px 0 0">Plano: ${esc(f.conv||'Particular')}${f.det?' · '+esc(f.det):''}${f.orig?' · origem: '+esc(f.orig):''}</p>${typeof atFicha==='function'&&typeof ATENDS!=='undefined'&&ATENDS.some(a=>a.p===f.prot)?`<button type="button" class="btn sm ghost" style="margin-top:6px" onclick="atFicha('${r28Q(f.prot)}')">Abrir a ficha completa</button>`:''}</div></details>`}).join('')}</div>`}
function r28OrcItens(o){const nomeP=c=>{try{return EX[c]?EX[c].n:(typeof clProcNome==='function'?clProcNome(c):c)}catch(e){return c}};
 return `<div class="r28-orc-it">${(o.it||[]).map(i=>`<div><span>${esc(nomeP(i.c))}${i.urg?' <b>(urgente)</b>':''}${i.med?` <small class="tl">· ${esc((PROF(i.med)||{n:''}).n)}</small>`:''}</span><b>${fmt(i.p||0)}</b></div>`).join('')||'<span class="tl">Sem itens.</span>'}<div style="border-top:1px solid var(--border);padding-top:4px"><span>Total</span><b>${fmt((o.it||[]).reduce((s,i)=>s+(i.p||0),0))}</b></div>${o.ag&&o.ag.length?`<small class="tl">Agendamento ligado: ${o.ag.map(esc).join(', ')}</small>`:''}</div>`}
if(typeof naPacCard==='function'){const _c=naPacCard;naPacCard=function(){let h=String(_c.apply(this,arguments));if(!h||!NA||!NA.pac||!NA.pac.n)return h;const p=NA.pac,ab=typeof NA_PAC_ABA!=='undefined'?NA_PAC_ABA:'dados';
 const k=h.indexOf('</div>',h.indexOf('<div class="tabs" role="tablist">'));if(k<0)return h;const ci=k+6,cf=h.lastIndexOf('</div>');
 if(ab==='fichas'){const fic=r26FichasDe(p.n,NA.cpf);return h.slice(0,ci)+r28FichasLista(fic)+h.slice(cf)}
 if(ab==='ag'){const ags=typeof r17AgsDe==='function'?r17AgsDe(p):[];R28_AGL=ags;
  return h.slice(0,ci)+(ags.length?`<div class="at-list">${ags.map((a,i)=>`<button type="button" class="at-row r28-ag" onclick="r28AbrirAg(${i})" title="Abrir este agendamento"><div class="grow">${esc((a.itens||[a.proc]).map(c=>clProcNome(c)).join(', '))}<small>${a.data===RC_HOJE?'Hoje':dmy(a.data)} às ${esc(a.h)} · ${esc((PROF(a.prof)||{n:'Sem profissional'}).n)} · ${esc(a.conv||'Particular')}${a.cod?' · '+esc(a.cod):''}</small></div>${r17AgSt(a.sit)}<span class="r28-ir">Abrir ›</span></button>`).join('')}</div>`:'<p class="tl">Nenhum agendamento.</p>')+h.slice(cf)}
 if(ab==='orc'){const corpo=h.slice(ci,cf).replace(/<div class="grow">(\s*<span class="mono">(ORC-[\w-]+)<\/span>[\s\S]*?<\/small>)/g,(m,a,id)=>{const o=ORCS.find(x=>x.id===id),on=R28_ORC_AB.has(id);return `<div class="grow r28-orc-g" role="button" tabindex="0" aria-expanded="${on}" title="${on?'Fechar':'Ver os procedimentos do orçamento'}" onclick="r28OrcTog('${id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();r28OrcTog('${id}')}">${a} <small class="tl">${on?'▲ fechar':'▼ ver procedimentos'}</small>${on&&o?r28OrcItens(o):''}`});return h.slice(0,ci)+corpo+h.slice(cf)}
 return h}}
/* Passo 2: só a aba Orçamentos mostra o pedido */
if(typeof naP2==='function'){const _p=naP2;naP2=function(){const h=_p.apply(this,arguments);if(!NA||NA.modo!=='atendimento'||!NA.pac||!NA.pac.n)return h;if((typeof NA_PAC_ABA!=='undefined'?NA_PAC_ABA:'dados')==='orc')return h;
 const ok=R28_OK?r28OkCard():'';
 return ok+naPacCard()+`<div class="card at-card r28-dica"><p>O pedido (plano, procedimentos, solicitante e questionário) fica na aba <b>Orçamentos</b>.</p><button class="btn sec" onclick="NA_PAC_ABA='orc';naRender()">Ir para Orçamentos e montar o pedido</button></div><div class="at-end"><a class="btn ghost" href="#pacientes">Voltar</a></div>`}}
function r28AbaOrc(){if(typeof NA_PAC_ABA!=='undefined')NA_PAC_ABA='orc'}
if(typeof naP1Ok==='function'){const _o=naP1Ok;naP1Ok=function(){const a=NA&&NA.passo;const r=_o.apply(this,arguments);if(NA&&NA.modo==='atendimento'&&a===1&&NA.passo===2&&NA_PAC_ABA!=='orc'){r28AbaOrc();try{naRender()}catch(e){}}return r}}
if(typeof naNovo==='function'){const _n=naNovo;naNovo=function(){R28_OK=null;const r=_n.apply(this,arguments);if(NA&&NA.modo==='atendimento'&&NA.passo===2){r28AbaOrc();if(r28Hash()==='#novo-atendimento')try{naRender()}catch(e){}}return r}}
/* 809: a tela inteira ganha a classe do novo visual; 811: sem Dr. Deo */
if(typeof naView==='function'){const _v=naView;naView=function(){const h=_v.apply(this,arguments);return NA&&NA.modo==='atendimento'?`<div class="na28">${h}</div>`:h}}

/* ==========================================================================
   799 e 820: no fim do passo 2, "Salvar orçamento" e "Autorizar e faturar" (que leva direto ao faturamento)
   ========================================================================== */
function r28SalvarOrc(){if(!NA||!NA.ex.length){toast('Inclua pelo menos um procedimento','warn');return}NA.orcSig='';r17AutoOrc();const o=ORCS.find(x=>x.id===NA.orcAuto);if(o){o.salvo=r28Agora();o.ct=o.ct||[];o.ct.push({d:`${dm(iso(HOJE))} ${hhmm(new Date())}`,c:'Balcão',r:'Orçamento salvo.',q:typeof USU_ORC!=='undefined'?USU_ORC:'Você'})}
 naRender();toast(`Orçamento ${NA.orcAuto||''} salvo às ${hhmm(new Date())}: fica na aba Orçamentos do paciente e em Orçamentos`)}
function r28AutorizarFaturar(){r17Autorizar();if(NA&&NA.autz&&NA.passo===2){naP2Ok();if(NA.passo===3)toast(`Orçamento autorizado: ficha ${NA.ficha}. Agora é o faturamento.`)}}
if(typeof r17Fim==='function'){const _f=r17Fim;r17Fim=function(){if(!NA||NA.modo!=='atendimento'||NA.autz)return _f.apply(this,arguments);
 return `<div class="at-end"><button class="btn ghost" onclick="NA.passo=1;naRender(true)">Voltar</button>${NA.ex.length?`<button class="btn sec" onclick="r17ImprimirDoc('orc')">${I.print||''} Imprimir orçamento</button>`:''}<button class="btn sec" onclick="r28SalvarOrc()" ${NA.ex.length?'':'disabled'}>Salvar orçamento</button><button class="btn" onclick="r28AutorizarFaturar()" ${NA.ex.length?'':'disabled'}>Autorizar e faturar</button></div>`}}

/* ==========================================================================
   800 e 803: acréscimo (%) no cartão de crédito; 821 e 822: "Totalmente faturado" e nada além do valor final
   O acréscimo pelo meio de pagamento é permitido, desde que informado ao paciente antes (Lei 13.455/2017 e CDC, art. 6º, III).
   Ele entra no valor final, no comprovante e na nota fiscal.
   ========================================================================== */
if(typeof r26PagCalc==='function'){const _c=r26PagCalc;r26PagCalc=function(S){const c=_c.apply(this,arguments);let acr=0;(S.pags||[]).forEach(p=>{if(p.f==='Cartão de crédito'){const a=r28Num(p.acr);if(a>0)acr+=Math.round(r28Num(p.v)*a)/100}});c.acr=Math.round(acr*100)/100;c.finT=Math.round((c.fin+c.acr)*100)/100;return c}}
if(typeof r26PagHtml==='function'){const _h=r26PagHtml;r26PagHtml=function(k){let h=String(_h.apply(this,arguments));const S=R26P[k];if(!S)return h;const c=r26PagCalc(S),tf=Math.abs(c.dif)<0.005&&c.fin>0;
 h=h.replace(/(<div class="r26-pg-l">)(<div class="field"><label for="r26f_[^_]+_(\d+)">[\s\S]*?)(<div class="field"><label for="r26p_[^"]+">Parcelas<\/label>[\s\S]*?<\/select><\/div>)/g,(m,a,b,i,par)=>{const p=S.pags[+i]||{},v=r28Num(p.v),ac=r28Num(p.acr),fee=Math.round(v*ac)/100;
  return `<div class="r26-pg-l r28-cred">${b}${par}<div class="field"><label for="r28a_${k}_${i}">Acréscimo (%) ${info('Taxa do cartão de crédito, em porcentagem, somada ao valor desta forma. Avise o paciente antes de cobrar. Nas outras formas não há acréscimo.')}</label><input class="in" id="r28a_${k}_${i}" inputmode="decimal" placeholder="0" value="${esc(p.acr||'')}" onchange="r28Acr('${k}',${i},this.value)">${ac>0?`<span class="r28-acr-m">+ ${fmt(fee)} · cobrar ${fmt(v+fee)} no cartão</span>`:''}</div>`});
 if(c.acr>0)h=h.replace(/<span>Valor final <b>[^<]*<\/b><\/span><span>Recebido <b>[^<]*<\/b><\/span>/,`<span>Valor dos procedimentos <b>${fmt(c.fin)}</b></span><span>Acréscimo do cartão <b>+ ${fmt(c.acr)}</b></span><span>Valor final a faturar <b>${fmt(c.finT)}</b></span><span>Recebido <b>${fmt(c.pago+c.acr)}</b></span>`);
 if(tf){h=h.replace('<span class="ok">✓ Sem diferença</span>','<span class="r28-tf">✓ Totalmente faturado</span>').replace(new RegExp(`<button type="button" class="btn sm sec" onclick="r26PagAdd\\('${k}'\\)">`),`<button type="button" class="btn sm sec" disabled title="Totalmente faturado: não há valor a cobrar" onclick="r26PagAdd('${k}')">`)}
 if(c.acr>0)h=h.replace('<div class="r26-pag-res"','<p class="tl" style="margin:0">Acréscimo do cartão: avise o paciente antes de cobrar. Ele entra no comprovante e na nota fiscal.</p><div class="r26-pag-res"');return h}}
function r28Acr(k,i,v){const S=R26P[k];if(!S||!S.pags[i])return;let a=r28Num(v);if(a<0)a=0;if(a>30){toast('O acréscimo vai até 30%','warn');a=30}S.pags[i].acr=a?String(a).replace('.',','):'';r26PagPinta(k)}
if(typeof r26PagAdd==='function'){const _a=r26PagAdd;r26PagAdd=function(k){const S=R26P[k];if(S){const c=r26PagCalc(S);if(c.dif<=0.004&&c.fin>0){toast('Totalmente faturado: não há mais valor a cobrar do paciente','warn');return}}return _a.apply(this,arguments)}}
if(typeof r26PagSetP==='function'){const _s=r26PagSetP;r26PagSetP=function(k,i,f,v){const S=R26P[k];if(S&&f==='v'&&S.pags[i]&&S.pags[i].f!=='Dinheiro'){const c=r26PagCalc(S),out=S.pags.reduce((s,p,j)=>j===i?s:s+r28Num(p.v),0),max=Math.round((c.fin-out)*100)/100,nv=r28Num(v);
  if(nv>max+0.004&&!S.pags.some(p=>p.f==='Dinheiro')){toast(max>0?`Passa do valor final: o máximo nesta forma é ${fmt(max)} (troco só no dinheiro)`:'Totalmente faturado: não dá para cobrar além do valor final','warn');v=r28Moeda(Math.max(0,max))}}
 if(S&&f==='f'&&v!=='Cartão de crédito'&&S.pags[i])S.pags[i].acr='';return _s.call(this,k,i,f,v)}}
if(typeof r26FatOk==='function'){const _f=r26FatOk;r26FatOk=function(){const S=R26P.fat,c=S?r26PagCalc(S):null,n=R26_FAT.length;const r=_f.apply(this,arguments);try{if(c&&c.acr>0&&R26_FAT.length>n){const x=R26_FAT[R26_FAT.length-1];x.acr=c.acr;x.fin=c.finT}}catch(e){}return r}}

/* ==========================================================================
   805, 799 e 804: depois de faturar, o sistema volta sozinho para o cadastro do paciente (passo 2), na aba Fichas,
   com a ficha nova aberta; "Novo atendimento" não pede o CPF de novo. 823: sem o texto "Protocolo… vai para a fila".
   ========================================================================== */
function r28OkCard(){const o=R28_OK;if(!o)return '';return `<div class="card at-card"><div class="r28-ok">${typeof FIG==='function'?FIG('ok','fig-sm'):''}<div class="grow"><h3>Atendimento concluído</h3><p class="tl" style="margin:4px 0 0">A ficha <b class="mono">${esc(o.prot)}</b> está aberta na aba Fichas.</p></div><div class="row" style="gap:6px;flex-wrap:wrap">${typeof docComprovante==='function'?`<button class="btn sec" onclick="r28Doc('docComprovante')">${I.print} Comprovante</button>`:''}${typeof docDeclaracao==='function'?`<button class="btn sec" onclick="r28Doc('docDeclaracao')">${I.doc} Declaração</button>`:''}<button class="btn ghost" onclick="R28_OK=null;naRender()">Fechar aviso</button></div></div></div>`}
function r28Doc(fn){const cur=NA;if(R28_NA_FIM)NA=R28_NA_FIM;try{window[fn]()}finally{NA=cur}}
if(typeof naConcluir==='function'){const _c=naConcluir;naConcluir=function(){const acr=NA&&NA.r26pag&&NA.tipo!=='convenio'?(r26PagCalc(NA.r26pag).acr||0):0,ant=NA;const r=_c.apply(this,arguments);
 try{const N=ant;if(N&&N.fim&&N.fim.tipo==='at'&&!N.fim.r28){N.fim.r28=true;const prot=N.fim.prot;if(acr>0){const f=R26_FICHAS.find(x=>x.prot===prot);if(f){f.total=Math.round((f.total+acr)*100)/100;f.acr=acr}}
  const cpf=N.semCpf?'':N.cpf;if(cpf&&rcPacCpf(cpf)){R28_NA_FIM=N;naNovo('atendimento',cpf,false,true);if(NA&&NA.passo===2){NA_PAC_ABA='fichas';R28_OK={prot};R28_FIC_AB.add(prot);if(r28Hash()==='#novo-atendimento')naRender()}}}}catch(e){}return r}}
if(typeof VIEWS['fichas-paciente']==='function'){const _v=VIEWS['fichas-paciente'];VIEWS['fichas-paciente']=function(){let h=String(_v.apply(this,arguments));const F=typeof R26_FP!=='undefined'?R26_FP:{};
 h=h.replace(/<p style="margin:4px 0 0">Protocolo <b class="mono">[\s\S]*?<\/p>/,'');
 const p=F.cpf?PACIENTES.find(x=>x.cpf===F.cpf):PACIENTES.find(x=>semAc(x.n)===semAc(F.n||''));if(p&&p.cpf)h=h.replace(/onclick="naNovo\('atendimento'\)"/g,`onclick="naNovo('atendimento','${r28Q(p.cpf)}',false,true)"`);
 const fb=r28FidBadges(p);if(fb)h=h.replace(/(<div class="card at-card"><div class="row" style="justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">Histórico de fichas<\/h3>)/,`<p style="margin:0 0 12px">${fb}</p>$1`);
 return h}}
if(typeof naFim==='function'){const _f=naFim;naFim=function(){let h=String(_f.apply(this,arguments));try{if(NA&&NA.fim&&NA.cpf&&!NA.semCpf)h=h.replace(/onclick="naNovo\('atendimento'\)"/g,`onclick="naNovo('atendimento','${r28Q(NA.cpf)}',false,true)"`)}catch(e){}return h}}

/* ==========================================================================
   813, 814 e 815: Currículo Médico (novo currículo, editar os dados do profissional, abas centralizadas)
   Sem RQE, o profissional não é apresentado como especialista (Resolução CFM 2.336/2023).
   ========================================================================== */
if(typeof VIEWS['curriculo-medico']==='function'){const _v=VIEWS['curriculo-medico'];VIEWS['curriculo-medico']=function(){const h=String(_v.apply(this,arguments));const pode=typeof rcCurPode==='function'&&rcCurPode();
 const b=`<button class="btn" ${pode?'':'disabled title="Só a gestão ou a administração cria currículos"'} onclick="r28CurNovo()">${I.plus} Novo currículo</button>`;return h.includes('<div class="tools"></div>')?h.replace('<div class="tools"></div>',`<div class="tools">${b}</div>`):h.replace(/(<\/div>)(<\/div>)/,`$1<div class="tools">${b}</div>$2`)}}
function r28CurForm(p){const cats=typeof AG18_CUR_CAT!=='undefined'?AG18_CUR_CAT.filter(c=>c[0]):[];const m=/^([A-Z]+)-?([A-Z]{2})?\s*([\d.]+)?/.exec((p&&p.cons)||'')||[];
 return `<div class="formgrid"><div class="field" style="grid-column:1/-1"><label for="r28CuN">Nome completo <span class="req">*</span></label><input class="in" id="r28CuN" value="${esc(p?p.n:'')}" placeholder="Ex.: Dra. Maria da Silva"></div>
 <div class="field"><label for="r28CuE">Especialidade ou área <span class="req">*</span></label><input class="in" id="r28CuE" value="${esc(p?p.esp:'')}" placeholder="Ex.: Dermatologia"></div>
 <div class="field"><label for="r28CuC">Conselho</label><select class="in" id="r28CuC">${['CRM','COREN','CRF','CRBM','CRN','CREFITO','CRP','CRO'].map(c=>`<option ${m[1]===c?'selected':''}>${c}</option>`).join('')}</select></div>
 <div class="field"><label for="r28CuU">UF</label><input class="in" id="r28CuU" maxlength="2" value="${esc(m[2]||'CE')}"></div><div class="field"><label for="r28CuR">Número do registro <span class="req">*</span></label><input class="in" id="r28CuR" inputmode="numeric" value="${esc(m[3]||'')}"></div></div>
 <small class="tl">Só apresente como especialista quem tem RQE (Resolução CFM 2.336/2023). O RQE fica no perfil.</small>`}
function r28CurLer(){const v=id=>String((r28El(id)||{}).value||'').trim();const n=v('r28CuN'),e=v('r28CuE'),c=v('r28CuC'),u=v('r28CuU').toUpperCase(),r=soDig(v('r28CuR'));if(!n){toast('Informe o nome','warn');return null}if(!e){toast('Informe a especialidade ou a área','warn');return null}if(!r){toast('Informe o número do registro no conselho','warn');return null}return {n,esp:e,cons:`${c}-${u} ${r}`}}
function r28CurNovo(){if(typeof rcCurPode==='function'&&!rcCurPode()){toast('Só a gestão ou a administração cria currículos','warn');return}openModal(`${mh('Novo currículo')}<div class="mb">${r28CurForm(null)}</div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="r28CurNovoOk()">Criar e abrir o perfil</button></div>`)}
function r28CurNovoOk(){const d=r28CurLer();if(!d)return;if(PROFISSIONAIS.some(p=>semAc(p.n)===semAc(d.n))){toast('Já existe currículo com este nome','warn');return}const id='p28'+(PROFISSIONAIS.length+1);const ini=d.n.replace(/^(dra?|enf|sr|sra)\.?\s+/i,'').split(/\s+/).map(s=>s[0]).slice(0,2).join('').toUpperCase();
 PROFISSIONAIS.push({id,n:d.n,ini,cons:d.cons,esp:d.esp,unids:[RC.unid],ativo:true,cor:'#3A8F86'});closeModal();toast('Currículo criado: preencha as informações do atendimento');ag18CurAbrir(id)}
function r28CurEditar(){const p=PROF(AG18_CUR_ID);if(!p)return;if(typeof rcCurPode==='function'&&!rcCurPode()){toast('Seu perfil só consulta o currículo','warn');return}openModal(`${mh('Editar dados do profissional')}<div class="mb">${r28CurForm(p)}</div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="r28CurEditarOk()">Salvar</button></div>`)}
function r28CurEditarOk(){const p=PROF(AG18_CUR_ID),d=r28CurLer();if(!p||!d)return;Object.assign(p,d);try{ag18CurSalvo(ag18CurDados(p.id))}catch(e){}closeModal();reView();toast('Dados do profissional atualizados')}
if(typeof VIEWS['curriculo-perfil']==='function'){const _v=VIEWS['curriculo-perfil'];VIEWS['curriculo-perfil']=function(){const h=String(_v.apply(this,arguments)),pode=typeof rcCurPode==='function'&&rcCurPode();
 return h.replace(/(<div class="ag18-cp-reg">)/,pode?`<button type="button" class="btn sm sec" style="margin:6px 0" onclick="r28CurEditar()">${I.edit} Editar dados do profissional</button>$1`:'$1')}}

/* ==========================================================================
   816: WhatsApp da agenda com modelos de mensagem (confirmação, mudança de horário, desmarcar, remarcar), editáveis
   A mensagem não cita exame nem procedimento (LGPD, art. 6º, III: só o necessário).
   ========================================================================== */
const R28_WA_TPL=[
 ['conf','Confirmação de atendimento','Olá, {paciente}! Aqui é da DeoVita Clínicas. Podemos confirmar o seu atendimento no dia {data}, às {hora}, com {profissional}, na {unidade}? Responda SIM para confirmar.'],
 ['hora','Mudança de horário','Olá, {paciente}! Aqui é da DeoVita Clínicas. Precisamos mudar o horário do seu atendimento do dia {data}: de {hora} para {novo_horario}, com {profissional}. Fica bom para você?'],
 ['desm','Desmarcar atendimento','Olá, {paciente}! Aqui é da DeoVita Clínicas. O seu atendimento do dia {data}, às {hora}, com {profissional}, foi desmarcado. Se quiser, marcamos uma nova data.'],
 ['rem','Remarcar para outra data','Olá, {paciente}! Aqui é da DeoVita Clínicas. Precisamos remarcar o seu atendimento do dia {data}, às {hora}. Temos o dia {nova_data}, às {novo_horario}, com {profissional}. Podemos confirmar?']];
let R28_WA=null;
function r28WaPreenche(t){const W=R28_WA,P=s=>s?String(s).toLowerCase().replace(/(^|\s)\S/g,c=>c.toUpperCase()):'';return t.replace(/\{paciente\}/g,P(String(W.pac||'').split(' ')[0])).replace(/\{data\}/g,W.data).replace(/\{hora\}/g,W.h).replace(/\{profissional\}/g,W.prof).replace(/\{unidade\}/g,W.unid).replace(/\{nova_data\}/g,W.nd?dmy(W.nd):'(nova data)').replace(/\{novo_horario\}/g,W.nh||'(novo horário)')}
function rcDiaWhats(i){const x=RC.diaL&&RC.diaL[i];if(!x||!x.ev)return;const src=x.ev.src||x.ev,cpf=x.ev.cpf||src.cpf||'',p=(cpf&&PACIENTES.find(y=>y.cpf===cpf))||PACIENTES.find(y=>y.n===x.ev.pac)||{},t=(typeof rcVjCampoWa==='function'?p[rcVjCampoWa(p)]:'')||p.tel||'';
 if(soDig(t).length<10){toast('Paciente sem telefone válido no cadastro','warn');return}
 const P=s=>String(s||'').toLowerCase().replace(/(^|\s)\S/g,c=>c.toUpperCase());R28_WA={i,tel:t,pac:x.ev.pac,data:rcDiaBr(RC.ca.dia),h:x.h,prof:P((PROF(RC.ca.prof)||{n:''}).n).replace(/^Dra?\b/,m=>m),unid:typeof rcUnidNome==='function'?rcUnidNome(RC.unid):'unidade',tp:'conf',nd:'',nh:'',txt:''};R28_WA.txt=r28WaPreenche(R28_WA_TPL[0][2]);r28WaPinta()}
function r28WaTp(k){const W=R28_WA;if(!W)return;W.tp=k;W.txt=r28WaPreenche(R28_WA_TPL.find(x=>x[0]===k)[2]);r28WaPinta()}
function r28WaCampo(f,v){const W=R28_WA;if(!W)return;W[f]=v;W.txt=r28WaPreenche(R28_WA_TPL.find(x=>x[0]===W.tp)[2]);const ta=r28El('r28WaT');if(ta)ta.value=W.txt}
function r28WaPinta(){const W=R28_WA;const html=`${mh('Mensagem pelo WhatsApp · '+esc(W.pac))}<div class="mb"><div class="field"><label>Padrão da mensagem</label><div class="row" style="gap:6px;flex-wrap:wrap">${R28_WA_TPL.map(([k,t])=>chip(t,W.tp===k,`r28WaTp('${k}')`)).join('')}</div></div>
 ${W.tp==='hora'||W.tp==='rem'?`<div class="formgrid">${W.tp==='rem'?`<div class="field"><label for="r28WaD">Nova data</label><input class="in" type="date" id="r28WaD" value="${W.nd}" min="${RC_HOJE}" onchange="r28WaCampo('nd',this.value)"></div>`:''}<div class="field"><label for="r28WaH">Novo horário</label><input class="in" type="time" id="r28WaH" value="${W.nh}" onchange="r28WaCampo('nh',this.value)"></div></div><p class="tl" style="margin:0">A mensagem só avisa o paciente. Para mudar de fato, use Reagendar nos detalhes do agendamento.</p>`:''}
 <div class="field"><label for="r28WaT">Mensagem (dá para editar antes de enviar)</label><textarea class="in" id="r28WaT" rows="5" style="height:auto" oninput="R28_WA.txt=this.value">${esc(W.txt)}</textarea><small class="tl">Para ${esc(W.tel)}. A mensagem não cita exame nem procedimento (LGPD).</small></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="r28WaEnviar()">Abrir no WhatsApp</button></div>`;if(typeof modalAberto==='function'&&modalAberto())r28El('modal').innerHTML=html;else openModal(html)}
function r28WaEnviar(){const W=R28_WA;if(!W)return;const m=String(W.txt||'').trim();if(!m){toast('Escreva a mensagem','warn');return}if(/\((nova data|novo horário)\)/.test(m)){toast('Preencha a nova data e o novo horário','warn');return}
 const url=typeof rc20WaLink==='function'?rc20WaLink(W.tel,m):'';if(!url){toast('Telefone inválido','warn');return}const x=RC.diaL[W.i];try{rcHist(x.ev,'agenda','Contato pelo WhatsApp',`${x.h} · ${(R28_WA_TPL.find(t=>t[0]===W.tp)||['',''])[1]}`,(PROF(RC.ca.prof)||{n:''}).n)}catch(e){}
 try{window.open(url,'_blank','noopener')}catch(e){}closeModal();toast('Conversa aberta no WhatsApp com a mensagem pronta')}

/* ==========================================================================
   TAREFAS · 774 (restaurar coluna com as tarefas), 775 (excluir coluna), 781 (ver por etiqueta),
   782 (coluna que exige avaliação), 783 (tarefa recorrente) e 784 (tarefas automáticas, como lembrete)
   ========================================================================== */
if(typeof tqColArq==='function'){const _a=tqColArq;tqColArq=function(cid){const u=tqEu(),U=tqU(u),l=tqDaColuna(u,cid).map(t=>t.id),c=U.cols.find(x=>x.id===cid);const r=_a.apply(this,arguments);if(c&&c.arq){c.arqTar=l;tqSalvar()}return r}}
function tqColRest(cid){const U=tqU(tqEu()),c=U.cols.find(x=>x.id===cid);if(!c)return;const l=(c.arqTar||[]).filter(id=>{const t=tqT(id);return t&&tqEnv(t,tqEu())});
 if(!l.length){c.arq=false;tqMudou();tqColArqDlg();toast('Coluna restaurada');return}
 openModal(`${mh('Restaurar a coluna "'+tqH(c.n)+'"')}<div class="mb"><p style="margin:0 0 8px">Quando foi arquivada, ela tinha ${l.length} tarefa${l.length>1?'s':''}:</p><ul style="margin:0 0 8px 18px">${l.map(id=>`<li>${tqH(tqT(id).titulo)}</li>`).join('')}</ul><p class="tl" style="margin:0">Quer trazer essas tarefas de volta para a coluna?</p></div><div class="mf"><button class="btn ghost" onclick="tqColArqDlg()">Cancelar</button><button class="btn sec" onclick="r28ColRestOk('${cid}',false)">Restaurar só a coluna</button><button class="btn" onclick="r28ColRestOk('${cid}',true)">Restaurar com as tarefas</button></div>`)}
function r28ColRestOk(cid,com){const u=tqEu(),U=tqU(u),c=U.cols.find(x=>x.id===cid);if(!c)return;c.arq=false;let n=0;if(com){(c.arqTar||[]).forEach(id=>{const t=tqT(id);if(t&&tqEnv(t,u)){U.pos[id]={c:cid,o:n++}}})}c.arqTar=[];closeModal();tqMudou();toast(com?`Coluna restaurada com ${n} tarefa${n!==1?'s':''}`:'Coluna restaurada, sem as tarefas')}
function r28ColExcluir(cid){const u=tqEu(),U=tqU(u),c=U.cols.find(x=>x.id===cid);if(!c)return;const cs=tqCols(u);if(!c.arq&&cs.length<=1){toast('Deixe pelo menos uma coluna','warn');return}const l=c.arq?[]:tqDaColuna(u,cid),dest=cs.find(x=>x.id!==cid);
 openModal(`${mh('Excluir a coluna "'+tqH(c.n)+'"')}<div class="mb"><p style="margin:0">A coluna sai do seu quadro de vez.${l.length?` As ${l.length} tarefa${l.length>1?'s':''} dela não são apagadas: vão para "${tqH(dest.n)}".`:''} Não dá para desfazer.</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn danger" onclick="r28ColExcluirOk('${cid}')">Excluir coluna</button></div>`)}
function r28ColExcluirOk(cid){const u=tqEu(),U=tqU(u),c=U.cols.find(x=>x.id===cid);if(!c)return;const cs=tqCols(u).filter(x=>x.id!==cid),dest=cs[0];if(!c.arq&&dest){const base=tqDaColuna(u,dest.id).length;tqDaColuna(u,cid).forEach((t,i)=>U.pos[t.id]={c:dest.id,o:base+i})}
 U.cols=U.cols.filter(x=>x.id!==cid);closeModal();tqMudou();toast(`Coluna "${tqH(c.n)}" excluída`)}
if(typeof tqColMenu==='function'){const _m=tqColMenu;tqColMenu=function(cid){const _om=openModal;openModal=function(h,cl){const U=tqU(tqEu()),c=U.cols.find(x=>x.id===cid)||{},perm=[tqEu(),...tqPermitidos(tqEu()).map(o=>o.id)];
  h=String(h).replace(/(<p class="tl" style="margin:0">As colunas são só suas)/,`<div class="tq-pick" style="border:0;padding:0"><label style="flex-direction:row"><input type="checkbox" id="r28ColAv" ${c.aval?'checked':''} onchange="r28ColAval('${cid}',this.checked)"> <span>Só entra nesta coluna depois da avaliação de um responsável<br><small>Quem move pede a avaliação; a tarefa fica "Aguardando avaliação" até o responsável aprovar.</small></span></label>${c.aval?`<div class="field" style="margin:6px 0 0"><label for="r28ColAvP">Responsável pela avaliação</label><select class="in" id="r28ColAvP" onchange="r28ColAval('${cid}',true,this.value)">${perm.map(i=>`<option value="${i}" ${c.aval===i?'selected':''}>${tqH(tqNome(i))}${i===tqEu()?' (eu)':''}</option>`).join('')}</select></div>`:''}</div>$1`)
   .replace(/(<div class="mf">)(<button class="btn danger sec"[^>]*onclick="tqColArq\('[^']+'\)">Arquivar coluna<\/button>)/,`$1<button class="btn danger" onclick="r28ColExcluir('${cid}')">Excluir coluna</button>$2`);return _om(h,cl)};try{return _m.apply(this,arguments)}finally{openModal=_om}}}
if(typeof tqColArqDlg==='function'){const _d=tqColArqDlg;tqColArqDlg=function(){const _om=openModal;openModal=function(h,cl){return _om(String(h).replace(/(<button class="btn sm sec" onclick="tqColRest\('([^']+)'\)">Restaurar<\/button>)/g,`$1<button class="btn sm ghost danger" onclick="r28ColExcluir('$2')">Excluir</button>`),cl)};try{return _d.apply(this,arguments)}finally{openModal=_om}}}
function r28ColAval(cid,on,quem){const U=tqU(tqEu()),c=U.cols.find(x=>x.id===cid);if(!c)return;c.aval=on?(quem||c.aval||tqEu()):'';tqMudou();tqColMenu(cid);toast(on?`Para entrar em "${tqH(c.n)}", a tarefa passa pela avaliação de ${tqPrim(c.aval)}`:'A coluna não exige mais avaliação')}
/* 782: mover para coluna com avaliação pede aprovação */
if(typeof tqMover==='function'){const _mv=tqMover;tqMover=function(tid,c,idx,silencio){const u=tqEu(),U=tqU(u),col=U.cols.find(x=>x.id===c),t=tqT(tid),de=(U.pos[tid]||{}).c;
 if(t&&col&&col.aval&&col.aval!==u&&de!==c&&!(t.aval&&t.aval.ok&&t.aval.col===c)){t.aval={col:c,colN:col.n,por:u,resp:col.aval,em:new Date().toISOString()};tqLog(t,u,`Pediu avaliação de ${tqNome(col.aval)} para passar para "${col.n}"`);tqAvisar(col.aval,'aval',t.id,`${tqNome(u)} pediu sua avaliação para passar a tarefa para "${col.n}"`,u);tqMudou();toast(`Pedido de avaliação enviado a ${tqPrim(col.aval)}. A tarefa fica "Aguardando avaliação".`,'warn');return}
 const r=_mv.apply(this,arguments);if(t&&t.aval&&t.aval.col===c&&t.aval.ok)t.aval=null;return r}}
try{if(typeof TQ_AV_TIPO!=='undefined'){TQ_AV_TIPO.aval='Pedido de avaliação';TQ_AV_TIPO.avalOk='Avaliação respondida';TQ_AV_TIPO.auto='Tarefa automática'}}catch(e){}
function r28AvalResp(tid,ok){const u=tqEu(),t=tqT(tid);if(!t||!t.aval||t.aval.resp!==u)return;const A=t.aval,Up=tqU(A.por);
 if(ok){tqLog(t,u,`Aprovou a passagem para "${A.colN}"`);const n=tqDaColuna(A.por,A.col).length;Up.pos[t.id]={c:A.col,o:n};const col=Up.cols.find(x=>x.id===A.col);if(col&&col.conclui&&t.lider===A.por&&!t.concl)tqConcluirSem(t,A.por);tqAvisar(A.por,'avalOk',t.id,`${tqNome(u)} aprovou: a tarefa passou para "${A.colN}"`,u);t.aval=null}
 else{tqLog(t,u,`Devolveu: não aprovou a passagem para "${A.colN}"`);tqAvisar(A.por,'avalOk',t.id,`${tqNome(u)} devolveu a tarefa: não aprovou a passagem para "${A.colN}"`,u);t.aval=null}
 tqMudou();toast(ok?'Aprovado: a tarefa passou de coluna':'Tarefa devolvida, sem passar de coluna')}
if(typeof tqDetHtml==='function'){const _d=tqDetHtml;tqDetHtml=function(){let h=String(_d.apply(this,arguments));try{const u=tqEu(),t=tqT(TQ_V.det.id);if(!t)return h;let extra='';
 if(t.aval)extra+=`<section class="tq-sec"><h4>Avaliação</h4><p style="margin:0 0 8px">${tqH(tqNome(t.aval.por))} pediu para passar para <b>"${tqH(t.aval.colN)}"</b>. Responsável: ${tqH(tqNome(t.aval.resp))}.</p>${t.aval.resp===u?`<div class="row" style="gap:6px"><button class="btn sm" onclick="r28AvalResp('${t.id}',true)">Aprovar</button><button class="btn sm ghost" onclick="r28AvalResp('${t.id}',false)">Devolver</button></div>`:'<span class="tq-aval">Aguardando avaliação</span>'}</section>`;
 if(t.rec)extra+=`<section class="tq-sec"><h4>Repetição</h4><p style="margin:0">${tqH(r28RecTxt(t.rec))}. Ao concluir, a próxima já é criada com o novo prazo.</p>${t.lider===u||t.criador===u?`<button class="btn sm ghost" style="margin-top:6px" onclick="r28RecParar('${t.id}')">Parar de repetir</button>`:''}</section>`;
 if(t.auto)extra+=`<section class="tq-sec"><h4>Tarefa automática</h4><p style="margin:0">Criada sozinha pela regra "${tqH(t.auto)}".</p></section>`;
 if(extra){const k=h.indexOf('<section class="tq-sec">');h=k>=0?h.slice(0,k)+extra+h.slice(k):h+extra}}catch(e){}return h}}
if(typeof tqCard==='function'){const _c=tqCard;tqCard=function(t,u){let h=String(_c.apply(this,arguments));const ad=(t.aval?`<span class="tq-aval">Aguardando avaliação de ${tqH(tqPrim(t.aval.resp))}</span>`:'')+(t.rec?`<span class="tq-rec" title="${tqH(r28RecTxt(t.rec))}">↻ ${tqH(r28RecTxt(t.rec))}</span>`:'');return ad?h.replace(/(<button class="tq-open")/,`<div>${ad}</div>$1`):h}}
/* 783: tarefa recorrente */
const r28RecTxt=r=>r.tipo==='dia'?'Repete todo dia':r.tipo==='semana'?'Repete toda semana':r.tipo==='mes'?`Repete todo dia ${r.dia} de cada mês`:'';
function r28RecProx(r,base){const d=new Date((base||tqHoje())+'T12:00:00');if(r.tipo==='dia')d.setDate(d.getDate()+1);else if(r.tipo==='semana')d.setDate(d.getDate()+7);else{d.setDate(1);d.setMonth(d.getMonth()+1);const ult=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(r.dia,ult))}return tqIsoDia(d)}
function r28RecPrim(r){if(r.tipo!=='mes')return '';const h=new Date(tqHoje()+'T12:00:00'),ult=new Date(h.getFullYear(),h.getMonth()+1,0).getDate(),d=Math.min(r.dia,ult);if(h.getDate()<=d){h.setDate(d);return tqIsoDia(h)}return r28RecProx(r,tqHoje())}
function r28RecParar(id){const t=tqT(id);if(!t)return;tqLog(t,tqEu(),'Parou a repetição da tarefa');t.rec=null;tqMudou();toast('A tarefa não repete mais')}
if(typeof tqNova==='function'){const _n=tqNova;tqNova=function(){const _om=openModal;openModal=function(h,cl){return _om(String(h).replace(/(<div class="field"><span style="font-size:13px;font-weight:600">Acompanhantes<\/span>)/,`<div class="formgrid"><div class="field"><label for="r28Rec">Repetir</label><select class="in" id="r28Rec" onchange="r28El('r28RecDiaW').hidden=this.value!=='mes'"><option value="">Não repete</option><option value="dia">Todo dia</option><option value="semana">Toda semana</option><option value="mes">Todo mês, num dia fixo</option></select><span class="msg">A próxima é criada sozinha quando esta for concluída.</span></div><div class="field" id="r28RecDiaW" hidden><label for="r28RecDia">Dia do mês</label><input class="in" type="number" id="r28RecDia" min="1" max="31" value="${new Date().getDate()}"><span class="msg">Ex.: dia 5 de todos os meses. Em mês mais curto, vale o último dia.</span></div></div>$1`),cl)};try{return _n.apply(this,arguments)}finally{openModal=_om}}}
if(typeof tqNovaOk==='function'){const _o=tqNovaOk;tqNovaOk=function(){const tp=String((r28El('r28Rec')||{}).value||''),dia=Math.max(1,Math.min(31,+((r28El('r28RecDia')||{}).value)||1)),pz=r28El('tqNP');let rec=null;
 if(tp){rec={tipo:tp,dia};if(pz&&!pz.value){pz.value=tp==='mes'?r28RecPrim(rec):tp==='semana'?tqDia(7):tqDia(1)}}const n=tqS().tarefas.length;const r=_o.apply(this,arguments);
 if(rec&&tqS().tarefas.length>n){const t=tqS().tarefas[tqS().tarefas.length-1];t.rec=rec;tqLog(t,tqEu(),r28RecTxt(rec));tqSalvar();tqPinta()}return r}}
if(typeof tqConcluirSem==='function'){const _c=tqConcluirSem;tqConcluirSem=function(t,u){const r=_c.apply(this,arguments);try{if(t&&t.rec&&!t.recFeita){t.recFeita=true;r28RecCriar(t,u)}}catch(e){}return r}}
function r28RecCriar(t,u){const S=tqS(),ag=new Date().toISOString(),p=r28RecProx(t.rec,tqPrazo(t)||tqHoje());const nt={id:tqId('t'),titulo:t.titulo,desc:t.desc,criador:t.criador,lider:t.lider,acomp:t.acomp.slice(),criada:ag,prazos:[{data:p,def:ag,por:u||t.criador}],concl:null,checklists:t.checklists.map(k=>({id:tqId('k'),n:k.n,itens:k.itens.map(i=>({id:tqId('i'),t:i.t,ok:false}))})),anexos:[],msgs:[],hist:[{em:ag,por:u||t.criador,t:'Criada sozinha pela repetição ('+r28RecTxt(t.rec)+')'}],rec:{...t.rec}};
 S.tarefas.push(nt);tqEnvolvidos(nt).forEach(x=>{const U=tqU(x);tqGarantePos(x);const U2=tqU(x),c0=tqCols(x)[0];if(c0){const n=tqDaColuna(x,c0.id).length;U2.pos[nt.id]={c:c0.id,o:n}}const et=(U.tEtq||{})[t.id];if(et)U.tEtq[nt.id]=et.slice()});
 setTimeout(()=>toast(`Tarefa recorrente: a próxima vence em ${tqDMY(p)}`),400)}
/* 781: ver por etiqueta */
if(typeof tqApp==='function'){const _a=tqApp;tqApp=function(){let h=String(_a.apply(this,arguments));const u=tqEu();
 h=h.replace(/(onclick="tqAba\('prazo'\)">Por prazo<\/button>)/,`$1<button class="tab ${TQ_V.aba==='etq'?'active':''}" role="tab" aria-selected="${TQ_V.aba==='etq'}" onclick="tqAba('etq')">Por etiqueta</button>`);
 if(TQ_V.aba==='etq'){const ini=h.indexOf('</div>',h.indexOf('<div class="tq-barra">'));const iQ=h.indexOf('<div class="tq-board"');const fim=h.indexOf('<p class="tl" style="margin-top:6px">Teclado:');
  if(iQ>0&&fim>iQ)h=h.slice(0,iQ)+r28PorEtq(u)+h.slice(fim)}
 h=h.replace(/(<div class="chips" role="group" aria-label="Filtrar tarefas">)/,`<button class="btn sm ghost" onclick="r28AutoDlg()" title="Regras que criam tarefas sozinhas">Tarefas automáticas</button>$1`);return h}}
function r28PorEtq(u){const U=tqU(u),l=tqFiltra(tqVis(u),u).filter(t=>!t.concl),grupos=U.etq.map(e=>[e,l.filter(t=>(U.tEtq[t.id]||[]).includes(e.id))]),sem=l.filter(t=>!(U.tEtq[t.id]||[]).length);
 const linha=t=>{const p=tqPrazo(t),s=tqSit(t),c=s==='atr'?'atr':s==='hoje'?'hoje':'';return `<button class="tq-row" onclick="tqAbrir('${t.id}')"><b>${tqH(t.titulo)}</b>${p?`<span class="tq-b ${c}">${TQI.relogio}${tqDMY(p)}</span>`:''}<small>${tqH(tqPapelLinha(t,u))} · coluna ${tqH(tqColNome(u,(U.pos[t.id]||{}).c))}</small></button>`};
 return `<div class="card tq-prz r28-etq-g">${grupos.map(([e,ts])=>`<h3><span class="tq-etq" style="background:${tqCor(e.cor)}">${tqH(e.n)}</span> <span class="tq-b">${ts.length}</span></h3>${ts.length?ts.map(linha).join(''):'<p class="tl" style="margin:0 0 6px">Nenhuma.</p>'}`).join('')}<h3>Sem etiqueta <span class="tq-b">${sem.length}</span></h3>${sem.length?sem.map(linha).join(''):'<p class="tl" style="margin:0 0 6px">Nenhuma.</p>'}<p class="tl" style="margin-top:12px">Uma tarefa com mais de uma etiqueta aparece em cada uma. As etiquetas são só suas: crie e mude em Gerenciar, no detalhe da tarefa.</p></div>`}
/* 784: tarefas automáticas (lembretes ligados a eventos do sistema) */
let R28_AUTO=[{id:'a1',ev:'caixa',n:'Conferir o fechamento do caixa',quem:'gerente',prazo:1,on:true}];
const R28_EVS={caixa:'Quando um caixa for fechado',estoque:'Quando um item do estoque ficar abaixo do mínimo',orcamento:'Quando um orçamento vencer sem resposta'};
const R28_QUEM={gerente:'Gerente ou gestor da unidade',eu:'Eu'};
function r28AutoGerente(){const S=tqS(),eu=tqOp(S.eu);const l=S.ops.filter(o=>/gerente|gestor|coordena|líder/i.test((o.cargo||'')+' '+(o.n||'')+' '+tqSetorNome(o.setor))&&o.unid===eu.unid);return (l[0]||S.ops.find(o=>/gerente|gestor/i.test((o.cargo||'')+' '+tqSetorNome(o.setor)))||eu).id}
function r28AutoDlg(){openModal(`${mh('Tarefas automáticas')}<div class="mb"><p style="margin:0 0 10px">Regras que criam uma tarefa sozinhas, como lembrete, quando algo acontece no sistema.</p><div class="at-list">${R28_AUTO.map(a=>`<div class="at-row"><label class="switch" style="margin:0"><input type="checkbox" ${a.on?'checked':''} onchange="R28_AUTO.find(x=>x.id==='${a.id}').on=this.checked;toast(this.checked?'Regra ligada':'Regra desligada')"><span class="tr"></span></label><div class="grow"><b>${tqH(a.n)}</b><small>${tqH(R28_EVS[a.ev])} · para ${tqH(R28_QUEM[a.quem])} · prazo de ${a.prazo} dia${a.prazo>1?'s':''}</small></div>${a.ev==='caixa'?`<button class="btn sm ghost" onclick="r28AutoEvento('caixa',{caixa:'Caixa 1 · Recepção'})">Simular fechamento</button>`:''}<button class="tq-x" aria-label="Apagar a regra" onclick="R28_AUTO=R28_AUTO.filter(x=>x.id!=='${a.id}');r28AutoDlg()">${TQI.lixo}</button></div>`).join('')||'<p class="tl">Nenhuma regra.</p>'}</div>
 <h4 style="margin:14px 0 6px">Nova regra</h4><div class="formgrid"><div class="field"><label for="r28AuE">Quando</label><select class="in" id="r28AuE">${Object.entries(R28_EVS).map(([k,t])=>`<option value="${k}">${t}</option>`).join('')}</select></div><div class="field"><label for="r28AuQ">Para quem</label><select class="in" id="r28AuQ">${Object.entries(R28_QUEM).map(([k,t])=>`<option value="${k}">${t}</option>`).join('')}</select></div><div class="field" style="grid-column:1/-1"><label for="r28AuN">Título da tarefa</label><input class="in" id="r28AuN" maxlength="120" placeholder="Ex.: Conferir o fechamento do caixa"></div><div class="field"><label for="r28AuP">Prazo (dias)</label><input class="in" id="r28AuP" type="number" min="0" max="30" value="1"></div></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn" onclick="r28AutoNova()">${I.plus} Criar regra</button></div>`)}
function r28AutoNova(){const n=String((r28El('r28AuN')||{}).value||'').trim();if(!n){toast('Escreva o título da tarefa','warn');return}R28_AUTO.push({id:'a'+(R28_AUTO.length+1)+Date.now()%1000,ev:r28El('r28AuE').value,quem:r28El('r28AuQ').value,n,prazo:Math.max(0,+r28El('r28AuP').value||0),on:true});r28AutoDlg();toast('Regra criada')}
function r28AutoEvento(ev,d){const S=tqS();let n=0;R28_AUTO.filter(a=>a.on&&a.ev===ev).forEach(a=>{const lider=a.quem==='eu'?S.eu:r28AutoGerente(),ag=new Date().toISOString(),p=tqDia(a.prazo||0);
  const t={id:tqId('t'),titulo:a.n+(d&&d.caixa?' · '+d.caixa:''),desc:`Criada sozinha: ${R28_EVS[ev].toLowerCase()}${d&&d.caixa?' ('+d.caixa+', '+r28Agora()+')':''}.`,criador:lider,lider,acomp:[],criada:ag,prazos:[{data:p,def:ag,por:lider}],concl:null,checklists:[],anexos:[],msgs:[],hist:[{em:ag,por:lider,t:'Criada sozinha pela regra "'+a.n+'"'}],auto:a.n};
  S.tarefas.push(t);tqTopo(lider,t.id);tqAvisar(lider,'auto',t.id,'Tarefa automática: '+a.n,'');n++});
 if(n){tqMudou();toast(`${n} tarefa${n>1?'s':''} automática${n>1?'s':''} criada${n>1?'s':''}${ev==='caixa'?' para a conferência do caixa':''}`)}return n}
/* Liga a regra ao fechamento de caixa de verdade, onde ele existir */
if(typeof cxFecharOk==='function'){const _f=cxFecharOk;cxFecharOk=function(u){const c=typeof CAIXAS!=='undefined'?CAIXAS.find(x=>x.u===u):null,antes=c?JSON.stringify(c):'';const r=_f.apply(this,arguments);try{if(!c||JSON.stringify(c)!==antes)r28AutoEvento('caixa',{caixa:'Caixa de '+u})}catch(e){}return r}}
