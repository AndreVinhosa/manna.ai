# Guia de Integração - Widget de FAQ

## Visão Geral

Este widget de FAQ permite que você adicione um assistente virtual inteligente ao seu site com apenas algumas linhas de código. O widget oferece:

- ✅ Respostas automáticas baseadas em similaridade de texto
- ✅ Sistema de feedback dos usuários
- ✅ Solicitação de atendimento humano
- ✅ Interface responsiva e moderna
- ✅ Fácil personalização

## Como Integrar

### Opção 1: Integração Simples (Recomendada)

Adicione o seguinte código antes do fechamento da tag `</body>` do seu site:

```html
<script>
(function() {
    var script = document.createElement('script');
    script.src = 'https://seu-dominio.com/widget.js';
    script.async = true;
    document.head.appendChild(script);
})();
</script>
```

### Opção 2: Integração Direta

Se preferir hospedar o arquivo localmente, baixe o arquivo `widget.js` e inclua:

```html
<script src="/caminho/para/widget.js"></script>
```

## Configuração do Backend

### 1. Deploy do Backend

O backend foi desenvolvido em Flask e pode ser implantado de várias formas:

#### Deploy Local
```bash
cd faq_agent
source venv/bin/activate
python src/main.py
```

#### Deploy em Produção
- Use um servidor WSGI como Gunicorn
- Configure um proxy reverso (Nginx)
- Certifique-se de que o CORS está habilitado

### 2. Configuração da URL da API

No arquivo `widget.js`, altere a linha:

```javascript
apiBaseUrl: 'https://seu-dominio.com/api/faq'
```

Para a URL onde seu backend está hospedado.

## Personalização

### Cores e Tema

No arquivo `widget.js`, você pode personalizar as cores alterando:

```javascript
const WIDGET_CONFIG = {
    theme: {
        primaryColor: '#667eea',    // Cor principal
        secondaryColor: '#764ba2'   // Cor secundária
    }
};
```

### Posição do Widget

Altere a posição do widget modificando o CSS ou a configuração:

```javascript
position: 'bottom-right' // bottom-right, bottom-left, top-right, top-left
```

### Mensagem de Boas-vindas

Edite a mensagem inicial no HTML do widget:

```javascript
<div class="message bot">
    Sua mensagem personalizada aqui!
</div>
```

## Estrutura de Arquivos

```
faq_agent/
├── src/
│   ├── main.py              # Aplicação Flask principal
│   ├── routes/
│   │   ├── faq.py          # Rotas do FAQ
│   │   └── user.py         # Rotas de usuário (template)
│   ├── static/
│   │   └── index.html      # Página de demonstração
│   ├── faq_data.json       # Dados do FAQ
│   └── database/
│       └── app.db          # Banco de dados SQLite
├── venv/                   # Ambiente virtual Python
├── requirements.txt        # Dependências Python
└── widget.js              # Widget JavaScript standalone
```

## API Endpoints

### POST /api/faq/ask
Processa perguntas dos usuários.

**Request:**
```json
{
    "question": "O que é a Manna Bridge?"
}
```

**Response:**
```json
{
    "answer": "A Manna Bridge é uma plataforma...",
    "question": "O que é a Manna Bridge?",
    "section": "Sobre a Manna Bridge",
    "confidence": 0.95
}
```

### POST /api/faq/feedback
Recebe feedback dos usuários.

**Request:**
```json
{
    "question": "Pergunta original",
    "answer": "Resposta fornecida",
    "feedback": "like" // ou "dislike"
}
```

### POST /api/faq/human-support
Solicita atendimento humano.

**Request:**
```json
{
    "question": "Pergunta do usuário",
    "user_info": {
        "timestamp": "2025-08-31T00:00:00Z",
        "page": "https://exemplo.com/pagina"
    }
}
```

## Adicionando Novas Perguntas

Para adicionar novas perguntas ao FAQ:

1. Edite o arquivo `src/faq_data.json`
2. Adicione novos objetos no formato:

```json
{
    "section": "Nome da Seção",
    "question": "Sua pergunta aqui?",
    "answer": "Sua resposta detalhada aqui."
}
```

3. Reinicie o servidor Flask

## Solução de Problemas

### Widget não aparece
- Verifique se o arquivo `widget.js` está acessível
- Confirme se não há erros no console do navegador
- Certifique-se de que o JavaScript está habilitado

### Respostas não funcionam
- Verifique se o backend está rodando
- Confirme a URL da API no arquivo `widget.js`
- Verifique se o CORS está configurado corretamente

### Problemas de CORS
Adicione as seguintes configurações no Flask:

```python
from flask_cors import CORS
CORS(app, origins=["https://seu-site.com"])
```

## Suporte

Para suporte técnico ou dúvidas sobre a integração, consulte:

1. Os logs do servidor Flask
2. O console do navegador para erros JavaScript
3. A documentação da API acima

## Próximas Melhorias

- [ ] Integração com sistemas de tickets
- [ ] Histórico de conversas
- [ ] Análise de sentimentos
- [ ] Suporte a múltiplos idiomas
- [ ] Dashboard de analytics

