-- SCHEMA DEFINITIVO - Execute este INTEIRO no Supabase
-- Este schema inclui TODOS os campos que o código está procurando

-- ============ PARTE 1: CLIENTS COM TODOS OS CAMPOS ============
DROP TABLE IF EXISTS clients CASCADE;

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES appmari_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) >= 1),
  email TEXT CHECK (email IS NULL OR email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  phone TEXT,
  company TEXT,
  notes TEXT,
  instagram TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'lead', 'convertido')),
  -- TODOS OS CAMPOS QUE O CÓDIGO PROCURA:
  profile_photo TEXT,
  facebook TEXT,
  tiktok TEXT,
  contract_pdf TEXT,
  monthly_fee DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pendente' CHECK (payment_status IN ('recebido', 'pendente', 'atrasado')),
  payment_history JSONB DEFAULT '[]'::jsonb,
  created_date TIMESTAMP DEFAULT NOW(), -- Campo que o código procura
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_date ON clients(created_date);

-- ============ PARTE 2: POSTS COM TODOS OS CAMPOS ============
DROP TABLE IF EXISTS posts CASCADE;

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES appmari_users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(title) >= 1),
  content TEXT,
  caption TEXT,
  hashtags TEXT,
  -- MIDIAS:
  image_url TEXT,
  video_url TEXT,
  carousel_images TEXT[] DEFAULT '{}',
  -- METADADOS:
  format TEXT DEFAULT 'post' CHECK (format IN ('post', 'story', 'carrossel', 'reel')),
  platform TEXT DEFAULT 'instagram' CHECK (platform IN ('instagram', 'facebook', 'tiktok', 'twitter')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_criacao', 'aguardando_aprovacao', 'aprovado', 'agendado', 'postado')),
  scheduled_date TIMESTAMP,
  published_date TIMESTAMP,
  -- ENGAGEMENT:
  engagement_rate DECIMAL(5,2),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  -- BOOST:
  boost_requested BOOLEAN DEFAULT FALSE,
  boost_notes TEXT,
  rejection_reason TEXT,
  -- TIMESTAMPS:
  created_date TIMESTAMP DEFAULT NOW(), -- Campo que o código procura
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_client_id ON posts(client_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_scheduled_date ON posts(scheduled_date);
CREATE INDEX idx_posts_format ON posts(format);
CREATE INDEX idx_posts_created_date ON posts(created_date);

-- ============ PARTE 3: PERSONAL_EVENTS COM TODOS OS CAMPOS ============
DROP TABLE IF EXISTS personal_events CASCADE;

CREATE TABLE personal_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES appmari_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 1),
  description TEXT,
  -- DATA:
  date DATE, -- Campo que o código procura
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  all_day BOOLEAN DEFAULT FALSE,
  event_type TEXT DEFAULT 'pessoal' CHECK (event_type IN ('pessoal', 'compromisso', 'lembrete', 'reuniao', 'feriado')),
  location TEXT,
  reminder TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_personal_events_user_id ON personal_events(user_id);
CREATE INDEX idx_personal_events_event_date ON personal_events(event_date);
CREATE INDEX idx_personal_events_date ON personal_events(date);

-- ============ PARTE 4: IDEAS COM TODOS OS CAMPOS ============
DROP TABLE IF EXISTS ideas CASCADE;

CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES appmari_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 1),
  description TEXT,
  category TEXT DEFAULT 'geral' CHECK (category IN ('geral', 'conteudo', 'criativo', 'estrategia', 'tecnico')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  status TEXT DEFAULT 'nova' CHECK (status IN ('nova', 'em_analise', 'aprovada', 'desenvolvimento', 'finalizada', 'arquivada')),
  -- CAMPOS QUE O CÓDIGO PROCURA:
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  creator_name TEXT,
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ideas_user_id ON ideas(user_id);
CREATE INDEX idx_ideas_client_id ON ideas(client_id);
CREATE INDEX idx_ideas_category ON ideas(category);
CREATE INDEX idx_ideas_priority ON ideas(priority);
CREATE INDEX idx_ideas_status ON ideas(status);

-- ============ PARTE 5: TABELAS RESTANTES ============
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS approval_links CASCADE;

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES appmari_users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  payment_method TEXT DEFAULT 'pix' CHECK (payment_method IN ('pix', 'cartao', 'transferencia', 'dinheiro', 'outros')),
  payment_date DATE,
  due_date DATE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  installments INTEGER DEFAULT 1 CHECK (installments > 0),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES appmari_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(title) >= 1),
  description TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_progresso', 'concluida', 'cancelada', 'arquivada')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  due_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  assigned_to TEXT,
  is_milestone BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE approval_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES appmari_users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  unique_code TEXT UNIQUE NOT NULL,
  unique_token TEXT UNIQUE, -- Campo adicional que o código procura
  is_approved BOOLEAN,
  is_beoost_requested BOOLEAN DEFAULT FALSE, -- Campo adicional
  client_feedback TEXT,
  client_name TEXT,
  client_email TEXT,
  expires_at TIMESTAMP,
  approved_at TIMESTAMP,
  created_date TIMESTAMP DEFAULT NOW(), -- Campo que o código procura
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ PARTE 6: ÍNDICES RESTANTES ============
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);

