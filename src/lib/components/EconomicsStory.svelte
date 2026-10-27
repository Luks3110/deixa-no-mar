<script>
  const sources = {
    chain:
      "https://www.stockholmresilience.org/publications/publications/2017-11-08-distribution-of-economic-returns-in-small-scale-fisheries-for-international-markets-a-value-chain-analysis.html",
    crime:
      "https://sherloc.unodc.org/cld/uploads/res/bibliography/2020/world-wildlife-crime-report-trafficking-in-protected-species-2020_html/World_Wildlife_Crime_Report_2020_english.pdf#page=105",
    case: "https://www.justice.gov/usao-wdwa/pr/owner-fife-washington-seafood-processing-company-sentenced-prison-sea-cucumber-lacey",
    income: "https://www.aciar.gov.au/project/fis-2010-042",
  };
  const roles = [
    [
      "Coleta",
      "Quem retira do mar recebe pela captura. Informação sobre preços e poder de negociação influenciam quanto fica nessa ponta.",
    ],
    [
      "Intermediação",
      "Compradores reúnem a produção e conectam fornecedores a processadores e mercados. Adiantamentos podem criar dependência e dívida.",
    ],
    [
      "Processamento e exportação",
      "O produto é preparado e revendido. Acesso a compradores e mercados permite capturar parte do valor adicionado.",
    ],
    [
      "Mercado final",
      "A demanda paga pelo produto. O valor e a divisão da receita variam por espécie, qualidade e país. Não existe uma margem única.",
    ],
  ];
</script>

<section
  id="economia"
  class="economics frame"
  aria-labelledby="economics-title"
