import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://errvdwucilvywmzhubcd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycnZkd3VjaWx2eXdtemh1YmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDkwNTEsImV4cCI6MjA3NTAyNTA1MX0.J8MlcN6MPZgwPNhH7svM2QaSwiLGmg6cu7MkQPj48tg'

// Para desenvolvimento, vamos usar variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || supabaseUrl
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || supabaseKey

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Função para testar conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('clients').select('count').limit(1)
    if (error) throw error
    console.log('✅ Conexão com Supabase estabelecida!')
    return true
  } catch (error) {
    console.log('❌ Erro na conexão com Supabase:', error.message)
    return false
  }
}
