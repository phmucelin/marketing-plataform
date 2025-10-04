import { supabase, testConnection } from '@/lib/supabase.js'
import { getCurrentUser, testSupabaseConnection } from '@/lib/auth.js'

// Classe base para entidades com autenticação por usuário
class HybridEntity {
  constructor(name, tableName) {
    this.name = name;
    this.tableName = tableName;
    this.useSupabase = true; // Supabase configurado, ativar!
    this.init();
  }

  // Obter chave de armazenamento baseada no usuário autenticado
  getStorageKey() {
    // Verificar se há sessão válida diretamente
    const session = localStorage.getItem('appmari_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const userId = sessionData.user?.id;
        if (userId) {
          return `appmari_${this.name}_${userId}`;
        }
      } catch (error) {
        console.warn(`${this.name}: Erro ao parsear sessão:`, error.message);
      }
    }
    
    // Fallback para dispositivo (modo não autenticado)
    const deviceId = this.getOrCreateDeviceId();
    return `appmari_${this.name}_device_${deviceId}`;
  }

  getOrCreateDeviceId() {
    // Gerar ID único por dispositivo para modo não autenticado
    let deviceId = localStorage.getItem('appmari_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('appmari_device_id', deviceId);
      console.log('📱 Novo dispositivo criado:', deviceId);
    }
    return deviceId;
  }

  async init() {
    console.log(`🔧 Inicializando ${this.name} - Sistema HÍBRIDO Supabase + Local`);
    
    // Tentar conectar ao Supabase (agora configurado!)
    try {
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        this.useSupabase = true;
        console.log(`✅ ${this.name}: Conectado ao Supabase + backup local`);
      } else {
        throw new Error('Supabase não disponível');
      }
    } catch (error) {
      console.warn(`⚠️ ${this.name}: Usando apenas localStorage`, error.message);
      this.useSupabase = false;
    }
    
    this.loadFromStorage();
    this.setupAutoRefresh();
  }

  setupAutoRefresh() {
    // Recarregar dados quando a janela recebe foco (usuário volta à aba)
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        console.log(`🔄 Recarregando dados de ${this.name} devido ao foco da janela`);
        this.refreshData();
      });
      
      // Listener para mudanças de estado de visibilidade da página
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          console.log(`🔄 ${this.name}: Página visível novamente - recarregando dados`);
          this.refreshData();
        }
      });
    }
  }

  refreshData() {
    // Sempre recarregar do localStorage para garantir dados atualizados
    this.loadFromStorage();
  }

  // Métodos para localStorage com chave dinâmica do usuário
  loadFromStorage() {
    try {
      const storageKey = this.getStorageKey();
      const stored = localStorage.getItem(storageKey);
      this.data = stored ? JSON.parse(stored) : [];
      
      // Carregar dados de exemplo apenas para novos usuários/dispositivos
      if (this.data.length === 0 && !localStorage.getItem(`${storageKey}_initialized`)) {
        this.loadSampleData();
        localStorage.setItem(`${storageKey}_initialized`, 'true');
      }
      
      console.log(`📂 ${this.name}: Carregados ${this.data.length} itens do armazenamento`);
    } catch (error) {
      console.error(`Error loading ${this.name} from storage:`, error);
      this.data = [];
    }
  }

  saveToStorage() {
    try {
      const storageKey = this.getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(this.data));
      console.log(`💾 ${this.name}: Dados salvos com sucesso`);
    } catch (error) {
      console.error(`Error saving ${this.name} to storage:`, error);
    }
  }

  // Métodos principais - sempre usando localStorage para isolamento
  async list(order = "") {
    // Usar apenas localStorage (simples e funcional)
    this.loadFromStorage();
    
    // Aplicar ordenação se especificada
    let sortedData = [...this.data];
    if (order.startsWith('-')) {
      const field = order.substring(1);
      sortedData.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    } else if (order) {
      const field = order;
      sortedData.sort((a, b) => new Date(a[field]) - new Date(b[field]));
    }
    
    return sortedData;
  }

  async filter(filters, order = "") {
    this.loadFromStorage();
    
    // Filtrar dados localmente
    let filteredData = this.data.filter(item => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        if (filterValue === null || filterValue === undefined || filterValue === '') {
          return true;
        }
        return item[key] === filterValue;
      });
    });
    
    // Aplicar ordenação se especificada
    if (order.startsWith('-')) {
      const field = order.substring(1);
      filteredData.sort((a, b) => new Date(b[field]) - new Date(a[field]));
    } else if (order) {
      const field = order;
      filteredData.sort((a, b) => new Date(a[field]) - new Date(b[field]));
    }
    
    return filteredData;
  }

  async create(data) {
    this.loadFromStorage();
    
    const newItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      created_date: new Date().toISOString(),
      ...data
    };
    
    this.data.push(newItem);
    this.saveToStorage();
    
    console.log(`✅ ${this.name}: Item criado com sucesso (ID: ${newItem.id})`);
    return newItem;
  }

  async update(id, data) {
    this.loadFromStorage();
    
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...data };
      this.saveToStorage();
      
      console.log(`✅ ${this.name}: Item atualizado com sucesso (ID: ${id})`);
      return this.data[index];
    }
    
    console.warn(`⚠️ ${this.name}: Item não encontrado para atualização (ID: ${id})`);
    return null;
  }

  async delete(id) {
    this.loadFromStorage();
    
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0];
      this.saveToStorage();
      
      console.log(`✅ ${this.name}: Item deletado com sucesso (ID: ${id})`);
      return deleted;
    }
    
    console.warn(`⚠️ ${this.name}: Item não encontrado para exclusão (ID: ${id})`);
    return null;
  }

  // Método para carregar dados de exemplo (fallback)
  loadSampleData() {
    this.data = [];
  }
}

