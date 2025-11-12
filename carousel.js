document.addEventListener('DOMContentLoaded', () => {

    // Seleciona os elementos do carrossel
    const slide = document.querySelector('.carousel-slide');
    
    // Se não houver carrossel nesta página, não faz nada
    if (!slide) return;

    const images = document.querySelectorAll('.carousel-slide img');
    const prevBtn = document.querySelector('.carousel-button.prev');
    const nextBtn = document.querySelector('.carousel-button.next');

    // Contador para saber qual slide está ativo
    let counter = 0;
    const imageCount = images.length;
    // O tamanho de cada "passo" do carrossel
    // Usamos 100 / imageCount para saber a % de cada imagem
    const slideWidthPercent = 100 / imageCount;

    // Função para mover o slide
    function moveToSlide(slideIndex) {
        // Move o container flex (slide) para a esquerda
        slide.style.transform = `translateX(-${slideIndex * slideWidthPercent}%)`;
        
        // Atualiza o estado dos botões
        checkButtons(slideIndex);
    }

    // Função para habilitar/desabilitar botões
    function checkButtons(index) {
        // Se está no primeiro slide (0), desabilita "Anterior"
        prevBtn.disabled = (index === 0);
        
        // Se está no último slide, desabilita "Próximo"
        nextBtn.disabled = (index === imageCount - 1);
    }

    // --- Event Listeners (Ouvintes de Clique) ---

    // Botão "Próximo"
    nextBtn.addEventListener('click', () => {
        if (counter < imageCount - 1) {
            counter++;
            moveToSlide(counter);
        }
    });

    // Botão "Anterior"
    prevBtn.addEventListener('click', () => {
        if (counter > 0) {
            counter--;
            moveToSlide(counter);
        }
    });

    // Inicia o carrossel na posição correta
    moveToSlide(0);
});