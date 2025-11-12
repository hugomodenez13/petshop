document.addEventListener('DOMContentLoaded', async () => {
    
    // Alvo: a <tbody> da nossa nova tabela
    const tabelaCorpo = document.getElementById('tabela-meus-agendamentos-corpo');
    
    // 1. Pega o token de login
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        alert('Acesso negado. Você precisa estar logado.');
        window.location.href = 'login.html';
        return;
    }

    // 2. Tenta buscar os dados da NOVA API
    try {
        const response = await fetch('http://127.0.0.1:5000/api/meus-agendamentos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        // 3. Se não conseguir, mostra erro
        if (!data.sucesso) {
            tabelaCorpo.innerHTML = `<tr><td colspan="4" class="error-text">${data.mensagem}</td></tr>`;
            return;
        }

        const agendamentos = data.agendamentos;

        // 4. Se não tiver agendamentos, mostra aviso
        if (agendamentos.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="4">Nenhum agendamento encontrado.</td></tr>`;
            return;
        }

        // 5. Se tiver dados, constrói a tabela (com 4 colunas)
        let html = '';
        agendamentos.forEach(ag => {
            html += `
                <tr>
                    <td>${ag.data}</td>
                    <td>${ag.hora}</td>
                    <td>${ag.pet_nome}</td>
                    <td class="servico">${ag.servico}</td>
                </tr>
            `;
        });

        tabelaCorpo.innerHTML = html; // Insere o HTML na tabela

    } catch (err) {
        console.error('Erro de conexão:', err);
        tabelaCorpo.innerHTML = `<tr><td colspan="4" class="error-text">Erro de conexão com o servidor.</td></tr>`;
    }
});