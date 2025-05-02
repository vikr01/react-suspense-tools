declare global {
  // eslint-disable-next-line no-var
  var __DEV__: boolean;
}

process.env.NODE_ENV = "development";
global.__DEV__ = true;

export {};
