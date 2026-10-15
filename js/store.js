/* =====================================================================
   LOOMA STUDIO — store page: search, filters, sorting, pagination
   ===================================================================== */

const PER_PAGE = 24;
const state = { q: "", engines: new Set(), genres: new Set(), platforms: new Set(), maxPrice: 0, onSale: false, sort: "featured", page: 1 };
const MAX_PRICE = Math.max(...GAMES.map(g => g.price), 10);
const uniq = key => [...new Set(GAMES.flatMap(g => [].concat(g[key])))].sort();

function countBy(key, val) { return GAMES.filter(g => [].concat(g[key]).includes(val)).length; }

function buildFilters() {
  const group = (title, key, name) => `
    <div class="filter-group"><h4>${title}</h4>
      ${uniq(key).map(v => `<label class="check"><input type="checkbox" data-f="${name}" value="${esc(v)}"> ${esc(v)}<span class="n">${countBy(key, v)}</span></label>`).join("")}
    </div>`;
  $("#filters").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <h3>Filters</h3><button class="btn btn-sm btn-ghost" id="clearFilters">Clear all</button>
    </div>
    ${group("Game engine", "engine", "engines")}
    ${group("Genre", "genre", "genres")}
    ${group("Platform", "platforms", "platforms")}
    <div class="filter-group"><h4>Max price</h4>
      <input type="range" id="priceRange" min="0" max="${MAX_PRICE}" step="5" value="${MAX_PRICE}">
      <div class="range-val"><span>$0</span><span id="priceVal">${money(MAX_PRICE)}</span></div>
    </div>
    <div class="filter-group"><h4>Deals</h4>
      <label class="check"><input type="checkbox" id="saleOnly"> On sale only</label>
    </div>`;

  // category strip
  $("#catStrip").innerHTML = `<button data-cat="">All games</button>` +
    ["Unity", "Unreal", "Godot"].map(e => `<button data-cat="engine:${e}">${e}</button>`).join("") +
    uniq("genre").map(gn => `<button data-cat="genre:${esc(gn)}">${esc(gn)}</button>`).join("");
}

function syncControls() {
  $$("[data-f]").forEach(cb => cb.checked = state[cb.dataset.f].has(cb.value));
  $("#priceRange").value = state.maxPrice || MAX_PRICE;
  $("#priceVal").textContent = money(state.maxPrice || MAX_PRICE);
  $("#saleOnly").checked = state.onSale;
  $("#sortSel").value = state.sort;
  $("#searchInput").value = state.q;
  const only = (set, v) => set.size === 1 && set.has(v);
  const noOther = (...sets) => sets.every(s => s.size === 0);
  $$("#catStrip button").forEach(b => {
    const [k, v] = b.dataset.cat.split(":");
    let on = false;
    if (!b.dataset.cat) on = noOther(state.engines, state.genres, state.platforms) && !state.q && !state.onSale;
    else if (k === "engine") on = only(state.engines, v) && noOther(state.genres);
    else if (k === "genre") on = only(state.genres, v) && noOther(state.engines);
    b.classList.toggle("on", on);
  });
}

function filtered() {
  const q = state.q.trim().toLowerCase();
  let list = GAMES.filter(g =>
    (!q || [g.title, g.genre, g.engine, g.short, ...(g.platforms || [])].join(" ").toLowerCase().includes(q)) &&
    (!state.engines.size || state.engines.has(g.engine)) &&
    (!state.genres.size || state.genres.has(g.genre)) &&
    (!state.platforms.size || g.platforms.some(p => state.platforms.has(p))) &&
    (!state.maxPrice || g.price <= state.maxPrice) &&
    (!state.onSale || (g.oldPrice && g.oldPrice > g.price))
  );
  const by = {
    "featured": (a, b) => (b.featured === true) - (a.featured === true) || (b.added || "").localeCompare(a.added || ""),
    "newest": (a, b) => (b.added || "").localeCompare(a.added || ""),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "name": (a, b) => a.title.localeCompare(b.title)
  };
  return list.sort(by[state.sort] || by.featured);
}

function render() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  state.page = Math.min(state.page, pages);
  const slice = list.slice((state.page - 1) * PER_PAGE, state.page * PER_PAGE);

  $("#resultCount").innerHTML = list.length
    ? `Showing <b>${(state.page - 1) * PER_PAGE + 1}–${(state.page - 1) * PER_PAGE + slice.length}</b> of <b>${list.length}</b> games`
    : "No games found";

  $("#productGrid").innerHTML = slice.map(productCard).join("") ||
    `<div class="empty" style="grid-column:1/-1"><h3>No games match your filters</h3><p>Try clearing some filters — or <button data-offer="" style="background:none;border:0;color:var(--accent);cursor:pointer;padding:0">ask us for a custom game</button>.</p></div>`;

  // active chips
  const chips = [];
  if (state.q) chips.push([`Search: "${state.q}"`, () => state.q = ""]);
  ["engines", "genres", "platforms"].forEach(k => state[k].forEach(v => chips.push([v, () => state[k].delete(v)])));
  if (state.maxPrice && state.maxPrice < MAX_PRICE) chips.push([`Under ${money(state.maxPrice)}`, () => state.maxPrice = 0]);
  if (state.onSale) chips.push(["On sale", () => state.onSale = false]);
  const box = $("#activeChips");
  box.innerHTML = chips.map((c, i) => `<span class="chip" data-chip="${i}">${esc(c[0])} ✕</span>`).join("");
  box.onclick = e => { const c = e.target.closest("[data-chip]"); if (c) { chips[+c.dataset.chip][1](); update(); } };

  // pagination
  const pg = $("#pagination");
  if (pages <= 1) { pg.innerHTML = ""; }
  else {
    let html = `<button data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>‹</button>`;
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - state.page) <= 1) html += `<button data-page="${i}" class="${i === state.page ? "on" : ""}">${i}</button>`;
      else if (Math.abs(i - state.page) === 2) html += `<button disabled>…</button>`;
    }
    html += `<button data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""}>›</button>`;
    pg.innerHTML = html;
  }
  syncControls();
  writeUrl();
}

function update(resetPage = true) { if (resetPage) state.page = 1; render(); }

/* Keep filters in the address bar so links can be shared, e.g. store.html?engine=Unity */
function writeUrl() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.engines.size) p.set("engine", [...state.engines].join(","));
  if (state.genres.size) p.set("genre", [...state.genres].join(","));
  if (state.platforms.size) p.set("platform", [...state.platforms].join(","));
  if (state.maxPrice && state.maxPrice < MAX_PRICE) p.set("max", state.maxPrice);
  if (state.onSale) p.set("sale", "1");
  if (state.sort !== "featured") p.set("sort", state.sort);
  if (state.page > 1) p.set("page", state.page);
  const s = p.toString();
  history.replaceState(null, "", s ? `?${s}` : location.pathname);
}
function readUrl() {
  const p = new URLSearchParams(location.search);
  const list = k => (p.get(k) || "").split(",").filter(Boolean);
  state.q = p.get("q") || "";
  state.engines = new Set(list("engine"));
  state.genres = new Set(list("genre"));
  state.platforms = new Set(list("platform"));
  state.maxPrice = +p.get("max") || 0;
  state.onSale = p.get("sale") === "1";
  state.sort = p.get("sort") || "featured";
  state.page = +p.get("page") || 1;
  if (p.get("game")) setTimeout(() => openProduct(p.get("game")), 50);
}

document.addEventListener("DOMContentLoaded", () => {
  buildFilters();
  readUrl();
  render();

  $("#filters").addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.f) { t.checked ? state[t.dataset.f].add(t.value) : state[t.dataset.f].delete(t.value); update(); }
    if (t.id === "saleOnly") { state.onSale = t.checked; update(); }
  });
  $("#filters").addEventListener("input", e => {
    if (e.target.id === "priceRange") { state.maxPrice = +e.target.value; $("#priceVal").textContent = money(state.maxPrice); update(); }
  });
  $("#filters").addEventListener("click", e => {
    if (e.target.id === "clearFilters") { Object.assign(state, { q: "", maxPrice: 0, onSale: false }); state.engines.clear(); state.genres.clear(); state.platforms.clear(); update(); }
  });
  $("#catStrip").addEventListener("click", e => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    const [k, v] = b.dataset.cat.split(":");
    state.engines.clear(); state.genres.clear(); state.platforms.clear(); state.q = ""; state.onSale = false; state.maxPrice = 0;
    if (k === "engine") state.engines.add(v);
    if (k === "genre") state.genres.add(v);
    update();
  });
  $("#sortSel").addEventListener("change", e => { state.sort = e.target.value; update(); });
  $("#pagination").addEventListener("click", e => {
    const b = e.target.closest("[data-page]"); if (!b || b.disabled) return;
    state.page = +b.dataset.page; render(); window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const doSearch = () => {
    state.q = $("#searchInput").value;
    const eng = $("#searchEngine").value;
    state.engines.clear(); if (eng) state.engines.add(eng);
    update();
  };
  $("#searchForm").addEventListener("submit", e => { e.preventDefault(); doSearch(); });
  let t; $("#searchInput").addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { state.q = $("#searchInput").value; update(); }, 250); });

  $("#filtersToggle").addEventListener("click", () => { $("#filters").classList.add("open"); $("#scrim").classList.add("open"); });
  $("#scrim").addEventListener("click", () => $("#filters").classList.remove("open"));
});
