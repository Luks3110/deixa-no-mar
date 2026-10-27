<script>
  import { onMount } from "svelte";
  let clip;
  onMount(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      if (preference.matches || document.hidden || !visible) clip.pause();
      else clip.play().catch(() => {});
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(clip);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      clip.pause();
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  });
</script>

<figure class="manifesto-clip" data-reveal>
  <video
    bind:this={clip}
    autoplay
    muted
    loop
    playsinline
    preload="metadata"
    poster="/assets/holothuria-atra-poster.jpg"
    width="854"
    height="480"
    aria-label="Vídeo de um pepino-do-mar Holothuria atra em seu habitat"
    ><source src="/assets/holothuria-atra.webm" type="video/webm" /></video
  >
  <figcaption>Holothuria atra, perto de Phuket. Vídeo de Amada44.</figcaption>
</figure>
