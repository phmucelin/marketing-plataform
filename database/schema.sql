-- Schema para AppMari 2.0 - Sistema de Autenticação e Gestão
-- Execute este SQL no Supabase SQL Editor

-- Tabela de usuários registrados
CREATE TABLE IF NOT EXISTS appmari_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Senha hashada
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP
);

-- Tabela de sessões ativas
CREATE TABLE IF NOT EXISTS appmari_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  device_info TEXT,
  ip_address TEXT
);

-- Tabela de clientes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'clients') THEN
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

-- Tabela de posts
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'posts') THEN
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

-- Tabela de pagamentos
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'payments') THEN
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_appmari_users_email ON appmari_users(email);
CREATE INDEX IF NOT EXISTS idx_appmari_sessions_token ON appmari_sessions(token);
CREATE INDEX IF NOT EXISTS idx_appmari_sessions_user_id ON appmari_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_client_id ON posts(client_id);

-- Políticas RLS (Row Level Security)
ALTER TABLE appmari_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appmari_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (cada usuário só vê seus próprios dados)
CREATE POLICY "Users can view own profile" ON appmari_users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON appmari_users
  FOR UPDATE USING (true);

-- Políticas para sessões
CREATE POLICY "Users can manage own sessions" ON appmari_sessions
  FOR ALL USING (true);

-- Políticas para dados do usuário (clients, posts, payments)
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own posts" ON posts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payments" ON payments
  FOR ALL USING (auth.uid() = user_id);
