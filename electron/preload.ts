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

  // Subscribe and return an unsubscribe
  onTCPMessage: (cb: (data: { msg: string; fromIP: string }) => void) => {
    const handler = (_e: any, data: any) => cb(data);
    ipcRenderer.on("tcp:message", handler);
    return () => ipcRenderer.removeListener("tcp:message", handler);
  },

  // onTCPMessage: (cb: (data: { msg: string; fromIP: string }) => void) => {
  //   // idempotent: if we already wrapped this cb, reuse it
  //   let handler = handlerMap.get(cb);
  //   if (!handler) {
  //     handler = (_e, data) => cb(data);
  //     handlerMap.set(cb, handler);
  //   }
  //   ipcRenderer.on("tcp:message", handler);
  // },

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