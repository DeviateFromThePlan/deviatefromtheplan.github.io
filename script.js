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

  // Bio, with {level} and {edits} filled from the current stats.
  // Edits round down to a clean "over" figure: to 5,000 from 10,000 up, 1,000 from 1,000 up, else 100.
  function renderBio(level, edits) {
    const step = edits >= 10000 ? 5000 : edits >= 1000 ? 1000 : 100;
    const rounded = (Math.floor(edits / step) * step).toLocaleString("en-AU");
    $("bio").innerHTML = S.bio.map((p) => `<p>${esc(p.replace(/{level}/g, level).replace(/{edits}/g, rounded))}</p>`).join("");
    document.querySelectorAll('[data-bind="level"]').forEach((el) => { el.textContent = level; });
  }
  renderBio(S.level, S.stats.edits);

  // Stats. Live values from the gist (see below) override data.js.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function renderStats(edits, points, posts, asOf, live) {
    const days = Math.max(1, (asOf - parse(S.joined)) / 86400000);
    const stats = [
      { label: "Edits", value: edits },
      { label: "Points", value: points },
      { label: "Forum posts", value: posts },
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

  // Daily edits bar chart (last entry = the day the stats were pushed).
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

  // Live stats live in a public gist written by tools/wme-site-stats-sync.user.js.
  // Find it by file name in the user's public gists; its raw_url points at the latest revision.
  const STATS_FILE = "waze-site-stats.json";
  fetch(`https://api.github.com/users/${encodeURIComponent(S.githubUser)}/gists?per_page=100`)
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((gists) => {
      const f = gists.map((g) => g.files[STATS_FILE]).find(Boolean);
      return f ? fetch(f.raw_url).then((r) => (r.ok ? r.json() : Promise.reject())) : Promise.reject();
    })
    .then((j) => {
      if (typeof j.edits !== "number") throw 0;
      const num = (v, fallback) => (typeof v === "number" ? v : fallback);
      renderStats(j.edits, num(j.points, S.stats.points), num(j.forumPosts, S.stats.forumPosts), new Date(j.updated), true);
      renderBio(num(j.rank, S.level), j.edits);
      if (Array.isArray(j.dailyEdits) && j.dailyEdits.length) renderActivity(j.dailyEdits, new Date(j.updated));
    })
    .catch(() => renderStats(S.stats.edits, S.stats.points, S.stats.forumPosts, parse(S.statsAsOf), false));

  // Areas: flag, then a mini map of the region with the managed area highlighted.
  const KM_PER_DEG_LAT = 110.57;
  function ringsBounds(rings) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    rings.forEach((r) => r.forEach(([x, y]) => {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }));
    return { minX, minY, maxX, maxY };
  }
  // Approximate area in km², using a local equirectangular projection per ring.
  function ringsAreaKm2(rings) {
    return rings.reduce((sum, r) => {
      const k = Math.cos((r.reduce((a, p) => a + p[1], 0) / r.length) * Math.PI / 180) * 111.32;
      let s = 0;
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] * k) * (r[i][1] * KM_PER_DEG_LAT) - (r[i][0] * k) * (r[j][1] * KM_PER_DEG_LAT);
      return sum + Math.abs(s) / 2;
    }, 0);
  }
  // Even-odd point-in-polygon across all rings.
  function inRings([x, y], rings) {
    let inside = false;
    for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function areaMap(a) {
    const region = (window.GEO || {})[a.region];
    if (!region) return "";
    const b = ringsBounds(region);
    const kx = Math.cos(((b.minY + b.maxY) / 2) * Math.PI / 180);
    const W = 300, pad = 8;
    const sx = (W - pad * 2) / ((b.maxX - b.minX) * kx);
    const H = Math.round((b.maxY - b.minY) * sx + pad * 2);
    const path = (rings) => rings.map((r) => "M" + r.map(([x, y]) =>
      `${((x - b.minX) * kx * sx + pad).toFixed(1)},${((b.maxY - y) * sx + pad).toFixed(1)}`).join("L") + "Z").join("");
    const mine = a.polygon && a.polygon.length ? a.polygon : null;
    const clipId = `clip-${esc(a.region)}`;
    let stat = "";
    if (mine) {
      // AM areas include ocean, so measure only the land share: sample a grid over the area.
      const mb = ringsBounds(mine), N = 160;
      let inMine = 0, inBoth = 0;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const pt = [mb.minX + (i + 0.5) * (mb.maxX - mb.minX) / N, mb.minY + (j + 0.5) * (mb.maxY - mb.minY) / N];
        if (inRings(pt, mine)) { inMine++; if (inRings(pt, region)) inBoth++; }
      }
      const km = ringsAreaKm2(mine) * (inMine ? inBoth / inMine : 0), total = ringsAreaKm2(region);
      stat = `<div class="area-stat"><div class="area-km">${(Math.round(km / 100) * 100).toLocaleString("en-AU")} km²</div><div class="muted small">of land · ${(km / total * 100).toFixed(0)}% of ${esc(a.regionName)}</div></div>`;
    }
    return `<div class="area-map-wrap"><svg class="area-map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of ${esc(a.regionName)}${mine ? ` with ${esc(a.name)} highlighted` : ""}">
        <defs><clipPath id="${clipId}"><path d="${path(region)}"/></clipPath></defs>
        <path class="region" d="${path(region)}"/>
        ${mine ? `<path class="mine" clip-path="url(#${clipId})" d="${path(mine)}"/><path class="mine-outline" d="${path(mine)}"/>` : ""}
      </svg></div>${stat}`;
  }
  $("areas-list").innerHTML = S.areas.map((a) => `
    <div class="area">
      <div class="area-head">
        <span class="flag-slot"><img class="flag" src="${esc(a.flag)}" alt="${esc(a.country)} flag"></span>
        <div>
          <div class="area-name">${esc(a.name)}</div>
          <div class="muted small">Since ${fmt(a.since, { month: "short", year: "numeric" })}</div>
        </div>
      </div>
      ${areaMap(a)}
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
