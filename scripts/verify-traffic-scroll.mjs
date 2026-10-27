import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Browser, sleep } from "./lib/cdp.mjs";

const url = process.env.TRAFFIC_URL || "http://127.0.0.1:5173";
const artifacts = join(tmpdir(), "deixa-no-mar-traffic-scroll");
mkdirSync(artifacts, { recursive: true });

async function waitFor(page, predicate) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await page.eval(predicate)) return;
    await sleep(40);
  }
  throw new Error("The traffic scene did not settle.");
}

async function selectByScroll(page, scene) {
  await page.eval((scene) => {
    const track = document.querySelector("#trafico .journey-track");
    const stage = track.querySelector(".journey-stage");
    window.scrollTo({
      top:
        track.getBoundingClientRect().top +
        scrollY +
        (track.offsetHeight - stage.offsetHeight) * ((scene + 0.5) / 5),
      behavior: "instant",
    });
  }, scene);
  await sleep(50);
}

async function settledScene(page) {
  await waitFor(page, () => {
    const art = document.querySelector("#trafico [data-traffic-art]");
    return art.dataset.transition === "1.00" && Number(art.dataset.time) > 0.1;
  });
  return page.eval(() =>
    Number(document.querySelector("#trafico").dataset.chapter),
  );
}

async function assertIllustration(page, expectedScene, name) {
  const result = await page.eval(async () => {
    const { drawTrafficJourney } =
      await import("/src/lib/art/traffic-journey/draw.js");
    const host = document.querySelector("#trafico [data-traffic-art]");
    const canvas = host.querySelector("canvas");
    const rect = host.getBoundingClientRect();
    const frame = host.closest(".journey-art").getBoundingClientRect();
    const caption = document
      .querySelector("#trafico .scene-caption")
      .getBoundingClientRect();
    const scene = Number(host.dataset.scene);
    const reference = document.createElement("canvas");
    reference.width = canvas.width;
    reference.height = canvas.height;
    const context = reference.getContext("2d");
    const dpr = Math.min(devicePixelRatio, 2);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawTrafficJourney(context, rect.width, rect.height, {
      scene,
      previous: scene,
      transition: 1,
      time: Number(host.dataset.time),
    });
    const actual = canvas
      .getContext("2d")
      .getImageData(0, 0, canvas.width, canvas.height).data;
    const expected = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    ).data;
    let different = 0;
    let error = 0;
    for (let pixel = 0; pixel < actual.length; pixel += 4) {
      if (
        actual[pixel] !== expected[pixel] ||
        actual[pixel + 1] !== expected[pixel + 1] ||
        actual[pixel + 2] !== expected[pixel + 2]
      )
        different++;
      for (let channel = 0; channel < 3; channel++)
        error += Math.abs(actual[pixel + channel] - expected[pixel + channel]);
    }
    return {
      scene,
      captionScene: Number(document.querySelector("#trafico").dataset.chapter),
      fallback: getComputedStyle(host.querySelector("picture")).visibility,
      clippedPixels: Math.max(
        0,
        frame.top - rect.top,
        frame.left - rect.left,
        rect.bottom - frame.bottom,
        rect.right - frame.right,
      ),
      withinViewport: rect.top >= -1 && caption.bottom <= innerHeight + 1,
      differentRatio: different / (actual.length / 4),
      averageError: error / ((actual.length / 4) * 3),
      png: canvas.toDataURL("image/png").split(",")[1],
    };
  });
  writeFileSync(
    join(artifacts, `${name}-scene-${expectedScene}.png`),
    Buffer.from(result.png, "base64"),
  );
  assert.equal(result.scene, expectedScene);
  assert.equal(result.captionScene, expectedScene);
  assert.equal(result.fallback, "hidden");
  assert(
    result.clippedPixels <= 1,
    `${name}: scene ${expectedScene} is clipped by ${result.clippedPixels.toFixed(1)} CSS pixels.`,
  );
  assert(
    result.withinViewport,
    `${name}: scene ${expectedScene} or its caption is outside the viewport.`,
  );
  // The animation clock is reported to 0.01 s, so moving cells can differ slightly.
  assert(
    result.differentRatio < 0.03 && result.averageError < 1,
    `${name}: scene ${expectedScene} shows the wrong illustration (${(result.differentRatio * 100).toFixed(1)}% different pixels).`,
  );
}

const browser = await Browser.launch({ extraArgs: ["--no-sandbox"] });
try {
  for (const viewport of [
    { width: 1536, height: 861, dsf: 1, mobile: false },
    { width: 390, height: 844, dsf: 2, mobile: true },
  ]) {
    const name = viewport.mobile ? "mobile" : "desktop";
    const page = await browser.newPage(viewport);
    await page.goto(url);
    await waitFor(page, () =>
      document.querySelector("#trafico")?.classList.contains("held"),
    );
    await page.eval(() => document.fonts.ready);
    await sleep(800);

    for (const scene of [0, 1, 2, 3, 4, 2, 0, 4]) {
      await selectByScroll(page, scene);
      assert.equal(await settledScene(page), scene);
      await assertIllustration(page, scene, name);
    }

    await selectByScroll(page, 0);
    await settledScene(page);
    await page.wheel(650, { step: 130, pauseMs: 30 });
    const wheelScene = await settledScene(page);
    assert(wheelScene > 0, "The mouse wheel must advance the scene.");
    await assertIllustration(page, wheelScene, name);

    if (viewport.mobile) {
      await selectByScroll(page, 0);
      await settledScene(page);
      await page.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: 190, y: 650 }],
      });
      for (let step = 1; step <= 20; step++) {
        await page.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: 190, y: 650 - step * 24 }],
        });
        await sleep(16);
      }
      await page.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      await sleep(100);
      const touchScene = await settledScene(page);
      assert(touchScene > 0, "A touch drag must advance the scene.");
      await assertIllustration(page, touchScene, name);
    }

    assert.deepEqual(page.consoleErrors, []);
    await page.close();
    console.log(
      `${name}: all five illustrations match scrolling, including backwards navigation.`,
    );
  }
} finally {
  await browser.close();
}
console.log(`Rendered frames: ${artifacts}`);
