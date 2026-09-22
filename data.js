// ============================================================
//  EDIT THIS FILE to update the site. No build step needed.
//  Dates use YYYY-MM-DD format.
// ============================================================

window.SITE = {
  username: "DeviateFromThePlan",
  realName: "Edward",
  team: "Waze Australia",
  level: 3,
  joined: "2023-06-25",

  // Short bio shown under the header. Each string is a paragraph.
  bio: [
    "I’m Edward, a Level 3 Waze map editor with Waze Australia. I started editing in June 2023 and have made over 75,000 edits since.",
    "I’m Area Manager for Southern Queensland, and through map raids I’ve also taken on Eastern Papua New Guinea and Western Ethiopia. When I’m not editing I write userscripts that make WME editing quicker.",
  ],

  // Stats snapshot (update whenever you like)
  statsAsOf: "2026-09-22",
  stats: {
    points: 234862,
    edits: 76582,
    forumPosts: 100,
  },

  // Areas you manage
  areas: [
    { name: "Southern Queensland", country: "Australia", flag: "🇦🇺", since: "2025-02-07" },
    { name: "Eastern Papua New Guinea", country: "Papua New Guinea", flag: "🇵🇬", since: "2025-03-17" },
    { name: "Western Ethiopia", country: "Ethiopia", flag: "🇪🇹", since: "2025-03-17" },
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
