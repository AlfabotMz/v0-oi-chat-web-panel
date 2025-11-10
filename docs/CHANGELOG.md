# 📝 Changelog - Implementações Realizadas

## ✅ Problemas Corrigidos

### 1. Criação de Profile ao Registrar Usuário
- **Problema**: Profile não era criado automaticamente com role/admin
- **Solução**: 
  - Atualizado trigger `handle_new_user` para usar UPSERT
  - Modificado `auth-actions.ts` para usar `upsert` ao invés de `insert`
  - Criado script `006_fix_profile_trigger.sql` para corrigir o trigger

### 2. Verificação de Admin na Página de Admin
- **Problema**: Página de admin redirecionava para dashboard mesmo sendo admin
- **Solução**:
  - Atualizado cliente Supabase para usar `createBrowserClient` do `@supabase/ssr`
  - Melhorada lógica de verificação com estado de loading
  - Adicionado estado `checking` para evitar redirecionamento prematuro

## 🆕 Novas Funcionalidades

### 1. Campos Adicionados na Tabela Agents
- **prompt**: Campo de texto para instruções do agente de IA
- **anexos**: Campo JSONB para armazenar anexos (chave-valor)
- **instance_id**: ID da instância do WhatsApp na Evolution API
- **whatsapp_status**: Status da conexão WhatsApp (disconnected, pending, connected, error)

### 2. Sistema de Anexos
- **Componente**: `AttachmentsManager`
- **Funcionalidades**:
  - Adicionar anexos com nome personalizado
  - Upload de múltiplos arquivos por anexo
  - Suporte para imagens, vídeos e documentos
  - Armazenamento no Supabase Storage
  - Sistema de chave-valor (nome do anexo → array de URLs)

### 3. Conexão com WhatsApp
- **Rota**: `/webhook/connect-whatsapp`
- **Funcionalidades**:
  - Criação de instância na Evolution API
  - Geração de QR code para conexão
  - Atualização de status do WhatsApp
  - Polling automático para verificar conexão
- **Componente**: `WhatsAppConnect`
  - Interface visual com QR code
  - Status em tempo real
  - Indicadores visuais de conexão

### 4. Atualização do Formulário de Agente
- **Novos Campos**:
  - Prompt do agente (textarea expandido)
  - Gerenciamento de anexos
  - Conexão WhatsApp
- **Melhorias**:
  - Interface mais organizada
  - Tradução para português
  - Validação melhorada

### 5. Lista de Agentes Atualizada
- Exibição do status do WhatsApp
- Badge visual para status de conexão
- Informações mais detalhadas

## 📁 Arquivos Criados

### Scripts SQL
- `scripts/006_fix_profile_trigger.sql` - Corrige trigger de profile
- `scripts/007_add_agents_fields.sql` - Adiciona novos campos à tabela agents
- `scripts/008_create_storage_bucket.sql` - Políticas de acesso para storage

### Componentes
- `components/dashboard/attachments-manager.tsx` - Gerenciador de anexos
- `components/dashboard/whatsapp-connect.tsx` - Componente de conexão WhatsApp

### Rotas API
- `app/webhook/connect-whatsapp/route.ts` - Webhook para conectar WhatsApp
- `app/api/agents/[id]/status/route.ts` - API para verificar status do agente

### Documentação
- `docs/ANALYTICS_UPDATE.md` - Guia de atualização da tabela analytics
- `docs/STORAGE_SETUP.md` - Guia de configuração do storage
- `docs/CHANGELOG.md` - Este arquivo
- `README_MIGRATIONS.md` - Guia de migrações do banco de dados

## 🔧 Arquivos Modificados

### Código
- `lib/supabase/client.ts` - Atualizado para usar `createBrowserClient`
- `lib/supabase/auth-actions.ts` - Modificado para usar `upsert` ao criar profile
- `app/admin/page.tsx` - Melhorada verificação de admin
- `components/dashboard/agent-config-form.tsx` - Adicionados campos de prompt e anexos
- `components/dashboard/agents-list.tsx` - Adicionado status do WhatsApp
- `components/dashboard/create-agent-dialog.tsx` - (Sem mudanças necessárias)

## ⚙️ Configurações Necessárias

### Variáveis de Ambiente
Adicione ao arquivo `.env.local`:
```env
EVOLUTION_API_URL=https://api.evolution.com.br
EVOLUTION_API_KEY=sua_chave_api
```

### Supabase Storage
1. Crie o bucket `agent-attachments` no Supabase Dashboard
2. Execute o script `scripts/008_create_storage_bucket.sql`
3. Configure as políticas de acesso

### Migrações do Banco de Dados
Execute os scripts SQL na ordem:
1. `scripts/001_create_tables.sql` (se ainda não executado)
2. `scripts/002_add_admin_and_plans.sql` (se ainda não executado)
3. `scripts/006_fix_profile_trigger.sql`
4. `scripts/007_add_agents_fields.sql`
5. `scripts/008_create_storage_bucket.sql`

## 📊 Onde Atualizar Analytics

Veja `docs/ANALYTICS_UPDATE.md` para detalhes sobre onde e como atualizar a tabela analytics no backend.

Principais pontos:
- Webhook de recebimento de mensagens
- Webhook de nova conversa
- Webhook de resposta do agente

## 🚀 Próximos Passos

1. Executar migrações do banco de dados
2. Configurar bucket de storage
3. Configurar variáveis de ambiente
4. Testar criação de usuário admin
5. Testar conexão com WhatsApp
6. Testar upload de anexos
7. Implementar atualizações de analytics nos webhooks

## 🐛 Problemas Conhecidos

- O polling do WhatsApp precisa ser melhorado (atualmente verifica a cada 5 segundos)
- O bucket de storage precisa ser criado manualmente antes de usar
- A Evolution API precisa estar configurada e funcionando

## 📝 Notas

- Todas as strings foram traduzidas para português
- A interface foi melhorada para ser mais intuitiva
- O código foi organizado em componentes reutilizáveis
- Documentação completa foi criada para facilitar manutenção

