# 🧪 Teste de Navegação

## ✅ Correção Aplicada

A função `createPageUrl` agora converte corretamente:
- `PostCalendar` → `/post-calendar` ✅
- `ClientProfile` → `/client-profile` ✅
- `Dashboard` → `/dashboard` ✅

---

## 🧪 Teste no Console

Abra o console (F12) e execute:

```javascript
// Importar a função (simular)
function createPageUrl(page, params = {}) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, value);
    }
  });
  
  // Converter camelCase para kebab-case
  const kebabCase = page
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  
  const queryString = searchParams.toString();
  return `/${kebabCase}${queryString ? `?${queryString}` : ""}`;
}

// Testar
console.log('PostCalendar:', createPageUrl("PostCalendar")); // /post-calendar
console.log('ClientProfile:', createPageUrl("ClientProfile", {id: 1})); // /client-profile?id=1
console.log('Dashboard:', createPageUrl("Dashboard")); // /dashboard
console.log('Clients:', createPageUrl("Clients")); // /clients
```

---

## 🎯 Resultado Esperado

```
PostCalendar: /post-calendar
ClientProfile: /client-profile?id=1
Dashboard: /dashboard
Clients: /clients
```

---

## ✅ Teste na Aplicação

1. **Dashboard** → Clique em "✨ Novo Post"
   - ✅ Deve ir para `/post-calendar`

2. **Sidebar** → Clique em "Calendário de Posts"
   - ✅ Deve ir para `/post-calendar`

3. **Kanban** → Clique em "✨ Novo Post"
   - ✅ Deve ir para `/post-calendar`

4. **Cliente** → Clique em "Voltar"
   - ✅ Deve ir para `/clients`

---

## 🐛 Se ainda der erro

Verifique no console (F12) qual URL está sendo gerada e me informe! 