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
                console.error('Erro ao iniciar ngrok:', ngrokError);
                exec('pm2 stop all'); // Para o servidor em caso de erro
            }
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
    }
}

// Função para limpar recursos ao encerrar
function cleanup() {
    exec('pm2 stop all', () => {
        ngrok.kill();
        process.exit(0);
    });
}

// Registra handlers para encerramento limpo
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Inicia o servidor
startServer(); 