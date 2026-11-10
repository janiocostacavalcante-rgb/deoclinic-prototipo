/* ---------- Base das telas da onda 4 (29/10, tarde): peças comuns, dados de exemplo e brincadeiras por setor ----------
   Tudo aqui reaproveita as peças da biblioteca (cartão, tabela, abas, modal, gaveta, avisos) e os dados já usados nas telas prontas. */

/* Estilos só das telas novas (variáveis do tema, nada fixo) */
document.head.insertAdjacentHTML('beforeend',`<style>
/* notícias e dicas */
.noticia{display:flex;gap:12px;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:12px;text-decoration:none;color:var(--fg);background:var(--surface)}
.noticia:hover{border-color:var(--accent);background:var(--accent-soft)}
.noticia .nd{flex:none;width:52px;text-align:center;line-height:1.15}.noticia .nd b{display:block;font-size:14px;color:var(--fg-strong)}.noticia .nd small{font-size:10px;color:var(--fg2);display:block;text-transform:uppercase;letter-spacing:.04em}
.noticia .nt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.noticia .ntt{font-weight:600;color:var(--fg-strong);font-size:14px;line-height:1.3}.noticia .nt small{font-size:12.5px;color:var(--fg2);line-height:1.35}
.dica{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface)}
.dica .dn{flex:none;width:28px;height:28px;border-radius:50%;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;font-weight:800;font-size:13px}
.dica .dt{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.dica .dt b{color:var(--fg-strong);font-size:14px}.dica .dt small{font-size:12.5px;color:var(--fg2);line-height:1.4}
/* letras de situação e funil */
.funil{display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(88px,1fr))}
.funil .et{border:1px solid var(--border);border-radius:12px;padding:10px 8px;text-align:center;background:var(--surface)}
.funil .et b{display:block;font-size:24px;font-weight:800;color:var(--fg-strong);line-height:1.1}.funil .et small{font-size:11px;color:var(--fg2);display:block;line-height:1.2;margin-top:2px}
.funil .et .at-letter{margin:0 0 4px}
/* linha de pessoas / etapas */
.steps{display:flex;flex-direction:column;gap:0}
.stp{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);align-items:flex-start}.stp:last-child{border-bottom:0}
.stp .dot2{width:12px;height:12px;border-radius:50%;background:var(--border);margin-top:5px;flex:none}.stp.ok .dot2{background:var(--ok)}.stp.cur .dot2{background:var(--accent);box-shadow:0 0 0 4px var(--accent-soft)}.stp.err .dot2{background:var(--err)}
.stp .st{flex:1;min-width:0;font-size:14px}.stp .st small{display:block;color:var(--fg2);font-size:12px}
/* agenda */
.cal{display:grid;grid-template-columns:72px repeat(5,1fr);gap:4px;font-size:13px}
.cal .ch{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg2);padding:6px 4px;text-align:center}
.cal .ct{color:var(--fg2);font-size:12px;padding:8px 4px;text-align:right}
.cal .cs{min-height:40px;border:1px dashed var(--border);border-radius:8px;padding:4px 6px;font-size:12px;cursor:pointer;background:var(--surface)}
.cal .cs:hover{border-color:var(--accent);background:var(--accent-soft)}
.cal .cs.full{border-style:solid;background:var(--accent-soft);border-color:var(--accent);color:var(--fg-strong)}
.cal .cs.dom{background:var(--info-soft);border-color:var(--info);border-style:solid}
.cal .cs.off{background:var(--surface2);cursor:default;border:0}
.cal .cs.lib{border-style:dashed;border-color:var(--ok);background:var(--ok-soft)}
.cal .ag-quem{display:block;font-size:10.5px;color:var(--fg2);line-height:1.2;margin-top:2px}
.ag-livres{display:flex;flex-wrap:wrap;gap:6px}
/* soroteca */
.rack{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;max-width:420px}
.rack i{aspect-ratio:1;border-radius:4px;background:var(--surface2);border:1px solid var(--border);display:grid;place-items:center;font-size:9px;color:var(--fg2);font-style:normal;cursor:pointer}
.rack i.on{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}.rack i.sel{outline:2px solid var(--warn);outline-offset:1px}.rack i.fora{background:var(--warn-soft);border-color:var(--warn);color:var(--warn)}
/* mapa / posições */
.pos{display:grid;grid-template-columns:auto 1fr auto;gap:8px 12px;align-items:center;padding:8px 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface);font-size:14px}
.pos .n{font-weight:800;color:var(--fg2);font-size:12px;width:28px}
.pos.urg{border-color:var(--err)}.pos.rep{border-style:dashed}
/* gráfico Levey-Jennings */
.lj svg{width:100%;height:auto;max-height:220px}
/* laudo */
.laudo{border:1px solid var(--border);border-radius:16px;padding:20px;background:var(--surface);font-size:13px;max-width:720px}
.laudo .lh{display:flex;justify-content:space-between;gap:12px;border-bottom:2px solid var(--accent);padding-bottom:10px;margin-bottom:12px;flex-wrap:wrap}
.laudo table{min-width:0;font-size:13px}.laudo td,.laudo th{height:34px;padding:0 10px}
.regua{position:relative;height:10px;border-radius:5px;background:linear-gradient(90deg,var(--err-soft),var(--ok-soft) 30%,var(--ok-soft) 70%,var(--err-soft));min-width:120px}
.regua i{position:absolute;top:-3px;width:16px;height:16px;border-radius:50%;background:var(--accent);border:2px solid var(--surface);transform:translateX(-50%)}
.alt{color:var(--err);font-weight:800;margin-left:4px}
/* permissões */
.perm{display:grid;grid-template-columns:1fr auto;gap:6px 12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px}.perm:last-child{border-bottom:0}
.perm small{display:block;color:var(--fg2);font-size:12px}
/* cartões de perfil / unidade */
.pcard{display:flex;gap:12px;align-items:center;padding:14px;border:1px solid var(--border);border-radius:16px;background:var(--surface)}
.pcard .avatar{width:44px;height:44px;font-size:16px}
.pcard .pb{flex:1;min-width:0}.pcard .pb b{display:block;color:var(--fg-strong)}.pcard .pb small{color:var(--fg2);font-size:12.5px}
.cor{width:14px;height:14px;border-radius:4px;display:inline-block;vertical-align:middle;margin-right:6px}
/* chat interno */
.chatbox{display:flex;flex-direction:column;gap:8px;max-height:260px;overflow:auto;padding:4px}
/* kpis pequenos */
.mini{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}
.mini .m{border:1px solid var(--border);border-radius:12px;padding:10px 12px;background:var(--surface2)}
.mini .m .lab{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg2)}
.mini .m .num{font-size:22px;font-weight:800;color:var(--fg-strong);line-height:1.2}
.ibtn.sm:has(>.ti),.ibtn:has(>.ti){width:auto;min-width:32px;padding:0 8px;border-radius:16px;display:inline-flex;align-items:center;gap:6px}.ibtn:has(>.ti)>svg{flex:none}.ibtn:has(>.ti)>.ti{margin-left:0}
.mini .m .hint{font-size:12px;color:var(--fg2)}
.mini:has(.num.long){grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr))}
.mini .m:has(.num.long){container-type:inline-size}
.mini .m .num.long{font-size:min(22px,12.5cqw);white-space:nowrap}
.mini .m.err .num{color:var(--err)}.mini .m.ok .num{color:var(--ok)}.mini .m.warn .num{color:var(--warn)}
.barras{display:flex;flex-direction:column;gap:6px;font-size:13px}
.barras div{display:grid;grid-template-columns:minmax(90px,1fr) 3fr auto;gap:10px;align-items:center}
.barras .b{height:10px;border-radius:5px;background:var(--surface2);overflow:hidden}.barras .b i{display:block;height:100%;background:var(--accent)}
.barras b{color:var(--fg-strong);white-space:nowrap}
.tl{font-size:12px;color:var(--fg2)}
.prazo-ok{color:var(--ok);font-weight:600}.prazo-warn{color:var(--warn);font-weight:600}.prazo-err{color:var(--err);font-weight:700}
.doc{display:flex;gap:12px;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);font-size:14px}
.doc .di{width:36px;height:36px;border-radius:10px;background:var(--accent-soft);color:var(--accent);display:grid;place-items:center;flex:none}
.doc .dd{flex:1;min-width:0}.doc .dd small{display:block;color:var(--fg2);font-size:12px}
.switchrow{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);font-size:14px}.switchrow:last-child{border-bottom:0}
.switchrow small{display:block;color:var(--fg2);font-size:12px}
@media(max-width:640px){.cal{grid-template-columns:56px repeat(5,1fr)}.cal .cs{font-size:10px;padding:3px 4px}}
</style>`);

