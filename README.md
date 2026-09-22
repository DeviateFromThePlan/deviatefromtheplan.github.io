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

## Live edit count

Waze only returns profile data to signed-in users, so the count is pushed from WME rather than pulled.

1. Install `tools/wme-site-stats-sync.user.js` in Tampermonkey.
2. Create a fine-grained GitHub token: **Only select repositories** → `deviatefromtheplan.github.io`, permission **Contents: Read and write**. Nothing else.
3. In WME, open the Tampermonkey menu → **Set GitHub token**, and paste it.

From then on, opening WME (and saving edits) updates `stats.json` in the repo, at most every 3 hours. Use **Push stats now** in the menu to force an update. Until the first push, the site falls back to the numbers in `data.js`.
