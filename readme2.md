# Pintaara Change Summary

This document records the changes currently present in the working tree. It covers
the modified tracked files and the new files under `src/styles/`.

## Change overview

| File | Description |
| --- | --- |
| `admin/src/app/admin.css` | Adds responsive admin-shell styling for tablet and mobile layouts. |
| `admin/src/app/layout.jsx` | Adds mobile navigation behavior, sidebar state handling, and profile-menu dismissal behavior. |
| `backend/seed_full_store.php` | Replaces generic bracelet seed images with product-specific image paths. |
| `package-lock.json` | Removes unsupported `libc` metadata from optional native dependency entries. |
| `src/app/collection/[id]/page.js` | Improves product image resolution, collection recommendations, pricing data, and customization state. |
| `src/app/globals.css` | Aligns brand fonts and header layout with the design PDF, and prevents title overflow on narrow screens. |
| `src/app/layout.js` | Loads the new shared header, footer, pricing, and collection stylesheets. |
| `src/styles/collection-view.css` | New styles for collection pages, product cards, and related-product sections. |
| `src/styles/footer.css` | New shared footer layout and mobile responsive styles. |
| `src/styles/header.css` | New shared header theme and mobile navigation styles. |
| `src/styles/product-pricing.css` | New shared product-price display and responsive typography styles. |

## Detailed changes

### `admin/src/app/admin.css`

- Adds reusable classes for the admin shell, main viewport, page content, search
  wrapper, mobile navigation toggle, and mobile navigation backdrop.
- Adds a tablet breakpoint at `900px` that narrows the sidebar and constrains the
  search field.
- Adds a mobile breakpoint at `640px` that:
  - Converts the sidebar into a fixed off-canvas navigation panel.
  - Adds slide-in and slide-out transitions.
  - Adds a backdrop for closing the navigation panel.
  - Makes the top bar and search controls fit small screens.
  - Hides secondary desktop-only top-bar controls.
  - Reduces page-content padding and control dimensions for mobile.

### `admin/src/app/layout.jsx`

- Adds a `ref` for the profile menu so outside pointer events can close it.
- Adds global Escape-key handling:
  - Closes the profile menu.
  - Closes the mobile sidebar when the viewport is at most `640px` wide.
- Adds outside-click handling for the profile menu.
- Adds resize handling that closes the sidebar when entering the mobile viewport.
- Adds responsive class names to the admin shell, sidebar, main viewport, top bar,
  and search wrapper.
- Keeps the sidebar collapse button available in both expanded and collapsed
  desktop states, with matching labels and directional icons.
- Adds a mobile hamburger button with `aria-expanded` and accessible labels.
- Adds a mobile navigation backdrop that closes the sidebar when clicked.
- Adjusts sidebar header spacing and flex behavior so the brand and collapse
  control remain usable when the sidebar is collapsed.

### `backend/seed_full_store.php`

- Updates the seeded image for `BR-SG-OR-001` to
  `/images/design-log/BR-SG-OR-001.JPG`.
- Updates the seeded image for `BR-SG-OR-002` to
  `/images/products/piece-01-exact.jpg`.
- Updates the seeded image for `BR-SG-FS-003` to
  `/images/products/piece-02-exact.jpg`.
- This removes the previous behavior where all three products used the generic
  bracelet image.

### `package-lock.json`

- Removes `libc` fields from optional platform-specific package records.
- Keeps the existing package versions and dependency structure otherwise
  unchanged.

### `src/app/collection/[id]/page.js`

- Adds a legacy product-image fallback map keyed by design code.
- Adds `resolveProductImage()` to:
  - Replace the generic bracelet placeholder with the correct legacy image for
    known products.
  - Preserve valid product image URLs.
  - Fall back to the ring image when no usable URL is available.
- Changes the default purity selection from `18KT` to `22KT`.
- Tracks related products and whether the current product has been customized.
- Clears customization and price-breakdown state whenever a new product is loaded.
- Applies the centralized image resolver while mapping category products.
- Includes each product's `making_charge` in mapped category-product data.
- Loads up to four related products from the current product collection.
- Excludes the current product from recommendations.
- Requests all products as a fallback when the current collection has fewer than
  four recommendations, while avoiding duplicate products.
- Maps related products with their collection, image, and live/base price data.
- Clears related products and logs an error if recommendation loading fails.
- Adds the related-product data to the page's product-detail flow.
- Extends price and customization handling so the page can distinguish the
  initial product state from a customized state.
- Updates product and collection presentation data to support the new shared
  collection and pricing styles.

### `src/app/globals.css`

- Aligns the primary brand font variables with the fonts embedded in the design
  PDF:
  - `Baskerville` for brand and editorial heading typography.
  - `Avenir Next` for body and navigation typography.
  - `Maves` for the large 1976 legacy year treatment.
- Changes the desktop header container to a three-column layout so the logo,
  centered navigation, and right-aligned icons stay consistently positioned.
- Constrains the second slide title to the available viewport width and enables
  wrapping for long text.
- Adds a `768px` breakpoint that makes slide, hero, collection, philosophy, and
  story titles use the full available width without overflowing.
- Allows long title words to wrap naturally on narrow screens.

## 32-page design PDF review

The complete `Website Design.pdf` was reviewed page by page. The pages group into
the following implementation areas:

- Pages 1-7: landing, collection introduction, design-log introduction,
  philosophy, story, and the main site footer.
- Pages 8-10: collection landing, category navigation, and made-to-order
  workflow.
- Pages 11-18: product listing, product detail, bag, checkout, order review,
  and order confirmation.
- Pages 19-22: design process, design-log listing, and design specification.
- Pages 23-28: about, philosophy, story, and butterfly identity content.
- Pages 29-32: 1976 legacy hero and history timeline.

The PDF embeds `Baskerville`, `AvenirNext-Regular`, `AvenirNext-Bold`,
`AvenirNext-Italic`, and `Maves` (with some platform/UI fallback fonts on
individual pages). The shared typography now follows that hierarchy instead of
using Bodoni/Cormorant as the primary brand and display fonts.

### `src/app/layout.js`

- Imports the new shared stylesheets globally:
  - `@/styles/header.css`
  - `@/styles/footer.css`
  - `@/styles/product-pricing.css`
  - `@/styles/collection-view.css`

### `src/styles/collection-view.css` (new)

- Defines collection-page containers, introductions, category headers, and
  four-column product grids.
- Styles product-card media frames, hover treatments, titles, and keyboard focus
  states.
- Adds the related-products section used on product detail pages.
- Styles related-product headings, cards, image frames, product names, and prices.
- Adds responsive grid and spacing adjustments for medium and small screens.

### `src/styles/footer.css` (new)

- Provides shared alignment and spacing for subpage, collection, about, and
  design-log footers.
- Defines footer branding and right-side/copyright layout.
- Adds mobile footer adjustments for screens up to `600px`.

### `src/styles/header.css` (new)

- Adds the dark header theme, including the header container, navigation menu,
  and header icons.
- Preserves the light header treatment for legacy page roots.
- Adds mobile header adjustments for screens up to `767px`.

### `src/styles/product-pricing.css` (new)

- Defines shared category and atelier price typography.
- Adds price labels and currency/value formatting.
- Provides responsive price sizing for screens up to `767px`.

## Notes

- `readme2.md` is a new documentation file and does not describe unrelated
  pre-existing repository history.
- The summary reflects the current working-tree changes; it does not represent
  a committed release or a complete historical changelog.
