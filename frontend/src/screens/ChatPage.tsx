import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { ContactList } from './ContactList';
import { ChatWindow } from './ChatWindow';
import { CallDialog } from './CallDialog';
import { Message } from './MessageItem';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastMessage?: string;
  unreadCount?: number;
  ipAddress: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
}

interface ChatPageProps {
  currentUser: {
    id: string;
    name: string;
    ipAddress: string;
    location: {
      city: string;
      country: string;
      lat: number;
      lng: number;
    };
    avatar?: string;
    status: 'online' | 'offline' | 'away';
  };
}

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const MID_RE = /\s*\[mid:([^\]]+)\]\s*$/;
const FILE_CHUNK_SIZE = 48 * 1024; // base64 chars per chunk (~36KB binary)

const extractMid = (text: string) => {
  const m = text.match(MID_RE);
  if (!m) return { clean: text, id: null as string | null };
  return { clean: text.replace(MID_RE, '').trimEnd(), id: m[1] };
};

// read File -> base64 (browser-safe; no Node Buffer needed)
const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result as string; // "data:<type>;base64,AAAA..."
      resolve(dataUrl.split(',')[1]);
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

// receiver-side assembly store
type IncomingFileBuf = {
  fromIP: string;
  name: string;
  type: string;
  size: number;
  chunks: string[];
};


