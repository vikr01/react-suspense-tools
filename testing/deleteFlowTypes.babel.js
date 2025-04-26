console.log('babel just setting up');

module.exports = require("babel-jest").default.createTransformer({
  configFile: false,
  presets: [
    require.resolve("@babel/preset-env"),
    require.resolve("@babel/preset-flow"),
  ]
});
