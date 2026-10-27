<script>
  import { onMount } from "svelte";
  import TrafficArt from "./TrafficArt.svelte";
  const steps = [
    {
      label: "No porto",
      title: "O oceano vira carga.",
      text: "Depois de capturado e processado, o pepino-do-mar vira mercadoria. Captura ilegal e transporte irregular alimentam uma cadeia que lucra com a vida retirada do oceano.",
      caption: "O lucro começa com uma perda no mar.",
      alt: "Cais de um porto: uma pessoa leva uma caixa marcada com um pepino-do-mar até um navio. A carga vai do carrinho ao convés por uma grua com cabo e gancho visíveis. Na água, o lugar de onde o animal saiu fica vazio.",
    },
    {
      label: "Pelo mar",
      title: "A carga atravessa o mar.",
      text: "Apreensões em embarcações mostram que o tráfico também passa pelo mar. O transporte conecta a captura aos compradores; fiscalizar essa carga pode interromper o comércio ilegal.",
      caption: "Comprar sem conhecer a origem sustenta a demanda.",
      alt: "Navio cargueiro atravessando o mar, com a caixa alaranjada no convés, rastro na água e a costa ficando para trás.",
    },
    {
      label: "Pelo ar",
      title: "O tráfico também leva mala.",
      text: "Nem toda carga vai de navio. Há casos documentados de passageiros tentando levar pepinos-do-mar sem declaração, escondidos na bagagem.",
      caption: "Uma mala também pode carregar vida retirada ilegalmente.",
      alt: "Terminal de aeroporto: passageiro com mala de rodinhas caminha em direção à fiscalização. Um avião aparece pela janela.",
    },
    {
      label: "Na fiscalização",
      title: "Uso medicinal não é passe livre.",
      text: "O uso na medicina tradicional chinesa integra a demanda. Alegar uso medicinal não dispensa as exigências legais. A fiscalização verifica a espécie, a origem e os documentos da carga.",
      caption:
        "Uma apreensão interrompe o transporte. A retirada já aconteceu.",
      alt: "Fiscal verifica documentos ao lado do passageiro. A mala é examinada e a carga de pepinos-do-mar é identificada. A alegação de uso medicinal não substitui a documentação legal.",
    },
    {
      label: "Destino procurado",
      title: "O mercado mantém a procura.",
      text: "Secos, chegam a lojas e restaurantes para pratos e sopas. Alimentação e uso tradicional medicinal integram a procura em mercados como Hong Kong e China continental. O comércio legal existe; a origem precisa ser verificada.",
      caption:
        "Produtos secos para o prato e para o uso tradicional medicinal.",
      alt: "Loja de produtos secos com vendedor e comprador, pepinos-do-mar secos no balcão, uma tigela de alimento e um frasco de uso tradicional medicinal. Esta cena mostra a demanda, não a venda da carga apreendida.",
    },
  ];
  const count = steps.length;
  let section;
  let ready = $state(false),
    reduced = $state(false),
    current = $state(0),
    held = $state(false);
  let instant = $state(false);
  let scrollToChapter;
  const chapter = $derived(steps[current]);
  function choose(index, immediate = false) {
    instant = immediate;
    current = Math.max(0, Math.min(count - 1, index));
    scrollToChapter?.(current);
  }
  onMount(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const stage = section.querySelector(".journey-stage");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!held) return;
      const bounds = section.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, -bounds.top / (section.offsetHeight - stage.offsetHeight)),
      );
      current = Math.min(count - 1, Math.floor(progress * count));
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const preferences = () => {
      reduced = query.matches;
      held = !reduced;
      if (held) scroll();
    };
    scrollToChapter = (index) => {
      if (!held) return;
      const top = section.getBoundingClientRect().top + scrollY;
      window.scrollTo({
        top:
          top +
          (section.offsetHeight - stage.offsetHeight) * ((index + 0.3) / count),
        behavior: "instant",
      });
    };
    query.addEventListener("change", preferences);
    const resume = () => (instant = false);
    section.addEventListener("wheel", resume, { passive: true });
    section.addEventListener("touchstart", resume, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll, { passive: true });
    preferences();
    ready = true;
    return () => {
      cancelAnimationFrame(frame);
      query.removeEventListener("change", preferences);
      section.removeEventListener("wheel", resume);
      section.removeEventListener("touchstart", resume);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      scrollToChapter = undefined;
    };
  });
</script>

<section
  id="trafico"
  class="traffic-journey"
  style:--journey-height={`${(1 + count * 0.53) * 100}svh`}
  class:held
  class:enhanced={ready && !reduced}
  aria-labelledby="trafico-title"
  data-scene="trafico"
  data-chapter={current}
