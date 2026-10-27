import {
  sampleWalker,
  solveJoint,
  portState,
  terminalState,
  seatedPerson,
} from "./motion.js";
// Every illustrated edge, light and moving limb is built on the same cell grid.
// Scenes compose separate documented transport modes, never a geographic route.
const C = 5;
const hash = (x, y) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const ink = "#173d42",
  paper = "#f1e7ce",
  orange = ["#714431", "#985332", "#b96836", "#d88a45", "#edac62", "#f5cb8c"];
function contains(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i],
      b = points[j];
    if (
      a[1] > y !== b[1] > y &&
      x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
    )
      inside = !inside;
  }
  return inside;
}
function painter(ctx) {
  const tile = (x, y, color, size = C, glyph = "") => {
    const px = Math.round(x / C) * C,
      py = Math.round(y / C) * C;
    ctx.fillStyle = color;
    ctx.fillRect(px, py, size, size);
    if (glyph) {
      ctx.fillStyle = "#19372e65";
      ctx.font = "5px monospace";
      ctx.fillText(glyph, px, py + 4.3);
    }
  };
  const shape = (x, y, width, height, predicate, colors, grain = true) => {
    for (let yy = 0; yy < height; yy += C)
      for (let xx = 0; xx < width; xx += C) {
        if (!predicate(xx + C / 2, yy + C / 2)) continue;
        const n = hash(xx, yy),
          light = clamp(
            0.7 - (0.5 * yy) / height - (0.16 * xx) / width + n * 0.32,
          );
        tile(
          x + xx,
          y + yy,
          colors[
            Math.min(colors.length - 1, Math.floor(light * colors.length))
          ],
          C + 0.2,
          grain && n > 0.92 ? ":" : "",
        );
      }
  };
  const rect = (x, y, w, h, colors, grain = true) =>
    shape(x, y, w, h, () => true, colors, grain);
  const poly = (points, colors, grain = true) => {
    const minX = Math.min(...points.map((p) => p[0])),
      minY = Math.min(...points.map((p) => p[1]));
    const maxX = Math.max(...points.map((p) => p[0])),
      maxY = Math.max(...points.map((p) => p[1]));
    shape(
      minX,
      minY,
      maxX - minX + C,
      maxY - minY + C,
      (x, y) => contains(x + minX, y + minY, points),
      colors,
      grain,
    );
  };
  const ellipse = (x, y, rx, ry, colors) =>
    shape(
      x - rx,
      y - ry,
      rx * 2,
      ry * 2,
      (xx, yy) => ((xx - rx) / rx) ** 2 + ((yy - ry) / ry) ** 2 < 1,
      colors,
    );
  const line = (x1, y1, x2, y2, width, colors) => {
    const length = Math.hypot(x2 - x1, y2 - y1);
    for (let i = 0; i <= length; i += C * 0.65) {
      const f = i / length;
      ellipse(
        x1 + (x2 - x1) * f,
        y1 + (y2 - y1) * f,
        width / 2,
        width / 2,
        colors,
      );
    }
  };
  const label = (text, x, y, size = 16, color = ink, align = "left") => {
    ctx.fillStyle = color;
    ctx.font = `500 ${size}px "Space Grotesk",sans-serif`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    ctx.textAlign = "left";
  };
  return { ctx, tile, shape, rect, poly, ellipse, line, label };
}
function cucumber(p, x, y, length, time = 0, dried = false) {
  const r = length * (dried ? 0.125 : 0.15);
  p.ellipse(x + length * 0.5 + 4, y + 8, length * 0.49, r * 0.75, [
    "#1b4e4840",
  ]);
  for (let u = 0; u < length; u += C) {
    const f = u / length,
      width =
        r *
        Math.pow(Math.sin(Math.PI * f), 0.38) *
        (1 + 0.12 * Math.sin(f * 11));
    const axis = Math.sin(f * 5.1 + time * 0.8) * length * 0.035;
    for (let v = -width; v <= width; v += C) {
      const light = clamp(
        0.63 - v / (width * 2.7) + hash(u, v) * 0.18 - (dried ? 0.14 : 0),
      );
      p.tile(
        x + u + Math.sin(f * 7 + time * 0.6) * 1.5,
        y + axis + v,
        orange[Math.min(5, Math.floor(light * 6))],
        C + 0.2,
        hash(u, v) > 0.81 ? ":" : "",
      );
    }
    if (u > 10 && u < length - 10 && Math.floor(u / C) % 3 === 0)
      p.tile(x + u, y + axis - width - C, orange[4], C + 0.5);
  }
}
function crate(p, x, y, scale = 1, mark = true) {
  const w = 87 * scale,
    h = 62 * scale;
  p.poly(
    [
      [x, y],
      [x + w, y - 12 * scale],
      [x + w + 18 * scale, y],
      [x + 18 * scale, y + 10 * scale],
    ],
    ["#dbc496", "#eed7a8"],
  );
  p.rect(x, y + 7 * scale, w, h, ["#a98a59", "#c6a36c", "#d8b37a"]);
  p.poly(
    [
      [x + w, y],
      [x + w + 18 * scale, y - 2 * scale],
      [x + w + 18 * scale, y + h - 8 * scale],
      [x + w, y + h + 7 * scale],
    ],
    ["#826d4a", "#a78b60"],
  );
  p.rect(x + w * 0.4, y + 8 * scale, 11 * scale, h, ["#f2dfb3"]);
  if (mark) {
    p.rect(x + 10 * scale, y + 27 * scale, 59 * scale, 25 * scale, ["#f5e7c7"]);
    cucumber(p, x + 17 * scale, y + 39 * scale, 43 * scale, 0, true);
  }
}
function person(
  p,
  actor,
  { officer = false, apron = false, hand = actor.hand } = {},
) {
  const { ctx } = p,
    s = actor.scale,
    d = actor.facing;
  ctx.save();
  ctx.translate(actor.x, actor.ground);
  ctx.scale(s * d, s);
  const q = painter(ctx);
  const trousers = ["#183c43", "#2c5054", "#3a6262"];
  const shirt = officer
    ? ["#183d42", "#29545a", "#3d7277"]
    : ["#546859", "#72836b", "#91a183"];
  const skin = ["#98745b", "#bb9878", "#dcbb93"];
  q.ellipse(2, 5, 39, 7, ["#214c4530"]);
  const hips = [
    { x: -6, y: -97 },
    { x: 7, y: -99 },
  ];
  actor.feet.forEach((foot, i) => {
    const ankle = { x: foot.x, y: foot.y - 9 };
    const knee = actor.seated
      ? { x: 39 + i * 8, y: -53 }
      : !actor.moving
        ? { x: (hips[i].x + ankle.x) / 2, y: (hips[i].y + ankle.y) / 2 }
        : solveJoint(hips[i], ankle, 45, 45, 1);
    const hip = actor.seated ? { x: -5 + i * 9, y: -59 } : hips[i];
    q.line(
      hip.x,
      hip.y,
      knee.x,
      knee.y,
      i ? 16 : 14,
      i ? trousers : ["#436563", "#58766d"],
    );
    q.line(
      knee.x,
      knee.y,
      ankle.x,
      ankle.y,
      i ? 13 : 12,
      i ? trousers : ["#436563", "#58766d"],
    );
  });
  if (actor.seated) ctx.translate(0, 36);
  const sway = actor.moving ? Math.sin(actor.cycle * Math.PI * 2) * 9 : 0;
  // Far arm remains separate from the torso; the near hand has an explicit target.
  const rearShoulder = { x: -13, y: -159 },
    rearHand = { x: actor.action === "pull" ? 23 + sway : -18 - sway, y: -105 };
  const rearElbow = solveJoint(rearShoulder, rearHand, 34, 34, -1);
  q.line(rearShoulder.x, rearShoulder.y, rearElbow.x, rearElbow.y, 12, [
    "#536b5a",
    "#71816b",
  ]);
  q.line(rearElbow.x, rearElbow.y, rearHand.x, rearHand.y, 10, [
    "#536b5a",
    "#71816b",
  ]);
  q.ellipse(rearHand.x, rearHand.y + 3, 6, 8, skin);
  q.poly(
    [
      [-13, -163],
      [7, -166],
      [22, -155],
      [20, -132],
      [25, -103],
      [16, -91],
      [-17, -94],
      [-23, -109],
      [-22, -143],
    ],
    shirt,
  );
  q.rect(-12, -97, 32, 7, ["#37564e"]);
  q.line(11, -157, 16, -109, 4, ["#a1ad8e"]);
  if (apron) {
    q.poly(
      [
        [-10, -146],
        [14, -147],
        [20, -98],
        [-17, -99],
      ],
      ["#c7c8a3", "#dedbb6"],
    );
    q.line(-8, -145, 1, -164, 4, ["#e4deba"]);
  }
  q.poly(
    [
      [-6, -176],
      [8, -178],
      [10, -157],
      [0, -151],
      [-8, -161],
    ],
    skin,
  );
  const headY = -194;
  q.poly(
    [
      [-18, headY - 19],
      [-4, headY - 26],
      [11, headY - 23],
      [19, headY - 13],
      [18, headY - 3],
      [26, headY + 2],
      [18, headY + 7],
      [16, headY + 18],
      [7, headY + 25],
      [-5, headY + 23],
      [-17, headY + 11],
      [-20, headY - 4],
    ],
    skin,
  );
  q.poly(
    [
      [-20, headY - 17],
      [-12, headY - 27],
      [4, headY - 30],
      [16, headY - 24],
      [21, headY - 14],
      [8, headY - 14],
      [-1, headY - 19],
      [-6, headY + 3],
      [-15, headY + 8],
      [-20, headY],
    ],
    ["#233b39", "#354f45"],
  );
  q.ellipse(-5, headY + 6, 5, 7, ["#b18b6d", "#d2aa82"]);
  q.tile(12, headY - 3, "#25423e", 4);
  q.tile(13, headY + 13, "#987158", 4);
  q.poly(
    [
      [-4, -159],
      [1, -151],
      [8, -158],
      [5, -164],
    ],
    ["#e3debf"],
  );
  if (officer) {
    q.poly(
      [
        [-24, headY - 19],
        [-18, headY - 29],
        [13, headY - 29],
        [24, headY - 19],
        [28, headY - 14],
        [-24, headY - 14],
      ],
      ["#153c43", "#2c5358"],
    );
    q.tile(11, -143, "#e9cd86", 8);
  }
  const shoulder = { x: actor.action === "pull" ? -13 : 16, y: -154 };
  const target = hand
    ? { x: (hand.x - actor.x) / (d * s), y: (hand.y - actor.ground) / s }
    : { x: 26 + sway, y: -104 };
  const elbow = solveJoint(shoulder, target, 37, 36, -1);
  q.line(shoulder.x, shoulder.y, elbow.x, elbow.y, 15, shirt);
  q.line(elbow.x, elbow.y, target.x, target.y, 12, shirt);
  q.ellipse(target.x, target.y + 2, 6, 8, skin);
  ctx.restore();
  // Shoes are snapped in world coordinates so a planted foot does not swim
  // across the cell grid as the body moves above it.
  for (const foot of actor.feet) {
    const points = [
      [-7, -10],
      [7, -11],
      [23, -6],
      [25, 0],
      [-9, 0],
    ].map(([x, y]) => [
      actor.x + d * (foot.x + x) * s,
      actor.ground + (foot.y + y) * s,
    ]);
    p.poly(points, ["#173b40", "#244b4d"]);
  }
}
function suitcase(p, x, y, scale = 1, inspected = false) {
  p.rect(x + 15 * scale, y - 42 * scale, 27 * scale, 6 * scale, [ink]);
  p.rect(x + 15 * scale, y - 42 * scale, 5 * scale, 44 * scale, [ink]);
  p.rect(x + 37 * scale, y - 42 * scale, 5 * scale, 44 * scale, [ink]);
  p.rect(x, y, 65 * scale, 92 * scale, ["#734731", "#935d3b", "#ba8052"]);
  p.rect(x + 8 * scale, y + 6 * scale, 7 * scale, 78 * scale, ["#e8bb7c"]);
  p.rect(x + 49 * scale, y + 6 * scale, 5 * scale, 78 * scale, ["#78503b"]);
  p.ellipse(x + 11 * scale, y + 95 * scale, 6 * scale, 7 * scale, [ink]);
  p.ellipse(x + 55 * scale, y + 95 * scale, 6 * scale, 7 * scale, [ink]);
  if (inspected) {
    p.rect(x + 5 * scale, y + 10 * scale, 55 * scale, 69 * scale, ["#133c40"]);
    cucumber(p, x + 12 * scale, y + 29 * scale, 42 * scale, 0, true);
    cucumber(p, x + 10 * scale, y + 58 * scale, 43 * scale, 0.8, true);
  }
}
function ship(p, x, y, scale = 1, time = 0, loaded = true) {
  y += Math.sin(time * 1.2) * 2 * scale;
  const bob = 0;
  const point = ([xx, yy]) => [x + xx * scale, y + (yy + bob) * scale];
  const poly = (pts, colors) => p.poly(pts.map(point), colors);
  poly(
    [
      [-215, 1],
      [220, 1],
      [188, 70],
      [-165, 70],
      [-204, 43],
    ],
    ["#183f44", "#254f52", "#386566"],
  );
  poly(
    [
      [-204, 35],
      [208, 35],
      [193, 51],
      [-191, 51],
    ],
    ["#974a2e", "#bf6c3b", "#df9352"],
  );
  p.rect(x - 190 * scale, y - 8 * scale, 395 * scale, 11 * scale, ["#e1ddbb"]);
  p.rect(x - 155 * scale, y - 100 * scale, 83 * scale, 91 * scale, [
    "#a1b7a7",
    "#d8dfc5",
    "#f1edd4",
  ]);
  p.rect(x - 165 * scale, y - 109 * scale, 104 * scale, 17 * scale, [
    "#244d50",
    "#426a66",
  ]);
  for (let i = 0; i < 4; i++)
    p.rect(
      x + (-145 + i * 19) * scale,
      y - 85 * scale,
      13 * scale,
      18 * scale,
      ["#355c5e"],
    );
  p.rect(x - 128 * scale, y - 143 * scale, 15 * scale, 35 * scale, [
    "#365a55",
    "#6a8070",
  ]);
  for (let i = 0; i < (loaded ? 3 : 2); i++)
    p.rect(
      x + (-48 + i * 78) * scale,
      y - 60 * scale,
      71 * scale,
      52 * scale,
      i === 1
        ? ["#a98053", "#c6a36c", "#dcc18a"]
        : ["#567f77", "#75988a", "#94ac96"],
    );
  if (loaded) crate(p, x + 22 * scale, y - 62 * scale, 0.68 * scale);
  p.line(
    x - 78 * scale,
    y - 112 * scale,
    x - 78 * scale,
    y - 185 * scale,
    4 * scale,
    ["#587569"],
  );
  p.poly(
    [
      [x - 76 * scale, y - 180 * scale],
      [x - 38 * scale, y - 169 * scale],
      [x - 76 * scale, y - 157 * scale],
    ],
    ["#d19055", "#e5b16a"],
  );
}
function sea(p, W, H, time, horizon, night = false) {
  const ctx = p.ctx;
  ctx.fillStyle = night ? "#b9d5ca" : "#cfe3d4";
  ctx.fillRect(0, 0, W, H);
  const water = ctx.createLinearGradient(0, horizon, 0, H);
  water.addColorStop(0, night ? "#527f83" : "#7db4ae");
  water.addColorStop(1, night ? "#386d76" : "#5c9c9d");
  ctx.fillStyle = water;
  ctx.fillRect(0, horizon, W, H - horizon);
  for (let i = 0; i < 130; i++) {
    const y = horizon + hash(i, 2) * (H - horizon),
      speed = night ? 10 : 5,
      x =
        (hash(i, 4) * W - time * speed * (0.3 + (y - horizon) / H) + W * 30) %
        W;
    p.rect(
      x,
      y,
      15 + hash(i, 5) * 48,
      C,
      hash(i, 7) > 0.5 ? ["#b0d1c4"] : ["#376f7540"],
      false,
    );
  }
  for (let i = 0; i < 18; i++)
    p.rect(
      (i * 91 - time * 3 + W * 20) % W,
      100 + hash(i, 5) * 90,
      40 + hash(i, 8) * 100,
      C,
      ["#edf0d9"],
      false,
    );
}
function port(ctx, W, H, time, mobile) {
  const p = painter(ctx),
    state = portState(W, H, time, mobile);
  sea(p, W, H, time, H * 0.48);
  p.poly(
    [
      [0, H * 0.48],
      [0, H * 0.32],
      [W * 0.13, H * 0.27],
      [W * 0.32, H * 0.4],
      [W * 0.48, H * 0.48],
    ],
    ["#9ab49b", "#afc2a5"],
  );
  const floor = state.floor;
  p.rect(W * 0.49, floor, W * 0.51, 27, ["#9b9b7d", "#b8b597", "#d5ccab"]);
  p.rect(W * 0.49, floor - 11, W * 0.51, 13, ["#e1d6b5", "#efe2c0"]);
  for (let i = 0; i < 4; i++)
    p.rect(W * (0.52 + i * 0.14), floor + 26, 18, H * 0.28, [
      "#456b62",
      "#6f8b75",
    ]);
  ship(p, state.ship.x, state.ship.y, state.ship.scale, 0, false);
  const g = state.crane;
  p.line(g.mastX, g.beamY, g.mastX, floor - 5, 17, ["#617968", "#8b987b"]);
  p.line(g.beamLeft, g.beamY, g.beamRight, g.beamY, 15, ["#768b72", "#b0b58d"]);
  p.line(g.mastX, g.beamY + 112, g.beamLeft + 42, g.beamY + 4, 6, ["#6d816b"]);
  p.rect(g.trolleyX - 17, g.beamY - 8, 35, 23, ["#264e4d", "#456e61"]);
  p.line(g.trolleyX, g.beamY + 14, g.trolleyX, g.hookY, 6, ["#294c47"]);
  p.line(g.trolleyX - 7, g.hookY, g.trolleyX - 7, g.hookY + 12, 5, ["#203f40"]);
  p.line(g.trolleyX - 7, g.hookY + 12, g.trolleyX + 8, g.hookY + 12, 5, [
    "#203f40",
  ]);
  const cart = state.cart;
  p.rect(cart.x - 9, cart.top, cart.width, 10, ["#355852", "#668270"]);
  for (const offset of [14, cart.width - 15])
    p.ellipse(cart.x + offset, cart.floor - 7, 10, 11, ["#1c4344", "#365b55"]);
  p.line(
    cart.x + cart.width,
    cart.top + 3,
    cart.x + cart.width + 3,
    cart.floor - 110 * state.actor.scale,
    6,
    ["#496d5d"],
  );
  p.line(
    cart.x + cart.width - 4,
    cart.floor - 110 * state.actor.scale,
    cart.x + cart.width + 18,
    cart.floor - 110 * state.actor.scale,
    7,
    ["#244c46"],
  );
  const load = state.cargo;
  if (load.sling) {
    p.line(
      g.trolleyX,
      g.hookY + 9,
      load.x + 11 * load.scale,
      load.y - 5 * load.scale,
      5,
      ["#375247"],
    );
    p.line(
      g.trolleyX,
      g.hookY + 9,
      load.x + 94 * load.scale,
      load.y - 5 * load.scale,
      5,
      ["#375247"],
    );
  }
  crate(p, load.x, load.y, load.scale);
  person(p, state.actor);
  p.poly(
    [
      [0, H * 0.86],
      [W * 0.13, H * 0.8],
      [W * 0.36, H * 0.91],
      [W * 0.39, H],
      [0, H],
    ],
    ["#c5c8a1", "#d8d5b2", "#e7ddba"],
  );
  p.ellipse(W * 0.15, H * 0.94, W * 0.067, H * 0.018, ["#adb491"]);
  p.label("Habitat de origem", W * 0.025, H * 0.99, mobile ? 22 : 17);
  p.label("Porto", W * 0.7, H * 0.95, mobile ? 25 : 19);
  return state;
}
function crossing(ctx, W, H, time, mobile) {
  const p = { ...painter(ctx), ctx };
  sea(p, W, H, time, H * 0.42, true);
  const travel = smooth(clamp(time / 10));
  p.poly(
    [
      [-120 - travel * 180, H * 0.43],
      [-120 - travel * 180, H * 0.22],
      [W * 0.06 - travel * 180, H * 0.26],
      [W * 0.21 - travel * 180, H * 0.39],
      [W * 0.29 - travel * 180, H * 0.43],
    ],
    ["#6c8b7d", "#8da895"],
  );
  const x = W * (mobile ? 0.43 : 0.36) + travel * W * 0.28,
    y = H * 0.59;
  for (let i = 0; i < 45; i++) {
    const f = i / 45,
      tail = x - 200 - f * W * 0.33;
    const wave = Math.sin(f * 17 - time * 2) * 6;
    p.tile(tail, y + 67 + wave + f * 34, "#c4dfcf", 7);
    if (i % 2) p.tile(tail, y + 65 - wave - f * 10, "#95bfb5", 6);
  }
  ship(p, x, y, mobile ? 0.91 : 1.18, time);
  p.label(
    "A costa fica para trás.",
    W * 0.06,
    H * 0.86,
    mobile ? 28 : 23,
    paper,
  );
  p.label(
    "Carga marítima • cena ilustrativa",
    W * 0.06,
    H * 0.92,
    mobile ? 23 : 16,
    "#d7e4cf",
  );
}
function plane(p, x, y, scale = 1, time = 0) {
  const pts = [
    [-180, 0],
    [-155, -14],
    [-10, -18],
    [42, -76],
    [66, -77],
    [35, -17],
    [143, -13],
    [173, -38],
    [189, -38],
    [174, -4],
    [187, 6],
    [164, 13],
    [35, 14],
    [65, 65],
    [43, 65],
    [-15, 16],
    [-152, 13],
  ];
  p.poly(
    pts.map(([xx, yy]) => [x + xx * scale, y + yy * scale]),
    ["#9caf9b", "#dce3c9", "#f6efd8"],
  );
  for (let i = 0; i < 12; i++)
    p.tile(x + (-122 + i * 21) * scale, y - 7 * scale, "#476f70", 4 * scale);
  p.line(
    x - 135 * scale,
    y + 12 * scale,
    x + 132 * scale,
    y + 12 * scale,
    4 * scale,
    ["#cb8a4b"],
  );
}
function terminal(ctx, W, H, time, mobile) {
  const p = painter(ctx),
    floor = H * 0.69;
  ctx.fillStyle = "#e1debf";
  ctx.fillRect(0, 0, W, H);
  p.rect(0, H * 0.17, W, H * 0.43, ["#91b9af", "#acd0c0", "#c4dec9"]);
  p.rect(0, H * 0.5, W, H * 0.13, ["#8fa68f", "#acb79b"]);
  for (let i = 0; i < 9; i++)
    p.rect(i * 150 - ((time * 7) % 150), H * 0.55, 72, 5, ["#e9e3c4"]);
  plane(
    p,
    W * 0.6 + Math.sin(time * 0.08) * W * 0.08,
    H * 0.43,
    mobile ? 1.12 : 1.36,
  );
  for (let i = 0; i < 5; i++)
    p.rect(i * W * 0.26, H * 0.15, 10, H * 0.46, ["#426860", "#668575"]);
  p.rect(0, H * 0.12, W, 14, ["#6d8470", "#93a087"]);
  p.rect(0, H * 0.61, W, H * 0.39, ["#c3bea0", "#d8d1af", "#e5dcba"]);
  // Perspective floor seams establish a space around the walking passenger.
  for (let i = -2; i < 8; i++)
    p.line(W * 0.5 + (i - 2) * 45, floor - 35, W * 0.5 + (i - 2) * 210, H, 3, [
      "#b9b99b",
    ]);
  p.rect(W * 0.5, H * 0.18, W * 0.43, 50, ["#294f50", "#37655f"]);
  p.label("PARTIDAS   →", W * 0.53, H * 0.18 + 34, mobile ? 20 : 23, "#f1e8ca");
  const state = terminalState(W, H, time, mobile);
  suitcase(p, state.bag.x, state.bag.y, state.bag.scale);
  person(p, state.actor);
  const seated = seatedPerson({
    x: W * 0.81,
    ground: H * 0.8,
    scale: 0.76,
    facing: 1,
  });
  const seatY = seated.ground - 58 * seated.scale;
  p.rect(
    seated.x - 25 * seated.scale,
    seatY - 55 * seated.scale,
    9 * seated.scale,
    63 * seated.scale,
    ["#3b635e", "#648474"],
  );
  p.rect(
    seated.x - 25 * seated.scale,
    seatY,
    52 * seated.scale,
    10 * seated.scale,
    ["#456c63", "#8a9d80"],
  );
  for (const leg of [-20, 20])
    p.rect(
      seated.x + leg * seated.scale,
      seatY + 7 * seated.scale,
      6 * seated.scale,
      seated.ground - seatY,
      ["#456c63"],
    );
  person(p, seated);
  p.label(
    "Outra via documentada: bagagem aérea.",
    W * 0.04,
    H * 0.96,
    mobile ? 24 : 17,
  );
  return { ...state, seated };
}
function inspection(ctx, W, H, time, mobile) {
  const p = painter(ctx);
  ctx.fillStyle = "#d9dcc2";
  ctx.fillRect(0, 0, W, H);
  p.rect(0, H * 0.65, W, H * 0.35, ["#b8bea1", "#cbd0af", "#dce0be"]);
  p.rect(0, H * 0.13, W, 62, ["#214e51", "#386767"]);
  p.label(
    "FISCALIZAÇÃO  /  ORIGEM E DOCUMENTOS",
    W * 0.05,
    H * 0.13 + 39,
    mobile ? 23 : 22,
    "#f4ecd1",
  );
  p.rect(W * 0.53, H * 0.29, W * 0.36, H * 0.3, [
    "#426d68",
    "#62877a",
    "#7a9c88",
  ]);
  p.rect(W * 0.56, H * 0.32, W * 0.3, H * 0.22, ["#123b40", "#204e51"]);
  p.label(
    "CARGA IDENTIFICADA",
    W * 0.575,
    H * 0.355,
    mobile ? 18 : 14,
    "#e5dcb7",
  );
  // The scan shows only that wildlife is present, without a packing or hiding method.
  const beam = (time * 0.23) % 1;
  cucumber(p, W * 0.6, H * 0.43, W * 0.19, 0, true);
  p.rect(W * 0.56 + beam * W * 0.3, H * 0.365, 4, H * 0.17, ["#a7cab1"]);
  const table = H * 0.69;
  const inspector = sampleWalker(
    {
      start: W * 0.73,
      ground: H * 0.93,
      scale: mobile ? 1.0 : 1.18,
      facing: -1,
    },
    0,
  );
  inspector.hand = { x: W * 0.66, y: table - 25 };
  person(p, inspector, { officer: true });
  person(
    p,
    sampleWalker(
      {
        start: W * 0.19,
        ground: H * 0.94,
        scale: mobile ? 1.08 : 1.22,
        facing: 1,
      },
      0,
    ),
  );
  p.rect(W * 0.34, table, W * 0.35, 19, ["#496a5c", "#73917c", "#a4b18c"]);
  p.rect(W * 0.37, table + 19, 12, H * 0.22, ["#6c8570"]);
  p.rect(W * 0.64, table + 19, 12, H * 0.22, ["#6c8570"]);
  suitcase(p, W * 0.39, table - 110, mobile ? 0.96 : 1.04, true);
  // Paper slides to the inspector, then remains on the table.
  const handoff = smooth(time / 2);
  p.rect(W * (0.53 + 0.06 * handoff), table - 38, 54, 34, [
    "#d6cfa8",
    "#f3e9c9",
  ]);
  p.line(
    W * (0.54 + 0.06 * handoff),
    table - 25,
    W * (0.54 + 0.06 * handoff) + 32,
    table - 25,
    3,
    ["#7b8f76"],
  );
  p.label("Uso medicinal alegado", W * 0.05, H * 0.29, mobile ? 25 : 22);
  p.label("não substitui documentação.", W * 0.05, H * 0.34, mobile ? 21 : 17);
}
function market(ctx, W, H, time, mobile) {
  const p = painter(ctx);
  ctx.fillStyle = "#e5dfc3";
  ctx.fillRect(0, 0, W, H);
  p.rect(0, H * 0.12, W, H * 0.12, ["#254f50", "#3e6a63"]);
  p.label("PRODUTOS SECOS", W * 0.055, H * 0.205, mobile ? 32 : 36, "#f2e9ca");
  p.rect(W * 0.055, H * 0.28, W * 0.51, H * 0.27, ["#a3b49a", "#b9c3a4"]);
  for (let row = 0; row < 2; row++) {
    const sy = H * (0.39 + row * 0.14);
    p.rect(W * 0.055, sy, W * 0.51, 12, ["#7e8465", "#a9a483"]);
    for (let j = 0; j < 4; j++) {
      const x = W * (0.08 + j * 0.12);
      p.rect(x, sy - 42, 62, 41, ["#c4af7e", "#e3c991"]);
      cucumber(p, x + 6, sy - 23, 49, 0, true);
    }
  }
  const floor = H * 0.92;
  const top = H * 0.76;
  p.rect(0, H * 0.73, W, H * 0.27, ["#bec2a2", "#d5d4b2"]);
  const seller = sampleWalker(
    { start: W * 0.3, ground: floor, scale: mobile ? 0.97 : 1.02, facing: 1 },
    0,
  );
  seller.hand = { x: W * 0.36, y: top - 25 };
  person(p, seller, { apron: true });
  // A counter supports every product. This is a separate market scene, never
  // a continuation of the confiscated suitcase.

  p.rect(W * 0.045, top, W * 0.91, H * 0.22, ["#667d67", "#91a080", "#b5b58e"]);
  p.rect(W * 0.045, top - 13, W * 0.91, 17, ["#bfc3a1", "#e6dfbb"]);
  const customer = sampleWalker(
    {
      start: W * 0.49,
      ground: H * 0.94,
      scale: mobile ? 0.95 : 0.96,
      facing: -1,
    },
    0,
  );
  customer.hand = { x: W * 0.405, y: top - 24 };
  person(p, customer);
  p.rect(W * 0.33, top - 48, 60, 40, ["#bd9b68", "#debd86"]);
  cucumber(p, W * 0.34, top - 28, 43, 0, true);
  p.label("Loja", W * 0.08, H * 0.95, mobile ? 24 : 20);
  // Two named uses are product displays, not efficacy claims or an exact menu.
  const bx = W * 0.78,
    by = top - 45;
  p.ellipse(bx, by, 70, 20, ["#9c6740", "#bb8650"]);
  p.poly(
    [
      [bx - 68, by],
      [bx + 68, by],
      [bx + 50, by + 45],
      [bx - 48, by + 45],
    ],
    ["#b4bfa4", "#e6dec0", "#f7ecd0"],
  );
  p.ellipse(bx, by - 2, 65, 14, ["#906440", "#b7854e"]);
  cucumber(p, bx - 48, by - 5, 51, 0, true);
  cucumber(p, bx + 6, by - 2, 42, 0, true);
  p.label("Alimento", bx, top + 30, mobile ? 25 : 24, ink, "center");
  const jx = W * 0.78,
    jy = H * 0.34;
  p.rect(jx - 26, jy, 57, 92, ["#6d7c62", "#94a07e", "#b2b896"]);
  p.rect(jx - 31, jy - 10, 66, 17, ["#5a705a", "#8b9871"]);
  p.rect(jx - 20, jy + 25, 45, 42, ["#e1d9b4", "#f2e7c6"]);
  cucumber(p, jx - 17, jy + 45, 37, 0, true);
  p.rect(jx - 46, jy + 93, 100, 11, ["#687e65", "#9daa83"]);
  p.label("Uso tradicional", jx, H * 0.56, mobile ? 23 : 23, ink, "center");
  p.label("medicinal", jx, H * 0.605, mobile ? 23 : 23, ink, "center");
}

