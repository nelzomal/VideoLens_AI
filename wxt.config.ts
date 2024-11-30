import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  outDir: "dist",
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["tabs", "tabCapture", "activeTab", "scripting", "offscreen"],
    action: {},
    content_security_policy: {
      extension_pages:
        "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
    },
  },
});
