/* =====================================================================
   LOOMA STUDIO — shared site logic (cart, product window, offers)
   ===================================================================== */

const STUDIO = {
  name: "Looma Studio",
  email: "info.loomastudio@gmail.com",
  currency: "$"
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => STUDIO.currency + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
const findGame = id => GAMES.find(g => g.id === id);

/* ---------- Auto-generated cover art (used when a game has no image) ---------- */
const PALETTES = [
  ["#ff8a1f", "#ff4d6d"], ["#6a5cff", "#20c9ff"], ["#12c28a", "#0a6fd6"], ["#ff4d6d", "#7b2ff7"],
  ["#f7b733", "#fc4a1a"], ["#00c6ff", "#0072ff"], ["#a8e063", "#56ab2f"], ["#ee0979", "#ff6a00"]
];
const GENRE_ICON = {
  "Endless Runner": "🏃", "Puzzle": "🧩", "Shooter": "🔫", "RPG": "⚔️", "Racing": "🏎️", "Strategy": "🏰",
  "Casual": "🎈", "Action": "💥", "Simulation": "🌾", "Horror": "👻", "Sports": "⚽", "Platformer": "🍄",
  "Adventure": "🗺️", "Arcade": "🕹️", "Educational": "📚", "Multiplayer": "🌐", "Casino": "🎰"
};
function hash(str) { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
function coverFor(g) {
  if (g.image) return g.image;
  const [a, b] = PALETTES[hash(g.id) % PALETTES.length];
  const icon = GENRE_ICON[g.genre] || "🎮";
  const title = esc(g.title.length > 22 ? g.title.slice(0, 21) + "…" : g.title);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
    <pattern id="p" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0v24" fill="none" stroke="#fff" stroke-opacity=".08"/></pattern></defs>
    <rect width="400" height="300" fill="url(#g)"/><rect width="400" height="300" fill="url(#p)"/>
    <circle cx="330" cy="60" r="90" fill="#fff" fill-opacity=".08"/><circle cx="60" cy="270" r="70" fill="#000" fill-opacity=".12"/>
    <text x="200" y="140" font-size="78" text-anchor="middle" dominant-baseline="middle">${icon}</text>
    <text x="200" y="232" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="800" fill="#fff" text-anchor="middle">${title}</text>
    <text x="200" y="264" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="600" fill="#fff" fill-opacity=".8" text-anchor="middle" letter-spacing="3">${esc(g.engine.toUpperCase())} · ${esc(g.genre.toUpperCase())}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* ---------- Product card ---------- */
const gameUrl = g => `game.html?id=${encodeURIComponent(g.id)}`;
/* Phone games captured in portrait are shown whole instead of cropped */
const portraitCls = g => g.image && g.orientation === "portrait" ? " portrait" : "";

function productCard(g, i = 0) {
  const sale = g.oldPrice && g.oldPrice > g.price ? Math.round((1 - g.price / g.oldPrice) * 100) : 0;
  return `
  <article class="product tilt" style="--i:${i % 12}">
    <div class="thumb${portraitCls(g)}">
      <a href="${gameUrl(g)}" tabindex="-1"><img src="${coverFor(g)}" alt="${esc(g.title)} cover" loading="lazy"></a>
      <span class="badge-engine ${g.engine.toLowerCase()}">${esc(g.engine)}</span>
      ${sale ? `<span class="badge-sale">-${sale}%</span>` : ""}
      <button class="quick-view" data-open="${esc(g.id)}">Quick view</button>
      <span class="glare"></span>
    </div>
    <div class="body">
      <span class="genre">${esc(g.genre)}</span>
      <h3><a href="${gameUrl(g)}">${esc(g.title)}</a></h3>
      <p class="short">${esc(g.short)}</p>
      <div class="plats">${g.platforms.map(p => `<span class="plat">${esc(p)}</span>`).join("")}</div>
      <div class="price-row">
        <span class="price">${money(g.price)}</span>
        ${g.oldPrice ? `<span class="old-price">${money(g.oldPrice)}</span>` : ""}
      </div>
      <div class="actions">
        <button class="btn btn-primary" data-add="${esc(g.id)}">Add to cart</button>
        <button class="btn btn-ghost" data-offer="${esc(g.id)}">Make offer</button>
      </div>
    </div>
  </article>`;
}

/* ---------- Cart (saved in the visitor's browser) ---------- */
const Cart = {
  key: "looma-cart",
  items() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
  save(list) { try { localStorage.setItem(this.key, JSON.stringify(list)); } catch {} renderCart(); },
  add(id) {
    const list = this.items();
    if (list.includes(id)) { toast("Already in your cart"); return; }
    list.push(id); this.save(list); toast("Added to cart ✓");
  },
  remove(id) { this.save(this.items().filter(x => x !== id)); },
  clear() { this.save([]); },
  games() { return this.items().map(findGame).filter(Boolean); },
  total() { return this.games().reduce((s, g) => s + g.price, 0); }
};

function renderCart() {
  const games = Cart.games();
  $$(".cart-count").forEach(el => el.textContent = games.length);
  const body = $("#cartBody");
  if (!body) return;
  body.innerHTML = games.length ? games.map(g => `
    <div class="cart-item">
      <img src="${coverFor(g)}" alt="">
      <div><h4>${esc(g.title)}</h4><small>${esc(g.engine)} · ${esc(g.genre)}</small><br>
        <button class="rm" data-remove="${esc(g.id)}">Remove</button></div>
      <b>${money(g.price)}</b>
    </div>`).join("")
    : `<div class="empty" style="padding:40px 16px">Your cart is empty.<br><a href="store.html" style="color:var(--accent)">Browse games →</a></div>`;
  $("#cartTotal").textContent = money(Cart.total());
  $("#checkoutBtn").disabled = !games.length;
}

/* ---------- Overlays ---------- */
function openOverlay(id) { $(id).classList.add("open"); document.body.style.overflow = "hidden"; }
function closeOverlays() {
  $$(".overlay.open, .drawer.open, .scrim.open").forEach(el => el.classList.remove("open"));
  const v = $("#pdVideo"); if (v) { if (v.tagName === "VIDEO") v.pause(); else v.src = ""; }
  document.body.style.overflow = "";
}
function openCart() { $("#cartDrawer").classList.add("open"); $("#scrim").classList.add("open"); document.body.style.overflow = "hidden"; }

function youtubeEmbed(url) {
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : "";
}
/* A game's video is either a YouTube link or a local .mp4 file */
const isVideoFile = url => /\.(mp4|webm)(\?|$)/i.test(String(url));
function videoTag(g, attrs = "") {
  return `<video ${attrs} src="${esc(g.video)}" poster="${coverFor(g)}" controls muted loop playsinline preload="none" title="Gameplay video"></video>`;
}

function openProduct(id) {
  const g = findGame(id); if (!g) return;
  const vid = g.video && !isVideoFile(g.video) ? youtubeEmbed(g.video) : "";
  $("#productContent").innerHTML = `
    <div class="pd">
      <div class="pd-media${portraitCls(g)}">
        <img src="${coverFor(g)}" alt="${esc(g.title)}">
        ${vid ? `<iframe id="pdVideo" class="video" src="${vid}" title="Gameplay video" allowfullscreen></iframe>` : ""}
        ${g.video && isVideoFile(g.video) ? videoTag(g, 'id="pdVideo" class="video"') : ""}
        <div class="pd-specs">
          <table class="spec-table">
            <tr><td>Engine</td><td>${esc(g.engine)}</td></tr>
            <tr><td>Engine version</td><td>${esc(g.version || "-")}</td></tr>
            <tr><td>Genre</td><td>${esc(g.genre)}</td></tr>
            <tr><td>Platforms</td><td>${g.platforms.map(esc).join(", ")}</td></tr>
            <tr><td>You receive</td><td>${(g.includes || []).map(esc).join("<br>")}</td></tr>
          </table>
        </div>
      </div>
      <div class="pd-info">
        <span class="badge-engine ${g.engine.toLowerCase()}" style="position:static;align-self:flex-start">${esc(g.engine)} · ${esc(g.genre)}</span>
        <h2>${esc(g.title)}</h2>
        <p class="muted">${esc(g.description || g.short)}</p>
        <a href="${gameUrl(g)}" style="color:var(--accent);font-weight:600">View full details page →</a>
        ${g.features?.length ? `<h4>Key features</h4><ul>${g.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
        <div class="buy-box">
          <div class="price-row" style="padding:0">
            <span class="price">${money(g.price)}</span>
            ${g.oldPrice ? `<span class="old-price">${money(g.oldPrice)}</span>` : ""}
          </div>
          <span class="stock">✓ Instant source-code delivery after payment</span>
          ${g.buyUrl
            ? `<a class="btn btn-primary btn-block" href="${esc(g.buyUrl)}" target="_blank" rel="noopener">Buy now</a>
               <button class="btn btn-dark btn-block" data-add="${esc(g.id)}">Add to cart</button>`
            : `<button class="btn btn-primary btn-block" data-add="${esc(g.id)}">Add to cart</button>
               <button class="btn btn-dark btn-block" data-buynow="${esc(g.id)}">Buy now</button>`}
          <button class="btn btn-ghost btn-block" data-offer="${esc(g.id)}">Make an offer</button>
          <small class="muted">Need a reskin or new features? Mention it in your offer, and we can customize the game for you.</small>
        </div>
      </div>
    </div>`;
  openOverlay("#productModal");
}

function openOffer(id) {
  const g = findGame(id);
  closeOverlays();
  const form = $("#offerForm");
  form.reset();
  form.game.value = g ? g.id : "";
  $("#offerGameName").textContent = g ? `${g.title} (${g.engine}) — listed at ${money(g.price)}` : "Custom request";
  if (g) form.amount.placeholder = `e.g. ${Math.round(g.price * 0.85)}`;
  openOverlay("#offerModal");
}

function openCheckout() {
  closeOverlays();
  const games = Cart.games();
  $("#checkoutSummary").innerHTML = games.map(g => `<div style="display:flex;justify-content:space-between"><span>${esc(g.title)} <small class="muted">(${esc(g.engine)})</small></span><b>${money(g.price)}</b></div>`).join("")
    + `<hr style="border-color:var(--border);margin:10px 0"><div class="total-row" style="margin:0"><span>Total</span><span>${money(Cart.total())}</span></div>`;
  openOverlay("#checkoutModal");
}

/* Opens the visitor's email app with a pre-filled message to the studio */
function sendEmail(subject, lines) {
  const body = lines.join("\n");
  window.location.href = `mailto:${STUDIO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* Animates the game cover flying into the cart button */
function flyToCart(fromBtn) {
  const cart = $(".cart-btn");
  const img = fromBtn.closest(".product, .modal, .pd-page")?.querySelector("img");
  const bump = () => { cart.classList.remove("bump"); void cart.offsetWidth; cart.classList.add("bump"); };
  if (!img || !cart || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { bump(); return; }
  const a = img.getBoundingClientRect(), b = cart.getBoundingClientRect();
  const fly = img.cloneNode();
  fly.className = "fly-img";
  Object.assign(fly.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
  document.body.appendChild(fly);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  fly.animate([
    { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1, borderRadius: "14px" },
    { transform: `translate(${dx * .5}px, ${dy * .5 - 80}px) scale(.45) rotate(-8deg)`, opacity: .9, offset: .5 },
    { transform: `translate(${dx}px, ${dy}px) scale(.06) rotate(12deg)`, opacity: .2, borderRadius: "50%" }
  ], { duration: 800, easing: "cubic-bezier(.6,0,.3,1)" }).onfinish = () => { fly.remove(); bump(); };
}

function toast(msg) {
  let t = $("#toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Shared overlays markup (injected on every page) ---------- */
function injectShared() {
  document.body.insertAdjacentHTML("beforeend", `
  <div class="overlay" id="productModal"><div class="modal"><button class="modal-close" data-close aria-label="Close">✕</button><div id="productContent"></div></div></div>

  <div class="overlay" id="offerModal"><div class="modal small"><button class="modal-close" data-close aria-label="Close">✕</button>
    <div class="modal-pad">
      <h2 style="margin-bottom:4px">Make an offer</h2>
      <p class="muted" id="offerGameName" style="margin-bottom:18px"></p>
      <form id="offerForm">
        <input type="hidden" name="game">
        <div class="row-2">
          <div class="field"><label>Your name</label><input name="name" required></div>
          <div class="field"><label>Your email</label><input name="email" type="email" required></div>
        </div>
        <div class="field"><label>Your offer (USD)</label><input name="amount" type="number" min="1" required></div>
        <div class="field"><label>Changes or extra requests (optional)</label><textarea name="message" placeholder="e.g. new art style, extra levels, publish to Play Store..."></textarea></div>
        <button class="btn btn-primary btn-block" type="submit">Send offer</button>
        <p class="form-note">Your email app opens with the offer filled in. We usually reply within 24 hours.</p>
      </form>
    </div></div></div>

  <div class="overlay" id="checkoutModal"><div class="modal small"><button class="modal-close" data-close aria-label="Close">✕</button>
    <div class="modal-pad">
      <h2 style="margin-bottom:14px">Checkout</h2>
      <div id="checkoutSummary" class="card-form" style="padding:16px;margin-bottom:18px"></div>
      <form id="checkoutForm">
        <div class="row-2">
          <div class="field"><label>Full name</label><input name="name" required></div>
          <div class="field"><label>Email</label><input name="email" type="email" required></div>
        </div>
        <div class="field"><label>Preferred payment</label>
          <select name="pay"><option>PayPal</option><option>Fiverr order</option><option>Bank transfer</option><option>Other</option></select></div>
        <div class="field"><label>Notes (optional)</label><textarea name="notes" style="min-height:80px"></textarea></div>
        <button class="btn btn-primary btn-block" type="submit">Place order request</button>
        <p class="form-note">We'll email you a secure payment link. The full source code is delivered as soon as payment is confirmed.</p>
      </form>
    </div></div></div>

  <div class="scrim" id="scrim" data-close></div>
  <aside class="drawer" id="cartDrawer" aria-label="Shopping cart">
    <div class="drawer-head"><h3>Your cart (<span class="cart-count">0</span>)</h3><button class="modal-close" data-close aria-label="Close">✕</button></div>
    <div class="drawer-body" id="cartBody"></div>
    <div class="drawer-foot">
      <div class="total-row"><span>Total</span><span id="cartTotal">$0</span></div>
      <button class="btn btn-primary btn-block" id="checkoutBtn">Proceed to checkout</button>
    </div>
  </aside>`);
}

/* ---------- Global event handling ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-open],[data-add],[data-offer],[data-buynow],[data-remove],[data-close],#checkoutBtn,[data-cart]");
  if (!t) return;
  if (t.matches("[data-close]")) { if (e.target === t || t.classList.contains("modal-close")) closeOverlays(); return; }
  if (t.dataset.open) openProduct(t.dataset.open);
  else if (t.dataset.add) { if (!Cart.items().includes(t.dataset.add)) flyToCart(t); Cart.add(t.dataset.add); }
  else if (t.dataset.offer !== undefined && t.hasAttribute("data-offer")) openOffer(t.dataset.offer);
  else if (t.dataset.buynow) { if (!Cart.items().includes(t.dataset.buynow)) Cart.add(t.dataset.buynow); openCheckout(); }
  else if (t.dataset.remove) Cart.remove(t.dataset.remove);
  else if (t.id === "checkoutBtn") openCheckout();
  else if (t.hasAttribute("data-cart")) openCart();
});
document.addEventListener("click", e => { if (e.target.classList.contains("overlay")) closeOverlays(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeOverlays(); });

document.addEventListener("submit", e => {
  const f = e.target;
  if (f.id === "offerForm") {
    e.preventDefault();
    const g = findGame(f.game.value);
    sendEmail(`Offer: ${g ? g.title : "Custom request"} — ${money(f.amount.value)}`, [
      `Hi ${STUDIO.name},`, "",
      `I'd like to make an offer${g ? ` for "${g.title}" (${g.engine}, listed at ${money(g.price)})` : ""}.`, "",
      `My offer: ${money(f.amount.value)}`,
      f.message.value ? `\nRequests / changes:\n${f.message.value}` : "", "",
      `Name: ${f.name.value}`, `Email: ${f.email.value}`
    ]);
    closeOverlays(); toast("Opening your email app…");
  }
  if (f.id === "checkoutForm") {
    e.preventDefault();
    const games = Cart.games();
    sendEmail(`Order request — ${games.length} game(s), ${money(Cart.total())}`, [
      `Hi ${STUDIO.name},`, "", "I'd like to buy the following project(s):", "",
      ...games.map(g => `• ${g.title} (${g.engine}) — ${money(g.price)}  [id: ${g.id}]`), "",
      `Total: ${money(Cart.total())}`, `Preferred payment: ${f.pay.value}`,
      f.notes.value ? `\nNotes:\n${f.notes.value}` : "", "",
      `Name: ${f.name.value}`, `Email: ${f.email.value}`
    ]);
    closeOverlays(); toast("Opening your email app…");
  }
  if (f.id === "customForm") {
    e.preventDefault();
    const type = f.type ? f.type.value : "New custom game";
    sendEmail(`${type} — ${f.engine.value}`, [
      `Hi ${STUDIO.name},`, "", `Request: ${type}`, "",
      `Engine: ${f.engine.value}`, `Budget: ${f.budget.value}`, "", "Project details:", f.details.value, "",
      `Name: ${f.name.value}`, `Email: ${f.email.value}`
    ]);
    toast("Opening your email app…"); f.reset();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  injectShared();
  renderCart();
  $$(".year").forEach(el => el.textContent = new Date().getFullYear());
  $$(".game-total").forEach(el => el.textContent = GAMES.length);
});
