/* =====================================================================
   LOOMA STUDIO — shared header, footer, loader and page transitions
   Every page has <div id="site-header"></div> and <div id="site-footer"></div>
   ===================================================================== */

const NAV = [
  ["index.html", "Home"],
  ["store.html", "Game Store"],
  ["catalog.html", "Catalog"],
  ["services.html", "Services"],
  ["about.html", "About"],
  ["contact.html", "Contact"]
];
// Your logo. Put the file at this path; until it exists the "L" mark is shown instead.
const LOGO = "images/logo.png";
const MARK = `<span class="brand-mark"><span>L</span><img src="${LOGO}" alt="" onload="this.parentNode.classList.add('has-logo')" onerror="this.remove()"></span>`;

const SOCIAL = {
  github: "https://github.com/loomastudio",
  linkedin: "https://www.linkedin.com/in/rashmi-virajitha-468626272",
  youtube: "https://www.youtube.com/@rashmivirajitha",
  fiverr: "https://www.fiverr.com/s/Emg0YX7"
};
const ICONS = {
  github: '<svg viewBox="0 0 24 24"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24"><path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.6V9h3.5v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>',
  fiverr: '<svg viewBox="0 0 24 24"><text x="2" y="18" font-size="16" font-weight="900" font-family="Arial" fill="currentColor">fi</text></svg>'
};

(function renderLayout() {
  // Use the logo as the browser tab icon once it exists
  const probe = new Image();
  probe.onload = () => { const fav = document.getElementById("favicon"); if (fav) fav.href = LOGO; };
  probe.src = LOGO;
  const page = location.pathname.split("/").pop() || "index.html";
  const header = document.getElementById("site-header");
  if (header) header.outerHTML = `
  <div class="scroll-progress" id="scrollProgress"></div>
  <header class="site-header" id="siteHeader">
    <div class="container header-row">
      <a href="index.html" class="brand">${MARK}Looma<span class="accent">Studio</span></a>
      <form class="header-search" id="searchForm" role="search" action="store.html">
        <select id="searchEngine" name="engine" aria-label="Engine">
          <option value="">All</option><option>Unity</option><option>Unreal</option><option>Godot</option>
        </select>
        <input id="searchInput" name="q" type="search" placeholder="Search 200+ games…" aria-label="Search games" autocomplete="off">
        <button type="submit" aria-label="Search"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M10 2a8 8 0 0 1 6.3 12.9l5.4 5.4-1.4 1.4-5.4-5.4A8 8 0 1 1 10 2zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/></svg></button>
      </form>
      <nav class="nav" id="mainNav">
        ${NAV.map(([href, label]) => `<a href="${href}" class="${href === page ? "active" : ""}">${label}</a>`).join("")}
      </nav>
      <button class="cart-btn magnetic" data-cart aria-label="Open cart">
        <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5.2 4H22l-2.4 9.2a2 2 0 0 1-1.9 1.5H8.4l-.6 2.3H20v2H5.2l1.6-6.1L4 2H1V0h4.5z"/></svg>
        <span class="label">Cart</span> <span class="cart-count">0</span>
      </button>
      <button class="menu-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </header>`;

  const footer = document.getElementById("site-footer");
  if (footer) footer.outerHTML = `
  <footer class="site-footer">
    <div class="footer-cta container" data-reveal>
      <div>
        <h2>Have a game idea?<br><span class="grad-text">Let's build it together.</span></h2>
      </div>
      <a href="contact.html" class="btn btn-primary btn-lg magnetic">Start a project →</a>
    </div>
    <div class="container">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="brand">${MARK}Looma<span class="accent">Studio</span></a>
          <p class="muted" style="margin-top:14px;max-width:340px">Indie game studio crafting games in Unity, Unreal Engine & Godot. Ready-made games and custom development.</p>
          <div class="socials" style="margin-top:18px">
            ${Object.keys(SOCIAL).map(k => `<a class="social-icon" href="${SOCIAL[k]}" target="_blank" rel="noopener" aria-label="${k}">${ICONS[k]}</a>`).join("")}
          </div>
        </div>
        <div><h4>Store</h4><ul>
          <li><a href="store.html?engine=Unity">Unity games</a></li>
          <li><a href="store.html?engine=Unreal">Unreal games</a></li>
          <li><a href="store.html?engine=Godot">Godot games</a></li>
          <li><a href="store.html?sale=1">Deals</a></li></ul></div>
        <div><h4>Studio</h4><ul>
          <li><a href="services.html">Services</a></li>
          <li><a href="about.html">About us</a></li>
          <li><a href="contact.html">Contact</a></li>
          <li><a href="contact.html#faq">FAQ</a></li></ul></div>
        <div><h4>Get in touch</h4><ul>
          <li><a href="mailto:info.loomastudio@gmail.com">info.loomastudio@gmail.com</a></li>
          <li><a href="${SOCIAL.fiverr}" target="_blank" rel="noopener">Hire us on Fiverr</a></li>
          <li><a href="${SOCIAL.youtube}" target="_blank" rel="noopener">Watch gameplay on YouTube</a></li></ul></div>
      </div>
      <div class="copyright"><span>© <span class="year"></span> Looma Studio. All rights reserved.</span><a href="#" data-top>Back to top ↑</a></div>
    </div>
  </footer>`;

  // Intro loader: full animation on first visit, quick curtain on later page loads
  const first = (() => { try { return !sessionStorage.getItem("looma-seen"); } catch { return true; } })();
  document.body.insertAdjacentHTML("afterbegin", first
    ? `<div class="loader" id="loader"><div class="loader-inner">
         <div class="loader-logo"><span>L</span><img src="${LOGO}" alt="" onload="this.parentNode.classList.add('has-logo')" onerror="this.remove()"></div>
         <div class="loader-word">${"LOOMA STUDIO".split("").map((c, i) => `<span style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join("")}</div>
         <div class="loader-bar"><i></i></div>
       </div></div>`
    : `<div class="curtain in" id="curtain">${MARK}</div>`);
  try { sessionStorage.setItem("looma-seen", "1"); } catch {}

  window.addEventListener("load", () => {
    const l = document.getElementById("loader");
    if (l) setTimeout(() => { l.classList.add("done"); document.body.classList.add("ready"); setTimeout(() => l.remove(), 1000); }, 2100);
    else document.body.classList.add("ready");
    const c = document.getElementById("curtain");
    if (c) requestAnimationFrame(() => c.classList.remove("in"));
  });
  // Safety: never leave the loader stuck
  setTimeout(() => { document.getElementById("loader")?.classList.add("done"); document.body.classList.add("ready"); document.getElementById("curtain")?.classList.remove("in"); }, 4000);

  // Page transition when leaving to another page of the site
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || /^https?:/.test(href)) return;
    const url = new URL(href, location.href);
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    let c = document.getElementById("curtain");
    if (!c) { c = document.createElement("div"); c.id = "curtain"; c.className = "curtain"; c.innerHTML = MARK; document.body.appendChild(c); }
    c.classList.remove("in"); void c.offsetWidth; c.classList.add("out");
    setTimeout(() => location.href = url.href, 480);
  });
  window.addEventListener("pageshow", e => { if (e.persisted) document.getElementById("curtain")?.classList.remove("out", "in"); });

  document.addEventListener("click", e => {
    if (e.target.closest("[data-top]")) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });
})();
