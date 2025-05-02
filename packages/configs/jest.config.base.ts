import type { Config } from "@jest/types";
import path from "path";

const config: Config.InitialOptions = {
  preset: path.join(require.resolve("ts-jest/package.json"), ".."),
  testEnvironment: require.resolve("jest-environment-jsdom"),
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      require.resolve("ts-jest"),
      {
        tsconfig: require.resolve("./tsconfig.jest.json"),
      },
    ],

    "^.+\\.(css|less|scss|sass)$": [require.resolve("jest-transform-stub"), {}],
  },
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)", // Match only .test.ts/.test.tsx/.test.js/.test.jsx files in __tests__ folders
  ],
  globals: {
    __DEV_STRUCTURAL_ID_DEBUG__: JSON.stringify(false),
  },
  setupFiles: [
    require.resolve("./testing/jest.setup.ts"),
    require.resolve("./testing/jest.console-filter.ts"),
  ],
  moduleNameMapper: {
    "nanoid/non-secure": require.resolve("mock-nanoid/non-secure"),
    // due to __DEV_STRUCTURAL_ID_DEBUG__ being compiled out, but needed in testing
    "react-fiber-identifiers/get-unique-identifier": require.resolve(
      "../react-fiber-identifiers/src/getUniqueIdentifier.ts",
    ),
  },
};

export default config;