/* ---------- Peças ---------- */
function pageHead(crumb,title,sub,tools){return `<div class="pagehead"><div>${crumb?`<div class="crumbs">${crumb}</div>`:''}<h1>${title}</h1>${sub?`<p style="color:var(--fg2);margin-top:4px">${sub}</p>`:''}</div><div class="tools">${tools||''}</div></div>`}
const rulesBtn=t=>`<button class="rules" onclick="rulesModal('${t.replace(/'/g,"\\'")}')" ${tipAttr('Regras','Lista as regras desta tela, como estão no documento de referência.')}>${I.doc} Regras</button>`;
function tabela(ths,rows,vazio){return `<div class="tablewrap"><table class="at-table"><thead><tr>${ths.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.join(''):vazioLinha(ths.length,vazio||'Nada por aqui','Mude a busca ou os filtros.')}</tbody></table></div>`}
const td=(l,v)=>`<td data-l="${l}">${v}</td>`;
const letra=(k)=>`<span><span class="at-letter">${k}</span>${LETRAS[k]||''}</span>`;
const prazoTag=(h,m)=>{const [hh,mm]=h.split(':').map(Number);const min=hh*60+mm-(9*60);return min<0?`<span class="prazo-err">vencido ${dmHora(h)}</span>`:min<=30?`<span class="prazo-warn">vence ${h}</span>`:`<span class="prazo-ok">${h}</span>`};
const dmHora=h=>h;
function mh(t){return `<div class="mh"><h3>${t}</h3><button class="ibtn plain" aria-label="Fechar" onclick="closeModal()">${I.x}</button></div>`}
function modalOk(t,html,label,onok,cls){openModal(`${mh(t)}<div class="mb">${html}</div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn ${cls||''}" onclick="closeModal();${onok||''}">${label||'Confirmar'}</button></div>`)}
function fichaDrawer(t,html){openDrawer(t,html)}
const kvs=pairs=>`<div class="at-kv">${pairs.filter(Boolean).map(([k,v])=>`<span>${k}</span><div>${v}</div>`).join('')}</div>`;
/* miniKpi(rótulo, número, dica, classe, onclick): com onclick o número é clicável e abre a lista do que ele conta (29/10, noite) */
const miniKpi=(lab,num,hint,cls,oc)=>`<div class="m ${cls||''} ${oc?'clk':''}" ${oc?`onclick="${oc.replace(/"/g,'&quot;')}" role="button" tabindex="0" title="Clique para ver a lista"`:''}><div class="lab">${lab}</div><div class="num${String(num).length>8?' long':''}">${num}</div>${hint?`<div class="hint">${hint}</div>`:''}</div>`;
const barra=(n,v,max,txt)=>`<div><span>${n}</span><span class="b"><i style="width:${Math.round(v/max*100)}%"></i></span><b>${txt??v}</b></div>`;
const chip=(t,on,oc)=>`<button class="chip ${on?'on':''}" onclick="${oc}">${t}</button>`;
function unidNome(u){return UNIDS[u]||('Unidade '+u)}
const cod14=(unid,prot,amostra,tubo)=>`${unid}-${String(prot).padStart(8,'0')}-${String(amostra).padStart(2,'0')}-${String(tubo).padStart(2,'0')}`;

