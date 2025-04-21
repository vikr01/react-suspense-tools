import { defineConfig, globalIgnores } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

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
          project: [require.resolve("./tsconfig.source.json")],
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
