import net from "node:net";
import { EventEmitter } from "node:events";

const TCP_PORT = 50505;

export function startTCPServer() {
  const emitter = new EventEmitter();
  const clients: net.Socket[] = []; 

  const server = net.createServer((socket) => {
    console.log(`✅ Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
    clients.push(socket);

    socket.on("data", (chunk) => {
      const msg = chunk.toString("utf8").trim();
      console.log(`📩 From ${socket.remoteAddress}: ${msg}`);
      emitter.emit("message", { fromIP: socket.remoteAddress, msg });
    });

    socket.on("close", () => {
      const i = clients.indexOf(socket);
      if (i >= 0) clients.splice(i, 1);
      console.log(`❌ Client disconnected: ${socket.remoteAddress}`);
    });

    socket.on("error", (err) => console.error("Socket error:", err.message));
  });

  server.listen(TCP_PORT, () => console.log(`🚀 TCP Server listening on ${TCP_PORT}`));

  return {
    onMessage: (cb: (msg: string, fromIP: string) => void) =>
      emitter.on("message", ({ msg, fromIP }) => cb(msg, fromIP)),
    stop: () => server.close(),
    port: TCP_PORT,
  };
}
