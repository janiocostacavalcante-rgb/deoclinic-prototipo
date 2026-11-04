/* ---------- DeoClinic · dados de exemplo comuns aos módulos novos (04/11) ----------
   Um só cadastro de pacientes (PACIENTES, do núcleo), unidades (UNIDS) e convênios (CONVENIOS) servem a todos os módulos.
   Aqui ficam só os dados da clínica: profissionais, procedimentos com TUSS, salas e a agenda de hoje. */
const PROFISSIONAIS=[
 {id:'p1',n:'Dra. Camila Rocha',ini:'CR',cons:'CRM-CE 14.512',esp:'Clínica médica',unids:[10,14],cor:'#23756D',repasse:'60% particular · 70% convênio',ativo:true},
 {id:'p2',n:'Dr. Paulo Henrique Viana',ini:'PV',cons:'CRM-CE 9.873',esp:'Radiologia e ultrassonografia',unids:[10],cor:'#3B82F6',repasse:'R$ 45 por exame',ativo:true},
 {id:'p3',n:'Dra. Renata Albuquerque',ini:'RA',cons:'CRM-CE 17.204',esp:'Ginecologia e obstetrícia',unids:[10,12],cor:'#C96F1B',repasse:'55% particular · 65% convênio',ativo:true},
 {id:'p4',n:'Dr. Igor Menezes',ini:'IM',cons:'CRM-CE 20.118',esp:'Cardiologia',unids:[10],cor:'#8E44AD',repasse:'60% particular',ativo:true},
 {id:'p5',n:'Dra. Helena Brito',ini:'HB',cons:'CRBM 1ª 12345',esp:'Análises clínicas (responsável técnica)',unids:[10,12,14],cor:'#18A403',repasse:'salário',ativo:true},
 {id:'p6',n:'Enf. Tatiane Lopes',ini:'TL',cons:'COREN-CE 334.120',esp:'Enfermagem (triagem)',unids:[10],cor:'#607D8B',repasse:'salário',ativo:true},
];
const PROF=id=>PROFISSIONAIS.find(p=>p.id===id);
/* Procedimentos: tipo consulta, imagem, laboratório (os exames de lab continuam em EXAMES/EX) ou procedimento. Preço particular e custo direto (insumos do estoque + repasse). */
const PROCEDIMENTOS=[
 {c:'10101012',n:'Consulta em consultório',tipo:'Consulta',dur:20,preco:180,custo:72,sala:'Consultório'},
 {c:'10101039',n:'Consulta de retorno',tipo:'Consulta',dur:15,preco:0,custo:0,sala:'Consultório'},
 {c:'40901122',n:'US abdome total',tipo:'Imagem',dur:30,preco:220,custo:88,sala:'Ultrassom',prep:'Jejum de 8 horas e bexiga cheia'},
 {c:'40901300',n:'US tireoide',tipo:'Imagem',dur:20,preco:160,custo:62,sala:'Ultrassom',prep:'Sem preparo'},
 {c:'40901467',n:'US transvaginal',tipo:'Imagem',dur:20,preco:180,custo:66,sala:'Ultrassom',prep:'Bexiga vazia'},
 {c:'40901483',n:'US mamas',tipo:'Imagem',dur:20,preco:170,custo:64,sala:'Ultrassom',prep:'Sem preparo'},
 {c:'40901530',n:'US obstétrica',tipo:'Imagem',dur:30,preco:200,custo:70,sala:'Ultrassom',prep:'Bexiga cheia até 12 semanas'},
 {c:'40101010',n:'Eletrocardiograma',tipo:'Procedimento',dur:15,preco:90,custo:28,sala:'Procedimentos',prep:'Sem preparo'},
 {c:'20104090',n:'Aplicação de medicação injetável',tipo:'Procedimento',dur:10,preco:35,custo:14,sala:'Procedimentos'},
];
const PROC=c=>PROCEDIMENTOS.find(p=>p.c===c);
const SALAS=[
 {id:'s1',n:'Consultório 1',tipo:'Consultório',unid:10},{id:'s2',n:'Consultório 2',tipo:'Consultório',unid:10},
 {id:'s3',n:'Sala de ultrassom',tipo:'Ultrassom',unid:10,equip:'GE Logiq P9 (DICOM)'},
 {id:'s4',n:'Sala de procedimentos',tipo:'Procedimentos',unid:10,equip:'Eletrocardiógrafo'},
 {id:'s5',n:'Sala de coleta',tipo:'Coleta',unid:10},{id:'s6',n:'Triagem',tipo:'Triagem',unid:10},
];
/* Agenda de hoje da clínica (o laboratório continua com a sua). sit: agendado, chegou, triagem, em atendimento, finalizado, faltou */
const AG_CLIN=[
 {h:'07:40',pac:'Ana Souza',proc:'40901122',prof:'p2',sit:'finalizado',conv:'Particular',pago:true},
 {h:'08:00',pac:'José Carlos Lima',proc:'10101012',prof:'p4',sit:'em atendimento',conv:'Unimed',pago:true,guia:true},
 {h:'08:20',pac:'Maria Helena Souza',proc:'10101012',prof:'p1',sit:'triagem',conv:'Particular',pago:true},
 {h:'08:30',pac:'Larissa Monteiro',proc:'40901467',prof:'p2',sit:'chegou',conv:'Hapvida',pago:false,guia:true},
 {h:'08:40',pac:'Francisco das Chagas',proc:'10101012',prof:'p1',sit:'chegou',conv:'Particular',pago:false},
 {h:'09:00',pac:'Joana Darc Pereira',proc:'40901530',prof:'p3',sit:'agendado',conv:'Particular',pago:false},
 {h:'09:20',pac:'Raimundo Nonato Silva',proc:'40101010',prof:'p4',sit:'agendado',conv:'Unimed',pago:false},
 {h:'09:30',pac:'Rita de Cássia Lins',proc:'40901300',prof:'p2',sit:'agendado',conv:'Particular',pago:false},
 {h:'10:00',pac:'Luana Ferreira Castro',proc:'10101012',prof:'p3',sit:'faltou',conv:'Particular',pago:false},
];