/* ---------- Brincadeiras por setor (continuam numeradas; aprova ou manda tirar uma a uma) ----------
   piada(n, {perfil: frase}) escolhe a frase do perfil atual; 'todos' é a reserva. */
function piada(n,m){if(!BRINCA)return '';const t=m[PERFIL]||m.todos||PIADAS[PERFIL]||PIADAS.todos;return `<p class="fun">${t}</p>`}
const PIADAS={
 admin:'Administrador é quem resolve o problema que ninguém sabia que existia, porque ele mesmo causou na reunião de ontem.',
 gestor:'Gestor de posto: 40% logística, 40% diplomacia com a matriz, 20% achando o carimbo.',
 recepcao:'Na recepção, "só uma perguntinha" nunca é só uma, e nunca é perguntinha.',
 coletador:'Coletador sabe: a veia mais fácil é sempre a do paciente que diz "ninguém acha a minha".',
 tecnico:'Técnico de laboratório: a única pessoa que torce para o número bater e não para o time.',
 dr:'Dr., se tudo está "dentro da normalidade", desconfie da normalidade. (Depois libere.)',
 financeiro:'No financeiro, todo mês fecha. Às vezes fecha o mês, às vezes fecha o olho.',
 convenios:'Convênio é como feriado: a gente sabe que vem, só não sabe quanto vai custar.',
 qualidade:'Qualidade: a arte de provar com documento aquilo que todo mundo já fazia direito, e descobrir que não.',
 todos:'Se não está no sistema, não aconteceu. Se está, aconteceu duas vezes.'};

