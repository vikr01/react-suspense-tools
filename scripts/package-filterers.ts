import glob from "glob";
import path from "path";

export const rootPath = path.join(__dirname, "..");

export const convertWorkspaceGlobToProjects = (
  workspacePattern: string,
): string[] =>
  glob.sync(path.join(workspacePattern, "/"), { cwd: rootPath, noext: true });

const getFiles = (dir: string, fileGlob: string) => {
  const files = glob.sync(path.join(dir, fileGlob), {
    cwd: rootPath,
  });

  return files;
};

export const hasPackageJSON = (dir: string) => {
  const configFiles = getFiles(dir, "./package.json");

  return configFiles.length > 0;
};

export const isTsupProject = (dir: string) => {
  const configFiles = getFiles(dir, "./tsup.config.ts");

  return configFiles.length > 0;
};

const hasJestConfigFile = (dir: string) => {
  const configFiles = getFiles(dir, "jest.config.{ts,js,mjs}");

  return configFiles.length > 0;
};

export const isJestProject = (dir: string) => {
  return hasJestConfigFile(dir);
};
