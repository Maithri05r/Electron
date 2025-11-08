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
import { sendTCPMessage,tcpSendMessage, tcpSendRead } from "./tcpClient";

const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow | null = null;

// in-memory tracker: msgId -> { toIP }
const outbox = new Map<string, { toIP: string }>();

// 👉 add: keep a handle to discovery
let discovery: ReturnType<typeof startDiscovery> | null = null;
let tcpServer: ReturnType<typeof startTCPServer> | null = null;

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
  discovery = startDiscovery("MyElectronApp");;

  if (!(global as any).__tcpServer) {
  (global as any).__tcpServer = startTCPServer();

}
const tcpServer = (global as any).__tcpServer;

// Ensure we forward to renderer only once
if (!(global as any).__tcpForwardWired) {
  // tcpServer.onMessage((msg: string, fromIP: string) => {
  //   BrowserWindow.getAllWindows().forEach(w =>
  //     w.webContents.send("tcp:message", { msg, fromIP })
  //   );
  // });
  tcpServer.onMessage((evt: any) => {
      // evt is structured: { type:'MSG'|'ACK'|'READ', fromIP, id?, text?, ids? }
      BrowserWindow.getAllWindows().forEach(w => {
        w.webContents.send('tcp:message', evt);
      });
      });
  (global as any).__tcpForwardWired = true;
}


// Re-register IPC handlers idempotently
ipcMain.removeHandler("sendTCPMessage");
ipcMain.removeHandler("getPeers");
ipcMain.removeHandler('chat:send');
  ipcMain.removeHandler('chat:read');



  //   // Start TCP server (listen for messages)
  // tcpServer = startTCPServer();

  //  // Forward received messages to the renderer
  // tcpServer.onMessage((msg, fromIP) => {
  //   console.log(`📨 Message from ${fromIP}: ${msg}`);
  //   mainWindow?.webContents.send("tcp:message", { msg, fromIP });
  // });

   

   
  
  //  IPC: Send TCP message to another node
  ipcMain.handle("sendTCPMessage", async (_event, ip: string, msg: string) => {
    await sendTCPMessage(ip, msg);
  });

  // ---------- IPC from renderer ----------

// 1) send chat
ipcMain.handle('chat:send', async (_e, toIP: string, id: string, text: string) => {
  outbox.set(id, { toIP });
  await tcpSendMessage(toIP, id, text);
  // Renderer will optimistically insert the message; nothing else to do here
});

// 2) send read receipts (batch allowed)
ipcMain.handle('chat:read', async (_e, toIP: string, ids: string[]) => {
  await tcpSendRead(toIP, ids);
});

   //  IPC: Get current discovered peers
  ipcMain.handle("getPeers", async () => discovery?.getPeers() ?? []);
  console.log(" Electron main initialized (server + discovery)");

});

// ipcMain.handle('lan:getPeers', async () => {
//     return discovery?.getPeers() ?? [];
//   });



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
