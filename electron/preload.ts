import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
  // Send message to backend
  sendTCPMessage: (targetIP: string, msg: string) =>
    ipcRenderer.send("tcp-send-message", { targetIP, msg }),

  // Listen for incoming TCP messages
  onTCPMessage: (callback: (data: { msg: string; fromIP: string }) => void) => {
    ipcRenderer.on("tcp-message", (_, data) => callback(data));
  },

  // Optional: Remove listener
  removeTCPMessageListener: (callback: any) => {
    ipcRenderer.removeListener("tcp-message", callback);
  },

  ping: () => ipcRenderer.invoke('ping'),
  // getAppInfo: () => ipcRenderer.invoke('getAppInfo'),
  getPeers: () => ipcRenderer.invoke("getPeers"),
  // sendMessage: (msg: string) => ipcRenderer.send("send-message", msg),
  // onServerMessage: (callback: (msg: string) => void) =>
  //   ipcRenderer.on("server-message", (_, message) => callback(message)),
});