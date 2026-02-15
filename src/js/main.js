import { ClienteService } from './services.js';

const form = document.getElementById('clientForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Captura os dados do formulário
    const formData = new FormData(form);
    const dados = Object.fromEntries(formData.entries());

    try {
        await ClienteService.salvar(dados);
        alert("Cliente salvo no banco de dados com sucesso!");
        form.reset();
    } catch (error) {
        alert("Erro ao salvar no Firebase.");
    }
});