const scenes = [port, crossing, terminal, inspection, market];
export function drawTrafficJourney(
  ctx,
  width,
  height,
  {
    scene = 0,
    previous = scene,
    transition = 1,
    time = 0,
    previousTime = 2,
    previousFrame = null,
    compact = height / width > 0.75,
  } = {},
) {
  const mobile = compact,
    W = mobile ? 700 : 960,
    H = mobile ? 625 : 620,
    s = width / W;
  ctx.save();
  ctx.scale(s, height / H);
  ctx.imageSmoothingEnabled = false;
  const frame = scenes[scene](ctx, W, H, time, mobile);
  // A cell-column wipe changes the whole place. The illustration never dissolves
  // into the same set with a different caption.
  if (transition < 1 && previous !== scene) {
    ctx.save();
    ctx.beginPath();
    for (let x = 0; x < W; x += C * 3) {
      const delay = hash(Math.floor(x / (C * 3)), 7) * 0.1;
      const edge = (transition * 1.2 - delay) * H;
      if (edge < H)
        ctx.rect(x, Math.max(0, edge), C * 3, H - Math.max(0, edge));
    }
    ctx.clip();
    if (previousFrame) ctx.drawImage(previousFrame, 0, 0, W, H);
    else scenes[previous](ctx, W, H, previousTime, mobile);
    ctx.restore();
  }
  ctx.restore();
  return frame;
}
