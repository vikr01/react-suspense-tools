import glob from "glob";
import path from "path";
import { packages } from "./scripts/packages";

const hasJestConfigFile = (dir: string) => {
  const configFiles = glob.sync(path.join(dir, "jest.config.{ts,js,mjs}"), {
    cwd: __dirname,
  });
  return configFiles.length > 0;
};

const directories = packages.filter(hasJestConfigFile);

export default {
  projects: [...directories],
};
