import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Card } from '../components/ui/card';
import { Video, Search, Users, Calendar, Clock, User } from 'lucide-react';

interface VideoMeeting {
  id: string;
  title: string;
  participants: string[];
  participantAvatars?: string[];
  scheduledTime?: Date;
  duration?: string;
  status: 'scheduled' | 'ongoing' | 'completed';
}

export function VideoCallPage() {
  const [meetings] = useState<VideoMeeting[]>([
    {
      id: '1',
      title: 'Network Sync',
      participants: ['Node 1', 'Node 2', 'Node 3'],
      scheduledTime: new Date(Date.now() + 3600000),
      status: 'scheduled',
    },
    {
      id: '2',
      title: 'Status Update',
      participants: ['Node 4', 'Node 5'],
      scheduledTime: new Date(Date.now() + 7200000),
      status: 'scheduled',
    },
    {
      id: '3',
      title: 'Configuration Review',
      participants: ['Node 2'],
      scheduledTime: new Date(Date.now() - 3600000),
      duration: '45:30',
      status: 'completed',
    },
  ]);

  const formatScheduledTime = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `In ${diffMins} minutes`;
    if (diffHours < 24) return `In ${diffHours} hours`;
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return '#10b981';
      case 'scheduled':
        return '#4D7A82';
      case 'completed':
        return '#6B9AA4';
      default:
        return '#4D7A82';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: '#C5D9DD' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl" style={{ color: '#2D464D' }}>
            Video Meetings
          </h1>
          <Button className="text-white" style={{ backgroundColor: '#4D7A82' }}>
            <Video className="w-4 h-4 mr-2" />
            Start Meeting
          </Button>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
            style={{ color: '#6B9AA4' }}
          />
          <Input
            placeholder="Search meetings..."
            className="pl-10 bg-white text-gray-900 placeholder:text-gray-400"
            style={{ borderColor: '#A7CAD0' }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b" style={{ borderColor: '#E8F0F2' }}>
        <Card
          className="p-4 border cursor-pointer hover:shadow-md transition-shadow"
          style={{ borderColor: '#C5D9DD' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: '#E8F0F2' }}
          >
            <Video className="w-5 h-5" style={{ color: '#4D7A82' }} />
          </div>
          <h3 className="mb-1" style={{ color: '#2D464D' }}>
            Instant Meeting
          </h3>
          <p className="text-sm" style={{ color: '#6B9AA4' }}>
            Start a quick video call
          </p>
        </Card>
        <Card
          className="p-4 border cursor-pointer hover:shadow-md transition-shadow"
          style={{ borderColor: '#C5D9DD' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: '#E8F0F2' }}
          >
            <Calendar className="w-5 h-5" style={{ color: '#4D7A82' }} />
          </div>
          <h3 className="mb-1" style={{ color: '#2D464D' }}>
            Schedule
          </h3>
          <p className="text-sm" style={{ color: '#6B9AA4' }}>
            Plan a future meeting
          </p>
        </Card>
        <Card
          className="p-4 border cursor-pointer hover:shadow-md transition-shadow"
          style={{ borderColor: '#C5D9DD' }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: '#E8F0F2' }}
          >
            <Users className="w-5 h-5" style={{ color: '#4D7A82' }} />
          </div>
          <h3 className="mb-1" style={{ color: '#2D464D' }}>
            Join Meeting
          </h3>
          <p className="text-sm" style={{ color: '#6B9AA4' }}>
            Enter meeting code
          </p>
        </Card>
      </div>

      {/* Meetings List */}
      <ScrollArea className="flex-1 p-6">
        <h2 className="mb-4" style={{ color: '#2D464D' }}>
          Scheduled Meetings
        </h2>
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card
              key={meeting.id}
              className="p-4 border hover:shadow-md transition-shadow"
              style={{ borderColor: '#C5D9DD' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 style={{ color: '#2D464D' }}>{meeting.title}</h3>
                    <span
                      className="px-2 py-1 text-xs rounded-full capitalize"
                      style={{
                        backgroundColor: `${getStatusColor(meeting.status)}20`,
                        color: getStatusColor(meeting.status),
                      }}
                    >
                      {meeting.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm" style={{ color: '#6B9AA4' }}>
                    {meeting.scheduledTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatScheduledTime(meeting.scheduledTime)}</span>
                      </div>
                    )}
                    {meeting.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{meeting.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{meeting.participants.length} participants</span>
                    </div>
                  </div>
                </div>
                {meeting.status === 'scheduled' && (
                  <Button className="text-white" style={{ backgroundColor: '#4D7A82' }}>
                    <Video className="w-4 h-4 mr-2" />
                    Join
                  </Button>
                )}
              </div>

              {/* Participants */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {meeting.participants.slice(0, 3).map((participant, index) => (
                    <Avatar key={index} className="w-8 h-8 border-2 border-white">
                      <AvatarImage src={meeting.participantAvatars?.[index]} />
                      <AvatarFallback
                        style={{ backgroundColor: '#E8F0F2', color: '#2D464D', fontSize: '10px' }}
                      >
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-sm" style={{ color: '#6B9AA4' }}>
                  {meeting.participants.slice(0, 2).join(', ')}
                  {meeting.participants.length > 2 && ` +${meeting.participants.length - 2} more`}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
