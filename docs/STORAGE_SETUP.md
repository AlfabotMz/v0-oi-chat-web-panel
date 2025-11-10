# 📦 Configuração do Storage para Anexos

Este documento explica como configurar o bucket de storage no Supabase para anexos de agentes.

## 🚀 Passos para Configurar

### 1. Criar o Bucket no Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá para **Storage** > **Buckets**
3. Clique em **"New bucket"**
4. Configure:
   - **Name**: `agent-attachments`
   - **Public bucket**: ❌ Não (privado)
   - **File size limit**: 50 MB (ou conforme necessário)
   - **Allowed MIME types**: `image/*,video/*,application/pdf`

### 2. Executar Script SQL de Políticas

Execute o script `scripts/008_create_storage_bucket.sql` no SQL Editor do Supabase para criar as políticas de acesso.

### 3. Verificar Variáveis de Ambiente

Certifique-se de que as variáveis de ambiente estão configuradas:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📝 Estrutura de Pastas

Os arquivos serão armazenados na seguinte estrutura:
```
agent-attachments/
  └── attachments/
      └── {attachment_name}_{timestamp}.{ext}
```

## 🔒 Políticas de Acesso

- **Upload**: Apenas usuários autenticados
- **Visualização**: Apenas usuários autenticados
- **Deleção**: Usuários autenticados podem deletar seus próprios arquivos
- **Admin**: Admins podem gerenciar todos os arquivos

## 🧪 Testar Upload

Após configurar, teste o upload de arquivos através do componente `AttachmentsManager` na página de configuração do agente.

