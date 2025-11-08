// preload.ts
import { contextBridge, ipcRenderer } from "electron";

// Map the user's callback -> actual handler we registered
const handlerMap = new WeakMap<
  (data: { msg: string; fromIP: string }) => void,
  (event: Electron.IpcRendererEvent, data: { msg: string; fromIP: string }) => void
>();

contextBridge.exposeInMainWorld("electronAPI", {
  ping: () => ipcRenderer.invoke("ping"),
  getPeers: () => ipcRenderer.invoke("getPeers"),
  sendTCPMessage: (ip: string, msg: string) => ipcRenderer.invoke("sendTCPMessage", ip, msg),

  onTCPMessage: (cb: (data: { msg: string; fromIP: string }) => void) => {
    // Wrap once and store
    let handler = handlerMap.get(cb);
    if (!handler) {
      handler = (_e, data) => cb(data);
      handlerMap.set(cb, handler);
    }
    ipcRenderer.on("tcp:message", handler);
  },

  removeTCPMessageListener: (cb?: (data: { msg: string; fromIP: string }) => void) => {
    if (cb) {
      const handler = handlerMap.get(cb);
      if (handler) {
        ipcRenderer.removeListener("tcp:message", handler);
        handlerMap.delete(cb);
      }
      return;
    }
    // Optional convenience: remove all if no cb passed
    ipcRenderer.removeAllListeners("tcp:message");
    
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