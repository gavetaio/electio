const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('electron', {
  unzipFile: ({ section, files }) => {
    ipcRenderer.send('unzip-call', { section, files });
  },
  fs,
  gc: () => {
    ipcRenderer.send('garbage', null);
  },
  files: {
    get(params) {
      ipcRenderer.send('files-get', params);
    },
    folder() {
      ipcRenderer.send('folder-get');
    },
    on(channel, func) {
      ipcRenderer.on(channel, (event, args) => {
        return func(args);
      });
    },
  },
  api: {
    get(params) {
      ipcRenderer.send('api-call', params);
    },
    on(channel, func) {
      ipcRenderer.on(channel, (event, args) => {
        return func(args);
      });
    },
  },
  elections: {
    run(data) {
      ipcRenderer.send('elections-run', data);
    },
    on(channel, func) {
      ipcRenderer.on(channel, (event, ...args) => {
        return func(...args);
      });
    },
    off(channel) {
      ipcRenderer.removeAllListeners(channel);
    },
  },
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
});
