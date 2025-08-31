# Arquitetura do Agente de FAQ

## Visão Geral

O agente de FAQ será composto por um backend e um frontend (widget de chat).

### Backend

-   **Linguagem:** Python com Flask
-   **Funcionalidades:**
    -   Servir o widget de chat (HTML, CSS, JS).
    -   Receber perguntas do widget.
    -   Processar as perguntas e encontrar a resposta mais relevante no arquivo `faq_data.json`.
    -   Registrar as interações, incluindo as perguntas não respondidas e o feedback dos usuários.
    -   Fornecer um endpoint para o "atendimento humano", que poderá ser integrado com um sistema de tickets ou um chat ao vivo.

### Frontend (Widget de Chat)

-   **Tecnologias:** HTML, CSS, JavaScript
-   **Funcionalidades:**
    -   Interface de chat para o usuário digitar as perguntas.
    -   Exibição das respostas fornecidas pelo backend.
    -   Botão para solicitar "atendimento humano".
    -   Botões de "gostei/não gostei" para coletar feedback sobre as respostas.
    -   O widget será carregado no site do cliente através de um script de incorporação (embed script).

## Fluxo de Dados

1.  O usuário clica no ícone do widget no site.
2.  O widget é aberto e exibe uma mensagem de boas-vindas.
3.  O usuário digita uma pergunta e a envia.
4.  O JavaScript do widget envia a pergunta para o backend (API Flask).
5.  O backend busca a resposta no `faq_data.json`.
6.  O backend retorna a resposta para o widget.
7.  O widget exibe a resposta para o usuário.
8.  O usuário pode dar um feedback ("gostei/não gostei") ou clicar no botão de "atendimento humano".
9.  As ações do usuário (feedback, pedido de atendimento humano) são enviadas para o backend e registradas.


