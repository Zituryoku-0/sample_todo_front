import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      include: [
        "app/**/*.{js,jsx,ts,tsx}",
        "lib/**/*.{js,jsx,ts,tsx}",
        "proxy.ts",
      ],
    },
  },
});
