// Sistema de Autenticação LOCAL-FIRST para AppMari
class AuthService {
  constructor() {
    this.currentUser = null;
    this.sessionKey = 'appmari_session';
    this.usersKey = 'appmari_users';
  }

  // Verificar se há usuário logado
  isAuthenticated() {
    const session = this.getSession();
    return session && session.user && session.token;
  }

  // Obter usuário atual
  getCurrentUser() {
    const session = this.getSession();
    return session ? session.user : null;
  }

  // Obter token da sessão
  getToken() {
    const session = this.getSession();
    return session ? session.token : null;
  }

  // Fazer login
  async login(email, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (user.password !== password) {
      throw new Error('Senha incorreta');
    }

    // Criar sessão
    const session = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      },
      token: this.generateToken(),
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    this.currentUser = session.user;

    console.log(`✅ Login realizado com sucesso: ${user.email}`);
    return session.user;
  }

  // Registrar novo usuário
  async register(name, email, password) {
    const users = this.getAllUsers();
    
    // Verificar se email já existe
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Este email já está em uso');
    }

    // Validar dados
    if (!email || !password || email.length < 5) {
      throw new Error('Email deve ter pelo menos 5 caracteres');
    }

    if (!password || password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    if (!name || name.length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }

    // Criar novo usuário
    const newUser = {
      id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // Em produção seria hash
      created_at: new Date().toISOString(),
      role: 'social_media_manager'
    };

    // Salvar usuário
    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));

    // Fazer login automático
    return this.login(email, password);
  }

  // Fazer logout
  logout() {
    localStorage.removeItem(this.sessionKey);
    this.currentUser = null;
    console.log('🚪 Logout realizado');
  }

  // Obter todos os usuários (apenas para demonstração - em produção seria no servidor)
  getAllUsers() {
    try {
      const users = localStorage.getItem(this.usersKey);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      return [];
    }
  }

  // Obter sessão atual
  getSession() {
    try {
      const session = localStorage.getItem(this.sessionKey);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
      return null;
    }
  }

  // Gerar token único
  generateToken() {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 15);
  }

  // Obter chave única para dados do usuário
  getUserDataKey(entity) {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Usuário não está logado');
    }
    return `appmari_${entity}_${user.id}`;
  }

  // Verificar se sessão ainda é válida
  isSessionValid() {
    const session = this.getSession();
    if (!session) return false;

    // Sessão válida por 30 dias
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);

    return daysDiff < 30;
  }

  // Renovar sessão se necessário
  refreshSession() {
    if (this.isAuthenticated() && this.isSessionValid()) {
      const session = this.getSession();
      // Renovar token
      session.token = this.generateToken();
      session.loginTime = new Date().toISOString();
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      return true;
    }
    return false;
  }
}

// Instância global do serviço de autenticação
export const authService = new AuthService();

// Exportar funções de conveniência
export const login = (email, password) => authService.login(email, password);
export const register = (name, email, password) => authService.register(name, email, password);
export const logout = () => authService.logout();
export const getCurrentUser = () => authService.getCurrentUser();
export const isAuthenticated = () => authService.isAuthenticated();
export const getUserDataKey = (entity) => authService.getUserDataKey(entity);
export const refreshSession = () => authService.refreshSession();
