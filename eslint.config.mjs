import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, relative } from "path";
import globals from "globals";
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tsRulesOff = Object.fromEntries(
  Object.keys(tsPlugin.rules).map((ruleName) => [
    `@typescript-eslint/${ruleName}`,
    "off",
  ]),
);

const eslintConfigFilePath = relative(__dirname, __filename);
const tsConfigPath = require.resolve("./tsconfig.source.json");

export default defineConfig(
  tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    eslintConfigPrettier,
    eslintPluginPrettierRecommended,
    {
      // all typescript and javascript files
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      languageOptions: {
        parserOptions: {
          project: [tsConfigPath],
        },
      },
    },
    {
      // commonjs files only
      files: ["**/*.cjs"],
      languageOptions: {
        globals: {
          ...globals.node,
        },
        sourceType: "commonjs",
      },
      rules: {
        ...tsRulesOff,
      },
    },
    {
      // browser files
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
    {
      // this eslint config
      files: [eslintConfigFilePath],
      languageOptions: {
        globals: {
          ...globals.node,
        },
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