/* ---------- 04/11 · Núcleo da clínica: o que liga clínica, laboratório, imagem, financeiro e estoque ----------
   Prefixo CL_ para não colidir com os módulos novos. Tudo de exemplo. */
PROCEDIMENTOS.push(
 {c:'30101921',n:'Exérese de lesão de pele (pequena cirurgia)',tipo:'Procedimento',dur:40,preco:450,custo:168,sala:'Procedimentos',prep:'Sem jejum; suspender AAS 7 dias antes, com orientação médica'},
 {c:'20104138',n:'Curativo simples',tipo:'Procedimento',dur:15,preco:60,custo:19,sala:'Procedimentos'}
);
/* Os procedimentos da clínica entram no mesmo catálogo de itens do atendimento (EX), ao lado dos exames de laboratório:
   assim Novo atendimento, Orçamentos e Caixa aceitam consulta, ultrassom e procedimento sem fluxo separado. Lab continua em EXAMES. */
PROCEDIMENTOS.forEach(p=>{if(EX[p.c])return;const j=/jejum de (\d+)/i.exec(p.prep||'');EX[p.c]={c:p.c,n:p.n,s:(p.tipo+' '+p.n+' '+p.c).toLowerCase(),m:'',p:p.preco,d:0,j:j?+j[1]:0,u:0,k:p.custo,proc:p.tipo,prep:p.prep||'Sem preparo',dur:p.dur}});
const CL_TIPOS={Consulta:['Consulta','c-teal'],Imagem:['Ultrassom e imagem','c-blue'],Procedimento:['Procedimento','c-purple'],Coleta:['Coleta de laboratório','c-green'],Domiciliar:['Coleta domiciliar','c-orange']};
const clTipoDe=c=>EX[c]&&EX[c].proc?EX[c].proc:(c==='DOM'?'Domiciliar':'Coleta');
/* Preço por tabela (particular é o do cadastro; convênios com fator de exemplo; consulta de convênio tem valor fechado) */
const CL_TABS=['Particular','Unimed Fortaleza','Hapvida','Bradesco Saúde','Camed'];
const CL_FATOR={'Particular':1,'Unimed Fortaleza':.86,'Hapvida':.68,'Bradesco Saúde':.92,'Camed':.8};
function clPreco(c,tab){const p=PROC(c);if(!p)return 0;if(tab==='Particular'||!tab)return p.preco;if(p.tipo==='Consulta'&&p.preco)return {'Unimed Fortaleza':110,'Hapvida':78,'Bradesco Saúde':125,'Camed':96}[tab]||p.preco;return Math.round(p.preco*(CL_FATOR[tab]||1))}
/* Kit de insumos do estoque consumido por procedimento (códigos e nomes do estoque da DeoVita; custo por unidade). Baixa sozinha ao finalizar. */
const CL_KIT={
 '10101012':[['01619','Abaixador de língua adulto',1,'un',.07],['01581','Lençol de papel descartável',0.5,'m',.2],['01576','Luva de procedimento M',2,'un',.19],['03998','Álcool em gel 440 g',0.01,'un',10]],
 '40901122':[['01542','Gel para ultrassom (bag 5 kg)',0.02,'bag',33.94],['01581','Lençol de papel descartável',1,'m',.2],['01576','Luva de procedimento M',2,'un',.19]],
 '40901300':[['01542','Gel para ultrassom (bag 5 kg)',0.01,'bag',33.94],['01581','Lençol de papel descartável',0.5,'m',.2]],
 '40901467':[['01542','Gel para ultrassom (bag 5 kg)',0.01,'bag',33.94],['01576','Luva de procedimento M',2,'un',.19],['01888','Lidocaína geleia 2% 30 g',0.1,'bisnaga',3],['01581','Lençol de papel descartável',1,'m',.2]],
 '40901483':[['01542','Gel para ultrassom (bag 5 kg)',0.015,'bag',33.94],['01581','Lençol de papel descartável',1,'m',.2]],
 '40901530':[['01542','Gel para ultrassom (bag 5 kg)',0.02,'bag',33.94],['01581','Lençol de papel descartável',1,'m',.2]],
 '40101010':[['03738','Eletrodo para monitoração cardíaca MP-43',10,'un',.032],['04176','Gel ECG 100 g',0.05,'un',4.02],['01581','Lençol de papel descartável',1,'m',.2]],
 '20104090':[['01769','Agulha hipodérmica 24G × 3/4',1,'un',.15],['01557','Agulha hipodérmica 21G × 1',1,'un',.09],['01512','Álcool 70% 1 L',0.01,'un',8.23],['01985','Algodão hidrófilo 500 g',0.005,'pct',19.5],['01576','Luva de procedimento M',2,'un',.19]],
 '30101921':[['01890','Luva cirúrgica estéril nº 7,0',2,'par',1.94],['03491','Gaze estéril 11 fios 7,5 × 7,5',5,'un',.89],['02077','Fio de sutura nylon 3.0',1,'un',3.2],['02318','Clorexidina 2% aquosa 100 ml',0.2,'un',7.86],['03772','Esparadrapo microporoso 10 cm',0.1,'rolo',7.1],['01769','Agulha hipodérmica 24G × 3/4',1,'un',.15]],
 '20104138':[['03491','Gaze estéril 11 fios 7,5 × 7,5',4,'un',.89],['02318','Clorexidina 2% aquosa 100 ml',0.1,'un',7.86],['03772','Esparadrapo microporoso 10 cm',0.05,'rolo',7.1],['01576','Luva de procedimento M',2,'un',.19]],
};
const clKitCusto=c=>(CL_KIT[c]||[]).reduce((s,x)=>s+x[2]*x[4],0);
/* Mais salas: centro cirúrgico e internação (primeira versão do módulo Hospital) */
SALAS.push({id:'s7',n:'Sala cirúrgica 1',tipo:'Centro cirúrgico',unid:10,equip:'Foco cirúrgico, bisturi elétrico, monitor multiparâmetro'},{id:'s8',n:'Recuperação pós-anestésica',tipo:'Centro cirúrgico',unid:10,equip:'2 leitos monitorados'},{id:'s9',n:'Box de coleta 2',tipo:'Coleta',unid:10},{id:'s10',n:'Consultório 1 · Posto 14',tipo:'Consultório',unid:14});
/* Equipamentos por sala (manutenção e calibração entram como bloqueio da agenda da sala) */
const CL_EQUIP=[
 {n:'Ultrassom GE Logiq P9',sala:'s3',serie:'LP9-22871',dicom:true,manut:'12/01/2027',sit:'ok'},
 {n:'Eletrocardiógrafo Bionet CardioCare',sala:'s4',serie:'CC-3341',dicom:false,manut:'20/11/2026',sit:'warn'},
 {n:'Monitor multiparâmetro Mindray',sala:'s7',serie:'MD-90122',dicom:false,manut:'05/03/2027',sit:'ok'},
 {n:'Autoclave Cristófoli 21 L',sala:'s4',serie:'AC-1188',dicom:false,manut:'vencida 28/10',sit:'err'},
 {n:'Balança antropométrica Welmy',sala:'s6',serie:'WL-5521',dicom:false,manut:'10/02/2027',sit:'ok'},
];
/* Agenda multi-recurso de hoje: a clínica (AG_CLIN) + coleta do laboratório + domiciliar, num formato só. */
const CL_AG_EXTRA=[
 {h:'07:00',pac:'Larissa Monteiro',itens:['HEMO','GLI','TSH'],sala:'s5',tipo:'Coleta',sit:'finalizado',conv:'Hapvida',pago:true,guia:true,jornada:'J-0091'},
 {h:'07:20',pac:'Raimundo Nonato Silva',itens:['HEMO','CREA','GLI'],sala:'s5',tipo:'Coleta',sit:'finalizado',conv:'Unimed',pago:true,guia:true},
 {h:'07:40',pac:'Maria Helena Souza',itens:['HBA1C','GLI'],sala:'s9',tipo:'Coleta',sit:'finalizado',conv:'Particular',pago:true,jornada:'J-0092'},
 {h:'08:00',pac:'Joana Darc Pereira',itens:['HEMO','BHCG'],sala:'s5',tipo:'Coleta',sit:'agendado',conv:'Particular',pago:false,jornada:'J-0093'},
 {h:'07:00',pac:'Cícero Romão',itens:['DOM','HEMO','CREA'],sala:'dom',tipo:'Domiciliar',sit:'em atendimento',conv:'Particular',pago:true,end:'Rua das Flores, 120 · Aldeota'},
 {h:'09:00',pac:'Dona Zefa Lima',itens:['DOM','GLI'],sala:'dom',tipo:'Domiciliar',sit:'agendado',conv:'Particular',pago:true,end:'Av. Senador Virgílio Távora, 400'},
 {h:'09:40',pac:'Pedro Henrique Alves',itens:['20104090'],prof:'p6',sala:'s4',tipo:'Procedimento',sit:'agendado',conv:'Particular',pago:false},
 {h:'10:30',pac:'Ana Souza',itens:['10101039'],prof:'p1',sala:'s1',tipo:'Consulta',sit:'agendado',conv:'Particular',pago:true,jornada:'J-0090',obs:'retorno com resultados de lab e US'},
 {h:'10:40',pac:'Sebastião Gomes',itens:['30101921'],prof:'p3',sala:'s7',tipo:'Procedimento',sit:'agendado',conv:'Particular',pago:true,guia:true},
];
/* Pacientes de outros módulos que ainda não estão no cadastro de exemplo: entram no cadastro único (um CPF, uma ficha). */
[['321.654.987-01','Marcos Vinícius Rocha','1979-08-03','M','Lúcia Rocha','(85) 99702-4410'],['777.888.999-00','Sebastião Gomes','1965-06-30','M','Maria Gomes','(85) 98444-3322'],['666.777.888-99','Francisca Oliveira','1970-02-14','F','Ana Oliveira','(85) 99876-5544'],['135.246.357-48','Larissa Monteiro','1994-05-19','F','Célia Monteiro','(85) 98111-7788'],['246.357.468-59','Joana Darc Pereira','1990-12-01','F','Rosa Pereira','(85) 98222-6655'],['357.468.579-60','Francisco das Chagas','1972-03-08','M','Raimunda Chagas','(85) 98333-5544'],['468.579.680-71','Raimundo Nonato Silva','1948-10-22','M','Josefa Silva','(85) 98444-4433'],['579.680.791-82','Rita de Cássia Lins','1983-07-14','F','Joana Lins','(85) 98555-3322']].forEach(([cpf,n,dn,sx,mae,tel])=>{if(!PACIENTES.some(p=>p.n===n))PACIENTES.push({cpf,n,dn,sx,mae,tel,email:'',ativo:true,cron:sx==='M'&&+dn.slice(0,4)<1960?['Losartana 50 mg','Hipertensão']:['Não','Não']})});
/* Linha do tempo única do paciente: consultas, exames de lab (com série para o gráfico), laudos de imagem, prescrições e pagamentos.
   t: consulta | lab | imagem | prescricao | pagamento | procedimento · Os outros módulos podem empurrar eventos aqui (CL_LINHA[nome].push). */
