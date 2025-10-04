# 🗄️ Configuração do Supabase para AppMari 2.0

## 📋 Pré-requisitos
- Conta no Supabase ([https://supabase.com](https://supabase.com))
- Projeto criado no Supabase

## 🔧 Setup do Banco de Dados

### 1. Execute o Schema SQL
Abra o **SQL Editor** no seu projeto Supabase e execute o código do arquivo `database/schema.sql`:

```sql
-- Execute este arquivo no SQL Editor do Supabase
-- Copia o conteúdo completo do database/schema.sql
```

### 2. Configurar Autenticação (RLS)
Após executar o schema, suas tabelas terão Row Level Security (RLS) ativado automaticamente.

### 3. Verificar Configuração
Execute no SQL Editor:
```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'appmari_%' OR table_name IN ('clients', 'posts', 'payments');

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 🔐 Variáveis de Ambiente

### Local (.env.local)
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
```

### Vercel Deployment
Configure as mesmas variáveis no painel do Vercel:
1. Acesse seu projeto no Vercel
2. Vá em Settings > Environment Variables
3. Adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 🔄 Como Funciona o Sistema Híbrido

### ✅ Suporte Completo
1. **Login/Registro**: Supabase + backup local
2. **Dados de usuários**: Salvos no banco + localStorage
3. **Clientes/Posts/Pagamentos**: Supabase + localStorage backup
4. **Sessões**: Gerenciadas localmente com sync

### 🔀 Fallback Automático
- Se Supabase estiver offline → usa localStorage
- Se usuário está logado localmente → dados são sincronizados quando Supabase voltar
- Dados sempre disponíveis mesmo offline

## 🧪 Como Testar

### 1. Registro de Usuário
```javascript
// No console do navegador:
const { register } = await import('./lib/auth.js');
await register('Nome Teste', 'teste@email.com', 'Senha123');
```

### 2. Login em Múltiplas Máquinas
1. Registre usuário na máquina A
2. Faça login em uma máquina B
3. Verifique se os dados aparecem na máquina B

### 3. Verificar Banco de Dados
No SQL Editor do Supabase:
```sql
-- Ver usuários registrados
SELECT id, name, email, created_at, last_login 
FROM appmari_users ORDER BY created_at DESC;

-- Ver dados específicos de um usuário
SELECT id, name FROM clients WHERE user_id = 'seu-user-id';
```

## 🚨 Troubleshooting

### Erro: "Table doesn't exist"
- Execute novamente o schema.sql
- Verifique se executou todas as partes do código
- Certifique-se de que está executando no projeto correto

### Erro: "Invalid credentials"
- Verifique se as variáveis de ambiente estão corretas
- Confirme se a chave anon do Supabase está válida

### Dados não aparecem em outra máquina
- Verifique se o usuário fez login na primeira máquina
- Confirme se os dados foram salvos no Supabase
- Verifique conexão internet na segunda máquina

### Sistema usando apenas localStorage
- Supabase está offline ou com erro de conexão
- Verifique variáveis de ambiente
- Sistema funciona normalmente com localStorage como backup

## 📈 Status de Funcionamento

### 🟢 Online + Supabase Conectado
- Login/registro no banco de dados
- Dados sincronizados entre máquinas
- Backup automático no localStorage

### 🟡 Online mas Supabase Offline  
- Sistema funciona apenas com localStorage
- Dados ficam locais até Supabase voltar
- Usuário pode usar normalmente

### 🔴 Completamente Offline
- Apenas dados já carregados disponíveis
- Sistema funciona em modo limitado
- Sincronização quando voltar online