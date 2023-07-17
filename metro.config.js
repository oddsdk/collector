const { getDefaultConfig } = require('metro-config');
const { resolver: defaultResolver } = getDefaultConfig.getDefaultValues();
exports.resolver = {
  ...defaultResolver,
  sourceExts: [...defaultResolver.sourceExts, "cjs"],
  enablePackageExports: true,
  unstable_enablePackageExports: true,
  unstable_conditionNames: ["react-native", "require", "import"],
  extraNodeModules: require("expo-crypto-polyfills"),
};
