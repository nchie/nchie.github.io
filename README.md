# Personal CV + Blog (Astro + Preact + MDX)

Static site built with Astro, Preact integration, and MDX content. Posts live in `src/content/blog` and render under `/blog/slug`.

## Structure
- `astro.config.mjs` — Astro setup with Preact + MDX.
- `src/pages/` — Routes (`/`, `/blog`, `/blog/[slug]`).
- `src/layouts/` — Base, page, and post layouts.
- `src/content/blog/` — MDX posts with frontmatter (includes `unlisted` + `comments` flags).
- `src/styles/global.css` — Global styling, slider, tooltips, lightbox.
- `public/` — Static assets and JS (`/images`, `/scripts`).
- `src/config/site.ts` — Site metadata + Giscus config.

## Prereqs
- Node.js 20+

## Install & run
```sh
npm install
npm run dev   # http://localhost:4321
```

## Build
```sh
npm run build
```
Output goes to `dist/`.

## Add a post
Create `src/content/blog/2025-01-01-my-post.mdx`:
```md
---
title: "My post"
subtitle: "Optional subtitle"
pubDate: "2025-01-01"
summary: "Optional short blurb"
unlisted: false   # set true to hide from /blog
comments: true    # set false to disable Giscus
---

Your MDX/Markdown content here.
```

## Comments (Giscus)
- Fill `src/config/site.ts` `giscus` fields (`repo`, `repoId`, `category`, `categoryId`, etc.).
- Comments render on posts unless `comments: false` in the frontmatter.

## Deployment
- GitHub Actions workflow in `.github/workflows/astro.yml` builds and deploys to Pages (`dist/`). Ensure repo Pages is set to GitHub Actions. Adjust `site` in `astro.config.mjs` if your domain changes.
