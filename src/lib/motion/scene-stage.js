// Svelte/ESM adaptation of taste-skill/assets/scenes/stage.js.
// CSS holds the stage. ScrollTrigger scrubs its timeline without capturing the wheel.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function createScrollScene(
  root,
  { hold = 1, minHeight = 0, minWidth = 0, build, rest = () => {} },
) {
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("js");
  const media = gsap.matchMedia();
  const sizeQuery = minWidth ? ` and (min-width: ${minWidth}px)` : "";
  const activeQuery =
    (minHeight
      ? `(prefers-reduced-motion: no-preference) and (min-height: ${minHeight}px)`
      : "(prefers-reduced-motion: no-preference)") + sizeQuery;
  const restQuery =
    (minHeight
      ? `(prefers-reduced-motion: reduce), (max-height: ${minHeight - 1}px)`
      : "(prefers-reduced-motion: reduce)") +
    (minWidth ? `, (max-width: ${minWidth - 1}px)` : "");
  media.add(activeQuery, () => {
    root.classList.remove("is-rest");
    root.classList.add("is-live");
    root.style.setProperty("--hold", hold);
    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: () =>
          `+=${root.offsetHeight - root.querySelector(".scene-stage").offsetHeight}`,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) =>
          root.style.setProperty("--p", self.progress.toFixed(4)),
      },
    });
    build(timeline);
    if (timeline.duration() < 1)
      timeline.to({}, { duration: 1 - timeline.duration() });
    return () => {
      timeline.scrollTrigger?.kill();
      timeline.revert();
      root.classList.remove("is-live");
      root.classList.add("is-rest");
      root.style.removeProperty("--hold");
      root.style.removeProperty("--p");
      rest();
    };
  });
  media.add(restQuery, () => {
    root.classList.add("is-rest");
    rest();
  });
  let disposed = false;
  document.fonts.ready.then(() => {
    if (!disposed) ScrollTrigger.refresh();
  });
  return () => {
    disposed = true;
    media.revert();
  };
}
