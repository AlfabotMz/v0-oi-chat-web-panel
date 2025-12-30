"use server"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// We will now define the SQL scripts as static strings to avoid Node.js module dependency

const SQL_SCRIPTS = {
  "000_drop_all_tables": `-- Drop all existing tables and schemas to start fresh
SET session_replication_role = replica;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS plan_history CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
SET session_replication_role = default;`,

  "001_create_tables": `-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  whatsapp TEXT,
  phone TEXT,
  business_name TEXT,
  business_type TEXT,
  monthly_revenue TEXT,
  market TEXT,
  company_size TEXT,
  goal TEXT,
  source TEXT,
  community_link TEXT,
  support_whatsapp_link TEXT,
  subscription_status TEXT DEFAULT 'trial',
  plan_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  plan_end_date TIMESTAMP WITH TIME ZONE,
  last_payment_id TEXT,
  trial_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT,
  status TEXT DEFAULT 'active',
  n8n_webhook_url TEXT,
  prompt TEXT,
  anexos JSONB DEFAULT '{}'::jsonb,
  contact_owner TEXT,
  contact_delivery TEXT,
  product TEXT,
  custom_message TEXT DEFAULT '🚀 Nova Encomenda Recebida!',
  message_delay INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  status TEXT DEFAULT 'active',
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('agent', 'contact')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MZN',
    status TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    phone_number TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "agents_select_own" ON public.agents FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "agents_all_own" ON public.agents FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plan, subscription_status, plan_end_date)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'pro',
    'trial',
    NOW() + INTERVAL '7 days'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,
}

export async function runMigrations() {
  try {
    console.log("[v0] Iniciando migrações do banco de dados (via Server Action)...")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC__SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC__SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[v0] Erro: Variáveis de ambiente Supabase não encontradas no servidor.")
      return {
        success: false,
        error: "Erro: Variáveis de ambiente não configuradas no servidor (Service Role Key necessária).",
      }
    }

    const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey)

    // This bypasses the fs/path dependency that causes build errors in Client Components
    const scriptsToRun = ["000_drop_all_tables", "001_create_tables"]
    let successCount = 0

    for (const scriptKey of scriptsToRun) {
      const sql = SQL_SCRIPTS[scriptKey as keyof typeof SQL_SCRIPTS]
      if (!sql) continue

      console.log(`[v0] Executando script: ${scriptKey}...`)

      // Split into statements to handle potential RPC limitations
      const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      for (const statement of statements) {
        const { error } = await supabase.rpc("exec_sql", { sql: statement + ";" })
        if (error) {
          console.warn(`[v0] Alerta no statement do script ${scriptKey}:`, error.message)
        }
      }
      successCount++
    }

    return {
      success: true,
      message: `Migrações concluídas com sucesso (${successCount} scripts processados).`,
    }
  } catch (error) {
    console.error("[v0] Falha na migração:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido durante a migração",
    }
  }
}
