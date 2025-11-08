import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('electronAPI', {
   ping: () => ipcRenderer.invoke('ping'),
 getPeers: () => ipcRenderer.invoke("getPeers"),
 sendTCPMessage: (ip: string, msg: string) => ipcRenderer.invoke("sendTCPMessage", ip, msg),
  onTCPMessage: (cb: (data: { msg: string; fromIP: string }) => void) => {
    ipcRenderer.on("tcp:message", (_e, data) => cb(data));
  },
  removeTCPMessageListener: (cb: any) => {
    ipcRenderer.removeListener("tcp:message", cb);
  },
});