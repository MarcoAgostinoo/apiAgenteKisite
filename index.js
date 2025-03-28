const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Inicializa o servidor Express
const app = express();
const PORT = 3000;

// Middleware para processar JSON
app.use(bodyParser.json());

// Objeto para armazenar o histórico de conversas
const conversationHistory = {};

// Diretório para armazenar conversas
const CONVERSATIONS_DIR = path.join(__dirname, 'conversas');

// Cria o diretório de conversas se não existir
if (!fs.existsSync(CONVERSATIONS_DIR)) {
    fs.mkdirSync(CONVERSATIONS_DIR, { recursive: true });
    console.log(`Diretório para conversas criado em ${CONVERSATIONS_DIR}`);
}

// Função para excluir conversas mais antigas que 60 dias
function limparConversasAntigas() {
    try {
        console.log('Verificando conversas antigas para exclusão...');
        const now = new Date();
        const MAX_AGE_DAYS = 60;
        const MAX_AGE_MS = MAX_AGE_DAYS * 24 * 60 * 60 * 1000; // 60 dias em milissegundos

        // Verifica se o diretório existe
        if (!fs.existsSync(CONVERSATIONS_DIR)) {
            console.log('Diretório de conversas não encontrado.');
            return;
        }

        // Lê o diretório de conversas
        const files = fs.readdirSync(CONVERSATIONS_DIR);
        let filesExcluidos = 0;

        // Para cada arquivo no diretório
        files.forEach(file => {
            const filePath = path.join(CONVERSATIONS_DIR, file);
            const stats = fs.statSync(filePath);
            const fileAge = now - stats.mtime; // idade do arquivo em milissegundos

            // Se o arquivo for mais antigo que o tempo máximo permitido
            if (fileAge > MAX_AGE_MS) {
                try {
                    // Exclui o arquivo
                    fs.unlinkSync(filePath);
                    filesExcluidos++;
                    console.log(`Arquivo excluído por ter mais de ${MAX_AGE_DAYS} dias: ${file}`);
                } catch (error) {
                    console.error(`Erro ao excluir arquivo ${file}:`, error);
                }
            }
        });

        console.log(`Processo de limpeza concluído. ${filesExcluidos} conversas antigas excluídas.`);
    } catch (error) {
        console.error('Erro ao limpar conversas antigas:', error);
    }
}

// Função para verificar se hoje é o primeiro dia do mês
function isPrimeiroDiaDoMes() {
    const hoje = new Date();
    return hoje.getDate() === 1;
}

// Função para agendar a próxima verificação
function agendarProximaVerificacao() {
    const agora = new Date();
    // Cria uma data para amanhã, às 00:05 (para garantir que seja após a meia-noite)
    const amanha = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + 1, 0, 5, 0);
    // Calcula o tempo em milissegundos até amanhã
    const tempoAteAmanha = amanha - agora;

    console.log(`Próxima verificação agendada para: ${amanha.toLocaleString('pt-BR')}`);

    // Agenda a próxima verificação
    setTimeout(() => {
        console.log('Executando verificação diária...');
        // Se for o primeiro dia do mês, executa a limpeza
        if (isPrimeiroDiaDoMes()) {
            console.log('Hoje é o primeiro dia do mês. Iniciando limpeza de conversas antigas...');
            limparConversasAntigas();
        } else {
            console.log('Hoje não é o primeiro dia do mês. Pulando limpeza.');
        }
        // Agenda a próxima verificação novamente
        agendarProximaVerificacao();
    }, tempoAteAmanha);
}

// Verifica na inicialização e executa apenas se for o primeiro dia do mês
console.log('Verificando se hoje é o primeiro dia do mês...');
if (isPrimeiroDiaDoMes()) {
    console.log('Hoje é o primeiro dia do mês. Executando limpeza inicial...');
    limparConversasAntigas();
} else {
    console.log('Hoje não é o primeiro dia do mês. A limpeza automática será executada apenas no primeiro dia do próximo mês.');
}

// Agenda a primeira verificação
agendarProximaVerificacao();
console.log('Sistema de limpeza automática configurado para executar no primeiro dia de cada mês.');

// Função para salvar conversa em arquivo
function saveConversation(userId, userMessage, botResponse) {
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
            console.error(`Erro ao salvar conversa para ${userId}:`, err);
        } else {
            console.log(`Conversa salva para ${userId}`);
        }
    });
}

