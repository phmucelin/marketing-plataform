# 🗄️ Configuração do Banco de Dados Supabase

## 📋 Passo a Passo:

### 1. Criar Projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub
4. Clique em "New Project"
5. Escolha uma organização
6. Nome do projeto: `appmari-database`
7. Senha do banco: (escolha uma senha forte)
8. Região: South America (São Paulo)
9. Clique em "Create new project"

### 2. Obter Credenciais
1. No dashboard do projeto, vá em **Settings** > **API**
2. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configurar Variáveis de Ambiente
1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Criar Tabelas no Banco
Execute os SQLs abaixo no **SQL Editor** do Supabase:

```sql
-- Tabela de Clientes
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  industry TEXT,
  monthly_value DECIMAL(10,2),
  contract_start DATE,
  contract_end DATE,
  status TEXT DEFAULT 'ativo',
  notes TEXT,
  profile_image TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Posts
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  format TEXT NOT NULL,
  status TEXT DEFAULT 'pendente',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  carousel_images TEXT[],
  video_url TEXT,
  boost_requested BOOLEAN DEFAULT FALSE,
  boost_notes TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pagamentos
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pendente',
  payment_date DATE,
  invoice_url TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Eventos Pessoais
CREATE TABLE personal_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  type TEXT,
  notes TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Ideias
CREATE TABLE ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  tags TEXT[],
  status TEXT DEFAULT 'nova',
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Tarefas
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'media',
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Links de Aprovação
CREATE TABLE approval_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  approved BOOLEAN,
  rejection_reason TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir dados de exemplo
INSERT INTO clients (id, name, email, phone, company, industry, monthly_value, contract_start, contract_end, status, notes, profile_image) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Maria Silva', 'maria@exemplo.com', '(11) 99999-9999', 'Loja da Maria', 'Moda', 2500.00, '2024-01-15', '2024-12-31', 'ativo', 'Cliente muito satisfeita com os resultados', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'),
('550e8400-e29b-41d4-a716-446655440002', 'João Santos', 'joao@exemplo.com', '(11) 88888-8888', 'Restaurante do João', 'Gastronomia', 1800.00, '2024-02-01', '2024-11-30', 'ativo', 'Foco em Instagram e Facebook', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
('550e8400-e29b-41d4-a716-446655440003', 'Ana Costa', 'ana@exemplo.com', '(11) 77777-7777', 'Clínica Estética Ana', 'Saúde e Beleza', 3200.00, '2024-03-10', '2025-03-09', 'ativo', 'Especializada em tratamentos faciais', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face');

INSERT INTO posts (id, title, content, client_id, format, status, scheduled_date, image_url) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Novo produto chegou!', 'Confira nossa nova coleção de verão 🌞✨', '550e8400-e29b-41d4-a716-446655440001', 'post', 'aprovado', '2024-10-02T19:00:00Z', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'),
('660e8400-e29b-41d4-a716-446655440002', 'Cardápio do dia', 'Hoje temos uma surpresa especial no cardápio! 🍽️', '550e8400-e29b-41d4-a716-446655440002', 'story', 'aguardando_aprovacao', '2024-10-03T12:00:00Z', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop'),
('660e8400-e29b-41d4-a716-446655440003', 'Tratamento facial', 'Renove sua pele com nossos tratamentos exclusivos 💆‍♀️', '550e8400-e29b-41d4-a716-446655440003', 'post', 'pendente', '2024-10-04T15:30:00Z', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop');

INSERT INTO payments (id, client_id, month, year, amount, status, payment_date, notes) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'setembro', 2024, 2500.00, 'recebido', '2024-09-05', 'Pagamento realizado via PIX'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'setembro', 2024, 1800.00, 'pendente', NULL, 'Aguardando transferência');

INSERT INTO personal_events (id, title, date, time, type, notes) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Consulta médica', '2024-10-03', '14:00', 'saude', 'Consulta com cardiologista');

INSERT INTO ideas (id, title, description, client_id, tags, status) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'Post sobre sustentabilidade', 'Criar conteúdo sobre moda sustentável', '550e8400-e29b-41d4-a716-446655440001', ARRAY['sustentabilidade', 'moda'], 'nova');

INSERT INTO tasks (id, title, completed, priority) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', 'Revisar posts da semana', FALSE, 'alta'),
('aa0e8400-e29b-41d4-a716-446655440002', 'Enviar relatório mensal', FALSE, 'media');
