/**
 * Sistema de logs estruturados
 * Usa Winston para criar logs mais organizados e consistentes
 */

const winston = require('winston');
const fs = require('fs');
const path = require('path');
const { LOG_CONFIG } = require('../config/config');

// Garante que o diretório de logs existe
const logDir = LOG_CONFIG.directory;
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Configuração de formatos
const { combine, timestamp, printf, colorize, json } = winston.format;

// Formato personalizado para console
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
    return `[${timestamp}] ${level}: ${message} ${
        Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : ''
    }`;
});

// Cria o logger
const logger = winston.createLogger({
    level: LOG_CONFIG.level,
    format: combine(
        timestamp(),
        json()
    ),
    defaultMeta: { service: 'kisite-api' },
    transports: [
        // Arquivo para todos os logs
        new winston.transports.File({ 
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Arquivo separado para erros
        new winston.transports.File({ 
            filename: path.join(logDir, 'error.log'), 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
    ],
    // Não quebra em caso de erro no log
    exitOnError: false
});

// Se não estiver em produção, adiciona console colorido
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp(),
            consoleFormat
        )
    }));
}

module.exports = logger; 