export function ChatPage({ currentUser }: ChatPageProps) {
  // const [contacts] = useState<Contact[]>([
  //   {
  //     id: '1',
  //     name: 'Node 1',
  //     status: 'online',
  //     lastMessage: 'Thanks for the files!',
  //     unreadCount: 2,
  //     ipAddress: '192.168.1.101',
  //     location: {
  //       city: 'San Francisco',
  //       country: 'USA',
  //       lat: 37.7749,
  //       lng: -122.4194,
  //     },
  //   },
  //   {
  //     id: '2',
  //     name: 'Node 2',
  //     status: 'online',
  //     lastMessage: 'See you at the meeting',
  //     ipAddress: '192.168.1.102',
  //     location: {
  //       city: 'New York',
  //       country: 'USA',
  //       lat: 40.7128,
  //       lng: -74.006,
  //     },
  //   },
  //   {
  //     id: '3',
  //     name: 'Node 3',
  //     status: 'away',
  //     lastMessage: 'Can we schedule a call?',
  //     ipAddress: '192.168.1.103',
  //     location: {
  //       city: 'London',
  //       country: 'UK',
  //       lat: 51.5074,
  //       lng: -0.1278,
  //     },
  //   },
  //   {
  //     id: '4',
  //     name: 'Node 4',
  //     status: 'offline',
  //     lastMessage: 'Project looks great!',
  //     ipAddress: '192.168.1.104',
  //     location: {
  //       city: 'Tokyo',
  //       country: 'Japan',
  //       lat: 35.6762,
  //       lng: 139.6503,
  //     },
  //   },
  //   {
  //     id: '5',
  //     name: 'Node 5',
  //     status: 'online',
  //     lastMessage: 'Got it, thanks!',
  //     ipAddress: '192.168.1.105',
  //     location: {
  //       city: 'Sydney',
  //       country: 'Australia',
  //       lat: -33.8688,
  //       lng: 151.2093,
  //     },
  //   },
  // ]);

  // const [selectedContactId, setSelectedContactId] = useState<string | null>('1');
  // const [messages, setMessages] = useState<Message[]>([
  //   {
  //     id: '1',
  //     senderId: '1',
  //     text: 'Hi! How are you?',
  //     timestamp: new Date(Date.now() - 3600000),
  //     isSent: true,
  //     isRead: true,
  //   },
  //   {
  //     id: '2',
  //     senderId: 'me',
  //     text: "I'm doing great! Just finished the project documentation.",
  //     timestamp: new Date(Date.now() - 3500000),
  //     isSent: true,
  //     isRead: true,
  //   },
  //   {
  //     id: '3',
  //     senderId: 'me',
  //     file: {
  //       name: 'project-documentation.pdf',
  //       size: '2.4 MB',
  //       type: 'pdf',
  //     },
  //     timestamp: new Date(Date.now() - 3400000),
  //     isSent: true,
  //     isRead: true,
  //   },
  //   {
  //     id: '4',
  //     senderId: '1',
  //     text: 'Thanks for the files!',
  //     timestamp: new Date(Date.now() - 1800000),
  //     isSent: true,
  //     isRead: false,
  //   },
  //   {
  //     id: '5',
  //     senderId: '1',
  //     text: 'Can we schedule a call to discuss the next steps?',
  //     timestamp: new Date(Date.now() - 300000),
  //     isSent: true,
  //     isRead: false,
  //   },
  // ]);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [callState, setCallState] = useState<{
    isOpen: boolean;
    type: 'audio' | 'video';
    contact: Contact | null;
  }>({
    isOpen: false,
    type: 'audio',
    contact: null,
  });
   const seen = useRef<Set<string>>(new Set()); // de-dupe window

    const selectedContact = contacts.find((c) => c.id === selectedContactId);
  const incomingFilesRef = React.useRef<Map<string, IncomingFileBuf>>(new Map());

  useEffect(() => {
    const fetchPeers = async () => {
      try {
        const peers = await (window as any).electronAPI.getPeers();
        console.log("peers",peers);
       
        
        const formattedPeers: Contact[] = peers.map((peer: any, idx: number) => ({
          id: peer.ip || `peer-${idx}`,
          name: peer.name || `Node-${idx + 1}`,
          status: peer.isActive === "online" ? "online" : "offline",
          ipAddress: peer.ip,
        }));
        setContacts(formattedPeers);
      } catch (err) {
        console.error("Failed to get peers:", err);
      }
    };
    fetchPeers();
    const interval = setInterval(fetchPeers, 3000); // refresh every 3 sec
    // return () => clearInterval(interval);

    // Listen for incoming TCP messages once
  const listener = ({ msg, fromIP }: { msg: string; fromIP: string }) => {
     // de-dupe key over a 2s bucket (adjust if needed)
      const key = `${fromIP}|${msg}|${Math.floor(Date.now() / 2000)}`;
      if (seen.current.has(key)) return;
      seen.current.add(key);

            // --- FILE START ---
      if (msg.startsWith("__FILE_START__:")) {
        const parts = msg.split(":");
        const id = parts[1];
        const name = decodeURIComponent(parts[2] ?? "file");
        const type = parts[3] ?? "application/octet-stream";
        const size = Number(parts[4] ?? 0);
        incomingFilesRef.current.set(id, { fromIP, name, type, size, chunks: [] });
        return;
      }

       // --- FILE CHUNK ---
      if (msg.startsWith("__FILE_CHUNK__:")) {
        const first = msg.indexOf(":");
        const second = msg.indexOf(":", first + 1);
        const id = msg.slice(first + 1, second);
        const b64 = msg.slice(second + 1);
        const buf = incomingFilesRef.current.get(id);
        if (buf) buf.chunks.push(b64);
        return;
      }

      // --- FILE END ---
  if (msg.startsWith("__FILE_END__:")) {
    // __FILE_END__:<id>
    const id = msg.slice("__FILE_END__:".length).trim();
    const buf = incomingFilesRef.current.get(id);
    if (!buf) return;

    const b64 = buf.chunks.join(""); // full base64 payload
    const humanSize = `${(buf.size / (1024 * 1024)).toFixed(2)} MB`;

    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        senderId: buf.fromIP,
        file: {
          name: buf.name,
          size: humanSize,
          type: buf.type,
          // 👇 store base64 so Download button can save it
          data: b64,
        },
        timestamp: new Date(),
        isSent: true,
        isRead: true,
      },
    ]);

    incomingFilesRef.current.delete(id);
    return;
  }

  //   setMessages((prev) => [
  //     ...prev,
  //     {
  //       // id: Date.now().toString(),
  //       id: makeId(),
  //       senderId: buf.fromIP,
  //       file: { name: buf.name, size: humanSize, type: buf.type },
  //       text: msg,
  //       timestamp: new Date(),
  //       isSent: true,
  //       isRead: true,
  //     },
  //   ]);
  //    incomingFilesRef.current.delete(id);
  //       return;
  // };

    // --- Normal text ---
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          senderId: fromIP,
          text: msg,
          timestamp: new Date(),
          isSent: true,
          isRead: true,
        },
         ]);
        }
  (window as any).electronAPI.onTCPMessage(listener);

  // Cleanup on unmount
  return () => {
    clearInterval(interval);
    // if ((window as any).electronAPI?.removeTCPMessageListener) {
      (window as any).electronAPI.removeTCPMessageListener(listener);
      seen.current.clear();
    // }
  };
  }, []);

 

  const handleSendMessage = async(text: string) => {
     if (!selectedContact) return;
     console.log("contacts",contacts);
     
     // find selected contact’s status
  const contact = contacts.find((c) => c.id === selectedContact.id);
  const isOnline = contact?.status === "online";
    if (isOnline) {
     await (window as any).electronAPI.sendTCPMessage(selectedContact.ipAddress, text);
    }
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text,
      timestamp: new Date(),
      isSent: true,
      isRead: false,
    };
    // setMessages([...messages, newMessage]);
    setMessages(prev => [...prev, newMessage]);
  };

 // --- Send file ---
  const handleSendFile = async (file: File) => {
    if (!selectedContact) return;
    const id = makeId();
    const toIP = selectedContact.ipAddress;

    setMessages((prev) => [
      ...prev,
      {
        id,
        senderId: "me",
        file: {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          type: file.type,
        },
        timestamp: new Date(),
        isSent: true,
        isRead: true,
      },
    ]);

    const safeName = encodeURIComponent(file.name);
    await (window as any).electronAPI.sendTCPMessage(
      toIP,
      `__FILE_START__:${id}:${safeName}:${file.type}:${file.size}`
    );

    const base64 = await fileToBase64(file);
    for (let i = 0; i < base64.length; i += FILE_CHUNK_SIZE) {
      const chunk = base64.slice(i, i + FILE_CHUNK_SIZE);
      await (window as any).electronAPI.sendTCPMessage(
        toIP,
        `__FILE_CHUNK__:${id}:${chunk}`
      );
    }
    await (window as any).electronAPI.sendTCPMessage(toIP, `__FILE_END__:${id}`);
  };


  // const handleSendFile = (file: File) => {
  //   const newMessage: Message = {
  //     id: Date.now().toString(),
  //     senderId: 'me',
  //     file: {
  //       name: file.name,
  //       size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
  //       type: file.type,
  //     },
  //     timestamp: new Date(),
  //     isSent: true,
  //     isRead: false,
  //   };
  //   setMessages([...messages, newMessage]);
  // };

  const handleStartCall = (type: 'audio' | 'video') => {
    if (selectedContact) {
      setCallState({
        isOpen: true,
        type,
        contact: selectedContact,
      });
    }
  };

  const handleCloseCall = () => {
    setCallState({
      isOpen: false,
      type: 'audio',
      contact: null,
    });
  };

  return (
    <div className="flex h-full">
      <div className="w-80 flex-shrink-0">
        <ContactList
          currentUser={currentUser}
          contacts={contacts}
          selectedContactId={selectedContactId}
          onSelectContact={setSelectedContactId}
        />
      </div>

      <div className="flex-1">
        {selectedContact ? (
          <ChatWindow
            contact={selectedContact}
            messages={messages}
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            onStartCall={handleStartCall}
          />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: '#4D7A82' }}>
           Waiting for peers on the same LAN...
          </div>
        )}
      </div>

      {callState.contact && (
        <CallDialog
          isOpen={callState.isOpen}
          onClose={handleCloseCall}
          contact={callState.contact}
          callType={callState.type}
        />
      )}
    </div>
  );
}

