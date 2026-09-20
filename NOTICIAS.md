# Notícias — cadastro e revisão editorial

Os textos ficam em public/data/articles.js. Cada matéria tem slug estável, storyKey (identificador do acontecimento para evitar duplicação entre fontes), categoria, tags, data do WJ Files, blocos de texto, fontes com data original, créditos de imagem e vídeos. As páginas internas usam /noticias/slug. Não importar HTML de terceiros: o renderer usa textContent.

Fluxo futuro: consultar RSS/API autorizado → agrupar por acontecimento → confirmar fatos → escrever texto original → revisar direitos de imagem e canal do vídeo → aprovar manualmente → publicar. O cadastro pode ser substituído por uma fonte de dados com o mesmo contrato; nenhuma coleta ou publicação automática foi implementada.

O Arkade expõe https://arkade.com.br/feed/ no rodapé. A existência do feed não autoriza republicação integral nem imagens: verificar termos e frequência antes de integrar. GameVicio, Hardware.com.br e TechTudo permanecem como fontes de pesquisa manual. TechTudo bloqueou a consulta automatizada nesta rodada e nenhum conteúdo seu foi usado.

Primeira seleção pesquisada em 20/09/2026: notícias de 14 a 19/09/2026. Cada matéria registra os links efetivamente consultados. Não confundir a data original com a data da redação WJ Files. Informação sem confirmação não é publicada como fato; interpretação editorial é identificada.

Mídia: imagem de A Investigação Póstuma fornecida pelo press kit da própria Mother Gaia Studio, com crédito e URL. Nenhuma imagem de portal de notícias foi baixada. Capas alternativas são ilustrações vetoriais originais, explicitamente identificadas e sem simular screenshots. Vídeos usam os IDs indicados no press kit do estúdio ou no comunicado oficial de Core Keeper na Steam. O player do YouTube só é carregado após clique; sempre há link alternativo. Não hospedamos vídeo.

Validação: npm.cmd test e npm.cmd run build. Testar também home, filtros, páginas internas, notícia inexistente, busca, largura móvel e carregamento de mídia. Dados de testes não devem entrar no cadastro publicado.
