# Personal CV + Blog (Jekyll)

This repository hosts a Jekyll-powered personal site with an About landing page and a blog under `/blog`. Blog posts live in `_posts/` and unlisted posts are supported via a front matter flag.

## Structure
- `index.md` — About landing page (home).
- `blog/index.html` — Blog listing (excludes unlisted posts).
- `_posts/` — Blog posts (URLs like `/blog/title` via permalink).
- `_layouts/`, `_includes/` — Templates and shared chrome.
- `assets/css/style.css` — Site styles.
- `_config.yml` — Site settings (`url`, `baseurl`, metadata, plugins).

## Local setup
1) Install Ruby (matching the version in the GitHub Actions workflow, 3.1).
2) Install bundler if needed: `gem install bundler`.
3) Install dependencies: `bundle install`.

## Run locally
```sh
bundle exec jekyll serve
```
Then open `http://localhost:4000`. If using a `baseurl`, append it (e.g., `http://localhost:4000/repo-name`).

## Create a post
```sh
# filename format: YYYY-MM-DD-title.md
cat > _posts/2024-03-01-new-post.md <<'EOF'
---
title: My new post
summary: Optional short blurb
# set unlisted: true to hide from the blog index
---

Your markdown content here.
EOF
```

## Comments (Giscus)
1) Enable Discussions on your GitHub repo and install the Giscus app (https://giscus.app).
2) From giscus.app, select your repo + category and copy the generated values into `_config.yml` under the `giscus` block:
   - `repo`, `repo_id`, `category`, `category_id`
   - optional: `mapping`, `theme`, `lang`, `reactions_enabled`, `emit_metadata`
3) Comments appear on posts when configured. To disable for a specific post, set in front matter:
   ```yaml
   comments: false
   ```

## Deployment
GitHub Actions (`.github/workflows/jekyll.yml`) builds and deploys on push to the default branch. Ensure `url`/`baseurl` in `_config.yml` match your GitHub Pages site. If your default branch is `main`, update the workflow trigger accordingly.
