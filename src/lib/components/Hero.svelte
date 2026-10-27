<script>
  import MarineWorld from "./MarineWorld.svelte";
</script>

<section class="living-hero" id="inicio" aria-labelledby="titulo">
  <div class="hero-copy">
    <p class="hero-kicker">Pequenas vidas. Grandes oceanos.</p>
    <h1 id="titulo">Deixa<br />no mar.</h1>
    <p class="hero-affection">É esquisitinho. Faz falta.</p>
    <p class="hero-cause">
      Contra o tráfico internacional de pepinos-do-mar. O lugar deles é no
      oceano.
    </p>
    <a class="button" id="return-sea" href="#fundo"
      >Vem ver o trabalho dele <span aria-hidden="true">↘</span></a
    >
  </div>
  <div class="hero-habitat">
    <MarineWorld />
    <p>Devagarinho, ele recicla matéria no fundo do mar.</p>
  </div>
</section>

<style>
  .living-hero {
    min-height: 860px;
    display: grid;
    grid-template-columns: 0.85fr 1.4fr;
    align-items: center;
    gap: 1vw;
    padding: 65px 5vw 80px;
    background: #edf0df;
    color: #153d42;
    overflow: hidden;
  }
  .hero-copy {
    position: relative;
    z-index: 2;
    padding-left: 2vw;
  }
  .hero-kicker {
    font-size: 15px;
    margin-bottom: 28px;
  }
  .living-hero h1 {
    font-family: var(--text);
    font-size: clamp(82px, 8vw, 124px);
    font-weight: 500;
    line-height: 0.92;
    letter-spacing: -0.07em;
    margin-bottom: 30px;
  }
  .hero-affection {
    font-size: 26px;
    margin-bottom: 12px;
  }
  .hero-cause {
    font-size: 19px;
    max-width: 31ch;
    line-height: 1.5;
    margin-bottom: 30px;
  }
  .hero-habitat {
    width: 110%;
    margin-left: -4%;
  }
  .hero-habitat > p {
    text-align: center;
    font-size: 14px;
    margin-top: 22px;
    color: #37635f;
  }
  .living-hero .button {
    background: #173e42;
    color: #f1efde;
    font-size: 17px;
    padding: 18px 24px;
  }
  @media (max-width: 900px) {
    .living-hero {
      min-height: 0;
      grid-template-columns: 1fr;
      padding: 50px 6vw;
      gap: 24px;
    }
    .hero-copy {
      padding: 0;
    }
    .living-hero h1 {
      font-size: 80px;
    }
    .hero-habitat {
      grid-row: 2;
      width: 100%;
      margin: 0;
    }
    .hero-cause {
      max-width: 40ch;
    }
    .hero-kicker {
      margin-bottom: 22px;
    }
  }
  @media (max-width: 600px) {
    .living-hero {
      padding: 35px 6vw 45px;
      gap: 28px;
    }
    .living-hero h1 {
      font-size: 64px;
      line-height: 0.95;
      margin-bottom: 20px;
    }
    .hero-kicker {
      font-size: 13px;
    }
    .hero-affection {
      font-size: 23px;
    }
    .hero-cause {
      font-size: 17px;
      margin-bottom: 23px;
    }
    .hero-habitat {
      width: 112%;
      margin-left: -6%;
    }
    .hero-habitat > p {
      margin-top: 15px;
    }
    .living-hero .button {
      font-size: 16px;
    }
  }
  @media (max-width: 700px) {
    .living-hero {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 25px 20px 42px;
    }
    .hero-copy {
      display: contents;
    }
    .hero-kicker {
      grid-row: 1;
      margin: 0;
      font-size: 11px;
    }
    .living-hero h1 {
      grid-row: 2;
      font-size: clamp(94px, 24vw, 138px);
      line-height: 0.82 !important;
      margin: 0;
    }
    .hero-habitat {
      grid-row: 3;
      width: calc(100% + 20px);
      margin: 0 -10px;
    }
    .hero-habitat :global(.marine-world) {
      aspect-ratio: 1.65;
    }
    .hero-habitat > p {
      display: none;
    }
    .hero-affection {
      grid-row: 4;
      font-size: 21px;
      font-weight: 600;
      margin: 5px 0 0;
    }
    .hero-cause {
      grid-row: 5;
      font-size: 16px;
      line-height: 1.45;
      margin: 0;
      max-width: 35ch;
    }
    .living-hero .button {
      grid-row: 6;
      justify-self: start;
      margin-top: 8px;
      font-size: 15px;
      padding: 14px 18px;
      min-height: 48px;
    }
  }
</style>