/* ---------- Dados de exemplo compartilhados ---------- */
/* Amostras do dia (tubos) ligadas aos atendimentos de hoje; código no padrão D21 (14 dígitos) */
const AMOSTRAS=[
 {cod:cod14(10,18241,3,1),prot:'10-00018241',n:'Raimundo Nonato Silva',ex:['HEMO'],tipo:'Sangue EDTA',banc:'Hematologia',sit:'R',urg:true,prazo:'09:25',h:'07:48',unid:10},
 {cod:cod14(10,18241,1,2),prot:'10-00018241',n:'Raimundo Nonato Silva',ex:['CREA','UREIA','K'],tipo:'Soro',banc:'Bioquímica',sit:'R',urg:true,prazo:'09:25',h:'07:48',unid:10},
 {cod:cod14(10,18233,1,2),prot:'10-00018233',n:'Maria Helena Souza',ex:['K','GLI','COL','TGO'],tipo:'Soro',banc:'Bioquímica',sit:'D',prazo:'16:00',h:'07:30',unid:10},
 {cod:cod14(10,18233,3,1),prot:'10-00018233',n:'Maria Helena Souza',ex:['HEMO'],tipo:'Sangue EDTA',banc:'Hematologia',sit:'L',prazo:'16:00',h:'07:30',unid:10},
 {cod:cod14(10,18250,1,1),prot:'10-00018250',n:'Larissa Monteiro',ex:['TSH','T4L'],tipo:'Soro',banc:'Hormônios',sit:'C',prazo:'amanhã 16:00',h:'08:10',unid:10},
 {cod:cod14(10,18255,1,1),prot:'10-00018255',n:'Francisco das Chagas',ex:['GLI','HBA1C','COL','TRIG','CREA'],tipo:'Soro',banc:'Bioquímica',sit:'A',prazo:'16:00',h:'',unid:10},
 {cod:cod14(10,18262,1,1),prot:'10-00018262',n:'Cícero Romão',ex:['K','CREA','UREIA','GLI'],tipo:'Soro',banc:'Bioquímica',sit:'T',urg:true,prazo:'09:40',h:'07:55',unid:10,orig:'Domiciliar'},
 {cod:cod14(10,18190,1,1),prot:'10-00018190',n:'Francisca Oliveira',ex:['HBA1C','GLI','COL'],tipo:'Soro',banc:'Bioquímica',sit:'L',prazo:'ontem',h:'',unid:10},
 {cod:cod14(14,4471,2,1),prot:'14-00004471',n:'Luana Ferreira Castro',ex:['HEMO'],tipo:'Sangue EDTA',banc:'Hematologia',sit:'T',prazo:'16:00',h:'07:20',unid:14,falta:true},
 {cod:cod14(14,4502,1,1),prot:'14-00004502',n:'Marcos Vinícius Rocha',ex:['PSA','CREA','UREIA','GLI'],tipo:'Soro',banc:'Bioquímica',sit:'J',prazo:'16:00',h:'07:22',unid:14,recusa:'Hemólise'},
 {cod:cod14(14,4503,4,1),prot:'14-00004503',n:'Joana Darc Pereira',ex:['EAS'],tipo:'Urina',banc:'Urinálise',sit:'R',prazo:'16:00',h:'07:25',unid:14},
 {cod:cod14(12,2210,1,1),prot:'12-00002210',n:'Severino Alves',ex:['GENE'],tipo:'Sangue EDTA',banc:'Apoio',sit:'R',prazo:'18/11',h:'07:40',unid:12,apoio:'Pardini'},
 {cod:cod14(12,2211,1,1),prot:'12-00002211',n:'Rita de Cássia Lins',ex:['VITD','FERR'],tipo:'Soro',banc:'Apoio',sit:'R',prazo:'03/11',h:'07:41',unid:12,apoio:'DB'},
];
const AM=c=>AMOSTRAS.find(a=>a.cod===c);
const exNomes=l=>l.map(c=>EX[c]?EX[c].n:c).join(', ');
const TIPOS_AMOSTRA={1:'Soro',2:'Plasma fluoretado',3:'Sangue EDTA',4:'Urina',5:'Fezes',6:'Citrato'};
const BANCADAS=[
 {c:'HEM',n:'Hematologia',setor:'Hematologia',ordem:1,ex:['HEMO'],ap:'DxH 800',ativo:true},
 {c:'BIO',n:'Bioquímica',setor:'Bioquímica',ordem:2,ex:['GLI','TRIG','COL','CREA','UREIA','TGO','TGP','K','HBA1C'],ap:'Analisador A',ativo:true},
 {c:'HOR',n:'Hormônios',setor:'Imunologia e hormônios',ordem:3,ex:['TSH','T4L','PSA','BHCG','FERR'],ap:'Imuno 1',ativo:true},
 {c:'URI',n:'Urinálise',setor:'Urinálise',ordem:4,ex:['EAS'],ap:'',ativo:true},
 {c:'COA',n:'Coagulação',setor:'Coagulação',ordem:5,ex:['TAP'],ap:'',ativo:true},
 {c:'MIC',n:'Microbiologia',setor:'Microbiologia',ordem:6,ex:[],ap:'',ativo:false},
 {c:'APO',n:'Apoio',setor:'Apoio',ordem:9,ex:['GENE','VITD'],ap:'',ativo:true},
 {c:'PAR',n:'Parasitologia',setor:'Parasitologia',ordem:7,ex:[],ap:'',ativo:false},
];
const USUARIOS=[
 {n:'Jânio Costa Cavalcante',ini:'JC',perfil:'admin',unids:[10,12,14],sit:'Ativo',email:'janio@deoclinic.com.br',cons:''},
 {n:'Paula Mendes',ini:'PA',perfil:'recepcao',unids:[10],sit:'Ativo',email:'paula@deoclinic.com.br'},
 {n:'Rafael Sousa',ini:'RA',perfil:'recepcao',unids:[10],sit:'Ativo',email:'rafael@deoclinic.com.br'},
 {n:'Carla Nogueira',ini:'CA',perfil:'recepcao',unids:[14],sit:'Ativo',email:'carla@deoclinic.com.br'},
 {n:'Dra. Helena Brito',ini:'HB',perfil:'dr',unids:[10,12,14],sit:'Ativo',email:'helena@deoclinic.com.br',cons:'CRBM 1ª 12345'},
 {n:'Dr. Marcos Tavares',ini:'MT',perfil:'dr',unids:[10],sit:'Ativo',email:'marcos@deoclinic.com.br',cons:'CRF-CE 9876'},
 {n:'Tiago Lira',ini:'TL',perfil:'tecnico',unids:[10],sit:'Ativo',email:'tiago@deoclinic.com.br',banc:['HEM','BIO']},
 {n:'Bruna Castro',ini:'BC',perfil:'tecnico',unids:[10],sit:'Ativo',email:'bruna@deoclinic.com.br',banc:['HOR','URI']},
 {n:'Edna Ribeiro',ini:'ER',perfil:'coletador',unids:[10],sit:'Ativo',email:'edna@deoclinic.com.br'},
 {n:'Lúcia Fernandes',ini:'LF',perfil:'gestor',unids:[14],sit:'Ativo',email:'lucia@deoclinic.com.br'},
 {n:'Sérgio Matos',ini:'SM',perfil:'financeiro',unids:[10],sit:'Ativo',email:'sergio@deoclinic.com.br'},
 {n:'Vera Lúcia Pinto',ini:'VP',perfil:'convenios',unids:[10],sit:'Ativo',email:'vera@deoclinic.com.br'},
 {n:'Andréa Queiroz',ini:'AQ',perfil:'qualidade',unids:[10],sit:'Ativo',email:'andrea@deoclinic.com.br'},
 {n:'Juliana Prado',ini:'JP',perfil:'tecnico',unids:[10],sit:'Pendente de Ativação',email:'juliana.prado@gmail.com'},
 {n:'Roberto Alves',ini:'RA',perfil:'coletador',unids:[12],sit:'Inativo',email:'roberto@deoclinic.com.br'},
];
const APARELHOS=[
 {n:'DxH 800',modelo:'Beckman Coulter DxH 800',banc:'HEM',unid:10,proto:'ASTM E1394',conn:'Serial COM3',on:true,ultima:'08:58',erros:0,hora:'46 resultados'},
 {n:'Analisador A',modelo:'Bioquímica (ref. AU480)',banc:'BIO',unid:10,proto:'HL7 v2',conn:'Rede 192.168.0.21',on:true,ultima:'08:57',erros:1,hora:'212 resultados'},
 {n:'Imuno 1',modelo:'Imunoensaio (ref. Access 2)',banc:'HOR',unid:10,proto:'ASTM E1381',conn:'Serial COM5',on:false,ultima:'07:12',erros:0,hora:'calado há 1h48'},
 {n:'VITEK 2 (fase 9)',modelo:'bioMérieux VITEK 2 Compact',banc:'MIC',unid:10,proto:'a definir',conn:'',on:false,ultima:'',erros:0,hora:'sem integração'},
];
const CONV_TAB=CONVENIOS;

