-- TESTE RÁPIDO - Execute este SQL para verificar se as tabelas existem

-- 1. Verificar se tabela de usuários existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appmari_users') THEN
    RAISE NOTICE '✅ Tabela appmari_users existe';
    
    -- Mostrar colunas da tabela
    RAISE NOTICE 'Colunas da tabela appmari_users:';
    FOR rec IN (
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appmari_users' 
      ORDER BY ordinal_position
    ) LOOP
      RAISE NOTICE '  - %', rec.column_name;
    END LOOP;
  ELSE
    RAISE NOTICE '❌ Tabela appmari_users NÃO existe';
  END IF;
END
$$;

-- 2. Verificar se tabela de clientes existe
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
    RAISE NOTICE '✅ Tabela clients existe';
    
    -- Mostrar colunas da tabela
    RAISE NOTICE 'Colunas da tabela clients:';
    FOR rec IN (
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
      ORDER BY ordinal_position
    ) LOOP
      RAISE NOTICE '  - %', rec.column_name;
    END LOOP;
  ELSE
    RAISE NOTICE '❌ Tabela clients NÃO existe';
  END IF;
END
$$;

-- 3. Listar todas as tabelas
SELECT 
  schemaname,
  tablename
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
