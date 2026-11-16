/* Módulo Tarefas (16/11/2026) · quadro pessoal no estilo Trello
   ==========================================================================
   Referência: docs/tarefas-especificacao.md, seção "Revisão de 16/11".
   Cada operador tem o seu quadro (colunas e etiquetas são dele). A tarefa é vista pelo criador, pelo líder
   e pelos acompanhantes. Como o protótipo não tem servidor, o seletor "Testar como:" troca o operador
   simulado, e tudo fica no localStorage deste navegador (chave deoclinic.tarefas.v1). Sem armazenamento,
   funciona só na memória. Dados fictícios. Prefixo tq / TQ_.
   Carrega antes de telas-fim.js (que marca as telas como prontas e chama route()).
   2ª rodada (16/11, "Revisão de 16/11 (2ª parte)"): hierarquia (equipes, gestores, alcance, unidade central e
   franquia), painel de desempenho (Tarefas > Painel) e consulta das tarefas de quem está no alcance.
   A estrutura gravada mudou: chave nova deoclinic.tarefas.v2 (a v1 é descartada).
   ========================================================================== */

const TQ_KEY='deoclinic.tarefas.v2';
try{localStorage.removeItem('deoclinic.tarefas.v1')}catch(e){}
const TQ_ANX_MAX=1048576;      /* até 1 MB o conteúdo do anexo fica guardado (limite do localStorage) */
const TQ_ANX_LIM=10485760;     /* 10 MB por arquivo, como na especificação */
const tqH=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const tqP2=n=>String(n).padStart(2,'0');
const tqIsoDia=d=>d.getFullYear()+'-'+tqP2(d.getMonth()+1)+'-'+tqP2(d.getDate());
const tqHoje=()=>tqIsoDia(new Date());
const tqDia=n=>{const d=new Date();d.setDate(d.getDate()+n);return tqIsoDia(d)};
const tqQuando=(dias,h,m)=>{const d=new Date();d.setDate(d.getDate()+dias);d.setHours(h||9,m||0,0,0);return d.toISOString()};
const tqDM=s=>s?s.slice(8,10)+'/'+s.slice(5,7):'';
const tqDMY=s=>s?s.slice(8,10)+'/'+s.slice(5,7)+'/'+s.slice(0,4):'';
const tqDH=iso=>{try{const d=new Date(iso);return d.toLocaleDateString('pt-BR')+' às '+tqP2(d.getHours())+':'+tqP2(d.getMinutes())}catch(e){return ''}};
const tqDHc=iso=>{try{const d=new Date(iso);const h=tqIsoDia(d)===tqHoje();return (h?'hoje':tqDM(tqIsoDia(d)))+' '+tqP2(d.getHours())+':'+tqP2(d.getMinutes())}catch(e){return ''}};
const tqId=p=>(p||'x')+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const tqTam=b=>b<1024?b+' B':b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1).replace('.',',')+' MB';
const tqUnidNome=u=>{const x=(tqS().unids||[]).find(z=>z.c===+u);if(x)return x.n;try{if(typeof UNIDS!=='undefined'&&UNIDS[u])return UNIDS[u]}catch(e){}return 'Unidade '+u};
const tqUnidCurta=u=>tqUnidNome(u).split(' · ')[0];
const tqUnids=()=>(tqS().unids||[]).map(z=>z.c);

/* Ícones do cartão (traço, cor do texto) */
const TQI={
 olho:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
 desc:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
 conv:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/></svg>',
 clip:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l9-9a3.3 3.3 0 0 1 4.7 4.7l-9 9a1.7 1.7 0 0 1-2.4-2.4l8.3-8.3"/></svg>',
 lista:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></svg>',
 relogio:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 sino:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 3 8 3 8H3s3-2 3-8M10 21a2 2 0 0 0 4 0"/></svg>',
 volta:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
 pontos:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
 lixo:'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
 quadro:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v10"/></svg>',
};
/* Cores das etiquetas: fundo médio com texto escuro, legível no claro e no escuro */
const TQ_CORES=[['verde','Verde','#4BCE97'],['amarelo','Amarelo','#F5CD47'],['laranja','Laranja','#FEA362'],['vermelho','Vermelho','#F87168'],['roxo','Roxo','#9F8FEF'],['azul','Azul','#579DFF'],['ceu','Céu','#6CC3E0'],['cinza','Cinza','#8C9BAB']];
const tqCor=k=>(TQ_CORES.find(c=>c[0]===k)||TQ_CORES[7])[2];
const tqCorNome=k=>(TQ_CORES.find(c=>c[0]===k)||TQ_CORES[7])[1];

/* ---------- Estilos (só variáveis do tema) ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
.tq-sim{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 14px;margin:0 0 12px;border:2px dashed var(--warn);border-radius:14px;background:var(--warn-soft)}
.tq-sim label{font-weight:800;color:var(--fg-strong);font-size:14px}
.tq-sim select.in{width:auto;min-width:0;flex:1 1 220px;max-width:min(420px,100%);height:38px}
.tq-sim small{flex:1 1 220px;color:var(--fg);font-size:12.5px;line-height:1.35}
.tq-barra{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px}
.tq-barra .tabs{flex:1 1 auto;border-bottom:0}
.tq-barra .chips{display:flex;gap:6px;flex-wrap:wrap}
.tq-board{display:flex;gap:12px;align-items:flex-start;overflow-x:auto;padding:2px 2px 14px;scroll-snap-type:x proximity;overscroll-behavior-x:contain}
.tq-col{flex:0 0 280px;max-width:280px;background:var(--surface2);border:1px solid var(--border);border-radius:14px;display:flex;flex-direction:column;max-height:calc(100vh - 250px);min-height:120px;scroll-snap-align:start}
.tq-col-h{display:flex;align-items:center;gap:6px;padding:10px 8px 6px 14px}
.tq-col-h h3{font-size:14px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tq-col-h .tq-n{font-size:12px;font-weight:700;color:var(--fg2);background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:0 8px;line-height:20px}
.tq-col-h .tq-concl{font-size:10.5px;font-weight:700;color:var(--ok);background:var(--ok-soft);border-radius:999px;padding:0 6px;line-height:18px;white-space:nowrap}
.tq-col-h .ibtn{width:32px;height:32px;border:0;background:transparent}
.tq-col-h .ibtn:hover{background:var(--surface)}
.tq-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 8px 8px;min-height:40px}
.tq-vazio{font-size:12.5px;color:var(--fg2);text-align:center;padding:10px 4px;border:1px dashed var(--border);border-radius:10px}
.tq-col-f{padding:4px 8px 8px}
.tq-col-f .btn{width:100%;justify-content:flex-start}
.tq-col-add{flex:0 0 260px;display:flex;flex-direction:column;gap:8px}
.tq-col-add .btn{justify-content:flex-start}
.tq-card{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 10px 8px;box-shadow:0 1px 1px rgba(0,0,0,.12);cursor:grab;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;display:flex;flex-direction:column;gap:6px}
.tq-card:hover{border-color:var(--accent)}
.tq-card.tq-concluida .tq-open{color:var(--fg2)}
.tq-card:has(.tq-open:focus-visible){outline:3px solid var(--focus);outline-offset:2px}
.tq-open{all:unset;display:block;color:var(--fg-strong);font-weight:600;font-size:14px;line-height:1.3;overflow-wrap:anywhere;padding-right:24px;cursor:pointer}
.tq-open::after{content:'';position:absolute;inset:0;border-radius:inherit}
.tq-open:focus-visible{outline:none}
.tq-mv{position:absolute;top:4px;right:4px;z-index:2;width:28px;height:28px;border-radius:8px;border:0;background:transparent;color:var(--fg2);display:grid;place-items:center;cursor:pointer}
.tq-mv:hover,.tq-mv:focus-visible{background:var(--surface2);color:var(--fg-strong)}
.tq-mv .i{width:16px;height:16px}
.tq-etqs{display:flex;flex-wrap:wrap;gap:4px;padding-right:24px}
.tq-etq{display:inline-block;max-width:100%;min-width:36px;height:18px;line-height:18px;padding:0 8px;border-radius:4px;font-size:11px;font-weight:700;color:#1D2125;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tq-foot{display:flex;align-items:center;gap:4px 6px;flex-wrap:wrap}
.tq-b{display:inline-flex;align-items:center;gap:3px;font-size:12px;color:var(--fg2);padding:1px 4px;border-radius:4px;line-height:18px;white-space:nowrap}
.tq-b .i{width:14px;height:14px}
.tq-b.atr{background:var(--err-soft);color:var(--err);font-weight:700}
.tq-b.hoje{background:var(--warn-soft);color:var(--warn);font-weight:700}
.tq-b.ok{background:var(--ok-soft);color:var(--ok);font-weight:700}
.tq-avs{display:inline-flex;margin-left:auto;padding-left:6px}
.tq-av{width:26px;height:26px;border-radius:50%;background:var(--accent-soft);color:var(--accent);font-size:10px;font-weight:800;display:inline-grid;place-items:center;border:2px solid var(--surface);margin-left:-6px;flex:none}
.tq-av.lid{background:var(--accent);color:var(--on-accent);z-index:1}
.tq-av.g{width:32px;height:32px;font-size:12px;margin-left:0}
.tq-cri{font-size:11px;color:var(--fg2)}
.tq-flag{align-self:flex-start;display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:var(--warn);background:var(--warn-soft);border-radius:999px;padding:1px 8px;line-height:18px}
.tq-flag.men{color:var(--info);background:var(--info-soft)}
@keyframes tqPisca{0%,100%{box-shadow:0 0 0 0 transparent;border-color:var(--border)}50%{box-shadow:0 0 0 3px var(--warn-soft),0 0 16px 2px var(--warn);border-color:var(--warn)}}
.tq-pisca{animation:tqPisca 1.5s ease-in-out infinite;border-color:var(--warn)}
@media (prefers-reduced-motion:reduce){.tq-pisca{animation:none!important;border:2px solid var(--warn);box-shadow:0 0 0 3px var(--warn-soft)}}
.tq-ph{border:2px dashed var(--accent);border-radius:10px;background:var(--accent-soft);flex:none}
.tq-ghost{position:fixed;z-index:95;pointer-events:none;transform:rotate(2.5deg);box-shadow:var(--shadow);opacity:.95;cursor:grabbing}
body.tq-arrastando,body.tq-arrastando *{cursor:grabbing!important;user-select:none}
.tq-prz h3{font-size:15px;margin:16px 0 8px;display:flex;align-items:center;gap:8px}
.tq-prz h3:first-child{margin-top:0}
.tq-prz .tq-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;width:100%;text-align:left;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:var(--fg);font:inherit;font-size:14px;cursor:pointer;margin-bottom:6px}
.tq-prz .tq-row:hover{border-color:var(--accent)}
.tq-prz .tq-row b{color:var(--fg-strong);flex:1 1 220px;min-width:0}
.tq-prz .tq-row small{color:var(--fg2);font-size:12px}
.tq-home{margin:0 0 16px}
.tq-home .tq-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;width:100%;text-align:left;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:var(--fg);font:inherit;font-size:14px;cursor:pointer}
.tq-home .tq-row:hover{border-color:var(--accent)}
.tq-home .tq-row b{color:var(--fg-strong);flex:1 1 200px;min-width:0}
.tq-home-l{display:flex;flex-direction:column;gap:6px}
.tq-sino{position:relative}
.tq-sino .nl-badge{position:absolute;top:-2px;right:-4px;min-width:18px;height:18px;font-size:10.5px;padding:0 4px}
.tq-avl{display:flex;flex-direction:column;gap:6px}
.tq-avi{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:var(--fg);font:inherit;font-size:14px;cursor:pointer}
.tq-avi:hover{border-color:var(--accent)}
.tq-avi.nl{background:var(--accent-soft);border-color:var(--accent)}
.tq-avi .tq-avt{flex:1;min-width:0}
.tq-avi .tq-avt b{display:block;color:var(--fg-strong);font-size:13px}
.tq-avi .tq-avt small{display:block;color:var(--fg2);font-size:12px;margin-top:2px}
.tq-avi .tq-dot{width:9px;height:9px;border-radius:50%;background:var(--accent);flex:none;margin-top:6px}
.tq-avi:not(.nl) .tq-dot{background:transparent}
.modal.tq-det-m .mh h3{overflow-wrap:anywhere}
.tq-det{gap:14px}
.tq-det-topo{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:13px;color:var(--fg2)}
.tq-det-topo select.in{width:auto;height:34px;font-size:14px}
.tq-det-g{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:20px;align-items:start}
.tq-det-main,.tq-det-side{display:flex;flex-direction:column;gap:16px;min-width:0}
.tq-sec h4{font-size:14px;margin:0 0 8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tq-sec h4 .grow{flex:1}
.tq-sec p{margin:0;font-size:14px;white-space:pre-wrap;overflow-wrap:anywhere}
.tq-side-b{border:1px solid var(--border);border-radius:14px;padding:12px;background:var(--surface2);display:flex;flex-direction:column;gap:8px;font-size:14px}
.tq-side-b h4{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--fg2);margin:0}
.tq-pess{display:flex;align-items:center;gap:8px}
.tq-pess small{display:block;color:var(--fg2);font-size:12px}
.tq-chk{border:1px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:10px;background:var(--surface)}
.tq-chk-h{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.tq-chk-h b{flex:1;min-width:0;color:var(--fg-strong);overflow-wrap:anywhere}
.tq-prog{display:flex;align-items:center;gap:8px;margin:8px 0;font-size:12px;color:var(--fg2)}
.tq-prog .b{flex:1;height:8px;border-radius:4px;background:var(--surface2);overflow:hidden;border:1px solid var(--border)}
.tq-prog .b i{display:block;height:100%;background:var(--accent)}
.tq-prog .b i.full{background:var(--ok)}
.tq-it{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:14px}
.tq-it label{flex:1;display:flex;gap:8px;align-items:center;cursor:pointer;overflow-wrap:anywhere;min-width:0}
.tq-it input[type=checkbox]{width:18px;height:18px;accent-color:var(--accent);flex:none}
.tq-it.ok label span{text-decoration:line-through;color:var(--fg2)}
.tq-inl{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px}
.tq-inl .in{flex:1 1 180px;height:36px;font-size:14px}
.tq-x{width:30px;height:30px;border:0;background:transparent;color:var(--fg2);border-radius:8px;display:inline-grid;place-items:center;cursor:pointer;flex:none}
.tq-x:hover,.tq-x:focus-visible{background:var(--err-soft);color:var(--err)}
.tq-x .i{width:16px;height:16px}
.tq-anx{display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid var(--border);border-radius:10px;margin-bottom:6px;font-size:14px;background:var(--surface)}
.tq-anx .grow{flex:1;min-width:0;overflow-wrap:anywhere}
.tq-anx small{display:block;color:var(--fg2);font-size:12px}
.tq-anx .tq-ext{width:40px;height:32px;border-radius:6px;background:var(--surface2);border:1px solid var(--border);display:grid;place-items:center;font-size:10px;font-weight:800;color:var(--fg2);flex:none;text-transform:uppercase}
.tq-chat{display:flex;flex-direction:column;gap:8px;max-height:300px;overflow:auto;padding:4px 2px}
.tq-msg{display:flex;gap:8px;align-items:flex-end;max-width:88%}
.tq-msg.eu{align-self:flex-end;flex-direction:row-reverse}
.tq-msg .bl{background:var(--surface2);border:1px solid var(--border);border-radius:14px 14px 14px 4px;padding:8px 10px;font-size:14px;overflow-wrap:anywhere;white-space:pre-wrap}
.tq-msg.eu .bl{background:var(--accent-soft);border-color:var(--accent);border-radius:14px 14px 4px 14px}
.tq-msg .bl small{display:block;font-size:11px;color:var(--fg2);margin-bottom:2px;white-space:normal}
.tq-men{color:var(--accent);font-weight:700}
.tq-msgf{position:relative;display:flex;gap:8px;align-items:flex-end;margin-top:8px}
.tq-msgf textarea.in{min-height:44px;height:44px;resize:vertical;flex:1}
.tq-sug{position:absolute;left:0;bottom:calc(100% + 4px);z-index:5;min-width:220px;max-width:100%;margin:0;padding:4px;list-style:none;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow)}
.tq-sug li{padding:8px 10px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;gap:8px;align-items:center}
.tq-sug li[aria-selected=true]{background:var(--accent-soft);color:var(--fg-strong)}
.tq-hist{font-size:13px;display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto}
.tq-hist div small{color:var(--fg2)}
.tq-etq-t{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border-radius:6px;border:2px solid transparent;font-size:13px;font-weight:700;color:#1D2125;cursor:pointer}
.tq-etq-t[aria-pressed=false]{opacity:.55;border-style:dashed;border-color:var(--fg2)}
.tq-etq-t[aria-pressed=true]::before{content:'✓'}
.tq-pick{display:flex;flex-direction:column;gap:4px;max-height:220px;overflow:auto;border:1px solid var(--border);border-radius:10px;padding:6px 8px;background:var(--surface)}
.tq-pick label{display:flex;align-items:center;gap:8px;font-size:14px;padding:4px 2px;cursor:pointer}
.tq-pick input{width:18px;height:18px;accent-color:var(--accent)}
.tq-pick small{color:var(--fg2);font-size:12px}
.tq-bloq{font-size:12.5px;color:var(--fg2)}
.tq-etqrow{display:grid;grid-template-columns:minmax(0,1fr) 150px auto;gap:8px;align-items:center;margin-bottom:8px}
.tq-etqrow .in{height:36px;font-size:14px}
.tq-sw{display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:middle}
.tq-com-g{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))}
.tq-com-l{display:flex;flex-direction:column;gap:6px}
.tq-com-r{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,170px);gap:8px;align-items:center;font-size:14px;padding:6px 0;border-bottom:1px solid var(--border)}
.tq-com-r:last-child{border-bottom:0}
.tq-com-r small{display:block;color:var(--fg2);font-size:12px}
.tq-com-r .in{height:36px;font-size:14px}
.tq-com-u{border:1px solid var(--border);border-radius:14px;padding:12px 14px;background:var(--surface2);display:flex;flex-direction:column;gap:8px;font-size:14px}
.tq-com-u h4{font-size:15px;margin:0}
.tq-com-u label{display:flex;align-items:center;gap:8px;cursor:pointer}
.tq-com-u input{width:18px;height:18px;accent-color:var(--accent)}
.tq-com-u .tq-sub{display:flex;flex-wrap:wrap;gap:4px 14px;padding-left:26px}
.tq-com-u .tq-sub label{font-size:13.5px}
.tq-com-res{display:flex;flex-direction:column;gap:8px;font-size:13.5px}
.tq-com-res div b{color:var(--fg-strong)}
.tq-com-res .x{color:var(--err)}
.tq-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@media (max-width:760px){
 .tq-det-g{grid-template-columns:minmax(0,1fr)}
 .tq-col{flex:0 0 min(84vw,300px);max-width:min(84vw,300px);max-height:none}
 .tq-list{overflow:visible}
 .tq-col-add{flex:0 0 min(70vw,240px)}
 .tq-etqrow{grid-template-columns:minmax(0,1fr) 110px auto}
 .tq-com-r{grid-template-columns:minmax(0,1fr)}
}
</style>`);

/* ---------- Dados ---------- */
const TQ_SETORES0=[{id:'s1',n:'Recepção'},{id:'s2',n:'Laboratório'},{id:'s3',n:'Coleta'},{id:'s4',n:'Financeiro'},{id:'s5',n:'Gestão'},{id:'s6',n:'Diretoria'},{id:'s7',n:'Jurídico'}];
/* Unidades do módulo: as três do protótipo e uma franquia (só aqui, para a hierarquia). A central dá "Toda a empresa" a quem a administra. */
const TQ_UNIDS0=[{c:10,n:'Unidade 10 · Central (matriz)',central:true},{c:12,n:'Posto 12 · Messejana'},{c:14,n:'Posto 14 · Aldeota'},{c:20,n:'Franquia 20 · Eusébio',franquia:true}];
/* adm: unidades que a pessoa administra ('todas' = todas). alc: alcance escolhido (sem alc = padrão pela gestão de equipes). */
const TQ_OPS0=[
 {id:'u0',n:'Augusto Leal',ini:'AL',unid:10,setor:'s6',cargo:'Diretor geral',adm:'todas'},
 {id:'u9',n:'Renata Paiva',ini:'RP',unid:10,setor:'s5',cargo:'Gerente da Unidade 10'},
 {id:'u1',n:'Paula Mendes',ini:'PM',unid:10,setor:'s1',cargo:'Coordenadora da recepção'},
 {id:'u2',n:'Rafael Sousa',ini:'RS',unid:10,setor:'s1',cargo:'Recepcionista'},
 {id:'u3',n:'Dra. Helena Brito',ini:'HB',unid:10,setor:'s2',cargo:'Bioquímica'},
 {id:'u4',n:'Tiago Lira',ini:'TL',unid:10,setor:'s2',cargo:'Técnico de laboratório'},
 {id:'u5',n:'Sérgio Matos',ini:'SM',unid:10,setor:'s4',cargo:'Gestor financeiro'},
 {id:'u10',n:'Bianca Torres',ini:'BT',unid:10,setor:'s4',cargo:'Analista financeira'},
 {id:'u11',n:'Diego Moura',ini:'DM',unid:10,setor:'s4',cargo:'Faturamento'},
 {id:'u12',n:'Dra. Fernanda Lins',ini:'FL',unid:10,setor:'s7',cargo:'Gestora jurídica'},
 {id:'u13',n:'Otávio Ramos',ini:'OR',unid:10,setor:'s7',cargo:'Assistente jurídico'},
 {id:'u6',n:'Marta Queiroz',ini:'MQ',unid:12,setor:'s3',cargo:'Coletadora'},
 {id:'u8',n:'Lúcia Fernandes',ini:'LF',unid:14,setor:'s5',cargo:'Gerente dos postos',adm:[12,14],alc:{modo:'unidades',unids:[12,14]}},
 {id:'u7',n:'Carla Nogueira',ini:'CN',unid:14,setor:'s1',cargo:'Recepcionista'},
 {id:'u14',n:'Gustavo Prado',ini:'GP',unid:20,setor:'s5',cargo:'Administrador da franquia',adm:[20]},
 {id:'u15',n:'Lívia Campos',ini:'LC',unid:20,setor:'s1',cargo:'Recepcionista'},
 {id:'u16',n:'Mateus Rocha',ini:'MR',unid:20,setor:'s3',cargo:'Coletador'},
];
const TQ_EQUIPES0=[
 {id:'q1',n:'Diretoria',unid:10,gest:['u0'],memb:[],pai:null},
 {id:'q2',n:'Atendimento · Unidade 10',unid:10,gest:['u9'],memb:['u3','u4'],pai:null},
 {id:'q3',n:'Recepção Central',unid:10,gest:['u1'],memb:['u2'],pai:'q2'},
 {id:'q4',n:'Financeiro',unid:10,gest:['u5'],memb:['u10','u11'],pai:null},
 {id:'q5',n:'Jurídico',unid:10,gest:['u12'],memb:['u13'],pai:null},
 {id:'q6',n:'Posto 14',unid:14,gest:['u8'],memb:['u7'],pai:null},
 {id:'q7',n:'Franquia Eusébio',unid:20,gest:['u14'],memb:['u15','u16'],pai:null},
];
function tqUserNovo(){return {cols:[{id:'c1',n:'A fazer'},{id:'c2',n:'Fazendo'},{id:'c3',n:'Feito',conclui:true}],pos:{},etq:[{id:'e1',n:'Importante',cor:'amarelo'}],tEtq:{},avisos:[],ger:{}}}
function tqSeed(){
 const cp=x=>JSON.parse(JSON.stringify(x));
 const S={v:2,eu:'u1',setores:cp(TQ_SETORES0),ops:cp(TQ_OPS0),unids:cp(TQ_UNIDS0),equipes:cp(TQ_EQUIPES0),
  com:{14:{modo:'selecionadas',unids:[10],limSet:false,setores:[]},20:{modo:'selecionadas',unids:[10],limSet:false,setores:[]}},tarefas:[],user:{}};
 S.ops.forEach(o=>S.user[o.id]=tqUserNovo());
 const U=S.user;
 U.u1.cols=[{id:'c1',n:'A fazer'},{id:'c2',n:'Fazendo'},{id:'c4',n:'Aguardando retorno'},{id:'c3',n:'Feito',conclui:true}];
 U.u1.etq=[{id:'e1',n:'Urgente',cor:'vermelho'},{id:'e2',n:'Recepção',cor:'verde'},{id:'e3',n:'Ligar',cor:'azul'},{id:'e4',n:'Semana que vem',cor:'roxo'}];
 U.u2.etq=[{id:'e1',n:'Prioridade',cor:'laranja'},{id:'e2',n:'Telefone',cor:'ceu'}];
 U.u4.etq=[{id:'e1',n:'Qualidade',cor:'roxo'},{id:'e2',n:'Bioquímica',cor:'azul'}];
 const T=(o)=>{const t=Object.assign({desc:'',acomp:[],prazos:[],concl:null,checklists:[],anexos:[],msgs:[],hist:[]},o);t.hist.unshift({em:t.criada,por:t.criador,t:'Criou a tarefa'});S.tarefas.push(t);return t};
 T({id:'t1',titulo:'Conferir o estoque de tubos EDTA do Posto 12',desc:'Contar os tubos roxos (EDTA) e os de citrato.\nSe houver menos de 2 caixas, pedir reposição à matriz.',criador:'u1',lider:'u6',acomp:['u1','u8'],criada:tqQuando(-6,8,40),
  prazos:[{data:tqDia(-3),def:tqQuando(-6,8,40),por:'u1'}],
  checklists:[{id:'k1',n:'Contagem',itens:[{id:'i1',t:'Tubos EDTA',ok:true},{id:'i2',t:'Tubos citrato',ok:false},{id:'i3',t:'Agulhas 25x7',ok:false}]}]});
 T({id:'t2',titulo:'Atualizar a tabela de preços particulares de dezembro',desc:'Aplicar o reajuste aprovado pela gestão e conferir os exames de rotina.',criador:'u5',lider:'u5',acomp:['u1'],criada:tqQuando(-10,14,5),
  prazos:[{data:tqDia(-5),def:tqQuando(-10,14,5),por:'u5'},{data:tqDia(2),def:tqQuando(-4,9,12),por:'u5'}]});
 S.tarefas[1].hist.push({em:tqQuando(-4,9,12),por:'u5',t:'Definiu novo prazo: '+tqDM(tqDia(2))+' (prazo de '+tqDM(tqDia(-5))+' perdido)'});
 T({id:'t3',titulo:'Treinar a nova recepcionista no pré-atendimento',desc:'Mostrar a busca por CPF, a senha preferencial e o cadastro rápido.',criador:'u8',lider:'u1',acomp:['u7'],criada:tqQuando(0,8,15),
  prazos:[{data:tqHoje(),def:tqQuando(0,8,15),por:'u8'}],
  checklists:[{id:'k1',n:'Primeiro dia',itens:[{id:'i1',t:'Acesso ao sistema',ok:true},{id:'i2',t:'Busca por CPF',ok:false}]},{id:'k2',n:'Segundo dia',itens:[{id:'i3',t:'Senha preferencial',ok:false},{id:'i4',t:'Cadastro rápido',ok:false}]}]});
 T({id:'t4',titulo:'Revisar o POP de coleta infantil',desc:'Atualizar o procedimento com o novo kit de coleta pediátrica.',criador:'u3',lider:'u4',acomp:['u1','u6'],criada:tqQuando(-2,10,30),
  prazos:[{data:tqDia(1),def:tqQuando(-2,10,30),por:'u3'}],
  msgs:[{id:'m1',de:'u4',t:'Comecei a revisão. Mandei a versão anterior em anexo.',em:tqQuando(-1,11,2)},{id:'m2',de:'u4',t:'@Paula Mendes, pode revisar a parte do acolhimento na recepção?',em:tqQuando(0,7,58)}],
  anexos:[{id:'a1',n:'POP-coleta-infantil-v3.pdf',tipo:'application/pdf',tam:248000,b64:null,por:'u4',em:tqQuando(-1,11,1)}]});
 T({id:'t5',titulo:'Ligar para os pacientes com recoleta pendente',criador:'u1',lider:'u2',acomp:[],criada:tqQuando(-1,15,20)});
 T({id:'t6',titulo:'Organizar o arquivo de laudos de outubro',criador:'u1',lider:'u1',acomp:[],criada:tqQuando(-12,9,0),concl:{em:tqQuando(-3,17,10),por:'u1'},
  prazos:[{data:tqDia(-2),def:tqQuando(-12,9,0),por:'u1'}]});
 T({id:'t7',titulo:'Fechar o caixa da semana com a matriz',criador:'u7',lider:'u7',acomp:['u8','u5'],criada:tqQuando(-1,17,45),prazos:[{data:tqDia(6),def:tqQuando(-1,17,45),por:'u7'}]});
 T({id:'t8',titulo:'Calibrar o analisador de bioquímica',criador:'u4',lider:'u4',acomp:['u3'],criada:tqQuando(-3,7,30),prazos:[{data:tqDia(12),def:tqQuando(-3,7,30),por:'u4'}],
  checklists:[{id:'k1',n:'Calibração',itens:[{id:'i1',t:'Calibrador nível 1',ok:true},{id:'i2',t:'Calibrador nível 2',ok:true},{id:'i3',t:'Controle interno',ok:false}]}]});
 T({id:'t9',titulo:'Pedir orçamento de cadeiras para a sala de espera',criador:'u1',lider:'u1',acomp:['u8'],criada:tqQuando(-4,16,0)});
 /* posições e etiquetas de Paula (u1) */
 U.u1.pos={t3:{c:'c1',o:0},t9:{c:'c1',o:1},t1:{c:'c4',o:0},t2:{c:'c2',o:0},t4:{c:'c1',o:2},t5:{c:'c2',o:1},t6:{c:'c3',o:0}};
 U.u1.tEtq={t3:['e2'],t1:['e1','e3'],t5:['e3'],t9:['e4']};
 U.u4.tEtq={t4:['e1'],t8:['e2']};U.u4.pos={t8:{c:'c2',o:0},t4:{c:'c1',o:0}};
 U.u2.tEtq={t5:['e2','e1']};
 /* avisos não lidos: Paula recebeu a t3 (líder) e foi mencionada na t4; Rafael recebeu a t5 */
 const av=(u,tipo,t,txt,de,em)=>U[u].avisos.push({id:tqId('a'),tipo,t,txt,de,em,lido:false});
 av('u1','atribuida','t3','Lúcia Fernandes criou uma tarefa para você liderar','u8',tqQuando(0,8,15));
 av('u1','mencao','t4','Tiago Lira mencionou você na conversa','u4',tqQuando(0,7,58));
 av('u7','atribuida','t3','Lúcia Fernandes incluiu você como acompanhante','u8',tqQuando(0,8,15));
 av('u2','atribuida','t5','Paula Mendes criou uma tarefa para você liderar','u1',tqQuando(-1,15,20));
 av('u6','mencao','t4','Tiago Lira mencionou você na conversa','u4',tqQuando(-1,11,2));
 tqSeedHist(S);
 return S}
