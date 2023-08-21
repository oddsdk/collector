const { getDefaultConfig } = require('metro-config');
const { resolver: defaultResolver } = getDefaultConfig.getDefaultValues();
const nodeLibsExpo = require("node-libs-expo");

nodeLibsExpo.net = `${__dirname}/node_modules/node-libs-expo/mock/net.js`;
nodeLibsExpo.tls = `${__dirname}/node_modules/node-forge/lib/tls.js`;
console.log("nodeLibsExpo", nodeLibsExpo);

exports.resolver = {
  ...defaultResolver,
  sourceExts: [...defaultResolver.sourceExts, "cjs"],
  enablePackageExports: true,
  unstable_enablePackageExports: true,
  unstable_conditionNames: ["react-native", "require", "import"],
  extraNodeModules: {
    ...nodeLibsExpo,
    stream: require.resolve("readable-stream"),
    'stream/web': require.resolve("readable-stream"),
  },
  // extraNodeModules: [nodeLibsExpo, require("expo-crypto-polyfills")],
};
