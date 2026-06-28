import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://nicolamustone.com",
  // No-trailing-slash convention so sitemap URLs match the hard-set canonicals
  // (https://nicolamustone.com/<slug>) and the redirect targets.
  trailingSlash: "never",
  build: { format: "file" },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
