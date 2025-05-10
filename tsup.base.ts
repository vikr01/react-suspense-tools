// tsup.base.ts
import { type Options } from "tsup";
import cpy from "cpy";
import { resolve } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export const tsupBaseConfig: Options = {
  entry: ["src", "!src/**/__tests__/**", "!src/**/*.test.*"],
  outDir: "build",
  format: ["esm", "cjs"],
  target: "es2020",
  sourcemap: false,
  splitting: false,
  minify: false,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    __DEV_STRUCTURAL_ID_DEBUG__: JSON.stringify(false),
  },

  dts: {
    resolve: true,
    compilerOptions: {
      module: "Preserve",
      moduleResolution: "Bundler",
    },
  },
  clean: true,
  skipNodeModulesBundle: true,

  // ✅ Tell tsup to use the shared source config
  esbuildOptions(options) {
    options.tsconfig = require.resolve("./tsconfig.json");
  },

  // Copy non-code assets from src → build
  onSuccess: async () => {
    const cwd = process.cwd();
    const srcDir = resolve(cwd, "src");
    const outDir = resolve(cwd, "build");

    await cpy(["**/*", "!**/*.{ts,tsx,js,jsx}"], outDir, {
      cwd: srcDir,
    });
  },
};
