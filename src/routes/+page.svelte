<script>
  import { onMount } from "svelte";
  import Hero from "../lib/components/Hero.svelte";
  import HabitatVideo from "../lib/components/HabitatVideo.svelte";
  import EconomicsStory from "../lib/components/EconomicsStory.svelte";
  import ShareCards from "../lib/components/ShareCards.svelte";
  import SeaVoice from "../lib/components/SeaVoice.svelte";
  import ProtestPoster from "../lib/components/ProtestPoster.svelte";
  import OceanStory from "../lib/components/OceanStory.svelte";
  import TrafficStory from "../lib/components/TrafficStory.svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  onMount(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target;
          const image = element.matches("img, figure");
          element.animate(
            image
              ? [
                  { opacity: 0.55, transform: "translateY(24px) scale(.97)" },
                  { opacity: 1, transform: "translateY(0) scale(1)" },
                ]
              : [
                  { opacity: 0.4, transform: "translateY(28px)" },
                  { opacity: 1, transform: "translateY(0)" },
                ],
            {
              duration: image ? 1100 : 850,
              easing: "cubic-bezier(.16,1,.3,1)",
              delay: Number(element.dataset.delay || 0),
            },
          );
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((el) => observer.observe(el));
    const motion = gsap.context(() => {
      gsap.utils.toArray(".photo-pair figure").forEach((figure, index) => {
        gsap.fromTo(
          figure,
          { y: index ? 70 : -20 },
          {
            y: index ? -35 : 20,
            ease: "none",
            scrollTrigger: {
              trigger: figure.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    });
    return () => {
      observer.disconnect();
      motion.revert();
    };
  });
</script>

<svelte:head>
  <title>Deixa no mar. Contra o tráfico de pepinos-do-mar.</title>
  <meta
    name="description"
    content="O pepino-do-mar mantém o oceano vivo. Um manifesto contra o tráfico internacional, com informação e cartazes para fazer barulho."
  />
  <meta
    property="og:title"
    content="Deixa no mar. Contra o tráfico de pepinos-do-mar."
  />
  <meta
    property="og:description"
    content="Pequeno no oceano. Gigante no equilíbrio. Conheça a causa e leve esse protesto adiante."
  />
</svelte:head>

<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="header frame">
  <a class="brand" href="#inicio" aria-label="Deixa no mar, início"
    ><svg viewBox="0 0 52 30" aria-hidden="true"
      ><path
        d="M8 17C5 9 12 4 22 8c5 2 9 0 15-2 10-3 15 7 8 13-6 5-14 2-21 5S10 24 8 17Z"
        fill="currentColor"
      /><path
        d="m17 8 1-5m9 7 3-5m7 2 2-5M15 24l1 4m11-5 2 5m9-7 3 4"
        stroke="currentColor"
        stroke-width="3"
      /></svg
    ><span>Deixa no mar.</span></a
  >
  <nav aria-label="Principal">
    <a href="#manifesto">Manifesto</a><a href="#trafico">O tráfico</a><a
      href="#agir">Faça barulho</a
    >
  </nav>
  <a
    class="denounce"
    href="https://www.gov.br/pt-br/servicos/apresentar-denuncia-ambiental"
    target="_blank"
    rel="noopener noreferrer">Denuncie</a
  >
</header>
<main id="conteudo">
  <Hero />

  <section
    class="manifesto frame section-space"
    id="manifesto"
    aria-labelledby="manifesto-title"
  >
    <div class="manifesto-heading">
      <h2 id="manifesto-title" data-reveal>
        O fundo do mar<br /> também trabalha.
      </h2>
      <p data-reveal>Ele tem seu charme, vai. E um trabalho que faz falta.</p>
    </div>
    <div class="manifesto-copy">
      <HabitatVideo />
      <div class="manifesto-text" data-reveal>
        <p>
          Enquanto se alimenta, o pepino-do-mar participa da reciclagem de
          matéria no fundo do oceano. O que parece só areia é parte de um
          processo cheio de vida.
        </p>
        <p>
          A captura excessiva e o comércio ilegal interrompem esse trabalho. O
          prejuízo fica no fundo do mar — e chega a quem depende dele.
        </p>
        <a
          class="text-link"
          href="https://oceanservice.noaa.gov/facts/seacuke.html"
          target="_blank"
          rel="noopener noreferrer">Conheça sua função no oceano, pela NOAA</a
        >
      </div>
    </div>
  </section>

  <OceanStory />

  <section
    class="ecology-consequence frame"
    aria-labelledby="consequence-title"
  >
    <h2 id="consequence-title">O trabalho faz falta.</h2>
    <p>
      A retirada não termina na praia. Há compradores, transporte e revenda.
      Enquanto o produto ganha valor longe dali, a perda fica com o mar e com as
      comunidades que dependem dele.
    </p>
  </section>

  <TrafficStory />

  <EconomicsStory />

  <section class="life" id="vida" aria-labelledby="life-title">
    <div class="frame life-heading">
      <h2 id="life-title" data-reveal>Parte de um mundo vivo.</h2>
      <p data-reveal>Há outras vidas ligadas à dele.</p>
    </div>
    <div class="wide-photo" id="recife">
      <figure>
        <img
          src="/assets/periclimenes-imperator-emperor-shrimp-on-bohadschia-argus.jpg"
          width="1920"
          height="1440"
          alt="Camarão-imperador sobre a pele estampada de um pepino-do-mar Bohadschia argus"
          loading="lazy"
          decoding="async"
        />
        <figcaption class="frame">
          <span>Uma casa para outras vidas.</span><span
            >Camarão-imperador sobre um Bohadschia argus.</span
          >
        </figcaption>
      </figure>
    </div>
    <div class="photo-pair frame">
      <figure>
        <img
          src="/assets/actinopyga-echinites1.jpg"
          width="1600"
          height="1064"
          alt="Pepino-do-mar marrom Actinopyga echinites, com tentáculos visíveis"
          loading="lazy"
          decoding="async"
          data-reveal
        />
        <figcaption>Actinopyga echinites, encontrado na Micronésia.</figcaption>
      </figure>
      <figure>
        <img
          src="/assets/eupentacta-quinquesemita-explored-stiff-footed-sea-cucumber.jpg"
          width="1920"
          height="1055"
          alt="Pequeno Eupentacta quinquesemita branco e amarelo visto de perto"
          loading="lazy"
          decoding="async"
          data-reveal
        />
        <figcaption>Eupentacta quinquesemita, em todos os detalhes.</figcaption>
      </figure>
    </div>
  </section>

  <SeaVoice />

  <ShareCards />
  <ProtestPoster />

  <section class="report-section frame" aria-labelledby="report-title">
    <div data-reveal>
      <h2 id="report-title">Viu tráfico?</h2>
      <p>
        Registre o local, a data e o que observou. Se houver anúncio, guarde o
        link. Encaminhe as informações ao canal oficial do Ibama.
      </p>
    </div>
    <a
      class="report-link"
      href="https://www.gov.br/pt-br/servicos/apresentar-denuncia-ambiental"
      target="_blank"
      rel="noopener noreferrer"
      data-reveal>Denuncie</a
    >
  </section>
</main>
<footer class="footer frame">
  <div class="footer-top">
    <p>Um manifesto independente<br />pela vida que quase ninguém vê.</p>
    <div class="footer-life">
      <img
        src="/assets/marine-hero.png"
        width="900"
        height="650"
        alt="O pepino-do-mar no habitat de células."
        loading="lazy"
        style="width:100%;height:auto;border-radius:16px"
      />
    </div>
    <a href="#inicio">Voltar à superfície</a>
  </div>
  <p class="footer-wordmark" aria-hidden="true">Deixa no mar.</p>
  <details class="credits">
    <summary>Fontes, imagens e créditos</summary>
    <div class="credits-content">
      <p>
        Iniciativa visual independente, sem vínculo com o G1, a NOAA ou os
        órgãos citados. Arte celular original feita em código com assistência de
        IA; o cartaz usa uma ilustração gerada com IA. As fotografias mostram
        espécies reais.
      </p>
      <p>
        Informações: <a href="https://oceanservice.noaa.gov/facts/seacuke.html"
          >NOAA, Are sea cucumbers vegetables?</a
        >;
        <a href="https://www.fao.org/4/i1384e/i1384e00.htm"
          >FAO, Managing sea cucumber fisheries with an ecosystem approach</a
        >;
        <a href="https://doi.org/10.1146/annurev-marine-032123-025441"
          >Annual Reviews, Revered and Reviled</a
        >. A reportagem do G1 motivou esta iniciativa; as explicações ecológicas
        e comerciais se apoiam nas fontes acima.
      </p>
      <p>
        <a href="https://commons.wikimedia.org/w/index.php?curid=6239975"
          >Periclimenes imperator on Bohadschia argus</a
        >, Nhobgood Nick Hobgood,
        <a href="https://creativecommons.org/licenses/by-sa/3.0/"
          >CC BY-SA 3.0</a
        >.
      </p>
      <p>
        <a
          href="https://commons.wikimedia.org/wiki/File:Actinopyga_echinites1.jpg"
          >Actinopyga echinites1</a
        >, François Michonneau,
        <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.
      </p>
      <p>
        <a href="https://commons.wikimedia.org/w/index.php?curid=32512093"
          >Eupentacta quinquesemita, Explored. Stiff-footed Sea Cucumber</a
        >, Jerry Kirkhart,
        <a href="https://creativecommons.org/licenses/by/2.0/">CC BY 2.0</a>.
      </p>
      <p>
        Fotografias distribuídas via Wikimedia Commons, sem alteração dos
        arquivos.
      </p>
      <p>
        <a href="https://commons.wikimedia.org/wiki/File:Holothuria_atra.webm"
          >Holothuria atra</a
        >, vídeo de Amada44,
        <a href="https://creativecommons.org/licenses/by-sa/3.0/"
          >CC BY-SA 3.0</a
        >, via Wikimedia Commons.
      </p>
      <p>
        Fontes tipográficas: Gambarino e General Sans, de Indian Type Foundry
        via Fontshare. Referências visuais: <a
          href="https://www.inspora.design/posts/shark-on-vacation"
          >Shark on vacation</a
        >,
        <a href="https://www.inspora.design/posts/crumpled-piece-of-paper"
          >Crumpled piece of paper</a
        >,
        <a href="https://www.inspora.design/posts/shark-ascii-animation"
          >Shark ASCII animation</a
        >,
        <a href="https://www.inspora.design/posts/ai-keychain">AI keychain</a>
        e
        <a href="https://www.inspora.design/posts/small-plays-basketball"
          >Small plays, Basketball</a
        >.
      </p>
    </div>
  </details>
  <div class="footer-bottom">
    <span>O fundo do mar merece um futuro.</span><span
      >Feito para circular. Compartilhe.</span
    >
  </div>
</footer>
