# 🗂️ Sistema de Gestão de Clientes e Serviços (PWA)

O **Gestor de Serviços** é uma aplicação web de alto desempenho projetada para facilitar a vida de técnicos e prestadores de serviço independentes. O sistema transforma o fluxo de trabalho manual em um processo digital organizado, permitindo o registro de clientes, controle financeiro e documentação fotográfica diretamente do celular.

<img width="674" height="915" alt="Captura de tela do Projeto" src="https://github.com/user-attachments/assets/c4e7e347-eecb-49bf-a108-becb04032817" />

---

## 🚀 Tecnologias Utilizadas

O projeto utiliza o que há de mais moderno no ecossistema JavaScript para garantir uma experiência rápida, segura e escalável:

* **Vite:** Ferramenta de build de última geração para uma experiência de desenvolvimento instantânea.
* **Firebase (Firestore & Storage):** Banco de dados NoSQL e armazenamento de imagens na nuvem (Google Cloud).
* **Tailwind CSS & Sass:** Estilização responsiva e moderna com foco em dispositivos móveis (*Mobile-First*).
* **PWA (Progressive Web App):** Implementação que permite a instalação do sistema no celular como um aplicativo nativo.
* **Browser Image Compression:** Otimização de fotos para reduzir o consumo de dados e armazenamento.

---

## 📂 Estrutura de Pastas

A organização modular do projeto separa as responsabilidades de configuração, serviços e interface:

```text
meu-projeto/
├── 📁 public/             # Ícones do PWA e arquivos estáticos (favicon)
├── 📁 src/                # Código-fonte principal da aplicação
│   ├── 📁 assets/         # Imagens estáticas e logotipos
│   ├── 📁 css/            # Arquivos de estilo (Sass e Tailwind)
│   ├── 📁 js/             # Lógica de negócio modularizada
│   │   ├── firebase.js     # Configuração e inicialização do Firebase
│   │   ├── services.js     # Operações de Banco de Dados (CRUD) e Storage
│   │   └── utils.js        # Formatadores e funções auxiliares
│   └── main.js            # Ponto de entrada (Main Script) do Vite
├── .env                   # Variáveis de ambiente (Chaves secretas - Não versionado)
├── .env.example           # Modelo para configuração das variáveis de ambiente
├── index.html             # Tela principal (Formulário de Cadastro)
├── clientes.html          # Página de Listagem e Gerenciamento
├── relatorios.html        # Painel de métricas financeiras
└── vite.config.js         # Configurações do Build e Plugin PWA