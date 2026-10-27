# Deixa no mar

Site de protesto ao tráfico internacional de pepinos-do-mar, construído com SvelteKit 3 e Svelte 5. Inclui escultura ASCII procedural com sedimento, cenas de scroll com GSAP, protagonista animado, manifesto, fontes, fotografias e vídeo de licença aberta, cartaz personalizável com exportação PNG e link para denúncia ao Ibama.

Requer Node.js 22.12 ou superior.

```sh
npm ci
npm run dev
```

Para verificar e gerar a versão de publicação:

```sh
npm run check
npm run build
npm run preview
```

Para verificar se as ilustrações acompanham o scroll, mantenha o servidor de desenvolvimento rodando e execute `npm run check:traffic`. O teste usa Chrome/Chromium instalado no computador e compara o canvas com a ilustração esperada em cada etapa, em desktop e emulação mobile. Para outra porta, defina `TRAFFIC_URL`. Se o navegador não for encontrado, defina `CHROME_PATH` com o caminho do executável.

O adaptador estático grava a página pré-renderizada em `build/`. Os arquivos dessa pasta podem ser publicados em uma hospedagem estática. A leitura e os links funcionam sem JavaScript; a interação com o animal e a exportação do cartaz usam componentes Svelte.

Os componentes ficam em `src/lib/components/`, a página em `src/routes/+page.svelte` e os tokens visuais em `src/lib/styles.css`. `AsciiOcean.svelte` renderiza uma superfície 3D em caracteres usando canvas. A estrutura das cenas está em `src/lib/motion/scene-stage.js`. O scroll permanece nativo. As animações respeitam a preferência de movimento reduzido do sistema. As imagens, o vídeo, Gambarino e General Sans e suas licenças ficam em `static/assets/`. Os créditos estão no rodapé e em `static/assets/credits.json`.

A campanha, o nome e os textos são originais. O protagonista é uma ilustração gerada com IA. O conteúdo informativo se baseia nas fontes linkadas na página. O link do G1 foi preservado como motivação; o artigo não pôde ser consultado na implementação.
