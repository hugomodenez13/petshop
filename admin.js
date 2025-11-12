document.addEventListener('DOMContentLoaded', async () => {
    
    const tabelaCorpo = document.getElementById('tabela-agendamentos-corpo');
    
    // 1. Pega o token de login
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        alert('Acesso negado. Você precisa estar logado como admin.');
        window.location.href = 'login.html';
        return;
    }

    // 2. Tenta buscar os dados da nova API
    try {
        const response = await fetch('http://127.0.0.1:5000/api/admin/agendamentos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        // 3. Se não conseguir, mostra erro
        if (!data.sucesso) {
            tabelaCorpo.innerHTML = `<tr><td colspan="6" class="error-text">Erro ao carregar dados: ${data.mensagem}</td></tr>`;
            return;
        }

        const agendamentos = data.agendamentos;

        // 4. Se não tiver agendamentos, mostra aviso
        if (agendamentos.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="6">Nenhum agendamento encontrado.</td></tr>`;
            return;
        }

        // 5. Se tiver dados, constrói a tabela
        let html = '';
        agendamentos.forEach(ag => {
            html += `
                <tr>
                    <td>${ag.data}</td>
                    <td>${ag.hora}</td>
                    <td>${ag.tutor_nome}</td>
                    <td>${ag.pet_nome}</td>
                    <td class="servico">${ag.servico}</td>
                    <td>${ag.telefone}</td>
                </tr>
            `;
        });

        tabelaCorpo.innerHTML = html; // Insere o HTML na tabela

    } catch (err) {
        console.error('Erro de conexão:', err);
        tabelaCorpo.innerHTML = `<tr><td colspan="6" class="error-text">Erro de conexão com o servidor.</td></tr>`;
    }
});