// Carrega os dados da empresa
const companyData = require('./companyData.json');

// Função para manipular mensagens com personalização
async function handleMessage(message, userId) {
    const lowerMessage = message.toLowerCase();

    // Perguntas sobre a empresa
    if (lowerMessage.includes("o que a kisite faz") || lowerMessage.includes("me fale sobre a kisite") ||
        lowerMessage.includes("quem é a kisite") || lowerMessage.includes("sobre a empresa")) {
        return companyData.about;
    }
    // Perguntas sobre serviços
    else if (lowerMessage.includes("serviços") || lowerMessage.includes("o que vocês oferecem") ||
        lowerMessage.includes("soluções") || lowerMessage.includes("produtos")) {
        return "A KiSite oferece os seguintes serviços: " + companyData.services.join(", ");
    }
    // Perguntas sobre contato
    else if (lowerMessage.includes("contato") || lowerMessage.includes("como entrar em contato") ||
        lowerMessage.includes("email") || lowerMessage.includes("telefone") ||
        lowerMessage.includes("falar com alguém")) {
        return companyData.contact;
    }
    // Perguntas sobre preços
    else if (lowerMessage.includes("preço") || lowerMessage.includes("valor") ||
        lowerMessage.includes("quanto custa") || lowerMessage.includes("investimento")) {
        return `O Site Essencial da KiSite tem um investimento de ${companyData.site_essencial.preco}. Para informações sobre outros serviços, entre em contato conosco.`;
    }
    // Perguntas sobre o Site Essencial
    else if (lowerMessage.includes("site essencial") ||
        (lowerMessage.includes("site") && lowerMessage.includes("básico"))) {
        let response = `Site Essencial: ${companyData.site_essencial.descricao}.\n`;
        response += `Características: ${companyData.site_essencial.caracteristicas.join(", ")}.\n`;
        response += `Investimento: ${companyData.site_essencial.preco}.`;
        return response;
    }
    // Perguntas sobre o Agente Inteligente
    else if (lowerMessage.includes("agente inteligente") || lowerMessage.includes("assistente virtual") ||
        lowerMessage.includes("chatbot") || lowerMessage.includes("atendimento automático")) {
        let response = `Agente Inteligente: ${companyData.agente_inteligente.descricao}.\n`;
        response += `Benefícios: ${companyData.agente_inteligente.caracteristicas.join(", ")}.`;
        return response;
    }
    // Perguntas sobre a Integração Estratégica
    else if (lowerMessage.includes("integração") || lowerMessage.includes("site e agente") ||
        lowerMessage.includes("solução completa") || lowerMessage.includes("integração estratégica")) {
        let response = `Integração Estratégica: ${companyData.integracao_estrategica.descricao}.\n`;
        response += `Benefícios: ${companyData.integracao_estrategica.caracteristicas.join(", ")}.`;
        return response;
    }
    // Perguntas sobre estatísticas
    else if (lowerMessage.includes("estatística") || lowerMessage.includes("dados") ||
        lowerMessage.includes("resultado") || lowerMessage.includes("eficácia")) {
        return `Nossas estatísticas mostram que: 
        - ${companyData.estatisticas.uso_smartphone}
        - ${companyData.estatisticas.aumento_leads}
        - ${companyData.estatisticas.taxa_conversao}`;
    }
    // Perguntas sobre funcionalidades adicionais
    else if (lowerMessage.includes("funcionalidade") || lowerMessage.includes("recurso adicional") ||
        lowerMessage.includes("opção extra") || lowerMessage.includes("outros serviços")) {
        return `Além dos serviços principais, a KiSite oferece as seguintes funcionalidades adicionais: ${companyData.funcionalidades_adicionais.join(", ")}.`;
    }
    // Perguntas sobre prazos
    else if (lowerMessage.includes("prazo") || lowerMessage.includes("tempo") ||
        lowerMessage.includes("quanto tempo leva") || lowerMessage.includes("quando fica pronto")) {
        return "A KiSite entrega seu website profissional em apenas 7 dias úteis!";
    }
    // Para outras mensagens, usar o processamento da IA
    else {
        return await processMessage(message, userId);
    }
}

