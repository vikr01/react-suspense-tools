import glob from "glob";
import path from "path";
import { workspaces } from "../package.json";

const rootPath = path.join(__dirname, "..");

const convertWorkspaceGlobToProjects = (workspacePattern: string): string[] =>
  glob.sync(path.join(workspacePattern, "/"), { cwd: rootPath, noext: true });

const packages = workspaces.map(convertWorkspaceGlobToProjects).flat();

export { packages };
