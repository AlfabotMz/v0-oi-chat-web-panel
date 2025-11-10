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

### 2. Sistema de Anexos
- **Componente**: `AttachmentsManager`
- **Funcionalidades**:
  - Adicionar anexos com nome personalizado
  - Upload de múltiplos arquivos por anexo
  - Suporte para imagens, vídeos e documentos
  - Armazenamento no Supabase Storage
  - Sistema de chave-valor (nome do anexo → array de URLs)

### 3. Conexão com WhatsApp
- **Método**: Conexão através do webhook n8n
- **Rota**: `/api/agents/connect-whatsapp` - Chama webhook n8n e retorna QR code
- **Componente**: `WhatsAppConnect` - Exibe QR code para escanear com WhatsApp
- **Funcionalidade**: 
  - Faz POST para `https://n8n.myoichat.online/webhook/connect-whatsapp`
  - Envia `agent_id` no body
  - Webhook n8n processa e retorna QR code
  - Usuário escaneia o QR code com WhatsApp
  - Simples e direto, sem complexidade adicional

### 4. Atualização do Formulário de Agente
- **Novos Campos**:
  - Prompt do agente (textarea expandido)
  - Gerenciamento de anexos
  - URL do Webhook n8n (WhatsApp)
- **Melhorias**:
  - Interface mais organizada
  - Tradução para português
  - Validação melhorada
  - Campo de webhook n8n com descrição clara para conexão WhatsApp

## 📁 Arquivos Criados

### Scripts SQL
- `scripts/006_fix_profile_trigger.sql` - Corrige trigger de profile
- `scripts/007_add_agents_fields.sql` - Adiciona novos campos à tabela agents
- `scripts/008_create_storage_bucket.sql` - Políticas de acesso para storage
- `scripts/009_remove_welcome_description.sql` - Remove campos welcome_message e description

### Componentes
- `components/dashboard/attachments-manager.tsx` - Gerenciador de anexos
- `components/dashboard/whatsapp-connect.tsx` - Componente de conexão WhatsApp

### Rotas API
- `app/api/agents/connect-whatsapp/route.ts` - Endpoint para conectar WhatsApp

### Documentação
- `docs/ANALYTICS_UPDATE.md` - Guia de atualização da tabela analytics
- `docs/STORAGE_SETUP.md` - Guia de configuração do storage
- `docs/CHANGELOG.md` - Este arquivo
- `README_MIGRATIONS.md` - Guia de migrações do banco de dados

## 🔄 Funcionalidades Atualizadas

### Conexão com WhatsApp via Webhook n8n
- **Rota**: `/api/agents/connect-whatsapp` - Endpoint que chama webhook n8n e retorna QR code
- **Componente**: `WhatsAppConnect` - Componente simplificado que apenas mostra o QR code
- **Funcionalidade**: Faz POST para `https://n8n.myoichat.online/webhook/connect-whatsapp` com `agent_id` e exibe o QR code retornado
- **Simplicidade**: Sem polling, sem verificação de status, apenas chamar webhook n8n e mostrar QR code

### Criação de Agentes via Webhook n8n
- **Rota**: `/api/agents/create` - Endpoint que chama webhook n8n para criar agente
- **Funcionalidade**: 
  - Faz POST para `https://n8n.myoichat.online/webhook/create-agent` com `user_id`, `nome` e `prompt`
  - Após receber resposta do n8n, salva o agente no Supabase
  - O agente é criado primeiro no n8n, depois sincronizado com o Supabase
- **Campos Obrigatórios**: `nome` e `prompt`
- **Campo Opcional**: `phone_number`
- **Componente**: `CreateAgentDialog` atualizado com campo de prompt obrigatório

## 🗑️ Funcionalidades Removidas

### Campos Removidos da Tabela Agents
- **Removido**: Campo `welcome_message` - Mensagem de boas-vindas removida
- **Removido**: Campo `description` - Descrição do agente removida
- **Razão**: Simplificação da estrutura, esses campos não são mais necessários
- **Script**: `scripts/009_remove_welcome_description.sql` - Remove os campos do banco de dados
- **Frontend**: Campos removidos dos formulários de criação e edição de agentes

## 🔧 Arquivos Modificados

### Código
- `lib/supabase/client.ts` - Atualizado para usar `createBrowserClient`
- `lib/supabase/auth-actions.ts` - Modificado para usar `upsert` ao criar profile
- `app/admin/page.tsx` - Melhorada verificação de admin
- `components/dashboard/agent-config-form.tsx` - Removidos campos description e welcome_message
- `components/dashboard/agents-list.tsx` - Removida exibição de description
- `components/dashboard/create-agent-dialog.tsx` - Removidos campos description e welcome_message

## ⚙️ Configurações Necessárias

### Variáveis de Ambiente
```env
# Opção 1: URL completa do webhook (recomendado)
N8N_WEBHOOK_URL=https://n8n.myoichat.online/webhook/connect-whatsapp

# Opção 2: URL base do n8n (o código adiciona o caminho automaticamente)
N8N_WEBHOOK_URL=https://n8n.myoichat.online
# ou
N8N_URL=https://n8n.myoichat.online
```
**Nota**: 
- Se não configurar, o padrão é `https://n8n.myoichat.online/webhook/connect-whatsapp`
- O código aceita tanto a URL completa quanto apenas a URL base
- Se a URL não contém `/webhook/`, o código adiciona automaticamente `/webhook/connect-whatsapp`
- Veja `docs/N8N_CONFIG.md` para mais detalhes

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

