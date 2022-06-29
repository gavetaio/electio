import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import {
  runPath,
  setupFolders,
  clearFolders,
  getAncientHistory,
} from '@gavetaio/engine';
import throttle from 'lodash/throttle';

import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

import { getBoxes, getJsons } from './helpers';
import Memory from './data/memory';
import Api from './api/api';

const { unzipFile } = require('./helpers');

setupFolders(app.getPath('userData'));

const memory = new Memory({ folder: app.getPath('userData') });
const api = new Api({ folder: app.getPath('userData'), memory });

dialog.showErrorBox = (title, content) => {};

const IS_DEVELOPMENT =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (!IS_DEVELOPMENT) {
  console.log = () => null;
}

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=8192');

ipcMain.on('folder-get', (event) => {
  event.reply('folder-done', {
    type: 'folder',
    data: app.getPath('userData'),
  });
});

ipcMain.on('api-call', (event, arg) => {
  const { action, params } = arg;

  api.get({
    action,
    params,
    callback: (result) => {
      event.reply('api-done', {
        data: result,
      });
    },
  });
});

ipcMain.on('files-get', (event, arg) => {
  const { types, params } = arg;

  if (!types?.length) {
    return;
  }

  types.forEach((type: string) => {
    if (type === 'boxes') {
      getBoxes({
        years: params?.years || [],
        folder: app.getPath('userData'),
        callback: (result: any) => {
          event.reply('files-done', {
            type: 'boxes',
            data: result,
          });
        },
      });
    }

    if (type === 'jsons') {
      getJsons({
        folder: app.getPath('userData'),
        callback: (result: any) => {
          event.reply('files-done', {
            type: 'jsons',
            data: result,
          });
        },
      });
    }

    if (type === 'base') {
      memory.getDataFromIds(params, (result) => {
        event.reply('files-done', {
          type,
          id: result.eleicao.resumo.id,
          data: result,
        });
      });
    }

    if (type === 'candidates') {
      memory.getCandidatesFull(params, (result) => {
        event.reply('files-done', {
          type,
          id: null,
          data: result,
        });
      });
    }

    if (type === 'elections') {
      memory.getElectionsFull(params, (result) => {
        event.reply('files-done', {
          type,
          id: null,
          data: result,
        });
      });
    }

    if (type === 'unavailable') {
      memory.getElectionsUnavailable(params, (result) => {
        event.reply('files-done', {
          type,
          id: null,
          data: result,
        });
      });
    }

    if (type === 'affected') {
      memory.getElectionsAffected(params, (result) => {
        event.reply('files-done', {
          type,
          id: null,
          data: result,
        });
      });
    }

    if (type === 'ancient') {
      const elections = getAncientHistory();
      event.reply('files-done', {
        type,
        data: elections || null,
      });
    }

    if (type === 'list') {
      memory.getElectionList((result) => {
        result.forEach((item) => {
          item.coligacoes = null;
        });
        event.reply('files-done', {
          type,
          data: result,
        });
      }, !!params.resetCache);
    }
  });
});

ipcMain.on('unzip-call', async (event, arg) => {
  const { section, files } = arg;
  const result = [];

  const UF = section.split('-')[0];

  for (let i = 0; i < files.length; i += 1) {
    try {
      const unzipped = await unzipFile(app.getPath('userData'), files[i], UF);
      result.push(...unzipped);
    } catch (e) {}
  }

  event.reply('unzip-done', { section, files: result });
});

ipcMain.on('elections-run', (event, { section, files }) => {
  process.once('uncaughtException', (error: any) => {
    clearFolders(app.getPath('userData'));
    event.reply('elections-done', { error: true });
  });

  const debouncedData = throttle((data) => {
    event.reply('elections-log', data);
  }, 125);

  try {
    runPath({
      files,
      section,
      folder: app.getPath('userData'),
      logger: (data: any) => {
        if (data) {
          debouncedData(data);
        }
      },
      callback: (e: any) => {
        event.reply('elections-done', { success: true, section });
      },
    });
  } catch (e) {
    event.reply('elections-log', { print: 'catch-e' });
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (IS_DEVELOPMENT) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1440,
    height: 900,
    titleBarStyle: 'hiddenInset',
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      devTools: false,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.webContents.on('did-frame-finish-load', () => {
    if (IS_DEVELOPMENT) {
      installExtensions();
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  new AppUpdater();
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
