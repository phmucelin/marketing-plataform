// Utility functions
export function createPageUrl(page, params = {}) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, value);
    }
  });
  
  // Converter camelCase para kebab-case (ex: PostCalendar -> post-calendar)
  const kebabCase = page
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  
  const queryString = searchParams.toString();
  return `/${kebabCase}${queryString ? `?${queryString}` : ""}`;
}

/**
 * Verifica se uma data é válida
 * @param {string|Date} dateValue - Valor da data para validar
 * @returns {boolean} - True se a data é válida
 */
export function isValidDate(dateValue) {
  if (!dateValue) return false;
  try {
    const date = new Date(dateValue);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Converte uma data para objeto Date de forma segura, PRESERVANDO O HORÁRIO
 * @param {string|Date} dateValue - Valor da data
 * @returns {Date|null} - Objeto Date ou null se inválido
 */
export function safeDate(dateValue) {
  if (!dateValue) return null;
  try {
    // Se for uma string no formato datetime-local (YYYY-MM-DDTHH:mm)
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateValue)) {
      const [datePart, timePart] = dateValue.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      // Criar data local com horário específico
      return new Date(year, month - 1, day, hours, minutes);
    }
    
    // Se for apenas data (YYYY-MM-DD), criar às 00:00 local
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Para outros formatos, tentar criar normalmente
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return null;
    
    return date;
  } catch {
    return null;
  }
}