// export function ChatPage({ currentUser }: ChatPageProps) {
//   // const [contacts] = useState<Contact[]>([
//   //   {
//   //     id: '1',
//   //     name: 'Node 1',
//   //     status: 'online',
//   //     lastMessage: 'Thanks for the files!',
//   //     unreadCount: 2,
//   //     ipAddress: '192.168.1.101',
//   //     location: {
//   //       city: 'San Francisco',
//   //       country: 'USA',
//   //       lat: 37.7749,
//   //       lng: -122.4194,
//   //     },
//   //   },
//   //   {
//   //     id: '2',
//   //     name: 'Node 2',
//   //     status: 'online',
//   //     lastMessage: 'See you at the meeting',
//   //     ipAddress: '192.168.1.102',
//   //     location: {
//   //       city: 'New York',
//   //       country: 'USA',
//   //       lat: 40.7128,
//   //       lng: -74.006,
//   //     },
//   //   },
//   //   {
//   //     id: '3',
//   //     name: 'Node 3',
//   //     status: 'away',
//   //     lastMessage: 'Can we schedule a call?',
//   //     ipAddress: '192.168.1.103',
//   //     location: {
//   //       city: 'London',
//   //       country: 'UK',
//   //       lat: 51.5074,
//   //       lng: -0.1278,
//   //     },
//   //   },
//   //   {
//   //     id: '4',
//   //     name: 'Node 4',
//   //     status: 'offline',
//   //     lastMessage: 'Project looks great!',
//   //     ipAddress: '192.168.1.104',
//   //     location: {
//   //       city: 'Tokyo',
//   //       country: 'Japan',
//   //       lat: 35.6762,
//   //       lng: 139.6503,
//   //     },
//   //   },
//   //   {
//   //     id: '5',
//   //     name: 'Node 5',
//   //     status: 'online',
//   //     lastMessage: 'Got it, thanks!',
//   //     ipAddress: '192.168.1.105',
//   //     location: {
//   //       city: 'Sydney',
//   //       country: 'Australia',
//   //       lat: -33.8688,
//   //       lng: 151.2093,
//   //     },
//   //   },
//   // ]);

