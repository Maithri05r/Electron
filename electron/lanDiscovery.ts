// udp-discovery.ts
import dgram from 'dgram';
import os from 'os';
import crypto from 'crypto';
import { config } from './config/config';

const PORT = config.PORT;
const BROADCAST_INTERVAL = config.BROADCAST_INTERVAL;
const TTL_MS = config.TTL_MS;
const APP_ID = config.APP_ID;
const SHARED_SECRET = config.SHARED_SECRET;
const APP_NAME = config.APP_NAME;

export interface PeerInfo {
  id: string; // stable peer id (hostname-pid-…)
  ip: string; // last sender IP
  name: string; // display name (hostname)
  isActive: 'online' | 'offline';
  lastSeen: number;
  via: 'udp';
}

type Beacon = {
  messageType: 'DISCOVER';
  appId: string;
  id: string;
  name: string;
  port: number;
  timestamp: number;
  signature?: string; // HMAC when SHARED_SECRET is set
};

// const peers = new Map<string, PeerInfo>();
const peers = new Map();

function localIPv4s() {
  const res: Array<{ address: string; netmask?: string; broadcast?: string }> = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const nic of ifaces[name] ?? []) {
      if (nic.family === 'IPv4' && !nic.internal) {
        // compute subnet broadcast (address | ~netmask)
        let broadcast: string | undefined;
        if (nic.netmask) {
          const ip = nic.address.split('.').map(Number);
          const mask = nic.netmask.split('.').map(Number);
          const bcast = ip.map((oct, i) => (oct & mask[i]) | (~mask[i] & 255));
          broadcast = bcast.join('.');
        }
        res.push({ address: nic.address, netmask: nic.netmask, broadcast });
      }
    }
  }
  return res;
}

function hmacSign(b: Beacon) {
  const base = `${b.appId}|${b.id}|${b.name}|${b.port}|${b.timestamp}`;
  return crypto.createHmac('sha256', SHARED_SECRET).update(base).digest('hex');
}

export function startDiscovery(appName = APP_NAME) {
  const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
  const host = os.hostname();
  const ownId = `${host}-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  const addrs = localIPv4s(); // all local IPv4s
  const isLocalIP = new Set(addrs.map((a) => a.address));

  socket.bind(PORT, () => {
    socket.setBroadcast(true);
    console.log(` Peer discovery on ${host} (${[...isLocalIP].join(',')}):${PORT}`);

    // Periodic beacon
    const tick = () => {
      const now = Date.now();
      const beacon: Beacon = {
        messageType: 'DISCOVER',
        appId: APP_ID,
        id: ownId,
        name: `${appName} - ${host}`,
        port: PORT,
        timestamp: now,
      };
      if (SHARED_SECRET) beacon.signature = hmacSign(beacon);
      const buf = Buffer.from(JSON.stringify(beacon));

      // Send to each interface's broadcast address (more reliable than 255.255.255.255 on some networks)
      for (const addressInfo of addrs) {
        const bcast = addressInfo.broadcast ?? '255.255.255.255';
        try {
          socket.send(buf, 0, buf.length, PORT, bcast);
        } catch {}
      }
      // Also hit global broadcast as a catch-all
      try {
        socket.send(buf, 0, buf.length, PORT, '255.255.255.255');
      } catch {}
    };

    tick();
    const announceTimer = setInterval(tick, BROADCAST_INTERVAL);

    // Cleanup + status update
    const gcTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, p] of peers) {
        if (now - p.lastSeen > TTL_MS) {
          console.log(`Peer offline: ${p.name} (${p.ip})`);
          peers.delete(key);
        }
      }
    }, 7000);

    // Receive beacons
    socket.on('message', (msg, rinfo) => {
      let data: Beacon | null = null;
      try {
        data = JSON.parse(msg.toString());
      } catch {
        return;
      }
      if (!data || data.messageType !== 'DISCOVER' || data.appId !== APP_ID) return;

      // Ignore self (by id, and also if packet came from our own NIC ip)
      if (data.id === ownId) return;
      if (isLocalIP.has(rinfo.address)) return;

      // Optional signature check
      if (SHARED_SECRET) {
        const expected = hmacSign(data);
        if (data.signature !== expected) return;
      }

      const displayName = data.name.split(' - ').pop() ?? data.name;
      const key = `${data.id}@${rinfo.address}`;
      const prev = peers.get(key);

      peers.set(key, {
        id: data.id,
        ip: rinfo.address,
        name: displayName,
        isActive: 'online',
        lastSeen: Date.now(),
        via: 'udp',
      });

      if (!prev) {
        console.log(` New peer: ${displayName} (${rinfo.address})`);
      }
    });

    // Graceful offline beacon (best-effort)
    const sendOffline = () => {
      const now = Date.now();
      const off: Beacon = {
        messageType: 'DISCOVER',
        appId: APP_ID,
        id: ownId,
        name: `${appName} - ${host}`,
        port: PORT,
        timestamp: now,
      };
      if (SHARED_SECRET) off.signature = hmacSign(off);
      const buf = Buffer.from(JSON.stringify(off));
      for (const addressInfo of addrs) {
        const bcast = addressInfo.broadcast ?? '255.255.255.255';
        try {
          socket.send(buf, 0, buf.length, PORT, bcast);
        } catch {}
      }
      try {
        socket.send(buf, 0, buf.length, PORT, '255.255.255.255');
      } catch {}
      try {
        socket.close();
      } catch {}
      clearInterval(announceTimer);
      clearInterval(gcTimer);
    };

    process.on('SIGINT', sendOffline);
    process.on('SIGTERM', sendOffline);
    process.on('beforeExit', sendOffline);
  });

  return {
    // getPeers: () => [...peers.values()].sort((a, b) => b.lastSeen - a.lastSeen),
    getPeers: () => [...peers.values()],

    // optional: subscribe to updates in your UI
    // onPeers: (cb: (list: PeerInfo[]) => void) => {
    onPeers: (cb: (list: any[]) => void) => {
      const t = setInterval(() => cb([...peers.values()]), 4000);
      return () => clearInterval(t);
    },
  };
}
