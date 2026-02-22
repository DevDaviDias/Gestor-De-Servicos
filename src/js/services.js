import {
  collection, addDoc, getDocs, doc,
  updateDoc, deleteDoc, query, orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase.js';

const clientsCol = () => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado');
  return collection(db, 'users', uid, 'clients');
};

export const compressImage = (file, maxWidth = 800) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', 0.6);
    };
    img.src = URL.createObjectURL(file);
  });
};

export const uploadPhoto = async (file) => {
  const compressed = await compressImage(file);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(compressed);
  });
};

export const getClients = async () => {
  const q = query(clientsCol(), orderBy('serviceDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addClient = async (clientData) => {
  const docRef = await addDoc(clientsCol(), {
    ...clientData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

export const updateClient = async (id, clientData) => {
  const uid = auth.currentUser?.uid;
  await updateDoc(doc(db, 'users', uid, 'clients', id), {
    ...clientData,
    updatedAt: new Date().toISOString()
  });
};

export const deleteClient = async (id) => {
  const uid = auth.currentUser?.uid;
  await deleteDoc(doc(db, 'users', uid, 'clients', id));
};

export const getWarrantyExpiry = (client) => {
  const date = new Date(client.serviceDate);
  date.setMonth(date.getMonth() + client.warranty);
  return date;
};

export const getWarrantyDaysLeft = (client) => {
  const today = new Date();
  const expiry = getWarrantyExpiry(client);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

export const shareOnWhatsApp = (client) => {
  const expiry = getWarrantyExpiry(client).toLocaleDateString('pt-BR');
  const parts = client.parts?.length
    ? client.parts.map(p => `  • ${p.name}: ${formatCurrency(p.cost)}`).join('\n')
    : '  Nenhuma peça registrada';

  const message = `🔧 *RECIBO DE SERVIÇO*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${client.clientName}
📅 *Data:* ${formatDate(client.serviceDate)}
💰 *Valor:* ${formatCurrency(client.serviceValue)}
✅ *Pagamento:* ${client.paymentStatus === 'pago' ? 'Pago' : '⏳ Pendente'}
🔩 *Peças:*
${parts}
🛡️ *Garantia:* ${client.warranty} ${client.warranty === 1 ? 'mês' : 'meses'}
📆 *Válida até:* ${expiry}
${client.observations ? `📝 *Obs:* ${client.observations}` : ''}
━━━━━━━━━━━━━━━━━━━━
_Guarde este recibo para referência._`;

  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
};

export const generatePDFReport = async (clients, month) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  const monthClients = clients.filter(c => c.serviceDate.startsWith(month));
  const paid = monthClients.filter(c => c.paymentStatus === 'pago');
  const grossRevenue = paid.reduce((s, c) => s + c.serviceValue, 0);
  const partsCost = monthClients.flatMap(c => c.parts || []).reduce((s, p) => s + p.cost, 0);
  const netProfit = grossRevenue - partsCost;
  const pdf = new jsPDF();
  const monthLabel = new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  pdf.setFillColor(37, 99, 235);
  pdf.rect(0, 0, 210, 30, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Gestao de Servicos', 14, 13);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Relatorio Mensal - ${monthLabel}`, 14, 23);
  autoTable(pdf, {
    startY: 40,
    head: [['Cliente', 'Data', 'Valor', 'Status', 'Garantia']],
    body: monthClients.map(c => [
      c.clientName, formatDate(c.serviceDate), formatCurrency(c.serviceValue),
      c.paymentStatus === 'pago' ? 'Pago' : 'Pendente',
      `${c.warranty} ${c.warranty === 1 ? 'mes' : 'meses'}`
    ]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [247, 250, 255] },
    styles: { fontSize: 9 },
  });
  pdf.save(`relatorio_${month}.pdf`);
};

export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatDate = (dateString) =>
  new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR');
