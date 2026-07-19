# Alpha Nurseries Website

Static website for Alpha Nurseries.

## Run Locally

```bash
python3 -m http.server 8891
```

Open `http://localhost:8891/`.

## Main Pages

- `index.html` - homepage
- `catalog.html` - plant catalog
- `wishlist.html` - saved plant inquiry list
- `resources.html` - greetings, FAQs, legal information
- `gis.html` - frozen GIS page

## Catalog Updates

The catalog renders from `data.json`.

To regenerate it from the Excel price list:

```bash
python3 -m pip install -r requirements.txt
python3 scripts/import-catalog.py "assets/2026-27 Price List.xlsx"
```

## Notes

Current implementation notes live in `PROJECT_NOTES.md`.

Archived/old files live in `archive/` and are not used by the live site.
