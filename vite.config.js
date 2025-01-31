import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  build: {
    outDir: "dist",
    lib: {
      entry: "index.js",
      name: "x-state",
      fileName: "x-state",
      formats: ["es", "umd"],
    },
  },
});
