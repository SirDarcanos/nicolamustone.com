// Generates the brand cards and social profile backdrops.
//
// Served by the site (referenced from src/components/SEO.astro):
//   public/og.png        1200x630  name, tagline, and the profile photo
//   public/og-plain.png  1200x630  typography only, centred
//
// Uploaded by hand to each platform, not deployed:
//   social/bluesky-banner.png   3000x1000  3:1
//   social/mastodon-header.png  1500x500   3:1
//   social/linkedin-cover.png   1584x396   4:1
//   social/paypalme-cover.png   1200x662   content kept in the top-centre crop
//
// Run manually after changing the photo, the tagline, or the brand colours:
//   node scripts/generate-images.mjs
//
// Uses sharp, which already ships with Astro's image pipeline. Text is drawn in
// the real site faces, so Space Grotesk and JetBrains Mono must be installed
// system-wide — the libvips build here resolves fonts through CoreText, not
// fontconfig, so a local font directory won't be picked up.

import { access, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const PHOTO = fileURLToPath(
  new URL("../src/assets/nico-full.jpeg", import.meta.url),
);
const PUBLIC_DIR = new URL("../public/", import.meta.url);
const SOCIAL_DIR = new URL("../social/", import.meta.url);

// Brand colours, from src/styles/global.css (.dark).
const BACKGROUND = "#14131b";
const ACCENT = "#8f87f0";
const HEADLINE = "#ffffff";
const BODY = "#cbc9d6";

const DISPLAY_FONT = "Space Grotesk";
const MONO_FONT = "JetBrains Mono";

const EYEBROW = "NICOLAMUSTONE.COM";
const NAME = "Nicola Mustone";
const TAGLINE = "Does things and ships them";

/* Vertical rhythm, expressed as multiples of the name's font size so every
   canvas keeps the same proportions regardless of how large the type is set. */
const EYEBROW_GAP = 1.096;
const TAGLINE_GAP = 0.654;

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* A centred eyebrow / name / tagline block, anchored on the name's baseline. */
function typeBlock({ x, nameBaseline, nameSize, anchor = "middle" }) {
  const eyebrowSize = Math.round(nameSize * 0.25);
  const taglineSize = Math.round(nameSize * 0.4);

  return `
  <text x="${x}" y="${nameBaseline - nameSize * EYEBROW_GAP}" text-anchor="${anchor}"
        font-family="${MONO_FONT}" font-size="${eyebrowSize}"
        letter-spacing="${(eyebrowSize * 0.155).toFixed(2)}"
        fill="${ACCENT}">${escape(EYEBROW)}</text>
  <text x="${x}" y="${nameBaseline}" text-anchor="${anchor}"
        font-family="${DISPLAY_FONT}" font-size="${nameSize}" font-weight="700"
        fill="${HEADLINE}">${escape(NAME)}</text>
  <text x="${x}" y="${nameBaseline + nameSize * TAGLINE_GAP}" text-anchor="${anchor}"
        font-family="${DISPLAY_FONT}" font-size="${taglineSize}"
        fill="${BODY}">${escape(TAGLINE)}</text>`;
}

/* `barY` is where the accent rule sits — normally the bottom edge, but PayPal
   crops the canvas, so there it sits at the bottom of the visible area. */
function canvas({ w, h, glowX = "50%", glowY = "48%", barY = null, content }) {
  const bar = barY ?? h - Math.max(4, Math.round(h * 0.0127));
  const barHeight = Math.max(4, Math.round(h * 0.0127));

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <radialGradient id="glow" cx="${glowX}" cy="${glowY}" r="52%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${BACKGROUND}" />
  <rect width="${w}" height="${h}" fill="url(#glow)" />
  ${content}
  <rect x="0" y="${bar}" width="${w}" height="${barHeight}" fill="${ACCENT}" />
</svg>`;
}

async function write(dir, name, svg, composites = []) {
  const png = await sharp(Buffer.from(svg))
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toBuffer();

  await writeFile(fileURLToPath(new URL(name, dir)), png);
  return png.length;
}

/* ---------------------------------------------------------------- OG cards */

const OG_W = 1200;
const OG_H = 630;
const PAD = 80;
const AVATAR = 300;

const avatarLeft = OG_W - PAD - AVATAR;
const avatarTop = Math.round((OG_H - AVATAR) / 2);
const r = AVATAR / 2;

/* Square crop around the face, as fractions of the source. The photo is a tall
   portrait, so a centred crop would land on his chest — this biases upward and
   leaves the head about two thirds of the circle. */
const CROP = { centerX: 0.515, centerY: 0.495, size: 0.5 };

const circleMask = `
<svg xmlns="http://www.w3.org/2000/svg" width="${AVATAR}" height="${AVATAR}">
  <circle cx="${r}" cy="${r}" r="${r}" fill="#fff" />
</svg>`;

/* Only og.png needs the photo. If the source isn't checked out, everything else
   is still generated and the existing og.png is left untouched. */
const hasPhoto = await access(PHOTO).then(
  () => true,
  () => false,
);

async function buildAvatar() {
  const source = sharp(PHOTO);
  const { width, height } = await source.metadata();
  const side = Math.round(height * CROP.size);

  return source
    .extract({
      left: Math.max(0, Math.round(width * CROP.centerX - side / 2)),
      top: Math.max(0, Math.round(height * CROP.centerY - side / 2)),
      width: side,
      height: side,
    })
    .resize(AVATAR, AVATAR)
    .composite([{ input: Buffer.from(circleMask), blend: "dest-in" }])
    .png()
    .toBuffer();
}

/* Left-aligned, leaving room for the avatar on the right. */
const withPhotoCard = canvas({
  w: OG_W,
  h: OG_H,
  glowX: "78%",
  glowY: "50%",
  content: `
  ${typeBlock({ x: PAD, nameBaseline: 342, nameSize: 76, anchor: "start" })}
  <circle cx="${avatarLeft + r}" cy="${avatarTop + r}" r="${r + 7}"
          fill="none" stroke="${ACCENT}" stroke-opacity="0.5" stroke-width="3" />`,
});

/* No avatar to balance against, so the type is centred and set larger. */
const plainCard = canvas({
  w: OG_W,
  h: OG_H,
  content: typeBlock({ x: OG_W / 2, nameBaseline: 368, nameSize: 104 }),
});

/* ------------------------------------------------------- Profile backdrops */

/* Every platform overlays the avatar on the lower-left and crops the outer
   edges on mobile, so the type stays centred and a little above the middle.
   `nameBaseline` is a fraction of the height. */
const BANNERS = [
  {
    file: "bluesky-banner.png",
    w: 3000,
    h: 1000,
    nameSize: 182,
    baseline: 0.55,
  },
  {
    file: "mastodon-header.png",
    w: 1500,
    h: 500,
    nameSize: 91,
    baseline: 0.55,
  },
  { file: "linkedin-cover.png", w: 1584, h: 396, nameSize: 72, baseline: 0.55 },
  /* PayPal.me shows only the top-centre 480x265 of a 600x331 upload, so this is
     that at 2x with the type and rule kept inside the visible band. Community
     -reported, not an official spec — worth eyeballing after upload. */
  {
    file: "paypalme-cover.png",
    w: 1200,
    h: 662,
    nameSize: 76,
    baseline: 0.42,
    barY: 530 - 7,
    glowY: "40%",
  },
];

/* ------------------------------------------------------------------- write */

await mkdir(SOCIAL_DIR, { recursive: true });

const results = [];

if (hasPhoto) {
  const avatar = await buildAvatar();
  results.push([
    "public/og.png",
    OG_W,
    OG_H,
    await write(PUBLIC_DIR, "og.png", withPhotoCard, [
      { input: avatar, top: avatarTop, left: avatarLeft },
    ]),
  ]);
} else {
  console.warn(
    `! ${PHOTO} is missing — skipping og.png, leaving the existing one in place.`,
  );
}

results.push([
  "public/og-plain.png",
  OG_W,
  OG_H,
  await write(PUBLIC_DIR, "og-plain.png", plainCard),
]);

for (const b of BANNERS) {
  const svg = canvas({
    w: b.w,
    h: b.h,
    glowY: b.glowY,
    barY: b.barY,
    content: typeBlock({
      x: b.w / 2,
      nameBaseline: Math.round(b.h * b.baseline),
      nameSize: b.nameSize,
    }),
  });

  results.push([
    `social/${b.file}`,
    b.w,
    b.h,
    await write(SOCIAL_DIR, b.file, svg),
  ]);
}

for (const [name, w, h, bytes] of results) {
  console.log(
    `${name.padEnd(26)} ${`${w}x${h}`.padEnd(10)} ${(bytes / 1024).toFixed(0)} KB`,
  );
}