const CL_LINHA={
 'Maria Helena Souza':[
  {d:'2026-11-04',t:'consulta',tit:'Consulta · Clínica médica',quem:'Dra. Camila Rocha',txt:'Em triagem agora. Queixa: cansaço e sede há 2 meses.',st:'hoje'},
  {d:'2026-11-04',t:'lab',tit:'Hemoglobina glicada e glicose',quem:'Laboratório Central',txt:'Colhido 07:40 · em digitação. Potássio crítico avisado ao médico.',st:'em andamento',serie:{ex:'HBA1C',n:'Hemoglobina glicada (%)',faixa:[4,5.6],hist:[['04/11',7.9],['12/06',7.4],['20/01',6.8],['14/08/25',6.1]]}},
  {d:'2026-11-04',t:'pagamento',tit:'Pagamento · R$ 222,00',quem:'Paula (caixa)',txt:'Pix · consulta R$ 180,00 + HbA1c R$ 30,00 + glicose R$ 12,00 · nota 10.931'},
  {d:'2026-06-12',t:'prescricao',tit:'Prescrição · Metformina 500 mg',quem:'Dra. Camila Rocha',txt:'1 comprimido 2 vezes ao dia, após as refeições · uso contínuo · receita simples assinada (ICP-Brasil).'},
  {d:'2026-06-12',t:'consulta',tit:'Consulta · Clínica médica',quem:'Dra. Camila Rocha',txt:'Diabetes tipo 2 (CID E11). Pediu HbA1c a cada 3 meses e US de abdome.'},
  {d:'2026-06-10',t:'imagem',tit:'Laudo · US abdome total',quem:'Dr. Paulo Henrique Viana',txt:'Esteatose hepática leve. Demais órgãos sem alterações.',laudo:true},
  {d:'2026-06-10',t:'pagamento',tit:'Pagamento · R$ 220,00',quem:'Rafael (caixa)',txt:'Cartão de crédito 2× · US abdome total'},
 ],
 'José Carlos Lima':[
  {d:'2026-11-04',t:'consulta',tit:'Consulta · Cardiologia',quem:'Dr. Igor Menezes',txt:'Em atendimento agora · Unimed (guia 88412).',st:'hoje'},
  {d:'2026-10-14',t:'lab',tit:'Lipidograma e creatinina',quem:'Laboratório Central',txt:'Liberado 14/10 16:12.',serie:{ex:'COL',n:'LDL colesterol (mg/dL)',faixa:[0,130],hist:[['14/10',142],['03/04',158],['10/10/25',171]]}},
  {d:'2026-10-14',t:'procedimento',tit:'Eletrocardiograma',quem:'Dr. Igor Menezes',txt:'Ritmo sinusal, sem alterações agudas.',laudo:true},
  {d:'2026-04-03',t:'prescricao',tit:'Prescrição · Losartana 50 mg e rosuvastatina 10 mg',quem:'Dr. Igor Menezes',txt:'Uso contínuo; renovada por 6 meses.'},
  {d:'2026-04-03',t:'pagamento',tit:'Convênio · Unimed Fortaleza',quem:'Faturamento',txt:'Guia SP/SADT no lote 1187 · paga em 25/05.'},
 ],
 'Ana Souza':[
  {d:'2026-11-04',t:'imagem',tit:'US abdome total',quem:'Dr. Paulo Henrique Viana',txt:'Realizado 07:40 · laudo em digitação na Imagem.',st:'hoje'},
  {d:'2026-11-04',t:'pagamento',tit:'Pagamento da jornada J-0090 · R$ 412,00',quem:'Paula (caixa)',txt:'Pix · US abdome + hemograma + glicose + TSH + retorno · preparo enviado ontem às 18h.'},
  {d:'2026-10-27',t:'pagamento',tit:'Orçamento ORC-0412',quem:'Paula',txt:'6 exames de laboratório · em contato.'},
  {d:'2026-03-02',t:'lab',tit:'TSH',quem:'Laboratório Central',txt:'Liberado.',serie:{ex:'TSH',n:'TSH (µUI/mL)',faixa:[0.4,4.5],hist:[['02/03',3.1],['15/09/25',4.9],['10/03/25',5.4]]}},
 ],
};
function clLinhaDe(nome){if(CL_LINHA[nome])return CL_LINHA[nome];const ag=AG_CLIN.find(a=>a.pac===nome);const l=[];if(ag){const p=PROC(ag.proc);l.push({d:'2026-11-04',t:p&&p.tipo==='Imagem'?'imagem':'consulta',tit:(p?p.n:'Consulta')+' · hoje '+ag.h,quem:(PROF(ag.prof)||{}).n||'—',txt:'Situação: '+ag.sit+' · '+ag.conv+(ag.pago?' · pago':' · aguardando pagamento'),st:'hoje'})}
 const at=ATENDS.find(a=>a.n===nome);if(at)l.push({d:'2026-11-04',t:'lab',tit:'Atendimento de laboratório '+at.p,quem:'Laboratório Central',txt:totTexto(at.tot)});
 l.push({d:'2025-09-18',t:'pagamento',tit:'Primeiro atendimento na plataforma',quem:'Recepção',txt:'Cadastro criado; termo LGPD versão 2 aceito.'});return l}