//   // const [selectedContactId, setSelectedContactId] = useState<string | null>('1');
//   // const [messages, setMessages] = useState<Message[]>([
//   //   {
//   //     id: '1',
//   //     senderId: '1',
//   //     text: 'Hi! How are you?',
//   //     timestamp: new Date(Date.now() - 3600000),
//   //     isSent: true,
//   //     isRead: true,
//   //   },
//   //   {
//   //     id: '2',
//   //     senderId: 'me',
//   //     text: "I'm doing great! Just finished the project documentation.",
//   //     timestamp: new Date(Date.now() - 3500000),
//   //     isSent: true,
//   //     isRead: true,
//   //   },
//   //   {
//   //     id: '3',
//   //     senderId: 'me',
//   //     file: {
//   //       name: 'project-documentation.pdf',
//   //       size: '2.4 MB',
//   //       type: 'pdf',
//   //     },
//   //     timestamp: new Date(Date.now() - 3400000),
//   //     isSent: true,
//   //     isRead: true,
//   //   },
//   //   {
//   //     id: '4',
//   //     senderId: '1',
//   //     text: 'Thanks for the files!',
//   //     timestamp: new Date(Date.now() - 1800000),
//   //     isSent: true,
//   //     isRead: false,
//   //   },
//   //   {
//   //     id: '5',
//   //     senderId: '1',
//   //     text: 'Can we schedule a call to discuss the next steps?',
//   //     timestamp: new Date(Date.now() - 300000),
//   //     isSent: true,
//   //     isRead: false,
//   //   },
//   // ]);

//   const [contacts, setContacts] = useState<Contact[]>([]);
//   const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [callState, setCallState] = useState<{
//     isOpen: boolean;
//     type: 'audio' | 'video';
//     contact: Contact | null;
//   }>({
//     isOpen: false,
//     type: 'audio',
//     contact: null,
//   });
//    const seen = useRef<Set<string>>(new Set()); // de-dupe window

//   useEffect(() => {
//     const fetchPeers = async () => {
//       try {
//         const peers = await (window as any).electronAPI.getPeers();
//         console.log("peers",peers);
       
        
//         const formattedPeers: Contact[] = peers.map((peer: any, idx: number) => ({
//           id: peer.ip || `peer-${idx}`,
//           name: peer.name || `Node-${idx + 1}`,
//           status: peer.isActive === "online" ? "online" : "offline",
//           ipAddress: peer.ip,
//         }));
//         setContacts(formattedPeers);
//       } catch (err) {
//         console.error("Failed to get peers:", err);
//       }
//     };
//     fetchPeers();
//     const interval = setInterval(fetchPeers, 3000); // refresh every 3 sec
//     // return () => clearInterval(interval);

//     // Listen for incoming TCP messages once
//   const messageListener = ({ msg, fromIP }: { msg: string; fromIP: string }) => {
//      // de-dupe key over a 2s bucket (adjust if needed)
//       const key = `${fromIP}|${msg}|${Math.floor(Date.now() / 2000)}`;
//       if (seen.current.has(key)) return;
//       seen.current.add(key);
//     setMessages((prev) => [
//       ...prev,
//       {
//         // id: Date.now().toString(),
//         id: makeId(),
//         senderId: fromIP,
//         text: msg,
//         timestamp: new Date(),
//         isSent: false,
//         isRead: true,
//       },
//     ]);
//   };

