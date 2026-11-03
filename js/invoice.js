/* =====================================================================
   LOOMA STUDIO — Invoice Maker
   Project and monthly invoices. Everything is stored in this browser
   (localStorage) — use "Back up (JSON)" to keep a copy.
   ===================================================================== */

// ---------- lock screen ----------
// Only a salted PBKDF2 hash of the password is stored here, never the password.
// This keeps visitors out of the tool; invoices themselves never leave your browser.
const LOCK = { salt: "da2e885ab6509e7224bcf9af9eeb136b", hash: "0881360eafdcdc575edea931e56253315b87582b9dad1b6ef475cd4d8d6378b6", iterations: 210000, key: "looma.invoice.unlock" };

(function lockScreen() {
  const remembered = () => { try { return localStorage.getItem(LOCK.key) || sessionStorage.getItem(LOCK.key); } catch { return null; } };
  const unlock = () => { document.body.classList.remove("inv-locked"); startInvoices(); };
  if (remembered() === LOCK.hash) return unlock();

  async function derive(pw) {
    const bytes = new Uint8Array(LOCK.salt.match(/../g).map((b) => parseInt(b, 16)));
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: bytes, iterations: LOCK.iterations, hash: "SHA-256" }, key, 256);
    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  const form = document.getElementById("lockForm");
  const input = document.getElementById("lockPass");
  const err = document.getElementById("lockError");
  input.focus();
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    err.textContent = "Checking…";
    const ok = (await derive(input.value.trim())) === LOCK.hash;
    if (!ok) { err.textContent = "Wrong password."; input.select(); return; }
    try { (document.getElementById("lockRemember").checked ? localStorage : sessionStorage).setItem(LOCK.key, LOCK.hash); } catch {}
    err.textContent = ""; input.value = "";
    unlock();
  });
})();