/* Leitos (Hospital · primeira versão) */
const CL_LEITOS=[
 {id:'101',ala:'Enfermaria A',sit:'ocupado',pac:'Francisca Oliveira',adm:'2026-11-02',med:'p1',diag:'Pneumonia comunitária (J18.9)',conv:'Hapvida',prev:'06/11'},
 {id:'102',ala:'Enfermaria A',sit:'ocupado',pac:'Raimundo Nonato Silva',adm:'2026-11-03',med:'p4',diag:'Insuficiência cardíaca descompensada (I50.0)',conv:'Unimed Fortaleza',prev:'08/11',alerta:'Potássio 6,9 · avisado'},
 {id:'103',ala:'Enfermaria A',sit:'higienizacao',desde:'09:10'},
 {id:'104',ala:'Enfermaria A',sit:'livre'},
 {id:'201',ala:'Apartamentos',sit:'ocupado',pac:'Sebastião Gomes',adm:'2026-11-04',med:'p3',diag:'Pós-operatório · exérese de lesão',conv:'Particular',prev:'05/11',dia:true},
 {id:'202',ala:'Apartamentos',sit:'reservado',pac:'Marcos Vinícius Rocha',res:'cirurgia de amanhã 07:30'},
 {id:'203',ala:'Apartamentos',sit:'livre'},
 {id:'OBS-1',ala:'Observação (até 24 h)',sit:'ocupado',pac:'Francisco das Chagas',adm:'2026-11-04',med:'p1',diag:'Crise hipertensiva (I10)',conv:'Particular',prev:'hoje 14:00'},
 {id:'OBS-2',ala:'Observação (até 24 h)',sit:'bloqueado',mot:'manutenção do ar-condicionado'},
];
const CL_LEITO_SIT={livre:['Livre','ok'],ocupado:['Ocupado','acc'],higienizacao:['Em higienização','warn'],reservado:['Reservado','info'],bloqueado:['Bloqueado','neutral']};
/* Agenda cirúrgica (Hospital · primeira versão) */
const CL_CIRURGIAS=[
 {d:'hoje',h:'07:30',sala:'s7',pac:'Luiza Ferreira',proc:'Exérese de nevo (dorso)',cir:'p3',anest:'Local',dur:40,sit:'finalizada',leito:'—',kit:'30101921'},
 {d:'hoje',h:'10:40',sala:'s7',pac:'Sebastião Gomes',proc:'Exérese de lesão de pele (face)',cir:'p3',anest:'Local com sedação leve',dur:60,sit:'confirmada',leito:'201',kit:'30101921'},
 {d:'hoje',h:'14:00',sala:'s7',pac:'Rita de Cássia Lins',proc:'Biópsia de mama guiada por US',cir:'p2',anest:'Local',dur:45,sit:'confirmada',leito:'—',kit:'30101921'},
 {d:'amanhã',h:'07:30',sala:'s7',pac:'Marcos Vinícius Rocha',proc:'Hernioplastia umbilical',cir:'p3',anest:'Raquidiana',dur:90,sit:'aguardando autorização',leito:'202',kit:'30101921'},
];

