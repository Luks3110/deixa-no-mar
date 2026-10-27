/** Visual press state only. Native click, scrolling, zoom and share activation remain untouched. */
export function installPressFeedback() {
  let press;
  const clear = () => {
    press?.node.removeAttribute("data-pressed");
    press = undefined;
  };
  const inside = (event) => {
    if (!press || event.pointerId !== press.id) return;
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    if (hit && press.node.contains(hit)) press.node.dataset.pressed = "true";
    else press.node.removeAttribute("data-pressed");
  };
  const down = (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    clear();
    const node =
      event.target instanceof Element
        ? event.target.closest(
            'button,a[href],summary,input[type="button"],input[type="submit"]',
          )
        : null;
    if (!node || node.matches(':disabled,[aria-disabled="true"]')) return;
    press = { id: event.pointerId, node };
    node.dataset.pressed = "true";
  };
  const end = (event) => {
    if (press?.id === event.pointerId) clear();
  };
  const leave = (event) => {
    if (
      press?.id === event.pointerId &&
      !press.node.contains(event.relatedTarget)
    )
      press.node.removeAttribute("data-pressed");
  };
  const visibility = () => {
    if (document.hidden) clear();
  };
  const options = { capture: true, passive: true };
  for (const [type, listener] of [
    ["pointerdown", down],
    ["pointermove", inside],
    ["pointerover", inside],
    ["pointerout", leave],
    ["pointerup", end],
    ["pointercancel", end],
  ])
    document.addEventListener(type, listener, options);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", visibility);
  return () => {
    clear();
    for (const [type, listener] of [
      ["pointerdown", down],
      ["pointermove", inside],
      ["pointerover", inside],
      ["pointerout", leave],
      ["pointerup", end],
      ["pointercancel", end],
    ])
      document.removeEventListener(type, listener, options);
    window.removeEventListener("blur", clear);
    document.removeEventListener("visibilitychange", visibility);
  };
}
