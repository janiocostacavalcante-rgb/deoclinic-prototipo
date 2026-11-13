/* Rodada 21 (13/11/2026) · cobranca */
/* ==========================================================================
   Notas 667 (Repasse médico), 668 a 681 (Carteira e cobrança) e 682 a 685 (Tabelas de preço).
   Fica depois da rodada 20: só acrescenta funções e embrulha ou redefine as que já existem.
   Nada é apagado de verdade: quem sai da listagem continua registrado e a auditoria guarda tudo.
   Pix, link de cartão e boleto são simulados (QR Code, chave e linha digitável ilustrativos).
   Mensagens de cobrança passam pela trava do Código de Defesa do Consumidor (art. 42: sem ameaça,
   sem expor o paciente e sem constrangimento).
   ========================================================================== */

/* ---------- Peças comuns ---------- */
const cb21G=id=>{try{const e=document.getElementById(id);return e&&e.value!=null?String(e.value):''}catch(e){return ''}};
const cb21Html=(id,h)=>{try{const el=document.getElementById(id);if(el)el.innerHTML=h}catch(e){}};
const cb21Aud=t=>{if(typeof x2Aud==='function')x2Aud('Carteira e cobrança',t)};
const cb21Q=s=>String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
const cb21Agora=()=>'04/11 '+hhmm(new Date());
const cb21Print=()=>{try{window.print()}catch(e){}};
const cb21Num=s=>{s=String(s==null?'':s).replace(/[^\d,.-]/g,'');if(!s)return NaN;if(s.includes(','))s=s.replace(/\./g,'').replace(',','.');return parseFloat(s)};
const cb21Baixar=(nome,linhas)=>{try{if(typeof r17Baixar==='function'&&typeof r17Csv==='function'){r17Baixar(nome,r17Csv(linhas));return true}}catch(e){}return false};
const cb21Hash=s=>[...String(s)].reduce((a,c)=>(a*131+c.charCodeAt(0))>>>0,17)||1;
function cb21Dig(seed,n){let s=cb21Hash(seed),o='';for(let i=0;i<n;i++){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;o+=s%10}return o}

/* Celulares com WhatsApp (dados de exemplo; no sistema real vêm do cadastro do paciente) */
const C21_TEL={'Carla Alves':'(85) 98877-1020','Marcos Vinícius Rocha':'(85) 99610-3344','Francisco das Chagas':'(85) 99232-4545','Sebastião Gomes':'(85) 98540-7781','Antônio Batista':'(85) 99999-1212','Rita de Cássia Lins':'(85) 98702-5560','Joana Darc Pereira':'(85) 99133-2208'};
function cb21Tel(n){if(C21_TEL[n])return C21_TEL[n];try{const p=(typeof PACIENTES!=='undefined'?PACIENTES:[]).find(x=>x.n===n);return p&&p.tel||''}catch(e){return ''}}
const cb21Cel=t=>{const d=String(t||'').replace(/\D/g,'');return d.length===11&&d[2]==='9'?d:''};
/* Menor de idade: a mensagem vai para o responsável */
const cb21Para=pac=>{const t=CRT_TIT.find(x=>x.pac===pac&&x.resp);return t?t.resp:pac};

/* ---------- WhatsApp (link wa.me) e copiar ---------- */
let C21_WA=null;
function cb21WaBox(pac){const para=cb21Para(pac),tel=cb21Tel(para),cel=cb21Cel(tel);
 return `<div class="cb21-wa"><div class="field"><label for="cb21WaTel">WhatsApp de ${esc(para)}${para!==pac?' (responsável)':''}</label><input class="in" id="cb21WaTel" inputmode="tel" value="${esc(cel?tel:'')}" placeholder="(85) 9 0000-0000"></div>${cel?'':`<p class="tl">${tel?'O telefone do cadastro ('+esc(tel)+') não é celular.':'Não há celular no cadastro.'} Digite o número do WhatsApp para enviar.</p>`}</div>`}
function cb21WaEnviar(){const w=C21_WA;if(!w)return null;const d=cb21Cel(cb21G('cb21WaTel'));if(!d){toast('Digite um celular com DDD (11 números, com 9 depois do DDD)','warn');return null}
 const url='https://wa.me/55'+d+'?text='+encodeURIComponent(w.msg);try{window.open(url,'_blank','noopener')}catch(e){}
 w.url=url;cb21Aud(`${w.aud} enviado pelo WhatsApp para ${w.para}`);toast('WhatsApp aberto com a mensagem para '+w.para.split(' ')[0]);return url}
function cb21Copiar(id){const v=cb21G(id);let ok=false;try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(v);ok=true}}catch(e){}
 if(!ok){try{const el=document.getElementById(id);if(el&&el.select){el.select();if(document.execCommand)document.execCommand('copy')}}catch(e){}}
 toast('Copiado. Agora é só colar onde precisar.');return v}

/* ---------- Pix: código copia e cola no padrão do Banco Central (chave fictícia) e QR Code desenhado ---------- */
const C21_CHAVE='00000000-0000-4000-8000-000000000021';
const cb21Tlv=(id,v)=>id+String(v.length).padStart(2,'0')+v;
function cb21Crc(s){let c=0xFFFF;for(let i=0;i<s.length;i++){c^=s.charCodeAt(i)<<8;for(let j=0;j<8;j++)c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c.toString(16).toUpperCase().padStart(4,'0')}
function cb21PixCod(valor,txid){const s=cb21Tlv('00','01')+cb21Tlv('26',cb21Tlv('00','BR.GOV.BCB.PIX')+cb21Tlv('01',C21_CHAVE))+cb21Tlv('52','0000')+cb21Tlv('53','986')+cb21Tlv('54',Number(valor||0).toFixed(2))+cb21Tlv('58','BR')+cb21Tlv('59','DEOVITA CLINICAS')+cb21Tlv('60','FORTALEZA')+cb21Tlv('62',cb21Tlv('05',txid))+'6304';return s+cb21Crc(s)}
function cb21Qr(txt){const N=29;let s=cb21Hash(txt);const rnd=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s};
 const olho=(x,y,ox,oy)=>{const a=x-ox,b=y-oy;if(a<0||b<0||a>6||b>6)return null;return a===0||a===6||b===0||b===6||(a>=2&&a<=4&&b>=2&&b<=4)};
 const zona=(x,y)=>(x<8&&y<8)||(x>=N-8&&y<8)||(x<8&&y>=N-8);
 let r='';for(let y=0;y<N;y++)for(let x=0;x<N;x++){let on;if(zona(x,y)){const a=olho(x,y,0,0),b=olho(x,y,N-7,0),c=olho(x,y,0,N-7);on=a!==null?a:b!==null?b:c!==null?c:false}else on=rnd()%100<46;if(on)r+=`<rect x="${x}" y="${y}" width="1.02" height="1.02"/>`}
 return `<svg class="cb21-qr" viewBox="-2 -2 ${N+4} ${N+4}" role="img" aria-label="QR Code ilustrativo"><rect x="-2" y="-2" width="${N+4}" height="${N+4}" fill="#fff"/><g fill="#111">${r}</g></svg>`}

const cb21Rot=(a,p)=>p.n?'parcela '+p.n:(a.n?'entrada':'pagamento à vista');
/* 677 e 680 (e 672 para Pix): QR Code na tela, copia e cola com botão de copiar e envio pelo WhatsApp */
function cb21Pix(id,i){const a=CRT_ACORDOS.find(x=>x.id===id),p=a&&a.parc[i];if(!p)return;const rot=cb21Rot(a,p),txid=(id.replace(/\W/g,'')+'P'+p.n+'DEO21').slice(0,25),cod=cb21PixCod(p.valor,txid),para=cb21Para(a.pac);
 p.pix={cod,txid,h:cb21Agora()};
 C21_WA={para,aud:`Pix da ${rot} de ${id} (${fmt(p.valor)})`,msg:`Olá, ${para.split(' ')[0]}. Aqui é a DeoVita Clínicas. Segue o Pix da ${rot} do seu acordo ${id}, no valor de ${fmt(p.valor)}, com vencimento em ${x2Dmy(p.venc)}.\n\nPix copia e cola:\n${cod}\n\nQualquer dúvida, é só responder esta mensagem.`};
 cb21Aud(`Pix da ${rot} de ${id} gerado (${fmt(p.valor)}, identificador ${txid})`);
 openModal(`${mh('Pix · '+id+' · '+rot)}<div class="mb"><div class="cb21-pix">${cb21Qr(cod)}<div class="grow">${kvs([['Paciente',esc(a.pac)],['Valor',`<b>${fmt(p.valor)}</b>`],['Vencimento',x2Dmy(p.venc)],['Identificador',`<span class="mono">${txid}</span>`]])}
 <p class="tl cb21-ilu">QR Code e chave ilustrativos do protótipo: não servem para pagar. No sistema real o banco gera o Pix e a baixa vem sozinha pela conciliação.</p></div></div>
 <div class="field" style="margin-top:10px"><label for="cb21PixCod">Pix copia e cola</label><textarea class="in mono cb21-cod" id="cb21PixCod" rows="3" readonly>${esc(cod)}</textarea></div>
 <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px"><button class="btn sec" onclick="cb21Copiar('cb21PixCod')">Copiar o Pix copia e cola</button></div>
 ${cb21WaBox(a.pac)}</div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn" onclick="cb21WaEnviar()">Enviar pelo WhatsApp</button></div>`)}

/* 678: 2ª via do boleto num modelo para baixar ou imprimir, com WhatsApp ao lado */
function cb21Linha(id,p){const d=cb21Dig(id+'-'+p.n,28),v=String(Math.round((p.valor||0)*100)).padStart(10,'0'),f=String(Math.abs(plDias('1997-10-07',p.venc))%9000+1000);
 return `00090.${d.slice(0,5)} ${d.slice(5,10)}.${d.slice(10,16)} ${d.slice(16,21)}.${d.slice(21,27)} ${d[27]} ${f}${v}`}
function cb21Barras(cod){const dg=String(cod).replace(/\D/g,'');let x=0,r='';for(const c of dg){const n=+c,w=1+n%3,g=1+(n>>1)%2;r+=`<rect x="${x}" y="0" width="${w}" height="40"/>`;x+=w+g}
 return `<svg class="cb21-barras" viewBox="0 0 ${x} 40" preserveAspectRatio="none" role="img" aria-label="Código de barras ilustrativo"><g fill="#111">${r}</g></svg>`}
