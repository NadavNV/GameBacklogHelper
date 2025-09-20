import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load default root-level .env
  const rootEnv = loadEnv(mode, process.cwd());
  const env = {
    ...rootEnv,
  };
  return {
    root: ".",
    plugins: [react(), tailwindcss()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./test/setupTest.ts",
      deps: {
        moduleDirectories: ["node_modules", path.resolve(__dirname, "src")],
      },
      alias: {
        src: path.resolve(__dirname, "src"),
      },
    },
    define: {
      VITE_JWT_SECRET: JSON.stringify(env.VITE_JWT_SECRET),
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, "src"),
      },
    },
  };
});