function startInvoices() {
  const KEY_HISTORY = "looma.invoices";
  const KEY_STUDIO = "looma.invoice.studio";
  const LOGO = "images/logo.png";

  // Defaults for "Your studio details" (edit here or in the form — the form is remembered)
  const STUDIO_DEFAULTS = {
    from: { name: "Looma Studio", email: "info.loomastudio@gmail.com", phone: "", address: "loomastudio.github.io" },
    payment: "",
    currency: "USD"
  };

  const form = document.getElementById("invForm");
  const paper = document.getElementById("paper");
  const itemsEl = document.getElementById("items");
  const $ = (id) => document.getElementById(id);

  let inv = null; // the invoice being edited

  // ---------- storage ----------
  const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
  const history = () => load(KEY_HISTORY, []);

  // ---------- helpers ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (v) => { const n = parseFloat(v); return isFinite(n) ? n : 0; };
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseDate = (s) => { const [y, m, d] = (s || "").split("-").map(Number); return y ? new Date(y, (m || 1) - 1, d || 1) : null; };
  const addDays = (s, n) => { const d = parseDate(s) || new Date(); d.setDate(d.getDate() + n); return isoDate(d); };
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const niceDate = (s) => { const d = parseDate(s); return d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : "—"; };
  const monthLabel = (s) => { const d = parseDate(s); return d ? d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : ""; };
  const monthBounds = (s) => {
    const d = parseDate(s); if (!d) return { from: "", to: "" };
    return { from: isoDate(d), to: isoDate(new Date(d.getFullYear(), d.getMonth() + 1, 0)) };
  };
  // Same day one month later (31 Jan -> 28 Feb)
  const shiftMonth = (s) => {
    const d = parseDate(s); if (!d) return s;
    const last = new Date(d.getFullYear(), d.getMonth() + 2, 0).getDate();
    return isoDate(new Date(d.getFullYear(), d.getMonth() + 1, Math.min(d.getDate(), last)));
  };
  const period = (i) => (i.periodFrom && i.periodTo ? { from: i.periodFrom, to: i.periodTo } : monthBounds(i.month));
  const periodText = (i) => { const p = period(i); return p.from ? `${niceDate(p.from)} – ${niceDate(p.to)}` : ""; };
  // "November 2026" for a whole calendar month, otherwise the date range
  const periodLabel = (i) => {
    const p = period(i), m = monthBounds(p.from.slice(0, 7));
    return p.from && p.from === m.from && p.to === m.to ? monthLabel(p.from) : periodText(i);
  };
  const nextMonth = (s) => { const d = parseDate(s) || new Date(); return `${d.getFullYear() + (d.getMonth() === 11 ? 1 : 0)}-${pad((d.getMonth() + 1) % 12 + 1)}`; };
  const money = (n, cur) => {
    try { return new Intl.NumberFormat("en-US", { style: "currency", currency: cur || "USD" }).format(n); }
    catch { return `${cur} ${n.toFixed(2)}`; }
  };
  const get = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  const set = (o, path, v) => { const ks = path.split("."); const last = ks.pop(); ks.reduce((a, k) => (a[k] ??= {}), o)[last] = v; };

  function nextNumber() {
    const year = new Date().getFullYear();
    const re = new RegExp(`^LS-${year}-(\\d+)$`);
    const max = history().reduce((m, h) => { const r = re.exec(h.number || ""); return r ? Math.max(m, +r[1]) : m; }, 0);
    return `LS-${year}-${pad(max + 1, 3)}`;
  }

  function blank(type) {
    const studio = load(KEY_STUDIO, STUDIO_DEFAULTS);
    const today = isoDate(new Date());
    const now = new Date();
    return {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type: type || "project",
      number: nextNumber(),
      status: "Unpaid",
      date: today, terms: "7", due: addDays(today, 7),
      currency: studio.currency || "USD",
      from: { ...STUDIO_DEFAULTS.from, ...studio.from },
      payment: studio.payment || "",
      client: { name: "", company: "", email: "", address: "" },
      project: "",
      month: `${now.getFullYear()}-${pad(now.getMonth() + 1)}`,
      periodFrom: monthBounds(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`).from,
      periodTo: monthBounds(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`).to,
      mode: "fixed", service: "Game development — monthly retainer", fee: "", hours: "", rate: "",
      items: type === "monthly" ? [] : [{ desc: "", qty: 1, rate: "" }],
      discount: "", tax: "", paid: "",
      notes: "Thank you for working with Looma Studio!"
    };
  }

  // ---------- totals ----------
  function lines(i) {
    const out = [];
    if (i.type === "monthly") {
      const period = periodLabel(i);
      if (i.mode === "hourly") {
        out.push({ desc: `${i.service || "Development hours"}${period ? ` — ${period}` : ""}`, qty: num(i.hours), rate: num(i.rate), unit: "hrs" });
      } else {
        out.push({ desc: `${i.service || "Monthly fee"}${period ? ` — ${period}` : ""}`, qty: 1, rate: num(i.fee) });
      }
    }
    i.items.forEach((it) => { if (it.desc || num(it.rate)) out.push({ desc: it.desc, qty: num(it.qty), rate: num(it.rate) }); });
    return out;
  }

  function totals(i) {
    const subtotal = lines(i).reduce((s, l) => s + l.qty * l.rate, 0);
    const discount = subtotal * Math.min(num(i.discount), 100) / 100;
    const taxable = subtotal - discount;
    const tax = taxable * num(i.tax) / 100;
    const total = taxable + tax;
    const paid = num(i.paid);
    return { subtotal, discount, tax, total, paid, due: Math.max(total - paid, 0) };
  }

  // ---------- form <-> invoice ----------
  function fillForm() {
    form.querySelectorAll("[name]").forEach((el) => { el.value = get(inv, el.name) ?? ""; });
    renderItems();
    syncType();
    syncClientPick();
  }

  function renderItems() {
    itemsEl.innerHTML = inv.items.map((it, n) => `
      <div class="item-row" data-i="${n}">
        <input data-k="desc" placeholder="${inv.type === "monthly" ? "Extra work" : "Milestone / task"}" value="${esc(it.desc)}">
        <input data-k="qty" type="number" min="0" step="any" value="${esc(it.qty)}">
        <input data-k="rate" type="number" min="0" step="0.01" placeholder="0.00" value="${esc(it.rate)}">
        <button type="button" class="del" aria-label="Remove line">×</button>
      </div>`).join("");
  }

  function syncType() {
    document.querySelectorAll(".inv-tab").forEach((b) => b.classList.toggle("active", b.dataset.kind === inv.type));
    document.querySelectorAll("[data-only]").forEach((el) => el.classList.toggle("hidden", el.dataset.only !== inv.type));
    document.querySelectorAll("[data-mode]").forEach((el) => el.classList.toggle("hidden", el.dataset.mode !== inv.mode));
    $("itemsTitle").textContent = inv.type === "monthly" ? "Extra line items (optional)" : "Line items";
    $("paidLabel").textContent = inv.type === "monthly" ? "Already paid" : "Advance paid";
  }

  // ---------- preview ----------
  function render() {
    const t = totals(inv);
    const cur = inv.currency;
    const ls = lines(inv);
    const isMonthly = inv.type === "monthly";
    const c = inv.client;
    const f = inv.from;
    const brand = esc(f.name || "Looma Studio").replace(/^Looma Studio$/, 'Looma <span class="accent">Studio</span>');

    paper.innerHTML = `
      ${inv.status === "Paid" ? '<div class="stamp paid">PAID</div>' : inv.status === "Draft" ? '<div class="stamp draft">DRAFT</div>' : ""}
      <div class="p-top">
        <div>
          <div class="p-brand"><span class="p-logo"><span>${esc((f.name || "L")[0])}</span><img src="${LOGO}" alt="" onerror="this.remove()" onload="this.previousElementSibling.remove()"></span>${brand}</div>
          <div class="soft pre" style="margin-top:8px">${esc([f.email, f.phone, f.address].filter(Boolean).join("\n"))}</div>
        </div>
        <div class="p-title">
          <h2>INVOICE</h2>
          <div class="kind">${isMonthly ? "Monthly" : "Project"}</div>
        </div>
      </div>
      <div class="p-bar"></div>
      <div class="p-cols">
        <div>
          <div class="lbl">Bill to</div>
          <b>${esc(c.name) || '<span class="soft">Client name</span>'}</b>
          <div class="pre">${esc([c.company, c.email, c.address].filter(Boolean).join("\n"))}</div>
        </div>
        <div></div>
        <div class="kv">
          <span>Invoice #</span><span>${esc(inv.number)}</span>
          <span>Issued</span><span>${niceDate(inv.date)}</span>
          <span>Due</span><span>${inv.terms === "0" ? "On receipt" : niceDate(inv.due)}</span>
        </div>
      </div>
      ${isMonthly
        ? `<div class="p-subject"><span class="lbl">Billing period</span><b>${esc(periodText(inv)) || "—"}</b></div>`
        : inv.project ? `<div class="p-subject"><span class="lbl">Project</span><b>${esc(inv.project)}</b></div>` : '<div style="height:18px"></div>'}
      <table>
        <thead><tr><th>Description</th><th class="num">${isMonthly && inv.mode === "hourly" ? "Qty / Hrs" : "Qty"}</th><th class="num">Rate</th><th class="num">Amount</th></tr></thead>
        <tbody>${ls.length ? ls.map((l) => `
          <tr><td>${esc(l.desc) || '<span class="soft">—</span>'}</td><td class="num">${l.qty}${l.unit ? " " + l.unit : ""}</td>
          <td class="num">${money(l.rate, cur)}</td><td class="num">${money(l.qty * l.rate, cur)}</td></tr>`).join("")
          : '<tr><td colspan="4" class="empty">Add line items to see them here</td></tr>'}
        </tbody>
      </table>
      <div class="p-sum">
        <div><span class="soft">Subtotal</span><span>${money(t.subtotal, cur)}</span></div>
        ${t.discount ? `<div><span class="soft">Discount (${num(inv.discount)}%)</span><span>−${money(t.discount, cur)}</span></div>` : ""}
        ${num(inv.tax) ? `<div><span class="soft">Tax (${num(inv.tax)}%)</span><span>${money(t.tax, cur)}</span></div>` : ""}
        <div class="total"><span>Total</span><span>${money(t.total, cur)}</span></div>
        ${t.paid ? `<div><span class="soft">${isMonthly ? "Paid" : "Advance paid"}</span><span>−${money(t.paid, cur)}</span></div>` : ""}
        <div class="due"><span>${inv.status === "Paid" ? "Paid in full" : "Balance due"}</span><span>${money(inv.status === "Paid" ? 0 : t.due, cur)}</span></div>
      </div>
      <div class="p-foot">
        <div>${inv.payment ? `<div class="lbl">Payment details</div><div class="pre">${esc(inv.payment)}</div>` : ""}</div>
        <div>${inv.notes ? `<div class="lbl">Notes</div><div class="pre">${esc(inv.notes)}</div>` : ""}</div>
      </div>
      <div class="p-thanks">${esc(f.name || "Looma Studio")} · ${esc(f.email || "")}</div>`;
    document.title = `${inv.number} — ${c.name || "Invoice"}`; // becomes the PDF file name
  }

  // ---------- clients ----------
  function clients() {
    const map = new Map();
    history().forEach((h) => { if (h.client?.name) map.set((h.client.name + "|" + (h.client.company || "")).toLowerCase(), h.client); });
    return [...map.values()];
  }
  function syncClientPick() {
    const list = clients();
    $("clientPick").innerHTML = '<option value="">— New client —</option>' +
      list.map((c, n) => `<option value="${n}">${esc(c.name)}${c.company ? " · " + esc(c.company) : ""}</option>`).join("");
    $("clientPick").dataset.list = JSON.stringify(list);
  }

  // ---------- history ----------
  function renderHistory() {
    const h = history().sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.number || "").localeCompare(a.number || ""));
    $("historyCount").textContent = h.length;
    $("history").innerHTML = h.length ? h.map((x) => `
      <div class="hist-row" data-id="${esc(x.id)}">
        <div class="meta">
          <b>${esc(x.number)} · ${esc(x.client?.name || "No client")}<span class="tag ${esc((x.status || "").toLowerCase())}">${esc(x.status)}</span></b>
          <small>${x.type === "monthly" ? "Monthly · " + esc(periodLabel(x)) : "Project" + (x.project ? " · " + esc(x.project) : "")} · ${money(totals(x).total, x.currency)}</small>
        </div>
        <button type="button" data-act="open">Open</button>
        <button type="button" data-act="copy" title="Duplicate as a new invoice">Copy</button>
        <button type="button" class="x" data-act="del" aria-label="Delete">×</button>
      </div>`).join("") : '<p class="muted small" style="padding-bottom:12px">No saved invoices yet.</p>';
  }

  function save(quiet) {
    const h = history();
    const n = h.findIndex((x) => x.id === inv.id);
    if (h.some((x) => x.number === inv.number && x.id !== inv.id)) { toast(`Invoice number ${inv.number} is already used.`, true); return false; }
    if (n >= 0) h[n] = inv; else h.push(inv);
    const ok = store(KEY_HISTORY, h);
    store(KEY_STUDIO, { from: inv.from, payment: inv.payment, currency: inv.currency });
    renderHistory(); syncClientPick();
    if (!quiet) toast(ok ? `Saved ${inv.number}` : "Couldn't save — browser storage is blocked.", !ok);
    return ok;
  }

  let toastTimer;
  function toast(msg, bad) {
    const t = $("toast");
    t.textContent = msg; t.style.color = bad ? "var(--danger)" : "";
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.textContent = ""), 3000);
  }

  function open(next) { inv = next; fillForm(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); }

  function duplicate(src, opts = {}) {
    const copy = JSON.parse(JSON.stringify(src));
    const fresh = blank(src.type);
    Object.assign(copy, { id: fresh.id, number: fresh.number, status: "Unpaid", date: fresh.date, paid: "" }, opts);
    copy.due = addDays(copy.date, num(copy.terms));
    return copy;
  }

  // ---------- events ----------
  form.addEventListener("input", (e) => {
    const el = e.target;
    if (el.name) {
      set(inv, el.name, el.value);
      if (el.name === "terms" || el.name === "date") { inv.due = addDays(inv.date, num(inv.terms)); form.elements.due.value = inv.due; }
      if (el.name === "month") {
        const b = monthBounds(inv.month);
        inv.periodFrom = b.from; inv.periodTo = b.to;
        form.elements.periodFrom.value = b.from; form.elements.periodTo.value = b.to;
      }
      if (el.name === "mode") syncType();
    } else if (el.dataset.k) {
      inv.items[+el.closest(".item-row").dataset.i][el.dataset.k] = el.value;
    }
    render();
  });
  form.addEventListener("change", (e) => { if (e.target.name === "mode" || e.target.name === "status") { syncType(); render(); } });

  document.querySelectorAll(".inv-tab").forEach((b) => b.addEventListener("click", () => {
    if (inv.type === b.dataset.kind) return;
    inv.type = b.dataset.kind;
    if (inv.type === "project" && !inv.items.length) inv.items.push({ desc: "", qty: 1, rate: "" });
    fillForm(); render();
  }));

  $("addItem").addEventListener("click", () => {
    inv.items.push({ desc: "", qty: 1, rate: "" }); renderItems(); render();
    itemsEl.lastElementChild.querySelector("input").focus();
  });
  itemsEl.addEventListener("click", (e) => {
    if (!e.target.classList.contains("del")) return;
    inv.items.splice(+e.target.closest(".item-row").dataset.i, 1); renderItems(); render();
  });

  $("clientPick").addEventListener("change", (e) => {
    const list = JSON.parse(e.target.dataset.list || "[]");
    const c = list[+e.target.value];
    inv.client = c ? { ...c } : { name: "", company: "", email: "", address: "" };
    form.querySelectorAll('[name^="client."]').forEach((el) => (el.value = get(inv, el.name) || ""));
    render();
  });

  $("saveBtn").addEventListener("click", () => save());
  $("newBtn").addEventListener("click", () => open(blank(inv.type)));
  $("printBtn").addEventListener("click", () => {
    if (!inv.client.name) { toast("Add the client name first.", true); form.elements["client.name"].focus(); return; }
    if (save(true)) window.print();
  });
  $("nextMonthBtn").addEventListener("click", () => {
    save(true);
    const p = period(inv);
    open(duplicate(inv, { month: nextMonth(inv.month), periodFrom: shiftMonth(p.from), periodTo: shiftMonth(p.to), date: isoDate(new Date()) }));
    toast(`Created ${inv.number} for ${periodLabel(inv)} — check the hours/fee, then save.`);
  });

  $("history").addEventListener("click", (e) => {
    const act = e.target.dataset.act; if (!act) return;
    const id = e.target.closest(".hist-row").dataset.id;
    const h = history();
    const x = h.find((v) => v.id === id); if (!x) return;
    if (act === "open") open(JSON.parse(JSON.stringify(x)));
    if (act === "copy") { open(duplicate(x)); toast(`Copied into new invoice ${inv.number}`); }
    if (act === "del" && confirm(`Delete invoice ${x.number}? This can't be undone.`)) {
      store(KEY_HISTORY, h.filter((v) => v.id !== id)); renderHistory(); syncClientPick();
    }
  });

  $("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ invoices: history(), studio: load(KEY_STUDIO, null) }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `looma-invoices-${isoDate(new Date())}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $("importFile").addEventListener("change", async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const incoming = Array.isArray(data) ? data : data.invoices || [];
      const h = history();
      incoming.forEach((x) => { if (x && x.id && !h.some((v) => v.id === x.id)) h.push(x); });
      store(KEY_HISTORY, h);
      if (data.studio) store(KEY_STUDIO, data.studio);
      renderHistory(); syncClientPick(); toast(`Restored ${incoming.length} invoice(s).`);
    } catch { toast("That file isn't a valid backup.", true); }
    e.target.value = "";
  });

  // ---------- start ----------
  const params = new URLSearchParams(location.search);
  const saved = history().find((x) => x.id === params.get("open"));
  open(saved ? JSON.parse(JSON.stringify(saved)) : blank(params.get("type") === "monthly" ? "monthly" : "project"));
  renderHistory();

  $("lockBtn").addEventListener("click", () => {
    try { localStorage.removeItem(LOCK.key); sessionStorage.removeItem(LOCK.key); } catch {}
    location.reload();
  });
}
