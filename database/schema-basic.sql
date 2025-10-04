-- SCHEMA BÁSICO PARA CRIAÇÃO DA TABELA - Execute PRIMEIRO
-- Execute este SQL no Supabase SQL Editor ANTES do schema-secure.sql

-- 1. Criar tabela básica de usuários
CREATE TABLE IF NOT EXISTS appmari_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- 2. Índice para email único
CREATE INDEX IF NOT EXISTS idx_appmari_users_email ON appmari_users(email);

-- 3. Verificar se a tabela foi criada
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appmari_users') THEN
    RAISE NOTICE '✅ Tabela appmari_users criada com sucesso!';
  ELSE
    RAISE NOTICE '❌ Erro na criação da tabela appmari_users';
  END IF;
END
$$;

-- 4. Mostrar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'appmari_users'
ORDER BY ordinal_position;
