// Sistema de Autenticação CORRIGIDO - APENAS SUPABASE (PRODUÇÃO)
export { 
  register, 
  login, 
  logout, 
  getCurrentUser, 
  isAuthenticated, 
  testSupabaseConnection,
  clearUserData,
  syncWithSupabase 
} from './auth-fix.js';

// Helper para obter chave de dados por entidade - compatibilidade
export const getUserDataKey = (entityName) => {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('Nenhum usuário logado para obter a chave de dados.');
    }
    return `appmari_${entityName}_${user.userId}`;
  } catch (error) {
    console.warn('getUserDataKey error:', error.message);
    return null;
  }
};

// Função de refresh de sessão - compatibilidade
export const refreshSession = () => {
  const user = getCurrentUser();
  return !!(user && user.source === 'supabase' && user.token);
};