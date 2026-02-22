import { requireAuth } from './auth.js';
import {
  getClients, updateClient, deleteClient,
  getWarrantyDaysLeft, getWarrantyExpiry,
  shareOnWhatsApp, formatCurrency, formatDate
} from '../services.js';

export const initClientesPage = async () => {
  await requireAuth();

  const container = document.getElementById('clientsContainer');
  const loading = document.getElementById('loadingClients');
  const noClients = document.getElementById('noClients');
  const searchInput = document.getElementById('searchInput');
  const editModal = document.getElementById('editModal');
  const deleteModal = document.getElementById('deleteModal');
  const editForm = document.getElementById('editForm');
  const warrantyAlert = document.getElementById('warrantyAlert');

  let allClients = [];
  let currentEditId = null;
  let currentDeleteId = null;

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

  const getWarrantyBadge = (client) => {
    const days = getWarrantyDaysLeft(client);
    const expiry = getWarrantyExpiry(client).toLocaleDateString('pt-BR');
    if (days < 0) return `<span class="warranty-badge expired">❌ Expirada em ${expiry}</span>`;
    if (days <= 7) return `<span class="warranty-badge critical">🔴 Vence em ${days} dias</span>`;
    if (days <= 30) return `<span class="warranty-badge warning">🟡 Vence em ${days} dias</span>`;
    return `<span class="warranty-badge ok">🟢 Válida até ${expiry}</span>`;
  };

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

          <div class="warranty-row">
            ${getWarrantyBadge(client)}
          </div>

          ${client.parts?.length ? `
            <div class="parts-mini">
              🔧 ${client.parts.length} peça${client.parts.length > 1 ? 's' : ''} —
              ${formatCurrency(client.parts.reduce((s, p) => s + p.cost, 0))}
            </div>` : ''}

          ${client.observations ? `
            <p class="observations">📝 ${client.observations}</p>` : ''}

          <div class="card-actions">
            <button class="btn-whatsapp" onclick="window._shareWhatsApp('${client.id}')">
              📤 WhatsApp
            </button>
            <button class="btn-edit" onclick="window._editClient('${client.id}')">
              ✏️ Editar
            </button>
            <button class="btn-delete" onclick="window._deleteClient('${client.id}')">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `).join('');
  };

  // Search
  searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    renderClients(allClients.filter(c =>
      c.clientName.toLowerCase().includes(term) ||
      c.observations?.toLowerCase().includes(term)
    ));
  });

  // Global handlers
  window._shareWhatsApp = (id) => {
    const client = allClients.find(c => c.id === id);
    if (client) shareOnWhatsApp(client);
  };

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

  window._deleteClient = (id) => {
    currentDeleteId = id;
    deleteModal.style.display = 'flex';
  };

  // Edit form
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

  // Delete confirm
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

  // Close modals
  document.querySelectorAll('.modal-close, .modal-cancel, #cancelDelete').forEach(btn => {
    btn.addEventListener('click', () => {
      editModal.style.display = 'none';
      deleteModal.style.display = 'none';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === editModal) editModal.style.display = 'none';
    if (e.target === deleteModal) deleteModal.style.display = 'none';
  });

  loadClients();
};