let TQS=null;
function tqLer(){try{const r=localStorage.getItem(TQ_KEY);if(r){const s=JSON.parse(r);if(s&&s.v===2&&Array.isArray(s.tarefas)&&s.user&&s.ops&&s.equipes&&s.unids)return s}}catch(e){}return null}
function tqSalvar(){try{localStorage.setItem(TQ_KEY,JSON.stringify(TQS));return true}catch(e){return false}}
function tqS(){if(!TQS){TQS=tqLer();if(!TQS){TQS=tqSeed();tqSalvar()}TQS.ops.forEach(o=>{if(!TQS.user[o.id])TQS.user[o.id]=tqUserNovo()})}return TQS}

/* ---------- Consultas ---------- */
const tqEu=()=>tqS().eu;
const tqOp=id=>tqS().ops.find(o=>o.id===id)||{id,n:'Pessoa removida',ini:'?',unid:0,setor:''};
const tqNome=id=>tqOp(id).n;
const tqPrim=id=>{const n=tqNome(id);return n.split(' ').slice(0,/^Dra?\./.test(n)?2:1).join(' ')};
const tqSetorNome=id=>(tqS().setores.find(s=>s.id===id)||{n:'Sem setor'}).n;
const tqU=id=>{const S=tqS();if(!S.user[id])S.user[id]=tqUserNovo();return S.user[id]};
const tqT=id=>tqS().tarefas.find(t=>t.id===id);
const tqEnv=(t,u)=>!!t&&(t.criador===u||t.lider===u||t.acomp.includes(u));
const tqEnvolvidos=t=>[...new Set([t.criador,t.lider,...t.acomp])];
const tqVis=u=>tqS().tarefas.filter(t=>tqEnv(t,u));
const tqPrazo=t=>t.prazos.length?t.prazos[t.prazos.length-1].data:null;
const tqPerdidos=t=>t.prazos.slice(0,-1);
function tqSit(t){if(t.concl)return 'concl';const p=tqPrazo(t);if(!p)return 'sem';const h=tqHoje();if(p<h)return 'atr';if(p===h)return 'hoje';if(p===tqDia(1))return 'amanha';return 'ok'}
const tqPapelLinha=(t,u)=>t.lider===u?'Você lidera':tqPapel(t,u)+' · líder '+tqPrim(t.lider);
const tqPapel=(t,u)=>t.lider===u?'Líder':t.acomp.includes(u)?'Acompanho':t.criador===u?'Criei':'';
/* Regras de comunicação: A escolhe B se a unidade de A permite a unidade de B (a mesma sempre pode) e, havendo limite, o setor de B está na lista */
function tqPode(a,b){if(a===b)return true;const S=tqS(),A=tqOp(a),B=tqOp(b),r=S.com[A.unid];if(!r)return true;
 if(A.unid!==B.unid&&r.modo==='selecionadas'&&!(r.unids||[]).includes(B.unid))return false;
 if(r.limSet&&!(r.setores||[]).includes(B.setor))return false;return true}
const tqPermitidos=a=>tqS().ops.filter(o=>o.id!==a&&tqPode(a,o.id));
const tqBloqueados=a=>tqS().ops.filter(o=>o.id!==a&&!tqPode(a,o.id));

/* ---------- Avisos ---------- */
const TQ_AV_TIPO={atribuida:'Tarefa recebida',mencao:'Você foi mencionado',mensagem:'Nova mensagem',amanha:'Prazo vence amanhã',atrasou:'Prazo vencido',concluida:'Tarefa concluída',lideranca:'Liderança recebida'};
function tqAvisar(u,tipo,t,txt,de){if(!u||u===de)return;tqU(u).avisos.unshift({id:tqId('a'),tipo,t,txt,de:de||'',em:new Date().toISOString(),lido:false})}
const tqAvisosDe=u=>tqU(u).avisos.filter(a=>tqEnv(tqT(a.t),u));
const tqNaoLidos=u=>tqAvisosDe(u).filter(a=>!a.lido).length;
function tqPiscaDe(u,t){const l=tqU(u).avisos.filter(a=>a.t===t.id&&!a.lido);if(l.some(a=>a.tipo==='mencao'))return 'mencao';if(l.some(a=>a.tipo==='atribuida'||a.tipo==='lideranca'))return 'nova';return ''}
/* Prazo vencendo amanhã e prazo vencido: gerados uma vez por tarefa, prazo e pessoa */
function tqGerarPrazos(){const S=tqS(),h=tqHoje(),am=tqDia(1);let mudou=false;
 S.tarefas.forEach(t=>{if(t.concl)return;const p=tqPrazo(t);if(!p)return;tqEnvolvidos(t).forEach(u=>{const U=tqU(u);
  if(p===am&&!U.ger['am:'+t.id+':'+p]){U.ger['am:'+t.id+':'+p]=1;U.avisos.unshift({id:tqId('a'),tipo:'amanha',t:t.id,txt:'O prazo vence amanhã ('+tqDM(p)+')',de:'',em:new Date().toISOString(),lido:false});mudou=true}
  if(p<h&&!U.ger['at:'+t.id+':'+p]){U.ger['at:'+t.id+':'+p]=1;U.avisos.unshift({id:tqId('a'),tipo:'atrasou',t:t.id,txt:'O prazo de '+tqDM(p)+' venceu e a tarefa não foi concluída',de:'',em:new Date().toISOString(),lido:false});mudou=true}})});
 if(mudou)tqSalvar()}
const tqUrgentes=u=>tqVis(u).filter(t=>{const s=tqSit(t);return s==='atr'||s==='hoje'}).length;

/* ---------- Colunas e posições (de cada pessoa) ---------- */
const tqCols=u=>tqU(u).cols.filter(c=>!c.arq);
const tqColConclui=u=>tqCols(u).find(c=>c.conclui)||null;
function tqGarantePos(u){const U=tqU(u),cs=tqCols(u);if(!cs.length){U.cols.push({id:tqId('c'),n:'A fazer'});return tqGarantePos(u)}
 tqVis(u).forEach(t=>{const p=U.pos[t.id];if(p&&cs.some(c=>c.id===p.c))return;const cc=tqColConclui(u),alvo=(t.concl&&cc)?cc:cs[0];
  const os=Object.values(U.pos).filter(x=>x.c===alvo.id).map(x=>x.o);U.pos[t.id]={c:alvo.id,o:os.length?Math.max(...os)+1:0}})}
function tqDaColuna(u,c){const U=tqU(u);return tqVis(u).filter(t=>U.pos[t.id]&&U.pos[t.id].c===c).sort((a,b)=>U.pos[a.id].o-U.pos[b.id].o)}
function tqTopo(u,tid){const U=tqU(u),cs=tqCols(u);if(!cs.length)return;const c=cs[0].id,os=Object.values(U.pos).filter(x=>x.c===c).map(x=>x.o);U.pos[tid]={c,o:os.length?Math.min(...os)-1:0}}
const tqColNome=(u,c)=>(tqU(u).cols.find(x=>x.id===c)||{n:'?'}).n;

/* Mover no meu quadro. Se eu sou o líder, a coluna que conclui fecha a tarefa e sair dela reabre. */
function tqMover(tid,c,idx,silencio){const u=tqEu(),U=tqU(u),t=tqT(tid);if(!t)return;tqGarantePos(u);const de=U.pos[tid]?U.pos[tid].c:null;
 const l=tqDaColuna(u,c).filter(x=>x.id!==tid);idx=Math.max(0,Math.min(idx==null?l.length:idx,l.length));l.splice(idx,0,t);l.forEach((x,i)=>U.pos[x.id]={c,o:i});
 const col=U.cols.find(x=>x.id===c),dcol=U.cols.find(x=>x.id===de);let msg='';
 if(de!==c){tqLog(t,u,'Moveu no próprio quadro para "'+col.n+'"');
  if(t.lider===u&&col&&col.conclui&&!t.concl){tqConcluirSem(t,u);msg=' e concluída'}
  else if(t.lider===u&&dcol&&dcol.conclui&&t.concl&&!(col&&col.conclui)){t.concl=null;tqLog(t,u,'Reabriu a tarefa');msg=' e reaberta'}}
 tqMudou();if(!silencio)toast(de!==c?`Tarefa movida para "${tqH(col.n)}"${msg}`:`Tarefa na posição ${idx+1} de "${tqH(col.n)}"`)}
function tqLog(t,u,txt){t.hist.push({em:new Date().toISOString(),por:u,t:txt})}
function tqConcluirSem(t,u){t.concl={em:new Date().toISOString(),por:u};tqLog(t,u,'Concluiu a tarefa');tqEnvolvidos(t).forEach(x=>tqAvisar(x,'concluida',t.id,tqNome(u)+' concluiu a tarefa',u))}

/* ---------- Estado da tela ---------- */
const TQ_V={aba:'quadro',filtro:'todas',abrir:null,det:null};
const tqFiltra=(l,u)=>TQ_V.filtro==='lidero'?l.filter(t=>t.lider===u):TQ_V.filtro==='acomp'?l.filter(t=>t.acomp.includes(u)):TQ_V.filtro==='criei'?l.filter(t=>t.criador===u):l;
function tqMudou(){tqSalvar();tqGerarPrazos();tqPinta();tqSinoSync();tqMenuSync();tqHomeSync();if(tqDetAberto())tqDetPinta()}

/* ---------- Menu, nomes e explicações ---------- */
try{
 if(!MENU.some(g=>g[0]==='Tarefas')){const i=MENU.findIndex(g=>g[0]==='Início');MENU.splice(i>=0?i+1:0,0,['Tarefas',[['tarefas','Minhas tarefas'],['tarefas-painel','Painel']]])}
 const cad=MENU.find(g=>g[0]==='Cadastros');if(cad&&!cad[1].some(x=>x[0]==='comunicacao')){const i=cad[1].findIndex(x=>x[0]==='perfis');cad[1].splice(i>=0?i+1:cad[1].length,0,['comunicacao','Comunicação'],['hierarquia','Hierarquia'])}
 NAMES.tarefas='Minhas tarefas';NAMES.comunicacao='Comunicação';NAMES.hierarquia='Hierarquia';NAMES['tarefas-painel']='Painel de tarefas';
 if(typeof OPEN!=='undefined')OPEN.add('Tarefas');
 if(typeof GICON!=='undefined')GICON['Tarefas']=TQI.quadro;
 if(typeof DESC!=='undefined')Object.assign(DESC,{tarefas:'Seu quadro pessoal de tarefas, no estilo Trello: as que você lidera, acompanha ou criou, com colunas e etiquetas só suas.',comunicacao:'Configurações > Comunicação: setores, setor de cada pessoa e com quais unidades e setores cada unidade pode trocar tarefas. O administrador de cada unidade cuida da sua.',hierarquia:'Configurações > Hierarquia: equipes de cada unidade, gestores, subequipes, unidade central e o alcance de cada pessoa no painel e nas tarefas dos outros.','tarefas-painel':'Painel de desempenho das tarefas do seu time: em aberto, atrasadas, concluídas, % no prazo e prazos perdidos, por pessoa e por dia.'});
 if(typeof GUIDES!=='undefined')Object.assign(GUIDES,{tarefas:['Escolha em "Testar como:" a pessoa simulada; cada uma tem o próprio quadro.','Arraste os cartões entre as colunas, ou use o botão ⋯ do cartão (ou Alt + setas) para mover pelo teclado.','Tarefas novas e menções piscam até você abrir.'],comunicacao:['Cadastre os setores e ligue cada pessoa ao seu setor.','Em cada unidade, escolha com quais unidades ela troca tarefas e, se quiser, limite aos setores.','Só aparece para escolher como líder ou acompanhante quem a regra permite.']});
}catch(e){}

