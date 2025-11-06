import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, User, Monitor } from 'lucide-react';

interface CallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: {
    name: string;
    avatar?: string;
  };
  callType: 'audio' | 'video';
}

export function CallDialog({ isOpen, onClose, contact, callType }: CallDialogProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setIsConnected(false);
      setIsMuted(false);
      setIsVideoOn(callType === 'video');
      setCallDuration(0);
      return;
    }

    // Simulate connecting after 2 seconds
    const connectTimer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, [isOpen, callType]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div
          className="relative text-white"
          style={{ background: 'linear-gradient(to bottom right, #6B9AA4, #89B2BA, #A7CAD0)' }}
        >
          {callType === 'video' && isVideoOn ? (
            <div className="relative aspect-video" style={{ backgroundColor: '#E8F0F2' }}>
              {/* Remote video placeholder */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(to bottom right, #C5D9DD, #D9E8EA)' }}
              >
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback style={{ backgroundColor: '#89B2BA', color: '#2D464D' }}>
                    <User className="w-16 h-16" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Local video preview */}
              <div
                className="absolute top-4 right-4 w-48 aspect-video rounded-xl overflow-hidden border-2 border-white shadow-lg"
                style={{ background: 'linear-gradient(to bottom right, #6B9AA4, #89B2BA)' }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Call info overlay */}
              <div
                className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg"
                style={{ border: '1px solid #C5D9DD' }}
              >
                <p style={{ color: '#2D464D' }}>{contact.name}</p>
                <p className="text-sm" style={{ color: '#4D7A82' }}>
                  {isConnected ? formatDuration(callDuration) : 'Connecting...'}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center py-20 px-8"
              style={{ background: 'linear-gradient(to bottom, #6B9AA4, #89B2BA)' }}
            >
              <Avatar className="w-32 h-32 mb-6 border-4 border-white shadow-xl">
                <AvatarImage src={contact.avatar} />
                <AvatarFallback style={{ backgroundColor: '#C5D9DD', color: '#2D464D' }}>
                  <User className="w-16 h-16" />
                </AvatarFallback>
              </Avatar>

              <h3 className="mb-2 text-white">{contact.name}</h3>
              <p style={{ color: '#E8F0F2' }}>
                {isConnected ? formatDuration(callDuration) : 'Calling...'}
              </p>
            </div>
          )}

          {/* Call controls */}
          <div className="flex items-center justify-center gap-4 p-6 bg-white/20 backdrop-blur-md border-t border-white/30">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full w-14 h-14 shadow-lg ${
                isMuted
                  ? 'bg-red-500 border-red-500 hover:bg-red-600 text-white'
                  : 'bg-white/90 border-white hover:bg-white'
              }`}
              style={!isMuted ? { color: '#4D7A82' } : {}}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>

            {callType === 'video' && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full w-14 h-14 shadow-lg ${
                    !isVideoOn
                      ? 'bg-red-500 border-red-500 hover:bg-red-600 text-white'
                      : 'bg-white/90 border-white hover:bg-white'
                  }`}
                  style={!!isVideoOn ? { color: '#4D7A82' } : {}}
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-14 h-14 bg-white/90 border-white hover:bg-white shadow-lg"
                  style={{ color: '#4D7A82' }}
                >
                  <Monitor className="w-6 h-6" />
                </Button>
              </>
            )}

            <Button
              size="icon"
              className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 border-2 border-white shadow-lg"
              onClick={handleEndCall}
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
