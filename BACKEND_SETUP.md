# 🗄️ Configuração de Backend e Banco de Dados

## Opções de Backend

### **Opção 1: Supabase (Recomendado - Mais Fácil)** ⭐

**Vantagens:**
- ✅ Gratuito até 500MB
- ✅ PostgreSQL automático
- ✅ API REST pronta
- ✅ Autenticação incluída
- ✅ Storage para imagens

**Setup:**
```bash
npm install @supabase/supabase-js
```

**Código:**
```javascript
// supabase/client.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://seu-projeto.supabase.co',
  'sua-chave-publica'
)

// entities/Payment.js
import { supabase } from '../supabase/client'

export const Payment = {
  async list(order = "-created_date") {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .order('created_date', { ascending: false })
    return data
  },
  
  async filter(filters, order) {
    let query = supabase.from('payments').select('*')
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) query = query.eq(key, filters[key])
    })
    
    const { data } = await query
    return data
  },
  
  async create(data) {
    const { data: newData } = await supabase
      .from('payments')
      .insert([data])
      .select()
    return newData[0]
  },
  
  async update(id, data) {
    const { data: updated } = await supabase
      .from('payments')
      .update(data)
      .eq('id', id)
      .select()
    return updated[0]
  },
  
  async delete(id) {
    await supabase.from('payments').delete().eq('id', id)
  }
}
```

**Tabelas no Supabase:**
```sql
-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  profile_photo TEXT,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  contract_pdf TEXT,
  monthly_fee DECIMAL,
  payment_status TEXT DEFAULT 'pendente',
  notes TEXT,
  created_date TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  format TEXT NOT NULL,
  caption TEXT,
  hashtags TEXT,
  image_url TEXT,
  video_url TEXT,
  scheduled_date TIMESTAMP,
  status TEXT DEFAULT 'pendente',
  rejection_reason TEXT,
  boost_requested BOOLEAN DEFAULT false,
  boost_notes TEXT,
  notes TEXT,
  created_date TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'pendente',
  payment_date DATE,
  invoice_url TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_date TIMESTAMP DEFAULT NOW()
);

-- Approval Links
CREATE TABLE approval_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  unique_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_date TIMESTAMP DEFAULT NOW()
);

-- Ideas
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  notes TEXT,
  tags TEXT[],
  created_date TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  order INTEGER,
  created_date TIMESTAMP DEFAULT NOW()
);

-- Personal Events
CREATE TABLE personal_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  title TEXT,
  mood TEXT,
  medication_taken BOOLEAN DEFAULT false,
  special_moment BOOLEAN DEFAULT false,
  special_moment_description TEXT,
  diary_notes TEXT,
  created_date TIMESTAMP DEFAULT NOW()
);
```

---

### **Opção 2: Firebase (Google)** 🔥

**Vantagens:**
- ✅ Integração com Google
- ✅ Realtime Database
- ✅ Auth + Storage inclusos

```bash
npm install firebase
```

---

### **Opção 3: Backend Próprio (Node.js + Express)** 🚀

**Para controle total:**

```bash
# Backend
npm init -y
npm install express prisma @prisma/client cors
npx prisma init
```

**Estrutura:**
```
backend/
├── prisma/
│   └── schema.prisma
├── routes/
│   ├── clients.js
│   ├── posts.js
│   └── payments.js
└── server.js
```

---

## 📧 Email Real (Notificações)

### **Opção 1: SendGrid**
```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const SendEmail = async ({ to, subject, body }) => {
  await sgMail.send({
    to,
    from: 'seu-email@dominio.com',
    subject,
    text: body
  })
}
```

### **Opção 2: Resend (Mais Fácil)**
```bash
npm install resend
```

---

## 📦 Upload de Arquivos

### **Cloudinary (Recomendado)**
```bash
npm install cloudinary
```

```javascript
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

export const UploadFile = async ({ file }) => {
  const result = await cloudinary.uploader.upload(file)
  return { file_url: result.secure_url }
}
```

---

## 🚀 Deploy

### **Frontend (Vercel - Grátis)**
```bash
npm install -g vercel
vercel
```

### **Backend (Railway/Render - Grátis)**
```bash
# Railway
railway login
railway init
railway up
```

---

## 💡 Recomendação Final

**Para começar rápido:**
1. **Supabase** para banco de dados (5 min setup)
2. **Cloudinary** para upload de imagens (free tier generoso)
3. **Resend** para emails (100 emails/dia grátis)
4. **Vercel** para deploy do frontend

**Custo:** R$ 0,00 até ter muitos usuários! 🎉 