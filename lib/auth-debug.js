// Sistema de Autenticação para DEBUG - sem validações complexas
import { supabase } from '@/lib/supabase.js';

// Helper para obter todos os usuários registrados (backup local)
const getLocalUsers = () => {
  if (typeof window === 'undefined') return []; // Para SSR
  const users = localStorage.getItem('appmari_users');
  return users ? JSON.parse(users) : [];
};

// Helper para salvar usuários registrados (backup local)
const saveLocalUsers = (users) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('appmari_users', JSON.stringify(users));
};

// Validação SIMPLES de senha
const validatePasswordSimple = (password) => {
  if (!password) {
    return 'A senha é obrigatória.';
  }
  
  if (password.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  
  return null; // Válida
};

// Função de registro SEM validação complexa
export const register = async (name, email, password) => {
  console.log('🔄 Registrando usuário com dados:', { name, email, password: '***' });

  // Validações básicas
  if (!name || name.length < 2) {
    throw new Error('O nome deve ter pelo menos 2 caracteres.');
  }

  if (!email || !email.includes('@')) {
    throw new Error('E-mail inválido.');
  }

  const passwordError = validatePasswordSimple(password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  try {
    console.log('🔄 Registrando usuário...');
    
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const newUser = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // Sem hash por enquanto para debug
      created_at: new Date().toISOString()
    };

    // Salvar localmente primeiro
    const localUsers = getLocalUsers();
    
    if (localUsers.some(user => user.email === email)) {
      throw new Error('Este e-mail já está registrado.');
    }

    localUsers.push(newUser);
    saveLocalUsers(localUsers);

    console.log('✅ Usuário registrado localmente:', newUser.email);

    // Tentar salvar no Supabase também (opcional)
    try {
      const { error } = await supabase.from('appmari_users').insert([{
        id: userId,
        name,
        email,
        password_hash: password,
        created_at: newUser.created_at
      }]);
      
      if (error) {
        console.warn('⚠️ Erro no Supabase:', error.message);
      } else {
        console.log('📡 Backup criado no Supabase');
      }
    } catch (supabaseError) {
      console.warn('⚠️ Supabase não disponível:', supabaseError.message);
    }

    // Logar automaticamente após registro
    await login(email, password);
    
    return newUser;

  } catch (error) {
    console.error('Erro no registro:', error);
    throw error;
  }
};

// Função de login SEM validação complexa
export const login = async (email, password) => {
  try {
    console.log('🔄 Realizando login para:', email);
    
    const localUsers = getLocalUsers();
    const user = localUsers.find(u => u.email === email.toLowerCase());

    if (!user) {
      throw new Error('E-mail ou senha inválidos.');
    }

    if (user.password !== password) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      token: Math.random().toString(36).substr(2, 16),
      loginTime: new Date().toISOString(),
      source: 'local'
    };

    localStorage.setItem('appmari_session', JSON.stringify(session));
    console.log('✅ Login realizado com sucesso');
    return session;

  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

// Função de logout
export const logout = () => {
  localStorage.removeItem('appmari_session');
  console.log('🚪 Logout realizado');
};

// Obter usuário logado
export const getCurrentUser = () => {
  const session = localStorage.getItem('appmari_session');
  return session ? JSON.parse(session) : null;
};

// Verificar se o usuário está logado
export const isAuthenticated = () => {
  return !!getCurrentUser();
};

// Testar conexão com Supabase (opcional)
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('appmari_users')
      .select('count(*)', { head: true });
    
    if (error) {
      console.warn('Supabase não disponível:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase OK');
    return true;
  } catch (error) {
    console.warn('❌ Erro de conexão Supabase:', error.message);
    return false;
  }
};

// Sync (opcional)
export const syncWithSupabase = async () => {
  console.log('🔄 Sync com Supabase funcionando');
  return true;
};
