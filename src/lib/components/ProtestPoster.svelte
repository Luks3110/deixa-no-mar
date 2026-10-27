<script>
  import { tick, onMount } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";
  import { exportPoster } from "../export-poster.js";

  let message = $state("Deixa no mar.");
  let status = $state("");
  let busy = $state(false);
  let fallback = $state("");
  let copyField = $state();
  let section;
  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        section.querySelector(".poster"),
        { rotationX: 22, rotationY: -28, rotationZ: 7, y: 75, scale: 0.88 },
        {
          rotationX: 0,
          rotationY: 0,
          rotationZ: -2,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            end: "center center",
            scrub: true,
          },
        },
      );
    });
    return () => media.revert();
  });
  const messages = {
    "Deixa no mar.": ["Deixa", "no mar."],
    "Estranho é deixar sumir.": ["Estranho é", "deixar sumir."],
    "Vivo vale mais.": ["Vivo vale", "mais."],
  };
  let lines = $derived(messages[message]);

  async function download() {
    busy = true;
    status = "Preparando seu cartaz…";
    try {
      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      const blob = await exportPoster(lines, accent);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "deixa-no-mar-cartaz.png";
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      status = "Cartaz pronto. Compartilhe esse protesto.";
    } catch {
      status =
        "Não foi possível gerar o arquivo. Tente novamente ou copie a mensagem abaixo.";
    } finally {
      busy = false;
    }
  }

  async function copyMessage() {
    const text = `${message} Contra o tráfico internacional de pepinos-do-mar. Tem vida que vale mais livre. Conheça a reportagem: https://g1.globo.com/meio-ambiente/noticia/2026/09/14/suposto-afrodisiaco-bicho-com-forma-de-penis-rende-fortunas-ao-trafico.ghtml`;
    try {
      await navigator.clipboard.writeText(text);
      status = "Mensagem copiada. Agora é só compartilhar.";
    } catch {
      fallback = text;
      await tick();
      copyField.focus();
      copyField.select();
      status = "Selecione e copie a mensagem neste campo.";
    }
  }
</script>

<section
  bind:this={section}
  class="action frame section-space"
  id="agir"
  aria-labelledby="action-title"
>
  <div class="action-copy">
    <h2 id="action-title" data-reveal>Ele não grita.<br />A gente pode.</h2>
    <p data-reveal>
      Leve esse protesto para fora daqui. Escolha uma frase e baixe seu cartaz
      para publicar, mandar para alguém ou imprimir.
    </p>
    <div class="poster-controls" data-reveal>
      <label for="poster-message">A sua mensagem</label><select
        id="poster-message"
        bind:value={message}
        ><option value="Deixa no mar.">Deixa no mar.</option><option
          value="Estranho é deixar sumir.">Estranho é deixar sumir.</option
        ><option value="Vivo vale mais.">Vivo vale mais.</option></select
      ><button
        class="button"
        id="download-poster"
        type="button"
        disabled={busy}
        onclick={download}>Baixar cartaz</button
      ><button
        class="text-link"
        id="share-message"
        type="button"
        onclick={copyMessage}>Copiar mensagem de protesto</button
      >
      <p id="poster-status" role="status" class="control-status">{status}</p>
      {#if fallback}<textarea
          class="copy-fallback"
          bind:this={copyField}
          value={fallback}
          aria-label="Mensagem de protesto para copiar"></textarea>{/if}
    </div>
    <noscript
      ><p>
        Compartilhe a frase “Deixa no mar. Contra o tráfico de pepinos-do-mar.”
        e o link da reportagem.
      </p></noscript
    >
  </div>
  <div
    class="poster"
    class:poster-long={message.startsWith("Estranho")}
    id="poster"
    data-reveal
  >
    <p class="poster-heading" id="poster-heading">
      {#each lines as line, i}{#if i}<br />{/if}{line}{/each}
    </p>
    <img
      src="/assets/pepino-clay.png"
      width="1536"
      height="1024"
      alt="Pepino-do-mar ilustrado no cartaz de protesto"
      loading="lazy"
    />
    <p>
      Contra o tráfico de pepinos-do-mar.<br />Tem vida que vale mais livre.
    </p>
    <span>deixa no mar.</span>
  </div>
</section>
