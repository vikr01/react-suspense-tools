import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { createRequire } from "module";
import globals from "globals";
const require = createRequire(import.meta.url);

const tsConfigPath = require.resolve("./tsconfig.source.json");

export default defineConfig(
  tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    eslintConfigPrettier,
    eslintPluginPrettierRecommended,
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      languageOptions: {
        parserOptions: {
          project: [tsConfigPath],
        },
      },
    },
    {
      files: ["**/testing/*.js"],
      globals: {
        ...globals.node,
      },
      languageOptions: {
        sourceType: "commonjs",
      },
    },
    {
      files: ["packages/react-suspense-examples-vite/**/*.{ts,tsx,js,jsx}"],
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
    globalIgnores([
      "**/node_modules/",
      "**/build/",
      "**/tsup.*.ts",
      "./packages/react-suspense-examples/config/",
      "./packages/react-suspense-examples/scripts/",
    ]),
  ),
);
