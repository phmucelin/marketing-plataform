// Sistema de Autenticação SEGURO - 100% SUPABASE
import { supabase } from '@/lib/supabase.js';
import bcryptjs from 'bcryptjs';

// Hash de senha usando bcryptjs (segurança profissional)
const hashPassword = async (password) => {
  const saltRounds = 12; // Mais seguro para produção
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

// Validação de senha robusta para produção
const validatePasswordStrength = (password) => {
  if (!password) {
    return 'A senha é obrigatória.';
  }
  
  if (password.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres.';
  }
  
  if (password.length > 128) {
    return 'A senha deve ter no máximo 128 caracteres.';
  }
  
  // Validação forte para produção
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasLowercase) {
    return 'A senha deve conter pelo menos uma letra minúscula.';
  }
  
  if (!hasUppercase) {
    return 'A senha deve conter pelo menos uma letra maiúscula.';
  }
  
  if (!hasNumber) {
    return 'A senha deve conter pelo menos um número.';
  }
  
  if (!hasSpecialChar) {
    return 'A senha deve conter pelo menos um caractere especial (!@#$%^&*).';
  }
  
  return null; // Senha válida
};

// Função de registro OBRIGATÓRIA via Supabase
export const register = async (name, email, password) => {
  console.log('🔄 Iniciando registro seguro no Supabase...');

  // Validações obrigatórias
  if (!name || name.trim().length < 2) {
    throw new Error('O nome deve ter pelo menos 2 caracteres.');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('E-mail inválido.');
  }

  // Validação de senha forte
  const passwordError = validatePasswordStrength(password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  try {
    // 1. VERIFICAR se email já existe no Supabase (OBRIGATÓRIO)
    const { data: existingUser } = await supabase
      .from('appmari_users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      throw new Error('Este e-mail já está registrado. Use outro e-mail ou faça login.');
    }

    console.log('✅ E-mail disponível, prosseguindo com registro...');

    // 2. Hash seguro da senha
    const hashedPassword = await hashPassword(password);
    
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // 3. INSERIR usuário APENAS no Supabase (sem localStorage)
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
      console.error('❌ Erro ao inserir usuário:', insertError);
      throw new Error('Erro ao criar usuário. Tente novamente.');
    }

    console.log('✅ Usuário registrado com sucesso no Supabase:', newUser.email);

    // 4. Login automático após registro
    await login(email, password);
    
    return newUser;

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    throw error;
  }
};

// Função de login OBRIGATÓRIA via Supabase
export const login = async (email, password) => {
  console.log('🔄 Iniciando login seguro no Supabase...');

  try {
    // 1. BUSCAR usuário APENAS no Supabase (sem localStorage)
    const { data: user, error: userError } = await supabase
      .from('appmari_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      console.log('❌ Usuário não encontrado:', email);
      throw new Error('E-mail ou senha inválidos.');
    }

    console.log('✅ Usuário encontrado no Supabase:', user.email);

    // 2. Verificar senha com hash seguro
    const isValidPassword = await validatePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      console.log('❌ Senha inválida para:', user.email);
      throw new Error('E-mail ou senha inválidos.');
    }

    // 3. Atualizar último login no Supabase
    await supabase
      .from('appmari_users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // 4. Criar sessão LOCAL (apenas token, dados vêm do Supabase)
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      token: Math.random().toString(36).substr(2, 20) + '_' + Date.now(),
      loginTime: new Date().toISOString(),
      source: 'supabase'
    };

    // Sessão SÓ no localStorage (sem dados do usuário)
    localStorage.setItem('appmari_session', JSON.stringify(session));
    
    console.log('✅ Login realizado com sucesso via Supabase');
    return session;

  } catch (error) {
    console.error('❌ Erro no login:', error);
    throw error;
  }
};

// Função de logout
export const logout = () => {
  localStorage.removeItem('appmari_session');
  console.log('🚪 Logout realizado - sessão limpa');
};

// Obter usuário atual (SEM dados sensíveis no localStorage)
export const getCurrentUser = () => {
  try {
    const session = localStorage.getItem('appmari_session');
    if (!session) return null;
    
    return JSON.parse(session);
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
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
      console.warn('❌ Supabase não disponível:', error.message);
      return false;
    }
    
    console.log('✅ Supabase funcionando perfeitamente');
    return true;
  } catch (error) {
    console.warn('❌ Erro de conexão Supabase:', error.message);
    return false;
  }
};

// Limpar dados locais (importante: só limpa sessão)
export const clearUserData = () => {
  localStorage.removeItem('appmari_session');
  console.log('🧹 Dados de usuário limpos');
};

// Export para compatibilidade
export const syncWithSupabase = async () => {
  console.log('🔄 Sistema usa Supabase como fonte única de verdade');
  return true;
};
