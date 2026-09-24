# Três Corações e fluxo editorial local

O portal `/tres-coracoes` reutiliza cards, matérias, fontes, imagens, vídeos e URLs `/noticias/:slug`. Há busca e filtros Cidade, Cultura, Esportes, Educação, Serviços e Eventos. O recorte exige `location.city`, `state` e `country` correspondentes a Três Corações/MG/BR; o assunto fica em `subcategory`. A página começa sem notícias locais e apresenta esse estado sem inventar conteúdo.

Este bloco oferece ferramentas locais por comando, não um painel online com login. Não foi criada conta, credencial, banco ou serviço externo. O cadastro existente foi preservado. `articles.js` agrega o cadastro local aprovado sem duplicar renderizadores.

## Criar e revisar

Na pasta do projeto:

```powershell
npm.cmd run editorial -- new titulo-da-materia
npm.cmd run editorial -- list
```

Edite o arquivo JSON indicado em `.editorial/titulo-da-materia.json`. Essa pasta é ignorada pelo Git, fica fora de `public` e não é copiada para `dist`. Contém rascunhos, rejeitados, notas e backups de exportação. Faça backup privado separado se precisar preservar esse trabalho em outro computador. Não envie a pasta ao GitHub: o repositório é público.

Preencha título, resumo, autor, localização, subcategoria, assuntos, data de publicação e pelo menos quatro blocos de texto original. Registre fontes com nome, título, URL HTTPS e data original (ou `null` quando desconhecida). Use apenas imagens permitidas e registre crédito/origem; sem capa, aparece uma ilustração editorial identificada como tal. Vídeos usam IDs de YouTube e fonte oficial, sem download do vídeo.

```powershell
npm.cmd run editorial -- check titulo-da-materia
npm.cmd run editorial -- reject titulo-da-materia
npm.cmd run editorial -- reopen titulo-da-materia
```

`check` verifica formato, datas, fontes, mídia, duplicatas e destaque principal. Não confirma fatos, direitos autorais ou a disponibilidade dos links: essa revisão continua humana. `reject` não apaga arquivos e não retira uma matéria já publicada; `reopen` devolve um rascunho à edição, sem mudar o conteúdo online.

## Aprovar e exportar

Depois da revisão factual, textual e dos direitos de mídia:

```powershell
npm.cmd run editorial -- publish titulo-da-materia --reviewed
npm.cmd test
npm.cmd run build
git diff
```

A exportação grava apenas os campos públicos aprovados em `public/data/localArticles.js`, preserva outras matérias e guarda uma cópia anterior em `.editorial/backups`. Não sobrescreve um slug do cadastro legado. `reviewNotes` e campos extras de blocos/fontes não são exportados. Rejeitados não podem ser publicados sem reabrir como rascunho.

Publicar pelo comando significa preparar a versão local: **não faz commit, push ou deploy automaticamente**. Confira o site local, revise o diff e envie somente o cadastro público pelo fluxo Git/GitHub já utilizado. O build também rejeita registros locais não publicados ou diferentes da projeção aprovada. Nenhuma coleta automática foi implementada.

Para corrigir uma matéria local já exportada, edite seu rascunho existente, execute `check` e exporte novamente. O slug deve permanecer igual para preservar a URL. A remoção de uma publicação não é automatizada neste bloco.

## Limites desta entrega

- Sem novas notícias locais factuais cadastradas ou conteúdo fictício publicado.
- Sem login ou painel remoto; essa implantação exige decisão de serviço e configuração de acesso em etapa própria.
- Sem parceiros, recomendações, scraping, analytics ou mudanças de domínio.
- Header, calendário, investigadores e especial Zelda preservados; acesso local pela Home, rodapé e busca.
- A Vercel ganha somente os rewrites da nova rota, mantendo o mesmo projeto e mecanismo de deploy.
