import type { Config } from "@react-router/dev/config";

export default {
  // Static hosting (GitHub Pages)
  ssr: false,
  // Pre-render static routes at build time
  prerender: ["/", "/editor", "/editor/new"],
  // Base path for GitHub Pages
  basename: "/rpg-cards",
} satisfies Config;
