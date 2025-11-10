# 🔧 Guia de Solução de Problemas

## Problema: Painel de Admin está vazio

### Sintomas
- A página `/admin` carrega, mas não mostra nenhum usuário
- A mensagem "Nenhum usuário cadastrado ainda" aparece mesmo quando há usuários no banco

### Causas Possíveis

1. **Políticas RLS não foram executadas**
   - O script `011_fix_admin_view_profiles.sql` não foi executado no Supabase
   - As políticas RLS estão bloqueando o acesso aos perfis

2. **Função `is_admin()` não foi criada**
   - A função helper não existe no banco de dados
   - A função existe mas tem erros de sintaxe

3. **Perfil do admin não está configurado corretamente**
   - O usuário não tem `role = 'admin'` no perfil
   - O perfil não foi criado corretamente

### Solução

1. **Execute o script SQL no Supabase:**
   ```sql
   -- Execute scripts/011_fix_admin_view_profiles.sql
   ```
   
   Acesse o [Supabase Dashboard](https://app.supabase.com) > SQL Editor e execute o script completo.

2. **Verifique se a função foi criada:**
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'is_admin';
   ```
   
   Deve retornar `is_admin`.

3. **Verifique se o usuário é admin:**
   ```sql
   SELECT id, email, role, status, plan 
   FROM profiles 
   WHERE role = 'admin';
   ```
   
   Deve retornar pelo menos um usuário com `role = 'admin'`.

4. **Verifique as políticas RLS:**
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'profiles';
   ```
   
   Deve retornar pelo menos:
   - `profiles_select_own`
   - `profiles_select_admin`

5. **Teste a função is_admin():**
   ```sql
   -- Como admin (substitua 'seu-user-id' pelo ID do seu usuário admin)
   SELECT is_admin();
   ```
   
   Deve retornar `true` se você estiver logado como admin.

## Problema: Não consigo acessar a página /dashboard

### Sintomas
- Ao tentar acessar `/dashboard`, é redirecionado para `/login`
- A página fica em loop de redirecionamento
- Erro 404 ou 500 ao acessar `/dashboard`

### Causas Possíveis

1. **Sessão não está sendo mantida**
   - Cookies não estão sendo definidos corretamente
   - O middleware não está funcionando

2. **Cliente Supabase no servidor está incorreto**
   - O arquivo `lib/supabase/server.ts` não está usando `createServerClient` do `@supabase/ssr`
   - Cookies não estão sendo passados corretamente

3. **Usuário não está autenticado**
   - A sessão expirou
   - O token de autenticação é inválido

### Solução

1. **Verifique se está logado:**
   - Tente fazer logout e login novamente
   - Verifique se o email foi confirmado (se necessário)

2. **Verifique o console do navegador:**
   - Abra o DevTools (F12)
   - Vá para a aba Console
   - Procure por erros relacionados ao Supabase

3. **Verifique as cookies:**
   - Abra o DevTools (F12)
   - Vá para a aba Application > Cookies
   - Verifique se há cookies do Supabase (geralmente começam com `sb-`)

4. **Limpe o cache:**
   - Limpe o cache do navegador
   - Tente em modo anônimo/privado

5. **Verifique as variáveis de ambiente:**
   - Verifique se `NEXT_PUBLIC_SUPABASE_URL` está configurado
   - Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurado

## Problema: Erro "Missing closing } at @theme inline"

### Solução
Este erro foi corrigido removendo `inline` de `@theme inline`. Verifique se o arquivo `app/globals.css` está atualizado.

## Verificação Rápida

Execute este script SQL no Supabase para verificar tudo:

```sql
-- 1. Verificar se a função is_admin existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'is_admin';

-- 2. Verificar políticas RLS
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 3. Verificar usuários admin
SELECT id, email, role, status, plan, created_at
FROM profiles 
WHERE role = 'admin';

-- 4. Verificar todos os usuários
SELECT id, email, role, status, plan, created_at
FROM profiles 
ORDER BY created_at DESC;

-- 5. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';
```

## Contato

Se os problemas persistirem, verifique:
1. Os logs do console do navegador
2. Os logs do servidor Next.js
3. Os logs do Supabase Dashboard

