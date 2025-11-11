import net from 'node:net';
import { config } from './config/config';

const TCP_PORT = config.TCP_PORT;

export async function sendTCPMessage(ip: string, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setNoDelay(true);
    socket.setTimeout(4000, () =>
      socket.destroy(new Error(`TCP connect timeout to ${ip}:${TCP_PORT}`)),
    );
    socket.once('error', (err) => reject(err));

    socket.connect(TCP_PORT, ip, () => {
      socket.write(message + '\n', (err) => {
        if (err) return reject(err);
        console.log(` Sent to ${ip}:${TCP_PORT} → ${message}`);
        socket.end();
        resolve();
      });
    });

    // socket.on("error", (err) => {
    //   console.error(" TCP send error:", err.message);
    //   reject(err);
    // });
  });
}
