// Cadastro manual; datas da redação e das fontes são distintas.
import {localPublishedArticles} from './localArticles.js';
export const articles = [
 ...localPublishedArticles,
 {
 slug:'esp32-agenda-nextcloud',storyKey:'esp32-nextcloud-desktop-calendar',featuredType:'secondary',
 title:'Uma agenda de mesa com ESP32 coloca os compromissos fora do celular',
 subtitle:'Projeto independente combina uma pequena tela LCD com o Nextcloud e dá à agenda digital uma presença física.',
 category:'tecnologia',tags:['Hardware','Tecnologia'],illustration:'circuit',author:'Redação WJ Files',publishedAt:'2026-09-20T08:00:00-03:00',status:'published',
 content:[
 {heading:'A informação que fica à vista',text:'Um calendário dedicado à mesa foi o caminho escolhido pelo usuário wemayln para consultar compromissos sem abrir outra tela. Segundo reportagem do Hardware.com.br, o projeto conecta um ESP32 a um LCD de duas linhas e 16 caracteres por linha. A agenda vem do Nextcloud, acessado pela rede Wi-Fi.'},
 {heading:'Como a agenda chega ao display',text:'O aparelho consulta calendários por CalDAV e processa eventos em formato ICS. Também consegue aproveitar calendários externos que já estejam assinados no Nextcloud. Na configuração descrita pela reportagem, aparecem os compromissos dos próximos sete dias; a tela alterna entre eles a cada cinco segundos e atualiza a lista a cada meia hora.'},
 {heading:'Pequeno por escolha',text:'O espaço reduzido exige abreviar os textos. O autor escolheu essa limitação para manter um dispositivo minimalista, econômico e com aparência retrô. A versão final relatada usa ESP32-WROOM, alimentação USB de 5 V e ajuste de contraste por potenciômetro.'},
 {heading:'Antes de reproduzir',text:'Trata-se de uma montagem independente, não de um produto anunciado para venda. A reportagem apresenta o projeto; não substitui documentação de montagem ou avaliação das conexões.'}],
 sources:[{name:'Hardware.com.br',title:'Entusiasta cria calendário de mesa com ESP32 para consultar a agenda sem celular',publishedAt:'2026-09-19',url:'https://www.hardware.com.br/noticias/esp32-calendario-nextcloud-display-lcd/'}],videos:[],relatedContent:['investigacao-postuma-switch-android']
 },
 {
 slug:'investigacao-postuma-switch-android',storyKey:'posthumous-investigation-switch-android-launch',featuredType:'primary',
 title:'A Investigação Póstuma leva o mistério de Brás Cubas ao Switch e ao Android',
 subtitle:'A aventura brasileira amplia suas plataformas com um caso em que repetir o dia faz parte do trabalho do detetive.',
 category:'games',tags:['Games','Nintendo','PC'],illustration:'detective',
 coverImage:'https://mothergaia.com.br/press/the_posthumous_investigation/images/header.png',
 imageCredit:{text:'© Mother Gaia Studio — material do press kit oficial.',url:'https://mothergaia.com.br/press/sheet.php?p=the_posthumous_investigation'},
 author:'Redação WJ Files',publishedAt:'2026-09-20T07:50:00-03:00',status:'published',
 content:[
 {heading:'Um caso brasileiro em novas telas',text:'A Investigação Póstuma chegou ao Nintendo Switch e ao Android, conforme a cobertura do Arkade publicada em 17 de setembro. A edição para iOS ainda estava em preparação naquela data. No celular, uma demonstração permite conhecer o início da aventura antes de comprar o restante.'},
 {heading:'A vítima também é o cliente',text:'A Mother Gaia Studio situa o mistério em uma versão noir do Rio de Janeiro de 1937. O detetive é contratado por Brás Cubas para investigar a morte do próprio cliente. Personagens inspirados na literatura de Machado de Assis entram na trama, que mistura investigação e repetição temporal.'},
 {heading:'Repetir para compreender',text:'O press kit descreve 14 suspeitos com rotinas ao longo do dia. Observar deslocamentos, conversar e reunir pistas são partes do processo. O ciclo temporal permite aprender com uma tentativa e influenciar acontecimentos em outra: conhecer os horários pode ser tão relevante quanto encontrar uma evidência.'},
 {heading:'O que muda nos portáteis',text:'Segundo o Arkade, as novas versões incorporam correções e melhorias posteriores ao lançamento no PC. Há ajuste do tamanho do texto; no celular, o jogador pode usar toque ou um controle compatível. A disponibilidade de iOS deve ser conferida novamente na loja antes de planejar a compra.'},
 {heading:'Uma boa forma de conhecer a proposta',text:'Para quem quer avaliar o ritmo da investigação, a demo citada na cobertura é um ponto de partida. O interesse aqui está em acompanhar personagens e reconstruir o caso, e não apenas em correr para a próxima cena. Essa é nossa leitura da proposta apresentada pelo estúdio, não uma análise baseada em uma partida completa.'}],
 sources:[{name:'Arkade',title:'A Investigação Póstuma já está disponível no Nintendo Switch e Android; a versão de iOS chega em breve',publishedAt:'2026-09-17',url:'https://arkade.com.br/a-investigacao-postuma-ja-esta-disponivel-no-nintendo-switch-e-android-a-versao-de-ios-chega-em-breve/'},{name:'Mother Gaia Studio',title:'The Posthumous Investigation — press kit',publishedAt:null,url:'https://mothergaia.com.br/press/sheet.php?p=the_posthumous_investigation'}],
 videos:[{youtubeId:'c6HmBNxV5cc',title:'A Investigação Póstuma — teaser de gameplay',credit:'Vídeo disponibilizado no press kit da Mother Gaia Studio. Teaser anterior ao lançamento nos portáteis.',sourceUrl:'https://mothergaia.com.br/press/sheet.php?p=the_posthumous_investigation'}],relatedContent:['core-keeper-riders-underground']
 },
 {
 slug:'core-keeper-riders-underground',storyKey:'core-keeper-1-3-riders-release',featuredType:'secondary',
 title:'Core Keeper prepara montarias e novas rotas pelo subterrâneo',
 subtitle:'Riders of the Underground está previsto para 21 de setembro; a atualização gratuita amplia as formas de explorar.',
 category:'games',tags:['Games','Nintendo','PlayStation','Xbox','PC'],illustration:'cave',author:'Redação WJ Files',publishedAt:'2026-09-20T07:40:00-03:00',status:'published',
 content:[
 {heading:'Uma atualização para quem gosta de explorar',text:'Core Keeper receberá Riders of the Underground em 21 de setembro, segundo anúncio do jogo e cobertura do GameVicio. O conteúdo será gratuito para jogadores de PC e consoles. A novidade central é a possibilidade de usar animais como montarias, tornando o deslocamento uma parte mais variada da aventura.'},
 {heading:'Selas e um novo caminho entre os abismos',text:'O anúncio oficial explica que uma sela permitirá montar o gado do jogo. Fora da montaria, será possível definir se o animal fica parado, circula ou segue o jogador. Já o Hookshot permite atravessar pequenos vãos quando existe um ponto para prender o gancho; a equipe ressalta que ele não elimina toda necessidade de construir pontes.'},
 {heading:'O que há além do transporte',text:'A versão 1.3 também introduz o sub-bioma Moss nas Ruínas Esquecidas. O comunicado descreve mudanças nas árvores de magia e invocação, novas armas para esses estilos e novos mascotes. A lista completa de alterações deverá acompanhar as notas da atualização.'},
 {heading:'Onde e quando acompanhar',text:'O GameVicio informa lançamento para PC, Nintendo Switch e Switch 2, PlayStation 4 e 5, Xbox One e Xbox Series X|S. A data anunciada não equivale a um horário confirmado de liberação em todas as lojas. Vale consultar o comunicado oficial e a atualização disponível na plataforma em que você joga.'},
 {heading:'Por que merece atenção',text:'Nossa leitura é que a mudança torna o trajeto entre objetivos parte da novidade, em vez de concentrar tudo em equipamentos. Ainda é uma expectativa a partir do anúncio: o impacto no ritmo de exploração só poderá ser avaliado com a atualização disponível.'}],
 sources:[{name:'GameVicio',title:'Atualização gratuita Riders of the Underground de Core Keeper chega em 21 de setembro',publishedAt:'2026-09-14',url:'https://www.gamevicio.com/noticias/2026/09/riders-of-the-underground-de-core-keeper-chega-em-setembro/'},{name:'Core Keeper — comunicados oficiais',title:'Riders of the Underground — anúncio da atualização 1.3',publishedAt:'2026-09-10',url:'https://steamcommunity.com/app/1621690/announcements/?l=english'}],
 videos:[{youtubeId:'J8O59ZxWA6c',title:'Core Keeper — Riders of the Underground',credit:'Trailer indicado pela equipe de Core Keeper no comunicado oficial da atualização.',sourceUrl:'https://steamcommunity.com/app/1621690/announcements/?l=english'}],relatedContent:['investigacao-postuma-switch-android']
 }
];
