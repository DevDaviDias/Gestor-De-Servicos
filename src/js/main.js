import { logout } from './pages/auth.js';

// deixa logout disponível no HTML
window.logout = logout;

// detecta corretamente o nome do arquivo atual
const path = window.location.pathname;
const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

console.log('📄 Página detectada:', page);

const routes = {
  'index.html': () =>
    import('./pages/cadastro.js').then(m => m.initCadastroPage()),

  'clientes.html': () =>
    import('./pages/clientes.js').then(m => m.initClientesPage()),

  'relatorios.html': () =>
    import('./pages/relatorios.js').then(m => m.initRelatoriosPage()),

  'configuracoes.html': () =>
    import('./pages/configuracoes.js').then(m => m.initConfiguracoesPage()),

  'login.html': () =>
    import('./pages/auth.js').then(m => m.initAuthPage()),

  'register.html': () =>
    import('./pages/auth.js').then(m => m.initRegisterPage()),
};

document.addEventListener('DOMContentLoaded', () => {
  const init = routes[page];

  if (!init) {
    console.warn('⚠️ Nenhuma rota encontrada para:', page);
    return;
  }

  init().catch(err => {
    console.error('❌ Erro ao inicializar a página:', err);
  });
});