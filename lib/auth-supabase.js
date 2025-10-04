// Sistema de Autenticação LOCAL-FIRST com Supabase
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

// Helper para gerar um ID de usuário único
const generateUserId = () => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

// Função de registro com Supabase + backup local
export const register = async (name, email, password) => {
  // Validação de senha (mínimo 6 caracteres, maiúscula, minúscula, nº)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error('A senha deve ter no mínimo 6 caracteres, incluindo uma letra maiúscula, uma minúscula e um número.');
  }

  try {
    // Tentar registrar no Supabase primeiro
    console.log('🔄 Registrando usuário no Supabase...');
    
    const hashedPassword = await hashPassword(password);
    
    // Criar usuário na tabela auth.users do Supabase (principal)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new Error('Este e-mail já está registrado.');
      }
      throw new Error(`Erro no Supabase: ${authError.message}`);
    }

    // Se signUp bem-sucedido mas usuário precisar confirmar email, criar na tabela custom
    const { data: supabaseUser, error: supabaseError } = await supabase
      .from('appmari_users')
      .insert([{
        name,
        email,
        password_hash: hashedPassword
      }])
      .select()
      .single();

    if (supabaseError) {
      if (supabaseError.code === '23505') { // Email já existe
        throw new Error('Este e-mail já está registrado.');
      }
      throw new Error(`Erro no Supabase: ${supabaseError.message}`);
    }

    console.log('✅ Usuário registrado no Supabase:', supabaseUser.email);

    // Backup local também
    const localUsers = getLocalUsers();
    const existingUser = localUsers.find(u => u.email === email);
    
    if (!existingUser) {
      localUsers.push({
        id: supabaseUser.id,
        name: supabaseUser.name,
        email: supabaseUser.email,
        password: hashedPassword, // Salvar hash também localmente
        created_at: supabaseUser.created_at
      });
      saveLocalUsers(localUsers);
      console.log('💾 Backup local criado');
    }

    // Logar automaticamente após registro
    await login(email, password);
    
    return supabaseUser;

  } catch (error) {
    console.warn('❌ Erro no Supabase, usando backup local:', error.message);
    
    // Fallback para localStorage
    const localUsers = getLocalUsers();
    
    if (localUsers.some(user => user.email === email)) {
      throw new Error('Este e-mail já está registrado.');
    }

    const newUser = {
      id: generateUserId(),
      name,
      email,
      password: await hashPassword(password),
      created_at: new Date().toISOString(),
    };

    localUsers.push(newUser);
    saveLocalUsers(localUsers);
    
    console.log('🔄 Registro realizado localmente');
    
    // Logar automaticamente após registro local
    await login(email, password);
    
    return newUser;
  }
};

// Função de login com Supabase + backup local
export const login = async (email, password) => {
  try {
    // Primeiro, tentar login no Supabase
    console.log('🔄 Tentando login no Supabase...');
    
    const { data: user, error } = await supabase
      .from('appmari_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (!error && user) {
      const isValidPassword = await verifyPassword(password, user.password_hash);
      
      if (isValidPassword) {
        // Atualizar última sessão no Supabase
        await supabase
          .from('appmari_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);

        console.log('✅ Login realizado via Supabase');

        // Criar sessão local
        const session = {
          userId: user.id,
          email: user.email,
          name: user.name,
          token: Math.random().toString(36).substr(2, 16),
          loginTime: new Date().toISOString(),
          source: 'supabase' // Indicar origem da sessão
        };

        localStorage.setItem('appmari_session', JSON.stringify(session));
        return session;
      }
    }

    console.warn('⚠️ Login no Supabase falhou, tentando local...');

  } catch (error) {
    console.warn('❌ Erro no Supabase, tentando login local:', error.message);
  }

  // Fallback para localStorage
  const localUsers = getLocalUsers();
  const user = localUsers.find(u => u.email === email);

  if (!user) {
    throw new Error('E-mail ou senha inválidos.');
  }

  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('E-mail ou senha inválidos.');
  }

  console.log('🔄 Login realizado via backup local');

  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    token: Math.random().toString(36).substr(2, 16),
    loginTime: new Date().toISOString(),
    source: 'local' // Indicar origem da sessão
  };

  localStorage.setItem('appmari_session', JSON.stringify(session));
  return session;
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

// Testar conexão com Supabase
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('appmari_users')
      .select('count(*)', { head: true });
    
    if (error) {
      console.warn('❌ Erro ao conectar com Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase OK');
    return true;
  } catch (error) {
    console.warn('❌ Erro de conexão Supabase:', error.message);
    return false;
  }
};

// Sincronizar dados locais com Supabase (opcional)
export const syncWithSupabase = async () => {
  const localUsers = getLocalUsers();
  const user = getCurrentUser();
  
  if (!user || user.source === 'supabase') {
    console.log('⏭️ Não é necessário sincronizar');
    return;
  }

  try {
    console.log('🔄 Sincronizando dados locais com Supabase...');
    
    // Tentar migrar dados do usuário para Supabase
    const localUserData = localUsers.find(u => u.id === user.userId);
    if (localUserData) {
      const { error } = await supabase
        .from('appmari_users')
        .insert([{
          id: localUserData.id,
          name: localUserData.name,
          email: localUserData.email,
          password_hash: localUserData.password,
          created_at: localUserData.created_at
        }]);
      
      if (!error) {
        console.log('✅ Usuário local migrado para Supabase');
        // Atualizar sessão para indicar origem Supabase
        user.source = 'supabase';
        localStorage.setItem('appmari_session', JSON.stringify(user));
      }
    }
    
  } catch (error) {
    console.warn('⚠️ Erro na sincronização:', error.message);
  }
};
