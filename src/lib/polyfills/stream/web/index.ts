const {
  Readable,
  Writable,
  Transform,
  // Duplex,
  // pipeline,
  // finished
} = require("readable-stream");

export default {
  ReadableStream: Readable,
  TransformStream: Transform,
  WritableStream: Writable,
};
