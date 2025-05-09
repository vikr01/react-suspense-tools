import { createConfig } from "@vikr01/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";
import { join as pathJoin } from "path";
import { packageNamesMap } from "../../scripts/packages";

const tsConfigPath = require.resolve("../../tsconfig.source.json");

export default defineConfig(
  createConfig({
    browser: {
      files: [
        pathJoin(
          packageNamesMap["react-suspense-examples-vite"],
          "./**/*.{ts,tsx,js,jsx}",
        ),
      ],
      react: true,
    },
    json: false,
    typescript: true,
    tsConfigPath,
  }),
  globalIgnores(["packages/*/build/"]),
);
