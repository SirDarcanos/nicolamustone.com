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

test("the production build publishes Markdown alternatives", () => {
  const build = spawnSync("npm", ["run", "build"], {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  assert.equal(build.status, 0, build.stdout + build.stderr);

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

  assert.equal(alternatives.length, 11);

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
