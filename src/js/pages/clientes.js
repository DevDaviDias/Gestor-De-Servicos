import { requireAuth } from './auth.js';
import {
  getClients, updateClient, deleteClient,
  getWarrantyDaysLeft, getWarrantyExpiry,
  formatCurrency, formatDate
} from '../services.js';

export const initClientesPage = async () => {
  await requireAuth();

  const container = document.getElementById('clientsContainer');
  const loading = document.getElementById('loadingClients');
  const noClients = document.getElementById('noClients');
  const searchInput = document.getElementById('searchInput');
  const editModal = document.getElementById('editModal');
  const deleteModal = document.getElementById('deleteModal');
  const receiptModal = document.getElementById('receiptModal');
  const editForm = document.getElementById('editForm');
  const warrantyAlert = document.getElementById('warrantyAlert');

  let allClients = [];
  let currentEditId = null;
  let currentDeleteId = null;
  let currentReceiptClient = null;

  // ── Load Clients ──────────────────────────────────────────────────────────
  const loadClients = async () => {
    loading.style.display = 'flex';
    container.style.display = 'none';
    noClients.style.display = 'none';

    allClients = await getClients();
    checkWarrantyAlerts(allClients);

    if (!allClients.length) {
      loading.style.display = 'none';
      noClients.style.display = 'block';
      return;
    }
    renderClients(allClients);
  };

  // ── Warranty Alerts ───────────────────────────────────────────────────────
  const checkWarrantyAlerts = (clients) => {
    const expiring = clients.filter(c => {
      const days = getWarrantyDaysLeft(c);
      return days >= 0 && days <= 30;
    });
    if (expiring.length > 0) {
      warrantyAlert.style.display = 'flex';
      warrantyAlert.querySelector('.alert-text').innerHTML =
        `⚠️ <strong>${expiring.length} garantia${expiring.length > 1 ? 's' : ''} vencendo em até 30 dias:</strong> ` +
        expiring.map(c => `${c.clientName} (${getWarrantyDaysLeft(c)} dias)`).join(', ');
    }
  };

  // ── Warranty Badge ────────────────────────────────────────────────────────
  const getWarrantyBadge = (client) => {
    const days = getWarrantyDaysLeft(client);
    const expiry = getWarrantyExpiry(client).toLocaleDateString('pt-BR');
    if (days < 0) return `<span class="warranty-badge expired">❌ Expirada em ${expiry}</span>`;
    if (days <= 7) return `<span class="warranty-badge critical">🔴 Vence em ${days} dias</span>`;
    if (days <= 30) return `<span class="warranty-badge warning">🟡 Vence em ${days} dias</span>`;
    return `<span class="warranty-badge ok">🟢 Válida até ${expiry}</span>`;
  };

  // ── Render Clients ────────────────────────────────────────────────────────
  const renderClients = (clients) => {
    loading.style.display = 'none';
    container.style.display = 'grid';

    container.innerHTML = clients.map(client => `
      <div class="client-card" data-id="${client.id}">
        <div class="card-photo">
          ${client.photoURL
            ? `<img src="${client.photoURL}" alt="Foto do serviço" loading="lazy">`
            : `<div class="no-photo">📷</div>`}
        </div>

        <div class="card-body">
          <div class="card-header">
            <h3>${client.clientName}</h3>
            <span class="status-badge ${client.paymentStatus === 'pago' ? 'paid' : 'pending'}">
              ${client.paymentStatus === 'pago' ? '✅ Pago' : '⏳ Pendente'}
            </span>
          </div>

          <div class="card-details">
            <span>📅 ${formatDate(client.serviceDate)}</span>
            <span>💰 ${formatCurrency(client.serviceValue)}</span>
          </div>

          <div class="warranty-row">${getWarrantyBadge(client)}</div>

          ${client.parts?.length ? `
            <div class="parts-mini">
              🔧 ${client.parts.length} peça${client.parts.length > 1 ? 's' : ''} —
              ${formatCurrency(client.parts.reduce((s, p) => s + p.cost, 0))}
            </div>` : ''}

          ${client.observations ? `
            <p class="observations">📝 ${client.observations}</p>` : ''}

          <div class="card-actions">
            <button class="btn-share" onclick="window._openReceipt('${client.id}')">
              📄 Comprovante
            </button>
            ${client.paymentStatus === 'nao-pago' ? `
              <button class="btn-edit" onclick="window._editClient('${client.id}')">
                ✏️ Editar
              </button>` : `<div></div>`}
            <button class="btn-delete" onclick="window._deleteClient('${client.id}')">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `).join('');
  };

  // ── Search ────────────────────────────────────────────────────────────────
  searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    renderClients(allClients.filter(c =>
      c.clientName.toLowerCase().includes(term) ||
      c.observations?.toLowerCase().includes(term)
    ));
  });

  // ── Receipt ───────────────────────────────────────────────────────────────
  window._openReceipt = (id) => {
    const client = allClients.find(c => c.id === id);
    if (!client) return;
    currentReceiptClient = client;

    // Fill receipt data
    document.getElementById('rClientName').textContent = client.clientName;
    document.getElementById('rDate').textContent = formatDate(client.serviceDate);
    document.getElementById('rWarranty').textContent = `${client.warranty} ${client.warranty === 1 ? 'mês' : 'meses'}`;
    document.getElementById('rExpiry').textContent = getWarrantyExpiry(client).toLocaleDateString('pt-BR');
    document.getElementById('rTotal').textContent = formatCurrency(client.serviceValue);
    document.getElementById('rObs').textContent = client.observations || 'Nenhuma observação.';

    // Badge
    const badge = document.getElementById('receiptBadge');
    badge.textContent = client.paymentStatus === 'pago' ? 'PAGO' : 'PENDENTE';
    badge.className = `receipt-badge${client.paymentStatus !== 'pago' ? ' pending' : ''}`;

    // Photo
    const photoWrap = document.getElementById('receiptPhotoWrap');
    const photoImg = document.getElementById('receiptPhoto');
    if (client.photoURL) {
      photoImg.src = client.photoURL;
      photoWrap.classList.add('has-photo');
    } else {
      photoWrap.classList.remove('has-photo');
    }

    // Parts
    const partsEl = document.getElementById('rParts');
if (client.parts?.length) {
  partsEl.innerHTML = client.parts.map(p => `
    <div class="receipt-part-row">
      <span>${p.name}</span>
    </div>
  `).join('');
} else {
      partsEl.innerHTML = '<p style="font-size:0.82rem;color:#9095a1;padding:4px 0;">Nenhuma peça registrada.</p>';
    }

    receiptModal.style.display = 'flex';
  };

  // ── Share on WhatsApp ─────────────────────────────────────────────────────
  document.getElementById('shareWhatsAppBtn')?.addEventListener('click', async () => {
    const client = currentReceiptClient;
    if (!client) return;

    const btn = document.getElementById('shareWhatsAppBtn');
    btn.textContent = '⏳ Gerando...';
    btn.disabled = true;

    try {
      // Try to generate image and share via Web Share API
      const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js')).default;
      const canvas = await html2canvas(document.getElementById('receiptContent'), {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'comprovante.png', { type: 'image/png' });

        // Try native share with image
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Comprovante — ${client.clientName}`,
            files: [file]
          });
        } else {
          // Fallback: WhatsApp text
          shareTextWhatsApp(client);
        }
      }, 'image/png');

    } catch (err) {
      console.error(err);
      shareTextWhatsApp(client);
    } finally {
      btn.textContent = '📤 Compartilhar no WhatsApp';
      btn.disabled = false;
    }
  });

  // Fallback text share
  const shareTextWhatsApp = (client) => {
    const expiry = getWarrantyExpiry(client).toLocaleDateString('pt-BR');
    const parts = client.parts?.length
      ? client.parts.map(p => `  • ${p.name}: ${formatCurrency(p.cost)}`).join('\n')
      : '  Nenhuma peça registrada';

    const message = `🔧 *COMPROVANTE DE SERVIÇO*
━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${client.clientName}
📅 *Data:* ${formatDate(client.serviceDate)}
💰 *Valor:* ${formatCurrency(client.serviceValue)}
✅ *Pagamento:* ${client.paymentStatus === 'pago' ? 'Pago' : '⏳ Pendente'}

🔩 *Peças utilizadas:*
${parts}

🛡️ *Garantia:* ${client.warranty} ${client.warranty === 1 ? 'mês' : 'meses'}
📆 *Válida até:* ${expiry}
${client.observations ? `\n📝 *Obs:* ${client.observations}` : ''}
━━━━━━━━━━━━━━━━━━━━
_Guarde este comprovante para referência._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // ── Download Receipt ──────────────────────────────────────────────────────
  document.getElementById('downloadReceiptBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('downloadReceiptBtn');
    btn.textContent = '⏳ Gerando imagem...';
    btn.disabled = true;

    try {
      const html2canvas = (await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js')).default;
      const canvas = await html2canvas(document.getElementById('receiptContent'), {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `comprovante_${currentReceiptClient?.clientName || 'servico'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      alert('Erro ao gerar imagem. Tente novamente.');
    } finally {
      btn.textContent = '⬇️ Baixar Imagem';
      btn.disabled = false;
    }
  });

  // ── Edit Client ───────────────────────────────────────────────────────────
  window._editClient = (id) => {
    const client = allClients.find(c => c.id === id);
    if (!client) return;
    currentEditId = id;
    document.getElementById('editClientName').value = client.clientName;
    document.getElementById('editServiceDate').value = client.serviceDate;
    document.getElementById('editWarranty').value = client.warranty;
    document.getElementById('editServiceValue').value = client.serviceValue;
    document.getElementById('editPaymentStatus').value = client.paymentStatus;
    document.getElementById('editObservations').value = client.observations || '';
    editModal.style.display = 'flex';
  };

  // ── Delete Client ─────────────────────────────────────────────────────────
  window._deleteClient = (id) => {
    currentDeleteId = id;
    deleteModal.style.display = 'flex';
  };

  // ── Edit Form Submit ──────────────────────────────────────────────────────
  editForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentEditId) return;
    try {
      await updateClient(currentEditId, {
        clientName: document.getElementById('editClientName').value,
        serviceDate: document.getElementById('editServiceDate').value,
        warranty: parseInt(document.getElementById('editWarranty').value),
        serviceValue: parseFloat(document.getElementById('editServiceValue').value),
        paymentStatus: document.getElementById('editPaymentStatus').value,
        observations: document.getElementById('editObservations').value
      });
      editModal.style.display = 'none';
      loadClients();
    } catch (err) {
      alert('Erro ao atualizar. Tente novamente.');
    }
  });

  // ── Delete Confirm ────────────────────────────────────────────────────────
  document.getElementById('confirmDelete')?.addEventListener('click', async () => {
    if (!currentDeleteId) return;
    try {
      await deleteClient(currentDeleteId);
      deleteModal.style.display = 'none';
      loadClients();
    } catch (err) {
      alert('Erro ao excluir. Tente novamente.');
    }
  });

  // ── Close Modals ──────────────────────────────────────────────────────────
  document.querySelectorAll('.modal-close, .modal-cancel, #cancelDelete').forEach(btn => {
    btn.addEventListener('click', () => {
      editModal.style.display = 'none';
      deleteModal.style.display = 'none';
      receiptModal.style.display = 'none';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === editModal) editModal.style.display = 'none';
    if (e.target === deleteModal) deleteModal.style.display = 'none';
    if (e.target === receiptModal) receiptModal.style.display = 'none';
  });

  loadClients();
};
