<script>
  import ProcessScene from "./ProcessScene.svelte";
  import EcologyArt from "./EcologyArt.svelte";
  import { ecologySteps as steps } from "../art/ecology-story.js";
</script>

<ProcessScene
  id="fundo"
  title="Um pequeno reciclador."
  intro="Ele se alimenta no fundo. O benefício vai além dele."
  sequential
  nextHref="#trafico"
  nextLabel="Quem leva. Quem perde."
  {steps}
>
  {#snippet children(progress, instant, staticFrame = false)}<EcologyArt
      {progress}
      {instant}
      {staticFrame}
    />{/snippet}
  {#snippet sources()}
    <p>
      Esquema sem escala. O efeito nos corais foi observado em experimentos em
      recifes; não significa que toda retirada cause a morte de uma colônia.
    </p>
    <p>
      Entenda o ciclo na <a
        href="https://oceanservice.noaa.gov/facts/seacuke.html"
        target="_blank"
        rel="noopener noreferrer">NOAA ↗</a
      >
      ·
      <a
        href="https://www.nature.com/articles/s41467-024-45730-0"
        target="_blank"
        rel="noopener noreferrer">Estudo em recifes ↗</a
      >
      ·
      <a
        href="https://www.fao.org/4/i1780e/i1780e00.htm"
        target="_blank"
        rel="noopener noreferrer">FAO ↗</a
      >
    </p>
  {/snippet}
</ProcessScene>
