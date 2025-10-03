// Mock entities for development with localStorage persistence
class MockEntity {
  constructor(name) {
    this.name = name;
    this.storageKey = `appmari_${name}`;
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.data = stored ? JSON.parse(stored) : [];
      
      // Se não há dados e é a primeira vez, carregar dados de exemplo
      if (this.data.length === 0 && !localStorage.getItem(`${this.storageKey}_initialized`)) {
        this.loadSampleData();
        localStorage.setItem(`${this.storageKey}_initialized`, 'true');
      }
    } catch (error) {
      console.error(`Error loading ${this.name} from storage:`, error);
      this.data = [];
    }
  }

  loadSampleData() {
    // Dados de exemplo serão implementados em cada entidade específica
    this.data = [];
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error(`Error saving ${this.name} to storage:`, error);
    }
  }

  async list(order = "") {
    this.loadFromStorage();
    return [...this.data];
  }

  async filter(filters, order = "") {
    this.loadFromStorage();
    return this.data.filter(item => {
      return Object.keys(filters).every(key => 
        item[key] === filters[key] || !filters[key]
      );
    });
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
    return newItem;
  }

  async update(id, data) {
    this.loadFromStorage();
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...data };
      this.saveToStorage();
      return this.data[index];
    }
    return null;
  }

  async delete(id) {
    this.loadFromStorage();
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = this.data.splice(index, 1)[0];
      this.saveToStorage();
      return deleted;
    }
    return null;
  }
}

// Create mock instances with sample data
export const Client = new MockEntity('Client');
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

export const Post = new MockEntity('Post');
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

export const Payment = new MockEntity('Payment');
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

export const PersonalEvent = new MockEntity('PersonalEvent');
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

export const Idea = new MockEntity('Idea');
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

export const Task = new MockEntity('Task');
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

export const ApprovalLink = new MockEntity('ApprovalLink');
ApprovalLink.loadSampleData = function() {
  this.data = [];
};

export const User = {
  async me() {
    return { 
      email: 'mariana@socialmedia.com', 
      name: 'Mariana Dias',
      role: 'Social Media Manager'
    };
  }
}; 