import net from "node:net";
import os from "node:os";
import { EventEmitter } from "node:events";

const TCP_PORT = 5000;

export function startTCPServer() {
  const ee = new EventEmitter();

  const server = net.createServer((socket) => {
    console.log(`✅ Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
    socket.setNoDelay(true);

    let buf = "";

    socket.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        
        if (line) {
          console.log(`📩 From ${socket.remoteAddress}: ${line}`);
          ee.emit("message", line, socket.remoteAddress ?? "unknown");
        }
      }
    });

    socket.on("close", () => {
      console.log(`❌ Client disconnected: ${socket.remoteAddress}`);
    });

    socket.on("error", (err) => console.error("Socket error:", err.message));
  });

  server.on("error", (e) => console.error("TCP server error:", e));

  // listen on all IPv4 interfaces so peers can reach it over LAN
  server.listen(TCP_PORT, "0.0.0.0", () => {
    const ips = Object.values(os.networkInterfaces())
      .flatMap(a => a ?? [])
      .filter(n => n?.family === "IPv4" && !n.internal)
      .map(n => n!.address);
    console.log(`🚀 TCP server on 0.0.0.0:${TCP_PORT} (LAN IPs: ${ips.join(", ")})`);
  });

  return {
    onMessage: (cb: (msg: string, fromIP: string) => void) =>
      ee.on("message", (msg, fromIP) => cb(msg, fromIP)),
    stop: () => server.close(),
    port: TCP_PORT,
  };
}