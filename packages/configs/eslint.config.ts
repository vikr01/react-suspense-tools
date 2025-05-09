import { createConfig } from "@vikr01/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { join as pathJoin } from "path";
import globals from "globals";
import { packageNamesMap } from "../../scripts/packages";

const tsConfigPath = require.resolve("../../tsconfig.source.json");

export default defineConfig(
  createConfig({ json: false, typescript: true, tsConfigPath }),
  {
    // browser files
    files: [
      pathJoin(
        packageNamesMap["react-suspense-examples-vite"],
        "./**/*.{ts,tsx,js,jsx}",
      ),
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  globalIgnores(["packages/*/build/"]),
);
