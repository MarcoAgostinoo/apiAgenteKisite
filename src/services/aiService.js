/**
 * Serviço para processamento de mensagens com IA
 * Responsável pela comunicação com o LM Studio
 */

const axios = require('axios');
const { LM_STUDIO_CONFIG } = require('../config/config');
const logger = require('../utils/logger');
const { treinamentoDados } = require('./companyService');

// Objeto para armazenar o histórico de conversas em memória
const conversationHistory = {};

/**
 * Processa uma mensagem usando LM Studio
 * @param {string} text - Texto da mensagem do usuário
 * @param {string} userId - ID do usuário
 * @returns {Promise<string>} Resposta gerada pelo modelo
 */
async function processMessage(text, userId) {
    try {
        // Inicializa o histórico de conversa se não existir
        if (!conversationHistory[userId]) {
            conversationHistory[userId] = [];
        }
        
        // Adiciona a mensagem do usuário ao histórico
        conversationHistory[userId].push({ role: "user", content: text });
        
        // Limita o tamanho do histórico
        if (conversationHistory[userId].length > 10) {
            conversationHistory[userId].shift();
        }
        
        logger.debug(`Enviando mensagem para processamento: ${text.substring(0, 50)}...`, { userId });
        
        // Prepara informações da empresa baseadas nos arquivos de treinamento
        let informacoesEmpresa = "Você é um assistente virtual da KiSite";

        // Adiciona informações sobre a empresa
        if (treinamentoDados.empresa) {
            informacoesEmpresa += `, ${treinamentoDados.empresa.sobre} `;
            if (treinamentoDados.empresa.estatistica_mercado) {
                informacoesEmpresa += `${treinamentoDados.empresa.estatistica_mercado}. `;
            }
        } else {
            informacoesEmpresa += ", uma empresa que oferece criação de websites em 7 dias e soluções de IA para atendimento. ";
        }

        // Adiciona informações sobre serviços
        if (treinamentoDados.servicos?.categorias) {
            informacoesEmpresa += `A KiSite oferece os seguintes serviços principais: ${treinamentoDados.servicos.categorias.join(", ")}. `;
            informacoesEmpresa += `${treinamentoDados.servicos.descricao_geral} `;
        } else {
            informacoesEmpresa += "A KiSite se especializa em desenvolvimento web, agentes inteligentes com IA e otimização SEO para pequenas e médias empresas. ";
        }

        // Adiciona informações sobre o Site Essencial
        if (treinamentoDados.site_essencial) {
            informacoesEmpresa += `Nosso produto Site Essencial custa ${treinamentoDados.site_essencial.preco} e é ${treinamentoDados.site_essencial.descricao}. `;
            informacoesEmpresa += `Entregamos em ${treinamentoDados.site_essencial.prazo_entrega}. `;
        } else {
            informacoesEmpresa += "Nosso site principal custa R$897 e é entregue em 7 dias. ";
        }

        // Adiciona informações sobre o Agente Inteligente
        if (treinamentoDados.agente_inteligente) {
            informacoesEmpresa += `Nosso Agente Inteligente é ${treinamentoDados.agente_inteligente.descricao} `;
            if (treinamentoDados.agente_inteligente.preco?.valor) {
                informacoesEmpresa += `Valor: ${treinamentoDados.agente_inteligente.preco.valor}. `;
            }
        }

        // Adiciona informações sobre Integração Estratégica
        if (treinamentoDados.integracao_estrategica) {
            informacoesEmpresa += `Nossa solução completa é a Integração Estratégica: ${treinamentoDados.integracao_estrategica.descricao} `;
            informacoesEmpresa += `${treinamentoDados.integracao_estrategica.resultado_esperado} `;
        }

        // Adiciona estatísticas importantes
        if (treinamentoDados.estatisticas?.resultados_clientes) {
            informacoesEmpresa += `${treinamentoDados.estatisticas.resultados_clientes.aumento_leads} `;
            informacoesEmpresa += `${treinamentoDados.estatisticas.resultados_clientes.taxa_conversao} `;
        }

        // Instruções de comportamento
        informacoesEmpresa += "Responda de forma natural e amigável, mantendo o contexto da conversa. Seja sempre cordial e profissional. ";
        informacoesEmpresa += "Use linguagem persuasiva para destacar os benefícios dos nossos serviços. ";
        informacoesEmpresa += "Encaminhe o cliente para uma consultoria gratuita quando ele demonstrar interesse concreto.";
        
        // Faz a requisição para a API do LM Studio
        const response = await axios.post(LM_STUDIO_CONFIG.apiUrl, {
            model: LM_STUDIO_CONFIG.model,
            messages: [
                { role: "system", content: informacoesEmpresa },
                ...conversationHistory[userId]
            ],
            temperature: LM_STUDIO_CONFIG.temperature,
            max_tokens: LM_STUDIO_CONFIG.maxTokens
        });
        
        // Processa a resposta
        let reply = response.data.choices[0].message.content;
        
        // Remove tags de pensamento se existirem
        reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        
        // Adiciona a resposta ao histórico
        conversationHistory[userId].push({ role: "assistant", content: reply });
        
        logger.debug(`Resposta gerada para ${userId}: ${reply.substring(0, 50)}...`);
        
        return reply;
    } catch (error) {
        logger.error('Erro ao processar mensagem com IA:', { 
            error: error.message, 
            stack: error.stack,
            userId,
            text: text.substring(0, 100) // Apenas os primeiros 100 caracteres para não logar conteúdo sensível
        });
        
        // Tenta obter mais detalhes se for um erro de resposta HTTP
        if (error.response) {
            logger.error('Detalhes da resposta de erro:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
        }
        
        return 'Desculpe, não consegui processar sua mensagem. Nossa equipe técnica foi notificada do problema.';
    }
}

/**
 * Obtém o histórico de uma conversa
 * @param {string} userId - ID do usuário
 * @returns {Array} Histórico da conversa
 */
function getHistory(userId) {
    return conversationHistory[userId] || [];
}

/**
 * Limpa o histórico de uma conversa específica
 * @param {string} userId - ID do usuário
 */
function clearHistory(userId) {
    if (conversationHistory[userId]) {
        conversationHistory[userId] = [];
        logger.info(`Histórico de conversa limpo para usuário ${userId}`);
    }
}

module.exports = {
    processMessage,
    getHistory,
    clearHistory
}; 