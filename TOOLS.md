# Ferramentas da WJ

Página pública: `/ferramentas`. QR Code processado no navegador, com a biblioteca `qrcode` empacotada localmente por esbuild. Não usa API externa de QR. O build gera `public/tools.bundle.js` e copia tudo para `dist`.

## Encurtador

- `POST /api/shorten` recebe JSON `{ "url": "https://example.com" }` e retorna `{ "code": "abcdefgh" }`.
- `/s/abcdefgh` consulta o destino salvo e responde com redirecionamento HTTP 302.
- Variável privada `SHORTLINK_DATABASE_URL` configurada na Vercel, apontando para o projeto separado `wj-files-tools` no Neon. Não expor no navegador.
- Esquema versionado em `migrations/001-short-links.sql`. Tabelas já provisionadas; nenhuma criação de tabela acontece durante os pedidos.
- Códigos aleatórios de 8 caracteres, sem vencimento automático. Cada destino tem no máximo 2.048 caracteres. Não aceita protocolos executáveis, credenciais, IPs literais ou endereços locais.
- Limite compartilhado no banco: 20 tentativas válidas/hora por conexão e 1.000/dia no total. IP é transformado por HMAC; endereços IP não são salvos em texto. Contadores antigos expiram e são limpos nas próximas criações.
- A coluna `disabled` permite desativar individualmente um link pelo banco em caso de abuso. Não há listagem pública de destinos nem painel administrativo exposto.

## Desenvolvimento e verificação

`npm ci`, `npm run build`, `npm test`. Para testar o encurtador no servidor local, injete `SHORTLINK_DATABASE_URL` no ambiente antes de `npm start`. Não envie credenciais ao repositório.

`scripts/verify-tools-live.mjs` recebe uma linha JSON por stdin com a chave `databaseUrl` e verifica criação, leitura, redirecionamento e rejeições. Cria um link de verificação para a página pública de dicas. Os testes normais não precisam de credenciais; decodificam QR Codes e conferem validação de URLs e respostas de erro.
