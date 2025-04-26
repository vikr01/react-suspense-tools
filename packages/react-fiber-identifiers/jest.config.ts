import type { Config } from "@jest/types";
import path from "path";
import baseConfig from "../../jest.config.base";

const config: Config.InitialOptions = {
  ...baseConfig,

  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    // "^shared$": "@gitpkg/react-shared",
  },

  setupFiles: [
    ...(baseConfig.setupFiles ?? []),
    require.resolve("./testing/react-github-setup.jest.js"),
  ],

  transform: {
    ...baseConfig.transform,

    // strip flow types out of react source code pulled directly from github
    "@gitpkg/react-.*": require.resolve("../../testing/deleteFlowTypes.babel"),
    [path.dirname(require.resolve("shared/package.json"))]: require.resolve(
      "../../testing/deleteFlowTypes.babel",
    ),
  },

  transformIgnorePatterns: [
    ...(baseConfig.transformIgnorePatterns ?? []),
    "/node_modules/(?!@gitpkg/react-.*)/",
    "/node_modules/(?!shared)/",
  ],
};

export default config;
