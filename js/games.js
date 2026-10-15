/* =====================================================================
   LOOMA STUDIO — GAME CATALOG
   ---------------------------------------------------------------------
   Every pre-made game in the store comes from this list.
   To add a project, copy one block { ... }, paste it at the end,
   and change the values. Keep the commas between blocks.

   Fields:
     id          unique short name, no spaces (used in links)
     title       game name
     engine      "Unity" | "Unreal" | "Godot"
     genre       e.g. "Casual", "Puzzle", "Shooter", "Racing" ...
     platforms   list: "Android", "iOS", "PC", "WebGL", "Console"
     price       price in USD (number)
     oldPrice    optional, shows a crossed-out price (number or null)
     version     engine version the project was made with
     short       one-line summary shown on the card
     description longer text shown in the product window
     features    list of bullet points
     includes    what the buyer receives
     image       optional: path to a screenshot, e.g. "images/games/runner.jpg"
                 (leave "" and a styled cover is generated automatically)
     gallery     optional: extra screenshots shown on the game page,
                 e.g. ["images/games/runner-2.jpg", "images/games/runner-3.jpg"]
     video       optional: YouTube link to gameplay
     buyUrl      optional: direct payment link (PayPal, Gumroad, Fiverr...)
     featured    true = show on the home page
     added       date added, "YYYY-MM-DD" (used for "Newest" sorting)

   !!! The entries below are SAMPLE PLACEHOLDERS so you can see the layout.
   !!! Replace them with your real projects before publishing.
   ===================================================================== */