/* O modal de recoleta da biblioteca serve a todas as telas */
const modalRecoleta=()=>modalForm();

/* ======================================================================
   Rodada 3 (04/11, anotações 182 a 200): modelo do tubo e ordem de coleta, prévia da etiqueta,
   triagem que acompanha o tubo, foto do pedido, assinatura na tela, caixa com não faturados.
   ====================================================================== */
document.head.insertAdjacentHTML('beforeend',`<style>
.tubo-ord{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.tubo-ord li{display:flex;gap:10px;align-items:center;padding:6px 10px;border:1px solid var(--border);border-radius:12px;background:var(--surface);font-size:13px}
.tubo-ord .on{flex:none;width:22px;height:22px;border-radius:50%;background:var(--accent);color:var(--on-accent);display:grid;place-items:center;font-weight:800;font-size:12px}
.tubo-ord li.fr .on{background:var(--surface2);color:var(--fg2)}
.tubo-ord .tx{flex:1;min-width:0;line-height:1.35}.tubo-ord .tx b{color:var(--fg-strong)}.tubo-ord .tx small{display:block;color:var(--fg2);font-size:12px}
.tubo-svg{flex:none}
.etqs{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.etq{border:1px dashed var(--fg2);border-radius:10px;padding:10px 12px;background:#fff;color:#111;display:flex;gap:10px;align-items:flex-start;font-size:12px;line-height:1.3}
.etq .eb{flex:1;min-width:0}.etq .eb b{font-size:13px;display:block}.etq .mono{font-size:12px;letter-spacing:.04em}
.etq svg.bc{display:block;width:100%;height:34px;margin:4px 0 2px}
.etq .em{margin-top:4px;padding-top:4px;border-top:1px solid #ddd;color:#444;font-size:11px}
.tri-box{border:1px solid var(--warn);background:var(--warn-soft);border-radius:12px;padding:10px 12px;font-size:13px;display:flex;flex-direction:column;gap:6px}
.tri-box b{color:var(--fg-strong)}
.tri-chks{display:flex;flex-wrap:wrap;gap:6px 14px}
.sigpad{width:100%;height:180px;border:1px dashed var(--fg2);border-radius:12px;background:#fff;touch-action:none;cursor:crosshair;display:block}
.foto-prev{max-width:100%;max-height:260px;border-radius:12px;border:1px solid var(--border);display:block}
.file-btn{position:relative;overflow:hidden}.file-btn input{position:absolute;inset:0;opacity:0;cursor:pointer}
.col-ex{display:flex;flex-direction:column;gap:6px}
.col-ex .ce{border:1px solid var(--border);border-radius:12px;padding:8px 10px;background:var(--surface);font-size:13px}
.col-ex .ce.pend{border-color:var(--warn);background:var(--warn-soft)}
.col-ex .ce .row{gap:8px}
.col-ex .ce .cobs{display:none;margin-top:6px;gap:6px;flex-wrap:wrap}.col-ex .ce.pend .cobs{display:flex}
.falt-ic{display:inline-flex;align-items:center;gap:4px;color:var(--err);font-weight:700;font-size:12px;white-space:nowrap}
.falt-ic svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2}
.naofat{border:1px solid var(--warn);background:var(--warn-soft);border-radius:12px;padding:10px 12px;font-size:13px;display:flex;flex-direction:column;gap:6px;margin-top:10px}
.naofat .nf{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.naofat .nf .grow{flex:1;min-width:160px}.naofat small{color:var(--fg2);display:block}
.relt{border:1px solid var(--border);border-radius:16px;padding:16px;background:var(--surface)}
</style>`);

/* Modelo de tubo por material e ordem de coleta (citrato → soro → EDTA → fluoreto; urina é frasco à parte) */
const TUBO_MOD={
 Citrato:{o:1,n:'Citrato de sódio 3,2%',tampa:'azul-clara',cor:'#6EB5E8',vol:'2,7 mL',inv:'3 a 4 inversões'},
 Soro:{o:2,n:'Soro com gel separador',tampa:'amarela ou vermelha',cor:'#E8B931',vol:'5 mL',inv:'5 inversões'},
 EDTA:{o:3,n:'EDTA K2',tampa:'roxa',cor:'#8B5CC7',vol:'4 mL',inv:'8 a 10 inversões'},
 Fluoreto:{o:4,n:'Fluoreto de sódio',tampa:'cinza',cor:'#9AA3AD',vol:'2 mL',inv:'8 a 10 inversões'},
 Urina:{o:9,n:'Frasco de urina estéril',tampa:'amarela (frasco)',cor:'#F3D34A',vol:'até 50 mL',inv:'',fr:true}};
