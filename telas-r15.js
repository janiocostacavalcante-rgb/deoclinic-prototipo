/* ======================================================================
   Rodada 15 (notas 316 a 378, 10/11/2026)
   Módulos novos: Procedimentos (com triagem e questionários) e Fidelidade.
   Recepção: configurações dentro do módulo, check-in por CPF, triagem por profissional.
   Agenda: indicadores Pendentes e Espera, hora da chegada, detalhes reorganizados.
   Conferência: Enter percorre as observações e libera. Caixa: repasse médico do dia.
   Início e módulos: avisos em qualquer módulo, botão + e som mais alto.
   ====================================================================== */

/* ---------- Menu: ícones e descrições dos módulos novos ---------- */
Object.assign(GICON,{'Procedimentos':GICON['Cadastros'],'Fidelidade':GICON['Financeiro']});
Object.assign(DESC,{questionarios:'Quais procedimentos e exames pedem triagem ou questionário, e o que se pergunta em cada um.','questionarios-coleta':'Questionários dos exames do laboratório, respondidos na coleta.',fidelidade:'Cartões e planos de fidelidade: assinantes, situação, uso e economia dos pacientes.','config-recepcao':'Senhas, pesos, ordem de chamada, guichês e setores da recepção.'});

/* ---------- Abrir agenda: o calendário abre ao clicar em qualquer parte do campo (notas 326 e 327) ---------- */
function rcAbaCal(el){try{if(el&&el.showPicker)el.showPicker()}catch(e){}}

/* ---------- Agenda por ordem de chegada: a hora é a de início do período (nota 347) ---------- */
function rcChegadaIni(prof,dia,rot){const n=+(String(rot).match(/\d+/)||[0])[0];const ags=RC.agendas.filter(a=>a.prof===prof&&rcDiaAberto(a,dia));
 for(const a of ags){const c=a.datas?a.datas[dia]:a;if(!c)continue;const ps=c.periodos||[c];let k=0;for(const p of ps){if((p.modo||c.modo)!=='chegada')continue;const t=+p.total||0;if(n>k&&n<=k+t)return p.ini||a.ini||'';k+=t}}
 return ''}

/* ---------- Dados de exemplo desta rodada (entram uma vez, depois da carga da recepção) ---------- */
function r15Seed(){
 /* Nota 333: um agendamento pago antes do dia (Pendente) e um feito pelo aplicativo (Espera) */
 let d=rcSomaDia(RC_HOJE,1);while([0,6].includes(rcDiaSem(d)))d=rcSomaDia(d,1);
 const novo=(h,n,proc,x)=>{const p=rcPacNome(n)||{};const a={cod:rcAgCod(),h,data:d,pac:n,cpf:p.cpf||'',itens:[proc],prof:'p1',sala:clSalaAg({proc,prof:'p1'}),tipo:PROC(proc).tipo,sit:'agendado',conv:'Particular',pago:false,agenda:'ag1',unid:10,dia:rcDiaBr(d),quando:'hoje',...x};RC.ag.push(a);return a};
 novo('09:00','Luiza Ferreira','10101012',{pago:true,pagoEm:RC_HOJE});
 novo('09:20','Ana Souza','10101039',{app:true,pago:true,pagoEm:d});
 /* Nota 322: agendamento do aplicativo, já pago, para o check-in por CPF hoje */
 const r=AG_CLIN.find(a=>a.pac==='Rita de Cássia Lins'&&a.sit==='agendado');if(r)Object.assign(r,{app:true,pago:true});
}
{const _rc=rc;rc=function(){const r=_rc.apply(this,arguments);if(typeof RC!=='undefined'&&RC&&RC.agendas&&!RC.r15){RC.r15=true;try{r15Seed()}catch(e){}}return r}}

/* ---------- Pré-atendimento: check-in por CPF sem senha (nota 322) ---------- */
function rcCkItens(p){if(!p)return [];const l=[];
 RC.at.filter(e=>e.cpf===p.cpf&&e.unid===RC.unid&&e.st==='pendente'&&!e.cx&&!e.etapa&&e.setor&&(!e.ag||clPodeChamar(e.ag).ok)).forEach(e=>l.push({k:'at',id:e.id,procs:e.procs,orig:'Sala de pendência',h:e.ag?e.ag.h:''}));
 clAgendaHoje().filter(a=>a.pac===p.n&&(a.src||a).app&&(a.src||a).pago&&['agendado','confirmado'].includes(a.sit)).forEach(a=>l.push({k:'ag',ref:a.ref,procs:a.itens,orig:'Aplicativo',h:a.h}));
 return l}
function rcCkHtml(p){const l=rcCkItens(p);if(!p)return '';
 return `<div class="card rc-ck"><h3>Check-in sem senha ${info('Para quem já pagou: procedimentos agendados pelo aplicativo ou que estão na sala de pendência. O check-in manda direto para a sala de espera, sem gerar senha.')}</h3>${l.length?`<div class="at-list">${l.map(x=>`<div class="at-row"><div class="grow"><b>${esc(rcProcsTxt(x.procs))}</b><small>${x.h?x.h+' · ':''}${x.orig} · pago</small></div></div>`).join('')}</div><div class="row" style="margin-top:10px"><button class="btn" onclick="rcCheckin('${p.cpf}')">Fazer check-in e enviar para a espera</button></div>`:'<p class="tl" style="margin:6px 0 0">Nenhum procedimento pago aguardando check-in. Gere a senha normalmente.</p>'}</div>`}
function rcCheckin(cpf){const p=rcPacCpf(cpf),l=rcCkItens(p);if(!l.length){toast('Nada para check-in','warn');return}let n=0;
 l.forEach(x=>{if(x.k==='at'){const e=RC.at.find(y=>y.id===x.id);if(!e)return;e.st='espera';e.motivo='';e.ts=Date.now();rcHist(e,'recepcao','Check-in por CPF: entrou na espera',rcProcsTxt(e.procs));n++}
  else{const a=clAgRef(x.ref);if(!a)return;const s={id:'ck'+Date.now()+n,num:'Check-in',pac:p.n,cpf:p.cpf,tipo:'',peso:'NOR',unid:RC.unid};rcEncaminhar(s,a.itens,{guia:true,ag:a.src});(a.src||a).sit='chegou';rcHist(a.src||a,'agenda','Check-in por CPF',a.h+' · agendado pelo aplicativo',PROF(a.prof).n);n++}});
 RC.pa.cpf='';RC.pa.q='';rcMudou();toast(`Check-in feito: ${n} procedimento(s) na sala de espera`)}
{const _v=VIEWS['pre-atendimento'];VIEWS['pre-atendimento']=function(){const h=_v.apply(this,arguments),p=rcPacCpf(RC.pa.cpf);return p?h.replace('<div class="rc-pa-lista">',`${rcCkHtml(p)}<div class="rc-pa-lista">`):h}}

