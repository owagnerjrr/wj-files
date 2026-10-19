# WJ PDF — proposta de servidor arquivada

## Estado atual

O servidor próprio não será ativado. A página `/ferramentas/pdf` mantém 14 ferramentas locais e encaminha as outras 19 diretamente à ferramenta correspondente no iLovePDF. Os links abrem em nova aba e não transferem arquivos automaticamente. Não há chamada do catálogo ao endpoint legado `/api/pdf-service`.

Os arquivos desta pasta são apenas um estudo anterior, não uma implantação ativa. Não criar serviços pagos nem configurar `WJ_PDF_SERVER_URL` ou `WJ_PDF_AI_ENABLED` para o catálogo atual. Nenhum serviço Render foi contratado.

## Referência histórica (não executar)

## Implantação preparada para revisão

- `Dockerfile`: imagem completa do Stirling PDF, versão fixada 3.2.0, com LibreOffice, Tesseract/OCRmyPDF, Ghostscript e QPDF.
- `settings.yml`: idioma pt-BR, limite de upload 25 MB, limites de concorrência reduzidos, armazenamento de arquivos desativado, sem contas de visitantes, sem analytics. URL remota para PDF permanece desativada conforme orientação de segurança do motor; HTML é recebido como conteúdo/arquivo.
- Marca WJ nos arquivos de logo substituíveis. A imagem conserva avisos e componentes de terceiros; não há relação com o iLovePDF.
- Arquivos temporários remanescentes têm limpeza configurada para idade máxima de uma hora, com verificação a cada cinco minutos. Não divulgar como exclusão imediata; testar a limpeza no servidor implantado.
- `deployment-request.json` descreve o pedido de serviço, sem criar recurso ou cobrança.

A documentação oficial do motor recomenda 4 GB para a imagem completa. A tabela pública Render consultada em 19/10/2026 lista `2c-4g` (2 CPU, 4 GB) por US$ 85/mês, sem incluir impostos, excedentes ou câmbio. Plano de compute é independente do plano do workspace. Nenhum plano pago foi contratado nesta alteração.

Fontes: https://docs.stirlingpdf.com/Server/Install/Docker/ e https://render.com/pricing

## Passos após decisão do proprietário

1. Confirmar o workspace Render `My Workspace` (id `tea-db1atimgekts73d093c0`) e o orçamento antes de criar o serviço.
2. Criar o serviço Docker com `deployment-request.json` no workspace confirmado. Validar o build e o estado live.
3. Verificar cada fluxo com arquivos de amostra: Office nos dois sentidos, OCR em português, compressão, reparo, senhas, PDF/A, assinaturas, formulários, redaction e comparação. Confirmar que o motor não expõe funções administrativas nem arquivos entre visitantes.
4. Testar concorrência, tratamento de erros e limpeza de temporários. Validar limites de pedidos antes de divulgação ampla.
5. Só então configurar `WJ_PDF_SERVER_URL=https://<host-do-servico>` (sem caminho) na Vercel, para preview e production. A configuração pública traz apenas a URL do serviço, sem credenciais.
6. Conferir a prévia da página e promover para produção.

## Inteligência artificial

Os cartões Resumir e Traduzir agora apontam para o iLovePDF. O restante deste parágrafo descreve apenas a antiga proposta de servidor próprio. Não basta ligar uma flag: requerem configurar e testar o motor de IA e um provedor/modelo, além de consentimento/orçamento para processamento dos documentos. `WJ_PDF_AI_ENABLED` deve continuar ausente ou false até a integração estar validada. A imagem básica não inclui o motor de IA; a imagem fat tem recomendação de memória maior. Não prometer preservação perfeita de layout na tradução.

## Bibliotecas locais

Word para PDF aceita DOCX e usa `docx-preview` com a impressão nativa do navegador; o usuário escolhe Salvar como PDF. PDF para Word extrai texto com `pdfjs-dist` e gera um DOCX simples com `docx`, sem imagens ou diagramação original. Nenhuma dessas duas funções depende do servidor pago.

`pdf-lib` manipula páginas e texto adicionado. `pdfjs-dist` renderiza PDF para JPG e extrai texto simples para Markdown. `jszip` empacota páginas/imagens para download. Assets de worker, fontes e CMaps são copiados localmente no build. Não existe envio de arquivos por essas ferramentas locais.
