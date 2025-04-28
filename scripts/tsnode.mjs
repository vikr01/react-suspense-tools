import { register } from "ts-node";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

register({
  transpileOnly: true,
  project: require.resolve("../tsconfig.source.json"),
  compilerOptions: {
    module: "CommonJS",
    moduleResolution: "Node",
  },
});