function cb21Boleto(id,i){const a=CRT_ACORDOS.find(x=>x.id===id),p=a&&a.parc[i];if(!p)return;const rot=cb21Rot(a,p),lin=cb21Linha(id,p),para=cb21Para(a.pac),venc=p.st==='vencida'||(p.st==='aberta'&&p.venc<PL_HOJE);
 p.bol={lin,h:cb21Agora()};
 C21_WA={para,aud:`2ª via do boleto da ${rot} de ${id} (${fmt(p.valor)})`,msg:`Olá, ${para.split(' ')[0]}. Aqui é a DeoVita Clínicas. Segue a 2ª via do boleto da ${rot} do seu acordo ${id}, no valor de ${fmt(p.valor)}, com vencimento em ${x2Dmy(p.venc)}.\n\nLinha digitável:\n${lin}\n\nQualquer dúvida, é só responder esta mensagem.`};
 cb21Aud(`2ª via do boleto da ${rot} de ${id} aberta (${fmt(p.valor)})`);
 openModal(`${mh('2ª via do boleto · '+id+' · '+rot)}<div class="mb"><div class="cb21-bol" id="cb21Bol">
 <div class="cb21-bol-cab"><b>Banco ilustrativo | 000-0</b><span class="mono">${esc(lin)}</span></div>
 <div class="cb21-bol-grid"><div class="cb21-bol-c" style="grid-column:span 3"><small>Local de pagamento</small>Pagável em qualquer banco ou lotérica até o vencimento</div><div class="cb21-bol-c"><small>Vencimento</small><b>${x2Dmy(p.venc)}</b></div>
 <div class="cb21-bol-c" style="grid-column:span 3"><small>Beneficiário</small>DeoVita Clínicas · dados do cadastro da unidade</div><div class="cb21-bol-c"><small>Nosso número</small><span class="mono">${cb21Dig(id+p.n,11)}</span></div>
 <div class="cb21-bol-c"><small>Documento</small>${esc(id)}-${p.n}</div><div class="cb21-bol-c"><small>Espécie</small>R$</div><div class="cb21-bol-c"><small>Emissão da 2ª via</small>${x2Dmy(PL_HOJE)}</div><div class="cb21-bol-c"><small>Valor do documento</small><b>${fmt(p.valor)}</b></div>
 <div class="cb21-bol-c" style="grid-column:1/-1"><small>Instruções</small>${esc(rot)} do acordo ${esc(id)}. Depois do vencimento: multa de ${CRT_CFG.multa}% e juros de ${String(CRT_CFG.juros).replace('.',',')}% ao mês, calculados pelo banco no dia do pagamento.</div>
 <div class="cb21-bol-c" style="grid-column:1/-1"><small>Pagador</small>${esc(a.pac)}${para!==a.pac?' · responsável: '+esc(para):''}</div></div>
 ${cb21Barras(lin)}<p class="tl cb21-ilu">Modelo ilustrativo do protótipo: não pague este boleto. No sistema real o banco emite o boleto e a baixa vem pela conciliação.</p></div>
 ${venc?`<div class="alert warn fin20-alert" style="margin-top:8px"><span>Esta parcela venceu em ${x2Dmy(p.venc)}. O banco calcula multa e juros no dia do pagamento; o valor do documento não muda.</span></div>`:''}
 <div class="field" style="margin-top:10px"><label for="cb21Lin">Linha digitável</label><input class="in mono" id="cb21Lin" value="${esc(lin)}" readonly></div>
 <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px"><button class="btn sec" onclick="cb21Copiar('cb21Lin')">Copiar a linha digitável</button></div>
 ${cb21WaBox(a.pac)}</div>
 <div class="mf mf-fixo"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="cb21Print()">${I.print} Imprimir</button><button class="btn sec" onclick="toast('Na janela que abrir, escolha Salvar como PDF');cb21Print()">${I.dl} Baixar PDF</button><button class="btn" onclick="cb21WaEnviar()">Enviar pelo WhatsApp</button></div>`,'wide')}

/* 672: link de pagamento com cartão de crédito (link fictício) */
function cb21Cartao(id,i){const a=CRT_ACORDOS.find(x=>x.id===id),p=a&&a.parc[i];if(!p)return;const rot=cb21Rot(a,p),para=cb21Para(a.pac);
 const link=p.link&&p.link.url||('https://deoclinic.com.br/cartao/'+(id+'-'+(p.n?'p'+p.n:'e')+'-'+cb21Hash(id+p.n+p.valor).toString(36).slice(0,5)).toLowerCase());
 p.link={url:link,h:cb21Agora()};
 C21_WA={para,aud:`Link de cartão da ${rot} de ${id} (${fmt(p.valor)})`,msg:`Olá, ${para.split(' ')[0]}. Aqui é a DeoVita Clínicas. Segue o link para pagar com cartão de crédito a ${rot} do seu acordo ${id}, no valor de ${fmt(p.valor)}:\n${link}\n\nO link vale por 3 dias. Qualquer dúvida, é só responder esta mensagem.`};
 cb21Aud(`Link de cartão de crédito da ${rot} de ${id} gerado (${fmt(p.valor)})`);
 openModal(`${mh('Link de cartão · '+id+' · '+rot)}<div class="mb">${kvs([['Paciente',esc(a.pac)],['Valor',`<b>${fmt(p.valor)}</b>`],['Vencimento',x2Dmy(p.venc)],['Validade do link','3 dias']])}
 <div class="field" style="margin-top:10px"><label for="cb21Link">Link de pagamento com cartão de crédito</label><input class="in mono" id="cb21Link" value="${esc(link)}" readonly></div>
 <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px"><button class="btn sec" onclick="cb21Copiar('cb21Link')">Copiar o link</button></div>
 <p class="tl cb21-ilu">Link fictício do protótipo. No sistema real, a empresa de cartão gera o link e avisa quando o pagamento for aprovado; a baixa vem pela conciliação.</p>
 ${cb21WaBox(a.pac)}</div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn" onclick="cb21WaEnviar()">Enviar pelo WhatsApp</button></div>`)}
/* Botão da parcela: abre a tela certa para cada forma */
function cb21Pagar(id,i){const a=CRT_ACORDOS.find(x=>x.id===id),p=a&&a.parc[i];if(!p)return;if(p.forma==='Pix')return cb21Pix(id,i);if(/Cart/.test(p.forma))return cb21Cartao(id,i);return cb21Boleto(id,i)}
crtParcela=function(id,i){return cb21Pagar(id,i)};
const cb21ParcBtn=f=>f==='Pix'?'Gerar Pix':/Cart/.test(f)?'Link do cartão':'2ª via do boleto';

/* ==========================================================================
   CARTEIRA E COBRANÇA · tela (668 Auditoria; 679 acordos quebrados fora das contas)
   ========================================================================== */
const cb21AcAtivo=a=>!a.quebrado&&a.parc.some(p=>p.st==='aberta'||p.st==='vencida');
const cb21AcVenc=a=>!a.quebrado&&a.parc.some(p=>p.st==='vencida'||(p.st==='aberta'&&p.venc<PL_HOJE));
VIEWS.carteira=()=>{const ab=crtAbertos(),venc=ab.filter(t=>crtDias(t)>0),tot=r2(venc.reduce((s,t)=>s+t.valor,0)),cred=r2([...new Set(CRT_CRED.map(c=>c.pac))].reduce((s,p)=>s+crtCredSaldo(p),0)),acA=CRT_ACORDOS.filter(cb21AcAtivo),acV=CRT_ACORDOS.filter(cb21AcVenc);
 const audBtn=x2TrilhaBtn('Carteira e cobrança').replace('>Trilha</button>','>Auditoria</button>');
 return `${pageHead('Financeiro','Carteira e cobrança','O que cada paciente tem de crédito e de débito: adiantamentos, devoluções como crédito, acordos de pagamento, atraso por faixa e a régua de cobrança. Todo valor é calculado; toda mudança pede motivo e vai para a auditoria. Dados de exemplo.',`${rulesBtn('Carteira e cobrança')}${audBtn}<button class="btn sec" onclick="crtConfig()">Juros e multa</button><button class="btn" onclick="crtAcordoNovo()">${I.plus} Novo acordo</button>`)}
<div class="mini" style="margin-bottom:12px">${miniKpi('Em atraso',fmt(tot),venc.length+' títulos','err',"CRT_ABA='aging';CRT_FXF='';reView()")}${miniKpi('Créditos dos pacientes',fmt(cred),'saldo a usar','ok',"CRT_ABA='pacientes';reView()")}${miniKpi('Acordos ativos',acA.length,acV.length+' com parcela vencida',acV.length?'warn':'',"CRT_ABA='acordos';reView()")}${miniKpi('Recuperado em outubro',fmt(1840.5),'38% do vencido no mês','')}</div>
${x2Tabs('CRT_ABA',[['aging','Inadimplência'],['pacientes','Por paciente'],['acordos','Acordos',acV.length?{v:acV.length,c:'warn'}:null],['regua','Régua de cobrança'],['negativacao','Negativação']],CRT_ABA)}
${CRT_ABA==='aging'?crtAging():CRT_ABA==='pacientes'?crtPacientes():CRT_ABA==='acordos'?crtAcordos():CRT_ABA==='regua'?crtRegua():crtNegat()}
${typeof piada==='function'?piada(173,{financeiro:'Régua de cobrança: a única régua que o paciente prefere não ver crescer.',todos:'Juros pro rata: calculados por dia, como a paciência do financeiro.'}):''}`};

