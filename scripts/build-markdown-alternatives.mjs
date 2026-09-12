import { createWindow } from "@mixmark-io/domino";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const siteDirectory = path.resolve("dist");

const htmlFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  });

const readDocument = (file) => {
  const document = createWindow(readFileSync(file, "utf8")).document;
  const content = document.querySelector("[data-agent-document]");
  if (!content) return undefined;

  const canonical = document
    .querySelector('link[rel="canonical"]')
    ?.getAttribute("href");
  const encodedMetadata = content.getAttribute("data-agent-metadata");
  if (!canonical || !encodedMetadata) {
    throw new Error(`Agent document metadata is incomplete in ${file}`);
  }

  return {
    file,
    document,
    content,
    canonical,
    metadata: JSON.parse(encodedMetadata),
  };
};

const markdownUrl = (canonical) => {
  const url = new URL(canonical);
  url.pathname =
    url.pathname === "/"
      ? "/index.md"
      : `${url.pathname.replace(/\/$/, "")}.md`;
  return url;
};

const outputPath = (canonical) =>
  path.join(siteDirectory, markdownUrl(canonical).pathname.replace(/^\//, ""));

const absoluteUrl = (value, canonical) => {
  if (!value || value.startsWith("data:")) return value;
  try {
    return new URL(value, canonical).href;
  } catch {
    return value;
  }
};

const editorialKey = (value) => {
  const url = new URL(value);
  url.pathname = url.pathname.replace(/\/$/, "") || "/";
  url.hash = "";
  url.search = "";
  return url.href;
};

const rewriteLink = (href, canonical, alternatives) => {
  const absolute = absoluteUrl(href, canonical);
  if (!absolute) return absolute;

  const url = new URL(absolute);
  const alternative = alternatives.get(editorialKey(url));
  return alternative ? `${alternative}${url.search}${url.hash}` : absolute;
};

const createConverter = () => {
  const converter = new TurndownService({
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "_",
    headingStyle: "atx",
  });
  converter.use(gfm);

  converter.addRule("compactListItem", {
    filter: "li",
    replacement: (content, node, options) => {
      const parent = node.parentNode;
      let prefix = `${options.bulletListMarker} `;
      if (parent.nodeName === "OL") {
        const start = parent.getAttribute("start");
        const index = Array.prototype.indexOf.call(parent.children, node);
        prefix = `${start ? Number(start) + index : index + 1}. `;
      }

      const item = content.replace(/^\n+|\n+$/g, "");
      const indented = item.replace(/\n/g, `\n${" ".repeat(prefix.length)}`);
      return `${prefix}${indented}${node.nextSibling ? "\n" : ""}`;
    },
  });
  converter.addRule("definitionTerm", {
    filter: "dt",
    replacement: (content) => `\n\n- **${content.trim()}:** `,
  });
  converter.addRule("definitionValue", {
    filter: "dd",
    replacement: (content) => `${content.trim()}\n`,
  });
  converter.addRule("badge", {
    filter: (node) =>
      node.nodeName === "SPAN" &&
      (node.classList.contains("bg-accent-soft") ||
        node.classList.contains("bg-tag-soft")),
    replacement: (content, node) =>
      `${content.trim()}${node.nextElementSibling ? ", " : ""}`,
  });
  converter.addRule("compactLink", {
    filter: "a",
    replacement: (content, node) => {
      const label = content.replace(/\s+/g, " ").trim();
      const href = node.getAttribute("href");
      return label && href ? `[${label}](${href})` : label;
    },
  });

  return converter;
};

const prepareContent = ({ content, canonical, metadata }, alternatives) => {
  Array.from(
    content.querySelectorAll(
      "script, style, form, nav, button, input, select, textarea, video, [data-agent-ignore]",
    ),
  ).forEach((node) => node.remove());

  Array.from(content.querySelectorAll("h1")).forEach((heading) => {
    if (heading.textContent.trim() === metadata.title) {
      heading.remove();
      return;
    }

    const replacement = content.ownerDocument.createElement("h2");
    while (heading.firstChild) replacement.appendChild(heading.firstChild);
    heading.parentNode.replaceChild(replacement, heading);
  });

  Array.from(content.querySelectorAll("a[href]")).forEach((anchor) => {
    anchor.setAttribute(
      "href",
      rewriteLink(anchor.getAttribute("href"), canonical, alternatives),
    );
  });

  Array.from(content.querySelectorAll("img")).forEach((image) => {
    if (!image.getAttribute("alt")) {
      image.remove();
      return;
    }
    image.setAttribute(
      "src",
      absoluteUrl(image.getAttribute("src"), canonical),
    );
  });

  return content;
};

const metadataLines = (metadata, canonical) => {
  const fields = [
    ["canonical", canonical],
    ["description", metadata.description],
    ["launched", metadata.launched],
    ["status", metadata.status],
    ["tags", metadata.tags],
  ];

  return fields
    .filter(([, value]) =>
      Array.isArray(value)
        ? value.length > 0
        : value !== undefined && value !== "",
    )
    .map(([name, value]) => `${name}: ${JSON.stringify(value)}`);
};

const documents = htmlFiles(siteDirectory)
  .map(readDocument)
  .filter((document) => document !== undefined);
const alternatives = new Map(
  documents.map(({ canonical }) => [
    editorialKey(canonical),
    markdownUrl(canonical).href,
  ]),
);
const converter = createConverter();

for (const document of documents) {
  const body = converter
    .turndown(prepareContent(document, alternatives))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!body) throw new Error(`Agent document is empty in ${document.file}`);

  const output = [
    "---",
    ...metadataLines(document.metadata, document.canonical),
    "---",
    "",
    `# ${document.metadata.title}`,
    "",
    body,
    "",
  ].join("\n");
  const destination = outputPath(document.canonical);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, output);
}

console.log(
  `Published ${documents.length} Markdown alternative${documents.length === 1 ? "" : "s"}.`,
);
