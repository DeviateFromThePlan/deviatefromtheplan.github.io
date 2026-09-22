// ==UserScript==
// @name         WME Site Stats Sync
// @namespace    https://github.com/DeviateFromThePlan
// @version      2.0.0
// @description  Saves your WME stats (edits, points, forum posts, daily edits) to a public GitHub Gist that your site reads.
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

  // The site finds the gist by this file name, so keep it in sync with script.js.
  const FILE = 'waze-site-stats.json';
  const MIN_HOURS_BETWEEN_PUSHES = 3;
  const TAG = '[Site Stats Sync]';

  GM_registerMenuCommand('Set GitHub token', () => {
    const t = prompt('Fine-grained GitHub token with only the account permission "Gists: Read and write".\nLeave blank to clear.', '');
    if (t === null) return;
    GM_setValue('token', t.trim());
    alert(t.trim() ? 'Token saved.' : 'Token cleared.');
  });
  GM_registerMenuCommand('Push stats now', () => sync(true));
  GM_registerMenuCommand('Show gist link', () => {
    const id = GM_getValue('gistId', '');
    alert(id ? 'https://gist.github.com/' + id : 'No gist yet. It is created on the first push.');
  });

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
        onload: (r) => {
          let json = null;
          try { json = r.responseText ? JSON.parse(r.responseText) : null; } catch (e) { /* non-JSON error page */ }
          resolve({ status: r.status, json });
        },
        onerror: reject,
      });
    });
  }

  // Same request the editor profile page makes: ask the default server, then re-ask the
  // server you last edited on (row / il) so the numbers match your profile page.
  async function getFullProfile(userName) {
    const hostFor = (env) => ({ eu: 'row', world: 'row', row: 'row', israel: 'il', il: 'il' }[(env || '').toLowerCase()]);
    const get = (prefix) => fetch(`/${prefix}Descartes/app/UserProfile/Profile?username=${encodeURIComponent(userName)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)));
    try {
      let p = await get('');
      const host = hostFor(p.lastEditEnv);
      if (host) p = await get(`${host}-`);
      return p;
    } catch (e) {
      console.warn(TAG, 'Could not read full profile, falling back to SDK', e);
      return null;
    }
  }

  // Public forum directory (same origin as WME, so no CORS issue here).
  async function getForumPosts(userName) {
    try {
      const r = await fetch(`/discuss/directory_items.json?period=all&order=post_count&name=${encodeURIComponent(userName)}`,
        { headers: { Accept: 'application/json' } });
      const j = await r.json();
      const me = j.directory_items.find((i) => i.user.username.toLowerCase() === userName.toLowerCase());
      return me ? me.post_count : null;
    } catch (e) {
      console.warn(TAG, 'Could not read forum post count', e);
      return null;
    }
  }

  async function sync(force) {
    if (!GM_getValue('token', '')) {
      console.info(TAG, 'No GitHub token set. Use the Tampermonkey menu → "Set GitHub token".');
      return;
    }
    const last = GM_getValue('lastPush', 0);
    if (!force && Date.now() - last < MIN_HOURS_BETWEEN_PUSHES * 3600e3) return;

    const userName = sdk.State.getUserInfo()?.userName;
    if (!userName) return;
    // Official SDK profile: total edits + last 90 days of daily edits.
    const profile = await sdk.DataModel.Users.getUserProfile({ userName });
    // Full editor profile (what your profile page loads): adds points and forum posts.
    const full = await getFullProfile(userName);

    // dailyEditCount covers the last 90 days, oldest first, ending today.
    const daily = (profile.dailyEditCount || []).slice(-90);
    const stats = {
      edits: full?.edits ?? profile.totalEditCount ?? profile.editCount,
      points: full?.points ?? null,
      rank: profile.rank != null ? profile.rank + 1 : null,
      forumPosts: full?.forumPosts ?? await getForumPosts(userName),
      editsLast30Days: daily.slice(-30).reduce((a, b) => a + b, 0),
      dailyEdits: daily,
      updated: new Date().toISOString(),
    };
    if (typeof stats.edits !== 'number') {
      console.warn(TAG, 'Could not read edit count from profile', profile);
      return;
    }

    const content = JSON.stringify(stats, null, 2) + '\n';
    let gistId = GM_getValue('gistId', '');

    if (gistId) {
      const cur = await gh('GET', `/gists/${gistId}`);
      if (cur.status === 404) {
        gistId = ''; // deleted on GitHub; a new one is created below
      } else if (!force && cur.status === 200) {
        try {
          const prev = JSON.parse(cur.json.files[FILE].content);
          if (prev.edits === stats.edits && prev.points === stats.points && prev.forumPosts === stats.forumPosts
              && prev.updated?.slice(0, 10) === stats.updated.slice(0, 10)) {
            GM_setValue('lastPush', Date.now());
            return;
          }
        } catch (e) { /* fall through and overwrite */ }
      }
    }

    const res = gistId
      ? await gh('PATCH', `/gists/${gistId}`, { files: { [FILE]: { content } } })
      : await gh('POST', '/gists', { description: 'Waze editing stats for my site', public: true, files: { [FILE]: { content } } });
    if (res.status === 200 || res.status === 201) {
      if (!gistId) {
        GM_setValue('gistId', res.json.id);
        console.info(TAG, 'Created gist', res.json.html_url);
      }
      GM_setValue('lastPush', Date.now());
      console.info(TAG, 'Pushed', stats);
    } else {
      console.warn(TAG, 'GitHub push failed', res.status, res.json);
    }
  }
})();
