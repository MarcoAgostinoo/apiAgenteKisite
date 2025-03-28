/**
 * Controlador para monitoramento e healthcheck
 * Fornece endpoints para verificar status do sistema
 */

const { version } = require('../../package.json');
const logger = require('../utils/logger');
const os = require('os');
const axios = require('axios');
const { LM_STUDIO_CONFIG } = require('../config/config');

/**
 * Retorna informações básicas sobre o estado do sistema
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function healthCheck(req, res) {
    try {
        logger.debug('Requisição de healthcheck recebida');

        // Informações do sistema
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const systemInfo = {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            cpus: os.cpus().length,
            totalMemory: Math.round(os.totalmem() / (1024 * 1024)) + 'MB',
            freeMemory: Math.round(os.freemem() / (1024 * 1024)) + 'MB'
        };

        // Verifica se o LM Studio está acessível
        let lmStudioStatus = 'unknown';
        try {
            // Timeout curto para não bloquear a resposta
            await axios.get(LM_STUDIO_CONFIG.apiUrl.split('/api')[0], { timeout: 2000 });
            lmStudioStatus = 'online';
        } catch (error) {
            lmStudioStatus = 'offline';
            logger.warn('LM Studio parece estar offline');
        }

        return res.json({
            status: 'ok',
            version,
            uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
            memory: {
                rss: Math.round(memoryUsage.rss / (1024 * 1024)) + 'MB',
                heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)) + 'MB',
                heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)) + 'MB'
            },
            system: systemInfo,
            dependencies: {
                lmStudio: lmStudioStatus
            }
        });
    } catch (error) {
        logger.error('Erro ao executar healthcheck:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Erro ao executar healthcheck' });
    }
}

module.exports = {
    healthCheck
}; 