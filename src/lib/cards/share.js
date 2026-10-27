export const cardAssetUrl = (card) =>
  `/assets/card-${card.id}.png?v=share-20261026`;
export const cardFileName = (card) => `protesto-${card.id}.png`;

export function cardCaption(card, pageUrl = "") {
  return [card.shareText, "#DeixaNoMar", pageUrl].filter(Boolean).join("\n\n");
}

// The web composer shares the campaign page; the PNG goes through Web Share.
export function xComposerUrl(card, pageUrl = "") {
  const params = new URLSearchParams({ text: cardCaption(card) });
  if (pageUrl) params.set("url", pageUrl);
  return `https://x.com/intent/tweet?${params}`;
}

export async function prepareCardFile(card, fetcher = globalThis.fetch) {
  const response = await fetcher(cardAssetUrl(card));
  if (!response.ok) throw new Error("Não foi possível preparar a imagem.");
  const buffer = await response.arrayBuffer();
  const view = new DataView(buffer);
  if (
    buffer.byteLength < 24 ||
    view.getUint32(0) !== 0x89504e47 ||
    view.getUint32(4) !== 0x0d0a1a0a ||
    view.getUint32(16) !== 1080 ||
    view.getUint32(20) !== 1350
  ) {
    throw new Error("A imagem não está no formato esperado.");
  }
  return new File([buffer], cardFileName(card), { type: "image/png" });
}

export function canShareCardFile(file, nav = globalThis.navigator) {
  try {
    return (
      !!file &&
      typeof nav?.share === "function" &&
      typeof nav?.canShare === "function" &&
      nav.canShare({ files: [file] })
    );
  } catch {
    return false;
  }
}

// No fetch, canvas encoding, clipboard or await may precede this call in a click.
// The prepared File reaches navigator.share while transient activation is live.
export function shareCardFile(file, card, pageUrl, nav = globalThis.navigator) {
  if (!canShareCardFile(file, nav)) return Promise.resolve("unsupported");
  try {
    const handoff = nav.share({
      files: [file],
      title: card.lines.join(" "),
      text: cardCaption(card, pageUrl),
    });
    return Promise.resolve(handoff).then(
      () => "handed-off",
      (error) => (error?.name === "AbortError" ? "cancelled" : "unavailable"),
    );
  } catch (error) {
    return Promise.resolve(
      error?.name === "AbortError" ? "cancelled" : "unavailable",
    );
  }
}
