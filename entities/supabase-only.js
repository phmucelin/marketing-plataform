// Sistema SUPABASE PURELY - SEM localStorage para dados do usuário
import { supabase } from '@/lib/supabase.js';
import { getCurrentUser } from '@/lib/auth.js';

class SupabaseEntity {
  constructor(name, tableName) {
    this.name = name;
    this.tableName = tableName;
  }

  // Obter usuário logado
  getCurrentUserOrFail() {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('Usuário não está logado');
    }
    return user;
  }

  // CREATE - Salvar APENAS no Supabase
  async create(data) {
    try {
      const currentUser = this.getCurrentUserOrFail();
      
      const newData = {
        user_id: currentUser.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data
      };

      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([newData])
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao criar ${this.name}:`, error);
        throw new Error(`Erro ao criar ${this.name}: ${error.message}`);
      }

      console.log(`✅ ${this.name} criado no Supabase:`, result);
      return result;

    } catch (error) {
      console.error(`❌ Erro create ${this.name}:`, error);
      throw error;
    }
  }

  // READ - Ler APENAS do Supabase
  async list(order = "", limit = null) {
    try {
      const currentUser = this.getCurrentUserOrFail();

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', currentUser.userId);

      // Aplicar ordenação
      if (order) {
        if (order.startsWith('-')) {
          const field = order.substring(1);
          query = query.order(field, { ascending: false });
        } else {
          query = query.order(field, { ascending: true });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Aplicar limite se especificado
      if (limit && limit > 0) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`❌ Erro ao listar ${this.name}:`, error);
        throw new Error(`Erro ao listar ${this.name}: ${error.message}`);
      }

      console.log(`📋 ${this.name} listados do Supabase: ${data?.length || 0} itens`);
      return data || [];

    } catch (error) {
      console.error(`❌ Erro list ${this.name}:`, error);
      throw error;
    }
  }

  // READ BY ID - Ler APENAS do Supabase
  async getById(id) {
    try {
      const currentUser = this.getCurrentUserOrFail();

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('user_id', currentUser.userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Não encontrado
        }
        console.error(`❌ Erro ao buscar ${this.name}:`, error);
        throw new Error(`Erro ao buscar ${this.name}: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error(`❌ Erro getById ${this.name}:`, error);
      throw error;
    }
  }

  // UPDATE - Atualizar APENAS no Supabase
  async update(id, data) {
    try {
      const currentUser = this.getCurrentUserOrFail();

      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .eq('user_id', currentUser.userId)
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao atualizar ${this.name}:`, error);
        throw new Error(`Erro ao atualizar ${this.name}: ${error.message}`);
      }

      if (!result) {
        throw new Error(`${this.name} não encontrado`);
      }

      console.log(`✅ ${this.name} atualizado no Supabase:`, result);
      return result;

    } catch (error) {
      console.error(`❌ Erro update ${this.name}:`, error);
      throw error;
    }
  }

  // DELETE - Deletar APENAS do Supabase
  async delete(id) {
    try {
      const currentUser = this.getCurrentUserOrFail();

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.userId);

      if (error) {
        console.error(`❌ Erro ao deletar ${this.name}:`, error);
        throw new Error(`Erro ao deletar ${this.name}: ${error.message}`);
      }

      console.log(`✅ ${this.name} deletado do Supabase`);
      return true;

    } catch (error) {
      console.error(`❌ Erro delete ${this.name}:`, error);
      throw error;
    }
  }

  // FILTER - Filtrar APENAS do Supabase
  async filter(filters, order = "") {
    try {
      const currentUser = this.getCurrentUserOrFail();

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', currentUser.userId);

      // Aplicar filtros
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          query = query.eq(key, filters[key]);
        }
      });

      // Aplicar ordenação
      if (order) {
        if (order.startsWith('-')) {
          const field = order.substring(1);
          query = query.order(field, { ascending: false });
        } else {
          query = query.order(order, { ascending: true });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error(`❌ Erro ao filtrar ${this.name}:`, error);
        throw new Error(`Erro ao filtrar ${this.name}: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error(`❌ Erro filter ${this.name}:`, error);
      throw error;
    }
  }

  // SEARCH - Buscar APENAS no Supabase
  async search(searchTerm, fields = ['name'], order = "") {
    try {
      const currentUser = this.getCurrentUserOrFail();

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', currentUser.userId);

      // Buscar em múltiplos campos usando OR
      if (searchTerm && fields.length > 0) {
        const searchConditions = fields.map(field => `${field}.ilike.%${searchTerm}%`);
        if (searchConditions.length === 1) {
          query = query.ilike(fields[0], `%${searchTerm}%`);
        } else {
          // Para múltiplos campos, usar o primeiro e adicionar OR
          query = query.ilike(fields[0], `%${searchTerm}%`);
          // TODO: Implementar OR corretamente se necessário
        }
      }

      // Aplicar ordenação
      if (order) {
        if (order.startsWith('-')) {
          const field = order.substring(1);
          query = query.order(field, { ascending: false });
        } else {
          query = query.order(order, { ascending: true });
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error(`❌ Erro na busca ${this.name}:`, error);
        throw new Error(`Erro na busca ${this.name}: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error(`❌ Erro search ${this.name}:`, error);
      throw error;
    }
  }
}

// Criar instâncias das entidades SUPABASE PURAS
export const Client = new SupabaseEntity('Client', 'clients');
export const Post = new SupabaseEntity('Post', 'posts');
export const Payment = new SupabaseEntity('Payment', 'payments');
export const PersonalEvent = new SupabaseEntity('PersonalEvent', 'personal_events');
export const Idea = new SupabaseEntity('Idea', 'ideas');
export const Task = new SupabaseEntity('Task', 'tasks');
export const ApprovalLink = new SupabaseEntity('ApprovalLink', 'approval_links');

console.log('🚀 Sistema SUPABASE PURAMENTE: Todos os dados são compartilhados globalmente');
