import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load default root-level .env
  const rootEnv = loadEnv(mode, process.cwd());
  // Merge without overwriting existing keys
  const env = {
    ...rootEnv,
  };
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, "src"),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      root: process.cwd(),
      setupFiles: "./test/setupTests.ts",
      alias: {
        src: path.resolve(__dirname, "src"),
        __mocks__: path.resolve(__dirname, "__mocks__"),
      },
    },
    define: {
      "import.meta.env": JSON.stringify(env),
    },
  };
});
