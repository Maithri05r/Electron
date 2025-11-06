import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import {
  Phone,
  Video,
  Search,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  User,
} from 'lucide-react';

interface Call {
  id: string;
  contactName: string;
  contactAvatar?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: 'audio' | 'video';
  timestamp: Date;
  duration?: string;
}

export function CallsPage() {
  const [calls] = useState<Call[]>([
    {
      id: '1',
      contactName: 'Node 1',
      type: 'incoming',
      callType: 'video',
      timestamp: new Date(Date.now() - 3600000),
      duration: '15:30',
    },
    {
      id: '2',
      contactName: 'Node 2',
      type: 'outgoing',
      callType: 'audio',
      timestamp: new Date(Date.now() - 7200000),
      duration: '8:45',
    },
    {
      id: '3',
      contactName: 'Node 3',
      type: 'missed',
      callType: 'video',
      timestamp: new Date(Date.now() - 10800000),
    },
    {
      id: '4',
      contactName: 'Node 4',
      type: 'outgoing',
      callType: 'audio',
      timestamp: new Date(Date.now() - 86400000),
      duration: '22:15',
    },
    {
      id: '5',
      contactName: 'Node 5',
      type: 'incoming',
      callType: 'video',
      timestamp: new Date(Date.now() - 172800000),
      duration: '5:30',
    },
  ]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getCallIcon = (type: string) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="w-4 h-4" />;
      case 'outgoing':
        return <PhoneOutgoing className="w-4 h-4" />;
      case 'missed':
        return <PhoneMissed className="w-4 h-4" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: '#C5D9DD' }}>
        <h1 className="text-3xl mb-4" style={{ color: '#2D464D' }}>
          Calls
        </h1>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: '#6B9AA4' }}
          />
          <Input
            placeholder="Search calls..."
            className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
            style={{ borderColor: '#A7CAD0' }}
          />
        </div>
      </div>

      {/* Call List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {calls.map((call) => (
            <div
              key={call.id}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border"
              style={{ borderColor: '#E8F0F2' }}
            >
              <Avatar className="border-2" style={{ borderColor: '#C5D9DD' }}>
                <AvatarImage src={call.contactAvatar} />
                <AvatarFallback style={{ backgroundColor: '#E8F0F2', color: '#2D464D' }}>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 style={{ color: '#2D464D' }}>{call.contactName}</h3>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1"
                    style={{
                      borderColor: call.type === 'missed' ? '#ef4444' : '#4D7A82',
                      color: call.type === 'missed' ? '#ef4444' : '#4D7A82',
                    }}
                  >
                    {getCallIcon(call.type)}
                    <span className="text-xs capitalize">{call.type}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#6B9AA4' }}>
                  {call.callType === 'video' ? (
                    <Video className="w-3 h-3" />
                  ) : (
                    <Phone className="w-3 h-3" />
                  )}
                  <span>{formatTime(call.timestamp)}</span>
                  {call.duration && (
                    <>
                      <span>•</span>
                      <span>{call.duration}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  style={{ color: '#4D7A82' }}
                >
                  <Phone className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  style={{ color: '#4D7A82' }}
                >
                  <Video className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
