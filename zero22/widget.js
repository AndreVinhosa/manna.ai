(function() {
  'use strict';

  // Configurações padrão do widget
  const defaultConfig = {
    position: 'bottom-right',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    apiUrl: 'https://manna-ai.vercel.app/api',
    companyName: 'Manna Bridge',
    welcomeMessage: 'Olá! Como posso ajudá-lo hoje? Escolha uma das perguntas frequentes abaixo ou solicite atendimento humano.',
    faqs: [
      {
        question: 'O que é a Manna Bridge?',
        answer: 'A Manna Bridge é uma plataforma inovadora que conecta empresas e profissionais através de soluções inteligentes de comunicação e atendimento.'
      },
      {
        question: 'Como me cadastrar?',
        answer: 'Para se cadastrar, acesse nosso site oficial e clique em "Cadastrar". Preencha seus dados e siga as instruções enviadas por email.'
      },
      {
        question: 'Quais são os planos disponíveis?',
        answer: 'Oferecemos planos Básico, Profissional e Empresarial. Cada plano tem funcionalidades específicas para diferentes necessidades.'
      },
      {
        question: 'Como entrar em contato?',
        answer: 'Você pode entrar em contato através do nosso chat, email ou telefone. Nossa equipe está sempre pronta para ajudar!'
      }
    ]
  };

  // Classe principal do widget
  class MannaWidget {
    constructor(config = {}) {
      this.config = { ...defaultConfig, ...config };
      this.isOpen = false;
      this.currentFaq = null;
      this.init();
    }

    init() {
      this.loadStyles();
      this.createWidget();
      this.bindEvents();
    }

    loadStyles() {
      if (document.getElementById('manna-widget-styles')) return;
      
      const link = document.createElement('link');
      link.id = 'manna-widget-styles';
      link.rel = 'stylesheet';
      link.href = 'https://manna-ai.vercel.app/widget.css';
      document.head.appendChild(link);
    }

    createWidget() {
      // Criar overlay
      this.overlay = document.createElement('div');
      this.overlay.className = 'manna-overlay';
      this.overlay.onclick = () => this.closeChat();

      // Criar botão flutuante
      this.button = document.createElement('button');
      this.button.className = 'manna-chat-button';
      this.button.innerHTML = '💬';
      this.button.setAttribute('aria-label', 'Abrir chat de atendimento');
      this.button.onclick = () => this.toggleChat();

      // Criar modal do chat
      this.modal = document.createElement('div');
      this.modal.className = 'manna-chat-modal';
      this.modal.innerHTML = this.getModalHTML();

      // Adicionar ao DOM
      document.body.appendChild(this.overlay);
      document.body.appendChild(this.button);
      document.body.appendChild(this.modal);

      // Bind eventos do modal
      this.bindModalEvents();
    }

    getModalHTML() {
      return `
        <div class="manna-chat-header">
          <div class="manna-chat-title">
            🤖 ${this.config.companyName}
          </div>
          <button class="manna-close-btn" aria-label="Fechar chat">×</button>
        </div>
        <div class="manna-chat-content">
          <div class="manna-welcome-message">
            ${this.config.welcomeMessage}
          </div>
          <div class="manna-faq-section">
            <div class="manna-faq-title">Perguntas Frequentes:</div>
            ${this.config.faqs.map((faq, index) => `
              <div class="manna-faq-item" data-faq-index="${index}">
                ${faq.question}
              </div>
              <div class="manna-faq-answer" id="faq-answer-${index}">
                ${faq.answer}
                <div class="manna-feedback">
                  Esta resposta foi útil?
                  <button class="manna-feedback-btn" data-feedback="positive" data-faq="${index}">👍</button>
                  <button class="manna-feedback-btn" data-feedback="negative" data-faq="${index}">👎</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="manna-action-buttons">
          <button class="manna-btn manna-btn-secondary" onclick="mannaWidget.requestHumanSupport()">
            👥 Atendimento Humano
          </button>
          <button class="manna-btn manna-btn-primary" onclick="mannaWidget.closeChat()">
            Fechar
          </button>
        </div>
      `;
    }

    bindEvents() {
      // Eventos de teclado para acessibilidade
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeChat();
        }
      });

      // Eventos de redimensionamento
      window.addEventListener('resize', () => {
        this.handleResize();
      });
    }

    bindModalEvents() {
      // Botão de fechar
      const closeBtn = this.modal.querySelector('.manna-close-btn');
      closeBtn.onclick = () => this.closeChat();

      // FAQ items
      const faqItems = this.modal.querySelectorAll('.manna-faq-item');
      faqItems.forEach(item => {
        item.onclick = () => this.toggleFaq(item.dataset.faqIndex);
      });

      // Feedback buttons
      const feedbackBtns = this.modal.querySelectorAll('.manna-feedback-btn');
      feedbackBtns.forEach(btn => {
        btn.onclick = () => this.submitFeedback(btn.dataset.feedback, btn.dataset.faq);
      });
    }

    toggleChat() {
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    }

    openChat() {
      this.isOpen = true;
      this.button.classList.add('active');
      this.button.innerHTML = '×';
      this.modal.classList.add('show');
      
      if (window.innerWidth <= 480) {
        this.overlay.classList.add('show');
      }

      // Analytics
      this.trackEvent('chat_opened');
    }

    closeChat() {
      this.isOpen = false;
      this.button.classList.remove('active');
      this.button.innerHTML = '💬';
      this.modal.classList.remove('show');
      this.overlay.classList.remove('show');

      // Fechar FAQs abertas
      const openAnswers = this.modal.querySelectorAll('.manna-faq-answer.show');
      openAnswers.forEach(answer => answer.classList.remove('show'));

      // Analytics
      this.trackEvent('chat_closed');
    }

    toggleFaq(index) {
      const answer = document.getElementById(`faq-answer-${index}`);
      const isOpen = answer.classList.contains('show');

      // Fechar outras FAQs
      const allAnswers = this.modal.querySelectorAll('.manna-faq-answer');
      allAnswers.forEach(a => a.classList.remove('show'));

      // Toggle atual
      if (!isOpen) {
        answer.classList.add('show');
        this.currentFaq = index;
        this.trackEvent('faq_opened', { faq_index: index });
      } else {
        this.currentFaq = null;
      }
    }

    submitFeedback(type, faqIndex) {
      // Enviar feedback para analytics
      this.trackEvent('feedback_submitted', {
        type: type,
        faq_index: faqIndex,
        faq_question: this.config.faqs[faqIndex].question
      });

      // Feedback visual
      const feedbackDiv = document.querySelector(`#faq-answer-${faqIndex} .manna-feedback`);
      feedbackDiv.innerHTML = type === 'positive' 
        ? '✅ Obrigado pelo feedback!' 
        : '📝 Obrigado! Vamos melhorar esta resposta.';
    }

    requestHumanSupport() {
      // Simular solicitação de atendimento humano
      alert('Solicitação de atendimento humano enviada! Nossa equipe entrará em contato em breve.');
      this.trackEvent('human_support_requested');
      this.closeChat();
    }

    handleResize() {
      if (window.innerWidth <= 480 && this.isOpen) {
        this.overlay.classList.add('show');
      } else {
        this.overlay.classList.remove('show');
      }
    }

    trackEvent(eventName, data = {}) {
      // Analytics simples - pode ser integrado com Google Analytics, etc.
      if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
          event_category: 'manna_widget',
          ...data
        });
      }
      
      console.log('Manna Widget Event:', eventName, data);
    }
  }

  // Inicializar widget quando DOM estiver pronto
  function initWidget() {
    // Verificar se já existe uma instância
    if (window.mannaWidget) return;

    // Configurações personalizadas via data attributes
    const script = document.querySelector('script[src*="widget.js"]');
    const config = {};
    
    if (script) {
      const dataset = script.dataset;
      if (dataset.position) config.position = dataset.position;
      if (dataset.primaryColor) config.primaryColor = dataset.primaryColor;
      if (dataset.companyName) config.companyName = dataset.companyName;
      if (dataset.welcomeMessage) config.welcomeMessage = dataset.welcomeMessage;
    }

    // Criar instância global
    window.mannaWidget = new MannaWidget(config);
  }

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();

