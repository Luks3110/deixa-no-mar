/** Render a shareable 1080 × 1350 poster using the page's local art and fonts. */
export async function exportPoster(lines, accent) {
  await Promise.all([
    document.fonts.load('900 180px "Barlow Condensed"'),
    document.fonts.load('500 36px "Space Grotesk"'),
  ]);
  await document.fonts.ready;
  const animal = new Image();
  animal.src = "/assets/pepino-clay.png";
  await animal.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "top";
  const titles = lines.map((line) => line.toLocaleUpperCase("pt-BR"));
  let size = 190;
  ctx.font = `900 ${size}px "Barlow Condensed"`;
  while (
    titles.some((line) => ctx.measureText(line).width > 936) &&
    size > 100
  ) {
    size -= 2;
    ctx.font = `900 ${size}px "Barlow Condensed"`;
  }
  titles.forEach((line, index) =>
    ctx.fillText(line, 72, 60 + index * size * 0.94),
  );
  ctx.save();
  ctx.translate(540, 770);
  ctx.rotate(-0.13);
  ctx.drawImage(animal, -520, -347, 1040, 694);
  ctx.restore();
  ctx.fillStyle = "#ffffff";
  ctx.font = '500 36px "Space Grotesk"';
  ctx.fillText("Contra o tráfico de pepinos-do-mar.", 72, 1115);
  ctx.fillText("Tem vida que vale mais livre.", 72, 1170);
  ctx.font = '600 32px "Space Grotesk"';
  ctx.fillText("deixa no mar.", 72, 1260);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Não foi possível gerar o cartaz");
  return blob;
}
