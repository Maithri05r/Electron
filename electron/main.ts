// import { app, BrowserWindow, ipcMain } from 'electron';
// import path from 'path';
// import url from 'url';

// if (process.env.NODE_ENV === 'development') {
//   try {
//     // Resolve project root instead of dist/
//     const projectRoot = path.join(__dirname, '..', '..');
//     require('electron-reload')(projectRoot, {
//       electron: path.join(projectRoot, 'node_modules', '.bin', 'electron'),
//       ignored: /frontend|dist_electron|node_modules/,
//     });
//   } catch (e) {
//     console.warn('Electron reload not available:', e);
//   }
// }

// const isDev = process.env.NODE_ENV === 'development';
// let mainWindow: BrowserWindow | null = null;

// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1280,
//     height: 800,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       contextIsolation: true,
//     },
//   });

//   // const startUrl = isDev
//   //   ? 'http://localhost:5173'
//   //   : url.pathToFileURL(path.join(__dirname, '../renderer/index.html')).toString();

//   // mainWindow.loadURL(startUrl);

//   if (isDev) {
//     const startUrl = isDev
//       ? 'http://localhost:5173'
//       : url.pathToFileURL(path.join(__dirname, '../../renderer/index.html')).toString();

//     //mainWindow.loadURL('http://localhost:5173');
//     mainWindow.loadURL(startUrl);
//     mainWindow.webContents.openDevTools();
//   } else {
//     mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
//   }
// }

// app.whenReady().then(createWindow);
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit();
// });

// ipcMain.handle('ping', () => 'pong');

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import url from 'url';
import { startDiscovery } from './lanDiscovery';
import { startTCPServer } from '../backend/tcpServerForChat';
import { sendTCPMessage } from './tcpClientForChat';
import fs from 'node:fs';
import { config } from './config/config';

const APP_NAME = config.APP_NAME;
const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow | null = null;

//  add: keep a handle to discovery
let discovery: ReturnType<typeof startDiscovery> | null = null;

// Enable auto-reload in development
if (isDev) {
  try {
    const projectRoot = path.join(__dirname, '..', '..');
    require('electron-reload')(projectRoot, {
      electron: path.join(projectRoot, 'node_modules', '.bin', 'electron'),
      ignored: /frontend\/dist|dist_electron|node_modules/,
    });
  } catch (e) {
    console.warn(' Electron reload not available:', e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // Load Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Load the built frontend
    const indexPath = url.pathToFileURL(
      path.join(__dirname, '../../frontend/dist/index.html'),
    ).href;
    // console.log(indexPath);

    mainWindow.loadURL(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// app.whenReady().then(createWindow);

app.whenReady().then(() => {
  createWindow();

  // Start UDP peer discovery (optional)
  discovery = startDiscovery(APP_NAME);

  if (!(global as any).__tcpServer) {
    (global as any).__tcpServer = startTCPServer();
  }
  const tcpServer = (global as any).__tcpServer;

  // Ensure we forward to renderer only once
  if (!(global as any).__tcpForwardWired) {
    tcpServer.onMessage((msg: string, fromIP: string) => {
      BrowserWindow.getAllWindows().forEach((w) =>
        w.webContents.send('tcp:message', { msg, fromIP }),
      );
    });
    (global as any).__tcpForwardWired = true;
  }

  // Re-register IPC handlers idempotently
  ipcMain.removeHandler('sendTCPMessage');
  ipcMain.removeHandler('getPeers');

  ipcMain.handle('saveBase64ToFile', async (_e, { suggestedName, base64, mime }) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: suggestedName || 'received-file',
    });
    if (canceled || !filePath) return { ok: false };

    // write base64 to disk
    await fs.promises.writeFile(filePath, Buffer.from(base64, 'base64'));
    return { ok: true, path: filePath };
  });

  ipcMain.handle('openPath', async (_e, p: string) => {
    const res = await shell.openPath(p);
    return { ok: res === '' };
  });

  //  IPC: Send TCP message to another node
  ipcMain.handle('sendTCPMessage', async (_event, ip: string, msg: string) => {
    await sendTCPMessage(ip, msg);
  });

  //  IPC: Get current discovered peers
  ipcMain.handle('getPeers', async () => discovery?.getPeers() ?? []);
  console.log(' Electron main initialized (server + discovery)');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Example IPC handler
ipcMain.handle('ping', () => 'pong');
