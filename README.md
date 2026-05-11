# 🎓 UFRA Eventos – Plataforma Acadêmica

> Plataforma SaaS de gerenciamento de eventos acadêmicos da **Universidade Federal Rural da Amazônia – Campus Paragominas**.

<div align="center">

![UFRA](https://img.shields.io/badge/UFRA-Campus%20Paragominas-1B5E20?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

</div>

---

## 📋 Sumário

- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Rápida](#-instalação-rápida)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Credenciais de Acesso](#-credenciais-de-acesso)
- [API Endpoints](#-api-endpoints)
- [Deploy](#-deploy)

---

## ✨ Funcionalidades

| Módulo | Funcionalidades |
|--------|-----------------|
| 🔐 **Autenticação** | Login, Cadastro, Reset de senha, JWT, 3 perfis |
| 📅 **Eventos** | Criação, edição, banners, programação, palestrantes |
| 📝 **Inscrições** | QR Code individual, limite de vagas, confirmação por email |
| ✅ **Check-in** | Leitura de QR Code, check-in manual, lista de presença |
| 🎓 **Certificados** | Geração automática em PDF, QR Code de validação, código único |
| 🔬 **Artigos** | Submissão PDF, avaliação, pareceres, aprovação/reprovação |
| 📊 **Dashboard Admin** | Estatísticas, gráficos, exportação CSV, gestão de usuários |
| 📨 **Emails** | Boas-vindas, confirmação de inscrição, reset de senha |

---

## 🛠 Stack Tecnológica

**Frontend:**
- Next.js 15 + TypeScript
- TailwindCSS + ShadCN/UI
- Framer Motion (animações)
- Zustand (estado global)
- React Query (cache de dados)
- Recharts (gráficos)

**Backend:**
- Node.js + Express.js
- Prisma ORM
- PostgreSQL
- JWT + bcryptjs
- Nodemailer (emails)
- PDFKit (certificados)
- QRCode (geração)
- Multer (uploads)

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) `>= 18.0.0`
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o banco de dados)
- Git

---

## 🚀 Instalação Rápida

### 1. Clonar e Acessar o Projeto

```bash
# O projeto já está em: C:\PROJETO EVEN3
cd "C:\PROJETO EVEN3"
```

### 2. Iniciar o Banco de Dados (Docker)

```bash
# Na pasta raiz do projeto:
docker compose up -d

# Verificar se o PostgreSQL está rodando:
docker compose ps
```

### 3. Configurar e Iniciar o Backend

```bash
cd backend

# Copiar e configurar variáveis de ambiente
copy ..\env.example .env
# (Edite o .env se necessário – configuração padrão já funciona com o Docker)

# Instalar dependências
npm install

# Gerar o cliente Prisma
npx prisma generate

# Criar as tabelas no banco
npx prisma migrate dev --name init

# Popular o banco com dados de exemplo
node prisma/seed.js

# Iniciar o servidor de desenvolvimento
npm run dev
```

O backend estará em: **http://localhost:3001**
Health check: **http://localhost:3001/health**

### 4. Iniciar o Frontend

Abra um **novo terminal**:

```bash
cd "C:\PROJETO EVEN3\frontend"

# As dependências já estão instaladas
# Se necessário: npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará em: **http://localhost:3000**

---

## 🔐 Credenciais de Acesso

Após executar o seed, use estas credenciais para testar:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| **Administrador** | `admin@ufra.edu.br` | `Admin@123` |
| **Organizador** | `organizador@ufra.edu.br` | `Org@12345` |
| **Participante** | `joao.silva@discente.ufra.edu.br` | `Part@12345` |

---

## 📁 Estrutura do Projeto

```
C:\PROJETO EVEN3\
├── docker-compose.yml          ← PostgreSQL Docker
├── .env.example                ← Template de variáveis de ambiente
├── README.md
│
├── backend/
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma       ← Modelagem do banco de dados
│   │   └── seed.js             ← Dados iniciais
│   ├── src/
│   │   ├── server.js           ← Servidor Express
│   │   ├── controllers/        ← Lógica de negócio
│   │   │   ├── auth.controller.js
│   │   │   ├── event.controller.js
│   │   │   ├── registration.controller.js
│   │   │   ├── certificate.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── submission.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── routes/             ← Endpoints da API
│   │   ├── middlewares/        ← JWT, RBAC, Upload, Errors
│   │   └── services/           ← Email, Certificado PDF
│   ├── uploads/                ← Arquivos enviados
│   └── certificates/           ← PDFs gerados
│
└── frontend/
    ├── app/
    │   ├── page.tsx            ← Landing page
    │   ├── login/              ← Autenticação
    │   ├── cadastro/           ← Registro
    │   ├── eventos/            ← Lista e detalhe de eventos
    │   ├── participante/       ← Dashboard do participante
    │   ├── organizador/        ← Dashboard do organizador
    │   ├── admin/              ← Painel administrativo
    │   └── certificados/       ← Validação pública
    ├── components/
    │   ├── layout/             ← Header, Footer, Sidebar
    │   ├── events/             ← EventCard, EventBanner
    │   ├── common/             ← Skeleton, StatsCounter
    │   └── ui/                 ← ShadCN components
    ├── store/                  ← Zustand (estado global)
    └── lib/                    ← API client (Axios)
```

---

## 🌐 API Endpoints

### Autenticação
```
POST   /api/auth/register        Cadastro
POST   /api/auth/login           Login → JWT
GET    /api/auth/me              Perfil do usuário
POST   /api/auth/forgot-password Solicitar reset
POST   /api/auth/reset-password  Redefinir senha
```

### Eventos
```
GET    /api/events               Listar (público, paginado)
GET    /api/events/:slug         Detalhe (público)
GET    /api/events/my            Meus eventos (org/admin)
POST   /api/events               Criar evento
PUT    /api/events/:id           Editar evento
DELETE /api/events/:id           Excluir evento
```

### Inscrições
```
POST   /api/registrations               Inscrever-se
GET    /api/registrations/my            Minhas inscrições
GET    /api/registrations/event/:id     Lista de inscritos
DELETE /api/registrations/:id           Cancelar inscrição
```

### Check-in
```
POST   /api/attendance/checkin          Check-in QR Code
POST   /api/attendance/manual           Check-in manual
GET    /api/attendance/event/:id        Lista de presença
```

### Certificados
```
GET    /api/certificates/validate/:code  Validar (público)
GET    /api/certificates/my              Meus certificados
POST   /api/certificates/generate/:id   Gerar em lote
GET    /api/certificates/download/:id    Baixar PDF
```

### Submissões
```
POST   /api/submissions                  Submeter artigo
GET    /api/submissions/my               Minhas submissões
GET    /api/submissions/event/:id        Submissões do evento
PUT    /api/submissions/:id/review       Avaliar submissão
```

### Dashboard
```
GET    /api/dashboard/admin              Estatísticas admin
GET    /api/dashboard/organizer          Estatísticas organizador
GET    /api/dashboard/export             Exportar dados (CSV/JSON)
```

---

## 🔧 Scripts Úteis

```bash
# Backend
npm run dev         # Desenvolvimento (nodemon)
npm run db:studio   # Visualizar banco (Prisma Studio)
npm run db:reset    # Resetar banco e rodar seed
npm run db:seed     # Apenas rodar o seed

# Frontend
npm run dev         # Desenvolvimento
npm run build       # Build de produção
npm run start       # Iniciar build de produção
```

---

## 🚢 Deploy em Produção

### Backend → Railway/Render
1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente (DATABASE_URL, JWT_SECRET, etc.)
3. O deploy acontece automaticamente

### Frontend → Vercel
1. Importe o projeto no Vercel apontando para a pasta `/frontend`
2. Configure `NEXT_PUBLIC_API_URL` com a URL do backend em produção
3. Deploy automático a cada push

---

## 📧 Emails de Teste (Ethereal)

O sistema usa **Ethereal** para emails em desenvolvimento. Quando o servidor iniciar pela primeira vez, ele criará uma conta automática e exibirá no console:

```
📧 Email de teste - Login: xyz@ethereal.email
📧 Ver emails enviados em: https://ethereal.email/messages
```

Acesse o link para visualizar todos os emails enviados durante os testes.

---

## 🎨 Design System

**Cores Institucionais UFRA:**
- Verde Principal: `#1B5E20`
- Verde Claro: `#2E7D32`
- Dourado: `#F9A825`

**Tipografia:** Inter (Google Fonts)

---

## 📄 Licença

Este projeto foi desenvolvido exclusivamente para a **UFRA Campus Paragominas**.

---

<div align="center">
Desenvolvido com ❤️ para a comunidade acadêmica da UFRA Campus Paragominas 🌿
</div>
