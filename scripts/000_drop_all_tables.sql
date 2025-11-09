-- Drop all existing tables and schemas to start fresh
-- Run this FIRST to clean the database completely

-- Disable foreign key constraints temporarily
SET session_replication_role = replica;

-- Drop all tables in public schema
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Re-enable foreign key constraints
SET session_replication_role = default;
