<script>
  import { onMount } from "svelte";
  import { actorTelemetry } from "../art/traffic-journey/motion.js";
  import { drawTrafficJourney } from "../art/traffic-journey/draw.js";
  let {
    scene = 0,
    instant = false,
    label = "Uma viagem esquemática do tráfico de pepinos-do-mar.",
  } = $props();
  let host, canvas;
  let ready = $state(false);
  let update = $state();
  $effect(() => {
    update?.(scene, instant);
  });
  onMount(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 1,
      height = 1,
      time = 0,
      previousTime = 0,
      previousFrame = null,
      last = 0,
      id = 0;
    let active = scene,
      previous = scene,
      transition = 1,
      visible = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const render = () => {
      const frame = drawTrafficJourney(ctx, width, height, {
        scene: active,
        previous,
        transition,
        time,
        previousTime,
        previousFrame,
      });
      host.dataset.frame = JSON.stringify({
        actor: frame?.actor ? actorTelemetry(frame.actor) : null,
        cargo: frame?.cargo,
        crane: frame?.crane,
        seated: frame?.seated ? actorTelemetry(frame.seated) : null,
      });
      host.dataset.time = time.toFixed(2);
      host.dataset.transition = transition.toFixed(2);
    };
    const tick = (stamp) => {
      id = 0;
      if (!visible || reduced.matches || document.hidden) {
        last = 0;
        return;
      }
      const delta = last ? Math.min(0.06, (stamp - last) / 1000) : 0;
      last = stamp;
      time += delta;
      transition = Math.min(1, transition + delta / 0.82);
      render();
      id = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!id && visible && !document.hidden && !reduced.matches)
        id = requestAnimationFrame(tick);
    };
    update = (nextScene, immediate) => {
      if (nextScene !== active) {
        const snapshot = document.createElement("canvas");
        snapshot.width = canvas.width;
        snapshot.height = canvas.height;
        snapshot.getContext("2d").drawImage(canvas, 0, 0);
        previousFrame = snapshot;
        previous = active;
        previousTime = time;
        active = nextScene;
        transition = reduced.matches || immediate ? 1 : 0;
        time = 0;
      }
      render();
      start();
    };
    const resize = new ResizeObserver(() => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
      ready = true;
    });
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(id);
          id = 0;
          last = 0;
        }
        start();
      },
      { rootMargin: "80px" },
    );
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(id);
        id = 0;
        last = 0;
      } else start();
    };
    resize.observe(host);
    observer.observe(host);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(id);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      update = undefined;
    };
  });
</script>

<div class="traffic-art" bind:this={host} data-traffic-art data-scene={scene}>
  <canvas bind:this={canvas} aria-label={label}></canvas><picture
    class:loaded={ready}
    ><source
      media="(max-width: 600px)"
      srcset={`/assets/traffic-journey/mobile-${scene}.png`}
    /><img
      src={`/assets/traffic-journey/scene-${scene}.png`}
      alt={label}
      width="960"
      height="620"
    /></picture
  >
</div>

<style>
  .traffic-art {
    width: 100%;
    aspect-ratio: 1.55;
    position: relative;
    overflow: hidden;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  picture {
    position: absolute;
    inset: 0;
  }
  picture.loaded {
    visibility: hidden;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  @media (max-width: 700px) {
    .traffic-art {
      aspect-ratio: 1.12;
    }
  }
</style>
