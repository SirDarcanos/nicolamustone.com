# nicolamustone.com

The source for [nicolamustone.com](https://nicolamustone.com), Nicola Mustone's personal portfolio.

## Architecture

The site is statically generated with [Astro](https://astro.build) and deployed to Cloudflare Pages. Project content and images live in this repository, so builds have no CMS or content API dependency.

## Tech stack

- [Astro](https://astro.build) with TypeScript and MDX
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/) for validated project metadata
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`
- [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- Astro's image pipeline for responsive AVIF and WebP output
- Astro Fonts API for self-hosted fonts with metric-matched fallbacks
- Privacy-first analytics via [Fathom](https://usefathom.com)

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

The development server runs at `http://localhost:4321`.

### Environment

| Variable         | Purpose                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `FATHOM_SITE_ID` | Fathom site ID. Set it locally and in Cloudflare Pages. Analytics load only in production. |

### Scripts

| Script                 | Description                             |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start the local development server      |
| `npm run build`        | Build the static site into `dist/`      |
| `npm run preview`      | Preview the production build            |
| `npm run format`       | Format the repository with Prettier     |
| `npm run format:check` | Check formatting without changing files |

## Project structure

```text
src/
  assets/projects/   Local project icons and body images
  components/        Shared Astro and MDX components
  content/projects/  One MDX file per project
  data/              Work history and other structured site data
  layouts/           Shared document layout
  lib/projects.ts    Sorted project collection access
  pages/             Static pages and the /<project>/ route
  styles/            Global styles and design tokens
  content.config.ts  Project collection schema
public/
  _redirects         Historical URL redirects
```

## Project content

Each file in `src/content/projects/` supplies validated frontmatter and an MDX body. The filename is the permanent public slug.

```yaml
title: Example Project
description: A short project summary.
launchedAt: 2026-01-01
order: 1
featuredImage: ../../assets/projects/example/featured.png
featuredImageAlt: Example Project icon.
tags:
  - App
status: active
```

`status` accepts `active` or `archived`. Lower `order` values appear first on the homepage.

MDX bodies can use the project components explicitly:

```mdx
import ProjectStack from "../../components/ProjectStack.astro";
import Stack from "../../components/Stack.astro";

<ProjectStack>
  <Stack title="Frontend" items={["Astro", "TypeScript"]} />
</ProjectStack>
```

Featured icon sources are normalized to 96×96 pixels for their 48px rendered size. Body image sources are capped at 1200px wide, and Astro generates responsive output formats during the build.

## Agent-readable content

`/llms.txt` lists portable Markdown alternatives for the homepage, About page, Privacy page, and every project. Each alternative uses the page URL with its trailing slash replaced by `.md`; the homepage is available at `/index.md`.

Pages opt in through the `markdown` prop on `Layout`. After Astro renders the site, `scripts/build-markdown-alternatives.mjs` converts the marked HTML documents into Markdown, rewrites links between marked pages to their `.md` alternatives, and preserves canonical metadata. The `postbuild` script runs this automatically after every production build.

## Development workflow

Create a short-lived branch for each change and open a pull request into `develop`. Direct pushes to `develop` and `main` are blocked. When a set of changes is ready for production, open a pull request from `develop` into `main`.

Review changes locally with `npm run dev` or `npm run build`; non-`main` branches should not trigger Cloudflare preview builds.

## Redirects and deployment

Historical date-based and legacy URLs are kept in `public/_redirects`. Project routes use trailing slashes consistently through `trailingSlash: "always"`.

Cloudflare Pages settings:

- Production branch: `main`
- Preview branch builds: disabled
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 22.12 or newer
- Environment variable: `FATHOM_SITE_ID`

## License

Released under the [MIT License](LICENSE).
