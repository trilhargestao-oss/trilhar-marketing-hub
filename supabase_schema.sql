-- Execute este script no SQL Editor do seu projeto Supabase

-- Tabela: posts (Calendário e Conteúdo)
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
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
  name text NOT NULL,
  description text,
  tags text[] NOT NULL DEFAULT '{}'
);

-- Tabela: metrics (Métricas)
CREATE TABLE IF NOT EXISTS public.metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  post_title text NOT NULL,
  platform text NOT NULL,
  post_date date NOT NULL,
  reach integer DEFAULT 0,
  likes integer DEFAULT 0,
  saves integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  notes text
);

-- Tabela: goals (Metas)
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
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
  title text NOT NULL,
  url text NOT NULL,
  platform text NOT NULL,
  notes text,
  tags text[] NOT NULL DEFAULT '{}'
);

-- Desativar RLS para acesso direto no MVP (apenas para teste inicial/MVP)
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.copies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtag_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.references DISABLE ROW LEVEL SECURITY;
