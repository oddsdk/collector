require("node-libs-expo/globals");
const { polyfillWebCrypto } = require("expo-standard-web-crypto");
const TextEncodingPolyfill = require("text-encoding");
import { Worker } from "react-native-workers";
import * as WebAssembly from "react-native-webassembly";

polyfillWebCrypto();

global.Worker = Worker;

global.WebAssembly = WebAssembly;

// if (!global.WebAssembly) {
//   global.WebAssembly = require("webassemblyjs");
// }

Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
});

Object.assign(global, {
  FinalizationRegistry: class FinalizationRegistry {
    constructor(fn: () => void) {
      fn();
    }
  },
});
