import { workspaces } from "../package.json";
import {
  convertWorkspaceGlobToProjects,
  hasPackageJSON,
  isJestProject,
} from "./package-filterers";

export const packages = workspaces.map(convertWorkspaceGlobToProjects).flat();

export const packagesWithPackageJson = packages.filter(hasPackageJSON);

export const jestProjects = packages.filter(isJestProject);
