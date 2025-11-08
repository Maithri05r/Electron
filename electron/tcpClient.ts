import net from "node:net";
const TCP_PORT = 5000;
import { WireMessage } from '../shared/wire';

function sendWire(ip: string, payload: WireMessage): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setNoDelay(true);
    socket.setTimeout(4000, () =>
      socket.destroy(new Error(`TCP connect timeout to ${ip}:${TCP_PORT}`))
    );
    socket.once('error', reject);
    socket.connect(TCP_PORT, ip, () => {
      socket.write(JSON.stringify(payload) + '\n', (err) => {
        if (err) return reject(err);
        socket.end(); resolve();
      });
    });
  });
}

// 1️⃣ Normal chat message (type: MSG)
export const tcpSendMessage = (ip: string, id: string, text: string) =>
  sendWire(ip, { type: "MSG", id, text });

// 2️⃣ Read receipt (type: READ)
export const tcpSendRead = (ip: string, ids: string[]) =>
  sendWire(ip, { type: "READ", ids });

export async function sendTCPMessage(ip: string, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setNoDelay(true);
        socket.setTimeout(4000, () => socket.destroy(new Error(`TCP connect timeout to ${ip}:${TCP_PORT}`)));
socket.once("error", (err) => reject(err));

    socket.connect(TCP_PORT, ip, () => {
      socket.write(message + "\n", (err) => {
        if (err) return reject(err);
        console.log(`📤 Sent to ${ip}:${TCP_PORT} → ${message}`);
        socket.end();
        resolve();
      });
    });

    // socket.on("error", (err) => {
    //   console.error("❌ TCP send error:", err.message);
    //   reject(err);
    // });
  });
}
