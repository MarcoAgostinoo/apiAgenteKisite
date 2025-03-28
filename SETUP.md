# Configurando e Executando o Agente KiSite

## Requisitos

1. Node.js (versão 16.x ou superior)
2. NPM (vem com Node.js)
3. Acesso ao WhatsApp (para escanear QR code)
4. LM Studio rodando localmente (ou outro serviço compatível com a API do OpenAI)

## Configuração

### Instalar dependências

```bash
npm install
```

### Configurar variáveis de ambiente

As variáveis de ambiente estão definidas no arquivo `.env`. Atenção especial para:

- **LM_STUDIO_API_URL**: URL para seu servidor LM Studio local (ou outro serviço compatível com API OpenAI)
- **LM_STUDIO_MODEL**: Nome do modelo que está sendo usado no LM Studio
- **PORT**: Porta em que o servidor Express rodará (padrão: 3000)

### Configurar LM Studio

1. Baixe o LM Studio de https://lmstudio.ai/ e instale
2. Inicie o LM Studio e escolha um modelo para rodar localmente
3. Inicie o servidor API (geralmente em http://localhost:1234)
4. Atualize o arquivo `.env` com a URL e o nome do modelo correto

## Executando o Projeto

Para iniciar o servidor:

```bash
npm start
```

Ao iniciar, o aplicativo irá:

1. Gerar um código QR no terminal
2. Você precisa escanear este código com o WhatsApp para autenticar
3. Após a autenticação, o servidor Express será iniciado
4. O agente KiSite estará pronto para receber e processar mensagens

## Funcionalidades

- **API REST**: Disponível em http://localhost:3000/api
- **Processamento WhatsApp**: Mensagens são recebidas, processadas e respondidas automaticamente
- **Armazenamento de Conversas**: As conversas são salvas em arquivos no diretório "conversas"

## Endpoints Disponíveis

- POST `/api/chat`: Processa mensagens via API REST
- GET `/api/conversas`: Lista todas as conversas
- GET `/api/conversas/:userId`: Obtém conversa específica
- POST `/api/conversas/limpar`: Limpa o histórico de conversas
- GET `/api/health`: Verifica o status do sistema

## Solução de Problemas

### Não consigo conectar ao LM Studio

Verifique se:
1. O LM Studio está em execução
2. O servidor API do LM Studio está ativo
3. A URL no arquivo `.env` está correta
4. Não há firewall bloqueando a conexão

### O QR Code não aparece ou a autenticação falha

1. Certifique-se de que o WhatsApp está atualizado
2. Apague a pasta `.wwebjs_auth` e reinicie o projeto
3. Tente outro dispositivo para escanear o QR

### Erros de processamento de mensagens

Se as mensagens não forem processadas corretamente:
1. Verifique os logs
2. Confirme se o modelo LM Studio está funcionando corretamente
3. Teste o endpoint `/api/health` para verificar o status do sistema 