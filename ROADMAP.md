# Alpha Nurseries Website Roadmap

This is the working checklist for modernizing the Alpha Nurseries website.

The goal is to improve the current static HTML/CSS/JavaScript site carefully, one focused change at a time, without breaking the catalog, wishlist, EmailJS form, or frozen GIS page.

## Current Strengths

- [x] The site works without a JavaScript framework.
- [x] The site can be deployed as a static website.
- [x] The catalog now loads local `data.json` instead of a raw GitHub URL.
- [x] Excel can be converted into catalog JSON with `scripts/import-catalog.py`.
- [x] Old project files have been moved into `archive/`.
- [x] The project has a `README.md` with local setup and catalog update instructions.
- [x] Shared styling and navigation are becoming more consistent.
- [x] The GIS tool remains isolated from catalog modernization.
- [x] The catalog and wishlist provide useful real business functionality.

## Current Known Issues

- [x] Wishlist price data is consistent between the new saved price structure and wishlist reading logic.
- [x] Wishlist rows use the selected summary price data immediately instead of waiting for a size or quantity change.
- [ ] Catalog loading does not clearly show loading or error states if `data.json` fails.
- [ ] The Excel importer assumes expected sheet names and layouts without enough validation messaging.
- [ ] Catalog cards are clickable but are not fully keyboard-accessible yet.
- [ ] Some icon-only buttons need clearer labels and focus behavior.
- [ ] Nested click behavior may allow a button click to also expand a catalog card if not carefully handled.
- [ ] Mobile layouts still need a full real-device review.
- [ ] Some imported spreadsheet values are placed into generated table markup with `innerHTML`.
- [ ] Wishlist page styling needs more polish, especially background, table, form, and header fade behavior.
- [ ] Resource-page section jumps feel abrupt and need better fixed-header handling.
- [ ] Repeated navigation and footer markup still appears in multiple HTML files.
- [ ] The old GIS direction is still present, while Peter's plant finder is expected to replace or supplement it later.
- [ ] External dependencies such as Font Awesome, EmailJS, Google Maps, and Leaflet should be reviewed before final hosting handoff.

## Immediate Priorities

- [x] Fix wishlist price data consistency.
  - The catalog saves wishlist prices in a nested structure like `summary.price[1]`, `summary.price[25]`, `summary.price[100]`, and `summary.price[500]`.
  - Some wishlist logic still appears to read older fields like `summary.oneprice`, `summary.twentyfiveprice`, `summary.onehundredprice`, and `summary.fivehundredprice`.
  - Correct this without changing the saved wishlist structure again unless there is no safer option.
  - Completed: `wishlist.js` now reads the nested `summary.price` tiers first, falls back to older summary price fields where possible, and displays `Contact for pricing` when the required tier is unavailable.
- [ ] Add catalog loading and error states.
  - Show a clear loading message while `data.json` is being fetched.
  - Check `response.ok` before trying to parse catalog data.
  - Show a useful error message if `data.json` is missing, malformed, or unavailable.
  - Avoid leaving the catalog area blank without explanation.
- [ ] Validate imported catalog data before replacing `data.json`.
  - Verify required workbook sheets exist.
  - Report missing sheets clearly.
  - Warn about skipped or malformed rows.
  - Support a dry-run validation workflow.
  - Avoid overwriting `data.json` when validation fails.
- [ ] Test wishlist behavior end to end.
  - Add a plant to the wishlist.
  - Add a plant with multiple sizes.
  - Refresh the catalog page.
  - Refresh the wishlist page.
  - Change sizes.
  - Enter quantities below 25.
  - Enter quantities at 25, 100, and 500.
  - Verify the correct price tier.
  - Verify row totals.
  - Verify the grand total.
  - Remove a row.
  - Restore a row.
  - Clear the wishlist.
  - Verify empty-wishlist behavior.
  - Send a test EmailJS inquiry.
  - Verify the submitted inquiry includes plant, quantity, size, row total, and grand total.
- [ ] Improve accessibility and interaction safety.
  - Make expandable catalog cards keyboard-accessible.
  - Ensure buttons have appropriate labels.
  - Ensure wishlist buttons maintain accurate `aria-pressed` states.
  - Avoid nested click behavior where clicking a button unintentionally expands a card.
  - Add visible keyboard focus styles.
- [ ] Improve mobile layout.
  - Check catalog cards on narrow screens.
  - Check catalog price tables on narrow screens.
  - Check navigation menu behavior.
  - Check wishlist table usability.
  - Check form field sizing.
  - Check long plant names.
  - Check long Latin names.
  - Check footer layout.
  - Check GIS page behavior on phones.
- [ ] Reduce risky HTML injection.
  - Use `textContent` and DOM element creation for imported spreadsheet values where practical.
  - Ensure imported names, sizes, ages, descriptions, and prices cannot inject markup.
  - Avoid changing trusted static icon markup unless needed.
