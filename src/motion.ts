// Capture the outgoing view before the hash changes. The revealed page is the
// real destination, so names, pickup details and menu selections stay in sync.
export type Scene = "envelope" | "payment";

export function captureScene(scene: Scene, destination: string, origin: HTMLElement) {
  const current = document.querySelector<HTMLElement>("#root > .site");
  if (!current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.getElementById("root")!;
  const layer = document.createElement("div");
  layer.className = "motion-layer " + scene;
  layer.setAttribute("aria-hidden", "true");
  const snapshot = () => {
    const el = current.cloneNode(true) as HTMLElement;
    el.inert = true;
    el.removeAttribute("id");
    el.style.width = current.offsetWidth + "px";
    el.style.marginTop = -window.scrollY + "px";
    return el;
  };
  const frame = (kind: string) => {
    const panel = document.createElement("div");
    panel.className = kind;
    panel.append(snapshot());
    layer.append(panel);
    return panel;
  };
  if (scene === "envelope") {
    frame("pocket");
    frame("lid");
  } else {
    frame("checkout-print");
    const box = origin.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const maxRadius = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) + 20;
    layer.style.setProperty("--cx", cx + "px");
    layer.style.setProperty("--cy", cy + "px");
    layer.style.setProperty("--radius", maxRadius + "px");
  }
  document.body.append(layer);
  root.inert = true;
  let finished = false;
  let timer = 0;
  const cleanup = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    root.inert = false;
    layer.remove();
    root.classList.remove("unfold-menu", "print-receipt");
  };
  const finish = () => {
    cleanup();
    const title = root.querySelector<HTMLElement>("main h1");
    if (title && location.hash === "#" + destination) {
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    }
  };
  return {
    destination,
    cleanup,
    play() {
      root.classList.add(scene === "envelope" ? "unfold-menu" : "print-receipt");
      layer.classList.add("playing");
      const sentinel = layer.querySelector(scene === "envelope" ? ".pocket" : ".checkout-print");
      sentinel?.addEventListener("animationend", finish, { once: true });
      timer = window.setTimeout(finish, 1800);
    },
  };
}
