import { createRequire } from "module";

const require = createRequire(import.meta.url);

export default {
  preset: "ts-jest",
  testEnvironment: "jsdom", // or 'node' if no DOM is needed
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      { tsconfig: require.resolve("./tsconfig.source.json") },
    ],
    "^.+\\.(css|less|scss|sass)$": "jest-transform-stub",
  },
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  globals: {
    __DEV_STRUCTURAL_ID_DEBUG__: JSON.stringify(false),
  },
  setupFiles: [
    require.resolve("./testing/jest.setup.js"),
    require.resolve("./testing/jest.console-filter.js"),
  ],
  moduleNameMapper: {
    "nanoid/non-secure": require.resolve("mock-nanoid/non-secure"),
  },
};