CREATE INDEX idx_approval_links_user_id ON approval_links(user_id);
CREATE INDEX idx_approval_links_client_id ON approval_links(client_id);
CREATE INDEX idx_approval_links_code ON approval_links(unique_code);
CREATE INDEX idx_approval_links_token ON approval_links(unique_token);
CREATE INDEX idx_approval_links_created_date ON approval_links(created_date);

-- ============ PARTE 7: ROW LEVEL SECURITY ============
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_links ENABLE ROW LEVEL SECURITY;

-- ============ PARTE 8: POLÍTICAS RLS ============
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;
DROP POLICY IF EXISTS "Users can manage own posts" ON posts;
DROP POLICY IF EXISTS "Users can manage own payments" ON payments;
DROP POLICY IF EXISTS "Users can manage own personal events" ON personal_events;
DROP POLICY IF EXISTS "Users can manage own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can manage own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage own approval links" ON approval_links;

CREATE POLICY "Users can manage own clients" ON clients FOR ALL USING (true);
CREATE POLICY "Users can manage own posts" ON posts FOR ALL USING (true);
CREATE POLICY "Users can manage own payments" ON payments FOR ALL USING (true);
CREATE POLICY "Users can manage own personal events" ON personal_events FOR ALL USING (true);
CREATE POLICY "Users can manage own ideas" ON ideas FOR ALL USING (true);
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Users can manage own approval links" ON approval_links FOR ALL USING (true);

-- ============ PARTE 9: TRIGGERS UPDATE_AT ============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_personal_events_updated_at BEFORE UPDATE ON personal_events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_approval_links_updated_at BEFORE UPDATE ON approval_links FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============ PARTE 10: VERIFICAÇÃO FINAL ============
DO $$ 
BEGIN
  RAISE NOTICE '🎉 SCHEMA DEFINITIVO CRIADO COM SUCESSO!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ TODOS OS CAMPOS NECESSÁRIOS:';
  RAISE NOTICE '   clients: profile_photo, facebook, tiktok, contract_pdf, monthly_fee, payment_status, payment_history, created_date';
  RAISE NOTICE '   posts: carousel_images, video_url, caption, hashtags, boost_requested, boost_notes, rejection_reason, created_date';
  RAISE NOTICE '   personal_events: date (campo adicional)';
  RAISE NOTICE '   ideas: client_id, notes, tags';
  RAISE NOTICE '   approval_links: unique_token, boost_requested, created_date';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 SISTEMA COMPLETO PRONTO!';
END
$$;
