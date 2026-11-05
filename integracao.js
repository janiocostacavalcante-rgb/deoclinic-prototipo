/* ---------- DeoClinic · ligações entre módulos (04/11) ----------
   O pedido de exame feito no prontuário entra sozinho na fila da imagem (ou avisa o laboratório),
   e o retorno gerado pelo laudo de ultrassom vai para a lista de retornos da recepção. */
const RETORNOS=[];
(function(){
 const padDe={'40901122':'abdome','40901300':'tireoide','40901467':'pelvico','40901483':'mamas','40901530':'obstetrico'};
 let seq=4900;
 if(typeof PZ_PEDIDOS!=='undefined'){const push0=PZ_PEDIDOS.push.bind(PZ_PEDIDOS);
  PZ_PEDIDOS.push=function(...ps){ps.forEach(p=>{
   if(p.setor==='Imagem'&&typeof IM_EX!=='undefined'){const pac=(typeof PACIENTES!=='undefined'&&PACIENTES.find(x=>x.n===p.pac))||{};
    IM_EX.push({id:'IM-26-00'+(++seq),pac:p.pac,id_:pac.dn?new Date().getFullYear()-+pac.dn.slice(0,4):0,sx:pac.sx||'F',proc:p.c,eq:'us1',h:'a agendar',st:0,laud:null,sol:p.med,conv:'Particular',prazo:'—',img:0,pad:padDe[p.c]||'abdome',ind:'Pedido interno do prontuário · '+(p.pri||'rotina'),t:[p.em]});
    setTimeout(()=>typeof toast==='function'&&toast(p.n+' entrou na fila de Exames de imagem','ok'),400)}
   else if(p.setor==='Laboratório')setTimeout(()=>typeof toast==='function'&&toast(p.n+' enviado ao laboratório: aguardando coleta','ok'),400)});
   return push0(...ps)}}
 if(typeof IM_RECALL!=='undefined'){const un0=IM_RECALL.unshift.bind(IM_RECALL);
  IM_RECALL.unshift=function(...rs){rs.forEach(r=>{RETORNOS.unshift({pac:r.pac,motivo:r.motivo,quando:r.quando,orig:r.orig});setTimeout(()=>typeof toast==='function'&&toast('Retorno de '+r.pac.split(' ')[0]+' enviado para a recepção agendar','ok'),400)});return un0(...rs)}}
})();
