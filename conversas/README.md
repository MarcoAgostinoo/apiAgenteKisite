# Diretório de Conversas

**ATENÇÃO: Este diretório contém dados sensíveis de conversas com clientes!**

## Propósito

Esta pasta armazena todas as conversas entre os clientes e o assistente virtual da KiSite. Cada arquivo representa a conversa com um cliente individual, cujo nome é derivado do número de telefone ou ID de usuário.

## Privacidade e Segurança

Por razões de privacidade e segurança:

1. **Dados Sensíveis**: Os arquivos nesta pasta contêm informações potencialmente sensíveis e confidenciais.
2. **Exclusão do Repositório**: Esta pasta está configurada no `.gitignore` para NÃO ser incluída no repositório Git.
3. **Apenas Local**: Os arquivos devem permanecer apenas no servidor local onde o sistema está em execução.
4. **Retenção Limitada**: Conversas com mais de 60 dias são automaticamente excluídas no primeiro dia de cada mês.

## Estrutura de Arquivos

Cada arquivo segue o formato `ID_DO_USUARIO.txt` e contém histórico cronológico de mensagens:

```
[DATA E HORA]
Usuário: Mensagem recebida do cliente
KiSite: Resposta enviada pelo sistema

[DATA E HORA]
Usuário: Próxima mensagem
KiSite: Próxima resposta
```

## Backup

Se você precisar fazer backup do sistema, certifique-se de incluir esta pasta manualmente, pois ela não será incluída em operações normais de Git.

**Lembre-se**: O tratamento adequado desses dados é sua responsabilidade. Siga as melhores práticas de proteção de dados e privacidade. 