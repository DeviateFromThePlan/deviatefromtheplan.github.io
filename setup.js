(function () {
  const scripts = window.SETUP_SCRIPTS || [];
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const abs = (u) => new URL(u, location.href).href;

  // Progress is a per-browser convenience only; the page works without it.
  const KEY = "setup-installed";
  const load = () => { try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch (e) { return new Set(); } };
  const save = (set) => { try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch (e) { /* storage unavailable */ } };
  let done = load();

  function render() {
    $("script-list").innerHTML = scripts.map((s) => `
      <li class="script-row${done.has(s.name) ? " done" : ""}">
        <span class="tick" aria-hidden="true">${done.has(s.name) ? "✓" : ""}</span>
        <div class="script-info"><strong>${esc(s.name)}</strong><span class="muted small">${esc(s.desc)}</span></div>
        <a class="btn btn-ghost btn-sm" href="${esc(abs(s.url))}" target="_blank" rel="noopener" data-name="${esc(s.name)}">${done.has(s.name) ? "Reinstall" : "Install"}</a>
      </li>`).join("");
    const n = scripts.filter((s) => done.has(s.name)).length;
    $("progress-bar").style.width = `${(n / scripts.length) * 100}%`;
    $("progress-text").textContent = `${n} of ${scripts.length} installed`;
    const next = scripts.find((s) => !done.has(s.name));
    $("install-next").textContent = next ? `Install next: ${next.name}` : "All scripts installed";
    $("install-next").disabled = !next;
  }

  function markInstalled(name) { done.add(name); save(done); render(); }

  $("script-list").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-name]");
    if (a) setTimeout(() => markInstalled(a.dataset.name), 300);
  });
  $("install-next").addEventListener("click", () => {
    const next = scripts.find((s) => !done.has(s.name));
    if (!next) return;
    window.open(abs(next.url), "_blank", "noopener");
    markInstalled(next.name);
  });
  $("reset-progress").addEventListener("click", () => { done = new Set(); save(done); render(); });

  $("bundle-url").textContent = abs("assets/tampermonkey-scripts.zip");
  document.querySelectorAll("[data-copy], [data-copy-from]").forEach((b) => b.addEventListener("click", async () => {
    const text = b.dataset.copy || $(b.dataset.copyFrom).textContent;
    try { await navigator.clipboard.writeText(text); b.textContent = "Copied"; } catch (e) { b.textContent = "Copy failed"; }
    setTimeout(() => { b.textContent = "Copy"; }, 1500);
  }));

  render();
})();
