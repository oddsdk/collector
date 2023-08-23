const {
  Readable,
  Writable,
  Transform,
  Duplex,
  // pipeline,
  // finished
} = require("readable-stream");

export default {
  DuplexStream: Duplex,
  ReadableStream: Readable,
  TransformStream: Transform,
  WritableStream: Writable,
};
