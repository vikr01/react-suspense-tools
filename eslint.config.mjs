import "./scripts/tsnode.mjs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const eslintConfig = require("react-suspense-tools-configs/eslint.config");

export default eslintConfig.default;
