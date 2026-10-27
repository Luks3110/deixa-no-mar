<script>
  import { onMount } from "svelte";
  import MarineWorld from "./MarineWorld.svelte";
  import { ecologyFrame, ecologySteps } from "../art/ecology-story.js";

  let { progress = 1, instant = false, staticFrame = false } = $props();
  const frame = $derived(ecologyFrame(progress));
  const absent = $derived(frame.absent);
  const collecting = $derived(frame.cycle < 0.25);
  const sampleName = $derived(
    collecting ? "Matéria orgânica" : "Material devolvido",
  );
  const detail = $derived(
    frame.chapter === 4
      ? "cycle"
      : frame.chapter >= 5
        ? "consequence"
        : "sample",
  );
  const staticDescriptions = [
    "Um pepino-do-mar recolhe matéria orgânica em uma faixa de areia livre entre os corais. O marcador A identifica o material recolhido.",
    "O pepino devolve material fragmentado à areia. O marcador A destaca a saída do material, em uma área livre de corais.",
    "O material devolvido aparece ampliado com bactérias. Os corais continuam no mesmo habitat.",
    "Nutrientes liberados pela decomposição do material devolvido ao sedimento.",
    "O pepino foi retirado. Um contorno marca sua área de alimentação vazia. A matéria orgânica permanece e o diagrama mostra a interrupção do trabalho deste animal.",
    "No mesmo habitat, a perda de tecido começa na base do coral. O detalhe B diferencia o tecido vivo do esqueleto exposto.",
    "Os pepinos vizinhos também foram retirados. Suas áreas de alimentação ficam vazias e os corais apresentam esqueleto exposto, com algumas pontas vivas.",
  ];
  let ready = $state(false);
  onMount(() => (ready = true));
</script>

<div
  class="ecology-world"
  class:no-js={!ready}
  class:instant
  data-ecology-chapter={frame.chapter}
  data-detail={detail}
