import { defineConfig } from "astro/config";

// --- CORRECT IMPORTS ---
import tailwind from "@astrojs/tailwind"; // The official Astro integration
import svelte from "@astrojs/svelte";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import { siteUrl } from "./src/data/site.json";

// https://astro.build/config
export default defineConfig({
  
  // --- CORRECT INTEGRATIONS ARRAY ---
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    svelte(),
    mdx(),
    sitemap()
  ],

  site: siteUrl,

  redirects: {
    "/posts": "/",
  },
});