/* ---------- Procedimentos: grupo, subgrupo, dependência de médico, prazo de laudo, convênios e valores, triagem ou questionário (notas 321 e 359) ---------- */
const PR_GRUPOS={Consulta:['Clínica','Especialidades','Retorno'],Imagem:['Ultrassonografia','Raio X','Tomografia','Ressonância'],Procedimento:['Cardiologia','Enfermagem','Pequena cirurgia'],Laboratório:['Bioquímica','Hematologia','Hormônios','Urinálise']};
const PR_CAMPOS_TRI=[['pa','Pressão arterial'],['fc','Frequência cardíaca'],['sat','Saturação'],['temp','Temperatura'],['peso','Peso'],['alt','Altura'],['glic','Glicemia capilar'],['dor','Escala de dor'],['queixa','Queixa principal']];
const PR_TIPOS_PERG=[['sn','Sim ou Não'],['txt','Texto livre'],['esc','Múltipla escolha']];
const PR_CFG={
 '10101012':{grupo:'Consulta',sub:'Clínica',dep:true,prazo:'',exige:'triagem',campos:['pa','fc','sat','temp','peso','alt','queixa'],perg:[]},
 '10101039':{grupo:'Consulta',sub:'Retorno',dep:true,prazo:'',exige:'triagem',campos:['pa','fc','peso','queixa'],perg:[]},
 '40901122':{grupo:'Imagem',sub:'Ultrassonografia',dep:true,prazo:'24 horas',exige:'questionario',campos:[],perg:[{q:'Está em jejum de 8 horas?',t:'sn',ob:true},{q:'Já fez cirurgia no abdome? Qual?',t:'txt',ob:false}]},
 '40901300':{grupo:'Imagem',sub:'Ultrassonografia',dep:true,prazo:'24 horas',exige:'',campos:[],perg:[]},
 '40901467':{grupo:'Imagem',sub:'Ultrassonografia',dep:true,prazo:'24 horas',exige:'questionario',campos:[],perg:[{q:'Data da última menstruação',t:'txt',ob:true},{q:'Está grávida ou pode estar?',t:'sn',ob:true}]},
 '40901483':{grupo:'Imagem',sub:'Ultrassonografia',dep:true,prazo:'48 horas',exige:'',campos:[],perg:[]},
 '40901530':{grupo:'Imagem',sub:'Ultrassonografia',dep:true,prazo:'24 horas',exige:'questionario',campos:[],perg:[{q:'Idade gestacional (semanas)',t:'txt',ob:true}]},
 '40101010':{grupo:'Procedimento',sub:'Cardiologia',dep:true,prazo:'48 horas',exige:'triagem',campos:['pa','fc','queixa'],perg:[]},
 '20104090':{grupo:'Procedimento',sub:'Enfermagem',dep:false,prazo:'',exige:'',campos:[],perg:[]},
 'TC-CRANIO':{grupo:'Imagem',sub:'Tomografia',dep:true,prazo:'72 horas',exige:'questionario',campos:[],perg:[{q:'Tem alergia a contraste iodado?',t:'sn',ob:true},{q:'Tem problema nos rins?',t:'sn',ob:true},{q:'Usa metformina?',t:'sn',ob:true},{q:'Observações do paciente',t:'txt',ob:false}],nome:'Tomografia de crânio (exemplo)'},
 'HEMO':{grupo:'Laboratório',sub:'Hematologia',dep:false,prazo:'24 horas',exige:'questionario',campos:[],perg:[{q:'Está em jejum?',t:'sn',ob:false},{q:'Usa anticoagulante?',t:'sn',ob:true}]},
 'GLI':{grupo:'Laboratório',sub:'Bioquímica',dep:false,prazo:'24 horas',exige:'questionario',campos:[],perg:[{q:'Horas de jejum',t:'esc',ob:true,ops:['Menos de 8','8 a 12','Mais de 12']},{q:'É diabético?',t:'sn',ob:true}]},
};
const PR_VAL={};/* valores por convênio: PR_VAL[codigo][convenio] */
const prCfg=c=>PR_CFG[c]||(PR_CFG[c]={grupo:(PROC(c)||{}).tipo||((typeof EX!=='undefined'&&EX[c])?'Laboratório':'Procedimento'),sub:'',dep:false,prazo:'',exige:'',campos:[],perg:[]});
const prExige=c=>prCfg(c).exige;
const prqNome=c=>(PR_CFG[c]&&PR_CFG[c].nome)||(PROC(c)&&PROC(c).n)||(typeof EX!=='undefined'&&EX[c]&&EX[c].n)||c;
const prConvs=c=>{const v=PR_VAL[c];if(v)return Object.keys(v);return CL_TABS.filter(t=>clPreco(c,t))};
const prValor=(c,t)=>{const v=PR_VAL[c];return v&&v[t]!=null?v[t]:clPreco(c,t)};
const prExigeTag=c=>{const e=prExige(c);return e==='triagem'?'<span class="badge info">Triagem</span>':e==='questionario'?'<span class="badge warn">Questionário</span>':'<span class="tl">Nenhum</span>'};

