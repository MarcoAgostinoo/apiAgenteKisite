/**
 * Serviço para gerenciar as respostas da empresa
 * Contém a lógica de negócio específica para responder sobre a KiSite
 */

const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Carrega os dados da empresa
let companyData;
try {
    const dataPath = path.join(process.cwd(), 'companyData.json');
    companyData = require(dataPath);
    logger.info('Dados da empresa carregados com sucesso');
} catch (error) {
    logger.error('Erro ao carregar dados da empresa:', { error: error.message, stack: error.stack });
    companyData = {
        about: "KiSite - Soluções digitais para sua empresa",
        services: ["Desenvolvimento Web"],
        contact: "Contate-nos em contato@kisite.com.br"
    };
}

/**
 * Manipula mensagens do usuário e decide a resposta apropriada
 * @param {string} message - Mensagem do usuário
 * @param {string} userId - ID do usuário
 * @param {Function} processWithAI - Função para processar com IA caso necessário
 * @returns {Promise<string>} Resposta para o usuário
 */
async function handleMessage(message, userId, processWithAI) {
    try {
        const lowerMessage = message.toLowerCase();

        // Perguntas sobre a empresa
        if (lowerMessage.includes("o que a kisite faz") || lowerMessage.includes("me fale sobre a kisite") ||
            lowerMessage.includes("quem é a kisite") || lowerMessage.includes("sobre a empresa")) {
            logger.debug(`Respondendo pergunta sobre a empresa para ${userId}`);
            return companyData.about;
        }

        // Perguntas sobre serviços
        else if (lowerMessage.includes("serviços") || lowerMessage.includes("o que vocês oferecem") ||
            lowerMessage.includes("soluções") || lowerMessage.includes("produtos")) {
            logger.debug(`Respondendo pergunta sobre serviços para ${userId}`);
            return "A KiSite oferece os seguintes serviços: " + companyData.services.join(", ");
        }

        // Perguntas sobre contato
        else if (lowerMessage.includes("contato") || lowerMessage.includes("como entrar em contato") ||
            lowerMessage.includes("email") || lowerMessage.includes("telefone") ||
            lowerMessage.includes("falar com alguém")) {
            logger.debug(`Respondendo pergunta sobre contato para ${userId}`);
            return companyData.contact;
        }

        // Perguntas sobre preços
        else if (lowerMessage.includes("preço") || lowerMessage.includes("valor") ||
            lowerMessage.includes("quanto custa") || lowerMessage.includes("investimento")) {
            logger.debug(`Respondendo pergunta sobre preços para ${userId}`);
            return `O Site Essencial da KiSite tem um investimento de ${companyData.site_essencial.preco}. Para informações sobre outros serviços, entre em contato conosco.`;
        }

        // Perguntas sobre o Site Essencial
        else if (lowerMessage.includes("site essencial") ||
            (lowerMessage.includes("site") && lowerMessage.includes("básico"))) {
            logger.debug(`Respondendo pergunta sobre Site Essencial para ${userId}`);
            let response = `Site Essencial: ${companyData.site_essencial.descricao}.\n`;
            response += `Características: ${companyData.site_essencial.caracteristicas.join(", ")}.\n`;
            response += `Investimento: ${companyData.site_essencial.preco}.`;
            return response;
        }

        // Perguntas sobre o Agente Inteligente
        else if (lowerMessage.includes("agente inteligente") || lowerMessage.includes("assistente virtual") ||
            lowerMessage.includes("chatbot") || lowerMessage.includes("atendimento automático")) {
            logger.debug(`Respondendo pergunta sobre Agente Inteligente para ${userId}`);
            let response = `Agente Inteligente: ${companyData.agente_inteligente.descricao}.\n`;
            response += `Benefícios: ${companyData.agente_inteligente.caracteristicas.join(", ")}.`;
            return response;
        }

        // Perguntas sobre a Integração Estratégica
        else if (lowerMessage.includes("integração") || lowerMessage.includes("site e agente") ||
            lowerMessage.includes("solução completa") || lowerMessage.includes("integração estratégica")) {
            logger.debug(`Respondendo pergunta sobre Integração Estratégica para ${userId}`);
            let response = `Integração Estratégica: ${companyData.integracao_estrategica.descricao}.\n`;
            response += `Benefícios: ${companyData.integracao_estrategica.caracteristicas.join(", ")}.`;
            return response;
        }

        // Perguntas sobre estatísticas
        else if (lowerMessage.includes("estatística") || lowerMessage.includes("dados") ||
            lowerMessage.includes("resultado") || lowerMessage.includes("eficácia")) {
            logger.debug(`Respondendo pergunta sobre estatísticas para ${userId}`);
            return `Nossas estatísticas mostram que: 
            - ${companyData.estatisticas.uso_smartphone}
            - ${companyData.estatisticas.aumento_leads}
            - ${companyData.estatisticas.taxa_conversao}`;
        }

        // Perguntas sobre funcionalidades adicionais
        else if (lowerMessage.includes("funcionalidade") || lowerMessage.includes("recurso adicional") ||
            lowerMessage.includes("opção extra") || lowerMessage.includes("outros serviços")) {
            logger.debug(`Respondendo pergunta sobre funcionalidades adicionais para ${userId}`);
            return `Além dos serviços principais, a KiSite oferece as seguintes funcionalidades adicionais: ${companyData.funcionalidades_adicionais.join(", ")}.`;
        }

        // Perguntas sobre prazos
        else if (lowerMessage.includes("prazo") || lowerMessage.includes("tempo") ||
            lowerMessage.includes("quanto tempo leva") || lowerMessage.includes("quando fica pronto")) {
            logger.debug(`Respondendo pergunta sobre prazos para ${userId}`);
            return "A KiSite entrega seu website profissional em apenas 7 dias úteis!";
        }

        // Para outras mensagens, usar o processamento da IA
        else {
            logger.debug(`Encaminhando mensagem para processamento com IA para ${userId}`);
            return await processWithAI(message, userId);
        }
    } catch (error) {
        logger.error('Erro ao processar mensagem do usuário:', { error: error.message, stack: error.stack, userId });
        return "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente mais tarde.";
    }
}

module.exports = {
    handleMessage,
    companyData
}; 