# DeviateFromThePlan · Waze Map Editor

A small static site about my Waze map editing: stats, areas I manage, my Wazeume timeline, and badges.

## Updating

Everything lives in `data.js`. Add a milestone to `timeline`, bump `stats` and `statsAsOf`, and push.

Badges can take an image: add `img: "assets/badges/50k.png"` to any badge entry.

## Publishing on GitHub Pages

This goes in the `deviatefromtheplan.github.io` repo, so it is served at https://deviatefromtheplan.github.io/.

1. Upload the contents of this folder (not the folder itself) to the root of that repo.
2. Repo **Settings → Pages → Build and deployment**: Source "Deploy from a branch", branch `main`, folder `/ (root)`.

No build step, no dependencies.

## Live stats

Waze only returns profile data to signed-in users, so stats are pushed from WME rather than pulled. The userscript saves them to a public GitHub Gist (`waze-site-stats.json`), and the site finds it in the public gists of `githubUser` (set in `data.js`). No commits to this repo, no Pages rebuilds.

1. Install `tools/wme-site-stats-sync.user.js` in Tampermonkey.
2. Create a fine-grained GitHub token: under **Account permissions**, set **Gists** to **Read and write**. Nothing else; no repository access needed.
3. In WME, open the Tampermonkey menu → **Set GitHub token**, paste it, then **Push stats now**. The first push creates the gist (**Show gist link** opens it).

After that, opening WME and saving edits updates the gist (at most every 3 hours, and only when something changed). GitHub caches the gist for up to 5 minutes. Until the first push, the site shows the fallback numbers in `data.js`.

## Restore my setup (`setup.html`)

A step-by-step page for setting up WME on a new computer: extensions, every userscript (install links are each script's own update URL, so they're always the latest), settings restore, and reconnecting stats.

- The script list is in `setup-data.js`. Regenerate it from a Tampermonkey export when scripts change.
- Settings are restored with [Easy Storage Manager](https://greasyfork.org/en/scripts/466806-easy-storage-manager) (Google Drive or a file). Keep exported files private; never put them in this repo.
- `assets/tampermonkey-scripts.zip` is the one-step "Import from URL" bundle. Rebuild it after a fresh Tampermonkey export with `.\tools\build-scripts-bundle.ps1 -Backup <export.zip>`. It strips all script storage (e.g. tokens) before publishing.
