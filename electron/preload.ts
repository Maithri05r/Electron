// preload.ts
import { contextBridge, ipcRenderer } from "electron";

// Map user's callback -> the actual handler we register
const handlerMap = new WeakMap<
  (data: { msg: string; fromIP: string }) => void,
  (event: Electron.IpcRendererEvent, data: { msg: string; fromIP: string }) => void
>();

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke("ping"),
  getPeers: () => ipcRenderer.invoke("getPeers"),
  sendTCPMessage: (ip: string, msg: string) => ipcRenderer.invoke("sendTCPMessage", ip, msg),

  onTCPMessage: (cb: (data: { msg: string; fromIP: string }) => void) => {
    // idempotent: if we already wrapped this cb, reuse it
    let handler = handlerMap.get(cb);
    if (!handler) {
      handler = (_e, data) => cb(data);
      handlerMap.set(cb, handler);
    }
    ipcRenderer.on("tcp:message", handler);
  },
  // ask main to show a Save dialog and write base64 data
  saveBase64ToFile: (suggestedName: string, base64: string, mime: string) =>
    ipcRenderer.invoke("saveBase64ToFile", { suggestedName, base64, mime }),

  // optionally open a saved file
  openPath: (absolutePath: string) => ipcRenderer.invoke("openPath", absolutePath),

  removeTCPMessageListener: (cb?: (data: { msg: string; fromIP: string }) => void) => {
    if (cb) {
      const handler = handlerMap.get(cb);
      if (handler) {
        ipcRenderer.removeListener("tcp:message", handler);
        handlerMap.delete(cb);
      }
      return;
    }
    // remove all listeners if no cb provided
    ipcRenderer.removeAllListeners("tcp:message");
    // WeakMap entries will GC automatically; no clear() on WeakMap
    
  },
});




// import { contextBridge, ipcRenderer } from 'electron';
// contextBridge.exposeInMainWorld('electronAPI', {
//    ping: () => ipcRenderer.invoke('ping'),
//  getPeers: () => ipcRenderer.invoke("getPeers"),
//  sendTCPMessage: (ip: string, msg: string) => ipcRenderer.invoke("sendTCPMessage", ip, msg),
//   onTCPMessage: (cb: (data: { msg: string; fromIP: string }) => void) => {
//     ipcRenderer.on("tcp:message", (_e, data) => cb(data));
//   },
//   removeTCPMessageListener: (cb: any) => {
//     ipcRenderer.removeListener("tcp:message", cb);
//   },
// });