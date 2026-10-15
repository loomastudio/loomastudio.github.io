/* =====================================================================
   LOOMA STUDIO — animation effects
   data-reveal        fade/slide in on scroll ("up" default, "left", "right", "zoom")
   data-stagger       children reveal one after another
   data-split         heading words rise in one by one
   data-type="a,b,c"  typewriter that cycles through words
   data-count="200"   number counts up when visible (data-suffix="+")
   data-parallax=".2" moves slower/faster while scrolling
   .tilt              3D tilt + light glare following the mouse
   .magnetic          button gently pulled toward the cursor
   #heroCanvas        interactive particle network
   ===================================================================== */

const FX = (() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = window.matchMedia("(hover: none)").matches;

  /* ---------- Scroll reveal ---------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      io.unobserve(el);
      if (el.style.transitionDelay) setTimeout(() => el.style.transitionDelay = "", 1400);
      if (en.target.dataset.count !== undefined) countUp(en.target);
    });
  }, { threshold: .15, rootMargin: "0px 0px -40px 0px" }) : null;

  function observe(root = document) {
    root.querySelectorAll("[data-stagger]").forEach(p => {
      [...p.children].forEach((c, i) => { if (!c.hasAttribute("data-reveal")) c.setAttribute("data-reveal", p.dataset.stagger || "up"); c.style.transitionDelay = `${i * 90}ms`; });
    });
    root.querySelectorAll("[data-reveal]:not(.in), [data-count]:not(.in), [data-split]:not(.in)").forEach(el => {
      if (reduce || !io) { el.classList.add("in"); if (el.dataset.count !== undefined) el.textContent = el.dataset.count + (el.dataset.suffix || ""); }
      else io.observe(el);
    });
  }

  /* ---------- Split heading into animated words ---------- */
  function split(root = document) {
    root.querySelectorAll("[data-split]").forEach(el => {
      if (el.dataset.splitDone) return;
      let i = 0;
      const walk = node => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(w => {
              if (!w) return;
              if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
              const o = document.createElement("span"); o.className = "w";
              const s = document.createElement("span"); s.textContent = w; s.style.transitionDelay = `${i++ * 70}ms`;
              o.appendChild(s); frag.appendChild(o);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && !n.hasAttribute("data-type")) walk(n);
        });
      };
      walk(el); el.dataset.splitDone = 1;
    });
  }

  /* ---------- Typewriter ---------- */
  function typewriter() {
    document.querySelectorAll("[data-type]").forEach(el => {
      const words = el.dataset.type.split(",");
      if (reduce) { el.textContent = words[0]; return; }
      let w = 0, c = 0, del = false;
      const tick = () => {
        const word = words[w];
        el.textContent = word.slice(0, c);
        if (!del && c < word.length) { c++; setTimeout(tick, 90); }
        else if (!del) { del = true; setTimeout(tick, 1600); }
        else if (c > 0) { c--; setTimeout(tick, 45); }
        else { del = false; w = (w + 1) % words.length; setTimeout(tick, 300); }
      };
      tick();
    });
  }

  /* ---------- Counters ---------- */
  function countUp(el) {
    const end = parseFloat(el.dataset.count), suf = el.dataset.suffix || "", dur = 1800, t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * e).toLocaleString() + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Tilt + magnetic (delegated, so it works on cards added later) ---------- */
  function pointerFX() {
    if (touch || reduce) return;
    document.addEventListener("pointermove", e => {
      const t = e.target.closest(".tilt");
      if (t) {
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        const max = +(t.dataset.tilt || 8);
        t.style.setProperty("--rx", `${(0.5 - y) * max}deg`);
        t.style.setProperty("--ry", `${(x - 0.5) * max}deg`);
        t.style.setProperty("--mx", `${x * 100}%`);
        t.style.setProperty("--my", `${y * 100}%`);
        t.classList.add("tilting");
      }
      const m = e.target.closest(".magnetic");
      if (m) {
        const r = m.getBoundingClientRect();
        m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      }
    });
    document.addEventListener("pointerout", e => {
      const t = e.target.closest(".tilt");
      if (t && !t.contains(e.relatedTarget)) { t.classList.remove("tilting"); t.style.setProperty("--rx", "0deg"); t.style.setProperty("--ry", "0deg"); }
      const m = e.target.closest(".magnetic");
      if (m && !m.contains(e.relatedTarget)) m.style.transform = "";
    });
  }

  /* ---------- Custom cursor ---------- */
  function cursor() {
    if (touch || reduce) return;
    document.body.insertAdjacentHTML("beforeend", `<div class="cursor-dot"></div><div class="cursor-ring"></div>`);
    const dot = document.querySelector(".cursor-dot"), ring = document.querySelector(".cursor-ring");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    document.addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px, ${y}px)`; document.body.classList.add("has-cursor"); });
    document.addEventListener("pointerover", e => ring.classList.toggle("hover", !!e.target.closest("a, button, [data-open], input, select, textarea, label, summary")));
    document.addEventListener("pointerleave", () => document.body.classList.remove("has-cursor"));
    const loop = () => { rx += (x - rx) * .18; ry += (y - ry) * .18; ring.style.transform = `translate(${rx}px, ${ry}px)`; requestAnimationFrame(loop); };
    loop();
  }

  /* ---------- Scroll: progress bar, header, parallax ---------- */
  function scroll() {
    const bar = document.getElementById("scrollProgress"), header = document.getElementById("siteHeader");
    const para = [...document.querySelectorAll("[data-parallax]")];
    let ticking = false;
    const run = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      header?.classList.toggle("scrolled", scrollY > 30);
      if (!reduce) para.forEach(el => { el.style.transform = `translate3d(0, ${scrollY * parseFloat(el.dataset.parallax)}px, 0)`; });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- Particle network ---------- */
  function particles(canvas) {
    if (!canvas || reduce) return;
    const ctx = canvas.getContext("2d");
    const colors = ["255,138,31", "255,77,109", "106,168,255", "255,255,255"];
    let w, h, pts = [], mouse = { x: -999, y: -999 }, dpr = Math.min(devicePixelRatio || 1, 2), visible = true;
    const resize = () => {
      const r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.floor(w * h / 11000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4, r: Math.random() * 1.8 + .6, c: colors[Math.random() * colors.length | 0] }));
    };
    resize(); addEventListener("resize", resize);
    canvas.parentElement.addEventListener("pointermove", e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    canvas.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
    new IntersectionObserver(([en]) => visible = en.isIntersecting).observe(canvas);
    const draw = () => {
      requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 140) { p.vx += dx / d * .05; p.vy += dy / d * .05; }
        p.vx *= .985; p.vy *= .985;
        if (Math.abs(p.vx) < .08) p.vx += (Math.random() - .5) * .05;
        if (Math.abs(p.vy) < .08) p.vy += (Math.random() - .5) * .05;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${p.c},.8)`; ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) { ctx.strokeStyle = `rgba(${a.c},${(1 - d / 120) * .22})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      if (mouse.x > 0) for (const p of pts) {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < 180) { ctx.strokeStyle = `rgba(255,138,31,${(1 - d / 180) * .45})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      }
    };
    draw();
  }

  /* ---------- Mobile menu ---------- */
  function menu() {
    document.addEventListener("click", e => {
      if (e.target.closest(".menu-toggle")) { document.getElementById("mainNav").classList.toggle("open"); document.querySelector(".menu-toggle").classList.toggle("open"); }
      else if (e.target.closest("#mainNav a")) { document.getElementById("mainNav").classList.remove("open"); document.querySelector(".menu-toggle")?.classList.remove("open"); }
    });
  }

  function init() {
    split(); observe(); typewriter(); pointerFX(); cursor(); scroll(); menu();
    particles(document.getElementById("heroCanvas"));
  }
  return { init, observe, split, reduce };
})();

document.addEventListener("DOMContentLoaded", FX.init);