/* ---------- Quadro ---------- */
VIEWS.tarefas=function(){const S=tqS(),u=S.eu,o=tqOp(u);tqGerarPrazos();tqGarantePos(u);

 return `${pageHead('Tarefas','Minhas tarefas','Seu quadro pessoal: as tarefas que você lidera, acompanha ou criou. As colunas e as etiquetas são só suas. Dados de exemplo.',`<button class="btn ghost" onclick="tqRestaurarDlg()">Restaurar dados de exemplo</button><button class="btn sec" onclick="tqEtqDlg()">Minhas etiquetas</button><button class="btn" onclick="tqNova()">${I.plus} Nova tarefa</button>`)}
${tqSimBar('Protótipo sem servidor: escolha a pessoa para ver o quadro dela. Crie uma tarefa para outra pessoa e troque para ela para ver a tarefa nova piscando.')}
<div id="tqApp">${tqApp()}</div>`};
function tqApp(){const u=tqEu();
 const tabs=`<div class="tabs" role="tablist" aria-label="Visões"><button class="tab ${TQ_V.aba==='quadro'?'active':''}" role="tab" aria-selected="${TQ_V.aba==='quadro'}" onclick="tqAba('quadro')">Quadro</button><button class="tab ${TQ_V.aba==='prazo'?'active':''}" role="tab" aria-selected="${TQ_V.aba==='prazo'}" onclick="tqAba('prazo')">Por prazo</button></div>`;
 const fs=[['todas','Todas'],['lidero','Lidero'],['acomp','Acompanho'],['criei','Criei']];
 const chips=`<div class="chips" role="group" aria-label="Filtrar tarefas">${fs.map(([k,l])=>`<button class="chip ${TQ_V.filtro===k?'on':''}" aria-pressed="${TQ_V.filtro===k}" onclick="tqFiltro('${k}')">${l}</button>`).join('')}</div>`;
 return `<div class="tq-barra">${tabs}${chips}</div>${TQ_V.aba==='prazo'?tqPorPrazo(u):tqQuadro(u)}<p class="tl" style="margin-top:6px">Teclado: no cartão, Alt + seta para a esquerda ou para a direita muda de coluna, e Alt + seta para cima ou para baixo muda a posição. A tecla M abre "Mover para". No celular, toque e segure o cartão para arrastar.</p>`}
function tqQuadro(u){const U=tqU(u),cs=tqCols(u),arq=U.cols.filter(c=>c.arq);
 return `<div class="tq-board" id="tqBoard" role="list" aria-label="Colunas do quadro de ${tqH(tqNome(u))}">${cs.map(c=>{const l=tqFiltra(tqDaColuna(u,c.id),u);return `<section class="tq-col" role="listitem" aria-labelledby="tqCol_${c.id}"><div class="tq-col-h"><h3 id="tqCol_${c.id}" title="${tqH(c.n)}">${tqH(c.n)}</h3>${c.conclui?'<span class="tq-concl" title="Mover para cá conclui as tarefas que você lidera">conclui</span>':''}<span class="tq-n" aria-label="${l.length} tarefas">${l.length}</span><button class="ibtn" aria-label="Opções da coluna ${tqH(c.n)}" onclick="tqColMenu('${c.id}')">${TQI.pontos}</button></div>
<div class="tq-list" data-col="${c.id}" role="list" aria-label="Tarefas em ${tqH(c.n)}">${l.length?l.map(t=>tqCard(t,u)).join(''):'<div class="tq-vazio">Nenhuma tarefa. Arraste um cartão para cá.</div>'}</div>
<div class="tq-col-f"><button class="btn ghost sm" onclick="tqNova('${c.id}')">${I.plus} Adicionar um cartão</button></div></section>`}).join('')}
<div class="tq-col-add" role="listitem"><button class="btn neutral" onclick="tqColNova()">${I.plus} Adicionar outra coluna</button>${arq.length?`<button class="btn ghost sm" onclick="tqColArqDlg()">Colunas arquivadas (${arq.length})</button>`:''}</div></div>`}
function tqCard(t,u){const U=tqU(u),pis=tqPiscaDe(u,t),s=tqSit(t),p=tqPrazo(t),perd=tqPerdidos(t).length;
 const etqs=(U.tEtq[t.id]||[]).map(id=>U.etq.find(e=>e.id===id)).filter(Boolean);
 const itens=t.checklists.flatMap(k=>k.itens),ok=itens.filter(i=>i.ok).length;
 const prazoTxt=p?(perd?'Novo prazo: ':'')+tqDM(p):'';
 const prazoLab=p?(s==='concl'?'Concluída; prazo '+tqDMY(p):s==='atr'?'Atrasada desde '+tqDMY(p):s==='hoje'?'Vence hoje':'Prazo '+tqDMY(p))+(perd?' (novo prazo; '+perd+' perdido'+(perd>1?'s':'')+')':''):'';
 const pc=s==='concl'?'ok':s==='atr'?'atr':s==='hoje'?'hoje':'';
 const acomp=t.acomp.filter(x=>x!==t.lider);
 const pessoasLab='Líder: '+tqNome(t.lider)+(acomp.length?'. Acompanhantes: '+acomp.map(tqNome).join(', '):'');
 return `<div class="tq-card ${pis?'tq-pisca':''} ${t.concl?'tq-concluida':''}" role="listitem" data-id="${t.id}">
${pis?`<span class="tq-flag ${pis==='mencao'?'men':''}">${pis==='mencao'?'Você foi mencionado':'Nova'}</span>`:''}
${etqs.length?`<div class="tq-etqs">${etqs.map(e=>`<span class="tq-etq" style="background:${tqCor(e.cor)}" title="Etiqueta ${tqH(e.n)}">${tqH(e.n)}</span>`).join('')}</div>`:''}
<button class="tq-open" onclick="tqAbrir('${t.id}')" onkeydown="tqCardTecla(event,'${t.id}')" aria-describedby="tqCd_${t.id}">${tqH(t.titulo)}</button>
<div class="tq-foot" id="tqCd_${t.id}">${t.acomp.includes(u)&&t.lider!==u?`<span class="tq-b" title="Você acompanha esta tarefa">${TQI.olho}<span class="tq-sr">Você acompanha.</span></span>`:''}${t.desc?`<span class="tq-b" title="Tem descrição">${TQI.desc}<span class="tq-sr">Tem descrição.</span></span>`:''}${t.msgs.length?`<span class="tq-b" title="${t.msgs.length} mensagens na conversa">${TQI.conv}${t.msgs.length}<span class="tq-sr"> mensagens.</span></span>`:''}${t.anexos.length?`<span class="tq-b" title="${t.anexos.length} anexos">${TQI.clip}${t.anexos.length}<span class="tq-sr"> anexos.</span></span>`:''}${itens.length?`<span class="tq-b ${ok===itens.length?'ok':''}" title="Listas de verificação: ${ok} de ${itens.length} feitos">${TQI.lista}${ok}/${itens.length}<span class="tq-sr"> itens feitos.</span></span>`:''}${p?`<span class="tq-b ${pc}" title="${tqH(prazoLab)}">${TQI.relogio}${prazoTxt}<span class="tq-sr"> ${tqH(prazoLab)}.</span></span>`:''}${t.concl&&!p?`<span class="tq-b ok">Concluída</span>`:''}
<span class="tq-avs" title="${tqH(pessoasLab)}"><span class="tq-sr">${tqH(pessoasLab)}.</span><span class="tq-av lid" aria-hidden="true">${tqH(tqOp(t.lider).ini)}</span>${acomp.slice(0,3).map(x=>`<span class="tq-av" aria-hidden="true">${tqH(tqOp(x).ini)}</span>`).join('')}${acomp.length>3?`<span class="tq-av" aria-hidden="true">+${acomp.length-3}</span>`:''}</span></div>
<div class="tq-cri">Criada em ${tqDM(tqIsoDia(new Date(t.criada)))}${perd?` · ${perd} prazo${perd>1?'s':''} perdido${perd>1?'s':''}`:''}</div>
<button class="tq-mv" aria-label="Mover a tarefa ${tqH(t.titulo)}" title="Mover para" onclick="tqMoverDlg('${t.id}')">${TQI.pontos}</button></div>`}
function tqPorPrazo(u){const U=tqU(u),l=tqFiltra(tqVis(u),u),h=tqHoje(),d7=tqDia(7),ab=l.filter(t=>!t.concl),nc=l.length-ab.length;
 const g=[['Atrasadas',ab.filter(t=>tqPrazo(t)&&tqPrazo(t)<h),'atr'],['Vencem hoje',ab.filter(t=>tqPrazo(t)===h),'hoje'],['Próximos 7 dias',ab.filter(t=>tqPrazo(t)&&tqPrazo(t)>h&&tqPrazo(t)<=d7),''],['Mais adiante',ab.filter(t=>tqPrazo(t)&&tqPrazo(t)>d7),''],['Sem prazo',ab.filter(t=>!tqPrazo(t)),'']];
 return `<div class="card tq-prz">${g.map(([n,ts,c])=>`<h3>${n} <span class="tq-b ${c}">${ts.length}</span></h3>${ts.length?ts.sort((a,b)=>(tqPrazo(a)||'9').localeCompare(tqPrazo(b)||'9')).map(t=>{const pis=tqPiscaDe(u,t),p=tqPrazo(t),perd=tqPerdidos(t).length;return `<button class="tq-row ${pis?'tq-pisca':''}" onclick="tqAbrir('${t.id}')">${pis?`<span class="tq-flag ${pis==='mencao'?'men':''}">${pis==='mencao'?'Você foi mencionado':'Nova'}</span>`:''}<b>${tqH(t.titulo)}</b>${p?`<span class="tq-b ${c}">${TQI.relogio}${perd?'Novo prazo: ':''}${tqDMY(p)}</span>`:''}<small>${tqH(tqPapelLinha(t,u))} · coluna ${tqH(tqColNome(u,(U.pos[t.id]||{}).c))}</small></button>`}).join(''):'<p class="tl" style="margin:0 0 6px">Nenhuma.</p>'}`).join('')}<p class="tl" style="margin-top:12px">${nc?nc+' concluída'+(nc>1?'s':'')+' não aparece'+(nc>1?'m':'')+' nesta lista.':''}</p></div>`}
function tqPinta(){const app=document.getElementById('tqApp');if(!app)return;tqGarantePos(tqEu());const b=document.getElementById('tqBoard'),sl=b?b.scrollLeft:0,st={};
 app.querySelectorAll('.tq-list').forEach(x=>st[x.dataset.col]=x.scrollTop);app.innerHTML=tqApp();
 const b2=document.getElementById('tqBoard');if(b2)b2.scrollLeft=sl;app.querySelectorAll('.tq-list').forEach(x=>{if(st[x.dataset.col])x.scrollTop=st[x.dataset.col]})}
function tqAba(a){TQ_V.aba=a;tqPinta()}
function tqFiltro(f){TQ_V.filtro=f;tqPinta()}
function tqTrocaEu(u){const S=tqS();if(!S.ops.some(o=>o.id===u))return;S.eu=u;closeModal();tqMudou();if(['#comunicacao','#hierarquia','#tarefas-painel'].includes(location.hash))reView();const n=tqNaoLidos(u);toast(`Agora testando como ${tqH(tqNome(u))}${n?` · ${n} aviso${n>1?'s':''} não lido${n>1?'s':''}`:''}`)}
function tqFocaCard(id){setTimeout(()=>{const b=document.querySelector(`#view .tq-card[data-id="${id}"] .tq-open`);if(b)b.focus()},0)}
/* Teclado: Alt + setas move o cartão; M abre "Mover para" */
function tqCardTecla(e,id){const u=tqEu(),U=tqU(u),p=U.pos[id];if(!p)return;
 if(e.altKey&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const cs=tqCols(u),ci=cs.findIndex(c=>c.id===p.c),l=tqDaColuna(u,p.c),i=l.findIndex(t=>t.id===id);
  if(e.key==='ArrowLeft'&&ci>0)tqMover(id,cs[ci-1].id,null);else if(e.key==='ArrowRight'&&ci<cs.length-1)tqMover(id,cs[ci+1].id,null);
  else if(e.key==='ArrowUp'&&i>0)tqMover(id,p.c,i-1);else if(e.key==='ArrowDown'&&i<l.length-1)tqMover(id,p.c,i+1);else return;tqFocaCard(id)}
 else if((e.key==='m'||e.key==='M')&&!e.altKey&&!e.ctrlKey&&!e.metaKey){e.preventDefault();tqMoverDlg(id)}}

/* ---------- Arrastar e soltar (mouse e toque) ---------- */
let TQD=null,TQ_SUPRIME=false;
function tqDragIni(){const d=TQD;if(!d)return;const r=d.card.getBoundingClientRect();d.ativo=true;d.dx=d.x-r.left;d.dy=d.y-r.top;
 const g=d.card.cloneNode(true);g.classList.add('tq-ghost');g.classList.remove('tq-pisca');g.removeAttribute('data-id');g.setAttribute('aria-hidden','true');g.style.width=r.width+'px';g.style.left=r.left+'px';g.style.top=r.top+'px';document.body.appendChild(g);d.ghost=g;
 const ph=document.createElement('div');ph.className='tq-ph';ph.style.height=r.height+'px';d.card.parentNode.insertBefore(ph,d.card);d.ph=ph;d.card.style.display='none';document.body.classList.add('tq-arrastando');
 try{if(navigator.vibrate&&d.touch)navigator.vibrate(15)}catch(e){}}
function tqDragMove(){const d=TQD;d.ghost.style.left=(d.x-d.dx)+'px';d.ghost.style.top=(d.y-d.dy)+'px';
 const el=document.elementFromPoint(d.x,d.y);const board=document.getElementById('tqBoard');
 if(board){const br=board.getBoundingClientRect();if(d.x>br.right-40)board.scrollLeft+=14;else if(d.x<br.left+40)board.scrollLeft-=14}
 if(d.y>innerHeight-40)scrollBy(0,14);else if(d.y<70)scrollBy(0,-14);
 if(!el)return;let list=el.closest&&el.closest('#tqBoard .tq-list');if(!list){const col=el.closest&&el.closest('#tqBoard .tq-col');if(col)list=col.querySelector('.tq-list')}if(!list)return;
 const vz=list.querySelector('.tq-vazio');if(vz)vz.style.display='none';
 const cards=[...list.querySelectorAll('.tq-card[data-id]')].filter(c=>c!==d.card);let antes=null;for(const c of cards){const r=c.getBoundingClientRect();if(d.y<r.top+r.height/2){antes=c;break}}
 if(antes){if(d.ph.nextSibling!==antes)list.insertBefore(d.ph,antes)}else if(list.lastElementChild!==d.ph)list.appendChild(d.ph)}
function tqDragFim(ok){const d=TQD;TQD=null;if(!d)return;clearTimeout(d.timer);if(!d.ativo)return;document.body.classList.remove('tq-arrastando');if(d.ghost)d.ghost.remove();
 TQ_SUPRIME=true;setTimeout(()=>TQ_SUPRIME=false,250);
 if(ok&&d.ph&&d.ph.parentNode){const list=d.ph.parentNode,c=list.dataset.col,idx=[...list.querySelectorAll('.tq-card[data-id], .tq-ph')].filter(x=>x!==d.card).indexOf(d.ph);d.ph.remove();d.card.style.display='';tqMover(d.id,c,idx);tqFocaCard(d.id);return}
 if(d.ph)d.ph.remove();d.card.style.display='';tqPinta()}
document.addEventListener('pointerdown',e=>{if(TQD||(e.pointerType==='mouse'&&e.button!==0))return;const card=e.target.closest&&e.target.closest('#view .tq-card[data-id]');
 if(!card||e.target.closest('.tq-mv')||document.body.classList.contains('rv-modo'))return;
 TQD={id:card.dataset.id,card,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,ativo:false,touch:e.pointerType!=='mouse',timer:null};
 if(TQD.touch)TQD.timer=setTimeout(()=>{if(TQD&&!TQD.ativo)tqDragIni()},380)});
document.addEventListener('pointermove',e=>{const d=TQD;if(!d)return;d.x=e.clientX;d.y=e.clientY;
 if(!d.ativo){if(Math.hypot(d.x-d.x0,d.y-d.y0)>7){if(d.touch){clearTimeout(d.timer);TQD=null}else tqDragIni()}return}
 e.preventDefault();tqDragMove()});
document.addEventListener('pointerup',()=>{if(TQD)tqDragFim(true)});
document.addEventListener('pointercancel',()=>{if(TQD)tqDragFim(false)});
document.addEventListener('touchmove',e=>{if(TQD&&TQD.ativo)e.preventDefault()},{passive:false});
document.addEventListener('contextmenu',e=>{if(TQD)e.preventDefault()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&TQD&&TQD.ativo){e.stopPropagation();tqDragFim(false)}},true);
document.addEventListener('click',e=>{if(TQ_SUPRIME&&e.target.closest&&e.target.closest('.tq-card')){e.preventDefault();e.stopPropagation()}},true);

/* ---------- Janelas pequenas: mover, colunas, etiquetas, restaurar ---------- */
function tqMoverDlg(id,volta){const u=tqEu(),U=tqU(u),t=tqT(id);if(!t)return;tqGarantePos(u);const p=U.pos[id],cs=tqCols(u);
 openModal(`${mh('Mover tarefa')}<div class="mb"><p style="margin:0;font-size:14px"><b>${tqH(t.titulo)}</b></p><p class="tl" style="margin:0">Mover muda só o seu quadro. ${t.lider===u?'Como você é o líder, a coluna que conclui fecha a tarefa.':'O líder e os outros envolvidos não veem esta mudança.'}</p>
<div class="formgrid"><div class="field"><label for="tqMvC">Coluna</label><select class="in" id="tqMvC" onchange="tqMvPos('${id}')">${cs.map(c=>`<option value="${c.id}" ${c.id===p.c?'selected':''}>${tqH(c.n)}${c.conclui?' (conclui)':''}</option>`).join('')}</select></div><div class="field"><label for="tqMvP">Posição</label><select class="in" id="tqMvP"></select></div></div></div>
<div class="mf"><button class="btn ghost" onclick="${volta?`tqAbrir('${id}')`:'closeModal()'}">Cancelar</button><button class="btn" onclick="tqMvOk('${id}',${volta?1:0})">Mover</button></div>`);tqMvPos(id,true);setTimeout(()=>{const s=document.getElementById('tqMvC');if(s)s.focus()},0)}
function tqMvPos(id,ini){const u=tqEu(),c=document.getElementById('tqMvC').value,l=tqDaColuna(u,c).filter(t=>t.id!==id),cur=tqDaColuna(u,c).findIndex(t=>t.id===id),sel=document.getElementById('tqMvP');
 sel.innerHTML=Array.from({length:l.length+1},(_,i)=>`<option value="${i}" ${(ini&&cur>=0?i===cur:i===l.length)?'selected':''}>${i+1}${i===0?' (topo)':i===l.length?' (fim)':''}</option>`).join('')}
function tqMvOk(id,volta){const c=document.getElementById('tqMvC').value,i=+document.getElementById('tqMvP').value;closeModal();tqMover(id,c,i);if(volta)tqAbrir(id);else tqFocaCard(id)}
function tqColMenu(cid){const u=tqEu(),U=tqU(u),c=U.cols.find(x=>x.id===cid);if(!c)return;const cs=tqCols(u),i=cs.findIndex(x=>x.id===cid);
 openModal(`${mh('Coluna "'+tqH(c.n)+'"')}<div class="mb"><form class="tq-inl" onsubmit="event.preventDefault();tqColRen('${cid}')" style="margin:0"><label class="tq-sr" for="tqColN">Nome da coluna</label><input class="in" id="tqColN" maxlength="40" value="${tqH(c.n)}" aria-label="Nome da coluna"><button class="btn sm" type="submit">Renomear</button></form>
<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn sm neutral" ${i<=0?'disabled':''} onclick="tqColPos('${cid}',-1)">← Mover para a esquerda</button><button class="btn sm neutral" ${i>=cs.length-1?'disabled':''} onclick="tqColPos('${cid}',1)">Mover para a direita →</button></div>
<label class="tq-pick" style="flex-direction:row;border:0;padding:0"><input type="checkbox" ${c.conclui?'checked':''} onchange="tqColConcl('${cid}',this.checked)"> <span>Esta coluna conclui as tarefas que eu lidero<br><small>Só uma coluna por quadro. Para quem acompanha, mover para ela só organiza o quadro.</small></span></label>
<p class="tl" style="margin:0">As colunas são só suas: ninguém mais vê esta mudança.</p></div>
<div class="mf"><button class="btn danger sec" ${cs.length<=1?'disabled title="Deixe pelo menos uma coluna"':''} onclick="tqColArq('${cid}')">Arquivar coluna</button><button class="btn" onclick="closeModal()">Fechar</button></div>`)}
function tqColRen(cid){const v=(document.getElementById('tqColN').value||'').trim();if(!v){toast('Escreva o nome da coluna','warn');return}const c=tqU(tqEu()).cols.find(x=>x.id===cid);c.n=v;closeModal();tqMudou();toast('Coluna renomeada para "'+tqH(v)+'"')}
function tqColPos(cid,d){const U=tqU(tqEu()),act=U.cols.filter(c=>!c.arq),i=act.findIndex(c=>c.id===cid),j=i+d;if(j<0||j>=act.length)return;const a=U.cols.indexOf(act[i]),b=U.cols.indexOf(act[j]);[U.cols[a],U.cols[b]]=[U.cols[b],U.cols[a]];tqMudou();tqColMenu(cid)}
function tqColConcl(cid,on){const U=tqU(tqEu());U.cols.forEach(c=>c.conclui=on&&c.id===cid);tqMudou();toast(on?'Esta coluna agora conclui as tarefas que você lidera':'Nenhuma coluna conclui tarefas; use o botão "Concluída" no detalhe')}
function tqColArq(cid){const u=tqEu(),U=tqU(u),cs=tqCols(u);if(cs.length<=1)return;const c=U.cols.find(x=>x.id===cid),dest=cs.find(x=>x.id!==cid);const l=tqDaColuna(u,cid);
 c.arq=true;c.conclui=false;const base=tqDaColuna(u,dest.id).length;l.forEach((t,i)=>U.pos[t.id]={c:dest.id,o:base+i});closeModal();tqMudou();toast(`Coluna "${tqH(c.n)}" arquivada${l.length?`; ${l.length} cartão${l.length>1?'ões foram':' foi'} para "${tqH(dest.n)}"`:''}`)}
