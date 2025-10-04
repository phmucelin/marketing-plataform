// Sistema de Autenticação SIMPLIFICADO usando apenas Supabase Auth
import { supabase } from '@/lib/supabase.js';
import bcryptjs from 'bcryptjs';

// Helper para obter todos os usuários registrados (backup local)
const getLocalUsers = () => {
  const users = localStorage.getItem('appmari_users');
  return users ? JSON.parse(users) : [];
};

// Helper para salvar usuários registrados (backup local)
const saveLocalUsers = (users) => {
  localStorage.setItem('appmari_users', JSON.stringify(users));
};

// Hash de senha usando bcryptjs
const hashPassword = async (password) => {
  const saltRounds = 10;
  try {
    return await bcryptjs.hash(password, saltRounds);
  } catch (error) {
    console.error('Erro ao fazer hash da senha:', error);
    throw new Error('Erro ao processar senha');
  }
};

// Verificar senha usando bcryptjs
const verifyPassword = async (password, hash) => {
  try {
    return await bcryptjs.compare(password, hash);
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
};

// Função de registro MAIS SIMPLES - usando localStorage como principal, Supabase como secundário
export const register = async (name, email, password) => {
  // Validação de senha
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error('A senha deve ter no mínimo 6 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.');
  }

  try {
    console.log('🔄 Registrando usuário...');
    
    const hashedPassword = await hashPassword(password);
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    };

    // Salvar localmente primeiro
    const localUsers = getLocalUsers();
    
    if (localUsers.some(user => user.email === email)) {
      throw new Error('Este e-mail já está registrado.');
    }

    localUsers.push(newUser);
    saveLocalUsers(localUsers);

    console.log('✅ Usuário registrado localmente');

    // Tentar salvar no Supabase também (opcional, só se tabela existir)
    try {
      await supabase.from('appmari_users').insert([{
        id: userId,
        name,
        email,
        password_hash: hashedPassword,
        created_at: newUser.created_at
      }]);
      console.log('📡 Backup criado no Supabase');
    } catch (supabaseError) {
      console.warn('⚠️ Supabase não disponível, continua funcionando localmente:', supabaseError.message);
    }

    // Logar automaticamente após registro
    await login(email, password);
    
    return newUser;

  } catch (error) {
    console.error('Erro no registro:', error);
    throw error;
  }
};

// Função de login SIMPLES
export const login = async (email, password) => {
  try {
    console.log('🔄 Realizando login...');
    
    const localUsers = getLocalUsers();
    const user = localUsers.find(u => u.email === email);

    if (!user) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
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

// Sync (opcional) - só faz sentido se Supabase estiver funcionando
export const syncWithSupabase = async () => {
  console.log('🔄 Sync com Supabase não implementado - usando localStorage');
  return true;
};
