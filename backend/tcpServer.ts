import net, { Socket } from "net";
import os from "os";

const PORT = 5000;

function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}

export function startTCPServer(onMessageReceived?: (msg: string, fromIP: string) => void) {
  const server = net.createServer((socket: Socket) => {
    console.log(" Incoming connection from:", socket.remoteAddress);

    socket.on("data", (data) => {
      const msg = data.toString();
      console.log(" Message received:", msg);
      if (onMessageReceived && socket.remoteAddress) {
        onMessageReceived(msg, socket.remoteAddress);
      }
    });

    socket.on("close", () => {
      console.log("🔌 Connection closed");
    });

    socket.on("error", (err) => {
      console.error(" Socket error:", err.message);
    });
  });

  server.listen(PORT, () => {
    console.log(` TCP Server started at ${getLocalIP()}:${PORT}`);
  });
}

export { PORT };
