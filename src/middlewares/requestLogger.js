/**
 * Middleware para logar todas as requisições
 * Registra informações sobre cada requisição recebida
 */

const logger = require('../utils/logger');

/**
 * Middleware para logar requisições
 */
function requestLogger(req, res, next) {
    // Marca o início da requisição
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);

    // Adiciona o ID da requisição ao objeto de requisição para uso em outros middlewares
    req.requestId = requestId;

    // Log da requisição recebida
    logger.info(`Requisição recebida: ${req.method} ${req.originalUrl}`, {
        requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Intercepta o final da resposta para logar o tempo de processamento
    res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? 'warn' : 'info';

        logger[level](`Requisição concluída: ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`, {
            requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration,
            contentLength: res.get('content-length')
        });
    });

    next();
}

module.exports = requestLogger; 