- [ ] Keep code cleanup lower priority until functionality is stable.
  - Separate large JavaScript files into clear logical sections or modules only when useful.
  - Reduce duplicate wishlist event handlers.
  - Document the catalog data shape.
  - Document the saved wishlist data shape.
  - Split `styles.css` only after the current design has stabilized.
  - Add lightweight formatting or lint checks.
  - Avoid premature restructuring.

## Testing Checklist

- [ ] Start the site locally with `python3 -m http.server 8891`.
- [ ] Open `http://localhost:8891/`.
- [ ] Confirm the homepage loads.
- [ ] Confirm the catalog loads all cards from local `data.json`.
- [ ] Confirm catalog search works.
- [ ] Confirm category filtering works.
- [ ] Confirm the wishlist count updates when plants are added or removed.
- [ ] Confirm wishlist selections survive page refresh.
- [ ] Confirm wishlist prices, row totals, and grand total are correct.
- [ ] Confirm EmailJS shows sending, success, and error feedback.
- [ ] Confirm Resources links scroll to the expected sections.
- [ ] Confirm the frozen GIS page still loads if it remains linked.
- [ ] Confirm desktop, narrow desktop, tablet, and phone layouts.
- [ ] Confirm keyboard navigation and visible focus states.
- [ ] Confirm browser behavior in Chrome, Safari, and mobile Safari if available.

## Completed Work

- [x] Moved the catalog fetch to local `data.json`.
- [x] Added an Excel-to-JSON catalog importer.
- [x] Added `requirements.txt` for importer dependency setup.
- [x] Added local setup and catalog update instructions to `README.md`.
- [x] Moved historical or unused project files into `archive/`.
- [x] Moved the homepage video to `assets/background.mp4`.
- [x] Preserved the frozen GIS page instead of mixing it into catalog modernization.
- [x] Restored Font Awesome after the first local icon replacement attempt did not match the existing design.
- [x] Added this roadmap as the project planning checklist.
- [x] Fixed wishlist price reads to use the catalog-added nested `summary.price` structure.

## Future Ideas

- [ ] Preview catalog changes before replacing `data.json`.
- [ ] Generate an import report after reading an Excel price list.
- [ ] Add product availability fields.
- [ ] Add catalog descriptions and photos.
- [ ] Add better search and category filtering.
- [ ] Export or print wishlist inquiries.
- [ ] Add automated data validation.
- [ ] Add a basic browser test suite.
- [ ] Add a deployment checklist.
- [ ] Revisit GIS improvements separately.
- [ ] Integrate Peter's plant finder as its own navigation item.
- [ ] Decide whether Peter's plant finder should open as a link, embedded app, iframe, or hosted subpage.
- [ ] Possibly create a private admin importer later.
- [ ] Replace Font Awesome CDN with local SVG icons that match the current icon artwork.
- [ ] Keep local icons in `assets/icons/` once the artwork is approved.
- [ ] Standardize repeated navigation and footer markup so updates do not require copying HTML across pages.
- [ ] Review `resources.html` for outdated links and references to old missing pages.
- [ ] Decide whether `about.html` should remain as a fallback page or be archived.
- [ ] Keep the limited palette in `styles.css` as the source of truth.
- [ ] Confirm intentional page backgrounds for homepage, catalog, wishlist, and resources.
- [ ] Make the fixed header fade match each page background.
- [ ] Tighten type styles around a small set of roles: display title, subheading, body, card title, and small/meta text.
- [ ] Review icon sizing and corner spacing across nav, logo, wishlist, and resource arrows.
- [ ] Revisit the homepage circle design separately.
- [ ] Make the Excel importer workflow easier for non-developers.
- [ ] Consider a small importer README or one-click script for hosting/support staff.
- [ ] Decide whether Excel source files should remain in `assets/` or move to a clearer folder such as `data-source/`.
- [ ] Keep generated `data.json` sorted consistently for cleaner diffs.
- [ ] Confirm the production hosting environment can serve static files from this folder.
- [ ] Confirm EmailJS works from the production domain.
- [ ] Archive or remove the old GIS page once Peter's plant finder has a final home.
- [ ] Create a compressed deploy package that excludes `.git/`, `archive/local-backups/`, and `scripts/__pycache__/`.
- [ ] Document exactly which files hosting staff should replace when a new catalog is generated.
- [ ] Redesign the wishlist page so the form, saved items, background, and header fade feel intentional together.
- [ ] Improve resource-page section navigation so anchor jumps feel smoother and account for the fixed header.
- [ ] Review success and error messaging for EmailJS on Chrome, Safari, and mobile.
- [ ] Review image and video sizes for production loading performance.
- [ ] Consider localizing or removing third-party dependencies where practical.

## Workflow For Each Future Code Change

- [ ] Read the relevant roadmap item before editing.
- [ ] Inspect the current implementation.
- [ ] State the exact scope before editing.
- [ ] Edit only the necessary files.
- [ ] Update the roadmap checkbox and completion notes.
- [ ] Show a concise diff summary.
- [ ] Explain the change in plain English.
- [ ] Provide exact local testing steps.
- [ ] Identify any remaining risk.
- [ ] Suggest a commit message.
