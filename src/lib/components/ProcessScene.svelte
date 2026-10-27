<script>
  import { onMount } from "svelte";
  import { createScrollScene } from "../motion/scene-stage.js";
  let {
    id,
    title,
    intro,
    steps,
    theme = "ocean",
    sequential = false,
    nextHref = "",
    nextLabel = "Continuar",
    children,
    sources,
  } = $props();
  let section;
  let navigationInstant = $state(false);
  let advancing = $state(false);
  let destination = $state(0);
  const navigationIndex = $derived(advancing ? destination : current);
  let progress = $state(1);
  let live = $state(false);
  let ready = $state(false);
  let reduced = $state(false);
  const current = $derived(
    Math.min(steps.length - 1, Math.floor(progress * steps.length)),
  );

  onMount(() => {
    ready = true;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => (reduced = motion.matches);
    preference();
    motion.addEventListener("change", preference);
    const dispose = createScrollScene(section, {
      hold: sequential ? steps.length * 0.56 : 2.3,
      rest() {
        live = false;
        advancing = false;
        progress = sequential ? 0 : 1;
      },
      build(timeline) {
        live = true;
        progress = 0;
        const playhead = { value: 0 };
        timeline.to(playhead, {
          value: 1,
          duration: 1,
          onUpdate() {
            progress = playhead.value;
            if (Math.floor(progress * steps.length) === destination)
              advancing = false;
          },
        });
      },
    });
    const resume = () => {
      navigationInstant = false;
      advancing = false;
    };
    section.addEventListener("wheel", resume, { passive: true });
    section.addEventListener("touchstart", resume, { passive: true });
    return () => {
      section.removeEventListener("wheel", resume);
      section.removeEventListener("touchstart", resume);
      motion.removeEventListener("change", preference);
      dispose();
    };
  });
  function choose(index, instant = false) {
    destination = Math.max(0, Math.min(steps.length - 1, index));
    const next = (destination + 0.5) / steps.length;
    navigationInstant =
      instant || matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!live) {
      progress = next;
      advancing = false;
    } else {
      advancing = !navigationInstant;
      if (navigationInstant) progress = next;
      const top = section.getBoundingClientRect().top + scrollY;
      const stageHeight = section.querySelector(".scene-stage").offsetHeight;
      window.scrollTo({
        top: top + (section.offsetHeight - stageHeight) * next,
        behavior: navigationInstant ? "instant" : "smooth",
      });
    }
  }
</script>

<section
  {id}
  class="process-scene {theme}"
  class:enhanced={ready}
  class:playing={live}
  class:reduced
  data-scene={id}
  aria-labelledby={`${id}-title`}
