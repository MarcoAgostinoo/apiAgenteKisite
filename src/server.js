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
const app = require('./app');
const logger = require('./utils/logger');
const { SERVER_CONFIG } = require('./config/config');
const conversationService = require('./services/conversationService');
const aiService = require('./services/aiService');
const companyService = require('./services/companyService');

logger.info('Iniciando API Agente KiSite...');

// Configura a limpeza automática de conversas
conversationService.setupCleanupSchedule();

// Inicializa o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    logger.info('Por favor, escaneie o QR code acima para fazer login no WhatsApp');
});

client.on('ready', () => {
    logger.info('Cliente WhatsApp está pronto!');

    // Inicia o servidor Express após o WhatsApp estar pronto
    app.listen(SERVER_CONFIG.port, () => {
        logger.info(`Servidor API rodando em http://localhost:${SERVER_CONFIG.port}`);
    });
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
        logger.error('Erro ao processar mensagem do WhatsApp:', {
            error: error.message,
            stack: error.stack,
            from: message.from
        });

        // Tenta enviar uma resposta de erro genérica
        try {
            await message.reply('Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.');
        } catch (replyError) {
            logger.error('Erro ao enviar mensagem de erro:', { error: replyError.message });
        }
    }
});

// Inicializa o cliente WhatsApp
client.initialize();

// Tratamento de erros do WhatsApp
client.on('auth_failure', () => {
    logger.error('Falha na autenticação do WhatsApp');
});

client.on('disconnected', (reason) => {
    logger.warn(`Cliente WhatsApp desconectado: ${reason}`);
});

// Exporta para testes
module.exports = { app, client }; 