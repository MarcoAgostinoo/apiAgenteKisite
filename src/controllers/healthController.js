/**
 * Controlador para monitoramento da saúde do sistema
 * Fornece endpoints para verificar o status dos componentes
 */

const { version } = require('../../package.json');
const logger = require('../utils/logger');
const os = require('os');
const axios = require('axios');
const { LM_STUDIO_CONFIG } = require('../config/config');
const { treinamentoDados } = require('../services/companyService');

/**
 * Verifica o status geral do sistema
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function healthCheck(req, res) {
    try {
        logger.info('Verificação de saúde iniciada');

        // Informações básicas sobre o sistema
        const health = {
            status: 'UP',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            uptime: `${Math.floor(process.uptime())} segundos`,
            memory: {
                total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
                used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
            }
        };

        return res.status(200).json(health);
    } catch (error) {
        logger.error('Erro durante verificação de saúde:', { error: error.message, stack: error.stack });
        return res.status(500).json({
            status: 'DOWN',
            error: error.message
        });
    }
}

/**
 * Lista os temas de treinamento disponíveis
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function treinamentoStatus(req, res) {
    try {
        logger.info('Verificação de status do treinamento iniciada');

        // Reúne informações sobre os arquivos de treinamento carregados
        const temas = Object.keys(treinamentoDados);
        const resultado = {
            status: temas.length > 0 ? 'OK' : 'ALERTA',
            mensagem: temas.length > 0
                ? `${temas.length} temas de treinamento carregados com sucesso`
                : 'Nenhum tema de treinamento encontrado',
            temas_disponiveis: temas,
            detalhes: {}
        };

        // Adiciona detalhes sobre cada tema
        for (const tema of temas) {
            if (tema === 'empresa') {
                resultado.detalhes[tema] = {
                    nome: treinamentoDados[tema].nome,
                    campos: Object.keys(treinamentoDados[tema])
                };
            } else if (tema === 'servicos') {
                resultado.detalhes[tema] = {
                    categorias: treinamentoDados[tema].categorias,
                    campos: Object.keys(treinamentoDados[tema])
                };
            } else {
                resultado.detalhes[tema] = {
                    campos: Object.keys(treinamentoDados[tema])
                };
            }
        }

        return res.status(200).json(resultado);
    } catch (error) {
        logger.error('Erro durante verificação de treinamento:', { error: error.message, stack: error.stack });
        return res.status(500).json({
            status: 'ERRO',
            error: error.message
        });
    }
}

module.exports = {
    healthCheck,
    treinamentoStatus
}; 