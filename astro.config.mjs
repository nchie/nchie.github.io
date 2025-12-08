import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://nchie.github.io",
  integrations: [preact(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
