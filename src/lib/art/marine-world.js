// Original cell artwork. Stable material coordinates keep the animal coherent between poses.
const clamp = (x) => Math.max(0, Math.min(1, x));
const mix = (a, b, t) => a + (b - a) * t;
const hash = (x, y) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};
const palette = [
  "#593d35",
  "#80503a",
  "#a15b37",
  "#bf6b3b",
  "#d98147",
  "#e99956",
  "#f2b572",
  "#f6cc8d",
];
export function drawMarine(
  ctx,
  w,
  h,
  {
    time = 0,
    progress = 0,
    absent = false,
    removal = 0,
    capture = 0,
    damage = 0,
    spread = 0,
    chapter = 0,
    mode = "hero",
    ripples = [],
  } = {},
) {
  const s = w / 900;
  const cell = w < 500 ? 8 : 6;
  ctx.save();
  ctx.scale(s, s);
  const H = h / s;
  ctx.fillStyle = "#a8d5cc";
  ctx.fillRect(0, 0, 900, H);
  const water = ctx.createLinearGradient(0, 0, 900, H);
  water.addColorStop(0, "#cee6d7");
  water.addColorStop(0.55, "#a8d5cc");
  water.addColorStop(1, "#76b4b0");
  ctx.fillStyle = water;
  ctx.fillRect(0, 0, 900, H);
  function tile(x, y, color, glyph = "", alpha = 1, size = cell) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.round(x / cell) * cell,
      Math.round(y / cell) * cell,
      size - 0.35,
      size - 0.35,
    );
    if (glyph) {
      ctx.fillStyle = "rgba(44,54,40,.42)";
      ctx.font = `${size * 0.88}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(
        glyph,
        Math.round(x / cell) * cell + size / 2,
        Math.round(y / cell) * cell + size * 0.83,
      );
    }
    ctx.globalAlpha = 1;
  }
  if (mode === "consequence") {
    ctx.fillStyle = "#dbe4c9";
    ctx.fillRect(0, 0, 900, H);
    for (let y = H * 0.82; y < H; y += 5)
      for (let x = 0; x < 900; x += 5) {
        ctx.fillStyle = hash(x, y) > 0.5 ? "#c5c9a9" : "#d5d5b7";
        ctx.fillRect(x, y, 5, 5);
      }
    drawCoral(ctx, 450, H * 0.88, Math.min(235, H * 0.93), damage, time);
    ctx.restore();
    return;
  }
  if (mode === "sample") {
    drawSample(ctx, 900, H, { progress, time, absent });
    ctx.restore();
    return;
  }
  const groundY = H * (mode === "ecology" ? 0.69 : 0.58);
  // A shallow sand bank, with broken cellular edges rather than a boxed platform.
  for (let y = H * (mode === "ecology" ? 0.15 : 0.28); y < H; y += cell)
    for (let x = 0; x < 900; x += cell) {
      const n = hash(x, y);
      const shore =
        mode === "ecology"
          ? H * 0.32 + 24 * Math.sin(x * 0.007) - 0.035 * x
          : groundY - 40 * Math.sin(x * 0.009) - 0.11 * x;
      const d = (y - shore) / cell;
      if (d > 0 && n > Math.max(0, 0.7 - d * 0.13)) {
        const light =
          0.5 + Math.sin(x * 0.014 + y * 0.022) * 0.2 + hash(x, y) * 0.25;
        tile(
          x,
          y,
          light > 0.84 ? "#e6e2c6" : light > 0.36 ? "#dbddc0" : "#d2d7ba",
          n > 0.91 ? "·" : "",
          Math.min(1, d * 0.25 + 0.25),
          cell + 0.4,
        );
      }
    }
  // Fixed landmarks make change in the process readable.
  for (const rock of [
    { x: 760, y: groundY - 75, r: 61 },
    { x: 812, y: groundY - 27, r: 28 },
    { x: 100, y: H * 0.85, r: 27 },
  ]) {
    for (let dy = -rock.r; dy < rock.r; dy += cell)
      for (let dx = -rock.r; dx < rock.r; dx += cell) {
        const q =
          (dx * dx) / (rock.r * rock.r) + (dy * dy) / (rock.r * rock.r * 0.53);
        if (q < 0.9 + hash(dx, dy) * 0.16) {
          tile(rock.x + dx + 12, rock.y + dy + 13, "#497d79", "", 0.18);
          const l = (-dx - dy) / rock.r + hash(dx, dy) * 0.3;
          tile(
            rock.x + dx,
            rock.y + dy,
            l > 0.5 ? "#9db6a2" : l > -0.3 ? "#799b8d" : "#527e78",
            hash(dx, dy) > 0.65 ? ":" : "",
          );
        }
      }
  }
  // Sparse bent blades, built from the same discrete marks.
  for (let k = 0; k < 11; k++) {
    const bx = 796 + k * 6,
      by = H * 0.84 + (k % 3) * 7;
    for (let j = 0; j < 14 + (k % 4) * 3; j++) {
      tile(
        bx + Math.sin(j * 0.12 + time * 0.22 + k) * j * 0.35,
        by - j * cell,
        "#568a76",
        j % 4 === 0 ? ":" : "",
        0.68,
      );
    }
  }
  if (mode === "ecology") {
    // A continuous reef bed: every colony and neighbour exists before the removal.
    // Keep the feeding corridor and returned sample clear of the reef silhouettes.
    drawCoral(ctx, 120, H * 0.38, 70, damage * 0.18 + spread * 0.7, time);
    drawCoral(ctx, 670, H * 0.4, 92, damage * 0.9, time);
    drawCoral(ctx, 785, H * 0.93, 108, damage, time);
    for (const [x, y, offset] of [
      [250, H * 0.35, 0],
      [795, H * 0.43, 0.26],
    ]) {
      const loss = clamp((spread - offset) * 1.6);
      const lift = loss * H * 0.8;
      if (loss > 0) {
        ctx.save();
        ctx.strokeStyle = "#8b6745";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.ellipse(x, y + 8, 49, 17, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      if (loss < 1) {
        ctx.save();
        ctx.globalAlpha = 1 - loss;
        for (let u = 0; u < 22; u++)
          for (let v = -3; v <= 3; v++) {
            const r = Math.sin(((u + 1) / 23) * Math.PI) * 3.4;
            if (Math.abs(v) > r) continue;
            tile(
              x + (u - 11) * 4,
              y - lift + v * 4 + Math.sin(u * 0.3 + time * 0.4) * 3,
              palette[Math.min(7, Math.max(1, 5 - v))],
              "",
              1,
              4.3,
            );
          }
        ctx.restore();
      }
    }
    if (chapter >= 4) {
      // A fixed trace identifies the exact patch left behind, rather than an empty ocean.
      ctx.save();
      ctx.strokeStyle = "#8b6745";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 7]);
      ctx.beginPath();
      ctx.ellipse(410, groundY + 15, 214, 44, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }
  const phase = clamp(progress);
  const collection = mode === "hero" ? clamp(time / 9) : clamp(phase * 4);
  const fragmentation = clamp((phase - 0.25) * 4);
  const decay = clamp((phase - 0.5) * 4);
  const release = clamp((phase - 0.75) * 4);
  const lift = mode === "trade" ? clamp(phase / 0.25) : 0,
    dry = mode === "trade" ? clamp((phase - 0.25) / 0.25) : 0,
    shipping = mode === "trade" ? clamp((phase - 0.5) / 0.25) : 0;
  const advance = Math.min(34, time * 2.3);
  const cx =
      mode === "trade"
        ? mix(mix(350, 605, lift), 750, shipping)
        : mode === "ecology"
          ? 410 + removal * 155
          : 445 - (mode === "hero" ? advance : 0),
    cy =
      mode === "trade"
        ? mix(groundY - 24, H * 0.33, lift) - shipping * H * 0.12
        : groundY - 24 - (mode === "ecology" ? removal * (H * 0.65 + 100) : 0);
  const length =
    mode === "trade"
      ? 330 * (1 - dry * 0.58)
      : mode === "hero"
        ? w < 500
          ? 610
          : 480
        : mode === "ecology"
          ? 420
          : 500;
  const thickness =
    mode === "trade" ? 0.78 * (1 - dry * 0.5) : mode === "ecology" ? 0.78 : 1;
  const breath = Math.sin(time * 0.68);
  const front = cx - length * 0.5;
  function bodyPoint(u) {
    const poseTime = mode === "trade" ? time * (1 - lift) : time;
    return {
      x: cx + (u - 0.5) * length + Math.sin(poseTime * 0.7 - u * 5) * 5,
      y:
        cy +
        Math.sin(u * 5.4 + 0.3) * 25 +
        Math.sin(poseTime * 0.7 - u * 6) * 9,
    };
  }
  // Feeding disturbs a narrow patch of sediment; the trace persists behind the animal.
  if (!absent && mode !== "trade" && (mode !== "ecology" || chapter < 4))
    for (let i = 0; i < Math.floor(Math.min(34, time * 2.3) * 2); i++) {
      const x = cx + length * 0.48 + i * 2,
        y = cy + 22 + Math.sin(i * 2.1) * 13;
      tile(x, y, i % 3 ? "#bbbfa3" : "#e6dec0", "", 0.8, cell + 0.3);
    }
  if (mode === "trade") {
    // The habitat remains in frame while the individual follows a schematic commerce chain.
    for (let y = H * 0.31 - 23; y < H * 0.31 + 41; y += cell)
      for (let x = 535; x < 675; x += cell)
        tile(
          x,
          y,
          y > H * 0.31 + 27 ? "#877c60" : "#c6bb8e",
          "",
          0.9,
          cell + 0.2,
        );
    for (let y = H * 0.13; y < H * 0.13 + 82; y += cell)
      for (let x = 707; x < 823; x += cell) {
        const edge = x > 806 || y > H * 0.13 + 65;
        tile(
          x,
          y,
          edge ? "#9b8157" : x < 750 ? "#d4bb87" : "#bf9f6b",
          "",
          1,
          cell + 0.2,
        );
      }
    for (let y = H * 0.13; y < H * 0.13 + 64; y += cell)
      tile(758, y, "#e3d0a4", "", 1, cell * 2);
    for (let i = 0; i < 20; i++) {
      const a = i * 0.32;
      tile(
        350 + Math.cos(a) * 145,
        groundY + Math.sin(a) * 40,
        "#8fa38b",
        "",
        lift * 0.6,
        cell,
      );
    }
    // A short discrete path links the unchanged origin, processing and package.
    for (let i = 0; i < 18; i++) {
      const t = i / 18;
      tile(
        mix(437, 565, t),
        mix(groundY - 45, H * 0.33 + 60, t),
        "#527e78",
        "",
        0.4,
        3,
      );
    }
  }
  const collecting = mode === "ecology" && chapter === 4 && !absent;
  if (collecting) drawCollectionNet(ctx, cx, cy, length, capture, false);
  if (!absent && !(mode === "trade" && shipping > 0.88)) {
    // Rasterize the changing axis and radius into a fixed screen grid. Shape is cells, never an SVG mask.
    const points = Array.from({ length: 96 }, (_, i) => {
      const u = i / 95;
      const p = bodyPoint(u);
      const r =
        Math.pow(Math.sin(Math.PI * u), 0.44) *
        (47 + 12 * Math.sin(u * 7 + 0.4)) *
        (1 + 0.07 * Math.sin(time * 0.8 - u * 7)) *
        thickness;
      return { ...p, u, r };
    });
    for (let y = cy - 115; y < cy + 115; y += cell)
      for (let x = cx - length * 0.6; x < cx + length * 0.6; x += cell) {
        let best = Infinity,
          near = points[0];
        for (const p of points) {
          const d = (x - p.x) ** 2 + (y - p.y) ** 2;
          if (d < best) {
            best = d;
            near = p;
          }
        }
        const d = Math.sqrt(best);
        const a = Math.atan2(y - near.y, x - near.x);
        const pap =
          Math.pow(Math.max(0, Math.cos(near.u * 137 + Math.sin(a * 9))), 7) *
          Math.pow(Math.max(0, Math.sin(a * 7 + 1)), 3) *
          13;
        const radius = near.r + pap;
        if (d > radius) continue;
        tile(x + 12, y + 19, "#48766c", "", 0.18);
        const normal = (y - near.y) / (near.r || 1);
        const lit = clamp(
          0.54 -
            normal * 0.34 +
            (1 - d / (radius || 1)) * 0.16 +
            hash(Math.floor(near.u * 160), Math.round(a * 20)) * 0.12,
        );
        const idx = Math.floor(lit * 7);
        const n = hash(Math.floor(near.u * 160), Math.round(a * 20));
        tile(
          x,
          y,
          dry > 0.3
            ? [
                "#453f35",
                "#5c4b35",
                "#736044",
                "#8c734e",
                "#a38c61",
                "#baa474",
                "#c7b382",
                "#d5c598",
              ][idx]
            : palette[idx],
          n > 0.78 ? "@" : n > 0.55 ? "+" : n > 0.25 ? ":" : "·",
        );
      }
    // Papillae are small raised cell volumes, including tips that interrupt the silhouette.
    for (let i = 0; i < (dry > 0.5 ? 5 : 13); i++) {
      const u = 0.13 + i * 0.058 + (i % 3) * 0.006,
        p = bodyPoint(u);
      const radius =
        Math.pow(Math.sin(Math.PI * u), 0.44) *
        (47 + 12 * Math.sin(u * 7 + 0.4)) *
        thickness;
      const base = p.y - radius * (i % 2 ? 0.32 : 0.78);
      const tall =
        (15 + (i % 4) * 4) *
        (1 - dry * 0.7) *
        (mode === "ecology" ? thickness : 1);
      const half = 9 + (i % 3) * 2;
      for (let dy = -tall; dy < 7; dy += cell)
        for (let dx = -half; dx < half; dx += cell) {
          const spread = (half * (dy + tall)) / (tall + 7);
          if (Math.abs(dx) > spread) continue;
          tile(p.x + dx + 5, base + dy + 7, "#98603c", "", 0.55);
          tile(
            p.x + dx,
            base + dy,
            dx < 0 ? "#f1b36a" : dy < -tall * 0.4 ? "#eaa05b" : "#b96c3c",
            dy % 3 === 0 ? "+" : "",
          );
        }
    }
    // Short feeding tentacles, with independent reach, adjacent to sediment.
    const head = bodyPoint(0.025);
    for (let arm = 0; arm < (dry > 0.3 ? 0 : 5); arm++)
      for (let j = 0; j < 7; j++) {
        const a = 2.5 + arm * 0.24;
        tile(
          head.x + Math.cos(a) * j * 4,
          head.y + Math.sin(a) * j * 4 + Math.sin(time + arm) * j * 0.4,
          palette[4],
          j % 3 === 0 ? ":" : "",
          0.95,
          4.5,
        );
      }
  }
  if (collecting) drawCollectionNet(ctx, cx, cy, length, capture, true);
  const input = {
    x:
      (mode === "hero"
        ? 445 - length * 0.5
        : mode === "ecology"
          ? 200
          : front) - 31,
    y: groundY - 24 + 39,
  };
  const output = {
    x: (mode === "ecology" ? 410 : cx) + length * 0.5 + 27,
    y: groundY - 24 + 28,
  };
  const feeding = !absent && (mode !== "ecology" || chapter < 4);
  // The same selected deposit persists through collection, return, decomposition.
  for (let i = 0; i < (mode === "trade" ? 0 : 17); i++) {
    if (mode === "hero" && i < Math.floor(collection * 12)) continue;
    const a = i * 2.4,
      r = 8 + Math.sqrt(i) * 5;
    let x = input.x + Math.cos(a) * r,
      y = input.y + Math.sin(a) * r * 0.55;
    let size = 7;
    let color = "#b96d48";
    if (!absent) {
      if (phase < 0.25 || !feeding) {
        if (feeding) {
          const t = collection * 0.65;
          x = mix(x, front + 8, t);
          y = mix(y, cy + 19, t);
        }
      } else {
        x = output.x;
        y = output.y;
        x += Math.cos(a) * r * fragmentation;
        y += Math.sin(a) * r * 0.5 * fragmentation;
        size = mode === "ecology" ? 6 : 4;
        if (mode === "ecology") color = "#945632";
        if (decay > 0) {
          color = i < decay * 17 ? "#e6c96e" : "#b96d48";
        }
        if (release > 0) {
          x += Math.cos(a) * release * 30;
          y -= release * (18 + i * 2);
          color = "#f4d378";
        }
      }
    }
    tile(
      x,
      y,
      color,
      i % 3 === 0 ? "+" : "",
      phase >= 0.25 && feeding
        ? Math.max(
            0.15,
            mode === "ecology" ? clamp(fragmentation * 4) : fragmentation,
          )
        : 1,
      size,
    );
  }
  // A common yellow marker identifies the returned sample enlarged below the habitat.
  if (mode === "ecology" && phase >= 0.25 && feeding) {
    for (let i = 0; i < 4; i++) {
      tile(output.x - 14 + i * 6, output.y + 25, "#f4d378", "", 1, 5);
    }
  }
  // Motion in the water is subordinate and reacts locally to actual gestures.
  for (let i = 0; i < 17; i++) {
    const x = (i * 73 + time * 3) % 900,
      y = 45 + ((i * 41) % Math.max(60, H * 0.4));
    tile(x, y, "#e6f2df", "", 0.16, cell * 2);
  }
  for (const r of ripples) {
    const age = time - r.time;
    if (age < 0 || age > 2.4) continue;
    const radius = age * 88;
    for (let a = 0; a < Math.PI * 2; a += 0.06) {
      tile(
        r.x / s + Math.cos(a) * radius,
        r.y / s + Math.sin(a) * radius * 0.55,
        "#e9f2de",
        "",
        0.5 * (1 - age / 2.4),
      );
    }
  }
  ctx.restore();
}

function drawCollectionNet(ctx, x, y, length, capture, front) {
  const radius = length * 0.6;
  const top = y - 45;
  const bottom = y + 115;
  const pouch = () => {
    ctx.beginPath();
    ctx.moveTo(x - radius, top);
    ctx.bezierCurveTo(
      x - radius * 0.92,
      bottom,
      x + radius * 0.92,
      bottom,
      x + radius,
      top,
    );
    ctx.quadraticCurveTo(x, top - 58, x - radius, top);
    ctx.closePath();
  };
  ctx.save();
  ctx.globalAlpha = capture;
  ctx.strokeStyle = "#526d61";
  if (!front) {
    pouch();
    ctx.fillStyle = "#6d89751a";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (const side of [-1, 1]) {
      ctx.moveTo(x + side * radius * 0.8, top - 16);
      ctx.lineTo(x + length * 0.28 + side * 8, y - 270);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, top, radius, 30, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.save();
    pouch();
    ctx.clip();
    ctx.globalAlpha = capture * 0.62;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let column = -radius - 180; column <= radius + 180; column += 23) {
      ctx.moveTo(x + column, top - 35);
      ctx.lineTo(x + column + 195, bottom + 10);
      ctx.moveTo(x + column, top - 35);
      ctx.lineTo(x + column - 195, bottom + 10);
    }
    ctx.stroke();
    ctx.restore();
    ctx.lineWidth = 2.5;
    pouch();
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, top, radius, 30, 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSample(
  ctx,
  w,
  h,
  { progress = 1, time = 0, absent = false } = {},
) {
  const phase = clamp(progress),
    split = clamp((phase - 0.25) * 4),
    decay = clamp((phase - 0.5) * 4),
    release = clamp((phase - 0.75) * 4);
  ctx.fillStyle = "#dbe4c9";
  ctx.fillRect(0, 0, w, h);
  const cell = 8;
  const put = (x, y, c, size = cell) => {
    ctx.fillStyle = c;
    ctx.fillRect(
      Math.round(x / cell) * cell,
      Math.round(y / cell) * cell,
      size - 1,
      size - 1,
    );
  };
  for (let y = 0; y < h; y += cell)
    for (let x = 0; x < w; x += cell)
      if (hash(x, y) > 0.96) put(x, y, "#c8d6b8", 3);
  const cx = w * 0.46,
    cy = h * 0.5;
  for (let i = 0; i < 35; i++) {
    const a = i * 2.4,
      r = (10 + Math.sqrt(i) * 5) * (1 + split * 0.65);
    if (!absent && i > 35 * (1 - decay * 0.63)) continue;
    const x = cx + Math.cos(a) * r,
      y = cy + Math.sin(a) * r * 0.65;
    put(
      x,
      y,
      i % 4 === 0 ? "#e9bc56" : "#aa6645",
      absent ? 13 : mix(13, 7, split),
    );
  }
  // Bacteria are drawn at a declared magnified scale; they remain in the absence comparison.
  for (let i = 0; i < (phase >= 0.5 ? 7 : 0); i++) {
    const a = i * 0.9 + Math.sin(time * 0.45 + i) * 0.08;
    const r = 115 - (absent ? 0 : decay * 30);
    const x = cx + Math.cos(a) * r,
      y = cy + Math.sin(a) * r * 0.55;
    for (let j = -2; j <= 2; j++)
      put(x + j * cell, y + Math.sin(j) * cell, "#397c79");
    put(x - 8, y - 8, "#68a29a");
  }
  if (!absent && release > 0)
    for (let i = 0; i < 14; i++) {
      const x = cx + 100 + release * (30 + i * 12),
        y = cy + Math.sin(i * 2.1) * 45;
      put(x, y, "#d3a73a", 6);
    }
  // The marker matches the selected returned material in the habitat above.
  for (let i = 0; i < 4; i++) put(28 + i * 12, 28, "#d3a73a", 8);
}

// A dense staghorn colony: connected tapered branches, radial corallites and a fixed basal skeleton.
export function drawCoral(ctx, cx, base, size, damage, time) {
  const grid = 3;
  const segments = [];
  function grow(x, y, angle, length, width, depth, seed) {
    const ex = x + Math.cos(angle) * length,
      ey = y + Math.sin(angle) * length;
    segments.push({ x, y, ex, ey, width, seed });
    if (depth === 0) return;
    grow(
      ex,
      ey,
      angle - 0.34 - hash(seed, 2) * 0.22,
      length * 0.63,
      width * 0.67,
      depth - 1,
      seed + 17,
    );
    grow(
      ex,
      ey,
      angle + 0.3 + hash(seed, 4) * 0.3,
      length * 0.69,
      width * 0.7,
      depth - 1,
      seed + 37,
    );
  }
  for (let k = 0; k < 7; k++) {
    const angle = -Math.PI / 2 + (k - 3) * 0.19;
    grow(
      cx + (k - 3) * size * 0.045,
      base - 5,
      angle,
      size * (0.34 + hash(k, 9) * 0.15),
      size * 0.041,
      3,
      k * 13 + 1,
    );
  }
  // Rough attached rock makes the animal colony sit in the sediment, not float.
  for (let y = -7; y < 12; y += grid)
    for (let x = -size * 0.28; x < size * 0.28; x += grid) {
      if ((x * x) / (size * size * 0.08) + (y * y) / 170 < 1) {
        ctx.fillStyle = hash(x, y) > 0.5 ? "#8c9c8e" : "#b3b9a1";
        ctx.fillRect(cx + x, base + y, grid, grid);
      }
    }
  for (const seg of segments) {
    const len = Math.hypot(seg.ex - seg.x, seg.ey - seg.y),
      nx = -(seg.ey - seg.y) / len,
      ny = (seg.ex - seg.x) / len;
    for (let n = 0; n <= len; n += 2) {
      const t = n / len,
        x = mix(seg.x, seg.ex, t),
        y = mix(seg.y, seg.ey, t),
        radius = Math.max(2, seg.width * (1 - t * 0.35));
      const lost = (base - y) / size < damage * 0.88;
      for (let q = -radius; q <= radius; q += grid) {
        ctx.fillStyle = lost
          ? q < 0
            ? "#f6efd6"
            : "#b5b9a6"
          : q < -radius * 0.2
            ? "#d4a96c"
            : q < radius * 0.5
              ? "#a7744d"
              : "#74563f";
        ctx.fillRect(
          Math.round((x + nx * q) / grid) * grid,
          Math.round((y + ny * q) / grid) * grid,
          grid + 0.1,
          grid + 0.1,
        );
      }
      // Corallites remain as pale pits after tissue loss; living polyps have short radial tentacles.
      if (n % 10 < 2) {
        const px = x + nx * (radius + 1),
          py = y + ny * (radius + 1);
        ctx.fillStyle = lost ? "#939f91" : "#f3d3a0";
        ctx.fillRect(px - 1.5, py - 1.5, 3, 3);
        if (!lost) {
          const reach = 2.2 + Math.sin(time * 0.6 + seg.seed) * 0.7;
          ctx.fillStyle = "#e8c38c";
          for (let j = 0; j < 5; j++) {
            const a = (j * Math.PI * 2) / 5;
            ctx.fillRect(
              px + Math.cos(a) * reach,
              py + Math.sin(a) * reach,
              1.5,
              1.5,
            );
          }
        }
      }
    }
  }
}