/* ---------- 04/11 · Onda 2 · Planos e pacotes (substitui o "Fidelidade / Cartão DeoVita" do Clinicas, que era modelado como forma de pagamento) ----------
   Prefixo PL_. Plano = contrato com mensalidade, carência, cobertura ou desconto por tipo de item e limite de uso.
   Pacote = compra antecipada com saldo por procedimento. A elegibilidade é calculada aqui e aparece na recepção (Novo atendimento) e em Planos e pacotes. */
const PL_HOJE='2026-11-04';
const plDias=(a,b)=>Math.round((new Date(b+'T12:00')-new Date(a+'T12:00'))/864e5);
const plSoma=(iso,d)=>{const x=new Date(iso+'T12:00');x.setDate(x.getDate()+d);return x.toISOString().slice(0,10)};
const plDm=iso=>iso?iso.slice(8,10)+'/'+iso.slice(5,7):'';
/* Tipo do item para as regras: Consulta, Imagem, Procedimento (do catálogo da clínica) ou Laboratório (exames do lab) */
const plTipo=c=>EX[c]&&EX[c].proc?EX[c].proc:'Laboratório';
/* regra: alvo = tipo ou código TUSS; modo cobre (100% pago pelo plano) ou desc (% de desconto); lim = usos por mês; car = dias de carência */
const PL_PLANOS=[
 {id:'DV-IND',n:'Cartão DeoVita Individual',mens:39.9,vidas:1,venda:'Balcão, site e app',ativo:true,regras:[
  {alvo:'10101039',modo:'cobre',pct:100,lim:0,car:0},{alvo:'Consulta',modo:'desc',pct:50,lim:2,car:30},{alvo:'Laboratório',modo:'desc',pct:40,lim:0,car:0},{alvo:'Imagem',modo:'desc',pct:30,lim:2,car:60},{alvo:'Procedimento',modo:'desc',pct:20,lim:0,car:90}]},
 {id:'DV-FAM',n:'Cartão DeoVita Família',mens:89.9,vidas:5,venda:'Balcão, site e app',ativo:true,regras:[
  {alvo:'10101039',modo:'cobre',pct:100,lim:0,car:0},{alvo:'Consulta',modo:'desc',pct:50,lim:2,car:30},{alvo:'Laboratório',modo:'desc',pct:40,lim:0,car:0},{alvo:'Imagem',modo:'desc',pct:30,lim:2,car:60},{alvo:'40101010',modo:'desc',pct:50,lim:1,car:30},{alvo:'Procedimento',modo:'desc',pct:20,lim:0,car:90}]},
 {id:'DV-EMP',n:'Plano Empresa DeoVita (B2B)',mens:29.9,vidas:0,venda:'Contrato com a empresa; mensalidade por vida faturada para a empresa',ativo:true,regras:[
  {alvo:'Consulta',modo:'cobre',pct:100,lim:1,car:0},{alvo:'10101039',modo:'cobre',pct:100,lim:0,car:0},{alvo:'Laboratório',modo:'desc',pct:50,lim:0,car:0},{alvo:'Imagem',modo:'desc',pct:40,lim:0,car:0}]},
];
const PL_PACOTES=[
 {id:'PK-PRE',n:'Pré-natal completo',preco:1890,validade:280,itens:[['10101012',7],['40901530',3],['HEMO',3],['GLI',3],['BHCG',1],['EAS',2]],venda:'Pago à vista ou em até 10× no cartão'},
 {id:'PK-CHK',n:'Check-up executivo',preco:690,validade:60,itens:[['10101012',1],['40901122',1],['40101010',1],['HEMO',1],['GLI',1],['COL',1],['TRIG',1],['CREA',1],['TSH',1]],venda:'Pessoa física ou empresa'},
 {id:'PK-DIA',n:'Acompanhamento do diabetes (12 meses)',preco:840,validade:365,itens:[['10101012',4],['HBA1C',4],['GLI',4]],venda:'Pago à vista ou em 12× no cartão'},
];
/* Contratos: titular (paga), dependentes (usam). sit é calculada: inadimplente quando há mensalidade vencida há mais de 10 dias (tolerância configurável). */
const PL_CONTRATOS=[
 {id:'CT-1042',tipo:'plano',ref:'DV-FAM',tit:'Maria Helena Souza',cpf:'111.444.777-35',deps:[{n:'Rita Souza',par:'mãe',dn:'1938-02-10'},{n:'Jorge Souza',par:'cônjuge',dn:'1959-07-21'}],ini:'2026-01-15',dia:10,forma:'Pix recorrente',mensAbertas:[],consumo:[
  {d:'2026-11-04',pac:'Maria Helena Souza',c:'10101012',tab:180,pago:90,at:'10-00018233'},{d:'2026-11-04',pac:'Maria Helena Souza',c:'HBA1C',tab:30,pago:18,at:'10-00018233'},{d:'2026-06-10',pac:'Maria Helena Souza',c:'40901122',tab:220,pago:154,at:'10-00016610'},{d:'2026-06-12',pac:'Maria Helena Souza',c:'10101012',tab:180,pago:90,at:'10-00016655'}]},
 {id:'CT-1050',tipo:'plano',ref:'DV-FAM',tit:'Carla Alves',cpf:'',deps:[{n:'Pedro Henrique Alves',par:'filho',dn:'2014-07-02',cpf:'222.333.444-05'}],ini:'2025-08-01',dia:10,forma:'Boleto',mensAbertas:['2026-10-10'],consumo:[{d:'2026-09-22',pac:'Pedro Henrique Alves',c:'10101012',tab:180,pago:90,at:'10-00017720'}]},
 {id:'CT-1061',tipo:'plano',ref:'DV-IND',tit:'Ana Souza',cpf:'123.456.789-09',deps:[],ini:'2026-10-20',dia:20,forma:'Cartão recorrente',mensAbertas:[],consumo:[]},
 {id:'CT-0907',tipo:'plano',ref:'DV-EMP',tit:'José Carlos Lima',cpf:'987.654.321-00',empresa:'Construtora Delta Ltda',deps:[],ini:'2025-03-01',dia:5,forma:'Faturado à empresa',mensAbertas:[],consumo:[{d:'2026-10-14',pac:'José Carlos Lima',c:'40101010',tab:90,pago:90,at:'10-00017980'}]},
 {id:'PC-0233',tipo:'pacote',ref:'PK-PRE',tit:'Joana Darc Pereira',cpf:'246.357.468-59',deps:[],ini:'2026-08-18',saldo:{'10101012':5,'40901530':2,'HEMO':2,'GLI':2,'BHCG':1,'EAS':1},forma:'Cartão 10×',consumo:[
  {d:'2026-08-18',pac:'Joana Darc Pereira',c:'10101012',tab:180,pago:0,at:'10-00016990',pk:1},{d:'2026-08-18',pac:'Joana Darc Pereira',c:'HEMO',tab:25,pago:0,at:'10-00016990',pk:1},{d:'2026-08-18',pac:'Joana Darc Pereira',c:'GLI',tab:12,pago:0,at:'10-00016990',pk:1},{d:'2026-08-18',pac:'Joana Darc Pereira',c:'EAS',tab:15,pago:0,at:'10-00016990',pk:1},{d:'2026-09-20',pac:'Joana Darc Pereira',c:'40901530',tab:200,pago:0,at:'10-00017610',pk:1},{d:'2026-10-21',pac:'Joana Darc Pereira',c:'10101012',tab:180,pago:0,at:'10-00018040',pk:1}]},
 {id:'PC-0241',tipo:'pacote',ref:'PK-CHK',tit:'Luiza Ferreira',cpf:'555.666.777-80',deps:[],ini:'2026-10-30',saldo:{'10101012':1,'40901122':1,'40101010':1,'HEMO':1,'GLI':1,'COL':1,'TRIG':1,'CREA':1,'TSH':1},forma:'Pix',consumo:[]},
];
const plPlano=id=>PL_PLANOS.find(p=>p.id===id);
const plPacote=id=>PL_PACOTES.find(p=>p.id===id);
const plRef=k=>k.tipo==='plano'?plPlano(k.ref):plPacote(k.ref);
/* Situação calculada (ninguém escolhe à mão): inadimplente > carência (ainda dentro da maior carência) > adimplente; pacote vencido pela validade */
function plSit(k){if(k.cancelado)return ['cancelado','Cancelado','neutral'];
 if(k.tipo==='pacote'){const fim=plSoma(k.ini,plPacote(k.ref).validade);const tot=Object.values(k.saldo).reduce((s,v)=>s+v,0);if(PL_HOJE>fim)return ['vencido','Vencido em '+plDm(fim),'neutral'];if(!tot)return ['esgotado','Saldo usado','neutral'];return ['ativo','Ativo até '+plDm(fim),'ok']}
 const atraso=(k.mensAbertas||[]).map(d=>plDias(d,PL_HOJE)).filter(d=>d>10);if(atraso.length)return ['inadimplente','Inadimplente há '+Math.max(...atraso)+' dias','err'];
 const p=plPlano(k.ref),maxCar=Math.max(0,...p.regras.map(r=>r.car));if(plDias(k.ini,PL_HOJE)<maxCar)return ['carencia','Em carência (parcial)','warn'];return ['adimplente','Adimplente','ok']}
