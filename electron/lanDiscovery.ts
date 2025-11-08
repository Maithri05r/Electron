// udp-discovery.ts
import dgram from "dgram";
import os from "os";
import crypto from "crypto";

const PORT = 41234;
const BROADCAST_INTERVAL = 2000;     // how often to announce
const TTL_MS = 30000;                // consider peer offline after 30s silence
const APP_ID = "com.yourcompany.electronapp"; // change to your app
const SHARED_SECRET = "";            // optional: set to enable HMAC signing

export interface PeerInfo {
  id: string;            // stable peer id (hostname-pid-…)
  ip: string;            // last sender IP
  name: string;          // display name (hostname)
  isActive: "online" | "offline";
  lastSeen: number;
  via: "udp";
}

type Beacon = {
  t: "DISCOVER";
  appId: string;
  id: string;
  name: string;
  port: number;
  ts: number;
  sig?: string; // HMAC when SHARED_SECRET is set
};

const peers = new Map<string, PeerInfo>();

function localIPv4s() {
  const res: Array<{ address: string; netmask?: string; broadcast?: string }> = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const nic of ifaces[name] ?? []) {
      if (nic.family === "IPv4" && !nic.internal) {
        // compute subnet broadcast (address | ~netmask)
        let broadcast: string | undefined;
        if (nic.netmask) {
          const ip = nic.address.split(".").map(Number);
          const mask = nic.netmask.split(".").map(Number);
          const bcast = ip.map((oct, i) => (oct & mask[i]) | (~mask[i] & 255));
          broadcast = bcast.join(".");
        }
        res.push({ address: nic.address, netmask: nic.netmask, broadcast });
      }
    }
  }
  return res;
}

function hmacSign(b: Beacon) {
  const base = `${b.appId}|${b.id}|${b.name}|${b.port}|${b.ts}`;
  return crypto.createHmac("sha256", SHARED_SECRET).update(base).digest("hex");
}

