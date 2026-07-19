# Alpha Nurseries Website

Static website for Alpha Nurseries.

## Run Locally

```bash
python3 -m http.server 8891
```

Open `http://localhost:8891/`.

## Main Pages

- `index.html` - homepage with video intro, company copy, and footer
- `catalog.html` - plant catalog loaded from local `data.json`
- `wishlist.html` - saved plant inquiry list with EmailJS inquiry sending
- `resources.html` - greetings, FAQs, legal information, and nursery resources
- `education.html` - downloadable education and research documents
- `order-form.html` - printable order form download
- `planting-instructions.html` - printable planting instructions download
- `bearlake.html` - Bear Lake project overview
- `gis.html` - frozen GIS page retained for now

## Core Files

- `styles.css` - shared design system, palette, layout, cards, wishlist, resources, GIS, and footer styles
- `navigation.js` - hamburger menu and Resources submenu
- `catalog.js` - catalog card rendering and filtering
- `wishlist.js` - wishlist table and inquiry form behavior
- `animation.js` - homepage intro/fade behavior
- `resources.js` - Resources page section navigation

## Catalog Updates

The catalog renders from `data.json`.

To regenerate `data.json` from a new Excel price list:

```bash
python3 -m pip install -r requirements.txt
python3 scripts/import-catalog.py "assets/2026-27 Price List.xlsx"
```

After importing, review `catalog.html` locally before committing.

## Design Direction

The site is being streamlined around a small palette:

- Red: `--alpha-red`
- Green: `--alpha-green`
- Neutrals: black, white, muted grays
- Page backgrounds: cream and wishlist gray

Keep new styling aligned to the shared variables in `styles.css`. Avoid introducing extra accent colors.

## Roadmap

Planned improvements and cleanup ideas live in `ROADMAP.md`.

## Archive

Archived files live under `archive/`.

- `archive/old-code/` contains historical versions and retired experiments.
- `archive/snippets/` contains standalone snippets that are not wired into live pages.
- `archive/local-backups/` is ignored by Git and can hold local backup zips or temporary recovery files.

Live pages should not depend on anything in `archive/`.
