/* =====================================================================
   LOOMA STUDIO — chat assistant ("Looma Bot")
   Greets visitors, answers common questions, and sends their message
   to STUDIO.email through FormSubmit (free, no server needed).
   ===================================================================== */

(function loomaBot() {
  const ENDPOINT = `https://formsubmit.co/ajax/${STUDIO.email}`;
  const KEY = "looma-bot";
  const AVATAR = `<span class="lb-avatar"><span>L</span><img src="${typeof LOGO !== "undefined" ? LOGO : "images/logo.png"}" alt="" onerror="this.remove()"></span>`;

  // Conversation state survives page changes within the same visit
  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || null; } catch { return null; } };
  const state = load() || { log: [], step: "start", lead: {}, teased: false, open: false };
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

  const minPrice = typeof GAMES !== "undefined" && GAMES.length ? Math.min(...GAMES.map(g => g.price)) : 29;
  const TOPICS = {
    buy: "🎮 Buy a ready-made game",
    custom: "🛠️ Custom game",
    reskin: "🎨 Reskin or changes",
    prices: "💰 Prices",
    other: "💬 Something else"
  };

  /* ---------- Markup ---------- */
  document.body.insertAdjacentHTML("beforeend", `
    <div class="lb-teaser" id="lbTeaser" role="status">
      <button class="lb-teaser-x" aria-label="Dismiss">×</button>
      ${AVATAR}
      <div><b>Hi there 👋</b><br>How can I help you today?</div>
    </div>
    <button class="lb-launcher" id="lbLauncher" aria-label="Chat with Looma Studio" aria-expanded="false">
      ${AVATAR}
      <svg class="lb-close-ic" viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/></svg>
      <span class="lb-badge">1</span>
    </button>
    <section class="lb-panel" id="lbPanel" aria-label="Chat with Looma Studio">
      <header class="lb-head">
        ${AVATAR}
        <div><b>Looma Bot</b><small><i></i> Online · replies within 24h</small></div>
        <button class="lb-x" aria-label="Close chat">×</button>
      </header>
      <div class="lb-body" id="lbBody" aria-live="polite"></div>
      <div class="lb-chips" id="lbChips"></div>
      <form class="lb-input" id="lbForm" autocomplete="on">
        <input id="lbText" type="text" placeholder="Type a message…" aria-label="Message" maxlength="2000">
        <button type="submit" aria-label="Send"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M2 21 23 12 2 3v7l15 2-15 2z"/></svg></button>
      </form>
    </section>`);

  const launcher = $("#lbLauncher"), panel = $("#lbPanel"), body = $("#lbBody"), chips = $("#lbChips");
  const form = $("#lbForm"), input = $("#lbText"), teaser = $("#lbTeaser");

  /* ---------- Rendering ---------- */
  const fmt = t => esc(t).replace(/\n/g, "<br>").replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  function bubble(m) {
    body.insertAdjacentHTML("beforeend", m.from === "bot"
      ? `<div class="lb-msg bot">${AVATAR}<p>${fmt(m.text)}</p></div>`
      : `<div class="lb-msg me"><p>${fmt(m.text)}</p></div>`);
    body.scrollTop = body.scrollHeight;
  }
  function setChips(list) {
    state.chips = list; save();
    chips.innerHTML = list.map(c => c.href
      ? `<a class="lb-chip" href="${c.href}">${esc(c.label)}</a>`
      : `<button class="lb-chip" data-v="${esc(c.v)}">${esc(c.label)}</button>`).join("");
  }
  function placeholder(p, type = "text") { input.placeholder = p; input.inputMode = type === "email" ? "email" : "text"; input.autocomplete = type === "email" ? "email" : type === "name" ? "name" : "off"; }

  // Bot "types" before each message
  let queue = Promise.resolve();
  function say(...lines) {
    lines.forEach(text => {
      queue = queue.then(() => new Promise(res => {
        body.insertAdjacentHTML("beforeend", `<div class="lb-msg bot lb-typing">${AVATAR}<p><i></i><i></i><i></i></p></div>`);
        body.scrollTop = body.scrollHeight;
        setTimeout(() => {
          body.querySelector(".lb-typing")?.remove();
          const m = { from: "bot", text }; state.log.push(m); save(); bubble(m); res();
        }, Math.min(1400, 450 + text.length * 12));
      }));
    });
    return queue;
  }
  function me(text) { const m = { from: "me", text }; state.log.push(m); save(); bubble(m); }

  /* ---------- Conversation ---------- */
  const mainChips = () => Object.entries(TOPICS).map(([v, label]) => ({ v, label }));
  const leadChips = [{ v: "lead", label: "✉️ Send a message to Rashmi" }, { v: "menu", label: "↩ Main menu" }];

  function greet() {
    state.step = "menu"; save();
    say("Hi there 👋 I'm Looma Bot, the assistant for Looma Studio.", "How can I help you today?")
      .then(() => setChips(mainChips()));
  }

  function topic(v) {
    state.lead.topic = TOPICS[v] ? TOPICS[v].replace(/^\S+\s/, "") : v;
    save(); setChips([]);
    if (v === "buy") {
      say(`We have 200+ complete games with full source code in Unity, Unreal Engine and Godot, ready to reskin and publish.`,
          `Browse them in the [Game Store](store.html). Want to ask about a specific game or a bundle deal? I can pass your message straight to Rashmi.`)
        .then(() => setChips([{ href: "store.html", label: "🛒 Open the Game Store" }, ...leadChips]));
    } else if (v === "prices") {
      say(`Ready-made games start from ${money(minPrice)}, with full source code included.`,
          `Reskins start around $99 and custom games around $499, depending on what you need. See [Services](services.html) for details.`,
          `Want an exact quote? Tell me about your project and I'll send it to Rashmi.`)
        .then(() => setChips(leadChips));
    } else if (v === "custom" || v === "reskin") {
      say(v === "custom"
        ? "Great! We build custom games from scratch in Unity, Unreal Engine or Godot, from small mobile games to full productions."
        : "Sure! We can change the art, theme, characters and features of any of our games, or one you already own.")
        .then(startLead);
    } else startLead();
  }

  function startLead() {
    state.step = "name"; save(); setChips([]);
    say("I'll send your message straight to Rashmi, our founder. First, what's your name?").then(() => placeholder("Your name", "name"));
  }

  const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

  function route(text) {
    const t = text.toLowerCase();
    if (/(price|cost|how much|budget|cheap|\$)/.test(t)) return "prices";
    if (/(reskin|re-skin|change|modify|customi[sz]e|edit)/.test(t)) return "reskin";
    if (/(custom|my idea|build|develop|make a game|from scratch|hire)/.test(t)) return "custom";
    if (/(buy|store|ready|source code|purchase|template)/.test(t)) return "buy";
    return null;
  }

  function handle(text) {
    const step = state.step;
    if (step === "name") {
      state.lead.name = text.slice(0, 80); state.step = "email"; save();
      say(`Nice to meet you, ${state.lead.name}! What's your email, so Rashmi can reply?`).then(() => placeholder("you@example.com", "email"));
    } else if (step === "email") {
      if (!isEmail(text)) { say("Hmm, that doesn't look like an email address. Could you check it?"); return; }
      state.lead.email = text; save();
      if (state.lead.message) return confirmSend();
      state.step = "message"; save();
      say("Thanks! Now tell me what you need. Share as much detail as you like: your idea, platform, budget, deadline…")
        .then(() => placeholder("Your message"));
    } else if (step === "message") {
      state.lead.message = text; save(); confirmSend();
    } else if (step === "done") {
      state.lead.message = text; state.step = "message"; save(); confirmSend();
    } else {
      const v = route(text);
      if (/^(hi|hey|hello|yo|hii+|good (morning|evening|afternoon))\b/i.test(text.trim()) && !v) {
        say("Hello! 😊 What can I help you with?").then(() => setChips(mainChips()));
      } else if (v) topic(v);
      else {
        state.lead.message = text; state.lead.topic = "General question"; state.step = "name"; save(); setChips([]);
        say("Good question! Let me pass that to Rashmi so you get a proper answer.", "What's your name?").then(() => placeholder("Your name", "name"));
      }
    }
  }

  function confirmSend() {
    state.step = "sending"; save(); placeholder("Sending…"); setChips([]);
    say("Sending your message now…").then(send);
  }

  async function send() {
    const L = state.lead;
    const cart = typeof Cart !== "undefined" ? Cart.games().map(g => `${g.title} (${money(g.price)})`).join(", ") : "";
    const transcript = state.log.map(m => `${m.from === "bot" ? "Bot" : "Visitor"}: ${m.text}`).join("\n");
    const payload = {
      _subject: `New chat message from ${L.name} (${L.topic || "Website chat"})`,
      _template: "table", _captcha: "false", _replyto: L.email, _honey: "",
      Name: L.name, Email: L.email, Topic: L.topic || "-", Message: L.message,
      "Cart": cart || "empty", "Page": location.href, "Full chat": transcript
    };
    try {
      const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) !== "true") throw new Error(data.message || res.status);
      state.step = "done"; state.lead.message = ""; save(); placeholder("Type a message…");
      say(`Done ✅ Rashmi has your message and will reply to ${L.email}, usually within 24 hours.`, "Anything else I can help with?")
        .then(() => setChips([{ v: "menu", label: "↩ Main menu" }, { href: "store.html", label: "🛒 Browse games" }]));
    } catch (err) {
      state.step = "done"; save(); placeholder("Type a message…");
      const mail = `mailto:${STUDIO.email}?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(`Name: ${L.name}\nEmail: ${L.email}\nTopic: ${L.topic || "-"}\n\n${L.message}`)}`;
      say("Sorry, I couldn't send that right now. You can send it by email instead, it's already written for you:")
        .then(() => setChips([{ href: mail, label: "✉️ Send by email" }, { v: "menu", label: "↩ Main menu" }]));
    }
  }

  /* ---------- Events ---------- */
  function open() {
    state.open = true; state.teased = true; save();
    panel.classList.add("open"); launcher.classList.add("open"); launcher.setAttribute("aria-expanded", "true");
    teaser.classList.remove("show"); launcher.querySelector(".lb-badge")?.remove();
    if (!state.log.length) greet();
    setTimeout(() => window.matchMedia("(pointer: fine)").matches && input.focus(), 350);
  }
  function close() {
    state.open = false; save();
    panel.classList.remove("open"); launcher.classList.remove("open"); launcher.setAttribute("aria-expanded", "false");
  }
  launcher.addEventListener("click", () => panel.classList.contains("open") ? close() : open());
  $(".lb-x", panel).addEventListener("click", close);
  teaser.addEventListener("click", e => { if (e.target.closest(".lb-teaser-x")) { teaser.classList.remove("show"); state.teased = true; save(); } else open(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && panel.classList.contains("open")) close(); });

  chips.addEventListener("click", e => {
    const b = e.target.closest("button.lb-chip"); if (!b) return;
    const v = b.dataset.v; me(b.textContent); setChips([]);
    if (v === "menu") { state.step = "menu"; save(); say("Sure, what else can I help with?").then(() => setChips(mainChips())); }
    else if (v === "lead") startLead();
    else topic(v);
  });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim(); if (!text || state.step === "sending") return;
    input.value = ""; me(text); handle(text);
  });

  /* ---------- Restore or greet ---------- */
  state.log.forEach(bubble);
  if (state.chips) setChips(state.chips);
  if (state.step === "email") placeholder("you@example.com", "email");
  else if (state.step === "name") placeholder("Your name", "name");
  else if (state.step === "message") placeholder("Your message");
  else if (state.step === "sending") { state.step = "message"; save(); confirmSend(); }
  if (state.open) open();
  else if (!state.teased) setTimeout(() => { if (!panel.classList.contains("open")) { teaser.classList.add("show"); state.teased = true; save(); } }, 3500);
  else launcher.querySelector(".lb-badge")?.remove();
})();
