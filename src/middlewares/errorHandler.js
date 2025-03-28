/**
 * Middleware para tratamento centralizado de erros
 * Captura exceções não tratadas e formata a resposta
 */

const logger = require('../utils/logger');

/**
 * Middleware de tratamento de erros
 */
function errorHandler(err, req, res, next) {
    // Determina o status HTTP
    const statusCode = err.statusCode || 500;

    // Logando o erro
    logger.error('Erro não tratado capturado pelo middleware:', {
        error: err.message,
        stack: err.stack,
        route: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    // Em produção, não retorna detalhes do erro para o cliente
    const isProduction = process.env.NODE_ENV === 'production';

    // Formata a resposta de erro
    const errorResponse = {
        error: isProduction ? 'Ocorreu um erro interno no servidor' : err.message,
        status: statusCode
    };

    // Adiciona o stack trace se não estiver em produção e se existir
    if (!isProduction && err.stack) {
        errorResponse.stack = err.stack.split('\n').map(line => line.trim());
    }

    // Adiciona o código de erro se existir
    if (err.code) {
        errorResponse.code = err.code;
    }

    // Envia a resposta
    res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler; 