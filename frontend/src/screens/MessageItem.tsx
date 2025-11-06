import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { User, FileText, Download, CheckCheck } from 'lucide-react';
import { Button } from '../components/ui/button';

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  timestamp: Date;
  isSent: boolean;
  isRead?: boolean;
  file?: {
    name: string;
    size: string;
    type: string;
  };
}

interface MessageItemProps {
  message: Message;
  senderName?: string;
  senderAvatar?: string;
  isOwn: boolean;
}

export function MessageItem({ message, senderName, senderAvatar, isOwn }: MessageItemProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <Avatar className="w-8 h-8 border-2" style={{ borderColor: '#C5D9DD' }}>
          <AvatarImage src={senderAvatar} />
          <AvatarFallback style={{ backgroundColor: '#E8F0F2', color: '#2D464D' }}>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : ''}`}>
        {!isOwn && senderName && (
          <span className="text-sm mb-1 px-1" style={{ color: '#2D464D' }}>
            {senderName}
          </span>
        )}

        {message.file ? (
          <div
            className="flex items-center gap-3 p-3 rounded-xl border shadow-sm"
            style={
              isOwn
                ? {
                    background: 'linear-gradient(to bottom right, #4D7A82, #6B9AA4)',
                    color: '#ffffff',
                    borderColor: '#4D7A82',
                  }
                : {
                    backgroundColor: '#ffffff',
                    borderColor: '#C5D9DD',
                    color: '#2D464D',
                  }
            }
          >
            <FileText className="w-8 h-8 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="truncate">{message.file.name}</p>
              <p className="text-sm" style={{ color: isOwn ? '#E8F0F2' : '#4D7A82' }}>
                {message.file.size}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={isOwn ? 'text-white hover:opacity-80' : 'hover:bg-gray-100'}
              style={!isOwn ? { color: '#4D7A82' } : {}}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div
            className="px-4 py-2 rounded-2xl shadow-sm"
            style={
              isOwn
                ? {
                    background: 'linear-gradient(to bottom right, #4D7A82, #6B9AA4)',
                    color: '#ffffff',
                  }
                : {
                    backgroundColor: '#ffffff',
                    color: '#2D464D',
                    border: '1px solid #C5D9DD',
                  }
            }
          >
            <p>{message.text}</p>
          </div>
        )}

        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs" style={{ color: '#6B9AA4' }}>
            {formatTime(message.timestamp)}
          </span>
          {isOwn && message.isSent && (
            <CheckCheck
              className="w-4 h-4"
              style={{ color: message.isRead ? '#4D7A82' : '#A7CAD0' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
