import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Matches the Turbopack alias in next.config.ts; vitest does not read
  // tsconfig paths on its own.
  resolve: {
    alias: { "@shared": path.join(here, "..", "shared") },
  },
  test: {
    environment: "node",
    include: ["app/**/*.test.ts"],
  },
});
