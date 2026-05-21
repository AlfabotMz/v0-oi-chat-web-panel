module.exports=[63652,(a,b,c)=>{"use strict";c._=function(a){return a&&a.__esModule?a:{default:a}}},66675,(a,b,c)=>{"use strict";b.exports=a.r(48596).vendored.contexts.HeadManagerContext},82634,a=>{"use strict";let b=(0,a.i(61237).default)("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);a.s(["MessageSquare",()=>b],82634)},8478,a=>{"use strict";let b=(0,a.i(61237).default)("CircleHelp",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);a.s(["HelpCircle",()=>b],8478)},64537,a=>{"use strict";let b=(0,a.i(61237).default)("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);a.s(["LogOut",()=>b],64537)},5280,(a,b,c)=>{"use strict";b.exports=a.r(48596).vendored["react-ssr"].ReactServerDOMTurbopackClient},39067,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d,e={ACTION_HMR_REFRESH:function(){return k},ACTION_NAVIGATE:function(){return h},ACTION_REFRESH:function(){return g},ACTION_RESTORE:function(){return i},ACTION_SERVER_ACTION:function(){return l},ACTION_SERVER_PATCH:function(){return j},PrefetchKind:function(){return m}};for(var f in e)Object.defineProperty(c,f,{enumerable:!0,get:e[f]});let g="refresh",h="navigate",i="restore",j="server-patch",k="hmr-refresh",l="server-action";var m=((d={}).AUTO="auto",d.FULL="full",d.TEMPORARY="temporary",d);("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},90185,(a,b,c)=>{"use strict";function d(a){return null!==a&&"object"==typeof a&&"then"in a&&"function"==typeof a.then}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"isThenable",{enumerable:!0,get:function(){return d}})},45094,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={dispatchAppRouterAction:function(){return i},useActionQueue:function(){return j}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(3988)._(a.r(78701)),g=a.r(90185),h=null;function i(a){if(null===h)throw Object.defineProperty(Error("Internal Next.js error: Router action dispatched before initialization."),"__NEXT_ERROR_CODE",{value:"E668",enumerable:!1,configurable:!0});h(a)}function j(a){let[b,c]=f.default.useState(a.state);h=b=>a.dispatch(b,c);let d=(0,f.useMemo)(()=>b,[b]);return(0,g.isThenable)(d)?(0,f.use)(d):d}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},2514,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"callServer",{enumerable:!0,get:function(){return g}});let d=a.r(78701),e=a.r(39067),f=a.r(45094);async function g(a,b){return new Promise((c,g)=>{(0,d.startTransition)(()=>{(0,f.dispatchAppRouterAction)({type:e.ACTION_SERVER_ACTION,actionId:a,actionArgs:b,resolve:c,reject:g})})})}("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},64457,(a,b,c)=>{"use strict";let d;Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"findSourceMapURL",{enumerable:!0,get:function(){return d}});("function"==typeof c.default||"object"==typeof c.default&&null!==c.default)&&void 0===c.default.__esModule&&(Object.defineProperty(c.default,"__esModule",{value:!0}),Object.assign(c.default,c),b.exports=c.default)},32714,a=>{"use strict";var b=a.i(37330);a.i(67636);var c=a.i(17323);function d({className:a,...d}){return(0,b.jsx)("div",{"data-slot":"card",className:(0,c.cn)("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",a),...d})}function e({className:a,...d}){return(0,b.jsx)("div",{"data-slot":"card-header",className:(0,c.cn)("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",a),...d})}function f({className:a,...d}){return(0,b.jsx)("div",{"data-slot":"card-title",className:(0,c.cn)("leading-none font-semibold",a),...d})}function g({className:a,...d}){return(0,b.jsx)("div",{"data-slot":"card-description",className:(0,c.cn)("text-muted-foreground text-sm",a),...d})}function h({className:a,...d}){return(0,b.jsx)("div",{"data-slot":"card-content",className:(0,c.cn)("px-6",a),...d})}function i({className:a,...d}){return(0,b.jsx)("div",{"data-slot":"card-footer",className:(0,c.cn)("flex items-center px-6 [.border-t]:pt-6",a),...d})}a.s(["Card",()=>d,"CardContent",()=>h,"CardDescription",()=>g,"CardFooter",()=>i,"CardHeader",()=>e,"CardTitle",()=>f])},11292,a=>{"use strict";let b=(0,a.i(61237).default)("Settings",[["path",{d:"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",key:"1qme2f"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);a.s(["Settings",()=>b],11292)},84435,a=>{"use strict";let b=(0,a.i(61237).default)("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);a.s(["Loader2",()=>b],84435)},61644,a=>{"use strict";var b=a.i(37330);a.i(67636);var c=a.i(17323);function d({className:a,type:d,...e}){return(0,b.jsx)("input",{type:d,"data-slot":"input",className:(0,c.cn)("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm","focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]","aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",a),...e})}a.s(["Input",()=>d])},88524,a=>{"use strict";var b=a.i(37330),c=a.i(78701);a.i(91952);var d=a.i(14774),e=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"].reduce((a,e)=>{let f=(0,d.createSlot)(`Primitive.${e}`),g=c.forwardRef((a,c)=>{let{asChild:d,...g}=a;return(0,b.jsx)(d?f:e,{...g,ref:c})});return g.displayName=`Primitive.${e}`,{...a,[e]:g}},{}),f=c.forwardRef((a,c)=>(0,b.jsx)(e.label,{...a,ref:c,onMouseDown:b=>{b.target.closest("button, input, select, textarea")||(a.onMouseDown?.(b),!b.defaultPrevented&&b.detail>1&&b.preventDefault())}}));f.displayName="Label",a.i(67636);var g=a.i(17323);function h({className:a,...c}){return(0,b.jsx)(f,{"data-slot":"label",className:(0,g.cn)("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",a),...c})}a.s(["Label",()=>h],88524)},96826,a=>{"use strict";let b=(0,a.i(61237).default)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);a.s(["Trash2",()=>b],96826)},99009,a=>{"use strict";let b=(0,a.i(61237).default)("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]);a.s(["TrendingUp",()=>b],99009)},41573,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0});var d={default:function(){return k},getImageProps:function(){return j}};for(var e in d)Object.defineProperty(c,e,{enumerable:!0,get:d[e]});let f=a.r(63652),g=a.r(39463),h=a.r(87549),i=f._(a.r(7264));function j(a){let{props:b}=(0,g.getImgProps)(a,{defaultLoader:i.default,imgConf:{deviceSizes:[640,750,828,1080,1200,1920,2048,3840],imageSizes:[32,48,64,96,128,256,384],qualities:[75],path:"/_next/image",loader:"default",dangerouslyAllowSVG:!1,unoptimized:!0}});for(let[a,c]of Object.entries(b))void 0===c&&delete b[a];return{props:b}}let k=h.Image},26399,(a,b,c)=>{b.exports=a.r(41573)},28980,a=>{"use strict";let b=(0,a.i(61237).default)("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);a.s(["Sparkles",()=>b],28980)},51071,a=>{"use strict";let b=(0,a.i(61237).default)("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);a.s(["Zap",()=>b],51071)},94480,a=>{"use strict";var b=a.i(2215);a.s(["Check",()=>b.default])},6966,a=>{"use strict";let b=(0,a.i(61237).default)("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);a.s(["ArrowRight",()=>b],6966)},78346,a=>{"use strict";let b=(0,a.i(61237).default)("Bot",[["path",{d:"M12 8V4H8",key:"hb8ula"}],["rect",{width:"16",height:"12",x:"4",y:"8",rx:"2",key:"enze0r"}],["path",{d:"M2 14h2",key:"vft8re"}],["path",{d:"M20 14h2",key:"4cs60a"}],["path",{d:"M15 13v2",key:"1xurst"}],["path",{d:"M9 13v2",key:"rq6x2g"}]]);a.s(["Bot",()=>b],78346)},81167,a=>{"use strict";let b=`Voc\xea \xe9 um agente de vendas de elite da OiChat, especializado em converter leads para o produto: {product_name}.

--- 📋 PERFIL DE ATENDIMENTO ---
- P\xfablico-alvo: {audience}
- Tom de voz: {tone}
- Valor do produto: {product_price}
- Canal: WhatsApp

--- 🎯 OBJETIVO PRINCIPAL ---
Transformar cada d\xfavida em uma venda conclu\xedda, seguindo o fluxo de convers\xe3o estruturado abaixo.

--- 🚀 FLUXO FIXO DE CONVERS\xc3O (N\xc3O DESVIAR) ---
1. MENSAGEM INICIAL + VISUAL:
   - Sauda\xe7\xe3o calorosa de acordo com o tom ({tone}).
   - Apresenta\xe7\xe3o r\xe1pida do {product_name}.
   - Refer\xeancia \xe0 foto/cat\xe1logo enviada.

2. QUALIFICA\xc7\xc3O E LOCALIZA\xc7\xc3O:
   - Pergunta obrigat\xf3ria: "Voc\xea est\xe1 em Maputo ou em outra prov\xedncia?"
   - Se fora de Maputo: Informar que o envio \xe9 feito via transportadora com pagamento antecipado.
   - Se Maputo: Informar que a entrega \xe9 feita no mesmo dia ou no dia seguinte.

3. OFERTA DIRETA E BENEF\xcdCIOS:
   - Apresentar o valor de {product_price}.
   - Listar os 3 principais diferenciais baseados na descri\xe7\xe3o:
     {product_description}

4. UPSELL E VALOR AGREGADO:
   - Oferecer uma condi\xe7\xe3o especial: "Leve 2 por [X valor]" ou "Adicione [Produto B] por apenas mais [Y]".
   - Gatilho de escassez: "Temos poucas unidades para entrega hoje em sua regi\xe3o."

5. CAPTURA DE DADOS DE ENTREGA:
   - Solicitar: Nome Completo e Endere\xe7o Exato de Entrega.

6. CONFIRMA\xc7\xc3O E ENTREGA:
   - Confirmar todos os dados.
   - Informar que o pedido foi enviado para o delivery.

--- ⚠️ REGRAS CR\xcdTICAS ---
- Nunca altere o valor de {product_price}.
- Use emojis que reforcem o tom {tone}.
- Se o cliente perguntar algo "fora da caixa", use a descri\xe7\xe3o: {product_description}
- Finalize sempre com uma pergunta para manter a conversa ativa.

👉 Execute a fun\xe7\xe3o $send_conversation

[FIM DO PROMPT]`,c=`Voc\xea \xe9 um Especialista de Suporte T\xe9cnico e Customer Success para o produto: {product_name}.

--- 📋 PERFIL DE ATENDIMENTO ---
- Tom de voz: {tone} (Prioridade: Resolu\xe7\xe3o e Empatia)
- Valor de refer\xeancia: {product_price}
- Canal: WhatsApp

--- 🛠 FLUXO PADR\xc3O DE RESOLU\xc7\xc3O ---
1. SAUDA\xc7\xc3O E IDENTIFICA\xc7\xc3O:
   - Receba o cliente pelo nome (se dispon\xedvel).
   - Mostre prontid\xe3o para resolver qualquer problema.

2. DIAGN\xd3STICO OBJETIVO:
   - Pe\xe7a detalhes sobre o erro ou d\xfavida.
   - Solicite prints ou v\xeddeos se necess\xe1rio.

3. RESOLU\xc7\xc3O BASEADA NO CONHECIMENTO DO PRODUTO:
   --- INFORMA\xc7\xd5ES T\xc9CNICAS E REGRAS ---
   {product_description}
   --------------------------------------
   - D\xea passos claros (1, 2, 3) para a solu\xe7\xe3o.

4. CONFIRMA\xc7\xc3O DE SATISFA\xc7\xc3O:
   - "Consegui resolver sua d\xfavida hoje? H\xe1 algo mais em que eu possa ajudar?"

5. ENCERRAMENTO EDUCADO:
   - Despe\xe7a-se refor\xe7ando que o suporte est\xe1 sempre dispon\xedvel.

--- ⚠️ REGRAS DE OURO ---
- Nunca especule. Use apenas os dados da descri\xe7\xe3o.
- Mantenha o tom {tone} even if the cliente estiver frustrado.
- Se o caso exigir interven\xe7\xe3o humana, informe: "Vou transferir seu caso para um especialista humano" e use $send_conversation.

👉 Execute a fun\xe7\xe3o $send_conversation

[FIM DO PROMPT]`;function d(a,d,e){return"personalizado"===a?e:("support"===a?c:b).replace(/{product_name}/g,d.product_name||"[Nome do Produto]").replace(/{product_price}/g,d.product_price||"[Valor]").replace(/{audience}/g,d.audience||"Ambos").replace(/{tone}/g,d.tone||"Direto").replace(/{product_description}/g,d.product_description||"[Descrição do Produto]")}a.s(["generatePrompt",()=>d])}];

//# sourceMappingURL=_ef89b481._.js.map