<script>
  import { onMount, tick } from "svelte";
  import { protestCards } from "../cards/content.js";
  import {
    cardAssetUrl,
    cardCaption,
    cardFileName,
    canShareCardFile,
    prepareCardFile,
    shareCardFile,
    xComposerUrl,
  } from "../cards/share.js";
  let selected = $state(0),
    ready = $state(false);
  let prepared = $state({});
  let messages = $state({});
  let sharing = $state("");
  let manualCaption = $state(false);
  let campaignUrl = $state("");
  let captionField = $state();
  let prepare;
  const chosen = $derived(protestCards[selected]);

  onMount(() => {
    campaignUrl = `${window.location.origin}${window.location.pathname}`;
    let alive = true;
    const urls = new Set();
    const pending = new Map();
    prepare = (card) => {
      if (pending.has(card.id)) return pending.get(card.id);
      if (prepared[card.id]?.state === "ready") return Promise.resolve();
      prepared = { ...prepared, [card.id]: { state: "preparing" } };
      const request = prepareCardFile(card)
        .then((file) => {
          if (!alive) return;
          const url = URL.createObjectURL(file);
          urls.add(url);
          prepared = {
            ...prepared,
            [card.id]: {
              state: "ready",
              file,
              url,
              native: canShareCardFile(file),
            },
          };
        })
        .catch(() => {
          if (alive) prepared = { ...prepared, [card.id]: { state: "error" } };
        })
        .finally(() => pending.delete(card.id));
      pending.set(card.id, request);
      return request;
    };
    ready = true;
    // Prepare all three identities independently. Selecting another card never
    // borrows the previous card's file or its feedback.
    for (const card of protestCards) prepare(card);
    return () => {
      alive = false;
      for (const url of urls) URL.revokeObjectURL(url);
      prepare = undefined;
    };
  });

  function select(index) {
    selected = index;
    manualCaption = false;
    prepare?.(protestCards[index]);
  }
  function share(card) {
    const entry = prepared[card.id];
    if (entry?.state !== "ready" || sharing) return;
    // Invoke the native API before any asynchronous work in this gesture.
    const handoff = shareCardFile(entry.file, card, campaignUrl);
    sharing = card.id;
    handoff.then((result) => {
      sharing = "";
      if (result === "handed-off")
        messages = {
          ...messages,
          [card.id]:
            "Imagem entregue ao menu de compartilhamento. Finalize a publicação no aplicativo escolhido.",
        };
      else if (result === "cancelled")
        messages = {
          ...messages,
          [card.id]:
            "A imagem continua pronta. Você pode compartilhar quando quiser.",
        };
      else {
        prepared = { ...prepared, [card.id]: { ...entry, native: false } };
        messages = {
          ...messages,
          [card.id]:
            "O menu não abriu. Compartilhe o link no X ou salve a imagem para anexar no aplicativo.",
        };
      }
    });
  }
  function downloaded(card) {
    messages = {
      ...messages,
      [card.id]:
        "Download solicitado. No aplicativo, escolha essa imagem na galeria ou nos arquivos.",
    };
  }
  async function copyCaption(card) {
    try {
      await navigator.clipboard.writeText(cardCaption(card, campaignUrl));
      messages = {
        ...messages,
        [card.id]:
          "Legenda e link copiados. Cole junto com a imagem no aplicativo.",
      };
    } catch {
      manualCaption = true;
      await tick();
      captionField?.focus();
      captionField?.select();
      messages = {
        ...messages,
        [card.id]: "Selecione e copie a legenda abaixo.",
      };
    }
  }
</script>

<section
  id="selos"
  class="share-collection frame"
  class:enhanced={ready}
  aria-labelledby="seal-title"