function tqColArqDlg(){const U=tqU(tqEu()),a=U.cols.filter(c=>c.arq);openModal(`${mh('Colunas arquivadas')}<div class="mb">${a.length?a.map(c=>`<div class="tq-anx"><div class="grow">${tqH(c.n)}</div><button class="btn sm sec" onclick="tqColRest('${c.id}')">Restaurar</button></div>`).join(''):'<p class="tl">Nenhuma coluna arquivada.</p>'}</div><div class="mf"><button class="btn" onclick="closeModal()">Fechar</button></div>`)}
function tqColRest(cid){const c=tqU(tqEu()).cols.find(x=>x.id===cid);if(c)c.arq=false;tqMudou();tqColArqDlg();toast('Coluna restaurada')}
function tqColNova(){openModal(`${mh('Nova coluna')}<form onsubmit="event.preventDefault();tqColNovaOk()"><div class="mb"><div class="field"><label for="tqColNv">Nome da coluna <span class="req">*</span></label><input class="in" id="tqColNv" maxlength="40" placeholder="Por exemplo: Aguardando material"></div><p class="tl" style="margin:0">Fica só no seu quadro.</p></div><div class="mf"><button type="button" class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" type="submit">Criar coluna</button></div></form>`);setTimeout(()=>{const x=document.getElementById('tqColNv');if(x)x.focus()},0)}
function tqColNovaOk(){const v=(document.getElementById('tqColNv').value||'').trim();if(!v){document.getElementById('tqColNv').closest('.field').classList.add('err');toast('Escreva o nome da coluna','warn');return}
 const U=tqU(tqEu()),cc=U.cols.findIndex(c=>c.conclui&&!c.arq),col={id:tqId('c'),n:v};if(cc>=0)U.cols.splice(cc,0,col);else U.cols.push(col);closeModal();tqMudou();toast('Coluna "'+tqH(v)+'" criada')}
function tqEtqDlg(volta){const u=tqEu(),U=tqU(u);
 openModal(`${mh('Minhas etiquetas')}<div class="mb"><p class="tl" style="margin:0">Só você vê as suas etiquetas. ${tqH(tqNome(u))} pode aplicar várias numa tarefa.</p>
${U.etq.length?U.etq.map(e=>`<div class="tq-etqrow"><input class="in" value="${tqH(e.n)}" maxlength="30" aria-label="Nome da etiqueta" onchange="tqEtqRen('${e.id}',this.value)"><select class="in" aria-label="Cor da etiqueta ${tqH(e.n)}" onchange="tqEtqCor('${e.id}',this.value)">${TQ_CORES.map(c=>`<option value="${c[0]}" ${c[0]===e.cor?'selected':''}>${c[1]}</option>`).join('')}</select><button class="tq-x" aria-label="Apagar a etiqueta ${tqH(e.n)}" onclick="tqEtqDel('${e.id}',${volta?`'${volta}'`:'null'})">${TQI.lixo}</button><span class="tq-etq" style="grid-column:1/-1;justify-self:start;background:${tqCor(e.cor)}">${tqH(e.n)}</span></div>`).join(''):'<p class="tl">Você ainda não tem etiquetas.</p>'}
<form class="tq-inl" onsubmit="event.preventDefault();tqEtqNova(${volta?`'${volta}'`:'null'})"><input class="in" id="tqEtqN" maxlength="30" placeholder="Nova etiqueta" aria-label="Nome da nova etiqueta"><select class="in" id="tqEtqC" aria-label="Cor da nova etiqueta" style="flex:0 0 120px">${TQ_CORES.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('')}</select><button class="btn sm" type="submit">Criar</button></form></div>
<div class="mf"><button class="btn" onclick="${volta?`tqAbrir('${volta}')`:'closeModal()'}">${volta?'Voltar à tarefa':'Fechar'}</button></div>`)}
function tqEtqNova(volta){const n=(document.getElementById('tqEtqN').value||'').trim();if(!n){toast('Escreva o nome da etiqueta','warn');return}tqU(tqEu()).etq.push({id:tqId('e'),n,cor:document.getElementById('tqEtqC').value});tqMudou();tqEtqDlg(volta);toast('Etiqueta criada');setTimeout(()=>{const x=document.getElementById('tqEtqN');if(x)x.focus()},0)}
function tqEtqRen(id,v){v=(v||'').trim();const e=tqU(tqEu()).etq.find(x=>x.id===id);if(!e||!v)return;e.n=v;tqMudou();toast('Etiqueta renomeada')}
function tqEtqCor(id,v){const e=tqU(tqEu()).etq.find(x=>x.id===id);if(!e)return;e.cor=v;tqMudou();const sw=document.activeElement&&document.activeElement.closest('.tq-etqrow');if(sw){const s=sw.querySelector('.tq-etq');if(s)s.style.background=tqCor(v)}toast('Cor alterada para '+tqCorNome(v))}
function tqEtqDel(id,volta){const U=tqU(tqEu()),e=U.etq.find(x=>x.id===id);if(!e)return;U.etq=U.etq.filter(x=>x.id!==id);Object.keys(U.tEtq).forEach(k=>U.tEtq[k]=U.tEtq[k].filter(x=>x!==id));tqMudou();tqEtqDlg(volta);toast('Etiqueta "'+tqH(e.n)+'" apagada')}
function tqRestaurarDlg(){openModal(`${mh('Restaurar dados de exemplo')}<div class="mb"><p style="margin:0">Apaga as tarefas, colunas, etiquetas, avisos e regras de comunicação deste navegador e volta aos dados de exemplo. Não dá para desfazer.</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn danger" onclick="tqRestaurar()">Restaurar</button></div>`,'danger')}
function tqRestaurar(){TQS=tqSeed();TQ_V.filtro='todas';closeModal();tqMudou();const s=document.getElementById('tqEuSel');if(s)s.value=TQS.eu;if(location.hash==='#comunicacao')reView();toast('Dados de exemplo restaurados')}

/* ---------- Nova tarefa ---------- */
function tqPessoaOpt(id,sel){const o=tqOp(id);return `<option value="${id}" ${sel?'selected':''}>${tqH(o.n)} · ${tqH(tqSetorNome(o.setor))} · ${tqH(tqUnidCurta(o.unid))}</option>`}
function tqPickPessoas(name,ids,marcados,excl){return `<div class="tq-pick" role="group" aria-label="Acompanhantes">${ids.filter(i=>i!==excl).map(i=>{const o=tqOp(i);return `<label><input type="checkbox" name="${name}" value="${i}" ${marcados.includes(i)?'checked':''}> <span>${tqH(o.n)} <small>· ${tqH(tqSetorNome(o.setor))} · ${tqH(tqUnidCurta(o.unid))}</small></span></label>`}).join('')||'<small>Ninguém disponível.</small>'}</div>`}
function tqBloqTxt(u){const b=tqBloqueados(u);return b.length?`<p class="tq-bloq">${b.length} pessoa${b.length>1?'s não aparecem':' não aparece'} por causa das regras de Configurações > Comunicação: ${b.map(o=>tqH(o.n)).join(', ')}.</p>`:''}
function tqNova(col){const u=tqEu(),U=tqU(u),perm=tqPermitidos(u).map(o=>o.id),cs=tqCols(u),c0=col||(cs[0]||{}).id;
 openModal(`${mh('Nova tarefa')}<form onsubmit="event.preventDefault();tqNovaOk()" novalidate><div class="mb">
<div class="field" id="tqNfT"><label for="tqNT">Título <span class="req">*</span></label><input class="in" id="tqNT" maxlength="120" placeholder="O que precisa ser feito"><span class="msg" id="tqNTm" hidden>Escreva o título.</span></div>
<div class="field"><label for="tqND">Descrição</label><textarea class="in" id="tqND" maxlength="2000" rows="3" placeholder="Detalhes, se precisar"></textarea></div>
<div class="formgrid"><div class="field"><label for="tqNL">Líder <span class="req">*</span></label><select class="in" id="tqNL" onchange="tqNovaLider()">${tqPessoaOpt(u,true).replace('</option>',' (eu)</option>')}${perm.map(i=>tqPessoaOpt(i,false)).join('')}</select><span class="msg">Quem responde pela tarefa. Pode ser você ou outra pessoa.</span></div>
<div class="field"><label for="tqNP">Prazo</label><input class="in" type="date" id="tqNP" min="${tqHoje()}"><span class="msg">Opcional. Depois de definido, não pode ser alterado.</span></div></div>
<div class="field"><span style="font-size:13px;font-weight:600">Acompanhantes</span><div id="tqNAw">${tqPickPessoas('tqNA',[u,...perm],[],u)}</div></div>
${tqBloqTxt(u)}
${U.etq.length?`<div class="field"><span style="font-size:13px;font-weight:600">Minhas etiquetas</span><div class="row" style="gap:6px;flex-wrap:wrap" role="group" aria-label="Minhas etiquetas">${U.etq.map(e=>`<button type="button" class="tq-etq-t" style="background:${tqCor(e.cor)}" aria-pressed="false" data-e="${e.id}" onclick="this.setAttribute('aria-pressed',this.getAttribute('aria-pressed')==='true'?'false':'true')">${tqH(e.n)}</button>`).join('')}</div></div>`:''}
<div class="field"><label for="tqNC">Coluna no meu quadro</label><select class="in" id="tqNC">${cs.map(c=>`<option value="${c.id}" ${c.id===c0?'selected':''}>${tqH(c.n)}</option>`).join('')}</select></div>
</div><div class="mf"><button type="button" class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" type="submit">Criar tarefa</button></div></form>`);
 setTimeout(()=>{const x=document.getElementById('tqNT');if(x)x.focus()},0)}
function tqNovaLider(){const u=tqEu(),l=document.getElementById('tqNL').value,marc=[...document.querySelectorAll('input[name=tqNA]:checked')].map(x=>x.value);
 document.getElementById('tqNAw').innerHTML=tqPickPessoas('tqNA',[u,...tqPermitidos(u).map(o=>o.id)],marc,l)}
function tqNovaOk(){const u=tqEu(),tit=(document.getElementById('tqNT').value||'').trim();
 if(!tit){document.getElementById('tqNfT').classList.add('err');document.getElementById('tqNTm').hidden=false;document.getElementById('tqNT').focus();return}
 const lider=document.getElementById('tqNL').value,prazo=document.getElementById('tqNP').value;
 if(lider!==u&&!tqPode(u,lider)){toast('As regras de comunicação não permitem escolher esta pessoa','err');return}
 if(prazo&&prazo<tqHoje()){toast('O prazo não pode ser antes de hoje','warn');document.getElementById('tqNP').focus();return}
 const acomp=[...document.querySelectorAll('input[name=tqNA]:checked')].map(x=>x.value).filter(x=>x!==lider&&(x===u||tqPode(u,x)));
 const etqs=[...document.querySelectorAll('.tq-etq-t[aria-pressed=true]')].map(b=>b.dataset.e),col=document.getElementById('tqNC').value,agora=new Date().toISOString();
 const t={id:tqId('t'),titulo:tit,desc:(document.getElementById('tqND').value||'').trim(),criador:u,lider,acomp,criada:agora,prazos:prazo?[{data:prazo,def:agora,por:u}]:[],concl:null,checklists:[],anexos:[],msgs:[],hist:[{em:agora,por:u,t:'Criou a tarefa'+(lider!==u?' para '+tqNome(lider)+' liderar':'')}]};
 tqS().tarefas.push(t);const U=tqU(u);if(etqs.length)U.tEtq[t.id]=etqs;const n=tqDaColuna(u,col).length;U.pos[t.id]={c:col,o:n};
 tqEnvolvidos(t).filter(x=>x!==u).forEach(x=>{tqTopo(x,t.id);tqAvisar(x,'atribuida',t.id,x===lider?tqNome(u)+' criou uma tarefa para você liderar':tqNome(u)+' incluiu você como acompanhante',u)});
 closeModal();tqMudou();const outros=tqEnvolvidos(t).filter(x=>x!==u);
 toast(outros.length?`Tarefa criada. ${outros.map(tqPrim).join(', ')} ${outros.length>1?'vão':'vai'} ver a tarefa piscando. Troque em "Testar como:" para conferir.`:'Tarefa criada no seu quadro');tqFocaCard(t.id)}

/* ---------- Detalhe da tarefa ---------- */
const tqDetAberto=()=>{const b=document.getElementById('backdrop'),m=document.getElementById('modal');return !!(TQ_V.det&&b&&b.classList.contains('show')&&m&&m.classList.contains('tq-det-m'))};
function tqAbrir(id,daLista){if(TQ_SUPRIME)return;const u=tqEu(),t=tqT(id);if(!t||!tqPodeVer(u,t)){toast('Você não participa desta tarefa','warn');return}
 if(!tqEnv(t,u)){TQ_V.det={id,ed:{},rasc:'',ro:true,daLista:!!daLista};openModal(tqDetLeitura(),'wide tq-det-m');const m=document.getElementById('modal');if(m)m.setAttribute('aria-labelledby','tqDetT');return}
 if(!['#tarefas','#home','#tarefas-painel'].includes(location.hash)){TQ_V.abrir=id;location.hash='#tarefas';return}
 let mud=false;tqU(u).avisos.forEach(a=>{if(a.t===id&&!a.lido){a.lido=true;mud=true}});
 TQ_V.det={id,ed:{},rasc:'',daLista:!!daLista};openModal(tqDetHtml(),'wide tq-det-m');if(mud){tqSalvar();tqPinta();tqSinoSync();tqHomeSync()}
 const m=document.getElementById('modal');if(m){m.setAttribute('aria-labelledby','tqDetT')}}
function tqDetPinta(){const m=document.getElementById('modal');if(!m||!TQ_V.det)return;const t=tqT(TQ_V.det.id);if(!t||!tqPodeVer(tqEu(),t)){closeModal();TQ_V.det=null;return}
 if(!tqEnv(t,tqEu())){m.innerHTML=tqDetLeitura();return}
 const a=document.activeElement,k=a&&a.closest&&a.closest('#modal')?(a.dataset.k||a.id):'',st=m.scrollTop,ch=m.querySelector('.tq-chat'),cst=ch?ch.scrollTop:null;
 m.innerHTML=tqDetHtml();m.scrollTop=st;const ch2=m.querySelector('.tq-chat');if(ch2)ch2.scrollTop=cst==null?ch2.scrollHeight:cst;
 if(k){const el=m.querySelector(`[data-k="${k}"]`)||document.getElementById(k);if(el)el.focus()}}
function tqDetHtml(){const u=tqEu(),U=tqU(u),D=TQ_V.det,t=tqT(D.id),lid=t.lider===u,pode=lid||t.criador===u,s=tqSit(t),p=tqPrazo(t),perd=tqPerdidos(t),ed=D.ed;tqGarantePos(u);
 const pos=U.pos[t.id]||{},cs=tqCols(u),meus=U.tEtq[t.id]||[];
 const titulo=ed.tit?`<form class="tq-inl" style="flex:1;margin:0" onsubmit="event.preventDefault();tqTitOk()"><label class="tq-sr" for="tqEdT">Título</label><input class="in" id="tqEdT" data-k="edT" maxlength="120" value="${tqH(t.titulo)}"><button class="btn sm" type="submit">Salvar</button><button class="btn sm ghost" type="button" onclick="tqEd('tit',0)">Cancelar</button></form>`:`<h3 id="tqDetT">${tqH(t.titulo)}</h3>`;
 const topo=`<div class="tq-det-topo"><label for="tqDetCol">No meu quadro, na coluna</label><select class="in" id="tqDetCol" data-k="col" onchange="tqMover('${t.id}',this.value,null)">${cs.map(c=>`<option value="${c.id}" ${c.id===pos.c?'selected':''}>${tqH(c.n)}${c.conclui?' (conclui)':''}</option>`).join('')}</select>${pode&&!ed.tit?`<button class="btn sm ghost" data-k="bTit" onclick="tqEd('tit',1)">${I.edit} Editar título</button>`:''}${t.concl?`<span class="badge ok">Concluída em ${tqDMY(t.concl.em.slice(0,10))}</span>`:s==='atr'?'<span class="badge err">Atrasada</span>':s==='hoje'?'<span class="badge warn">Vence hoje</span>':''}<span>${tqPapel(t,u)==='Acompanho'?TQI.olho+' Você acompanha':tqPapel(t,u)==='Líder'?'Você é o líder':'Você criou'}</span></div>`;
 /* etiquetas */
 const etq=`<section class="tq-sec"><h4><span class="grow">Minhas etiquetas</span><button class="btn sm ghost" data-k="bEtq" onclick="tqEtqDlg('${t.id}')">Gerenciar</button></h4>${U.etq.length?`<div class="row" style="gap:6px;flex-wrap:wrap" role="group" aria-label="Aplicar etiquetas">${U.etq.map(e=>`<button type="button" class="tq-etq-t" data-k="etq_${e.id}" style="background:${tqCor(e.cor)}" aria-pressed="${meus.includes(e.id)}" onclick="tqEtqTog('${e.id}')">${tqH(e.n)}</button>`).join('')}</div><p class="tl" style="margin:6px 0 0">Só você vê as suas etiquetas.</p>`:'<p class="tl">Crie etiquetas em Gerenciar.</p>'}</section>`;
 /* descrição */
 const desc=`<section class="tq-sec"><h4><span class="grow">${TQI.desc} Descrição</span>${pode&&!ed.desc?`<button class="btn sm ghost" data-k="bDesc" onclick="tqEd('desc',1)">${I.edit} Editar</button>`:''}</h4>${ed.desc?`<form onsubmit="event.preventDefault();tqDescOk()"><label class="tq-sr" for="tqEdD">Descrição</label><textarea class="in" id="tqEdD" data-k="edD" rows="4" maxlength="2000">${tqH(t.desc)}</textarea><div class="tq-inl"><button class="btn sm" type="submit">Salvar</button><button class="btn sm ghost" type="button" onclick="tqEd('desc',0)">Cancelar</button></div></form>`:t.desc?`<p>${tqH(t.desc)}</p>`:'<p class="tl">Sem descrição.</p>'}</section>`;
 /* listas de verificação */
 const chk=`<section class="tq-sec"><h4>${TQI.lista} Listas de verificação</h4>${t.checklists.map(k=>{const n=k.itens.length,ok=k.itens.filter(i=>i.ok).length,pc=n?Math.round(ok*100/n):0;return `<div class="tq-chk">${ed['ren_'+k.id]?`<form class="tq-inl" style="margin:0" onsubmit="event.preventDefault();tqChkRenOk('${k.id}')"><label class="tq-sr" for="tqKr_${k.id}">Nome da lista</label><input class="in" id="tqKr_${k.id}" data-k="kr_${k.id}" maxlength="60" value="${tqH(k.n)}"><button class="btn sm" type="submit">Salvar</button><button class="btn sm ghost" type="button" onclick="tqEd('ren_${k.id}',0)">Cancelar</button></form>`:`<div class="tq-chk-h"><b>${tqH(k.n)}</b><button class="btn sm ghost" data-k="kren_${k.id}" onclick="tqEd('ren_${k.id}',1)" aria-label="Renomear a lista ${tqH(k.n)}">Renomear</button><button class="tq-x" data-k="kdel_${k.id}" aria-label="Apagar a lista ${tqH(k.n)}" onclick="tqChkDel('${k.id}')">${TQI.lixo}</button></div>`}
<div class="tq-prog"><span>${pc}%</span><span class="b" role="progressbar" aria-label="Progresso de ${tqH(k.n)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc}"><i class="${n&&ok===n?'full':''}" style="width:${pc}%"></i></span><span>${ok}/${n}</span></div>
${k.itens.map(i=>`<div class="tq-it ${i.ok?'ok':''}"><label><input type="checkbox" data-k="ki_${i.id}" ${i.ok?'checked':''} onchange="tqItTog('${k.id}','${i.id}')"><span>${tqH(i.t)}</span></label><button class="tq-x" data-k="kix_${i.id}" aria-label="Apagar o item ${tqH(i.t)}" onclick="tqItDel('${k.id}','${i.id}')">${TQI.lixo}</button></div>`).join('')}
<form class="tq-inl" onsubmit="event.preventDefault();tqItNovo('${k.id}')"><input class="in" id="tqKi_${k.id}" data-k="kin_${k.id}" maxlength="140" placeholder="Novo item" aria-label="Novo item em ${tqH(k.n)}"><button class="btn sm sec" type="submit">Adicionar</button></form></div>`}).join('')}
<form class="tq-inl" onsubmit="event.preventDefault();tqChkNova()"><input class="in" id="tqKn" data-k="kn" maxlength="60" placeholder="Nome da nova lista (ex.: Materiais)" aria-label="Nome da nova lista de verificação"><button class="btn sm sec" type="submit">${I.plus} Nova lista</button></form></section>`;
 /* anexos */
 const anx=`<section class="tq-sec"><h4><span class="grow">${TQI.clip} Anexos</span><button class="btn sm sec" data-k="bAnx" onclick="document.getElementById('tqArq').click()">Anexar arquivo</button><input type="file" id="tqArq" multiple hidden onchange="tqAnexar(this.files)"></h4>${t.anexos.length?t.anexos.map(a=>{const ext=(a.n.split('.').pop()||'').slice(0,4);return `<div class="tq-anx"><span class="tq-ext" aria-hidden="true">${tqH(ext)}</span><div class="grow">${tqH(a.n)}<small>${tqTam(a.tam)} · ${tqH(tqPrim(a.por))} · ${tqDHc(a.em)}${a.b64?'':' · só o nome ficou guardado (arquivo grande para o protótipo)'}</small></div>${a.b64?`<button class="btn sm ghost" data-k="adl_${a.id}" onclick="tqBaixar('${a.id}')">${I.dl} Baixar</button>`:''}${a.por===u||lid?`<button class="tq-x" data-k="ax_${a.id}" aria-label="Remover o anexo ${tqH(a.n)}" onclick="tqAnxDel('${a.id}')">${TQI.lixo}</button>`:''}</div>`}).join(''):'<p class="tl">Nenhum anexo.</p>'}<p class="tl" style="margin:4px 0 0">Até 10 MB por arquivo. No protótipo, o conteúdo só fica guardado até 1 MB; acima disso fica só o nome.</p></section>`;
 /* conversa */
 const conv=`<section class="tq-sec"><h4>${TQI.conv} Conversa</h4><div class="tq-chat" aria-live="polite" aria-label="Mensagens">${t.msgs.length?t.msgs.map(m=>`<div class="tq-msg ${m.de===u?'eu':''}"><span class="tq-av g" aria-hidden="true">${tqH(tqOp(m.de).ini)}</span><div class="bl"><small>${tqH(m.de===u?'Você':tqNome(m.de))} · ${tqDHc(m.em)}</small>${tqMsgHtml(m.t,t)}</div></div>`).join(''):'<p class="tl" style="margin:0">Nenhuma mensagem. Escreva @ para chamar alguém.</p>'}</div>
<form class="tq-msgf" onsubmit="event.preventDefault();tqMsgEnviar()"><label class="tq-sr" for="tqMsg">Mensagem</label><textarea class="in" id="tqMsg" data-k="msg" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="tqSug" maxlength="1000" placeholder="Escreva sua mensagem. Use @ para chamar um envolvido." oninput="TQ_V.det.rasc=this.value;tqSugAtualiza()" onkeydown="tqMsgTecla(event)" onblur="setTimeout(tqSugFecha,150)">${tqH(D.rasc||'')}</textarea><ul class="tq-sug" id="tqSug" role="listbox" aria-label="Pessoas para mencionar" hidden></ul><button class="btn" type="submit">Enviar</button></form></section>`;
 /* histórico */
 const hist=`<details class="tq-sec"><summary style="cursor:pointer;font-weight:700;color:var(--fg-strong);font-size:14px">Histórico (${t.hist.length})</summary><div class="tq-hist" style="margin-top:8px">${t.hist.slice().reverse().map(h=>`<div><small>${tqDH(h.em)}</small><br><b>${tqH(tqNome(h.por))}</b>: ${tqH(h.t)}</div>`).join('')}</div></details>`;
 /* lado: pessoas, prazo, datas, conclusão */
 const perm=tqPermitidos(u).map(o=>o.id);
 const lider=`<div class="tq-side-b"><h4>Líder</h4><div class="tq-pess"><span class="tq-av g lid" aria-hidden="true">${tqH(tqOp(t.lider).ini)}</span><div>${tqH(tqNome(t.lider))}<small>${tqH(tqSetorNome(tqOp(t.lider).setor))} · ${tqH(tqUnidCurta(tqOp(t.lider).unid))}</small></div></div>
${lid?(ed.lid?`<div class="field"><label for="tqNovoLid">Passar a liderança para</label><select class="in" id="tqNovoLid" data-k="nl">${perm.map(i=>tqPessoaOpt(i,false)).join('')}</select><span class="msg">Você passa a acompanhar a tarefa.</span></div><div class="tq-inl"><button class="btn sm" data-k="nlok" onclick="tqLiderOk()">Passar</button><button class="btn sm ghost" onclick="tqEd('lid',0)">Cancelar</button></div>`:`<button class="btn sm sec" data-k="bLid" onclick="tqEd('lid',1)">Passar a liderança</button>`):''}</div>`;
 const acomp=t.acomp.filter(x=>x!==t.lider);
 const acs=`<div class="tq-side-b"><h4>Acompanhantes</h4>${ed.ac?`${tqPickPessoas('tqEA',[...new Set([...perm,...acomp,...(t.criador!==u?[t.criador]:[])])],acomp,t.lider)}${tqBloqTxt(u)}<div class="tq-inl"><button class="btn sm" data-k="acok" onclick="tqAcOk()">Salvar</button><button class="btn sm ghost" onclick="tqEd('ac',0)">Cancelar</button></div>`:`${acomp.length?acomp.map(x=>`<div class="tq-pess"><span class="tq-av g" aria-hidden="true">${tqH(tqOp(x).ini)}</span><div>${tqH(tqNome(x))}${x===u?' (você)':''}<small>${tqH(tqSetorNome(tqOp(x).setor))} · ${tqH(tqUnidCurta(tqOp(x).unid))}</small></div></div>`).join(''):'<span class="tl">Ninguém.</span>'}${lid?`<button class="btn sm sec" data-k="bAc" onclick="tqEd('ac',1)">Alterar acompanhantes</button>`:'<span class="tl">Só o líder altera.</span>'}`}</div>`;
 const atr=p&&p<tqHoje()&&!t.concl;
 const prazo=`<div class="tq-side-b"><h4>${TQI.relogio} Prazo</h4>${p?`<div><b class="${t.concl?'prazo-ok':s==='atr'?'prazo-err':s==='hoje'?'prazo-warn':''}">${perd.length?'Novo prazo: ':''}${tqDMY(p)}</b>${s==='atr'?' · atrasada':s==='hoje'?' · vence hoje':''}</div>`:'<span class="tl">Sem prazo.</span>'}
${perd.map((x,i)=>`<small class="prazo-err" style="display:block">${i+1}º prazo perdido em ${tqDMY(x.data)}</small>`).join('')}${perd.length?`<small class="tl">${perd.length} prazo${perd.length>1?'s':''} perdido${perd.length>1?'s':''} no total.</small>`:''}
${lid&&!t.concl&&(!p||atr)?(ed.prz?`<form class="field" onsubmit="event.preventDefault();tqPrazoOk()"><label for="tqPz">${p?'Novo prazo':'Prazo'}</label><input class="in" type="date" id="tqPz" data-k="pz" min="${tqHoje()}"><span class="msg">Depois de salvo, não pode ser alterado.</span><div class="tq-inl"><button class="btn sm" type="submit">Salvar prazo</button><button class="btn sm ghost" type="button" onclick="tqEd('prz',0)">Cancelar</button></div></form>`:`<button class="btn sm ${atr?'':'sec'}" data-k="bPz" onclick="tqEd('prz',1)">${p?'Definir novo prazo':'Definir prazo'}</button>`):p?`<small class="tl">O prazo não pode ser alterado.${lid&&!t.concl?' Se vencer, você poderá definir um novo prazo.':''}</small>`:lid?'':'<small class="tl">Só o líder define o prazo.</small>'}</div>`;
 const datas=`<div class="tq-side-b"><h4>Criação</h4><div>${tqDH(t.criada)}</div><small class="tl">por ${tqH(tqNome(t.criador))}</small></div>`;
 const fim=`<div class="tq-side-b"><h4>Conclusão</h4>${t.concl?`<div>Concluída por ${tqH(tqPrim(t.concl.por))} em ${tqDH(t.concl.em)}</div>${lid?`<button class="btn sm sec" data-k="bReab" onclick="tqReabrir()">Reabrir</button>`:''}`:lid?`<button class="btn" data-k="bConc" onclick="tqConcluir()">${I.check} Concluída</button><small class="tl">${tqColConclui(u)?`Ou mova para a sua coluna "${tqH(tqColConclui(u).n)}".`:''}</small>`:`<small class="tl">Só o líder conclui. Para você, mover para "Feito" só organiza o seu quadro.</small>`}</div>`;
 return `<div class="mh">${titulo}<button class="ibtn plain" aria-label="Fechar" onclick="closeModal()">${I.x}</button></div><div class="mb tq-det">${topo}<div class="tq-det-g"><div class="tq-det-main">${etq}${desc}${chk}${anx}${conv}${hist}</div><aside class="tq-det-side" aria-label="Pessoas e prazo">${D.daLista&&TQ_V.lista?`<button class="btn sm ghost" onclick="tqListaReabre()">${TQI.volta} Voltar à lista</button>`:''}${lider}${acs}${prazo}${datas}${fim}<button class="btn sm ghost" onclick="tqMoverDlg('${t.id}',1)">Mover para outra posição</button></aside></div></div>`}
