(function () {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const parse = (d) => { const [y, m, day] = d.split("-").map(Number); return new Date(y, m - 1, day); };
  const fmt = (d, opts) => parse(d).toLocaleDateString("en-AU", opts || { day: "numeric", month: "long", year: "numeric" });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const days = Math.floor((new Date() - parse(S.joined)) / 86400000);
  const binds = {
    username: S.username,
    realName: S.realName,
    team: S.team,
    level: S.level,
    joinedLong: fmt(S.joined),
    daysEditing: days.toLocaleString("en-AU"),
    statsAsOfLong: fmt(S.statsAsOf),
  };
  document.querySelectorAll("[data-bind]").forEach((el) => { el.textContent = binds[el.dataset.bind]; });

  // Bio
  $("bio").innerHTML = S.bio.map((p) => `<p>${esc(p)}</p>`).join("");

  // Stats. stats.json (pushed from WME by tools/wme-site-stats-sync.user.js) overrides data.js.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function renderStats(edits, points, asOf, live) {
    const days = Math.max(1, (asOf - parse(S.joined)) / 86400000);
    const stats = [
      { label: "Edits", value: edits },
      { label: "Points", value: points },
      { label: "Forum posts", value: S.stats.forumPosts },
      { label: "Edits / day", value: Math.round(edits / days) },
    ];
    $("stats-grid").innerHTML = stats.map((s) =>
      `<div class="stat"><div class="stat-value" data-count="${s.value}">0</div><div class="stat-label">${esc(s.label)}</div></div>`
    ).join("");
    $("stats-note").textContent = live
      ? `Synced from WME ${asOf.toLocaleString("en-AU", { day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })}.`
      : `Stats as of ${asOf.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}.`;

    $("stats-grid").querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      if (reduce) { el.textContent = target.toLocaleString("en-AU"); return; }
      const start = performance.now(), dur = 1200;
      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("en-AU");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // Daily edits bar chart (last entry = the day stats.json was pushed).
  function renderActivity(daily, end) {
    const max = Math.max(1, ...daily);
    const total = daily.reduce((a, b) => a + b, 0);
    const day = (i) => {
      const d = new Date(end);
      d.setDate(d.getDate() - (daily.length - 1 - i));
      return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
    };
    $("activity").innerHTML = `
      <div class="activity-head"><span>Daily edits, last ${daily.length} days</span><span class="muted">${total.toLocaleString("en-AU")} total</span></div>
      <div class="bars" role="img" aria-label="Bar chart of daily edits over the last ${daily.length} days, peaking at ${max.toLocaleString("en-AU")}">
        ${daily.map((v, i) => `<span style="height:${Math.max(v ? 3 : 0, (v / max) * 100)}%" title="${day(i)}: ${v.toLocaleString("en-AU")} edits"></span>`).join("")}
      </div>
      <div class="activity-axis muted"><span>${day(0)}</span><span>${day(daily.length - 1)}</span></div>`;
    $("activity").hidden = false;
  }

  fetch("stats.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((j) => {
      if (typeof j.edits !== "number") throw 0;
      renderStats(j.edits, typeof j.points === "number" ? j.points : S.stats.points, new Date(j.updated), true);
      if (Array.isArray(j.dailyEdits) && j.dailyEdits.length) renderActivity(j.dailyEdits, new Date(j.updated));
    })
    .catch(() => renderStats(S.stats.edits, S.stats.points, parse(S.statsAsOf), false));

  // Areas
  $("areas-list").innerHTML = S.areas.map((a) => `
    <div class="area">
      <span class="flag" aria-hidden="true">${a.flag}</span>
      <div>
        <div class="area-name">${esc(a.name)}</div>
        <div class="muted small">${esc(a.country)} · since ${fmt(a.since, { month: "short", year: "numeric" })}</div>
      </div>
    </div>`).join("");

  // Timeline
  const TYPES = { all: "All", promotion: "Promotions", edits: "Edit milestones", raid: "Map raids", community: "Community", other: "Other" };
  const items = [...S.timeline].sort((a, b) => b.date.localeCompare(a.date));
  const present = new Set(items.map((i) => i.type));
  const keys = Object.keys(TYPES).filter((k) => k === "all" || present.has(k));

  $("filters").innerHTML = keys.map((k) =>
    `<button type="button" data-filter="${k}" aria-pressed="${k === "all"}">${TYPES[k]}</button>`).join("");

  function renderTimeline(filter) {
    let lastYear = null;
    $("timeline").innerHTML = items.filter((i) => filter === "all" || i.type === filter).map((i) => {
      const year = i.date.slice(0, 4);
      const yearHead = year !== lastYear ? `<li class="year">${year}</li>` : "";
      lastYear = year;
      const when = i.end ? `${fmt(i.date, { day: "numeric", month: "short" })} – ${fmt(i.end, { day: "numeric", month: "short", year: "numeric" })}` : fmt(i.date);
      return `${yearHead}<li class="event t-${i.type}${i.major ? " major" : ""}">
        <time datetime="${i.date}">${when}</time>
        <div class="event-title">${esc(i.title)}</div>
        ${i.detail ? `<div class="muted small">${esc(i.detail)}</div>` : ""}
        <span class="tag">${TYPES[i.type] || i.type}</span>
      </li>`;
    }).join("");
  }
  $("filters").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $("filters").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    renderTimeline(b.dataset.filter);
  });
  renderTimeline("all");

  // Scripts
  $("scripts-list").innerHTML = S.scripts.map((s) => `
    <a class="script" href="${esc(s.url)}" target="_blank" rel="noopener">
      <div class="script-name">${esc(s.name)}${s.fork ? ` <span class="fork">fork</span>` : ""}</div>
      <div class="muted small">${esc(s.description)}</div>
    </a>`).join("");

  // Badges
  const groups = {};
  S.badges.forEach((b) => (groups[b.group] = groups[b.group] || []).push(b));
  $("badge-groups").innerHTML = Object.entries(groups).map(([g, list]) => `
    <div class="badge-group">
      <h3>${esc(g)}</h3>
      <ul class="badges">${list.map((b) =>
        `<li class="badge">${b.img ? `<img src="${esc(b.img)}" alt="" loading="lazy">` : ""}<span>${esc(b.name)}</span></li>`).join("")}</ul>
    </div>`).join("");

  // Links
  $("links-list").innerHTML = S.links.map((l) => l.url
    ? `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a></li>`
    : `<li><span>${esc(l.label)}</span></li>`).join("");
})();
