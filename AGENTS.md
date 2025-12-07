# Repository Guidelines

## Project Structure & Module Organization
- Astro + Preact + MDX site. Key entry: `astro.config.mjs` and `tsconfig.json` (strict TypeScript, `jsxImportSource` set to Preact).
- Routes in `src/pages/`; shared wrappers in `src/layouts/`; reusable UI in `src/components/`.
- Content lives under `src/content/blog/` (`YYYY-MM-DD-slug.mdx`); assets and helper scripts live in `public/`.
- Global styling in `src/styles/global.css`; site metadata and Giscus settings in `src/config/site.ts`.

## Build, Test, and Development Commands
- `npm install` — install dependencies (Node 20+).
- `npm run dev` (alias `npm start`) — local dev server at `http://localhost:4321`.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve the built site for smoke testing.
- `npm run check` — Astro/TypeScript type and config check; run before opening a PR.

## Coding Style & Naming Conventions
- Languages: Astro, TypeScript, Preact components, MDX content.
- Formatting: prefer 2-space indentation; keep imports sorted by scope (stdlib → project → relative) when feasible.
- Component names: PascalCase for files in `src/components/`; route files in `src/pages/` follow their URL (e.g., `blog/[slug].astro`).
- Content filenames: `YYYY-MM-DD-title.mdx`; include frontmatter fields used across the site (`title`, `subtitle`, `pubDate`, `summary`, `unlisted`, `comments`).

## Testing Guidelines
- No dedicated test suite yet; rely on `npm run check` plus manual verification.
- Smoke-test critical paths after changes: home page, blog index, a post page (including comments visibility), and any new interactive components.
- If adding tests later, colocate under the relevant feature directory and mirror the file name (e.g., `Component.test.(ts|tsx)`).

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject lines (e.g., `Add card hover states`); group related changes.
- Before PR: run `npm run check`, `npm run build`, and `npm run preview` for a quick visual review.
- PRs: describe the change and motivation; reference issues when applicable; include before/after screenshots or GIFs for UI updates; note any content/frontmatter changes that require review.

## Configuration & Security Tips
- Keep `src/config/site.ts` in sync with deployment domain; update Giscus fields (`repo`, `repoId`, `category`, `categoryId`) and ensure secrets are configured in the hosting environment.
- Do not commit API tokens or private data; place static assets in `public/` and reference them relatively.
