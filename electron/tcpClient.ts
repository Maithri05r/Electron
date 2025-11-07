import net from "net";

export function sendTCPMessage(targetIP: string, targetPort: number, message: string) {
  const client = new net.Socket();

  console.log(` Connecting to ${targetIP}:${targetPort}...`);
  client.connect(targetPort, targetIP, () => {
    console.log("Connected to server, sending message...");
    client.write(message + "\n");
  });

  client.on("data", (data) => {
    console.log(" Reply from server:", data.toString());
  });

  client.on("close", () => {
    console.log(" Connection closed");
  });

  client.on("error", (err) => {
    console.error(" TCP Error:", err.message);
  });
}
