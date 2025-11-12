document.addEventListener("DOMContentLoaded", async function() {
    const bookingForm = document.getElementById("booking-form");
    const formMessage = document.getElementById("form-message");
    const dateInput = document.getElementById("date");
    const ownerNameInput = document.getElementById("owner-name");
    const petSelect = document.getElementById("pet-select");

    const token = localStorage.getItem('jwt_token');
    const nomeUsuario = localStorage.getItem('nome_usuario');

    if (!bookingForm) return;

    if (!token) {
        alert('Você precisa estar logado para agendar.');
        window.location.href = 'login.html';
        return;
    }

    // Mostra o nome do usuário logado
    if (ownerNameInput && nomeUsuario) {
        ownerNameInput.value = nomeUsuario;
    }

    // --- Buscar pets do usuário logado ---
    try {
        const resposta = await fetch('http://127.0.0.1:5000/api/meus-pets', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await resposta.json();
        console.log("Resposta /meus-pets:", data);

        // A API retorna { sucesso: true, pets: [...] }
        if (data.sucesso && Array.isArray(data.pets)) {
            petSelect.innerHTML = '';
            if (data.pets.length === 0) {
                petSelect.innerHTML = '<option value="">Nenhum pet cadastrado</option>';
            } else {
                data.pets.forEach(pet => {
                    const opt = document.createElement('option');
                    opt.value = pet.id;
                    opt.textContent = pet.nome;
                    petSelect.appendChild(opt);
                });
            }
        } else {
            petSelect.innerHTML = '<option value="">Erro ao carregar pets</option>';
        }

    } catch (err) {
        console.error('Erro ao carregar pets:', err);
        petSelect.innerHTML = '<option value="">Erro ao conectar</option>';
    }

    // Impede datas passadas
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    // --- Enviar agendamento ---
    bookingForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const formData = {
            pet_id: document.getElementById("pet-select").value,
            servico: document.getElementById("service").value,
            data: document.getElementById("date").value,
            hora: document.getElementById("time").value,
            telefone: document.getElementById("phone").value
        };

        formMessage.textContent = "Verificando disponibilidade...";
        formMessage.style.color = "blue";

        try {
            const response = await fetch('http://127.0.0.1:5000/api/agendar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const resultado = await response.json();
            console.log("Resposta do servidor:", resultado);

            if (!response.ok) {
                formMessage.textContent = resultado.mensagem || "Erro no agendamento.";
                formMessage.style.color = "red";
            } else {
                formMessage.textContent = resultado.mensagem || "Agendamento realizado!";
                formMessage.style.color = "green";
                bookingForm.reset();
            }
        } catch (error) {
            console.error(error);
            formMessage.textContent = "Erro de conexão com o servidor.";
            formMessage.style.color = "red";
        }
    });
});