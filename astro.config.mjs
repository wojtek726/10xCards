// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    react(),
    sitemap()
  ],
  server: { port: 3000 },
  vite: {
    server: {
      watch: {
        usePolling: true,
      },
    },
    envPrefix: [
      'PUBLIC_',
      'SUPABASE_'
    ],
  },
  adapter: node({
    mode: "standalone",
  }),
});
