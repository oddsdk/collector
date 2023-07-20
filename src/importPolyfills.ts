
import { polyfillWebCrypto } from "expo-standard-web-crypto";
polyfillWebCrypto();

const TextEncodingPolyfill = require("text-encoding");

Object.assign(global, {
  TextEncoder: TextEncodingPolyfill.TextEncoder,
  TextDecoder: TextEncodingPolyfill.TextDecoder,
});

class FinalizationRegistry {
  constructor(fn: () => void) {
    fn();
  }
}

Object.assign(global, {
  FinalizationRegistry: FinalizationRegistry,
});
