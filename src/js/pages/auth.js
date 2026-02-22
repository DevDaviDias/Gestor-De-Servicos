import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase.js';

// ─── Login ────────────────────────────────────────────────────────────────────
export const initAuthPage = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = '/';
  });

  const form = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');
  const submitBtn = document.getElementById('submitBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';
    errorMsg.style.display = 'none';

    try {
      await signInWithEmailAndPassword(
        auth,
        document.getElementById('email').value,
        document.getElementById('password').value
      );
      window.location.href = '/';
    } catch (err) {
      errorMsg.textContent = '❌ Email ou senha incorretos.';
      errorMsg.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar';
    }
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────
export const initRegisterPage = () => {
  // ⚠️ Não redireciona automaticamente na página de registro
  // pois o Firebase loga ao criar conta e causaria redirect prematuro

  const form = document.getElementById('registerForm');
  const errorMsg = document.getElementById('errorMsg');
  const submitBtn = document.getElementById('submitBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (password !== confirm) {
      errorMsg.textContent = '❌ As senhas não coincidem.';
      errorMsg.style.display = 'block';
      return;
    }

    if (password.length < 6) {
      errorMsg.textContent = '❌ A senha deve ter pelo menos 6 caracteres.';
      errorMsg.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Criando conta...';
    errorMsg.style.display = 'none';

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: name });
      window.location.href = '/'; // redireciona só aqui, após tudo pronto
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': '❌ Este email já está em uso.',
        'auth/invalid-email': '❌ Email inválido.',
        'auth/weak-password': '❌ Senha muito fraca. Use pelo menos 6 caracteres.',
      };
      errorMsg.textContent = messages[err.code] || '❌ Erro ao criar conta. Tente novamente.';
      errorMsg.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Criar Conta';
    }
  });
};

// ─── Auth Guard ───────────────────────────────────────────────────────────────
export const requireAuth = () => {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = '/login.html';
      } else {
        resolve(user);
      }
    });
  });
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async () => {
  await signOut(auth);
  window.location.href = '/login.html';
};