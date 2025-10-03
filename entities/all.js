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
    } catch (error) {
      console.error(`Error loading ${this.name} from storage:`, error);
      this.data = [];
    }
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

// Create mock instances
export const Payment = new MockEntity('Payment');
export const Post = new MockEntity('Post');
export const Client = new MockEntity('Client');
export const PersonalEvent = new MockEntity('PersonalEvent');
export const Idea = new MockEntity('Idea');
export const Task = new MockEntity('Task');
export const ApprovalLink = new MockEntity('ApprovalLink');
export const User = {
  async me() {
    return { email: 'user@example.com', name: 'Usuário Teste' };
  }
}; 