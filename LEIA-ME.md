# WJ Files — versão local reconstruída

Esta é uma nova implementação baseada no histórico e nas imagens recuperadas. Não é o código original do outro computador.

## Executar no Windows

Abra o PowerShell na pasta deste arquivo e execute:

```powershell
npm.cmd run dev
```

Abra http://localhost:5173 no navegador. Para parar o servidor, pressione Ctrl+C no terminal. É necessário Node.js instalado. Não há dependências externas a instalar; npm install é opcional. Se a porta estiver ocupada, use `$env:PORT=5174` antes de iniciar.

## Implementado

- Página inicial responsiva com identidade WJ Files.
- Dossiê /zelda com história, locais, guia de músicas, personagens e links de pesquisa em lojas.
- Filtros de categorias e lojas, busca local e páginas de categorias com estado vazio explícito.
- Imagens recuperadas do histórico, servidas localmente.
- Servidor local restrito ao próprio computador.

## Ainda não implementado

Painel administrativo, login, Firebase, banco de dados, uploads, publicação de notícias e reprodução de áudio. As categorias vazias não representam artigos publicados. Os links de lojas são pesquisas externas, sem consulta automática de preço ou estoque. As imagens foram preservadas como referências enviadas no histórico; não são comprovação de anúncio comercial ou lançamento.

## Arquivos

`public/app.js`: páginas, textos e interações. `public/style.css`: aparência. `public/assets`: imagens. `server.mjs`: servidor. As fontes usam Google Fonts quando há internet e fontes locais alternativas quando não há.

Esta primeira versão usa HTML, CSS e JavaScript sem dependências para facilitar o teste local. A migração para React e a integração com Firebase permanecem etapas posteriores.

## Evolução editorial — primeira fase (19/09/2026)
A interface atual usa public/portal.js e public/portal.css sobre a base existente. O especial Zelda e os assets anteriores foram preservados. identity.js permanece no repositório como implementação anterior, mas não é carregado.

Execute npm run build para validar módulos e copiar os arquivos estáticos para dist. Execute npm test para validar datas e o contrato do serviço da agenda. Não há novas dependências.

A agenda usa exclusivamente fixtures identificadas como DEMONSTRAÇÃO em public/data/events.js. Notícias ficam em public/data/articles.js, inicialmente vazio. O feed contém paginação progressiva de seis itens; o botão só aparece quando houver mais publicações. Não existem notícias reais inventadas. Categorias vazias exibem estados explícitos. Contato e política definitiva ainda precisam de configuração editorial antes da publicação.

Firebase, autenticação, administração e publicação externa não foram implementados. O servidor continua local e pode usar PORT para selecionar outra porta.
