# Pasta de Treinamento - Agente KiSite

Esta pasta contém os arquivos de treinamento para o Agente KiSite. Os arquivos são organizados em temas específicos e contêm as informações que o agente utiliza para responder às perguntas dos usuários.

## Estrutura de Arquivos

A pasta contém os seguintes arquivos JSON:

1. **empresa.json** - Informações gerais sobre a KiSite, incluindo descrição, contato e história
2. **servicos.json** - Detalhes sobre os serviços oferecidos pela empresa
3. **site_essencial.json** - Informações específicas sobre o produto Site Essencial
4. **agente_inteligente.json** - Informações específicas sobre o produto Agente Inteligente
5. **estatisticas.json** - Dados estatísticos, diferenciais e funcionalidades adicionais

## Como Adicionar ou Modificar Informações

### Adicionando Dados a um Tema Existente

Para adicionar ou modificar dados em um tema existente, basta editar o arquivo JSON correspondente, mantendo a estrutura de campos existente.

### Criando um Novo Tema

Para criar um novo tema:

1. Crie um novo arquivo JSON na pasta `treinamento/` com o nome do tema (ex: `novo_tema.json`)
2. Estruture o conteúdo no formato JSON seguindo os padrões dos outros arquivos
3. Atualize o arquivo `src/services/companyService.js` para incluir o novo tema na lista de temas carregados
4. Adicione lógica de processamento para o novo tema, se necessário

### Formato dos Arquivos

Cada arquivo deve seguir o formato JSON válido. Recomenda-se organizar os dados em campos lógicos para facilitar o acesso e a manutenção.

## Exemplo de Uso

Os dados nestes arquivos são utilizados pelo sistema de duas formas:

1. No arquivo `companyService.js` para respostas diretas a perguntas específicas
2. No arquivo `aiService.js` para enriquecer o contexto do processamento de IA

## Verificação de Temas Disponíveis

Você pode verificar os temas disponíveis e suas estruturas através do endpoint:

```
GET /api/treinamento
```

Este endpoint retorna os temas carregados e a estrutura de campos de cada tema. 