>
  <div class="journey-track" bind:this={section}>
    <div class="journey-stage">
      <header class="journey-heading">
        <p class="eyebrow">A viagem do tráfico</p>
        <h2 id="trafico-title">Sai do mar.<br />Faz falta.</h2>
        <p class="journey-intro">
          Por mar ou pelo ar, o tráfico conecta a captura ilegal a quem paga por
          ela.
        </p>
      </header>
      {#if ready && !reduced}
        <div
          class="journey-player"
          role="group"
          aria-label={`História em ${count} cenas. Role a página para avançar ou use os botões de navegação.`}
        >
          <div class="journey-art">
            <TrafficArt scene={current} {instant} label={chapter.alt} />
            <div class="scene-marker">
              <span
                >{String(current + 1).padStart(2, "0")} / {String(
                  count,
                ).padStart(2, "0")}</span
              ><span>{chapter.label}</span>
            </div>
          </div>
          <p class="scene-caption">{chapter.caption}</p>
        </div>
        <div
          class="journey-story story-copy-stack"
          class:instant
          aria-live="polite"
          aria-atomic="true"
        >
          {#each steps as step, index}
            <div
              class="story-copy-panel"
              class:current={current === index}
              aria-hidden={current !== index}
              inert={current !== index}
            >
              <p class="chapter-label">{step.label}</p>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          {/each}
        </div>
        <nav class="journey-controls" aria-label="Avançar na viagem do tráfico">
          <div
            class="journey-progress"
            aria-label={`Cena ${current + 1} de ${count}`}
          >
            {#each steps as step, i}<span
                class:complete={i <= current}
                title={step.label}
              ></span>{/each}
          </div>
          <div class="journey-buttons">
            <button
              type="button"
              disabled={current === 0}
              onclick={(event) => choose(current - 1, event.detail === 0)}
              aria-label="Cena anterior">← Anterior</button
            >{#if current < count - 1}<button
                type="button"
                class="next"
                onclick={(event) => choose(current + 1, event.detail === 0)}
                >Próxima cena <span aria-hidden="true">→</span></button
              >{:else}<a class="next" href="#agir"
                >Interrompa essa cadeia <span aria-hidden="true">↗</span></a
              >{/if}
          </div>
        </nav>
      {/if}
      <ol class="journey-fallback">
        {#each steps as step, i}<li>
            <picture
              ><source
                media="(max-width: 600px)"
                srcset={`/assets/traffic-journey/mobile-${i}.png`}
              /><img
                src={`/assets/traffic-journey/scene-${i}.png`}
                width="960"
                height="620"
                alt={step.alt}
                loading="lazy"
              /></picture
            >
            <div>
              <p class="chapter-label">{i + 1} / {count} · {step.label}</p>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </li>{/each}
      </ol>
    </div>
  </div>
  <footer class="journey-sources">
    <p>
      Cenas esquemáticas baseadas em registros distintos. Não representam uma
      rota única nem pessoas reais. O comércio legal existe; a ilegalidade
      depende da captura, do transporte e das regras aplicáveis.
    </p>
    <details>
      <summary>Fontes e contexto</summary>
      <p>
        Transporte marítimo: <a
          href="https://www.customs.gov.hk/en/customs-announcement/press-release/index_id_91.html"
          target="_blank"
          rel="noopener noreferrer">Hong Kong Customs, 2022 ↗</a
        >. Bagagem e fiscalização:
        <a
          href="https://www.justice.gov/usao-sdfl/pr/woman-pleads-guilty-smuggling-endangered-sea-cucumbers-through-south-florida-airport"
          target="_blank"
          rel="noopener noreferrer">Departamento de Justiça dos EUA, 2023 ↗</a
        >. Demanda e uso tradicional:
        <a
          href="https://cites.org/sites/default/files/eng/com/ac/22/E22-16.pdf"
          target="_blank"
          rel="noopener noreferrer">CITES, AC22 Doc. 16 ↗</a
        >. A cena medicinal é contextual, sem reproduzir uma declaração do caso
        ou afirmar eficácia médica. A cena de mercado é independente da
        apreensão. Produto seco, varejo e preparo alimentar:
        <a
          href="https://www.fao.org/4/i1384e/i1384e02.pdf"
          target="_blank"
          rel="noopener noreferrer">FAO, 2010, p.13 ↗</a
        >. Demanda em Hong Kong e China continental:
        <a
          href="https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2017.00181/full"
          target="_blank"
          rel="noopener noreferrer">Fabinyi et al., 2017 ↗</a
        >.
      </p>
    </details>
  </footer>
</section>

<style>
  .traffic-journey {
    position: relative;
    background: #a91e0a;
    color: #fff8e9;
    scroll-margin-top: 0;
  }
  .journey-stage {
    max-width: 1600px;
    margin: auto;
    padding: 68px var(--gutter, 4vw) 40px;
    display: grid;
    grid-template-columns: 0.83fr 1.5fr;
    column-gap: 5%;
    align-items: start;
  }
  .journey-heading {
    grid-column: 1;
    grid-row: 1;
  }
  .eyebrow {
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 22px;
  }
  h2 {
    font-family: var(--text);
    font-size: clamp(48px, 5.2vw, 80px);
    font-weight: 500;
    line-height: 0.99;
    letter-spacing: -0.055em;
  }
  .journey-intro {
    font-size: clamp(17px, 1.4vw, 21px);
    line-height: 1.45;
    max-width: 30ch;
    margin-top: 25px;
  }
  .journey-player {
    grid-column: 2;
    grid-row: 1 / 4;
    width: 100%;
    min-width: 0;
    outline-offset: 7px;
  }
  .journey-art {
    position: relative;
    background: #cfe3d5;
    color: #183b40;
    overflow: hidden;
    border-radius: 3px;
  }
  .scene-marker {
    position: absolute;
    top: 18px;
    left: 20px;
    right: 20px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    pointer-events: none;
  }
  .scene-marker span {
    background: #f4edda;
    padding: 6px 9px;
  }
  .scene-caption {
    font-size: 15px;
    line-height: 1.4;
    margin-top: 13px;
    min-height: 40px;
  }
  .journey-story {
    min-height: 245px;
    grid-column: 1;
    grid-row: 2;
    padding-top: 36px;
  }
  .chapter-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 9px;
  }
  h3 {
    font-family: var(--text);
    font-size: clamp(25px, 2vw, 31px);
    line-height: 1.13;
    font-weight: 500;
    letter-spacing: -0.025em;
    max-width: 20ch;
  }
  .journey-story .story-copy-panel > p:last-child,
  .journey-fallback li > div > p:last-child {
    font-size: 17px;
    line-height: 1.5;
    margin-top: 14px;
    max-width: 36ch;
  }
  .journey-controls {
    display: block;
    grid-column: 1;
    grid-row: 3;
    margin-top: 25px;
    align-self: end;
  }
  .journey-progress {
    display: flex;
    gap: 5px;
    margin-bottom: 16px;
  }
  .journey-progress span {
    flex: 1;
    height: 3px;
    background: #ffffff40;
  }
  .journey-progress .complete {
    background: #fff3dc;
  }
  .journey-buttons {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .journey-buttons button,
  .journey-buttons a {
    border: 0;
    font-size: 14px;
    color: inherit;
    background: transparent;
    padding: 12px 0;
    min-height: 44px;
    text-decoration: none;
  }
  .journey-buttons button:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .journey-buttons .next {
    border-bottom: 1px solid #fff2dc;
  }
  .journey-buttons .next span {
    margin-left: 8px;
  }
  .journey-sources {
    grid-column: 1 / -1;
    margin-top: 26px;
    padding-top: 18px;
    border-top: 1px solid #ffffff40;
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 30px;
    font-size: 12px;
    line-height: 1.5;
    max-width: 1600px;
    margin: 0 auto;
    padding: 24px var(--gutter, 4vw) 36px;
  }
  .journey-sources p {
    max-width: 88ch;
  }
  .journey-sources a {
    color: inherit;
    text-underline-offset: 3px;
  }
  summary {
    cursor: pointer;
    width: fit-content;
    min-height: 30px;
  }
  details p {
    margin-top: 8px;
  }
  .journey-fallback {
    grid-column: 1 / -1;
    list-style: none;
    padding: 0;
    margin-top: 40px;
    display: grid;
    gap: 44px;
  }
  .journey-fallback li {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    align-items: center;
    gap: 6%;
  }
  .journey-fallback img {
    width: 100%;
    height: auto;
    display: block;
  }
  .enhanced .journey-fallback {
    display: none;
  }
  .held .journey-track {
    height: var(--journey-height);
  }
  .held .journey-stage {
    position: sticky;
    top: 0;
    height: 100svh;
    min-height: 0;
    align-content: center;
    padding-block: 40px;
  }
  @media (min-width: 1100px) {
    .journey-player {
      max-width: calc(58svh * 1.55);
      justify-self: end;
    }
  }
  @media (max-width: 1099px) {
    .journey-stage {
      padding-block: 48px 34px;
      grid-template-columns: 1fr 1.25fr;
      gap: 25px 5%;
    }
    .journey-heading {
      grid-row: 1;
    }
    .journey-player {
      grid-row: 1 / 3;
      align-self: center;
    }
    h2 {
      font-size: 58px;
    }
    .journey-intro {
      font-size: 17px;
    }
    .journey-story {
      padding-top: 0;
    }
    .journey-controls {
      grid-row: 3;
      grid-column: 1 / -1;
      margin-top: 0;
    }
    .journey-sources {
      margin-top: 0;
    }
  }
  @media (max-width: 700px) {
    .journey-stage {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 42px 22px 30px;
    }
    .eyebrow {
      margin-bottom: 16px;
      font-size: 11px;
    }
    h2 {
      font-size: clamp(47px, 12.8vw, 70px);
    }
    .journey-intro {
      font-size: 16px;
      margin-top: 18px;
      max-width: 34ch;
    }
    .journey-player {
      align-self: auto;
      margin-top: 28px;
      width: calc(100% + 44px);
      margin-left: -22px;
    }
    .journey-art {
      border-radius: 0;
    }
    .scene-marker {
      top: 12px;
      left: 14px;
      right: 14px;
      font-size: 10px;
    }
    .scene-caption {
      padding-inline: 22px;
      font-size: 13px;
      margin-top: 12px;
      min-height: 36px;
    }
    .journey-story {
      margin-top: 18px;
      min-height: 208px;
    }
    h3 {
      font-size: 27px;
      max-width: 24ch;
    }
    .journey-story .story-copy-panel > p:last-child,
    .journey-fallback li > div > p:last-child {
      font-size: 16px;
      max-width: 40ch;
    }
    .journey-controls {
      width: 100%;
      margin-top: 8px;
    }
    .journey-buttons button,
    .journey-buttons a {
      font-size: 14px;
    }
    .journey-sources {
      display: block;
      margin-top: 28px;
      font-size: 11px;
    }
    .journey-sources details {
      margin-top: 12px;
    }
    .journey-fallback {
      width: 100%;
      margin-top: 30px;
    }
    .journey-fallback li {
      display: block;
    }
    .journey-fallback li > div {
      margin-top: 18px;
    }
  }
  @media (max-width: 700px) {
    .journey-heading {
      order: 0;
    }
    .journey-player {
      order: 1;
      margin-top: 18px;
    }
    .journey-controls {
      order: 2;
      margin-top: 12px;
    }
    .journey-story {
      order: 3;
      min-height: 0;
      margin-top: 22px;
    }
    .journey-sources {
      order: 4;
    }
    .journey-fallback {
      order: 5;
    }
    .journey-buttons button,
    .journey-buttons a {
      min-height: 48px;
    }
    .journey-stage {
      padding-top: 32px;
    }
    .journey-intro {
      margin-top: 12px;
    }
    h2 {
      font-size: 54px;
    }
  }
  @media (max-width: 700px) {
    .held .journey-stage {
      padding: 14px 22px;
      justify-content: flex-start;
    }
    .held .eyebrow,
    .held .journey-intro {
      display: none;
    }
    .held h2 {
      font-size: clamp(28px, 4.3svh, 36px);
      line-height: 1;
    }
    .held .journey-player {
      width: min(100%, calc(34svh * 1.12));
      margin: 12px auto 0;
    }
    .held .scene-caption {
      padding-inline: 0;
      font-size: 12px;
      margin-top: 8px;
      min-height: 34px;
    }
    .held .journey-story {
      order: 2;
      min-height: 0;
      margin-top: 12px;
    }
    .held .chapter-label {
      font-size: 11px;
      margin-bottom: 6px;
    }
    .held h3 {
      font-size: 23px;
    }
    .held .journey-story .story-copy-panel > p:last-child {
      font-size: 15px;
      line-height: 1.45;
      margin-top: 8px;
    }
    .held .journey-controls {
      order: 3;
      margin-top: 12px;
    }
    .held .journey-progress {
      margin-bottom: 6px;
    }
  }
  @media (min-width: 701px) and (max-width: 1099px) and (max-height: 650px) {
    .held .journey-stage {
      padding-block: 16px;
      row-gap: 8px;
    }
    .held .eyebrow,
    .held .journey-intro {
      display: none;
    }
    .held h2 {
      font-size: 32px;
    }
    .held .journey-story {
      min-height: 0;
      padding-top: 0;
    }
    .held h3 {
      font-size: 22px;
    }
    .held .journey-story .story-copy-panel > p:last-child {
      font-size: 14px;
      line-height: 1.45;
      margin-top: 8px;
    }
    .held .journey-controls {
      margin-top: 0;
    }
    .held .journey-progress {
      margin-bottom: 6px;
    }
  }
</style>
