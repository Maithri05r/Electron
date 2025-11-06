interface Window {
  electronAPI: {
    ping: () => Promise<string>;
    // add any other functions you expose via preload here
  };
}
