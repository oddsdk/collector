const { getDefaultConfig } = require('metro-config');
const { resolver: defaultResolver } = getDefaultConfig.getDefaultValues();
const nodeLibsExpo = require("node-libs-expo");
const path = require("path");

nodeLibsExpo.net = `${__dirname}/node_modules/node-libs-expo/mock/net.js`;
nodeLibsExpo.tls = `${__dirname}/node_modules/node-forge/lib/tls.js`;

exports.resolver = {
  ...defaultResolver,
  assetExts: [...defaultResolver.assetExts, "wasm"],
  blockList: [
    defaultResolver.blockList,
    /(\/undici\/.*)$/,
    /(\/native-fetch\/.*)$/,
  ],
  sourceExts: [...defaultResolver.sourceExts, "cjs"],
  enablePackageExports: true,
  unstable_enablePackageExports: true,
  unstable_conditionNames: ["react-native", "require", "import"],
  extraNodeModules: {
    ...nodeLibsExpo,
    async_hooks: require.resolve("@creditkarma/async-hooks"),
    "native-fetch": require.resolve("react-native-fetch-polyfill"),
    // stream: path.resolve(__dirname, "./node_modules/readable-stream"),
    "stream/web": require.resolve(
      `${__dirname}/src/lib/polyfills/stream/web/index.ts`
    ),
    // ...require("expo-crypto-polyfills"),
    // crypto: require.resolve("expo-crypto"),
  },
  fallback: {
    "util/types": false,
    "stream/web": require.resolve(
      `${__dirname}/src/lib/polyfills/stream/web/index.ts`
    ),
    perf_hooks: false,
    async_hooks: false,
    dns: false,
    tls: false,
    child_process: false,
    fs: false,
    net: require.resolve("net-websocket-polyfill"),
    diagnostics_channel: require.resolve("diagnostics_channel"),
    worker_threads: require.resolve("bthreads"),
    // ...require("expo-crypto-polyfills"),
    // crypto: require.resolve("expo-crypto"),
  },
};
