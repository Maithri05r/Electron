import net, { Socket } from "net";
import os from "os";

const START_PORT = 5000;
const clients: Socket[] = [];

// Get local IP (useful for LAN communication)
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

export function startTCPServer(port = START_PORT): void {
  const server = net.createServer((socket: Socket) => {
    console.log(`Client connected: ${socket.remoteAddress}:${socket.remotePort}`);
    clients.push(socket);

    // When data is received
    socket.on("data", (data) => {
      const message = data.toString().trim();
      console.log(` Received: "${message}" from ${socket.remoteAddress}`);

      // Broadcast to all connected clients (except sender)
      clients.forEach((client) => {
        if (client !== socket) {
          client.write(message);
        }
      });
    });

    // On disconnect
    socket.on("end", () => {
      console.log(` Client disconnected: ${socket.remoteAddress}`);
      const index = clients.indexOf(socket);
      if (index !== -1) clients.splice(index, 1);
    });

    // On error
    socket.on("error", (err) => {
      console.error(` Socket error (${socket.remoteAddress}): ${err.message}`);
    });
  });

  // Try to listen on port, fallback to next if busy
  server.listen(port, "0.0.0.0", () => {
    console.log(` TCP Server running at ${getLocalIP()}:${port}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.warn(` Port ${port} in use, trying ${port + 1}...`);
      startTCPServer(port + 1); // recursively try next port
    } else {
      console.error("Server error:", err);
    }
  });
}



// import net, { Socket } from "net";
// import os from "os";

// const PORT = 5000;

// function getLocalIP(): string {
//   const interfaces = os.networkInterfaces();
//   for (const name of Object.keys(interfaces)) {
//     for (const iface of interfaces[name] || []) {
//       if (iface.family === "IPv4" && !iface.internal) {
//         return iface.address;
//       }
//     }
//   }
//   return "127.0.0.1";
// }

// export function startTCPServer(onMessageReceived?: (msg: string, fromIP: string) => void) {
//   const server = net.createServer((socket: Socket) => {
//     console.log(" Incoming connection from:", socket.remoteAddress);

//     socket.on("data", (data) => {
//       const msg = data.toString();
//       console.log(" Message received:", msg);
//       if (onMessageReceived && socket.remoteAddress) {
//         onMessageReceived(msg, socket.remoteAddress);
//       }
//     });

//     socket.on("close", () => {
//       console.log("🔌 Connection closed");
//     });

//     socket.on("error", (err) => {
//       console.error(" Socket error:", err.message);
//     });
//   });

//   server.listen(PORT, () => {
//     console.log(` TCP Server started at ${getLocalIP()}:${PORT}`);
//   });
// }

// export { PORT };