// Criar instâncias das entidades
export const Client = new HybridEntity('Client', 'clients');
export const Post = new HybridEntity('Post', 'posts');
export const Payment = new HybridEntity('Payment', 'payments');
export const PersonalEvent = new HybridEntity('PersonalEvent', 'personal_events');
export const Idea = new HybridEntity('Idea', 'ideas');
export const Task = new HybridEntity('Task', 'tasks');
export const ApprovalLink = new HybridEntity('ApprovalLink', 'approval_links');

// Sistema LOCAL-FIRST: Todas as entidades agora são simples e síncronas
console.log('🏠 Sistema LOCAL-FIRST: Dados isolados por dispositivo');

// Função para limpar dados locais em caso de problemas (DEBUG)
export const clearAllLocalData = () => {
  try {
    const session = localStorage.getItem('appmari_session');
    let userEmail = 'visitante';
    
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        userEmail = sessionData.user?.email || 'desconhecido';
      } catch (error) {
        console.warn('Erro ao parsear sessão:', error.message);
      }
    }

    const entities = ['Client', 'Post', 'Payment', 'PersonalEvent', 'Idea', 'Task', 'ApprovalLink'];
    
    entities.forEach(entity => {
      // Limpar por usuário primeiro (se logado)
      const userId = session ? JSON.parse(session).user?.id : null;
      if (userId) {
        localStorage.removeItem(`appmari_${entity}_${userId}`);
      }
      
      // Limpar por dispositivo também
      const deviceId = localStorage.getItem('appmari_device_id');
      if (deviceId) {
        localStorage.removeItem(`appmari_${entity}_device_${deviceId}`);
      }
      
      console.log(`🗑️ Dados locais limpos: ${entity}`);
    });
    
    console.log(`🧹 Todos os dados de ${userEmail} foram limpos!`);
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
  }
};

// Função para exportar dados locais (BACKUP)
export const exportLocalData = () => {
  try {
    const session = localStorage.getItem('appmari_session');
    if (!session) {
      alert('você precisa estar logado para exportar dados!');
      return;
    }

    const sessionData = JSON.parse(session);
    const user = sessionData.user;
    if (!user) {
      alert('Sessão de usuário inválida!');
      return;
    }

    const entities = ['Client', 'Post', 'Payment', 'PersonalEvent', 'Idea', 'Task', 'ApprovalLink'];
    const backup = {
      user: user,
      export_date: new Date().toISOString(),
      entities: {}
    };
    
    entities.forEach(entity => {
      const storageKey = `appmari_${entity}_${user.id}`;
      const data = localStorage.getItem(storageKey);
      if (data) {
        backup.entities[entity] = JSON.parse(data);
      }
    });
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appmari_backup_${user.email.split('@')[0]}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log(`📦 Backup dos dados de ${user.email} exportado!`);
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    alert('Erro ao exportar dados. Verifique o console para mais detalhes.');
  }
};

