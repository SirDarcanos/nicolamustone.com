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

- [Astro](https://astro.build) (static output)
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- TypeScript

## Getting started

```bash
npm install
npm run dev      # start the dev server at http://localhost:4321
```

### Scripts

| Script                 | Description                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run dev`          | Start the local dev server                                           |
| `npm run build`        | Generate redirects (`prebuild`) and build the static site to `dist/` |
| `npm run preview`      | Preview the production build locally                                 |
| `npm run format`       | Format the codebase with Prettier                                    |
| `npm run format:check` | Check formatting without writing                                     |

## Project structure

```
src/
  components/      UI components (Header, Footer, Nav, ProjectsList, SEO, …)
  data/            Local structured content (e.g. jobs.ts)
  layouts/         Layout.astro — shared document shell (fonts, SEO, header/footer)
  lib/
    wordpress.ts   WordPress.com data layer — fetch + normalize posts at build time
  pages/
    index.astro    Home (hub)
    [slug].astro   Single post at a flat /<slug> path
  styles/
    global.css     Tailwind import + design tokens (@theme)
scripts/
  generate-redirects.mjs   Builds public/_redirects (runs on prebuild)
```

## Content & data

- **Posts** come from the WordPress.com REST API and are normalized in [`src/lib/wordpress.ts`](src/lib/wordpress.ts) into a clean `Entry` shape (decoded titles, derived SEO, root-domain canonicals). Templates never touch the raw API.
- **SEO** is generated in [`src/components/SEO.astro`](src/components/SEO.astro) from each post's title/excerpt/featured image — the site has no SEO plugin.
- **Local data** (work history, etc.) lives under `src/data/`.

## Redirects

Old WordPress URLs are 301'd via a Cloudflare [`_redirects`](https://developers.cloudflare.com/pages/configuration/redirects/) file generated at build time by [`scripts/generate-redirects.mjs`](scripts/generate-redirects.mjs). It combines:

- **Date-based post URLs → flat `/<slug>`**, derived from the API.
- **Legacy 301s** exported from the old WordPress redirect plugin (maintained in the script).

`public/_redirects` is generated, not committed.

## Deployment

Built as a static site (`npm run build` → `dist/`) for Cloudflare Pages. The site uses a trailing-slash URL convention (`trailingSlash: "always"`) so sitemap URLs, canonicals, and redirect targets all match.

## License

The front-end is released under the [MIT License](LICENSE).

The WordPress plugin under [`wordpress/`](wordpress/) is licensed **GPLv2-or-later** (as required for WordPress plugins) — see [`wordpress/LICENSE`](wordpress/LICENSE).
