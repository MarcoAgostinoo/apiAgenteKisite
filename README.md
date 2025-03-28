# Agente KiSite - Atendimento Automático com IA

> Desenvolvido por Marco D' Melo para KiSite - Soluções Digitais
> Copyright © 2024 KiSite. Todos os direitos reservados.

API de atendimento automático para a KiSite, oferecendo integração com WhatsApp e processamento de mensagens utilizando IA.

## Funcionalidades

- **Integração com WhatsApp**: Recebe e responde mensagens via WhatsApp Web.
- **Processamento de IA**: Utiliza LM Studio local para processar mensagens e gerar respostas contextuais.
- **Respostas Personalizadas**: Fornece informações específicas sobre a KiSite e seus serviços.
- **API REST**: Disponibiliza endpoint para teste e integração com outros sistemas.
- **Histórico de Conversas**: Mantém o histórico de conversa para contexto nas respostas.
- **Gravação de Conversas**: Salva todas as conversas em arquivos de texto separados por número de telefone.
- **Consulta de Conversas**: Permite visualizar conversas salvas através da API.
- **Limpeza Automática**: Remove automaticamente conversas mais antigas que 60 dias no primeiro dia de cada mês.
- **Privacidade de Dados**: Protege os dados dos clientes mantendo as conversas fora do repositório Git.

## Requisitos

- Node.js
- WhatsApp Web ativo
- LM Studio rodando localmente (API disponível em http://172.16.0.95:4152)

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Inicie o servidor:
   ```
   node index.js
   ```
4. Escaneie o QR code que aparecerá no terminal para conectar com o WhatsApp

## Estrutura de Arquivos

- `index.js`: Arquivo principal com a lógica da aplicação
- `companyData.json`: Informações sobre a empresa KiSite
- `conversas/`: Diretório onde são armazenadas as conversas por número de telefone (ignorado pelo Git)

## Gravação de Conversas

As conversas são automaticamente salvas em arquivos de texto dentro da pasta `conversas/`. Cada número de telefone tem seu próprio arquivo, formatado para facilitar a leitura:

```
[DATA E HORA]
Usuário: Mensagem do usuário
KiSite: Resposta do sistema

[DATA E HORA]
Usuário: Próxima mensagem
KiSite: Próxima resposta
```

Os arquivos são nomeados conforme o número de telefone do usuário (com caracteres especiais substituídos por underscores).

## Privacidade e Segurança de Dados

Para proteger a privacidade dos clientes, o sistema:

- Armazena as conversas localmente na pasta `conversas/`
- Exclui automaticamente conversas com mais de 60 dias
- Mantém os dados de conversas fora do controle de versão (Git)
- A pasta `conversas/` está incluída no arquivo `.gitignore` para garantir que conversas não sejam acidentalmente compartilhadas

**Importante**: Ao fazer backup do sistema, certifique-se de incluir a pasta `conversas/` caso deseje preservar o histórico de comunicações.

## Limpeza Automática de Conversas

O sistema verifica e remove automaticamente todas as conversas mais antigas que 60 dias. Esta verificação é executada:

- No primeiro dia de cada mês, automaticamente
- Na inicialização do sistema (apenas se for o primeiro dia do mês)
- Manualmente através da API quando necessário

O sistema verifica diariamente se é o primeiro dia do mês e executa a limpeza apenas nesse dia, garantindo um processamento mais eficiente e uma rotina de manutenção previsível.

Esta funcionalidade ajuda a:
- Manter o sistema otimizado
- Economizar espaço em disco
- Garantir a conformidade com políticas de retenção de dados

## Endpoints da API

### POST /api/chat

Processa uma mensagem e retorna uma resposta.

**Parâmetros**:
- `message`: A mensagem do usuário (obrigatório)
- `userId`: Identificador único do usuário (opcional, padrão: 'test-user')

**Resposta**:
```json
{
  "userId": "string",
  "message": "string",
  "response": "string",
  "history": [array]
}
```

### GET /api/conversas

Lista todas as conversas salvas.

**Resposta**:
```json
{
  "total": 3,
  "conversas": [
    {
      "userId": "5511999999999_c_us",
      "arquivo": "5511999999999_c_us.txt",
      "ultimaModificacao": "2023-10-15T14:30:45.000Z",
      "tamanho": "12.50 KB"
    },
    ...
  ]
}
```

### GET /api/conversas/:userId

Retorna o conteúdo de uma conversa específica.

**Parâmetros**:
- `userId`: ID do usuário na URL (ex: 5511999999999_c_us)

**Resposta**:
```json
{
  "userId": "5511999999999_c_us",
  "content": "[15/10/2023, 14:30:45]\nUsuário: Olá\nKiSite: Olá! Como posso ajudar?\n\n..."
}
```

### POST /api/conversas/limpar

Inicia manualmente o processo de limpeza das conversas antigas (mais de 60 dias).

**Resposta**:
```json
{
  "message": "Processo de limpeza de conversas antigas iniciado com sucesso."
}
```

## Testando a API com Thunder Client

O Thunder Client é uma extensão leve para o VS Code que funciona como um cliente HTTP para testar APIs. Você pode usá-lo para enviar requisições à API do Agente KiSite.

### Configuração do Thunder Client

1. Instale a extensão "Thunder Client" no VS Code
   - Abra o VS Code, vá para a guia de extensões (Ctrl+Shift+X) e pesquise por "Thunder Client"
   - Clique em "Instalar"

### Teste da Rota POST /api/chat

Para testar o envio de mensagens via API:

1. Abra o Thunder Client no VS Code
2. Crie uma nova requisição (New Request)
3. Configure a requisição:
   - Método: **POST**
   - URL: `http://localhost:3000/api/chat`

4. Configure os Headers:
   - Clique na aba "Headers"
   - Adicione:
     ```
     Content-Type: application/json
     x-user-id: seu-nome-de-usuario  (opcional)
     ```

5. Configure o Body:
   - Clique na aba "Body"
   - Selecione "JSON" como formato
   - Insira o seguinte JSON:
     ```json
     {
       "message": "Olá, gostaria de saber mais sobre os serviços da KiSite"
     }
     ```

6. Clique em "Send" para enviar a requisição

7. Verifique a resposta:
   - Status: 200 OK
   - Corpo da resposta (exemplo):
     ```json
     {
       "success": true,
       "message": "Olá! Sou o assistente virtual da KiSite. Posso te ajudar com informações sobre nossos serviços...",
       "history": [...]
     }
     ```

8. A conversa será automaticamente salva no diretório `conversas/` com o nome do arquivo baseado no ID do usuário fornecido no header `x-user-id` (ou "web_user.txt" se não for especificado).

## Configuração de Segurança e CORS

A API foi configurada com políticas de CORS específicas para garantir acesso seguro apenas dos domínios autorizados:

- https://www.kisite.com.br
- http://localhost:3000

### Headers de Segurança Implementados

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## Como Consumir a API

### Exemplo de Requisição

```javascript
const API_URL = 'http://seu-backend:porta/api'; // Substitua pela URL do backend

async function callApi() {
    try {
        const response = await fetch(`${API_URL}/seu-endpoint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer seu-token' // Se necessário
            },
            credentials: 'include', // Importante para enviar cookies/credenciais
            body: JSON.stringify({
                // seus dados aqui
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao chamar API:', error);
    }
}
```

### Exemplo em React

```typescript
// api.ts - Arquivo de configuração da API
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://seu-backend:porta/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Importante para enviar cookies/credenciais
});

