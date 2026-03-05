import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: true,
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90,
      },
      exclude: [
        "node_modules/**",
        "src/test/**",
        "src/**/*.d.ts",
        "src/components/ui/**",
        "vite.config.ts",
        "vitest.config.ts",
        "tailwind.config.ts",
        "postcss.config.js",
        "eslint.config.js",
        "src/vite-env.d.ts",
        "src/main.tsx",
      ],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
