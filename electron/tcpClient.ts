import net from "node:net";
const TCP_PORT = 5000;

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

//updated
// import net from "node:net";

// const TCP_PORT = 5000;

// export async function sendTCPMessage(ip: string, message: string): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const socket = new net.Socket();
//     socket.setNoDelay(true);

//     // Set 4s timeout in case the server isn't reachable
//     socket.setTimeout(4000, () => {
//       socket.destroy(new Error(`TCP connect timeout to ${ip}:${TCP_PORT}`));
//     });

//     socket.once("error", (err) => reject(err));

//     // Try connecting to server
//     socket.connect(TCP_PORT, ip, () => {
//       socket.write(message + "\n", (err) => {
//         if (err) return reject(err);
//         console.log(`📤 Sent to ${ip}:${TCP_PORT} → ${message}`);
//         socket.end();
//         resolve();
//       });
//     });
//   });
// }

// // Example usage
// if (require.main === module) {
//   const targetIP = "192.168.1.10";  // 🖥️ Server IP in your LAN
//   const message = "Hello from TCP client 👋";

//   sendTCPMessage(targetIP, message)
//     .then(() => console.log("✅ Message sent successfully"))
//     .catch((err) => console.error("❌ Failed to send:", err.message));
// }
