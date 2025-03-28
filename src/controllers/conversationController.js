/**
 * Controlador para as rotas de gestão de conversas
 * Gerencia as APIs relacionadas às conversas salvas
 */

const logger = require('../utils/logger');
const conversationService = require('../services/conversationService');

/**
 * Lista todas as conversas disponíveis
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
function listConversations(req, res) {
    try {
        logger.info('Requisição para listar conversas recebida');
        const result = conversationService.listConversations();
        return res.json(result);
    } catch (error) {
        logger.error('Erro ao listar conversas:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Erro ao listar conversas' });
    }
}

/**
 * Obtém o conteúdo de uma conversa específica
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
function getConversation(req, res) {
    try {
        const { userId } = req.params;
        logger.info(`Requisição para visualizar conversa recebida: ${userId}`);

        const content = conversationService.getConversation(userId);

        if (!content) {
            return res.status(404).json({ error: 'Conversa não encontrada' });
        }

        return res.json({
            userId,
            content
        });
    } catch (error) {
        logger.error(`Erro ao recuperar conversa:`, { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Erro ao recuperar conversa' });
    }
}

/**
 * Executa a limpeza manual de conversas antigas
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
function cleanConversations(req, res) {
    try {
        logger.info('Requisição para limpeza manual de conversas recebida');
        const filesExcluidos = conversationService.cleanOldConversations();
        return res.json({
            message: 'Processo de limpeza de conversas antigas iniciado com sucesso.',
            filesExcluidos
        });
    } catch (error) {
        logger.error('Erro ao iniciar limpeza de conversas:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Erro ao iniciar limpeza de conversas' });
    }
}

module.exports = {
    listConversations,
    getConversation,
    cleanConversations
}; 