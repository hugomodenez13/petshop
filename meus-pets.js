const API_URL = 'http://127.0.0.1:5000/api';

// Pega o token salvo no login
function getToken() {
    return localStorage.getItem('jwt_token');
}

// Cria o cabeçalho de autenticação
function getAuthHeaders() {
    const token = getToken();
    if (!token) return null;
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

async function displayPets() {
    const listaContainer = document.getElementById('lista-pets');
    const headers = getAuthHeaders();

    if (!listaContainer) {
        console.warn('Elemento #lista-pets não encontrado no HTML.');
        return;
    }

    if (!headers) {
        alert('Faça login para ver seus pets.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/meus-pets`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();

        if (!response.ok) {
            // backend envia {msg: '...', ou {sucesso: False, mensagem: '...'}}
            const errMsg = data.mensagem || data.msg || 'Erro ao buscar pets.';
            listaContainer.innerHTML = `<div class="pet-card empty"><p style="color:red;">${errMsg}</p></div>`;
            return;
        }

        const pets = data.pets || [];

        if (pets.length === 0) {
            listaContainer.innerHTML = '<div class="pet-card empty"><p>Você ainda não cadastrou nenhum pet.</p></div>';
            return;
        }

        let html = '';
        pets.forEach(pet => {
            let icon = '🐾';
            if (pet.especie && pet.especie.toLowerCase() === 'cachorro') icon = '🐕';
            if (pet.especie && pet.especie.toLowerCase() === 'gato') icon = '🐈';
            const racaTexto = pet.raca || 'SRD';

            html += `
                <div class="pet-card">
                    <div class="pet-icon">${icon}</div>
                    <div class="pet-info">
                        <strong>${pet.nome}</strong>
                        <small>${pet.especie} | ${racaTexto}</small>
                    </div>
                </div>
            `;
        });

        listaContainer.innerHTML = html;

    } catch (error) {
        console.error('Erro de conexão:', error);
        listaContainer.innerHTML = '<div class="pet-card empty"><p style="color:red;">Erro de conexão ao buscar pets.</p></div>';
    }
}

document.addEventListener('DOMContentLoaded', displayPets);