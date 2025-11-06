import net from "net";

export function sendMessage(targetIP: string, port: number, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.connect(port, targetIP, () => {
      console.log(` Connected to ${targetIP}:${port}`);
      client.write(message);
      client.end();
      resolve();
    });

    client.on("error", (err) => {
      console.error(" TCP Send Error:", err.message);
      reject(err);
    });
  });
}
