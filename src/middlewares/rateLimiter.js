/**
 * Middleware de rate limiting para proteger a API
 * Limita o número de requisições por IP
 */

const logger = require('../utils/logger');

// Armazena contadores por IP
const ipRequestCounts = {};

// Período de tempo para reset (em ms)
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS = 100; // Máximo de requisições por janela de tempo

// Limpa os contadores periodicamente para evitar excesso de memória
setInterval(() => {
    const now = Date.now();
    // Remove IPs com janelas expiradas
    Object.keys(ipRequestCounts).forEach(ip => {
        if (now - ipRequestCounts[ip].resetTime > WINDOW_MS) {
            delete ipRequestCounts[ip];
        }
    });
}, 60000); // Limpa a cada minuto

/**
 * Middleware de rate limiting
 */
function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Inicializa contador para o IP se não existir
    if (!ipRequestCounts[ip]) {
        ipRequestCounts[ip] = {
            count: 0,
            resetTime: now + WINDOW_MS
        };
    }

    // Reinicia contador se o tempo expirou
    if (now > ipRequestCounts[ip].resetTime) {
        ipRequestCounts[ip] = {
            count: 0,
            resetTime: now + WINDOW_MS
        };
    }

    // Incrementa contador
    ipRequestCounts[ip].count++;

    // Define headers
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - ipRequestCounts[ip].count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(ipRequestCounts[ip].resetTime / 1000));

    // Verifica se excedeu o limite
    if (ipRequestCounts[ip].count > MAX_REQUESTS) {
        logger.warn(`Rate limit excedido para IP: ${ip}`);
        return res.status(429).json({
            error: 'Você excedeu o limite de requisições. Por favor, tente novamente mais tarde.',
            retryAfter: Math.ceil((ipRequestCounts[ip].resetTime - now) / 1000)
        });
    }

    next();
}

module.exports = rateLimiter; 