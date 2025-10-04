// Sistema de Autenticação FUNCIONAL - Seguro mas não tão restritivo
import { supabase } from '@/lib/supabase.js';
import bcryptjs from 'bcryptjs';

// Hash de senha usando bcryptjs
const hashPassword = async (password) => {
  const saltRounds = 10; // Padrão seguro
  try {
    return await bcryptjs.hash(password, saltRounds);
  } catch (error) {
    console.error('Erro ao fazer hash da senha:', error);
    throw new Error('Erro ao processar senha');
  }
};

// Verificar senha usando bcryptjs
const validatePassword = async (password, hash) => {
  try {
    return await bcryptjs.compare(password, hash);
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
};

// Validação de senha SIMPLES (funcional)
const validatePasswordStrength = (password) => {
  if (!password) {
    return 'A senha é obrigatória.';
  }
  
  if (password.length < 6) {
    return 'A senha deve ter no mínimo 6 caracteres.';
  }
  
  if (password.length > 100) {
    return 'A senha deve ter no máximo 100 caracteres.';
  }
  
  return null; // Senha válida
};

// Função de registro FUNCIONAL
export const register = async (name, email, password) => {
  console.log('🔄 Registrando usuário...');

  // Validações básicas
  if (!name || name.trim().length < 2) {
    throw new Error('O nome deve ter pelo menos 2 caracteres.');
  }

  if (!email || !email.includes('@')) {
    throw new Error('E-mail inválido.');
  }

  // Validação de senha simples
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  try {
    // 1. VERIFICAR se email já existe no Supabase
    const { data: existingUser } = await supabase
      .from('appmari_users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle(); // Usa maybeSingle para não dar erro se não encontrar

    if (existingUser) {
      throw new Error('Este e-mail já está registrado. Use outro e-mail ou faça login.');
    }

    console.log('✅ E-mail disponível');

    // 2. Hash da senha
    const hashedPassword = await hashPassword(password);
    
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 3. INSERIR usuário no Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('appmari_users')
      .insert([{
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: hashedPassword,
        created_at: new Date().toISOString(),
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar usuário:', insertError);
      if (insertError.code === '23505') {
        throw new Error('Este e-mail já está registrado.');
      }
      throw new Error('Erro ao criar usuário: ' + insertError.message);
    }

    console.log('✅ Usuário registrado:', newUser.email);

    // 4. Login automático
    await login(email, password);
    
    return newUser;

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    throw error;
  }
};

// Função de login FUNCIONAL
export const login = async (email, password) => {
  console.log('🔄 Fazendo login...');

  try {
    // 1. BUSCAR usuário no Supabase
    const { data: user, error: userError } = await supabase
      .from('appmari_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (userError || !user) {
      console.log('❌ Usuário não encontrado');
      throw new Error('E-mail ou senha inválidos.');
    }

    console.log('✅ Usuário encontrado:', user.email);

    // 2. Verificar senha
    const isValidPassword = await validatePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('❌ Senha inválida');
      throw new Error('E-mail ou senha inválidos.');
    }

    // 3. Atualizar login
    await supabase
      .from('appmari_users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // 4. Criar sessão
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      token: Math.random().toString(36).substr(2, 20) + '_' + Date.now(),
      loginTime: new Date().toISOString(),
      source: 'supabase'
    };

    localStorage.setItem('appmari_session', JSON.stringify(session));
    
    console.log('✅ Login realizado');
    return session;

  } catch (error) {
    console.error('❌ Erro no login:', error);
    throw error;
  }
};

// Função de logout
export const logout = () => {
  localStorage.removeItem('appmari_session');
  console.log('🚪 Logout');
};

// Obter usuário atual
export const getCurrentUser = () => {
  try {
    const session = localStorage.getItem('appmari_session');
    return session ? JSON.parse(session) : null;
  } catch (error) {
    return null;
  }
};

// Verificar se está autenticado
export const isAuthenticated = () => {
  const session = getCurrentUser();
  return !!(session && session.source === 'supabase' && session.token);
};

// Testar conexão com Supabase
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('appmari_users')
      .select('count(*)', { head: true });
    
    if (error) {
      console.warn('❌ Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Supabase OK');
    return true;
  } catch (error) {
    console.warn('❌ Supabase erro:', error.message);
    return false;
  }
};

// Exports
export const clearUserData = () => {
  localStorage.removeItem('appmari_session');
};

export const syncWithSupabase = async () => {
  return true;
};
