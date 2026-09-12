import type { APIRoute } from "astro";
import { getProjects } from "../lib/projects";

const SITE_URL = "https://nicolamustone.com";

const link = (name: string, path: string, description: string) =>
  `- [${name}](${SITE_URL}${path}): ${description}`;

export const GET = (async () => {
  const projects = await getProjects();
  const body = [
    "# Nicola Mustone",
    "",
    "> Nicola Mustone is a support team lead, web developer, writer, and maker. This portfolio covers his experience and independent projects in software, tabletop gaming, publishing, and the web.",
    "",
    "The site is the canonical overview of Nicola's current work and career. The links below point to portable Markdown alternatives generated from the published pages.",
    "",
    "## Main pages",
    "",
    link(
      "Home",
      "/index.md",
      "Introduction, featured projects, and condensed work experience.",
    ),
    link(
      "About Nicola",
      "/about.md",
      "Biography, skills, career statistics, and full work history.",
    ),
    "",
    "## Projects",
    "",
    ...projects.map(({ id, data }) =>
      link(
        data.title,
        `/${id}.md`,
        `${data.launchedAt.toISOString().slice(0, 10)} — ${data.description}`,
      ),
    ),
    "",
    "## Optional",
    "",
    link(
      "Privacy",
      "/privacy.md",
      "How the site handles analytics, visitor data, and external links.",
    ),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}) satisfies APIRoute;
