# 🔧 Configuração do n8n

Este documento explica como configurar a integração com n8n para criação de agentes e conexão do WhatsApp.

## 📋 Variáveis de Ambiente

Adicione uma das seguintes variáveis no arquivo `.env.local`:

### Opção 1: URL completa do webhook (recomendado)
```env
N8N_WEBHOOK_URL=https://n8n.myoichat.online/webhook/connect-whatsapp
```

### Opção 2: URL base do n8n (o código adiciona o caminho automaticamente)
```env
N8N_WEBHOOK_URL=https://n8n.myoichat.online
```
ou
```env
N8N_URL=https://n8n.myoichat.online
```

## 🔍 Como Funciona

1. O código verifica primeiro a variável `N8N_WEBHOOK_URL`
2. Se não existir, verifica `N8N_URL`
3. Se nenhuma existir, usa o valor padrão: `https://n8n.myoichat.online`
4. Se a URL não contém `/webhook/`, o código adiciona automaticamente `/webhook/connect-whatsapp`

## 📡 Webhooks Disponíveis

### 1. Criar Agente (`/webhook/create-agent`)

**Requisição:**
```json
{
  "user_id": "uuid-do-usuario-supabase",
  "nome": "Daniel",
  "prompt": "Olá! Sou o atendente virtual OiChat."
}
```

**Resposta Esperada (Formato 1 - Direto):**
```json
{
  "success": true,
  "message": "Agente criado com sucesso!",
  "agent": {
    "agent_id": "agente_1234",
    "nome": "Daniel",
    "prompt": "Olá! Sou o atendente virtual OiChat.",
    "status": "disconnected"
  }
}
```

**Resposta Esperada (Formato 2 - Com wrapper data):**
```json
{
  "data": {
    "success": false,
    "message": "Agente criado com sucesso!",
    "agent": {
      "agent_id": "647065c0-1f13-4fbc-93f8-0d44e79a6834"
    },
    "nome": "test4",
    "prompt": "Agente de vendas",
    "status": "disconnected"
  }
}
```

**Nota**: O código aceita ambos os formatos. No formato 2, os campos `nome`, `prompt` e `status` podem estar no mesmo nível que `agent`, não necessariamente dentro de `agent`.

### 2. Conectar WhatsApp (`/webhook/connect-whatsapp`)

**Requisição:**
```json
{
  "agent_id": "uuid-do-agente"
}
```

## 📥 Formato da Resposta Esperada

### Resposta do Webhook de Conexão WhatsApp

O webhook n8n deve retornar uma resposta JSON no seguinte formato:

```json
{
  "success": true,
  "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...",
  "status": "pending",
  "message": "Escaneie o QR code para conectar seu número de WhatsApp."
}
```

### Campos da Resposta (Conexão WhatsApp)

- `success` (boolean): Indica se a operação foi bem-sucedida
- `qr` (string): QR code em formato base64 ou URL da imagem
- `status` (string): Status da conexão (`pending`, `connected`, `disconnected`)
- `message` (string): Mensagem para o usuário

### Campos da Resposta (Criar Agente)

**Formato 1 (Direto):**
- `success` (boolean): Indica se a operação foi bem-sucedida
- `message` (string): Mensagem de sucesso ou erro
- `agent` (object): Objeto com os dados do agente criado
  - `agent_id` (string): ID do agente no n8n (ex: "agente_1234" ou UUID)
  - `nome` (string): Nome do agente
  - `prompt` (string): Prompt do agente
  - `status` (string): Status inicial do agente (geralmente "disconnected")

**Formato 2 (Com wrapper data):**
- `data` (object): Wrapper com os dados da resposta
  - `success` (boolean): Pode ser `false` mesmo com sucesso (verificar `message`)
  - `message` (string): Mensagem de sucesso ou erro (verificar palavras-chave: "sucesso", "criado")
  - `agent` (object): Objeto com `agent_id` (pode estar vazio ou só com `agent_id`)
  - `nome` (string): Nome do agente (no mesmo nível que `agent`)
  - `prompt` (string): Prompt do agente (no mesmo nível que `agent`)
  - `status` (string): Status inicial do agente (no mesmo nível que `agent`)

**Nota**: O código detecta automaticamente o formato e extrai os dados corretamente. Se `success` for `false` mas a mensagem contiver "sucesso" ou "criado", a operação é considerada bem-sucedida.

## 🐛 Solução de Problemas

### Erro: "Erro ao conectar com o servidor n8n"

**Causa**: A URL do n8n está incorreta ou o servidor n8n não está acessível.

**Solução**:
1. Verifique se a variável `N8N_WEBHOOK_URL` está configurada no `.env.local`
2. Verifique se a URL está correta (sem barra no final, se for URL base)
3. Teste a URL no navegador ou com curl:
   ```bash
   curl -X POST https://n8n.myoichat.online/webhook/connect-whatsapp \
     -H "Content-Type: application/json" \
     -d '{"agent_id":"test"}'
   ```

### Erro: "Resposta inválida do webhook n8n"

**Causa**: O webhook n8n está retornando uma resposta que não é JSON.

**Solução**:
1. Verifique se o webhook n8n está configurado para retornar JSON
2. Verifique os logs do servidor Next.js para ver a resposta completa
3. Verifique se o webhook n8n está funcionando corretamente

### Erro: "QR code não foi retornado pela API"

**Causa**: O webhook n8n não está retornando o campo `qr` na resposta.

**Solução**:
1. Verifique se o webhook n8n está gerando o QR code corretamente
2. Verifique se o campo `qr` está presente na resposta JSON
3. Verifique os logs do servidor para ver a resposta completa

## 🔐 Segurança

- O webhook n8n deve validar o `agent_id` recebido
- Recomenda-se adicionar autenticação no webhook n8n (token, API key, etc.)
- Não exponha a URL do webhook publicamente se possível

## 📝 Notas

- A URL do webhook é lida apenas no servidor (server-side)
- Mudanças no `.env.local` exigem reiniciar o servidor Next.js
- O código adiciona logs no console do servidor para debug

## 🔗 Links Úteis

- [Documentação do n8n](https://docs.n8n.io/)
- [Webhooks no n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

