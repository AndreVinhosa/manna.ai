(function() {
    // Configuração do widget
    const WIDGET_CONFIG = {
        apiBaseUrl: 'https://seu-dominio.com/api/faq', // Substitua pela URL do seu servidor
        position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
        theme: {
            primaryColor: '#667eea',
            secondaryColor: '#764ba2'
        }
    };

    // Estilos CSS do widget
    const widgetStyles = `
        #faq-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .faq-toggle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${WIDGET_CONFIG.theme.primaryColor} 0%, ${WIDGET_CONFIG.theme.secondaryColor} 100%);
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            transition: transform 0.2s;
        }

        .faq-toggle:hover {
            transform: scale(1.1);
        }

        .faq-chat {
            position: absolute;
            bottom: 70px;
            right: 0;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            display: none;
            flex-direction: column;
            overflow: hidden;
        }

        .faq-header {
            background: linear-gradient(135deg, ${WIDGET_CONFIG.theme.primaryColor} 0%, ${WIDGET_CONFIG.theme.secondaryColor} 100%);
            color: white;
            padding: 15px;
            text-align: center;
            font-weight: bold;
        }

        .faq-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f8f9fa;
        }

        .message {
            margin-bottom: 15px;
            padding: 10px 15px;
            border-radius: 15px;
            max-width: 80%;
            word-wrap: break-word;
        }

        .message.user {
            background: ${WIDGET_CONFIG.theme.primaryColor};
            color: white;
            margin-left: auto;
            text-align: right;
        }

        .message.bot {
            background: white;
            color: #333;
            border: 1px solid #e2e8f0;
        }

        .faq-input-area {
            padding: 15px;
            border-top: 1px solid #e2e8f0;
            background: white;
        }

        .faq-input {
            width: 100%;
            padding: 10px;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            outline: none;
            font-size: 14px;
            box-sizing: border-box;
        }

        .feedback-buttons {
            margin-top: 10px;
            display: flex;
            gap: 10px;
        }

        .feedback-btn {
            padding: 5px 15px;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s;
        }

        .feedback-btn.like {
            background: #48bb78;
            color: white;
        }

        .feedback-btn.dislike {
            background: #f56565;
            color: white;
        }

        .human-support-btn {
            background: #ed8936;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 15px;
            cursor: pointer;
            font-size: 12px;
            margin-top: 10px;
        }

        @media (max-width: 768px) {
            .faq-chat {
                width: 300px;
                height: 400px;
            }
        }
    `;

    // HTML do widget
    const widgetHTML = `
        <div id="faq-widget">
            <button class="faq-toggle" onclick="window.FAQWidget.toggle()">💬</button>
            <div class="faq-chat" id="faq-chat" style="display: none;">
                <div class="faq-header">
                    FAQ - Assistente Virtual
                </div>
                <div class="faq-messages" id="faq-messages">
                    <div class="message bot">
                        Olá! 👋 Sou seu assistente virtual. Como posso ajudá-lo hoje?
                    </div>
                </div>
                <div class="faq-input-area">
                    <input type="text" class="faq-input" id="faq-input" placeholder="Digite sua pergunta..." onkeypress="window.FAQWidget.handleKeyPress(event)">
                </div>
            </div>
        </div>
    `;

    // Classe principal do widget
    class FAQWidget {
        constructor() {
            this.chatOpen = false;
            this.currentMessageId = 0;
            this.init();
        }

        init() {
            // Adicionar estilos
            const styleSheet = document.createElement('style');
            styleSheet.textContent = widgetStyles;
            document.head.appendChild(styleSheet);

            // Adicionar HTML
            document.body.insertAdjacentHTML('beforeend', widgetHTML);

            // Event listeners
            document.addEventListener('click', (event) => {
                const widget = document.getElementById('faq-widget');
                if (this.chatOpen && !widget.contains(event.target)) {
                    this.toggle();
                }
            });
        }

        toggle() {
            const chat = document.getElementById('faq-chat');
            this.chatOpen = !this.chatOpen;
            chat.style.display = this.chatOpen ? 'flex' : 'none';
            
            if (this.chatOpen) {
                document.getElementById('faq-input').focus();
            }
        }

        handleKeyPress(event) {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        }

        async sendMessage() {
            const input = document.getElementById('faq-input');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Add user message
            this.addMessage(message, 'user');
            input.value = '';
            
            // Show typing indicator
            const typingId = this.addMessage('Digitando...', 'bot');
            
            try {
                const response = await fetch(`${WIDGET_CONFIG.apiBaseUrl}/ask`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question: message })
                });
                
                const data = await response.json();
                
                // Remove typing indicator
                document.getElementById(typingId).remove();
                
                // Add bot response
                const messageId = this.addMessage(data.answer, 'bot');
                
                // Add feedback buttons if it's a real answer
                if (data.confidence > 0.3) {
                    this.addFeedbackButtons(messageId, message, data.answer);
                }
                
                // Add human support button if suggested
                if (data.suggest_human) {
                    this.addHumanSupportButton(messageId, message);
                }
                
            } catch (error) {
                // Remove typing indicator
                document.getElementById(typingId).remove();
                this.addMessage('Desculpe, ocorreu um erro. Tente novamente.', 'bot');
            }
        }

        addMessage(text, sender) {
            const messagesContainer = document.getElementById('faq-messages');
            const messageDiv = document.createElement('div');
            const messageId = 'message-' + (++this.currentMessageId);
            
            messageDiv.id = messageId;
            messageDiv.className = `message ${sender}`;
            messageDiv.textContent = text;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            return messageId;
        }

        addFeedbackButtons(messageId, question, answer) {
            const messageElement = document.getElementById(messageId);
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'feedback-buttons';
            
            const likeBtn = document.createElement('button');
            likeBtn.className = 'feedback-btn like';
            likeBtn.textContent = '👍 Útil';
            likeBtn.onclick = () => this.sendFeedback(question, answer, 'like', feedbackDiv);
            
            const dislikeBtn = document.createElement('button');
            dislikeBtn.className = 'feedback-btn dislike';
            dislikeBtn.textContent = '👎 Não útil';
            dislikeBtn.onclick = () => this.sendFeedback(question, answer, 'dislike', feedbackDiv);
            
            feedbackDiv.appendChild(likeBtn);
            feedbackDiv.appendChild(dislikeBtn);
            messageElement.appendChild(feedbackDiv);
        }

        addHumanSupportButton(messageId, question) {
            const messageElement = document.getElementById(messageId);
            const supportBtn = document.createElement('button');
            supportBtn.className = 'human-support-btn';
            supportBtn.textContent = '👨‍💼 Falar com atendente';
            supportBtn.onclick = () => this.requestHumanSupport(question, supportBtn);
            
            messageElement.appendChild(supportBtn);
        }

        async sendFeedback(question, answer, feedback, buttonContainer) {
            try {
                await fetch(`${WIDGET_CONFIG.apiBaseUrl}/feedback`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ question, answer, feedback })
                });
                
                buttonContainer.innerHTML = '<span style="color: #48bb78;">✓ Obrigado pelo feedback!</span>';
            } catch (error) {
                console.error('Erro ao enviar feedback:', error);
            }
        }

        async requestHumanSupport(question, button) {
            try {
                const response = await fetch(`${WIDGET_CONFIG.apiBaseUrl}/human-support`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        question,
                        user_info: {
                            timestamp: new Date().toISOString(),
                            page: window.location.href
                        }
                    })
                });
                
                const data = await response.json();
                button.innerHTML = '✓ Solicitação enviada';
                button.disabled = true;
                
                this.addMessage(data.message, 'bot');
            } catch (error) {
                console.error('Erro ao solicitar atendimento humano:', error);
                this.addMessage('Erro ao solicitar atendimento. Tente novamente.', 'bot');
            }
        }
    }

    // Inicializar widget quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.FAQWidget = new FAQWidget();
