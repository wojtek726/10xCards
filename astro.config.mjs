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
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: process.env.RUNNING_E2E ? true : false
  },
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
    build: {
      rollupOptions: {
        external: [/\.test\.tsx?$/, /\.spec\.tsx?$/, /__tests__/],
      },
    },
    optimizeDeps: {
      exclude: ['vitest']
    },
    define: process.env.RUNNING_E2E ? {
      'import.meta.vitest': 'undefined',
    } : {},
  },
  adapter: node({
    mode: "standalone",
  }),
});
