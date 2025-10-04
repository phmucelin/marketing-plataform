-- Schema SIMPLIFICADO para AppMari 2.0
-- Execute este SQL no Supabase SQL Editor

-- 1. Criar tabela de usuários (nova)
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

-- 2. Criar tabela de sessões (nova)  
CREATE TABLE IF NOT EXISTS appmari_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES appmari_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  device_info TEXT,
  ip_address TEXT
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_appmari_users_email ON appmari_users(email);
CREATE INDEX IF NOT EXISTS idx_appmari_sessions_token ON appmari_sessions(token);
CREATE INDEX IF NOT EXISTS idx_appmari_sessions_user_id ON appmari_sessions(user_id);

-- 4. Ativar RLS nas novas tabelas
ALTER TABLE appmari_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE appmari_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Políticas básicas (sem auth.uid() por enquanto - usar lógica própria)
CREATE POLICY "Public read access for appmari_users" ON appmari_users FOR SELECT USING (true);
CREATE POLICY "Users can manage sessions" ON appmari_sessions FOR ALL USING (true);

-- 6. Verificar o resultado
SELECT 
  'Configuração concluída!' as status,
  'Use o sistema normalmente' as message;
