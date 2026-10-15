# Looma Studio website

A static website: no server or database needed.

## Pages
| Page | What it is |
|---|---|
| `index.html` | Home: animated hero, engine cards, spotlight slider, featured games, services |
| `store.html` | Pre-made game store: search, filters, sorting, pages of 24, cart, offers |
| `game.html?id=...` | Full page for each game: gallery, video, tabs, buy box, similar games |
| `services.html` | Services, development process timeline, starting prices |
| `about.html` | Studio story, founder, games per engine, values |
| `contact.html` | Contact cards, project request form, FAQ |

## Files
| File | What it does |
|---|---|
| `js/games.js` | **Your game catalog. Edit this file to add or change games.** |
| `js/layout.js` | Shared header, footer, social links, loader and page transitions |
| `js/app.js` | Cart, quick view, offers, checkout. Your email is set at the top (`STUDIO`). |
| `js/fx.js` | Animations: scroll reveals, 3D tilt, particles, counters, cursor |
| `js/store.js` | Store filters and search |
| `css/style.css` | Base styling (colors in the `:root` block at the top) |
| `css/fx.css` | Animation and premium effects styling |

## Adding your games
1. Open `js/games.js`.
2. Copy one `{ ... },` block, paste it at the end of the list and change the values.
3. **Delete the sample games.** They are placeholders.

- **Screenshots:** put images in `images/games/` and set `image: "images/games/my-game.jpg"`.
  Add more images with `gallery: [...]`. Without an image, a styled cover is generated automatically.
- **Gameplay video:** set `video` to a YouTube link. It appears in the game page gallery.
- **Direct payment:** set `buyUrl` to a PayPal, Gumroad or Fiverr link. "Buy now" then goes straight there.
- **Featured:** `featured: true` puts the game on the home page and in the spotlight slider.

## Things to review before publishing
- The starting prices on `services.html` ($99 reskin, $499 custom game) are examples. Set your own.
- Orders, offers and contact forms open the customer's email app with a message to info.loomastudio@gmail.com.

## Animations
Visitors whose system is set to "reduce motion" automatically get a calm version with no animation.
The custom cursor and 3D tilt only run on devices with a mouse.

## Publishing (free)
Upload the whole folder to **GitHub Pages**, **Netlify** (drag and drop at app.netlify.com/drop) or **Cloudflare Pages**.
