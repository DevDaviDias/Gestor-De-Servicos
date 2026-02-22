import { requireAuth } from './auth.js';
import { getClients, generatePDFReport, formatCurrency } from '../services.js';

export const initRelatoriosPage = async () => {
  await requireAuth();

  const loading = document.getElementById('loadingReports');
  const container = document.getElementById('reportsContainer');
  const noData = document.getElementById('noData');
  const monthSelect = document.getElementById('monthSelect');

  let allClients = [];

  // Populate month selector (last 12 months)
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label.charAt(0).toUpperCase() + label.slice(1);
    if (i === 0) opt.selected = true;
    monthSelect.appendChild(opt);
  }

  const loadReports = async () => {
    loading.style.display = 'flex';
    container.style.display = 'none';
    noData.style.display = 'none';

    allClients = await getClients();
    renderReports();
  };

  const renderReports = () => {
    const month = monthSelect.value;
    const clients = allClients.filter(c => c.serviceDate.startsWith(month));

    if (!clients.length) {
      loading.style.display = 'none';
      container.style.display = 'none';
      noData.style.display = 'block';
      return;
    }

    const paid = clients.filter(c => c.paymentStatus === 'pago');
    const unpaid = clients.filter(c => c.paymentStatus !== 'pago');
    const grossRevenue = paid.reduce((s, c) => s + c.serviceValue, 0);
    const unpaidValue = unpaid.reduce((s, c) => s + c.serviceValue, 0);
    const allParts = clients.flatMap(c => c.parts || []);
    const partsCost = allParts.reduce((s, p) => s + p.cost, 0);
    const netProfit = grossRevenue - partsCost;
    const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    document.getElementById('grossRevenue').textContent = formatCurrency(grossRevenue);
    document.getElementById('paidServices').textContent = `${paid.length} serviço${paid.length !== 1 ? 's' : ''} pago${paid.length !== 1 ? 's' : ''}`;
    document.getElementById('partsCost').textContent = formatCurrency(partsCost);
    document.getElementById('totalParts').textContent = `${allParts.length} peça${allParts.length !== 1 ? 's' : ''} utilizada${allParts.length !== 1 ? 's' : ''}`;
    document.getElementById('netProfit').textContent = formatCurrency(netProfit);
    document.getElementById('profitMargin').textContent = `${margin.toFixed(1)}% de margem`;
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('paidCount').textContent = paid.length;
    document.getElementById('unpaidCount').textContent = unpaid.length;
    document.getElementById('unpaidValue').textContent = formatCurrency(unpaidValue);

    // Top clients
    const topList = document.getElementById('topClients');
    if (topList) {
      const sorted = [...paid].sort((a, b) => b.serviceValue - a.serviceValue).slice(0, 5);
      topList.innerHTML = sorted.map(c => `
        <div class="top-item">
          <span class="top-name">${c.clientName}</span>
          <span class="top-value">${formatCurrency(c.serviceValue)}</span>
        </div>
      `).join('');
    }

    loading.style.display = 'none';
    container.style.display = 'grid';
  };

  monthSelect?.addEventListener('change', renderReports);

  document.getElementById('exportPDF')?.addEventListener('click', async () => {
    const btn = document.getElementById('exportPDF');
    btn.disabled = true;
    btn.textContent = '⏳ Gerando PDF...';
    try {
      await generatePDFReport(allClients, monthSelect.value);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF. Verifique o console.');
    } finally {
      btn.disabled = false;
      btn.textContent = '📄 Exportar PDF';
    }
  });

  loadReports();
};