export function startDiscovery(appName = "ElectronApp") {
  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
  const host = os.hostname();
  const ownId = `${host}-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  const addrs = localIPv4s();              // all local IPv4s
  const isLocalIP = new Set(addrs.map(a => a.address));

  socket.bind(PORT, () => {
    socket.setBroadcast(true);
    console.log(`🛰️ Peer discovery on ${host} (${[...isLocalIP].join(",")}):${PORT}`);

    // Periodic beacon
    const tick = () => {
      const now = Date.now();
      const beacon: Beacon = {
        t: "DISCOVER",
        appId: APP_ID,
        id: ownId,
        name: `${appName} - ${host}`,
        port: PORT,
        ts: now,
      };
      if (SHARED_SECRET) beacon.sig = hmacSign(beacon);
      const buf = Buffer.from(JSON.stringify(beacon));

      // Send to each interface's broadcast address (more reliable than 255.255.255.255 on some networks)
      for (const a of addrs) {
        const bcast = a.broadcast ?? "255.255.255.255";
        try { socket.send(buf, 0, buf.length, PORT, bcast); } catch {}
      }
      // Also hit global broadcast as a catch-all
      try { socket.send(buf, 0, buf.length, PORT, "255.255.255.255"); } catch {}
    };

    tick();
    const announceTimer = setInterval(tick, BROADCAST_INTERVAL);

    // Cleanup + status update
    const gcTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, p] of peers) {
        if (now - p.lastSeen > TTL_MS) {
          peers.delete(key);
        }
      }
    }, 3000);

    // Receive beacons
    socket.on("message", (msg, rinfo) => {
      let data: Beacon | null = null;
      try { data = JSON.parse(msg.toString()); } catch { return; }
      if (!data || data.t !== "DISCOVER" || data.appId !== APP_ID) return;

      // Ignore self (by id, and also if packet came from our own NIC ip)
      if (data.id === ownId) return;
      if (isLocalIP.has(rinfo.address)) return;

      // Optional signature check
      if (SHARED_SECRET) {
        const expected = hmacSign(data);
        if (data.sig !== expected) return;
      }

      const displayName = data.name.split(" - ").pop() ?? data.name;
      const key = `${data.id}@${rinfo.address}`;

      const prev = peers.get(key);
      peers.set(key, {
        id: data.id,
        ip: rinfo.address,
        name: displayName,
        isActive: "online",
        lastSeen: Date.now(),
        via: "udp",
      });

      if (!prev) {
        console.log(`🔎 New peer: ${displayName} (${rinfo.address})`);
      }
    });

    // Graceful offline beacon (best-effort)
    const sendOffline = () => {
      const now = Date.now();
      const off: Beacon = {
        t: "DISCOVER",
        appId: APP_ID,
        id: ownId,
        name: `${appName} - ${host}`,
        port: PORT,
        ts: now,
      };
      if (SHARED_SECRET) off.sig = hmacSign(off);
      const buf = Buffer.from(JSON.stringify(off));
      for (const a of addrs) {
        const bcast = a.broadcast ?? "255.255.255.255";
        try { socket.send(buf, 0, buf.length, PORT, bcast); } catch {}
      }
      try { socket.send(buf, 0, buf.length, PORT, "255.255.255.255"); } catch {}
      try { socket.close(); } catch {}
      clearInterval(announceTimer);
      clearInterval(gcTimer);
    };

    process.on("SIGINT", sendOffline);
    process.on("SIGTERM", sendOffline);
    process.on("beforeExit", sendOffline);
  });

  return {
    getPeers: () =>
      [...peers.values()].sort((a, b) => b.lastSeen - a.lastSeen),

    // optional: subscribe to updates in your UI
    onPeers: (cb: (list: PeerInfo[]) => void) => {
      const t = setInterval(() => cb([...peers.values()]), 2000);
      return () => clearInterval(t);
    },
  };
}


// import dgram from "dgram";
// import os from "os";

// const PORT = 41234;
// const BROADCAST_INTERVAL = 3000;
// const BROADCAST_ADDR = "255.255.255.255";

// export interface PeerInfo {
//   ip: string;
//   name: string;
//   isActive: "online" | "offline";
//    lastSeen?: number;
// }

// const peers = new Map<string, PeerInfo>();

// function getLocalIP() {
//   const interfaces = os.networkInterfaces();
//   for (const name of Object.keys(interfaces)) {
//     for (const iface of interfaces[name]!) {
//       if (iface.family === "IPv4" && !iface.internal) {
//         return iface.address;
//       }
//     }
//   }
//   return "0.0.0.0";
// }

// export function startDiscovery(appName = "ElectronApp") {
//   const socket = dgram.createSocket("udp4");
//   const localIP = getLocalIP();
//   const systemName = os.hostname();

//   socket.bind(PORT, () => {
//     socket.setBroadcast(true);
//     console.log(` Peer discovery started on ${systemName} ${localIP}:${PORT}`);

//     // Broadcast periodically
//     setInterval(() => {
//       // const message = JSON.stringify({
//       //   type: "DISCOVER",
//       //   name: `${appName} - ${systemName}`, // 👈 optional: include hostname in broadcast
//       //   ip: localIP,
//       //   isActive: "online",
//       //   timestamp: Date.now(),
//       // });
//       const messageObj = {
//   type: "DISCOVER",
//   name: `${appName} - ${systemName}`,
//   ip: localIP,
//   isActive: "online",
//   timestamp: Date.now(),
// };
// // console.log("📡 Broadcasting:", messageObj);

// const message = JSON.stringify(messageObj);
//       socket.send(message, 0, message.length, PORT, BROADCAST_ADDR);
//     }, BROADCAST_INTERVAL);
//     // setInterval(() => {
//     //   const message = JSON.stringify({ type: "DISCOVER", name: appName, ip: localIP });
//     //   socket.send(message, 0, message.length, PORT, BROADCAST_ADDR);
//     // }, 3000);
//   });

//   socket.on("message", (msg, rinfo) => {
//     try {
//       const data = JSON.parse(msg.toString());      
//       if (data.type === "DISCOVER" && data.ip !== localIP) {
//         if (!peers.has(data.ip)) {
//         //   peers.set(data.ip, { ip: data.ip, name: data.name });
//         //   console.log(` New peer discovered: ${data.name} (${data.ip})`);
//           const displayName = data.name.split(" - ").pop(); 
//           // const isActive = data.isActive || "offline";
//           const isActive = "online";
//           // console.log("data.isActive", data,data.isActive);
          
//           // peers.set(data.ip, { ip: data.ip, name: displayName });
//       //     peers.set(data.ip, {
//       //   ip: data.ip,
//       //   name: displayName,
//       //   lastSeen: Date.now(),
//       // });
//           peers.set(data.ip, {
//         ip: data.ip,
//         name: displayName,
//         isActive,
//         lastSeen: Date.now(),
//       });
//         console.log(` New peer discovered1: ${displayName}  ${isActive} (${data.ip})`);

//         }
//       }
//     } catch (e) {
//       console.error("Invalid UDP message", e);
//     }
//   });

//   // When closing the app, broadcast “offline”
//   // const sendOffline = () => {
//   //   const offlineMsg = JSON.stringify({
//   //     type: "DISCOVER",
//   //     name: `${appName} - ${systemName}`,
//   //     ip: localIP,
//   //     isActive: "offline", // now broadcast offline
//   //     timestamp: Date.now(),
//   //   });
//   //   socket.send(offlineMsg, 0, offlineMsg.length, PORT, BROADCAST_ADDR);
//   //   console.log(` ${systemName} (${localIP}) went offline`);
//   //   socket.close();
//   // };

//   // process.on("beforeExit", sendOffline);
//   // process.on("SIGINT", sendOffline);
//   // process.on("SIGTERM", sendOffline);

//   return {
//     getPeers: () => Array.from(peers.values()),
//   };
// }