const tqDT=()=>tqT(TQ_V.det.id);
function tqEd(k,on){TQ_V.det.ed[k]=!!on;tqDetPinta();const alvo={tit:'tqEdT',desc:'tqEdD',lid:'tqNovoLid',prz:'tqPz'}[k]||(k.startsWith('ren_')?'tqKr_'+k.slice(4):'');if(on&&alvo){const el=document.getElementById(alvo);if(el)el.focus()}
 if(on&&k==='ac'){const el=document.querySelector('#modal input[name=tqEA]');if(el)el.focus()}}
function tqTitOk(){const t=tqDT(),v=(document.getElementById('tqEdT').value||'').trim();if(!v){toast('Escreva o título','warn');return}if(v!==t.titulo){tqLog(t,tqEu(),'Mudou o título para "'+v+'"');t.titulo=v}TQ_V.det.ed.tit=false;tqMudou()}
function tqDescOk(){const t=tqDT(),v=(document.getElementById('tqEdD').value||'').trim();if(v!==t.desc){tqLog(t,tqEu(),'Alterou a descrição');t.desc=v}TQ_V.det.ed.desc=false;tqMudou()}
function tqEtqTog(e){const U=tqU(tqEu()),id=TQ_V.det.id,l=U.tEtq[id]||[];U.tEtq[id]=l.includes(e)?l.filter(x=>x!==e):[...l,e];tqMudou()}
function tqChkNova(){const v=(document.getElementById('tqKn').value||'').trim();if(!v){toast('Escreva o nome da lista','warn');return}const t=tqDT(),k={id:tqId('k'),n:v,itens:[]};t.checklists.push(k);tqLog(t,tqEu(),'Criou a lista "'+v+'"');tqMudou();const el=document.getElementById('tqKi_'+k.id);if(el)el.focus()}
function tqChkRenOk(kid){const t=tqDT(),k=t.checklists.find(x=>x.id===kid),v=(document.getElementById('tqKr_'+kid).value||'').trim();if(!k||!v)return;tqLog(t,tqEu(),'Renomeou a lista "'+k.n+'" para "'+v+'"');k.n=v;TQ_V.det.ed['ren_'+kid]=false;tqMudou()}
function tqChkDel(kid){const t=tqDT(),k=t.checklists.find(x=>x.id===kid);if(!k)return;t.checklists=t.checklists.filter(x=>x.id!==kid);tqLog(t,tqEu(),'Apagou a lista "'+k.n+'"');tqMudou();toast('Lista "'+tqH(k.n)+'" apagada');const el=document.getElementById('tqKn');if(el)el.focus()}
function tqItNovo(kid){const el=document.getElementById('tqKi_'+kid),v=(el.value||'').trim();if(!v)return;const t=tqDT(),k=t.checklists.find(x=>x.id===kid);k.itens.push({id:tqId('i'),t:v,ok:false});tqLog(t,tqEu(),'Adicionou "'+v+'" em "'+k.n+'"');tqMudou();const e2=document.getElementById('tqKi_'+kid);if(e2)e2.focus()}
function tqItTog(kid,iid){const t=tqDT(),k=t.checklists.find(x=>x.id===kid),i=k&&k.itens.find(x=>x.id===iid);if(!i)return;i.ok=!i.ok;tqLog(t,tqEu(),(i.ok?'Marcou':'Desmarcou')+' "'+i.t+'"');tqMudou()}
function tqItDel(kid,iid){const t=tqDT(),k=t.checklists.find(x=>x.id===kid);if(!k)return;const i=k.itens.find(x=>x.id===iid);k.itens=k.itens.filter(x=>x.id!==iid);tqLog(t,tqEu(),'Apagou o item "'+(i?i.t:'')+'"');tqMudou();const el=document.getElementById('tqKi_'+kid);if(el)el.focus()}
function tqAnexar(files){const t=tqDT(),u=tqEu();[...(files||[])].forEach(f=>{
 if(f.size>TQ_ANX_LIM){toast(`"${tqH(f.name)}" passa de 10 MB e não foi anexado`,'err');return}
 const a={id:tqId('a'),n:f.name,tipo:f.type||'arquivo',tam:f.size,b64:null,por:u,em:new Date().toISOString()};
 const fim=()=>{t.anexos.push(a);tqLog(t,u,'Anexou "'+f.name+'"');
  if(!tqSalvar()&&a.b64){a.b64=null;tqSalvar();toast(`Sem espaço no navegador: de "${tqH(f.name)}" ficou só o nome`,'warn')}
  else if(!a.b64)toast(`"${tqH(f.name)}" tem ${tqTam(f.size)}: no protótipo fica só o nome (o conteúdo é guardado até 1 MB)`,'warn');else toast(`"${tqH(f.name)}" anexado`);tqMudou()};
 if(f.size<=TQ_ANX_MAX){const r=new FileReader();r.onload=()=>{a.b64=String(r.result||'');fim()};r.onerror=()=>fim();r.readAsDataURL(f)}else fim()})}
function tqBaixar(aid){const a=tqDT().anexos.find(x=>x.id===aid);if(!a||!a.b64)return;const l=document.createElement('a');l.href=a.b64;l.download=a.n;document.body.appendChild(l);l.click();l.remove()}
function tqAnxDel(aid){const t=tqDT(),a=t.anexos.find(x=>x.id===aid);if(!a)return;t.anexos=t.anexos.filter(x=>x.id!==aid);tqLog(t,tqEu(),'Removeu o anexo "'+a.n+'"');tqMudou();toast('Anexo removido')}
/* Conversa com @menção (só envolvidos) */
function tqMsgHtml(txt,t){let h=tqH(txt);tqEnvolvidos(t).map(tqNome).sort((a,b)=>b.length-a.length).forEach(n=>{const e='@'+tqH(n);h=h.split(e).join('\u0000'+e+'\u0001')});return h.replace(/\u0000/g,'<b class="tq-men">').replace(/\u0001/g,'</b>')}
let TQ_SUG={l:[],i:0,ini:-1};
function tqSugAtualiza(){const ta=document.getElementById('tqMsg'),ul=document.getElementById('tqSug');if(!ta||!ul)return;const v=ta.value,c=ta.selectionStart,antes=v.slice(0,c),m=antes.match(/(^|\s)@([^\s@]*(?: [^\s@]*)?)$/);
 if(!m){tqSugFecha();return}const q=semAc(m[2]),t=tqDT(),u=tqEu();const l=tqEnvolvidos(t).filter(x=>x!==u).filter(x=>semAc(tqNome(x)).includes(q)||semAc(tqNome(x).replace(/^Dra?\. /,'')).startsWith(q));
 if(!l.length){tqSugFecha();return}TQ_SUG={l,i:0,ini:c-m[2].length-1};ul.innerHTML=l.map((x,i)=>`<li id="tqSug_${i}" role="option" aria-selected="${i===0}" onmousedown="event.preventDefault();tqSugEscolhe(${i})"><span class="tq-av g" aria-hidden="true" style="width:24px;height:24px;font-size:10px">${tqH(tqOp(x).ini)}</span>${tqH(tqNome(x))}</li>`).join('');ul.hidden=false;ta.setAttribute('aria-expanded','true');ta.setAttribute('aria-activedescendant','tqSug_0')}
function tqSugFecha(){const ul=document.getElementById('tqSug'),ta=document.getElementById('tqMsg');if(ul)ul.hidden=true;if(ta){ta.setAttribute('aria-expanded','false');ta.removeAttribute('aria-activedescendant')}TQ_SUG.l=[]}
function tqSugEscolhe(i){const ta=document.getElementById('tqMsg'),x=TQ_SUG.l[i];if(!ta||!x)return;const v=ta.value,c=ta.selectionStart,ins='@'+tqNome(x)+' ';ta.value=v.slice(0,TQ_SUG.ini)+ins+v.slice(c);const p=TQ_SUG.ini+ins.length;ta.setSelectionRange(p,p);TQ_V.det.rasc=ta.value;tqSugFecha();ta.focus()}
function tqMsgTecla(e){const ul=document.getElementById('tqSug'),aberta=ul&&!ul.hidden&&TQ_SUG.l.length;
 if(aberta&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();TQ_SUG.i=(TQ_SUG.i+(e.key==='ArrowDown'?1:-1)+TQ_SUG.l.length)%TQ_SUG.l.length;ul.querySelectorAll('li').forEach((li,i)=>li.setAttribute('aria-selected',i===TQ_SUG.i));e.target.setAttribute('aria-activedescendant','tqSug_'+TQ_SUG.i);return}
 if(aberta&&(e.key==='Enter'||e.key==='Tab')){e.preventDefault();tqSugEscolhe(TQ_SUG.i);return}
 if(aberta&&e.key==='Escape'){e.preventDefault();e.stopPropagation();tqSugFecha();return}
 if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();tqMsgEnviar()}}
function tqMsgEnviar(){const ta=document.getElementById('tqMsg'),v=(ta.value||'').trim();if(!v)return;const t=tqDT(),u=tqEu();
 t.msgs.push({id:tqId('m'),de:u,t:v,em:new Date().toISOString()});TQ_V.det.rasc='';
 const men=tqEnvolvidos(t).filter(x=>x!==u&&v.includes('@'+tqNome(x)));
 men.forEach(x=>tqAvisar(x,'mencao',t.id,tqNome(u)+' mencionou você na conversa',u));
 tqEnvolvidos(t).filter(x=>x!==u&&!men.includes(x)).forEach(x=>tqAvisar(x,'mensagem',t.id,tqNome(u)+': '+(v.length>60?v.slice(0,60)+'…':v),u));
 if(men.length)tqLog(t,u,'Mencionou '+men.map(tqNome).join(', ')+' na conversa');
 tqMudou();const ta2=document.getElementById('tqMsg');if(ta2)ta2.focus();if(men.length)toast(`${men.map(tqPrim).join(', ')} ${men.length>1?'vão':'vai'} ver a tarefa piscando`)}
function tqLiderOk(){const t=tqDT(),u=tqEu(),n=document.getElementById('tqNovoLid').value;if(!n||n===u||!tqPode(u,n))return;
 t.lider=n;t.acomp=[...new Set([...t.acomp.filter(x=>x!==n),u])];tqLog(t,u,'Passou a liderança para '+tqNome(n));if(!tqU(n).pos[t.id])tqTopo(n,t.id);
 tqAvisar(n,'lideranca',t.id,tqNome(u)+' passou a liderança da tarefa para você',u);TQ_V.det.ed.lid=false;tqMudou();toast('Liderança passada para '+tqH(tqNome(n))+'. Você passa a acompanhar.')}
function tqAcOk(){const t=tqDT(),u=tqEu(),antes=t.acomp.filter(x=>x!==t.lider),novo=[...document.querySelectorAll('#modal input[name=tqEA]:checked')].map(x=>x.value).filter(x=>x!==t.lider);
 const add=novo.filter(x=>!antes.includes(x)),rem=antes.filter(x=>!novo.includes(x));t.acomp=novo;
 add.forEach(x=>{if(!tqU(x).pos[t.id])tqTopo(x,t.id);tqAvisar(x,'atribuida',t.id,tqNome(u)+' incluiu você como acompanhante',u)});
 if(add.length)tqLog(t,u,'Incluiu como acompanhante: '+add.map(tqNome).join(', '));if(rem.length)tqLog(t,u,'Tirou dos acompanhantes: '+rem.map(tqNome).join(', '));
 TQ_V.det.ed.ac=false;tqMudou();toast(add.length||rem.length?'Acompanhantes atualizados':'Nada mudou')}
function tqPrazoOk(){const t=tqDT(),u=tqEu(),v=document.getElementById('tqPz').value,p=tqPrazo(t);if(!v){toast('Escolha a data do prazo','warn');return}if(v<tqHoje()){toast('O prazo não pode ser antes de hoje','warn');return}
 if(t.lider!==u||(p&&p>=tqHoje())){toast('O prazo não pode ser alterado','err');return}
 t.prazos.push({data:v,def:new Date().toISOString(),por:u});tqLog(t,u,p?'Definiu novo prazo: '+tqDM(v)+' (prazo de '+tqDM(p)+' perdido)':'Definiu o prazo: '+tqDM(v));TQ_V.det.ed.prz=false;tqMudou();toast(p?'Novo prazo definido para '+tqDMY(v):'Prazo definido para '+tqDMY(v))}
function tqConcluir(){const t=tqDT(),u=tqEu();if(t.lider!==u||t.concl)return;tqConcluirSem(t,u);const cc=tqColConclui(u);if(cc){const n=tqDaColuna(u,cc.id).filter(x=>x.id!==t.id).length;tqU(u).pos[t.id]={c:cc.id,o:n}}tqMudou();toast('Tarefa concluída'+(cc?' e movida para "'+tqH(cc.n)+'"':''))}
function tqReabrir(){const t=tqDT(),u=tqEu();if(t.lider!==u||!t.concl)return;t.concl=null;tqLog(t,u,'Reabriu a tarefa');const U=tqU(u),cc=tqColConclui(u);if(cc&&U.pos[t.id]&&U.pos[t.id].c===cc.id){const c0=tqCols(u).find(c=>!c.conclui);if(c0)U.pos[t.id]={c:c0.id,o:-1}}tqMudou();toast('Tarefa reaberta')}

/* ---------- Sininho no cabeçalho ---------- */
function tqSinoInstala(){const a=document.querySelector('.top .actions');if(!a||document.getElementById('tqSino'))return;
 a.insertAdjacentHTML('afterbegin',`<button type="button" class="ibtn plain tq-sino" id="tqSino" aria-label="Avisos das tarefas" title="Avisos das tarefas" onclick="tqSinoAbrir()">${TQI.sino}<span class="nl-badge" id="tqSinoN" aria-hidden="true" hidden>0</span></button>`);tqSinoSync()}
