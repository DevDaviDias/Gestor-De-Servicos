# 🔧 Gestão de Serviços

App PWA para gerenciamento de serviços, garantias e relatórios financeiros.

## 🚀 Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Firebase
- Acesse https://console.firebase.google.com
- Crie um projeto novo
- Ative **Firestore Database** (modo produção)
- Ative **Storage**
- Ative **Authentication → Email/Senha**
- Copie as credenciais do projeto

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Preencha o arquivo `.env` com suas credenciais do Firebase.

### 4. Criar usuário no Firebase
- No console Firebase → Authentication → Users → Add user
- Crie o email e senha do seu pai

### 5. Rodar em desenvolvimento
```bash
npm run dev
```

### 6. Build para produção
```bash
npm run build
```

## 📱 Como instalar no Android
1. Abra o link do app no Chrome
2. Toque no menu (⋮) → "Adicionar à tela inicial"
3. O app aparece como qualquer app nativo!

## 📁 Estrutura do projeto
```
├── index.html          # Página de cadastro
├── clientes.html       # Lista de clientes  
├── relatorios.html     # Relatórios mensais
├── login.html          # Login
├── src/
│   ├── js/
│   │   ├── firebase.js         # Config Firebase
│   │   ├── services.js         # Lógica de dados
│   │   ├── main.js             # Roteador
│   │   └── pages/
│   │       ├── auth.js         # Autenticação
│   │       ├── cadastro.js     # Página de cadastro
│   │       ├── clientes.js     # Página de clientes
│   │       └── relatorios.js   # Página de relatórios
│   └── css/
│       └── style.css           # Estilos globais
└── public/             # Ícones PWA
```

## ✨ Funcionalidades
- ✅ Login com email e senha
- 📝 Cadastro de clientes com foto
- 📸 Compressão automática de imagens
- 🛡️ Alertas de garantia vencendo (30 dias)
- 📤 Compartilhar recibo via WhatsApp
- 📊 Relatórios mensais com métricas
- 📄 Exportar relatório em PDF
- 📱 PWA instalável no Android
- 🔄 Funciona offline (com cache)
