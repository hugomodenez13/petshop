// URL base da API
const API_URL = 'http://127.0.0.1:5000/api';

// Função correta pra pegar o token salvo no localStorage
function getToken() {
    return localStorage.getItem('jwt_token'); // <-- o nome exato que está no seu storage
}

// Função para lidar com o envio do formulário
async function handlePetFormSubmit() {
    const form = document.getElementById('pet-form');
    const messageDiv = document.getElementById('form-message');

    if (!form) return; // segurança

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageDiv.textContent = 'Enviando...';
        messageDiv.style.color = 'black';

        const nome = document.getElementById('pet-nome').value;
        const especie = document.getElementById('pet-especie').value;
        const raca = document.getElementById('pet-raca').value;
        const nascimento = document.getElementById('pet-nascimento').value;

        const token = getToken();
        if (!token) {
            messageDiv.textContent = 'Você precisa estar logado para cadastrar um pet.';
            messageDiv.style.color = 'red';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/cadastrar-pet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nome,
                    especie,
                    raca,
                    nascimento
                })
            });

            const data = await response.json();

            if (!response.ok) {
                messageDiv.textContent = data.mensagem || 'Erro ao cadastrar pet.';
                messageDiv.style.color = 'red';
                return;
            }

            messageDiv.textContent = data.mensagem || 'Pet cadastrado com sucesso!';
            messageDiv.style.color = 'green';
            form.reset();

            // Volta para "Minha Conta" após 2s
            setTimeout(() => {
                window.location.href = 'minha-conta.html';
            }, 2000);

        } catch (error) {
            console.error('Erro ao cadastrar pet:', error);
            messageDiv.textContent = 'Erro de conexão com o servidor.';
            messageDiv.style.color = 'red';
        }
    });
}

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', handlePetFormSubmit);