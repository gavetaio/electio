const { Worker, isMainThread, parentPort } = require('worker_threads');

module.exports = () => {
  if (isMainThread) {
    const worker = new Worker(__filename);
    worker.once('message', (message) => {});
    worker.postMessage('Hello, world!');
  } else {
    parentPort.once('message', (message) => {
      parentPort.postMessage(message);
    });
  }
};
