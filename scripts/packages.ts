import { workspaces } from "../package.json";
import {
  type PackageName,
  type PackagePath,
  convertWorkspaceGlobToProjects,
  getPackageName,
  hasPackageJSON,
  isJestProject,
} from "./package-filterers";

type PackageMap = Record<PackageName, PackagePath>;

export const packages = workspaces.map(convertWorkspaceGlobToProjects).flat();

export const packagesWithPackageJson = packages.filter(hasPackageJSON);

export const jestProjects = packages.filter(isJestProject);

export const packageNamesMap: PackageMap = Object.fromEntries(
  packagesWithPackageJson.map((packagePath) => [
    getPackageName(packagePath),
    packagePath,
  ]),
);
