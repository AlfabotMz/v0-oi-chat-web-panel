# 📋 Guia de Migrações do Banco de Dados

Este documento lista todas as migrações SQL que precisam ser executadas no Supabase.

## 🚀 Ordem de Execução

Execute os scripts SQL na seguinte ordem:

### 1. `scripts/001_create_tables.sql`
Cria as tabelas básicas do sistema (profiles, agents, conversations, messages, analytics).

### 2. `scripts/002_add_admin_and_plans.sql`
Adiciona campos de admin, planos e status à tabela profiles.

### 3. `scripts/006_fix_profile_trigger.sql`
Corrige o trigger de criação de profile para usar UPSERT e adicionar full_name.

### 4. `scripts/007_add_agents_fields.sql`
Adiciona campos `prompt` e `anexos` à tabela agents.

### 5. `scripts/008_create_storage_bucket.sql`
Cria políticas de acesso para o bucket de storage (execute após criar o bucket manualmente).

**⚠️ IMPORTANTE**: Este script tem políticas restritivas. Execute também o `scripts/012_fix_storage_policies.sql` para corrigir as políticas de upload.

### 6. `scripts/009_remove_welcome_description.sql`
Remove campos `welcome_message` e `description` da tabela agents.

### 7. `scripts/010_fix_profile_update_policy.sql`
Garante que usuários possam atualizar seu próprio profile durante o signup.

### 8. `scripts/011_fix_admin_view_profiles.sql`
Corrige políticas RLS para permitir que admin veja todos os perfis de usuários usando função helper `is_admin()`.

### 9. `scripts/012_fix_storage_policies.sql`
Corrige políticas de storage para permitir que usuários autenticados façam upload de anexos sem restrições de path.

### 10. `scripts/013_add_notification_fields.sql`
Adiciona campos de notificação WhatsApp à tabela agents (notification_contact_1, notification_contact_2, notification_message).

### 11. `scripts/014_add_support_fields.sql`
Adiciona campos de suporte à tabela profiles (community_link, support_whatsapp_link) para configuração pelo admin.

### 10. `scripts/013_add_notification_fields.sql`
Adiciona campos de notificação WhatsApp à tabela agents (notification_contact_1, notification_contact_2, notification_message).

## 📝 Como Executar

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá para **SQL Editor**
3. Execute cada script na ordem listada acima
4. Verifique se não há erros

## ⚠️ Importante

- **Não execute** `scripts/000_drop_all_tables.sql` em produção (apenas para desenvolvimento)
- Execute as migrações em ordem
- Faça backup do banco antes de executar migrações em produção
- Após executar `scripts/008_create_storage_bucket.sql`, crie o bucket manualmente no Dashboard

## 🔧 Configuração do Storage

Após executar as migrações SQL, configure o storage:

1. Vá para **Storage** > **Buckets**
2. Crie um novo bucket chamado `agent-attachments`
3. Configure como privado
4. As políticas já estarão criadas pelo script `008_create_storage_bucket.sql`

Veja `docs/STORAGE_SETUP.md` para mais detalhes.

## ✅ Verificação

Após executar todas as migrações, verifique:

- [ ] Tabela `profiles` tem campos `role`, `status`, `plan`, `full_name`
- [ ] Tabela `agents` tem campos `prompt` e `anexos`
- [ ] Tabela `agents` NÃO tem campos `welcome_message` e `description`
- [ ] Trigger `handle_new_user` está funcionando e lê metadata corretamente
- [ ] Políticas RLS permitem que usuários atualizem seu próprio profile
- [ ] Função `is_admin()` foi criada e funciona corretamente
- [ ] Admin pode ver todos os perfis de usuários na página de admin
- [ ] Bucket `agent-attachments` existe e tem políticas configuradas
- [ ] Políticas de storage permitem upload de anexos para usuários autenticados
- [ ] Ao criar usuário admin, o profile tem `role = 'admin'` e `plan = 'premium'`

## 🐛 Problemas Comuns

### Erro: "relation already exists"
- Algumas tabelas já podem existir. Use `IF NOT EXISTS` ou `DROP TABLE IF EXISTS` antes de criar.

### Erro: "permission denied"
- Verifique se você tem permissões de administrador no Supabase.

### Erro: "bucket does not exist"
- Crie o bucket manualmente no Dashboard antes de executar as políticas.

### Erro: "new row violates row-level security policy" ao fazer upload
- Execute o script `scripts/012_fix_storage_policies.sql` para corrigir as políticas de storage.
- Verifique se o bucket `agent-attachments` foi criado no Dashboard.
- Certifique-se de que você está autenticado antes de fazer upload.