{const _v=VIEWS.procedimentos;VIEWS.procedimentos=function(){return _v.apply(this,arguments).replace('<div class="crumbs">Cadastros</div><h1>Procedimentos e TUSS</h1>','<h1>Procedimentos</h1>')}}
function clPrcForm(c){const p=PROC(c)||{c:'',n:'',tipo:'Procedimento',dur:20,preco:0,sala:'Procedimentos',prep:''},g=c?prCfg(c):{grupo:'Procedimento',sub:'',dep:false,prazo:'',exige:'',campos:[],perg:[]},cv=c?prConvs(c):['Particular'];
 openModal(`${mh(c?'Editar procedimento':'Novo procedimento')}<div class="mb"><div class="formgrid">
 <div class="field" style="grid-column:span 2"><label for="prN">Nome <span class="req">*</span></label><input class="in" id="prN" value="${esc(p.n)}"></div>
 <div class="field"><label for="prC">Código TUSS <span class="req">*</span> ${info('Oito dígitos da tabela TUSS. Código repetido na mesma clínica é bloqueado.')}</label><input class="in mono" id="prC" value="${p.c}" placeholder="00000000" maxlength="8" inputmode="numeric"></div>
 <div class="field"><label for="prG">Grupo <span class="req">*</span></label><select class="in" id="prG" onchange="prSubOpts()">${Object.keys(PR_GRUPOS).map(k=>`<option ${g.grupo===k?'selected':''}>${k}</option>`).join('')}</select></div>
 <div class="field"><label for="prS">Subgrupo</label><select class="in" id="prS">${(PR_GRUPOS[g.grupo]||[]).map(k=>`<option ${g.sub===k?'selected':''}>${k}</option>`).join('')}</select></div>
 <div class="field"><label for="prP">Prazo para laudo ${info('Tempo prometido ao paciente para o resultado. Entra no comprovante e no controle de atraso dos laudos.')}</label><select class="in" id="prP">${['','24 horas','48 horas','72 horas','5 dias','7 dias'].map(k=>`<option value="${k}" ${g.prazo===k?'selected':''}>${k||'Sem laudo'}</option>`).join('')}</select></div>
 <div class="field"><label for="prE">Exige antes do atendimento ${info('Triagem: aparece na tela de Triagem da recepção. Questionário: perguntas respondidas na coleta ou antes do exame. Configure os campos em Procedimentos, Triagem e questionários.')}</label><select class="in" id="prE"><option value="" ${!g.exige?'selected':''}>Nada</option><option value="triagem" ${g.exige==='triagem'?'selected':''}>Triagem</option><option value="questionario" ${g.exige==='questionario'?'selected':''}>Questionário</option></select></div>
 <div class="field"><label for="prD">Duração (min)</label><input class="in" id="prD" type="number" value="${p.dur}"></div>
 </div>
 <label class="check"><input type="checkbox" id="prDep" ${g.dep?'checked':''}>Procedimento médico dependente ${info('Só pode ser agendado e realizado com um médico responsável vinculado (consulta, laudo ou procedimento feito pelo médico).')}</label>
 <h4 style="margin:14px 0 6px">Convênios em que aparece e valores</h4><p class="tl" style="margin:0 0 8px">Marque os convênios. O valor vale para os próximos atendimentos; o histórico fica guardado.</p>
 <div class="pr-conv">${CL_TABS.map((t,i)=>`<label class="pr-cv"><input type="checkbox" id="prCv${i}" ${cv.includes(t)?'checked':''} onchange="document.getElementById('prVl${i}').disabled=!this.checked"><span>${esc(t)}</span><input class="in" id="prVl${i}" inputmode="decimal" placeholder="0,00" value="${c&&cv.includes(t)&&prValor(c,t)?String(prValor(c,t).toFixed(2)).replace('.',','):''}" ${cv.includes(t)?'':'disabled'} aria-label="Valor no convênio ${esc(t)}"></label>`).join('')}</div>
 </div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="prSalvar('${c||''}')">Salvar</button></div>`,'wide')}
function prSubOpts(){const g=$('#prG').value;$('#prS').innerHTML=(PR_GRUPOS[g]||[]).map(k=>`<option>${k}</option>`).join('')}
function prSalvar(c){const n=$('#prN').value.trim(),cod=$('#prC').value.trim();if(!n){toast('Informe o nome do procedimento','warn');return}if(!/^\d{8}$/.test(cod)){toast('O código TUSS tem 8 números','warn');return}
 if(!c&&PROCEDIMENTOS.some(p=>p.c===cod)){toast('Já existe um procedimento com este código TUSS','warn');return}
 const vals={};let erro='';CL_TABS.forEach((t,i)=>{if($('#prCv'+i).checked){const v=parseFloat(($('#prVl'+i).value||'').replace(/\./g,'').replace(',','.'));if(!(v>=0)||$('#prVl'+i).value.trim()==='')erro=erro||`Informe o valor em ${t}`;else vals[t]=v}});if(erro){toast(erro,'warn');return}if(!Object.keys(vals).length){toast('Marque pelo menos um convênio','warn');return}
 const g=$('#prG').value,tipo=g==='Laboratório'?'Procedimento':g;let p=PROC(c||cod);if(!p){p={c:cod,n,tipo,dur:+$('#prD').value||20,preco:vals.Particular||0,custo:0,sala:tipo==='Imagem'?'Ultrassom':tipo==='Consulta'?'Consultório':'Procedimentos'};PROCEDIMENTOS.push(p)}else Object.assign(p,{n,dur:+$('#prD').value||p.dur,preco:vals.Particular!=null?vals.Particular:p.preco});
 const k=p.c,cfg=prCfg(k);Object.assign(cfg,{grupo:g,sub:$('#prS').value,dep:$('#prDep').checked,prazo:$('#prP').value,exige:$('#prE').value});PR_VAL[k]=vals;
 closeModal();reView();retorno('ok','Procedimento salvo',`${esc(n)} aparece em ${Object.keys(vals).length} convênio(s)${cfg.exige?', com '+(cfg.exige==='triagem'?'triagem':'questionário')+' antes do atendimento':''}. Já entra no Novo atendimento, nos Orçamentos e na Agenda.`)}

/* Triagem e questionários: o que cada procedimento pede (nota 359) */
let PRQ_ABA='proc',PRQ_Q='';
VIEWS.questionarios=()=>{const lista=PRQ_ABA==='proc'?[...PROCEDIMENTOS.map(p=>p.c),...Object.keys(PR_CFG).filter(k=>!PROC(k)&&PR_CFG[k].grupo!=='Laboratório')]:Object.keys(PR_CFG).filter(k=>PR_CFG[k].grupo==='Laboratório');
 const q=semAc(PRQ_Q.trim()),l=lista.filter(c=>!q||semAc(prqNome(c)+' '+c).includes(q));
 return `${pageHead('','Triagem e questionários','',`<button class="btn" onclick="prqNovo()">${I.plus} Configurar procedimento</button>`)}
 <div class="tabs" role="tablist">${[['proc','Procedimentos'],['lab','Exames de laboratório']].map(([k,t])=>`<button class="tab ${PRQ_ABA===k?'active':''}" onclick="PRQ_ABA='${k}';reView()">${t}</button>`).join('')}</div>
 <div class="filters"><div class="inwrap" style="flex:1 1 240px">${LUPA}<input class="in" placeholder="Nome ou código" value="${esc(PRQ_Q)}" oninput="PRQ_Q=this.value;reView();setTimeout(()=>{const i=document.querySelector('.filters input');if(i){i.focus();i.setSelectionRange(99,99)}},0)" aria-label="Buscar procedimento"></div></div>
 ${tabela(['Procedimento','Grupo','Exige','O que se registra',''],l.map(c=>{const g=prCfg(c);return `<tr data-det="0">${td('Procedimento',`<div class="two">${esc(prqNome(c))}<small class="mono">${esc(c)}</small></div>`)}${td('Grupo',esc(g.grupo+(g.sub?' · '+g.sub:'')))}${td('Exige',prExigeTag(c))}${td('O que se registra',g.exige==='triagem'?esc(g.campos.map(k=>(PR_CAMPOS_TRI.find(x=>x[0]===k)||[,k])[1]).join(', ')):g.exige==='questionario'?`${g.perg.length} pergunta(s)`:'<span class="tl">Nada</span>')}${td('',`<button class="btn sm sec" onclick="prqEditar('${c}')">Configurar</button>`)}</tr>`}),'Nada encontrado')}
 <p class="tl" style="margin-top:10px">A tela de Triagem mostra só os procedimentos com triagem. Os questionários dos exames de laboratório ficam em Laboratório · Coleta, Questionários.</p>`};