/* Quem tem contrato: titular pelo CPF ou nome, ou dependente */
function plContratosDe(cpf,nome){return PL_CONTRATOS.filter(k=>!k.cancelado&&((cpf&&k.cpf===cpf)||(nome&&k.tit===nome)||k.deps.some(d=>(cpf&&d.cpf===cpf)||(nome&&d.n===nome))))}
const plUsosMes=(k,alvo,pac)=>k.consumo.filter(x=>x.d.slice(0,7)===PL_HOJE.slice(0,7)&&x.pac===pac&&!x.pk&&(x.c===alvo||plTipo(x.c)===alvo)).length;
/* Aplica plano ou pacote a um item. extra = usos já contados no mesmo pedido. Retorna o valor a pagar e o porquê (vai para o detalhamento do preço). */
function plAplicar(k,pac,c,preco,extra){extra=extra||{};const s=plSit(k),nomeIt=(EX[c]||{n:c}).n;
 if(k.tipo==='pacote'){const sd=(k.saldo[c]||0)-(extra[c]||0);if(s[0]!=='ativo')return {final:preco,txt:'Pacote '+s[1].toLowerCase()};if(sd>0)return {final:0,via:'pacote',txt:`Consome 1 do pacote (saldo ${sd} → ${sd-1})`,usa:c};return {final:preco,txt:k.saldo[c]===undefined?'Fora do pacote':'Saldo do pacote esgotado'}}
 if(s[0]==='inadimplente')return {final:preco,bloq:true,txt:'Desconto suspenso: mensalidade em aberto'};
 const p=plPlano(k.ref),r=p.regras.find(x=>x.alvo===c)||p.regras.find(x=>x.alvo===plTipo(c));if(!r)return {final:preco,txt:'Sem cobertura no plano'};
 const dias=plDias(k.ini,PL_HOJE);if(dias<r.car)return {final:preco,txt:'Em carência até '+plDm(plSoma(k.ini,r.car))};
 const ch=r.alvo,usos=plUsosMes(k,ch,pac)+(extra[ch]||0);if(r.lim&&usos>=r.lim)return {final:preco,txt:`Limite de ${r.lim} por mês já usado`};
 const final=r.modo==='cobre'?0:Math.round(preco*(100-r.pct))/100;return {final,via:'plano',txt:r.modo==='cobre'?'Coberto pelo plano (100%)':`Desconto do plano: ${r.pct}%`+(r.lim?` · uso ${usos+1} de ${r.lim} no mês`:''),usa:ch}}
/* Resumo de elegibilidade para a recepção (uma linha, com a cor da situação) */
function plElegib(cpf,nome){const ks=plContratosDe(cpf,nome);return ks.map(k=>{const s=plSit(k),ref=plRef(k);const dep=k.tit!==nome&&!(cpf&&k.cpf===cpf);
 let msg=s[0]==='inadimplente'?`Mensalidade de ${plDm(k.mensAbertas[0])} em aberto: o desconto fica suspenso até o pagamento (pode pagar agora no caixa).`:s[0]==='carencia'?'Laboratório já liberado; consulta, imagem e procedimento seguem as carências do plano.':k.tipo==='pacote'?`Saldo: ${Object.entries(k.saldo).filter(([,v])=>v>0).map(([c,v])=>v+'× '+(EX[c]||{n:c}).n).join(', ')||'nenhum'}.`:'Coberturas e descontos aplicados sozinhos no pedido.';
 return {k,s,ref,dep,msg}})}
