// ============================================================
//  EDIT THIS FILE to update the site. No build step needed.
//  Dates use YYYY-MM-DD format.
// ============================================================

window.SITE = {
  username: "DeviateFromThePlan",
  realName: "Edward",
  githubUser: "DeviateFromThePlan", // live stats are read from this account's public gists
  team: "Waze Australia",
  level: 3,
  joined: "2023-06-25",

  // Short bio shown under the header. Each string is a paragraph.
  // {level} and {edits} are filled in from your live stats ({edits} reads like "75,000").
  bio: [
    "I’m Edward, a Level {level} Waze map editor with Waze Australia. I started editing in June 2023 and have made over {edits} edits since.",
    "I’m Area Manager for Southern Queensland, and through map raids I’ve also taken on Eastern Papua New Guinea and Western Ethiopia. When I’m not editing I write userscripts that make WME editing quicker.",
  ],

  // Fallback stats, shown until the WME userscript has pushed live stats to a gist
  statsAsOf: "2026-09-22",
  stats: {
    points: 234862,
    edits: 76582,
    forumPosts: 100,
  },

  // Areas you manage
  areas: [
    // region: key in assets/geo.js. polygon: your managed area as [[lon, lat], ...] rings (null until added).
    { name: "Southern Queensland", country: "Australia", flag: "assets/flags/au.svg", since: "2025-02-07", region: "qld", regionName: "Queensland", polygon: [[[140.984,-25.979],[152.2694,-26.0195],[152.3066,-28.3838],[152.221,-28.4548],[152.1575,-28.4416],[152.0153,-28.5307],[151.9728,-28.5337],[152.0378,-28.6602],[152.0873,-28.6945],[152.0536,-28.749],[152.0419,-28.8818],[152.0123,-28.9129],[151.9196,-28.9309],[151.8491,-28.9139],[151.842,-28.9665],[151.7691,-28.968],[151.7183,-28.8889],[151.5483,-28.9737],[151.5042,-29.0893],[151.4019,-29.1779],[151.3239,-29.1806],[151.2632,-29.0986],[151.2572,-28.9419],[151.0508,-28.8546],[150.9512,-28.7394],[150.7532,-28.6419],[150.6293,-28.6815],[150.4195,-28.67],[150.287,-28.5461],[150.1886,-28.5995],[149.6684,-28.6437],[149.5307,-28.5926],[148.999,-29.0081],[140.9922,-29.0051],[140.984,-25.979]]] },
    { name: "Eastern Papua New Guinea", country: "Papua New Guinea", flag: "assets/flags/pg.svg", since: "2025-03-17", region: "png", regionName: "Papua New Guinea", polygon: [[[145.7227,-8.081],[147.2827,-7.3407],[149.3152,-8.9502],[150.2271,-9.1129],[151.2378,-9.6007],[151.4905,-10.1852],[151.2488,-10.6606],[150.3699,-10.8009],[149.2932,-10.4446],[147.7991,-10.2392],[147.03,-9.6224],[145.7227,-8.081]]] },
    { name: "Western Ethiopia", country: "Ethiopia", flag: "assets/flags/et.svg", since: "2025-03-17", region: "eth", regionName: "Ethiopia", polygon: [[[34.0559,7.406],[33.1441,7.9395],[33.2869,8.4506],[34.0889,8.5266],[34.1878,9.6007],[37.7583,9.6982],[37.8711,5.9285],[35.0696,5.8411],[35.0037,6.4855],[34.0559,7.406]]] },
  ],

  links: [
    { label: "Waze editor profile", url: "https://www.waze.com/user/editor/DeviateFromThePlan" },
    { label: "Waze forum profile", url: "https://www.waze.com/discuss/u/DeviateFromThePlan" },
    { label: "GitHub", url: "https://github.com/DeviateFromThePlan" },
    { label: "Discord: @edwardj00" },
  ],

  // WME userscripts
  scripts: [
    {
      name: "WME Send to AU GovMap",
      url: "https://github.com/DeviateFromThePlan/WME-Send-to-AU-GovMap",
      description: "Opens your state government’s map at the coordinates currently shown in WME.",
    },
    {
      name: "WME Mouse Coordinate Grabber",
      url: "https://github.com/DeviateFromThePlan/WME-Mouse-Coordinate-Grabber",
      description: "Press Ctrl+. to grab the mouse coordinates in WME without extra clicks.",
    },
    {
      name: "WME Birthdays for Discuss",
      url: "https://github.com/DeviateFromThePlan/WME-Birthdays-Discuss",
      description: "My fork of WME Birthdays, adapted for the Waze Discuss forum.",
      fork: true,
    },
  ],

  // The Wazeume. type: "promotion" | "edits" | "raid" | "community" | "other"
  // Use `end` for multi-day events. Set `major: true` to highlight a milestone.
  timeline: [
    { date: "2023-06-25", type: "other",     major: true, title: "Joined Waze" },
    { date: "2023-08-14", type: "community", title: "First forum post" },
    { date: "2023-08-27", type: "community", title: "Joined the Australian Discord" },
    { date: "2023-11-19", type: "community", title: "Joined the Global Discord" },
    { date: "2023-12-20", type: "community", title: "Joined the Scripts Discord" },
    { date: "2024-01-01", type: "promotion", major: true, title: "Promoted to Level 2" },
    { date: "2024-01-05", type: "other",     title: "Granted a 1 km² area in Moorebank (Sydney)", detail: "To help with house numbers." },
    { date: "2024-03-30", type: "edits",     major: true, title: "10,000 edits" },
    { date: "2025-02-01", end: "2025-02-07", type: "raid", title: "Help Centre Raid", detail: "Finished 5th place." },
    { date: "2025-02-02", type: "community", title: "Joined the Papua New Guinea Discord" },
    { date: "2025-02-05", end: "2025-02-28", type: "raid", title: "Papua New Guinea Map Raid", detail: "Mapped eastern PNG, which led to my AM extension there." },
    { date: "2025-02-07", type: "promotion", major: true, title: "Area Manager: Southern Queensland" },
    { date: "2025-02-15", type: "promotion", major: true, title: "Promoted to Level 3" },
    { date: "2025-02-16", end: "2025-03-02", type: "raid", title: "African Map Raid", detail: "Mapped western Ethiopia, which led to my AM extension there." },
    { date: "2025-02-22", type: "edits",     major: true, title: "50,000 edits" },
    { date: "2025-03-17", type: "promotion", major: true, title: "Area Manager extended", detail: "Added Eastern Papua New Guinea and Western Ethiopia." },
  ],

  // Badges shown on the Waze forum. Images live in assets/badges/.
  badges: [
    { name: "Area Manager", img: "assets/badges/area-manager.png", group: "Roles" },
    { name: "Waze Australia", img: "assets/badges/australia.png", group: "Roles" },
    { name: "WME Beta Tester", img: "assets/badges/wme-beta-tester.png", group: "Roles" },
    { name: "App Beta Tester", img: "assets/badges/app-beta-tester.png", group: "Roles" },
    { name: "Script Writer", img: "assets/badges/script-writer.png", group: "Roles" },
    { name: "First Responder", img: "assets/badges/first-responder.png", group: "Roles" },
    { name: "Birthday Team", img: "assets/badges/birthday-team.png", group: "Roles" },
    { name: "PNG Map Raid", img: "assets/badges/map-raider.png", group: "Raids" },
    { name: "Help Center Raid", img: "assets/badges/hc-raider.webp", group: "Raids" },
    { name: "Africa Map Raid", img: "assets/badges/africa-mapraid.webp", group: "Raids" },
    { name: "WME Basic Course", img: "assets/badges/wme-basic.png", group: "Training" },
    { name: "WME Advanced Paths", img: "assets/badges/wme-adv-paths.png", group: "Training" },
    { name: "WME Advanced Junction Boxes", img: "assets/badges/wme-adv-jb.png", group: "Training" },
    { name: "WME Road Closures & Events", img: "assets/badges/wme-closures-events.png", group: "Training" },
    { name: "Level 3", img: "assets/badges/level-3.png", group: "Milestones" },
    { name: "50k Edits", img: "assets/badges/50k-edits.png", group: "Milestones" },
    { name: "100 Posts", img: "assets/badges/100-posts.png", group: "Milestones" },
  ],
};
