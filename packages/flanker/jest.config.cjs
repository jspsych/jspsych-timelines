const baseConfig = require("@jspsych/config/jest").makePackageConfig(__dirname);

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    "\\.css$": "<rootDir>/src/__mocks__/styleMock.js",
  },
};
