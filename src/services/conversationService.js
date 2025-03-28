/**
 * Serviço para gerenciar conversas
 * Responsável pelo salvamento, recuperação e limpeza de conversas
 */

const fs = require('fs');
const path = require('path');
const { STORAGE_CONFIG } = require('../config/config');
const logger = require('../utils/logger');

// Diretório para armazenar conversas
const CONVERSATIONS_DIR = path.join(process.cwd(), STORAGE_CONFIG.conversationsDir);

// Garante que o diretório existe
if (!fs.existsSync(CONVERSATIONS_DIR)) {
    fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true });
    logger.info(`Diretório para conversas criado em ${CONVERSATIONS_DIR}`);
}

/**
 * Salva uma conversa no arquivo do usuário
 * @param {string} userId - ID do usuário (telefone ou identificador)
 * @param {string} userMessage - Mensagem enviada pelo usuário
 * @param {string} botResponse - Resposta do sistema
 */
function saveConversation(userId, userMessage, botResponse) {
    try {
        // Formata o userId para ser usado como nome de arquivo (remove caracteres inválidos)
        const formattedUserId = userId.replace(/[^\w\d]/g, '_');
        const filePath = path.join(CONVERSATIONS_DIR, `${formattedUserId}.txt`);

        // Data e hora atual
        const timestamp = new Date().toLocaleString('pt-BR');

        // Formata a mensagem para o arquivo
        const messageEntry = `[${timestamp}]\nUsuário: ${userMessage}\nKiSite: ${botResponse}\n\n`;

        // Adiciona a mensagem ao arquivo (cria se não existir)
        fs.appendFile(filePath, messageEntry, (err) => {
            if (err) {
                logger.error(`Erro ao salvar conversa para ${userId}:`, { error: err.message, stack: err.stack });
            } else {
                logger.debug(`Conversa salva para ${userId}`);
            }
        });
    } catch (error) {
        logger.error('Erro ao processar salvamento de conversa', { error: error.message, stack: error.stack });
    }
}

/**
 * Lista todas as conversas disponíveis
 * @returns {Array} Lista de conversas com metadados
 */
function listConversations() {
    try {
        // Lê o diretório de conversas
        const files = fs.readdirSync(CONVERSATIONS_DIR);

        // Apenas arquivos .txt, excluindo README.md e outros
        const conversationFiles = files.filter(file => file.endsWith('.txt'));

        // Lista com informações sobre as conversas
        const conversas = conversationFiles.map(file => {
            const userId = file.replace('.txt', '');
            const stats = fs.statSync(path.join(CONVERSATIONS_DIR, file));

            return {
                userId,
                arquivo: file,
                ultimaModificacao: stats.mtime,
                tamanho: `${(stats.size / 1024).toFixed(2)} KB`
            };
        });

        return {
            total: conversas.length,
            conversas
        };
    } catch (error) {
        logger.error('Erro ao listar conversas', { error: error.message, stack: error.stack });
        throw error;
    }
}

/**
 * Recupera o conteúdo de uma conversa específica
 * @param {string} userId - ID do usuário
 * @returns {string} Conteúdo da conversa
 */
function getConversation(userId) {
    try {
        const formattedUserId = userId.replace(/[^\w\d]/g, '_');
        const filePath = path.join(CONVERSATIONS_DIR, `${formattedUserId}.txt`);

        // Verifica se o arquivo existe
        if (!fs.existsSync(filePath)) {
            logger.warn(`Conversa não encontrada para ${userId}`);
            return null;
        }

        // Lê o conteúdo do arquivo
        const content = fs.readFileSync(filePath, 'utf-8');

        return content;
    } catch (error) {
        logger.error(`Erro ao recuperar conversa para ${userId}`, { error: error.message, stack: error.stack });
        throw error;
    }
}

/**
 * Limpa conversas antigas baseado no prazo de retenção configurado
 * @returns {number} Número de arquivos excluídos
 */
