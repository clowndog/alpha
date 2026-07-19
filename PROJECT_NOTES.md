# Alpha Nurseries Site Notes

This repository contains the static Alpha Nurseries website.

## Current Site Shape

- `index.html` is the homepage. It includes the video intro, short company/about copy, and footer.
- `catalog.html` is the main plant catalog. It loads local catalog data from `data.json`.
- `wishlist.html` stores selected catalog items in `localStorage` and sends inquiries with EmailJS.
- `resources.html` contains greetings, FAQ, legal terms, and nursery/resource information.
- `gis.html` and `gis.js` are still present, but the GIS feature is effectively frozen for now.

## Core Runtime Files

- `styles.css` contains the shared design system, palette, responsive header/nav, catalog cards, wishlist, resources, GIS, and footer styles.
- `navigation.js` controls the hamburger menu and Resources submenu.
- `catalog.js` renders catalog cards from `data.json`.
- `wishlist.js` renders the wishlist and sends email inquiries.
- `animation.js` controls homepage intro/fade behavior.
- `resources.js` controls Resources page section navigation.

## Catalog Data Flow

The catalog now uses a local JSON file:

```js
fetch("data.json")
```

To refresh catalog data from a new Excel price list:

```bash
python3 -m pip install -r requirements.txt
python3 scripts/import-catalog.py "assets/2026-27 Price List.xlsx"
```

The importer writes `data.json`. After importing, review the catalog locally before committing.

## Local Preview

Run a static server from the repo root:

```bash
python3 -m http.server 8891
```

Then open:

```text
http://localhost:8891/
```

## Design Direction

The site is being streamlined around a small palette:

- Red: `--alpha-red`
- Green: `--alpha-green`
- Neutrals: black, white, muted grays
- Page backgrounds: cream and wishlist gray

Keep new styling aligned to the shared variables in `styles.css`. Avoid introducing extra accent colors.

## Archive

Older files and standalone snippets live under `archive/`.

- `archive/old-code/` contains historical versions and retired experiments.
- `archive/snippets/` contains standalone snippets that are not currently wired into the live pages.
- `archive/local-backups/` is ignored by Git and can hold local backup zips or temporary recovery files.

Live pages should not depend on anything in `archive/`.