const GAMES = [
  {
    id: "neon-runner",
    title: "Neon Runner",
    engine: "Unity",
    genre: "Endless Runner",
    platforms: ["Android", "iOS", "WebGL"],
    price: 79, oldPrice: 119,
    version: "Unity 2022.3 LTS",
    short: "Fast-paced cyberpunk endless runner with upgrades and daily missions.",
    description: "A complete, ready-to-publish endless runner with procedural track generation, a coin economy, character shop and daily missions. Clean, commented C# code that is easy to reskin.",
    features: ["Procedural level generation", "Character & power-up shop", "Daily missions and rewards", "AdMob + Unity Ads ready", "Easy reskin — swap sprites and models"],
    includes: ["Full Unity project source", "All art & audio assets", "Documentation PDF", "Free setup support"],
    image: "", video: "", buyUrl: "",
    featured: true, added: "2026-08-20"
  },
  {
    id: "block-merge-puzzle",
    title: "Block Merge Puzzle",
    engine: "Unity",
    genre: "Puzzle",
    platforms: ["Android", "iOS"],
    price: 49, oldPrice: null,
    version: "Unity 2021.3 LTS",
    short: "Relaxing number-merge puzzle with 500 levels and hint system.",
    description: "A hyper-casual merge puzzle with a level editor, hint system, and in-app purchases. Built for high retention with a clean, minimal UI.",
    features: ["500 handcrafted levels", "Built-in level editor", "Hints & undo system", "In-app purchase ready"],
    includes: ["Full Unity project source", "Level editor tool", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: true, added: "2026-07-02"
  },
  {
    id: "zombie-siege-fps",
    title: "Zombie Siege FPS",
    engine: "Unreal",
    genre: "Shooter",
    platforms: ["PC"],
    price: 249, oldPrice: 299,
    version: "Unreal Engine 5.3",
    short: "Wave-based zombie survival shooter with weapon upgrades.",
    description: "A first-person wave survival shooter made with Blueprints and C++. Includes an AI horde system, weapon upgrade bench, and three maps.",
    features: ["Horde AI with pathfinding", "8 weapons with upgrade tree", "3 playable maps", "Controller + keyboard support"],
    includes: ["Full Unreal project", "Blueprints + C++ source", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: true, added: "2026-06-11"
  },
  {
    id: "pixel-dungeon-quest",
    title: "Pixel Dungeon Quest",
    engine: "Godot",
    genre: "RPG",
    platforms: ["PC", "WebGL", "Android"],
    price: 69, oldPrice: null,
    version: "Godot 4.2",
    short: "Top-down pixel-art roguelike with loot and procedural dungeons.",
    description: "A roguelike dungeon crawler written in GDScript. Procedural rooms, inventory, loot tables and boss fights. Lightweight and runs on almost anything.",
    features: ["Procedural dungeon rooms", "Inventory & loot tables", "4 boss fights", "Save / load system"],
    includes: ["Full Godot project", "Pixel art assets", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: true, added: "2026-09-01"
  },
  {
    id: "drift-kings",
    title: "Drift Kings",
    engine: "Unity",
    genre: "Racing",
    platforms: ["Android", "iOS", "PC"],
    price: 129, oldPrice: 159,
    version: "Unity 2022.3 LTS",
    short: "Arcade drift racer with car customization and career mode.",
    description: "Arcade drifting game with realistic-feeling handling, garage customization, 12 cars and a full career mode.",
    features: ["12 cars with tuning", "Career + free-roam modes", "Paint & wheel customization", "Mobile touch & tilt controls"],
    includes: ["Full Unity project source", "Car models & tracks", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: true, added: "2026-05-15"
  },
  {
    id: "tower-guard",
    title: "Tower Guard TD",
    engine: "Unity",
    genre: "Strategy",
    platforms: ["Android", "iOS", "WebGL"],
    price: 89, oldPrice: null,
    version: "Unity 2021.3 LTS",
    short: "Classic tower defense with 40 levels and upgradeable towers.",
    description: "A polished tower-defense game with six tower types, three upgrade paths each, and 40 levels across four worlds.",
    features: ["6 towers, 3 upgrade paths", "40 levels, 4 worlds", "Boss waves", "Star rating system"],
    includes: ["Full Unity project source", "All assets", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: true, added: "2026-04-28"
  },
  {
    id: "sky-hopper",
    title: "Sky Hopper",
    engine: "Godot",
    genre: "Casual",
    platforms: ["Android", "iOS", "WebGL"],
    price: 29, oldPrice: null,
    version: "Godot 4.1",
    short: "One-tap hyper-casual jumper — perfect for a quick launch.",
    description: "Simple, addictive one-tap platform hopper. Ideal for reskins and quick publishing.",
    features: ["One-tap controls", "Endless procedural platforms", "Skins shop", "Leaderboard ready"],
    includes: ["Full Godot project", "Assets", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: false, added: "2026-03-10"
  },
  {
    id: "mech-arena",
    title: "Mech Arena Online",
    engine: "Unreal",
    genre: "Action",
    platforms: ["PC", "Console"],
    price: 399, oldPrice: null,
    version: "Unreal Engine 5.2",
    short: "Multiplayer mech battle arena with lobby and matchmaking.",
    description: "Third-person mech arena shooter with online multiplayer, lobby system, and customizable mechs.",
    features: ["Online multiplayer (listen server)", "Lobby & matchmaking", "Mech customization", "3 arena maps"],
    includes: ["Full Unreal project", "C++ + Blueprints", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: true, added: "2026-08-05"
  },
  {
    id: "farm-tycoon",
    title: "Farm Tycoon",
    engine: "Unity",
    genre: "Simulation",
    platforms: ["Android", "iOS"],
    price: 99, oldPrice: 139,
    version: "Unity 2022.3 LTS",
    short: "Idle farming tycoon with crops, animals and factories.",
    description: "Idle / tycoon farming game with offline earnings, crop and animal production chains, and prestige system.",
    features: ["Offline earnings", "Production chains", "Prestige system", "Rewarded ads integration"],
    includes: ["Full Unity project source", "Assets", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: false, added: "2026-02-19"
  },
  {
    id: "word-connect",
    title: "Word Connect",
    engine: "Unity",
    genre: "Puzzle",
    platforms: ["Android", "iOS"],
    price: 39, oldPrice: null,
    version: "Unity 2021.3 LTS",
    short: "Swipe-to-connect word puzzle with 1,000 levels.",
    description: "Word puzzle where players swipe letters to find words. Easy to add new languages and levels via JSON.",
    features: ["1,000 levels", "Multi-language support", "Daily puzzle", "Coins & hints"],
    includes: ["Full Unity project source", "Level JSON files", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: false, added: "2026-01-22"
  },
  {
    id: "space-shooter-x",
    title: "Space Shooter X",
    engine: "Godot",
    genre: "Shooter",
    platforms: ["PC", "WebGL", "Android"],
    price: 45, oldPrice: null,
    version: "Godot 4.2",
    short: "Retro vertical shoot-'em-up with bosses and power-ups.",
    description: "Classic vertical scrolling shooter with bullet patterns, power-ups, and five boss battles.",
    features: ["5 boss battles", "Bullet-pattern system", "Power-up stacking", "Gamepad support"],
    includes: ["Full Godot project", "Assets", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: false, added: "2026-06-30"
  },
  {
    id: "horror-house",
    title: "Horror House",
    engine: "Unreal",
    genre: "Horror",
    platforms: ["PC"],
    price: 179, oldPrice: null,
    version: "Unreal Engine 5.3",
    short: "First-person psychological horror with puzzles and chase AI.",
    description: "Atmospheric first-person horror game with an enemy chase AI, environmental puzzles, and a flashlight battery system.",
    features: ["Chase AI with hearing & sight", "Environmental puzzles", "Lumen lighting", "Inventory system"],
    includes: ["Full Unreal project", "Blueprints source", "Documentation"],
    image: "", video: "", buyUrl: "",
    featured: false, added: "2026-09-12"
  }
];
