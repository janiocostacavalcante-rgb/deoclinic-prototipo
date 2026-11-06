/* ---------- DeoClinic · Imagem e ultrassom: exames de imagem, laudo estruturado de ultrassom (RADS + IA) e padrões de laudo (04/11) ----------
   Rotas: imagem-worklist, laudo-us, padroes-laudo. Tudo com prefixo IM_/im para não colidir com os outros módulos.
   Reaproveita PACIENTES, UNIDS, CONVENIOS (núcleo) e PROFISSIONAIS, PROCEDIMENTOS, SALAS (dados-clinica.js).
   Calculadoras com a lógica publicada: ACR TI-RADS (2017), ACR BI-RADS US (5ª ed., apoio à decisão), O-RADS US v2022, LI-RADS US Surveillance v2024
   e biometria fetal de Hadlock (IG 1984, peso 1985 com 4 parâmetros, percentil pela curva de Hadlock 1991). */

document.head.insertAdjacentHTML('beforeend',`<style>
.im-ld{display:grid;gap:16px;grid-template-columns:minmax(0,1.55fr) minmax(0,1fr);align-items:start}
@media(max-width:1100px){.im-ld{grid-template-columns:minmax(0,1fr)}}
.im-col{display:flex;flex-direction:column;gap:16px;min-width:0}
.im-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:18px;min-width:0}
.im-card h3{font-size:16px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.im-card .sub{color:var(--fg2);font-size:13px;margin:2px 0 12px}
.im-sec{border:1px solid var(--border);border-radius:14px;padding:12px 14px;background:var(--surface);display:flex;flex-direction:column;gap:8px}
.im-sec.alt{border-color:var(--warn);background:color-mix(in srgb,var(--warn-soft) 45%,var(--surface))}
.im-sec .im-st{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap}
.im-sec .im-st b{color:var(--fg-strong);font-size:14.5px}
.im-frases{display:flex;flex-wrap:wrap;gap:6px}
.im-frases .chip{height:auto;min-height:28px;padding:4px 10px;font-size:12.5px;text-align:left;line-height:1.3}
.im-sec textarea.in{min-height:64px;font-size:14px}
.im-meas{display:grid;grid-template-columns:minmax(0,1fr) 96px minmax(0,auto);gap:6px 10px;align-items:center;font-size:13.5px}
.im-meas .in{height:34px;font-size:14px;padding:0 8px}
.im-meas .ref{font-size:12px;color:var(--fg2)}
.im-meas .fl{font-weight:800;font-size:12px;margin-left:4px}.im-meas .fl.up,.im-meas .fl.dn{color:var(--err)}.im-meas .fl.ok{color:var(--ok)}
.im-meas .calc{font-weight:700;color:var(--fg-strong);padding-left:8px}
.im-calc{border:1px solid var(--accent);border-radius:14px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;background:color-mix(in srgb,var(--accent-soft) 35%,var(--surface))}
.im-calc .formgrid{gap:10px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))}
.im-calc .field label{font-size:12.5px}
.im-calc select.in,.im-calc input.in{height:36px;font-size:14px}
.im-res{display:flex;gap:12px;align-items:center;border:1px solid var(--border);border-radius:12px;padding:10px 12px;background:var(--surface);flex-wrap:wrap}
.im-res .cat{font-size:22px;font-weight:800;color:var(--fg-strong);min-width:64px;text-align:center;line-height:1.1}
.im-res .cat small{display:block;font-size:11px;color:var(--fg2);font-weight:600}
.im-res .cd{flex:1;min-width:180px;font-size:13.5px}.im-res .cd small{display:block;color:var(--fg2);font-size:12px}
.im-res.r1 .cat{color:var(--ok)}.im-res.r3 .cat{color:var(--warn)}.im-res.r4 .cat,.im-res.r5 .cat{color:var(--err)}
.im-nod{border-top:1px dashed var(--border);padding-top:10px;display:flex;flex-direction:column;gap:8px}
.im-focos{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px}.im-focos .check{font-size:13px}.im-focos .check input{width:16px;height:16px}
.im-ia{border:2px dashed var(--accent);border-radius:20px;padding:18px;background:var(--surface);display:flex;flex-direction:column;gap:10px}
.im-ia .warnia{font-size:12.5px;font-weight:700;color:var(--warn);background:var(--warn-soft);border-radius:8px;padding:6px 10px}
.im-ia textarea.in{min-height:110px;font-size:13.5px}
.im-prog{display:flex;gap:3px;align-items:center}.im-prog i{width:14px;height:6px;border-radius:3px;background:var(--border);display:block}.im-prog i.on{background:var(--accent)}.im-prog i.cur{background:var(--info)}
.im-eqs{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.im-eq{border:1px solid var(--border);border-radius:14px;padding:10px 12px;background:var(--surface);font-size:13px;cursor:pointer;text-align:left;color:var(--fg);font-family:inherit}
.im-eq:hover,.im-eq.on{border-color:var(--accent);background:var(--accent-soft)}
.im-eq b{display:block;color:var(--fg-strong);font-size:14px}.im-eq small{display:block;color:var(--fg2);font-size:12px}
.im-eq.off{border-style:dashed;border-color:var(--warn)}
.im-viewer{background:var(--tip-bg);color:var(--tip-fg);border-radius:14px;display:grid;grid-template-columns:120px minmax(0,1fr);gap:0;overflow:hidden;min-height:380px}
.im-viewer .im-ser{display:flex;flex-direction:column;gap:8px;padding:10px;border-right:1px solid color-mix(in srgb,var(--tip-fg) 18%,transparent)}
.im-viewer .im-ser button{background:transparent;border:1px solid color-mix(in srgb,var(--tip-fg) 25%,transparent);border-radius:8px;color:var(--tip-fg);font-size:11px;padding:4px;cursor:pointer;flex:none;width:98px}
.im-viewer .im-ser button.on{border-color:var(--accent)}
.im-viewer .im-vp{position:relative;display:flex;flex-direction:column}
@media(max-width:640px){.im-viewer{grid-template-columns:minmax(0,1fr)}.im-viewer .im-ser{overflow-x:auto;flex-direction:row;border-right:0}}
.im-viewer .im-tb{display:flex;gap:4px;flex-wrap:wrap;padding:8px;border-bottom:1px solid color-mix(in srgb,var(--tip-fg) 18%,transparent)}
.im-viewer .im-tb button{background:transparent;border:1px solid color-mix(in srgb,var(--tip-fg) 25%,transparent);color:var(--tip-fg);border-radius:6px;font-size:12px;height:28px;padding:0 10px;cursor:pointer}
.im-viewer .im-tb button:hover{border-color:var(--accent)}
.im-viewer .im-img{flex:1;position:relative;display:grid;place-items:center;padding:12px}
.im-viewer .im-img svg{width:100%;max-width:520px;height:auto}
.im-viewer .ov{position:absolute;font-size:11px;line-height:1.35;opacity:.85;font-family:ui-monospace,Menlo,monospace}
.im-thumbs{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}
.im-thumbs figure{margin:0;border:1px solid var(--border);border-radius:8px;overflow:hidden;background:var(--tip-bg)}
.im-thumbs figcaption{font-size:11px;color:var(--fg2);background:var(--surface);padding:3px 6px}
.im-print{border:1px solid var(--border);border-radius:12px;padding:18px;background:var(--surface);font-size:13.5px;display:flex;flex-direction:column;gap:12px}
.im-print .lh{display:flex;justify-content:space-between;gap:12px;border-bottom:2px solid var(--accent);padding-bottom:10px;flex-wrap:wrap}
.im-print h4{font-size:15px;text-align:center;letter-spacing:.04em;text-transform:uppercase}
.im-print p{line-height:1.55}
.im-print .ass{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid var(--border);padding-top:10px;align-items:center}
.im-water{border:2px dashed var(--warn);color:var(--warn);font-weight:800;text-align:center;border-radius:8px;padding:6px;font-size:12px;letter-spacing:.06em}
.im-ver{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--border);font-size:13.5px}.im-ver:last-child{border-bottom:0}
.im-ver .vn{flex:none;width:34px;height:34px;border-radius:10px;background:var(--surface2);display:grid;place-items:center;font-weight:800;font-size:13px;color:var(--fg-strong)}
.im-ver small{display:block;color:var(--fg2);font-size:12px}
.im-json{font-family:ui-monospace,Menlo,monospace;font-size:12px;min-height:220px}
.im-pd-sec{border:1px solid var(--border);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;font-size:13.5px}
.im-pd-sec b{color:var(--fg-strong)}
.im-pd-sec .fr{font-size:12.5px;color:var(--fg2);padding-left:10px;border-left:3px solid var(--border)}
.im-pd-sec .fr.n{border-left-color:var(--ok)}.im-pd-sec .fr.a{border-left-color:var(--warn)}
.im-pd-meas{display:grid;grid-template-columns:minmax(0,1fr) 70px 70px 50px;gap:4px 8px;align-items:center;font-size:12.5px}
.im-pd-meas .in{height:30px;font-size:13px;padding:0 6px}
.im-tlink{display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13.5px}.im-tlink:last-child{border-bottom:0}
@media(max-width:640px){.im-tbl table.at-table,.im-tbl table.at-table tbody{display:block;width:100%}.im-tbl .at-table td{flex-wrap:wrap}}
.im-wr{display:flex;flex-wrap:wrap;gap:4px;min-width:0}
@media(max-width:640px){.im-wr{justify-content:flex-end}}
.im-tlink .dd{flex:1;min-width:0}.im-tlink small{display:block;color:var(--fg2);font-size:12px}
</style>`);

const IM_IC={
 img:'<svg class="i" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>',
 send:'<svg class="i" viewBox="0 0 24 24"><path d="M4 12 20 4l-6 16-3-7z"/></svg>',
 ia:'<svg class="i" viewBox="0 0 24 24"><path d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4zM18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z"/></svg>',
 sign:'<svg class="i" viewBox="0 0 24 24"><path d="M4 18c3-6 5-9 7-9s-1 7 1 7 3-4 4-4 1 3 4 3M4 21h16"/></svg>',
 cal:'<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
 wpp:'<svg class="i" viewBox="0 0 24 24"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/></svg>'};

/* ---------- Dados de exemplo ---------- */
const IM_ASSINA=['imagem','medico','dr','admin'];           // perfis que assinam laudo
const IM_EDITA=['imagem','medico','dr','admin'];            // perfis que podem editar padrões (se estiverem na lista do padrão)
const IM_ST=['Agendado','Chegou','Em exame','Imagens recebidas','Em laudo','Laudo liberado','Entregue'];
const IM_STC=['neutral','info','info','acc','warn','ok','ok'];
const IM_AGORA=9*60; // o protótipo trabalha às 9h (HOJE)
const IM_EQUIP=[
 {id:'us1',n:'Ultrassom 1',ap:'GE Logiq P9',sala:'Sala de ultrassom',unid:10,mod:'US',aet:'LOGIQP9_U10',on:true},
 {id:'us2',n:'Ultrassom 2',ap:'Samsung HS40',sala:'Sala de US · Posto 14',unid:14,mod:'US',aet:'HS40_P14',on:true},
 {id:'rx1',n:'Raio X',ap:'Philips DigitalDiagnost C90',sala:'Sala de RX',unid:10,mod:'DX',aet:'DDIAG_U10',on:true},
 {id:'mg1',n:'Mamógrafo',ap:'Hologic Selenia Dimensions',sala:'Sala de mamografia',unid:10,mod:'MG',aet:'SELENIA_U10',on:false,obs:'Manutenção preventiva até 11h'},
];
const IM_EQ=id=>IM_EQUIP.find(e=>e.id===id)||{n:id,ap:'',sala:'',mod:''};
/* Exames de imagem que não estão no catálogo geral (códigos de exemplo). */
const IM_PROCX=[
 {c:'40901262',n:'US rins e vias urinárias',tipo:'Imagem',dur:20,preco:170,custo:62,sala:'Ultrassom',prep:'Bexiga cheia'},
 {c:'40901386',n:'US partes moles',tipo:'Imagem',dur:20,preco:150,custo:55,sala:'Ultrassom',prep:'Sem preparo'},
 {c:'40805026',n:'RX tórax PA e perfil',tipo:'Imagem',dur:10,preco:90,custo:30,sala:'Raio X',prep:'Retirar objetos metálicos'},
 {c:'40803074',n:'RX coluna lombossacra',tipo:'Imagem',dur:10,preco:110,custo:34,sala:'Raio X',prep:'Sem preparo'},
 {c:'40808041',n:'Mamografia digital bilateral',tipo:'Imagem',dur:20,preco:180,custo:70,sala:'Mamografia',prep:'Sem desodorante ou talco'},
];
const imProc=c=>(typeof PROC==='function'&&PROC(c))||IM_PROCX.find(p=>p.c===c)||{c,n:c};
/* Parceiros de telelaudo e o RIS atual (integrações já em uso pela DeoVita) */
const IM_PARC=[
 {id:'maislaudo',n:'MaisLaudo',tipo:'Telelaudo',mods:'RX, MG',sla:'4 h eletivo · 1 h urgência',on:true,ult:'08:58',fila:3},
 {id:'mobilemed',n:'Mobilemed',tipo:'Telelaudo',mods:'RX, TC, RM',sla:'6 h eletivo · 1 h urgência',on:true,ult:'08:51',fila:1},
 {id:'risweb',n:'RISWEB',tipo:'RIS atual (migração)',mods:'Laudos de imagem antigos (PDF)',sla:'só leitura',on:true,ult:'08:40',fila:0},
];
const IM_EX=[
 {id:'IM-26-004801',pac:'Ana Souza',id_:38,sx:'F',proc:'40901122',eq:'us1',h:'07:40',st:5,laud:'p2',sol:'Dra. Camila Rocha',conv:'Particular',prazo:'09:40',lib:'08:25',img:24,pad:'abdome',ind:'Dor epigástrica há 2 meses',t:['07:20','07:35','07:40','08:02','08:05','08:25']},
 {id:'IM-26-004803',pac:'Pedro Henrique Alves',id_:12,sx:'M',proc:'40901386',eq:'us1',h:'07:00',st:6,laud:'p2',sol:'Dr. Igor Menezes',conv:'Unimed',prazo:'09:00',lib:'07:41',img:12,pad:'partes',ind:'Nódulo em antebraço direito',ent:{canal:'Portal do paciente',h:'08:10'},t:['06:50','06:58','07:00','07:15','07:18','07:41','08:10']},
 {id:'IM-26-004805',pac:'Severino Alves',id_:71,sx:'M',proc:'40803074',eq:'rx1',h:'07:15',st:5,urg:true,laud:'Dr. Fábio Teles · Mobilemed',sol:'Pronto atendimento',conv:'Bradesco Saúde',prazo:'08:32',lib:'08:05',img:3,tele:{p:'mobilemed',env:'07:32',rec:'08:05'},ind:'Lombalgia após queda',t:['07:05','07:10','07:15','07:30','07:32','08:05']},
 {id:'IM-26-004807',pac:'José Carlos Lima',id_:70,sx:'M',proc:'40805026',eq:'rx1',h:'08:05',st:4,laud:'MaisLaudo (na fila)',sol:'Dr. Igor Menezes',conv:'Unimed',prazo:'12:22',img:2,tele:{p:'maislaudo',env:'08:22',rec:null},ind:'Pré-operatório',t:['07:50','08:00','08:05','08:20','08:22']},
 {id:'IM-26-004809',pac:'Luiza Ferreira',id_:32,sx:'F',proc:'40901530',eq:'us2',h:'08:00',st:4,laud:'p3',sol:'Dra. Renata Albuquerque',conv:'Particular',prazo:'10:20',img:31,pad:'obstetrico',ind:'Pré-natal, 28 semanas pela DUM',t:['07:45','07:55','08:00','08:18','08:20']},
 {id:'IM-26-004815',pac:'Francisca Oliveira',id_:63,sx:'F',proc:'40901300',eq:'us1',h:'08:00',st:4,laud:'p2',sol:'Dra. Camila Rocha',conv:'Unimed',prazo:'10:00',img:18,pad:'tireoide',ind:'Nódulo palpável à direita',t:['07:45','07:55','08:00','08:14','08:20']},
 {id:'IM-26-004817',pac:'Maria Helena Souza',id_:65,sx:'F',proc:'40901483',eq:'us1',h:'08:20',st:3,laud:null,sol:'Dra. Renata Albuquerque',conv:'Particular',prazo:'10:35',img:16,pad:'mamas',ind:'Complementar à mamografia (mamas densas)',t:['08:05','08:15','08:20','08:35']},
 {id:'IM-26-004819',pac:'Cícero Romão',id_:58,sx:'M',proc:'40901122',eq:'us2',h:'08:20',st:3,laud:null,sol:'Dra. Camila Rocha',conv:'Hapvida',prazo:'10:40',img:28,pad:'abdome',ind:'Cirrose por hepatite B: vigilância de CHC',t:['08:10','08:15','08:20','08:40']},
 {id:'IM-26-004821',pac:'Larissa Monteiro',id_:29,sx:'F',proc:'40901467',eq:'us1',h:'08:30',st:2,laud:'p2',sol:'Dra. Renata Albuquerque',conv:'Hapvida',prazo:'10:50',img:9,pad:'pelvico',ind:'Dor pélvica à esquerda',t:['08:20','08:28','08:50']},
 {id:'IM-26-004823',pac:'Marcos Vinícius Rocha',id_:52,sx:'M',proc:'40901262',eq:'us2',h:'08:20',st:3,urg:true,laud:null,sol:'Pronto atendimento',conv:'Particular',prazo:'09:20',img:14,pad:'renal',ind:'Cólica renal à direita',t:['08:10','08:15','08:20','08:30']},
 {id:'IM-26-004825',pac:'Joana Darc Pereira',id_:30,sx:'F',proc:'40901530',eq:'us1',h:'09:00',st:0,laud:'p3',sol:'Dra. Renata Albuquerque',conv:'Particular',prazo:'',img:0,pad:'obstetrico',ind:'Morfológico de 2º trimestre',t:[]},
 {id:'IM-26-004831',pac:'Raimundo Nonato Silva',id_:74,sx:'M',proc:'40805026',eq:'rx1',h:'09:10',st:0,laud:null,sol:'Dr. Igor Menezes',conv:'Unimed',prazo:'',img:0,ind:'Tosse há 3 semanas',t:[]},
 {id:'IM-26-004827',pac:'Rita de Cássia Lins',id_:57,sx:'F',proc:'40901300',eq:'us1',h:'09:30',st:0,laud:'p2',sol:'Dra. Camila Rocha',conv:'Particular',prazo:'',img:0,pad:'tireoide',ind:'Controle de nódulo TR3 (1 ano)',t:[]},
 {id:'IM-26-004829',pac:'Teresa Cristina Moura',id_:48,sx:'F',proc:'40808041',eq:'mg1',h:'10:00',st:0,laud:null,sol:'Dra. Renata Albuquerque',conv:'Bradesco Saúde',prazo:'',img:0,ind:'Rastreamento anual',t:[]},
];
const IMX=id=>IM_EX.find(e=>e.id===id);
const IM_PROD=[
 {n:'Dr. Paulo Henrique Viana',tipo:'US',laudos:186,tat:38,prazo:97},
 {n:'Dra. Renata Albuquerque',tipo:'US obstétrica',laudos:64,tat:45,prazo:95},
 {n:'MaisLaudo (telelaudo)',tipo:'RX e MG',laudos:212,tat:190,prazo:92},
 {n:'Mobilemed (telelaudo)',tipo:'RX urgência, TC',laudos:48,tat:52,prazo:100},
];
const IM_GLOSAS=[
 {conv:'Unimed',proc:'US abdome total',motivo:'Guia sem assinatura do beneficiário',v:142.30,st:'Recurso enviado'},
 {conv:'Hapvida',proc:'US transvaginal',motivo:'Indicação clínica ausente no pedido',v:96.40,st:'Em análise'},
 {conv:'Bradesco Saúde',proc:'RX tórax PA e perfil',motivo:'Laudo não anexado ao lote XML',v:58.10,st:'Aceita (perdida)'},
 {conv:'Unimed',proc:'US tireoide',motivo:'Código TUSS divergente da autorização',v:88.00,st:'Recurso enviado'},
];
const IM_RECALL=[
 {pac:'Rita de Cássia Lins',motivo:'ACR TI-RADS TR3 (1,8 cm): US de tireoide em 1 ano',quando:'04/11/2026',st:'Agendado hoje 09:30',orig:'Laudo IM-25-003310'},
 {pac:'Ana Souza',motivo:'BI-RADS 3: US de mamas em 6 meses',quando:'12/12/2026',st:'Aguardando agendamento',orig:'Laudo IM-26-002144'},
];
let IM_F={eq:'',st:-1,chip:'todos',q:''};

