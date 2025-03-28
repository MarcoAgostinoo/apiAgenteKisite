/**
 * Arquivo de configuração do sistema
 * Centraliza todas as configurações para fácil manutenção
 */

// Importa dotenv para variáveis de ambiente
require('dotenv').config();

// Configurações do servidor
const SERVER_CONFIG = {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development'
};

// Configurações da API do LM Studio
const LM_STUDIO_CONFIG = {
    apiUrl: process.env.LM_STUDIO_API_URL || 'http://172.16.0.95:4152/api/v0/chat/completions',
    model: process.env.LM_STUDIO_MODEL || 'gemma-3-1b-it',
    temperature: 0.7,
    maxTokens: 500
};

// Configurações de armazenamento
const STORAGE_CONFIG = {
    conversationsDir: process.env.CONVERSATIONS_DIR || 'conversas',
    maxAgeDays: process.env.MAX_CONVERSATION_AGE_DAYS || 60
};

// Configurações de logs
const LOG_CONFIG = {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIR || 'logs'
};

module.exports = {
    SERVER_CONFIG,
    LM_STUDIO_CONFIG,
    STORAGE_CONFIG,
    LOG_CONFIG
}; 