/* ---------- 670/671: a linha do título abre a gaveta com as tentativas de contato e as observações ---------- */
const C21_OBS={'T-5301':[{h:'01/11 10:12',quem:'Paula (recepção)',txt:'WhatsApp do cadastro falhou (número desativado). Pedir o número novo quando o paciente vier à clínica.'}],'T-5422':[{h:'04/11 09:30',quem:'Rafael (recepção)',txt:'Paciente respondeu que paga na sexta pelo Pix.'}]};
{const _a=crtAging;crtAging=function(){return String(_a.apply(this,arguments))
 .replace(/<tr><td data-l="Título"><span class="mono">([^<]+)<\/span><\/td>/g,(m,id)=>{const t=CRT_TIT.find(x=>x.id===id),h=t&&t.acHist&&t.acHist.length?t.acHist[t.acHist.length-1]:null;
  return `<tr class="clk" onclick="cb21Tit('${id}')" title="Clique para ver as tentativas de contato e as observações"><td data-l="Título"><span class="mono">${id}</span>${h?`<small class="tl cb21-teve" style="display:block">teve acordo ${esc(h.id)} (quebrado)</small>`:''}</td>`})
 .replace(/onclick="crtCobrar\(/g,'onclick="event.stopPropagation();crtCobrar(').replace(/onclick="crtAcordoNovo\(/g,'onclick="event.stopPropagation();crtAcordoNovo(')}}
function cb21ObsLista(id){const o=C21_OBS[id]||[];return o.length?`<div class="at-list">${o.map(x=>`<div class="at-row"><div class="grow cb21-obs">${esc(x.txt)}<small>${esc(x.h)} · ${esc(x.quem)}</small></div></div>`).join('')}</div>`:'<p class="tl">Nenhuma observação ainda.</p>'}
function cb21Tit(id){const t=CRT_TIT.find(x=>x.id===id);if(!t)return;const a=crtAtual(t),d=crtDias(t),env=CRT_ENV.filter(e=>e.tit===id);
 const cor=s=>/falhou/.test(s)?'prazo-err':/respond|lida|pago/.test(s)?'prazo-ok':'';
 openDrawer('Título '+id+' · '+esc(t.pac),`${kvs([['Paciente',esc(t.pac)],t.resp?['Responsável',esc(t.resp)+' (recebe as mensagens)']:null,['Origem',esc(t.orig)],['Vencimento',x2Dmy(t.venc)],['Atraso',d>0?d+' dias · '+crtFaixa(d):'vence hoje ou a vencer'],['Valor',fmt(t.valor)],['Atualizado',`<b>${fmt(a.tot)}</b>${a.d?' (multa '+fmt(a.multa)+' · juros '+fmt(a.juros)+')':''}`],t.acHist&&t.acHist.length?['Acordos anteriores',t.acHist.map(h=>`${esc(h.id)} quebrado em ${x2Dmy(h.em)} (pago antes: ${fmt(h.pago)})`).join('<br>')]:null])}
 <h4 style="margin:14px 0 4px">Tentativas de contato (${env.length})</h4>${env.length?`<div class="at-list">${env.map(e=>`<div class="at-row"><div class="grow"><b>${esc(e.c)}</b> · ${esc(e.h)}${e.m&&CRT_MOD[e.m]?' · '+esc(CRT_MOD[e.m][0]):''}<small>Para ${esc(e.pac)} · resultado: <span class="${cor(e.st)}">${esc(e.st)}</span>${e.por?' · por '+esc(e.por):''}</small></div></div>`).join('')}</div>`:'<p class="tl">Nenhuma tentativa de contato ainda.</p>'}
 <h4 style="margin:14px 0 4px">Observações</h4><div id="cb21ObsL">${cb21ObsLista(id)}</div>
 <div class="field" style="margin-top:8px"><label for="cb21Obs">Nova observação</label><textarea class="in" id="cb21Obs" rows="2" placeholder="Ex.: paciente pediu para ligar depois das 17h"></textarea></div>
 <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px"><button class="btn sec" onclick="cb21ObsAdd('${id}')">Salvar observação</button><button class="btn" onclick="closeDrawer();crtCobrar('${id}')">Cobrar</button><button class="btn sec" onclick="closeDrawer();crtContato('${id}')">Registrar ligação</button><button class="btn ghost" onclick="closeDrawer();crtAcordoNovo('${cb21Q(t.pac)}')">Propor acordo</button></div>
 <p class="tl" style="margin-top:8px">Tentativas e observações não se apagam: ficam no histórico do título e na auditoria.</p>`)}
function cb21ObsAdd(id,txt){const t=CRT_TIT.find(x=>x.id===id);if(!t)return false;const v=String(txt!=null?txt:cb21G('cb21Obs')).trim();if(v.length<5){toast('Escreva a observação (pelo menos 5 letras)','warn');return false}
 (C21_OBS[id]=C21_OBS[id]||[]).unshift({h:cb21Agora(),quem:x2Quem(),txt:v});cb21Aud(`Observação no título ${id} (${t.pac}): ${v}`);
 try{const e=document.getElementById('cb21Obs');if(e)e.value=''}catch(e){}cb21Html('cb21ObsL',cb21ObsLista(id));toast('Observação salva no título');return true}

/* ---------- 669: escolher outro modelo pronto ou editar a mensagem, com trava do CDC (art. 42) ---------- */
const C21_PROIB=[[/protest/i,'ameaça de protesto'],[/\bspc\b|serasa|bir[oô]|nome sujo|negativ/i,'menção a negativação (só pode vir na comunicação formal do birô)'],[/processo|process[ao]r|justi[cç]a|judicial|advogad|penhora/i,'ameaça de processo'],[/pol[ií]cia|delegacia|cadeia|pris[aã]o|crime/i,'ameaça policial'],[/vergonha|caloteir|mau pagador|velhac|vagabund|irrespons/i,'palavra que humilha'],[/vizinh|patr[aã]o|empregador|colega de trabalho|seu chefe/i,'exposição a outras pessoas'],[{test:s=>{const l=String(s).replace(/\{[^}]*\}/g,'').replace(/[^A-Za-zÀ-ÿ]/g,''),u=l.replace(/[^A-ZÀ-Þ]/g,'');return l.length>=12&&u.length/l.length>0.7}},'texto em letras maiúsculas (parece grito)'],[/!!/,'excesso de exclamação']];
const cb21Cdc=txt=>C21_PROIB.filter(([r])=>r.test(String(txt||''))).map(([,n])=>n);
const cb21CdcHtml=pr=>pr.length?`<div class="alert err fin20-alert" style="margin-top:8px"><span><b>Não dá para enviar assim:</b> ${esc(pr.join('; '))}. A cobrança não pode ameaçar, expor ao ridículo nem constranger o paciente (Código de Defesa do Consumidor, art. 42). Ajuste o texto.</span></div>`:`<p class="tl cb21-okcdc">Texto conferido: sem ameaça, sem exposição e sem constrangimento (CDC, art. 42).</p>`;
let C21_CB=null;
crtCobrar=function(id){const t=CRT_TIT.find(x=>x.id===id);if(!t)return;const d=crtDias(t),st=CRT_REGUA.filter(r=>!r.fut&&r.on&&r.d<=d).pop()||CRT_REGUA[0],m=CRT_MOD[st.m]?st.m:'atraso1';C21_CB={id,m,et:st,txt:CRT_MOD[m][1],edit:false,can:'WhatsApp (360dialog)'};cb21CbRender()};
function cb21CbRender(){const c=C21_CB;if(!c)return;const t=CRT_TIT.find(x=>x.id===c.id),a=crtAtual(t),st=c.et,msg=crtTpl(c.txt,t);
 openModal(`${mh('Cobrar '+c.id+' · '+esc(t.pac.split(' ')[0]))}<div class="mb">${kvs([['Origem',esc(t.orig)],['Valor',fmt(t.valor)],['Atualizado',fmt(a.tot)],['Etapa da régua',`${st.d>=0?'D+'+st.d:'D'+st.d} · ${esc((CRT_MOD[st.m]||CRT_MOD.atraso1)[0])}`],t.resp?['Vai para','o responsável, '+esc(t.resp)]:null])}
 <div class="formgrid" style="margin-top:8px"><div class="field"><label for="crtCan">Canal</label><select class="in" id="crtCan" onchange="C21_CB.can=this.value">${['WhatsApp (360dialog)','E-mail'].map(v=>`<option ${c.can===v?'selected':''}>${v}</option>`).join('')}</select></div>
 <div class="field"><label for="cb21Mod">Mensagem pronta</label><select class="in" id="cb21Mod" onchange="cb21CbModelo(this.value)">${Object.entries(CRT_MOD).map(([k,[n]])=>`<option value="${k}" ${k===c.m?'selected':''}>${esc(n)}${k===st.m?' (etapa da régua)':''}</option>`).join('')}</select></div></div>
 <div class="field"><label for="cb21Txt">Texto da mensagem ${info('Pode editar só para esta cobrança. Variáveis que o sistema preenche: {nome}, {valor}, {vencimento}, {origem}, {atualizado}, {link}, {entrada}, {parcelas}.')}</label><textarea class="in" id="cb21Txt" rows="4" oninput="cb21CbTxt(this.value)">${esc(c.txt)}</textarea></div>
 <h4 style="margin:8px 0 4px">Como o paciente vai receber</h4><div class="x2-msg" id="cb21Prev">${esc(msg)}</div><div id="cb21Cdc">${cb21CdcHtml(cb21Cdc(msg))}</div>
 <div class="row cb21-novomod" style="gap:6px;flex-wrap:wrap;margin-top:8px"><input class="in" id="cb21ModNome" placeholder="Nome para guardar como modelo novo" style="flex:1 1 220px"><button class="btn sm sec" onclick="cb21CbNovoModelo()">Salvar como modelo novo</button></div>
 <p class="tl" style="margin-top:6px">Link de pagamento com Pix e boleto atualizados; vale por 3 dias. Menor de idade: a mensagem vai para o responsável. A mensagem só vai para o paciente ou o responsável, nunca para outras pessoas.</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn sec" onclick="crtContato('${c.id}')">Registrar ligação</button><button class="btn" onclick="cb21CbOk()">Enviar cobrança</button></div>`)}
function cb21CbModelo(k){const c=C21_CB;if(!c||!CRT_MOD[k])return;c.can=cb21G('crtCan')||c.can;c.m=k;c.txt=CRT_MOD[k][1];c.edit=false;cb21CbRender()}
function cb21CbTxt(v){const c=C21_CB;if(!c)return;c.txt=String(v==null?'':v);c.edit=c.txt!==(CRT_MOD[c.m]||['',''])[1];const t=CRT_TIT.find(x=>x.id===c.id),msg=crtTpl(c.txt,t);cb21Html('cb21Prev',esc(msg));cb21Html('cb21Cdc',cb21CdcHtml(cb21Cdc(msg)))}
function cb21CbNovoModelo(nome){const c=C21_CB;if(!c)return null;const n=String(nome!=null?nome:cb21G('cb21ModNome')).trim();if(n.length<3){toast('Dê um nome ao modelo novo','warn');return null}
 const pr=cb21Cdc(c.txt);if(pr.length){toast('Modelo não salvo: '+pr.join('; ')+' (CDC, art. 42)','warn');return null}
 let k='m21_'+(Object.keys(CRT_MOD).length+1);while(CRT_MOD[k])k+='x';CRT_MOD[k]=[n,c.txt];c.m=k;c.edit=false;c.can=cb21G('crtCan')||c.can;
 cb21Aud(`Modelo de mensagem "${n}" criado a partir da cobrança de ${c.id}`);cb21CbRender();toast('Modelo "'+n+'" guardado: aparece na lista de mensagens prontas e na Régua de cobrança');return k}
function cb21CbOk(){const c=C21_CB;if(!c)return false;const t=CRT_TIT.find(x=>x.id===c.id),msg=crtTpl(c.txt,t),pr=cb21Cdc(msg);
 if(pr.length){toast('Cobrança não enviada: '+pr.join('; ')+' (CDC, art. 42)','warn');return false}
 if(String(c.txt).trim().length<20){toast('A mensagem está curta demais','warn');return false}
 const can=String(cb21G('crtCan')||c.can||'W').startsWith('E')?'E-mail':'WhatsApp';
 CRT_ENV.unshift({h:cb21Agora(),pac:t.resp||t.pac,tit:c.id,c:can,m:c.m,st:'enviada',txt:msg,edit:c.edit,por:x2Quem()});
 cb21Aud(`Cobrança de ${c.id} enviada por ${can} (${t.pac}) com o modelo "${CRT_MOD[c.m][0]}"${c.edit?', texto editado só para este envio':''}`);
 C21_CB=null;closeModal();reView();toast('Cobrança enviada por '+can);return true}
/* Editar modelo na Régua: mesma trava do CDC */
crtModelo=function(k){const md=CRT_MOD[k];if(!md)return;const ex=CRT_TIT.find(x=>x.st==='aberto'&&crtDias(x)>0)||CRT_TIT[0];
 openModal(`${mh('Modelo · '+esc(md[0]))}<div class="mb"><div class="field"><label for="crtMt">Texto</label><textarea class="in" id="crtMt" rows="4" oninput="cb21ModPrev('${k}',this.value)">${esc(md[1])}</textarea></div><h4 style="margin:8px 0 4px">Prévia com ${esc(ex.pac)}</h4><div class="x2-msg" id="cb21ModPrev">${esc(crtTpl(md[1],ex))}</div><div id="cb21ModCdc">${cb21CdcHtml(cb21Cdc(md[1]))}</div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="cb21ModSalvar('${k}')">Salvar modelo</button></div>`)};
function cb21ModPrev(k,v){const ex=CRT_TIT.find(x=>x.st==='aberto'&&crtDias(x)>0)||CRT_TIT[0];cb21Html('cb21ModPrev',esc(crtTpl(String(v||''),ex)));cb21Html('cb21ModCdc',cb21CdcHtml(cb21Cdc(v)))}
function cb21ModSalvar(k,txt){const md=CRT_MOD[k];if(!md)return false;const v=String(txt!=null?txt:cb21G('crtMt')).trim();if(v.length<20){toast('O modelo está curto demais','warn');return false}
 const pr=cb21Cdc(v);if(pr.length){toast('Modelo não salvo: '+pr.join('; ')+' (CDC, art. 42)','warn');return false}
 md[1]=v;cb21Aud(`Modelo "${md[0]}" editado; vale para os próximos envios`);closeModal();reView();toast('Modelo salvo');return true}

/* ---------- 676: quem não tem nada em aberto, nem crédito, nem acordo em aberto sai da lista (continua registrado) ---------- */
let C21_QUIT=false;
function cb21PacAtivo(n){if(crtAbertos().some(t=>t.pac===n&&t.valor>0))return true;if(Math.abs(crtCredSaldo(n))>0.004)return true;return CRT_ACORDOS.some(a=>a.pac===n&&cb21AcAtivo(a))}
crtPacientes=function(){const nomes=[...new Set([...CRT_TIT.map(t=>t.pac),...CRT_CRED.map(c=>c.pac),...CRT_ACORDOS.map(a=>a.pac)])],q=semAc(CRT_Q.trim()),quit=nomes.filter(n=>!cb21PacAtivo(n));
 const l=nomes.filter(n=>(C21_QUIT||cb21PacAtivo(n))&&(!q||semAc(n).includes(q)));const nada='<span class="tl">nada</span>';
 return `<div class="fbar">${x2Busca('crtQ',CRT_Q,'Buscar paciente',"CRT_Q=this.value;reView();x2Foco('crtQ')")}<button class="btn sm sec" onclick="crtCredNovo()">${I.plus} Crédito por adiantamento ou devolução</button></div>
 ${tabela(['Paciente','Crédito','Em aberto','Atualizado','Acordos',''],l.map(n=>{const ab=crtAbertos().filter(t=>t.pac===n),v=ab.reduce((s,t)=>s+t.valor,0),at=ab.reduce((s,t)=>s+crtAtual(t).tot,0),ac=CRT_ACORDOS.filter(a=>a.pac===n),cr=crtCredSaldo(n),j=cb21Q(n),ok=!cb21PacAtivo(n);
  return `<tr class="clk ${ok?'cb21-quit':''}" onclick="crtExtrato('${j}')">${td('Paciente',`<b>${esc(n)}</b>${ok?' <span class="badge neutral">quitado</span>':''}`)}${td('Crédito',cr?`<span class="prazo-ok">${fmt(cr)}</span>`:nada)}${td('Em aberto',v?fmt(v):nada)}${td('Atualizado',v?`<b>${fmt(r2(at))}</b>`:nada)}${td('Acordos',ac.length?ac.map(a=>`<span class="mono">${a.id}</span>${a.quebrado?' <small class="tl">(quebrado)</small>':''}`).join(' '):nada)}${td('',`<button class="btn sm sec" onclick="event.stopPropagation();crtExtrato('${j}')">Extrato</button>`)}</tr>`}),'Nenhum paciente com valor em aberto, crédito ou acordo em aberto')}
 <div class="row" style="margin-top:8px;gap:10px;flex-wrap:wrap;align-items:center"><label class="check"><input type="checkbox" ${C21_QUIT?'checked':''} onchange="C21_QUIT=this.checked;reView()">Mostrar também quem está quitado (${quit.length})</label><span class="tl">Quem não tem valor em aberto, saldo de crédito nem acordo em aberto sai da lista, mas continua registrado com todo o histórico.</span></div>`};

/* ---------- 679: acordo quebrado sai da lista de acordos e o saldo volta para a inadimplência ---------- */
let C21_VERQ=false;
crtAcordos=function(){const at=CRT_ACORDOS.filter(a=>!a.quebrado),qb=CRT_ACORDOS.filter(a=>a.quebrado);
 const linha=a=>{const prox=a.parc.find(p=>p.st==='aberta'||p.st==='vencida'),venc=cb21AcVenc(a),ok=!prox;const pagas=a.parc.filter(p=>p.st==='paga'&&p.n).length;
  return `<tr class="clk" onclick="crtAcordo('${a.id}')">${td('Acordo',`<span class="mono">${a.id}</span>`)}${td('Paciente',`<b>${esc(a.pac)}</b>`)}${td('Original',fmt(a.orig))}${td('Atualizado',fmt(a.atual))}${td('Entrada',a.n?fmt(a.entrada):'<span class="tl">à vista</span>')}${td('Parcelas',a.n?`${pagas} de ${a.n} pagas`:'pagamento único')}${td('Próxima',prox?`${x2Dmy(prox.venc)} · ${fmt(prox.valor)}`:'<span class="tl">nenhuma</span>')}${td('Situação',`<span class="badge ${ok?'ok':venc?'err':'info'}">${ok?'Quitado':venc?'Parcela vencida':'Em dia'}</span>`)}${td('',`<button class="btn sm sec" onclick="event.stopPropagation();crtAcordo('${a.id}')">Abrir</button>`)}</tr>`};
 return `${tabela(['Acordo','Paciente','Original','Atualizado','Entrada','Parcelas','Próxima','Situação',''],at.map(linha),'Nenhum acordo ativo')}
 ${qb.length?`<div class="row" style="margin-top:10px;gap:10px;flex-wrap:wrap;align-items:center"><button class="btn sm ghost" onclick="C21_VERQ=!C21_VERQ;reView()">${C21_VERQ?'Esconder':'Ver'} acordos quebrados (${qb.length})</button><span class="tl">Acordo quebrado sai desta lista; o saldo volta para a Inadimplência e o registro fica na auditoria.</span></div>
 ${C21_VERQ?`<div class="cb21-qb">${tabela(['Acordo','Paciente','Quebrado em','Já pago','Voltou para a inadimplência','Motivo'],qb.map(a=>`<tr class="clk" onclick="crtAcordo('${a.id}')">${td('Acordo',`<span class="mono">${a.id}</span>`)}${td('Paciente',esc(a.pac))}${td('Quebrado em',a.quebradoEm?x2Dmy(a.quebradoEm):'<span class="tl">sem data</span>')}${td('Já pago',fmt(a.pagoAntes||0))}${td('Voltou para a inadimplência',a.voltou!=null?fmt(a.voltou):'<span class="tl">títulos originais</span>')}${td('Motivo',esc(a.quebradoMot||''))}</tr>`))}</div>`:''}`:''}`};
crtQuebrar=function(id){const a=CRT_ACORDOS.find(x=>x.id===id);if(!a||a.quebrado)return;
 x2Mot('Quebrar acordo '+id,'As parcelas em aberto são canceladas e o acordo sai da lista de acordos. O saldo que falta, já descontado o que o paciente pagou, volta para a Inadimplência. A auditoria guarda que houve acordo.',m=>cb21QuebrarOk(id,m),'Quebrar acordo','danger')};
function cb21QuebrarOk(id,m){const a=CRT_ACORDOS.find(x=>x.id===id);if(!a||a.quebrado)return null;
 const pago=r2(a.parc.filter(p=>p.st==='paga').reduce((s,p)=>s+p.valor,0)),resta=r2(Math.max(0,a.orig-pago)),canc=a.parc.filter(p=>p.st!=='paga');
 const vencNovo=(canc[0]&&canc[0].venc)||PL_HOJE;
 a.quebrado=true;a.quebradoEm=PL_HOJE;a.quebradoMot=m;a.pagoAntes=pago;a.voltou=resta;canc.forEach(p=>p.st='cancelada');
 const hist={id,em:PL_HOJE,pago},ts=a.tits.map(tid=>CRT_TIT.find(t=>t.id===tid)),peso=t=>t?(t.valorAntesAcordo||t.valor):a.orig/Math.max(1,a.tits.length),soma=ts.reduce((s,t)=>s+peso(t),0)||1;
 a.tits.forEach((tid,k)=>{let t=ts[k];const parte=r2(resta*peso(t)/soma);
  if(!t){t={id:tid,pac:a.pac,orig:'Saldo do acordo '+id+' (quebrado)',venc:vencNovo,valor:parte,st:parte>0?'aberto':'pago'};CRT_TIT.push(t)}
  else{t.valorAntesAcordo=t.valorAntesAcordo||t.valor;t.valor=parte;t.st=parte>0?'aberto':'pago';delete t.acordo}
  t.acHist=(t.acHist||[]).concat(hist)});
 cb21Aud(`Acordo ${id} (${a.pac}) quebrado. Já pago: ${fmt(pago)}. Voltou para a inadimplência: ${fmt(resta)} (títulos ${a.tits.join(', ')}). O registro do acordo fica guardado. Motivo: ${m}`);
 try{closeDrawer()}catch(e){}reView();toast('Acordo quebrado: saiu da lista de acordos e o saldo voltou para a Inadimplência');return resta}

/* ---------- 672 e 673: novo acordo com à vista, Pix e link de cartão; 674/675: termo aberto antes de enviar ---------- */
crtAcCalc=function(){const A=CRT_AC,ts=CRT_TIT.filter(t=>A.tits.includes(t.id)),orig=r2(ts.reduce((s,t)=>s+t.valor,0)),atual=r2(ts.reduce((s,t)=>s+crtAtual(t).tot,0));const base=A.comb&&A.valComb>0?A.valComb:atual;
 if(!A.n)return {ts,orig,atual,base,ent:base,saldo:0,parc:0,total:base};
 const ent=r2(base*A.ent/100),saldo=r2(base-ent),i=CRT_CFG.jurosParc/100,parc=r2(i?saldo*i/(1-Math.pow(1+i,-A.n)):saldo/A.n);return {ts,orig,atual,base,ent,saldo,parc,total:r2(ent+parc*A.n)}};
const C21_FORMAS=['Boleto','Pix','Cartão de crédito'];
const cb21FormaTxt=(f,n)=>f==='Pix'?'Ao criar, o QR Code e o Pix copia e cola aparecem na tela, com botão para enviar pelo WhatsApp.':/Cart/.test(f)?'Ao criar, sai um link de pagamento com cartão de crédito para enviar ao paciente (link fictício no protótipo).':(n?'Boleto em cada parcela, com 2ª via e envio pelo WhatsApp. A entrada sai em Pix, com QR Code na tela.':'Boleto único, com envio pelo WhatsApp.');
crtAcRender=function(){const A=CRT_AC,c=crtAcCalc(),nomes=[...new Set(crtAbertos().map(t=>t.pac))],av=!A.n;
 openModal(`${mh('Novo acordo de pagamento')}<div class="mb"><div class="field"><label for="acP">Paciente</label><select class="in" id="acP" onchange="crtAcordoNovo(this.value)">${nomes.map(n=>`<option ${n===A.pac?'selected':''}>${esc(n)}</option>`).join('')}</select></div>
 <h4 style="margin:8px 0 4px">Títulos no acordo</h4><div class="at-list">${crtAbertos().filter(t=>t.pac===A.pac).map(t=>`<label class="at-row" style="cursor:pointer"><input type="checkbox" ${A.tits.includes(t.id)?'checked':''} onchange="crtAcTit('${t.id}',this.checked)" style="margin-right:8px"><div class="grow">${esc(t.orig)}<small>${t.id} · ${crtDias(t)>0?crtDias(t)+' dias de atraso':'a vencer'}</small></div><span class="at-price">${fmt(crtAtual(t).tot)}</span></label>`).join('')}</div>
 <div class="formgrid" style="margin-top:8px"><div class="field"><label for="cb21AcN">Como paga</label><select class="in" id="cb21AcN" onchange="CRT_AC.n=+this.value;crtAcRender()"><option value="0" ${av?'selected':''}>À vista (pagamento único)</option>${Array.from({length:CRT_CFG.parcMax},(_,i)=>i+1).map(v=>`<option value="${v}" ${A.n===v?'selected':''}>Entrada + ${v}×</option>`).join('')}</select></div>
 ${av?'':`<div class="field"><label>Entrada ${info('Mínimo de '+CRT_CFG.entradaMin+'% (configurável em Juros e multa).')}</label><select class="in" onchange="CRT_AC.ent=+this.value;crtAcRender()">${[CRT_CFG.entradaMin,30,40,50].filter((v,i,a)=>a.indexOf(v)===i).map(v=>`<option value="${v}" ${A.ent===v?'selected':''}>${v}%</option>`).join('')}</select></div>`}
 <div class="field"><label for="cb21AcF">${av?'Forma de pagamento':'Forma por parcela'}</label><select class="in" id="cb21AcF" onchange="CRT_AC.forma=this.value;crtAcRender()">${C21_FORMAS.map(v=>`<option ${A.forma===v?'selected':''}>${v}</option>`).join('')}</select></div></div>
 <p class="tl cb21-forma">${cb21FormaTxt(A.forma,A.n)}</p>
 <div class="f2-cascata" style="margin-top:8px"><div><span>Valor original</span><span>${fmt(c.orig)}</span></div><div><span>Multa e juros até hoje<small>${CRT_CFG.multa}% + ${CRT_CFG.juros}% a.m. pro rata</small></span><span>${fmt(r2(c.atual-c.orig))}</span></div><div><span>Atualizado</span><span>${fmt(c.atual)}</span></div>${A.comb&&A.valComb>0?`<div><span>Valor combinado (gestor)</span><span>${fmt(A.valComb)}</span></div>`:''}
 ${av?`<div><span>À vista<small>pagamento único, sem juros de parcelamento</small></span><span>${fmt(c.base)}</span></div>`:`<div><span>Entrada (${A.ent}%)</span><span>${fmt(c.ent)}</span></div><div><span>${A.n}× de<small>juros do parcelamento ${String(CRT_CFG.jurosParc).replace('.',',')}% a.m. (tabela Price)</small></span><span>${fmt(c.parc)}</span></div>`}<div class="tot"><span>Total do acordo</span><span>${fmt(c.total)}</span></div></div>
 <label class="check" style="margin-top:8px"><input type="checkbox" ${A.comb?'checked':''} onchange="CRT_AC.comb=this.checked;crtAcRender()">Valor combinado diferente do calculado ${info('Único valor que se digita na Carteira. Exige a aprovação de um gestor, com senha, e fica na auditoria.')}</label>
 ${A.comb?`<div class="formgrid"><div class="field"><label for="acV">Valor combinado</label><input class="in" id="acV" inputmode="decimal" value="${A.valComb?String(A.valComb).replace('.',','):''}" placeholder="0,00" onchange="CRT_AC.valComb=cb21Num(this.value)||0;crtAcRender()"></div><div class="field"><label for="acG">Gestor</label><select class="in" id="acG" onchange="CRT_AC.ges=this.value">${['Lúcia (gestora)','Jânio (administrador)'].map(g=>`<option ${A.ges===g?'selected':''}>${g}</option>`).join('')}</select></div><div class="field"><label for="acS">Senha do gestor</label><input class="in" id="acS" type="password" placeholder="no protótipo, qualquer uma" oninput="CRT_AC.senhaOk=!!this.value"></div></div>`:''}
 <div class="field"><label for="acM">Motivo <span class="req">*</span></label><textarea class="in" id="acM" rows="2" placeholder="Ex.: paciente pediu parcelamento na régua D+60" oninput="CRT_AC.mot=this.value">${esc(A.mot||'')}</textarea></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="cb21AcPrevia()">Ver o termo antes de enviar</button></div>`)};
/* Monta o acordo (sem gravar) a partir do que está na tela */
function cb21AcMonta(){const A=CRT_AC,c=crtAcCalc(),ven=i=>{const d=new Date(PL_HOJE+'T12:00');d.setMonth(d.getMonth()+i);return d.toISOString().slice(0,10)};
 const fEnt=A.forma==='Boleto'?'Pix':A.forma,resp=(CRT_TIT.find(t=>A.tits.includes(t.id)&&t.resp)||{}).resp||'';
 const parc=A.n?[{n:0,venc:PL_HOJE,valor:c.ent,st:'aberta',forma:fEnt},...Array.from({length:A.n},(_,i)=>({n:i+1,venc:ven(i+1),valor:c.parc,st:'aberta',forma:A.forma}))]:[{n:0,venc:PL_HOJE,valor:c.base,st:'aberta',forma:A.forma}];
 return {pac:A.pac,resp,tits:A.tits.slice(),orig:c.orig,atual:c.base,entrada:A.n?c.ent:c.base,n:A.n,forma:A.forma,d:PL_HOJE,parc,c}}
function cb21AcValida(){const A=CRT_AC;if(!A)return false;if(!A.mot)A.mot=cb21G('acM');const m=String(A.mot||'').trim();
 if(!A.tits.length){toast('Escolha pelo menos um título','warn');return false}
 if(m.length<10){toast('Escreva o motivo (pelo menos 10 letras)','warn');try{const e=document.getElementById('acM');if(e&&e.focus)e.focus()}catch(e){}return false}
 if(A.comb){if(!(A.valComb>0)){toast('Informe o valor combinado','warn');return false}if(!A.senhaOk&&!cb21G('acS')){toast('O valor combinado precisa da senha do gestor','warn');return false}A.senhaOk=true;A.ges=A.ges||cb21G('acG')||'Lúcia (gestora)'}
 return true}
function cb21TermoHtml(a,prev){const tot=r2(a.parc.reduce((s,p)=>s+p.valor,0));
 return `<div class="laudo cb21-termo" style="max-width:none"><div class="lh"><b>Termo de acordo de pagamento</b><span class="tl">modelo da biblioteca · versão 4${prev?' · prévia, ainda não enviado':''}</span></div>
 <p><b>Credora:</b> DeoVita Clínicas, com os dados do cadastro da unidade. <b>Devedor(a):</b> ${esc(a.pac)}${a.resp?', representado(a) por '+esc(a.resp):''}.</p>
 <p>O(a) devedor(a) reconhece o débito de ${fmt(a.orig)} (títulos ${a.tits.join(', ')}), atualizado para ${fmt(a.atual)} em ${x2Dmy(a.d)}, e o pagará ${a.n?`com entrada de ${fmt(a.entrada)} e ${a.n} parcela(s) mensal(is)`:'à vista, em pagamento único'}, por ${esc(a.forma)}, conforme a tabela abaixo.</p>
 <div class="x2-lst">${a.parc.map(p=>`<div><span>${p.n?'Parcela '+p.n:(a.n?'Entrada':'À vista')} · ${x2Dmy(p.venc)} · ${esc(p.forma)}</span><span>${fmt(p.valor)}</span></div>`).join('')}<div><span><b>Total do acordo</b></span><span><b>${fmt(tot)}</b></span></div></div>
 <p>${a.n?`Juros do parcelamento: ${String(CRT_CFG.jurosParc).replace('.',',')}% ao mês (tabela Price), já incluídos nas parcelas. `:''}Se alguma parcela atrasar: multa de ${CRT_CFG.multa}% e juros de mora de ${String(CRT_CFG.juros).replace('.',',')}% ao mês, só sobre a parcela atrasada (CDC, art. 52, §1º). O(a) devedor(a) pode antecipar parcelas com redução proporcional dos juros (CDC, art. 52, §2º).</p>
 <p>Se o acordo for quebrado, as parcelas em aberto são canceladas e volta a ser cobrado só o saldo que falta, já descontado o que foi pago. A cobrança será sempre feita sem expor o(a) devedor(a) ao ridículo e sem constrangimento ou ameaça (CDC, art. 42).</p>
 <p class="tl">Assinatura no tablet ou aceite por WhatsApp.${prev?' Revise antes de enviar: o termo só vai para o paciente quando você clicar em Criar acordo e enviar o termo.':''}</p></div>`}
function cb21AcPrevia(){if(!cb21AcValida())return false;const a=cb21AcMonta();
 openModal(`${mh('Termo de acordo · prévia antes de enviar')}<div class="mb">${cb21TermoHtml(a,true)}</div>
 <div class="mf mf-fixo"><button class="btn ghost" onclick="crtAcRender()">Voltar e ajustar</button><button class="btn sec" onclick="cb21Print()">${I.print} Imprimir</button><button class="btn" onclick="cb21AcGravar()">Criar acordo e enviar o termo</button></div>`,'wide');return true}
function cb21AcGravar(){const A=CRT_AC;if(!cb21AcValida())return null;const x=cb21AcMonta(),c=x.c,aprov=A.comb?(A.ges||'Lúcia (gestora)'):'automático (dentro da política)';
 const id='AC-00'+(32+CRT_ACORDOS.length-2);
 CRT_ACORDOS.unshift({id,pac:x.pac,tits:x.tits,orig:x.orig,atual:x.atual,entrada:x.entrada,n:x.n,forma:x.forma,aprov,d:PL_HOJE,mot:String(A.mot).trim(),parc:x.parc,termo:{h:cb21Agora(),por:x2Quem()}});
 CRT_TIT.filter(t=>x.tits.includes(t.id)).forEach(t=>{t.st='acordo';t.acordo=id});
 cb21Aud(`Acordo ${id} (${x.pac}): ${fmt(x.atual)}${A.comb?' combinado':''}, ${x.n?`entrada ${fmt(c.ent)} e ${x.n}× ${fmt(c.parc)}`:'à vista'} (${x.forma}); aprovado por ${aprov}. Termo revisado e enviado. Motivo: ${String(A.mot).trim()}`);
 CRT_AC=null;closeModal();CRT_ABA='acordos';try{if(location.hash==='#carteira')reView()}catch(e){}
 toast(`Acordo ${id} criado; termo enviado para assinatura por WhatsApp`);cb21Pagar(id,0);return id}
/* Gaveta do acordo: botão certo para cada forma, parcela cancelada sem botão, aviso de acordo quebrado */
crtAcordo=function(id){const a=CRT_ACORDOS.find(x=>x.id===id);if(!a)return;
 openDrawer('Acordo '+id,`${a.quebrado?`<div class="alert err fin20-alert" style="margin-bottom:10px"><span><b>Acordo quebrado em ${x2Dmy(a.quebradoEm||PL_HOJE)}.</b> Já pago: ${fmt(a.pagoAntes||0)}. Voltou para a Inadimplência: ${a.voltou!=null?fmt(a.voltou):'o saldo dos títulos'}. Motivo: ${esc(a.quebradoMot||'')}</span></div>`:''}
 ${kvs([['Paciente',esc(a.pac)],['Títulos',a.tits.join(', ')],['Original',fmt(a.orig)],['Atualizado no acordo',fmt(a.atual)],['Forma',a.n?esc(a.forma)+' · '+a.n+' parcela(s)':esc(a.forma)+' · à vista'],['Aprovado por',esc(a.aprov)+' em '+x2Dmy(a.d)],['Motivo',esc(a.mot)],['Termo',`<a href="#" onclick="event.preventDefault();crtTermo('${id}')">Termo de acordo (biblioteca de modelos)</a>`]])}
 <h4 style="margin:12px 0 4px">${a.n?'Parcelas':'Pagamento'}</h4><div class="at-list">${a.parc.map((p,i)=>{const v=p.st==='vencida'||(p.st==='aberta'&&p.venc<PL_HOJE),pode=p.st==='aberta'||p.st==='vencida';
  return `<div class="at-row"><div class="grow">${p.n?'Parcela '+p.n:(a.n?'Entrada':'À vista')} · ${x2Dmy(p.venc)}<small>${esc(p.forma)} · <span class="${p.st==='paga'?'prazo-ok':v?'prazo-err':''}">${p.st==='paga'?'paga (baixa pela conciliação)':p.st==='cancelada'?'cancelada (acordo quebrado)':v?'vencida':'em aberto'}</span></small></div><span class="at-price">${fmt(p.valor)}</span>${pode&&!a.quebrado?`<button class="btn sm ghost" onclick="crtParcela('${id}',${i})">${cb21ParcBtn(p.forma)}</button>`:''}</div>`}).join('')}</div>
 <p class="tl" style="margin-top:8px">A baixa de cada parcela vem da conciliação bancária (identificador do Pix, nosso número do boleto ou aviso da empresa de cartão); ninguém dá baixa à mão.</p>
 ${cb21AcAtivo(a)?`<div class="row" style="margin-top:12px"><button class="btn ghost" style="color:var(--err)" onclick="crtQuebrar('${id}')">Quebrar acordo</button></div>`:''}`)};
crtTermo=function(id){const a=CRT_ACORDOS.find(x=>x.id===id);if(!a)return;const resp=(CRT_TIT.find(t=>a.tits.includes(t.id)&&t.resp)||{}).resp||'';
 openModal(`${mh('Termo de acordo · '+id)}<div class="mb">${cb21TermoHtml(Object.assign({resp},a),false)}</div><div class="mf mf-fixo"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="cb21Print()">${I.print} Imprimir</button><button class="btn" onclick="toast('Na janela que abrir, escolha Salvar como PDF');cb21Print()">${I.dl} Baixar PDF</button></div>`,'wide')};

/* ---------- 681: a chave "D+90 · Negativação" da régua estava travada; agora liga, com as regras da lei ---------- */
const C21_NEG={on:false,por:'',h:'',mot:''};
{const _r=crtRegua;crtRegua=function(){return String(_r.apply(this,arguments))
 .replace(/(<input type="checkbox"[^>]*?)\s*disabled(\s*onchange=")crtReguaTog\((\d+),this\.checked\)/g,'$1$2cb21NegTog($3,this.checked)')
 .replace('Fase futura: integração com birô de crédito, depois de aviso formal com prazo.',C21_NEG.on?`Ligada por ${esc(C21_NEG.por)} em ${esc(C21_NEG.h)} (simulação). Cada título precisa da aprovação do gestor e da comunicação prévia por escrito (CDC, art. 43, §2º).`:'Desligada. Ao ligar: só títulos com mais de 90 dias, depois do aviso formal, com aprovação do gestor por título e comunicação prévia ao paciente.')}}
function cb21NegTog(i,v){const r=CRT_REGUA[i];if(!r)return;const voltar=()=>setTimeout(()=>{try{const b=document.querySelector('#modal .ghost');if(b)b.onclick=()=>{closeModal();reView()}}catch(e){}},0);
 if(!v){x2Mot('Desligar a negativação','Nenhum título novo vai para o birô. Os que já foram incluídos continuam até o pagamento, quando a baixa é pedida.',m=>{r.on=false;C21_NEG.on=false;cb21Aud(`Negativação (D+90) desligada: ${m}`);reView();toast('Negativação desligada')},'Desligar');voltar();return}
 x2Mot('Ligar a negativação (D+90)',`A integração com o birô de crédito é simulada no protótipo. Regras que o sistema segue:</p><ul class="cb21-ul"><li>Só títulos com mais de 90 dias de atraso e depois do aviso formal (D+30).</li><li>O gestor aprova título por título; nada é negativado sozinho pela régua.</li><li>Antes de incluir, o paciente recebe comunicação prévia por escrito, com prazo para pagar (CDC, art. 43, §2º).</li><li>Menor de idade e dependente de plano nunca são negativados; o responsável financeiro pode ser.</li><li>Pagou: o sistema pede a baixa ao birô em até 5 dias úteis.</li></ul><p style="display:none">`,(m,x)=>{if(!x.ges||!x.senha){toast('Ligar a negativação precisa do gestor e da senha dele','warn');reView();return}
  r.on=true;C21_NEG.on=true;C21_NEG.por=x.ges;C21_NEG.h=cb21Agora();C21_NEG.mot=m;cb21Aud(`Negativação (D+90) ligada em simulação, aprovada por ${x.ges}: ${m}`);reView();toast('Negativação ligada (simulação). Cada título ainda precisa da aprovação do gestor.')},'Ligar negativação','',
  `<div class="formgrid"><div class="field"><label>Gestor que aprova</label><select class="in" data-x2="ges"><option value="">Escolha</option><option>Lúcia (gestora)</option><option>Jânio (administrador)</option></select></div><div class="field"><label>Senha do gestor</label><input class="in" type="password" data-x2="senha" placeholder="no protótipo, qualquer uma"></div></div>`);voltar()}
{const _n=crtNegat;crtNegat=function(){if(!C21_NEG.on)return String(_n.apply(this,arguments)).replace('<h3>Negativação · fase futura</h3>','<h3>Negativação · desligada</h3>').replace('Ainda não liga com nenhum birô de crédito','Para ligar, use a chave D+90 na Régua de cobrança (precisa do gestor)');
 const l=crtAbertos().filter(t=>crtDias(t)>90);
 return `<div class="card at-card"><h3>Negativação · ligada (simulação)</h3><div class="sub">Ligada por ${esc(C21_NEG.por)} em ${esc(C21_NEG.h)}</div>
 <p style="font-size:14px">Só títulos com mais de 90 dias. Cada um precisa da aprovação do gestor; o paciente recebe a comunicação prévia por escrito e tem 10 dias para pagar antes da inclusão (CDC, art. 43, §2º). Menor de idade nunca é negativado.</p>
 <div class="at-list" style="margin-top:8px">${l.map(t=>`<div class="at-row"><div class="grow">${esc(t.pac)} · ${t.id}<small>${crtDias(t)} dias · ${fmt(crtAtual(t).tot)}${t.neg?` · comunicação prévia enviada em ${esc(t.neg.h)} por aprovação de ${esc(t.neg.por)}; inclusão só depois de 10 dias sem pagamento`:''}</small></div>${t.resp?'<span class="badge neutral">menor: não negativa</span>':t.neg?'<span class="badge warn">aguardando prazo</span>':`<button class="btn sm sec" onclick="cb21NegAprovar('${t.id}')">Aprovar e enviar comunicação prévia</button>`}</div>`).join('')||'<p class="tl">Nenhum título com mais de 90 dias.</p>'}</div></div>`}}
function cb21NegAprovar(id){const t=CRT_TIT.find(x=>x.id===id);if(!t||t.resp||crtDias(t)<=90)return;x2Mot('Aprovar negativação · '+id,`${esc(t.pac)} · ${fmt(crtAtual(t).tot)}. O paciente recebe a comunicação prévia por escrito e tem 10 dias para pagar antes da inclusão.`,m=>{t.neg={h:cb21Agora(),por:x2Quem(),mot:m};cb21Aud(`Negativação de ${id} (${t.pac}) aprovada; comunicação prévia enviada: ${m}`);reView();toast('Comunicação prévia enviada; inclusão só depois de 10 dias sem pagamento')},'Aprovar')}

/* ==========================================================================
   REPASSE MÉDICO · 667: comprovante só quando foi pago; devolvido mostra a devolução
   ========================================================================== */
function cb21FrDev(id){const a=(typeof F2_AUD!=='undefined'?F2_AUD:[]).find(x=>x.tela==='Repasse médico'&&String(x.acao).indexOf('Fechamento '+id+' devolvido')===0);if(!a)return null;const m=String(a.acao).split('Motivo: ');return {quem:a.quem,h:a.h,mot:m[1]||''}}
{const _f=rpFechs;rpFechs=function(){return String(_f.apply(this,arguments)).replace(/<tr class="clk" onclick="rpComprovante\('([^']+)'\)">[\s\S]*?<\/tr>/g,(row,id)=>{const f=F2_FR.find(x=>x.id===id);if(!f||f.st==='Pago')return row;
 row=row.replace(`<button class="btn sm ghost" onclick="event.stopPropagation();rpComprovante('${id}')">Comprovante</button>`,`<button class="btn sm ghost" onclick="event.stopPropagation();cb21FrDet('${id}')">${f.st==='Devolvido'?'Ver devolução':'Detalhe'}</button>`);
 if(f.st==='Devolvido'){const dv=cb21FrDev(id);row=row.replace('<span class="badge warn">Devolvido</span>',`<span class="badge err">Devolvido</span><small class="tl" style="display:block">${dv?'por '+esc(dv.quem)+' em '+esc(dv.h)+' · ':''}sem comprovante</small>`)}
 return row.replace(`<tr class="clk" onclick="rpComprovante('${id}')">`,`<tr class="clk" onclick="cb21FrDet('${id}')">`)})}}
{const _c=rpComprovante;rpComprovante=function(id){const f=F2_FR.find(x=>x.id===id);if(f&&f.st!=='Pago')return cb21FrDet(id);return _c.apply(this,arguments)}}
function cb21FrDet(id){const f=F2_FR.find(x=>x.id===id);if(!f)return;if(f.st==='Pago')return rpComprovante(id);const b=F2_B(f.b),dv=f.st==='Devolvido'?cb21FrDev(id):null,it=F2_PROD.filter(x=>x.fech===id);
 openDrawer('Fechamento '+id+' · '+String(f.st).toLowerCase(),`${f.st==='Devolvido'?`<div class="alert err fin20-alert" style="margin-bottom:10px"><span><b>Devolvido para correção</b>${dv?' por '+esc(dv.quem)+' em '+esc(dv.h):''}.${dv&&dv.mot?' Motivo: '+esc(dv.mot):''} Os itens foram destravados e voltaram para o extrato; quem fechou corrige e fecha de novo.</span></div>`:''}
 ${kvs([['Beneficiário',esc(b.n)+' · '+esc(b.papel)],['Período',f.per],['Valor',`<b>${fmt(f.v)}</b>`],['Fechado por',esc(f.fpor)],['Aprovado por',f.apor?esc(f.apor):'ainda não'],['Situação',`<span class="badge ${f.st==='Devolvido'?'err':f.st==='Aprovado'?'acc':'warn'}">${esc(f.st)}</span>`]])}
 ${it.length?`<h4 style="margin-top:12px">Itens</h4><div class="at-list">${it.map(x=>`<div class="at-row"><div class="grow">${esc(x.pac)}<small>${x.d} · ${esc(PROC(x.proc).n)}</small></div><span class="at-price">${fmt(rpLinhaCalc(x).val)}</span></div>`).join('')}</div>`:''}
 <div class="alert info fin20-alert" style="margin-top:12px"><span>O comprovante só existe depois que o repasse é pago no Financeiro. ${f.st==='Devolvido'?'Este fechamento foi devolvido: não houve pagamento.':f.st==='Aprovado'?'Já está aprovado e aguarda o pagamento.':'Ainda aguarda a aprovação de outra pessoa.'}</span></div>
 <div class="row" style="margin-top:12px;gap:6px;flex-wrap:wrap">${f.st==='Aguardando aprovação'?`<button class="btn" onclick="closeDrawer();rpAprovar('${id}')">Aprovar</button><button class="btn ghost" onclick="closeDrawer();rpDevolver('${id}')">Devolver</button>`:f.st==='Aprovado'?`<a class="btn sec" href="#financeiro" onclick="closeDrawer();FN_ABA='pagar'">Pagar no Financeiro</a>`:''}</div>`)}

/* ==========================================================================
   TABELAS DE PREÇO · 682/683 importar planilha com prévia e modelo; 684/685 histórico
   ========================================================================== */
{const _v=VIEWS.precos;VIEWS.precos=function(){return String(_v.apply(this,arguments)).replace(`<button class="btn sec" onclick="toast('Importação por planilha com de→para e prévia antes e depois')">Importar planilha</button>`,`<button class="btn sec" onclick="cb21PrImport()" ${tipAttr('Importar planilha','Escolha o arquivo; antes de importar aparece o que deu certo e o que deu erro.')}>Importar planilha</button><button class="btn sec" onclick="cb21PrModelo()" ${tipAttr('Modelo da planilha','Baixa o modelo em CSV (abre no Excel) com as colunas código, exame e preço.')}>${I.dl} Modelo da planilha</button>`)}}
let C21_IMP=null;
const cb21PrTabAtual=()=>{const ts=prTabelas(),v=cb21G('cb21PrTab');if(ts.some(t=>t.id===v))return v;return PR_TAB!=='todas'&&ts.some(t=>t.id===PR_TAB)?PR_TAB:'particular'};
const cb21Br=v=>Number(v).toFixed(2).replace('.',',');
function cb21PrModelo(){const tab=cb21PrTabAtual(),t=prTabelas().find(x=>x.id===tab)||{n:tab};
 const linhas=[['codigo','exame','preco'],...EXAMES.filter(e=>!e.serv).slice(0,12).map(e=>[e.c,e.n,cb21Br(precoDe(e.c,tab))])];
 cb21Baixar('modelo-tabela-de-precos.csv',linhas);toast('Modelo baixado: modelo-tabela-de-precos.csv (preços atuais de '+t.n+'). Abra no Excel, troque os preços e salve como CSV.');return linhas}
function cb21PrImport(){C21_IMP=null;const ts=prTabelas(),pad=cb21PrTabAtual();
 openModal(`${mh('Importar planilha de preços')}<div class="mb">
 <div class="field"><label for="cb21PrTab">Tabela que vai receber os preços</label><select class="in" id="cb21PrTab" onchange="cb21PrReanalisa()">${ts.map(t=>`<option value="${esc(t.id)}" ${t.id===pad?'selected':''}>${esc(t.n)} · ${t.tipo.toLowerCase()}</option>`).join('')}</select></div>
 <label class="fin20-drop" for="cb21PrArq" ondragover="event.preventDefault();this.classList.add('on')" ondragleave="this.classList.remove('on')" ondrop="cb21PrDrop(event)"><b>Clique para escolher o arquivo ou arraste aqui</b><span>Planilha em CSV (no Excel: Arquivo, Salvar como, CSV). Colunas: código; exame; preço</span><small id="cb21PrNome">Nenhum arquivo escolhido</small></label>
 <input type="file" id="cb21PrArq" class="fin20-file" accept=".csv,.txt,text/csv" onchange="cb21PrArquivo(this)">
 <div class="row" style="gap:6px;margin-top:8px;flex-wrap:wrap"><button class="btn sm sec" onclick="cb21PrModelo()">${I.dl} Baixar o modelo da planilha</button><button class="btn sm ghost" onclick="cb21PrExemplo()">Testar com um arquivo de exemplo</button></div>
 <div id="cb21PrPrev" class="fin20-ofx-res"></div></div>
 <div class="mf mf-fixo"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="cb21PrConfirmar()">Importar os preços que deram certo</button></div>`,'wide')}
function cb21PrArquivo(inp){const f=inp&&inp.files&&inp.files[0];cb21PrLer(f)}
function cb21PrDrop(ev){try{ev.preventDefault();if(ev.currentTarget&&ev.currentTarget.classList)ev.currentTarget.classList.remove('on');cb21PrLer(ev.dataTransfer&&ev.dataTransfer.files&&ev.dataTransfer.files[0])}catch(e){}}
function cb21PrLer(f){if(!f)return;cb21Html('cb21PrNome',esc(f.name||''));
 if(/\.(xlsx?|ods)$/i.test(f.name||'')){C21_IMP=null;cb21Html('cb21PrPrev',`<div class="alert warn fin20-alert"><span>Arquivo do Excel: salve como CSV (Arquivo, Salvar como, CSV separado por ponto e vírgula) e escolha de novo. Se preferir, baixe o modelo.</span></div>`);return}
 if(!/\.(csv|txt)$/i.test(f.name||'')){C21_IMP=null;cb21Html('cb21PrPrev',`<div class="alert err fin20-alert"><span>Escolha um arquivo .csv (a planilha salva como CSV).</span></div>`);return}
 try{const r=new FileReader();r.onload=()=>cb21PrPrevia(String(r.result||''),f.name);r.onerror=()=>toast('Não foi possível ler o arquivo','warn');r.readAsText(f,'utf-8')}catch(e){toast('Não foi possível ler o arquivo','warn')}}
const C21_PR_EX=`codigo;exame;preco\nHEMO;Hemograma completo;19,90\nGLI;Glicemia de jejum;9,50\nTSH;TSH;32,00\nXYZ99;Exame que não existe;10,00\nCREA;Creatinina;abc\nGLI;Glicemia repetida;9,90\nTGO;TGO;-5\nUREIA;Ureia;0,50`;
function cb21PrExemplo(){cb21Html('cb21PrNome','planilha-exemplo.csv');return cb21PrPrevia(C21_PR_EX,'planilha-exemplo.csv')}
function cb21PrReanalisa(){if(C21_IMP&&C21_IMP.txt!=null)cb21PrPrevia(C21_IMP.txt,C21_IMP.nome)}
function cb21PrAnalisa(txt,tab){const linhas=String(txt||'').replace(/^\uFEFF/,'').split(/\r?\n/),l0=linhas.find(l=>l.trim())||'',sep=l0.includes(';')?';':l0.includes('\t')?'\t':',',itens=[],vistos={},porNome={};
 EXAMES.filter(e=>!e.serv).forEach(e=>porNome[semAc(e.n).toLowerCase()]=e);
 linhas.forEach((l,k)=>{if(!l.trim())return;const c=l.split(sep).map(x=>x.trim().replace(/^"|"$/g,''));if(/^c[oó]d/i.test(c[0]||''))return;
  const lin=k+1,cod=String(c[0]||'').toUpperCase(),nome=c.length>2?c[1]:'',pt=c.length>2?c[2]:c[1];const it={lin,cod,nome,pt:pt||'',st:'ok',msg:''};
  let e=EXAMES.find(x=>x.c===cod&&!x.serv)||null;if(!e&&nome)e=porNome[semAc(nome).toLowerCase()]||null;
  const p=cb21Num(pt);
  if(!cod&&!nome){it.st='erro';it.msg='linha sem código'}
  else if(!e){it.st='erro';it.msg='código não encontrado no cadastro de exames'}
  else if(isNaN(p)){it.st='erro';it.msg='preço inválido ("'+(pt||'vazio')+'")'}
  else if(p<0){it.st='erro';it.msg='preço negativo'}
  else if(vistos[e.c]){it.st='erro';it.msg='exame repetido (já está na linha '+vistos[e.c]+')'}
  if(e){it.c=e.c;it.n=e.n}
  if(it.st==='ok'){vistos[e.c]=lin;it.p=p;it.antes=precoDe(e.c,tab);const k2=precoDe(e.c,'custo');if(p<k2)it.msg='abaixo do custo ('+fmt(k2)+'): fica em prejuízo';else if(Math.abs(p-it.antes)<0.005)it.msg='igual ao preço atual'}
  itens.push(it)});
 return {tab,itens}}
function cb21PrPrevia(txt,nome){const tab=cb21PrTabAtual(),r=cb21PrAnalisa(txt,tab);r.txt=txt;r.nome=nome;C21_IMP=r;cb21Html('cb21PrPrev',cb21PrPrevHtml(r));return r}
function cb21PrPrevHtml(r){if(!r)return '';const ok=r.itens.filter(x=>x.st==='ok'),er=r.itens.filter(x=>x.st==='erro'),t=prTabelas().find(x=>x.id===r.tab)||{n:r.tab};
 if(!r.itens.length)return `<div class="alert err fin20-alert"><span>O arquivo não tem nenhuma linha de preço. Confira se está no formato do modelo.</span></div>`;
 return `<div class="mini" style="margin-top:4px">${miniKpi('Deram certo',ok.length,'vão para '+esc(t.n),'ok')}${miniKpi('Com erro',er.length,er.length?'não serão importados':'nenhum',er.length?'err':'')}${miniKpi('Arquivo',esc(r.nome||''),r.itens.length+' linha(s)')}</div>
 <h4 class="fin20-h-ok">Deram certo (${ok.length})</h4>${ok.length?tabela(['Linha','Exame','Preço atual','Preço novo','Aviso'],ok.map(x=>`<tr data-det="0">${td('Linha',x.lin)}${td('Exame',`${esc(x.n)} <small class="mono tl">${x.c}</small>`)}${td('Preço atual',fmt(x.antes))}${td('Preço novo',`<b>${fmt(x.p)}</b>`)}${td('Aviso',x.msg?`<span class="${/prejuízo/.test(x.msg)?'prazo-err':'tl'}">${esc(x.msg)}</span>`:'<span class="tl">nenhum</span>')}</tr>`)):'<p class="tl">Nenhuma linha válida.</p>'}
 <h4 class="fin20-h-er">Com erro (${er.length})</h4>${er.length?tabela(['Linha','Código','Exame','Preço','Erro'],er.map(x=>`<tr data-det="0">${td('Linha',x.lin)}${td('Código',`<span class="mono">${esc(x.cod)}</span>`)}${td('Exame',esc(x.nome||x.n||''))}${td('Preço',esc(x.pt))}${td('Erro',`<span class="fin20-st-erro">${esc(x.msg)}</span>`)}</tr>`))+`<div class="row" style="margin-top:6px"><button class="btn sm ghost" onclick="cb21PrErros()">${I.dl} Baixar os erros para corrigir</button></div>`:'<p class="tl">Nenhum erro.</p>'}
 <p class="tl" style="margin-top:8px">Só as linhas que deram certo entram, numa versão nova da tabela com vigência a partir de hoje. As linhas com erro ficam de fora.</p>`}
function cb21PrErros(){const r=C21_IMP;if(!r)return null;const l=[['linha','codigo','exame','preco','erro'],...r.itens.filter(x=>x.st==='erro').map(x=>[x.lin,x.cod,x.nome||x.n||'',x.pt,x.msg])];cb21Baixar('erros-planilha-precos.csv',l);toast('Erros baixados: erros-planilha-precos.csv');return l}
const C21_PR_HIST={};
function cb21PrConfirmar(){const r=C21_IMP;if(!r){toast('Escolha o arquivo primeiro: clique na caixa ou arraste a planilha','warn');return null}
 const ok=r.itens.filter(x=>x.st==='ok');if(!ok.length){toast('Nenhuma linha deu certo: corrija a planilha e tente de novo','warn');return null}
 const tab=r.tab,t=prTabelas().find(x=>x.id===tab);if(!t)return null;
 const ant=cb21PrVersoes(tab).vs[0],nova=t.ver+1,quem=typeof x2Quem==='function'?x2Quem():'';
 ok.forEach(x=>{(PRECOS[x.c]=PRECOS[x.c]||{})[tab]=x.p;if(tab==='particular'&&typeof EX!=='undefined'&&EX[x.c])EX[x.c].p=x.p;if(tab==='posto14'&&typeof TAB_POSTO!=='undefined')TAB_POSTO[x.c]=x.p});
 const h=C21_PR_HIST[tab]=C21_PR_HIST[tab]||{};if(ant&&!h[t.ver])h[t.ver]={vig:ant[1],por:ant[2],o:ant[3]};
 h[nova]={vig:x2Dmy(PL_HOJE),por:quem,o:`importação da planilha ${r.nome||''}: ${ok.length} preço(s)${r.itens.length>ok.length?', '+(r.itens.length-ok.length)+' linha(s) com erro ficaram de fora':''}`};
 PR_META[tab]=Object.assign({n:t.n,sub:t.sub,tipo:t.tipo,por:t.por},PR_META[tab]||{},{ver:nova,vig:x2Dmy(PL_HOJE),por:quem});
 if(typeof x2Aud==='function')x2Aud('Tabelas de preço',`Planilha ${r.nome||''} importada em ${t.n}: ${ok.length} preço(s), versão ${nova}`);
 C21_IMP=null;closeModal();reView();toast(`${ok.length} preço(s) importado(s) em ${t.n}: versão ${nova}, vigente a partir de hoje`);return nova}
/* 684: sai o botão Ver; 685: botão para baixar o histórico */
function cb21PrVersoes(id){const t=prTabelas().find(x=>x.id===id);if(!t)return {t:null,vs:[]};const h=C21_PR_HIST[id]||{},vs=[];
 for(let v=t.ver;v>=1;v--){const x=h[v];vs.push(x?[v,x.vig,x.por,x.o]:[v,v===t.ver?t.vig:v===t.ver-1?'01/01/2026':'15/03/2025',v===t.ver?t.por:'Sérgio',v===t.ver?'reajuste de 6% em todos os exames':v===1?'tabela criada'+(t.tipo==='Posto'?' a partir da Particular com −45%':''):'ajuste de 12 exames de bioquímica'])}
 return {t,vs}}
prHist=function(id){const {t,vs}=cb21PrVersoes(id);if(!t)return;
 openModal(`${mh('Histórico de versões · '+esc(t.n))}<div class="mb">${tabela(['Versão','Vigência','Criada por','O que mudou'],vs.map(([v,d,p,o])=>`<tr data-det="0">${td('Versão',`<b>v${v}</b>${v===t.ver?' <span class="badge ok">vigente</span>':''}`)}${td('Vigência','desde '+d)}${td('Criada por',esc(p))}${td('O que mudou',esc(o))}</tr>`))}<p class="tl" style="margin-top:8px">O atendimento guarda o preço cobrado na hora; trocar de versão nunca altera atendimentos antigos.</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn" onclick="cb21PrHistBaixar('${cb21Q(id)}')">${I.dl} Baixar histórico</button></div>`)};
function cb21PrHistBaixar(id){const {t,vs}=cb21PrVersoes(id);if(!t)return null;const l=[['tabela','versao','vigencia','criada por','o que mudou','situacao'],...vs.map(([v,d,p,o])=>[t.n,'v'+v,'desde '+d,p,o,v===t.ver?'vigente':'anterior'])];
 const slug=semAc(t.n).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'tabela';cb21Baixar('historico-versoes-'+slug+'.csv',l);
 if(typeof x2Aud==='function')x2Aud('Tabelas de preço',`Histórico de versões de ${t.n} baixado`);toast('Histórico baixado: historico-versoes-'+slug+'.csv');return l}

/* ---------- Estilos da rodada ---------- */
try{document.head.insertAdjacentHTML('beforeend',`<style>
.cb21-pix{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
.cb21-pix>.grow{flex:1 1 240px;min-width:0}
.cb21-qr{width:180px;height:180px;flex:none;border:1px solid var(--border);border-radius:12px;background:#fff;padding:4px}
.cb21-cod{font-size:12px;word-break:break-all;resize:vertical}
.cb21-ilu{font-size:12px;margin-top:6px}
.cb21-wa{margin-top:4px}
.cb21-bol{border:1px solid var(--border);border-radius:12px;padding:12px;background:var(--surface)}
.cb21-bol-cab{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;border-bottom:2px solid var(--fg-strong);padding-bottom:6px;margin-bottom:8px}
.cb21-bol-cab .mono{font-size:12.5px;overflow-wrap:anywhere}
.cb21-bol-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--border);border-radius:8px;overflow:hidden}
.cb21-bol-c{padding:6px 8px;border-right:1px solid var(--border);border-bottom:1px solid var(--border);font-size:13px;min-width:0;overflow-wrap:anywhere}
.cb21-bol-c small{display:block;color:var(--fg2);font-size:11px}
.cb21-barras{display:block;width:100%;height:46px;margin-top:10px;background:#fff}
@media(max-width:640px){.cb21-bol-grid{grid-template-columns:1fr 1fr}.cb21-bol-c[style*="span 3"]{grid-column:1/-1!important}}
.cb21-okcdc{color:var(--ok);font-size:12.5px;margin-top:6px}
.cb21-obs{white-space:pre-wrap;overflow-wrap:anywhere}
.cb21-quit td{opacity:.7}
.cb21-teve{color:var(--warn)!important}
.cb21-qb{margin-top:8px}
.cb21-ul{margin:6px 0 0 18px;font-size:13px}
.cb21-forma{font-size:12.5px;margin-top:4px}
.cb21-termo p{margin:8px 0}
</style>`)}catch(e){}
