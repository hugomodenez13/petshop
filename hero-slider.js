document.addEventListener('DOMContentLoaded', () => {
    
    const slider = document.querySelector('.hero-slider');
    
    // Se não houver slider nesta página, não faz nada
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.nav-dot');
    
    let currentSlide = 0;
    const slideInterval = 5000; // Tempo de rotação (5 segundos)

    function showSlide(index) {
        // Para garantir que a transição seja suave
        if (index === currentSlide && slides[index].classList.contains('active')) {
            return;
        }

        // Esconde todos os slides e desativa todos os pontos
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            dots[i].classList.remove('active');
        });

        // Mostra o slide e o ponto corretos
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        // Calcula o próximo slide, voltando ao 0 se for o último
        let newSlide = (currentSlide + 1) % slides.length; 
        showSlide(newSlide);
    }

    // --- Controles ---

    // 1. Clicar nos pontos
    dots.forEach(dot => {
        
        // ****** ESTA É A LINHA CORRIGIDA ******
        dot.addEventListener('click', () => { 
        // ****** ANTES ESTAVA: ().svg { *******

            // Pega o número do 'data-slide' que colocamos no HTML
            showSlide(parseInt(dot.dataset.slide)); 
        });
    });

    // 2. Inicia o carrossel automático
    let autoSlideTimer = setInterval(nextSlide, slideInterval);

    // 3. (Opcional) Pausa o slider quando o mouse está sobre ele
    slider.addEventListener('mouseenter', () => {
        clearInterval(autoSlideTimer); // Para o timer
    });

    // 4. (Opcional) Retoma o slider quando o mouse sai
    slider.addEventListener('mouseleave', () => {
        autoSlideTimer = setInterval(nextSlide, slideInterval); // Recomeça
    });

    // Mostra o primeiro slide (slide 0) assim que a página carrega
    showSlide(0);
});