//   (window as any).electronAPI.onTCPMessage(messageListener);

//   // Cleanup on unmount
//   return () => {
//     clearInterval(interval);
//     // if ((window as any).electronAPI?.removeTCPMessageListener) {
//       (window as any).electronAPI.removeTCPMessageListener(messageListener);
//     // }
//   };
//   }, []);
// const selectedContact = contacts.find((c) => c.id === selectedContactId);
//   useEffect(() => {
//   const off = window.electronAPI.onTCPEvent((evt: any) => {
//     if (evt.type === 'MSG') {
//       setMessages(prev => [...prev, {
//         id: evt.id,
//         senderId: evt.fromIP,
//         text: evt.text,
//         timestamp: new Date(),
//         isSent: true,   // ignored by MessageItem for received bubbles
//         isRead: true,
//       }]);

//       const isActive = selectedContact && selectedContact.ipAddress === evt.fromIP;
//       if (isActive) {
//         window.electronAPI.chatRead(evt.fromIP, [evt.id]); // <-- now exists
//       }
//     } else if (evt.type === 'ACK') {
//       setMessages(prev => prev.map(m => m.id === evt.id ? { ...m, isSent: true } : m));
//     } else if (evt.type === 'READ') {
//       setMessages(prev => prev.map(m => evt.ids.includes(m.id) ? { ...m, isRead: true } : m));
//     }
//   });

//   return () => { off && off(); };
// }, [selectedContact]);

  
//   const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

//   const handleSendMessage = async(text: string) => {
//      if (!selectedContact) return;
//      console.log("contacts",contacts);
//      const id = newId();
//   const toIP = selectedContact.ipAddress;
     
//      // find selected contact’s status
//   const contact = contacts.find((c) => c.id === selectedContact.id);
//   const isOnline = contact?.status === "online";
//     if (isOnline) {
//      await (window as any).electronAPI.sendTCPMessage(selectedContact.ipAddress, text);
//     }
//     const newMessage: Message = {
//       id,
//       senderId: 'me',
//       text,
//       timestamp: new Date(),
//       isSent: false,
//       isRead: false,
//     };
//     // setMessages([...messages, newMessage]);
//     setMessages(prev => [...prev, newMessage]);
//     await window.electronAPI.chatSend(toIP, id, text);
//   };

//   const handleSendFile = (file: File) => {
//     const newMessage: Message = {
//       id: Date.now().toString(),
//       senderId: 'me',
//       file: {
//         name: file.name,
//         size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
//         type: file.type,
//       },
//       timestamp: new Date(),
//       isSent: true,
//       isRead: false,
//     };
//     setMessages([...messages, newMessage]);
//   };

//   const handleStartCall = (type: 'audio' | 'video') => {
//     if (selectedContact) {
//       setCallState({
//         isOpen: true,
//         type,
//         contact: selectedContact,
//       });
//     }
//   };

//   const handleCloseCall = () => {
//     setCallState({
//       isOpen: false,
//       type: 'audio',
//       contact: null,
//     });
//   };

//   return (
//     <div className="flex h-full">
//       <div className="w-80 flex-shrink-0">
//         <ContactList
//           currentUser={currentUser}
//           contacts={contacts}
//           selectedContactId={selectedContactId}
//           onSelectContact={setSelectedContactId}
//         />
//       </div>

//       <div className="flex-1">
//         {selectedContact ? (
//           <ChatWindow
//             contact={selectedContact}
//             messages={messages}
//             onSendMessage={handleSendMessage}
//             onSendFile={handleSendFile}
//             onStartCall={handleStartCall}
//           />
//         ) : (
//           <div className="flex items-center justify-center h-full" style={{ color: '#4D7A82' }}>
//            Waiting for peers on the same LAN...
//           </div>
//         )}
//       </div>

//       {callState.contact && (
//         <CallDialog
//           isOpen={callState.isOpen}
//           onClose={handleCloseCall}
//           contact={callState.contact}
//           callType={callState.type}
//         />
//       )}
//     </div>
//   );
// }