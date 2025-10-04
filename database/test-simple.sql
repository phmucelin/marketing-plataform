-- TESTE SIMPLES - Execute este SQL

-- 1. Verificar se tabela de usuários existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appmari_users') 
    THEN '✅ Tabela appmari_users EXISTE' 
    ELSE '❌ Tabela appmari_users NÃO existe' 
  END as status_appmari_users;

-- 2. Verificar se tabela de clientes existe  
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') 
    THEN '✅ Tabela clients EXISTE' 
    ELSE '❌ Tabela clients NÃO existe' 
  END as status_clients;

-- 3. Mostrar todas as tabelas existentes
SELECT 'TODAS AS TABELAS:' as info;
SELECT 
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Mostrar colunas da tabela appmari_users (se existir)
SELECT 'COLUNAS da appmari_users:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'appmari_users' 
ORDER BY ordinal_position;
