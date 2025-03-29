const ngrok = require('ngrok');
const { exec } = require('child_process');
const { SERVER_CONFIG } = require('./src/config/config');

async function startServer() {
    try {
        // Inicia o PM2
        console.log('Iniciando servidor com PM2...');
        exec('pm2 start ecosystem.config.js', async (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro ao iniciar PM2: ${error}`);
                return;
            }
            console.log('PM2 iniciado com sucesso!');

            // Tenta iniciar o ngrok, mas continua mesmo em caso de erro
            try {
                // Conecta o ngrok
                console.log('Iniciando túnel ngrok...');
                const url = await ngrok.connect({
                    addr: SERVER_CONFIG.port,
                    authtoken: process.env.NGROK_AUTH_TOKEN // Opcional, mas recomendado
                });

                console.log('=================================');
                console.log('🚀 Servidor iniciado com sucesso!');
                console.log(`📡 URL Local: http://localhost:${SERVER_CONFIG.port}`);
                console.log(`🌎 URL Pública: ${url}`);
                console.log('=================================');

                // Salva a URL do ngrok em um arquivo para referência
                require('fs').writeFileSync('ngrok-url.txt', url);

            } catch (ngrokError) {
                console.error('Aviso: Não foi possível iniciar ngrok:', ngrokError.message);
                console.log('=================================');
                console.log('🚀 Servidor iniciado com sucesso!');
                console.log(`📡 URL Local: http://localhost:${SERVER_CONFIG.port}`);
                console.log('⚠️ URL Pública: Não disponível (ngrok não iniciado)');
                console.log('=================================');
                // Continua executando o servidor mesmo sem o ngrok
            }
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
    }
}

// Função para limpar recursos ao encerrar
function cleanup() {
    exec('pm2 stop all', () => {
        try {
            ngrok.kill();
        } catch (error) {
            console.error('Erro ao encerrar ngrok:', error.message);
        }
        process.exit(0);
    });
}

// Registra handlers para encerramento limpo
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Inicia o servidor
startServer(); 