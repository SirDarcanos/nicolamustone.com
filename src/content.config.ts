import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({
    base: "./src/content/projects",
    pattern: "**/*.{md,mdx}",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      launchedAt: z.coerce.date(),
      order: z.number().int().nonnegative(),
      featuredImage: image(),
      featuredImageAlt: z.string(),
      tags: z.array(z.string()).default([]),
      status: z.enum(["active", "archived"]).default("active"),
    }),
});

export const collections = { projects };