// Dados de exemplo para localStorage (fallback)
Client.loadSampleData = function() {
  this.data = [
    {
      id: 'client_1',
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      phone: '(11) 99999-9999',
      company: 'Loja da Maria',
      industry: 'Moda',
      monthly_value: 2500,
      contract_start: '2024-01-15',
      contract_end: '2024-12-31',
      status: 'ativo',
      notes: 'Cliente muito satisfeita com os resultados',
      profile_image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      created_date: '2024-01-15T10:00:00Z'
    },
    {
      id: 'client_2',
      name: 'João Santos',
      email: 'joao@exemplo.com',
      phone: '(11) 88888-8888',
      company: 'Restaurante do João',
      industry: 'Gastronomia',
      monthly_value: 1800,
      contract_start: '2024-02-01',
      contract_end: '2024-11-30',
      status: 'ativo',
      notes: 'Foco em Instagram e Facebook',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      created_date: '2024-02-01T14:30:00Z'
    },
    {
      id: 'client_3',
      name: 'Ana Costa',
      email: 'ana@exemplo.com',
      phone: '(11) 77777-7777',
      company: 'Clínica Estética Ana',
      industry: 'Saúde e Beleza',
      monthly_value: 3200,
      contract_start: '2024-03-10',
      contract_end: '2025-03-09',
      status: 'ativo',
      notes: 'Especializada em tratamentos faciais',
      profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      created_date: '2024-03-10T09:15:00Z'
    }
  ];
};

Post.loadSampleData = function() {
  this.data = [
    {
      id: 'post_1',
      title: 'Novo produto chegou!',
      content: 'Confira nossa nova coleção de verão 🌞✨',
      client_id: 'client_1',
      format: 'post',
      status: 'aprovado',
      scheduled_date: '2024-10-02T19:00:00',
      image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop',
      created_date: '2024-10-01T10:00:00Z'
    },
    {
      id: 'post_2',
      title: 'Cardápio do dia',
      content: 'Hoje temos uma surpresa especial no cardápio! 🍽️',
      client_id: 'client_2',
      format: 'story',
      status: 'aguardando_aprovacao',
      scheduled_date: '2024-10-03T12:00:00',
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
      created_date: '2024-10-02T08:30:00Z'
    },
    {
      id: 'post_3',
      title: 'Tratamento facial',
      content: 'Renove sua pele com nossos tratamentos exclusivos 💆‍♀️',
      client_id: 'client_3',
      format: 'post',
      status: 'pendente',
      scheduled_date: '2024-10-04T15:30:00',
      image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop',
      created_date: '2024-10-02T16:45:00Z'
    }
  ];
};

Payment.loadSampleData = function() {
  this.data = [
    {
      id: 'payment_1',
      client_id: 'client_1',
      month: 'setembro',
      year: 2024,
      amount: 2500,
      status: 'recebido',
      payment_date: '2024-09-05',
      notes: 'Pagamento realizado via PIX',
      created_date: '2024-09-01T10:00:00Z'
    },
    {
      id: 'payment_2',
      client_id: 'client_2',
      month: 'setembro',
      year: 2024,
      amount: 1800,
      status: 'pendente',
      notes: 'Aguardando transferência',
      created_date: '2024-09-01T10:00:00Z'
    }
  ];
};

PersonalEvent.loadSampleData = function() {
  this.data = [
    {
      id: 'event_1',
      title: 'Consulta médica',
      date: '2024-10-03',
      time: '14:00',
      type: 'saude',
      notes: 'Consulta com cardiologista',
      created_date: '2024-10-01T10:00:00Z'
    }
  ];
};

Idea.loadSampleData = function() {
  this.data = [
    {
      id: 'idea_1',
      title: 'Post sobre sustentabilidade',
      description: 'Criar conteúdo sobre moda sustentável',
      client_id: 'client_1',
      tags: ['sustentabilidade', 'moda'],
      status: 'nova',
      created_date: '2024-10-01T10:00:00Z'
    }
  ];
};

Task.loadSampleData = function() {
  this.data = [
    {
      id: 'task_1',
      title: 'Revisar posts da semana',
      completed: false,
      priority: 'alta',
      created_date: '2024-10-01T10:00:00Z'
    },
    {
      id: 'task_2',
      title: 'Enviar relatório mensal',
      completed: false,
      priority: 'media',
      created_date: '2024-10-01T10:00:00Z'
    }
  ];
};

ApprovalLink.loadSampleData = function() {
  this.data = [];
};

export const User = {
  async me() {
    // Verificar sessão diretamente sem dependência circular
    const session = localStorage.getItem('appmari_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const user = sessionData.user;
        if (user) {
          return {
            ...user,
            role: 'Social Media Manager',
            device: 'Usuário Autenticado (AppMari 2.0)',
            dataScope: 'Dados isolados por usuário autenticado'
          };
        }
      } catch (error) {
        console.warn('Erro ao parsear sessão:', error.message);
      }
    }
    
    // Modo não autenticado
    const deviceId = localStorage.getItem('appmari_device_id') || 'unknown';
    return {
      id: deviceId,
      email: 'visitante@appmari.com',
      name: 'Visitante',
      role: 'Visitante',
      device: 'Modo Não Autenticado (AppMari 2.0)',
      dataScope: 'Dados isolados por dispositivo'
    };
  }
};
