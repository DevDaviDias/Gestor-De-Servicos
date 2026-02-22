import { logout } from './pages/auth.js';

// Expose logout globally for nav button
window.logout = logout;

// Route to correct page init
const page = window.location.pathname.split('/').pop() || 'index.html';

const routes = {
  'index.html': () => import('./pages/cadastro.js').then(m => m.initCadastroPage()),
  '': () => import('./pages/cadastro.js').then(m => m.initCadastroPage()),
  'clientes.html': () => import('./pages/clientes.js').then(m => m.initClientesPage()),
  'relatorios.html': () => import('./pages/relatorios.js').then(m => m.initRelatoriosPage()),
  'login.html': () => import('./pages/auth.js').then(m => m.initAuthPage()),
  'register.html': () => import('./pages/auth.js').then(m => m.initRegisterPage()),
};

document.addEventListener('DOMContentLoaded', () => {
  const init = routes[page];
  if (init) init().catch(console.error);
});
