# Protótipo Blockchain para Processamentos Seguros

Autora: Pietra Caracco Ruiz  
Matrícula: HT3038513

Este protótipo acompanha o relatório acadêmico sobre blockchain aplicada à inclusão segura de séries de processamentos. A proposta demonstra, de forma prática, como mecanismos criptográficos podem ser combinados para registrar eventos com integridade, autenticação, rastreabilidade e apoio à auditoria.

## Objetivo

Registrar séries de processamentos em blocos encadeados, assinados digitalmente e protegidos por prova de trabalho. O protótipo mostra que, após a inclusão de um processamento na cadeia, alterações posteriores são detectadas durante a validação.

## Relação com o estudo

O trabalho considera os temas de segurança da informação, segurança em software, fator humano e auditoria. A blockchain é usada como uma trilha de registro verificável, mas não substitui controles organizacionais, gestão de chaves, controle de acesso, revisão humana e procedimentos formais de auditoria.

## Mecanismos implementados

- SHA-256 para gerar o hash criptográfico dos blocos.
- Encadeamento por `previousHash`, ligando cada bloco ao bloco anterior.
- Prova de trabalho com `nonce` e dificuldade configurável.
- Assinatura digital RSA-SHA256 para autenticar o conteúdo de cada bloco.
- Verificação de assinatura com chave pública.
- Serialização determinística com `canonicalJson`.
- Validação completa da cadeia.
- Simulação de adulteração para comprovar a detecção de alterações.

## Estrutura do código

- `canonicalJson`: gera uma representação estável dos dados antes de aplicar hash ou assinatura.
- `sha256`: calcula o resumo criptográfico.
- `generateIdentity`: cria par de chaves RSA para uma entidade.
- `signPayload`: assina o conteúdo essencial de um bloco.
- `verifyPayload`: verifica a assinatura digital.
- `Block`: representa um bloco da cadeia.
- `Blockchain`: cria, minera, adiciona e valida blocos.
- `demo`: executa um cenário completo com processamentos e adulteração simulada.

## Como executar

No terminal, dentro da pasta `prototipo`, execute:

```bash
npm start
```

ou:

```bash
node blockchain.js
```

## Resultado esperado

O programa deve:

1. Criar identidades criptográficas.
2. Criar o bloco gênese.
3. Adicionar blocos com séries de processamentos.
4. Minerar os blocos usando prova de trabalho.
5. Validar a blockchain com sucesso.
6. Alterar propositalmente um registro.
7. Detectar a adulteração por erro de hash e assinatura inválida.

Exemplo de resultado final:

```text
Blockchain valida? SIM

Blockchain valida apos alterar um registro? NAO
Erros encontrados:
- Bloco 1: hash armazenado nao confere com o conteudo.
- Bloco 1: assinatura digital invalida.
```

## Limitações

Este é um protótipo acadêmico. Em um sistema real, seria necessário acrescentar persistência, controle de usuários, armazenamento seguro de chaves privadas, revogação de chaves, backups, logs operacionais, interface de consulta, validação de permissões e políticas de auditoria.
