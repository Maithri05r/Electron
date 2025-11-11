export {};
declare global {
  interface Window {
    electronAPI: {
      ping: () => Promise<string>;
      getPeers: () => Promise<any>;
      sendTCPMessage: (ip: string, msg: string) => Promise<void>;
      onTCPMessage: (cb: (data: { msg: string; fromIP: string }) => void) => void;
      removeTCPMessageListener: (cb?: (data: { msg: string; fromIP: string }) => void) => void;
      saveBase64ToFile: (
        suggestedName: string,
        base64: string,
        mime: string,
      ) => Promise<string | undefined>;
      openPath: (absolutePath: string) => Promise<void>;
    };
  }
}
