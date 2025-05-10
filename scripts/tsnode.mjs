import { register } from "ts-node";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const tsConfig = require.resolve("../tsconfig.json");

register({
  emit: false,
  transpileOnly: false,
  project: tsConfig,
  compilerOptions: {
    module: "CommonJS",
  },
});
