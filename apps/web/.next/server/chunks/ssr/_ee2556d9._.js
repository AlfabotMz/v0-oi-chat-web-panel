module.exports=[96826,a=>{"use strict";let b=(0,a.i(61237).default)("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]);a.s(["Trash2",()=>b],96826)},2215,a=>{"use strict";let b=(0,a.i(61237).default)("Check",[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]);a.s(["default",()=>b])},55480,a=>{"use strict";var b=a.i(78701);function c(a){let c=b.useRef({value:a,previous:a});return b.useMemo(()=>(c.current.value!==a&&(c.current.previous=c.current.value,c.current.value=a),c.current.previous),[a])}a.s(["usePrevious",()=>c])},62459,a=>{"use strict";var b=a.i(78701),c=a.i(50973);function d(a){let[d,e]=b.useState(void 0);return(0,c.useLayoutEffect)(()=>{if(a){e({width:a.offsetWidth,height:a.offsetHeight});let b=new ResizeObserver(b=>{let c,d;if(!Array.isArray(b)||!b.length)return;let f=b[0];if("borderBoxSize"in f){let a=f.borderBoxSize,b=Array.isArray(a)?a[0]:a;c=b.inlineSize,d=b.blockSize}else c=a.offsetWidth,d=a.offsetHeight;e({width:c,height:d})});return b.observe(a,{box:"border-box"}),()=>b.unobserve(a)}e(void 0)},[a]),d}a.s(["useSize",()=>d])},60090,a=>{"use strict";let b=(0,a.i(61237).default)("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);a.s(["RefreshCw",()=>b],60090)},28980,a=>{"use strict";let b=(0,a.i(61237).default)("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);a.s(["Sparkles",()=>b],28980)},51071,a=>{"use strict";let b=(0,a.i(61237).default)("Zap",[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]]);a.s(["Zap",()=>b],51071)},81167,a=>{"use strict";let b=`Voc\xea \xe9 um agente de vendas de elite da OiChat, especializado em converter leads para o produto: {product_name}.

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

//# sourceMappingURL=_ee2556d9._.js.map