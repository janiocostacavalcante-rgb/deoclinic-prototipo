/* Rodada 21 (13/11/2026) · faturamento */
/* ==========================================================================
   Notas 686 a 692 (Convênios e TISS), 693 a 700 (Glosas e recursos) e 701/702 (Acerto entre postos).
   Fica depois da rodada 20: só acrescenta funções e embrulha ou redefine as que já existem.
   Padrão TISS da ANS: recurso, motivo da glosa e resposta ficam guardados. Nada é apagado:
   cada passo vira um registro novo no histórico, com quem fez e quando.
   ========================================================================== */

/* ---------- Peças comuns ---------- */
const ft21Val=id=>{try{const e=document.getElementById(id);return e&&e.value!=null?String(e.value):''}catch(e){return ''}};
const ft21Chk=id=>{try{const e=document.getElementById(id);return !!(e&&e.checked)}catch(e){return false}};
const ft21Html=(id,h)=>{try{const el=document.getElementById(id);if(el)el.innerHTML=h}catch(e){}};
const ft21Show=(id,on)=>{try{const el=document.getElementById(id);if(el&&el.style)el.style.display=on?'':'none'}catch(e){}};
const ft21Txt=(id,t)=>{try{const el=document.getElementById(id);if(el)el.textContent=t}catch(e){}};
const ft21Agora=()=>'04/11 '+hhmm(new Date());
const ft21Aud=(tela,t)=>{if(typeof f2Aud==='function')f2Aud(tela,t)};
const ft21Num=s=>{s=String(s==null?'':s).replace(/[^\d,.-]/g,'');if(!s)return NaN;if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');return parseFloat(s)};
const ft21R2=v=>Math.round(v*100)/100;
const ft21Tam=b=>{b=+b||0;if(b<1024)return b+' bytes';if(b<1048576)return Math.round(b/1024)+' KB';return (Math.round(b/104857.6)/10).toString().replace('.',',')+' MB'};
const ft21Id=s=>String(s).replace(/[^\w]/g,'_');
const ft21SomaDias=(dm,n)=>{const m=/^(\d\d)\/(\d\d)/.exec(dm||'');if(!m)return '';const d=new Date(2026,+m[2]-1,+m[1]+(+n||0));return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')};
const ft21SemTag=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
function ft21ComModal(fn,tr){const _om=openModal;openModal=function(h,cls){try{h=tr(String(h))}catch(e){}return _om.call(this,h,cls)};try{return fn()}finally{openModal=_om}}
function ft21ComDrawer(fn,tr){const _od=openDrawer;openDrawer=function(t,h){try{h=tr(String(h),t)}catch(e){}return _od.call(this,t,h)};try{return fn()}finally{openDrawer=_od}}
/* Insere um trecho antes da última linha de botões de uma gaveta ou janela */
const ft21AntesBotoes=(h,ins)=>{const i=h.lastIndexOf('<div class="row" style="margin-top:12px;gap:6px');return i<0?h+ins:h.slice(0,i)+ins+h.slice(i)};

/* ---------- Tabela de mensagens TISS (motivos de glosa) explicada em palavras simples ---------- */
const T21_COD={
 '1001':['Número da carteirinha inválido ou vencido','A carteirinha informada não valia no dia do atendimento (número errado ou vencida).','Confira a carteirinha e mande a cópia válida.','Recepção'],
 '1201':['Código do procedimento inválido','O código do exame na guia não existe ou não vale mais na tabela TUSS.','Reapresente o item com o código TUSS correto.','Faturamento'],
 '1406':['Falta de justificativa clínica (CID)','Faltou o motivo médico (CID ou indicação clínica) para o exame.','Peça ao médico o relatório ou o CID e anexe.','Médico'],
 '1705':['Cobrança em duplicidade','A operadora entendeu que o mesmo exame foi cobrado duas vezes.','Mostre que são dois atendimentos diferentes ou aceite a perda.','Faturamento'],
 '1803':['Procedimento sem autorização prévia','O exame precisava de autorização da operadora antes, e a guia não trouxe o número dela.','Anexe a senha ou o protocolo da autorização.','Recepção'],
 '1909':['Valor apresentado acima do contratado','O valor cobrado ficou acima do que está no contrato com a operadora.','Confira a tabela vigente; se o valor estiver certo, mande a tabela assinada.','Faturamento']};
const T21_PROC={'40302040':'Hemograma completo','40301630':'Glicose','40316530':'TSH','40301710':'Colesterol total','40901122':'US abdome total','10101012':'Consulta em consultório','40901467':'US transvaginal','40304361':'Hemograma completo'};
const ft21ProcNome=c=>T21_PROC[c]||(typeof PROC==='function'&&PROC(c)&&PROC(c).n)||('Procedimento '+c);
function ft21MotivoCard(cod,motTxt){const c=T21_COD[cod];return `<div class="ft21-mot" role="note"><div class="ft21-mot-t">Motivo da glosa</div><div><b class="mono">${esc(cod||'sem código')}</b> · <b>${esc(c?c[0]:motTxt||'motivo não informado')}</b></div>${c?`<small><b>O que quer dizer:</b> ${esc(c[1])}</small><small><b>Como resolver:</b> ${esc(c[2])}</small><small><b>Área que costuma causar:</b> ${esc(c[3])}</small>`:''}</div>`}

/* ==========================================================================
   ANEXOS: input de arquivo de verdade. Guarda nome, tamanho e tipo na memória do protótipo.
   ========================================================================== */
const T21_RASC={};               // anexos escolhidos e ainda não enviados, por formulário
const T21_ACEITA='.pdf,.jpg,.jpeg,.png,.xml,.doc,.docx,.xls,.xlsx,.txt';
const T21_MAX=10*1048576;
const ft21AnxNovo=(f,orig)=>({nome:String(f&&f.name||'arquivo'),tam:+(f&&f.size)||0,tipo:String(f&&f.type||'')||'tipo não informado',orig:orig||'computador'});
function ft21AnxLista(k){const a=T21_RASC[k]||[];if(!a.length)return '<p class="tl ft21-anx-vazio">Nenhum arquivo do computador incluído ainda.</p>';
 return `<ul class="ft21-anxl">${a.map((x,i)=>`<li><span class="ft21-anx-n">${esc(x.nome)}</span><small>${ft21Tam(x.tam)} · ${esc(x.tipo)}</small><button type="button" class="btn sm ghost" onclick="ft21AnxTirar('${k}',${i})" aria-label="Tirar ${esc(x.nome)} da lista">Tirar</button></li>`).join('')}</ul>`}
function ft21AnxCampo(k,rot,dica){T21_RASC[k]=[];
 return `<div class="field ft21-anx"><span class="ft21-lab">${rot}</span><input type="file" id="ft21Arq_${k}" class="ft21-file" multiple accept="${T21_ACEITA}" onchange="ft21AnxAdd('${k}',this)" aria-label="${esc(ft21SemTag(rot))}: escolher arquivos no computador">
 <label for="ft21Arq_${k}" class="ft21-drop" ondragover="event.preventDefault();this.classList.add('on')" ondragleave="this.classList.remove('on')" ondrop="ft21AnxDrop(event,'${k}')"><b>Incluir arquivos salvos no computador</b><span>${dica||'Clique para escolher ou arraste aqui. PDF, imagem, XML ou documento, até 10 MB cada.'}</span><span class="btn sec sm">Escolher arquivos</span></label>
 <div id="ft21AnxL_${k}">${ft21AnxLista(k)}</div><div class="msg" id="ft21AnxMsg_${k}"></div></div>`}
function ft21AnxArquivos(k,files){const a=T21_RASC[k]=T21_RASC[k]||[];const erros=[];let n=0;
 Array.from(files||[]).forEach(f=>{const nm=String(f&&f.name||'');if(!/\.(pdf|jpe?g|png|xml|docx?|xlsx?|txt)$/i.test(nm)){erros.push(`"${nm}" não é de um tipo aceito`);return}
  if((+f.size||0)>T21_MAX){erros.push(`"${nm}" passa de 10 MB`);return}
  if(a.some(x=>x.nome===nm&&x.tam===(+f.size||0))){erros.push(`"${nm}" já está na lista`);return}a.push(ft21AnxNovo(f));n++});
 ft21Html('ft21AnxL_'+k,ft21AnxLista(k));ft21Html('ft21AnxMsg_'+k,erros.length?esc('Não incluído: '+erros.join('; ')+'.'):'');
 if(erros.length)toast('Alguns arquivos não entraram: '+erros.join('; '),'warn');else if(n)toast(n===1?'Arquivo incluído na lista de anexos':n+' arquivos incluídos na lista de anexos');return a}
function ft21AnxAdd(k,inp){const r=ft21AnxArquivos(k,inp&&inp.files);try{inp.value=''}catch(e){}return r}
function ft21AnxDrop(ev,k){try{ev.preventDefault();if(ev.currentTarget&&ev.currentTarget.classList)ev.currentTarget.classList.remove('on');ft21AnxArquivos(k,ev.dataTransfer&&ev.dataTransfer.files)}catch(e){}}
function ft21AnxTirar(k,i){const a=T21_RASC[k]||[];a.splice(i,1);ft21Html('ft21AnxL_'+k,ft21AnxLista(k))}
const ft21AnxPegar=k=>{const a=(T21_RASC[k]||[]).map(x=>Object.assign({},x));T21_RASC[k]=[];return a};
const ft21AnxVer=a=>a&&a.length?`<ul class="ft21-anxl ro">${a.map(x=>`<li><span class="ft21-anx-n">${esc(x.nome)}</span><small>${ft21Tam(x.tam)} · ${esc(x.tipo)}${x.orig==='da guia'?' · já estava na guia':' · enviado do computador'}</small></li>`).join('')}</ul>`:'<span class="tl">sem anexos</span>';
/* Documentos que já estão na guia, para marcar e mandar junto */
function ft21DocsGuia(k,docs){return `<div class="field"><span class="ft21-lab">Documentos que já estão na guia</span><div class="ft21-docs">${docs.map((d,i)=>`<label class="ft21-chk"><input type="checkbox" id="ft21Doc_${k}_${i}" ${d.marcado?'checked':''}> ${esc(d.nome)} <small class="tl">${ft21Tam(d.tam)}</small></label>`).join('')}</div></div>`}
const ft21DocsMarcados=(k,docs)=>docs.filter((d,i)=>ft21Chk(`ft21Doc_${k}_${i}`)).map(d=>({nome:d.nome,tam:d.tam,tipo:d.tipo,orig:'da guia'}));

/* ==========================================================================
   HISTÓRICO DA GLOSA (rastreabilidade): recurso, anexos, resposta e perda, por número da guia
   ========================================================================== */
const T21_HIST={
 'SADT 0812':[{tipo:'recurso',rec:'REC-0412',h:'30/10 10:42',por:'Lúcia',jus:'Procedimento autorizado por telefone em 12/09, senha 554120 (protocolo da operadora anexado).',resp:'29/11',anx:[{nome:'Protocolo de autorização 554120.pdf',tam:182340,tipo:'application/pdf',orig:'computador'},{nome:'Pedido médico.jpg',tam:412880,tipo:'image/jpeg',orig:'da guia'}]}],
 'SADT 0801':[{tipo:'recurso',rec:'REC-0409',h:'24/10 15:10',por:'Rafael',jus:'Indicação clínica e CID N93.9 informados pela médica solicitante (relatório anexo).',resp:'23/11',anx:[{nome:'Relatório médico Dra Renata.pdf',tam:96512,tipo:'application/pdf',orig:'computador'},{nome:'Guia SP/SADT assinada.pdf',tam:233472,tipo:'application/pdf',orig:'da guia'}]}],
 'SADT 0407':[{tipo:'recurso',rec:'REC-0398',h:'01/10 09:05',por:'Lúcia',jus:'Carteirinha válida até 12/2027; cópia da carteirinha e do documento anexadas.',resp:'31/10',anx:[{nome:'Carteirinha frente e verso.jpg',tam:530000,tipo:'image/jpeg',orig:'computador'}]},{tipo:'resposta',r:'Revertida',h:'28/10 11:30',por:'Lúcia',txt:'Operadora aceitou o recurso: R$ 150,00 voltam a receber.'}],
 'SADT 0790':[{tipo:'perda',h:'22/10 17:02',por:'Jânio',m:'Cobrança em duplicidade confirmada: o exame foi lançado duas vezes no mesmo atendimento. Prazo de recurso vencido.'}],
 'SADT 0777':[{tipo:'recurso',rec:'REC-0391',h:'20/09 10:00',por:'Lúcia',jus:'Autorização A7E1-2204 emitida antes do atendimento (comprovante anexo).',resp:'20/10',anx:[{nome:'Autorização A7E1-2204.pdf',tam:150000,tipo:'application/pdf',orig:'computador'}]},{tipo:'resposta',r:'Revertida',h:'10/10 14:20',por:'Lúcia',txt:'Operadora aceitou o recurso: R$ 24,60 voltam a receber.'}]};
const ft21HistAdd=(gg,e)=>{const r=Object.assign({h:ft21Agora(),por:FN_USU},e);(T21_HIST[gg]=T21_HIST[gg]||[]).push(r);return r};
const ft21GlPorGuia=gg=>F2_GL.find(x=>x.g===gg);
const ft21Perda=gg=>{const a=(T21_HIST[gg]||[]).filter(e=>e.tipo==='perda'||e.tipo==='perda-pedido');return a.length?a[a.length-1]:null};
const ft21RecUlt=gg=>{const a=(T21_HIST[gg]||[]).filter(e=>e.tipo==='recurso');return a.length?a[a.length-1]:null};
function ft21HistLinhas(gg){const g=ft21GlPorGuia(gg),l=g&&glLote(g.l),out=[];
 if(g)out.push({t:'Glosa recebida no demonstrativo',h:l&&l.dem?l.dem:'data do demonstrativo',por:'operadora · lote '+g.l,det:`<b>Motivo da glosa:</b> ${esc(g.cod)} · ${esc(g.mot)} · ${fmt(g.v)}`});
 (T21_HIST[gg]||[]).forEach(e=>{
  if(e.tipo==='recurso')out.push({t:`Recurso ${esc(e.rec||'')} enviado`,h:e.h,por:e.por,det:`<div class="ft21-jus"><b>Justificativa enviada:</b> ${esc(e.jus)}</div><div><b>Anexos enviados (${(e.anx||[]).length}):</b>${ft21AnxVer(e.anx)}</div>${e.resp?`<small class="tl">Resposta esperada até ${esc(e.resp)}</small>`:''}`});
  else if(e.tipo==='resposta')out.push({t:'Resposta da operadora: '+esc(e.r),h:e.h,por:e.por,det:esc(e.txt||'')});
  else if(e.tipo==='perda')out.push({t:'Perda aceita',h:e.h,por:e.por,det:'<b>Motivo da perda:</b> '+esc(e.m)});
  else if(e.tipo==='perda-pedido')out.push({t:'Perda enviada para aprovação do Administrador',h:e.h,por:e.por,det:'<b>Motivo da perda:</b> '+esc(e.m)});
  else if(e.tipo==='perda-aprovada')out.push({t:'Perda aprovada',h:e.h,por:e.por,det:''})});
 return out}
function ft21HistHtml(gg){const a=ft21HistLinhas(gg);return `<h4 style="margin-top:12px">Histórico do recurso ${typeof info==='function'?info('Tudo o que aconteceu com esta glosa, em ordem: quando chegou, a justificativa e os anexos enviados, quem enviou e quando, e a resposta. Padrão TISS da ANS: nada aqui é apagado.'):''}</h4>
 <ol class="ft21-hist">${a.length?a.map(x=>`<li><div class="ft21-hist-t"><b>${x.t}</b><small>${esc(x.h)} · ${esc(x.por)}</small></div>${x.det?`<div class="ft21-hist-d">${x.det}</div>`:''}</li>`).join(''):'<li><span class="tl">Nenhum registro ainda.</span></li>'}</ol>`}
function ft21GlExportar(gg){const a=ft21HistLinhas(gg);
 if(typeof r17Baixar==='function')r17Baixar('historico-glosa-'+ft21Id(gg)+'.csv',r17Csv([['Guia','Quando','Quem','O que aconteceu','Detalhes'],...a.map(x=>[gg,x.h,x.por,ft21SemTag(x.t),ft21SemTag(x.det)])]));
 ft21Aud('Glosas e recursos',`Histórico da glosa ${gg} exportado`);toast('Histórico da glosa baixado (Excel)');return a.length}
function ft21PerdaHtml(g){const p=ft21Perda(g.g),ap=(T21_HIST[g.g]||[]).filter(e=>e.tipo==='perda-aprovada').pop();
 if(p)return `<div class="ft21-perda"><div class="ft21-mot-t">Motivo da perda</div><div>${esc(p.m)}</div><small class="tl">${p.tipo==='perda-pedido'?'Pedida por':'Aceita por'} ${esc(p.por)} em ${esc(p.h)}${ap?` · aprovada por ${esc(ap.por)} em ${esc(ap.h)}`:p.tipo==='perda-pedido'?' · aguardando o Administrador':''}</small></div>`;
 if(/Perda/.test(g.st||''))return `<div class="ft21-perda"><div class="ft21-mot-t">Motivo da perda</div><div class="tl">Motivo não registrado nesta glosa de exemplo.</div></div>`;
 return `<div class="ft21-perda vazio"><div class="ft21-mot-t">Motivo da perda</div><div class="tl">Ainda não é perda. Se a clínica desistir de recorrer, o motivo é obrigatório e aparece aqui, com quem aceitou e quando.</div></div>`}

/* ==========================================================================
   GUIAS DE CADA LOTE (dados de exemplo gerados sempre iguais, para as listas de guias)
   ========================================================================== */
const T21_ENV={};   // 689: registro de envio por lote (observações e anexos)
const T21_TSLOTES={'UNI-2026-10':{c:'Unimed Fortaleza',p:'out/2026',n:118,v:41260,s:'Aberto'},'HAP-2026-10':{c:'Hapvida',p:'out/2026',n:72,v:19820,s:'Fechado (XML)'},'UNI-2026-09':{c:'Unimed Fortaleza',p:'set/2026',n:131,v:44902,s:'Conciliado'},'HAP-2026-09':{c:'Hapvida',p:'set/2026',n:69,v:18310,s:'Encerrado'}};
const T21_BASE={'UNI-2026-10':921,'HAP-2026-10':4101,'UNI-2026-09':2101,'HAP-2026-09':3101,'BRA-2026-09':5101,'CAM-2026-11':6101};
const T21_NOMES=['Antônia Ribeiro','Benedito Sales','Cláudia Menezes','Daniel Freitas','Elaine Barros','Fábio Nogueira','Gilvan Costa','Helena Prado','Iracema Lopes','João Batista Reis','Karina Moura','Luciano Teles','Marta Viana','Nilson Araújo','Otávia Sena','Paulo Roberto Dias','Quitéria Gomes','Renato Farias','Sandra Pinheiro','Tiago Holanda'];
const T21_GC={};
function ft21LoteInfo(l){const t=T21_TSLOTES[l],f=typeof glLote==='function'?glLote(l):null;
 if(t)return {l,c:t.c,p:t.p,n:t.n,v:t.v,s:(T21_ENV[l]||[]).length&&t.s==='Fechado (XML)'?'Enviado':t.s,f};
 if(f)return {l,c:f.c,p:f.comp,n:f.guias,v:f.env,s:f.st,f};return {l,c:'convênio',p:'',n:0,v:0,s:'',f:null}}
function ft21Guias(l){if(T21_GC[l])return T21_GC[l];const inf=ft21LoteInfo(l),n=inf.n,base=T21_BASE[l]||7101;
 let s=0;for(const ch of l)s=(s*31+ch.charCodeAt(0))%233280;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280};
 const mes=(/^(\w{3})\//.exec(inf.p)||[])[1]||'out',mm={jan:'01',fev:'02',mar:'03',abr:'04',mai:'05',jun:'06',jul:'07',ago:'08',set:'09',out:'10',nov:'11',dez:'12'}[mes]||'10';
 const a=[];for(let k=0;k<n;k++){const num='SADT '+String(base+k).padStart(4,'0'),ts=typeof TS_GUIAS!=='undefined'?TS_GUIAS.find(x=>x.g===num):null;const d=String(1+Math.floor(rnd()*28)).padStart(2,'0')+'/'+mm;
  a.push(ts?{g:num,pac:ts.n,ex:+ts.e||1,v:ft21Num(ts.v),fixo:1,d}:{g:num,pac:T21_NOMES[Math.floor(rnd()*T21_NOMES.length)],ex:1+Math.floor(rnd()*4),w:.5+rnd(),v:0,d})}
 F2_GL.filter(x=>x.l===l&&!a.some(y=>y.g===x.g)).forEach((x,i)=>{const k=Math.min(n-1,2+i*3);if(k>=0)a[k]=Object.assign(a[k],{g:x.g,pac:x.pac,fixo:0,w:a[k].w||1})});
 const fix=a.filter(x=>x.fixo).reduce((t,x)=>t+x.v,0),livres=a.filter(x=>!x.fixo),ws=livres.reduce((t,x)=>t+x.w,0),resto=inf.v-fix;let soma=0;
 livres.forEach((x,i)=>{x.v=i===livres.length-1?ft21R2(resto-soma):ft21R2(resto*x.w/ws);soma=ft21R2(soma+x.v)});
 return T21_GC[l]=a}
function ft21GuiaSit(l,x){const g=F2_GL.find(y=>y.g===x.g&&y.l===l),inf=ft21LoteInfo(l),f=inf.f;
 if(g)return `<span class="badge ${GL_ST[g.st]||'err'}">glosada · ${esc(g.st)}</span>`;if(f&&f.dem)return '<span class="badge ok">paga</span>';
 if(inf.s==='Aberto'||inf.s==='Em montagem')return '<span class="badge neutral">no lote, ainda não enviada</span>';return '<span class="badge info">enviada · aguardando retorno</span>'}
function ft21GuiaVer(l,gg){try{closeModal()}catch(e){}if(typeof TS_GUIAS!=='undefined'&&TS_GUIAS.some(x=>x.g===gg)){tsGuia(gg);return}
 const x=ft21Guias(l).find(y=>y.g===gg);if(!x)return;const g=F2_GL.find(y=>y.g===gg);
 openDrawer('Guia '+esc(gg),`${kvs([['Beneficiário',`<b>${esc(x.pac)}</b>`],['Lote',esc(l)+' · '+esc(ft21LoteInfo(l).c)],['Atendimento',esc(x.d)],['Exames',String(x.ex)],['Valor',fmt(x.v)],['Situação',ft21GuiaSit(l,x)]])}${g?ft21MotivoCard(g.cod,g.mot)+`<div class="row" style="margin-top:12px;gap:6px"><button class="btn sec" onclick="closeDrawer();glItem('${g.id}')">Abrir a glosa</button></div>`:''}`)}

/* ==========================================================================
   CONVÊNIOS E TISS
   ========================================================================== */
const T21_RES={};   // 686: resolução de risco por guia (cada atualização vira um registro novo)
const T21_LOTE_AMOSTRA={res:[[10,'Autorização A7F3-1022 registrada','Lúcia','03/11 09:12'],[23,'Pedido médico digitalizado anexado','Lúcia','03/11 09:40'],[37,'Preço corrigido para a tabela vigente','Rafael','03/11 10:05'],[51,'Carteirinha atualizada (validade 12/2027)','Lúcia','03/11 11:20']],
 ret:[[60,'Retida: aguardando a senha da operadora','Rafael','03/11 14:02'],[71,'Retida: código TUSS vencido, aguardando a tabela nova','Rafael','03/11 14:30']]};

/* ---------- 686: botão Resolver abre a tela para colocar e ver as informações ---------- */
function ft21RiscoCampos(g){const r=String(g&&g.r||'');
 if(/autoriza/i.test(r))return [{id:'aut',rot:'Número da autorização ou senha',ph:'Ex.: A7F2-9910',req:1},{id:'dta',rot:'Data da autorização',ph:'dd/mm/aaaa',req:0}];
 if(/carteirinha/i.test(r))return [{id:'cart',rot:'Número da carteirinha',ph:'',val:g.c,req:1},{id:'val',rot:'Nova validade da carteirinha',ph:'mm/aaaa',req:1}];
 if(/pedido/i.test(r))return [];
 return [{id:'inf',rot:'O que foi feito',ph:'',req:1}]}
const ft21Risco=g=>{const u=(T21_RES[g.g]||[]).slice(-1)[0];return g.r||g.rRes||(u&&u.risco)||''};
function ft21Resolver(gg){const g=TS_GUIAS.find(x=>x.g===gg);if(!g)return;const k='res_'+ft21Id(gg),ult=(T21_RES[gg]||[]).slice(-1)[0],risco=ft21Risco(g),campos=ft21RiscoCampos({r:risco,c:g.c}),pedeArq=/pedido/i.test(risco);
 openModal(`${mh('Resolver risco · Guia '+esc(gg))}<div class="mb">${kvs([['Beneficiário',`<b>${esc(g.n)}</b>`],['Carteirinha',`<span class="mono">${esc(g.c)}</span>`],['Exames',esc(g.e)+' · '+esc(g.v)],['Risco de glosa',risco?`<span class="badge warn">${esc(risco)}</span>`:'<span class="badge ok">sem risco</span>']])}
 ${ult?`<div class="alert info ft21-alert"><span>Já resolvido por ${esc(ult.por)} em ${esc(ult.h)}. Salvar de novo cria um registro novo; o anterior fica guardado.</span></div>`:''}
 ${campos.map(c=>`<div class="field"><label for="ft21Res_${c.id}">${c.rot}${c.req?' <span class="req">*</span>':''}</label><input class="in" id="ft21Res_${c.id}" placeholder="${esc(c.ph)}" value="${esc(ult?((ult.campos.find(x=>x[0]===c.rot)||[])[1]||''):(c.val||''))}"></div>`).join('')}
 ${ft21AnxCampo(k,pedeArq?'Pedido médico digitalizado <span class="req">*</span>':'Anexos (opcional)',pedeArq?'Escolha o pedido médico digitalizado (PDF ou foto), até 10 MB.':'')}
 <div class="field"><label for="ft21ResObs">Observação</label><textarea class="in" id="ft21ResObs" rows="2" placeholder="Informação para quem for conferir a guia"></textarea></div>
 <p class="tl">Fica registrado com o seu nome e a hora. A guia sai da lista de risco e pode entrar no lote.</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="ft21ResOk('${gg}')">Salvar e resolver</button></div>`,'wide')}
function ft21ResOk(gg){const g=TS_GUIAS.find(x=>x.g===gg);if(!g)return null;const k='res_'+ft21Id(gg),risco=ft21Risco(g),campos=ft21RiscoCampos({r:risco,c:g.c});
 const vals=campos.map(c=>[c.rot,ft21Val('ft21Res_'+c.id).trim(),c.req]);const falta=vals.filter(v=>v[2]&&!v[1]);
 if(falta.length){toast('Preencha: '+falta.map(v=>v[0]).join(', '),'warn');return null}
 if(/pedido/i.test(risco)&&!(T21_RASC[k]||[]).length){toast('Inclua o pedido médico digitalizado: clique em "Escolher arquivos"','warn');ft21Txt('ft21AnxMsg_'+k,'Anexo obrigatório para este risco.');return null}
 const r={risco,campos:vals.filter(v=>v[1]).map(v=>[v[0],v[1]]),obs:ft21Val('ft21ResObs').trim(),anx:ft21AnxPegar(k),por:FN_USU,h:ft21Agora()};
 (T21_RES[gg]=T21_RES[gg]||[]).push(r);if(g.r){g.rRes=g.r;g.r='';g.x=0}
 ft21Aud('Convênios e TISS',`Risco da guia ${gg} resolvido (${risco})${r.campos.length?': '+r.campos.map(c=>c[0]+' '+c[1]).join('; '):''}${r.anx.length?'; anexos: '+r.anx.map(a=>a.nome).join(', '):''}${r.obs?'; observação: '+r.obs:''}`);
 try{closeModal();closeDrawer()}catch(e){}reView();toast('Risco resolvido e registrado na guia '+gg);return r}
function ft21ResHtml(gg){const a=T21_RES[gg]||[];if(!a.length)return '';const u=a[a.length-1];
 return `<div class="card ft21-resv"><h4>Resolução do risco</h4>${kvs([['Risco',esc(u.risco)],...u.campos.map(c=>[esc(c[0]),`<b>${esc(c[1])}</b>`]),['Observação',u.obs?esc(u.obs):'<span class="tl">sem observação</span>'],['Anexos',ft21AnxVer(u.anx)],['Resolvido por',esc(u.por)+' em '+esc(u.h)]])}
 ${a.length>1?`<details class="ft21-det"><summary>Registros anteriores (${a.length-1})</summary>${a.slice(0,-1).reverse().map(x=>`<p class="tl">${esc(x.h)} · ${esc(x.por)}: ${x.campos.map(c=>esc(c[0]+' '+c[1])).join('; ')||'sem campos'}${x.obs?' · '+esc(x.obs):''}${x.anx.length?' · '+x.anx.length+' anexo(s)':''}</p>`).join('')}</details>`:''}</div>`}
function ft21ResVer(gg){openModal(`${mh('Resolução · Guia '+esc(gg))}<div class="mb">${ft21ResHtml(gg)||'<p class="tl">Nada registrado.</p>'}</div><div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="ft21Resolver('${gg}')">Atualizar informações</button></div>`)}

/* Gaveta da guia: botão Resolver abre a tela e a resolução registrada aparece */
{const _g=tsGuia;tsGuia=function(id){const gg=(TS_GUIAS.find(x=>x.g===id)||TS_GUIAS[0]).g;return ft21ComDrawer(()=>_g.apply(this,arguments),h=>{
 h=h.replace(`<button class="btn" onclick="toast('Risco resolvido e registrado')">Resolver</button>`,`<button class="btn" onclick="ft21Resolver('${gg}')">Resolver</button>`);
 if((T21_RES[gg]||[]).length)h=ft21AntesBotoes(h,ft21ResHtml(gg)+`<div class="row" style="margin-top:8px;gap:6px"><button class="btn sm sec" onclick="ft21Resolver('${gg}')">Atualizar informações</button></div>`);return h})}}

/* ---------- 687: no fechamento do lote, cada número abre a lista das guias ---------- */
function ft21LoteGrupos(){const l='UNI-2026-10',a=ft21Guias(l),pk=i=>a[Math.max(0,Math.min(a.length-1,i))],acha=gg=>a.find(y=>y.g===gg)||pk(0);
 const resTs=TS_GUIAS.filter(g=>(T21_RES[g.g]||[]).length).map(g=>{const u=T21_RES[g.g].slice(-1)[0];return {x:acha(g.g),acao:'Resolvido: '+(u.campos.map(c=>c[0]+' '+c[1]).join('; ')||(u.anx.length?u.anx.length+' anexo(s)':u.risco)),por:u.por,h:u.h}});
 return {todas:a.map(x=>({x})),
  res:T21_LOTE_AMOSTRA.res.map(([i,acao,por,h])=>({x:pk(i),acao,por,h})).concat(resTs),
  ret:T21_LOTE_AMOSTRA.ret.map(([i,acao,por,h])=>({x:pk(i),acao,por,h})),
  seg:TS_GUIAS.filter(g=>g.r).map(g=>({x:acha(g.g),acao:'Segue com registro: '+g.r,por:'pré-faturamento',h:'03/11'}))}}
const T21_GRUPO_TIT={todas:'Todas as guias do lote',res:'Guias resolvidas',ret:'Guias retidas (ficam fora do lote)',seg:'Guias que seguem com registro'};
function ft21LoteMini(){const G=ft21LoteGrupos();return `<div class="mini ft21-mini">${miniKpi('Guias',String(G.todas.length),'clique para ver','',"ft21LoteGrupo('todas')")}${miniKpi('Resolvidas',String(G.res.length),'clique para ver','',"ft21LoteGrupo('res')")}${miniKpi('Retidas',String(G.ret.length),'ficam fora','',"ft21LoteGrupo('ret')")}${miniKpi('Seguem com registro',String(G.seg.length),'clique para ver','warn',"ft21LoteGrupo('seg')")}</div>`}
function ft21LoteGrupo(k){const G=ft21LoteGrupos(),a=G[k]||[],l='UNI-2026-10',det=k!=='todas';
 const h=`<div class="ft21-grp"><div class="row" style="justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h4 style="margin:0">${T21_GRUPO_TIT[k]||'Guias'} (${a.length})</h4><button class="btn sm ghost" onclick="ft21Html('ft21LoteDet','')">Esconder</button></div>
 <p class="tl" style="margin:4px 0 6px">Clique numa guia para abrir.</p>
 <div class="ft21-scroll">${tabela(det?['Guia','Paciente','Valor','O que foi feito','Quem e quando']:['Guia','Paciente','Atendimento','Exames','Valor'],a.map(({x,acao,por,h})=>`<tr class="clk" onclick="ft21GuiaVer('${l}','${x.g}')">${td('Guia',`<span class="mono">${x.g}</span>`)}${td('Paciente',esc(x.pac))}${det?td('Valor',fmt(x.v))+td('O que foi feito',esc(acao))+td('Quem e quando',esc(por)+' · '+esc(h)):td('Atendimento',x.d)+td('Exames',String(x.ex))+td('Valor',fmt(x.v))}</tr>`),'Nenhuma guia neste grupo')}</div></div>`;
 ft21Html('ft21LoteDet',h);return h}
{const _f=tsFecharLote;tsFecharLote=function(){return ft21ComModal(()=>_f.apply(this,arguments),h=>h.replace(/<div class="mini">[\s\S]*?<\/div><p class="tl">O XML/,ft21LoteMini()+'<div id="ft21LoteDet" class="ft21-lotedet"></div><p class="tl">O XML'))}}

/* ---------- 688: "Ver guias" mostra todas as guias enviadas no lote ---------- */
const ft21Norm=s=>(typeof semAc==='function'?semAc(String(s)):String(s).toLowerCase());
function ft21LoteGuiasTab(l,q){const a=ft21Guias(l),s=ft21Norm(q||'').trim(),f=a.filter(x=>!s||ft21Norm(x.g+' '+x.pac).includes(s));
 return `<p class="tl" style="margin-bottom:6px">Mostrando ${f.length} de ${a.length} guia(s). Clique numa guia para abrir.</p>${tabela(['Guia','Paciente','Atendimento','Exames','Valor','Situação'],f.map(x=>`<tr class="clk" onclick="ft21GuiaVer('${l}','${x.g}')">${td('Guia',`<span class="mono">${x.g}</span>`)}${td('Paciente',esc(x.pac))}${td('Atendimento',x.d)}${td('Exames',String(x.ex))}${td('Valor',fmt(x.v))}${td('Situação',ft21GuiaSit(l,x))}</tr>`),'Nenhuma guia com esta busca')}`}
function ft21LoteGuias(l){const inf=ft21LoteInfo(l),a=ft21Guias(l),tot=ft21R2(a.reduce((t,x)=>t+x.v,0));
 openModal(`${mh('Guias do lote '+esc(l))}<div class="mb">${kvs([['Convênio',esc(inf.c)],['Período',esc(inf.p)],['Guias no lote',String(a.length)],['Valor do lote',fmt(tot)],['Situação',esc(inf.s)]])}
 <div class="field" style="margin-top:10px"><label for="ft21LgQ">Buscar guia ou paciente</label><input class="in" id="ft21LgQ" oninput="ft21Html('ft21LgTab',ft21LoteGuiasTab('${l}',this.value))" placeholder="Ex.: SADT 0922 ou Maria"></div>
 <div id="ft21LgTab" class="ft21-scroll">${ft21LoteGuiasTab(l,'')}</div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="ft21LoteCsv('${l}')">${I.dl} Baixar a lista (Excel)</button></div>`,'wide');return a.length}
function ft21LoteCsv(l){const a=ft21Guias(l);if(typeof r17Baixar==='function')r17Baixar('guias-'+l+'.csv',r17Csv([['Guia','Paciente','Atendimento','Exames','Valor','Situação'],...a.map(x=>[x.g,x.pac,x.d,x.ex,r17N(x.v),ft21SemTag(ft21GuiaSit(l,x))])]));toast('Lista das guias do lote '+l+' baixada')}

/* ---------- 689: Registrar envio com observações e anexos ---------- */
function ft21Envio(l){const inf=ft21LoteInfo(l),k='env_'+ft21Id(l),reg=T21_ENV[l]||[],u=reg[reg.length-1];
 openModal(`${mh((u?'Envio do lote ':'Registrar envio · lote ')+esc(l))}<div class="mb">${kvs([['Convênio',esc(inf.c)],['Período',esc(inf.p)],['Guias',String(inf.n)],['Valor',fmt(inf.v)]])}
 ${reg.length?`<h4 style="margin-top:10px">Registros de envio</h4>${ft21EnvioHist(l)}<p class="tl" style="margin-top:6px">Para acrescentar uma observação ou um anexo, preencha abaixo: vira um registro novo e o anterior continua aqui.</p>`:''}
 <div class="grid g2" style="gap:8px;margin-top:8px"><div class="field"><label for="ft21EnvProt">Protocolo da operadora <span class="req">*</span></label><input class="in" id="ft21EnvProt" value="${esc(u?u.prot:'AN-7782110')}"></div>
 <div class="field"><label for="ft21EnvData">Data do envio <span class="req">*</span></label><input class="in" type="date" id="ft21EnvData" value="${u?u.data:'2026-11-04'}"></div></div>
 <div class="field"><label for="ft21EnvCanal">Como foi enviado</label><select class="in" id="ft21EnvCanal">${['Portal da operadora','Webservice TISS','Entregue em papel'].map(c=>`<option ${u&&u.canal===c?'selected':''}>${c}</option>`).join('')}</select></div>
 <div class="field"><label for="ft21EnvObs">Observações</label><textarea class="in" id="ft21EnvObs" rows="3" placeholder="Ex.: enviado pelo portal às 15h; a operadora pediu a cópia das guias em papel"></textarea></div>
 ${ft21AnxCampo(k,'Anexos (comprovante do portal, recibo, ofício)')}</div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="ft21EnvioOk('${l}')">${u?'Salvar novo registro':'Registrar envio'}</button></div>`,'wide')}
function ft21EnvioOk(l){const k='env_'+ft21Id(l),prot=ft21Val('ft21EnvProt').trim(),data=ft21Val('ft21EnvData').trim();
 if(!prot||!data){toast('Informe o protocolo da operadora e a data do envio','warn');return null}
 const r={prot,data,canal:ft21Val('ft21EnvCanal')||'Portal da operadora',obs:ft21Val('ft21EnvObs').trim(),anx:ft21AnxPegar(k),por:FN_USU,h:ft21Agora()};
 const novo=!(T21_ENV[l]||[]).length;(T21_ENV[l]=T21_ENV[l]||[]).push(r);
 ft21Aud('Convênios e TISS',`${novo?'Envio do lote registrado':'Novo registro no envio do lote'} ${l}: protocolo ${prot}, ${r.canal}${r.obs?'; observação: '+r.obs:''}${r.anx.length?'; anexos: '+r.anx.map(a=>a.nome).join(', '):''}`);
 try{closeModal();closeDrawer()}catch(e){}reView();toast(novo?`Envio registrado: protocolo ${prot}`:'Novo registro salvo no envio do lote');return r}
const ft21DataBr=d=>{const m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(d||'');return m?m[3]+'/'+m[2]+'/'+m[1]:d};
function ft21EnvioHist(l){const a=T21_ENV[l]||[];return `<ol class="ft21-hist">${a.map(r=>`<li><div class="ft21-hist-t"><b>Protocolo ${esc(r.prot)} · enviado em ${esc(ft21DataBr(r.data))} · ${esc(r.canal)}</b><small>registrado por ${esc(r.por)} em ${esc(r.h)}</small></div><div class="ft21-hist-d">${r.obs?'<b>Observações:</b> '+esc(r.obs):'<span class="tl">sem observações</span>'}<div><b>Anexos:</b>${ft21AnxVer(r.anx)}</div></div></li>`).join('')}</ol>`}

/* Gaveta do lote: Ver guias de verdade e o registro de envio */
{const _l=tsLote;tsLote=function(l,c,p,g,v,s,pr){return ft21ComDrawer(()=>_l.apply(this,arguments),h=>{
 h=h.replace(`<button class="btn ghost" onclick="TS_ABA='fila';closeDrawer();reView()">Ver guias</button>`,`<button class="btn ghost" onclick="ft21LoteGuias('${l}')">Ver guias</button>`);
 const reg=T21_ENV[l]||[];if(reg.length)h=ft21AntesBotoes(h,`<h4 style="margin-top:10px">Envio registrado</h4>${ft21EnvioHist(l)}`);
 if(/Fechado/.test(s)||reg.length)h=ft21AntesBotoes(h,`<div class="row" style="margin-top:8px;gap:6px"><button class="btn sec" onclick="ft21Envio('${l}')">${reg.length?'Acrescentar observação ou anexo':'Registrar envio'}</button></div>`);
 return h})}}

/* ---------- 690 a 692: gaveta da glosa com motivo, recurso com justificativa e anexos e histórico ---------- */
const ft21StTiss=st=>st==='Nova'?'Glosada':st;
const ft21BadgeTiss=s=>s==='Revertida'?'ok':s==='Glosada'?'err':s==='Perda aceita'||s==='Mantida'?'neutral':s==='Perda a aprovar'?'warn':'acc';
const T21_EXP=`<button class="btn ghost" onclick="toast('Histórico da glosa exportado')">`;
const ft21AnxRecDocs=r=>r&&r.anx&&r.anx.length?r.anx.map(a=>`<div class="at-row"><div class="grow">${esc(a.nome)}<small>anexo do recurso ${esc(r.rec||'')} · ${ft21Tam(a.tam)} · ${esc(a.tipo)}</small></div></div>`).join(''):'';
{const _t=tsGlosa;tsGlosa=function(gg,c,i,m,v,p,s){const x=ft21GlPorGuia(gg);if(x)s=ft21StTiss(x.st);const args=[gg,c,i,m,v,p,s],cod=x?x.cod:String(m).split(' ')[0];
 return ft21ComDrawer(()=>_t.apply(this,args),h=>{
  h=h.replace('<h4 style="margin-top:10px">Documentos</h4><div class="at-list">',ft21MotivoCard(cod,x?x.mot:m)+'<h4 style="margin-top:10px">Documentos</h4><div class="at-list">'+ft21AnxRecDocs(ft21RecUlt(gg)));
  h=h.replace(`<button class="btn" onclick="toast('Recurso enviado com a autorização anexada; prazo registrado')">Recorrer</button>`,x?`<button class="btn" onclick="ft21Recorrer('${x.id}')">Recorrer</button>`:'');
  if(x&&x.st==='Em recurso')h=h.replace(T21_EXP,`<button class="btn sec" onclick="glResposta('${x.id}')">Registrar resposta</button>`+T21_EXP);
  if((x&&/Perda/.test(x.st))||ft21Perda(gg)||/Perda/.test(s))h=ft21AntesBotoes(h,ft21PerdaHtml(x||{g:gg,st:s}));
  h=ft21AntesBotoes(h,ft21HistHtml(gg));
  return h.replace(`onclick="toast('Histórico da glosa exportado')"`,`onclick="ft21GlExportar('${gg}')"`)})}}

/* Tela TISS: risco resolvido, envio registrado e situação da glosa sempre igual à da tela de glosas */
{const _v=VIEWS.tiss;VIEWS.tiss=function(){let h=_v.apply(this,arguments);
 h=h.replace(/<tr class="clk" onclick="tsGuia\('([^']+)'\)">([\s\S]*?)<\/tr>/g,(m,gg,inn)=>{const reg=T21_RES[gg]||[];
  if(reg.length){const u=reg[reg.length-1];inn=inn.replace(/<td data-l="Riscos">[\s\S]*?<\/td>/,`<td data-l="Riscos"><span class="badge ok">risco resolvido</span><small class="tl" style="display:block">${esc(u.risco)} · ${esc(u.por)} ${esc(u.h)}</small></td>`).replace(/<td data-l="">[\s\S]*?<\/td>$/,`<td data-l=""><button class="btn sm ghost" onclick="event.stopPropagation();ft21ResVer('${gg}')">Ver resolução</button></td>`)}
  else inn=inn.replace(`onclick="event.stopPropagation();toast('Risco resolvido: autorização/documento registrado')"`,`onclick="event.stopPropagation();ft21Resolver('${gg}')"`);
  return `<tr class="clk" onclick="tsGuia('${gg}')">${inn}</tr>`});
 h=h.replace(/<button class="btn sm sec" onclick="toast\('Envio registrado: protocolo AN-7782110'\)">Registrar envio<\/button>/g,()=>(T21_ENV['HAP-2026-10']||[]).length?`<button class="btn sm ghost" onclick="event.stopPropagation();ft21Envio('HAP-2026-10')">Ver envio</button>`:`<button class="btn sm sec" onclick="event.stopPropagation();ft21Envio('HAP-2026-10')">Registrar envio</button>`);
 Object.keys(T21_ENV).forEach(l=>{const u=T21_ENV[l][T21_ENV[l].length-1];h=h.replace(new RegExp(`(onclick="tsLote\\('${l}','[^']*','[^']*','[^']*','[^']*',')Fechado \\(XML\\)','[^']*'\\)"([\\s\\S]*?)<span class="badge info">Fechado \\(XML\\)</span>([\\s\\S]*?<td data-l="Protocolo">)[^<]*(</td>)`),(m0,a,b,c2,d)=>`${a}Enviado','${esc(u.prot)}')"${b}<span class="badge info">Enviado</span>${c2}${esc(u.prot)}${d}`)});
 h=h.replace(/<tr class="clk" onclick="tsGlosa\('([^']+)','([^']*)','([^']*)','([^']*)','([^']*)','([^']*)','([^']*)'\)"([\s\S]*?)<\/tr>/g,(m,gg,c,i,mo,v,p,s,inn)=>{const x=ft21GlPorGuia(gg);if(!x)return m;const ns=ft21StTiss(x.st);
  inn=inn.replace(/<td data-l="Situação">[\s\S]*?<\/td>/,`<td data-l="Situação"><span class="badge ${ft21BadgeTiss(ns)}">${ns}</span>${x.rec?`<small class="tl" style="display:block">${esc(x.rec)}</small>`:''}</td>`).replace(/<td data-l="">[\s\S]*?<\/td>$/,`<td data-l="">${x.st==='Nova'?`<button class="btn sm sec" onclick="event.stopPropagation();ft21Recorrer('${x.id}')">Recorrer</button>`:''}</td>`);
  return `<tr class="clk" onclick="tsGlosa('${gg}','${c}','${i}','${mo}','${v}','${p}','${ns}')"${inn}</tr>`});
 return h}}

/* ==========================================================================
   GLOSAS E RECURSOS
   ========================================================================== */
/* ---------- 693/694 e 690: recurso com justificativa e anexos salvos no computador ---------- */
const ft21DocsDaGlosa=g=>[{nome:'Guia SP/SADT assinada.pdf',tam:233472,tipo:'application/pdf',marcado:1},{nome:'Pedido médico.jpg',tam:412880,tipo:'image/jpeg',marcado:1},g.cod==='1803'?null:{nome:'Autorização A7F2-9910.pdf',tam:120832,tipo:'application/pdf',marcado:0}].filter(Boolean);
function ft21Recorrer(id){const g=F2_G(id);if(!g)return;if(g.st!=='Nova'){toast(`Esta glosa está "${g.st}": o recurso já foi feito ou encerrado. Veja o histórico.`,'warn');glItem(id);return}return glRecorrer(id)}
{const _r=glRecorrer;glRecorrer=function(id){const g=F2_G(id),k='rec_'+id;return ft21ComModal(()=>_r.apply(this,arguments),h=>{
 h=h.replace(/<div class="field"><label>Anexos<\/label><div class="row"[^>]*>(?:<button[^>]*>[^<]*<\/button>)*<\/div><\/div>/,ft21MotivoCard(g.cod,g.mot)+ft21DocsGuia(k,ft21DocsDaGlosa(g))+ft21AnxCampo(k,'Anexos do computador','Clique para escolher ou arraste aqui: autorização, relatório, carteirinha. PDF, imagem, XML ou documento, até 10 MB cada.'));
 h=h.replace(`onclick="glRecOk('${id}')"`,`onclick="ft21RecOk('${id}')"`);
 return h.replace('Resposta esperada em até 30 dias.','Resposta esperada em até 30 dias. Justificativa, anexos, quem enviou e a data ficam guardados no histórico da glosa.')})}}
function ft21RecOk(id){const g=F2_G(id);if(!g)return null;const k='rec_'+id,j=ft21Val('glJus').trim();
 if(j.length<15){ft21Txt('glJusMsg','Escreva a justificativa (pelo menos 15 letras).');toast('Escreva a justificativa do recurso (pelo menos 15 letras)','warn');return null}
 const anx=ft21DocsMarcados(k,ft21DocsDaGlosa(g)).concat((T21_RASC[k]||[]).map(x=>Object.assign({},x)));
 if(!anx.length){ft21Txt('ft21AnxMsg_'+k,'Inclua pelo menos um anexo: marque um documento da guia ou escolha um arquivo do computador.');toast('Inclua pelo menos um anexo no recurso','warn');return null}
 const antes=g.rec;glRecOk(id);
 if(g.st==='Em recurso'&&g.rec&&g.rec!==antes){T21_RASC[k]=[];const e=ft21HistAdd(g.g,{tipo:'recurso',rec:g.rec,jus:j,anx,resp:ft21SomaDias('04/11',30)});
  ft21Aud('Glosas e recursos',`Anexos do recurso ${g.rec}: ${anx.map(a=>a.nome+' ('+ft21Tam(a.tam)+')').join(', ')}`);return e}return null}

/* ---------- 695: motivo da perda guardado e mostrado na glosa ---------- */
{const _p=glPerda;glPerda=function(id){const g=F2_G(id);const _m=f2Motivo;f2Motivo=function(t,x,cb,r,c){return _m.call(this,t,x+' O motivo fica guardado na glosa e aparece no histórico.',function(m){const out=cb(m);if(g)ft21HistAdd(g.g,{tipo:g.st==='Perda a aprovar'?'perda-pedido':'perda',m});return out},r,c)};try{return _p.apply(this,arguments)}finally{f2Motivo=_m}}}
{const _a=glAprovarPerda;glAprovarPerda=function(id){const g=F2_G(id),st=g&&g.st;const r=_a.apply(this,arguments);if(g&&st!=='Perda aceita'&&g.st==='Perda aceita')ft21HistAdd(g.g,{tipo:'perda-aprovada'});return r}}
{const _v=glRevertida;glRevertida=function(id){const g=F2_G(id);const r=_v.apply(this,arguments);if(g)ft21HistAdd(g.g,{tipo:'resposta',r:'Revertida',txt:`Operadora aceitou o recurso: ${fmt(g.v)} voltam a receber.`});return r}}
{const _r=glResposta;glResposta=function(id){return ft21ComModal(()=>_r.apply(this,arguments),h=>h.replace(`onclick="closeModal();glPerda('${id}')"`,`onclick="closeModal();ft21Mantida('${id}')"`))}}
function ft21Mantida(id){const g=F2_G(id);if(g)ft21HistAdd(g.g,{tipo:'resposta',r:'Mantida',txt:'Operadora manteve a glosa. A seguir, a perda com o motivo.'});return glPerda(id)}
{const _i=glItem;glItem=function(id){const g=F2_G(id);return ft21ComDrawer(()=>_i.apply(this,arguments),h=>{if(!g)return h;
 h=h.replace(/(<span>Motivo<\/span><div>[\s\S]*?<\/div>)/,`$1<span>O que quer dizer</span><div>${esc((T21_COD[g.cod]||[])[1]||'')}</div>`);
 h=h.replace('<h4 style="margin-top:10px">Documentos da guia</h4><div class="at-list">',ft21PerdaHtml(g)+'<h4 style="margin-top:10px">Documentos da guia</h4><div class="at-list">'+ft21AnxRecDocs(ft21RecUlt(g.g)));
 h=ft21AntesBotoes(h,ft21HistHtml(g.g)+`<div class="row" style="margin-top:8px;gap:6px"><button class="btn sm ghost" onclick="ft21GlExportar('${g.g}')">Exportar histórico</button></div>`);
 return h.replace(`onclick="glRecorrer('${id}')"`,`onclick="ft21Recorrer('${id}')"`)})}}
/* A lista de glosas também passa pela checagem do recurso */
{const _l=glItens;glItens=function(){return _l.apply(this,arguments).replace(/onclick="event\.stopPropagation\(\);glRecorrer\('(\w+)'\)"/g,`onclick="event.stopPropagation();ft21Recorrer('$1')"`)}}
/* Na aba Recursos, a data de envio e quem enviou vêm do histórico */
{const _r=glRecursos;glRecursos=function(){let h=_r.apply(this,arguments);F2_GL.filter(g=>g.rec).forEach(g=>{const e=(T21_HIST[g.g]||[]).find(x=>x.tipo==='recurso'&&x.rec===g.rec);if(e)h=h.replace(new RegExp(`(<span class="mono">${g.rec}</span>[\\s\\S]*?<td data-l="Enviado">)[^<]*(</td><td data-l="Resposta até">)[^<]*(</td>)`),(m0,a,b,c)=>`${a}${esc(e.h)} · ${esc(e.por)}${b}${esc(e.resp||'')}${c}`)});return h}}

/* ---------- 698: importar demonstrativo sempre mostra os itens com erro e o motivo ---------- */
let T21_IMP=null;const T21_IMPS=[];
const T21_IMP_EX=`<?xml version="1.0" encoding="ISO-8859-1"?>
<ans:mensagemTISS xmlns:ans="http://www.ans.gov.br/padroes/tiss/schemas">
<ans:demonstrativoAnaliseConta>
<ans:numeroLotePrestador>HAP-2026-10</ans:numeroLotePrestador>
<ans:numeroProtocolo>AN-7782110</ans:numeroProtocolo>
<ans:guia><ans:numeroGuiaPrestador>SADT 4101</ans:numeroGuiaPrestador><ans:codigoProcedimento>40302040</ans:codigoProcedimento><ans:valorInformado>210.50</ans:valorInformado><ans:valorLiberado>210.50</ans:valorLiberado></ans:guia>
<ans:guia><ans:numeroGuiaPrestador>SADT 4102</ans:numeroGuiaPrestador><ans:codigoProcedimento>40301630</ans:codigoProcedimento><ans:valorInformado>132.00</ans:valorInformado><ans:valorLiberado>132.00</ans:valorLiberado></ans:guia>
<ans:guia><ans:numeroGuiaPrestador>SADT 4103</ans:numeroGuiaPrestador><ans:codigoProcedimento>40316530</ans:codigoProcedimento><ans:valorInformado>261.00</ans:valorInformado><ans:valorLiberado>261.00</ans:valorLiberado></ans:guia>
<ans:guia><ans:numeroGuiaPrestador>SADT 4112</ans:numeroGuiaPrestador><ans:codigoProcedimento>40901122</ans:codigoProcedimento><ans:valorInformado>264.80</ans:valorInformado><ans:valorLiberado>200.00</ans:valorLiberado><ans:codigoGlosa>1406</ans:codigoGlosa></ans:guia>
<ans:guia><ans:numeroGuiaPrestador>SADT 4105</ans:numeroGuiaPrestador><ans:codigoProcedimento>10101012</ans:codigoProcedimento><ans:valorInformado>149.00</ans:valorInformado><ans:valorLiberado>145.00</ans:valorLiberado><ans:codigoGlosa>1909</ans:codigoGlosa></ans:guia>
<ans:guia><ans:numeroGuiaPrestador>SADT 0999</ans:numeroGuiaPrestador><ans:codigoProcedimento>40302040</ans:codigoProcedimento><ans:valorInformado>20.50</ans:valorInformado><ans:valorLiberado>20.50</ans:valorLiberado></ans:guia>
<ans:guia><ans:numeroGuiaPrestador>SADT 4103</ans:numeroGuiaPrestador><ans:codigoProcedimento>40316530</ans:codigoProcedimento><ans:valorInformado>261.00</ans:valorInformado><ans:valorLiberado>261.00</ans:valorLiberado></ans:guia>
<ans:guia><ans:numeroGuiaPrestador>SADT 4120</ans:numeroGuiaPrestador><ans:codigoProcedimento>40301710</ans:codigoProcedimento><ans:valorInformado>abc</ans:valorInformado><ans:valorLiberado>24.60</ans:valorLiberado></ans:guia>
<ans:guia><ans:numeroGuiaPrestador>SADT 4121</ans:numeroGuiaPrestador><ans:codigoProcedimento>40301630</ans:codigoProcedimento><ans:valorInformado>130.00</ans:valorInformado><ans:valorLiberado>122.00</ans:valorLiberado></ans:guia>
<ans:guia><ans:numeroGuiaPrestador>SADT 4122</ans:numeroGuiaPrestador><ans:codigoProcedimento>40302040</ans:codigoProcedimento><ans:valorInformado>120.50</ans:valorInformado><ans:valorLiberado>100.00</ans:valorLiberado><ans:codigoGlosa>9999</ans:codigoGlosa></ans:guia>
</ans:demonstrativoAnaliseConta>
</ans:mensagemTISS>`;
glImportar=function(l){T21_IMP=null;const lotes=F2_LOTES.filter(x=>x.prot),pad=l||((lotes.find(x=>x.st==='Enviado')||lotes[0]||{}).l);
 openModal(`${mh('Importar demonstrativo de retorno')}<div class="mb"><div class="field"><label for="glImpL">Lote</label><select class="in" id="glImpL" onchange="ft21ImpReanalisa()">${lotes.map(x=>`<option value="${x.l}" ${x.l===pad?'selected':''}>${x.l} · ${esc(x.c)} · ${esc(x.st)}</option>`).join('')}</select></div>
 <input type="file" id="ft21ImpArq" class="ft21-file" accept=".xml,.txt" onchange="ft21ImpArquivo(this)" aria-label="Escolher o XML do demonstrativo">
 <label for="ft21ImpArq" class="ft21-drop" ondragover="event.preventDefault();this.classList.add('on')" ondragleave="this.classList.remove('on')" ondrop="ft21ImpDrop(event)"><b>Arraste o XML do demonstrativo (análise da conta) aqui</b><span>ou clique para escolher no computador</span><span class="btn sec sm">Escolher arquivo</span><small id="ft21ImpNome"></small></label>
 <p class="tl" style="margin-top:6px">Não tem o XML à mão? <a href="#" onclick="event.preventDefault();ft21ImpExemplo()">Usar um demonstrativo de exemplo</a>.</p>
 <div id="ft21ImpPrev"></div>
 <p class="tl" style="margin-top:8px">Antes de gravar, mostramos guia a guia o que deu certo, as glosas e <b>os itens que deram erro, com o motivo</b>. Itens com erro não entram e ficam pendentes no lote para conferir com a operadora.</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" id="ft21ImpOk" onclick="ft21ImpConfirmar()">Importar</button></div>`,'wide')};
glImpOk=function(){return ft21ImpConfirmar()};
function ft21ImpArquivo(inp){ft21ImpLer(inp&&inp.files&&inp.files[0])}
function ft21ImpDrop(ev){try{ev.preventDefault();if(ev.currentTarget&&ev.currentTarget.classList)ev.currentTarget.classList.remove('on');ft21ImpLer(ev.dataTransfer&&ev.dataTransfer.files&&ev.dataTransfer.files[0])}catch(e){}}
function ft21ImpLer(f){if(!f)return;if(!/\.(xml|txt)$/i.test(f.name||'')){toast('Escolha o arquivo .xml do demonstrativo','warn');ft21Html('ft21ImpPrev',`<div class="alert err ft21-alert"><span>O arquivo "${esc(f.name||'')}" não é um .xml. Nada foi importado.</span></div>`);return}
 try{const r=new FileReader();r.onload=()=>ft21ImpPrevia(String(r.result||''),f.name);r.onerror=()=>toast('Não foi possível ler o arquivo','warn');r.readAsText(f,'ISO-8859-1')}catch(e){toast('Não foi possível ler o arquivo neste navegador','warn')}}
function ft21ImpExemplo(){return ft21ImpPrevia(T21_IMP_EX,'demonstrativo-exemplo-HAP-2026-10.xml')}
function ft21ImpReanalisa(){if(T21_IMP)ft21ImpPrevia(T21_IMP.txt,T21_IMP.nome)}
function ft21ImpPrevia(txt,nome){const l=ft21Val('glImpL')||'HAP-2026-10';T21_IMP=ft21ImpAnalisa(txt,l);T21_IMP.txt=txt;T21_IMP.nome=nome;
 ft21Html('ft21ImpNome','Arquivo: '+esc(nome));ft21Html('ft21ImpPrev',ft21ImpPrevHtml(T21_IMP));
 const n=T21_IMP.itens.filter(x=>x.st==='ok'||x.st==='glosa').length;try{const bt=document.getElementById('ft21ImpOk');if(bt){bt.textContent=n&&!T21_IMP.aviso?`Importar os ${n} itens sem erro`:'Nada para importar';if(bt.classList)bt.classList.toggle('ft21-off',!n||!!T21_IMP.aviso)}}catch(e){}return T21_IMP}
/* Lê o demonstrativo (XML TISS simplificado do exemplo): cada <guia> é um item */
function ft21ImpAnalisa(txt,l){const s=String(txt||''),r={lote:l,itens:[],aviso:''},lote=glLote(l);
 const tag=(b,t)=>{const m=new RegExp('<(?:\\w+:)?'+t+'>([^<]*)</(?:\\w+:)?'+t+'>','i').exec(b);return m?m[1].trim():''};
 if(!/demonstrativo/i.test(s)||!/<(?:\w+:)?guia>/i.test(s)){r.aviso='Este arquivo não parece um demonstrativo de retorno TISS (não tem as marcas do demonstrativo nem as guias). Peça à operadora o XML do demonstrativo de análise da conta.';return r}
 const lf=tag(s,'numeroLotePrestador');if(lf&&lf!==l){r.aviso=`O arquivo é do lote ${lf}, mas o lote escolhido é ${l}. Escolha o lote certo: nada foi importado.`;return r}
 const ja=lote&&lote.st!=='Enviado',guias=ft21Guias(l),vistos={};
 s.split(/<(?:\w+:)?guia>/i).slice(1).map(x=>x.split(/<\/(?:\w+:)?guia>/i)[0]).forEach((b,i)=>{const gg=tag(b,'numeroGuiaPrestador'),cp=tag(b,'codigoProcedimento'),vi=tag(b,'valorInformado'),vl=tag(b,'valorLiberado'),cg=tag(b,'codigoGlosa');
  const it={n:i+1,g:gg,proc:ft21ProcNome(cp),cp,vi:null,vl:null,cod:cg,st:'ok',det:''},nI=parseFloat(vi.replace(',','.')),nL=parseFloat(vl.replace(',','.')),okN=x=>/^-?\d+([.,]\d+)?$/.test(x);
  const gx=guias.find(y=>y.g===gg);
  if(!gg){it.st='erro';it.det='sem número da guia: não dá para saber de qual atendimento é'}
  else if(!gx){it.st='erro';it.det=`a guia ${gg} não está no lote ${l} (não foi enviada neste lote)`}
  else if(vistos[gg]){it.st='erro';it.det=`guia repetida no arquivo: já foi lida no item ${vistos[gg]}`}
  else if(!okN(vi)||isNaN(nI)){it.st='erro';it.det='valor informado inválido ('+(vi||'vazio')+')'}
  else if(!okN(vl)||isNaN(nL)){it.st='erro';it.det='valor liberado inválido ('+(vl||'vazio')+')'}
  else if(nL>nI){it.st='erro';it.det='a operadora liberou mais do que foi cobrado: confira com a operadora'}
  else if(nL<nI&&!cg){it.st='erro';it.det='a operadora pagou a menos e não informou o código da glosa: peça o motivo à operadora'}
  else if(cg&&!T21_COD[cg]){it.st='erro';it.det=`código de glosa ${cg} não existe na tabela de mensagens TISS`}
  else{it.vi=ft21R2(nI);it.vl=ft21R2(nL);it.pac=gx.pac;
   if(ja){it.st='dup';it.det='o demonstrativo deste lote já foi importado em '+(lote.dem||'data anterior')+': ignorado, nada duplicado'}
   else if(nL<nI){it.st='glosa';it.v=ft21R2(nI-nL);it.det=`glosa de ${fmt(it.v)}: ${cg} · ${T21_COD[cg][0]}`}
   else it.det='pago integralmente'}
  if(gg&&!vistos[gg])vistos[gg]=i+1;r.itens.push(it)});
 if(!r.itens.length)r.aviso='O arquivo não tem nenhuma guia.';return r}
function ft21ImpPrevHtml(r){if(!r)return '';if(r.aviso)return `<div class="alert err ft21-alert"><span><b>Nada foi importado.</b> ${esc(r.aviso)}</span></div>`;
 const g=k=>r.itens.filter(x=>x.st===k),ok=g('ok'),gl=g('glosa'),er=g('erro'),dup=g('dup');
 const tab=l=>tabela(['Item','Guia','Procedimento','Informado','Liberado','Resultado'],l.map(x=>`<tr data-det="0">${td('Item',String(x.n))}${td('Guia',`<span class="mono">${esc(x.g||'sem número')}</span>`)}${td('Procedimento',esc(x.proc))}${td('Informado',x.vi==null?'sem valor':fmt(x.vi))}${td('Liberado',x.vl==null?'sem valor':fmt(x.vl))}${td('Resultado',`<b class="ft21-st-${x.st}">${x.st==='ok'?'deu certo':x.st==='glosa'?'glosa':x.st==='dup'?'já importado':'deu errado'}</b><small class="tl" style="display:block">${esc(x.det)}</small>`)}</tr>`));
 return `<div class="ft21-imp-res"><div class="mini">${miniKpi('Deram certo',ok.length,'pagos integralmente','ok')}${miniKpi('Glosas',gl.length,gl.length?fmt(gl.reduce((t,x)=>t+x.v,0)):'nenhuma',gl.length?'warn':'')}${miniKpi('Deram errado',er.length,'não entram',er.length?'err':'')}${dup.length?miniKpi('Já importados',dup.length,'ignorados'):''}</div>
 ${er.length?`<h4 class="ft21-h-er">Itens com erro (${er.length})</h4><p class="tl">O motivo de cada erro está na última coluna. Esses itens não entram: confira com a operadora ou peça um arquivo novo.</p>${tab(er)}<button class="btn sm ghost" style="margin-top:6px" onclick="ft21ImpErrosCsv()">${I.dl} Baixar a lista dos erros (Excel)</button>`:'<div class="alert ok ft21-alert"><span>Nenhum item com erro neste arquivo.</span></div>'}
 ${gl.length?`<h4>Glosas (${gl.length})</h4>${tab(gl)}`:''}${ok.length?`<h4 class="ft21-h-ok">Deram certo (${ok.length})</h4>${tab(ok)}`:''}${dup.length?`<h4>Já importados (${dup.length})</h4>${tab(dup)}`:''}</div>`}
function ft21ImpErrosCsv(r){r=r||T21_IMP||T21_IMPS[T21_IMPS.length-1];if(!r)return 0;const er=(r.itens||r.erros||[]).filter(x=>!x.st||x.st==='erro');if(typeof r17Baixar==='function')r17Baixar('erros-demonstrativo-'+r.lote+'.csv',r17Csv([['Item','Guia','Procedimento','Motivo do erro'],...er.map(x=>[x.n,x.g,x.proc,x.det])]));toast('Lista dos erros baixada');return er.length}
const ft21ImpErrosHtml=reg=>`<h4 class="ft21-h-er">Itens com erro (${reg.erros.length})</h4>${tabela(['Item','Guia','Procedimento','Motivo do erro'],reg.erros.map(x=>`<tr data-det="0">${td('Item',String(x.n))}${td('Guia',`<span class="mono">${esc(x.g||'sem número')}</span>`)}${td('Procedimento',esc(x.proc))}${td('Motivo do erro',esc(x.det))}</tr>`))}`;
function ft21ImpConfirmar(){const r=T21_IMP;if(!r){toast('Escolha o XML do demonstrativo primeiro: clique na caixa ou arraste o arquivo','warn');return null}if(r.aviso){toast(r.aviso,'warn');return null}
 const ok=r.itens.filter(x=>x.st==='ok'),gl=r.itens.filter(x=>x.st==='glosa'),er=r.itens.filter(x=>x.st==='erro'),l=glLote(r.lote);
 if(!ok.length&&!gl.length){toast('Nenhum item sem erro para importar. Veja na lista o motivo de cada erro.','warn');return null}
 l.st='Demonstrativo recebido';l.dem='04/11';const prazo=ft21SomaDias('04/11',l.prazo||30),totG=ft21R2(gl.reduce((t,x)=>t+x.v,0));l.pago=ft21R2(l.env-totG);
 gl.forEach(x=>{const c=T21_COD[x.cod];F2_GL.unshift({id:'G'+(F2_GL.length+1),l:l.l,g:x.g,pac:x.pac,item:x.proc,cod:x.cod,mot:c[0],v:x.v,prazo,st:'Nova',area:c[3]})});
 const reg={lote:l.l,nome:r.nome,h:ft21Agora(),por:FN_USU,ok:ok.length,glosas:gl.length,erros:er.map(x=>({n:x.n,g:x.g,proc:x.proc,det:x.det}))};T21_IMPS.push(reg);
 ft21Aud('Glosas e recursos',`Demonstrativo de ${l.l} importado ("${r.nome||'arquivo'}"): ${ok.length} pago(s), ${gl.length} glosa(s) (${fmt(totG)}), ${er.length} item(ns) com erro que não entraram${er.length?': '+er.map(x=>x.g+' ('+x.det+')').join('; '):''}`);
 T21_IMP=null;try{closeModal()}catch(e){}GL_ABA='lotes';reView();
 openModal(`${mh('Demonstrativo importado · '+esc(l.l))}<div class="mb"><div class="alert ${er.length?'warn':'ok'} ft21-alert"><span>${ok.length} item(ns) pago(s) e ${gl.length} glosa(s) de ${fmt(totG)} lançada(s) com prazo de recurso até ${prazo}.${er.length?` <b>${er.length} item(ns) deram erro e não entraram</b>: veja o motivo abaixo. Eles ficam pendentes no lote.`:''}</span></div>
 ${er.length?ft21ImpErrosHtml(reg):''}</div><div class="mf">${er.length?`<button class="btn ghost" onclick="ft21ImpErrosCsv(T21_IMPS[${T21_IMPS.length-1}])">${I.dl} Baixar os erros</button>`:''}<button class="btn" onclick="closeModal()">Entendi</button></div>`,'wide');return reg}
/* Gaveta do lote (tela de glosas): importações com os itens que deram erro */
{const _d=glLoteDet;glLoteDet=function(id){return ft21ComDrawer(()=>_d.apply(this,arguments),h=>{const a=T21_IMPS.filter(x=>x.lote===id);if(!a.length)return h;
 return ft21AntesBotoes(h,`<h4 style="margin-top:12px">Importações do demonstrativo</h4>${a.map(x=>`<p class="tl">${esc(x.h)} · ${esc(x.por)} · "${esc(x.nome||'arquivo')}": ${x.ok} pago(s), ${x.glosas} glosa(s), <b>${x.erros.length} com erro</b></p>${x.erros.length?ft21ImpErrosHtml(x):''}`).join('')}`)})}}

/* ---------- 699/700: Corrigir mostra o que muda e pede o aceite antes de corrigir e enviar ---------- */
const T21_CORR={};
function ft21CorItens(x){const mot=x.mot.join(' ');
 if(/CID/.test(mot)||/CID/.test(x.acao))return [{campo:'CID da indicação clínica',antes:'em branco',inp:{id:'cid',ph:'Ex.: N93.9',rot:'CID informado pela médica'}},{campo:'Indicação clínica',antes:'em branco',depois:'preenchida com o CID informado'}];
 if(/senha|autoriza/i.test(x.acao))return [{campo:'Senha de autorização',antes:'não anexada',inp:{id:'senha',ph:'Ex.: 554120',rot:'Senha da operadora'},anx:1}];
 if(/valor/i.test(x.acao)){const m=/\(R\$ ([\d.,]+)\)/.exec(mot);const nv=m?ft21Num(m[1]):x.v;return [{campo:'Valor do procedimento',antes:fmt(x.v),depois:fmt(nv)+' (tabela vigente)',nv}]}
 if(/acidente/i.test(x.acao))return [{campo:'Indicação de acidente (TISS 4.02)',antes:'vazio',depois:'Não acidente'}];
 return [{campo:'Guia',antes:'como está',depois:x.acao}]}
function ft21Corrigir(i){const x=F2_IA[i];if(!x)return;const its=ft21CorItens(x),k='cor_'+ft21Id(x.g);
 openModal(`${mh('Corrigir guia '+esc(x.g))}<div class="mb">${kvs([['Paciente',esc(x.pac)],['Convênio',esc(x.conv)],['Procedimento',esc(ft21ProcNome(x.proc))+' · '+fmt(x.v)],['Risco de glosa',`<span class="badge ${x.risco>=60?'err':'warn'}">${x.risco}%</span>`]])}
 <h4 style="margin-top:10px">O que será corrigido</h4>${tabela(['Campo','Como está','Como fica'],its.map(c=>`<tr data-det="0">${td('Campo',`<b>${esc(c.campo)}</b>`)}${td('Como está',`<span class="ft21-antes">${esc(c.antes)}</span>`)}${td('Como fica',c.inp?`<input class="in" id="ft21Cor_${c.inp.id}" placeholder="${esc(c.inp.ph)}" aria-label="${esc(c.inp.rot)}">`:`<b class="ft21-depois">${esc(c.depois)}</b>`)}</tr>`))}
 ${its.some(c=>c.anx)?ft21AnxCampo(k,'Comprovante da autorização (opcional)'):''}
 <label class="ft21-chk ft21-aceite"><input type="checkbox" id="ft21CorAceite"> Conferi o que vai mudar e aceito corrigir a guia e enviar no próximo lote.</label>
 <p class="tl">A versão antiga da guia fica guardada. Fica registrado quem aceitou, quando e o que mudou.</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="ft21CorOk(${i})">Aceitar, corrigir e enviar</button></div>`,'wide')}
function ft21CorOk(i){const x=F2_IA[i];if(!x)return null;const its=ft21CorItens(x),k='cor_'+ft21Id(x.g);
 const falta=its.filter(c=>c.inp&&!ft21Val('ft21Cor_'+c.inp.id).trim());if(falta.length){toast('Preencha: '+falta.map(c=>c.inp.rot).join(', '),'warn');return null}
 if(!ft21Chk('ft21CorAceite')){toast('Marque o aceite: confira o que vai mudar antes de corrigir e enviar','warn');return null}
 const mud=its.map(c=>({campo:c.campo,antes:c.antes,depois:c.inp?ft21Val('ft21Cor_'+c.inp.id).trim():c.depois}));const cv=its.find(c=>c.nv!=null);
 const r=T21_CORR[x.g]={g:x.g,pac:x.pac,vAntes:x.v,mud,anx:ft21AnxPegar(k),por:FN_USU,h:ft21Agora(),aceite:true};if(cv)x.v=cv.nv;
 try{closeModal()}catch(e){}ft21Aud('Glosas e recursos',`Correção aceita por ${FN_USU} na guia ${x.g}: ${mud.map(m=>m.campo+' de "'+m.antes+'" para "'+m.depois+'"').join('; ')}`);glIAFix(i,'corrigida');return r}
function ft21CorVer(gg){const r=T21_CORR[gg];if(!r)return;openModal(`${mh('O que foi corrigido · '+esc(gg))}<div class="mb">${kvs([['Paciente',esc(r.pac)],['Aceito e corrigido por',esc(r.por)+' em '+esc(r.h)],['Envio','segue no próximo lote']])}${tabela(['Campo','Antes','Depois'],r.mud.map(m=>`<tr data-det="0">${td('Campo',`<b>${esc(m.campo)}</b>`)}${td('Antes',`<span class="ft21-antes">${esc(m.antes)}</span>`)}${td('Depois',`<b class="ft21-depois">${esc(m.depois)}</b>`)}</tr>`))}${r.anx.length?'<h4 style="margin-top:10px">Anexos</h4>'+ft21AnxVer(r.anx):''}</div><div class="mf"><button class="btn" onclick="closeModal()">Fechar</button></div>`)}
{const _g=glIA;glIA=function(){const h=_g.apply(this,arguments).replace(/onclick="glIAFix\((\d+),'corrigida'\)"/g,'onclick="ft21Corrigir($1)"');
 return h.split('<div class="f2-ia">').map((p,j)=>{if(!j)return p;const m=/^<div class="sc[^"]*">[^<]*<\/div><div class="bd"><b>([^·<]+?) ·/.exec(p);const gg=m&&m[1].trim();if(gg&&T21_CORR[gg])p=p.replace('<span class="badge ok">liberada</span>',`<span class="badge ok">corrigida</span><button class="btn sm ghost" onclick="ft21CorVer('${gg}')">Ver o que foi corrigido</button>`);return p}).join('<div class="f2-ia">')}}

/* ==========================================================================
   ACERTO ENTRE POSTOS · 701/702: motivo da contestação e campo de resposta ao escolher
   ========================================================================== */
const T21_PS=[{id:'c1',at:'12-00002211',ex:'Vitamina D',v:42,mot:'Convênio faturado pelo posto',txt:'exame foi faturado pelo posto, não pelo central',por:'Gestor do Posto 12',h:'31/10 16:20',anx:[{nome:'Guia faturada pelo posto.pdf',tam:248100,tipo:'application/pdf',orig:'computador'}],resp:[]}];
const T21_PS_OPC=[['Ajustado (entra como particular, R$ 42,00)','Explique o ajuste para o posto','Ex.: guia faturada pelo posto; o item entra como particular no próximo demonstrativo'],['Resolvido (sem mudança de valor)','Resposta para o posto','Ex.: conferido, o valor está certo e foi explicado ao gestor'],['Mantido (com justificativa)','Justificativa (obrigatória)','Ex.: o convênio foi faturado pelo central conforme o contrato']];
psContest=function(){const c=T21_PS[0];
 openModal(`${mh('Contestação · Posto 12 · outubro')}<div class="mb"><div class="at-list"><div class="at-row"><div class="grow">${esc(c.at)} · ${esc(c.ex)} · ${fmt(c.v)}<small>Contestado por ${esc(c.por)} em ${esc(c.h)}</small></div></div></div>
 <div class="ft21-mot" role="note" style="margin-top:10px"><div class="ft21-mot-t">Motivo da contestação</div><div><b>${esc(c.mot)}</b></div><small>O posto escreveu: "${esc(c.txt)}"</small><small><b>Anexo do posto:</b></small>${ft21AnxVer(c.anx)}</div>
 ${c.resp.length?`<h4 style="margin-top:10px">Respostas já dadas</h4><ol class="ft21-hist">${c.resp.map(r=>`<li><div class="ft21-hist-t"><b>${esc(r.r)}</b><small>${esc(r.h)} · ${esc(r.por)}</small></div><div class="ft21-hist-d">${esc(r.obs)}</div></li>`).join('')}</ol>`:''}
 <div class="field" style="margin-top:10px"><label for="ft21PsResp">Resposta do central <span class="req">*</span></label><select class="in" id="ft21PsResp" onchange="ft21PsSel(this.value)"><option value="">Escolha a resposta</option>${T21_PS_OPC.map(o=>`<option value="${esc(o[0])}">${esc(o[0])}</option>`).join('')}</select></div>
 <div class="field" id="ft21PsCampo" style="display:none"><label for="ft21PsObs" id="ft21PsLab">Resposta ou observação <span class="req">*</span></label><textarea class="in" id="ft21PsObs" rows="3" placeholder=""></textarea><div class="msg" id="ft21PsMsg"></div></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="ft21PsOk('${c.id}')">Responder</button></div>`)};
function ft21PsSel(v){const o=T21_PS_OPC.find(x=>x[0]===v);ft21Show('ft21PsCampo',!!o);if(!o)return false;ft21Html('ft21PsLab',esc(o[1])+' <span class="req">*</span>');try{const t=document.getElementById('ft21PsObs');if(t){t.placeholder=o[2];if(t.focus)t.focus()}}catch(e){}return true}
function ft21PsOk(id){const c=T21_PS.find(x=>x.id===id);if(!c)return null;const r=ft21Val('ft21PsResp'),o=ft21Val('ft21PsObs').trim();
 if(!r){toast('Escolha a resposta do central','warn');return null}if(o.length<10){ft21Txt('ft21PsMsg','Escreva a resposta ou observação (pelo menos 10 letras).');toast('Escreva a resposta ou observação para o posto (pelo menos 10 letras)','warn');return null}
 const e={r,obs:o,por:FN_USU,h:ft21Agora()};c.resp.push(e);const p=PS_LISTA.find(x=>x.x==='c');if(p)p.c=c.resp.length+' respondida(s)';
 ft21Aud('Acerto entre postos',`Contestação do item ${c.at} (${c.ex}) respondida: ${r}. Observação: ${o}`);try{closeModal()}catch(x){}reView();toast('Contestação respondida; o posto vê a resposta e pode aceitar o demonstrativo');return e}

/* ---------- Estilos da rodada ---------- */
try{document.head.insertAdjacentHTML('beforeend',`<style>
.ft21-file{position:absolute;opacity:0;width:1px;height:1px;overflow:hidden;pointer-events:none}
.ft21-lab{display:block;font-size:13px;font-weight:600;margin-bottom:4px}
.ft21-drop{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;border:2px dashed var(--border);border-radius:12px;padding:14px;cursor:pointer;transition:border-color .15s,background .15s}
.ft21-drop:hover,.ft21-drop.on,.ft21-file:focus+.ft21-drop{border-color:var(--accent);background:var(--accent-soft)}
.ft21-drop span{color:var(--fg2);font-size:13px}.ft21-drop .btn{color:inherit}.ft21-drop small{font-weight:700;color:var(--fg)}
.ft21-anxl{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:4px}
.ft21-anxl li{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;border:1px solid var(--border);border-radius:8px;padding:6px 10px;background:var(--surface2)}
.ft21-anxl .ft21-anx-n{font-weight:600;overflow-wrap:anywhere;flex:1 1 160px;min-width:0}.ft21-anxl small{color:var(--fg2)}
.ft21-anx-vazio{margin:6px 0 0}
.ft21-docs{display:flex;flex-direction:column;gap:4px}
.ft21-chk{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer}
.ft21-aceite{margin:12px 0 6px;padding:10px 12px;border:1px solid var(--accent);border-radius:10px;background:var(--accent-soft);font-weight:600}
.ft21-mot,.ft21-perda{display:flex;flex-direction:column;gap:3px;border:1px solid var(--border);border-left:4px solid var(--err);border-radius:10px;padding:10px 12px;margin-top:10px;background:var(--surface2);overflow-wrap:anywhere}
.ft21-perda{border-left-color:var(--fg2)}.ft21-perda.vazio{border-left-style:dashed}
.ft21-mot-t{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--fg2)}
.ft21-mot small,.ft21-perda small{display:block;font-size:13px}
.ft21-hist{list-style:none;margin:6px 0 0 6px;padding:0 0 0 14px;border-left:2px solid var(--border);display:flex;flex-direction:column;gap:10px}
.ft21-hist li{position:relative}.ft21-hist li:before{content:"";position:absolute;left:-20px;top:5px;width:10px;height:10px;border-radius:50%;background:var(--accent)}
.ft21-hist-t{display:flex;flex-direction:column}.ft21-hist-t small{color:var(--fg2)}
.ft21-hist-d{font-size:13px;margin-top:4px;overflow-wrap:anywhere}
.ft21-jus{white-space:pre-wrap;border:1px solid var(--border);border-radius:8px;padding:8px 10px;background:var(--surface);margin-bottom:6px}
.ft21-mini .m.clk{cursor:pointer}.ft21-lotedet{margin-top:10px}
.ft21-scroll{max-height:46vh;overflow:auto}
.ft21-resv{margin-top:12px;padding:12px}.ft21-resv h4{margin:0 0 8px}
.ft21-det summary{cursor:pointer;font-size:13px;margin-top:8px}
.ft21-alert{max-width:100%;box-sizing:border-box;flex-wrap:wrap}.ft21-alert>span{flex:1 1 0;min-width:0;white-space:normal;overflow-wrap:anywhere}
.ft21-imp-res{margin-top:10px}.ft21-imp-res h4{margin:12px 0 6px}
.ft21-h-ok,.ft21-st-ok{color:var(--ok)}.ft21-h-er,.ft21-st-erro{color:var(--err)}.ft21-st-glosa{color:var(--warn)}.ft21-st-dup{color:var(--fg2)}
.ft21-off{opacity:.55}
.ft21-antes{text-decoration:line-through;color:var(--fg2)}.ft21-depois{color:var(--ok)}
</style>`)}catch(e){}