function prqNovo(){const ja=new Set(Object.keys(PR_CFG).filter(k=>PR_CFG[k].exige));const op=[...PROCEDIMENTOS.map(p=>p.c),...Object.keys(PR_CFG)].filter((c,i,a)=>a.indexOf(c)===i&&!ja.has(c));if(!op.length){toast('Todos os procedimentos já estão configurados','warn');return}
 openModal(`${mh('Configurar procedimento')}<div class="mb"><div class="field"><label for="prqSel">Procedimento</label><select class="in" id="prqSel">${op.map(c=>`<option value="${c}">${esc(prqNome(c))}</option>`).join('')}</select></div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="prqEditar($('#prqSel').value)">Continuar</button></div>`)}
let PRQ_ED=null;
function prqEditar(c){const g=prCfg(c);PRQ_ED={c,exige:g.exige,campos:[...g.campos],perg:g.perg.map(x=>({...x,ops:x.ops?[...x.ops]:undefined}))};prqPinta()}
function prqPinta(){const E=PRQ_ED;const h=`${mh('Triagem e questionário · '+esc(prqNome(E.c)))}<div class="mb">
 <div class="field"><label>Exige antes do atendimento</label><div class="row" style="gap:6px">${[['','Nada'],['triagem','Triagem'],['questionario','Questionário']].map(([k,t])=>chip(t,E.exige===k,`PRQ_ED.exige='${k}';prqPinta()`)).join('')}</div></div>
 ${E.exige==='triagem'?`<h4 style="margin:12px 0 6px">Campos da triagem</h4><div class="prq-campos">${PR_CAMPOS_TRI.map(([k,t])=>`<label class="check"><input type="checkbox" ${E.campos.includes(k)?'checked':''} onchange="prqCampo('${k}',this.checked)">${t}</label>`).join('')}</div>`:''}
 ${E.exige==='questionario'?`<h4 style="margin:12px 0 6px">Perguntas</h4>${E.perg.length?E.perg.map((x,i)=>`<div class="prq-p"><input class="in" value="${esc(x.q)}" placeholder="Pergunta" aria-label="Pergunta ${i+1}" oninput="PRQ_ED.perg[${i}].q=this.value"><select class="in" aria-label="Tipo de resposta" onchange="PRQ_ED.perg[${i}].t=this.value;prqPinta()">${PR_TIPOS_PERG.map(([k,t])=>`<option value="${k}" ${x.t===k?'selected':''}>${t}</option>`).join('')}</select><label class="check"><input type="checkbox" ${x.ob?'checked':''} onchange="PRQ_ED.perg[${i}].ob=this.checked">Obrigatória</label><button class="btn sm ghost" aria-label="Tirar pergunta" onclick="PRQ_ED.perg.splice(${i},1);prqPinta()">${I.x}</button>${x.t==='esc'?`<input class="in prq-ops" value="${esc((x.ops||[]).join('; '))}" placeholder="Opções separadas por ponto e vírgula" aria-label="Opções" oninput="PRQ_ED.perg[${i}].ops=this.value.split(';').map(s=>s.trim()).filter(Boolean)">`:''}</div>`).join(''):'<p class="tl">Nenhuma pergunta ainda.</p>'}<button class="btn sm sec" onclick="PRQ_ED.perg.push({q:'',t:'sn',ob:true});prqPinta()">${I.plus} Pergunta</button>`:''}
 </div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="prqSalvar()">Salvar</button></div>`;if(modalAberto())$('#modal').innerHTML=h;else openModal(h,'wide')}
function prqCampo(k,on){const c=PRQ_ED.campos;if(on&&!c.includes(k))c.push(k);if(!on)PRQ_ED.campos=c.filter(x=>x!==k)}
function prqSalvar(){const E=PRQ_ED;if(E.exige==='triagem'&&!E.campos.length){toast('Marque pelo menos um campo da triagem','warn');return}if(E.exige==='questionario'){if(!E.perg.length){toast('Inclua pelo menos uma pergunta','warn');return}const v=E.perg.findIndex(x=>!x.q.trim());if(v>=0){toast(`A pergunta ${v+1} está em branco`,'warn');return}const o=E.perg.findIndex(x=>x.t==='esc'&&!(x.ops||[]).length);if(o>=0){toast(`A pergunta ${o+1} precisa das opções`,'warn');return}}
 Object.assign(prCfg(E.c),{exige:E.exige,campos:E.exige==='triagem'?E.campos:[],perg:E.exige==='questionario'?E.perg:[]});closeModal();reView();toast('Configuração salva')}

/* Questionários na coleta (nota 361) */
const PRQ_RESP={};
VIEWS['questionarios-coleta']=()=>{rc();const fila=(typeof FILA!=='undefined'?FILA.col:[]).map(f=>({pac:f.n,senha:f.s,ex:['HEMO','GLI']}));
 const l=fila.map(f=>({...f,ex:f.ex.filter(c=>prExige(c)==='questionario')})).filter(f=>f.ex.length);
 return `${pageHead('','Questionários','')}<p class="tl" style="margin:0 0 10px">Exames do laboratório configurados com questionário, dos pacientes na fila da coleta.</p>${tabela(['Senha','Paciente','Exames com questionário','Situação',''],l.map(f=>{const ok=f.ex.every(c=>PRQ_RESP[f.pac+'|'+c]);return `<tr data-det="0">${td('Senha',`<span class="mono"><b>${esc(f.senha)}</b></span>`)}${td('Paciente',esc(f.pac))}${td('Exames com questionário',esc(f.ex.map(prqNome).join(', ')))}${td('Situação',ok?'<span class="badge ok">Respondido</span>':'<span class="badge warn">Pendente</span>')}${td('',`<button class="btn sm ${ok?'sec':''}" onclick="prqResponder('${esc(f.pac).replace(/'/g,'')}','${f.ex.join(',')}')">${ok?'Ver respostas':'Responder'}</button>`)}</tr>`}),'Nenhum paciente com questionário pendente')}`};
