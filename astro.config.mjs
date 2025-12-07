import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://nchie.github.io",
  integrations: [preact(), mdx()],
});
