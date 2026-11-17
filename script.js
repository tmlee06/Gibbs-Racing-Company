// Gibbs Racing Company · Team 12 · small extras, nothing required for the page to work.

(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- F1 start lights ---------- */
  const lightsBtn = document.querySelector(".start-lights");
  const lights = lightsBtn ? lightsBtn.querySelectorAll(".light") : [];
  const msg = document.querySelector(".lights-msg");
  let timers = [];

  function runLights() {
    timers.forEach(clearTimeout);
    timers = [];
    lights.forEach(l => l.classList.remove("on"));
    if (msg) msg.textContent = " ";

    if (reduceMotion) {
      if (msg) msg.textContent = "LIGHTS OUT AND AWAY WE GO";
      return;
    }
    lights.forEach((l, i) => {
      timers.push(setTimeout(() => l.classList.add("on"), 500 + i * 450));
    });
    // a little random hold, like the real thing
    const hold = 500 + lights.length * 450 + 300 + Math.random() * 900;
    timers.push(setTimeout(() => {
      lights.forEach(l => l.classList.remove("on"));
      if (msg) msg.textContent = "LIGHTS OUT AND AWAY WE GO";
    }, hold));
  }
  if (lightsBtn) {
    lightsBtn.addEventListener("click", runLights);
    runLights();
  }

  /* ---------- Timing tower nav: highlight current section ---------- */
  const navLinks = [...document.querySelectorAll(".tower-nav ol a")];
  const byId = new Map(navLinks.map(a => [a.getAttribute("href").slice(1), a]));
  const sections = [...byId.keys()].map(id => document.getElementById(id)).filter(Boolean);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.classList.remove("active"));
        const link = byId.get(e.target.id);
        if (link) {
          link.classList.add("active");
          // keep the active item visible on the phone-width strip
          link.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => io.observe(s));
  }

  /* ---------- Annotated car: link pins and legend ---------- */
  const diagram = document.getElementById("diagram");
  const pins = [...document.querySelectorAll(".pin")];
  const legendItems = [...document.querySelectorAll(".legend li")];

  function setHot(n, on) {
    document.querySelectorAll(`[data-pin="${n}"]`).forEach(el => el.classList.toggle("hot", on));
  }
  [...pins, ...legendItems].forEach(el => {
    const n = el.dataset.pin;
    el.addEventListener("mouseenter", () => setHot(n, true));
    el.addEventListener("mouseleave", () => setHot(n, false));
    el.addEventListener("focus", () => setHot(n, true));
    el.addEventListener("blur", () => setHot(n, false));
  });

  /* ---------- Pin editor: open the page with ?pins in the URL ----------
     Drag the numbers onto the photo, then copy the values from the yellow box
     into each pin's style="--x:..; --y:..;" in index.html. */
  const params = new URLSearchParams(location.search);
  if (diagram && params.has("pins")) {
    diagram.classList.add("editing");
    const readout = diagram.querySelector(".pin-readout");
    readout.hidden = false;

    const show = () => {
      readout.textContent = "PIN EDITOR (copy into index.html)\n" + pins.map(p =>
        `pin ${p.dataset.pin}: style="--x:${p.style.getPropertyValue("--x").trim()}; --y:${p.style.getPropertyValue("--y").trim()};"`
      ).join("\n");
    };
    show();

    pins.forEach(pin => {
      pin.addEventListener("pointerdown", e => {
        e.preventDefault();
        pin.setPointerCapture(e.pointerId);
        const move = ev => {
          const r = diagram.getBoundingClientRect();
          const x = Math.min(100, Math.max(0, ((ev.clientX - r.left) / r.width) * 100));
          const y = Math.min(100, Math.max(0, ((ev.clientY - r.top) / r.height) * 100));
          pin.style.setProperty("--x", x.toFixed(1) + "%");
          pin.style.setProperty("--y", y.toFixed(1) + "%");
          show();
        };
        const up = () => {
          pin.removeEventListener("pointermove", move);
          pin.removeEventListener("pointerup", up);
        };
        pin.addEventListener("pointermove", move);
        pin.addEventListener("pointerup", up);
      });
    });
  }
})();