const matDe=c=>(typeof EX!=='undefined'&&EX[c]&&EX[c].m)||'';
function tubosDe(exs){const g={};(exs||[]).forEach(c=>{const m=matDe(c);if(!m)return;(g[m]=g[m]||[]).push(c)});return Object.entries(g).map(([m,l])=>Object.assign({m,ex:l},TUBO_MOD[m]||{o:8,n:m,tampa:'',cor:'#BBBBBB',vol:'',inv:''})).sort((a,b)=>a.o-b.o)}
const tuboSvg=(t,h=34)=>t.fr?`<svg class="tubo-svg" width="${Math.round(h*.8)}" height="${h}" viewBox="0 0 24 30" aria-hidden="true"><rect x="3" y="2" width="18" height="6" rx="2" fill="${t.cor}" stroke="#555" stroke-width="1"/><rect x="4" y="8" width="16" height="20" rx="3" fill="#fff" stroke="#555" stroke-width="1"/><rect x="5" y="16" width="14" height="11" rx="2" fill="#F6E58D" opacity=".7"/></svg>`:`<svg class="tubo-svg" width="${Math.round(h*.45)}" height="${h}" viewBox="0 0 14 34" aria-hidden="true"><rect x="1" y="1" width="12" height="7" rx="2" fill="${t.cor}" stroke="#555" stroke-width="1"/><path d="M2.5 8h9v20a4.5 4.5 0 0 1-9 0z" fill="#fff" stroke="#555" stroke-width="1"/><path d="M3.5 18h7v10a3.5 3.5 0 0 1-7 0z" fill="#C0392B" opacity=".75"/></svg>`;
function ordemColeta(exs,opt={}){const l=tubosDe(exs);if(!l.length)return '<p class="tl">Sem tubo a colher.</p>';let n=0;
 return `<ol class="tubo-ord">${l.map(t=>`<li class="${t.fr?'fr':''}"><span class="on">${t.fr?'·':++n}</span>${tuboSvg(t,30)}<span class="tx"><b>${t.fr?'Frasco à parte':n+'º tubo'}: ${t.n}</b> · tampa ${t.tampa}${t.vol?' · '+t.vol:''}<small>${t.ex.map(c=>EX[c]?EX[c].n:c).join(', ')}${t.inv?' · homogeneizar com '+t.inv:''}</small></span></li>`).join('')}</ol>${opt.nota===false?'':`<p class="tl" style="margin-top:6px">Ordem de coleta: citrato (azul) → soro (amarela/vermelha) → EDTA (roxa) → fluoreto (cinza). Urina e fezes são frascos à parte e não entram na ordem.</p>`}`}

/* Código de barras de mentira (desenho), só para a prévia */
function barcodeSvg(code){const d=String(code).replace(/\D/g,'')||'0';let x=2,bars='';for(let i=0;i<d.length;i++){const v=+d[i];[1+(v%3),1,2+(v%2),1].forEach((w,j)=>{if(j%2===0)bars+=`<rect x="${x}" y="0" width="${w}" height="30" fill="#111"/>`;x+=w})}return `<svg class="bc" viewBox="0 0 ${x+2} 30" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`}

/* Prévia das etiquetas: uma por tubo, com o modelo do tubo (anotações 182, 190 e 195) */
let ETQ_CTX=null;
function etiquetaPrev(o){o=Object.assign({n:'Paciente',nasc:'',prot:'10-00018233',exs:['HEMO','COL'],modo:'Impressora do box 1'},o||{});ETQ_CTX=o;const ts=tubosDe(o.exs);const [u,p]=String(o.prot).split('-');
 const lab=ts.map((t,i)=>{const cod=`${u}-${String(+p).padStart(8,'0')}-${String(t.o).padStart(2,'0')}-01`;return `<div class="etq">${tuboSvg(t,58)}<div class="eb"><b>${esc(o.n)}</b>${o.nasc?`<span>Nasc. ${esc(o.nasc)}</span>`:''}${barcodeSvg(cod)}<span class="mono">${cod}</span><div>${t.ex.join(' · ')}</div><div class="em">${t.fr?'Frasco':'Tubo'}: <b style="display:inline;font-size:11px">${t.n}</b> · tampa ${t.tampa}${t.vol?' · '+t.vol:''}</div></div></div>`}).join('');
 openModal(`${mh('Prévia das etiquetas · '+esc(o.n.split(' ')[0]))}<div class="mb"><p style="font-size:14px;color:var(--fg2)">${ts.length} etiqueta(s), uma por tubo, na ordem de coleta. Cada etiqueta mostra o modelo do tubo em que deve ser colada. Saída: <b>${esc(o.modo)}</b>.${o.preColeta?' A data e a hora da coleta ficam registradas quando a coleta for confirmada.':''}</p><div class="etqs">${lab||'<p class="tl">Nenhum exame laboratorial: não há etiqueta de tubo.</p>'}</div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn" onclick="toast('${ts.length} etiqueta(s) enviada(s): ${esc(o.modo).replace(/'/g,'')}');modalVoltar()||closeModal()">${I.print} Imprimir ${ts.length} etiqueta(s)</button></div>`,'wide')}

