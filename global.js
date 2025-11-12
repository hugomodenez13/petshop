document.addEventListener('DOMContentLoaded', () => {
    
    // Seleciona os elementos que vamos mudar
    const navLinksContainer = document.getElementById('nav-links');
    const heroCtaButton = document.getElementById('hero-cta-button');

    // Verifica se há um token e nome no localStorage
    const token = localStorage.getItem('jwt_token');
    const nomeUsuario = localStorage.getItem('nome_usuario');

    // ----- INÍCIO DA CORREÇÃO -----
    // Só mexe no menu de navegação SE ele existir nesta página
    if (navLinksContainer) { 
        if (token && nomeUsuario) {
            // --- CENÁRIO: USUÁRIO ESTÁ LOGADO ---
            navLinksContainer.innerHTML = `
                <li><a href="index.html#servicos">Serviços</a></li>
                <li><a href="minha-conta.html" class="nav-button-login">Olá, ${nomeUsuario}!</a></li>
                <li><a href="#" id="logout-button">Sair</a></li>
            `;

            // Adiciona a função de "Sair" (Logout)
            const logoutButton = document.getElementById('logout-button');
            if (logoutButton) {
                logoutButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('nome_usuario');
                    window.location.href = 'login.html';
                });
            }

        } else {
            // --- CENÁRIO: USUÁRIO ESTÁ DESLOGADO ---
            navLinksContainer.innerHTML = `
                <li><a href="index.html#servicos">Serviços</a></li>
                <li><a href="index.html#contato">Contato</a></li>
                <li><a href="login.html" class="nav-button-login">Login</a></li>
            `;
        }
    }
    // ----- FIM DA CORREÇÃO DO MENU -----


    // ----- INÍCIO DA CORREÇÃO DO BOTÃO HERO -----
    // Só mexe no botão "Agendar Agora" SE ele existir (só existe na index.html)
    if (heroCtaButton) { 
        if (token && nomeUsuario) {
            // Logado: Botão leva para a conta
            heroCtaButton.textContent = 'Ir para Minha Conta';
            heroCtaButton.href = 'minha-conta.html';
        } else {
            // Deslogado: Botão leva para o login
            heroCtaButton.textContent = 'Agendar Agora';
            heroCtaButton.href = 'login.html';
        }
    }
    // ----- FIM DA CORREÇÃO DO BOTÃO HERO -----
});