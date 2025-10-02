# ⚡ Teste Rápido - Sistema de Aprovação

## 🎯 IMPORTANTE: Agora os dados persistem!

Os dados agora são salvos no **localStorage** do navegador.
- ✅ **Persistem** mesmo ao recarregar a página
- ✅ **Compartilhados** entre abas do mesmo navegador
- ⚠️ **Separados** por navegador (Chrome vs Firefox)
- 🗑️ **Limpar tudo**: Botão "🗑️ Limpar Dados" no Dashboard

---

## 📝 Teste em 5 Minutos

### 1️⃣ Criar Cliente (30s)
```
Dashboard → Clientes → Novo Cliente
Nome: "Maria Silva"
Instagram: "mariasilva"
→ Salvar
```

### 2️⃣ Criar Posts (2min)
```
Calendário de Posts → ✨ Novo Post
Cliente: Maria Silva
Título: "Post da Bailarina"
Formato: Post Estático
Legenda: "A jornada começa aqui..."
Status: "Aguardando Aprovação" ⚠️ IMPORTANTE!
→ Salvar

Repita para criar 2-3 posts
```

### 3️⃣ Gerar Link (30s)
```
Clientes → Maria Silva → Aba "Links de Aprovação"
→ Gerar Novo Link
→ Copiar o link (ex: http://localhost:5173/approval?token=abc123)
```

### 4️⃣ Testar como Cliente (1min)
```
1. CTRL+SHIFT+N (aba anônima)
2. Cole o link copiado
3. Pressione Enter
4. Você verá os posts!
5. Clique ✅ Aprovar ou ❌ Rejeitar
```

### 5️⃣ Ver Resultado (30s)
```
Volte para aba normal
Dashboard → Veja "Posts Aprovados" aumentar
ou
Kanban → Veja posts na coluna "✅ Aprovado"
```

---

## 🐛 Problemas?

### "Link inválido ou expirado"
**Solução:**
1. Certifique-se que está usando o link COMPLETO (com `?token=...`)
2. Gere um novo link e tente novamente
3. Verifique se está na mesma sessão (não recarregou antes de gerar)

### "Nenhum post para aprovar"
**Solução:**
1. Ao criar posts, selecione status **"Aguardando Aprovação"**
2. Verifique se o cliente está correto
3. Vá no Kanban e veja se os posts estão na coluna certa

### Tela em branco
**Solução:**
1. Abra o Console (F12)
2. Veja se há erros em vermelho
3. Copie e envie os erros

---

## 🎮 Comandos Úteis

### Limpar TODOS os dados
```javascript
// No console do navegador (F12)
localStorage.clear()
location.reload()
```

### Ver dados salvos
```javascript
// No console (F12)
console.log('Clients:', JSON.parse(localStorage.getItem('appmari_Client') || '[]'))
console.log('Posts:', JSON.parse(localStorage.getItem('appmari_Post') || '[]'))
console.log('Links:', JSON.parse(localStorage.getItem('appmari_ApprovalLink') || '[]'))
```

### Criar dados de teste via console
```javascript
// Cliente teste
localStorage.setItem('appmari_Client', JSON.stringify([
  {
    id: '1',
    name: 'Maria Silva',
    instagram: 'mariasilva',
    monthly_fee: 1500,
    created_date: new Date().toISOString()
  }
]))

// Post teste
localStorage.setItem('appmari_Post', JSON.stringify([
  {
    id: '1',
    client_id: '1',
    title: 'Post Teste',
    format: 'post',
    caption: 'Legenda de teste',
    status: 'aguardando_aprovacao',
    created_date: new Date().toISOString()
  }
]))

// Link teste
localStorage.setItem('appmari_ApprovalLink', JSON.stringify([
  {
    id: '1',
    client_id: '1',
    unique_token: 'teste123',
    expires_at: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
    is_active: true,
    created_date: new Date().toISOString()
  }
]))

location.reload()

// Use: http://localhost:5173/approval?token=teste123
```

---

## ✅ Checklist de Teste

- [ ] Cliente criado com sucesso
- [ ] 3 posts criados com status "Aguardando Aprovação"
- [ ] Link gerado aparece na lista
- [ ] Link copiado corretamente
- [ ] Aba anônima abre a tela de aprovação
- [ ] Nome do cliente aparece ("Olá, Maria Silva")
- [ ] Posts aparecem com imagens e legendas
- [ ] Botão ✅ Aprovar funciona
- [ ] Botão ❌ Rejeitar pede motivo
- [ ] Dashboard atualiza após aprovação
- [ ] Kanban mostra posts nas colunas corretas

---

## 🚀 Tudo Funcionando?

Se sim, parabéns! 🎉

**Próximo passo:**
Configure banco de dados REAL (Supabase) para:
- ✅ Dados persistentes entre navegadores
- ✅ Múltiplos usuários
- ✅ Backup automático
- ✅ Acesso de qualquer dispositivo

Ver: `BACKEND_SETUP.md` 