/* ---------- Padrões de laudo (biblioteca) ----------
   campos: k chave, l rótulo, u unidade, min/max referência (fora da faixa vira alerta), ref texto; calc:'elip' (volume = 0,523 × 3 medidas) ou 'soma'. */
const IM_PADROES=[
 {id:'abdome',n:'US abdome total',procs:['40901122'],calcs:['lirads'],v:'3.2',atual:'21/10/2026',autor:'Dr. Paulo Henrique Viana',editores:['imagem','admin'],st:'Publicado',
  impNormal:'Ultrassonografia de abdome total dentro dos limites da normalidade.',
  secoes:[
   {id:'figado',t:'Fígado',campos:[{k:'ld',l:'Lobo direito (longitudinal)',u:'cm',max:15.5,ref:'até 15,5 cm'},{k:'vp',l:'Veia porta',u:'mm',max:13,ref:'até 13 mm'}],normal:'Fígado com dimensões normais, contornos regulares e ecotextura homogênea. Não há lesões focais.',alts:['Aumento difuso da ecogenicidade hepática, compatível com esteatose grau I.','Esteatose hepática grau II, com borramento parcial das paredes dos vasos portais.','Contornos irregulares e ecotextura grosseira, sugestivos de hepatopatia crônica.','Observação nodular hepática, classificada pelo LI-RADS US abaixo.']},
   {id:'vesicula',t:'Vesícula biliar',campos:[{k:'pv',l:'Espessura da parede',u:'mm',max:3,ref:'até 3 mm'}],normal:'Vesícula biliar normodistendida, de paredes finas, sem cálculos.',alts:['Imagens hiperecogênicas móveis com sombra acústica posterior, compatíveis com colelitíase.','Pólipo vesicular de ___ mm.','Lama biliar.']},
   {id:'vias',t:'Vias biliares',campos:[{k:'col',l:'Colédoco',u:'mm',max:6,ref:'até 6 mm (+1 mm por década após 60 anos)'}],normal:'Vias biliares intra e extra-hepáticas sem dilatação.',alts:['Dilatação das vias biliares intra-hepáticas.']},
   {id:'pancreas',t:'Pâncreas',campos:[],normal:'Pâncreas de dimensões e ecotextura normais, nas porções visualizadas.',alts:['Pâncreas parcialmente obscurecido por gases intestinais.']},
   {id:'baco',t:'Baço',campos:[{k:'bc',l:'Baço (longitudinal)',u:'cm',max:12,ref:'até 12 cm'}],normal:'Baço de dimensões normais e ecotextura homogênea.',alts:['Esplenomegalia homogênea.']},
   {id:'rins',t:'Rins',campos:[{k:'rd',l:'Rim direito',u:'cm',min:9,max:12.5,ref:'9 a 12,5 cm'},{k:'re',l:'Rim esquerdo',u:'cm',min:9,max:12.5,ref:'9 a 12,5 cm'}],normal:'Rins tópicos, de dimensões normais, com boa diferenciação corticomedular. Não há hidronefrose nem cálculos.',alts:['Cálculo renal não obstrutivo de ___ mm.','Cisto cortical simples (Bosniak I).']},
   {id:'aorta',t:'Aorta e retroperitônio',campos:[{k:'ao',l:'Aorta (maior calibre)',u:'cm',max:2.9,ref:'menor que 3,0 cm'}],normal:'Aorta abdominal de calibre normal. Não há linfonodomegalias retroperitoneais.',alts:['Dilatação aneurismática da aorta infrarrenal.']},
   {id:'bexiga',t:'Bexiga',campos:[],normal:'Bexiga com boa repleção, paredes finas e conteúdo anecoico.',alts:['Bexiga com paredes espessadas e trabeculadas.']},
  ],hist:[['3.2','21/10/2026','Dr. Paulo Henrique Viana','Faixa do colédoco ajustada pela idade'],['3.1','02/09/2026','Dr. Paulo Henrique Viana','Frases de esteatose por grau'],['3.0','10/06/2026','Importado do RISWEB','Conversão do modelo de texto livre']]},
 {id:'tireoide',n:'US tireoide',procs:['40901300'],calcs:['tirads'],v:'2.4',atual:'15/10/2026',autor:'Dr. Paulo Henrique Viana',editores:['imagem','admin'],st:'Publicado',
  impNormal:'Tireoide de aspecto ultrassonográfico normal.',
  secoes:[
   {id:'parenq',t:'Tireoide',campos:[{k:'ldc',l:'Lobo direito · transverso',u:'cm'},{k:'ldap',l:'Lobo direito · anteroposterior',u:'cm'},{k:'ldl',l:'Lobo direito · longitudinal',u:'cm',min:4,max:6,ref:'4 a 6 cm'},{k:'ldv',l:'Volume do lobo direito',u:'mL',calc:'elip',of:['ldc','ldap','ldl']},{k:'lec',l:'Lobo esquerdo · transverso',u:'cm'},{k:'leap',l:'Lobo esquerdo · anteroposterior',u:'cm'},{k:'lel',l:'Lobo esquerdo · longitudinal',u:'cm',min:4,max:6,ref:'4 a 6 cm'},{k:'lev',l:'Volume do lobo esquerdo',u:'mL',calc:'elip',of:['lec','leap','lel']},{k:'ist',l:'Istmo',u:'mm',max:5,ref:'até 5 mm'},{k:'vt',l:'Volume total',u:'mL',calc:'soma',of:['ldv','lev'],min:6,max:18,ref:'6 a 18 mL (adulto)'}],normal:'Tireoide tópica, de contornos regulares e dimensões normais, com ecotextura homogênea.',alts:['Ecotextura difusamente heterogênea, sugestiva de tireoidopatia difusa (correlacionar com anticorpos).','Aumento difuso do volume glandular (bócio).']},
   {id:'nodulos',t:'Nódulos',campos:[],normal:'Não há nódulos.',alts:['Nódulos descritos e classificados pelo ACR TI-RADS abaixo.']},
   {id:'linf',t:'Linfonodos cervicais',campos:[],normal:'Não há linfonodos cervicais com características suspeitas.',alts:['Linfonodo com perda do hilo ecogênico no nível ___.']},
  ],hist:[['2.4','15/10/2026','Dr. Paulo Henrique Viana','Volume calculado (elipsoide 0,523)'],['2.3','20/08/2026','Dr. Paulo Henrique Viana','TI-RADS por nódulo, com conduta por tamanho']]},
 {id:'mamas',n:'US mamas',procs:['40901483'],calcs:['birads'],v:'1.6',atual:'08/10/2026',autor:'Dr. Paulo Henrique Viana',editores:['imagem','admin'],st:'Publicado',
  impNormal:'Exame ultrassonográfico das mamas sem alterações. BI-RADS 1.',
  secoes:[
   {id:'pele',t:'Pele e subcutâneo',campos:[],normal:'Pele e tecido subcutâneo sem alterações.',alts:['Espessamento cutâneo difuso.']},
   {id:'parenq',t:'Parênquima mamário',campos:[],normal:'Parênquima mamário com predomínio de tecido fibroglandular, sem nódulos ou cistos.',alts:['Composição heterogênea do parênquima.','Cistos simples esparsos bilaterais, o maior com ___ mm.','Nódulo descrito e classificado pelo BI-RADS abaixo.']},
   {id:'ductos',t:'Ductos',campos:[],normal:'Ductos sem ectasia.',alts:['Ectasia ductal retroareolar.']},
   {id:'axilas',t:'Axilas',campos:[],normal:'Axilas sem linfonodos com aspecto suspeito.',alts:['Linfonodo axilar com córtex espessado (___ mm).']},
  ],hist:[['1.6','08/10/2026','Dr. Paulo Henrique Viana','Léxico BI-RADS 5ª edição']]},
 {id:'pelvico',n:'US transvaginal / pélvico',procs:['40901467'],calcs:['orads'],v:'2.1',atual:'30/09/2026',autor:'Dra. Renata Albuquerque',editores:['imagem','medico','admin'],st:'Publicado',
  impNormal:'Ultrassonografia pélvica transvaginal sem alterações.',
  secoes:[
   {id:'utero',t:'Útero',campos:[{k:'uc',l:'Útero · longitudinal',u:'cm'},{k:'uap',l:'Útero · anteroposterior',u:'cm'},{k:'ut',l:'Útero · transverso',u:'cm'},{k:'uv',l:'Volume uterino',u:'mL',calc:'elip',of:['uc','uap','ut'],min:30,max:120,ref:'30 a 120 mL (menacme)'}],normal:'Útero em anteversoflexão, de contornos regulares e miométrio homogêneo.',alts:['Nódulo miometrial hipoecoico, compatível com mioma, medindo ___ cm.','Útero de contornos lobulados por miomatose.']},
   {id:'endo',t:'Endométrio',campos:[{k:'en',l:'Espessura endometrial',u:'mm',max:15,ref:'até 15 mm (menacme); até 4 mm na pós-menopausa'}],normal:'Endométrio regular, centrado, com espessura normal para a fase do ciclo.',alts:['Endométrio espessado e heterogêneo.','Imagem nodular endometrial sugestiva de pólipo.']},
   {id:'ovd',t:'Ovário direito',campos:[{k:'ovd',l:'Volume do ovário direito',u:'mL',max:10,ref:'até 10 mL (menacme)'}],normal:'Ovário direito de dimensões normais, com folículos.',alts:['Formação anexial descrita e classificada pelo O-RADS US abaixo.']},
   {id:'ove',t:'Ovário esquerdo',campos:[{k:'ove',l:'Volume do ovário esquerdo',u:'mL',max:10,ref:'até 10 mL (menacme)'}],normal:'Ovário esquerdo de dimensões normais, com folículos.',alts:['Formação anexial descrita e classificada pelo O-RADS US abaixo.']},
   {id:'fundo',t:'Fundo de saco',campos:[],normal:'Não há líquido livre no fundo de saco.',alts:['Pequena quantidade de líquido livre no fundo de saco, provavelmente fisiológica.']},
  ],hist:[['2.1','30/09/2026','Dra. Renata Albuquerque','O-RADS US v2022']]},
 {id:'obstetrico',n:'US obstétrica',procs:['40901530'],calcs:['obst'],v:'4.0',atual:'25/10/2026',autor:'Dra. Renata Albuquerque',editores:['medico','admin'],st:'Publicado',
  impNormal:'Gestação tópica, única, com feto vivo e biometria compatível com a idade gestacional.',
  secoes:[
   {id:'feto',t:'Feto',campos:[{k:'bcf',l:'Batimentos cardíacos fetais',u:'bpm',min:110,max:160,ref:'110 a 160 bpm'}],normal:'Feto único, em situação longitudinal e apresentação cefálica, com movimentos presentes e batimentos cardíacos rítmicos.',alts:['Apresentação pélvica.','Situação transversa.']},
   {id:'bio',t:'Biometria fetal',campos:[],normal:'Biometria fetal descrita abaixo, com idade gestacional e peso estimado pelas fórmulas de Hadlock.',alts:['Medidas abaixo do esperado para a idade gestacional: sugere-se controle do crescimento.']},
   {id:'placenta',t:'Placenta',campos:[],normal:'Placenta de inserção anterior, grau 0 de Grannum, sem sinais de descolamento.',alts:['Placenta de inserção posterior.','Placenta prévia marginal: repetir após 32 semanas.']},
   {id:'liquido',t:'Líquido amniótico',campos:[{k:'ila',l:'Índice de líquido amniótico',u:'cm',min:5,max:25,ref:'5 a 25 cm'}],normal:'Líquido amniótico em quantidade normal.',alts:['Oligoâmnio.','Polidrâmnio.']},
  ],hist:[['4.0','25/10/2026','Dra. Renata Albuquerque','Percentil de peso pela curva de Hadlock'],['3.2','01/07/2026','Dra. Renata Albuquerque','Biometria em mm (padrão do aparelho)']]},
 {id:'renal',n:'US rins e vias urinárias',procs:['40901262'],calcs:[],v:'1.3',atual:'12/09/2026',autor:'Dr. Paulo Henrique Viana',editores:['imagem','admin'],st:'Publicado',
  impNormal:'Rins e vias urinárias sem alterações ultrassonográficas.',
  secoes:[
   {id:'rd',t:'Rim direito',campos:[{k:'rdc',l:'Comprimento',u:'cm',min:9,max:12.5,ref:'9 a 12,5 cm'},{k:'rdp',l:'Espessura do parênquima',u:'cm',min:1.2,ref:'a partir de 1,2 cm'}],normal:'Rim direito tópico, de dimensões e ecogenicidade normais, sem hidronefrose ou cálculos.',alts:['Dilatação pielocalicinal leve à direita.','Cálculo de ___ mm no grupo calicinal inferior direito.']},
   {id:'re',t:'Rim esquerdo',campos:[{k:'rec',l:'Comprimento',u:'cm',min:9,max:12.5,ref:'9 a 12,5 cm'},{k:'rep',l:'Espessura do parênquima',u:'cm',min:1.2,ref:'a partir de 1,2 cm'}],normal:'Rim esquerdo tópico, de dimensões e ecogenicidade normais, sem hidronefrose ou cálculos.',alts:['Cisto cortical simples (Bosniak I).']},
   {id:'ureter',t:'Ureteres',campos:[],normal:'Ureteres não dilatados.',alts:['Ureter direito dilatado até o terço distal, com cálculo de ___ mm na junção ureterovesical.']},
   {id:'bex',t:'Bexiga',campos:[{k:'rpm',l:'Resíduo pós-miccional',u:'mL',max:50,ref:'até 50 mL'}],normal:'Bexiga com boa repleção, paredes finas e conteúdo anecoico.',alts:['Jato ureteral direito ausente ao Doppler.']},
   {id:'prost',t:'Próstata',campos:[{k:'pv',l:'Volume prostático',u:'mL',max:30,ref:'até 30 mL'}],normal:'Próstata de dimensões normais e ecotextura homogênea.',alts:['Próstata aumentada, com lobo mediano protruso.']},
  ],hist:[['1.3','12/09/2026','Dr. Paulo Henrique Viana','Resíduo pós-miccional com referência']]},
 {id:'partes',n:'US partes moles',procs:['40901386'],calcs:[],v:'1.1',atual:'05/08/2026',autor:'Dr. Paulo Henrique Viana',editores:['imagem','admin'],st:'Publicado',
  impNormal:'Ultrassonografia de partes moles da região examinada sem alterações.',
  secoes:[
   {id:'reg',t:'Região examinada',campos:[],normal:'Região examinada conforme a indicação clínica.',alts:['Antebraço direito, face volar.']},
   {id:'pele',t:'Pele e subcutâneo',campos:[],normal:'Pele e tecido subcutâneo de espessura e ecogenicidade normais.',alts:['Edema do subcutâneo.']},
   {id:'musc',t:'Musculatura',campos:[],normal:'Planos musculares preservados.',alts:['Rotura parcial de fibras musculares.']},
   {id:'les',t:'Lesões',campos:[{k:'lc',l:'Lesão · maior eixo',u:'cm'},{k:'la',l:'Lesão · anteroposterior',u:'cm'}],normal:'Não há coleções ou lesões focais na região examinada.',alts:['Formação nodular hipoecoica, circunscrita, sem fluxo ao Doppler, sugestiva de lipoma.','Coleção líquida heterogênea com debris, sugestiva de abscesso.']},
  ],hist:[['1.1','05/08/2026','Dr. Paulo Henrique Viana','Campos de medida da lesão']]},
];
const IMP=id=>IM_PADROES.find(p=>p.id===id);
const IM_CALCN={tirads:'ACR TI-RADS',birads:'BI-RADS (US)',orads:'O-RADS US',lirads:'LI-RADS US (vigilância)',obst:'Biometria fetal (Hadlock)'};

