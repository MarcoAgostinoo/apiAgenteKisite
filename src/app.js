/**
 * Agente KiSite - Sistema de Atendimento Automático
 * 
 * @author Marco D' Melo <contato@kisite.com.br>
 * @copyright 2024 KiSite - Soluções Digitais
 * @license ISC
 */

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

// Configuração do CORS
const corsOptions = {
    origin: [
        'https://www.kisite.com.br',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // Cache preflight por 10 minutos
    credentials: true // Permite credenciais (cookies, headers de autorização)
};
app.use(cors(corsOptions));

// Adiciona headers de segurança personalizados
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

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

// Exemplo de como consumir a API
const API_URL = 'https://seu-backend.com/api'; // Substitua pela sua URL

async function callApi() {
    try {
        const response = await fetch(`${API_URL}/seu-endpoint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                // seus dados aqui
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao chamar API:', error);
    }
}

module.exports = app; 