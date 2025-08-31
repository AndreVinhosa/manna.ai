/**
 * Widget de Chat para Manna Bridge
 * Este script cria um botão flutuante no canto inferior direito da página
 * que, ao ser clicado, exibe um iframe contendo o chat da Manna Bridge.
 */

(function() {
    const WIDGET_URL = 'https://manna-ai.vercel.app/widget.js';
    let isWidgetOpen = false;

    // 1. Criar o botão de toggle
    const toggleButton = document.createElement('button');
    toggleButton.id = 'manna-chat-toggle-button';
    toggleButton.innerHTML = '💬';
    Object.assign(toggleButton.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#6366f1', // Cor primária
        color: 'white',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
    });
    document.body.appendChild(toggleButton);

    // 2. Criar o container do iframe
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'manna-chat-iframe-container';
    Object.assign(iframeContainer.style, {
        position: 'fixed',
        bottom: '90px', // Acima do botão
        right: '20px',
        width: '350px',
        height: '500px',
        border: 'none',
        borderRadius: '10px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: '9999',
        overflow: 'hidden',
        display: 'none', // Escondido por padrão
        transition: 'all 0.3s ease',
    });
    document.body.appendChild(iframeContainer);

    // 3. Criar o iframe
    const chatIframe = document.createElement('iframe');
    chatIframe.src = WIDGET_URL;
    chatIframe.title = 'Manna Bridge Chat Widget';
    chatIframe.frameBorder = '0';
    Object.assign(chatIframe.style, {
        width: '100%',
        height: '100%',
        border: 'none',
    });
    iframeContainer.appendChild(chatIframe);

    // 4. Adicionar evento de clique ao botão
    toggleButton.addEventListener('click', () => {
        isWidgetOpen = !isWidgetOpen;
        if (isWidgetOpen) {
            iframeContainer.style.display = 'block';
            toggleButton.innerHTML = '✕'; // Ícone de fechar
        } else {
            iframeContainer.style.display = 'none';
            toggleButton.innerHTML = '💬'; // Ícone de chat
        }
    });

    // Responsividade básica (opcional, pode ser melhorado com media queries em CSS)
    function applyResponsiveStyles() {
        if (window.innerWidth <= 768) {
            Object.assign(toggleButton.style, {
                width: '50px',
                height: '50px',
                fontSize: '20px',
                bottom: '10px',
                right: '10px',
            });
            Object.assign(iframeContainer.style, {
                width: '300px',
                height: '450px',
                bottom: '70px',
                right: '10px',
            });
        } else {
            Object.assign(toggleButton.style, {
                width: '60px',
                height: '60px',
                fontSize: '24px',
                bottom: '20px',
                right: '20px',
            });
            Object.assign(iframeContainer.style, {
                width: '350px',
                height: '500px',
                bottom: '90px',
                right: '20px',
            });
        }
    }

    // Aplicar estilos responsivos ao carregar e redimensionar
    window.addEventListener('load', applyResponsiveStyles);
    window.addEventListener('resize', applyResponsiveStyles);

    console.log('Manna Bridge Chat Widget script loaded.');
})();
})();
})();

