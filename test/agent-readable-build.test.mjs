import assert from "node:assert/strict";
import { createWindow } from "@mixmark-io/domino";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const siteDirectory = path.join(repositoryRoot, "dist");

const htmlFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  });

const fileForUrl = (url) =>
  path.join(siteDirectory, new URL(url).pathname.replace(/^\//, ""));

const withoutFencedCode = (markdown) =>
  markdown.replace(/^(`{3,}|~{3,}).*?^\1\s*$/gms, "");

const projectPages = {
  "openfray-app": {
    title: "OpenFray.app",
    description: "A free, open-source combat console for D&D 5e Game Masters.",
    seoTitle: "OpenFray.app — D&D 5e Combat Tracker",
    seoDescription:
      "OpenFray.app gives D&D 5e Game Masters a free, open-source combat console that keeps conditions, concentration, and encounter bookkeeping visible.",
  },
  "agent-skills": {
    title: "Agent Skills",
    description:
      "Reusable skills for coding agents, built from workflows I use and shared for others to adapt.",
    seoTitle: "Agent Skills — Workflows for Coding Agents",
    seoDescription:
      "Agent Skills gives coding-agent users reusable, adaptable workflows for development, editorial work, and tabletop games in portable SKILL.md files.",
  },
  "but-honestly": {
    title: "BUT. Honestly",
    description:
      "Essays on work, software, and the web, written slowly and with care.",
    seoTitle: "BUT. Honestly — Essays on Work and Software",
    seoDescription:
      "BUT. Honestly publishes considered essays for readers interested in work, software, leadership, AI, and the web—without buzzwords or forced optimism.",
  },
  shotlist: {
    title: "shotlist",
    description:
      "Repeatable, annotated UI screenshots from declarative recipes. No code per shot.",
    seoTitle: "shotlist — Automated UI Screenshot Tool",
    seoDescription:
      "shotlist helps documentation teams create repeatable, annotated UI screenshots from reviewable YAML recipes and catch visual drift in CI.",
  },
  "opendice-rollful": {
    title: "OpenDice & Rollful",
    description:
      "Roll dice in JavaScript or TypeScript with a formula parser and a single roll() function backed by a CSPRNG with modulo-bias rejection.",
    seoTitle: "OpenDice & Rollful — JavaScript Dice Roller",
    seoDescription:
      "OpenDice and Rollful give JavaScript and TypeScript developers one dice-expression engine as an npm package, hosted API, and browser playground.",
  },
  "nicolamustone-blog": {
    title: "NicolaMustone.blog",
    description:
      "A decade of WordPress and WooCommerce notes, preserved as a reference.",
    seoTitle: "NicolaMustone.blog — WordPress Article Archive",
    seoDescription:
      "NicolaMustone.blog preserves 150+ WordPress and WooCommerce articles for developers who still need practical snippets from a decade of problem-solving.",
  },
};

const documentFor = (relativePath) =>
  createWindow(readFileSync(path.join(siteDirectory, relativePath), "utf8"))
    .document;

const metaContent = (document, selector) =>
  document.querySelector(selector)?.getAttribute("content");

const jsonLdFor = (document) =>
  [...document.querySelectorAll('script[type="application/ld+json"]')].map(
    (script) => JSON.parse(script.textContent),
  );

test.before(() => {
  const build = spawnSync("npm", ["run", "build"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  assert.equal(build.status, 0, build.stdout + build.stderr);
});

test("the production build publishes Markdown alternatives", () => {
  const alternatives = htmlFiles(siteDirectory).flatMap((file) => {
    const document = createWindow(readFileSync(file, "utf8")).document;
    if (!document.querySelector("[data-agent-document]")) return [];

    const canonical = document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href");
    const alternate = document
      .querySelector('link[rel="alternate"][type="text/markdown"]')
      ?.getAttribute("href");
    assert.ok(canonical, `Missing canonical URL in ${file}`);
    assert.ok(alternate, `Missing Markdown alternate in ${file}`);

    return [new URL(alternate, canonical).href];
  });

  assert.equal(alternatives.length, 9);

  const index = readFileSync(path.join(siteDirectory, "llms.txt"), "utf8");
  const advertised = [
    ...index.matchAll(/\]\((https:\/\/nicolamustone\.com\/[^)]+\.md)\)/g),
  ].map(([, url]) => url);
  assert.deepEqual(new Set(advertised), new Set(alternatives));

  for (const url of alternatives) {
    const file = fileForUrl(url);
    assert.equal(existsSync(file), true, `${url} was advertised but not built`);
    const markdown = readFileSync(file, "utf8");
    assert.match(markdown, /^---\ncanonical:/);
    assert.equal(
      (withoutFencedCode(markdown).match(/^# /gm) ?? []).length,
      1,
      `${url} must contain one document title`,
    );
    assert.doesNotMatch(markdown, /data-agent-|<script|<form|<nav|<button/i);
  }

  const homepage = readFileSync(path.join(siteDirectory, "index.md"), "utf8");
  assert.match(homepage, /App, Blog/);
  const about = readFileSync(path.join(siteDirectory, "about.md"), "utf8");
  assert.match(about, /Customer support, Technical troubleshooting/);
  const project = readFileSync(
    path.join(siteDirectory, "agent-skills.md"),
    "utf8",
  );
  assert.doesNotMatch(project, /^## Agent Skills$/m);
  assert.match(
    project,
    /\[GET SirDarcanos\/agentskills – 200\]\(https:\/\/github\.com\/SirDarcanos\/agentskills\/\)/,
  );
  assert.match(
    project,
    /\[← Back to all projects\]\(https:\/\/nicolamustone\.com\/index\.md#projects\)/,
  );

  const headers = readFileSync(path.join(siteDirectory, "_headers"), "utf8");
  assert.match(
    headers,
    /\/\*\.md\s+Content-Type: text\/markdown; charset=utf-8/,
  );
});

test("indexable pages publish complete, unique, self-referencing SEO metadata", () => {
  const indexablePages = htmlFiles(siteDirectory).flatMap((file) => {
    const document = createWindow(readFileSync(file, "utf8")).document;
    if (metaContent(document, 'meta[name="robots"]')?.includes("noindex")) {
      return [];
    }

    const relativePath = path.relative(siteDirectory, file);
    const pathname = `/${relativePath.replaceAll(path.sep, "/").replace(/index\.html$/, "")}`;
    const expectedCanonical = new URL(pathname, "https://nicolamustone.com")
      .href;
    const title = document.querySelector("title")?.textContent.trim();
    const description = metaContent(document, 'meta[name="description"]');
    const canonical = document
      .querySelector('link[rel="canonical"]')
      ?.getAttribute("href");

    assert.equal(document.querySelectorAll("title").length, 1, relativePath);
    assert.ok(title, `Missing title in ${relativePath}`);
    assert.equal(
      document.querySelectorAll('meta[name="description"]').length,
      1,
      relativePath,
    );
    assert.ok(description, `Missing description in ${relativePath}`);
    assert.equal(
      document.querySelectorAll('link[rel="canonical"]').length,
      1,
      relativePath,
    );
    assert.equal(canonical, expectedCanonical, relativePath);
    assert.equal(document.querySelectorAll("h1").length, 1, relativePath);
    assert.ok(document.querySelector("h1")?.textContent.trim(), relativePath);

    return [{ relativePath, title, description }];
  });

  assert.equal(
    new Set(indexablePages.map(({ title }) => title)).size,
    indexablePages.length,
    "Indexable page titles must be unique",
  );
  assert.equal(
    new Set(indexablePages.map(({ description }) => description)).size,
    indexablePages.length,
    "Indexable page descriptions must be unique",
  );
});

test("the homepage and About page position the site around Nicola's projects", () => {
  const homepage = documentFor("index.html");
  assert.equal(
    homepage.querySelector("title")?.textContent,
    "Nicola Mustone — Apps, Tools, Writing & Websites",
  );
  assert.equal(
    metaContent(homepage, 'meta[name="description"]'),
    "Explore apps, developer tools, essays, and independent websites made by Nicola Mustone, from D&D combat tools to software and food projects.",
  );
  assert.match(homepage.querySelector("#intro")?.textContent ?? "", /apps/i);
  assert.match(
    homepage.querySelector("#intro")?.textContent ?? "",
    /developer tools/i,
  );
  assert.match(homepage.querySelector("#intro")?.textContent ?? "", /essays/i);
  assert.match(
    homepage.querySelector("#intro")?.textContent ?? "",
    /independent websites/i,
  );
  const projectCollection = homepage.querySelector("#projects");
  assert.equal(projectCollection?.tagName, "DIV");
  assert.equal(
    projectCollection?.querySelector("h2")?.textContent.trim(),
    undefined,
  );
  for (const slug of Object.keys(projectPages)) {
    assert.ok(homepage.querySelector(`#projects a[href="/${slug}/"]`), slug);
  }

  const about = documentFor("about/index.html");
  assert.equal(
    about.querySelector("title")?.textContent,
    "About Nicola Mustone — Maker of Apps and Websites",
  );
  assert.equal(
    metaContent(about, 'meta[name="description"]'),
    "Meet Nicola Mustone, the person behind this collection of apps, developer tools, essays, and independent websites, with a background in support and web development.",
  );
  const projectCollectionLink = about.querySelector(
    'main a[href="/#projects"]',
  );
  assert.ok(projectCollectionLink);
  assert.match(projectCollectionLink.textContent, /projects/i);
  assert.notEqual(projectCollectionLink.parentElement?.tagName, "P");
});

test("project pages separate search metadata from display copy", () => {
  const renderedProjectSlugs = htmlFiles(siteDirectory)
    .flatMap((file) => {
      const document = createWindow(readFileSync(file, "utf8")).document;
      return jsonLdFor(document).some(
        (schema) => schema["@type"] === "CreativeWork",
      )
        ? [path.basename(path.dirname(file))]
        : [];
    })
    .sort();
  assert.deepEqual(renderedProjectSlugs, Object.keys(projectPages).sort());

  for (const [slug, project] of Object.entries(projectPages)) {
    const document = documentFor(`${slug}/index.html`);
    const expectedFullTitle = `${project.seoTitle} — Nicola Mustone`;

    assert.equal(
      document.querySelector("title")?.textContent,
      expectedFullTitle,
    );
    assert.equal(
      metaContent(document, 'meta[name="description"]'),
      project.seoDescription,
    );
    assert.equal(
      metaContent(document, 'meta[property="og:title"]'),
      expectedFullTitle,
    );
    assert.equal(
      metaContent(document, 'meta[property="og:description"]'),
      project.seoDescription,
    );
    assert.equal(
      metaContent(document, 'meta[name="twitter:title"]'),
      expectedFullTitle,
    );
    assert.equal(
      metaContent(document, 'meta[name="twitter:description"]'),
      project.seoDescription,
    );
    assert.equal(document.querySelector("h1")?.textContent, project.title);
    assert.equal(
      document.querySelector("article header > p.text-muted")?.textContent,
      project.description,
    );
  }
});

test("each project page links to explicit, valid related projects", () => {
  for (const slug of Object.keys(projectPages)) {
    const document = documentFor(`${slug}/index.html`);
    const links = [
      ...document.querySelectorAll("[data-related-projects] a[href]"),
    ];

    assert.ok(links.length >= 1 && links.length <= 3, slug);
    for (const link of links) {
      const relatedSlug = new URL(
        link.getAttribute("href"),
        "https://example.com",
      ).pathname
        .split("/")
        .filter(Boolean)
        .at(-1);
      assert.notEqual(relatedSlug, slug, `${slug} links to itself`);
      assert.ok(projectPages[relatedSlug], `${slug} links to unknown project`);
      assert.ok(
        existsSync(path.join(siteDirectory, relatedSlug, "index.html")),
        `${slug} links to a project page that was not generated`,
      );
      assert.match(
        link.textContent,
        new RegExp(projectPages[relatedSlug].title),
      );
      assert.ok(link.querySelector("p")?.textContent.trim());
    }
  }
});

test("JSON-LD connects site entities through one stable person identity", () => {
  const personId = "https://nicolamustone.com/#person";

  for (const file of htmlFiles(siteDirectory)) {
    const document = createWindow(readFileSync(file, "utf8")).document;
    const schemas = jsonLdFor(document);
    const person = schemas.find((schema) => schema["@type"] === "Person");
    assert.equal(person?.["@id"], personId, file);

    for (const website of schemas.filter(
      (schema) => schema["@type"] === "WebSite",
    )) {
      assert.deepEqual(website.creator, { "@id": personId }, file);
      assert.equal(
        website.description,
        metaContent(document, 'meta[name="description"]'),
        file,
      );
    }
    for (const profile of schemas.filter(
      (schema) => schema["@type"] === "ProfilePage",
    )) {
      assert.deepEqual(profile.mainEntity, { "@id": personId }, file);
    }
    for (const work of schemas.filter(
      (schema) => schema["@type"] === "CreativeWork",
    )) {
      assert.deepEqual(work.creator, { "@id": personId }, file);
    }
  }
});

test("verified profile links retain identity and security rels without nofollow", () => {
  const document = documentFor("index.html");
  const profileLinks = [...document.querySelectorAll('footer a[rel~="me"]')];
  assert.ok(profileLinks.length > 0);
  for (const link of profileLinks) {
    const rel = link.getAttribute("rel")?.split(/\s+/) ?? [];
    assert.ok(rel.includes("me"));
    assert.ok(rel.includes("noopener"));
    assert.ok(rel.includes("noreferrer"));
    assert.ok(!rel.includes("nofollow"));
  }
});

test("the 404 page remains noindex", () => {
  const document = documentFor("404.html");
  assert.equal(metaContent(document, 'meta[name="robots"]'), "noindex, follow");
});
