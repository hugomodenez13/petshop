// Define a URL base da nossa API
// CORREÇÃO: Voltamos para o servidor local
const API_URL = 'http://127.0.0.1:5000/api';

// Remove as duas funções 'salvarLogin' e usa esta:
function salvarLogin(token, nome, isAdmin) {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('nome_usuario', nome);
    localStorage.setItem('is_admin', isAdmin ? '1' : '0'); // Salva '1' ou '0'
}

/**
 * Redireciona para o painel do cliente
 */
function irParaMinhaConta() {
    window.location.href = 'index.html';
}

/**
 * Lida com o formulário de Login
 */
async function handleLoginForm(form, formMessage) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formMessage.textContent = 'Enviando...';

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                formMessage.textContent = data.mensagem;
                formMessage.style.color = 'red';
                return;
            }

            // Sucesso! Salva o token e o nome
            salvarLogin(data.access_token, data.nome_usuario, data.is_admin);
            formMessage.textContent = data.mensagem;
            formMessage.style.color = 'green';
            
            // Redireciona para a conta após 1 segundo
            setTimeout(irParaMinhaConta, 1000);

        } catch (error) {
            formMessage.textContent = 'Erro de conexão com o servidor.';
            formMessage.style.color = 'red';
        }
    });
}

/**
 * Lida com o formulário de Registro
 */
async function handleRegisterForm(form, formMessage) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formMessage.textContent = 'Cadastrando...';

        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const response = await fetch(`${API_URL}/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                formMessage.textContent = data.mensagem;
                formMessage.style.color = 'red';
                return;
            }

            formMessage.textContent = data.mensagem;
            formMessage.style.color = 'green';
            
            // Redireciona para o login após 2 segundos
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            formMessage.textContent = 'Erro de conexão com o servidor.';
            formMessage.style.color = 'red';
        }
    });
}


// --- Lógica Principal ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const formMessage = document.getElementById('form-message');

    if (loginForm) {
        handleLoginForm(loginForm, formMessage);
    }
    
    if (registerForm) {
        handleRegisterForm(registerForm, formMessage);
    }
});