>
  {#if staticFrame}
    <img
      class="static-snapshot"
      src={`/assets/marine-story-${frame.chapter}.png`}
      alt={staticDescriptions[frame.chapter]}
      width="900"
      height="892"
    />
  {:else}
    <div class="live-world">
      <div class="habitat-heading">
        <span>O mesmo trecho do fundo</span>
        {#if frame.chapter === 4}<span class="removal-status"
            >{absent ? "Após a retirada" : "Retirada do animal"}</span
          >{/if}
      </div>
      <div class="habitat-frame">
        <MarineWorld
          progress={frame.cycle}
          removal={frame.removal}
          capture={frame.capture}
          damage={frame.damage}
          spread={frame.spread}
          chapter={frame.chapter}
          {absent}
          mode="ecology"
          label={staticDescriptions[frame.chapter]}
        />
        {#if frame.chapter < 4}
          <span
            class="sample-target"
            class:collecting
            style:left={collecting ? "18.8%" : "71.9%"}
            aria-hidden="true"><span>A</span></span
          >
          <span class="sample-pointer" class:collecting aria-hidden="true"
            >{sampleName}</span
          >
        {:else if frame.chapter === 4}
          {#if absent}<span class="collection-label" aria-hidden="true"
              >Retirado do habitat ↗</span
            ><span class="empty-label" aria-hidden="true"
              >Área de alimentação vazia</span
            >{/if}
        {:else}
          <span class="coral-marker" aria-hidden="true">B</span>
        {/if}
      </div>

      <div class="detail-stage">
        <div
          class="interrupted-cycle detail-panel"
          class:active={detail === "cycle"}
          aria-hidden={detail !== "cycle"}
          inert={detail !== "cycle"}
        >
          <p class="detail-heading">O ciclo perde um participante.</p>
          <div class="cycle-flow">
            <div class="cycle-node">
              <svg viewBox="0 0 100 58" aria-hidden="true">
                <path
                  fill="#b97c55"
                  d="M25 35h10v10H25zm14-15h13v13H39zm22 11h11v11H61zm-17 9h9v9h-9zm13-28h8v8h-8z"
                />
                <path
                  fill="#e5b578"
                  d="M21 22h7v7h-7zm33 10h7v7h-7zm18 12h6v6h-6z"
                />
              </svg>
              <span>Matéria orgânica<br />no fundo</span>
            </div>
            <span class="flow-arrow" aria-hidden="true">→</span>
            <div class="cycle-node missing-animal">
              <svg viewBox="0 0 100 58" aria-hidden="true">
                <path
                  d="M13 33c1-13 14-15 27-10s25 0 36-5c17-7 21 8 9 16-19 14-36 17-57 11-9-3-15-6-15-12Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-dasharray="4 4"
                />
                <path
                  d="m42 16 15 29m0-29L42 45"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <span>Animal<br />retirado</span>
            </div>
            <span class="flow-arrow stopped-arrow" aria-hidden="true">×</span>
            <div class="cycle-node stopped-output">
              <svg viewBox="0 0 100 58" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M26 25h5v5h-5zm12-10h4v4h-4zm9 23h5v5h-5zm10-14h4v4h-4zm13 14h5v5h-5zm-39 8h4v4h-4zm26 1h4v4h-4zm14-29h4v4h-4z"
                />
              </svg>
              <span>Fragmentação<br />interrompida</span>
            </div>
          </div>
        </div>
        {#each ["sample", "consequence"] as mode}
          <div
            class="sample-view detail-panel"
            class:active={detail === mode}
            aria-hidden={detail !== mode}
            inert={detail !== mode}
          >
            <p class="sample-label">
              <span class="detail-marker" aria-hidden="true"
                >{mode === "consequence" ? "B" : "A"}</span
              >
              {mode === "consequence"
                ? "Coral em contato com o sedimento"
                : sampleName}
              <span class="scale-note"
                ><span class="scale-full">Ampliação fora de escala</span><span
                  class="scale-short">Sem escala</span
                ></span
              >
            </p>
            <MarineWorld
              progress={frame.cycle}
              removal={frame.removal}
              damage={frame.damage}
              spread={frame.spread}
              chapter={frame.chapter}
              {absent}
              {mode}
              active={detail === mode}
              label={mode === "consequence"
                ? "Detalhe B: perda de tecido a partir da base do coral, com esqueleto claro exposto e tecido vivo nas pontas."
                : "Detalhe A: partículas de matéria orgânica, bactérias e nutrientes. Ampliação esquemática, fora de escala."}
            />
            {#if mode === "consequence"}
              <div class="coral-key">
                <span><i class="living-tissue"></i>Tecido vivo</span>
                <span><i class="exposed-skeleton"></i>Esqueleto exposto</span>
              </div>
            {/if}
          </div>
        {/each}
      </div>

      <p class="world-note">
        {frame.chapter >= 6
          ? "Outros animais são retirados. Mais áreas de alimentação ficam vazias."
          : frame.chapter === 5
            ? "O coral perde tecido a partir da base. O esqueleto permanece."
            : frame.chapter === 4
              ? "A matéria orgânica permanece. Este animal deixa de recolher e fragmentar."
              : collecting
                ? "Matéria orgânica recolhida junto ao sedimento."
                : frame.cycle < 0.5
                  ? "O material é fragmentado e devolvido ao fundo."
                  : frame.cycle < 0.75
                    ? "Bactérias atuam sobre o material fragmentado."
                    : "A decomposição devolve nutrientes ao ambiente."}
      </p>
    </div>
    <noscript>
      <div class="static-sequence">
        {#each ecologySteps as step, i}
          <figure>
            <img
              src={`/assets/marine-story-${i}.png`}
              width="900"
              height="892"
              alt={staticDescriptions[i]}
            />
            <figcaption>
              {step.title} Ampliação esquemática, fora de escala.
            </figcaption>
          </figure>
        {/each}
      </div>
    </noscript>
  {/if}
</div>

<style>
  .no-js .live-world {
    display: none;
  }
  .static-snapshot {
    display: block;
    width: 100%;
    height: auto;
  }
  .static-sequence img {
    width: 100%;
    height: auto;
  }
  .static-sequence figure {
    margin-bottom: 24px;
  }
  .static-sequence figcaption {
    font-size: 15px;
    line-height: 1.4;
    margin-top: 8px;
  }
  .habitat-heading {
    display: var(--ecology-heading-display, flex);
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 10px;
    color: #c5d8d3;
    font-size: 13px;
  }
  .removal-status {
    color: #f4d378;
  }
  .habitat-frame {
    position: relative;
  }
  .sample-target {
    position: absolute;
    top: calc(69% + 3px);
    width: 52px;
    height: 40px;
    transform: translate(-50%, -50%);
    border: 1px solid #77512e;
    border-radius: 50%;
    pointer-events: none;
  }
  .sample-target > span,
  .coral-marker,
  .detail-marker {
    display: inline-grid;
    place-items: center;
    width: 22px;
    height: 22px;
    background: #f4d378;
    color: #173c40;
    font-size: 12px;
    font-weight: 500;
  }
  .sample-target > span {
    position: absolute;
    left: calc(100% - 3px);
    top: -13px;
  }
  .sample-pointer {
    position: absolute;
    left: 57%;
    top: 84%;
    color: #254841;
    font-size: 12px;
    line-height: 1.3;
    pointer-events: none;
  }
  .sample-pointer::before {
    content: "";
    position: absolute;
    bottom: calc(100% + 4px);
    left: 85%;
    height: 15px;
    border-left: 1px solid #77512e;
  }
  .sample-pointer.collecting {
    left: 7%;
  }
  .sample-pointer.collecting::before {
    left: 76%;
  }
  .coral-marker {
    position: absolute;
    left: 87%;
    top: 88%;
  }
  .collection-label {
    position: absolute;
    top: 14%;
    left: 37%;
    color: #264e49;
    font-size: 13px;
  }
  .empty-label {
    position: absolute;
    top: 86%;
    left: 45.5%;
    transform: translateX(-50%);
    color: #654d36;
    font-size: 12px;
    white-space: nowrap;
  }
  .interrupted-cycle {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    margin-top: 0;
    padding-top: 16px;
    border-top: 1px solid #b8d4ce40;
  }
  .detail-heading {
    font-size: 16px;
    font-weight: 500;
  }
  .cycle-flow {
    display: grid;
    grid-template-columns: 1fr 24px 1fr 24px 1fr;
    align-items: start;
    margin-block: auto;
  }
  .cycle-node {
    text-align: center;
    font-size: 14px;
    line-height: 1.4;
  }
  .cycle-node svg {
    display: block;
    width: 100px;
    height: 58px;
    margin: 0 auto 5px;
  }
  .missing-animal {
    color: #f4d378;
  }
  .stopped-output {
    color: #a5bab6;
  }
  .flow-arrow {
    padding-top: 17px;
    color: #b6ccc6;
    text-align: center;
    font-size: 20px;
  }
  .stopped-arrow {
    color: #f4d378;
  }
  .sample-view {
    margin-top: 0;
  }
  .detail-stage {
    display: grid;
    align-items: start;
    margin-top: 16px;
  }
  .detail-panel {
    grid-area: 1 / 1;
    min-width: 0;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(5px);
    transition:
      opacity 220ms var(--ease-out),
      transform 220ms var(--ease-out),
      visibility 0s 220ms;
  }
  .detail-panel.active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
    transition-delay: 0s;
  }
  .instant .detail-panel {
    transition: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .detail-panel {
      transition: none;
      transform: none;
    }
  }
  .sample-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    line-height: 1.4;
    margin-bottom: 8px;
  }
  .detail-marker {
    flex: 0 0 22px;
  }
  .scale-note {
    margin-left: auto;
    font-size: 11px;
    color: #b6ccc6;
    text-align: right;
  }
  .scale-short {
    display: none;
  }
  .coral-key {
    display: flex;
    justify-content: center;
    gap: 24px;
    margin-top: 10px;
    font-size: 12px;
  }
  .coral-key > span {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .coral-key i {
    width: 8px;
    height: 8px;
  }
  .living-tissue {
    background: #d4a96c;
  }
  .exposed-skeleton {
    background: #f6efd6;
  }
  .world-note {
    display: var(--ecology-note-display, block);
    font-size: 15px;
    line-height: 1.45;
    min-height: 44px;
    margin: 16px auto 0;
    max-width: 48ch;
    text-align: center;
    color: #c5d8d3;
  }
  @media (max-width: 900px) {
    .habitat-heading {
      font-size: 11px;
      gap: 8px;
      margin-bottom: 7px;
    }
    .sample-target {
      width: 34px;
      height: 28px;
    }
    .sample-target > span,
    .coral-marker {
      width: 18px;
      height: 18px;
      font-size: 10px;
    }
    .sample-pointer {
      font-size: 10px;
      left: 51%;
      top: 85%;
    }
    .sample-pointer::before {
      height: 12px;
      left: 82%;
    }
    .sample-pointer.collecting {
      left: 5%;
    }
    .sample-pointer.collecting::before {
      left: 65%;
    }
    .collection-label {
      font-size: 11px;
      left: 34%;
    }
    .empty-label {
      font-size: 10px;
    }
    .interrupted-cycle {
      margin-top: 0;
      padding-top: 12px;
    }
    .detail-heading {
      font-size: 14px;
    }
    .cycle-flow {
      grid-template-columns: 1fr 16px 1fr 16px 1fr;
    }
    .cycle-node {
      font-size: 11px;
    }
    .cycle-node svg {
      width: 72px;
      height: 48px;
    }
    .flow-arrow {
      padding-top: 13px;
      font-size: 18px;
    }
    .sample-label {
      font-size: 12px;
    }
    .scale-note {
      max-width: 13ch;
      font-size: 10px;
    }
    .scale-full {
      display: none;
    }
    .scale-short {
      display: inline;
    }
    .world-note {
      font-size: 13px;
      margin-top: 12px;
    }
    .detail-stage {
      margin-top: 12px;
    }
  }
</style>