function cleanOldConversations() {
    try {
        logger.info('Verificando conversas antigas para exclusão...');
        const now = new Date();
        const MAX_AGE_DAYS = STORAGE_CONFIG.maxAgeDays;
        const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000; // dias em milissegundos

        // Verifica se o diretório existe
        if (!fs.existsSync(CONVERSATIONS_DIR)) {
            logger.warn('Diretório de conversas não encontrado.');
            return 0;
        }

        // Lê o diretório de conversas
        const files = fs.readdirSync(CONVERSATIONS_DIR);
        let filesExcluidos = 0;

        // Apenas arquivos .txt, excluindo README.md e outros
        const conversationFiles = files.filter(file => file.endsWith('.txt'));

        // Para cada arquivo no diretório
        conversationFiles.forEach(file => {
            const filePath = path.join(CONVERSATIONS_DIR, file);
            const stats = fs.statSync(filePath);
            const fileAge = now - stats.mtime; // idade do arquivo em milissegundos

            // Se o arquivo for mais antigo que o tempo máximo permitido
            if (fileAge > MAX_AGE_MS) {
                try {
                    // Exclui o arquivo
                    fs.unlinkSync(filePath);
                    filesExcluidos++;
                    logger.info(`Arquivo excluído por ter mais de ${MAX_AGE_DAYS} dias: ${file}`);
                } catch (error) {
                    logger.error(`Erro ao excluir arquivo ${file}:`, { error: error.message, stack: error.stack });
                }
            }
        });

        logger.info(`Processo de limpeza concluído. ${filesExcluidos} conversas antigas excluídas.`);
        return filesExcluidos;
    } catch (error) {
        logger.error('Erro ao limpar conversas antigas:', { error: error.message, stack: error.stack });
        throw error;
    }
}

/**
 * Verifica se hoje é o primeiro dia do mês
 * @returns {boolean}
 */
function isPrimeiroDiaDoMes() {
    const hoje = new Date();
    return hoje.getDate() === 1;
}

/**
 * Configura o cronograma de limpeza automática
 */
function setupCleanupSchedule() {
    const agendarProximaVerificacao = () => {
        const agora = new Date();
        // Cria uma data para amanhã, às 00:05 (para garantir que seja após a meia-noite)
        const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 5, 0);
        // Calcula o tempo em milissegundos até amanhã
        const tempoAteAmanha = amanha - agora;

        logger.info(`Próxima verificação agendada para: ${amanha.toLocaleString('pt-BR')}`);

        // Agenda a próxima verificação
        setTimeout(() => {
            logger.info('Executando verificação diária...');
            // Se for o primeiro dia do mês, executa a limpeza
            if (isPrimeiroDiaDoMes()) {
                logger.info('Hoje é o primeiro dia do mês. Iniciando limpeza de conversas antigas...');
                cleanOldConversations();
            } else {
                logger.info('Hoje não é o primeiro dia do mês. Pulando limpeza.');
            }
            // Agenda a próxima verificação novamente
            agendarProximaVerificacao();
        }, tempoAteAmanha);
    };

    // Verifica na inicialização e executa apenas se for o primeiro dia do mês
    logger.info('Verificando se hoje é o primeiro dia do mês...');
    if (isPrimeiroDiaDoMes()) {
        logger.info('Hoje é o primeiro dia do mês. Executando limpeza inicial...');
        cleanOldConversations();
    } else {
        logger.info('Hoje não é o primeiro dia do mês. A limpeza automática será executada apenas no primeiro dia do próximo mês.');
    }

    // Agenda a primeira verificação
    agendarProximaVerificacao();
    logger.info('Sistema de limpeza automática configurado para executar no primeiro dia de cada mês.');
}

module.exports = {
    saveConversation,
    listConversations,
    getConversation,
    cleanOldConversations,
    isPrimeiroDiaDoMes,
    setupCleanupSchedule
}; 