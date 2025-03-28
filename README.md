# API Agente KiSite

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