>
  <div class="economics-heading">
    <p class="eyebrow">Quem ganha. Quem paga.</p>
    <h2 id="economics-title">O lucro viaja.<br />A conta fica.</h2>
    <p>
      Uma venda termina. A perda de renda e de vida no lugar de origem pode
      continuar.
    </p>
  </div>
  <ol class="value-chain">
    {#each roles as role, i}<li>
        <span class="chain-index" aria-hidden="true">0{i + 1}</span>
        <h3>{role[0]}</h3>
        <p>{role[1]}</p>
        {#if i < 3}<span class="chain-arrow" aria-hidden="true">→</span>{/if}
      </li>{/each}
  </ol>
  <p class="chain-source">
    Funções da cadeia, não uma acusação contra toda a atividade: existe comércio
    legal. Preço de venda não é lucro líquido. <a
      href={sources.chain}
      target="_blank"
      rel="noopener noreferrer">Estudo de cadeia de valor, 2017 ↗</a
    >
    ·
    <a href={sources.crime} target="_blank" rel="noopener noreferrer"
      >UNODC, 2020 ↗</a
    >
  </p>
  <div class="economic-bill">
    <article class="documented-case">
      <p class="eyebrow">Um caso condenado · Estados Unidos</p>
      <p class="case-amount"><span>quase</span> US$ 1,5 milhão</p>
      <p class="case-caption">
        de ganho informado pelo Departamento de Justiça em um esquema de compra,
        processamento e venda de pepinos capturados ilegalmente.
      </p>
      <p>
        Em 28 de setembro de 2018, o dono da Orient Seafood Production foi
        condenado a dois anos de prisão e a quase US$ 1,5 milhão em restituição.
        O esquema ocorreu entre 2014 e 2016.
      </p>
      <p>
        <strong>Quem operava e como ganhava:</strong> no caso documentado, fornecedores
        vendiam captura ilegal à empresa, que processava o produto e o revendia a
        atacadistas nos Estados Unidos e na Ásia. O esquema incluiu subnotificação
        das capturas e documentação falsa. Era uma cadeia coordenada de comércio ilegal,
        não apenas uma retirada isolada.
      </p>
      <a href={sources.case} target="_blank" rel="noopener noreferrer"
        >Leia a decisão relatada pelo DOJ ↗</a
      >
    </article>
    <div class="shared-cost">
      <p class="eyebrow">E o que fica para a gente?</p>
      <h3>Menos futuro<br />para quem fica.</h3>
      <dl>
        <dt>Renda das comunidades</dt>
        <dd>
          O esgotamento do recurso reduz a capacidade de ganhar a vida com ele.
          A perda não termina quando o comprador vai embora.
        </dd>
        <dt>Poder de negociação</dt>
        <dd>
          A UNODC relata casos em que adiantamentos e preços baixos prendem
          pescadores a dívidas e pressionam por mais captura.
        </dd>
        <dt>Um ambiente mais vulnerável</dt>
        <dd>
          Perder populações também retira parte do trabalho ecológico mostrado
          nesta história. A conta é compartilhada por quem depende desse mar.
        </dd>
      </dl>
      <a href={sources.income} target="_blank" rel="noopener noreferrer"
        >Pesquisa sobre meios de vida costeiros, ACIAR ↗</a
      >
    </div>
  </div>
  <details class="crime-context">
    <summary>E a “máfia”?</summary>
    <p>
      A UNODC descreve evidências de redes sofisticadas de tráfico que também
      exploram pepinos-do-mar, embora sua dimensão seja difícil de medir. Há
      casos de conspiração e comércio ilegal com condenação, como o relatado
      acima. Isso não torna toda comunidade pesqueira ou todo exportador parte
      do crime.
    </p>
    <a href={sources.crime} target="_blank" rel="noopener noreferrer"
      >World Wildlife Crime Report 2020, p.104 ↗</a
    >
  </details>
</section>

<style>
  .economics {
    padding-block: 100px 110px;
    color: #153d42;
    background: #eaf0df;
  }
  .economics-heading {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 20px 8%;
    align-items: end;
  }
  .economics-heading .eyebrow {
    grid-column: 1/-1;
  }
  .eyebrow {
    font-size: 15px;
    line-height: 1.4;
  }
  .economics h2 {
    font-size: clamp(48px, 5vw, 76px);
    line-height: 1.02;
    font-weight: 500;
    letter-spacing: -0.055em;
  }
  .economics-heading > p:last-child {
    font-size: 22px;
    max-width: 28ch;
    line-height: 1.4;
  }
  .value-chain {
    list-style: none;
    padding: 45px 0 30px;
    margin: 40px 0 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 34px;
    border-top: 1px solid #78928b;
  }
  .value-chain li {
    position: relative;
  }
  .chain-index {
    font-size: 14px;
    color: #5a786f;
  }
  .value-chain h3 {
    font-size: 23px;
    line-height: 1.15;
    font-weight: 500;
    min-height: 54px;
    margin: 18px 0 15px;
  }
  .value-chain p {
    font-size: 17px;
    line-height: 1.5;
    max-width: 28ch;
  }
  .chain-arrow {
    position: absolute;
    right: -27px;
    top: 54px;
    font-size: 25px;
    color: #a84b2c;
  }
  .chain-source {
    font-size: 14px;
    line-height: 1.5;
    max-width: 85ch;
  }
  .economics a {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .economic-bill {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7%;
    margin-top: 60px;
  }
  .documented-case {
    background: #153d42;
    color: #eef0df;
    padding: 36px;
  }
  .case-amount {
    font-size: clamp(40px, 4.2vw, 64px);
    line-height: 1.03;
    letter-spacing: -0.05em;
    margin: 28px 0 18px;
  }
  .case-amount span {
    display: block;
    font-size: 18px;
    letter-spacing: 0;
    margin-bottom: 8px;
  }
  .case-caption {
    font-size: 20px;
    line-height: 1.4;
  }
  .documented-case > p:not(.eyebrow):not(.case-amount):not(.case-caption) {
    font-size: 16px;
    line-height: 1.6;
    margin: 25px 0;
  }
  .documented-case > a,
  .shared-cost > a {
    font-size: 14px;
    line-height: 1.5;
  }
  .shared-cost h3 {
    font-size: 42px;
    line-height: 1.04;
    letter-spacing: -0.04em;
    font-weight: 500;
    margin: 22px 0 30px;
  }
  .shared-cost dt {
    font-size: 20px;
    margin-top: 24px;
  }
  .shared-cost dd {
    font-size: 17px;
    line-height: 1.45;
    margin: 9px 0 0;
  }
  .shared-cost > a {
    display: inline-block;
    margin-top: 25px;
  }
  .crime-context {
    border-top: 1px solid #78928b;
    margin-top: 45px;
    padding-top: 25px;
    max-width: 85ch;
  }
  .crime-context summary {
    font-size: 24px;
    cursor: pointer;
    min-height: 44px;
  }
  .crime-context p {
    font-size: 18px;
    line-height: 1.5;
    margin: 15px 0;
  }
  .crime-context a {
    font-size: 15px;
  }
  @media (max-width: 900px) {
    .economics-heading {
      grid-template-columns: 1fr;
    }
    .value-chain {
      grid-template-columns: 1fr 1fr;
      gap: 35px;
    }
    .chain-arrow {
      display: none;
    }
    .economic-bill {
      gap: 25px;
    }
    .documented-case {
      padding: 25px;
    }
    .case-amount {
      font-size: 45px;
    }
  }
  @media (max-width: 600px) {
    .economics {
      padding-block: 65px;
    }
    .economics h2 {
      font-size: 48px;
    }
    .economics-heading > p:last-child {
      font-size: 19px;
    }
    .value-chain {
      grid-template-columns: 1fr;
      padding-top: 28px;
      gap: 28px;
      margin-top: 28px;
    }
    .value-chain li {
      padding-left: 45px;
    }
    .chain-index {
      position: absolute;
      left: 0;
      top: 3px;
    }
    .value-chain h3 {
      min-height: 0;
      margin: 0 0 10px;
      font-size: 23px;
    }
    .value-chain p {
      max-width: none;
      font-size: 17px;
    }
    .economic-bill {
      grid-template-columns: 1fr;
      gap: 40px;
      margin-top: 35px;
    }
    .case-amount {
      font-size: 46px;
    }
    .shared-cost h3 {
      font-size: 38px;
    }
    .crime-context p {
      font-size: 17px;
    }
  }
</style>
