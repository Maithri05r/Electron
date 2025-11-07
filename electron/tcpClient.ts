import  net from "net";
// import { SERVER_IP, PORT } from './config/config';


// const SERVER_IP = '192.168.0.10';
// const PORT = 5000;

export function connectToServer(serverIP: string, onMessage: (msg: string, fromIP: string) => void) {
  const socket = new net.Socket();

  socket.connect(5000, serverIP, () => {
    console.log(`Connected to TCP Server at ${serverIP}:5000`);
  });

  socket.on("data", (data) => {
    const msg = data.toString().trim();
    console.log(` From server (${serverIP}):`, msg);
    onMessage(msg, serverIP);
  });

  socket.on("error", (err) => {
    console.error(" TCP Error:", err.message);
  });

  socket.on("close", () => {
    console.log(" TCP Connection closed");
  });

  return socket;
}

