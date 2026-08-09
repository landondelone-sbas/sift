# Sift — Beanie Triage

A static, offline-capable web app for sorting a large physical collection fast. It flags the few items worth researching and tallies the rest as bulk. **It never quotes a price** — online price guides publish asking prices, not sales, which is why the same bear appears at both $6 and $6,000.

No build step. No framework. No backend. No analytics. Everything stays in your browser.

---

## Deploy to GitHub Pages

### Option A — web UI, no command line

1. Create a new repository on GitHub. Public, no README.
2. **Add file → Upload files.** Drag in every file from this folder.
   - `.nojekyll` may be hidden in your file picker. On macOS press `⌘ + Shift + .` to reveal dotfiles. It matters — see below.
3. Commit.
4. **Settings → Pages.** Under *Build and deployment*, set Source to **Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
5. Wait about a minute. Your URL is `https://<username>.github.io/<repo-name>/`.

### Option B — command line

```bash
cd sift
git init
git add -A
git commit -m "Sift v1"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

Then do step 4 above.

---

## Files

| File | Purpose |
|---|---|
| `index.html` | Markup and asset links. All paths relative. |
| `styles.css` | Glass panels, colour field, layout. |
| `data.js` | The 50 watched names and their variant questions. **Edit this to tune the list.** |
| `app.js` | Triage flow, tier resolution, storage, export. |
| `sw.js` | Service worker — makes the app work with no signal. |
| `manifest.webmanifest` | Lets it install to a home screen. |
| `icon.svg`, `icon-192.png`, `icon-512.png` | App icons. |
| `.nojekyll` | Tells Pages to serve files as-is. |

---

## Three things that will bite you

**1. Relative paths are mandatory.** A project Pages site is served from `/<repo-name>/`, not `/`. Every reference in this project starts with `./` for that reason. If you add an asset and write `/styles.css`, it will 404 on Pages while working perfectly on your laptop.

**2. `.nojekyll` must be committed.** Without it, GitHub runs your files through Jekyll, which ignores anything starting with `_` or `.`. Nothing here starts with an underscore today, but the moment you add a folder that does, files vanish with no error message.

**3. Bump the cache after every change.** The service worker serves from cache first. If you edit `app.js` and the site looks unchanged, open `sw.js` and change:

```js
const CACHE = "sift-v1";   →   const CACHE = "sift-v2";
```

Skipping this is the single most common reason a deployed change appears not to have shipped. To force a refresh on a device that's already stuck: DevTools → Application → Service Workers → Unregister, or delete and re-add the home screen shortcut.

---

## Installing on a phone

Open the Pages URL, then:

- **iOS Safari** — Share → Add to Home Screen
- **Android Chrome** — ⋮ → Add to Home screen / Install app

It then launches full-screen and works with no signal.

---

## Where your data lives

In `localStorage`, on that one device, in that one browser. Nothing is uploaded. Consequences worth understanding:

- Clearing site data erases your session.
- A phone session and a laptop session are separate.
- **Export from the Data tab when you finish a sitting.** CSV for spreadsheets, JSON for a complete backup.

If the app shows a red banner saying storage is blocked, it is running in memory only — export before closing the tab.

---

## Editing the watched names

`data.js` is a plain list. Each entry:

```js
{
  n: "Peanut",                    // name as printed on the tag
  a: ["elephant"],                // alternate search terms
  q: "Is the blue a deep royal…", // the ONE question that decides it
  yes: 1,                         // tier floor if the answer is yes
  hyped: true,                    // optional: famous but usually common
  note: "…"                       // context shown under the question
}
```

Add an entry and it appears in search and in the Guide tab automatically. Keep questions answerable in under three seconds by someone holding the item — that constraint is what makes the tool fast.

Being on this list is neither good nor bad. It means one extra question. Roughly a quarter of the entries exist to give you a fast **no** on names that are famous but almost always common.

---

## The rule the app runs on

```
final tier = min(name floor, tag verdict)
```

A confirmed variant locks a Tier 1 or 2 floor immediately. The tag questions still run and can only pull the tier **up**. Ambiguity always routes up a tier, never down — a false positive costs ninety seconds of research, a false negative costs the find.
