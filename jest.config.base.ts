export default {
  preset: "ts-jest",
  testEnvironment: "jsdom", // or 'node' if no DOM is needed
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transformIgnorePatterns: ["/node_modules/(?!@gitpkg/react-reconciler)/"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: require.resolve("./tsconfig.source.json"),
        isolatedModules: true,
      },
    ],

    "^.+\\.(css|less|scss|sass)$": "jest-transform-stub",

    // strip flow types out of react source code pulled directly from github
    "@gitpkg/react-.*": require.resolve("./testing/deleteFlowTypes.babel"),
  },
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  testMatch: [
    "**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)", // Match only .test.ts/.test.tsx/.test.js/.test.jsx files in __tests__ folders
  ],
  globals: {
    __DEV_STRUCTURAL_ID_DEBUG__: JSON.stringify(false),
  },
  setupFiles: [
    require.resolve("./testing/jest.setup.js"),
    require.resolve("./testing/jest.console-filter.js"),
    require.resolve("./testing/react-github-setup.jest.js"),
  ],
  moduleNameMapper: {
    "nanoid/non-secure": require.resolve("mock-nanoid/non-secure"),
    "react-fiber-identifiers/get-unique-identifier": require.resolve(
      "./packages/react-fiber-identifiers/src/getUniqueIdentifier.ts",
    ),
  },
};
