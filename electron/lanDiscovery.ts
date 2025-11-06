import dgram from "dgram";
import os from "os";

const PORT = 41234;
const BROADCAST_ADDR = "255.255.255.255";

export interface PeerInfo {
  ip: string;
  name: string;
  isActive: "online" | "offline";
   lastSeen?: number;
}

const peers = new Map<string, PeerInfo>();

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "0.0.0.0";
}

export function startDiscovery(appName = "ElectronApp") {
  const socket = dgram.createSocket("udp4");
  const localIP = getLocalIP();
  const systemName = os.hostname();

  socket.bind(PORT, () => {
    socket.setBroadcast(true);
    console.log(` Peer discovery started on ${systemName} ${localIP}:${PORT}`);

    // Broadcast periodically
    setInterval(() => {
      // const message = JSON.stringify({
      //   type: "DISCOVER",
      //   name: `${appName} - ${systemName}`, // 👈 optional: include hostname in broadcast
      //   ip: localIP,
      //   isActive: "online",
      //   timestamp: Date.now(),
      // });
      const messageObj = {
  type: "DISCOVER",
  name: `${appName} - ${systemName}`,
  ip: localIP,
  isActive: "online",
  timestamp: Date.now(),
};
console.log("📡 Broadcasting:", messageObj);

const message = JSON.stringify(messageObj);
      socket.send(message, 0, message.length, PORT, BROADCAST_ADDR);
    }, 3000);
    // setInterval(() => {
    //   const message = JSON.stringify({ type: "DISCOVER", name: appName, ip: localIP });
    //   socket.send(message, 0, message.length, PORT, BROADCAST_ADDR);
    // }, 3000);
  });

  socket.on("message", (msg, rinfo) => {
    try {
      const data = JSON.parse(msg.toString());      
      if (data.type === "DISCOVER" && data.ip !== localIP) {
        if (!peers.has(data.ip)) {
        //   peers.set(data.ip, { ip: data.ip, name: data.name });
        //   console.log(` New peer discovered: ${data.name} (${data.ip})`);
          const displayName = data.name.split(" - ").pop(); 
          // const isActive = data.isActive || "offline";
          const isActive = "online";
          console.log("data.isActive", data,data.isActive);
          
          // peers.set(data.ip, { ip: data.ip, name: displayName });
      //     peers.set(data.ip, {
      //   ip: data.ip,
      //   name: displayName,
      //   lastSeen: Date.now(),
      // });
          peers.set(data.ip, {
        ip: data.ip,
        name: displayName,
        isActive,
        lastSeen: Date.now(),
      });
        console.log(` New peer discovered1: ${displayName}  ${isActive} (${data.ip})`);

        }
      }
    } catch (e) {
      console.error("Invalid UDP message", e);
    }
  });

  // When closing the app, broadcast “offline”
  // const sendOffline = () => {
  //   const offlineMsg = JSON.stringify({
  //     type: "DISCOVER",
  //     name: `${appName} - ${systemName}`,
  //     ip: localIP,
  //     isActive: "offline", // now broadcast offline
  //     timestamp: Date.now(),
  //   });
  //   socket.send(offlineMsg, 0, offlineMsg.length, PORT, BROADCAST_ADDR);
  //   console.log(` ${systemName} (${localIP}) went offline`);
  //   socket.close();
  // };

  // process.on("beforeExit", sendOffline);
  // process.on("SIGINT", sendOffline);
  // process.on("SIGTERM", sendOffline);

  return {
    getPeers: () => Array.from(peers.values()),
  };
}