function prqResponder(pac,exs){const l=exs.split(',');openModal(`${mh('Questionário · '+esc(pac))}<div class="mb">${l.map(c=>`<h4 style="margin:8px 0 6px">${esc(prqNome(c))}</h4>${prCfg(c).perg.map((x,i)=>{const id=`pq_${c}_${i}`,v=(PRQ_RESP[pac+'|'+c]||{})[i]||'';return `<div class="field"><label for="${id}">${esc(x.q)} ${x.ob?'<span class="req">*</span>':''}</label>${x.t==='sn'?`<select class="in" id="${id}"><option value=""></option>${['Sim','Não'].map(o=>`<option ${v===o?'selected':''}>${o}</option>`).join('')}</select>`:x.t==='esc'?`<select class="in" id="${id}"><option value=""></option>${(x.ops||[]).map(o=>`<option ${v===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`:`<input class="in" id="${id}" value="${esc(v)}">`}</div>`}).join('')}`).join('')}</div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="prqResSalvar('${esc(pac).replace(/'/g,'')}','${exs}')">Salvar respostas</button></div>`,'wide')}
function prqResSalvar(pac,exs){const l=exs.split(',');for(const c of l){const r={};for(const [i,x] of prCfg(c).perg.entries()){const v=($(`#pq_${c}_${i}`).value||'').trim();if(x.ob&&!v){toast(`Responda: ${x.q}`,'warn');return}r[i]=v}PRQ_RESP[pac+'|'+c]=r}closeModal();reView();toast('Respostas salvas no atendimento')}

/* ---------- Triagem: filtro por profissional e só procedimentos com triagem (notas 349 a 355, 361) ---------- */
let FILA_PROF='';
VIEWS.fila=()=>{const base=AG_CLIN.filter(a=>prExige(a.proc)==='triagem'&&(!FILA_PROF||a.prof===FILA_PROF));
 const tri=base.filter(a=>['chegou','triagem'].includes(a.sit)&&!a.triado&&!CL_TRIAGEM[a.pac]),feitas=base.filter(a=>CL_TRIAGEM[a.pac]);
 const profs=[...new Set(AG_CLIN.filter(a=>prExige(a.proc)==='triagem').map(a=>a.prof))].map(PROF).filter(Boolean);
 return `${pageHead('','Triagem','')}
 <div class="filters fila-prof"><div class="field" style="margin:0;min-width:280px"><label for="filaProf">Profissional</label><select class="in" id="filaProf" onchange="FILA_PROF=this.value;reView()"><option value="">Todos os profissionais</option>${profs.map(p=>`<option value="${p.id}" ${FILA_PROF===p.id?'selected':''}>${esc(p.n)}</option>`).join('')}</select></div></div>
 <div class="mini">${miniKpi('Aguardando triagem',tri.length,'já chegaram','warn')}${miniKpi('Triados hoje',feitas.length,'em ordem de risco','ok')}</div>
 <div style="margin-top:14px">${clFilaTriagem(tri,feitas)}</div>`};
function clFilaTriagem(tri,feitas){feitas=feitas||AG_CLIN.filter(a=>CL_TRIAGEM[a.pac]&&prExige(a.proc)==='triagem');return `<div class="grid g2"><div class="card"><h3>Aguardando triagem ${info('Atendimentos de hoje com procedimento configurado para triagem, que já chegaram. Clique em Triar para registrar os campos do procedimento; tudo vai para o prontuário.')}</h3><div class="sub">${tri.length} paciente${tri.length===1?'':'s'}${FILA_PROF?' · '+esc(PROF(FILA_PROF).n):''}</div>
 ${tri.length?`<div class="at-list">${tri.map(a=>`<div class="at-row"><div class="grow"><b>${esc(a.pac)}</b><small>${a.h} · ${clProcNome(a.proc)} · ${(PROF(a.prof)||{}).n||''} · ${a.sit==='triagem'?'em triagem agora':'chegou'}</small></div><button class="btn sm" onclick="clTriar(${AG_CLIN.indexOf(a)})">Triar</button></div>`).join('')}</div>`:'<div class="empty" style="padding:16px 8px"><h4>Ninguém aguardando triagem</h4><p>Quando um paciente com procedimento de triagem chegar, aparece aqui.</p></div>'}</div>
 <div class="card"><h3>Triados hoje ${info('A cor é a classificação de risco: vermelho imediato, laranja até 10 min, amarelo até 60, verde até 120, azul até 240. O médico vê a cor na agenda dele.')}</h3><div class="sub">Em ordem de risco</div>
 ${feitas.length?`<div class="at-list">${feitas.slice().sort((a,b)=>CL_RISCOS.findIndex(r=>r[0]===CL_TRIAGEM[a.pac].risco)-CL_RISCOS.findIndex(r=>r[0]===CL_TRIAGEM[b.pac].risco)).map(a=>{const t=CL_TRIAGEM[a.pac],imc=clImc(t.peso,t.alt);return `<div class="at-row clk" onclick="clTriVer(${AG_CLIN.indexOf(a)})"><div class="grow"><b>${esc(a.pac)}</b><small>PA ${t.pa} · FC ${t.fc} · Sat ${t.sat}% · IMC ${imc?imc.toFixed(1).replace('.',','):'—'} · ${esc(t.q)}</small></div>${clRiscoTag(t.risco)}</div>`}).join('')}</div>`:'<p class="tl">Ninguém triado ainda hoje.</p>'}</div></div>`}

/* ---------- Conferência: Enter percorre as observações e, no fim, libera (notas 332 a 346) ---------- */
/* Ordem pedida nas notas 334 a 346; nos exames sem esses campos, vale a ordem das observações da tela */
const CF_ENTER_OBS=['Observação da série vermelha','Morfologia dos leucócitos','Observação das plaquetas'];
function cfCadeiaEnter(){const d=document.getElementById('drawer');if(!d||!d.classList.contains('show'))return null;const todos=[...d.querySelectorAll('select.obs-in:not([disabled]),textarea.obs-in:not([disabled])')].filter(s=>/^cf\d+o\d+$/.test(s.id));if(!todos.length)return null;const marc=CF_ENTER_OBS.map(n=>todos.find(s=>s.getAttribute('aria-label')===n)).filter(Boolean),obs=marc.length?marc:todos.filter(s=>s.tagName==='SELECT');
 const bts=[...d.querySelectorAll('button')].filter(b=>!b.disabled),lib=bts.find(b=>(b.textContent||'').trim()==='Liberar')||bts.find(b=>/^Liberar\b/.test((b.textContent||'').trim())&&!/todo/i.test(b.textContent));return lib?[...obs,lib]:obs}
if(typeof document.addEventListener==='function')document.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;if(typeof location==='undefined'||location.hash!=='#conferencia')return;
 const c=cfCadeiaEnter();if(!c)return;const a=document.activeElement,i=c.indexOf(a);
 if(i<0&&a&&a.closest&&a.closest('input,textarea,[contenteditable]'))return;
 e.preventDefault();if(i===c.length-1&&a.tagName==='BUTTON'){a.click();return}const prox=c[i+1]||c[0];prox.focus();if(prox.scrollIntoView)prox.scrollIntoView({block:'center'})},true);

/* ---------- Caixa: relatório de repasse da produção médica do dia (nota 378) ---------- */
const CX_REP_PAGO={};
function cxRepasseDia(){const l=clAgendaHoje().filter(a=>a.prof&&['finalizado','em atendimento'].includes(a.sit)),por={};
 l.forEach(a=>{const k=a.prof;(por[k]=por[k]||{prof:k,at:0,itens:[],v:0});por[k].at++;a.itens.forEach(c=>{const v=clRepasse(c);por[k].itens.push(clProcNome(c));por[k].v+=v})});return Object.values(por)}
function cxRepasseCard(){const l=cxRepasseDia(),tot=l.reduce((s,x)=>s+x.v,0);
 return `<div class="card" style="margin-top:14px" id="cxRepasse"><h3>Repasse da produção médica de hoje ${info('Valor a pagar a cada médico pelo que atendeu hoje, pela regra de repasse do cadastro do profissional. Pagar registra a saída no caixa, com quem pagou e quando.')}</h3><div class="sub">${l.length} médico(s) · total ${fmt(tot)}</div>
 ${tabela(['Médico','Atendimentos','Procedimentos','Valor a pagar',''],l.map(x=>`<tr data-det="0">${td('Médico',esc(PROF(x.prof).n))}${td('Atendimentos',String(x.at))}${td('Procedimentos',esc([...new Set(x.itens)].join(', ')))}${td('Valor a pagar',`<b>${fmt(x.v)}</b>`)}${td('',CX_REP_PAGO[x.prof]?`<span class="badge ok">Pago ${CX_REP_PAGO[x.prof]}</span>`:x.v?`<button class="btn sm sec" onclick="cxRepPagar('${x.prof}')">Pagar</button>`:'<span class="tl">sem repasse</span>')}</tr>`),'Nenhum médico atendeu hoje ainda')}
 <div class="row" style="margin-top:10px"><button class="btn sm ghost" onclick="toast('Relatório de repasse do dia pronto para imprimir')">${I.print} Imprimir relatório</button></div></div>`}
function cxRepPagar(prof){const x=cxRepasseDia().find(y=>y.prof===prof);if(!x)return;modalOk('Pagar repasse',`<p>Registrar o pagamento de <b>${fmt(x.v)}</b> a <b>${esc(PROF(prof).n)}</b>, referente a ${x.at} atendimento(s) de hoje?</p>`,'Registrar pagamento',`CX_REP_PAGO['${prof}']=hhmm(new Date());reView();toast('Repasse registrado como saída do caixa')`)}
{const _v=VIEWS.caixa;VIEWS.caixa=function(){return _v.apply(this,arguments).replace('<button class="btn sec" onclick="relCaixa()">Relatório de caixa</button>','<button class="btn sec" onclick="relCaixa()">Relatório de caixa</button><button class="btn sec" onclick="document.getElementById(\'cxRepasse\').scrollIntoView({behavior:\'smooth\'})">Repasse médico do dia</button>')+cxRepasseCard()}}

/* ---------- Fidelidade: painel do módulo (nota 325) ---------- */
VIEWS.fidelidade=()=>{const ks=PL_CONTRATOS.filter(k=>!k.cancelado&&k.tipo==='plano'),sit=k=>plSit(k),inad=ks.filter(k=>sit(k)[0]==='inadimplente'),car=ks.filter(k=>sit(k)[0]==='carencia'),vidas=ks.reduce((s,k)=>s+1+(k.deps||[]).length,0),mrr=ks.reduce((s,k)=>s+plPlano(k.ref).mens*(k.ref==='DV-EMP'?Math.max(1,(k.deps||[]).length+1):1),0),econ=ks.reduce((s,k)=>s+k.consumo.reduce((a,x)=>a+(x.tab-x.pago),0),0);
 return `${pageHead('','Painel da Fidelidade','',`<a class="btn sec" href="#planos">Planos e pacotes</a>`)}
 <div class="mini" style="margin-bottom:12px">${miniKpi('Assinantes',ks.length,'contratos de cartão ativos','')}${miniKpi('Vidas',vidas,'titulares e dependentes','')}${miniKpi('Inadimplentes',inad.length,'desconto suspenso',inad.length?'err':'ok')}${miniKpi('Em carência',car.length,'benefício parcial',car.length?'warn':'')}${miniKpi('Mensalidades por mês',fmt(mrr),'receita recorrente','ok')}${miniKpi('Economia dos assinantes',fmt(econ),'desde a adesão','')}</div>
 <div class="grid g2"><div class="card"><h3>Planos à venda</h3>${PL_PLANOS.filter(p=>p.ativo).map(p=>`<div class="at-row"><div class="grow"><b>${esc(p.n)}</b><small>${fmt(p.mens)} por mês${p.vidas?' · até '+p.vidas+' vida(s)':''} · ${esc(p.venda)}</small></div><span class="badge neutral">${ks.filter(k=>k.ref===p.id).length} contrato(s)</span></div>`).join('')}</div>
 <div class="card"><h3>Assinantes</h3>${ks.map(k=>{const s=sit(k);return `<div class="at-row"><div class="grow"><b>${esc(k.tit)}</b><small>${esc(plPlano(k.ref).n)} · ${(k.deps||[]).length} dependente(s) · ${esc(k.forma)}</small></div><span class="badge ${s[2]}">${esc(s[1])}</span></div>`}).join('')}</div></div>`};

/* ---------- Avisos em qualquer módulo e botão + (notas 319 e 376) ---------- */
const avisoModOpts=()=>['Início',...MENU.map(g=>g[0]).filter(g=>g!=='Início')];
AVISOS_DIA.forEach(a=>a.mod=a.mod||'Início');
const avisoVisivel=a=>a.pub&&a.ini<=avisoDiaHoje()&&!avisoEnc(a);
function avisoDiaLista(mod){mod=mod||'Início';const hoje=avisoDiaHoje(),doMod=AVISOS_DIA.filter(a=>(a.mod||'Início')===mod);if(!avisoDiaPode()||AVISO_DIA_VER==='pub')return doMod.filter(avisoVisivel).sort(avisoOrdem);if(AVISO_DIA_VER==='enc')return doMod.filter(avisoEnc).sort(avisoOrdem);return doMod.filter(a=>!avisoEnc(a)&&(!a.pub||a.ini>hoje)).sort(avisoOrdem)}
function avisoMaisBtn(mod){mod=mod||'Início';return avisoDiaPode()?`<button type="button" class="btn sm aviso-mais" title="Novo aviso" aria-label="Novo aviso${mod!=='Início'?' em '+esc(mod):''}" onclick="avisoDiaForm(0,'${mod}')">${I.plus}</button>`:`<button type="button" class="btn sm aviso-mais" title="Só a gestão e a administração publicam avisos" aria-label="Novo aviso" onclick="toast('Só a gestão e a administração publicam avisos','warn')">${I.plus}</button>`}
function avisoDiaForm(id,mod){if(!avisoDiaPode()){toast('Seu perfil não cadastra avisos','warn');return}const h=avisoDiaHoje(),a=AVISOS_DIA.find(x=>x.id===id)||{tit:'',txt:'',cat:'Geral',prio:'Normal',ini:h,ate:h,mod:mod||'Início'};
 openModal(`${mh(id?'Editar aviso':'Novo aviso')}<div class="mb"><div class="field"><label for="adT">Título <span class="req">*</span></label><input class="in" id="adT" maxlength="80" value="${esc(a.tit)}"></div><div class="field"><label for="adX">Conteúdo do comunicado <span class="req">*</span></label><textarea class="in" id="adX" maxlength="400">${esc(a.txt)}</textarea></div><div class="formgrid"><div class="field"><label for="adM">Exibir no módulo</label><select class="in" id="adM">${avisoModOpts().map(c=>`<option ${c===(a.mod||'Início')?'selected':''}>${esc(c)}</option>`).join('')}</select></div><div class="field"><label for="adC">Categoria</label><select class="in" id="adC">${AVISO_CATS.map(c=>`<option ${c===a.cat?'selected':''}>${c}</option>`).join('')}</select></div><div class="field"><label for="adP">Prioridade</label><select class="in" id="adP">${AVISO_PRIO.map(c=>`<option ${c===a.prio?'selected':''}>${c}</option>`).join('')}</select></div><div class="field"><label for="adI">Início da exibição <span class="req">*</span></label><input class="in" id="adI" type="date" value="${esc(a.ini)}"></div><div class="field"><label for="adA">Encerramento da exibição <span class="req">*</span></label><input class="in" id="adA" type="date" value="${esc(a.ate)}"></div></div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="avisoDiaSalvar(${id||0})">Salvar aviso</button></div>`)}
{const _s=avisoDiaSalvar;avisoDiaSalvar=function(id){const m=$('#adM')?$('#adM').value:'Início',antes=new Set(AVISOS_DIA.map(a=>a.id));_s.apply(this,arguments);const a=AVISOS_DIA.find(x=>x.id===id)||AVISOS_DIA.find(x=>!antes.has(x.id));if(a)a.mod=m;reView()}}
const AVISO_GRUPO=id=>{const g=MENU.find(g=>g[1].some(i=>i[0]===id));return g?g[0]:''};
function avisoModuloFaixa(id){const g=AVISO_GRUPO(id);if(!g||g==='Início'||id==='home')return '';const l=AVISOS_DIA.filter(a=>a.mod===g&&avisoVisivel(a)).sort(avisoOrdem),pode=avisoDiaPode();if(!l.length)return '';
 return `<section class="aviso-mod" aria-label="Avisos do módulo ${esc(g)}"><div class="aviso-mod-t"><b>Avisos · ${esc(g)}</b>${avisoMaisBtn(g)}</div>${l.map(a=>avisoItem(a,pode)).join('')}</section>`}
{const _p=posRender;posRender=function(id){_p.apply(this,arguments);try{const v=document.getElementById('view');if(!v)return;const old=v.querySelector(':scope > .aviso-mod');if(old)old.remove();const h=avisoModuloFaixa(id);if(h){const ph=v.querySelector('.pagehead');if(ph)ph.insertAdjacentHTML('afterend',h);else v.insertAdjacentHTML('afterbegin',h)}}catch(e){}}}

/* ---------- Ficha do paciente em gaveta larga e responsiva (nota 377) ---------- */
{const _f=pacFicha;pacFicha=function(){_f.apply(this,arguments);const d=document.getElementById('drawer');if(d)d.classList.add('drawer-pac')}}
{const _c=closeDrawer;closeDrawer=function(){_c.apply(this,arguments);const d=document.getElementById('drawer');if(d)setTimeout(()=>d.classList.remove('drawer-pac'),220)}}


/* ---------- Caixa: barrinhas com porcentagem ao passar o mouse (nota 381) ---------- */
if(typeof document.addEventListener==='function')document.addEventListener('mouseover',e=>{const b=e.target.closest&&e.target.closest('.cx-bar');if(!b||b.dataset.tit)return;const i=b.querySelector('i'),pct=i?(i.style.width||'0%'):'0%',row=b.closest('.cx-row'),sp=row?row.querySelector('span'):null,lab=sp?(sp.childNodes[0]&&sp.childNodes[0].textContent||sp.textContent).trim():'',val=row&&row.querySelector('b')?row.querySelector('b').textContent.trim():'',qt=sp&&sp.querySelector('small')?sp.querySelector('small').textContent.trim():'';b.title=`${lab?lab+': ':''}${pct} do total${val?' · '+val:''}${qt?' · '+qt:''}`;b.setAttribute('aria-label',b.title);b.dataset.tit='1'});

/* ---------- Relatório de caixa: filtro Separar por e PDF com a marca (notas 382 a 384) ---------- */
{const _rc=relCaixa;relCaixa=function(){_rc.apply(this,arguments);const m=$('#modal');if(!m)return;const sels=m.querySelectorAll('select'),dt=m.querySelectorAll('input[type=date]');m.querySelectorAll('.mf button').forEach(b=>{if(b.textContent.trim()==='Gerar'){b.removeAttribute('onclick');b.onclick=()=>{const u=sels[0]?sels[0].value:'Todos',sep=sels[1]?sels[1].value:'Convênio',de=dt[0]?dt[0].value:'',ate=dt[1]?dt[1].value:'';if(de&&ate&&ate<de){toast('A data final precisa ser depois da inicial','warn');return}relCaixaTela(null,u==='Todos'?null:u);relCaixaSep(sep,de,ate)}}})}}
function relCaixaSep(sep,de,ate){const m=$('#modal');if(!m)return;const rel=m.querySelector('.rel');if(!rel)return;const tab=rel.querySelector(':scope > .tablewrap'),grid=rel.querySelector(':scope > .cx-grid'),cols=grid?grid.children:[];
 if(sep==='Convênio'){if(tab)tab.hidden=true;if(cols[1])cols[1].hidden=true;if(grid)grid.style.gridTemplateColumns='1fr'}
 else if(sep==='Forma de pagamento'){if(tab)tab.hidden=true;if(cols[0])cols[0].hidden=true;if(grid)grid.style.gridTemplateColumns='1fr'}
 else if(grid)grid.hidden=true;
 const cab=rel.querySelector(':scope > .row');if(cab){cab.classList.add('rel-cab');const sub=cab.querySelector('span');if(sub)sub.textContent+=` · separado por ${sep.toLowerCase()}${de?` · de ${dmy(de)} até ${dmy(ate||de)}`:''}`;if(!cab.querySelector('.rel-logo'))cab.insertAdjacentHTML('beforeend','<img class="rel-logo" src="logo-deovita.png" alt="DeoVita Clínicas">')}}

/* ---------- Estilos da rodada ---------- */
if(typeof document.createElement==='function'&&document.head){const st=document.createElement('style');st.textContent=`
.rc-res{grid-template-columns:repeat(8,minmax(0,1fr))}
@media (max-width:900px){.rc-res{grid-template-columns:repeat(4,minmax(0,1fr))}}
.rc-c-pe{--c:#C98A00;--cs:#FFF4D6}.rc-c-es{--c:var(--err);--cs:var(--err-soft)}.rc-c-bl{--c:#111;--cs:#EDEDED}
.rc-ind.amb{--c:#C98A00}.rc-ind.blk{--c:#111}
[data-theme="dark"] .rc-c-bl,[data-theme="dark"] .rc-ind.blk{--c:#E6E6E6}
.rc-cheg{display:block;font-size:11px}
.rc-oz{display:block;min-height:1.2em}
.rc-det-top{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap;padding-bottom:8px;border-bottom:1px solid var(--border)}
.rc-det-prof{font-size:17px;font-weight:700}.rc-det-qd{font-size:15px;font-weight:600;color:var(--accent)}
.rc-det-pac{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:10px 0 4px}.rc-det-pac b{font-size:16px}.rc-det-pac span{color:var(--fg2);font-size:14px}
.rc-re-g{display:grid;grid-template-columns:minmax(150px,1fr) minmax(150px,1fr) auto;gap:12px;align-items:end}.rc-re-g .field{margin:0}
@media (max-width:640px){.rc-re-g{grid-template-columns:1fr}}
.rc-cab-prof label{font-size:15px;font-weight:700;color:var(--fg)}.rc-cab-prof .in,.rc-cab-prof input{border:2px solid var(--accent);font-size:15px;font-weight:600}
.chat-clip{width:46px}.chat-clip .chat-clip-i{width:24px;height:24px}
.aviso-mais{width:34px;height:34px;padding:0;justify-content:center;border-radius:50%;font-size:18px}
.aviso-mod{border:1px solid var(--border);border-radius:12px;padding:10px 12px;margin:0 0 12px;background:var(--surface)}
.aviso-mod-t{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.fila-prof{margin-bottom:12px}
.rc-ck{margin-top:14px}
.pr-conv{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:8px}
.pr-cv{display:grid;grid-template-columns:auto 1fr 110px;align-items:center;gap:8px;border:1px solid var(--border);border-radius:10px;padding:6px 10px}
.prq-campos{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:4px 12px}
.prq-p{display:grid;grid-template-columns:1fr 170px auto auto;gap:8px;align-items:center;margin-bottom:8px}.prq-p .prq-ops{grid-column:1/-1}
@media (max-width:640px){.prq-p{grid-template-columns:1fr}}
.rel-cab{border-bottom:3px solid #4F9D8E;padding-bottom:10px;margin-bottom:12px;align-items:center}.rel-logo{height:44px;background:#fff;border-radius:6px;padding:2px 6px}
@media print{.modal .rel{font-family:Arial,Helvetica,sans-serif;color:#1d2b2a}.modal .rel h2{color:#4F9D8E;font-size:20px}.modal .rel h4{color:#4F9D8E;border-bottom:1px solid #cde5e1;padding-bottom:4px}.modal .rel table{border-collapse:collapse;width:100%}.modal .rel th{background:#EAF5F3!important;color:#1d2b2a;-webkit-print-color-adjust:exact;print-color-adjust:exact}.modal .rel td,.modal .rel th{border-bottom:1px solid #dfe9e8;padding:6px 8px}.modal .rel .tablewrap{border:1px solid #cde5e1}.rel-logo{height:52px;padding:0}.modal .rel::after{content:"DeoVita Clínicas · documento gerado pelo sistema";display:block;margin-top:18px;padding-top:6px;border-top:1px solid #cde5e1;font-size:10px;color:#6b7c7b}}
.drawer.drawer-pac{width:min(760px,100%)}
.drawer.drawer-pac .tabs{flex-wrap:wrap}
.drawer.drawer-pac .row{flex-wrap:wrap}
@media (max-width:640px){.drawer.drawer-pac{width:100%}.drawer.drawer-pac .kv{grid-template-columns:1fr}}
`;document.head.appendChild(st)}
