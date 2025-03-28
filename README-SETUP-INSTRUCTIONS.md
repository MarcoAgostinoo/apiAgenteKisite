# Instruções para Configuração do Agente KiSite

## Visão Geral do Projeto

Este projeto é um agente de IA para atendimento automático via WhatsApp para a empresa KiSite. O sistema utiliza:

- **Node.js e Express**: Para o backend e API
- **WhatsApp Web.js**: Para integração com WhatsApp
- **LM Studio**: Para processamento de IA local (compatível com API OpenAI)

## Requisitos

- **Node.js**: v16 ou superior
- **LM Studio**: Aplicativo desktop para rodar modelos de IA localmente
- **WhatsApp**: Acesso a uma conta WhatsApp para escanear o QR code

## Passos para Configuração

1. **Instalar Dependências**:
   ```bash
   npm install
   ```

2. **Instalar LM Studio**:
   - Baixe o LM Studio em: https://lmstudio.ai/
   - Instale e configure um modelo (recomendado: Llama 3.2 1B Instruct)
   - Inicie o servidor local na porta 1234

3. **Configurar Variáveis de Ambiente**:
   - O arquivo `.env` já está configurado com valores padrão
   - Ajuste o `LM_STUDIO_API_URL` para apontar para sua instância local do LM Studio
   - Verifique se o `LM_STUDIO_MODEL` corresponde ao modelo que você está usando

4. **Criar Diretórios Necessários**:
   ```bash
   mkdir -p logs
   ```
   (O diretório "conversas" já existe no projeto)

## Execução do Projeto

1. **Iniciar o Servidor**:
   ```bash
   npm start
   ```

2. **Autenticação do WhatsApp**:
   - Um código QR será exibido no terminal
   - Escaneie-o com seu WhatsApp (Configurações > Dispositivos Conectados > Vincular Dispositivo)
   - Uma vez autenticado, o cliente WhatsApp estará pronto

3. **Testar a API**:
   - Acesse `http://localhost:3000/api/health` para verificar o status
   - A API estará disponível em `http://localhost:3000/api`

## Estrutura do Projeto

- **src/**: Contém todo o código-fonte do projeto
  - **controllers/**: Controladores da API
  - **services/**: Lógica de negócios e serviços
  - **middlewares/**: Middlewares Express
  - **config/**: Configurações do sistema
  - **utils/**: Utilitários e funções auxiliares
- **conversas/**: Armazena históricos de conversas
- **companyData.json**: Dados da empresa utilizados pelo agente

## Nota Importante

Para que o projeto funcione corretamente:

1. O LM Studio deve estar rodando antes de iniciar o servidor
2. A API do LM Studio deve estar acessível na URL configurada no `.env`
3. O modelo selecionado deve ser compatível com as solicitações feitas pelo serviço AI

## Solução de Problemas

Se encontrar problemas:

1. **Erro de Conexão com LM Studio**: Verifique se o servidor LM Studio está rodando e acessível
2. **Erro na Autenticação WhatsApp**: 
   - Apague a pasta `.wwebjs_auth` se existente
   - Reinicie o aplicativo e tente novamente
3. **Problemas com NPM**: 
   - Tente `npm cache clean --force` seguido de `npm install`
   - Verifique se sua versão do Node.js é compatível (use nvm se necessário)

---

Para mais detalhes, consulte o arquivo `SETUP.md` no projeto. 