>
  <header class="seal-intro">
    <p class="eyebrow">Kit de protesto / 3 artes para levar</p>
    <h2 id="seal-title">Põe no feed.</h2>
    <p>A causa é do mar. A voz pode ser sua.</p>
    <p class="seal-format">
      Arte original · PNG 1080 × 1350<br />Imagem pronta para X, Instagram e
      onde você quiser.
    </p>
  </header>
  <div class="seal-gallery">
    {#if ready}<div
        class="seal-picker"
        role="group"
        aria-label="Escolha a arte"
      >
        <!-- Buttons stay in a stable place while the artwork changes. -->
        {#each protestCards as card, i}<button
            type="button"
            aria-pressed={selected === i}
            onclick={() => select(i)}
            data-card-choice={card.id}
            ><span>{card.number}</span>{card.shortLabel}</button
          >{/each}
      </div>{/if}
    {#each protestCards as card, i}
      {@const entry = prepared[card.id]}
      <article
        class="seal-item"
        class:chosen={selected === i}
        data-card-id={card.id}
        data-file-state={entry?.state ?? "preparing"}
        data-share-mode={entry?.state === "ready"
          ? entry.native
            ? "native"
            : "download"
          : (entry?.state ?? "preparing")}
        data-file-name={entry?.file?.name ?? ""}
        aria-label={card.label}
      >
        <figure class="seal-stage">
          <img
            src={entry?.url ?? cardAssetUrl(card)}
            alt={`${card.lines.join(" ")} ${card.text} Fonte: ${card.source}.`}
            width="1080"
            height="1350"
            loading="lazy"
          />
          <figcaption>
            <span>{card.label}</span><span>PNG · 4:5</span>
          </figcaption>
        </figure>
        {#if ready}<div class="file-readiness" aria-live="polite">
            {#if entry?.state === "ready"}<span
                class="ready-dot"
                aria-hidden="true"
              ></span>Imagem pronta para levar{:else if entry?.state === "error"}A
              imagem não carregou. <button
                type="button"
                onclick={() => prepare?.(card)}>Tentar de novo</button
              >{:else}Preparando a imagem…{/if}
          </div>{/if}
        <div class="seal-actions">
          {#if ready && entry?.native}
            <button
              class="primary share-native"
              type="button"
              disabled={!!sharing || entry?.state !== "ready"}
              onclick={() => share(card)}
              >{sharing === card.id
                ? "Abrindo menu…"
                : "Compartilhar imagem"}<span aria-hidden="true">↗</span
              ></button
            >
          {:else if !ready || entry?.state === "ready" || entry?.state === "error"}
            <a
              class="primary share-x"
              href={xComposerUrl(card, campaignUrl)}
              target="_blank"
              rel="noopener noreferrer"
              >Compartilhar no X<span aria-hidden="true">↗</span></a
            >
          {:else}<button class="primary" type="button" disabled
              >Preparando imagem…</button
            >{/if}
          {#if ready}<button
              class="copy-caption"
              type="button"
              onclick={() => copyCaption(card)}
              >Copiar legenda <span aria-hidden="true">⧉</span></button
            >{/if}
        </div>
        <a
          class="save-alternative"
          href={entry?.url ?? cardAssetUrl(card)}
          download={cardFileName(card)}
          onclick={() => downloaded(card)}>Salvar imagem</a
        >
        <p class="share-note">
          {entry?.native
            ? "Escolha o app no menu do celular. Se o texto não acompanhar, copie a legenda com o link aqui."
            : "O post no X leva a legenda e o link para esta página. Para levar a arte, salve a imagem."}
        </p>
        <details class="caption-details">
          <summary>Legenda e link da campanha</summary>
          <p class="caption-preview">{cardCaption(card, campaignUrl)}</p>
          {#if entry?.native}<a
              class="x-composer"
              href={xComposerUrl(card, campaignUrl)}
              target="_blank"
              rel="noopener noreferrer"
              >Compartilhar página no X <span aria-hidden="true">↗</span></a
            >{/if}
        </details>
        <p class="share-status" role="status" aria-live="polite">
          {messages[card.id] ?? ""}
        </p>
      </article>
    {/each}
    {#if ready && manualCaption}<label class="manual-caption"
        >Legenda para copiar<textarea
          bind:this={captionField}
          readonly
          rows="5"
          value={cardCaption(chosen, campaignUrl)}></textarea></label
      >{/if}
  </div>
</section>

<style>
  .share-collection {
    padding-block: 96px;
    background: #d7e5d8;
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: 5vw;
    align-items: start;
  }
  .seal-intro {
    padding-top: 80px;
  }
  .eyebrow {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .seal-intro h2 {
    font-family: var(--display);
    font-weight: 900;
    font-size: clamp(78px, 8.5vw, 132px);
    text-transform: uppercase;
    line-height: 0.88;
    letter-spacing: -0.025em;
    margin: 24px 0;
  }
  .seal-intro > p:not(.eyebrow) {
    max-width: 30ch;
    font-size: 18px;
    line-height: 1.5;
  }
  .seal-intro .seal-format {
    margin-top: 32px;
    font-size: 14px !important;
  }
  .seal-picker {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
    margin-bottom: 22px;
  }
  .seal-picker button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    background: transparent;
    color: #173c42;
    border: 1px solid #173c4260;
    padding: 12px 6px;
    min-height: 48px;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  .seal-picker button[aria-pressed="true"] {
    color: #ededd8;
    background: #183d43;
    border-color: #183d43;
  }
  .seal-picker span {
    font-size: 11px;
    opacity: 0.7;
  }
  .enhanced .seal-item:not(.chosen) {
    display: none;
  }
  .seal-stage {
    max-width: 440px;
    margin: 0 auto;
  }
  .seal-stage img {
    display: block;
    width: 100%;
    height: auto;
    box-shadow: 7px 9px 0 #173d4226;
  }
  figcaption {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 13px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
  figcaption span:last-child {
    white-space: nowrap;
  }
  .file-readiness {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 12px;
    min-height: 41px;
    margin-top: 10px;
  }
  .ready-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #256d52;
  }
  .file-readiness button {
    color: inherit;
    border: 0;
    border-bottom: 1px solid;
    background: transparent;
    font: inherit;
    min-height: 44px;
    cursor: pointer;
  }
  .seal-actions {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 8px;
  }
  .seal-actions a,
  .seal-actions button {
    color: #123b41;
    background: transparent;
    border: 1px solid #123b4180;
    padding: 13px 14px;
    min-height: 52px;
    font: inherit;
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .seal-actions .primary {
    background: #143b42;
    color: #fff2d8;
    border-color: #143b42;
  }
  .seal-actions button:disabled {
    opacity: 0.6;
    cursor: wait;
  }
  .share-note {
    font-size: 12px;
    line-height: 1.45;
    margin: 12px auto;
    max-width: 52ch;
    text-align: center;
  }
  .save-alternative {
    display: block;
    width: fit-content;
    margin: 10px auto 0;
    color: inherit;
    text-underline-offset: 4px;
    padding-block: 6px;
    font-size: 12px;
  }
  .caption-details {
    border-top: 1px solid #153d4240;
    margin-top: 18px;
    padding-top: 5px;
    font-size: 13px;
  }
  summary {
    min-height: 44px;
    cursor: pointer;
    padding-block: 13px;
  }
  .caption-preview {
    white-space: pre-line;
    line-height: 1.5;
    padding: 14px;
    background: #f1eddb;
    margin-bottom: 12px;
  }
  .x-composer {
    color: inherit;
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 10px 0;
    min-height: 44px;
    text-underline-offset: 4px;
  }
  .share-status {
    font-size: 12px;
    line-height: 1.5;
    min-height: 3em;
    margin-top: 10px;
  }
  .seal-item + .seal-item {
    margin-top: 40px;
  }
  .enhanced .seal-item {
    margin-top: 0;
  }
  .manual-caption {
    display: block;
    font-size: 13px;
    margin-top: 12px;
  }
  textarea {
    width: 100%;
    margin-top: 8px;
    padding: 12px;
    font: inherit;
    line-height: 1.5;
    color: #153d42;
    background: #f6f1db;
    border: 1px solid #153d42;
  }
  .seal-picker button,
  .seal-actions a,
  .seal-actions button,
  .save-alternative,
  .x-composer {
    touch-action: manipulation;
    transition:
      transform 140ms var(--ease-out),
      opacity 140ms var(--ease-out);
  }
  .seal-picker button:is(:active, :global([data-pressed="true"])),
  .seal-actions a:is(:active, :global([data-pressed="true"])),
  .seal-actions
    button:not(:disabled):is(:active, :global([data-pressed="true"])),
  .save-alternative:is(:active, :global([data-pressed="true"])),
  .x-composer:is(:active, :global([data-pressed="true"])) {
    transform: scale(0.97);
    opacity: 0.82;
  }
  @media (hover: hover) and (pointer: fine) {
    .seal-actions a:hover,
    .seal-actions button:not(:disabled):hover,
    .save-alternative:hover,
    .x-composer:hover {
      opacity: 0.85;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .seal-picker button,
    .seal-actions a,
    .seal-actions button,
    .save-alternative,
    .x-composer {
      transition: opacity 140ms var(--ease-out);
    }
    .seal-picker button:is(:active, :global([data-pressed="true"])),
    .seal-actions a:is(:active, :global([data-pressed="true"])),
    .seal-actions
      button:not(:disabled):is(:active, :global([data-pressed="true"])),
    .save-alternative:is(:active, :global([data-pressed="true"])),
    .x-composer:is(:active, :global([data-pressed="true"])) {
      transform: none;
    }
  }
  @media (max-width: 760px) {
    .share-collection {
      grid-template-columns: 1fr;
      padding-block: 48px 32px;
      gap: 25px;
    }
    .seal-intro {
      padding-top: 0;
    }
    .seal-intro h2 {
      font-size: clamp(56px, 16vw, 84px);
      margin: 14px 0;
    }
    .seal-intro > p:not(.eyebrow) {
      font-size: 16px;
    }
    .seal-intro .seal-format {
      margin-top: 16px;
      font-size: 12px !important;
    }
    .seal-picker {
      margin-bottom: 18px;
      gap: 5px;
    }
    .seal-picker button {
      flex-direction: column;
      font-size: 12px;
      padding: 10px 5px;
      gap: 6px;
    }
    .seal-stage {
      max-width: 360px;
    }
    .seal-actions {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .seal-actions a,
    .seal-actions button {
      font-size: 15px;
      min-height: 50px;
    }
    .share-note {
      font-size: 12px;
    }
    .caption-details {
      margin-top: 14px;
    }
  }
</style>