/* Etiqueta de caixa (rack da soroteca, lote de transporte): prévia; imprimir é simulado. o={titulo,cod,num,linhas,saida,apos} */
let ETQ_CX=null;
function etqCaixa(o){ETQ_CX=o;openModal(`${mh('Prévia da etiqueta · '+esc(o.titulo))}<div class="mb"><p style="font-size:14px;color:var(--fg2)">1 etiqueta para identificar a caixa. Saída: <b>${esc(o.saida)}</b>.</p><div class="etqs"><div class="etq"><div class="eb"><b>${esc(o.titulo)}</b>${barcodeSvg(o.num)}<span class="mono">${esc(o.cod)}</span>${o.linhas.map(l=>`<div>${esc(l)}</div>`).join('')}</div></div></div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn" onclick="etqCaixaImprime()">${I.print} Imprimir etiqueta</button></div>`)}
function etqCaixaImprime(){const o=ETQ_CX;closeModal();if(o.apos)o.apos();toast('Etiqueta enviada: '+esc(o.saida))}

/* Triagem: o que o paciente toma, doenças crônicas, jejum. Fica no atendimento e a biomédica confere ao bipar. */
const TRI_DOENCAS=['Diabetes','Hipertensão','Doença da tireoide','Doença renal','Doença do fígado','Cardiopatia','Usa anticoagulante','Gestante'];
const TRIAGENS={
 '10-00018233':{med:'Losartana 50 mg (manhã); Sinvastatina 20 mg (noite)',cron:['Hipertensão'],jejum:'10 h',obs:'Tomou a losartana às 6h.',bio:''},
 '10-00018241':{med:'Metformina 850 mg; AAS 100 mg',cron:['Diabetes','Cardiopatia'],jejum:'12 h',obs:'Idoso, veia difícil.',bio:''},
 '10-00018262':{med:'Furosemida 40 mg; Espironolactona 25 mg',cron:['Doença renal','Hipertensão'],jejum:'8 h',obs:'Coleta domiciliar às 07:38.',bio:''},
 '14-00004471':{med:'Levotiroxina 50 mcg',cron:['Doença da tireoide'],jejum:'4 h',obs:'',bio:''},
 '14-00004502':{med:'Nenhum',cron:[],jejum:'8 h',obs:'',bio:''},
 '14-00004503':{med:'Anticoncepcional oral',cron:[],jejum:'não exigido',obs:'Urina de jato médio.',bio:''},
 '10-00018250':{med:'Nenhum',cron:['Gestante'],jejum:'não exigido',obs:'Gestante de 12 semanas.',bio:''},
 '10-00018255':{med:'Glibenclamida 5 mg',cron:['Diabetes'],jejum:'12 h',obs:'',bio:''}};
const triDe=prot=>TRIAGENS[prot]||(TRIAGENS[prot]={med:'',cron:[],jejum:'',obs:'',bio:''});
function triagemCampos(pf,t){t=t||{};return `<div class="formgrid"><div class="field" style="grid-column:1/-1"><label for="${pf}Med">Medicamentos em uso ${info('Nome, dose e horário da última tomada. Fica no atendimento e aparece para a biomédica quando o tubo é bipado na área técnica.')}</label><textarea class="in" id="${pf}Med" rows="2" placeholder="Ex.: Losartana 50 mg às 6h">${esc(t.med||'')}</textarea></div>
 <div class="field" style="grid-column:1/-1"><label>Doenças crônicas e condições</label><div class="tri-chks">${TRI_DOENCAS.map((d,i)=>`<label class="check"><input type="checkbox" name="${pf}Cr" value="${d}" ${(t.cron||[]).includes(d)?'checked':''}>${d}</label>`).join('')}</div></div>
 <div class="field"><label for="${pf}Jej">Jejum</label><input class="in" id="${pf}Jej" value="${esc(t.jejum||'')}" placeholder="Ex.: 10 h"></div>
 <div class="field"><label for="${pf}Obs">Observações</label><input class="in" id="${pf}Obs" value="${esc(t.obs||'')}" placeholder="Ex.: atividade física ontem"></div></div>`}
function triagemLer(pf){const v=id=>{const e=document.getElementById(pf+id);return e?e.value.trim():''};return {med:v('Med'),cron:[...document.querySelectorAll(`input[name="${pf}Cr"]:checked`)].map(e=>e.value),jejum:v('Jej'),obs:v('Obs')}}
const triResumo=t=>kvs([['Medicamentos',t.med?esc(t.med):'<span class="tl">não informado</span>'],['Doenças crônicas',(t.cron||[]).length?t.cron.map(esc).join(', '):'<span class="tl">nenhuma informada</span>'],['Jejum',t.jejum?esc(t.jejum):'—'],['Observações',t.obs?esc(t.obs):'—']]);

