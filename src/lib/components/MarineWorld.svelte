<script>
  import { onMount } from "svelte";
  import { drawMarine } from "../art/marine-world.js";
  let {
    progress = 0,
    absent = false,
    removal = 0,
    capture = 0,
    damage = 0,
    spread = 0,
    chapter,
    mode = "hero",
    active = true,
    label = "Um pepino-do-mar alaranjado se alimenta no sedimento de uma enseada.",
  } = $props();
  let canvas, host;
  let ready = $state(false);
  let redraw, updateActivity;
  $effect(() => {
    void progress;
    void absent;
    void removal;
    void capture;
    void damage;
    void spread;
    void chapter;
    if (active) redraw?.();
  });
  $effect(() => {
    void active;
    updateActivity?.();
  });
  onMount(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ready = true;
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = query.matches,
      visible = false,
      id = 0,
      previous = 0,
      time = 0,
      w = 1,
      h = 1;
    const ripples = [];
    function render() {
      drawMarine(ctx, w, h, {
        time,
        progress,
        absent,
        removal,
        capture,
        damage,
        spread,
        chapter,
        mode,
        ripples,
      });
    }
    redraw = render;
    function tick(stamp) {
      id = 0;
      if (!active || !visible || reduced || document.hidden) return;
      if (previous) time += Math.min(0.05, (stamp - previous) / 1000);
      previous = stamp;
      render();
      id = requestAnimationFrame(tick);
    }
    function start() {
      previous = 0;
      if (!id && active && visible && !reduced && !document.hidden)
        id = requestAnimationFrame(tick);
      else if (active) render();
    }
    updateActivity = () => {
      cancelAnimationFrame(id);
      id = 0;
      start();
    };
    const resize = new ResizeObserver(() => {
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      w = r.width;
      h = r.height;
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      render();
    });
    resize.observe(host);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(id);
          id = 0;
        } else start();
      },
      { rootMargin: "100px" },
    );
    observer.observe(host);
    function change() {
      reduced = query.matches;
      cancelAnimationFrame(id);
      id = 0;
      start();
    }
    query.addEventListener("change", change);
    document.addEventListener("visibilitychange", change);
    function ripple(event) {
      if (reduced) return;
      const r = canvas.getBoundingClientRect();
      ripples.push({
        x: event.clientX - r.left,
        y: event.clientY - r.top,
        time,
      });
      if (ripples.length > 8) ripples.shift();
    }
    host.addEventListener("pointerdown", ripple);
    return () => {
      cancelAnimationFrame(id);
      resize.disconnect();
      observer.disconnect();
      query.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", change);
      host.removeEventListener("pointerdown", ripple);
      redraw = undefined;
      updateActivity = undefined;
    };
  });
</script>

<div
  class="marine-world"
  class:ready
  class:sample={mode === "sample" || mode === "consequence"}
  class:ecology={mode === "ecology"}
  bind:this={host}
  data-world={mode}
  data-step={chapter ?? Math.min(3, Math.floor(progress * 4))}
  data-removal={removal}
  data-damage={damage}
  data-spread={spread}
  data-absent={absent}
>
  <canvas bind:this={canvas} aria-label={label}></canvas>
  <img
    class:loaded={ready}
    src={`/assets/marine-${mode}.png`}
    alt={label}
    width="900"
    height="650"
  />
</div>

<style>
  .marine-world {
    width: 100%;
    aspect-ratio: 1.45;
    position: relative;
    overflow: hidden;
    background: #a8d5cc;
    border-radius: 48% 48% 8% 8% / 18% 22% 5% 8%;
    isolation: isolate;
  }
  .marine-world.ecology {
    aspect-ratio: var(--ecology-habitat-ratio, 2);
    border-radius: 12px;
  }
  .marine-world.sample {
    aspect-ratio: var(--ecology-detail-ratio, 4);
    border-radius: 0 0 12px 12px;
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: pan-y;
  }
  img.loaded {
    visibility: hidden;
  }
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  @media (max-width: 600px) {
    .marine-world {
      aspect-ratio: 1.22;
      border-radius: 36% 40% 8% 9% / 12% 16% 5% 5%;
    }
    .marine-world.ecology {
      aspect-ratio: var(--ecology-habitat-ratio, 1.7);
      border-radius: 8px;
    }
  }
</style>
