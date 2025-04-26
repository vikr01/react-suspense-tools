import babelJest from "babel-jest";

export default babelJest.createTransformer({
  configFile: false,
  presets: [
    require.resolve("@babel/preset-env"),
    require.resolve("@babel/preset-flow"),
  ],
});