function tqSinoSync(){const b=document.getElementById('tqSino');if(!b)return;const n=tqNaoLidos(tqEu()),s=document.getElementById('tqSinoN');s.textContent=n>99?'99+':n;s.hidden=!n;b.setAttribute('aria-label',`Avisos das tarefas de ${tqNome(tqEu())}: ${n?n+' não lido'+(n>1?'s':''):'nenhum não lido'}`)}
function tqSinoAbrir(){const d=document.getElementById('drawer');if(d&&d.classList.contains('show')&&d.dataset.tq){closeDrawer();return}tqGerarPrazos();
 const u=tqEu(),l=tqAvisosDe(u).slice(0,40),n=l.filter(a=>!a.lido).length;
 openDrawer('Avisos das tarefas',`<p class="tl" style="margin:0 0 8px">Testando como <b>${tqH(tqNome(u))}</b>. Troque a pessoa em Minhas tarefas.</p><div class="row" style="gap:8px;margin-bottom:10px;flex-wrap:wrap"><a class="btn sm sec" href="#tarefas" onclick="closeDrawer()">Abrir meu quadro</a>${n?`<button class="btn sm ghost" onclick="tqAvisosLidos()">Marcar todos como lidos</button>`:''}</div>
<div class="tq-avl">${l.length?l.map(a=>{const t=tqT(a.t);return `<button class="tq-avi ${a.lido?'':'nl'}" onclick="tqAvisoAbrir('${a.id}')"><span class="tq-dot" aria-hidden="true"></span><span class="tq-avt"><b>${tqH(TQ_AV_TIPO[a.tipo]||'Aviso')}${a.lido?'':'<span class="tq-sr"> (não lido)</span>'}</b>${tqH(t?t.titulo:'')}<small>${tqH(a.txt)} · ${tqDHc(a.em)}</small></span></button>`}).join(''):'<p class="tl">Nenhum aviso.</p>'}</div>`);
 if(d)d.dataset.tq='1';const obs=()=>{if(d&&!d.classList.contains('show'))delete d.dataset.tq};setTimeout(obs,0)}
{const _cd=closeDrawer;closeDrawer=function(){const d=document.getElementById('drawer');if(d)delete d.dataset.tq;return _cd.apply(this,arguments)}}
{const _od=openDrawer;openDrawer=function(){const d=document.getElementById('drawer');if(d)delete d.dataset.tq;return _od.apply(this,arguments)}}
function tqAvisosLidos(){tqU(tqEu()).avisos.forEach(a=>a.lido=true);tqMudou();tqSinoAbrir();toast('Avisos marcados como lidos')}
function tqAvisoAbrir(aid){const u=tqEu(),a=tqU(u).avisos.find(x=>x.id===aid);if(!a)return;a.lido=true;tqSalvar();closeDrawer();tqSinoSync();const t=tqT(a.t);if(!t||!tqEnv(t,u)){toast('Você não participa mais desta tarefa','warn');return}
 if(location.hash==='#tarefas'){tqPinta();tqAbrir(a.t)}else{TQ_V.abrir=a.t;location.hash='#tarefas'}}

/* ---------- Número no menu "Minhas tarefas": atrasadas + vencem hoje ---------- */
function tqMenuSync(){const el=document.querySelector('#side a[href="#tarefas"]');if(!el)return;let b=el.querySelector('.tq-mn');const n=tqUrgentes(tqEu());
 if(!b){b=document.createElement('span');b.className='nl-badge tq-mn';b.style.marginLeft='auto';el.appendChild(b)}b.textContent=n;b.hidden=!n;b.setAttribute('aria-label',n+' atrasada'+(n>1?'s':'')+' ou vencendo hoje');b.title=n+' atrasada'+(n>1?'s':'')+' ou vencendo hoje'}
{const _rm=renderMenu;renderMenu=function(){const r=_rm.apply(this,arguments);try{tqMenuSync()}catch(e){}return r}}

/* ---------- Início: bloco "Suas tarefas" com as novas e as atrasadas ---------- */
function tqHomeHtml(){const u=tqEu();tqGerarPrazos();const vis=tqVis(u),novas=vis.filter(t=>tqPiscaDe(u,t)),atr=vis.filter(t=>tqSit(t)==='atr'&&!novas.includes(t)),hoje=vis.filter(t=>tqSit(t)==='hoje').length;
 const row=(t,k)=>{const pis=tqPiscaDe(u,t),p=tqPrazo(t);return `<button class="tq-row ${pis?'tq-pisca':''}" onclick="tqAbrirDaHome('${t.id}')">${pis?`<span class="tq-flag ${pis==='mencao'?'men':''}">${pis==='mencao'?'Você foi mencionado':'Nova'}</span>`:k==='atr'?'<span class="tq-flag" style="color:var(--err);background:var(--err-soft)">Atrasada</span>':''}<b>${tqH(t.titulo)}</b>${p?`<span class="tq-b ${tqSit(t)==='atr'?'atr':tqSit(t)==='hoje'?'hoje':''}">${TQI.relogio}${tqPerdidos(t).length?'Novo prazo: ':''}${tqDM(p)}</span>`:''}<small class="tl">${tqH(tqPapelLinha(t,u))}</small></button>`};
 return `<section class="card at-card tq-home" id="tqHome" aria-label="Suas tarefas"><div class="inicio-tit" style="justify-content:space-between"><h3>Suas tarefas</h3><span class="tl">testando como ${tqH(tqNome(u))}${hoje?` · ${hoje} vence${hoje>1?'m':''} hoje`:''}</span><a class="btn sm sec" href="#tarefas">Abrir meu quadro</a></div>
<div class="tq-home-l">${novas.length||atr.length?[...novas.map(t=>row(t,'nova')),...atr.map(t=>row(t,'atr'))].slice(0,6).join('')+(novas.length+atr.length>6?`<a class="tl" href="#tarefas">e mais ${novas.length+atr.length-6} no seu quadro</a>`:''):'<p class="tl" style="margin:0">Nada novo nem atrasado. Bom trabalho!</p>'}</div></section>`}
function tqAbrirDaHome(id){TQ_V.abrir=id;location.hash='#tarefas'}
function tqHomeSync(){const el=document.getElementById('tqHome');if(el)el.outerHTML=tqHomeHtml()}
{const _hm=VIEWS.home;VIEWS.home=function(){const h=_hm.apply(this,arguments);try{const b=tqHomeHtml();for(const m of ['<div class="r18r-home-bts">','<div class="inicio-grid">']){const i=h.indexOf(m);if(i>=0)return h.slice(0,i)+b+h.slice(i)}return h+b}catch(e){return h}}}

/* Depois de cada tela: sininho, número do menu e tarefa pendente de abrir */
{const _pr=posRender;posRender=function(id){_pr.apply(this,arguments);try{tqSinoInstala();tqSinoSync();tqMenuSync();if(id==='tarefas'&&TQ_V.abrir){const a=TQ_V.abrir;TQ_V.abrir=null;setTimeout(()=>tqAbrir(a),30)}}catch(e){}}}

/* ---------- Configurações > Comunicação (administrador) ---------- */
/* VIEWS.comunicacao: ver a seção da 2ª rodada, no fim do arquivo (permissão pelo administrador de cada unidade). */
const tqComR=u=>{const S=tqS();if(!S.com[u])S.com[u]={modo:'todas',unids:[],limSet:false,setores:[]};return S.com[u]};
function tqComSalva(msg){tqSalvar();if(location.hash==='#comunicacao')reView();tqHomeSync();toast(msg||'Regra salva')}
function tqComModo(u,m){tqComR(u).modo=m;tqComSalva(m==='todas'?tqUnidCurta(u)+' se comunica com todas as unidades':tqUnidCurta(u)+' só com as unidades marcadas')}
function tqComUnid(u,v,on){const r=tqComR(u);r.unids=on?[...new Set([...(r.unids||[]),v])]:(r.unids||[]).filter(x=>x!==v);tqComSalva()}
function tqComLim(u,on){tqComR(u).limSet=!!on;tqComSalva(on?'Limite de setores ligado em '+tqUnidCurta(u):'Limite de setores desligado em '+tqUnidCurta(u))}
function tqComSet(u,s,on){const r=tqComR(u);r.setores=on?[...new Set([...(r.setores||[]),s])]:(r.setores||[]).filter(x=>x!==s);tqComSalva()}
function tqSetNovo(){const el=document.getElementById('tqSetN'),v=(el.value||'').trim();if(!v){toast('Escreva o nome do setor','warn');return}tqS().setores.push({id:tqId('s'),n:v});tqComSalva('Setor "'+tqH(v)+'" criado')}
function tqSetRen(id,v){v=(v||'').trim();const s=tqS().setores.find(x=>x.id===id);if(!s||!v)return;s.n=v;tqComSalva('Setor renomeado')}
function tqSetDel(id){const S=tqS();if(S.ops.some(o=>o.setor===id))return;S.setores=S.setores.filter(x=>x.id!==id);Object.values(S.com).forEach(r=>r.setores=(r.setores||[]).filter(x=>x!==id));tqComSalva('Setor apagado')}
function tqOpSetor(o,s){const p=tqS().ops.find(x=>x.id===o);if(!p)return;p.setor=s;tqComSalva(tqH(p.n)+' agora é do setor '+tqH(tqSetorNome(s)))}

/* Outra aba do navegador mudou os dados: recarrega */
try{addEventListener('storage',e=>{if(e.key!==TQ_KEY)return;TQS=null;tqS();tqPinta();tqSinoSync();tqMenuSync();tqHomeSync();if(tqDetAberto())tqDetPinta()})}catch(e){}

/* ==========================================================================
   2ª rodada (16/11): hierarquia, alcance, consulta das tarefas dos outros e painel de desempenho
   ========================================================================== */
document.head.insertAdjacentHTML('beforeend',`<style>
.tq-sim optgroup{font-weight:700}
.tq-sim small b{color:var(--fg-strong)}
.tq-filtros{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:flex-end;margin:0 0 14px}
.tq-filtros .field{flex:0 1 220px}
.tq-filtros select.in{height:38px}
.tq-filtros .chips{display:flex;gap:6px}.tq-filtros .chip{white-space:nowrap}.tq-filtros .field.per{flex:0 0 auto}
.tq-kpis{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin:0 0 16px}
.tq-kpi{all:unset;box-sizing:border-box;cursor:pointer;border:1px solid var(--border);border-radius:14px;padding:12px 14px;background:var(--surface);display:flex;flex-direction:column;gap:2px}
.tq-kpi:hover{border-color:var(--accent)}
.tq-kpi:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.tq-kpi .lab{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--fg2)}
.tq-kpi .num{font-size:26px;font-weight:800;color:var(--fg-strong);line-height:1.15}
.tq-kpi .hint{font-size:12px;color:var(--fg2)}
.tq-kpi.err .num{color:var(--err)}.tq-kpi.ok .num{color:var(--ok)}.tq-kpi.warn .num{color:var(--warn)}
.tq-pg{display:grid;gap:16px;grid-template-columns:minmax(0,1fr)}
.tq-leg{display:flex;flex-wrap:wrap;gap:8px 14px;font-size:12.5px;color:var(--fg);align-items:center}
.tq-leg span{display:inline-flex;align-items:center;gap:6px}
.tq-leg i{width:18px;height:12px;border-radius:3px;display:inline-block}
.tq-bars{display:flex;flex-direction:column;gap:8px}
.tq-bar-r{display:grid;grid-template-columns:180px minmax(0,1fr);gap:10px;align-items:center}
.tq-bar-n{all:unset;box-sizing:border-box;cursor:pointer;font-size:13.5px;font-weight:600;color:var(--fg-strong);border-radius:8px;padding:2px 4px;overflow-wrap:anywhere}
.tq-bar-n small{display:block;font-weight:400;color:var(--fg2);font-size:11.5px}
.tq-bar-n:hover{color:var(--accent)}.tq-bar-n:focus-visible{outline:3px solid var(--focus)}
.tq-bar-t{min-width:0}
.tq-bar-in{display:flex;gap:2px;max-width:100%;min-height:30px}
.tq-sg{all:unset;box-sizing:border-box;cursor:pointer;min-width:30px;height:30px;display:grid;place-items:center;font-size:12.5px;font-weight:800;border-radius:6px;border:2px solid}
.tq-sg:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
.tq-sg:hover{filter:brightness(1.08)}
.tq-sg.ab{background:var(--info-soft);border-color:var(--info);color:var(--info)}
.tq-sg.atr{background:repeating-linear-gradient(45deg,var(--err-soft) 0 6px,var(--surface) 6px 9px);border-color:var(--err);color:var(--err)}
.tq-sg.co{background:var(--ok-soft);border-color:var(--ok);color:var(--ok)}
.tq-leg i.ab{background:var(--info-soft);border:2px solid var(--info)}.tq-leg i.atr{background:repeating-linear-gradient(45deg,var(--err-soft) 0 4px,var(--surface) 4px 6px);border:2px solid var(--err)}.tq-leg i.co{background:var(--ok-soft);border:2px solid var(--ok)}
.tq-leg i.cr{background:var(--accent)}.tq-leg i.cc{background:repeating-linear-gradient(90deg,var(--ok) 0 3px,var(--ok-soft) 3px 5px);border:1px solid var(--ok)}
.tq-dias{overflow-x:auto;padding:18px 0 4px}
.tq-dias-in{display:flex;align-items:stretch;gap:2px;height:170px}
.tq-dia{all:unset;box-sizing:border-box;cursor:pointer;flex:1 1 0;min-width:8px;display:flex;flex-direction:column;align-items:stretch;border-radius:6px;padding:0 1px}
.tq-dia:hover,.tq-dia:focus-visible{background:var(--surface2)}
.tq-dia:focus-visible{outline:3px solid var(--focus)}
.tq-dia-b{flex:1;display:flex;align-items:flex-end;justify-content:center;gap:2px;border-bottom:1px solid var(--border)}
.tq-dia-b i{position:relative;display:block;flex:1 1 0;max-width:16px;min-height:0;border-radius:3px 3px 0 0}
.tq-dia-b i.cr{background:var(--accent)}
.tq-dia-b i.co{background:repeating-linear-gradient(90deg,var(--ok) 0 3px,var(--ok-soft) 3px 5px);border:1px solid var(--ok);border-bottom:0}
.tq-dia-b em{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);font-style:normal;font-size:10.5px;font-weight:700;color:var(--fg-strong);line-height:1.4}
.tq-dia-l{height:18px;font-size:10.5px;color:var(--fg2);text-align:center;white-space:nowrap;overflow:visible}
table.tq-tab{min-width:620px}
.tq-tab td,.tq-tab th{text-align:left}
.tq-tab tr.tq-tot td{font-weight:800;border-top:2px solid var(--border)}
.tq-cel{all:unset;box-sizing:border-box;cursor:pointer;min-width:36px;padding:4px 8px;border-radius:8px;font-weight:700;color:var(--accent);text-decoration:underline;text-underline-offset:3px}
.tq-cel:hover{background:var(--accent-soft)}.tq-cel:focus-visible{outline:3px solid var(--focus)}
.tq-cel.err{color:var(--err)}
.tq-ro{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.tq-hq-u{display:flex;flex-direction:column;gap:8px}
.tq-eq{border:1px solid var(--border);border-radius:12px;padding:10px 12px;background:var(--surface2);font-size:13.5px;display:flex;flex-direction:column;gap:4px}
.tq-eq.sub{margin-left:22px;border-left:4px solid var(--accent)}
.tq-eq.sub2{margin-left:44px}
.tq-eq-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.tq-eq-h b{flex:1;min-width:0;color:var(--fg-strong);font-size:14.5px}
.tq-eq span.k{color:var(--fg2)}
.tq-alc-r{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,230px);gap:8px 12px;align-items:start;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px}
.tq-alc-r:last-child{border-bottom:0}
.tq-alc-r small{display:block;color:var(--fg2);font-size:12px}
.tq-alc-r .in{height:36px;font-size:14px}
.tq-alc-r .tq-sub{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:6px;font-size:13px}
.tq-alc-r .tq-sub label{display:flex;gap:6px;align-items:center}
.tq-alc-r input[type=checkbox]{width:18px;height:18px;accent-color:var(--accent)}
.tq-un-r{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px}
.tq-un-r:last-child{border-bottom:0}
.tq-un-r b{flex:1 1 200px;color:var(--fg-strong)}
.tq-un-r label{display:flex;gap:6px;align-items:center;cursor:pointer}
.tq-un-r input{width:18px;height:18px;accent-color:var(--accent)}
@media (max-width:760px){.tq-bar-r{grid-template-columns:minmax(0,1fr)}.tq-alc-r{grid-template-columns:minmax(0,1fr)}.tq-eq.sub{margin-left:12px}.tq-eq.sub2{margin-left:24px}.tq-filtros .field{flex:1 1 100%}}
</style>`);

