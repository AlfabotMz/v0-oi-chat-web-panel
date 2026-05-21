# 📊 Atualização da Tabela Analytics

Este documento explica onde e como atualizar a tabela `analytics` no backend.

## 📍 Onde Atualizar Analytics

### 1. **Webhook de Recebimento de Mensagens** (`/webhook/message`)

Quando uma mensagem é recebida do WhatsApp, atualize os analytics:

\`\`\`typescript
// Exemplo de atualização quando uma mensagem é recebida
const updateAnalytics = async (agentId: string) => {
  const today = new Date().toISOString().split('T')[0]
  
  // Buscar ou criar registro de analytics para hoje
  const { data: existing } = await supabase
    .from('analytics')
    .select('*')
    .eq('agent_id', agentId)
    .eq('date', today)
    .single()
  
  if (existing) {
    // Atualizar mensagens totais
    await supabase
      .from('analytics')
      .update({
        total_messages: existing.total_messages + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
  } else {
    // Criar novo registro
    await supabase
      .from('analytics')
      .insert({
        agent_id: agentId,
        date: today,
        total_messages: 1,
        total_conversations: 0
      })
  }
}
\`\`\`

### 2. **Webhook de Nova Conversa** (`/webhook/conversation`)

Quando uma nova conversa é iniciada:

\`\`\`typescript
const updateConversationAnalytics = async (agentId: string) => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: existing } = await supabase
    .from('analytics')
    .select('*')
    .eq('agent_id', agentId)
    .eq('date', today)
    .single()
  
  if (existing) {
    await supabase
      .from('analytics')
      .update({
        total_conversations: existing.total_conversations + 1
      })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('analytics')
      .insert({
        agent_id: agentId,
        date: today,
        total_messages: 0,
        total_conversations: 1
      })
  }
}
\`\`\`

### 3. **Webhook de Resposta do Agente** (`/webhook/agent-response`)

Ao calcular o tempo de resposta:

\`\`\`typescript
const updateResponseTime = async (agentId: string, responseTimeMs: number) => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: existing } = await supabase
    .from('analytics')
    .select('*')
    .eq('agent_id', agentId)
    .eq('date', today)
    .single()
  
  if (existing) {
    // Calcular média do tempo de resposta
    const currentAvg = existing.avg_response_time || 0
    const totalResponses = existing.total_messages || 1
    const newAvg = Math.round(
      (currentAvg * (totalResponses - 1) + responseTimeMs) / totalResponses
    )
    
    await supabase
      .from('analytics')
      .update({
        avg_response_time: newAvg
      })
      .eq('id', existing.id)
  }
}
\`\`\`

## 🎯 Estrutura da Tabela Analytics

\`\`\`sql
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  total_messages INT DEFAULT 0,
  total_conversations INT DEFAULT 0,
  avg_response_time INT, -- em milissegundos
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## 📝 Campos da Tabela

- **total_messages**: Número total de mensagens enviadas/recebidas no dia
- **total_conversations**: Número de conversas iniciadas no dia
- **avg_response_time**: Tempo médio de resposta em milissegundos
- **date**: Data do registro (um registro por agente por dia)

## 🔄 Fluxo Recomendado

1. **Mensagem Recebida** → Incrementar `total_messages`
2. **Nova Conversa** → Incrementar `total_conversations`
3. **Resposta Enviada** → Calcular e atualizar `avg_response_time`

## ⚠️ Observações Importantes

- Um registro por agente por dia (usar `UPSERT` com `agent_id` e `date`)
- Sempre verificar se o registro existe antes de atualizar
- Usar transações quando possível para garantir consistência
- Considerar criar índices em `agent_id` e `date` para melhor performance

## 🚀 Exemplo Completo de Webhook

\`\`\`typescript
// app/webhook/message/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { agent_id, message, conversation_id } = body
  
  // 1. Salvar mensagem no banco
  await supabase.from('messages').insert({...})
  
  // 2. Atualizar analytics
  await updateAnalytics(agent_id)
  
  // 3. Se for primeira mensagem da conversa
  if (isNewConversation) {
    await updateConversationAnalytics(agent_id)
  }
  
  return NextResponse.json({ success: true })
}
\`\`\`
