import glob from "glob";
import path from "path";
import fs from "fs";

type Directory = string;
type Glob = string;
export type PackageName = string;
export type PackagePath = string;

export const rootPath = path.join(__dirname, "..");

export const convertWorkspaceGlobToProjects = (
  workspacePattern: string,
): PackagePath[] =>
  glob.sync(path.join(workspacePattern, "/"), { cwd: rootPath, noext: true });

const getFiles = (dir: Directory, fileGlob: Glob) => {
  const files = glob.sync(path.join(dir, fileGlob), {
    cwd: rootPath,
  });

  return files;
};

export const hasPackageJSON = (dir: Directory): boolean => {
  const configFiles = getFiles(dir, "./package.json");

  return configFiles.length > 0;
};

export const isTsupProject = (dir: Directory): boolean => {
  const configFiles = getFiles(dir, "./tsup.config.ts");

  return configFiles.length > 0;
};

const hasJestConfigFile = (dir: Directory): boolean => {
  const configFiles = getFiles(dir, "jest.config.{ts,js,mjs}");

  return configFiles.length > 0;
};

export const isJestProject = (dir: Directory): boolean => {
  return hasJestConfigFile(dir);
};

export function getPackageName(packagePath: PackagePath): PackageName {
  const { name } = JSON.parse(
    fs.readFileSync(path.join(packagePath, "./package.json"), "utf8"),
  );

  if (!name) {
    throw new Error(`${packagePath} is missing a "name" field`);
  }

  return name;
}
