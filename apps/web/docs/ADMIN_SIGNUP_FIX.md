# 🔧 Correção: Cadastro de Admin com Role e Plan Corretos

## 📋 Problema

Quando um usuário se cadastra marcando a opção de ser administrador (primeiro usuário), o profile deveria ter:
- `role = "admin"`
- `plan = "premium"`
- `status = "active"`

Mas isso não estava funcionando corretamente.

## ✅ Solução Implementada

### 1. Atualização do Código de SignUp (`lib/supabase/auth-actions.ts`)

**Mudanças:**
- Passa `role`, `status`, `plan` e `full_name` no metadata do `signUp`
- Após criar o usuário, verifica se o profile foi criado corretamente
- Se os valores estiverem incorretos, atualiza até 3 vezes
- Aguarda tempo suficiente para o trigger executar

**Fluxo:**
1. Verifica se já existe admin (se isAdmin = true)
2. Prepara valores: `role = "admin"`, `plan = "premium"`, `status = "active"` (se isAdmin)
3. Faz `signUp` com metadata contendo esses valores
4. Aguarda 1 segundo para o trigger executar
5. Verifica se o profile foi criado corretamente
6. Se não estiver correto, atualiza até 3 vezes

### 2. Atualização do Trigger (`scripts/006_fix_profile_trigger.sql`)

**Mudanças:**
- Trigger lê valores do `raw_user_meta_data` (metadata passado no signUp)
- Usa UPSERT para evitar conflitos
- Atualiza `role`, `status` e `plan` no ON CONFLICT

**Como funciona:**
\`\`\`sql
-- O trigger lê do metadata:
user_role := COALESCE(new.raw_user_meta_data->>'role', 'user');
user_status := COALESCE(new.raw_user_meta_data->>'status', 'inactive');
user_plan := COALESCE(new.raw_user_meta_data->>'plan', 'free');
\`\`\`

### 3. Políticas RLS (`scripts/010_fix_profile_update_policy.sql`)

**Mudanças:**
- Garante que usuários possam atualizar seu próprio profile
- Permite que o código cliente atualize o profile após criação

## 🔄 Fluxo Completo

1. **Usuário marca "Registrar como Administrador"** no formulário
2. **Código verifica** se já existe admin
3. **Código faz signUp** com metadata:
   \`\`\`javascript
   {
     role: "admin",
     status: "active",
     plan: "premium",
     full_name: "nome_do_usuario"
   }
   \`\`\`
4. **Trigger executa** e cria profile com valores do metadata
5. **Código verifica** se profile está correto
6. **Se não estiver**, atualiza até 3 vezes
7. **Resultado**: Profile criado com `role = "admin"` e `plan = "premium"`

## 🧪 Como Testar

1. Certifique-se de que não existe nenhum admin no banco
2. Acesse a página de login
3. Clique em "Criar conta"
4. Marque "Registrar como Administrador"
5. Preencha email e senha
6. Clique em "Criar Conta"
7. Verifique no banco de dados que o profile tem:
   - `role = "admin"`
   - `plan = "premium"`
   - `status = "active"`

## ⚠️ Importante

- **Apenas o primeiro usuário** pode se registrar como admin
- Se já existir um admin, a opção será rejeitada
- O trigger precisa estar atualizado (script 006)
- As políticas RLS precisam permitir atualização (script 010)

## 🐛 Troubleshooting

### Profile não está sendo criado com role="admin"

1. Verifique se o trigger está executando:
   \`\`\`sql
   SELECT * FROM profiles WHERE role = 'admin';
   \`\`\`

2. Verifique se o metadata está sendo passado:
   - Abra o console do navegador
   - Verifique os logs durante o signup

3. Verifique as políticas RLS:
   \`\`\`sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   \`\`\`

4. Execute o script 010 para garantir políticas corretas

### Erro: "Já existe uma conta de administrador"

- Isso é esperado se já existe um admin
- Apenas o primeiro usuário pode ser admin
- Para criar outro admin, você precisa:
  - Deletar o admin existente, OU
  - Atualizar manualmente no banco de dados

## 📝 Scripts Necessários

Execute na ordem:
1. `scripts/006_fix_profile_trigger.sql` - Atualiza trigger
2. `scripts/010_fix_profile_update_policy.sql` - Garante políticas RLS

## ✅ Verificação Final

Após implementar, verifique:
- [ ] Trigger `handle_new_user` está criado e atualizado
- [ ] Políticas RLS permitem UPDATE no próprio profile
- [ ] Ao criar admin, o profile tem `role = "admin"` e `plan = "premium"`
- [ ] Ao criar usuário normal, o profile tem `role = "user"` e `plan = "free"`
