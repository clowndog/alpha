# Alpha Nurseries Website Roadmap

Working list of site improvements and cleanup ideas.

## Near-Term Cleanup

- Replace Font Awesome CDN with local SVG icons using the official Font Awesome SVG paths for the exact same icon artwork.
- Keep local icons in a folder such as `assets/icons/` so the hosting handoff is more self-contained.
- Standardize repeated navigation/footer markup so page edits do not require copying the same HTML in multiple files.
- Review `resources.html` for outdated links and references to old missing pages.
- Plan the Peter plant finder integration as the replacement for the old GIS direction.
- Decide whether Peter's plant finder should open as a normal nav link, embedded app, iframe, or hosted subpage.
- Decide whether `about.html` should remain as a fallback page or be archived now that About content lives on the homepage.

## Design System

- Keep the limited palette in `styles.css` as the source of truth.
- Avoid adding new accent colors beyond the current red, green, black, white, and muted grays.
- Decide which page backgrounds are intentional: homepage/video, catalog cream, wishlist gray, resources white/cream.
- Make the fixed header fade match each page background instead of forcing one fade color everywhere.
- Continue tightening type styles around a small set of roles: display title, subheading, body, card title, and small/meta text.
- Review icon sizing and corner spacing as a shared system across nav, logo, wishlist, and resource arrows.
- Revisit homepage circle design separately; current behavior is temporary.

## Catalog And Data Workflow

- Make the Excel importer workflow easy for non-developers to understand.
- Consider a small importer README or one-click script for hosting/support staff.
- Add importer checks for missing required sheets, empty price columns, and unexpected workbook format changes.
- Decide whether the Excel source file should remain in `assets/` or move to a clearer folder such as `data-source/`.
- Consider keeping generated `data.json` sorted consistently for cleaner diffs.

## Hosting Handoff

- Confirm the production hosting environment can serve static files from this folder.
- Confirm EmailJS works from the production domain.
- Confirm where Peter's plant finder will live and whether it is bundled with this site or linked as a separate app.
- Archive or remove the old GIS page once Peter's plant finder has a final home.
- Create a compressed deploy package that excludes `.git/`, `archive/local-backups/`, and `scripts/__pycache__/`.
- Document exactly which files hosting staff should replace when a new catalog is generated.

## User Experience

- Review mobile layouts across homepage, catalog, wishlist, and resources on real devices.
- Redesign the wishlist page so the form, saved items, background, and header fade feel intentional together.
- Make wishlist quantity controls feel polished and consistent.
- Improve card expanded states and consider replacing the old resource-mode idea with a small info affordance per card.
- Improve resource-page section navigation so anchor jumps feel smoother and account for the fixed header.
- Review empty states for catalog search/filter and wishlist.
- Review success/error messaging for EmailJS on Chrome, Safari, and mobile.

## Accessibility And Performance

- Add accessible labels where icon-only buttons still need clearer names.
- Ensure keyboard navigation works for menu, search, category filter, cards, wishlist buttons, and forms.
- Consider respecting reduced-motion preferences for homepage/card/menu animations.
- Review image/video sizes for production loading performance.
- Consider localizing or removing third-party dependencies where practical.
