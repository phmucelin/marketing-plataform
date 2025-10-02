# 🧪 Como Testar o Sistema de Aprovação

## 📝 Passo a Passo Completo

### **1️⃣ Criar um Cliente**
1. Vá em **Clientes** na sidebar
2. Clique em **"Novo Cliente"**
3. Preencha:
   - Nome: "Maria Silva"
   - Instagram: "mariasilva"
   - Mensalidade: 1500
4. Clique em **"Salvar"**

### **2️⃣ Criar Posts para Aprovação**
1. Vá em **Calendário de Posts**
2. Clique em **"✨ Novo Post"**
3. Preencha:
   - Cliente: Selecione "Maria Silva"
   - Título: "Post da bailarina"
   - Formato: Post Estático
   - Legenda: "A jornada de uma bailarina começa assim"
   - Hashtags: #bailarina #danca #arte
   - Status: **"Aguardando Aprovação"** ⚠️
   - Data: Escolha uma data futura
4. **Upload de imagem** (opcional)
5. Clique em **"Salvar"**
6. **Repita** para criar mais 2-3 posts

### **3️⃣ Gerar Link de Aprovação**
1. Vá em **Clientes**
2. Clique no cliente **"Maria Silva"**
3. Vá na aba **"Links de Aprovação"**
4. Clique em **"Gerar Novo Link"**
5. Você verá algo como:
   ```
   http://localhost:5173/approval?token=abc123xyz
   Expira em: 01/11/2025
   ```
6. Clique no botão **📋 Copiar**

### **4️⃣ Simular o Cliente (Aba Anônima)**
1. **Abra uma aba anônima** (Ctrl+Shift+N ou Cmd+Shift+N)
2. Cole o link copiado
3. Pressione Enter

### **5️⃣ Cliente Aprova/Rejeita Posts**

#### **Você verá:**
- ✨ Tela sem sidebar (apenas para cliente)
- 👋 "Olá, Maria Silva"
- 📱 Cards com todos os posts pendentes
- Cada post mostra:
  - 🖼️ Imagem
  - 📝 Legenda completa
  - #️⃣ Hashtags
  - 📅 Data prevista
  - ✅ Botão "Aprovar"
  - ❌ Botão "Rejeitar"

#### **Para Aprovar:**
1. Clique no botão **verde ✅**
2. Post muda para status "aprovado"
3. Você (Social Media) recebe email ✉️

#### **Para Rejeitar:**
1. Clique no botão **vermelho ❌**
2. Digite o motivo da rejeição
3. Clique em "Rejeitar"
4. Post muda para status "rejeitado"
5. Você recebe email com o motivo

#### **Para Solicitar Boost:**
1. Clique no botão **⚡ Turbinar**
2. Digite observações sobre o boost
3. Clique em "Solicitar"
4. Flag `boost_requested` ativada

### **6️⃣ Verificar Resultados (Você - Social Media)**
1. Volte para a **janela normal** (não anônima)
2. Vá para o **Dashboard**
3. Veja:
   - ✅ Posts Aprovados: +1
   - ❌ Posts Rejeitados aparecem com motivo
   - ⚡ Solicitações de boost destacadas

4. Ou vá para o **Kanban**
   - Posts aprovados → Coluna "✅ Aprovado"
   - Posts rejeitados → Coluna "❌ Rejeitado"

5. Ou vá no **Perfil do Cliente** → Aba "Histórico"
   - Veja todos os posts e seus status

---

## 🔄 Fluxo Completo Visual

```
VOCÊ (Social Media)                    CLIENTE
━━━━━━━━━━━━━━━━                     ━━━━━━━━━
1. Criar Post                          
   Status: "aguardando_aprovacao"      
                                       
2. Gerar Link                          
   → Copia link                        
                                       
3. Envia link                          
   (WhatsApp/Email) ────────────────→ 4. Recebe link
                                       
                                       5. Abre link
                                          Vê posts pendentes
                                       
                                       6. Decide:
                                          ✅ Aprova
                                          ❌ Rejeita com motivo
                                          ⚡ Pede boost
                                       
7. Recebe email ←──────────────────   
   com a decisão                       
                                       
8. Vê atualização no                   
   Dashboard/Kanban                    
                                       
9. Agenda posts aprovados              
```

---

## 🎯 Cenários de Teste

### ✅ Cenário 1: Cliente Aprova Tudo
- Crie 3 posts
- Cliente aprova todos
- Resultado: 3 posts na coluna "Aprovado"

### ❌ Cenário 2: Cliente Rejeita
- Crie 1 post
- Cliente rejeita com motivo: "Não gostei da foto"
- Resultado: Post na coluna "Rejeitado" com motivo visível

### ⚡ Cenário 3: Cliente Quer Boost
- Crie 1 post
- Cliente aprova + pede boost
- Resultado: Post aprovado com flag de boost

### 🔗 Cenário 4: Link Expirado
- Crie link que já expirou
- Tente acessar
- Resultado: Mensagem "Link expirou"

### 📝 Cenário 5: Sem Posts Pendentes
- Cliente já aprovou tudo
- Acessa link novamente
- Resultado: "Nenhum post pendente"

---

## 🐛 Solução de Problemas

### "Link inválido ou expirado"
**Causa:** O link não existe no sistema (dados mock)

**Solução:**
1. Volte para a aba normal
2. Vá no Perfil do Cliente
3. Gere um **NOVO** link
4. Use o link recém-gerado

### "Nenhum post para aprovar"
**Causa:** Não há posts com status "aguardando_aprovacao"

**Solução:**
1. Crie novos posts
2. **IMPORTANTE:** Defina status como "Aguardando Aprovação"

### Posts não aparecem
**Causa:** Posts não estão vinculados ao cliente correto

**Solução:**
1. Ao criar post, selecione o cliente certo
2. Confira no Kanban se está na coluna "Aguardando Aprovação"

---

## 💡 Dicas

- 🔄 Use **Ctrl+Shift+N** para aba anônima rápida
- 📋 Sempre copie o link completo (com ?token=...)
- ⏰ Links expiram em 30 dias
- 📧 Emails são simulados (aparecem no console)
- 💾 Dados são **temporários** (mock) - perdidos ao recarregar

---

## 🚀 Próximos Passos

Para usar em produção REAL:
1. Configurar **Supabase** (ver `BACKEND_SETUP.md`)
2. Configurar **SendGrid** para emails reais
3. Configurar **Cloudinary** para upload de imagens
4. Deploy no **Vercel**

**Custo: R$ 0,00** até ter muitos usuários! 🎉 