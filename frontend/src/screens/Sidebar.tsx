import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Home, MessageSquare, Phone, FileText, Settings, LogOut, User } from 'lucide-react';

interface SidebarProps {
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
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentUser, activeView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'call', label: 'Calls', icon: Phone },
    { id: 'files', label: 'Files', icon: FileText },
  ];

  return (
    <div
      className="w-20 flex flex-col items-center py-4 shadow-lg"
      style={{ backgroundColor: '#4D7A82' }}
    >
      {/* User Avatar with Tooltip */}
      <div className="mb-8 relative group">
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-white cursor-pointer">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback style={{ backgroundColor: '#6B9AA4', color: 'white' }}>
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
        </div>

        {/* Tooltip on hover */}
        <div className="absolute left-full ml-4 top-0 hidden group-hover:block z-50 whitespace-nowrap">
          <div
            className="bg-white rounded-lg shadow-lg p-3 border"
            style={{ borderColor: '#C5D9DD' }}
          >
            <p className="font-medium mb-1" style={{ color: '#2D464D' }}>
              {currentUser.name}
            </p>
            <p className="text-xs mb-1" style={{ color: '#6B9AA4' }}>
              {currentUser.ipAddress}
            </p>
            <p className="text-xs" style={{ color: '#89B2BA' }}>
              {currentUser.location.city}, {currentUser.location.country}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              onClick={() => onViewChange(item.id)}
              className="w-14 h-14 rounded-xl transition-all relative group"
              style={
                isActive
                  ? {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                    }
                  : {
                      color: 'rgba(255, 255, 255, 0.7)',
                    }
              }
              title={item.label}
            >
              <Icon className="w-6 h-6" />
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
              )}
            </Button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onViewChange('settings')}
          className="w-12 h-12 rounded-xl"
          style={
            activeView === 'settings'
              ? {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                }
              : {
                  color: 'rgba(255, 255, 255, 0.7)',
                }
          }
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 rounded-xl"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
