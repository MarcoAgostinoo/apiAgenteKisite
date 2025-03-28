/**
 * Agente KiSite - Sistema de Atendimento Automático
 * 
 * @author Marco D' Melo <contato@kisite.com.br>
 * @copyright 2024 KiSite - Soluções Digitais
 * @license ISC
 */

/**
 * Arquivo principal que inicializa o servidor e WhatsApp
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const WebSocket = require('ws');
const path = require('path');
const express = require('express');
const logger = require('./utils/logger');
const { SERVER_CONFIG } = require('./config/config');
const conversationService = require('./services/conversationService');
const aiService = require('./services/aiService');
const companyService = require('./services/companyService');

// Cria a aplicação Express
const app = express();

logger.info('Iniciando API Agente KiSite...');

// Configura a limpeza automática de conversas
conversationService.setupCleanupSchedule();

// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para processar JSON
app.use(express.json());

// Rota raiz para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Variável para armazenar o último QR code gerado
let lastQR = null;
let isAuthenticated = false;
let isInitializing = false;

// Inicializa o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'agente-kisite',
        dataPath: path.join(__dirname, '.wwebjs_auth')
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// Array para armazenar conexões WebSocket ativas
let wsConnections = [];

// Função para enviar mensagem para todos os clientes WebSocket
function broadcastToClients(message) {
    wsConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                logger.error('Erro ao enviar mensagem WebSocket:', error);
            }
        }
    });
}

// Inicializa o servidor HTTP
const server = app.listen(SERVER_CONFIG.port, () => {
    logger.info(`Servidor API rodando em http://localhost:${SERVER_CONFIG.port}`);
});

// Inicializa o servidor WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    logger.info('Nova conexão WebSocket estabelecida');
    wsConnections.push(ws);

    // Se já estivermos autenticados, enviamos o status
    if (isAuthenticated) {
        ws.send(JSON.stringify({ type: 'ready' }));
    }
    // Se tivermos um QR code e não estivermos autenticados, enviamos o QR
    else if (lastQR) {
        ws.send(JSON.stringify({ type: 'qr', qr: lastQR }));
    }
    // Se não estiver inicializando, iniciamos o cliente
    else if (!isInitializing) {
        initializeWhatsAppClient();
    }

    ws.on('close', () => {
        logger.info('Conexão WebSocket fechada');
        wsConnections = wsConnections.filter(conn => conn !== ws);
    });
});

client.on('qr', (qr) => {
    // Armazena o último QR code
    lastQR = qr;
    isAuthenticated = false;
    isInitializing = false;
    
    // Exibe QR code no terminal
    qrcode.generate(qr, { small: true });
    logger.info('QR Code gerado - Aguardando escaneamento');

    // Envia QR code para todos os clientes WebSocket conectados
    broadcastToClients({ type: 'qr', qr });
});

client.on('ready', () => {
    logger.info('Cliente WhatsApp está pronto!');
    lastQR = null;
    isAuthenticated = true;
    isInitializing = false;
    broadcastToClients({ type: 'ready' });
});

client.on('authenticated', () => {
    logger.info('WhatsApp autenticado com sucesso!');
    lastQR = null;
    isAuthenticated = true;
    isInitializing = false;
    broadcastToClients({ type: 'authenticated' });
});

client.on('auth_failure', (error) => {
    logger.error('Falha na autenticação do WhatsApp:', error);
    isAuthenticated = false;
    isInitializing = false;
    lastQR = null;
    broadcastToClients({ type: 'auth_failure', error: error.message });
    
    // Aguarda um momento antes de tentar reiniciar
    setTimeout(() => {
        if (!isInitializing) {
            initializeWhatsAppClient();
        }
    }, 5000);
});

client.on('disconnected', (reason) => {
    logger.warn(`Cliente WhatsApp desconectado: ${reason}`);
    isAuthenticated = false;
    isInitializing = false;
    lastQR = null;
    broadcastToClients({ type: 'disconnected', reason });
    
    // Aguarda um momento antes de tentar reiniciar
    setTimeout(() => {
        if (!isInitializing) {
            initializeWhatsAppClient();
        }
    }, 5000);
});

// Escuta mensagens recebidas e processa com o serviço da empresa
client.on('message', async (message) => {
    try {
        logger.info(`Mensagem recebida de ${message.from}: ${message.body.substring(0, 50)}...`);

        // Processa a mensagem usando o serviço da empresa
        const response = await companyService.handleMessage(
            message.body,
            message.from,
            aiService.processMessage
        );

        // Salva a conversa em arquivo
        conversationService.saveConversation(message.from, message.body, response);

        // Envia a resposta
        await message.reply(response);
        logger.debug(`Resposta enviada para ${message.from}`);
    } catch (error) {
        logger.error('Erro ao processar mensagem do WhatsApp:', error);
        try {
            await message.reply('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.');
        } catch (replyError) {
            logger.error('Erro ao enviar mensagem de erro:', replyError);
        }
    }
});

// Função para inicializar o cliente WhatsApp
async function initializeWhatsAppClient() {
    try {
        if (isInitializing) {
            logger.info('Cliente WhatsApp já está inicializando...');
            return;
        }

        isInitializing = true;
        lastQR = null;
        isAuthenticated = false;

        logger.info('Inicializando cliente WhatsApp...');
        broadcastToClients({ type: 'status', message: 'Inicializando cliente WhatsApp...' });

        // Destrói a instância anterior se existir
        if (client.pupPage) {
            await client.destroy();
        }

        // Inicializa o cliente
        await client.initialize();
    } catch (error) {
        logger.error('Erro ao inicializar cliente WhatsApp:', error);
        isInitializing = false;
        broadcastToClients({ type: 'error', error: 'Erro ao inicializar WhatsApp' });
        
        // Aguarda um momento antes de tentar novamente
        setTimeout(() => {
            if (!isInitializing) {
                initializeWhatsAppClient();
            }
        }, 5000);
    }
}

// Rota para forçar reinicialização do cliente WhatsApp
app.post('/api/restart-whatsapp', async (req, res) => {
    try {
        if (!isInitializing) {
            await initializeWhatsAppClient();
            res.json({ success: true, message: 'Cliente WhatsApp está sendo reiniciado' });
        } else {
            res.json({ success: false, message: 'Cliente WhatsApp já está inicializando' });
        }
    } catch (error) {
        logger.error('Erro ao reiniciar cliente WhatsApp:', error);
        res.status(500).json({ success: false, error: 'Erro ao reiniciar WhatsApp' });
    }
});

// Inicializa o cliente WhatsApp
initializeWhatsAppClient().catch(err => {
    logger.error('Erro na inicialização inicial do WhatsApp:', err);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    logger.error('Exceção não capturada:', error);
    broadcastToClients({ type: 'error', error: 'Erro interno do servidor' });
});

process.on('unhandledRejection', (error) => {
    logger.error('Promessa rejeitada não tratada:', error);
    broadcastToClients({ type: 'error', error: 'Erro interno do servidor' });
});

// Rota para interagir com a IA
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.headers['x-user-id'] || 'web-user'; // Identificador do usuário

        if (!message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Mensagem não fornecida' 
            });
        }

        logger.info(`Recebida mensagem para IA de ${userId}: ${message.substring(0, 50)}...`);
        
        // Processa a mensagem usando o serviço de IA
        const response = await aiService.processMessage(message, userId);
        
        // Salva a conversa
        conversationService.saveConversation(userId, message, response);
        
        res.json({
            success: true,
            message: response,
            history: aiService.getHistory(userId)
        });
    } catch (error) {
        logger.error('Erro ao processar mensagem:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao processar mensagem' 
        });
    }
});

// Rota para limpar o histórico de conversa
app.post('/api/chat/clear', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 'web-user';
        aiService.clearHistory(userId);
        res.json({ 
            success: true, 
            message: 'Histórico limpo com sucesso' 
        });
    } catch (error) {
        logger.error('Erro ao limpar histórico:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao limpar histórico' 
        });
    }
});

module.exports = { app, client, server }; 