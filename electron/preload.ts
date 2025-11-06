import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  // getAppInfo: () => ipcRenderer.invoke('getAppInfo'),
  getPeers: () => ipcRenderer.invoke("getPeers"),
  sendTCPMessage: (ip: string, message: string) =>
    ipcRenderer.invoke("send-tcp-message", ip, message),
   onTCPMessage: (callback: (data: { msg: string; fromIP: string }) => void) =>
    ipcRenderer.on("tcp-message-received", (_, data) => callback(data)),
    // removeTCPMessageListener: (callback: (data: { msg: string; fromIP: string }) => void) =>
    // ipcRenderer.removeListener("tcp-message-received", callback),
    removeTCPMessageListener: (listener: (...args: any[]) => void) => {
    ipcRenderer.removeListener("tcp-message-received", listener);
  //   sendTypingStatus: (ip: string, isTyping: boolean) => ipcRenderer.invoke('send-typing-status', ip, isTyping),
  //   onTypingStatus: (cb) => {
  //   const listener = (_evt, data) => cb(data);
  //   ipcRenderer.on('typing-status', listener);
  //   return () => ipcRenderer.removeListener('typing-status', listener);
  // },
  // // optional removeTypingListener wrapper for parity
  // removeTypingListener: (cb) => ipcRenderer.removeListener('typing-status', cb),
  },
});