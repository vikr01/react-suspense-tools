import "./scripts/tsnode.mjs";
import { defineConfig, globalIgnores } from "eslint/config";
import { createRequire } from "module";
import { createConfig } from "@vikr01/eslint-config";

const require = createRequire(import.meta.url);
const tsConfigPath = require.resolve("./tsconfig.source.json");
const eslintConfig =
  require("react-suspense-tools-configs/eslint.config").default;

export default defineConfig(
  eslintConfig.default,
  createConfig({
    typescript: true,
    tsConfigPath,
  }),
  globalIgnores(["packages/*/build"]),
);
