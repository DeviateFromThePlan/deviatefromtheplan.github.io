// ==UserScript==
// @name         WME Site Stats Sync
// @namespace    https://github.com/DeviateFromThePlan
// @version      1.1.0
// @description  Pushes your WME edit count to stats.json in your GitHub Pages repo, so your site stays up to date.
// @author       DeviateFromThePlan
// @match        https://www.waze.com/editor*
// @match        https://www.waze.com/*/editor*
// @match        https://beta.waze.com/editor*
// @match        https://beta.waze.com/*/editor*
// @exclude      https://www.waze.com/user/editor*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      api.github.com
// ==/UserScript==

/* global getWmeSdk, SDK_INITIALIZED */
(function () {
  'use strict';

  const REPO = 'DeviateFromThePlan/deviatefromtheplan.github.io';
  const FILE = 'stats.json';
  const MIN_HOURS_BETWEEN_PUSHES = 3;
  const TAG = '[Site Stats Sync]';

  GM_registerMenuCommand('Set GitHub token', () => {
    const t = prompt('Fine-grained GitHub token with Contents: read & write on ' + REPO + ' only.\nLeave blank to clear.', '');
    if (t === null) return;
    GM_setValue('token', t.trim());
    alert(t.trim() ? 'Token saved.' : 'Token cleared.');
  });
  GM_registerMenuCommand('Push stats now', () => sync(true));

  let sdk;
  const w = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  w.SDK_INITIALIZED.then(() => {
    sdk = w.getWmeSdk({ scriptId: 'dftp-site-stats-sync', scriptName: 'WME Site Stats Sync' });
    sdk.Events.once({ eventName: 'wme-ready' }).then(() => {
      sync(false);
      // Re-check after saves so a long session still updates.
      sdk.Events.on({ eventName: 'wme-save-finished', eventHandler: () => setTimeout(() => sync(false), 5000) });
    });
  });

  function gh(method, path, body) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method,
        url: 'https://api.github.com' + path,
        headers: {
          Authorization: 'Bearer ' + GM_getValue('token', ''),
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        data: body ? JSON.stringify(body) : undefined,
        onload: (r) => resolve({ status: r.status, json: r.responseText ? JSON.parse(r.responseText) : null }),
        onerror: reject,
      });
    });
  }

  const b64 = (s) => btoa(unescape(encodeURIComponent(s)));

  async function sync(force) {
    if (!GM_getValue('token', '')) {
      console.info(TAG, 'No GitHub token set. Use the Tampermonkey menu → "Set GitHub token".');
      return;
    }
    const last = GM_getValue('lastPush', 0);
    if (!force && Date.now() - last < MIN_HOURS_BETWEEN_PUSHES * 3600e3) return;

    const userName = sdk.State.getUserInfo()?.userName;
    if (!userName) return;
    const profile = await sdk.DataModel.Users.getUserProfile({ userName });
    if (!GM_getValue('loggedKeys')) {
      console.info(TAG, 'Profile fields available:', Object.keys(profile));
      GM_setValue('loggedKeys', true);
    }

    // dailyEditCount covers the last 90 days, oldest first, ending today.
    const daily = (profile.dailyEditCount || []).slice(-90);
    const stats = {
      edits: profile.totalEditCount ?? profile.editCount,
      points: profile.totalPoints ?? profile.points ?? null,
      rank: profile.rank != null ? profile.rank + 1 : null,
      editsLast30Days: daily.slice(-30).reduce((a, b) => a + b, 0),
      dailyEdits: daily,
      updated: new Date().toISOString(),
    };
    if (typeof stats.edits !== 'number') {
      console.warn(TAG, 'Could not read edit count from profile', profile);
      return;
    }

    const path = `/repos/${REPO}/contents/${FILE}`;
    const cur = await gh('GET', path);
    const sha = cur.status === 200 ? cur.json.sha : undefined;
    if (!force && cur.status === 200) {
      try {
        const prev = JSON.parse(decodeURIComponent(escape(atob(cur.json.content.replace(/\n/g, '')))));
        if (prev.edits === stats.edits && prev.points === stats.points && prev.updated?.slice(0, 10) === stats.updated.slice(0, 10)) {
          GM_setValue('lastPush', Date.now());
          return;
        }
      } catch (e) { /* fall through and overwrite */ }
    }

    const res = await gh('PUT', path, {
      message: `Update stats: ${stats.edits.toLocaleString('en-AU')} edits`,
      content: b64(JSON.stringify(stats, null, 2) + '\n'),
      sha,
    });
    if (res.status === 200 || res.status === 201) {
      GM_setValue('lastPush', Date.now());
      console.info(TAG, 'Pushed', stats);
    } else {
      console.warn(TAG, 'GitHub push failed', res.status, res.json);
    }
  }
})();
