/**
 * Controlador para as rotas de chat
 * Gerencia as APIs relacionadas ao chat
 */

const logger = require('../utils/logger');
const aiService = require('../services/aiService');
const companyService = require('../services/companyService');
const conversationService = require('../services/conversationService');

/**
 * Processa uma mensagem de chat
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function processChat(req, res) {
    try {
        const { message, userId = 'test-user' } = req.body;

        // Validação básica
        if (!message) {
            logger.warn('Requisição recebida sem mensagem', { userId });
            return res.status(400).json({ error: 'A mensagem é obrigatória' });
        }

        logger.info(`Requisição API recebida - Usuário: ${userId}, Mensagem: ${message.substring(0, 50)}...`);

        // Processa a mensagem
        const response = await companyService.handleMessage(
            message,
            userId,
            aiService.processMessage
        );

        // Salva a conversa
        conversationService.saveConversation(userId, message, response);

        return res.json({
            userId,
            message,
            response,
            history: aiService.getHistory(userId)
        });
    } catch (error) {
        logger.error('Erro no processamento de chat:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Erro ao processar a requisição' });
    }
}

module.exports = {
    processChat
}; 