/* Foto do pedido: câmera do celular ou arquivo (anotação 196) */
function fotoPedido(nome,cb){openModal(`${mh('Foto do pedido · '+esc(nome))}<div class="mb"><p style="font-size:14px;color:var(--fg2)">Tire a foto do pedido médico pela câmera do celular ou anexe um arquivo (imagem ou PDF). Fica guardada no atendimento e sincroniza quando a rede voltar.</p><div class="row"><label class="btn file-btn">${I.plus} Tirar foto<input type="file" accept="image/*" capture="environment" onchange="fotoMostra(this)" aria-label="Tirar foto do pedido"></label><label class="btn sec file-btn">Anexar arquivo<input type="file" accept="image/*,application/pdf" onchange="fotoMostra(this)" aria-label="Anexar arquivo do pedido"></label></div><div id="fotoPrev" class="tl">Nenhum arquivo ainda.</div></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="fotoSalva('${esc(nome).replace(/'/g,'')}')">Guardar no atendimento</button></div>`);FOTO_CB=cb||null;FOTO_OK=false}
let FOTO_OK=false,FOTO_CB=null;
function fotoMostra(inp){const f=inp.files&&inp.files[0],box=$('#fotoPrev');if(!f||!box)return;FOTO_OK=true;if(/^image\//.test(f.type)){let u='';try{u=URL.createObjectURL(f)}catch(e){}box.innerHTML=u?`<img class="foto-prev" src="${u}" alt="Prévia do pedido"><small class="tl">${esc(f.name)} · ${Math.round(f.size/1024)} KB</small>`:esc(f.name)}else box.innerHTML=`<div class="doc"><div class="di">${I.doc}</div><div class="dd">${esc(f.name)}<small>${Math.round(f.size/1024)} KB</small></div></div>`}
function fotoSalva(nome){if(!FOTO_OK){toast('Tire a foto ou escolha um arquivo antes de guardar','warn');return}closeModal();toast('Foto do pedido de '+nome+' guardada no atendimento');if(FOTO_CB)FOTO_CB()}

/* Assinatura do cliente na tela (anotação 197) */
let SIG_CB=null,SIG_TEM=false;
function assinaturaModal(nome,cb){SIG_CB=cb||null;SIG_TEM=false;openModal(`${mh('Assinatura · '+esc(nome))}<div class="mb"><p style="font-size:14px;color:var(--fg2)">Peça para ${esc(nome.split(' ')[0])} assinar com o dedo na área abaixo. A assinatura confirma a coleta em casa e fica no atendimento.</p><canvas class="sigpad" id="sigPad" aria-label="Área de assinatura"></canvas><span class="tl">Assine dentro do quadro.</span></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn sec" onclick="sigLimpa()">Limpar</button><button class="btn" onclick="sigSalva('${esc(nome).replace(/'/g,'')}')">Salvar assinatura</button></div>`);setTimeout(sigInit,30)}
function sigInit(){const c=$('#sigPad');if(!c)return;const r=c.getBoundingClientRect(),dpr=window.devicePixelRatio||1;c.width=Math.max(1,r.width*dpr);c.height=Math.max(1,r.height*dpr);const x=c.getContext('2d');x.scale(dpr,dpr);x.lineWidth=2.2;x.lineCap='round';x.strokeStyle='#111';let on=false;
 const p=e=>{const b=c.getBoundingClientRect();return [e.clientX-b.left,e.clientY-b.top]};
 c.addEventListener('pointerdown',e=>{on=true;try{c.setPointerCapture(e.pointerId)}catch(_){}const [a,b]=p(e);x.beginPath();x.moveTo(a,b);e.preventDefault()});
 c.addEventListener('pointermove',e=>{if(!on)return;const [a,b]=p(e);x.lineTo(a,b);x.stroke();SIG_TEM=true});
 ['pointerup','pointerleave','pointercancel'].forEach(ev=>c.addEventListener(ev,()=>{on=false}))}
function sigLimpa(){const c=$('#sigPad');if(!c)return;c.getContext('2d').clearRect(0,0,c.width,c.height);SIG_TEM=false}
function sigSalva(nome){if(!SIG_TEM){toast('A assinatura está em branco','warn');return}closeModal();toast('Assinatura de '+nome+' guardada no atendimento');if(SIG_CB)SIG_CB()}

/* Baixar um relatório da tela como planilha (CSV) */
function baixarCsv(nome,linhas){const csv=linhas.map(l=>l.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\r\n');try{const b=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=nome;document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),100);toast('Planilha '+nome+' baixada')}catch(e){toast('Não foi possível baixar aqui; use Imprimir e salve em PDF','warn')}}

/* Janela por cima de janela: guarda a atual (com o que já foi digitado) e põe "Voltar" na nova */
function modalAberto(){const b=$('#backdrop');return !!(b&&b.classList.contains('show'))}
function modalGuarda(){if(!modalAberto())return null;const m=$('#modal'),f=document.createDocumentFragment();while(m.firstChild)f.appendChild(m.firstChild);return {f,cls:m.className}}
function modalRestaura(g){if(!g)return;const m=$('#modal');m.innerHTML='';m.className=g.cls;m.appendChild(g.f);$('#backdrop').classList.add('show')}
let MODAL_ANT=null;function modalVolta(g,label){if(!g)return;MODAL_ANT=g;const f=$('#modal .mf');if(f)f.insertAdjacentHTML('afterbegin',`<button class="btn ghost" onclick="modalVoltar()">${label||'Voltar'}</button>`)}
function modalVoltar(){const g=MODAL_ANT;MODAL_ANT=null;if(!g)return false;modalRestaura(g);return true}
{const _c=closeModal;closeModal=function(){MODAL_ANT=null;return _c.apply(this,arguments)}}
function sobreModal(abre,label){const g=modalGuarda();abre(g);modalVolta(g,label)}
