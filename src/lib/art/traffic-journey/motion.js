const clamp = (value) => Math.max(0, Math.min(1, value));
const blend = (from, to, value) => from + (to - from) * value;
const ease = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

// A step advances with travelled distance, not a separate animation clock.
// During stance, local foot velocity cancels body velocity exactly.
export function sampleWalker(
  {
    start,
    end = start,
    ground,
    scale = 1,
    duration = 1,
    delay = 0,
    facing = 1,
  },
  time,
) {
  const length = Math.abs(end - start),
    direction = Math.sign(end - start) || facing;
  const t = clamp((time - delay) / duration),
    distance = length * ease(t);
  const x = blend(start, end, ease(t));
  const velocity = ((end - start) * 6 * t * (1 - t)) / duration;
  const halfCycles = Math.max(1, Math.round((length / (80 * scale)) * 2));
  const stride = length ? length / (halfCycles / 2) : 0;
  const cycle = stride ? distance / stride : 0;
  const step = stride / scale;
  const feet = [0, 0.5].map((offset, index) => {
    if (!length) return { x: index ? 15 : -17, y: 0, planted: true, phase: 0 };
    const phase = (cycle + offset) % 1,
      stance = 0.62;
    if (phase < stance)
      return { x: step * (0.35 - phase), y: 0, planted: true, phase };
    const swing = (phase - stance) / (1 - stance);
    return {
      x: blend(step * (0.35 - stance), step * 0.35, ease(swing)),
      y: -Math.sin(Math.PI * swing) * 19,
      planted: false,
      phase,
    };
  });
  return {
    x,
    ground,
    scale,
    facing: direction,
    distance,
    velocity,
    cycle,
    feet,
    moving: t > 0 && t < 1,
  };
}

export function solveJoint(root, end, upper, lower, bend = 1) {
  const dx = end.x - root.x,
    dy = end.y - root.y;
  const distance = Math.max(0.001, Math.hypot(dx, dy));
  const reach = Math.min(distance, upper + lower - 0.001);
  const along = (upper * upper - lower * lower + reach * reach) / (2 * reach);
  const offset = Math.sqrt(Math.max(0, upper * upper - along * along));
  return {
    x: root.x + (dx / distance) * along + (dy / distance) * offset * bend,
    y: root.y + (dy / distance) * along - (dx / distance) * offset * bend,
  };
}

export function portState(W, H, time, compact) {
  const ship = { x: W * 0.27, y: H * 0.71, scale: compact ? 0.74 : 0.94 };
  const floor = H * 0.66,
    cargoScale = compact ? 0.78 : 0.92;
  const width = 105 * cargoScale,
    height = 69 * cargoScale;
  const start = W * 0.72,
    pickup = W * 0.59,
    target = ship.x + 80 * ship.scale;
  const actorScale = compact ? 0.95 : 1.04;
  const walk = sampleWalker(
    {
      start: start + width + 52 * actorScale,
      end: pickup + width + 52 * actorScale,
      ground: floor,
      scale: actorScale,
      duration: 2.4,
    },
    time,
  );
  const cartX = start + (walk.x - (start + width + 52 * actorScale));
  const cartTop = floor - 22;
  const cargo = {
    x: cartX,
    bottom: cartTop,
    scale: cargoScale,
    width,
    height,
    support: "cart",
    sling: false,
  };
  const highBottom = H * 0.41,
    deck = ship.y - 8 * ship.scale;
  if (time >= 2.8 && time < 4) {
    cargo.x = pickup;
    cargo.bottom = blend(cartTop, highBottom, ease((time - 2.8) / 1.2));
    cargo.support = "sling";
    cargo.sling = true;
  } else if (time >= 4 && time < 5.5) {
    cargo.x = blend(pickup, target, ease((time - 4) / 1.5));
    cargo.bottom = highBottom;
    cargo.support = "sling";
    cargo.sling = true;
  } else if (time >= 5.5 && time < 6.7) {
    cargo.x = target;
    cargo.bottom = blend(highBottom, deck, ease((time - 5.5) / 1.2));
    cargo.support = "sling";
    cargo.sling = true;
  } else if (time >= 6.7) {
    cargo.x = target;
    cargo.bottom = deck;
    cargo.support = "deck";
  }
  cargo.y = cargo.bottom - height;
  const centre = cargo.x + width * 0.47;
  const attachmentY = cargo.y - 12 * cargoScale;
  let hookY = attachmentY - 34;
  if (time < 2.4) hookY = H * 0.34;
  else if (time < 2.8)
    hookY = blend(H * 0.34, attachmentY - 34, ease((time - 2.4) / 0.4));
  else if (time >= 6.7)
    hookY = blend(attachmentY - 34, H * 0.3, ease((time - 6.7) / 0.7));
  const crane = {
    beamY: H * 0.18,
    beamLeft: W * 0.31,
    beamRight: W * 0.91,
    mastX: W * 0.87,
    trolleyX: time < 2.8 ? pickup + width * 0.47 : centre,
    hookY,
  };
  walk.hand = { x: cartX + width + 18, y: floor - 111 * actorScale };
  return {
    actor: walk,
    cargo,
    crane,
    cart: { x: cartX, top: cartTop, width: width + 15, floor },
    ship,
    deck,
    floor,
  };
}

export function terminalState(W, H, time, compact) {
  const scale = compact ? 1.19 : 1.35;
  const actor = sampleWalker(
    { start: W * 0.23, end: W * 0.59, ground: H * 0.87, scale, duration: 6 },
    time,
  );
  const bagScale = scale * 0.82;
  const bag = {
    x: actor.x - 84 * scale,
    y: actor.ground - 100 * bagScale,
    scale: bagScale,
  };
  actor.hand = { x: bag.x + 39 * bagScale, y: bag.y - 39 * bagScale };
  actor.action = "pull";
  return { actor, bag };
}

export function actorTelemetry(actor) {
  return {
    x: actor.x,
    facing: actor.facing,
    velocity: actor.velocity,
    distance: actor.distance,
    feet: actor.feet.map((foot) => ({
      x: actor.x + actor.facing * foot.x * actor.scale,
      y: actor.ground + foot.y * actor.scale,
      planted: foot.planted,
      phase: foot.phase,
    })),
  };
}

export function seatedPerson({ x, ground, scale = 1, facing = 1 }) {
  return {
    x,
    ground,
    scale,
    facing,
    seated: true,
    moving: false,
    velocity: 0,
    distance: 0,
    cycle: 0,
    feet: [
      { x: 42, y: 0, planted: true, phase: 0 },
      { x: 51, y: 0, planted: true, phase: 0 },
    ],
  };
}
