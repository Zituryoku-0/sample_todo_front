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
        "app/(authenticated)/**/*.{js,jsx,ts,tsx}",
        "src/(public)/**/*.{js,jsx,ts,tsx}",
        "src/api/**/*.{js,jsx,ts,tsx}",
        "src/components/**/*.{js,jsx,ts,tsx}",
      ],
    },
  },
});
