/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** WordPress.com numeric site ID — set in .env (and Cloudflare Pages env). */
  readonly WP_SITE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