export default api;

// ExemploComponente.tsx - Componente React usando a API
import React, { useState, useEffect } from 'react';
import api from './api';

interface Message {
    userId: string;
    message: string;
    response: string;
}

const ExemploComponente: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState<Message | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data } = await api.post<Message>('/chat', {
                message,
                userId: 'exemplo-usuario'
            });
            
            setResponse(data);
        } catch (err) {
            setError('Erro ao enviar mensagem. Tente novamente.');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem"
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar'}
                </button>
            </form>

            {error && <div style={{ color: 'red' }}>{error}</div>}
            
            {response && (
                <div>
                    <h3>Resposta:</h3>
                    <p>{response.response}</p>
                </div>
            )}
        </div>
    );
};

export default ExemploComponente;

// Hook personalizado para reutilização
import { useState, useCallback } from 'react';

interface UseApiResponse<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    makeRequest: (endpoint: string, options?: RequestInit) => Promise<void>;
}

export function useApi<T>(): UseApiResponse<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const makeRequest = useCallback(async (endpoint: string, options?: RequestInit) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.request({
                url: endpoint,
                ...options
            });
            setData(response.data);
        } catch (err) {
            setError('Erro na requisição. Tente novamente.');
            console.error('Erro:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, makeRequest };
}
```

O exemplo acima inclui:
- Configuração do Axios para requisições
- Componente React funcional com TypeScript
- Gerenciamento de estado com useState
- Tratamento de loading e erros
- Hook personalizado para reutilização
- Tipagem completa com TypeScript
- Formulário básico com exemplo de envio

### Configurações CORS Implementadas

```javascript
{
    origin: [
        'https://www.kisite.com.br',
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600, // Cache preflight por 10 minutos
    credentials: true // Permite credenciais (cookies, headers de autorização)
}
```

### Características de Segurança

1. **Domínios Restritos**: Apenas os domínios autorizados podem acessar a API
2. **Suporte a Credenciais**: Configurado para trabalhar com cookies e tokens de autenticação
3. **Cache de Preflight**: Otimizado para reduzir requisições OPTIONS
4. **Headers de Segurança**: Proteção contra ataques comuns como XSS e clickjacking

### Métodos HTTP Suportados

- GET: Buscar dados
- POST: Criar novos recursos
- PUT: Atualizar recursos existentes
- DELETE: Remover recursos
- OPTIONS: Preflight CORS

### Headers Permitidos

- Content-Type
- Authorization

### Headers Expostos

- Content-Range
- X-Content-Range

## Tratamento de Erros

A API inclui tratamento robusto de erros, incluindo:

- Logging automático de erros
- Tratamento de exceções não capturadas
- Tratamento de rejeições de promises
- Respostas de erro padronizadas

## Desenvolvimento

Para desenvolver localmente:

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente
4. Execute: `npm start`

## Segurança

- Utiliza Helmet para proteção contra vulnerabilidades comuns
- CORS configurado para permitir apenas domínios específicos
- Headers de segurança personalizados
- Suporte a autenticação via tokens 

## Expondo o Servidor para a Internet

Este projeto utiliza PM2 (Process Manager) e ngrok para expor o servidor local para a internet de forma segura e gerenciável.

### Pré-requisitos

1. Instale as dependências globais:
```bash
npm install -g ngrok pm2
```

2. Registre-se em [ngrok.com](https://ngrok.com) e configure seu authtoken:
```bash
ngrok authtoken seu_token_aqui
```

### Estrutura de Arquivos

#### ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: "agente-kisite",
    script: "./index.js",
    watch: true,
    env: {
      "NODE_ENV": "development",
    },
    env_production: {
      "NODE_ENV": "production"
    },
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    log_file: "./logs/combined.log",
    time: true,
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 4000
  }]
}
```

#### start-server.js
```javascript
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
                    authtoken: process.env.NGROK_AUTH_TOKEN
                });
                
                console.log('=================================');
                console.log('🚀 Servidor iniciado com sucesso!');
                console.log(`📡 URL Local: http://localhost:${SERVER_CONFIG.port}`);
                console.log(`🌎 URL Pública: ${url}`);
                console.log('=================================');
                
                require('fs').writeFileSync('ngrok-url.txt', url);
                
            } catch (ngrokError) {
                console.error('Erro ao iniciar ngrok:', ngrokError);
                exec('pm2 stop all');
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

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

startServer();
```

### Scripts Disponíveis

No package.json, você encontrará os seguintes scripts:

```json
{
  "scripts": {
    "start": "node index.js",
    "start:prod": "node start-server.js",
    "stop": "pm2 stop all",
    "logs": "pm2 logs",
    "status": "pm2 status"
  }
}
```

### Como Usar

1. **Iniciar o Servidor**:
```bash
npm run start:prod
```

2. **Verificar Status**:
```bash
npm run status
```

3. **Visualizar Logs**:
```bash
npm run logs
```

4. **Parar o Servidor**:
```bash
npm run stop
```

### Características

#### PM2
- Gerenciamento de processos Node.js
- Reinício automático em caso de falhas
- Logs organizados
- Monitoramento de performance

#### ngrok
- Túnel seguro HTTPS
- URL pública acessível
- Painel de administração web
- Inspeção de tráfego
- Proteção contra DDoS básica

### Observações Importantes

1. **URL do ngrok**:
   - Na versão gratuita, a URL muda a cada reinicialização
   - Para URL fixa, considere o plano pago

2. **Segurança**:
   - Mantenha o `authtoken` do ngrok em variáveis de ambiente
   - Configure corretamente o CORS para os domínios permitidos
   - Use HTTPS em produção

3. **Produção**:
   - Esta configuração é ideal para desenvolvimento e testes
   - Para ambiente de produção, considere:
     - Serviços de hospedagem (Heroku, DigitalOcean, AWS)
     - Domínio próprio
     - SSL dedicado

4. **Monitoramento**:
   - Use `npm run status` para verificar a saúde do servidor
   - Logs são salvos em ./logs/
   - A URL pública é salva em ngrok-url.txt

### Troubleshooting

1. **Erro ao iniciar ngrok**:
   - Verifique se o authtoken está configurado
   - Confirme se a porta não está em uso
   - Verifique as variáveis de ambiente

2. **PM2 não inicia**:
   - Verifique os logs com `npm run logs`
   - Confirme se não há outras instâncias rodando
   - Verifique permissões de arquivo

3. **Problemas de conexão**:
   - Confirme se o firewall não está bloqueando
   - Verifique se a porta está correta
   - Teste localmente antes de expor 