/* ---------- Dados de exemplo dos últimos 90 dias (para o painel) ---------- */
function tqRnd(seed){return function(){seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const TQ_TIT={
 s1:['Confirmar os agendamentos de amanhã','Atualizar o cadastro dos convênios no balcão','Organizar a fila de pré-agendamento','Ligar para quem faltou na semana','Conferir o caixa do turno da tarde','Repor os formulários de consentimento','Revisar o roteiro de atendimento telefônico','Responder as mensagens do WhatsApp pendentes'],
 s2:['Revisar os controles internos da semana','Conferir a validade dos reagentes','Atualizar o POP de hematologia','Registrar a manutenção da centrífuga','Liberar os laudos pendentes de conferência','Calibrar a pipeta multicanal','Separar as amostras para o laboratório de apoio'],
 s3:['Conferir o estoque de tubos da coleta','Organizar a rota da coleta domiciliar','Treinar a coleta infantil','Etiquetar as caixas de transporte','Registrar a temperatura da caixa térmica'],
 s4:['Conciliar os recebimentos de cartão','Conferir o repasse médico do mês','Fechar o faturamento dos convênios','Cobrar as guias glosadas','Lançar as notas de fornecedores','Revisar as contas a pagar da semana','Enviar o relatório de inadimplência'],
 s5:['Montar a escala do mês','Revisar os indicadores da unidade','Reunião com a equipe de atendimento','Aprovar as compras do estoque','Avaliar as reclamações da ouvidoria','Planejar o mutirão de sábado'],
 s6:['Revisar o orçamento anual','Aprovar o plano de expansão','Reunião com os gerentes das unidades'],
 s7:['Revisar o contrato com o laboratório de apoio','Responder a notificação do Procon','Atualizar o termo de consentimento LGPD','Analisar o contrato de locação','Revisar o contrato de franquia'],
};
function tqSeedHist(S){const r=tqRnd(20261116),pick=a=>a[Math.floor(r()*a.length)],ri=(a,b)=>a+Math.floor(r()*(b-a+1));
 const eqDe=id=>S.equipes.find(e=>e.memb.includes(id))||S.equipes.find(e=>e.gest.includes(id));
 let n=0;
 S.ops.forEach(o=>{const k=o.id==='u0'?3:ri(6,9),tits=TQ_TIT[o.setor]||TQ_TIT.s5,eq=eqDe(o.id),gest=eq&&!eq.gest.includes(o.id)?eq.gest[0]:null,col=eq?[...eq.gest,...eq.memb].filter(x=>x!==o.id):[];
  for(let i=0;i<k;i++){let c=ri(1,88),tipo=pick(['ok','ok','ok','ok','tarde','tarde','tarde','aberta','aberta','atrasada','atrasada','sem']);
   if(tipo==='tarde'&&c<6)c=ri(10,60);if(tipo==='atrasada')c=ri(6,40);
   const criador=gest&&r()<.5?gest:o.id,acomp=col.length&&r()<.35?[pick(col)]:[];
   const cri=tqQuando(-c,ri(7,17),ri(0,59)),prazos=[],hist=[{em:cri,por:criador,t:'Criou a tarefa'}];let concl=null;
   const pz=(d,defD)=>prazos.push({data:tqDia(d),def:tqQuando(defD,ri(8,17)),por:o.id});
   if(tipo==='ok'){const dur=ri(3,14);pz(-c+dur,-c);const cd=Math.min(0,-c+ri(1,dur));concl={em:tqQuando(cd,ri(9,18),ri(0,59)),por:o.id}}
   else if(tipo==='tarde'){const p1=-c+ri(2,Math.min(8,c-3));pz(p1,-c);if(r()<.5&&p1+2<0){const p2=Math.min(-1,p1+ri(2,5));pz(p2,p1+1);hist.push({em:tqQuando(p1+1,10),por:o.id,t:'Definiu novo prazo: '+tqDM(tqDia(p2))+' (prazo de '+tqDM(tqDia(p1))+' perdido)'})}
    const cd=Math.min(0,(prazos.length>1?tqDiaN(prazos[1].data):p1)+ri(1,5));concl={em:tqQuando(Math.max(cd,p1+1),ri(9,18),ri(0,59)),por:o.id}}
   else if(tipo==='aberta'){c=Math.min(c,30);pz(ri(1,14),-c)}
   else if(tipo==='atrasada'){const p=-c+ri(2,Math.min(12,c-1));if(r()<.3&&p-3>-c){pz(p-3,-c);hist.push({em:tqQuando(p-2,10),por:o.id,t:'Definiu novo prazo: '+tqDM(tqDia(p))+' (prazo de '+tqDM(tqDia(p-3))+' perdido)'});pz(p,p-2)}else pz(p,-c)}
   if(concl)hist.push({em:concl.em,por:o.id,t:'Concluiu a tarefa'});
   const itens=r()<.35?Array.from({length:ri(2,4)},(_,j)=>({id:'i'+j,t:['Separar o material','Conferir com a equipe','Registrar no sistema','Avisar o gestor'][j],ok:!!concl||r()<.4})):null;
   const t={id:'g'+(++n),titulo:pick(tits),desc:'',criador,lider:o.id,acomp:acomp.filter(x=>x!==o.id),criada:cri,prazos,concl,checklists:itens?[{id:'k1',n:'Passos',itens}]:[],anexos:[],msgs:[],hist};
   S.tarefas.push(t);
   if(o.id!=='u0'&&i===k-1&&!S.tarefas.some(x=>x.lider===o.id&&x.id[0]==='g'&&!x.concl&&x.prazos.length&&x.prazos[x.prazos.length-1].data<tqHoje())){
    /* garante pelo menos uma atrasada por pessoa, para o painel ter o que mostrar */
    const dd=ri(1,6);t.concl=null;t.criada=tqQuando(-dd-ri(4,12),ri(8,16));t.prazos=[{data:tqDia(-dd),def:t.criada,por:o.id}];t.hist=t.hist.filter(h=>h.t==='Criou a tarefa');t.hist[0].em=t.criada;if(t.checklists[0])t.checklists[0].itens.forEach((it,j)=>it.ok=j===0)}
   const p=t.prazos.length?t.prazos[t.prazos.length-1].data:null;if(p&&!t.concl)[...new Set([criador,o.id,...t.acomp])].forEach(u=>{const U=S.user[u];if(U){U.ger['am:'+t.id+':'+p]=1;U.ger['at:'+t.id+':'+p]=1}})}})}
const tqDiaN=s=>{const a=new Date(s+'T12:00:00'),b=new Date(tqHoje()+'T12:00:00');return Math.round((a-b)/864e5)};

/* ---------- Hierarquia e alcance ---------- */
const tqAdmDe=(u,c)=>{const o=tqOp(u);return o.adm==='todas'||(Array.isArray(o.adm)&&o.adm.includes(+c))};
const tqAdmUnids=u=>tqUnids().filter(c=>tqAdmDe(u,c));
const tqAdmAll=u=>tqUnids().every(c=>tqAdmDe(u,c));
const tqCentral=()=>(tqS().unids.find(x=>x.central)||{}).c;
const tqEq=id=>tqS().equipes.find(e=>e.id===id);
function tqEqDesc(id,vis){vis=vis||new Set();if(vis.has(id))return [];vis.add(id);tqS().equipes.filter(e=>e.pai===id).forEach(e=>tqEqDesc(e.id,vis));return [...vis]}
const tqEqPessoas=id=>[...new Set(tqEqDesc(id).flatMap(i=>{const e=tqEq(i);return e?[...e.gest,...e.memb]:[]}))];
const tqGerencia=u=>tqS().equipes.filter(e=>e.gest.includes(u)).map(e=>e.id);
const tqEqDaPessoa=u=>tqS().equipes.filter(e=>e.memb.includes(u)||e.gest.includes(u));
const TQ_ALC_NOME={auto:'Padrão',minhas:'Só as minhas',equipes:'Equipes que gerencio',unidades:'Unidades escolhidas',empresa:'Toda a empresa'};
const tqAlcForcado=u=>tqAdmAll(u)||(tqCentral()!=null&&tqAdmDe(u,tqCentral()));
function tqAlcModo(u){if(tqAlcForcado(u))return 'empresa';const m=(tqOp(u).alc||{}).modo;if(m&&m!=='auto')return m;return tqGerencia(u).length?'equipes':'minhas'}
function tqAlcance(u){const m=tqAlcModo(u),S=tqS();let l=[u];
 if(m==='empresa')l=S.ops.map(o=>o.id);else if(m==='unidades'){const us=(tqOp(u).alc||{}).unids||[];l=[u,...S.ops.filter(o=>us.includes(o.unid)).map(o=>o.id)]}else if(m==='equipes')l=[u,...tqGerencia(u).flatMap(tqEqPessoas)];
 return new Set(l)}
const tqPodeVer=(u,t)=>{if(!t)return false;if(tqEnv(t,u))return true;const a=tqAlcance(u);return tqEnvolvidos(t).some(p=>a.has(p))};
const tqOpUnidOrdem=()=>{const S=tqS();return tqUnids().flatMap(c=>S.ops.filter(o=>o.unid===c))};

/* Barra "Testar como:" (todas as telas do módulo) */
function tqSimBar(txt){const S=tqS(),u=S.eu,adm=tqAdmUnids(u),a=tqAlcance(u);
 const grp=tqUnids().map(c=>`<optgroup label="${tqH(tqUnidNome(c))}">${S.ops.filter(x=>x.unid===c).map(x=>`<option value="${x.id}" ${x.id===u?'selected':''}>${tqH(x.n)} · ${tqH(x.cargo||tqSetorNome(x.setor))}</option>`).join('')}</optgroup>`).join('');
 return `<div class="tq-sim" role="group" aria-label="Simulação de operador"><label for="tqEuSel">Testar como:</label><select class="in" id="tqEuSel" onchange="tqTrocaEu(this.value)">${grp}</select><small>${txt} <b>Alcance:</b> ${TQ_ALC_NOME[tqAlcModo(u)]} (${a.size} pessoa${a.size>1?'s':''}).${adm.length?` <b>Administra:</b> ${tqAdmAll(u)?'todas as unidades':adm.map(tqUnidCurta).join(', ')}.`:''}</small></div>`}

/* ---------- Consulta (só leitura) de tarefa de quem está no alcance ---------- */
function tqDetLeitura(){const D=TQ_V.det,t=tqT(D.id),p=tqPrazo(t),perd=tqPerdidos(t),s=tqSit(t),acomp=t.acomp.filter(x=>x!==t.lider);
 const pess=(id,lid)=>{const o=tqOp(id);return `<div class="tq-pess"><span class="tq-av g ${lid?'lid':''}" aria-hidden="true">${tqH(o.ini)}</span><div>${tqH(o.n)}<small>${tqH(o.cargo||tqSetorNome(o.setor))} · ${tqH(tqUnidCurta(o.unid))}</small></div></div>`};
 return `<div class="mh"><h3 id="tqDetT">${tqH(t.titulo)}</h3><button class="ibtn plain" aria-label="Fechar" onclick="closeModal()">${I.x}</button></div><div class="mb tq-det">
<div class="alert info" role="note" style="cursor:default"><b>Só consulta</b><span>Você está vendo como gestor; só quem está na tarefa altera.</span></div>
<div class="tq-det-topo">${t.concl?`<span class="badge ok">Concluída em ${tqDMY(tqIsoDia(new Date(t.concl.em)))}${t.prazos.length?(tqNoPrazo(t)?' · no prazo':' · fora do prazo'):''}</span>`:s==='atr'?'<span class="badge err">Atrasada</span>':s==='hoje'?'<span class="badge warn">Vence hoje</span>':'<span class="badge info">Em aberto</span>'}</div>
<div class="tq-det-g"><div class="tq-det-main">
<section class="tq-sec"><h4>${TQI.desc} Descrição</h4>${t.desc?`<p>${tqH(t.desc)}</p>`:'<p class="tl">Sem descrição.</p>'}</section>
<section class="tq-sec"><h4>${TQI.lista} Listas de verificação</h4>${t.checklists.length?t.checklists.map(k=>{const n=k.itens.length,ok=k.itens.filter(i=>i.ok).length,pc=n?Math.round(ok*100/n):0;return `<div class="tq-chk"><div class="tq-chk-h"><b>${tqH(k.n)}</b></div><div class="tq-prog"><span>${pc}%</span><span class="b" role="progressbar" aria-label="Progresso de ${tqH(k.n)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc}"><i class="${n&&ok===n?'full':''}" style="width:${pc}%"></i></span><span>${ok}/${n}</span></div>${k.itens.map(i=>`<div class="tq-it ${i.ok?'ok':''}"><label style="cursor:default"><span aria-hidden="true">${i.ok?'☑':'☐'}</span><span>${tqH(i.t)}<span class="tq-sr">${i.ok?' (feito)':' (a fazer)'}</span></span></label></div>`).join('')}</div>`}).join(''):'<p class="tl">Nenhuma lista.</p>'}</section>
<section class="tq-sec"><h4>${TQI.clip} Anexos</h4>${t.anexos.length?t.anexos.map(a=>`<div class="tq-anx"><span class="tq-ext" aria-hidden="true">${tqH((a.n.split('.').pop()||'').slice(0,4))}</span><div class="grow">${tqH(a.n)}<small>${tqTam(a.tam)} · ${tqH(tqPrim(a.por))} · ${tqDHc(a.em)}</small></div>${a.b64?`<button class="btn sm ghost" onclick="tqBaixar('${a.id}')">${I.dl} Baixar</button>`:''}</div>`).join(''):'<p class="tl">Nenhum anexo.</p>'}</section>
<section class="tq-sec"><h4>${TQI.conv} Conversa</h4><div class="tq-chat">${t.msgs.length?t.msgs.map(m=>`<div class="tq-msg"><span class="tq-av g" aria-hidden="true">${tqH(tqOp(m.de).ini)}</span><div class="bl"><small>${tqH(tqNome(m.de))} · ${tqDHc(m.em)}</small>${tqMsgHtml(m.t,t)}</div></div>`).join(''):'<p class="tl" style="margin:0">Nenhuma mensagem.</p>'}</div></section>
<details class="tq-sec"><summary style="cursor:pointer;font-weight:700;color:var(--fg-strong);font-size:14px">Histórico (${t.hist.length})</summary><div class="tq-hist" style="margin-top:8px">${t.hist.slice().reverse().map(h=>`<div><small>${tqDH(h.em)}</small><br><b>${tqH(tqNome(h.por))}</b>: ${tqH(h.t)}</div>`).join('')}</div></details>
</div><aside class="tq-det-side" aria-label="Pessoas e prazo">${D.daLista&&TQ_V.lista?`<button class="btn sm ghost" onclick="tqListaReabre()">${TQI.volta} Voltar à lista</button>`:''}
<div class="tq-side-b"><h4>Líder</h4>${pess(t.lider,true)}</div>
<div class="tq-side-b"><h4>Acompanhantes</h4>${acomp.length?acomp.map(x=>pess(x)).join(''):'<span class="tl">Ninguém.</span>'}</div>
<div class="tq-side-b"><h4>${TQI.relogio} Prazo</h4>${p?`<div><b class="${t.concl?'':s==='atr'?'prazo-err':s==='hoje'?'prazo-warn':''}">${perd.length?'Novo prazo: ':''}${tqDMY(p)}</b></div>`:'<span class="tl">Sem prazo.</span>'}${perd.map((x,i)=>`<small class="prazo-err" style="display:block">${i+1}º prazo perdido em ${tqDMY(x.data)}</small>`).join('')}</div>
<div class="tq-side-b"><h4>Criação</h4><div>${tqDH(t.criada)}</div><small class="tl">por ${tqH(tqNome(t.criador))}</small></div>
<div class="tq-side-b"><h4>Conclusão</h4>${t.concl?`<div>Concluída por ${tqH(tqPrim(t.concl.por))} em ${tqDH(t.concl.em)}</div>`:'<span class="tl">Em aberto.</span>'}</div></aside></div></div>`}

/* ---------- Lista de tarefas (aberta pelo painel) ---------- */
const tqDiaDe=iso=>tqIsoDia(new Date(iso));
function tqNoPrazo(t){return !!(t.concl&&t.prazos.length===1&&tqDiaDe(t.concl.em)<=t.prazos[0].data)}
function tqSitTexto(t){if(t.concl)return t.prazos.length?(tqNoPrazo(t)?['Concluída no prazo','ok']:['Concluída fora do prazo','hoje']):['Concluída (sem prazo)','ok'];const s=tqSit(t);return s==='atr'?['Atrasada','atr']:s==='hoje'?['Vence hoje','hoje']:s==='sem'?['Em aberto, sem prazo','']:['Em aberto, no prazo','']}
function tqLista(tit,ids,sub){TQ_V.lista={tit,ids,sub:sub||''};tqListaReabre()}
function tqListaReabre(){const L=TQ_V.lista;if(!L)return;const u=tqEu(),ts=L.ids.map(tqT).filter(t=>t&&tqPodeVer(u,t));
 openModal(`${mh(tqH(L.tit)+' ('+ts.length+')')}<div class="mb">${L.sub?`<p class="tl" style="margin:0">${tqH(L.sub)}</p>`:''}<div class="tq-prz">${ts.length?ts.map(t=>{const [st,c]=tqSitTexto(t),p=tqPrazo(t),perd=tqPerdidos(t).length;return `<button class="tq-row" onclick="tqAbrir('${t.id}',1)"><b>${tqH(t.titulo)}</b><span class="tq-b ${c}">${st}</span><small>Líder ${tqH(tqNome(t.lider))} · criada ${tqDM(tqDiaDe(t.criada))}${p?` · ${perd?'novo prazo':'prazo'} ${tqDMY(p)}${perd?` (${perd} perdido${perd>1?'s':''})`:''}`:''}${t.concl?` · concluída ${tqDM(tqDiaDe(t.concl.em))}`:''}${tqEnv(t,u)?'':' · só consulta'}</small></button>`}).join(''):'<p class="tl">Nenhuma tarefa nesta situação.</p>'}</div></div><div class="mf"><button class="btn" onclick="closeModal()">Fechar</button></div>`,'wide')}

/* ---------- Painel de desempenho ---------- */
const TQ_P={dias:30,unid:'',eq:''};
const tqPIni=()=>tqDia(-(TQ_P.dias-1));
function tqPerdas(t,ini){const h=tqHoje(),out=[];tqPerdidos(t).forEach(x=>{if(x.data>=ini&&x.data<h)out.push(x.data)});const p=tqPrazo(t);
 if(p&&p>=ini){if(t.concl){if(tqDiaDe(t.concl.em)>p)out.push(p)}else if(p<h)out.push(p)}return out}
function tqStats(ts,ini){const h=tqHoje(),ab=ts.filter(t=>!t.concl),atr=ab.filter(t=>tqPrazo(t)&&tqPrazo(t)<h),noP=ab.filter(t=>!atr.includes(t)),conc=ts.filter(t=>t.concl&&tqDiaDe(t.concl.em)>=ini),cp=conc.filter(t=>t.prazos.length),ok=cp.filter(tqNoPrazo),fora=cp.filter(t=>!tqNoPrazo(t)),perdT=ts.filter(t=>tqPerdas(t,ini).length);
 return {ab,atr,noP,conc,cp,ok,fora,perdT,perd:ts.reduce((s,t)=>s+tqPerdas(t,ini).length,0),pct:cp.length?Math.round(ok.length*100/cp.length):null}}
function tqPPessoas(){const u=tqEu(),a=tqAlcance(u);let l=tqOpUnidOrdem().map(o=>o.id).filter(id=>a.has(id));
 if(TQ_P.unid)l=l.filter(id=>tqOp(id).unid===+TQ_P.unid);if(TQ_P.eq){const ps=tqEqPessoas(TQ_P.eq);l=l.filter(id=>ps.includes(id))}return l}
const tqPTarefas=ids=>tqS().tarefas.filter(t=>ids.includes(t.lider));
const TQ_PK={todas:'Todas as tarefas',ab:'Em aberto',noP:'Em aberto no prazo',atr:'Atrasadas',conc:'Concluídas no período',ok:'Concluídas no prazo',fora:'Concluídas fora do prazo',cp:'Concluídas com prazo',perdT:'Com prazo perdido no período'};
function tqPLista(quem,k){const ids=quem==='time'?tqPPessoas():[quem],ts=tqPTarefas(ids),st=tqStats(ts,tqPIni());
 const l=k==='todas'?ts.filter(t=>!t.concl||tqDiaDe(t.concl.em)>=tqPIni()):(st[k]||[]);
 tqLista(`${quem==='time'?'Time':tqNome(quem)} · ${TQ_PK[k]}`,l.sort((a,b)=>(tqPrazo(a)||'9').localeCompare(tqPrazo(b)||'9')).map(t=>t.id),`Período: últimos ${TQ_P.dias} dias. Conta pela pessoa que lidera a tarefa.`)}
function tqPDia(d){const ids=tqPPessoas(),ts=tqPTarefas(ids),cr=ts.filter(t=>tqDiaDe(t.criada)===d),co=ts.filter(t=>t.concl&&tqDiaDe(t.concl.em)===d);
 tqLista(`Dia ${tqDMY(d)}`,[...new Set([...cr,...co].map(t=>t.id))],`${cr.length} criada${cr.length!==1?'s':''} e ${co.length} concluída${co.length!==1?'s':''} neste dia.`)}
function tqPFiltro(k,v){TQ_P[k]=k==='dias'?+v:v;if(k==='unid')TQ_P.eq='';reView()}
VIEWS['tarefas-painel']=function(){const u=tqEu(),a=tqAlcance(u),modo=tqAlcModo(u),ini=tqPIni(),S=tqS();
 if(TQ_P.unid&&![...a].some(id=>tqOp(id).unid===+TQ_P.unid))TQ_P.unid='';
 const eqs=S.equipes.filter(e=>tqEqPessoas(e.id).some(id=>a.has(id))&&(!TQ_P.unid||e.unid===+TQ_P.unid));if(TQ_P.eq&&!eqs.some(e=>e.id===TQ_P.eq))TQ_P.eq='';
 const pes=tqPPessoas(),ts=tqPTarefas(pes),st=tqStats(ts,ini),un=tqUnids().filter(c=>[...a].some(id=>tqOp(id).unid===c));
 const escopo=modo==='minhas'?'Você vê só o seu desempenho. Gestores veem o time; a direção, a central e quem administra veem todos.':modo==='empresa'?'Você vê toda a empresa.':modo==='unidades'?'Você vê as pessoas das unidades escolhidas no seu alcance.':'Você vê as equipes que gerencia, com as subequipes.';
 const kpi=(k,lab,num,hint,cls,tip)=>`<button class="tq-kpi ${cls||''}" onclick="tqPLista('time','${k}')" aria-label="${tqH(lab)}: ${tqH(String(num))}. ${tqH(tip)}"><span class="lab">${lab}</span><span class="num">${num}</span><span class="hint">${hint}</span></button>`;
 const filtros=`<div class="tq-filtros"><div class="field per"><span style="font-size:13px;font-weight:600">Período</span><div class="chips" role="group" aria-label="Período">${[7,30,90].map(d=>`<button class="chip ${TQ_P.dias===d?'on':''}" aria-pressed="${TQ_P.dias===d}" onclick="tqPFiltro('dias',${d})">${d} dias</button>`).join('')}</div></div>
<div class="field"><label for="tqPU">Unidade</label><select class="in" id="tqPU" onchange="tqPFiltro('unid',this.value)"><option value="">Todas do meu alcance</option>${un.map(c=>`<option value="${c}" ${+TQ_P.unid===c?'selected':''}>${tqH(tqUnidNome(c))}</option>`).join('')}</select></div>
<div class="field"><label for="tqPE">Equipe</label><select class="in" id="tqPE" onchange="tqPFiltro('eq',this.value)"><option value="">Todas</option>${eqs.map(e=>`<option value="${e.id}" ${TQ_P.eq===e.id?'selected':''}>${tqH(e.n)}${e.pai?' (subequipe)':''}</option>`).join('')}</select></div></div>`;
 const kpis=`<div class="tq-kpis">${kpi('ab','Em aberto',st.ab.length,`${st.noP.length} no prazo · ${st.atr.length} atrasadas`,'','Tarefas não concluídas, hoje.')}${kpi('atr','Atrasadas',st.atr.length,'prazo vencido, sem conclusão',st.atr.length?'err':'','Em aberto com o prazo vencido.')}${kpi('conc','Concluídas',st.conc.length,`nos últimos ${TQ_P.dias} dias`,'ok','Concluídas dentro do período.')}${kpi('cp','% no prazo',st.pct==null?'—':st.pct+'%',`${st.ok.length} de ${st.cp.length} com prazo`,st.pct!=null&&st.pct<70?'warn':'','Das concluídas no período que tinham prazo, quantas foram concluídas até o primeiro prazo.')}${kpi('perdT','Prazos perdidos',st.perd,`em ${st.perdT.length} tarefa${st.perdT.length!==1?'s':''}`,st.perd?'warn':'','Prazos que venceram no período sem a tarefa concluída: trocados por novo prazo, concluídos depois ou ainda atrasados.')}</div>`;
 /* barras por pessoa */
 const lin=pes.map(id=>{const s=tqStats(tqPTarefas([id]),ini);return {id,s,tot:s.noP.length+s.atr.length+s.conc.length}}),max=Math.max(1,...lin.map(x=>x.tot));
 const seg=(id,k,v,cls,lab)=>v?`<button class="tq-sg ${cls}" style="flex-grow:${v}" onclick="tqPLista('${id}','${k}')" aria-label="${tqH(tqNome(id))}: ${v} ${lab}" title="${v} ${lab}">${v}</button>`:'';
 const barras=`<section class="card at-card"><h3>Por pessoa</h3><p class="tl" style="margin:0">Pela pessoa que lidera a tarefa. Em aberto e atrasadas: situação de hoje. Concluídas: no período. Clique no nome, numa barra ou num pedaço da barra.</p><div class="tq-leg" aria-hidden="true"><span><i class="ab"></i>Em aberto no prazo</span><span><i class="atr"></i>Atrasadas (listrado)</span><span><i class="co"></i>Concluídas no período</span></div>
<div class="tq-bars">${lin.map(({id,s,tot})=>`<div class="tq-bar-r"><button class="tq-bar-n" onclick="tqPLista('${id}','todas')">${tqH(tqNome(id))}<small>${tqH(tqOp(id).cargo||'')} · ${tot} tarefa${tot!==1?'s':''}</small></button><div class="tq-bar-t">${tot?`<div class="tq-bar-in" style="width:max(${(tot/max*100).toFixed(1)}%,${[s.noP.length,s.atr.length,s.conc.length].filter(Boolean).length*32}px)">${seg(id,'noP',s.noP.length,'ab','em aberto no prazo')}${seg(id,'atr',s.atr.length,'atr','atrasadas')}${seg(id,'conc',s.conc.length,'co','concluídas no período')}</div>`:'<span class="tl">Sem tarefas no período.</span>'}</div></div>`).join('')||'<p class="tl">Ninguém neste filtro.</p>'}</div></section>`;
 /* criadas x concluídas por dia */
 const N=TQ_P.dias,dias=Array.from({length:N},(_,i)=>tqDia(-(N-1-i))),cont=dias.map(d=>[ts.filter(t=>tqDiaDe(t.criada)===d).length,ts.filter(t=>t.concl&&tqDiaDe(t.concl.em)===d).length]),mx=Math.max(1,...cont.flat()),passo=N<=7?1:N<=30?5:15;
 const tc=cont.reduce((s,x)=>s+x[0],0),tk=cont.reduce((s,x)=>s+x[1],0);
 const diario=`<section class="card at-card"><h3>Criadas × concluídas por dia</h3><p class="tl" style="margin:0">No período: <b>${tc}</b> criadas e <b>${tk}</b> concluídas. Clique num dia para ver as tarefas.</p><div class="tq-leg" aria-hidden="true"><span><i class="cr"></i>Criadas</span><span><i class="cc"></i>Concluídas (listrado)</span></div>
<div class="tq-dias"><div class="tq-dias-in" style="min-width:${N*(N>30?9:N>7?18:44)}px">${dias.map((d,i)=>{const [c,k]=cont[i];return `<button class="tq-dia" onclick="tqPDia('${d}')" aria-label="${tqDM(d)}: ${c} criada${c!==1?'s':''}, ${k} concluída${k!==1?'s':''}" title="${tqDM(d)}: ${c} criadas, ${k} concluídas"><span class="tq-dia-b"><i class="cr" style="height:${c/mx*100}%">${N<=30&&c?`<em>${c}</em>`:''}</i><i class="co" style="height:${k/mx*100}%">${N<=30&&k?`<em>${k}</em>`:''}</i></span><span class="tq-dia-l" aria-hidden="true">${i%passo===0||i===N-1?tqDM(d):''}</span></button>`}).join('')}</div></div></section>`;
 /* tabela */
 const cel=(id,k,v,cls)=>`<td><button class="tq-cel ${cls||''}" onclick="event.stopPropagation();tqPLista('${id}','${k}')" aria-label="${tqH(id==='time'?'Time':tqNome(id))}: ${TQ_PK[k]}, ${v}">${v}</button></td>`;
 const row=(id,s,nome,eq,cls)=>`<tr class="${cls||''}" onclick="tqPLista('${id}','todas')" title="Clique para ver as tarefas"><td><b>${tqH(nome)}</b></td><td>${tqH(eq)}</td>${cel(id,'ab',s.ab.length)}${cel(id,'atr',s.atr.length,s.atr.length?'err':'')}${cel(id,'conc',s.conc.length)}${cel(id,'cp',s.pct==null?'—':s.pct+'%')}${cel(id,'perdT',s.perd)}</tr>`;
 const tabela=`<section class="card at-card"><h3>Pessoas</h3><div style="overflow-x:auto"><table class="tq-tab"><thead><tr><th>Pessoa</th><th>Equipe</th><th>Em aberto</th><th>Atrasadas</th><th>Concluídas</th><th>% no prazo</th><th>Prazos perdidos</th></tr></thead><tbody>${lin.map(({id,s})=>row(id,s,tqNome(id),tqEqDaPessoa(id).map(e=>e.n).join(', ')||'Sem equipe')).join('')}${lin.length>1?row('time',st,'Total do time','','tq-tot'):''}</tbody></table></div></section>`;
 return `${pageHead('Tarefas','Painel','Desempenho das tarefas do seu time. Dados de exemplo.',`<a class="btn sec" href="#tarefas">Minhas tarefas</a>`)}
${tqSimBar('Troque a pessoa para ver o painel de cada uma: o diretor e a central veem tudo, o gerente vê o time dele, quem não gere ninguém vê só o próprio.')}
<p class="tl" style="margin:0 0 10px">${escopo} As tarefas dos outros abrem só para consulta.</p>${filtros}${kpis}<div class="tq-pg">${barras}${diario}${tabela}</div>`};

/* ---------- Configurações > Hierarquia ---------- */
const tqPodeEq=uC=>tqAdmDe(tqEu(),uC);
function tqEqArvore(unid){const S=tqS(),l=S.equipes.filter(e=>e.unid===unid),out=[];const vai=(pai,niv)=>l.filter(e=>(e.pai||null)===pai||(pai===null&&e.pai&&!l.some(x=>x.id===e.pai))).forEach(e=>{if(out.some(x=>x.e===e))return;out.push({e,niv});vai(e.id,niv+1)});vai(null,0);l.forEach(e=>{if(!out.some(x=>x.e===e))out.push({e,niv:0})});return out}
VIEWS.hierarquia=function(){const S=tqS(),u=S.eu,all=tqAdmAll(u),mine=tqAdmUnids(u);
 const aviso=mine.length?`<div class="alert info" role="note" style="cursor:default;margin-bottom:12px"><b>Você administra ${all?'todas as unidades':mine.map(tqUnidCurta).join(' e ')}</b><span>${all?'Pode montar as equipes de todas as unidades, marcar a central e dar "Toda a empresa".':'Monta as equipes e o alcance das pessoas dessas unidades. "Toda a empresa" só quem administra todas as unidades dá.'}</span></div>`:`<div class="alert warn" role="note" style="cursor:default;margin-bottom:12px"><b>Só consulta</b><span>${tqH(tqNome(u))} não administra nenhuma unidade. Troque para Augusto Leal (todas), Lúcia Fernandes (Postos 12 e 14) ou Gustavo Prado (franquia).</span></div>`;
 const unids=`<section class="card at-card"><h3>Unidades</h3><p class="tl" style="margin:0">Quem administra a unidade central vê toda a empresa. Só quem administra todas as unidades troca a central.</p><div>${S.unids.map(x=>`<div class="tq-un-r"><b>${tqH(x.n)}</b>${x.franquia?'<span class="badge info">Franquia</span>':''}<small class="tl">${(n=>n+(n===1?' pessoa':' pessoas'))(S.ops.filter(o=>o.unid===x.c).length)} · ${(n=>n+(n===1?' equipe':' equipes'))(S.equipes.filter(e=>e.unid===x.c).length)} · administrada por ${S.ops.filter(o=>Array.isArray(o.adm)&&o.adm.includes(x.c)).map(o=>tqH(o.n)).concat(S.ops.filter(o=>o.adm==='todas').map(o=>tqH(o.n))).join(', ')}</small><label><input type="radio" name="tqCentral" ${x.central?'checked':''} ${all?'':'disabled'} onchange="tqCentralSet(${x.c})"> Central</label></div>`).join('')}</div></section>`;
 const equipes=S.unids.map(x=>{const pode=tqPodeEq(x.c),arv=tqEqArvore(x.c);return `<section class="card at-card tq-hq-u"><div class="inicio-tit" style="justify-content:space-between"><h3>Equipes · ${tqH(x.n)}</h3>${pode?`<button class="btn sm sec" onclick="tqEqDlg(null,${x.c})">${I.plus} Nova equipe</button>`:''}</div>${arv.length?arv.map(({e,niv})=>`<div class="tq-eq ${niv?'sub':''} ${niv>1?'sub2':''}"><div class="tq-eq-h"><b>${tqH(e.n)}</b>${e.pai&&tqEq(e.pai)?`<small class="tl">dentro de ${tqH(tqEq(e.pai).n)}</small>`:''}${pode?`<button class="btn sm ghost" onclick="tqEqDlg('${e.id}',${x.c})" aria-label="Editar a equipe ${tqH(e.n)}">${I.edit} Editar</button><button class="tq-x" aria-label="Apagar a equipe ${tqH(e.n)}" onclick="tqEqDel('${e.id}')">${TQI.lixo}</button>`:''}</div><div><span class="k">Gestores:</span> ${e.gest.map(tqNome).map(tqH).join(', ')||'nenhum'}</div><div><span class="k">Membros:</span> ${e.memb.map(tqNome).map(tqH).join(', ')||'nenhum'}</div></div>`).join(''):'<p class="tl" style="margin:0">Nenhuma equipe.</p>'}</section>`}).join('');
 const alc=`<section class="card at-card"><h3>Alcance de cada pessoa</h3><p class="tl" style="margin:0">O que a pessoa vê no painel e nas tarefas dos outros (só consulta). Padrão: gestor de alguma equipe vê as equipes que gerencia; os demais, só as próprias.</p><div>${tqOpUnidOrdem().map(o=>{const pode=tqAdmDe(u,o.unid),forc=tqAlcForcado(o.id),m=(o.alc&&o.alc.modo)||'auto',ef=tqAlcance(o.id).size,uni=all?tqUnids():mine;
  return `<div class="tq-alc-r"><div>${tqH(o.n)}<small>${tqH(o.cargo||'')} · ${tqH(tqUnidCurta(o.unid))}</small><small>Vê: <b>${TQ_ALC_NOME[tqAlcModo(o.id)]}</b> (${ef} pessoa${ef>1?'s':''})</small></div><div>${forc?`<span class="tl">Toda a empresa: ${tqAdmAll(o.id)?'administra todas as unidades':'administra a unidade central'}.</span>`:`<select class="in" aria-label="Alcance de ${tqH(o.n)}" ${pode?'':'disabled'} onchange="tqAlcSet('${o.id}',this.value)">${['auto','minhas','equipes','unidades','empresa'].map(k=>`<option value="${k}" ${m===k?'selected':''} ${k==='empresa'&&!all?'disabled':''}>${k==='auto'?'Padrão ('+(tqGerencia(o.id).length?'Equipes que gerencio':'Só as minhas')+')':TQ_ALC_NOME[k]}${k==='empresa'&&!all?' (só quem administra todas)':''}</option>`).join('')}</select>${m==='unidades'?`<div class="tq-sub" role="group" aria-label="Unidades que ${tqH(o.n)} vê">${tqUnids().map(c=>`<label><input type="checkbox" ${((o.alc||{}).unids||[]).includes(c)?'checked':''} ${pode&&uni.includes(c)?'':'disabled'} onchange="tqAlcUnid('${o.id}',${c},this.checked)"> ${tqH(tqUnidCurta(c))}</label>`).join('')}</div>`:''}`}</div></div>`}).join('')}</div></section>`;
 return `${pageHead('Configurações','Hierarquia','Equipes de cada unidade, gestores, subequipes e o alcance de cada pessoa. O administrador de cada unidade cuida da sua. Dados de exemplo, guardados neste navegador.',`<a class="btn sec" href="#comunicacao">Comunicação</a><a class="btn sec" href="#tarefas-painel">Painel</a>`)}
${tqSimBar('Escolha um administrador para alterar: Augusto Leal (todas as unidades), Lúcia Fernandes (Postos 12 e 14) ou Gustavo Prado (franquia).')}${aviso}
<div class="tq-com-g">${unids}${alc}</div><div class="tq-com-g" style="margin-top:16px">${equipes}</div>`};
function tqHqSalva(msg){tqSalvar();reView();tqHomeSync();toast(msg)}
function tqCentralSet(c){if(!tqAdmAll(tqEu())){toast('Só quem administra todas as unidades troca a central','warn');return}tqS().unids.forEach(x=>x.central=x.c===c);tqHqSalva(tqUnidCurta(c)+' agora é a central')}
function tqAlcSet(id,m){const o=tqOp(id);if(!tqAdmDe(tqEu(),o.unid)){toast('Só o administrador da unidade altera','warn');return}if(m==='empresa'&&!tqAdmAll(tqEu())){toast('"Toda a empresa" só quem administra todas as unidades dá','warn');reView();return}
 o.alc={modo:m,unids:(o.alc||{}).unids||(m==='unidades'?[o.unid]:[])};if(m==='unidades'&&!o.alc.unids.length)o.alc.unids=[o.unid];tqHqSalva(`Alcance de ${tqH(o.n)}: ${TQ_ALC_NOME[m]==='Padrão'?'padrão':TQ_ALC_NOME[m]}`)}
function tqAlcUnid(id,c,on){const o=tqOp(id),eu=tqEu();if(!tqAdmDe(eu,o.unid)||!(tqAdmAll(eu)||tqAdmDe(eu,c)))return;const l=(o.alc&&o.alc.unids)||[];o.alc={modo:'unidades',unids:on?[...new Set([...l,c])]:l.filter(x=>x!==c)};tqHqSalva('Unidades do alcance atualizadas')}
function tqEqDlg(id,unid){if(!tqPodeEq(unid)){toast('Só o administrador da unidade altera','warn');return}const S=tqS(),e=id?tqEq(id):{n:'',gest:[],memb:[],pai:null},ps=S.ops.filter(o=>o.unid===unid),desc=id?tqEqDesc(id):[],pais=S.equipes.filter(x=>x.unid===unid&&!desc.includes(x.id));
 const pick=(nm,sel)=>`<div class="tq-pick" role="group">${ps.map(o=>`<label><input type="checkbox" name="${nm}" value="${o.id}" ${sel.includes(o.id)?'checked':''}> <span>${tqH(o.n)} <small>· ${tqH(o.cargo||'')}</small></span></label>`).join('')}</div>`;
 openModal(`${mh(id?'Editar equipe':'Nova equipe')}<form onsubmit="event.preventDefault();tqEqOk(${id?`'${id}'`:'null'},${unid})" novalidate><div class="mb"><p class="tl" style="margin:0">${tqH(tqUnidNome(unid))}. Só pessoas desta unidade.</p>
<div class="field" id="tqEqNf"><label for="tqEqN">Nome da equipe <span class="req">*</span></label><input class="in" id="tqEqN" maxlength="60" value="${tqH(e.n)}"></div>
<div class="field"><span style="font-size:13px;font-weight:600">Gestores <span class="req">*</span></span>${pick('tqEqG',e.gest)}<span class="msg">Um ou mais. Quem gere vê o desempenho da equipe e das subequipes.</span></div>
<div class="field"><span style="font-size:13px;font-weight:600">Membros</span>${pick('tqEqM',e.memb)}</div>
<div class="field"><label for="tqEqP">Equipe de cima</label><select class="in" id="tqEqP"><option value="">Nenhuma</option>${pais.map(x=>`<option value="${x.id}" ${e.pai===x.id?'selected':''}>${tqH(x.n)}</option>`).join('')}</select><span class="msg">Opcional. Quem gere a equipe de cima vê também esta.</span></div>
</div><div class="mf"><button type="button" class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" type="submit">Salvar equipe</button></div></form>`);setTimeout(()=>{const x=document.getElementById('tqEqN');if(x)x.focus()},0)}
function tqEqOk(id,unid){if(!tqPodeEq(unid))return;const n=(document.getElementById('tqEqN').value||'').trim(),g=[...document.querySelectorAll('input[name=tqEqG]:checked')].map(x=>x.value),m=[...document.querySelectorAll('input[name=tqEqM]:checked')].map(x=>x.value).filter(x=>!g.includes(x)),pai=document.getElementById('tqEqP').value||null;
 if(!n){document.getElementById('tqEqNf').classList.add('err');document.getElementById('tqEqN').focus();toast('Escreva o nome da equipe','warn');return}if(!g.length){toast('Escolha pelo menos um gestor','warn');return}
 const S=tqS();if(id){Object.assign(tqEq(id),{n,gest:g,memb:m,pai})}else S.equipes.push({id:tqId('q'),n,unid,gest:g,memb:m,pai});closeModal();tqHqSalva(id?'Equipe atualizada':'Equipe criada')}
function tqEqDel(id){const e=tqEq(id);if(!e||!tqPodeEq(e.unid))return;openModal(`${mh('Apagar equipe')}<div class="mb"><p style="margin:0">Apagar a equipe <b>${tqH(e.n)}</b>? As subequipes ficam sem equipe de cima. As tarefas não mudam.</p></div><div class="mf"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn danger" onclick="tqEqDelOk('${id}')">Apagar</button></div>`,'danger')}
function tqEqDelOk(id){const S=tqS(),e=tqEq(id);if(!e||!tqPodeEq(e.unid))return;S.equipes=S.equipes.filter(x=>x.id!==id);S.equipes.forEach(x=>{if(x.pai===id)x.pai=null});closeModal();tqHqSalva('Equipe "'+tqH(e.n)+'" apagada')}

/* ---------- Configurações > Comunicação: o administrador de cada unidade cuida da sua ---------- */
VIEWS.comunicacao=function(){const S=tqS(),eu=S.eu,all=tqAdmAll(eu),mine=tqAdmUnids(eu),us=tqUnids();
 const setores=`<section class="card at-card"><h3>Setores</h3><p class="tl" style="margin:0">Os setores são da empresa: só quem administra todas as unidades cria, renomeia ou apaga.</p><div class="tq-com-l">${S.setores.map(s=>{const n=S.ops.filter(o=>o.setor===s.id).length;return `<div class="tq-inl" style="margin:0"><input class="in" value="${tqH(s.n)}" maxlength="40" aria-label="Nome do setor" ${all?'':'disabled'} onchange="tqSetRen('${s.id}',this.value)"><small class="tl" style="flex:0 0 auto">${n} pessoa${n!==1?'s':''}</small><button class="tq-x" aria-label="Apagar o setor ${tqH(s.n)}" ${!all||n?'disabled':''} title="${n?'Tire as pessoas do setor antes de apagar':'Apagar'}" onclick="tqSetDel('${s.id}')">${TQI.lixo}</button></div>`}).join('')}</div>
${all?`<form class="tq-inl" onsubmit="event.preventDefault();tqSetNovo()"><input class="in" id="tqSetN" maxlength="40" placeholder="Novo setor" aria-label="Nome do novo setor"><button class="btn sm" type="submit">Adicionar setor</button></form>`:''}</section>`;
 const pessoas=`<section class="card at-card"><h3>Setor de cada pessoa</h3><p class="tl" style="margin:0">O administrador de cada unidade liga as pessoas da sua unidade ao setor.</p><div>${tqOpUnidOrdem().map(o=>{const d=tqAdmDe(eu,o.unid)?'':'disabled';return `<div class="tq-com-r"><div>${tqH(o.n)}<small>${tqH(o.cargo||'')} · ${tqH(tqUnidCurta(o.unid))}</small></div><select class="in" aria-label="Setor de ${tqH(o.n)}" ${d} onchange="tqOpSetor('${o.id}',this.value)">${S.setores.map(s=>`<option value="${s.id}" ${s.id===o.setor?'selected':''}>${tqH(s.n)}</option>`).join('')}</select></div>`}).join('')}</div></section>`;
 const regras=`<section class="card at-card"><h3>Regras por unidade</h3><p class="tl" style="margin:0">A pessoa da unidade A pode escolher como líder ou acompanhante alguém da unidade B se a regra de A permitir B (a mesma unidade sempre pode) e, havendo limite, se o setor da pessoa estiver na lista. Sem regra, todos se comunicam. Cada administrador escolhe com quais unidades a sua se comunica.</p>${us.map(u=>{const r=S.com[u]||{modo:'todas',unids:[],limSet:false,setores:[]},sel=r.modo==='selecionadas',dis=tqAdmDe(eu,u)?'':'disabled';return `<div class="tq-com-u" role="group" aria-label="${tqH(tqUnidNome(u))}"><h4>${tqH(tqUnidNome(u))}${dis?' <small class="tl">(só consulta)</small>':''}</h4>
<label><input type="radio" name="tqCm_${u}" ${!sel?'checked':''} ${dis} onchange="tqComModo(${u},'todas')"> Se comunica com todas as unidades</label>
<label><input type="radio" name="tqCm_${u}" ${sel?'checked':''} ${dis} onchange="tqComModo(${u},'selecionadas')"> Só com estas unidades:</label>
<div class="tq-sub">${us.map(v=>v===u?`<label><input type="checkbox" checked disabled> ${tqH(tqUnidCurta(v))} (a própria, sempre)</label>`:`<label><input type="checkbox" ${(r.unids||[]).includes(v)?'checked':''} ${dis||!sel?'disabled':''} onchange="tqComUnid(${u},${v},this.checked)"> ${tqH(tqUnidCurta(v))}</label>`).join('')}</div>
<label><input type="checkbox" ${r.limSet?'checked':''} ${dis} onchange="tqComLim(${u},this.checked)"> Limitar aos setores escolhidos:</label>
<div class="tq-sub">${S.setores.map(s=>`<label><input type="checkbox" ${(r.setores||[]).includes(s.id)?'checked':''} ${dis||!r.limSet?'disabled':''} onchange="tqComSet(${u},'${s.id}',this.checked)"> ${tqH(s.n)}</label>`).join('')}</div></div>`}).join('')}</section>`;
 const res=`<section class="card at-card"><h3>Quem cada pessoa pode escolher</h3><p class="tl" style="margin:0">Resultado das regras acima, para conferir.</p><div class="tq-com-res">${tqOpUnidOrdem().map(o=>{const b=tqBloqueados(o.id);return `<div><b>${tqH(o.n)}</b> <small class="tl">(${tqH(tqSetorNome(o.setor))} · ${tqH(tqUnidCurta(o.unid))})</small><br>${b.length?`<span class="x">Não pode escolher: ${b.map(x=>tqH(x.n)).join(', ')}</span>`:'Pode escolher todas as pessoas.'}</div>`}).join('')}</div></section>`;
 const aviso=mine.length?'':`<div class="alert warn" role="note" style="cursor:default;margin-bottom:12px"><b>Só consulta</b><span>${tqH(tqNome(eu))} não administra nenhuma unidade. Troque para Augusto Leal (todas), Lúcia Fernandes (Postos 12 e 14) ou Gustavo Prado (franquia).</span></div>`;
 return `${pageHead('Configurações','Comunicação','Com quais unidades e setores cada unidade pode trocar tarefas. Só aparece para escolher como líder ou acompanhante quem a regra permite. Dados de exemplo, guardados neste navegador.',`<button class="btn ghost" onclick="tqRestaurarDlg()">Restaurar dados de exemplo</button><a class="btn sec" href="#hierarquia">Hierarquia</a>`)}
${tqSimBar('O administrador de cada unidade escolhe com quais unidades a sua se comunica.')}${aviso}
<div class="tq-com-g">${regras}<div style="display:flex;flex-direction:column;gap:16px">${setores}${pessoas}</div>${res}</div>`};
{const nega=()=>toast('Só o administrador desta unidade altera','warn');const g=(f,ok)=>function(){if(!ok.apply(null,arguments)){nega();if(location.hash==='#comunicacao')reView();return}return f.apply(this,arguments)};
 const porUnid=u=>tqAdmDe(tqEu(),u),todas=()=>tqAdmAll(tqEu());
 tqComModo=g(tqComModo,porUnid);tqComUnid=g(tqComUnid,porUnid);tqComLim=g(tqComLim,porUnid);tqComSet=g(tqComSet,porUnid);
 tqSetNovo=g(tqSetNovo,todas);tqSetRen=g(tqSetRen,todas);tqSetDel=g(tqSetDel,todas);tqOpSetor=g(tqOpSetor,o=>tqAdmDe(tqEu(),tqOp(o).unid))}
{const _r=tqRestaurar;tqRestaurar=function(){_r.apply(this,arguments);if(['#hierarquia','#tarefas-painel'].includes(location.hash))reView()}}