/* ---------- Utilidades ---------- */
const imN=v=>{if(v==null||v==='')return null;const x=parseFloat(String(v).replace(',','.'));return isNaN(x)?null:x};
const imF=(x,d=1)=>x==null||isNaN(x)?'—':x.toLocaleString('pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d});
const imMin=h=>{if(!h)return null;const [a,b]=h.split(':').map(Number);return a*60+b};
const imHH=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const imPode=()=>IM_ASSINA.includes(PERFIL);
const imQuem=e=>!e.laud?'<span style="color:var(--fg2)">sem médico</span>':(typeof PROF==='function'&&PROF(e.laud))?PROF(e.laud).n:esc(e.laud);
const imModal=(t,html,foot)=>openModal(`${mh(t)}<div class="mb">${html}</div><div class="mf">${foot||'<button class="btn" onclick="closeModal()">Fechar</button>'}</div>`,'wide');
function imSla(e){
 if(!e.prazo)return '<span class="tl">começa ao chegar</span>';
 const p=imMin(e.prazo);
 if(e.st>=5){const l=imMin(e.lib);return l<=p?`<span class="prazo-ok">no prazo (${e.lib})</span>`:`<span class="prazo-err">fora do prazo (${e.lib})</span>`}
 const d=p-IM_AGORA;
 if(d<0)return `<span class="prazo-err">vencido há ${-d} min</span>`;
 if(d<=30)return `<span class="prazo-warn">vence em ${d} min</span>`;
 return `<span class="prazo-ok">até ${e.prazo}</span>`}
const imProg=st=>`<span class="im-prog" aria-hidden="true">${IM_ST.map((_,i)=>`<i class="${i<st?'on':i===st?'cur':''}"></i>`).join('')}</span>`;
const imStBadge=e=>`<span class="badge ${IM_STC[e.st]}">${IM_ST[e.st]}</span>`;
const imEhUS=e=>IM_EQ(e.eq).mod==='US';
function imNcdf(z){const t=1/(1+0.2316419*Math.abs(z));const d=0.3989423*Math.exp(-z*z/2);const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p}

/* ================= Calculadoras (lógica publicada) ================= */
/* ACR TI-RADS (Tessler et al., JACR 2017) */
const TR_OP={
 comp:[['cistico','Cístico ou quase todo cístico',0],['espongiforme','Espongiforme',0],['misto','Misto cístico e sólido',1],['solido','Sólido ou quase todo sólido',2]],
 eco:[['anecoico','Anecoico',0],['iso','Hiperecoico ou isoecoico',1],['hipo','Hipoecoico',2],['muitohipo','Muito hipoecoico',3]],
 forma:[['larg','Mais largo que alto',0],['alto','Mais alto que largo',3]],
 marg:[['lisa','Lisa',0],['mal','Mal definida',0],['lob','Lobulada ou irregular',2],['ext','Extensão extratireoidiana',3]],
 focos:[['macro','Macrocalcificações',1],['perif','Calcificações periféricas (em anel)',2],['punct','Focos ecogênicos puntiformes',3]]};
const trPts=(g,k)=>(TR_OP[g].find(o=>o[0]===k)||[0,0,0])[2];
function tirads(n){
 let pts;if(n.comp==='espongiforme')pts=0;
 else pts=trPts('comp',n.comp)+trPts('eco',n.eco)+trPts('forma',n.forma)+trPts('marg',n.marg)+(n.focos||[]).reduce((s,f)=>s+trPts('focos',f),0);
 const tr=pts<=1?1:pts===2?2:pts===3?3:pts<=6?4:5;
 const nome=['','Benigno','Não suspeito','Levemente suspeito','Moderadamente suspeito','Altamente suspeito'][tr];
 const s=imN(n.tam);let cd='Não precisa de PAAF nem de seguimento.',acao=null;
 const lim={3:[2.5,1.5,'US em 1, 3 e 5 anos'],4:[1.5,1.0,'US em 1, 2, 3 e 5 anos'],5:[1.0,0.5,'US anual por até 5 anos']}[tr];
 if(lim){if(s==null)cd=`Informe o maior eixo: PAAF a partir de ${imF(lim[0])} cm; seguimento a partir de ${imF(lim[1])} cm.`;
  else if(s>=lim[0]){cd=`PAAF indicada (${imF(s)} cm ≥ ${imF(lim[0])} cm).`;acao={motivo:`ACR TI-RADS TR${tr} (${imF(s)} cm): PAAF guiada por US`,quando:'em até 30 dias',tipo:'PAAF guiada por US'}}
  else if(s>=lim[1]){cd=`Seguimento: ${lim[2]} (${imF(s)} cm ≥ ${imF(lim[1])} cm; abaixo de ${imF(lim[0])} cm não puncionar).`;acao={motivo:`ACR TI-RADS TR${tr} (${imF(s)} cm): US de tireoide de controle`,quando:'em 12 meses',tipo:'US tireoide'}}
  else cd=`Abaixo do limite de seguimento (${imF(lim[1])} cm): sem PAAF e sem seguimento.`}
 return {pts,tr,nome,cd,acao,esp:n.comp==='espongiforme'}}

/* BI-RADS US (ACR, 5ª ed.): a categoria é do médico; o sistema sugere pelo léxico e mostra as características suspeitas. */
const BR_OP={
 achado:[['nenhum','Sem achados'],['cisto','Cisto simples'],['benigno','Achado benigno típico (linfonodo intramamário, implante íntegro, cicatriz estável)'],['microcistos','Microcistos agrupados'],['complicado','Cisto complicado isolado'],['nodulo','Nódulo sólido'],['complexo','Massa complexa cística e sólida'],['distorcao','Distorção arquitetural sem massa']],
 forma:[['oval','Oval'],['redonda','Redonda'],['irregular','Irregular']],
 orient:[['paralela','Paralela'],['nparalela','Não paralela']],
 margem:[['circ','Circunscrita'],['indist','Indistinta'],['angular','Angular'],['microlob','Microlobulada'],['espic','Espiculada']],
 eco:[['hipo','Hipoecoica'],['iso','Isoecoica'],['hiper','Hiperecoica'],['het','Heterogênea']],
 post:[['nenhum','Sem característica'],['reforco','Reforço acústico'],['sombra','Sombra acústica'],['comb','Padrão combinado']]};
function birads(b){
 const susp=[];let c;
 if(b.comprovado)return {c:'6',susp,cd:'Malignidade comprovada por biópsia: conduta oncológica (excisão ou tratamento).',risco:'—',acao:null};
 if(b.incompleto)return {c:'0',susp,cd:'Avaliação incompleta: completar com mamografia, RM ou comparação com exames anteriores.',risco:'—',acao:{motivo:'BI-RADS 0: avaliação adicional',quando:'em até 30 dias',tipo:'Mamografia complementar'}};
 const a=b.achado;
 if(a==='nenhum')c='1';else if(a==='cisto'||a==='benigno')c='2';else if(a==='microcistos'||a==='complicado')c='3';
 else if(a==='distorcao'){susp.push('distorção arquitetural');c='4B'}
 else{
  if(b.forma==='irregular')susp.push('forma irregular');
  if(b.orient==='nparalela')susp.push('orientação não paralela');
  if(b.margem&&b.margem!=='circ')susp.push('margem '+BR_OP.margem.find(m=>m[0]===b.margem)[1].toLowerCase());
  if(b.post==='sombra')susp.push('sombra acústica posterior');
  if(b.calc)susp.push('calcificações no nódulo');
  if(b.dist)susp.push('distorção associada');
  if(b.pele)susp.push('alteração de pele');
  let pts=susp.length+(b.margem==='espic'?1:0)+(a==='complexo'?1:0);
  if(pts===0)c=b.eco==='hiper'?'2':'3';else c=pts===1?'4A':pts===2?'4B':pts===3?'4C':'5'}
 if(b.manual&&b.manual!=='auto')c=b.manual;
 const k=c[0];
 const cd={'1':'Negativo: rastreamento de rotina conforme a idade.','2':'Achado benigno: rastreamento de rotina.','3':'Provavelmente benigno: controle de curto intervalo, US em 6 meses (depois 12 e 24 meses).','4':'Suspeito: biópsia percutânea (core biopsy) guiada por US.','5':'Altamente sugestivo de malignidade: biópsia percutânea guiada por US.'}[k];
 const risco={'1':'0%','2':'0%','3':'≤ 2%','4A':'> 2% a ≤ 10%','4B':'> 10% a ≤ 50%','4C':'> 50% a < 95%','4':'> 2% a < 95%','5':'≥ 95%'}[c]||'—';
 const acao=k==='3'?{motivo:'BI-RADS 3: US de mamas de controle',quando:'em 6 meses',tipo:'US mamas'}:(k==='4'||k==='5')?{motivo:`BI-RADS ${c}: biópsia (core) guiada por US`,quando:'em até 15 dias',tipo:'Core biopsy guiada por US'}:null;
 return {c,susp,cd,risco,acao}}

/* O-RADS US v2022 (Strachowski et al., Radiology 2023) */
const OR_OP={
 tipo:[['normal','Ovário normal: folículo ou corpo lúteo até 3 cm'],['simples','Cisto simples'],['unil_lisa','Cisto unilocular não simples, parede lisa'],['bil_lisa','Cisto bilocular, parede lisa, sem sólido'],['unil_irreg','Cisto unilocular com parede irregular (< 3 mm)'],['multi','Cisto multilocular sem componente sólido'],['classica','Lesão clássica benigna (hemorrágico, dermoide, endometrioma)'],['extra','Paraovariano, inclusão peritoneal ou hidrossalpinge'],['unil_sol','Cisto unilocular com componente sólido'],['bil_sol','Cisto bilocular com componente sólido'],['multi_sol','Cisto multilocular com componente sólido'],['solido','Lesão sólida ou de aspecto sólido (≥ 80%)']],
 cs:[['1','1 · sem fluxo'],['2','2 · fluxo mínimo'],['3','3 · fluxo moderado'],['4','4 · fluxo intenso']]};
function orads(o){
 const t=o.tipo,s=imN(o.tam),cs=+o.cs||1;let c;
 if(o.ascite)c=5;
 else if(t==='normal')c=o.meno==='pos'?2:1;
 else if(t==='simples'||t==='unil_lisa'||t==='bil_lisa')c=(s!=null&&s>=10)?3:2;
 else if(t==='classica')c=(s!=null&&s>=10)?3:2;
 else if(t==='extra')c=2;
 else if(t==='unil_irreg')c=3;
 else if(t==='multi')c=(o.parede==='irreg'||(s!=null&&s>=10)||cs===4)?4:3;
 else if(t==='unil_sol')c=(+o.papilas>=4)?5:4;
 else if(t==='bil_sol')c=4;
 else if(t==='multi_sol')c=cs>=3?5:4;
 else if(t==='solido')c=o.contorno==='irreg'?5:cs===1?3:cs<=3?4:5;
 if(o.incompleto)c=0;
 const nome=['Avaliação incompleta','Normal (fisiológico)','Quase certamente benigno (< 1%)','Baixo risco (1% a < 10%)','Risco intermediário (10% a < 50%)','Alto risco (≥ 50%)'][c];
 const cd=['Repetir o exame ou complementar (via transvaginal, RM).','Sem conduta adicional.','Em geral sem seguimento; cisto simples > 5 cm (pré-menopausa) ou > 3 cm (pós) pode ter US de controle, conforme a tabela O-RADS.','Ginecologista. Se conduta expectante: US de controle em até 6 meses, ou RM com escore O-RADS MRI.','Ginecologista com apoio de oncologia ginecológica, ou RM com escore O-RADS MRI.','Encaminhar ao ginecologista oncológico.'][c];
 const acao=c===3?{motivo:'O-RADS US 3: US transvaginal de controle',quando:'em 6 meses',tipo:'US transvaginal'}:c===4?{motivo:'O-RADS US 4: RM de pelve (O-RADS MRI) e avaliação ginecológica',quando:'em até 30 dias',tipo:'RM de pelve'}:c===5?{motivo:'O-RADS US 5: consulta com ginecologista oncológico',quando:'em até 15 dias',tipo:'Consulta ginecologia oncológica'}:c===0?{motivo:'O-RADS 0: repetir ou complementar o exame',quando:'em até 30 dias',tipo:'US transvaginal'}:null;
 return {c,nome,cd,acao}}

/* LI-RADS US Surveillance v2024 (ACR) */
function lirads(l){
 if(!l.risco)return {c:'—',nome:'Não se aplica',cd:'O LI-RADS de vigilância vale só para pacientes de risco para CHC (cirrose, hepatite B crônica, CHC prévio).',acao:null,vis:l.vis};
 const c=l.obs==='trombo'||l.obs==='maior'?3:l.obs==='menor'?2:1;
 const nome=['','US-1 Negativo','US-2 Subliminar','US-3 Positivo'][c];
 let cd=['','Repetir US em 6 meses (vigilância de rotina).','Repetir US em 3 a 6 meses; se estável por 2 anos, volta ao intervalo de 6 meses.','TC ou RM multifásica (diagnóstico pelo LI-RADS de TC/RM).'][c];
 let acao=c===1?{motivo:'LI-RADS US-1: US de vigilância',quando:'em 6 meses',tipo:'US abdome total'}:c===2?{motivo:'LI-RADS US-2: US de abdome em curto intervalo',quando:'em 3 meses',tipo:'US abdome total'}:{motivo:'LI-RADS US-3: TC ou RM multifásica do fígado',quando:'em até 30 dias',tipo:'RM de fígado multifásica'};
 if(l.vis==='C'&&c<3){cd+=' Visualização C (limitação grave): considerar TC ou RM, ou repetir US em 3 meses.';acao={motivo:`LI-RADS US-${c} com visualização C: considerar TC/RM`,quando:'em 3 meses',tipo:'RM de fígado'}}
 return {c,nome,cd,acao,vis:l.vis}}

/* Biometria fetal: Hadlock (IG por parâmetro, 1984; composta 4 parâmetros; peso 1985; percentil pela curva in utero de Hadlock 1991) */
function obst(o){
 const b=imN(o.dbp),h=imN(o.cc),a=imN(o.ca),f=imN(o.cf);const cm=x=>x==null?null:x/10;
 const B=cm(b),H=cm(h),A=cm(a),F=cm(f);
 const ga={dbp:B?9.54+1.482*B+0.1676*B*B:null,cc:H?8.96+0.540*H+0.0003*H**3:null,ca:A?8.14+0.753*A+0.0036*A*A:null,cf:F?10.35+2.460*F+0.170*F*F:null};
 const comp=(B&&H&&A&&F)?10.85+0.060*H*F+0.6700*B+0.1680*A:null;
 const peso=(B&&H&&A&&F)?Math.pow(10,1.3596-0.00386*A*F+0.0064*H+0.00061*B*A+0.0424*A+0.174*F):null;
 const igRef=(imN(o.igS)??null)!=null?imN(o.igS)+(imN(o.igD)||0)/7:null;
 let pct=null,mediana=null,clas='';
 if(peso&&igRef){mediana=Math.exp(0.578+0.332*igRef-0.00354*igRef*igRef);const z=(peso-mediana)/(0.13*mediana);pct=Math.round(imNcdf(z)*100);pct=Math.max(1,Math.min(99,pct));
  clas=pct<3?'abaixo do percentil 3 (pequeno para a IG, investigar restrição de crescimento)':pct<10?'abaixo do percentil 10 (pequeno para a IG)':pct>90?'acima do percentil 90 (grande para a IG)':'entre os percentis 10 e 90 (adequado para a IG)'}
 const sd=w=>{if(w==null)return '—';const s=Math.floor(w),d=Math.round((w-s)*7);return d===7?`${s+1}s 0d`:`${s}s ${d}d`};
 const dif=comp&&igRef?Math.round((comp-igRef)*7):null;
 const acao=pct!=null&&pct<10?{motivo:`Peso fetal no percentil ${pct}: US obstétrica com Doppler`,quando:'em 2 semanas',tipo:'US obstétrica com Doppler'}:pct!=null&&pct>90?{motivo:`Peso fetal no percentil ${pct}: controle do crescimento`,quando:'em 3 a 4 semanas',tipo:'US obstétrica'}:null;
 return {ga,comp,peso,pct,clas,sd,dif,igRef,mediana,acao}}

/* ---------- Laudos (um por exame), com versões ---------- */
function imNovoLaudo(e){const p=IMP(e.pad);const sec={};p.secoes.forEach(s=>sec[s.id]={modo:'normal',txt:s.normal});
 return {pad:p.id,padV:p.v,val:{},sec,calc:{tirads:{nods:[]},birads:{achado:'nenhum',forma:'oval',orient:'paralela',margem:'circ',eco:'hipo',post:'nenhum',manual:'auto'},orads:{tipo:'normal',meno:'pre',cs:'1',parede:'lisa',contorno:'liso',papilas:'0'},lirads:{risco:false,obs:'nenhuma',vis:'A'},obst:{}},extra:[],imp:'',corpo:'',ia:false,rev:false,st:'rascunho',ver:1,hist:[{v:1,st:'Rascunho',quem:PROF(e.laud||'p2')?PROF(e.laud||'p2').n:'—',quando:'hoje '+imHH(IM_AGORA),nota:`criado a partir do padrão ${p.n} v${p.v}`}],recalls:[]}}
const IM_LAUDOS={};
(function imSeed(){
 const L1=imNovoLaudo(IMX('IM-26-004815'));L1.val={ldc:'1,9',ldap:'1,8',ldl:'5,2',lec:'1,5',leap:'1,4',lel:'4,6',ist:'3'};L1.sec.nodulos={modo:'alt',txt:'Nódulos descritos e classificados pelo ACR TI-RADS abaixo.'};
 L1.calc.tirads.nods=[{loc:'Terço médio do lobo direito',tam:'1,7',comp:'solido',eco:'hipo',forma:'larg',marg:'lisa',focos:[]},{loc:'Polo inferior do lobo esquerdo',tam:'0,8',comp:'misto',eco:'iso',forma:'larg',marg:'lisa',focos:[]}];IM_LAUDOS['IM-26-004815']=L1;
 const L2=imNovoLaudo(IMX('IM-26-004817'));L2.calc.birads=Object.assign(L2.calc.birads,{achado:'nodulo',lado:'Mama direita, 10 horas, 3 cm do mamilo',tam:'1,1',forma:'oval',orient:'paralela',margem:'circ',eco:'hipo',post:'nenhum'});L2.sec.parenq={modo:'alt',txt:'Nódulo descrito e classificado pelo BI-RADS abaixo.'};IM_LAUDOS['IM-26-004817']=L2;
 const L3=imNovoLaudo(IMX('IM-26-004819'));L3.val={ld:'14,2',vp:'14',bc:'13,8'};L3.calc.lirads={risco:true,obs:'maior',vis:'B',tam:'1,4',seg:'Segmento VI'};L3.sec.figado={modo:'alt',txt:'Contornos irregulares e ecotextura grosseira, sugestivos de hepatopatia crônica. Observação nodular hepática, classificada pelo LI-RADS US abaixo.'};L3.sec.baco={modo:'alt',txt:'Esplenomegalia homogênea.'};IM_LAUDOS['IM-26-004819']=L3;
 const L4=imNovoLaudo(IMX('IM-26-004821'));L4.val={uc:'7,8',uap:'3,9',ut:'4,6',en:'9',ovd:'6,2'};L4.calc.orads={tipo:'multi',meno:'pre',tam:'6,1',cs:'2',parede:'lisa',contorno:'liso',papilas:'0',lado:'Ovário esquerdo'};L4.sec.ove={modo:'alt',txt:'Formação anexial descrita e classificada pelo O-RADS US abaixo.'};IM_LAUDOS['IM-26-004821']=L4;
 const L5=imNovoLaudo(IMX('IM-26-004809'));L5.val={bcf:'146',ila:'13,2'};L5.calc.obst={igS:'28',igD:'0',dbp:'71',cc:'260',ca:'235',cf:'53'};IM_LAUDOS['IM-26-004809']=L5;
 const L6=imNovoLaudo(IMX('IM-26-004801'));L6.val={ld:'14,1',vp:'10',pv:'2',col:'4',bc:'10,4',rd:'10,8',re:'11,0',ao:'1,9'};L6.imp='Ultrassonografia de abdome total dentro dos limites da normalidade.';L6.corpo=imCorpo(L6,IMP('abdome'));L6.st='finalizado';L6.hash='a41f·9c02·77be·e310';L6.hist.push({v:1,st:'Finalizado',quem:'Dr. Paulo Henrique Viana',quando:'hoje 08:25',nota:'assinado com ICP-Brasil (BirdID)'});IM_LAUDOS['IM-26-004801']=L6;
 const L7=imNovoLaudo(IMX('IM-26-004803'));L7.val={lc:'2,1',la:'0,9'};L7.sec.reg={modo:'alt',txt:'Antebraço direito, face volar.'};L7.sec.les={modo:'alt',txt:'Formação nodular hipoecoica, circunscrita, sem fluxo ao Doppler, sugestiva de lipoma.'};L7.imp='Formação nodular no subcutâneo do antebraço direito, com aspecto de lipoma (2,1 × 0,9 cm).';L7.corpo=imCorpo(L7,IMP('partes'));L7.st='finalizado';L7.ver=2;L7.hash='0b7d·52e1·c9a4·18f0';
 L7.hist=[{v:1,st:'Substituído',quem:'Dr. Paulo Henrique Viana',quando:'hoje 07:30',nota:'assinado; lado trocado (esquerdo)'},{v:2,st:'Finalizado',quem:'Dr. Paulo Henrique Viana',quando:'hoje 07:41',nota:'retificação: lado corrigido para direito'}];IM_LAUDOS['IM-26-004803']=L7;
})();
let IM_LSEL='IM-26-004815';
function imLaudo(id){const e=IMX(id);if(!e||!e.pad)return null;if(!IM_LAUDOS[id])IM_LAUDOS[id]=imNovoLaudo(e);return IM_LAUDOS[id]}

/* valores dos campos (inclusive os calculados) */
function imValor(L,p,k){const c=p.secoes.flatMap(s=>s.campos).find(x=>x.k===k);if(!c)return null;
 if(c.calc==='elip'){const v=c.of.map(x=>imN(L.val[x]));return v.every(x=>x!=null)?0.523*v[0]*v[1]*v[2]:null}
 if(c.calc==='soma'){const v=c.of.map(x=>imValor(L,p,x));return v.every(x=>x!=null)?v.reduce((s,x)=>s+x,0):null}
 return imN(L.val[k])}
function imFlag(c,v){if(v==null)return '';if(c.min!=null&&v<c.min)return 'dn';if(c.max!=null&&v>c.max)return 'up';return (c.min!=null||c.max!=null)?'ok':''}
function imResultados(L,p){const calcs=[...new Set([...p.calcs,...(L.extra||[])])];const r={};
 if(calcs.includes('tirads'))r.tirads=L.calc.tirads.nods.map(tirads);
 if(calcs.includes('birads'))r.birads=birads(L.calc.birads);
 if(calcs.includes('orads'))r.orads=orads(L.calc.orads);
 if(calcs.includes('lirads'))r.lirads=lirads(L.calc.lirads);
 if(calcs.includes('obst'))r.obst=obst(L.calc.obst);
 return {calcs,r}}
function imRecalls(L,p){const {r}=imResultados(L,p);const l=[];
 (r.tirads||[]).forEach(x=>x.acao&&l.push(x.acao));['birads','orads','lirads','obst'].forEach(k=>r[k]&&r[k].acao&&l.push(r[k].acao));return l}

/* texto do corpo e da impressão a partir dos campos (o que a "IA de apoio" redige) */
function imCorpo(L,p){const {r}=imResultados(L,p);
 const linhas=p.secoes.map(s=>{const st=L.sec[s.id]||{txt:s.normal};const ms=s.campos.map(c=>{const v=imValor(L,p,c.k);if(v==null)return '';const f=imFlag(c,v);return `${c.l.toLowerCase()} ${imF(v,c.u==='mm'||c.u==='bpm'?0:1)} ${c.u}${f==='up'?' (acima da referência)':f==='dn'?' (abaixo da referência)':''}`}).filter(Boolean);
  return `${s.t}: ${st.txt}${ms.length?' Medidas: '+ms.join('; ')+'.':''}`});
 if(r.tirads&&r.tirads.length)L.calc.tirads.nods.forEach((n,i)=>{const t=r.tirads[i];linhas.push(`Nódulo ${i+1} (${n.loc||'localização não informada'}): ${(TR_OP.comp.find(o=>o[0]===n.comp)||['','—'])[1].toLowerCase()}, ${(TR_OP.eco.find(o=>o[0]===n.eco)||['','—'])[1].toLowerCase()}, ${(TR_OP.forma.find(o=>o[0]===n.forma)||['','—'])[1].toLowerCase()}, margem ${(TR_OP.marg.find(o=>o[0]===n.marg)||['','—'])[1].toLowerCase()}${(n.focos||[]).length?', com '+n.focos.map(f=>TR_OP.focos.find(o=>o[0]===f)[1].toLowerCase()).join(' e '):', sem focos ecogênicos'}, medindo ${n.tam||'—'} cm. ACR TI-RADS ${t.pts} pontos: TR${t.tr}.`)});
 if(r.birads&&L.calc.birads.achado!=='nenhum'){const b=L.calc.birads;linhas.push(`Achado mamário (${b.lado||'localização não informada'}): ${BR_OP.achado.find(o=>o[0]===b.achado)[1].toLowerCase()}${b.achado==='nodulo'||b.achado==='complexo'?`, forma ${BR_OP.forma.find(o=>o[0]===b.forma)[1].toLowerCase()}, orientação ${BR_OP.orient.find(o=>o[0]===b.orient)[1].toLowerCase()}, margem ${BR_OP.margem.find(o=>o[0]===b.margem)[1].toLowerCase()}, ${BR_OP.eco.find(o=>o[0]===b.eco)[1].toLowerCase()}, ${BR_OP.post.find(o=>o[0]===b.post)[1].toLowerCase()} posterior`:''}${b.tam?`, medindo ${b.tam} cm`:''}.`)}
 if(r.orads&&L.calc.orads.tipo!=='normal'){const o=L.calc.orads;linhas.push(`Lesão anexial (${o.lado||'lado não informado'}): ${OR_OP.tipo.find(x=>x[0]===o.tipo)[1].toLowerCase()}${o.tam?`, maior diâmetro ${o.tam} cm`:''}, escore de cor ${o.cs}.${o.ascite?' Ascite.':''}`)}
 if(r.lirads&&L.calc.lirads.risco){const l=L.calc.lirads;linhas.push(`Vigilância de CHC: ${l.obs==='nenhuma'?'sem observações':l.obs==='menor'?'observação menor que 10 mm':l.obs==='maior'?'observação a partir de 10 mm':'trombo novo em veia'}${l.tam?` (${l.tam} cm${l.seg?', '+l.seg:''})`:''}. Escore de visualização ${l.vis}.`)}
 if(r.obst&&r.obst.peso){const o=r.obst,c=L.calc.obst;linhas.push(`Biometria: DBP ${c.dbp} mm, CC ${c.cc} mm, CA ${c.ca} mm, CF ${c.cf} mm. Idade gestacional pela biometria ${o.sd(o.comp)} (Hadlock). Peso fetal estimado ${Math.round(o.peso).toLocaleString('pt-BR')} g${o.pct!=null?`, percentil ${o.pct} para ${o.sd(o.igRef)}`:''}.`)}
 return linhas.join('\n')}
function imImpressao(L,p){const {r}=imResultados(L,p);const l=[];
 p.secoes.forEach(s=>{if((L.sec[s.id]||{}).modo==='alt'&&!/abaixo\.$/.test(L.sec[s.id].txt))l.push(L.sec[s.id].txt.replace(/\.$/,'')+'.')});
 p.secoes.flatMap(s=>s.campos).forEach(c=>{const v=imValor(L,p,c.k),f=imFlag(c,v);if(f==='up'||f==='dn')l.push(`${c.l} ${f==='up'?'acima':'abaixo'} da referência (${imF(v,c.u==='mm'||c.u==='bpm'?0:1)} ${c.u}; ref. ${c.ref}).`)});
 (r.tirads||[]).forEach((t,i)=>l.push(`Nódulo tireoidiano ${i+1}${L.calc.tirads.nods[i].loc?' ('+L.calc.tirads.nods[i].loc.toLowerCase()+')':''}: ACR TI-RADS TR${t.tr} (${t.nome.toLowerCase()}). ${t.cd}`));
 if(r.birads&&L.calc.birads.achado!=='nenhum')l.push(`BI-RADS ${r.birads.c}. ${r.birads.cd}`);
 if(r.orads&&L.calc.orads.tipo!=='normal')l.push(`O-RADS US ${r.orads.c} (${r.orads.nome.toLowerCase()}). ${r.orads.cd}`);
 if(r.lirads&&L.calc.lirads.risco)l.push(`LI-RADS ${r.lirads.nome}, visualização ${r.lirads.vis}. ${r.lirads.cd}`);
 if(r.obst&&r.obst.peso)l.push(`Gestação única com feto vivo, ${r.obst.sd(r.obst.comp)} pela biometria; peso fetal estimado ${Math.round(r.obst.peso).toLocaleString('pt-BR')} g${r.obst.pct!=null?', '+r.obst.clas:''}.`);
 return l.length?l.map((x,i)=>`${i+1}. ${x}`).join('\n'):p.impNormal}
function imCoerencia(L,p){const {r}=imResultados(L,p);const w=[];
 p.secoes.forEach(s=>s.campos.forEach(c=>{const f=imFlag(c,imValor(L,p,c.k));if((f==='up'||f==='dn')&&(L.sec[s.id]||{}).modo==='normal')w.push(`"${s.t}" está com a frase normal, mas ${c.l.toLowerCase()} está fora da referência.`)}));
 if(r.tirads&&r.tirads.length&&(L.sec.nodulos||{}).modo==='normal')w.push('Há nódulos no TI-RADS, mas a seção "Nódulos" diz que não há nódulos.');
 (r.tirads||[]).forEach((t,i)=>{if(!imN(L.calc.tirads.nods[i].tam))w.push(`Nódulo ${i+1} sem tamanho: a conduta do TI-RADS depende do maior eixo.`)});
 if(r.birads&&L.calc.birads.achado!=='nenhum'&&(L.sec.parenq||{}).modo==='normal')w.push('O BI-RADS tem achado, mas o parênquima está descrito como sem nódulos ou cistos.');
 if(r.orads&&L.calc.orads.tipo!=='normal'&&(L.sec.ovd||{}).modo==='normal'&&(L.sec.ove||{}).modo==='normal')w.push('O O-RADS descreve uma lesão, mas os dois ovários estão com a frase normal.');
 if(r.obst&&r.obst.dif!=null&&Math.abs(r.obst.dif)>14)w.push(`A IG pela biometria difere ${Math.abs(r.obst.dif)} dias da IG de referência (mais de 2 semanas).`);
 if(r.lirads&&L.calc.lirads.risco&&L.calc.lirads.obs!=='nenhuma'&&(L.sec.figado||{}).modo==='normal')w.push('O LI-RADS tem observação, mas o fígado está descrito sem lesões focais.');
 return w}

/* ================= Tela 1 · Exames de imagem (worklist) ================= */
VIEWS['imagem-worklist']=()=>{
 const f=IM_F;let l=IM_EX.slice().sort((a,b)=>(b.urg?1:0)-(a.urg?1:0)||imMin(a.h)-imMin(b.h));
 if(f.eq)l=l.filter(e=>e.eq===f.eq);
 if(f.st>=0)l=l.filter(e=>e.st===f.st);
 if(f.chip==='urg')l=l.filter(e=>e.urg);
 if(f.chip==='tele')l=l.filter(e=>e.tele);
 if(f.chip==='atraso')l=l.filter(e=>e.prazo&&e.st<5&&imMin(e.prazo)-IM_AGORA<=30);
 if(f.chip==='sem')l=l.filter(e=>!e.laud&&e.st>=3&&e.st<5);
 if(f.q){const q=f.q.toLowerCase();l=l.filter(e=>(e.pac+' '+e.id+' '+imProc(e.proc).n).toLowerCase().includes(q))}
 const ab=IM_EX.filter(e=>e.st<5),venc=IM_EX.filter(e=>e.prazo&&e.st<5&&imMin(e.prazo)-IM_AGORA<=30);
 const rows=l.map(e=>{const pr=imProc(e.proc),eq=IM_EQ(e.eq);
  const tl=e.tele?`<div class="two">${IM_PARC.find(p=>p.id===e.tele.p).n}<small>enviado ${e.tele.env}${e.tele.rec?' · recebido '+e.tele.rec:' · aguardando'}</small></div>`:'<span class="tl">—</span>';
  const acs=[];
  if(e.st>=2)acs.push(`<button class="btn sm sec" onclick="event.stopPropagation();imViewer('${e.id}')" title="Abre o visualizador DICOM (OHIF) só com este estudo">${IM_IC.img} Imagens</button>`);
  if(e.st>=2&&e.st<5&&imEhUS(e))acs.push(`<button class="btn sm" onclick="event.stopPropagation();imLaudar('${e.id}')">Laudar</button>`);
  else if(e.st>=3&&e.st<5&&!e.tele)acs.push(`<button class="btn sm" onclick="event.stopPropagation();imTele('${e.id}')">${IM_IC.send} Telelaudo</button>`);
  else if(e.st===5)acs.push(`<button class="btn sm" onclick="event.stopPropagation();imEntregar('${e.id}')">Entregar</button>`);
  else if(e.st<2)acs.push(`<button class="btn sm neutral" onclick="event.stopPropagation();imAvancar('${e.id}')">${e.st===0?'Chegou':'Iniciar exame'}</button>`);
  return `<tr style="cursor:pointer" onclick="imFicha('${e.id}')" ${tipAttr(e.pac,'Abre a ficha do exame: etapas, horários, telelaudo, entrega e ações.')}>${td('Hora',`<b>${e.h}</b>`)}${td('Paciente',`<div class="two">${esc(e.pac)}${e.urg?' <span class="badge err pisca">URGENTE</span>':''}<small>${e.id_} anos · ${e.sx} · ${esc(e.conv)}</small></div>`)}${td('Exame',`<div class="two">${esc(pr.n)}<small class="mono">${e.id}</small></div>`)}${td('Aparelho',`<div class="two">${eq.n}<small>${eq.mod} · ${esc(eq.sala)}</small></div>`)}${td('Situação',`<div class="two">${imStBadge(e)}<small>${imProg(e.st)}</small></div>`)}${td('Laudo',`<div class="two">${imQuem(e)}<small>${imSla(e)}</small></div>`)}${td('Telelaudo',tl)}${td('',`<div class="row" style="gap:6px;flex-wrap:nowrap">${acs.join('')}</div>`)}</tr>`});
 const maxL=Math.max(...IM_PROD.map(p=>p.laudos));
 return `<div class="wrap">${pageHead('Imagem e ultrassom','Exames de imagem',`Worklist DICOM por sala e aparelho, prazo de laudo, telelaudo e entrega. Hoje, ${imHH(IM_AGORA)}. Dados de exemplo.`,`${rulesBtn('Exames de imagem')}<button class="btn sec" onclick="imParceiros()">${IM_IC.send} Integrações</button><button class="btn" onclick="imEncaixe()">${I.plus} Encaixar exame</button>`)}
 <div class="mini">${miniKpi('Na worklist hoje',IM_EX.length,`${IM_EX.filter(e=>e.st<2).length} ainda não começaram`,'',"IM_F={eq:'',st:-1,chip:'todos',q:''};reView()")}${miniKpi('Urgências',IM_EX.filter(e=>e.urg&&e.st<5).length,'laudo em até 1 h','err',"IM_F.chip='urg';reView()")}${miniKpi('Laudo vencendo',venc.length,'vence em 30 min ou já venceu',venc.length?'warn':'ok',"IM_F.chip='atraso';reView()")}${miniKpi('Em telelaudo',IM_EX.filter(e=>e.tele&&!e.tele.rec).length,'aguardando o parceiro','',"IM_F.chip='tele';reView()")}${miniKpi('Para entregar',IM_EX.filter(e=>e.st===5).length,'laudo liberado, falta entregar','',`IM_F.st=5;reView()`)}</div>
 <div class="card" style="padding:18px"><h3>Etapas do exame ${info('Cada exame anda nesta ordem. O aparelho recebe o paciente pela worklist DICOM (MWL) e devolve as imagens ao PACS; o laudo fecha o ciclo. Clique numa etapa para filtrar.')}</h3><div class="sub">Agendado, chegou, em exame, imagens recebidas, em laudo, laudo liberado, entregue</div>
 <div class="funil">${IM_ST.map((s,i)=>`<button class="et" style="cursor:pointer;font-family:inherit;${f.st===i?'border-color:var(--accent);background:var(--accent-soft)':''}" onclick="IM_F.st=${f.st===i?-1:i};reView()"><b>${IM_EX.filter(e=>e.st===i).length}</b><small>${s}</small></button>`).join('')}</div></div>
 <div class="im-eqs">${IM_EQUIP.map(q=>{const n=IM_EX.filter(e=>e.eq===q.id&&e.st<5);const prox=IM_EX.filter(e=>e.eq===q.id&&e.st<2).sort((a,b)=>imMin(a.h)-imMin(b.h))[0];return `<button class="im-eq ${f.eq===q.id?'on':''} ${q.on?'':'off'}" onclick="IM_F.eq=IM_F.eq==='${q.id}'?'':'${q.id}';reView()"><b>${q.n} · ${q.mod}</b><small>${esc(q.ap)} · ${esc(q.sala)}</small><small>AE Title <span class="mono">${q.aet}</span> · ${q.on?'<span class="prazo-ok">worklist conectada</span>':`<span class="prazo-warn">${esc(q.obs)}</span>`}</small><small>${n.length} na fila${prox?` · próximo ${prox.h} ${esc(prox.pac.split(' ')[0])}`:''}</small></button>`}).join('')}</div>
 ${IM_EQUIP.some(q=>!q.on&&IM_EX.some(e=>e.eq===q.id&&e.st<2))?`<div class="alert warn"><span><b>Mamógrafo em manutenção até 11h.</b> A mamografia das 10:00 (Teresa Cristina Moura) precisa ser remarcada ou trocada de horário. <a href="javascript:void(0)" onclick="imRemarcar('IM-26-004829')">Remarcar</a></span></div>`:''}
 <div class="filters">${[['todos','Todos'],['urg','Urgentes'],['atraso','Laudo vencendo'],['sem','Sem médico'],['tele','Telelaudo']].map(([k,t])=>chip(t,f.chip===k,`IM_F.chip='${k}';reView()`)).join('')}
  <div class="inwrap" style="flex:1;min-width:200px;max-width:360px"><svg class="i" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input class="in" id="imQ" placeholder="Paciente, exame ou número de acesso" value="${esc(f.q)}" oninput="imBusca(this.value)"></div>
  ${f.eq||f.st>=0||f.chip!=='todos'||f.q?`<button class="btn sm ghost" onclick="IM_F={eq:'',st:-1,chip:'todos',q:''};reView()">Limpar filtros</button>`:''}</div>
 <div class="im-tbl">${tabela(['Hora','Paciente','Exame','Aparelho','Situação','Laudo e prazo','Telelaudo',''],rows,'Nenhum exame com esses filtros')}</div>
 <div class="grid">
  <div class="card"><h3>Produtividade ${info('Laudos do mês por médico ou parceiro, tempo médio entre as imagens chegarem e o laudo ser liberado (TAT), e a parte liberada dentro do prazo. É a base do repasse por exame.')}</h3><div class="sub">Novembro até hoje · laudos liberados</div>
   <div class="barras">${IM_PROD.map(p=>barra(p.n.replace(' (telelaudo)',''),p.laudos,maxL,`${p.laudos}`)).join('')}</div>
   <div class="tablewrap" style="margin-top:12px"><table class="at-table" style="min-width:0"><thead><tr><th>Quem</th><th>TAT médio</th><th>No prazo</th></tr></thead><tbody>${IM_PROD.map(p=>`<tr>${td('Quem',`<div class="two">${p.n}<small>${p.tipo}</small></div>`)}${td('TAT médio',p.tat>=60?`${Math.floor(p.tat/60)} h ${String(p.tat%60).padStart(2,'0')}`:`${p.tat} min`)}${td('No prazo',`<span class="${p.prazo>=95?'prazo-ok':'prazo-warn'}">${p.prazo}%</span>`)}</tr>`).join('')}</tbody></table></div></div>
  <div class="card"><h3>Glosas de imagem ${info('Glosas dos convênios em exames de imagem, com o motivo. O motivo mais comum vira uma checagem antes de fechar o lote.')}</h3><div class="sub">${IM_GLOSAS.length} no mês · ${fmt(IM_GLOSAS.reduce((s,g)=>s+g.v,0))}</div>
   <div class="stack">${IM_GLOSAS.map(g=>`<div class="doc"><div class="dd"><b>${esc(g.proc)} · ${esc(g.conv)}</b><small>${esc(g.motivo)}</small></div><div style="text-align:right"><b>${fmt(g.v)}</b><small style="display:block;color:var(--fg2);font-size:12px">${g.st}</small></div></div>`).join('')}</div>
   <div class="alert info" style="margin-top:12px"><span>Dica: 2 das 4 glosas são de guia. A worklist já não deixa iniciar exame de convênio sem guia autorizada.</span></div></div>
  <div class="card"><h3>Recalls gerados pelos laudos ${info('Quando o laudo tem uma categoria que pede seguimento (TI-RADS, BI-RADS 3, O-RADS, LI-RADS, peso fetal fora da curva), o retorno entra aqui e na lista de retornos da agenda, com lembrete ao paciente.')}</h3><div class="sub">Seguimento clínico automático</div>
   <div class="stack">${IM_RECALL.map(r=>`<div class="doc"><div class="di">${IM_IC.cal}</div><div class="dd"><b>${esc(r.pac)}</b><small>${esc(r.motivo)}</small><small>${esc(r.quando)} · ${esc(r.orig)}</small></div><span class="badge ${/Agendado/.test(r.st)?'ok':'warn'}" style="flex:none;max-width:92px;height:auto;white-space:normal;text-align:center;line-height:1.2;padding:4px 8px">${esc(r.st)}</span></div>`).join('')}</div></div>
 </div>
 ${piada('IM1',{todos:'Ultrassom é a única sala da clínica onde pedir para o paciente "encher a bexiga e esperar" é considerado atendimento de qualidade.',dr:'Laudo de imagem perfeito: aquele em que "correlacionar com a clínica" aparece só uma vez.'})}
</div>`};
function imBusca(v){IM_F.q=v;reView();const e=document.getElementById('imQ');if(e){e.focus();e.setSelectionRange(v.length,v.length)}}
function imFicha(id){const e=IMX(id),pr=imProc(e.proc),eq=IM_EQ(e.eq);
 const passos=IM_ST.map((s,i)=>`<div class="stp ${i<e.st?'ok':i===e.st?'cur':''}"><span class="dot2"></span><div class="st">${s}<small>${e.t[i]?e.t[i]:i<=e.st?'—':'pendente'}${i===4&&e.laud?' · '+imQuem(e):''}${i===6&&e.ent?' · '+e.ent.canal:''}</small></div></div>`).join('');
 const acs=[];
 if(e.st<3)acs.push(`<button class="btn" onclick="imAvancar('${id}')">${['Registrar chegada','Iniciar exame','Imagens recebidas'][e.st]}</button>`);
 if(e.st>=2)acs.push(`<button class="btn sec" onclick="imViewer('${id}')">${IM_IC.img} Ver imagens</button>`);
 if(e.st>=2&&e.st<5&&imEhUS(e))acs.push(`<button class="btn" onclick="imLaudar('${id}')">Abrir laudo</button>`);
 if(e.st>=3&&e.st<5&&!e.tele)acs.push(`<button class="btn sec" onclick="imTele('${id}')">${IM_IC.send} Enviar ao telelaudo</button>`);
 if(e.tele&&!e.tele.rec)acs.push(`<button class="btn" onclick="imTeleRetorno('${id}')">Registrar retorno do laudo</button>`);
 if(e.st>=3&&e.st<5)acs.push(`<button class="btn ghost" onclick="imAtribuir('${id}')">Trocar médico</button>`);
 if(e.st===5)acs.push(`<button class="btn" onclick="imEntregar('${id}')">Entregar ao paciente</button>`);
 if(e.st>=5&&IM_LAUDOS[id])acs.push(`<button class="btn sec" onclick="IM_LSEL='${id}';imPreview()">${I.print} Ver laudo</button>`);
 openDrawer(`Exame <span class="mono">${id}</span>`,`${e.urg?'<span class="badge err pisca">URGENTE</span>':''}
 ${kvs([['Paciente',`${esc(e.pac)} · ${e.id_} anos · ${e.sx}`],['Exame',`${esc(pr.n)} <span class="tl mono">TUSS ${pr.c}</span>`],['Indicação',esc(e.ind||'—')],['Solicitante',esc(e.sol)],['Convênio',esc(e.conv)],['Aparelho',`${eq.n} · ${esc(eq.ap)}<br><span class="tl">AE Title ${eq.aet} · ${esc(eq.sala)}</span>`],['Preparo',esc(pr.prep||'—')],['Médico do laudo',imQuem(e)],['Prazo do laudo',imSla(e)],['Imagens',e.img?`${e.img} imagens no PACS · Study UID 1.2.840.113619.2.${id.slice(-4)}`:'ainda não chegaram'],e.tele?['Telelaudo',`${IM_PARC.find(p=>p.id===e.tele.p).n} · enviado ${e.tele.env}${e.tele.rec?' · laudo recebido '+e.tele.rec:' · aguardando retorno'}`]:null,e.ent?['Entrega',`${e.ent.canal} · ${e.ent.h}`]:null])}
 <div><b style="font-size:14px">Etapas</b><div class="steps">${passos}</div></div>
 <div class="row" style="gap:8px">${acs.join('')}</div>`)}
function imAvancar(id){const e=IMX(id);if(e.st>=3)return;
 if(e.st===0&&IM_EQ(e.eq).on===false){toast('O aparelho está em manutenção. Remarque ou troque de aparelho antes de registrar a chegada','warn');return}
 if(e.st===0&&e.conv!=='Particular'&&!e.guiaOk){e.guiaOk=true}
 e.st++;e.t[e.st]=imHH(IM_AGORA);
 if(e.st===1&&!e.prazo)e.prazo=imHH(IM_AGORA+(e.urg?60:imEhUS(e)?120:240));
 toast(['','Chegada registrada: o paciente entrou na worklist DICOM do '+IM_EQ(e.eq).n+' ('+IM_EQ(e.eq).aet+')','Exame iniciado no aparelho. O técnico/médico vê o paciente na worklist','Imagens recebidas no PACS: '+(e.img=e.img||12)+' imagens'][e.st]);
 reView();if($('#drawer').classList.contains('show'))imFicha(id)}
function imLaudar(id){const e=IMX(id);if(!imEhUS(e)){toast('Exames de RX e mamografia vão para o telelaudo','warn');return}
 IM_LSEL=id;imLaudo(id);if(e.st===3){e.st=4;e.t[4]=imHH(IM_AGORA)}if(!e.laud)e.laud='p2';closeDrawer();
 if(location.hash==='#laudo-us')reView();else location.hash='laudo-us'}
function imAtribuir(id){const e=IMX(id);const ms=PROFISSIONAIS.filter(p=>['p2','p3'].includes(p.id));
 modalOk('Médico do laudo',`<p style="font-size:14px">Quem vai laudar <b>${esc(e.pac)}</b> (${esc(imProc(e.proc).n)})?</p><div class="field"><label>Médico</label><select class="in" id="imAt">${ms.map(m=>`<option value="${m.id}" ${e.laud===m.id?'selected':''}>${m.n} · ${m.esp}</option>`).join('')}</select></div><p class="tl">A troca fica registrada no histórico do exame e conta para a produtividade de quem assinar.</p>`,'Atribuir',`imAtribuirOk('${id}',document.getElementById('imAt').value)`)}
function imAtribuirOk(id,v){const e=IMX(id);e.laud=v;toast('Laudo atribuído a '+PROF(v).n);reView();imFicha(id)}
function imTele(id){const e=IMX(id);const ps=IM_PARC.filter(p=>p.tipo==='Telelaudo');
 modalOk('Enviar ao telelaudo',`<p style="font-size:14px">${esc(e.pac)} · ${esc(imProc(e.proc).n)} · ${e.img} imagens</p><div class="field"><label>Parceiro</label><select class="in" id="imTp">${ps.map(p=>`<option value="${p.id}">${p.n} · ${p.mods} · ${p.sla}</option>`).join('')}</select></div><label class="check"><input type="checkbox" id="imTu" ${e.urg?'checked':''}> Urgência (prazo de 1 h)</label><p class="tl">Vão o estudo DICOM, a indicação clínica e o pedido digitalizado. O laudo assinado volta sozinho e fica anexado ao exame.</p>`,'Enviar',`imTeleOk('${id}')`)}
function imTeleOk(id){const e=IMX(id),p=document.getElementById('imTp').value,u=document.getElementById('imTu').checked;
 e.tele={p,env:imHH(IM_AGORA),rec:null};e.st=4;e.t[4]=imHH(IM_AGORA);e.laud=IM_PARC.find(x=>x.id===p).n+' (na fila)';e.urg=e.urg||u;e.prazo=imHH(IM_AGORA+(u?60:240));
 toast(`Estudo enviado ao ${IM_PARC.find(x=>x.id===p).n}. Prazo do laudo: ${e.prazo}`);reView()}
function imTeleRetorno(id){const e=IMX(id);e.tele.rec=imHH(IM_AGORA);e.st=5;e.t[5]=e.tele.rec;e.lib=e.tele.rec;e.laud='Dra. Simone Rangel · '+IM_PARC.find(x=>x.id===e.tele.p).n;
 toast('Laudo do telelaudo recebido, assinado pelo parceiro (ICP-Brasil) e anexado ao exame');reView();imFicha(id)}
function imEntregar(id){const e=IMX(id);const pac=PACIENTES.find(p=>p.n===e.pac);
 openModal(`${mh('Entregar ao paciente')}<div class="mb"><p style="font-size:14px"><b>${esc(e.pac)}</b> · ${esc(imProc(e.proc).n)} · laudo liberado ${e.lib||''}</p>
 <div class="stack">
  <label class="check"><input type="radio" name="imEc" value="Portal do paciente" checked> Portal do paciente: laudo em PDF + botão "Visualizar imagens"</label>
  <label class="check"><input type="radio" name="imEc" value="WhatsApp"> WhatsApp ${pac?esc(pac.tel):'(telefone do cadastro)'}: link seguro, válido por 30 dias</label>
  <label class="check"><input type="radio" name="imEc" value="Impresso no balcão"> Impresso no balcão, com as imagens-chave</label>
 </div>
 <label class="check"><input type="checkbox" id="imEs" checked> Avisar o médico solicitante (${esc(e.sol)})</label>
 <div class="alert info"><span>A mensagem do WhatsApp sai do modelo aprovado: "Olá, ${esc(e.pac.split(' ')[0])}! Seu exame de ${esc(imProc(e.proc).n)} está pronto. Acesse com sua data de nascimento: deoclinic.com.br/r/…".</span></div></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="imEntregarOk('${id}')">${IM_IC.wpp} Entregar</button></div>`)}
function imEntregarOk(id){const e=IMX(id),c=(document.querySelector('input[name=imEc]:checked')||{}).value||'Portal do paciente';e.st=6;e.t[6]=imHH(IM_AGORA);e.ent={canal:c,h:imHH(IM_AGORA)};closeModal();
 toast(`Entregue por ${c}${document.getElementById('imEs')&&document.getElementById('imEs').checked?' e o solicitante foi avisado':''}`);reView()}
function imRemarcar(id){const e=IMX(id);modalOk('Remarcar exame',`<p style="font-size:14px">${esc(e.pac)} · ${esc(imProc(e.proc).n)} às ${e.h}. O mamógrafo está em manutenção até 11h.</p><div class="field"><label>Novo horário</label><select class="in" id="imRh"><option>11:20</option><option>11:40</option><option>14:00</option></select></div><label class="check"><input type="checkbox" checked> Avisar a paciente por WhatsApp</label>`,'Remarcar',`imRemarcarOk('${id}',document.getElementById('imRh').value)`)}
function imRemarcarOk(id,h){const e=IMX(id);e.h=h;toast(`Remarcado para ${h}. A paciente foi avisada e a worklist do mamógrafo foi atualizada`);reView()}
function imEncaixe(){const ims=[...PROCEDIMENTOS.filter(p=>p.tipo==='Imagem'),...IM_PROCX];
 openModal(`${mh('Encaixar exame de imagem')}<div class="mb"><div class="formgrid">
 <div class="field"><label>Paciente <span class="req">*</span></label><select class="in" id="imNp">${PACIENTES.filter(p=>p.ativo).map(p=>`<option>${esc(p.n)}</option>`).join('')}</select></div>
 <div class="field"><label>Exame <span class="req">*</span></label><select class="in" id="imNx">${ims.map(p=>`<option value="${p.c}">${esc(p.n)}</option>`).join('')}</select></div>
 <div class="field"><label>Aparelho</label><select class="in" id="imNe">${IM_EQUIP.map(q=>`<option value="${q.id}" ${q.on?'':'disabled'}>${q.n} · ${q.mod}${q.on?'':' (manutenção)'}</option>`).join('')}</select></div>
 <div class="field"><label>Horário</label><input class="in" id="imNh" value="09:40"></div>
 <div class="field"><label>Convênio</label><select class="in" id="imNc"><option>Particular</option>${(typeof CONVENIOS!=='undefined'?CONVENIOS:[]).slice(0,6).map(c=>`<option>${esc(c.n||c.nome||String(c))}</option>`).join('')}</select></div></div>
 <label class="check"><input type="checkbox" id="imNu"> Urgência (laudo em até 1 h)</label>
 <p class="tl">O exame entra na agenda e na worklist DICOM (MWL) do aparelho. Exame de convênio só inicia com a guia autorizada.</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="imEncaixeOk()">Encaixar</button></div>`)}
function imEncaixeOk(){const pn=$('#imNp').value,pc=$('#imNx').value,eq=$('#imNe').value,h=$('#imNh').value||'09:40',u=$('#imNu').checked;const p=PACIENTES.find(x=>x.n===pn);
 const pad=(IM_PADROES.find(x=>x.procs.includes(pc))||{}).id;const id='IM-26-00'+(4833+IM_EX.length);
 IM_EX.push({id,pac:pn,id_:p?idade(p.dn):'—',sx:p?p.sx:'',proc:pc,eq,h,st:0,urg:u,laud:null,sol:'Encaixe da recepção',conv:$('#imNc').value,prazo:'',img:0,pad,ind:'Encaixe',t:[]});
 closeModal();toast(`${pn} encaixado às ${h} no ${IM_EQ(eq).n}. Já aparece na worklist do aparelho`);reView()}
function imParceiros(){imModal('Integrações de imagem',`<p style="font-size:14px;color:var(--fg2)">Aparelhos, PACS e parceiros de laudo. Dados de exemplo.</p>
 <div class="stack">${[{n:'PACS (Orthanc) + visualizador OHIF',t:'Recebe as imagens dos aparelhos (DICOM C-STORE) e abre no navegador para médico e paciente',on:true,u:'08:59'},{n:'Worklist DICOM (MWL)',t:'A agenda manda o paciente para o aparelho; ninguém digita nome no console',on:true,u:'08:58'},...IM_PARC.map(p=>({n:p.n+' · '+p.tipo,t:`${p.mods} · ${p.sla}${p.fila?' · '+p.fila+' na fila':''}`,on:p.on,u:p.ult})),{n:'Medidas do aparelho (DICOM SR)',t:'Traz as medidas do US (obstétrico, tireoide) direto para o laudo, sem redigitar',on:false,u:'fase 2'}].map(x=>`<div class="im-tlink"><span class="badge ${x.on?'ok':'neutral'}">${x.on?'Conectado':'Planejado'}</span><div class="dd"><b>${x.n}</b><small>${x.t}</small></div><small>${x.on?'última troca '+x.u:x.u}</small></div>`).join('')}</div>`,`<button class="btn sec" onclick="toast('Teste enviado: PACS, MWL e parceiros responderam')">Testar conexões</button><button class="btn" onclick="closeModal()">Fechar</button>`)}

/* visualizador de imagens (simulação do OHIF) */
let IM_VS=0;
function imUsSvg(seed){const r=n=>((Math.sin(seed*99+n*7.3)+1)/2);
 return `<svg viewBox="0 0 400 300" role="img" aria-label="Imagem de ultrassom simulada"><defs><radialGradient id="img${seed}" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#9aa" stop-opacity=".55"/><stop offset=".7" stop-color="#455" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><path d="M200 10 L370 260 A210 210 0 0 1 30 260 Z" fill="url(#img${seed})"/>${Array.from({length:40},(_,i)=>`<circle cx="${60+r(i)*280}" cy="${60+r(i+50)*190}" r="${1+r(i+9)*3}" fill="#cdd" opacity="${.15+r(i+3)*.3}"/>`).join('')}<ellipse cx="${170+r(1)*60}" cy="${150+r(2)*40}" rx="${28+r(3)*18}" ry="${18+r(4)*12}" fill="#111" opacity=".75" stroke="#aaa" stroke-opacity=".5"/><line x1="140" y1="200" x2="230" y2="200" stroke="#5AB2AE" stroke-dasharray="4 3"/><text x="236" y="204" fill="#5AB2AE" font-size="11">1,7 cm</text></svg>`}
function imViewer(id,s){const e=IMX(id);if(s!=null)IM_VS=s;else IM_VS=0;const eq=IM_EQ(e.eq);const ser=eq.mod==='US'?['Modo B','Doppler','Medidas','Cine']:eq.mod==='MG'?['CC dir.','CC esq.','MLO dir.','MLO esq.']:['PA','Perfil'];
 imModal(`Imagens · ${esc(e.pac)}`,`<div class="im-viewer"><div class="im-ser">${ser.map((x,i)=>`<button class="${i===IM_VS?'on':''}" onclick="imViewer('${id}',${i})">${eq.mod==='US'?imUsSvg(i+1):`<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#111"/><ellipse cx="30" cy="30" rx="18" ry="24" fill="#999" opacity=".5"/></svg>`}<br>${x} · ${Math.max(1,Math.round(e.img/ser.length))}</button>`).join('')}</div>
 <div class="im-vp"><div class="im-tb">${['Janela/nível','Zoom','Mover','Medir','Ângulo','Anotar','Cine','Layout 2×2','Comparar com anterior'].map(t=>`<button onclick="toast('${t}: ferramenta do visualizador (no protótipo, só a indicação)')">${t}</button>`).join('')}</div>
 <div class="im-img">${eq.mod==='US'?imUsSvg(IM_VS+1):`<svg viewBox="0 0 400 300"><rect width="400" height="300" fill="#000"/><ellipse cx="200" cy="150" rx="${eq.mod==='MG'?90:150}" ry="130" fill="#aaa" opacity=".35"/><path d="M200 30v240" stroke="#ccc" stroke-opacity=".4" stroke-width="10"/></svg>`}
  <div class="ov" style="top:8px;left:10px">${esc(e.pac)}<br>${e.id_}a ${e.sx} · ${e.id}<br>${esc(imProc(e.proc).n)}</div>
  <div class="ov" style="top:8px;right:10px;text-align:right">${eq.ap}<br>AE ${eq.aet}<br>29/10/2026 ${e.t[2]||e.h}</div>
  <div class="ov" style="bottom:8px;left:10px">Série ${IM_VS+1}/${ser.length} · ${ser[IM_VS]}<br>Imagem 1/${Math.max(1,Math.round(e.img/ser.length))}</div>
  <div class="ov" style="bottom:8px;right:10px;text-align:right">W 255 L 128<br>Zoom 100%</div></div></div></div>
 <p class="tl">Simulação do visualizador OHIF. No sistema, a sessão é temporária e só abre este estudo; o paciente vê pelo portal.</p>`,`<button class="btn ghost" onclick="toast('Imagem marcada como imagem-chave: vai para o laudo impresso')">Marcar imagem-chave</button><button class="btn sec" onclick="toast('OHIF aberto em nova aba, só com este estudo')">Abrir no OHIF</button>${e.st>=2&&e.st<5&&imEhUS(e)?`<button class="btn" onclick="closeModal();imLaudar('${id}')">Laudar</button>`:'<button class="btn" onclick="closeModal()">Fechar</button>'}`)}

/* ================= Tela 2 · Laudo de ultrassom (editor estruturado) ================= */
const imSel=(id,ops,v,oc,dis)=>`<select class="in" ${id?`id="${id}"`:''} onchange="${oc}" ${dis?'disabled':''}>${ops.map(o=>`<option value="${o[0]}" ${String(v)===String(o[0])?'selected':''}>${o[1]}</option>`).join('')}</select>`;
const imRes=(cat,sub,cls,cd,extra)=>`<div class="im-res ${cls}"><div class="cat">${cat}<small>${sub}</small></div><div class="cd">${cd}${extra?`<small>${extra}</small>`:''}</div></div>`;
VIEWS['laudo-us']=()=>{
 const us=IM_EX.filter(e=>imEhUS(e)&&e.pad&&e.st>=2);
 if(!us.find(e=>e.id===IM_LSEL))IM_LSEL=us[0].id;
 const e=IMX(IM_LSEL),L=imLaudo(IM_LSEL),p=IMP(L.pad),fin=L.st!=='rascunho',dis=fin?'disabled':'';
 const {calcs,r}=imResultados(L,p);const rec=imRecalls(L,p);const coer=imCoerencia(L,p);
 const secs=p.secoes.map(s=>{const st=L.sec[s.id];return `<div class="im-sec ${st.modo==='alt'?'alt':''}"><div class="im-st"><b>${s.t}</b><span class="row" style="gap:6px">${st.modo==='alt'?'<span class="badge warn">Alterado</span>':'<span class="badge ok">Normal</span>'}${fin?'':`<button class="btn sm ghost" onclick="imSecNormal('${s.id}')" title="Volta esta seção para a frase normal do padrão">Voltar ao normal</button>`}</span></div>
  ${fin?'':`<div class="im-frases">${s.alts.map((a,i)=>`<button class="chip" onclick="imSecFrase('${s.id}',${i})" title="Acrescenta esta frase à seção">+ ${esc(a)}</button>`).join('')}</div>`}
  <textarea class="in" ${dis} onchange="imSecTxt('${s.id}',this.value)" aria-label="Texto de ${s.t}">${esc(st.txt)}</textarea>
  ${s.campos.length?`<div class="im-meas">${s.campos.map(c=>{const v=imValor(L,p,c.k),f=imFlag(c,v);return `<span>${c.l}</span>${c.calc?`<span class="calc">${imF(v)} ${c.u}</span>`:`<input class="in" inputmode="decimal" ${dis} value="${esc(L.val[c.k]||'')}" onchange="imVal('${c.k}',this.value)" aria-label="${c.l}" placeholder="${c.u}">`}<span class="ref">${c.u}${c.ref?' · ref. '+c.ref:''}${f==='up'?'<span class="fl up">↑ acima</span>':f==='dn'?'<span class="fl dn">↓ abaixo</span>':f==='ok'?'<span class="fl ok">normal</span>':''}</span>`}).join('')}</div>`:''}</div>`}).join('');
 /* calculadoras */
 const cal=[];
 if(calcs.includes('tirads')){const ns=L.calc.tirads.nods;cal.push(`<div class="im-calc"><div class="im-st" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center"><b>ACR TI-RADS ${info('Pontos por composição, ecogenicidade, forma, margem e focos ecogênicos (estes somam). 0 a 1 ponto TR1, 2 TR2, 3 TR3, 4 a 6 TR4, 7 ou mais TR5. A PAAF e o seguimento dependem do maior eixo. Espongiforme é TR1 sem somar o resto.')}</b>${fin?'':`<button class="btn sm sec" onclick="imNod()">${I.plus} Nódulo</button>`}</div>
  ${ns.length?'':'<p class="tl">Sem nódulos. Use "+ Nódulo" para classificar.</p>'}
  ${ns.map((n,i)=>{const t=r.tirads[i];const oc=k=>`imNodSet(${i},'${k}',this.value)`;return `<div class="im-nod"><div class="row" style="justify-content:space-between"><b style="font-size:13.5px">Nódulo ${i+1}</b>${fin?'':`<button class="btn sm ghost" style="color:var(--err)" onclick="imNodDel(${i})">Remover</button>`}</div>
   <div class="formgrid"><div class="field"><label>Localização</label><input class="in" ${dis} value="${esc(n.loc||'')}" onchange="${oc('loc')}"></div><div class="field"><label>Maior eixo (cm)</label><input class="in" inputmode="decimal" ${dis} value="${esc(n.tam||'')}" onchange="${oc('tam')}"></div>
   <div class="field"><label>Composição</label>${imSel('',TR_OP.comp.map(o=>[o[0],`${o[1]} (${o[2]})`]),n.comp,oc('comp'),fin)}</div><div class="field"><label>Ecogenicidade</label>${imSel('',TR_OP.eco.map(o=>[o[0],`${o[1]} (${o[2]})`]),n.eco,oc('eco'),fin)}</div>
   <div class="field"><label>Forma</label>${imSel('',TR_OP.forma.map(o=>[o[0],`${o[1]} (${o[2]})`]),n.forma,oc('forma'),fin)}</div><div class="field"><label>Margem</label>${imSel('',TR_OP.marg.map(o=>[o[0],`${o[1]} (${o[2]})`]),n.marg,oc('marg'),fin)}</div></div>
   <div class="im-focos"><span class="tl">Focos ecogênicos (somam):</span>${TR_OP.focos.map(o=>`<label class="check"><input type="checkbox" ${dis} ${(n.focos||[]).includes(o[0])?'checked':''} onchange="imNodFoco(${i},'${o[0]}',this.checked)"> ${o[1]} (${o[2]})</label>`).join('')}</div>
   ${imRes('TR'+t.tr,t.pts+' ponto'+(t.pts===1?'':'s'),'r'+t.tr,`<b>${t.nome}</b>${t.esp?' (espongiforme)':''}`,t.cd)}</div>`}).join('')}</div>`)}
 if(calcs.includes('birads')){const b=L.calc.birads,x=r.birads,oc=k=>`imCalcSet('birads','${k}',this.value)`,sol=b.achado==='nodulo'||b.achado==='complexo';
  cal.push(`<div class="im-calc"><b>BI-RADS · ultrassom ${info('Léxico do ACR BI-RADS 5ª edição. O sistema sugere a categoria pelas características suspeitas (forma irregular, orientação não paralela, margem não circunscrita, sombra, calcificações, distorção, pele). A categoria final é do médico: use "Categoria final" para ajustar.')}</b>
  <div class="formgrid"><div class="field" style="grid-column:1/-1"><label>Achado</label>${imSel('',BR_OP.achado,b.achado,oc('achado'),fin)}</div>
  ${b.achado!=='nenhum'?`<div class="field"><label>Localização</label><input class="in" ${dis} value="${esc(b.lado||'')}" onchange="${oc('lado')}" placeholder="mama, horas, distância do mamilo"></div><div class="field"><label>Maior eixo (cm)</label><input class="in" ${dis} value="${esc(b.tam||'')}" onchange="${oc('tam')}"></div>`:''}
  ${sol?`<div class="field"><label>Forma</label>${imSel('',BR_OP.forma,b.forma,oc('forma'),fin)}</div><div class="field"><label>Orientação</label>${imSel('',BR_OP.orient,b.orient,oc('orient'),fin)}</div><div class="field"><label>Margem</label>${imSel('',BR_OP.margem,b.margem,oc('margem'),fin)}</div><div class="field"><label>Padrão de eco</label>${imSel('',BR_OP.eco,b.eco,oc('eco'),fin)}</div><div class="field"><label>Posterior</label>${imSel('',BR_OP.post,b.post,oc('post'),fin)}</div>`:''}
  <div class="field"><label>Categoria final</label>${imSel('',[['auto','Sugerida pelo léxico'],['1','1'],['2','2'],['3','3'],['4A','4A'],['4B','4B'],['4C','4C'],['5','5']],b.manual||'auto',oc('manual'),fin)}</div></div>
  <div class="im-focos">${sol?[['calc','Calcificações no nódulo'],['dist','Distorção arquitetural'],['pele','Alteração de pele']].map(([k,t])=>`<label class="check"><input type="checkbox" ${dis} ${b[k]?'checked':''} onchange="imCalcSet('birads','${k}',this.checked)"> ${t}</label>`).join(''):''}<label class="check"><input type="checkbox" ${dis} ${b.incompleto?'checked':''} onchange="imCalcSet('birads','incompleto',this.checked)"> Avaliação incompleta (0)</label><label class="check"><input type="checkbox" ${dis} ${b.comprovado?'checked':''} onchange="imCalcSet('birads','comprovado',this.checked)"> Malignidade já comprovada (6)</label></div>
  ${imRes('BI-RADS '+x.c,'risco '+x.risco,'r'+(x.c[0]==='0'?3:x.c[0]==='6'?5:x.c[0]),x.cd,x.susp.length?'Características suspeitas: '+x.susp.join(', ')+'.':(b.achado==='nodulo'?'Sem características suspeitas: oval, paralelo, circunscrito.':''))}</div>`)}
 if(calcs.includes('orads')){const o=L.calc.orads,x=r.orads,oc=k=>`imCalcSet('orads','${k}',this.value)`;
  cal.push(`<div class="im-calc"><b>O-RADS US v2022 ${info('Classificação de risco de lesões ovarianas e anexiais do ACR (versão 2022): tipo de lesão, tamanho, parede, componente sólido, escore de cor (1 a 4) e ascite ou nódulos peritoneais (O-RADS 5).')}</b>
  <div class="formgrid"><div class="field" style="grid-column:1/-1"><label>Tipo de lesão</label>${imSel('',OR_OP.tipo,o.tipo,oc('tipo'),fin)}</div>
  <div class="field"><label>Lado</label><input class="in" ${dis} value="${esc(o.lado||'')}" onchange="${oc('lado')}"></div><div class="field"><label>Maior diâmetro (cm)</label><input class="in" ${dis} value="${esc(o.tam||'')}" onchange="${oc('tam')}"></div>
  <div class="field"><label>Menopausa</label>${imSel('',[['pre','Pré-menopausa'],['pos','Pós-menopausa']],o.meno,oc('meno'),fin)}</div><div class="field"><label>Escore de cor</label>${imSel('',OR_OP.cs,o.cs,oc('cs'),fin)}</div>
  ${o.tipo==='multi'?`<div class="field"><label>Parede interna</label>${imSel('',[['lisa','Lisa'],['irreg','Irregular']],o.parede,oc('parede'),fin)}</div>`:''}
  ${o.tipo==='solido'?`<div class="field"><label>Contorno externo</label>${imSel('',[['liso','Liso'],['irreg','Irregular']],o.contorno,oc('contorno'),fin)}</div>`:''}
  ${o.tipo==='unil_sol'?`<div class="field"><label>Projeções papilares</label>${imSel('',[['0','Sólido não papilar'],['1','1 a 3'],['4','4 ou mais']],o.papilas,oc('papilas'),fin)}</div>`:''}</div>
  <div class="im-focos"><label class="check"><input type="checkbox" ${dis} ${o.ascite?'checked':''} onchange="imCalcSet('orads','ascite',this.checked)"> Ascite ou nódulos peritoneais</label><label class="check"><input type="checkbox" ${dis} ${o.incompleto?'checked':''} onchange="imCalcSet('orads','incompleto',this.checked)"> Avaliação incompleta (0)</label></div>
  ${imRes('O-RADS '+x.c,'US v2022','r'+(x.c===0?3:x.c<=2?1:x.c),`<b>${x.nome}</b>`,x.cd)}</div>`)}
 if(calcs.includes('lirads')){const l=L.calc.lirads,x=r.lirads,oc=k=>`imCalcSet('lirads','${k}',this.value)`;
  cal.push(`<div class="im-calc"><b>LI-RADS US · vigilância ${info('Para pacientes de risco de carcinoma hepatocelular. Categoria US-1 negativo, US-2 subliminar (menor que 10 mm) ou US-3 positivo (a partir de 10 mm ou trombo novo em veia), mais o escore de visualização A, B ou C.')}</b>
  <label class="check"><input type="checkbox" ${dis} ${l.risco?'checked':''} onchange="imCalcSet('lirads','risco',this.checked)"> Paciente de risco (cirrose, hepatite B crônica ou CHC prévio)</label>
  ${l.risco?`<div class="formgrid"><div class="field"><label>Observação</label>${imSel('',[['nenhuma','Nenhuma ou só benigna definida'],['menor','Menor que 10 mm'],['maior','A partir de 10 mm'],['trombo','Trombo novo em veia']],l.obs,oc('obs'),fin)}</div><div class="field"><label>Tamanho (cm)</label><input class="in" ${dis} value="${esc(l.tam||'')}" onchange="${oc('tam')}"></div><div class="field"><label>Segmento</label><input class="in" ${dis} value="${esc(l.seg||'')}" onchange="${oc('seg')}"></div><div class="field"><label>Visualização</label>${imSel('',[['A','A · sem limitação ou mínima'],['B','B · limitação moderada'],['C','C · limitação grave']],l.vis,oc('vis'),fin)}</div></div>`:''}
  ${imRes(x.c==='—'?'—':'US-'+x.c,l.risco?'VIS '+l.vis:'sem risco','r'+(x.c==='—'?1:x.c===1?1:x.c===2?3:5),`<b>${x.nome}</b>`,x.cd)}</div>`)}
 if(calcs.includes('obst')){const o=L.calc.obst,x=r.obst,oc=k=>`imCalcSet('obst','${k}',this.value)`;
  cal.push(`<div class="im-calc"><b>Biometria fetal · Hadlock ${info('IG por parâmetro (Hadlock 1984) e composta pelos 4 parâmetros; peso fetal estimado pela fórmula de Hadlock com DBP, CC, CA e CF; percentil pela curva de peso in utero de Hadlock (1991), usando a IG de referência (DUM confiável ou US do 1º trimestre).')}</b>
  <div class="formgrid"><div class="field"><label>IG de referência · semanas</label><input class="in" ${dis} value="${esc(o.igS||'')}" onchange="${oc('igS')}"></div><div class="field"><label>dias</label><input class="in" ${dis} value="${esc(o.igD||'')}" onchange="${oc('igD')}"></div>
  ${[['dbp','DBP (mm)'],['cc','CC (mm)'],['ca','CA (mm)'],['cf','CF (mm)']].map(([k,t])=>`<div class="field"><label>${t} <span class="tl">${x.ga[k]?'· '+x.sd(x.ga[k]):''}</span></label><input class="in" inputmode="decimal" ${dis} value="${esc(o[k]||'')}" onchange="${oc(k)}"></div>`).join('')}</div>
  ${x.peso?imRes(Math.round(x.peso).toLocaleString('pt-BR')+' g',x.pct!=null?'percentil '+x.pct:'peso estimado','r'+(x.pct==null||(x.pct>=10&&x.pct<=90)?1:x.pct<3?5:3),`IG pela biometria <b>${x.sd(x.comp)}</b>${x.dif!=null?` (${x.dif>=0?'+':''}${x.dif} dias da referência)`:''}`,x.pct!=null?`Peso ${x.clas}. Mediana para ${x.sd(x.igRef)}: ${Math.round(x.mediana).toLocaleString('pt-BR')} g.`:'Informe a IG de referência para o percentil.'):'<p class="tl">Preencha DBP, CC, CA e CF para calcular a IG e o peso.</p>'}</div>`)}
 const outras=Object.keys(IM_CALCN).filter(k=>!p.calcs.includes(k));
 /* coluna direita */
 const podeAss=imPode();
 const ia=`<div class="im-ia"><h3 style="font-size:16px;display:flex;gap:8px;align-items:center">${IM_IC.ia} IA de apoio ${info('Redige a impressão diagnóstica e o texto do laudo a partir dos campos estruturados e das calculadoras, e confere a coerência (categoria x achados, medida fora da faixa x frase normal). Nunca assina: o médico revisa e edita.')}</h3>
  ${L.ia?'<div class="warnia">Rascunho gerado por IA, revise antes de assinar.</div>':''}
  ${coer.length?`<div class="alert warn" style="flex-direction:column;gap:4px"><b>Coerência: ${coer.length} ponto${coer.length>1?'s':''} para conferir</b>${coer.map(c=>`<span style="font-size:13px">• ${c}</span>`).join('')}</div>`:'<div class="alert ok"><span>Coerência: categorias, medidas e frases estão de acordo.</span></div>'}
  ${fin?'':`<button class="btn sec" onclick="imIA()">${IM_IC.ia} ${L.ia?'Gerar de novo':'Gerar rascunho do laudo'}</button>`}
  <div class="field"><label>Impressão diagnóstica <span class="req">*</span></label><textarea class="in" style="min-height:140px" ${dis} onchange="imTxt('imp',this.value)" placeholder="Gere com a IA ou escreva">${esc(L.imp)}</textarea></div>
  <div class="field"><label>Texto do laudo (achados)</label><textarea class="in" style="min-height:160px" ${dis} onchange="imTxt('corpo',this.value)" placeholder="Gerado a partir das seções e medidas">${esc(L.corpo)}</textarea></div>
  ${L.ia&&!fin?`<label class="check" style="font-size:14px"><input type="checkbox" ${L.rev?'checked':''} onchange="imRev(this.checked)"> Revisei e editei o texto gerado pela IA</label>`:''}</div>`;
 const recall=`<div class="im-card"><h3>${IM_IC.cal} Recall automático ${info('A categoria do laudo gera o retorno sozinha (ex.: TR4 com 1,5 cm ou mais: PAAF; BI-RADS 3: controle em 6 meses). Ao assinar, o retorno entra na lista de retornos da agenda e o paciente recebe lembrete 15 dias antes.')}</h3><div class="sub">Gerado pela categoria · vai para a agenda ao assinar</div>
  ${rec.length?`<div class="stack">${rec.map(x=>`<div class="doc"><div class="di">${IM_IC.cal}</div><div class="dd"><b>${esc(x.tipo)}</b><small>${esc(x.motivo)}</small><small>${esc(x.quando)}</small></div>${L.recalls.includes(x.motivo)?'<span class="badge ok">Na agenda</span>':'<span class="badge warn">Ao assinar</span>'}</div>`).join('')}</div>`:'<p class="tl">Nenhuma categoria pede seguimento por enquanto.</p>'}</div>`;
 const vers=`<div class="im-card"><h3>${IM_IC.sign} Assinatura e versões ${info('Rascunho, finalizado (assinado com certificado ICP-Brasil, não edita mais) e substituído (quando uma retificação gera versão nova). Só os perfis imagem, médico e Dr. e o administrador assinam.')}</h3><div class="sub">Versão ${L.ver} · ${L.st==='rascunho'?'rascunho':'finalizado e assinado'}${L.hash?' · hash '+L.hash:''}</div>
  <div>${L.hist.slice().reverse().map(h=>`<div class="im-ver"><span class="vn">v${h.v}</span><div><b>${h.st}</b> <span class="badge ${h.st==='Finalizado'?'ok':h.st==='Substituído'?'neutral':'warn'}" style="height:20px">${h.st}</span><small>${esc(h.quem)} · ${h.quando}</small><small>${esc(h.nota)}</small></div></div>`).join('')}</div>
  <div class="row" style="gap:8px;margin-top:10px">${fin?`<button class="btn sec" onclick="imRetificar()">${I.edit} Retificar (nova versão)</button>`:`<button class="btn" ${podeAss?'':'aria-disabled="true"'} onclick="imAssinar()">${IM_IC.sign} Assinar e liberar</button>`}<button class="btn ghost" onclick="imPreview()">${I.print} Pré-visualizar</button></div>
  ${podeAss?'':`<p class="tl" style="margin-top:8px">O perfil ${nomePerfil(PERFIL)} não assina laudo. Assinam: imagem, médico, Dr. e administrador.</p>`}</div>`;
 return `<div class="wrap">${pageHead('Imagem e ultrassom · Laudo de ultrassom','Laudo de ultrassom',`Laudo estruturado por padrão, com medidas, calculadoras RADS e IA de apoio. Dados de exemplo.`,`${rulesBtn('Laudo de ultrassom')}<button class="btn sec" onclick="imViewer('${e.id}')">${IM_IC.img} Imagens</button><button class="btn sec" onclick="imPreview()">${I.print} Pré-visualizar</button>${fin?`<button class="btn" onclick="imRetificar()">Retificar</button>`:`<button class="btn" onclick="imAssinar()">${IM_IC.sign} Assinar e liberar</button>`}`)}
 <div class="im-card"><div class="formgrid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
  <div class="field"><label>Exame ${info('Exames de ultrassom em exame, com imagens ou em laudo. Os liberados aparecem para consulta e retificação.')}</label><select class="in" onchange="IM_LSEL=this.value;reView()">${us.map(x=>`<option value="${x.id}" ${x.id===IM_LSEL?'selected':''}>${x.h} · ${esc(x.pac)} · ${esc(imProc(x.proc).n)} (${IM_ST[x.st].toLowerCase()})</option>`).join('')}</select></div>
  <div class="field"><label>Padrão de laudo ${info('Vem do exame pedido. Trocar o padrão recomeça as seções com as frases normais do novo padrão.')}</label><select class="in" ${dis} onchange="imTrocaPadrao(this.value)">${IM_PADROES.map(x=>`<option value="${x.id}" ${x.id===p.id?'selected':''}>${x.n} · v${x.v}</option>`).join('')}</select></div>
  <div>${kvs([['Paciente',`<b>${esc(e.pac)}</b> · ${e.id_} anos · ${e.sx}`],['Indicação',esc(e.ind||'—')],['Solicitante',esc(e.sol)],['Médico',imQuem(e)],['Prazo',imSla(e)]])}</div></div>
  <div class="row" style="gap:6px;margin-top:10px">${imStBadge(e)}<span class="badge ${L.st==='rascunho'?'warn':'ok'}">${L.st==='rascunho'?'Rascunho':'Finalizado'} · v${L.ver}</span>${e.urg?'<span class="badge err pisca">URGENTE</span>':''}<span class="tl">${e.img} imagens no PACS · padrão ${p.n} v${L.padV}</span></div></div>
 ${fin?`<div class="alert info"><span><b>Laudo finalizado e assinado.</b> Não dá para editar. Para corrigir, use <b>Retificar</b>: gera a versão ${L.ver+1} e a atual fica como substituída, com o motivo.</span></div>`:''}
 <div class="im-ld"><div class="im-col">
  <div class="im-card"><h3>Achados por órgão ${info('Cada seção começa com a frase normal do padrão. Clique numa frase de alterado para acrescentar; as medidas fora da referência ficam marcadas em vermelho.')}</h3><div class="sub">${p.secoes.length} seções · ${p.secoes.reduce((s,x)=>s+x.campos.filter(c=>!c.calc).length,0)} medidas</div><div class="stack">${secs}</div></div>
  ${cal.length?`<div class="im-card"><h3>Calculadoras ${info('As calculadoras do padrão aparecem abertas. A classificação entra sozinha na impressão e gera o recall.')}</h3><div class="sub">${calcs.map(k=>IM_CALCN[k]).join(' · ')}</div><div class="stack">${cal.join('')}</div></div>`:''}
  ${fin||!outras.length?'':`<div class="row" style="gap:6px"><span class="tl">Outras calculadoras:</span>${outras.map(k=>chip((L.extra.includes(k)?'− ':'+ ')+IM_CALCN[k],L.extra.includes(k),`imExtra('${k}')`)).join('')}</div>`}
 </div><div class="im-col">${ia}${recall}${vers}</div></div>
 ${piada('IM2',{todos:'A IA redige o laudo em segundos. O médico leva o mesmo tempo de sempre: agora para tirar os "provavelmente" que ela colocou.',dr:'Dr., a IA sugeriu "correlacionar com a clínica". Ela também está aprendendo.'})}
</div>`};
function imSecNormal(s){const L=imLaudo(IM_LSEL),p=IMP(L.pad);L.sec[s]={modo:'normal',txt:p.secoes.find(x=>x.id===s).normal};reView()}
function imSecFrase(s,i){const L=imLaudo(IM_LSEL),p=IMP(L.pad),sec=p.secoes.find(x=>x.id===s),fr=sec.alts[i],st=L.sec[s];
 st.txt=st.modo==='normal'?fr:(st.txt.trim()+' '+fr).trim();st.modo='alt';reView()}
function imSecTxt(s,v){const L=imLaudo(IM_LSEL),p=IMP(L.pad);L.sec[s].txt=v;L.sec[s].modo=v.trim()===p.secoes.find(x=>x.id===s).normal?'normal':'alt';reView()}
function imVal(k,v){imLaudo(IM_LSEL).val[k]=v;reView()}
function imTxt(k,v){imLaudo(IM_LSEL)[k]=v}
function imRev(v){imLaudo(IM_LSEL).rev=v}
function imNod(){imLaudo(IM_LSEL).calc.tirads.nods.push({loc:'',tam:'',comp:'solido',eco:'iso',forma:'larg',marg:'lisa',focos:[]});const L=imLaudo(IM_LSEL);if(L.sec.nodulos&&L.sec.nodulos.modo==='normal')L.sec.nodulos={modo:'alt',txt:'Nódulos descritos e classificados pelo ACR TI-RADS abaixo.'};reView()}
function imNodDel(i){imLaudo(IM_LSEL).calc.tirads.nods.splice(i,1);reView()}
function imNodSet(i,k,v){imLaudo(IM_LSEL).calc.tirads.nods[i][k]=v;reView()}
function imNodFoco(i,k,on){const n=imLaudo(IM_LSEL).calc.tirads.nods[i];n.focos=(n.focos||[]).filter(f=>f!==k);if(on)n.focos.push(k);reView()}
function imCalcSet(c,k,v){imLaudo(IM_LSEL).calc[c][k]=v;reView()}
function imExtra(k){const L=imLaudo(IM_LSEL);L.extra=L.extra.includes(k)?L.extra.filter(x=>x!==k):[...L.extra,k];reView()}
function imTrocaPadrao(id){const e=IMX(IM_LSEL),L=imLaudo(IM_LSEL),p=IMP(id);modalOk('Trocar o padrão',`<p style="font-size:14px">Trocar para <b>${p.n}</b> recomeça as seções com as frases normais. Medidas e calculadoras com o mesmo nome são mantidas.</p>`,'Trocar',`imTrocaOk('${id}')`,'');reView()}
function imTrocaOk(id){const L=imLaudo(IM_LSEL),p=IMP(id);L.pad=id;L.padV=p.v;L.sec={};p.secoes.forEach(s=>L.sec[s.id]={modo:'normal',txt:s.normal});L.hist.push({v:L.ver,st:'Rascunho',quem:(PROF(IMX(IM_LSEL).laud)||PROF('p2')).n,quando:'hoje '+imHH(IM_AGORA),nota:'padrão trocado para '+p.n});toast('Padrão trocado para '+p.n);reView()}
function imIA(){const L=imLaudo(IM_LSEL),p=IMP(L.pad);L.corpo=imCorpo(L,p);L.imp=imImpressao(L,p);L.ia=true;L.rev=false;
 toast('Rascunho gerado pela IA a partir de '+p.secoes.length+' seções e das calculadoras. Revise antes de assinar','warn');reView()}
function imAssinar(){const e=IMX(IM_LSEL),L=imLaudo(IM_LSEL),p=IMP(L.pad);
 if(!imPode()){toast(`O perfil ${nomePerfil(PERFIL)} não assina laudo. Peça a um médico (perfis imagem, médico ou Dr.)`,'err');return}
 if(L.st!=='rascunho'){toast('Este laudo já está assinado. Para corrigir, use Retificar','warn');return}
 if(!L.imp.trim()){toast('Escreva ou gere a impressão diagnóstica antes de assinar','warn');return}
 if(L.ia&&!L.rev){toast('Marque "Revisei e editei o texto gerado pela IA" antes de assinar','warn');return}
 const coer=imCoerencia(L,p),rec=imRecalls(L,p),m=PROF(e.laud)||PROF('p2');
 openModal(`${mh('Assinar e liberar o laudo')}<div class="mb">
 ${kvs([['Paciente',esc(e.pac)],['Exame',esc(imProc(e.proc).n)],['Versão',`v${L.ver}`],['Assina',`${m.n} · ${m.cons}`],['Certificado','ICP-Brasil em nuvem (BirdID) · válido até 12/2027']])}
 ${coer.length?`<div class="alert warn"><span><b>${coer.length} ponto${coer.length>1?'s':''} de coerência ainda aberto${coer.length>1?'s':''}.</b> Pode assinar, mas confira: ${esc(coer[0])}</span></div>`:''}
 ${rec.length?`<div class="alert info"><span>Ao assinar, ${rec.length} retorno${rec.length>1?'s entram':' entra'} na agenda: ${rec.map(x=>esc(x.tipo)+' '+esc(x.quando)).join('; ')}.</span></div>`:''}
 <p class="tl">A confirmação chega no celular do médico (app BirdID). O PDF assinado vai para o prontuário, o portal do paciente e o lote do convênio.</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="imAssinarOk()">${IM_IC.sign} Enviar para o celular e assinar</button></div>`)}
function imAssinarOk(){const e=IMX(IM_LSEL),L=imLaudo(IM_LSEL),p=IMP(L.pad),m=PROF(e.laud)||PROF('p2');
 L.st='finalizado';L.hash=Math.random().toString(16).slice(2,6)+'·'+Math.random().toString(16).slice(2,6)+'·'+Math.random().toString(16).slice(2,6);
 L.hist.push({v:L.ver,st:'Finalizado',quem:m.n,quando:'hoje '+imHH(IM_AGORA),nota:'assinado com ICP-Brasil (BirdID)'+(L.ia?' · texto com apoio de IA revisado':'')});
 const rec=imRecalls(L,p);rec.forEach(x=>{if(!L.recalls.includes(x.motivo)){L.recalls.push(x.motivo);IM_RECALL.unshift({pac:e.pac,motivo:x.motivo,quando:x.quando,st:'Aguardando agendamento',orig:'Laudo '+e.id})}});
 e.st=5;e.t[5]=imHH(IM_AGORA);e.lib=imHH(IM_AGORA);closeModal();
 toast(`Laudo assinado e liberado${rec.length?'. '+rec.length+' retorno'+(rec.length>1?'s':'')+' na agenda':''}`);reView()}
function imRetificar(){const L=imLaudo(IM_LSEL);if(!imPode()){toast('Só quem assina laudo pode retificar','err');return}
 modalOk('Retificar laudo',`<p style="font-size:14px">A versão ${L.ver} fica como <b>substituída</b> (continua no histórico e no portal com a marca "substituído") e abre a versão ${L.ver+1} em rascunho.</p><div class="field"><label>Motivo <span class="req">*</span></label><textarea class="in" id="imRm" placeholder="Ex.: lado trocado, medida digitada errada"></textarea></div><p class="tl">O paciente e o solicitante são avisados quando a nova versão for assinada.</p>`,'Abrir nova versão',`imRetificarOk(document.getElementById('imRm').value)`)}
function imRetificarOk(mot){if(!mot||!mot.trim()){toast('Escreva o motivo da retificação','warn');setTimeout(imRetificar,50);return}
 const e=IMX(IM_LSEL),L=imLaudo(IM_LSEL);L.hist.forEach(h=>{if(h.v===L.ver&&h.st==='Finalizado')h.st='Substituído'});L.ver++;L.st='rascunho';L.hash=null;L.rev=false;
 L.hist.push({v:L.ver,st:'Rascunho',quem:(PROF(e.laud)||PROF('p2')).n,quando:'hoje '+imHH(IM_AGORA),nota:'retificação: '+mot.trim()});e.st=4;toast(`Versão ${L.ver} aberta em rascunho. A anterior ficou como substituída`);reView()}
function imPreview(){const e=IMX(IM_LSEL),L=imLaudo(IM_LSEL),p=IMP(L.pad),m=PROF(e.laud)||PROF('p2');const corpo=L.corpo||imCorpo(L,p),imp=L.imp||'(impressão ainda não escrita)';
 imModal('Pré-visualização do laudo',`<div class="im-print">
 <div class="lh"><div style="display:flex;gap:12px;align-items:center"><img src="logo-light.png" alt="DeoClinic" style="height:36px"><div><b style="font-size:15px;color:var(--fg-strong)">DeoClinic · Imagem e ultrassom</b><div class="tl">${unidNome(IM_EQ(e.eq).unid)} · Fortaleza-CE · CNES 1234567 · RT Dr. Paulo Henrique Viana CRM-CE 9.873</div></div></div><div style="text-align:right"><b>${esc(e.pac)}</b><div class="tl">${e.id_} anos · ${e.sx} · acesso <span class="mono">${e.id}</span></div><div class="tl">Solicitante ${esc(e.sol)} · ${esc(e.conv)}</div></div></div>
 ${L.st==='rascunho'?'<div class="im-water">RASCUNHO · NÃO VALE COMO LAUDO</div>':''}
 <h4>${esc(imProc(e.proc).n)}</h4>
 <div><b>Indicação clínica:</b> ${esc(e.ind||'—')}</div>
 <div><b>Técnica:</b> exame realizado com transdutor de alta resolução no aparelho ${esc(IM_EQ(e.eq).ap)}.</div>
 <div><b>Achados</b>${corpo.split('\n').map(x=>`<p>${esc(x)}</p>`).join('')}</div>
 <div><b>Impressão diagnóstica</b>${imp.split('\n').map(x=>`<p>${esc(x)}</p>`).join('')}</div>
 <div><b>Imagens-chave</b><div class="im-thumbs" style="margin-top:6px">${[1,2,3,4].map(i=>`<figure>${imUsSvg(i)}<figcaption>Imagem-chave ${i}</figcaption></figure>`).join('')}</div></div>
 <div class="ass"><div><b>${m.n}</b><div class="tl">${m.cons} · ${m.esp}</div><div class="tl">${L.st==='rascunho'?'Ainda não assinado':`Assinado digitalmente (ICP-Brasil) · hash ${L.hash}`} · versão ${L.ver}</div></div><div style="display:flex;gap:10px;align-items:center"><svg viewBox="0 0 40 40" width="56" height="56" aria-label="QR de verificação">${Array.from({length:64},(_,i)=>((i*37)%7<3)?`<rect x="${(i%8)*5}" y="${Math.floor(i/8)*5}" width="5" height="5" fill="currentColor"/>`:'').join('')}</svg><div class="tl">Verifique em<br>deoclinic.com.br/verificar</div></div></div>
 ${L.hist.some(h=>h.st==='Substituído')?`<p class="tl">Este laudo substitui a versão ${L.ver-1}. Motivo: ${esc((L.hist.filter(h=>/retifica/.test(h.nota)).pop()||{nota:'—'}).nota.replace('retificação: ',''))}.</p>`:''}
 </div>`,`<button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="toast('PDF aberto em nova aba${L.st==='rascunho'?' com a marca RASCUNHO':''}')">${I.dl} PDF</button><button class="btn" onclick="toast('Enviado à impressora da recepção, com as imagens-chave')">${I.print} Imprimir</button>`)}

/* ================= Tela 3 · Padrões de laudo (biblioteca) ================= */
let IM_PD_TAB='lista';
const imPdPode=p=>IM_EDITA.includes(PERFIL)&&(PERFIL==='admin'||p.editores.includes(PERFIL==='dr'?'medico':PERFIL));
VIEWS['padroes-laudo']=()=>{
 const rows=IM_PADROES.map(p=>{const nc=p.secoes.reduce((s,x)=>s+x.campos.length,0),nf=p.secoes.reduce((s,x)=>s+x.alts.length+1,0);
  return `<tr style="cursor:pointer" onclick="imPdAbrir('${p.id}')" ${tipAttr(p.n,'Abre o padrão: seções, frases, medidas com referência, calculadoras, quem edita e versões.')}>${td('Padrão',`<div class="two"><b>${p.n}</b><small>${p.autor}</small></div>`)}${td('Exames',`<div class="im-wr">${p.procs.map(c=>`<div class="two">${esc(imProc(c).n)}<small class="mono">TUSS ${c}</small></div>`).join('')||'<span class="tl">—</span>'}</div>`)}${td('Conteúdo',`<div class="two">${p.secoes.length} seções<small>${nf} frases · ${nc} medidas</small></div>`)}${td('Calculadoras',`<div class="im-wr">${p.calcs.length?p.calcs.map(k=>`<span class="badge acc">${IM_CALCN[k]}</span>`).join(''):'<span class="tl">—</span>'}</div>`)}${td('Versão',`<div class="two">v${p.v} <span class="badge ${p.st==='Publicado'?'ok':'warn'}">${p.st}</span><small>${p.atual}</small></div>`)}${td('Quem edita',`<div class="im-wr">${p.editores.map(x=>`<span class="badge neutral">${x}</span>`).join('')}</div>`)}</tr>`});
 const histAll=IM_PADROES.flatMap(p=>p.hist.map(h=>({p,h}))).sort((a,b)=>b.h[1].split('/').reverse().join('').localeCompare(a.h[1].split('/').reverse().join('')));
 return `<div class="wrap">${pageHead('Imagem e ultrassom','Padrões de laudo','Modelos estruturados por exame: seções, frases padrão, medidas com referência, calculadoras e versões. Dados de exemplo.',`${rulesBtn('Padrões de laudo')}<button class="btn sec" onclick="imPdImportar()">${I.dl} Importar</button><button class="btn" onclick="imPdNovo()">${I.plus} Novo padrão</button>`)}
 <div class="mini">${miniKpi('Padrões publicados',IM_PADROES.filter(p=>p.st==='Publicado').length,'em uso nos laudos')}${miniKpi('Frases padrão',IM_PADROES.reduce((s,p)=>s+p.secoes.reduce((t,x)=>t+x.alts.length+1,0),0),'normal e alterado')}${miniKpi('Medidas com referência',IM_PADROES.reduce((s,p)=>s+p.secoes.reduce((t,x)=>t+x.campos.filter(c=>c.ref).length,0),0),'alertam fora da faixa')}${miniKpi('Calculadoras',Object.keys(IM_CALCN).length,'TI-RADS, BI-RADS, O-RADS, LI-RADS, Hadlock')}</div>
 <div class="tabs" role="tablist" style="flex-wrap:wrap;overflow:visible">${[['lista','Padrões',IM_PADROES.length],['hist','Histórico de versões',histAll.length],['calc','Calculadoras',Object.keys(IM_CALCN).length]].map(([k,t,n])=>`<button class="tab ${IM_PD_TAB===k?'active':''}" onclick="IM_PD_TAB='${k}';reView()">${t} <span class="n">${n}</span></button>`).join('')}</div>
 ${IM_PD_TAB==='lista'?`<div class="im-tbl">${tabela(['Padrão','Exames','Conteúdo','Calculadoras','Versão','Quem edita'],rows)}</div>`:''}
 ${IM_PD_TAB==='hist'?'<div class="im-tbl">'+tabela(['Data','Padrão','Versão','Quem','O que mudou'],histAll.map(({p,h})=>`<tr>${td('Data',h[1])}${td('Padrão',p.n)}${td('Versão','v'+h[0])}${td('Quem',esc(h[2]))}${td('O que mudou',esc(h[3]))}</tr>`))+'</div>':''}
 ${IM_PD_TAB==='calc'?`<div class="grid">${[['tirads','ACR TI-RADS 2017','Composição, ecogenicidade, forma, margem e focos ecogênicos somam pontos: TR1 a TR5. PAAF e seguimento pelo maior eixo (TR3: PAAF ≥ 2,5 cm, seguimento ≥ 1,5; TR4: 1,5 e 1,0; TR5: 1,0 e 0,5).'],['birads','ACR BI-RADS US 5ª ed.','Léxico de massas (forma, orientação, margem, eco, posterior, calcificações, associados) e casos especiais. Sugere 1 a 5 (com 4A, 4B, 4C); 0 e 6 marcados pelo médico.'],['orads','O-RADS US v2022','Tipo de lesão, tamanho, parede, sólido, escore de cor 1 a 4 e ascite: O-RADS 0 a 5, com a conduta de cada um.'],['lirads','LI-RADS US Surveillance v2024','Só para risco de CHC: US-1, US-2 (menor que 10 mm) ou US-3 (≥ 10 mm ou trombo), com visualização A, B ou C.'],['obst','Biometria fetal (Hadlock)','IG por DBP, CC, CA e CF e composta; peso fetal estimado com 4 parâmetros; percentil pela curva de Hadlock 1991.']].map(([k,t,d])=>`<div class="card"><h3>${t}</h3><div class="sub">Usada em: ${IM_PADROES.filter(p=>p.calcs.includes(k)).map(p=>p.n).join(', ')||'nenhum padrão (pode ser aberta no laudo)'}</div><p style="font-size:14px">${d}</p></div>`).join('')}</div>`:''}
 <div class="alert info"><span>Os padrões seguem a ideia dos modelos RSNA RadReport (seções e termos padronizados). Importe modelos antigos do RISWEB ou de outro DeoClinic e eles viram padrões em rascunho para revisar.</span></div>
 ${piada('IM3',{todos:'Padrão de laudo bom é como uniforme: todo mundo reclama no primeiro dia e ninguém quer voltar a escrever do zero.'})}
</div>`};
function imPdAbrir(id){const p=IMP(id),pode=imPdPode(p);
 openDrawer(`${p.n} <span class="tl">v${p.v}</span>`,`${kvs([['Exames',p.procs.map(c=>esc(imProc(c).n)+' · TUSS '+c).join('<br>')],['Autor',esc(p.autor)],['Atualizado',p.atual],['Situação',`<span class="badge ${p.st==='Publicado'?'ok':'warn'}">${p.st}</span>`],['Quem edita',`${p.editores.map(x=>`<span class="badge neutral" style="margin:2px">${x}</span>`).join('')} ${info('Perfis que podem mudar este padrão. Mudança publicada vira versão nova; laudos já assinados continuam com a versão que usaram.')}`],['Impressão normal',esc(p.impNormal)]])}
 ${pode?'':`<div class="alert warn"><span>O perfil ${nomePerfil(PERFIL)} só consulta este padrão. Quem edita: ${p.editores.join(', ')}.</span></div>`}
 <div><b style="font-size:14px">Calculadoras do padrão</b><div class="row" style="gap:6px;margin-top:6px">${Object.keys(IM_CALCN).map(k=>chip(IM_CALCN[k],p.calcs.includes(k),pode?`imPdCalc('${id}','${k}')`:`toast('Sem permissão para editar este padrão','warn')`)).join('')}</div></div>
 <div><b style="font-size:14px">Seções, frases e medidas</b> ${info('Verde: frase normal (entra pronta). Laranja: frases de alterado, que o médico clica para acrescentar. As faixas de referência marcam a medida fora do normal no laudo.')}</div>
 ${p.secoes.map((s,si)=>`<div class="im-pd-sec"><div class="row" style="justify-content:space-between"><b>${si+1}. ${s.t}</b>${pode?`<button class="btn sm ghost" onclick="imPdFrase('${id}','${s.id}')">${I.plus} Frase</button>`:''}</div>
  <div class="fr n">${esc(s.normal)}</div>${s.alts.map(a=>`<div class="fr a">${esc(a)}</div>`).join('')}
  ${s.campos.length?`<div class="im-pd-meas"><span class="tl">Medida</span><span class="tl">Mín.</span><span class="tl">Máx.</span><span class="tl">Un.</span>${s.campos.map(c=>`<span>${c.l}${c.calc?' <span class="tl">(calculada)</span>':''}</span><input class="in" ${pode?'':'disabled'} value="${c.min??''}" onchange="imPdRef('${id}','${c.k}','min',this.value)" aria-label="Mínimo de ${c.l}"><input class="in" ${pode?'':'disabled'} value="${c.max??''}" onchange="imPdRef('${id}','${c.k}','max',this.value)" aria-label="Máximo de ${c.l}"><span class="tl">${c.u}</span>`).join('')}</div>`:''}</div>`).join('')}
 <div><b style="font-size:14px">Versões</b>${p.hist.map(h=>`<div class="im-ver"><span class="vn">v${h[0]}</span><div>${esc(h[3])}<small>${h[1]} · ${esc(h[2])}</small></div></div>`).join('')}</div>
 <div class="row" style="gap:8px">${pode?`<button class="btn" onclick="imPdPublicar('${id}')">Publicar nova versão</button>`:''}<button class="btn sec" onclick="imPdExportar('${id}')">${I.dl} Exportar</button><button class="btn ghost" onclick="imPdDuplicar('${id}')">Duplicar</button><button class="btn ghost" onclick="imPdUsar('${id}')">Ver num laudo</button></div>`);
 $('#drawer').classList.add('largo')}
function imPdCalc(id,k){const p=IMP(id);p.calcs=p.calcs.includes(k)?p.calcs.filter(x=>x!==k):[...p.calcs,k];p.st='Alterado (não publicado)';toast(`${IM_CALCN[k]} ${p.calcs.includes(k)?'incluída no':'retirada do'} padrão. Publique a versão para valer nos laudos novos`);reView();imPdAbrir(id)}
function imPdRef(id,k,lado,v){const p=IMP(id),c=p.secoes.flatMap(s=>s.campos).find(x=>x.k===k);const n=imN(v);if(n==null)delete c[lado];else c[lado]=n;
 c.ref=c.min!=null&&c.max!=null?`${imF(c.min,c.min%1?1:0)} a ${imF(c.max,c.max%1?1:0)} ${c.u}`:c.max!=null?`até ${imF(c.max,c.max%1?1:0)} ${c.u}`:c.min!=null?`a partir de ${imF(c.min,c.min%1?1:0)} ${c.u}`:'';
 p.st='Alterado (não publicado)';toast('Referência de '+c.l.toLowerCase()+' atualizada: '+(c.ref||'sem faixa'));reView()}
function imPdFrase(id,sid){const p=IMP(id),s=p.secoes.find(x=>x.id===sid);modalOk('Nova frase de alterado · '+s.t,`<div class="field"><label>Frase</label><textarea class="in" id="imPf" placeholder="Use ___ para o que o médico completa (medida, lado)"></textarea></div>`,'Incluir',`imPdFraseOk('${id}','${sid}',document.getElementById('imPf').value)`)}
function imPdFraseOk(id,sid,v){if(!v||!v.trim()){toast('Escreva a frase','warn');return}const p=IMP(id);p.secoes.find(x=>x.id===sid).alts.push(v.trim());p.st='Alterado (não publicado)';toast('Frase incluída. Publique a versão para aparecer nos laudos');reView();imPdAbrir(id)}
function imPdPublicar(id){const p=IMP(id);const nv=(()=>{const [a,b]=p.v.split('.').map(Number);return a+'.'+(b+1)})();
 modalOk('Publicar nova versão',`<p style="font-size:14px">${p.n}: v${p.v} → <b>v${nv}</b>. Laudos em rascunho passam a usar a nova versão; laudos assinados continuam com a versão em que foram feitos.</p><div class="field"><label>O que mudou <span class="req">*</span></label><input class="in" id="imPv" placeholder="Ex.: nova frase de esteatose"></div>`,'Publicar',`imPdPublicarOk('${id}','${nv}',document.getElementById('imPv').value)`)}
function imPdPublicarOk(id,nv,nota){if(!nota||!nota.trim()){toast('Diga o que mudou: fica no histórico de versões','warn');return}const p=IMP(id);p.v=nv;p.st='Publicado';p.atual='04/11/2026';p.hist.unshift([nv,'04/11/2026',PERFIL==='admin'?'Jânio Costa Cavalcante':nomePerfil(PERFIL),nota.trim()]);toast(`${p.n} v${nv} publicado`);reView();imPdAbrir(id)}
function imPdExportar(id){const p=IMP(id);const j=JSON.stringify({formato:'deoclinic.padrao-laudo/1',id:p.id,nome:p.n,versao:p.v,tuss:p.procs,calculadoras:p.calcs,impressaoNormal:p.impNormal,secoes:p.secoes.map(s=>({id:s.id,titulo:s.t,normal:s.normal,alterado:s.alts,medidas:s.campos.map(c=>({chave:c.k,rotulo:c.l,unidade:c.u,min:c.min,max:c.max,calculo:c.calc}))}))},null,2);
 imModal('Exportar padrão',`<p style="font-size:14px">${p.n} v${p.v} em JSON (formato DeoClinic). Serve para levar a outra unidade ou guardar cópia.</p><textarea class="in im-json" readonly>${esc(j)}</textarea>`,`<button class="btn ghost" onclick="closeModal()">Fechar</button><button class="btn sec" onclick="toast('Exportação em RSNA RadReport (XML) gerada')">RadReport XML</button><button class="btn" onclick="toast('Arquivo padrao-${p.id}-v${p.v}.json baixado')">${I.dl} Baixar JSON</button>`)}
function imPdDuplicar(id){const p=IMP(id);const c=JSON.parse(JSON.stringify(p));c.id=p.id+'-'+(IM_PADROES.length+1);c.n=p.n+' (cópia)';c.v='0.1';c.st='Rascunho';c.atual='04/11/2026';c.hist=[['0.1','04/11/2026',nomePerfil(PERFIL),'Cópia de '+p.n+' v'+p.v]];IM_PADROES.push(c);toast('Cópia criada em rascunho: '+c.n);reView();imPdAbrir(c.id)}
function imPdUsar(id){const p=IMP(id);const e=IM_EX.find(x=>x.pad===id&&imEhUS(x)&&x.st>=2);if(!e){toast('Nenhum exame de hoje usa este padrão. Abra pelo laudo e troque o padrão','warn');return}IM_LSEL=e.id;closeDrawer();location.hash='laudo-us'}
function imPdNovo(){if(!IM_EDITA.includes(PERFIL)){toast(`O perfil ${nomePerfil(PERFIL)} não cria padrão de laudo`,'err');return}
 openModal(`${mh('Novo padrão de laudo')}<div class="mb"><div class="formgrid"><div class="field"><label>Nome <span class="req">*</span></label><input class="in" id="imNn" placeholder="Ex.: US de bolsa escrotal"></div>
 <div class="field"><label>Começar de</label><select class="in" id="imNb"><option value="">Em branco</option>${IM_PADROES.map(p=>`<option value="${p.id}">Cópia de ${p.n}</option>`).join('')}</select></div></div>
 <div class="field"><label>Seções (uma por linha)</label><textarea class="in" id="imNs" placeholder="Testículo direito&#10;Testículo esquerdo&#10;Epidídimos"></textarea></div>
 <div class="row" style="gap:6px"><span class="tl">Calculadoras:</span>${Object.keys(IM_CALCN).map(k=>`<label class="check" style="font-size:13px"><input type="checkbox" value="${k}" class="imNcalc"> ${IM_CALCN[k]}</label>`).join('')}</div>
 <p class="tl">Nasce em rascunho, editável pelos perfis imagem e administrador. Só aparece nos laudos depois de publicado.</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="imPdNovoOk()">Criar padrão</button></div>`)}
function imPdNovoOk(){const n=$('#imNn').value.trim();if(!n){toast('Dê um nome ao padrão','warn');return}const base=$('#imNb').value;const calcs=[...document.querySelectorAll('.imNcalc:checked')].map(x=>x.value);
 let p;if(base){p=JSON.parse(JSON.stringify(IMP(base)))}else p={procs:[],impNormal:'Exame sem alterações.',secoes:[]};
 const linhas=$('#imNs').value.split('\n').map(x=>x.trim()).filter(Boolean);if(linhas.length)p.secoes=linhas.map((t,i)=>({id:'s'+i,t,campos:[],normal:`${t} sem alterações.`,alts:[]}));
 Object.assign(p,{id:'pd'+Date.now().toString(36),n,v:'0.1',st:'Rascunho',atual:'04/11/2026',autor:PERFIL==='admin'?'Jânio Costa Cavalcante':nomePerfil(PERFIL),editores:['imagem','admin'],calcs:calcs.length?calcs:(p.calcs||[]),hist:[['0.1','04/11/2026',nomePerfil(PERFIL),'Criado']]});
 IM_PADROES.push(p);closeModal();toast('Padrão criado em rascunho: '+n);reView();imPdAbrir(p.id)}
function imPdImportar(){openModal(`${mh('Importar padrões')}<div class="mb"><div class="field"><label>Origem</label><select class="in" id="imIo"><option value="json">Arquivo JSON do DeoClinic (outra unidade)</option><option value="rsna">RSNA RadReport (XML)</option><option value="risweb">Modelos de texto do RISWEB (sistema atual)</option></select></div>
 <div class="field"><label>Arquivo</label><input class="in" type="file" accept=".json,.xml,.txt,.html" style="padding-top:8px"></div>
 <p class="tl">Cada modelo importado vira um padrão em rascunho: o sistema separa as seções pelos títulos e marca as medidas que encontrar ("___ cm"). Você revisa e publica.</p></div>
 <div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="imPdImportarOk()">Importar</button></div>`)}
function imPdImportarOk(){const o=$('#imIo').value;const nome={json:'US de bolsa escrotal (importado)',rsna:'US de carótidas e vertebrais (RadReport)',risweb:'US de articulação do ombro (RISWEB)'}[o];
 const secs={json:['Testículo direito','Testículo esquerdo','Epidídimos','Cordão espermático'],rsna:['Carótida comum','Bulbo e carótida interna','Carótida externa','Vertebrais'],risweb:['Tendão supraespinal','Tendão infraespinal','Tendão subescapular','Cabo longo do bíceps','Bursa subacromial']}[o];
 IM_PADROES.push({id:'imp'+Date.now().toString(36),n:nome,procs:[],calcs:[],v:'0.1',atual:'04/11/2026',autor:'Importação',editores:['imagem','admin'],st:'Rascunho',impNormal:'Exame sem alterações.',secoes:secs.map((t,i)=>({id:'s'+i,t,campos:[],normal:`${t} de aspecto normal.`,alts:[]})),hist:[['0.1','04/11/2026','Importação',`Importado de ${o==='json'?'JSON DeoClinic':o==='rsna'?'RSNA RadReport':'RISWEB'}`]]});
 closeModal();toast(`1 padrão importado em rascunho: ${nome}. Revise e publique`);IM_PD_TAB='lista';reView()}

/* ---------- Regras e guias ---------- */
REGRAS['Exames de imagem']={aba:'Imagem e ultrassom',itens:[
 ['IM01 – Worklist DICOM','O exame agendado vai para a worklist (MWL) do aparelho certo; o técnico não digita nome de paciente no console. Aparelho em manutenção não recebe chegada: remarque ou troque.'],
 ['IM02 – Etapas fixas','Agendado → chegou → em exame → imagens recebidas → em laudo → laudo liberado → entregue. Cada passo grava a hora e quem fez.'],
 ['IM03 – Prazo do laudo (SLA)','Urgência: 1 h. Ultrassom eletivo: 2 h depois da chegada. RX e mamografia no telelaudo: o prazo do parceiro (4 a 6 h). Faltando 30 min, o exame fica em laranja; vencido, em vermelho e vira aviso para o gestor.'],
 ['IM04 – Urgência na frente','Exame urgente fica no topo da lista, piscando, para quem lauda e para o técnico.'],
 ['IM05 – Telelaudo','RX, mamografia e TC vão para MaisLaudo ou Mobilemed com o estudo, a indicação e o pedido. O laudo assinado pelo parceiro volta sozinho e libera o exame.'],
 ['IM06 – Convênio com guia','Exame de convênio só inicia com a guia autorizada; isso evita a glosa mais comum.'],
 ['IM07 – Entrega','Só exame com laudo liberado é entregue: portal (laudo + imagens), WhatsApp com link seguro de 30 dias, ou impresso. O solicitante pode ser avisado.'],
 ['IM08 – Produtividade','Laudos por médico, TAT (imagens → laudo) e % no prazo saem dos registros das etapas e alimentam o repasse por exame.']]};
REGRAS['Laudo de ultrassom']={aba:'Imagem e ultrassom',itens:[
 ['LU01 – Laudo estruturado','O laudo nasce do padrão do exame: frase normal em cada seção, frases de alterado por clique e medidas com faixa de referência. Medida fora da faixa fica marcada.'],
 ['LU02 – Calculadoras','TI-RADS (ACR 2017), BI-RADS US (5ª ed.), O-RADS US (v2022), LI-RADS US (v2024) e biometria de Hadlock seguem a lógica publicada. No BI-RADS o sistema sugere; a categoria final é do médico.'],
 ['LU03 – IA de apoio','A IA redige impressão e texto a partir dos campos e aponta incoerências. O texto sai marcado "rascunho gerado por IA" e só assina quem marcar que revisou.'],
 ['LU04 – Recall pela categoria','TI-RADS com tamanho de PAAF ou seguimento, BI-RADS 0/3/4/5, O-RADS 3 a 5, LI-RADS e peso fetal fora dos percentis 10 a 90 geram retorno na agenda ao assinar, com lembrete ao paciente.'],
 ['LU05 – Quem assina','Só os perfis imagem, médico, Dr. e administrador assinam, com certificado ICP-Brasil (BirdID). Sem impressão diagnóstica não assina.'],
 ['LU06 – Versões','Rascunho → finalizado (não edita) → substituído. Corrigir laudo assinado é sempre retificação com motivo, gerando versão nova; a antiga fica no histórico.'],
 ['LU07 – Impressão','Cabeçalho DeoClinic com unidade, CNES e RT; imagens-chave; assinatura com hash e QR de verificação. Rascunho sai com a marca "não vale como laudo".']]};
REGRAS['Padrões de laudo']={aba:'Imagem e ultrassom',itens:[
 ['PL01 – Um padrão por exame','Cada padrão liga-se a um ou mais códigos TUSS e traz seções, frases normal e alterado, medidas com referência e as calculadoras que se aplicam.'],
 ['PL02 – Quem edita','Cada padrão lista os perfis que podem editar. Os demais só consultam.'],
 ['PL03 – Versões','Mudança fica "não publicada" até publicar, com o que mudou. Laudos assinados guardam a versão do padrão que usaram.'],
 ['PL04 – Importar e exportar','Importa JSON de outra unidade, RSNA RadReport (XML) ou os modelos de texto do RISWEB; tudo entra como rascunho para revisão. Exporta em JSON ou RadReport.'],
 ['PL05 – Faixas de referência','Mín. e máx. por medida; o laudo marca acima ou abaixo e a IA leva para a impressão.']]};
GUIDES['imagem-worklist']=['Veja a fila do dia por aparelho: clique num cartão de aparelho ou numa etapa para filtrar.','Clique no exame para abrir a ficha: etapas com horário, prazo do laudo, telelaudo e entrega.','Use Laudar (ultrassom) ou Telelaudo (RX e mamografia); Imagens abre o visualizador.','Com o laudo liberado, use Entregar: portal, WhatsApp ou impresso.','Embaixo: produtividade dos médicos, glosas de imagem e recalls gerados pelos laudos.'];
GUIDES['laudo-us']=['Escolha o exame; o padrão vem do exame pedido.','Em cada órgão, mantenha a frase normal ou clique nas frases de alterado; digite as medidas e veja se estão na faixa.','Preencha a calculadora do padrão (TI-RADS, BI-RADS, O-RADS, LI-RADS ou biometria): a categoria e a conduta aparecem na hora.','Clique em Gerar rascunho do laudo: a IA escreve a impressão e o texto. Revise, edite e marque que revisou.','Assine e libere: o recall da categoria entra na agenda. Para corrigir depois, use Retificar.'];
GUIDES['padroes-laudo']=['Clique num padrão para ver seções, frases, medidas e calculadoras.','Se o seu perfil edita o padrão, inclua frases, mude as faixas de referência ou as calculadoras.','Publique a nova versão dizendo o que mudou; laudos assinados continuam com a versão antiga.','Use Importar para trazer modelos do RISWEB ou do RadReport, e Exportar para levar a outra unidade.'];
