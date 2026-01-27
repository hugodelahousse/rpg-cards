import type { Config } from "@react-router/dev/config";

export default {
  // Static hosting (GitHub Pages)
  ssr: false,
  // Pre-render all static routes at build time
  // Dynamic routes like /editor/:templateId will use SPA fallback
  prerender: ["/", "/editor", "/editor/new"],
  // Base path for GitHub Pages
  basename: "/rpg-cards",
} satisfies Config;
