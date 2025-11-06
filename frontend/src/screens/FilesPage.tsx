import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { FileText, Image, Video, Music, Download, Search, User } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'document' | 'image' | 'video' | 'audio';
  sender: string;
  senderAvatar?: string;
  timestamp: Date;
}

export function FilesPage() {
  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: 'project-documentation.pdf',
      size: '2.4 MB',
      type: 'document',
      sender: 'Node 1',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      name: 'design-mockup.png',
      size: '1.8 MB',
      type: 'image',
      sender: 'Node 2',
      timestamp: new Date(Date.now() - 7200000),
    },
    {
      id: '3',
      name: 'presentation-video.mp4',
      size: '15.3 MB',
      type: 'video',
      sender: 'Node 3',
      timestamp: new Date(Date.now() - 10800000),
    },
    {
      id: '4',
      name: 'meeting-notes.docx',
      size: '845 KB',
      type: 'document',
      sender: 'Node 4',
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: '5',
      name: 'audio-recording.mp3',
      size: '5.2 MB',
      type: 'audio',
      sender: 'Node 5',
      timestamp: new Date(Date.now() - 172800000),
    },
  ]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-8 h-8" />;
      case 'video':
        return <Video className="w-8 h-8" />;
      case 'audio':
        return <Music className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'image':
        return '#10b981';
      case 'video':
        return '#8b5cf6';
      case 'audio':
        return '#f59e0b';
      default:
        return '#4D7A82';
    }
  };

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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: '#C5D9DD' }}>
        <h1 className="text-3xl mb-4" style={{ color: '#2D464D' }}>
          Files
        </h1>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: '#6B9AA4' }}
          />
          <Input
            placeholder="Search files..."
            className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
            style={{ borderColor: '#A7CAD0' }}
          />
        </div>
      </div>

      {/* File Stats */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b" style={{ borderColor: '#E8F0F2' }}>
        <div className="text-center">
          <div className="text-2xl mb-1" style={{ color: '#4D7A82' }}>
            24
          </div>
          <p className="text-sm" style={{ color: '#6B9AA4' }}>
            Total Files
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1" style={{ color: '#10b981' }}>
            8
          </div>
          <p className="text-sm" style={{ color: '#6B9AA4' }}>
            Images
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1" style={{ color: '#8b5cf6' }}>
            3
          </div>
          <p className="text-sm" style={{ color: '#6B9AA4' }}>
            Videos
          </p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1" style={{ color: '#4D7A82' }}>
            13
          </div>
          <p className="text-sm" style={{ color: '#6B9AA4' }}>
            Documents
          </p>
        </div>
      </div>

      {/* File List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border"
              style={{ borderColor: '#E8F0F2' }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: `${getFileColor(file.type)}20`,
                  color: getFileColor(file.type),
                }}
              >
                {getFileIcon(file.type)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="mb-1 truncate" style={{ color: '#2D464D' }}>
                  {file.name}
                </h3>
                <div className="flex items-center gap-3 text-sm" style={{ color: '#6B9AA4' }}>
                  <span>{file.size}</span>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={file.senderAvatar} />
                      <AvatarFallback style={{ backgroundColor: '#E8F0F2', fontSize: '8px' }}>
                        <User className="w-2 h-2" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{file.sender}</span>
                  </div>
                  <span>•</span>
                  <span>{formatTime(file.timestamp)}</span>
                </div>
              </div>

              <Badge
                variant="outline"
                className="capitalize"
                style={{ borderColor: getFileColor(file.type), color: getFileColor(file.type) }}
              >
                {file.type}
              </Badge>

              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100"
                style={{ color: '#4D7A82' }}
              >
                <Download className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
