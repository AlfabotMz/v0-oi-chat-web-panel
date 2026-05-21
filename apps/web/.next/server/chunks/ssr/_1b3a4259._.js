module.exports=[83446,(a,b,c)=>{"use strict";Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"registerServerReference",{enumerable:!0,get:function(){return d.registerServerReference}});let d=a.r(18592)},90030,(a,b,c)=>{"use strict";function d(a){for(let b=0;b<a.length;b++){let c=a[b];if("function"!=typeof c)throw Object.defineProperty(Error(`A "use server" file can only export async functions, found ${typeof c}.
Read more: https://nextjs.org/docs/messages/invalid-use-server-value`),"__NEXT_ERROR_CODE",{value:"E352",enumerable:!1,configurable:!0})}}Object.defineProperty(c,"__esModule",{value:!0}),Object.defineProperty(c,"ensureServerEntryExports",{enumerable:!0,get:function(){return d}})},43701,a=>{"use strict";var b=a.i(83446),c=a.i(80934),d=a.i(90030);let e={"000_drop_all_tables":`
    -- Drop all existing tables and schemas to start fresh
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
    SET session_replication_role = default;
  `,"001_create_tables":`
    -- Enable necessary extensions
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
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `,"011_fix_admin_view_profiles":`
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
      RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';
    EXCEPTION WHEN OTHERS THEN RETURN FALSE;
    END; $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

    DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
    CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());

    DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
    CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

    DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
    CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
  `};async function f(){try{let a="https://qiyxxzyvnklqlsukjqdw.supabase.co",b=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!a||!b)return{success:!1,error:"Erro: Variáveis de ambiente não configuradas no servidor."};let d=(0,c.createClient)(a,b),f=0;for(let a of["000_drop_all_tables","001_create_tables","011_fix_admin_view_profiles"]){let b=e[a];if(b){for(let c of b.split(";").map(a=>a.trim()).filter(a=>a.length>0)){let{error:b}=await d.rpc("exec_sql",{sql:c+";"});b&&console.warn(`[v0] Alerta no script ${a}:`,b.message)}f++}}return{success:!0,message:`Migra\xe7\xf5es conclu\xeddas com sucesso (${f} scripts processados).`}}catch(a){return{success:!1,error:a instanceof Error?a.message:"Erro desconhecido"}}}(0,d.ensureServerEntryExports)([f]),(0,b.registerServerReference)(f,"008b8b9fc73d51efa50af575faafdd79d2438cca55",null),a.s([],65479),a.i(65479),a.s(["008b8b9fc73d51efa50af575faafdd79d2438cca55",()=>f],43701)}];

//# sourceMappingURL=_1b3a4259._.js.map