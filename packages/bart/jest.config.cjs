const baseConfig = require("@jspsych/config/jest").makePackageConfig(__dirname);

// Remove the @jspsych-contrib mapping since we use the actual npm package
const { "^@jspsych-contrib/(.*)$": _, ...moduleNameMapper } = baseConfig.moduleNameMapper || {};

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    ...moduleNameMapper,
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};
