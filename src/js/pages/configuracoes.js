import { auth, db } from '../firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function initConfiguracoesPage() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    // Preenche perfil
    window.loadUserProfile(user);

    // Busca clientes para as estatísticas
    const q = query(collection(db, 'clients'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const clients = snap.docs.map(d => d.data());
    window.loadStats(clients);
  });
}