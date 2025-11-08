import net from "node:net";
const TCP_PORT = 50505;

export async function sendTCPMessage(ip: string, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setNoDelay(true);

    socket.connect(TCP_PORT, ip, () => {
      socket.write(message + "\n", () => {
        console.log(`📤 Sent to ${ip}:${TCP_PORT} → ${message}`);
        socket.end();
        resolve();
      });
    });

    socket.on("error", (err) => {
      console.error("❌ TCP send error:", err.message);
      reject(err);
    });
  });
}
