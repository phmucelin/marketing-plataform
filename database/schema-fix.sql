-- Schema CORRIGIDO para AppMari 2.0 - Sistema de Autenticação e Gestão
-- Execute este SQL no Supabase SQL Editor

-- Primeiro, vamos verificar e corrigir as tabelas existentes

-- Tabela de usuários registrados (nova)
CREATE TABLE IF NOT EXISTS appmari_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP
);

-- Se a tabela clients já existe, adicionar coluna user_id se não existir
DO $$ 
BEGIN
  -- Adicionar coluna user_id na tabela clients se não existir
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'cliency' AND column_name = 'user_id') THEN
      ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE;
    END IF;
  ELSE
    -- Criar tabela clients do zero
    CREATE TABLE clients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      profile_photo TEXT,
      instagram TEXT,
      facebook TEXT,
      tiktok TEXT,
      contract_pdf TEXT DEFAULT '',
      monthly_fee INTEGER DEFAULT 0,
      payment_status TEXT DEFAULT 'pendente',
      notes TEXT,
      created_date TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  END IF;
END
$$;

-- Se a tabela posts já existe, adicionar coluna user_id se não existir
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'user_id') THEN
      ALTER TABLE posts ADD COLUMN user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE;
    END IF;
  ELSE
    -- Criar tabela posts do zero
    CREATE TABLE posts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE,
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      title TEXT DEFAULT '',
      content TEXT DEFAULT '',
      format TEXT DEFAULT 'post',
      platform TEXT DEFAULT '',
      status TEXT DEFAULT 'pendente',
      approval_link TEXT DEFAULT '',
      draft_count INTEGER DEFAULT 0,
      scheduled_date TIMESTAMP,
      boost_requested BOOLEAN DEFAULT FALSE,
      notes TEXT,
      created_date TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  END IF;
END
$$;

-- Se a tabela payments já existe, adicionar coluna user_id se não existir
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'payments' AND column_name = 'user_id') THEN
      ALTER TABLE payments ADD COLUMN user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE;
    END IF;
  ELSE
    -- Criar tabela payments do zero
    CREATE TABLE payments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE,
      client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
      payment_method TEXT DEFAULT 'money',
      amount TEXT DEFAULT '',
      billing TEXT DEFAULT '',
      invoice TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_date TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  END IF;
END
$$;

-- Criar outras tabelas necessárias se não existirem
CREATE TABLE IF NOT EXISTS appmari_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  device_info TEXT,
  ip_address TEXT
);

-- Verificar se tabelas personal_events, ideas, tasks, approval_links existem e adicionar user_id
DO $$ 
BEGIN
  -- personal_events
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'personal_events') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'personal_events' AND column_name = 'user_id') THEN
      ALTER TABLE personal_events ADD COLUMN user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- ideas
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ideas') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'ideas' AND column_name = 'user_id') THEN
      ALTER TABLE ideas ADD COLUMN user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- tasks
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'user_id') THEN
      ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- approval_links
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'approval_links') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'approval_links' AND column_name = 'user_id') THEN
      ALTER TABLE approval_links ADD COLUMN user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END
$$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_appmari_users_email ON appmari_users(email);
CREATE INDEX IF NOT EXISTS idx_appmari_sessions_token ON appmari_sessions(token);
CREATE INDEX IF NOT EXISTS idx_appmari_sessions_user_id ON appmari_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_client_id ON posts(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Políticas RLS (Row Level Security)
ALTER TABLE appmari_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appmari_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Criar políticas se não existirem
DO $$ 
BEGIN
  -- Políticas para usuários
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'appmari_users') THEN
    CREATE POLICY "Users can view own profile" ON appmari_users FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'appmari_users') THEN
    CREATE POLICY "Users can update own profile" ON appmari_users FOR UPDATE USING (true);
  END IF;

  -- Políticas para sessões
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can manage own sessions' AND tablename = 'appmari_sessions') THEN
    CREATE POLICY "Users can manage own sessions" ON appmari_sessions FOR ALL USING (true);
  END IF;

  -- Políticas para clients (com auth.uid() - sistema Supabase auth)
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can manage own clients' AND tablename = 'clinicos') THEN
    CREATE POLICY "Users can manage own clients" ON clients FOR ALL USING (auth.uid()::text = user_id::text);
  END IF;

  -- Políticas para posts
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can manage own posts' AND tablename = 'posts') THEN
    CREATE POLICY "Users can manage own posts" ON posts FOR ALL USING (auth.uid()::text = user_id::text);
  END IF;

  -- Políticas para payments
  IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can manage own payments' AND tablename = 'payments') THEN
    CREATE POLICY "Users can manage own payments" ON payments FOR ALL USING (auth.uid()::text = user_id::text);
  END IF;
END
$$;

-- Mensagem de sucesso
DO $$ 
BEGIN
  RAISE NOTICE 'Schema AppMari 2.0 configurado com sucesso!';
  RAISE NOTICE 'Tabelas existentes foram atualizadas com user_id';
  RAISE NOTICE 'Novas tabelas de usuários e sessões foram criadas';
  RAISE NOTICE 'Políticas RLS foram aplicadas para segurança';
END
$$;
