import glob from "glob";
import path from "path";
import { workspaces } from "./package.json";

const convertWorkspaceGlobToProjects = (workspacePattern: string): string[] =>
  glob.sync(path.join(workspacePattern, "/"), { cwd: __dirname, noext: true });

const hasJestConfigFile = (dir: string) => {
  const configFiles = glob.sync(path.join(dir, "jest.config.{ts,js,mjs}"), {
    cwd: __dirname,
  });
  return configFiles.length > 0;
};

const directories = workspaces
  .map(convertWorkspaceGlobToProjects)
  .flat()
  .filter(hasJestConfigFile);

export default {
  projects: [...directories],
};
