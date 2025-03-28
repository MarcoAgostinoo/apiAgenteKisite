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