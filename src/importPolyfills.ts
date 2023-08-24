require("node-libs-expo/globals");
const { polyfillWebCrypto } = require("expo-standard-web-crypto");
const TextEncodingPolyfill = require("text-encoding");
import { Worker } from "react-native-workers";
import * as WebAssembly from "react-native-webassembly";

polyfillWebCrypto();

Object.assign(global, {
  FinalizationRegistry: class FinalizationRegistry {
    constructor(fn: () => void) {
      fn();
    }
  },
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
  Worker,
  WebAssembly,
});
