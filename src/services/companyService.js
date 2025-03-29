/**
 * Serviço para gerenciar as respostas da empresa
 * Contém a lógica de negócio específica para responder sobre a KiSite
 */

const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Carrega os dados da empresa a partir dos arquivos de treinamento
let treinamentoDados = {};
const treinamentoPath = path.join(process.cwd(), 'treinamento');

try {
    // Carrega todos os arquivos da pasta de treinamento
    if (fs.existsSync(treinamentoPath)) {
        const temas = ['empresa', 'servicos', 'site_essencial', 'agente_inteligente', 'estatisticas', 'integracao_estrategica'];

        temas.forEach(tema => {
            const arquivoPath = path.join(treinamentoPath, `${tema}.json`);
            if (fs.existsSync(arquivoPath)) {
                treinamentoDados[tema] = require(arquivoPath);
                logger.info(`Arquivo de treinamento carregado: ${tema}.json`);
            } else {
                logger.warn(`Arquivo de treinamento não encontrado: ${tema}.json`);
            }
        });
    } else {
        logger.warn('Diretório de treinamento não encontrado. Usando dados padrão.');
    }

    // Compatibilidade com versão anterior (manter companyData acessível)
    let companyDataPath = path.join(process.cwd(), 'companyData.json');
    if (fs.existsSync(companyDataPath)) {
        companyData = require(companyDataPath);
        logger.info('Dados da empresa carregados com sucesso (legado)');
    } else {
        // Criar dados compatíveis baseados nos arquivos de treinamento
        companyData = {
            about: treinamentoDados.empresa?.sobre || "KiSite - Soluções digitais para sua empresa",
            services: treinamentoDados.servicos?.categorias || ["Desenvolvimento Web"],
            contact: treinamentoDados.empresa?.contato || "Contate-nos em contato@kisite.com.br",
            site_essencial: {
                descricao: treinamentoDados.site_essencial?.descricao || "Site profissional com design moderno",
                caracteristicas: treinamentoDados.site_essencial?.caracteristicas || ["Responsivo"],
                preco: treinamentoDados.site_essencial?.preco || "R$ 897,00"
            },
            agente_inteligente: {
                descricao: treinamentoDados.agente_inteligente?.descricao || "Assistente virtual para atendimento",
                caracteristicas: treinamentoDados.agente_inteligente?.caracteristicas || ["IA treinada sobre seu negócio"]
            },
            integracao_estrategica: {
                descricao: treinamentoDados.integracao_estrategica?.descricao || "Solução completa com site e atendimento automatizado",
                caracteristicas: treinamentoDados.integracao_estrategica?.caracteristicas || [
                    "Site Essencial",
                    "Agente Inteligente",
                    "Dashboards de desempenho",
                    "Suporte prioritário"
                ]
            },
            estatisticas: {
                uso_smartphone: treinamentoDados.estatisticas?.mercado?.uso_smartphone || "85% dos consumidores usam smartphones",
                aumento_leads: treinamentoDados.estatisticas?.resultados_clientes?.aumento_leads || "Clientes relatam aumento de leads",
                taxa_conversao: treinamentoDados.estatisticas?.resultados_clientes?.taxa_conversao || "Melhoria na taxa de conversão"
            },
            funcionalidades_adicionais: treinamentoDados.estatisticas?.funcionalidades_adicionais?.map(f => f.nome) || [
                "Loja virtual",
                "Blog",
                "Área de membros"
            ]
        };
    }
} catch (error) {
    logger.error('Erro ao carregar dados de treinamento:', { error: error.message, stack: error.stack });
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
            if (treinamentoDados.empresa?.sobre) {
                return treinamentoDados.empresa.sobre;
            }
            return companyData.about;
        }

        // Perguntas sobre história da empresa
        else if (lowerMessage.includes("história") || lowerMessage.includes("quando foi fundada") ||
            lowerMessage.includes("origem") || lowerMessage.includes("como surgiu")) {
            logger.debug(`Respondendo pergunta sobre história para ${userId}`);
            if (treinamentoDados.empresa?.historia) {
                return treinamentoDados.empresa.historia;
            }
            return "A KiSite foi fundada por profissionais de tecnologia com o propósito de democratizar o acesso a soluções digitais de alta qualidade.";
        }

        // Perguntas sobre serviços
        else if (lowerMessage.includes("serviços") || lowerMessage.includes("o que vocês oferecem") ||
            lowerMessage.includes("soluções") || lowerMessage.includes("produtos")) {
            logger.debug(`Respondendo pergunta sobre serviços para ${userId}`);
            if (treinamentoDados.servicos?.categorias) {
                return "A KiSite oferece os seguintes serviços: " + treinamentoDados.servicos.categorias.join(", ") + ". " + treinamentoDados.servicos.descricao_geral;
            }
            return "A KiSite oferece os seguintes serviços: " + companyData.services.join(", ");
        }

        // Perguntas sobre contato
        else if (lowerMessage.includes("contato") || lowerMessage.includes("como entrar em contato") ||
            lowerMessage.includes("email") || lowerMessage.includes("telefone") ||
            lowerMessage.includes("falar com alguém")) {
            logger.debug(`Respondendo pergunta sobre contato para ${userId}`);
            if (treinamentoDados.empresa?.contato) {
                return treinamentoDados.empresa.contato;
            }
            return companyData.contact;
        }

        // Perguntas sobre preços
        else if (lowerMessage.includes("preço") || lowerMessage.includes("valor") ||
            lowerMessage.includes("quanto custa") || lowerMessage.includes("investimento")) {
            logger.debug(`Respondendo pergunta sobre preços para ${userId}`);
            if (treinamentoDados.site_essencial?.preco) {
                return `O Site Essencial da KiSite tem um investimento de ${treinamentoDados.site_essencial.preco}. Para informações sobre outros serviços, entre em contato conosco.`;
            }
            return `O Site Essencial da KiSite tem um investimento de ${companyData.site_essencial.preco}. Para informações sobre outros serviços, entre em contato conosco.`;
        }

        // Perguntas sobre o Site Essencial
        else if (lowerMessage.includes("site essencial") ||
            (lowerMessage.includes("site") && lowerMessage.includes("básico"))) {
            logger.debug(`Respondendo pergunta sobre Site Essencial para ${userId}`);
            if (treinamentoDados.site_essencial) {
                let response = `Site Essencial: ${treinamentoDados.site_essencial.descricao}.\n`;
                response += `Características: ${treinamentoDados.site_essencial.caracteristicas.join(", ")}.\n`;
                response += `Investimento: ${treinamentoDados.site_essencial.preco}.`;
                return response;
            }

            let response = `Site Essencial: ${companyData.site_essencial.descricao}.\n`;
            response += `Características: ${companyData.site_essencial.caracteristicas.join(", ")}.\n`;
            response += `Investimento: ${companyData.site_essencial.preco}.`;
            return response;
        }

        // Perguntas sobre o Agente Inteligente
        else if (lowerMessage.includes("agente inteligente") || lowerMessage.includes("assistente virtual") ||
            lowerMessage.includes("chatbot") || lowerMessage.includes("atendimento automático")) {
            logger.debug(`Respondendo pergunta sobre Agente Inteligente para ${userId}`);
            if (treinamentoDados.agente_inteligente) {
                let response = `Agente Inteligente: ${treinamentoDados.agente_inteligente.descricao}.\n`;
                response += `Características: ${treinamentoDados.agente_inteligente.caracteristicas.join(", ")}.\n`;
                if (treinamentoDados.agente_inteligente.beneficios) {
                    response += `Benefícios: ${treinamentoDados.agente_inteligente.beneficios.join(", ")}.`;
                }
                return response;
            }

            let response = `Agente Inteligente: ${companyData.agente_inteligente.descricao}.\n`;
            response += `Benefícios: ${companyData.agente_inteligente.caracteristicas.join(", ")}.`;
            return response;
        }

        // Perguntas sobre a Integração Estratégica
        else if (lowerMessage.includes("integração") || lowerMessage.includes("site e agente") ||
            lowerMessage.includes("solução completa") || lowerMessage.includes("integração estratégica")) {
            logger.debug(`Respondendo pergunta sobre Integração Estratégica para ${userId}`);

            if (treinamentoDados.integracao_estrategica) {
                let response = `Integração Estratégica: ${treinamentoDados.integracao_estrategica.descricao}\n`;
                response += `Características: ${treinamentoDados.integracao_estrategica.caracteristicas.join(", ")}.\n`;
                response += `Resultado: ${treinamentoDados.integracao_estrategica.resultado_esperado}`;
                return response;
            }

            let response = `Integração Estratégica: ${companyData.integracao_estrategica.descricao}.\n`;
            response += `Benefícios: ${companyData.integracao_estrategica.caracteristicas.join(", ")}.`;
            return response;
        }

        // Perguntas sobre estatísticas
        else if (lowerMessage.includes("estatística") || lowerMessage.includes("dados") ||
            lowerMessage.includes("resultado") || lowerMessage.includes("eficácia")) {
            logger.debug(`Respondendo pergunta sobre estatísticas para ${userId}`);

            if (treinamentoDados.estatisticas?.mercado && treinamentoDados.estatisticas?.resultados_clientes) {
                return `Nossas estatísticas mostram que: 
                - ${treinamentoDados.estatisticas.mercado.perda_clientes || treinamentoDados.estatisticas.mercado.uso_smartphone}
                - ${treinamentoDados.estatisticas.resultados_clientes.aumento_leads}
                - ${treinamentoDados.estatisticas.resultados_clientes.taxa_conversao}`;
            }

            return `Nossas estatísticas mostram que: 
            - ${companyData.estatisticas.uso_smartphone}
            - ${companyData.estatisticas.aumento_leads}
            - ${companyData.estatisticas.taxa_conversao}`;
        }

        // Perguntas sobre funcionalidades adicionais
        else if (lowerMessage.includes("funcionalidade") || lowerMessage.includes("recurso adicional") ||
            lowerMessage.includes("opção extra") || lowerMessage.includes("outros serviços")) {
            logger.debug(`Respondendo pergunta sobre funcionalidades adicionais para ${userId}`);

            if (treinamentoDados.estatisticas?.funcionalidades_adicionais) {
                const funcionalidades = treinamentoDados.estatisticas.funcionalidades_adicionais.map(f => f.nome);
                return `Além dos serviços principais, a KiSite oferece as seguintes funcionalidades adicionais: ${funcionalidades.join(", ")}.`;
            }

            return `Além dos serviços principais, a KiSite oferece as seguintes funcionalidades adicionais: ${companyData.funcionalidades_adicionais.join(", ")}.`;
        }

        // Perguntas sobre prazos
        else if (lowerMessage.includes("prazo") || lowerMessage.includes("tempo") ||
            lowerMessage.includes("quanto tempo leva") || lowerMessage.includes("quando fica pronto")) {
            logger.debug(`Respondendo pergunta sobre prazos para ${userId}`);

            if (treinamentoDados.site_essencial?.prazo_entrega) {
                return `A KiSite entrega seu website profissional em ${treinamentoDados.site_essencial.prazo_entrega}!`;
            }

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
    companyData,
    treinamentoDados
}; 