>
  <header class="mobile-heading frame">
    <h2>{title}</h2>
    <p>{intro}</p>
  </header>
  <div class="scene process-track" bind:this={section}>
    <div class="scene-stage process-stage frame">
      <div class="process-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{intro}</p>
      </div>
      <div class="process-art">
        {@render children(progress, navigationInstant)}
      </div>
      <div class="process-story">
        {#if ready && sequential}<div
            class="story-chapter story-copy-stack"
            class:instant={navigationInstant}
            aria-live="polite"
            aria-atomic="true"
          >
            {#each steps as step, index}
              <span
                class="story-copy-panel"
                class:current={current === index}
                aria-hidden={current !== index}
                inert={current !== index}>{step.label}</span
              >
            {/each}
          </div>{:else if ready}
          <div class="process-steps" data-ui aria-label="Etapas da explicação">
            {#each steps as step, index}
              <button
                type="button"
                aria-pressed={current === index}
                onclick={() => choose(index)}>{step.label}</button
              >
            {/each}
          </div>
        {/if}
        {#if ready && sequential}<nav
            class="story-navigation"
            aria-label="Avançar na história"
          >
            <button
              type="button"
              disabled={navigationIndex === 0}
              onclick={(event) =>
                choose(navigationIndex - 1, event.detail === 0)}
              >← Anterior</button
            ><span>{current + 1} / {steps.length}</span
            >{#if navigationIndex < steps.length - 1}<button
                type="button"
                onclick={(event) =>
                  choose(navigationIndex + 1, event.detail === 0)}
                >Próximo →</button
              >{:else}<a href={nextHref}>{nextLabel} →</a>{/if}
          </nav>{/if}
        <ol
          class="process-explanations"
          class:story-copy-stack={ready}
          class:instant={navigationInstant}
        >
          {#each steps as step, index}
            <li
              class="story-copy-panel"
              class:current={current === index}
              aria-hidden={ready && current !== index ? true : undefined}
              inert={ready && current !== index}
            >
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          {/each}
        </ol>
      </div>
      <div class="process-source">{@render sources()}</div>
    </div>
  </div>
  <footer class="mobile-source frame">{@render sources()}</footer>
  {#if ready && reduced}
    <div class="reduced-story frame">
      <header>
        <h2>{title}</h2>
        <p>{intro}</p>
      </header>
      {#each steps as step, index}
        <article>
          <div class="reduced-art">
            {@render children((index + 0.5) / steps.length, true, true)}
          </div>
          <div>
            <p class="story-chapter">{step.label}</p>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        </article>
      {/each}
      <footer>{@render sources()}</footer>
    </div>
  {/if}
</section>

<style>
  .story-chapter {
    font-size: 16px;
    margin-bottom: 20px;
    opacity: 0.8;
  }
  .story-navigation {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-top: 20px;
    font-size: 15px;
  }
  .story-navigation button,
  .story-navigation a {
    min-height: 44px;
    padding: 9px 0;
    color: inherit;
    background: transparent;
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .story-navigation button:disabled {
    opacity: 0.35;
    text-decoration: none;
  }
  .story-navigation span {
    opacity: 0.7;
    font-size: 14px;
  }
  .process-scene {
    --scene-ground: #132e37;
    --scene-ink: #e8f0ee;
    background: var(--scene-ground);
    color: var(--scene-ink);
  }
  .mobile-source {
    display: none;
  }
  .mobile-heading {
    display: none;
  }
  .reduced .process-track {
    display: none;
  }
  .reduced-story {
    padding-block: 40px;
    display: grid;
    gap: 40px;
  }
  .reduced-story > header p {
    margin-top: 16px;
  }
  .reduced-story article {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    align-items: center;
    gap: 32px;
  }
  .reduced-story article h3 {
    margin-bottom: 12px;
  }
  .reduced-story > footer {
    font-size: 13px;
  }
  .reduced-story :global(a) {
    text-decoration: underline;
  }
  .playing .process-stage {
    min-height: 0;
  }
  .process-scene.trade {
    --scene-ground: #a91e0a;
    --scene-ink: #ffffff;
  }
  .process-stage {
    display: grid;
    grid-template-columns: 0.85fr 1.5fr;
    grid-template-rows: auto 1fr auto;
    gap: 24px 5%;
    padding-block: 64px;
    min-height: 800px;
    align-items: center;
  }
  .process-heading {
    grid-column: 1;
    grid-row: 1;
    align-self: end;
  }
  .process-heading h2 {
    max-width: 11ch;
    font-family: var(--text);
    font-size: var(--heading);
    font-weight: 500;
    line-height: 1.04;
  }
  .process-heading > p {
    margin-top: 25px;
    max-width: 33ch;
    font-size: var(--body);
  }
  .process-art {
    grid-column: 2;
    grid-row: 1 / 3;
    min-width: 0;
    width: 100%;
    max-width: 680px;
    justify-self: end;
  }
  .process-story {
    grid-column: 1;
    grid-row: 2;
    align-self: start;
  }
  .process-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    margin-bottom: 25px;
  }
  .process-steps button {
    padding: 9px 0;
    min-height: 44px;
    color: inherit;
    background: transparent;
    font-size: 16px;
    opacity: 0.65;
  }
  .process-steps button[aria-pressed="true"] {
    opacity: 1;
    text-decoration: underline;
    text-underline-offset: 7px;
    text-decoration-thickness: 2px;
  }
  .process-explanations {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .process-explanations li + li {
    margin-top: 24px;
  }
  .process-explanations h3 {
    font-size: var(--lead);
    line-height: 1.2;
    margin-bottom: 14px;
  }
  .process-explanations p {
    font-size: var(--body);
    max-width: 35ch;
  }
  .playing .process-explanations {
    min-height: 205px;
  }
  .enhanced .process-explanations li {
    margin: 0;
  }
  .process-source {
    grid-column: 1 / -1;
    grid-row: 3;
    display: flex;
    justify-content: space-between;
    gap: 24px;
    font-size: 16px;
  }
  .process-source :global(a) {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  @media (min-width: 1600px) {
    .process-stage {
      padding-block: 100px;
    }
  }
  @media (max-width: 900px) {
    .reduced-story article {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .reduced-story h2 {
      font-size: 42px;
    }
    .reduced-story article p {
      font-size: 16px;
    }
    .process-stage {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto 1fr auto;
      gap: 16px;
      padding-block: 32px;
      min-height: 0;
    }
    .process-heading {
      grid-column: 1;
      grid-row: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      align-items: center;
    }
    .process-heading h2 {
      font-size: var(--heading);
    }
    .process-heading > p {
      margin-top: 0;
    }
    .process-art {
      grid-column: 1;
      grid-row: 2;
      width: min(100%, 540px);
      justify-self: center;
    }
    .process-story {
      grid-column: 1;
      grid-row: 3;
    }
    .process-steps {
      gap: 0 16px;
      margin-bottom: 14px;
    }
    .process-explanations p {
      max-width: none;
    }
    .playing .process-explanations {
      min-height: 145px;
    }
    .process-source {
      grid-column: 1;
      grid-row: 4;
    }
  }
  @media (max-width: 600px) {
    .process-stage {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto 1fr auto;
      gap: 12px;
      padding-block: 24px;
      min-height: 0;
    }
    .process-heading {
      display: block;
      grid-column: 1;
      grid-row: 1;
    }
    .process-heading h2 {
      max-width: 15ch;
      font-size: var(--heading);
      line-height: 1.05;
    }
    .process-heading > p {
      margin-top: 14px;
      font-size: var(--body);
      max-width: 38ch;
      line-height: 1.4;
    }
    .process-art {
      grid-column: 1;
      grid-row: 2;
      margin-inline: -10px;
    }
    .process-story {
      grid-column: 1;
      grid-row: 3;
    }
    .process-steps {
      margin-bottom: 14px;
      gap: 0 13px;
    }
    .process-steps button {
      font-size: var(--small);
    }
    .process-explanations h3 {
      font-size: var(--lead);
      margin-bottom: 10px;
    }
    .process-explanations p {
      font-size: var(--body);
      line-height: 1.45;
      max-width: none;
    }
    .playing .process-explanations {
      min-height: 150px;
    }
    .process-source {
      grid-column: 1;
      grid-row: 4;
      display: block;
      font-size: var(--small);
      line-height: 1.45;
    }
    .process-source :global(p + p) {
      margin-top: 6px;
    }
  }
  @media (max-height: 740px) and (min-width: 601px) {
    .process-stage {
      min-height: 0;
      padding-block: 30px;
      gap: 15px 4%;
    }
    .process-heading h2 {
      font-size: 42px;
    }
    .process-heading > p {
      margin-top: 15px;
    }
  }
  @media (max-height: 750px) and (max-width: 600px) {
    .playing .process-heading > p {
      display: none;
    }
    .process-stage {
      padding-block: 20px;
      gap: 12px;
    }
    .playing .process-explanations {
      min-height: 135px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .process-stage {
      min-height: 0;
    }
  }
  @media (max-width: 900px) {
    .story-navigation {
      margin: 0 0 18px;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 12px;
    }
    .story-navigation button,
    .story-navigation a {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 48px;
      padding: 10px 12px;
      border: 1px solid #b8d4ce66;
      text-decoration: none;
      font-size: 14px;
    }
    .story-navigation button:last-child,
    .story-navigation a {
      background: #e8b66a;
      color: #132e37;
      border-color: #e8b66a;
      font-weight: 600;
    }
    .story-chapter {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 9px;
    }
    .process-heading > p {
      font-size: 16px;
      line-height: 1.4;
      margin-top: 10px;
    }
    .process-story {
      width: 100%;
    }
    .process-explanations p {
      font-size: 16px;
      line-height: 1.5;
    }
    .process-source {
      font-size: 12px;
      opacity: 0.8;
    }
  }
  @media (max-width: 900px) {
    .playing .process-stage {
      grid-template-rows: auto auto minmax(0, 1fr);
      align-content: start;
      gap: 10px;
      padding-block: 16px;
    }
    .playing .process-heading {
      display: block;
      align-self: start;
    }
    .playing .process-heading h2 {
      max-width: none;
      font-size: clamp(28px, 4.5svh, 38px);
      line-height: 1;
    }
    .playing .process-heading > p {
      display: none;
    }
    .playing .process-art {
      width: min(100%, 400px);
      margin: 0;
      --ecology-habitat-ratio: 2.2;
      --ecology-detail-ratio: 4.6;
      --ecology-note-display: none;
      --ecology-heading-display: none;
    }
    .playing .process-story {
      align-self: start;
    }
    .playing .process-explanations {
      min-height: 0;
    }
    .playing .process-explanations h3 {
      font-size: 22px;
      margin-bottom: 8px;
    }
    .playing .process-explanations p {
      font-size: 15px;
      line-height: 1.45;
    }
    .playing .story-chapter {
      margin-bottom: 6px;
    }
    .playing .story-navigation {
      margin-bottom: 12px;
    }
    .playing .story-navigation button,
    .playing .story-navigation a {
      min-height: 44px;
      padding-block: 8px;
    }
    .playing .process-source {
      display: none;
    }
    .playing .mobile-source {
      display: block;
      padding-block: 20px 32px;
      font-size: 12px;
      line-height: 1.5;
    }
    .mobile-source :global(p + p) {
      margin-top: 10px;
    }
    .mobile-source :global(a) {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
  @media (max-width: 900px) and (max-height: 720px) {
    .playing .process-stage {
      padding-block: 12px;
      gap: 8px;
    }
    .playing .process-art {
      width: min(100%, 330px);
    }
    .playing .process-heading h2 {
      font-size: 28px;
    }
  }
  @media (max-width: 600px) and (max-height: 620px) {
    .playing .process-art {
      --ecology-habitat-ratio: 3.4;
    }
    .playing .mobile-heading {
      display: block;
      padding-block: 24px;
    }
    .mobile-heading h2 {
      font-size: 38px;
    }
    .mobile-heading p {
      margin-top: 12px;
      font-size: 16px;
    }
    .playing .process-heading {
      display: none;
    }
  }
  @media (min-width: 601px) and (max-width: 1099px) and (max-height: 650px) {
    .playing .process-stage {
      grid-template-columns: 1fr 1.1fr;
      grid-template-rows: auto 1fr;
      gap: 8px 24px;
      padding-block: 16px;
    }
    .playing .process-heading {
      grid-column: 1;
      grid-row: 1;
    }
    .playing .process-heading h2 {
      font-size: 28px;
    }
    .playing .process-art {
      grid-column: 2;
      grid-row: 1 / 3;
      width: min(100%, 360px);
      align-self: center;
    }
    .playing .process-story {
      grid-column: 1;
      grid-row: 2;
    }
    .playing .process-explanations h3 {
      font-size: 20px;
    }
    .playing .process-explanations p {
      font-size: 14px;
    }
  }
</style>
