const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

// Inicializa o servidor Express
const app = express();
const PORT = 3000;

// Middleware para processar JSON
app.use(bodyParser.json());

// Objeto para armazenar o histórico de conversas
const conversationHistory = {};

// Função para processar mensagens usando LM Studio com histórico
async function processMessage(text, userId) {
    try {
        // Inicializa o histórico do usuário, se não existir
        if (!conversationHistory[userId]) {
            conversationHistory[userId] = [];
        }

        // Adiciona a mensagem do usuário ao histórico
        conversationHistory[userId].push({ role: "user", content: text });

        // Limita o histórico para as últimas 10 interações
        if (conversationHistory[userId].length > 10) {
            conversationHistory[userId].shift();
        }

        const response = await axios.post('http://192.168.1.113:1234/api/v0/chat/completions', {
            model: "qwen2.5-coder-3b-instruct",
            messages: [
                { role: "system", content: "Responda de forma natural e amigável, mantendo o contexto da conversa." },
                ...conversationHistory[userId] // Envia o histórico completo do usuário
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        let reply = response.data.choices[0].message.content;

        // Remove qualquer <think>...</think> antes de responder
        reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

        // Adiciona a resposta da IA ao histórico
        conversationHistory[userId].push({ role: "assistant", content: reply });

        console.log(`Resposta gerada para ${userId}: ${reply}`);
        return reply;
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        return 'Desculpe, não consegui processar sua mensagem.';
    }
}

// Rota para testar o processamento de mensagens via API
app.post('/api/chat', async (req, res) => {
    try {
        const { message, userId = 'test-user' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'A mensagem é obrigatória' });
        }
        
        console.log(`Requisição API recebida - Usuário: ${userId}, Mensagem: ${message}`);
        
        const response = await processMessage(message, userId);
        
        return res.json({
            userId,
            message,
            response,
            history: conversationHistory[userId]
        });
    } catch (error) {
        console.error('Erro na API:', error);
        return res.status(500).json({ error: 'Erro ao processar a requisição' });
    }
});

// Inicia o servidor Express - Removendo esta linha daqui
// app.listen(PORT, () => {
//     console.log(`Servidor API rodando em http://localhost:${PORT}`);
// });

// Inicializa o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth() // Salva a sessão localmente
});

// Gera o QR Code no terminal
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Por favor, escaneie o QR code acima para fazer login no WhatsApp');
});

// Quando estiver pronto, exibe uma mensagem e inicia o servidor Express
client.on('ready', () => {
    console.log('Client is ready!');
    
    // Inicia o servidor Express somente após o login no WhatsApp
    app.listen(PORT, () => {
        console.log(`Servidor API rodando em http://localhost:${PORT}`);
    });
});

// Escuta mensagens recebidas
client.on('message', async (message) => {
    console.log(`Mensagem recebida de ${message.from}: ${message.body}`);

    // Processa a mensagem com LM Studio usando o histórico
    const response = await processMessage(message.body, message.from);

    // Responde a mensagem no WhatsApp
    message.reply(response);
});

// Inicializa o cliente
client.initialize();