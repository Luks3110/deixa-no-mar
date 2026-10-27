<script lang="ts">
  import { onMount, untrack } from "svelte";

  let {
    variant = "hero",
    ink = "#122d38",
    accent = "#d52b0b",
    class: className = "",
    paused = false,
    progress,
  }: {
    variant?: "hero" | "inline";
    ink?: string;
    accent?: string;
    class?: string;
    paused?: boolean;
    progress?: number;
  } = $props();

  let canvas: HTMLCanvasElement;
  let stage: HTMLDivElement;
  let reducedMotion = $state(false);
  let redraw: (() => void) | undefined;

  $effect(() => {
    void paused;
    untrack(() => redraw?.());
  });

  onMount(() => {
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion = motionQuery.matches;
    let visible = false;
    let width = 1;
    let height = 1;
    let columns = 1;
    let rows = 1;
    let cellWidth = 7;
    let cellHeight = 9;
    let depth = new Float32Array(1);
    let lights = new Float32Array(1);
    let material = new Float32Array(1);
    let frame = 0;
    let previousTime = 0;
    let elapsed = 0;
    let pointerX = 0;
    let pointerY = 0;
    let easedX = 0;
    let easedY = 0;
    let scrollPosition = 0;
    let easedScroll = 0;
    const ramp = ".:;=+*#%@";

    // An organic capped tube. Raised papillae follow staggered longitudinal rows.
    // Surface coordinates are immutable; only the pose and light change each frame.
    const surface: {
      x: number;
      y: number;
      z: number;
      nx: number;
      ny: number;
      nz: number;
      pigment: number;
    }[] = [];
    for (let u = 1; u < 220; u++) {
      const t = u / 220;
      const x = (t - 0.5) * 5.7;
      const profile = Math.pow(Math.sin(Math.PI * t), 0.37);
      const taper = 0.74 + 0.12 * Math.sin(t * 5.5);
      for (let v = 0; v < 120; v++) {
        const theta = (v / 120) * Math.PI * 2;
        const papilla =
          Math.pow(
            Math.max(0, Math.cos(t * 96 + Math.sin(theta * 5) * 1.1)),
            6,
          ) * Math.pow(Math.max(0, Math.cos(theta * 11)), 5);
        const grain =
          Math.sin(u * 13.17 + v * 7.73) * Math.sin(v * 3.19 + u * 0.91);
        const radius =
          profile * taper + papilla * 0.18 * profile + grain * 0.019;
        surface.push({
          x,
          y: Math.cos(theta) * radius,
          z: Math.sin(theta) * radius * 0.88,
          nx: (t - 0.5) * 0.7,
          ny: Math.cos(theta),
          nz: Math.sin(theta),
          pigment: papilla * 0.75 + grain * 0.12,
        });
      }
    }

    function draw() {
      if (!context) return;
      const moving = !paused && !reducedMotion;
      if (moving) {
        easedX += (pointerX - easedX) * 0.045;
        easedY += (pointerY - easedY) * 0.045;
        const targetScroll =
          progress === undefined
            ? scrollPosition
            : Math.max(0, Math.min(1, progress)) * 2 - 1;
        easedScroll += (targetScroll - easedScroll) * 0.04;
      }
      const time = reducedMotion ? 0 : elapsed;
      const yaw =
        -0.18 +
        Math.sin(time * 0.21) * 0.24 +
        easedX * 0.26 +
        easedScroll * 0.45;
      const roll = 0.3 + time * 0.065 + easedY * 0.18 + easedScroll * 1.1;
      const tilt = -0.23 + Math.sin(time * 0.16) * 0.07 + easedScroll * 0.2;
      const cy = Math.cos(yaw),
        sy = Math.sin(yaw);
      const cr = Math.cos(roll),
        sr = Math.sin(roll);
      const ct = Math.cos(tilt),
        st = Math.sin(tilt);
      const scale = Math.min(width / 7.0, height / 3.5);
      depth.fill(-Infinity);
      lights.fill(0);
      material.fill(0);
      context.clearRect(0, 0, width, height);

      for (const point of surface) {
        const bend =
          Math.sin(point.x * 0.85 + 0.4) * 0.24 +
          Math.sin(point.x * 0.7 + time * 0.6) * 0.055;
        const ry = point.y * cr - point.z * sr + bend;
        const rz = point.y * sr + point.z * cr;
        const rx = point.x * cy + rz * sy;
        const z = -point.x * sy + rz * cy;
        const x = rx * ct - ry * st;
        const y = rx * st + ry * ct;
        const perspective = 8 / (8 - z);
        const col = Math.floor(
          (width * 0.5 + x * scale * perspective) / cellWidth,
        );
        const row = Math.floor(
          (height * 0.48 + y * scale * perspective) / cellHeight,
        );
        if (col < 0 || col >= columns || row < 0 || row >= rows) continue;
        const index = row * columns + col;
        if (z <= depth[index]) continue;
        depth[index] = z;
        const normalY = point.ny * cr - point.nz * sr;
        const normalZ = point.ny * sr + point.nz * cr;
        const normalX = point.nx * cy + normalZ * sy;
        const frontZ = -point.nx * sy + normalZ * cy;
        const light = Math.max(
          0,
          -normalX * 0.35 - normalY * 0.58 + frontZ * 0.71,
        );
        lights[index] = Math.min(
          0.999,
          0.18 + light * 0.75 + point.pigment * 0.12,
        );
        material[index] = point.pigment;
      }

      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `${cellHeight}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`; // taste-skill-ignore: monospace is the material of the ASCII artwork explicitly requested by the user.
      // Each cell resolves its nearest surface sample, so the far side never bleeds through.
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const index = row * columns + col;
          if (depth[index] === -Infinity) continue;
          const light = lights[index];
          context.globalAlpha = 0.35 + light * 0.65;
          context.fillStyle =
            material[index] > 0.3 && light > 0.65 ? accent : ink;
          context.fillText(
            ramp[Math.floor(light * ramp.length)],
            (col + 0.5) * cellWidth,
            (row + 0.5) * cellHeight,
          );
        }
      }
      // A narrow bed of settling sediment grounds the animal in its ecosystem.
      // Deterministic seeds keep resizing and reduced-motion frames free of visual jumps.
      const sedimentGlyphs = ".·:,";
      for (let grain = 0; grain < 110; grain++) {
        const seed = (grain * 0.61803398875) % 1;
        const drift = (seed + time * (0.007 + (grain % 4) * 0.001)) % 1;
        const envelope = Math.sin(drift * Math.PI);
        const x = width * (0.08 + drift * 0.84);
        const stream =
          Math.sin(drift * Math.PI * 2 + time * 0.15) * height * 0.035;
        const y =
          height * 0.84 +
          stream +
          Math.sin(grain * 17.13) * height * 0.045 * envelope;
        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);
        if (depth[row * columns + col] > -Infinity) continue;
        context.globalAlpha = (0.24 + (grain % 5) * 0.055) * envelope;
        context.fillStyle = grain % 9 === 0 ? accent : ink;
        context.fillText(sedimentGlyphs[grain % sedimentGlyphs.length], x, y);
      }
      context.globalAlpha = 1;
    }

    function tick(now: number) {
      frame = 0;
      if (!visible || document.hidden) return;
      if (now - previousTime > 1000 / 30) {
        elapsed += Math.min((now - previousTime) / 1000, 0.05);
        previousTime = now;
        draw();
      }
      if (!paused && !reducedMotion) frame = requestAnimationFrame(tick);
    }

    function restart() {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!visible || document.hidden) return;
      previousTime = performance.now();
      draw();
      if (!paused && !reducedMotion) frame = requestAnimationFrame(tick);
    }
    redraw = restart;

    function resize() {
      const bounds = stage.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const pixelRatio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      cellHeight = width < 600 ? 7.5 : 9;
      cellWidth = cellHeight * 0.65;
      columns = Math.ceil(width / cellWidth);
      rows = Math.ceil(height / cellHeight);
      depth = new Float32Array(columns * rows);
      lights = new Float32Array(columns * rows);
      material = new Float32Array(columns * rows);
      updateScroll();
      draw();
    }

    function updateScroll() {
      if (!visible || reducedMotion || paused) return;
      const bounds = stage.getBoundingClientRect();
      scrollPosition = Math.max(
        -1,
        Math.min(
          1,
          (innerHeight * 0.5 - bounds.top - bounds.height * 0.5) / innerHeight,
        ),
      );
    }
    function pointerMove(event: PointerEvent) {
      if (event.pointerType === "touch" || reducedMotion || paused) return;
      const bounds = stage.getBoundingClientRect();
      pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
      pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    }
    function pointerLeave() {
      pointerX = 0;
      pointerY = 0;
    }
    function motionChange() {
      reducedMotion = motionQuery.matches;
      restart();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateScroll();
      restart();
    });
    intersectionObserver.observe(stage);
    stage.addEventListener("pointermove", pointerMove);
    stage.addEventListener("pointerleave", pointerLeave);
    window.addEventListener("scroll", updateScroll, { passive: true });
    document.addEventListener("visibilitychange", restart);
    motionQuery.addEventListener("change", motionChange);
    resize();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      stage.removeEventListener("pointermove", pointerMove);
      stage.removeEventListener("pointerleave", pointerLeave);
      window.removeEventListener("scroll", updateScroll);
      document.removeEventListener("visibilitychange", restart);
      motionQuery.removeEventListener("change", motionChange);
      redraw = undefined;
    };
  });
</script>

<div
  bind:this={stage}
  class="ascii-ocean {className}"
  class:inline={variant === "inline"}
  style:--ascii-ink={ink}
>
  <!-- taste-skill-ignore: monospace characters form requested ASCII artwork, never interface text. -->
  <canvas
    bind:this={canvas}
    aria-label="Escultura em caracteres de um pepino-do-mar, com corpo alongado, curvo e coberto de pequenas papilas."
  ></canvas>
  <noscript>
    <img
      class="ascii-fallback"
      src="/assets/pepino-clay.png"
      width="1536"
      height="1024"
      alt="Pepino-do-mar alaranjado, de corpo alongado e coberto por pequenas papilas"
      loading="lazy"
    />
  </noscript>
</div>

<style>
  .ascii-ocean {
    position: relative;
    width: 100%;
    height: clamp(300px, 35vw, 490px);
    color: var(--ascii-ink);
    contain: layout paint;
  }
  .ascii-ocean.inline {
    height: clamp(260px, 28vw, 400px);
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
  .ascii-fallback {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  @media (max-width: 600px) {
    .ascii-ocean {
      height: 290px;
    }
    .ascii-ocean.inline {
      height: 250px;
    }
  }
</style>
