/**
 * Configuração da aplicação Express
 * Define os middlewares e configurações gerais
 */

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const { SERVER_CONFIG } = require('./config/config');

// Cria a aplicação Express
const app = express();

// Adiciona middlewares de segurança e utilitários
app.use(helmet()); // Protege contra vulnerabilidades comuns
app.use(cors()); // Permite solicitações cross-origin
app.use(bodyParser.json()); // Processa corpos de requisição JSON
app.use(bodyParser.urlencoded({ extended: true })); // Processa corpos de formulários

// Adiciona o logger de requisições
app.use(requestLogger);

// Define o prefixo para todas as rotas da API
app.use('/api', routes);

// Rota de fallback para endpoints inexistentes
app.use('*', (req, res) => {
    logger.warn(`Rota não encontrada: ${req.originalUrl}`);
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Adiciona o tratamento de erros
app.use(errorHandler);

// Tratamento de erro não capturado
process.on('uncaughtException', (error) => {
    logger.error('Exceção não capturada:', { error: error.message, stack: error.stack });
    // Encerra o processo com atraso para permitir que o log seja escrito
    setTimeout(() => process.exit(1), 1000);
});

// Tratamento de rejeição não tratada
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Rejeição não tratada:', { reason, stack: reason.stack });
    // Não encerra o processo, apenas loga
});

module.exports = app; 