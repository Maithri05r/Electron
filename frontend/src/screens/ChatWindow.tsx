import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Phone, Video, MoreVertical, Send, Paperclip, Smile, User } from 'lucide-react';
import { MessageItem, Message } from './MessageItem';

interface ChatWindowProps {
  contact: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'away';
    ipAddress?: string;
    location?: {
      city: string;
      country: string;
    };
  };
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendFile: (file: File) => void;
  onStartCall: (type: 'audio' | 'video') => void;
}

export function ChatWindow({
  contact,
  messages,
  onSendMessage,
  onSendFile,
  onStartCall,
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 👇 Auto scroll to bottom smoothly when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm shadow-xl rounded-l-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{
          borderColor: '#C5D9DD',
          background: 'linear-gradient(to right, #ffffff, #E8F0F2)',
        }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="border-2" style={{ borderColor: '#6B9AA4' }}>
            <AvatarImage src={contact.avatar} />
            <AvatarFallback style={{ backgroundColor: '#A7CAD0', color: '#2D464D' }}>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="mb-1" style={{ color: '#2D464D' }}>
              {contact.name}
            </h3>
            {contact.ipAddress && (
              <p className="text-sm truncate" style={{ color: '#6B9AA4' }}>
                {contact.ipAddress}
              </p>
            )}
            {contact.location && (
              <p className="text-sm truncate" style={{ color: '#89B2BA' }}>
                {contact.location.city}, {contact.location.country}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStartCall('audio')}
            className="hover:bg-gray-100"
            style={{ color: '#4D7A82' }}
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onStartCall('video')}
            className="hover:bg-gray-100"
            style={{ color: '#4D7A82' }}
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-100"
            style={{ color: '#4D7A82' }}
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages Section (scrollable only) */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4"
        style={{
          background: 'linear-gradient(to bottom, rgba(232, 240, 242, 0.3), #ffffff)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              senderName={message.senderId !== 'me' ? contact.name : undefined}
              senderAvatar={message.senderId !== 'me' ? contact.avatar : undefined}
              isOwn={message.senderId === 'me'}
            />
          ))}
        </div>
      </div>

      {/* Input Bar (fixed) */}
      <div className="p-4 border-t bg-white/90 shrink-0" style={{ borderColor: '#C5D9DD' }}>
        <div className="flex items-end gap-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-gray-100"
              style={{ color: '#4D7A82' }}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
          </div>

          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-10 bg-white text-gray-900 placeholder:text-gray-400"
              style={{ borderColor: '#A7CAD0' }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-100"
              style={{ color: '#6B9AA4' }}
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="text-white"
            style={{ backgroundColor: '#4D7A82' }}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
