import { requireAuth } from './auth.js';
import { addClient, uploadPhoto, formatCurrency } from '../services.js';

export const initCadastroPage = async () => {
  await requireAuth();

  const form = document.getElementById('clientForm');
  const addPartBtn = document.getElementById('addPart');
  const partsContainer = document.getElementById('partsContainer');
  const photoInput = document.getElementById('servicePhoto');
  const photoPreview = document.getElementById('photoPreview');
  const submitBtn = document.getElementById('submitBtn');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  // Set today as default date
  document.getElementById('serviceDate').valueAsDate = new Date();

  // Add part
  addPartBtn?.addEventListener('click', () => {
    const item = document.createElement('div');
    item.className = 'part-item';
    item.innerHTML = `
      <input type="text" placeholder="Nome da peça" class="part-name">
      <input type="number" placeholder="Custo (R$)" class="part-cost" step="0.01" min="0">
      <button type="button" class="btn-remove-part" aria-label="Remover peça">✕</button>
    `;
    item.querySelector('.btn-remove-part').addEventListener('click', () => item.remove());
    partsContainer.appendChild(item);
  });

  partsContainer?.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-remove-part')) {
      e.target.closest('.part-item').remove();
    }
  });

  // Photo preview
  photoInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      photoPreview.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  });

  // Form submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-sm"></span> Salvando...';

    try {
      const parts = [...partsContainer.querySelectorAll('.part-item')]
        .map(item => ({
          name: item.querySelector('.part-name').value.trim(),
          cost: parseFloat(item.querySelector('.part-cost').value) || 0
        }))
        .filter(p => p.name);

      let photoURL = null;
      const photoFile = photoInput?.files[0];
      if (photoFile) photoURL = await uploadPhoto(photoFile);

      await addClient({
        clientName: document.getElementById('clientName').value.trim(),
        serviceDate: document.getElementById('serviceDate').value,
        warranty: parseInt(document.getElementById('warranty').value),
        serviceValue: parseFloat(document.getElementById('serviceValue').value),
        paymentStatus: document.querySelector('input[name="paymentStatus"]:checked').value,
        observations: document.getElementById('observations').value.trim(),
        parts,
        photoURL
      });

      successMessage.style.display = 'flex';
      setTimeout(() => successMessage.style.display = 'none', 3500);
      form.reset();
      photoPreview.innerHTML = '';
      document.getElementById('serviceDate').valueAsDate = new Date();
      partsContainer.innerHTML = `
        <div class="part-item">
          <input type="text" placeholder="Nome da peça" class="part-name">
          <input type="number" placeholder="Custo (R$)" class="part-cost" step="0.01" min="0">
          <button type="button" class="btn-remove-part" aria-label="Remover peça">✕</button>
        </div>`;
    } catch (err) {
      console.error(err);
      errorMessage.style.display = 'flex';
      setTimeout(() => errorMessage.style.display = 'none', 3500);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '💾 Salvar Cliente';
    }
  });
};