// Função para processar mensagens usando LM Studio com histórico (inalterada)
async function processMessage(text, userId) {
    try {
        if (!conversationHistory[userId]) {
            conversationHistory[userId] = [];
        }
        conversationHistory[userId].push({ role: "user", content: text });
        if (conversationHistory[userId].length > 10) {
            conversationHistory[userId].shift();
        }
        const response = await axios.post('http://172.16.0.95:4152/api/v0/chat/completions', {
            model: "gemma-3-1b-it",
            messages: [
                { role: "system", content: "Você é um assistente virtual da KiSite, uma empresa que oferece criação de websites em 7 dias e soluções de IA para atendimento. Responda de forma natural e amigável, mantendo o contexto da conversa. A KiSite se especializa em desenvolvimento web, agentes inteligentes com IA e otimização SEO para pequenas e médias empresas. Seu site principal custa R$897. Seja sempre cordial e profissional." },
                ...conversationHistory[userId]
            ],
            temperature: 0.7,
            max_tokens: 500
        });
        let reply = response.data.choices[0].message.content;
        reply = reply.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
        conversationHistory[userId].push({ role: "assistant", content: reply });
        console.log(`Resposta gerada para ${userId}: ${reply}`);
        return reply;
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        return 'Desculpe, não consegui processar sua mensagem.';
    }
}

// Rota para testar o processamento de mensagens via API
app.post('/api/chat', async (req, res) => {
    try {
        const { message, userId = 'test-user' } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'A mensagem é obrigatória' });
        }
        console.log(`Requisição API recebida - Usuário: ${userId}, Mensagem: ${message}`);
        const response = await handleMessage(message, userId);

        // Salva a conversa em arquivo
        saveConversation(userId, message, response);

        return res.json({
            userId,
            message,
            response,
            history: conversationHistory[userId]
        });
    } catch (error) {
        console.error('Erro na API:', error);
        return res.status(500).json({ error: 'Erro ao processar a requisição' });
    }
});

// Rota para listar todas as conversas salvas
app.get('/api/conversas', (req, res) => {
    try {
        // Lê o diretório de conversas
        const files = fs.readdirSync(CONVERSATIONS_DIR);

        // Lista com informações sobre as conversas
        const conversas = files.map(file => {
            const userId = file.replace('.txt', '');
            const stats = fs.statSync(path.join(CONVERSATIONS_DIR, file));

            return {
                userId,
                arquivo: file,
                ultimaModificacao: stats.mtime,
                tamanho: `${(stats.size / 1024).toFixed(2)} KB`
            };
        });

        return res.json({
            total: conversas.length,
            conversas
        });
    } catch (error) {
        console.error('Erro ao listar conversas:', error);
        return res.status(500).json({ error: 'Erro ao listar conversas' });
    }
});

// Rota para visualizar uma conversa específica
app.get('/api/conversas/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const formattedUserId = userId.replace(/[^\w\d]/g, '_');
        const filePath = path.join(CONVERSATIONS_DIR, `${formattedUserId}.txt`);

        // Verifica se o arquivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Conversa não encontrada' });
        }

        // Lê o conteúdo do arquivo
        const content = fs.readFileSync(filePath, 'utf-8');

        return res.json({
            userId,
            content
        });
    } catch (error) {
        console.error(`Erro ao recuperar conversa:`, error);
        return res.status(500).json({ error: 'Erro ao recuperar conversa' });
    }
});

// Rota para limpar manualmente conversas antigas
app.post('/api/conversas/limpar', (req, res) => {
    try {
        limparConversasAntigas();
        return res.json({ message: 'Processo de limpeza de conversas antigas iniciado com sucesso.' });
    } catch (error) {
        console.error('Erro ao iniciar limpeza de conversas:', error);
        return res.status(500).json({ error: 'Erro ao iniciar limpeza de conversas' });
    }
});

// Inicializa o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Por favor, escaneie o QR code acima para fazer login no WhatsApp');
});

client.on('ready', () => {
    console.log('Client is ready!');
    app.listen(PORT, () => {
        console.log(`Servidor API rodando em http://localhost:${PORT}`);
    });
});

// Escuta mensagens recebidas com a nova função
client.on('message', async (message) => {
    console.log(`Mensagem recebida de ${message.from}: ${message.body}`);
    const response = await handleMessage(message.body, message.from);

    // Salva a conversa em arquivo
    saveConversation(message.from, message.body, response);

    message.reply(response);
});

client.initialize();