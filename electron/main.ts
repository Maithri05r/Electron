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

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import url from 'url';
import { startDiscovery } from './lanDiscovery';
import { startTCPServer } from "../backend/tcpServer";
import { sendTCPMessage } from "./tcpClient";

const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow | null = null;
let tcpSocket: any = null;

// Enable auto-reload in development
if (isDev) {
  try {
    const projectRoot = path.join(__dirname, '..', '..');
    require('electron-reload')(projectRoot, {
      electron: path.join(projectRoot, 'node_modules', '.bin', 'electron'),
      ignored: /frontend\/dist|dist_electron|node_modules/,
    });
  } catch (e) {
    console.warn('⚠️ Electron reload not available:', e);
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
    console.log(indexPath);

    mainWindow.loadURL(indexPath);
  }
  startTCPServer(5001);
  // Connect to TCP Server
 setTimeout(() => {
  sendTCPMessage("127.0.0.1", 5000, "Hello from App 2!");
}, 2000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

// From React → Send TCP message
ipcMain.on("tcp-send-message", (event, { targetIP, msg }) => {
  if (tcpSocket) {
    console.log(`Sending to ${targetIP}:`, msg);
    tcpSocket.write(msg + "\n");
  }
});

const discovery = startDiscovery("MyElectronApp");
ipcMain.handle("getPeers", async () => {
  return discovery.getPeers();
});



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Example IPC handler
ipcMain.handle('ping', () => 'pong');

// ipcMain.handle('getAppInfo', async () => {
//   return { name: 'My Electron App', version: app.getVersion() };
// });
