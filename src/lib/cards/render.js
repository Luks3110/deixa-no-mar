const WIDTH = 1080,
  HEIGHT = 1350;
const INK = "#12343b",
  PAPER = "#f0ebd6",
  ORANGE = "#e65124",
  ACID = "#e0ed78";
const hash = (x, y) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};
const bodyColors = [
  "#674032",
  "#925036",
  "#b46639",
  "#d37e40",
  "#e79a50",
  "#f2b86b",
  "#f9d392",
];
function tile(c, x, y, color, size = 8) {
  c.fillStyle = color;
  c.fillRect(Math.round(x / 8) * 8, Math.round(y / 8) * 8, size, size);
}
function type(
  c,
  text,
  x,
  y,
  size,
  color = INK,
  weight = 900,
  family = "Barlow Condensed",
  maxWidth = 960,
) {
  c.fillStyle = color;
  c.font = `${weight} ${size}px "${family}"`;
  c.textAlign = "left";
  const measured = c.measureText(text).width;
  if (measured > maxWidth) {
    c.save();
    c.translate(x, y);
    c.scale(maxWidth / measured, 1);
    c.fillText(text, 0, 0);
    c.restore();
  } else c.fillText(text, x, y);
}
function lines(
  c,
  text,
  x,
  y,
  width,
  size,
  lineHeight,
  color = INK,
  weight = 500,
) {
  c.font = `${weight} ${size}px "Space Grotesk"`;
  c.fillStyle = color;
  let line = "",
    baseline = y;
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && c.measureText(next).width > width) {
      c.fillText(line, x, baseline);
      baseline += lineHeight;
      line = word;
    } else line = next;
  }
  if (line) c.fillText(line, x, baseline);
  return baseline;
}
function printTexture(c, dark = false) {
  c.save();
  c.fillStyle = dark ? "#e5e8c5" : INK;
  c.globalAlpha = 0.065;
  for (let i = 0; i < 3400; i++) {
    const x = hash(i, 3) * WIDTH,
      y = hash(i, 7) * HEIGHT;
    c.fillRect(x, y, hash(i, 11) > 0.75 ? 2 : 1, 1);
  }
  c.restore();
}
function animal(c, x, y, length, radius, disappearing = false) {
  for (let u = 0; u < length; u += 8) {
    const f = u / length,
      axis = Math.sin(f * 5.4 + 0.4) * 36;
    const r =
      radius *
      Math.pow(Math.sin(Math.PI * f), 0.39) *
      (1 + Math.sin(f * 13) * 0.08);
    for (let v = -r; v <= r; v += 8) {
      const n = hash(u, Math.round(v / 8));
      if (disappearing && f > 0.55 && n < (f - 0.55) * 2.1) continue;
      tile(c, x + u + 8, y + axis + v + 18, "#153e3e30", 8.4);
      const light = Math.max(
        0,
        Math.min(0.99, 0.54 - v / (2.9 * r) + n * 0.18),
      );
      tile(
        c,
        x + u,
        y + axis + v,
        bodyColors[Math.floor(light * bodyColors.length)],
        8.3,
      );
      if (n > 0.89) {
        c.fillStyle = "#5b3e3260";
        c.font = "7px monospace";
        c.fillText(v < 0 ? "+" : ":", x + u, y + axis + v + 7);
      }
    }
    if (
      u > 24 &&
      u < length - 24 &&
      Math.floor(u / 8) % 4 === 0 &&
      (!disappearing || f < 0.6)
    ) {
      tile(c, x + u, y + axis - r - 9, "#efb76c");
      tile(c, x + u + 1, y + axis - r - 17, "#d59651", 7);
    }
  }
}
function habitat(c, top, height, { absent = false, dark = false } = {}) {
  c.fillStyle = dark ? "#28535b" : "#83b9ad";
  c.fillRect(0, top, WIDTH, height);
  for (let yy = top; yy < top + height; yy += 8)
    for (let xx = 0; xx < WIDTH; xx += 8) {
      const shore =
        top + height * 0.36 + Math.sin(xx * 0.007) * 38 + xx * 0.035;
      const n = hash(xx, yy);
      if (yy > shore && n > Math.max(0, 0.6 - (yy - shore) / 55))
        tile(
          c,
          xx,
          yy,
          n > 0.8 ? "#ded9b7" : n > 0.25 ? "#c5caa5" : "#b0ba98",
          8.3,
        );
    }
  for (let i = 0; i < 45; i++) {
    const x = hash(i, 1) * WIDTH,
      y = top + hash(i, 2) * height * 0.3;
    c.fillStyle = dark ? "#6b9e9738" : "#d7e4cd65";
    c.fillRect(x, y, 20 + hash(i, 5) * 65, 5);
  }
  if (absent) {
    for (let u = 0; u < 790; u += 8) {
      const f = u / 790,
        r = 43 * Math.sin(f * Math.PI);
      for (let v = -r; v <= r; v += 8)
        if (hash(u, v) > 0.25)
          tile(
            c,
            100 + u,
            top + height * 0.7 + Math.sin(f * 6) * 11 + v,
            "#819777",
            8,
          );
    }
  }
}
function frame(c, card, dark = false) {
  const color = dark ? PAPER : INK;
  type(c, "DEIXA NO MAR.", 60, 68, 25, color, 700, "Space Grotesk");
  c.textAlign = "right";
  c.font = '500 21px "Space Grotesk"';
  c.fillStyle = color;
  c.fillText(`${card.number} / PROTESTO PARA LEVAR`, 1018, 68);
  c.textAlign = "left";
  c.fillRect(60, 91, 960, 2);
  // Small registration marks belong to the printed poster, not a fake app frame.
  for (const x of [28, 1044]) {
    c.fillRect(x, 25, 8, 33);
    c.fillRect(x - 11, 36, 30, 8);
  }
}
function footer(c, card, y, dark = false) {
  const color = dark ? PAPER : INK;
  c.fillStyle = color;
  c.fillRect(60, y - 27, 960, 2);
  const sources =
    card.art === "future"
      ? [
          "FAO (2010) · Extinções locais por sobrepesca.",
          "Clements et al. · Nature Communications (2024).",
        ]
      : [card.source];
  sources.forEach((source, i) =>
    type(c, source, 60, y + 9 + i * 29, 22, color, 500, "Space Grotesk"),
  );
  type(
    c,
    "CONTRA O TRÁFICO DE PEPINOS-DO-MAR",
    60,
    1320,
    22,
    color,
    700,
    "Space Grotesk",
  );
}
export async function loadCardFonts(fonts = document.fonts) {
  await Promise.all([
    fonts.load('900 120px "Barlow Condensed"'),
    fonts.load('500 38px "Space Grotesk"'),
    fonts.load('700 24px "Space Grotesk"'),
  ]);
}
export function renderCard(canvas, card) {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Não foi possível gerar a arte.");
  c.imageSmoothingEnabled = false;
  if (card.art === "living") {
    c.fillStyle = INK;
    c.fillRect(0, 0, WIDTH, HEIGHT);
    frame(c, card, true);
    type(c, "DEIXA", 53, 338, 286, ACID);
    type(c, "NO MAR.", 53, 578, 286, ACID);
    habitat(c, 610, 400, { dark: false });
    animal(c, 100, 799, 867, 91);
    // The deposit and the processed grains stay next to the body, on its ground.
    for (let i = 0; i < 30; i++)
      tile(
        c,
        36 + hash(i, 1) * 80,
        799 + hash(i, 2) * 68,
        i % 3 ? "#765c41" : "#aa8050",
      );
    lines(c, card.text, 60, 1081, 954, 40, 52, PAPER);
    type(
      c,
      "PEQUENA VIDA. TRABALHO ENORME.",
      60,
      1197,
      25,
      ACID,
      700,
      "Space Grotesk",
    );
    footer(c, card, 1250, true);
    printTexture(c, true);
  } else if (card.art === "value") {
    c.fillStyle = ORANGE;
    c.fillRect(0, 0, WIDTH, HEIGHT);
    frame(c, card);
    type(c, "O LUCRO", 53, 282, 210);
    type(c, "VIAJA.", 53, 460, 210);
    habitat(c, 500, 255, { absent: true, dark: true });
    c.fillStyle = ACID;
    c.fillRect(600, 521, 418, 163);
    type(
      c,
      "QUASE US$ 1,5 MI",
      621,
      613,
      70,
      INK,
      900,
      "Barlow Condensed",
      374,
    );
    type(
      c,
      "GANHO EM UM CASO NOS EUA",
      621,
      654,
      21,
      INK,
      700,
      "Space Grotesk",
      374,
    );
    type(c, "A CONTA", 53, 936, 210, PAPER);
    type(c, "FICA.", 53, 1110, 210, PAPER);
    lines(c, card.text, 60, 1171, 954, 35, 44, INK, 500);
    footer(c, card, 1278);
    printTexture(c);
  } else {
    c.fillStyle = ACID;
    c.fillRect(0, 0, WIDTH, HEIGHT);
    frame(c, card);
    type(c, "NÃO", 53, 320, 235);
    type(c, "DEIXE", 53, 514, 235);
    type(c, "SUMIR.", 53, 709, 235);
    type(
      c,
      "RETIRAR TEM CONSEQUÊNCIA.",
      62,
      743,
      27,
      INK,
      700,
      "Space Grotesk",
    );
    habitat(c, 778, 277, { absent: false, dark: false });
    animal(c, 100, 902, 865, 83, true);
    lines(c, card.text, 60, 1114, 954, 38, 49, INK);
    footer(c, card, 1238);
    printTexture(c);
  }
  return canvas;
}
