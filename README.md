# nicolamustone.com

Source code for the front-end of [nicolamustone.com](https://nicolamustone.com) — my portfolio/hub site.

> **Status:** Work in progress.

## Architecture

A static front-end with WordPress.com as a headless CMS:

- **Front-end** — a static [Astro](https://astro.build) site, intended to be served from the edge by **Cloudflare Pages**.
- **Content** — published posts are pulled from the **WordPress.com REST API at build time** (no API calls from visitors). Structured portfolio data that doesn't live in WordPress (e.g. work history) is kept locally in the repo.
- **Rebuilds** — publishing in WordPress triggers a rebuild; the static site keeps serving regardless of CMS or build state.

The API is read only at build time, so the live site has no runtime dependency on WordPress.

## Tech stack

- [Astro](https://astro.build) (static output) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`), with `tailwind-merge`
- [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Astro Fonts API](https://docs.astro.build/en/guides/fonts/) — self-hosted Google Fonts with metric-matched fallbacks (no layout shift)
- Class-based **dark mode** (dark by default), with AA-contrast palettes in both themes
- Privacy-first analytics via [Fathom](https://usefathom.com) (cookieless; see [`/privacy`](src/pages/privacy.astro))

## Getting started

```bash
npm install
cp .env.example .env   # sets WP_SITE_ID and FATHOM_SITE_ID
npm run dev            # start the dev server at http://localhost:4321
```

### Environment

| Variable         | Purpose                                                                                                                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WP_SITE_ID`     | WordPress.com numeric site ID used to fetch content at build time. Identifying the site by ID (not domain) keeps the build working. Set it in `.env` locally **and** in the Cloudflare Pages environment variables for production builds. |
| `FATHOM_SITE_ID` | UseFathom.com site ID used for importing their analytics script. Set it in `.env` locally **and** in the Cloudflare Pages environment variables for production builds.                                                                    |

### Scripts

| Script                 | Description                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `npm run dev`          | Start the local dev server                                                     |
| `npm run build`        | Generate redirects (`prebuild`) and build the static site to `dist/`           |
| `npm run preview`      | Preview the production build locally                                           |
| `npm run format`       | Format the codebase with Prettier                                              |
| `npm run format:check` | Check formatting without writing                                               |
| `npm run wp:zip`       | Package every WordPress component under `wordpress/` (plugins + theme) into installable zips |

## Project structure

```
src/
  components/      UI components (Header, Footer, Nav, ProjectsList, ThemeSwitcher, SEO, …)
  data/            Local structured content (e.g. jobs.ts)
  layouts/         Layout.astro — shared document shell (fonts, SEO, header/footer, theme init)
  lib/
    wordpress.ts   WordPress.com data layer — fetch + normalize posts at build time
  pages/
    index.astro    Home (hub)
    [slug].astro   Single post at a flat /<slug>/ path
    about.astro · privacy.astro · 404.astro
  styles/
    global.css     Tailwind import + design tokens (@theme) + dark palette
  env.d.ts         Types for env vars (WP_SITE_ID)
scripts/
  generate-redirects.mjs   Builds public/_redirects (runs on prebuild)
  zip-wp.mjs               Packages each wordpress/ component (npm run wp:zip)
wordpress/         Companion WordPress code (GPLv2+, deployed separately)
  nmcom-project-fields/    Plugin: Stack taxonomy + Notable Bits (highlights) post meta
  nmcom-deploy-hook/       Plugin: pings the Cloudflare deploy hook on publish → rebuild
  nmcom-placeholder/       Theme: minimal "nothing to see here" front-end for the backend
```

## Content & data

- **Posts** come from the WordPress.com REST API and are normalized in [`src/lib/wordpress.ts`](src/lib/wordpress.ts) into a clean `Entry` shape (decoded titles, derived SEO, root-domain canonicals). Templates never touch the raw API.
- **Per-project structure** that WordPress doesn't model natively is added via the companion plugin (see below): the **Stack** (a hierarchical `stack` taxonomy → grouped tech tags) and **Notable Bits** (a repeatable `highlights` post meta). Both are exposed over REST and read at build time.
- **SEO** is generated in [`src/components/SEO.astro`](src/components/SEO.astro) per page type (`WebSite` / `ProfilePage` / `Article` + `Person`) from each post's title/excerpt/featured image — the site has no SEO plugin.
- **Local data** (work history, etc.) lives under `src/data/`.

## WordPress plugins & theme

Small companion components live under [`wordpress/`](wordpress/), version-controlled but deployed separately to WordPress.com (`npm run wp:zip` builds an installable zip per folder). All **GPLv2-or-later**, per WordPress requirements.

- **`nmcom-project-fields`** (plugin) — registers the `stack` taxonomy and the `highlights` post meta, both `show_in_rest`, so the headless front-end can read a project's tech stack and notable bits.
- **`nmcom-deploy-hook`** (plugin) — pings a Cloudflare Pages deploy hook whenever a post/page is published, updated, or unpublished, triggering a rebuild. The hook URL is set in **Settings → Deploy Hook** (stored in the DB, not the code).
- **`nmcom-placeholder`** (theme) — a minimal front-end so the headless backend isn't browsable: every route renders a "nothing to see here" page (`noindex`). Upload under **Appearance → Themes** and activate.

## Redirects

Old WordPress URLs are 301'd via a Cloudflare [`_redirects`](https://developers.cloudflare.com/pages/configuration/redirects/) file generated at build time by [`scripts/generate-redirects.mjs`](scripts/generate-redirects.mjs). It combines:

- **Date-based post URLs → flat `/<slug>`**, derived from the API.
- **Legacy 301s** exported from the old WordPress redirect plugin (maintained in the script).

`public/_redirects` is generated, not committed.

## Deployment

Hosted on **Cloudflare Pages** as a static build.

- **Build command:** `npm run build` — **Output directory:** `dist`
- **Environment variable:** set `WP_SITE_ID` in the Pages settings (the same value as `.env`). `.env` is gitignored, so the production build needs it set there or it can't fetch content.
- **Rebuild on publish:** the `nmcom-deploy-hook` plugin calls a Cloudflare **deploy hook** on publish/update/unpublish, so the static site refreshes after content changes. The site keeps serving the last good build regardless of WordPress or build state.
- **URLs:** trailing-slash convention (`trailingSlash: "always"`) so sitemap URLs, canonicals, and redirect targets all match.

Because the WordPress REST API is read **only at build time**, the live site has no runtime dependency on WordPress.

## License

The front-end is released under the [MIT License](LICENSE).

The WordPress plugins under [`wordpress/`](wordpress/) are licensed **GPLv2-or-later** (as required for WordPress plugins) — see [`wordpress/nmcom-project-fields/LICENSE`](wordpress/nmcom-project-fields/LICENSE).
