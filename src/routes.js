/**
 * Configuração das rotas da API
 * Centraliza todas as rotas disponíveis
 */

const express = require('express');
const chatController = require('./controllers/chatController');
const conversationController = require('./controllers/conversationController');
const healthController = require('./controllers/healthController');
const rateLimiter = require('./middlewares/rateLimiter');

const router = express.Router();

// Aplicar rate limiting em todas as rotas
router.use(rateLimiter);

/**
 * Rota principal de chat
 * Processa mensagens e retorna respostas
 */
router.post('/chat', chatController.processChat);

/**
 * Rotas de gerenciamento de conversas
 * Listagem, consulta e limpeza
 */
router.get('/conversas', conversationController.listConversations);
router.get('/conversas/:userId', conversationController.getConversation);
router.post('/conversas/limpar', conversationController.cleanConversations);

/**
 * Rotas de healthcheck
 * Verifica o status do sistema
 */
router.get('/health', healthController.healthCheck);
router.get('/treinamento', healthController.treinamentoStatus);

module.exports = router; 