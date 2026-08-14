import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "apps/*/vitest.config.ts",
  "apps/*",
  "packages/*/vitest.config.ts",
  "packages/*",
]);
