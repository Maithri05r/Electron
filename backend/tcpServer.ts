import net from "node:net";
import os from "node:os";
import { EventEmitter } from "node:events";
import { WireMessage } from '../shared/wire';

const TCP_PORT = 5000;

export function startTCPServer() {
  const ee = new EventEmitter();

  const server = net.createServer((socket) => {
    console.log(`✅ Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
    socket.setNoDelay(true);

    let buf = "";
    const send = (wm: WireMessage) => socket.write(JSON.stringify(wm) + '\n');

    socket.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim();
        buf = buf.slice(idx + 1);
        if (!line) continue;
       try {
  const msg = JSON.parse(line) as WireMessage;

  if (msg.type === 'MSG') {
    ee.emit('message', { type: 'MSG', fromIP: socket.remoteAddress ?? 'unknown', id: msg.id, text: msg.text });
    // ACK back to sender (DELIVERED)
    socket.write(JSON.stringify({ type: 'ACK', id: msg.id }) + '\n');
  } else if (msg.type === 'READ') {
    ee.emit('message', { type: 'READ', fromIP: socket.remoteAddress ?? 'unknown', ids: msg.ids });
  } else if (msg.type === 'ACK') {
    ee.emit('message', { type: 'ACK', fromIP: socket.remoteAddress ?? 'unknown', id: msg.id });
  }
} catch {
  // Non-JSON line (legacy). Either ignore or forward as a basic MSG without ACK
  const legacyId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  ee.emit('message', { type: 'MSG', fromIP: socket.remoteAddress ?? 'unknown', id: legacyId, text: line });
  // (optional) do NOT ACK legacy; the sender won't understand it anyway
  // If you *must* ACK for logging symmetry, you can write an ACK, but it's harmless either way.
}
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
