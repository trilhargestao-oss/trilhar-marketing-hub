-- ================================================================
-- TRILHAR MARKETING HUB - Schema Completo + Modo Agência (v2.0)
-- Execute este script no SQL Editor do seu projeto Supabase
-- ================================================================

-- Tabela: posts (Calendário e Conteúdo)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  platform text NOT NULL,
  type text NOT NULL,
  date date NOT NULL,
  time time without time zone NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  remind_me boolean DEFAULT false,
  briefing text
);

-- Tabela: copies (Copies & Ideias)
CREATE TABLE IF NOT EXISTS public.copies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  platform text NOT NULL,
  category text NOT NULL,
  tone text NOT NULL,
  context text,
  is_favorite boolean DEFAULT false
);

-- Tabela: hashtag_groups (Hashtags)
CREATE TABLE IF NOT EXISTS public.hashtag_groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  tags text[] NOT NULL DEFAULT '{}'
);

-- Tabela: metrics (Métricas)
CREATE TABLE IF NOT EXISTS public.metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  post_title text NOT NULL,
  platform text NOT NULL,
  post_date date NOT NULL,
  reach integer DEFAULT 0,
  likes integer DEFAULT 0,
  saves integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  followers_gained integer DEFAULT 0,
  followers_total integer DEFAULT 0,
  profile_visits integer DEFAULT 0,
  link_clicks integer DEFAULT 0,
  notes text,
  metric_type text DEFAULT 'post'
);

-- Tabela: goals (Metas)
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_amount integer NOT NULL,
  current_amount integer DEFAULT 0,
  unit text NOT NULL,
  platform text,
  notes text
);

-- Tabela: references (Referências Visuais)
CREATE TABLE IF NOT EXISTS public.references (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  platform text NOT NULL,
  notes text,
  tags text[] NOT NULL DEFAULT '{}'
);

-- Tabela: team_members (Membros da Equipe - gerenciado pelo admin)
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  member_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  member_name text NOT NULL,
  member_email text NOT NULL,
  role text DEFAULT 'member'
);

-- ================================================================
-- ADICIONAR COLUNA user_id SE AS TABELAS JÁ EXISTIREM
-- (Execute apenas se as tabelas já foram criadas anteriormente)
-- ================================================================
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.copies ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.hashtag_groups ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.metrics ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.references ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- ================================================================
-- MIGRAÇÃO: Atribuir dados existentes ao admin (conta Trilhar)
-- SUBSTITUA <SEU_USER_ID> pelo ID da sua conta no Supabase Auth
-- Você encontra em: Authentication > Users > copie o UUID
-- ================================================================
-- UPDATE public.posts SET user_id = '<SEU_USER_ID>' WHERE user_id IS NULL;
-- UPDATE public.copies SET user_id = '<SEU_USER_ID>' WHERE user_id IS NULL;
-- UPDATE public.hashtag_groups SET user_id = '<SEU_USER_ID>' WHERE user_id IS NULL;
-- UPDATE public.metrics SET user_id = '<SEU_USER_ID>' WHERE user_id IS NULL;
-- UPDATE public.goals SET user_id = '<SEU_USER_ID>' WHERE user_id IS NULL;
-- UPDATE public.references SET user_id = '<SEU_USER_ID>' WHERE user_id IS NULL;

-- ================================================================
-- RLS (Row Level Security) - Isola dados por usuário
-- ================================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtag_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Políticas: Cada usuário vê/modifica apenas seus próprios dados
CREATE POLICY IF NOT EXISTS "posts: own data" ON public.posts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "copies: own data" ON public.copies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "hashtags: own data" ON public.hashtag_groups FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "metrics: own data" ON public.metrics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "goals: own data" ON public.goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "references: own data" ON public.references FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin pode gerenciar time e ver dados dos membros
CREATE POLICY IF NOT EXISTS "team_members: admin access" ON public.team_members FOR ALL USING (auth.uid() = admin_user_id);
CREATE POLICY IF NOT EXISTS "team_members: member view" ON public.team_members FOR SELECT USING (auth.uid() = member_user_id);
